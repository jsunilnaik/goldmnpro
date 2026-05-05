import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { requireAdmin } from '@/lib/auth';
import PaymentMatch from '@/models/PaymentMatch';
import Subscription from '@/models/Subscription';
import Withdrawal from '@/models/Withdrawal';
import User from '@/models/User';
import Wallet from '@/models/Wallet';
import Transaction from '@/models/Transaction';
import Plan from '@/models/Plan';
import { recordOutflow } from '@/lib/treasury';
import { sendP2PActivationAlert } from '@/lib/sms';
import { activateSubscription } from '@/lib/subscriptions';
import { createNotification } from '@/lib/notifications';

// ─────────────────────────────────────────────────────────
//  GET: List all P2P Match records with pagination/filtering
// ─────────────────────────────────────────────────────────
export async function GET(request) {
  try {
    await requireAdmin();
    await connectDB();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    const query = {};
    if (status && status !== 'all') {
      query.status = status;
    }

    const [matches, total] = await Promise.all([
      PaymentMatch.find(query)
        .populate('subscriber', 'fullName email phone')
        .populate('withdrawer', 'fullName email phone paymentMethods')
        .populate({
          path: 'subscription',
          populate: { path: 'plan', select: 'name price' },
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      PaymentMatch.countDocuments(query),
    ]);

    return NextResponse.json({
      matches,
      totalPages: Math.ceil(total / limit),
      total,
      page,
    });
  } catch (error) {
    console.error('Admin P2P Matches list error:', error);
    return NextResponse.json(
      { message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// ─────────────────────────────────────────────────────────
//  POST: Admin Actions
//  action: 'finalize' | 'cancel' | 'update-upi' | 'resolve-dispute'
// ─────────────────────────────────────────────────────────
export async function POST(request) {
  try {
    await requireAdmin();
    await connectDB();

    const { matchId, action, reason, upiId, resolution } = await request.json();

    const match = await PaymentMatch.findById(matchId);
    if (!match) {
      return NextResponse.json({ message: 'Match not found' }, { status: 404 });
    }

    // ── ACTION: finalize ──────────────────────────────────
    if (action === 'finalize') {
      match.status = 'completed';
      match.adminNotes = reason || 'Finalized and activated by Admin';
      await match.save();

      // Check if ALL matches for this subscription are confirmed/completed
      const allMatchesForSub = await PaymentMatch.find({ subscription: match.subscription });
      const allConfirmed = allMatchesForSub.every((m) =>
        ['confirmed', 'completed'].includes(m.status)
      );

      if (allConfirmed) {
        const subscription = await Subscription.findById(match.subscription);
        if (subscription && subscription.status !== 'active') {
          // Activate subscription (handles wallet, referrals, treasury inflow, notifications)
          await activateSubscription(subscription._id, 'p2p');

          // Send SMS activation alert to subscriber
          try {
            const plan = await Plan.findById(subscription.plan);
            const subscriber = await User.findById(subscription.user);
            if (subscriber?.phone) {
              await sendP2PActivationAlert(subscriber.phone, plan?.name || 'GoldMine');
            }
          } catch (err) {
            console.error('P2P Activation SMS error:', err);
          }
        }
      }

      // Check and complete the associated Withdrawal
      await _tryCompleteWithdrawal(match);

      return NextResponse.json({ message: 'Match finalized and plan activated successfully' });

    // ── ACTION: cancel ────────────────────────────────────
    } else if (action === 'cancel') {
      match.status = 'cancelled';
      match.adminNotes = reason || 'Cancelled by Admin';
      await match.save();

      // Release the lockedAmount back to the withdrawal pool
      const withdrawal = await Withdrawal.findById(match.withdrawal);
      if (withdrawal) {
        withdrawal.lockedAmount = Math.max(0, (withdrawal.lockedAmount || 0) - match.amount);
        if (withdrawal.status === 'processing') {
          withdrawal.status = 'approved'; // Restore to pool
        }
        await withdrawal.save();
      }

      // Revert subscription back to 'pending' so it can be re-matched
      const subscription = await Subscription.findById(match.subscription);
      if (subscription && subscription.status === 'pending_verification' && !subscription.utr) {
        subscription.status = 'pending';
        await subscription.save();
      }

      return NextResponse.json({ message: 'Match cancelled successfully' });

    // ── ACTION: update-upi ────────────────────────────────
    } else if (action === 'update-upi') {
      if (!upiId) {
        return NextResponse.json({ message: 'UPI ID is required' }, { status: 400 });
      }
      match.customUpiId = upiId;
      await match.save();
      return NextResponse.json({ message: 'UPI ID updated successfully' });

    // ── ACTION: resolve-dispute ───────────────────────────
    } else if (action === 'resolve-dispute') {
      if (!resolution) {
        return NextResponse.json(
          { message: 'resolution field required: "subscriber_wins" or "withdrawer_wins"' },
          { status: 400 }
        );
      }

      if (resolution === 'subscriber_wins') {
        // Admin confirms money was received by withdrawer — force-finalize
        match.status = 'confirmed';
        match.adminNotes = `Dispute resolved in subscriber's favor. ${reason || ''}`.trim();
        await match.save();

        // Notify both parties
        await createNotification(match.subscriber, {
          title: 'Dispute Resolved ✅',
          message: 'Admin has confirmed your payment. Your plan will be activated shortly.',
          type: 'payment',
          actionUrl: '/plans',
        });
        await createNotification(match.withdrawer, {
          title: 'Dispute Decision',
          message: 'Admin has confirmed the subscriber paid you. Match has been finalized.',
          type: 'withdrawal',
          actionUrl: '/withdraw',
        });

        // Check if all matches are now confirmed and activate if so
        const allMatches = await PaymentMatch.find({ subscription: match.subscription });
        const allDone = allMatches.every((m) => ['confirmed', 'completed'].includes(m.status));
        if (allDone) {
          const subscription = await Subscription.findById(match.subscription);
          if (subscription && subscription.status !== 'active') {
            await activateSubscription(subscription._id, 'p2p');
          }
        }

        await _tryCompleteWithdrawal(match);
        return NextResponse.json({ message: 'Dispute resolved in subscriber\'s favor. Plan activation triggered.' });

      } else if (resolution === 'withdrawer_wins') {
        // Admin confirms payment was NOT made — cancel the match
        match.status = 'cancelled';
        match.adminNotes = `Dispute resolved in withdrawer's favor. ${reason || ''}`.trim();
        await match.save();

        // Restore withdrawal liquidity
        const withdrawal = await Withdrawal.findById(match.withdrawal);
        if (withdrawal) {
          withdrawal.lockedAmount = Math.max(0, (withdrawal.lockedAmount || 0) - match.amount);
          if (withdrawal.status === 'processing') {
            withdrawal.status = 'approved';
          }
          await withdrawal.save();
        }

        // Revert subscription so subscriber can retry
        const subscription = await Subscription.findById(match.subscription);
        if (subscription && ['pending_verification'].includes(subscription.status)) {
          subscription.status = 'pending';
          subscription.utr = undefined;
          await subscription.save();
        }

        await createNotification(match.subscriber, {
          title: 'Dispute Decision — Retry Required',
          message: 'Admin could not verify your payment. Please re-initiate the payment process.',
          type: 'payment',
          actionUrl: '/plans',
        });
        await createNotification(match.withdrawer, {
          title: 'Dispute Resolved ✅',
          message: 'Admin has cleared you. Your withdrawal slot has been restored.',
          type: 'withdrawal',
          actionUrl: '/withdraw',
        });

        return NextResponse.json({ message: 'Dispute resolved in withdrawer\'s favor. Subscription reset for retry.' });

      } else {
        return NextResponse.json({ message: 'Invalid resolution value' }, { status: 400 });
      }

    } else {
      return NextResponse.json({ message: 'Invalid action' }, { status: 400 });
    }

  } catch (error) {
    console.error('Admin P2P Match action error:', error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

// ─────────────────────────────────────────────────────────
//  INTERNAL HELPER: Complete a Withdrawal & record accounting
// ─────────────────────────────────────────────────────────

/**
 * Checks if all PaymentMatches for a given Withdrawal are finalized.
 * If so, marks the Withdrawal as completed, records the Treasury outflow,
 * updates the withdrawer's Wallet (pendingWithdrawal → totalWithdrawn),
 * and creates a completed Transaction record.
 *
 * This was previously missing, causing an accounting gap where Treasury
 * outflow was never recorded for P2P completions.
 *
 * @param {PaymentMatchDoc} finalizedMatch
 */
async function _tryCompleteWithdrawal(finalizedMatch) {
  try {
    const withdrawal = await Withdrawal.findById(finalizedMatch.withdrawal);
    if (!withdrawal || withdrawal.status === 'completed') return;

    const allMatchesForWithdrawal = await PaymentMatch.find({
      withdrawal: finalizedMatch.withdrawal,
    });
    const withdrawalAllDone = allMatchesForWithdrawal.every((m) =>
      ['confirmed', 'completed'].includes(m.status)
    );

    if (!withdrawalAllDone) return;

    // Mark withdrawal as completed
    withdrawal.status = 'completed';
    withdrawal.processedAt = new Date();
    await withdrawal.save();

    // Record Treasury outflow (was missing before)
    await recordOutflow(
      withdrawal.amount,
      'withdrawals',
      withdrawal.tdsDeducted || 0,
      withdrawal.processingFee || 0
    );

    // Update withdrawer's wallet: move from pendingWithdrawal to totalWithdrawn
    await Wallet.findOneAndUpdate(
      { user: withdrawal.user },
      {
        $inc: {
          pendingWithdrawal: -withdrawal.amount,
          totalWithdrawn: withdrawal.netAmount || withdrawal.amount,
        },
        $set: { lastWithdrawalAt: new Date() },
      }
    );

    // Record completed Transaction for the withdrawer's ledger
    await Transaction.create({
      user: withdrawal.user,
      type: 'withdrawal',
      category: 'debit',
      amount: withdrawal.amount,
      status: 'completed',
      description: `Withdrawal of ₹${withdrawal.amount.toLocaleString('en-IN')} completed via P2P`,
      referenceId: withdrawal._id.toString(),
      referenceType: 'withdrawal',
    });

    // Notify the withdrawer their funds are released
    await createNotification(withdrawal.user, {
      title: 'Withdrawal Completed ✅',
      message: `₹${(withdrawal.netAmount || withdrawal.amount).toLocaleString('en-IN')} has been released to your UPI account.`,
      type: 'withdrawal',
      actionUrl: '/withdraw',
    });

    console.log(`✅ Withdrawal ${withdrawal._id} completed via P2P finalization.`);
  } catch (err) {
    console.error('_tryCompleteWithdrawal error:', err);
  }
}
