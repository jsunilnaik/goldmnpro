import mongoose from 'mongoose';

const referralSchema = new mongoose.Schema({
  referrer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  referred: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  referralCode: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['registered', 'subscribed', 'active', 'inactive'],
    default: 'registered',
  },
  // Bonus tracking
  bonusEarned: {
    type: Number,
    default: 0,
  },
  bonusPercentage: {
    type: Number,
    default: 5,
  },
  // From which subscription
  fromSubscription: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subscription',
    default: null,
  },
  fromPlan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Plan',
    default: null,
  },
  planAmount: {
    type: Number,
    default: 0,
  },
  // Bonus paid
  bonusPaid: {
    type: Boolean,
    default: false,
  },
  bonusPaidAt: {
    type: Date,
    default: null,
  },
  // Transaction reference
  transactionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Transaction',
    default: null,
  },
  // Level in the referral tree (1 = direct, 2 = grandchild, etc.)
  level: {
    type: Number,
    default: 1,
    min: 1,
  },
  // The user whose action (signup/subscription) triggered this commission
  sourceUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  // Type of commission
  commissionType: {
    type: String,
    enum: ['signup_bonus', 'subscription_commission'],
    default: 'subscription_commission',
  },
  // Notes
  notes: {
    type: String,
    default: '',
  },
}, {
  timestamps: true,
});

// Compound indexes for multi-level referral tracking
referralSchema.index({ referrer: 1, referred: 1, level: 1, sourceUser: 1 }, { unique: true });
referralSchema.index({ referrer: 1, status: 1 });
referralSchema.index({ referralCode: 1 });

// Static: Get referral stats for a user
referralSchema.statics.getReferralStats = async function(userId) {
  const stats = await this.aggregate([
    { $match: { referrer: new mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: null,
        totalReferrals: { $sum: 1 },
        activeReferrals: {
          $sum: { $cond: [{ $in: ['$status', ['subscribed', 'active']] }, 1, 0] },
        },
        totalBonusEarned: { $sum: '$bonusEarned' },
        totalPlanAmount: { $sum: '$planAmount' },
      },
    },
  ]);

  return stats[0] || {
    totalReferrals: 0,
    activeReferrals: 0,
    totalBonusEarned: 0,
    totalPlanAmount: 0,
  };
};

// Static: Record a referral bonus
referralSchema.statics.recordBonus = async function(referrerId, referredId, subscriptionId, planId, planAmount, bonusPercent) {
  const bonusAmount = (planAmount * bonusPercent) / 100;

  return this.findOneAndUpdate(
    { referrer: referrerId, referred: referredId },
    {
      status: 'subscribed',
      fromSubscription: subscriptionId,
      fromPlan: planId,
      planAmount,
      bonusPercentage: bonusPercent,
      bonusEarned: bonusAmount,
      bonusPaid: true,
      bonusPaidAt: new Date(),
    },
    { upsert: true, new: true }
  );
};

export default mongoose.models.Referral || mongoose.model('Referral', referralSchema);