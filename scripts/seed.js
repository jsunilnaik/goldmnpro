const mongoose = require('mongoose');
const dns = require('dns');
dns.setServers(['8.8.8.8']); // Force Google DNS to resolve MongoDB SRV records
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

// Define models (using require for script compatibility)
const UserSchema = new mongoose.Schema({
  fullName: String,
  email: { type: String, unique: true },
  phone: String,
  password: { type: String, select: false },
  role: { type: String, default: 'user' },
  isActive: { type: Boolean, default: true },
  referralCode: { type: String, unique: true },
  currentPlan: mongoose.Schema.Types.Mixed, // Use Mixed to handle both ObjectIds and broken Strings
});

const AdminConfigSchema = new mongoose.Schema({
  key: { type: String, unique: true },
  value: mongoose.Schema.Types.Mixed,
  category: String,
  description: String,
});

const PlanSchema = new mongoose.Schema({
  name: String,
  slug: { type: String, unique: true },
  price: Number,
  duration: Number,
  miningRate: Number,
  goldPerPoint: Number,
  isActive: { type: Boolean, default: true },
});

const SubscriptionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  plan: { type: mongoose.Schema.Types.ObjectId, ref: 'Plan' },
  status: { type: String, default: 'pending' },
  amountPaid: Number,
  startDate: Date,
  endDate: Date,
});

const WalletSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true },
  pointsBalance: { type: Number, default: 0 },
  goldBalance: { type: Number, default: 0 },
  cashBalance: { type: Number, default: 0 },
  totalPointsEarned: { type: Number, default: 0 },
  totalGoldEarned: { type: Number, default: 0 },
  totalCashEarned: { type: Number, default: 0 },
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);
const AdminConfig = mongoose.models.AdminConfig || mongoose.model('AdminConfig', AdminConfigSchema);
const Plan = mongoose.models.Plan || mongoose.model('Plan', PlanSchema);
const Subscription = mongoose.models.Subscription || mongoose.model('Subscription', SubscriptionSchema);
const Wallet = mongoose.models.Wallet || mongoose.model('Wallet', WalletSchema);

async function seed() {
  try {
    const MONGODB_URI = process.env.MONGODB_URI;
    if (!MONGODB_URI) throw new Error('MONGODB_URI is missing');

    const dns = require('dns');
    dns.setServers(['8.8.8.8']); // Force Google DNS to resolve MongoDB SRV records

    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // 1. Create/Update Admin User
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@goldminepro.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123456';

    let adminUser = await User.findOne({ email: adminEmail });
    if (!adminUser) {
      adminUser = await User.create({
        fullName: 'Admin User',
        email: adminEmail,
        password: adminPassword, // Model middleware will hash this
        phone: '9999999999',
        role: 'admin',
        referralCode: 'ADMIN01',
      });
      console.log(`✅ Admin user created: ${adminEmail}`);
    } else {
      adminUser.password = adminPassword;
      adminUser.role = 'admin';
      await adminUser.save();
      console.log('✅ Admin user password updated');
    }

    // 2. Seed AdminConfigs
    const defaultConfigs = [
      { key: 'gold_price_per_gram', value: 6000, category: 'mining', description: 'Gold price per gram in INR' },
      { key: 'points_to_gold_ratio', value: 0.00001, category: 'mining', description: 'Points to gold conversion ratio' },
      { key: 'max_mining_session_hours', value: 24, category: 'mining', description: 'Max mining session duration' },
      { key: 'withdrawal_date', value: 15, category: 'withdrawal', description: 'Monthly withdrawal date' },
      { key: 'withdrawal_window_days', value: 3, category: 'withdrawal', description: 'Withdrawal window days' },
      { key: 'min_withdrawal_amount', value: 500, category: 'withdrawal', description: 'Minimum withdrawal INR' },
      { key: 'max_withdrawal_amount', value: 500000, category: 'withdrawal', description: 'Maximum withdrawal INR' },
      { key: 'tds_percentage', value: 30, category: 'withdrawal', description: 'TDS percentage' },
      { key: 'processing_fee', value: 10, category: 'withdrawal', description: 'Processing fee INR' },
      { key: 'referral_signup_bonus_referrer', value: 1000, category: 'referral', description: 'Signup bonus for referrer (INR)' },
      { key: 'referral_signup_bonus_user', value: 500, category: 'referral', description: 'Signup bonus for new user (INR)' },
    ];

    for (const config of defaultConfigs) {
      await AdminConfig.findOneAndUpdate({ key: config.key }, config, { upsert: true });
    }
    console.log('✅ Default configurations seeded');

    // 3. Seed Plans
    const defaultPlans = [
      { 
        name: 'Bronze', slug: 'bronze', price: 2999, duration: 30, 
        miningRate: 666, dailySessionLimit: 10, maxSessionMinutes: 30, goldPerPoint: 0.00001 
      },
      { 
        name: 'Silver', slug: 'silver', price: 5999, duration: 30, 
        miningRate: 5331, dailySessionLimit: 5, maxSessionMinutes: 15, goldPerPoint: 0.00001 
      },
      { 
        name: 'Gold', slug: 'gold', price: 11999, duration: 30, 
        miningRate: 53327, dailySessionLimit: 3, maxSessionMinutes: 5, goldPerPoint: 0.00001 
      },
    ];

    for (const plan of defaultPlans) {
      await Plan.findOneAndUpdate({ slug: plan.slug }, plan, { upsert: true });
    }
    console.log('✅ Default plans seeded');

    // 4. Assign Plan to Admin
    const goldPlan = await Plan.findOne({ slug: 'gold' });
    if (goldPlan && adminUser) {
      // Create subscription
      const subscription = await Subscription.findOneAndUpdate(
        { user: adminUser._id },
        {
          plan: goldPlan._id,
          status: 'active',
          amountPaid: goldPlan.price,
          startDate: new Date(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        },
        { upsert: true, new: true }
      );

      // Link to admin
      adminUser.currentPlan = subscription._id;
      await adminUser.save();
      console.log('✅ Gold Plan assigned to Admin');
    }

    // 5. Data Integrity Check (Fix String-based Plans)
    const allUsers = await User.find({ currentPlan: { $ne: null } });
    let fixCount = 0;
    for (const u of allUsers) {
      if (u.currentPlan && !mongoose.Types.ObjectId.isValid(u.currentPlan)) {
        u.currentPlan = null;
        await u.save();
        fixCount++;
      }
    }
    if (fixCount > 0) {
      console.log(`✅ Fixed ${fixCount} users with invalid string-based plans`);
    }

    // 6. Manual Plan Assignment & Balance for Specific User
    const targetUserId = '69cd72bf35ef4cd8017771b5';
    const targetUser = await User.findById(targetUserId);

    if (targetUser && goldPlan) {
      const subscription = await Subscription.findOneAndUpdate(
        { user: targetUser._id },
        {
          plan: goldPlan._id,
          status: 'active',
          amountPaid: goldPlan.price,
          startDate: new Date(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
        { upsert: true, new: true }
      );

      targetUser.currentPlan = subscription._id;
      await targetUser.save();
      console.log(`✅ Gold Plan manually assigned to user: ${targetUser.email}`);
    }

    // 7. Seed Wallets (Initial Balances for Testing)
    const usersToSeed = [];
    if (adminUser) usersToSeed.push(adminUser._id);
    if (targetUser) usersToSeed.push(targetUser._id);

    for (const userId of usersToSeed) {
      await Wallet.findOneAndUpdate(
        { user: userId },
        {
          pointsBalance: 250,
          goldBalance: 0.025,
          cashBalance: 10000,
          totalPointsEarned: 250,
          totalGoldEarned: 0.025,
          totalCashEarned: 10000,
        },
        { upsert: true }
      );
    }
    console.log('✅ Wallets seeded with initial testing balances (₹10,000)');

    console.log('✨ Seeding and Data Cleanup completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seed();
