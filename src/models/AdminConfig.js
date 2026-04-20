import mongoose from 'mongoose';

// In-memory cache for high-volume configuration lookups
const configCache = new Map();
const CACHE_TTL = 60 * 1000; // 1 minute cache duration

const adminConfigSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  value: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
  description: {
    type: String,
    default: '',
  },
  category: {
    type: String,
    enum: ['mining', 'withdrawal', 'referral', 'system', 'notification'],
    default: 'system',
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, {
  timestamps: true,
});

// Static method to get config with in-memory caching
adminConfigSchema.statics.getConfig = async function(key, defaultValue = null) {
  const cached = configCache.get(key);
  if (cached && (Date.now() - cached.timestamp < CACHE_TTL)) {
    return cached.value;
  }

  const config = await this.findOne({ key }).lean();
  const value = config ? config.value : defaultValue;
  
  // Update cache
  configCache.set(key, { value, timestamp: Date.now() });
  return value;
};

// Static method to set config
adminConfigSchema.statics.setConfig = async function(key, value, category = 'system', adminId = null) {
  return this.findOneAndUpdate(
    { key },
    {
      value,
      category,
      updatedBy: adminId,
    },
    { upsert: true, new: true }
  );
};

// Static method to get all configs by category
adminConfigSchema.statics.getByCategory = async function(category) {
  const configs = await this.find({ category });
  return configs.reduce((acc, c) => {
    acc[c.key] = c.value;
    return acc;
  }, {});
};

// Static method to get all configs as object
adminConfigSchema.statics.getAllConfigs = async function() {
  const configs = await this.find({});
  return configs.reduce((acc, c) => {
    acc[c.key] = c.value;
    return acc;
  }, {});
};

// Default configs
adminConfigSchema.statics.seedDefaults = async function() {
  const defaults = [
    { key: 'gold_price_per_gram', value: 6000, category: 'mining', description: 'Gold price per gram in INR' },
    { key: 'points_to_gold_ratio', value: 0.00001, category: 'mining', description: 'Points to gold conversion ratio' },
    { key: 'max_mining_session_hours', value: 24, category: 'mining', description: 'Max mining session duration' },
    { key: 'auto_claim_hours', value: 24, category: 'mining', description: 'Auto-claim sessions after hours' },
    { key: 'bonus_multiplier_active', value: false, category: 'mining', description: 'Enable bonus multiplier' },
    { key: 'bonus_multiplier_value', value: 1, category: 'mining', description: 'Bonus multiplier value' },
    { key: 'withdrawal_date', value: 15, category: 'withdrawal', description: 'Monthly withdrawal date' },
    { key: 'withdrawal_window_days', value: 3, category: 'withdrawal', description: 'Withdrawal window days' },
    { key: 'min_withdrawal_amount', value: 500, category: 'withdrawal', description: 'Minimum withdrawal INR' },
    { key: 'max_withdrawal_amount', value: 500000, category: 'withdrawal', description: 'Maximum withdrawal INR' },
    { key: 'tds_percentage', value: 30, category: 'withdrawal', description: 'TDS percentage' },
    { key: 'processing_fee', value: 10, category: 'withdrawal', description: 'Processing fee INR' },
    { key: 'default_referral_bonus', value: 5, category: 'referral', description: 'Default referral bonus %' },
    { key: 'maintenance_mode', value: false, category: 'system', description: 'Maintenance mode toggle' },
    { key: 'new_registrations_enabled', value: true, category: 'system', description: 'Allow new signups' },
    { key: 'announcement_text', value: '', category: 'notification', description: 'Global announcement text' },
    { key: 'announcement_active', value: false, category: 'notification', description: 'Show announcement' },
    { key: 'referral_signup_bonus_referrer', value: 1000, category: 'referral', description: 'Signup bonus for referrer (INR)' },
    { key: 'referral_signup_bonus_user', value: 500, category: 'referral', description: 'Signup bonus for new user (INR)' },
    { key: 'max_referral_earnings_limit', value: 50000, category: 'referral', description: 'Maximum referral earnings cap (INR)' },
    { key: 'referral_level_1_rate', value: 5, category: 'referral', description: 'Level 1 (direct) referral commission %' },
    { key: 'referral_level_2_rate', value: 3, category: 'referral', description: 'Level 2 referral commission %' },
    { key: 'referral_level_3_rate', value: 1, category: 'referral', description: 'Level 3 referral commission %' },
    { key: 'referral_level_4_plus_rate', value: 0.5, category: 'referral', description: 'Level 4+ referral commission %' },
    { key: 'referral_max_depth', value: 10, category: 'referral', description: 'Max ancestor levels for commission payout' },
    { key: 'referral_min_commission', value: 1, category: 'referral', description: 'Min commission amount (INR) to credit' },
    { key: 'treasury_reserve_ratio', value: 20, category: 'system', description: 'Reserve ratio % to auto-pause withdrawals' },
    { key: 'daily_payout_cap', value: 5000000, category: 'withdrawal', description: 'Daily withdrawal payout limit (INR)' },
    { key: 'withdrawal_cooldown_days', value: 7, category: 'withdrawal', description: 'Days to wait between withdrawals' },
    { key: 'new_subscriber_cooldown_days', value: 15, category: 'withdrawal', description: 'Days to wait for first withdrawal' },
    { key: 'max_withdrawal_percent_of_earnings', value: 80, category: 'withdrawal', description: 'Max % of lifetime earnings withdrawable' },
    { key: 'throttled_max_withdrawal', value: 10000, category: 'withdrawal', description: 'Max withdrawal INR when pool health is < 40%' },
    { key: 'withdrawals_enabled_globally', value: true, category: 'withdrawal', description: 'Enable/Disable withdrawals system-wide' },
  ];

  for (const config of defaults) {
    await this.findOneAndUpdate(
      { key: config.key },
      config,
      { upsert: true }
    );
  }
};

export default mongoose.models.AdminConfig || mongoose.model('AdminConfig', adminConfigSchema);