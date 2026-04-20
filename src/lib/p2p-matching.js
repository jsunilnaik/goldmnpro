import mongoose from 'mongoose';
import Withdrawal from '@/models/Withdrawal';
import PaymentMatch from '@/models/PaymentMatch';
import User from '@/models/User';
import { cleanupExpiredMatches } from './p2p-maintenance';
import { sendP2PMatchAlert } from './sms';
import { createNotification } from './notifications';

/**
 * Matches a subscription with one or more pending withdrawals.
 * @param {string} subscriberId - ID of the user subscribing
 * @param {string} subscriptionId - ID of the subscription being purchased
 * @param {number} totalAmount - Total amount to be paid (e.g. 4999)
 * @returns {Promise<{success: boolean, matches: any[], remainder: number}>}
 */
export async function matchSubscriptionWithWithdrawals(subscriberId, subscriptionId, totalAmount) {
  try {
    // 0. Maintenance & Liquidity Checks
    const { autoApproveSeededWithdrawals } = await import('./p2p-liquidity');
    await Promise.all([
      cleanupExpiredMatches(),
      autoApproveSeededWithdrawals()
    ]);

    const subId = typeof subscriberId === 'string' ? new mongoose.Types.ObjectId(subscriberId) : subscriberId;
    let remainingAmount = Number(totalAmount);
    const matches = [];

    console.log(`🔍 P2P Match Attempt: Amount=${remainingAmount}, Subscriber=${subId}`);

    // 1. Loop to find withdrawals until the totalAmount is fulfilled or we hit the match limit
    for (let i = 0; i < 3 && remainingAmount > 0; i++) {
        // Find a withdrawal with available liquidity
        const withdrawal = await Withdrawal.findOneAndUpdate(
          {
            status: { $in: ['approved', 'pending'] },
            user: { $ne: subId },
            $expr: { $gt: ["$amount", { $ifNull: ["$lockedAmount", 0] }] }
          },
          [
            { 
              $set: { 
                lockedAmount: { 
                  $add: [{ $ifNull: ["$lockedAmount", 0] }, { $min: [remainingAmount, { $subtract: ["$amount", { $ifNull: ["$lockedAmount", 0] }] }] }] 
                },
                status: {
                  $cond: {
                    if: { $gte: [{ $add: [{ $ifNull: ["$lockedAmount", 0] }, { $min: [remainingAmount, { $subtract: ["$amount", { $ifNull: ["$lockedAmount", 0] }] }] }] }, "$amount"] },
                    then: 'processing',
                    else: '$status'
                  }
                }
              } 
            }
          ],
          { sort: { status: 1, createdAt: 1 }, new: true }
        );

        if (!withdrawal) break;

        const matchAmount = Math.min(remainingAmount, withdrawal.amount - (withdrawal.lockedAmount - Math.min(remainingAmount, withdrawal.amount)));

        console.log(`✅ P2P Match Confirmed: Withdrawer=${withdrawal.user}, Amount=${matchAmount}, WD_ID=${withdrawal._id}`);

        // Create a PaymentMatch record
        const match = await PaymentMatch.create({
          subscriber: subscriberId,
          withdrawer: withdrawal.user,
          subscription: subscriptionId,
          withdrawal: withdrawal._id,
          amount: matchAmount,
          status: 'matched',
          expiresAt: new Date(Date.now() + 60 * 60 * 1000)
        });

        // 1b. Send SMS & In-App Alerts to Withdrawer
        if (!withdrawal.isSystemGenerated) {
          try {
            const withdrawer = await User.findById(withdrawal.user);
            if (withdrawer?.phone) {
                await sendP2PMatchAlert(withdrawer.phone, matchAmount);
            }
            await createNotification(withdrawal.user, {
              title: 'Payout Match Found!',
              message: `Your ₹${matchAmount} withdrawal portion has been matched. A user will pay you shortly.`,
              type: 'withdrawal',
              actionUrl: '/withdraw'
            });
          } catch (err) {
            console.error('P2P Notification Error:', err);
          }
        }

        matches.push(match);
        remainingAmount -= matchAmount;
    }

    // 2. Notify Subscriber if any matches were made
    if (matches.length > 0) {
        await createNotification(subscriberId, {
          title: 'Payment Match Found',
          message: `You have been matched with ${matches.length} withdrawal(s). Please fulfill the shown payments.`,
          type: 'payment'
        });
    }

    return {
      success: true,
      matches,
      remainder: remainingAmount,
    };

  } catch (error) {
    console.error('P2P Matching Error:', error);
    return { success: false, error: error.message };
  }
}
