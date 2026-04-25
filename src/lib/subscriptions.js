import Subscription from '@/models/Subscription';
import User from '@/models/User';
import Wallet from '@/models/Wallet';
import Transaction from '@/models/Transaction';
import Plan from '@/models/Plan';
import { recordInflow } from './treasury';
import { processMultiLevelCommission } from './referral-engine';
import { createNotification } from './notifications';

/**
 * Centrally activates a subscription after payment verification (Direct or P2P).
 * This ensures all related data (Wallet, Transactions, Referrals) are perfectly synced.
 * @param {string} subscriptionId - ID of the subscription to activate
 * @param {string} activationSource - 'admin', 'p2p', or 'direct'
 */
export async function activateSubscription(subscriptionId, activationSource = 'direct') {
    try {
        const subscription = await Subscription.findById(subscriptionId);
        if (!subscription) throw new Error('Subscription not found');
        if (subscription.status === 'active') return subscription;

        const plan = await Plan.findById(subscription.plan);
        if (!plan) throw new Error('Plan not found for subscription');

        // 0. Deactivate any previous 'active' plans for this user (Prevent overlap bugs)
        await Subscription.updateMany(
            { user: subscription.user, _id: { $ne: subscriptionId }, status: 'active' },
            { status: 'expired' }
        );

        // 1. Update Subscription Status & Duration
        subscription.status = 'active';
        subscription.startDate = new Date();
        subscription.endDate = new Date(Date.now() + (plan.duration || 30) * 24 * 60 * 60 * 1000);
        
        // Critical for 2X Reward calculation
        subscription.totalSessionsExpected = plan.totalSessionsLimit || (plan.duration || 30) * (plan.dailySessionLimit || 1);
        
        await subscription.save();

        // 2. Update User's Current Plan
        await User.findByIdAndUpdate(subscription.user, {
            currentPlan: subscription._id,
        });

        // 3. Update Wallet Stats & Initialize Mining Balance
        const maxEarningRupees = plan.price * 2;
        await Wallet.findOneAndUpdate(
            { user: subscription.user },
            { 
                $inc: { 
                    totalInvestment: plan.price,
                    cashBalance: plan.price, // Reflect plan cost in wallet for mining sessions
                    miningBalance: maxEarningRupees // Add 2X potential cumulatively
                }
            },
            { upsert: true }
        );

        // 4. Record Detailed Transaction
        await Transaction.create({
            user: subscription.user,
            type: 'plan_purchase',
            category: 'debit',
            amount: plan.price,
            status: 'completed',
            description: `Subscribed to ${plan.name} Plan (${activationSource.toUpperCase()})`,
            referenceId: subscription.utr || `SUB-${subscription._id.toString().slice(-6)}`,
            referenceType: 'payment',
            metadata: {
                planName: plan.name,
                planId: plan._id,
                utr: subscription.utr,
                source: activationSource,
                activatedAt: new Date(),
            },
        });

        // 5. Record Treasury Inflow
        await recordInflow(plan.price, plan.name);

        // 6. Process Multi-Level Referral Commission
        await processMultiLevelCommission(subscription.user, plan, subscription);

        // 7. Notify User
        await createNotification(subscription.user, {
            title: 'Plan Activated! 🎉',
            message: `Your ${plan.name} plan is now active. You can start mining rewards.`,
            type: 'system',
            actionUrl: '/dashboard'
        });

        console.log(`✅ Subscription ${subscriptionId} activated via ${activationSource}`);
        return subscription;
    } catch (error) {
        console.error('Subscription activation error:', error);
        throw error;
    }
}
