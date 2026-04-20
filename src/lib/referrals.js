import User from '@/models/User';
import Wallet from '@/models/Wallet';
import Transaction from '@/models/Transaction';
import AdminConfig from '@/models/AdminConfig';
import { recordReferralOutflow } from './treasury';
import { createNotification } from './notifications';

/**
 * Processes a referral bonus commission for the referrer of a user 
 * who just activated a plan.
 * @param {string} userId - ID of the user who bought the plan
 * @param {object} plan - The Plan model instance
 */
export async function processReferralBonus(userId, plan) {
    try {
        const referredUser = await User.findById(userId);
        if (!referredUser?.referredBy) return;

        const configs = await AdminConfig.getAllConfigs();
        const maxEarningsLimit = parseInt(configs.max_referral_earnings_limit || '50000');
        const referrer = await User.findById(referredUser.referredBy);

        if (!referrer) return;

        const currentEarnings = referrer.referralEarnings || 0;
        const referralBonusRate = plan.referralBonus || 5;
        const potentialBonus = Math.round((plan.price * referralBonusRate) / 100);

        if (potentialBonus > 0 && currentEarnings < maxEarningsLimit) {
            const actualBonus = Math.min(potentialBonus, maxEarningsLimit - currentEarnings);

            // Update Wallet
            await Wallet.findOneAndUpdate(
                { user: referrer._id },
                { $inc: { cashBalance: actualBonus } }
            );

            // Update User stats
            await User.findByIdAndUpdate(referrer._id, {
                $inc: { referralEarnings: actualBonus }
            });

            // Record Transaction
            await Transaction.create({
                user: referrer._id,
                type: 'referral_bonus',
                category: 'credit',
                amount: actualBonus,
                status: 'completed',
                description: `Commission from ${referredUser.fullName}'s subscription`,
                referenceType: 'referral',
                metadata: {
                    buyerName: referredUser.fullName,
                    planName: plan.name,
                    bonusType: 'subscription',
                },
            });

            // Notify Referrer
            await createNotification(referrer._id, {
                title: 'Referral Commission!',
                message: `You earned ₹${actualBonus} from ${referredUser.fullName}'s subscription.`,
                type: 'referral'
            });

            // Treasury outflow for referral bonus
            await recordReferralOutflow(actualBonus);
            
            console.log(`💰 Referral bonus of ₹${actualBonus} paid to ${referrer.email} for ${referredUser.email}`);
        }
    } catch (err) {
        console.error('Referral bonus processing error:', err);
    }
}
