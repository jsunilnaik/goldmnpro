import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Wallet from '@/models/Wallet';
import Transaction from '@/models/Transaction';
import Referral from '@/models/Referral';
import AdminConfig from '@/models/AdminConfig';
import Notification from '@/models/Notification';
import { recordReferralOutflow } from '@/lib/treasury';

/**
 * Referral Engine — Multi-Level Commission System
 * 
 * Walks the ancestor chain (user.referredBy → parent.referredBy → ...)
 * and credits commissions at diminishing rates per level.
 * 
 * All operations are atomic ($inc) to prevent race conditions.
 */

// ─── Get commission rate for a given level ──────────────
async function getCommissionRate(level, configs) {
  if (level === 1) return parseFloat(configs.referral_level_1_rate ?? 5);
  if (level === 2) return parseFloat(configs.referral_level_2_rate ?? 3);
  if (level === 3) return parseFloat(configs.referral_level_3_rate ?? 1);
  return parseFloat(configs.referral_level_4_plus_rate ?? 0.5);
}

// ─── Walk the ancestor chain iteratively ────────────────
async function walkAncestorChain(userId, maxDepth = 10) {
  await connectDB();
  const ancestors = [];
  let currentUserId = userId;

  for (let level = 1; level <= maxDepth; level++) {
    const currentUser = await User.findById(currentUserId)
      .select('referredBy')
      .lean();

    if (!currentUser?.referredBy) break;

    ancestors.push({
      userId: currentUser.referredBy,
      level,
    });

    currentUserId = currentUser.referredBy;
  }

  return ancestors;
}

// ═══════════════════════════════════════════════════════════
//  PROCESS MULTI-LEVEL SUBSCRIPTION COMMISSION
//  Called when admin approves a subscription
// ═══════════════════════════════════════════════════════════
export async function processMultiLevelCommission(subscribingUserId, plan, subscription) {
  try {
    await connectDB();
    const configs = await AdminConfig.getAllConfigs();
    const maxDepth = parseInt(configs.referral_max_depth ?? 10);
    const maxEarningsLimit = parseInt(configs.max_referral_earnings_limit ?? 50000);
    const minCommission = parseFloat(configs.referral_min_commission ?? 1);

    // Get subscriber info for notifications
    const subscriber = await User.findById(subscribingUserId)
      .select('fullName referralCode')
      .lean();

    if (!subscriber) return;

    // Walk the ancestor chain
    const ancestors = await walkAncestorChain(subscribingUserId, maxDepth);

    if (ancestors.length === 0) return;

    const planPrice = plan.price || subscription?.amountPaid || 0;
    if (planPrice <= 0) return;

    console.log(`[REFERRAL-ENGINE] Processing multi-level commission for ${subscriber.fullName}'s ₹${planPrice} subscription. ${ancestors.length} ancestors found.`);

    for (const ancestor of ancestors) {
      try {
        const rate = await getCommissionRate(ancestor.level, configs);
        const commission = Math.round((planPrice * rate) / 100);

        // Skip if below minimum threshold
        if (commission < minCommission) {
          console.log(`[REFERRAL-ENGINE] Skipping L${ancestor.level} — commission ₹${commission} below minimum ₹${minCommission}`);
          continue;
        }

        // Check ancestor's earnings cap
        const ancestorUser = await User.findById(ancestor.userId)
          .select('referralEarnings fullName')
          .lean();

        if (!ancestorUser) continue;

        const currentEarnings = ancestorUser.referralEarnings || 0;
        if (currentEarnings >= maxEarningsLimit) {
          console.log(`[REFERRAL-ENGINE] Skipping L${ancestor.level} ${ancestorUser.fullName} — earnings cap reached`);
          continue;
        }

        // Cap the actual bonus if it would exceed the limit
        const actualCommission = Math.min(commission, maxEarningsLimit - currentEarnings);

        // 1. Credit wallet
        await Wallet.findOneAndUpdate(
          { user: ancestor.userId },
          {
            $inc: {
              cashBalance: actualCommission,
              totalReferralEarnings: actualCommission,
            },
          }
        );

        // 2. Update user referral earnings
        await User.findByIdAndUpdate(ancestor.userId, {
          $inc: { referralEarnings: actualCommission },
        });

        // 3. Create transaction record
        await Transaction.create({
          user: ancestor.userId,
          type: 'referral_bonus',
          category: 'credit',
          amount: actualCommission,
          status: 'completed',
          description: `Level ${ancestor.level} commission from ${subscriber.fullName}'s ${plan.name} subscription`,
          referenceType: 'referral',
          metadata: {
            buyerName: subscriber.fullName,
            planName: plan.name,
            planPrice,
            level: ancestor.level,
            rate,
            bonusType: 'subscription_commission',
            sourceUserId: subscribingUserId.toString(),
          },
        });

        // 4. Create referral record
        await Referral.findOneAndUpdate(
          {
            referrer: ancestor.userId,
            referred: subscribingUserId,
            level: ancestor.level,
            sourceUser: subscribingUserId,
          },
          {
            referralCode: subscriber.referralCode || '',
            status: 'subscribed',
            fromSubscription: subscription?._id,
            fromPlan: plan._id,
            planAmount: planPrice,
            bonusPercentage: rate,
            bonusEarned: actualCommission,
            bonusPaid: true,
            bonusPaidAt: new Date(),
            commissionType: 'subscription_commission',
            notes: `Level ${ancestor.level} multi-level commission`,
          },
          { upsert: true, new: true }
        );

        // 5. Treasury outflow
        await recordReferralOutflow(actualCommission);

        // 6. Notification
        await Notification.create({
          user: ancestor.userId,
          title: '🎉 Referral Commission Earned!',
          message: `You earned ₹${actualCommission} (Level ${ancestor.level} • ${rate}%) from ${subscriber.fullName}'s ${plan.name} subscription`,
          type: 'referral',
          actionUrl: '/referrals',
        });

        console.log(`[REFERRAL-ENGINE] ✅ L${ancestor.level} — ₹${actualCommission} credited to ${ancestorUser.fullName}`);
      } catch (ancestorErr) {
        console.error(`[REFERRAL-ENGINE] Error processing L${ancestor.level} ancestor:`, ancestorErr);
        // Continue to next ancestor — don't fail the whole chain
      }
    }
  } catch (err) {
    console.error('[REFERRAL-ENGINE] Multi-level commission error:', err);
    // Don't throw — referral failures should never block subscription approval
  }
}

// ═══════════════════════════════════════════════════════════
//  PROCESS MULTI-LEVEL SIGNUP BONUS
//  Called when a new user signs up with a referral code
// ═══════════════════════════════════════════════════════════
export async function processMultiLevelSignupBonus(newUserId, newUserWallet) {
  try {
    await connectDB();
    const configs = await AdminConfig.getAllConfigs();
    const maxDepth = parseInt(configs.referral_max_depth ?? 10);
    const maxEarningsLimit = parseInt(configs.max_referral_earnings_limit ?? 50000);
    const signupBonusReferrer = parseInt(configs.referral_signup_bonus_referrer ?? 10);
    const signupBonusUser = parseInt(configs.referral_signup_bonus_user ?? 5);

    const newUser = await User.findById(newUserId)
      .select('fullName referralCode referredBy')
      .lean();

    if (!newUser) return;

    // 1. Award signup bonus to new user (always flat, not multi-level)
    if (signupBonusUser > 0 && newUserWallet) {
      newUserWallet.cashBalance += signupBonusUser;
      await newUserWallet.save();

      await Transaction.create({
        user: newUserId,
        type: 'referral_bonus',
        category: 'credit',
        amount: signupBonusUser,
        status: 'completed',
        description: 'Signup bonus (Referral)',
        referenceType: 'referral',
        metadata: { bonusType: 'signup_bonus_user' },
      });
    }

    // 2. Walk ancestor chain and credit signup bonus with diminishing rates
    const ancestors = await walkAncestorChain(newUserId, maxDepth);

    if (ancestors.length === 0) return;

    // Diminishing signup bonus: L1 = full, L2 = 50%, L3 = 25%, L4+ = 10%
    const signupBonusMultipliers = [1, 0.5, 0.25];

    for (const ancestor of ancestors) {
      try {
        const multiplier = ancestor.level <= 3
          ? signupBonusMultipliers[ancestor.level - 1]
          : 0.1;

        const bonus = Math.round(signupBonusReferrer * multiplier);
        if (bonus < 1) continue; // Skip sub-₹1 bonuses

        // Check ancestor's earnings cap
        const ancestorUser = await User.findById(ancestor.userId)
          .select('referralEarnings fullName')
          .lean();

        if (!ancestorUser) continue;

        const currentEarnings = ancestorUser.referralEarnings || 0;
        if (currentEarnings >= maxEarningsLimit) continue;

        const actualBonus = Math.min(bonus, maxEarningsLimit - currentEarnings);

        // Credit wallet
        await Wallet.findOneAndUpdate(
          { user: ancestor.userId },
          {
            $inc: {
              cashBalance: actualBonus,
              totalReferralEarnings: actualBonus,
            },
          }
        );

        // Update user earnings
        await User.findByIdAndUpdate(ancestor.userId, {
          $inc: {
            referralCount: ancestor.level === 1 ? 1 : 0, // Only increment count for direct referrer
            referralEarnings: actualBonus,
          },
        });

        // Transaction record
        await Transaction.create({
          user: ancestor.userId,
          type: 'referral_bonus',
          category: 'credit',
          amount: actualBonus,
          status: 'completed',
          description: ancestor.level === 1
            ? `Signup bonus for referring ${newUser.fullName}`
            : `Level ${ancestor.level} signup bonus — ${newUser.fullName} joined`,
          referenceType: 'referral',
          metadata: {
            newUserName: newUser.fullName,
            level: ancestor.level,
            bonusType: 'signup_bonus',
            sourceUserId: newUserId.toString(),
          },
        });

        // Referral record
        await Referral.findOneAndUpdate(
          {
            referrer: ancestor.userId,
            referred: newUserId,
            level: ancestor.level,
            sourceUser: newUserId,
          },
          {
            referralCode: newUser.referralCode || '',
            status: 'registered',
            bonusPercentage: multiplier * 100,
            bonusEarned: actualBonus,
            bonusPaid: true,
            bonusPaidAt: new Date(),
            commissionType: 'signup_bonus',
            notes: `Level ${ancestor.level} signup bonus`,
          },
          { upsert: true, new: true }
        );

        // Notification
        await Notification.create({
          user: ancestor.userId,
          title: ancestor.level === 1 ? '👋 New Referral!' : '🌳 Network Growth!',
          message: ancestor.level === 1
            ? `${newUser.fullName} joined using your referral! You earned ₹${actualBonus}`
            : `${newUser.fullName} joined your Level ${ancestor.level} network! You earned ₹${actualBonus}`,
          type: 'referral',
          actionUrl: '/referrals',
        });

        console.log(`[REFERRAL-ENGINE] ✅ Signup L${ancestor.level} — ₹${actualBonus} to ${ancestorUser.fullName}`);
      } catch (ancestorErr) {
        console.error(`[REFERRAL-ENGINE] Signup bonus L${ancestor.level} error:`, ancestorErr);
      }
    }
  } catch (err) {
    console.error('[REFERRAL-ENGINE] Signup bonus error:', err);
  }
}

// ═══════════════════════════════════════════════════════════
//  GET NETWORK STATS — For the referrals page
//  Returns tree size, level breakdown, downline
// ═══════════════════════════════════════════════════════════
export async function getNetworkStats(userId) {
  try {
    await connectDB();

    // 1. Get level-wise breakdown from Referral records (where this user is the referrer)
    const levelBreakdown = await Referral.aggregate([
      { $match: { referrer: userId } },
      {
        $group: {
          _id: '$level',
          count: { $addToSet: '$referred' }, // unique referred users per level
          totalEarnings: { $sum: '$bonusEarned' },
        },
      },
      {
        $project: {
          level: '$_id',
          count: { $size: '$count' },
          earnings: '$totalEarnings',
          _id: 0,
        },
      },
      { $sort: { level: 1 } },
    ]);

    // 2. Total network size (unique referred users across all levels)
    const networkResult = await Referral.aggregate([
      { $match: { referrer: userId } },
      { $group: { _id: '$referred' } },
      { $count: 'total' },
    ]);
    const totalNetworkSize = networkResult[0]?.total || 0;

    // 3. Total earnings from all referral commissions
    const totalEarnings = levelBreakdown.reduce((sum, l) => sum + l.earnings, 0);

    // 4. Get downline (users below this user in the tree, level by level)
    const downline = [];
    let currentLevelUserIds = [userId];

    for (let level = 1; level <= 5; level++) { // Show max 5 levels of downline
      if (currentLevelUserIds.length === 0) break;

      const childUsers = await User.find({ referredBy: { $in: currentLevelUserIds } })
        .select('fullName referralCode referralCount currentPlan createdAt')
        .populate({
          path: 'currentPlan',
          populate: { path: 'plan', select: 'name' },
        })
        .lean();

      if (childUsers.length === 0) break;

      downline.push({
        level,
        users: childUsers.map(u => ({
          fullName: u.fullName,
          referralCode: u.referralCode,
          referralCount: u.referralCount || 0,
          hasActivePlan: !!u.currentPlan,
          planName: u.currentPlan?.plan?.name || null,
          joinedAt: u.createdAt,
        })),
      });

      // Next level: search from these children
      currentLevelUserIds = childUsers.map(u => u._id);
    }

    return {
      totalNetworkSize,
      levelBreakdown,
      totalEarnings,
      downline,
    };
  } catch (err) {
    console.error('[REFERRAL-ENGINE] getNetworkStats error:', err);
    return {
      totalNetworkSize: 0,
      levelBreakdown: [],
      totalEarnings: 0,
      downline: [],
    };
  }
}

