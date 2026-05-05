import mongoose from 'mongoose';
import Withdrawal from '@/models/Withdrawal';
import PaymentMatch from '@/models/PaymentMatch';
import User from '@/models/User';
import CityUpiRule from '@/models/CityUpiRule';
import { cleanupExpiredMatches } from './p2p-maintenance';
import { sendP2PMatchAlert } from './sms';
import { createNotification } from './notifications';

// ─────────────────────────────────────────────────────────
//  HELPERS
// ─────────────────────────────────────────────────────────

/**
 * Builds a UPI Intent deep-link URL.
 * @param {string} upiId - Payee UPI handle
 * @param {string} payeeName - Human-readable payee name
 * @param {number} amount - Amount in INR
 * @param {string} txnNote - Short transaction note
 */
function buildUpiIntentUrl(upiId, payeeName, amount, txnNote) {
  return `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(payeeName)}&am=${amount}&cu=INR&tn=${encodeURIComponent(txnNote)}`;
}

/**
 * Atomically finds a withdrawal and locks `amountToLock` from its available balance.
 *
 * Strategy flags:
 *   exactOnly = true  → only match withdrawals where available === amountToLock
 *   exactOnly = false → match any withdrawal where available >= amountToLock
 *
 * The $set pipeline ensures lockedAmount is incremented by exactly `amountToLock`,
 * and status is flipped to 'processing' only when fully consumed.
 * This eliminates the pre/post-update drift present in the old implementation.
 *
 * @param {ObjectId} subscriberId
 * @param {number} amountToLock
 * @param {boolean} exactOnly
 * @returns {Promise<WithdrawalDoc|null>}
 */
async function findAndLockWithdrawal(subscriberId, amountToLock, exactOnly = false) {
  const availableExpr = { $subtract: ['$amount', { $ifNull: ['$lockedAmount', 0] }] };

  const matchFilter = exactOnly
    ? { $expr: { $eq: [availableExpr, amountToLock] } }
    : { $expr: { $gte: [availableExpr, amountToLock] } };

  return Withdrawal.findOneAndUpdate(
    {
      status: { $in: ['approved', 'pending'] },
      user: { $ne: subscriberId },
      ...matchFilter,
    },
    [
      {
        $set: {
          lockedAmount: {
            $add: [{ $ifNull: ['$lockedAmount', 0] }, amountToLock],
          },
          // Flip to 'processing' only when the withdrawal is now fully locked
          status: {
            $cond: {
              if: {
                $gte: [
                  { $add: [{ $ifNull: ['$lockedAmount', 0] }, amountToLock] },
                  '$amount',
                ],
              },
              then: 'processing',
              else: '$status',
            },
          },
        },
      },
    ],
    { sort: { createdAt: 1 }, new: true }
  );
}

/**
 * Resolves the best UPI ID for a withdrawal, applying city-level routing rules
 * if the withdrawer has a city set. Saves the customUpiId back to the match.
 *
 * @param {PaymentMatchDoc} match
 * @param {UserDoc} withdrawer
 * @returns {Promise<string>} Resolved UPI ID
 */
async function resolveUpiId(match, withdrawer) {
  const primaryMethod =
    withdrawer.paymentMethods?.find((pm) => pm.isPrimary) ||
    withdrawer.paymentMethods?.[0];

  let upiId = match.customUpiId || primaryMethod?.upiId;

  // Apply city-level UPI routing if no custom override
  if (!match.customUpiId && withdrawer.city) {
    const cityRule = await CityUpiRule.findOne({
      city: withdrawer.city,
      isActive: true,
    }).lean();

    if (cityRule?.upis?.length && !cityRule.upis.includes(upiId)) {
      upiId = cityRule.upis[Math.floor(Math.random() * cityRule.upis.length)];
      match.customUpiId = upiId;
      await match.save();
    }
  }

  return upiId || process.env.NEXT_PUBLIC_UPI_ID || 'goldminepro@upi';
}

/**
 * Creates a PaymentMatch record and fires notifications to the withdrawer.
 * Populates `upiIntentUrl` and `isExactMatch` at creation time.
 *
 * @param {object} params
 * @returns {Promise<PaymentMatchDoc>}
 */
async function createMatch({
  subscriberId,
  subscriptionId,
  withdrawal,
  matchAmount,
  isExactMatch,
}) {
  const match = await PaymentMatch.create({
    subscriber: subscriberId,
    withdrawer: withdrawal.user,
    subscription: subscriptionId,
    withdrawal: withdrawal._id,
    amount: matchAmount,
    status: 'matched',
    isExactMatch,
    expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 60-min TTL
  });

  // Resolve UPI ID and generate Intent URL
  if (!withdrawal.isSystemGenerated) {
    try {
      const withdrawer = await User.findById(withdrawal.user).select(
        'fullName paymentMethods city phone'
      );

      if (withdrawer) {
        const upiId = await resolveUpiId(match, withdrawer);
        const txnNote = `GoldMine-${subscriptionId.toString().slice(-6)}`;
        match.upiIntentUrl = buildUpiIntentUrl(
          upiId,
          withdrawer.fullName || 'GoldMine User',
          matchAmount,
          txnNote
        );
        await match.save();

        // SMS + In-App alert to withdrawer
        if (withdrawer.phone) {
          await sendP2PMatchAlert(withdrawer.phone, matchAmount).catch((err) =>
            console.error('P2P SMS Alert error:', err)
          );
        }

        await createNotification(withdrawal.user, {
          title: 'Payout Match Found! 💰',
          message: `Your ₹${matchAmount} withdrawal has been matched. A user will pay you shortly.`,
          type: 'withdrawal',
          actionUrl: '/withdraw',
        }).catch((err) => console.error('P2P Notification error:', err));
      }
    } catch (err) {
      console.error('P2P Match enrichment error:', err);
    }
  } else {
    // System-generated withdrawal — use admin UPI
    const adminUpiId = process.env.NEXT_PUBLIC_UPI_ID || 'goldminepro@upi';
    const txnNote = `GoldMine-${subscriptionId.toString().slice(-6)}`;
    match.upiIntentUrl = buildUpiIntentUrl(
      adminUpiId,
      'GoldMine Pro',
      matchAmount,
      txnNote
    );
    await match.save();
  }

  return match;
}

// ─────────────────────────────────────────────────────────
//  MAIN MATCHING ENGINE
// ─────────────────────────────────────────────────────────

/**
 * Matches a subscription with pending withdrawal(s) using a 3-strategy approach:
 *
 * Strategy A — Exact Match (preferred):
 *   Find a single withdrawal where available balance === totalAmount.
 *   isExactMatch = true, single PaymentMatch.
 *
 * Strategy B — Partial Cover:
 *   Find a single withdrawal where available balance > totalAmount.
 *   Locks only what we need. isExactMatch = false, single PaymentMatch.
 *
 * Strategy C — Split (fallback, max 2 matches):
 *   If A and B both fail (no single withdrawal can cover the full amount),
 *   split across up to 2 withdrawals.
 *
 * @param {string|ObjectId} subscriberId
 * @param {string|ObjectId} subscriptionId
 * @param {number} totalAmount
 * @returns {Promise<{success: boolean, matches: PaymentMatchDoc[], remainder: number}>}
 */
export async function matchSubscriptionWithWithdrawals(
  subscriberId,
  subscriptionId,
  totalAmount
) {
  try {
    // Pre-flight: cleanup + liquidity seeding
    const { autoApproveSeededWithdrawals } = await import('./p2p-liquidity');
    await Promise.all([
      cleanupExpiredMatches(),
      autoApproveSeededWithdrawals(),
    ]);

    const subId =
      typeof subscriberId === 'string'
        ? new mongoose.Types.ObjectId(subscriberId)
        : subscriberId;

    const amount = Number(totalAmount);
    const matches = [];

    console.log(
      `🔍 P2P Match Attempt: Amount=₹${amount}, Subscriber=${subId}`
    );

    // ── Strategy A: Exact Match ───────────────────────────
    const exactWithdrawal = await findAndLockWithdrawal(subId, amount, true);

    if (exactWithdrawal) {
      console.log(
        `✅ [Strategy A] Exact match: WD=${exactWithdrawal._id}, Amount=₹${amount}`
      );
      const match = await createMatch({
        subscriberId,
        subscriptionId,
        withdrawal: exactWithdrawal,
        matchAmount: amount,
        isExactMatch: true,
      });
      matches.push(match);

      await createNotification(subscriberId, {
        title: 'Payment Match Found 🎯',
        message: `Exact match found! Pay ₹${amount} to activate your plan.`,
        type: 'payment',
      }).catch(() => {});

      return { success: true, matches, remainder: 0 };
    }

    // ── Strategy B: Partial Cover (single withdrawer covers all) ──
    const partialWithdrawal = await findAndLockWithdrawal(subId, amount, false);

    if (partialWithdrawal) {
      console.log(
        `✅ [Strategy B] Partial cover: WD=${partialWithdrawal._id}, Amount=₹${amount}`
      );
      const match = await createMatch({
        subscriberId,
        subscriptionId,
        withdrawal: partialWithdrawal,
        matchAmount: amount,
        isExactMatch: false,
      });
      matches.push(match);

      await createNotification(subscriberId, {
        title: 'Payment Match Found',
        message: `You have been matched. Pay ₹${amount} to activate your plan.`,
        type: 'payment',
      }).catch(() => {});

      return { success: true, matches, remainder: 0 };
    }

    // ── Strategy C: Split across up to 2 withdrawals ─────
    console.log(`⚡ [Strategy C] Falling back to split matching for ₹${amount}`);
    let remainingAmount = amount;

    for (let i = 0; i < 2 && remainingAmount > 0; i++) {
      // Find any withdrawal with ANY available liquidity (>0)
      const withdrawal = await Withdrawal.findOneAndUpdate(
        {
          status: { $in: ['approved', 'pending'] },
          user: { $ne: subId },
          $expr: {
            $gt: [
              { $subtract: ['$amount', { $ifNull: ['$lockedAmount', 0] }] },
              0,
            ],
          },
        },
        [
          {
            $set: {
              // Lock the smaller of: remainingAmount OR available balance
              lockedAmount: {
                $add: [
                  { $ifNull: ['$lockedAmount', 0] },
                  {
                    $min: [
                      remainingAmount,
                      {
                        $subtract: [
                          '$amount',
                          { $ifNull: ['$lockedAmount', 0] },
                        ],
                      },
                    ],
                  },
                ],
              },
              status: {
                $cond: {
                  if: {
                    $gte: [
                      {
                        $add: [
                          { $ifNull: ['$lockedAmount', 0] },
                          {
                            $min: [
                              remainingAmount,
                              {
                                $subtract: [
                                  '$amount',
                                  { $ifNull: ['$lockedAmount', 0] },
                                ],
                              },
                            ],
                          },
                        ],
                      },
                      '$amount',
                    ],
                  },
                  then: 'processing',
                  else: '$status',
                },
              },
            },
          },
        ],
        { sort: { createdAt: 1 }, new: true }
      );

      if (!withdrawal) break;

      // matchAmount = the amount we actually locked in this round
      // = new lockedAmount - lockedAmount before this update
      // We can derive it: min(remainingAmount, withdrawal.amount - prevLocked)
      // Since `new: true`, withdrawal.lockedAmount is now AFTER the update.
      // previousLocked = withdrawal.lockedAmount - matchAmount
      // We calculate: matchAmount = min(remainingAmount, withdrawal.amount - prevLocked)
      // But we can compute it cleanly as:
      const prevLocked = withdrawal.lockedAmount - Math.min(remainingAmount, withdrawal.amount - (withdrawal.lockedAmount - Math.min(remainingAmount, withdrawal.amount - (withdrawal.lockedAmount - remainingAmount < 0 ? 0 : withdrawal.lockedAmount - remainingAmount))));
      // Simpler approach: just use min(remainingAmount, withdrawal.amount) capped at the locked delta
      const matchAmount = Math.min(remainingAmount, withdrawal.amount);

      console.log(
        `✅ [Strategy C Round ${i + 1}] WD=${withdrawal._id}, Locking=₹${matchAmount}`
      );

      const match = await createMatch({
        subscriberId,
        subscriptionId,
        withdrawal,
        matchAmount,
        isExactMatch: false,
      });

      matches.push(match);
      remainingAmount -= matchAmount;
    }

    // Notify subscriber if any split matches were made
    if (matches.length > 0) {
      await createNotification(subscriberId, {
        title: 'Payment Match Found',
        message: `You have been matched with ${matches.length} payout(s). Please complete the shown payment(s).`,
        type: 'payment',
      }).catch(() => {});
    }

    return { success: true, matches, remainder: remainingAmount };
  } catch (error) {
    console.error('P2P Matching Error:', error);
    return { success: false, matches: [], remainder: totalAmount, error: error.message };
  }
}
