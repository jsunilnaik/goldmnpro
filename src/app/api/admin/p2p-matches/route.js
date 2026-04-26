export const runtime = 'edge';
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
import { recordInflow } from '@/lib/treasury';
import { sendP2PActivationAlert } from '@/lib/sms';
import { activateSubscription } from '@/lib/subscriptions';

// GET: List all P2P Match records
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
          populate: { path: 'plan', select: 'name' }
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

// POST: Admin Actions (Force Confirm, Cancel)
export async function POST(request) {
  try {
    await requireAdmin();
    await connectDB();

    const { matchId, action, reason, upiId } = await request.json();

    const match = await PaymentMatch.findById(matchId);
    if (!match) {
      return NextResponse.json({ message: 'Match not found' }, { status: 404 });
    }

    if (action === 'finalize') {
      // Logic from confirm-receipt API but forced by admin
      match.status = 'completed';
      match.adminNotes = reason || 'Finalized and activated by Admin';
      await match.save();

      // Check and activate subscription if all confirmed or completed
      const allMatchesForSub = await PaymentMatch.find({ subscription: match.subscription });
      const allConfirmed = allMatchesForSub.every(m => ['confirmed', 'completed'].includes(m.status));

      if (allConfirmed) {
        const subscription = await Subscription.findById(match.subscription);
        if (subscription && subscription.status !== 'active') {
          // Use unified activation service
          await activateSubscription(subscription._id, 'p2p');

          // Optional: Send additional P2P alert if needed, 
          // though activateSubscription already handles system notification
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

      // Check and complete withdrawal
      const withdrawal = await Withdrawal.findById(match.withdrawal);
      const allMatchesForWithdrawal = await PaymentMatch.find({ withdrawal: match.withdrawal });
      const withdrawalAllConfirmed = allMatchesForWithdrawal.every(m => ['confirmed', 'completed'].includes(m.status));

      if (withdrawal.status !== 'completed' && withdrawalAllConfirmed) {
        withdrawal.status = 'completed';
        withdrawal.processedAt = new Date();
        await withdrawal.save();

        await Transaction.create({
          user: withdrawal.user,
          type: 'withdrawal',
          category: 'debit',
          amount: withdrawal.amount,
          status: 'completed',
          description: 'Withdrawal completed via P2P Final Activation',
          referenceType: 'withdrawal',
        });
      }

      return NextResponse.json({ message: 'Match finalized and plan activated successfully' });

    } else if (action === 'cancel') {
      match.status = 'cancelled';
      match.adminNotes = reason || 'Cancelled by Admin';
      await match.save();

      // If we cancel a match, the withdrawal should go back to 'pending' 
      // so it can be matched with someone else.
      const withdrawal = await Withdrawal.findById(match.withdrawal);
      if (withdrawal && withdrawal.status === 'processing') {
        withdrawal.status = 'pending';
        await withdrawal.save();
      }

      // The subscription should also likely go back to 'pending' or be rejected
      const subscription = await Subscription.findById(match.subscription);
      if (subscription && subscription.status === 'pending_verification') {
        subscription.status = 'pending'; // Allow it to be re-matched or fixed
        await subscription.save();
      }

      return NextResponse.json({ message: 'Match cancelled successfully' });
    } else if (action === 'update-upi') {
      if (!upiId) return NextResponse.json({ message: 'UPI ID is required' }, { status: 400 });
      
      match.customUpiId = upiId;
      await match.save();
      return NextResponse.json({ message: 'UPI ID updated successfully' });
    }

    return NextResponse.json({ message: 'Invalid action' }, { status: 400 });

  } catch (error) {
    console.error('Admin P2P Match action error:', error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
