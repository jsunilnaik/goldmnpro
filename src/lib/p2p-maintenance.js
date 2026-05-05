import connectDB from './mongodb';
import PaymentMatch from '@/models/PaymentMatch';
import Withdrawal from '@/models/Withdrawal';
import Subscription from '@/models/Subscription';
import User from '@/models/User';
import { createNotification } from './notifications';
import { sendP2PNudgeAlert } from './sms';

// ─────────────────────────────────────────────────────────
//  EXPIRE UNPAID MATCHES (60-minute TTL)
// ─────────────────────────────────────────────────────────

/**
 * Finds expired P2P matches (status: 'matched', past expiresAt) and reverts them,
 * freeing locked liquidity back into the withdrawal pool.
 *
 * Only 'matched' status is expired automatically — 'paid' matches (subscriber has
 * already sent money) must NEVER be auto-cancelled; they require admin review.
 */
export async function cleanupExpiredMatches() {
  try {
    await connectDB();

    const now = new Date();
    const expiredMatches = await PaymentMatch.find({
      status: 'matched',
      expiresAt: { $lt: now },
    });

    if (expiredMatches.length === 0) return { count: 0 };

    let revertedCount = 0;

    for (const match of expiredMatches) {
      // 1. Mark match as cancelled
      match.status = 'cancelled';
      match.adminNotes = 'System Auto-Cancel: Match timed out after 60 mins without payment.';
      await match.save();

      // 2. Revert lockedAmount on the associated Withdrawal
      const withdrawal = await Withdrawal.findById(match.withdrawal);
      if (withdrawal) {
        withdrawal.lockedAmount = Math.max(0, (withdrawal.lockedAmount || 0) - match.amount);

        // If it was fully processing, revert back to approved so it can be re-matched
        if (withdrawal.status === 'processing') {
          withdrawal.status = 'approved';
        }
        await withdrawal.save();
      }

      // 3. Revert Subscription back to 'pending' if it was waiting on this match
      const subscription = await Subscription.findById(match.subscription);
      if (subscription && subscription.status === 'pending_verification' && !subscription.utr) {
        // Only revert if subscriber hasn't submitted a UTR yet
        subscription.status = 'pending';
        await subscription.save();
      }

      revertedCount++;
    }

    console.log(`🧹 P2P Maintenance: Reverted ${revertedCount} expired match(es).`);
    return { count: revertedCount };

  } catch (error) {
    console.error('P2P Maintenance (cleanup) Error:', error);
    return { error: error.message };
  }
}

// ─────────────────────────────────────────────────────────
//  SMS NUDGE — Warn withdrawer at 3-hour mark
// ─────────────────────────────────────────────────────────

/**
 * Sends an SMS nudge to withdrawers who received payment (UTR submitted by subscriber)
 * but haven't confirmed receipt within `nudgeHours`.
 *
 * Runs BEFORE autoDisputeStaleMatches so the withdrawer gets a warning first.
 *
 * @param {number} nudgeHours - Hours after proof submission to send the SMS nudge
 */
export async function nudgeStaleWithdrawers(nudgeHours = 3) {
  try {
    await connectDB();

    const nudgeCutoff = new Date(Date.now() - nudgeHours * 60 * 60 * 1000);
    // Only nudge matches that fall within a 15-minute detection window
    // (so each cron run doesn't re-nudge the same match repeatedly)
    const nudgeWindowStart = new Date(nudgeCutoff.getTime() - 15 * 60 * 1000);

    const staleMatches = await PaymentMatch.find({
      status: 'paid',
      'proof.updatedAt': {
        $gte: nudgeWindowStart,
        $lt: nudgeCutoff,
      },
    }).populate('withdrawer', 'phone fullName');

    let nudgedCount = 0;

    for (const match of staleMatches) {
      if (!match.withdrawer?.phone) continue;

      try {
        await sendP2PNudgeAlert(match.withdrawer.phone, match.amount, match._id.toString().slice(-6));
        nudgedCount++;
      } catch (err) {
        console.error('Nudge SMS error:', err);
      }
    }

    console.log(`📱 P2P Maintenance: Nudged ${nudgedCount} stale withdrawer(s).`);
    return { nudged: nudgedCount };

  } catch (error) {
    console.error('P2P Maintenance (nudge) Error:', error);
    return { error: error.message };
  }
}

// ─────────────────────────────────────────────────────────
//  AUTO-DISPUTE — Escalate stale paid matches (6-hour TTL)
// ─────────────────────────────────────────────────────────

/**
 * Automatically marks 'paid' matches as 'disputed' when the withdrawer has not
 * confirmed receipt within `ttlHours` of the subscriber submitting proof.
 *
 * This prevents "hostage" situations where a withdrawer receives money but
 * refuses to confirm, blocking the subscriber's plan activation.
 *
 * @param {number} ttlHours - Hours after proof submission before auto-dispute
 */
export async function autoDisputeStaleMatches(ttlHours = 6) {
  try {
    await connectDB();

    const cutoff = new Date(Date.now() - ttlHours * 60 * 60 * 1000);

    const staleMatches = await PaymentMatch.find({
      status: 'paid',
      'proof.updatedAt': { $lt: cutoff },
    });

    if (staleMatches.length === 0) return { disputed: 0 };

    let disputedCount = 0;

    for (const match of staleMatches) {
      match.status = 'disputed';
      match.adminNotes = `System Auto-Dispute: Withdrawer did not confirm within ${ttlHours} hours of payment proof submission.`;
      match.disputeReason = 'Withdrawer non-responsive after payment received';
      await match.save();

      // Notify Subscriber — reassure them they are protected
      await createNotification(match.subscriber, {
        title: 'Payment Under Admin Review ⚠️',
        message: `Your payment proof is being reviewed by admin. The recipient hasn't confirmed. You are protected — admin will resolve this.`,
        type: 'payment',
        actionUrl: '/plans',
      }).catch(() => {});

      // Notify Withdrawer — final warning before admin intervention
      await createNotification(match.withdrawer, {
        title: 'Action Required: Confirm Payment ⚠️',
        message: `Your match (₹${match.amount}) has been escalated to admin. Confirm receipt immediately at goldminepro.com/withdraw.`,
        type: 'withdrawal',
        actionUrl: '/withdraw',
      }).catch(() => {});

      disputedCount++;
      console.log(`⚠️  P2P Maintenance: Auto-disputed Match ${match._id} (${ttlHours}h TTL exceeded)`);
    }

    return { disputed: disputedCount };

  } catch (error) {
    console.error('P2P Maintenance (auto-dispute) Error:', error);
    return { error: error.message };
  }
}
