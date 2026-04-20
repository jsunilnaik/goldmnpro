const mongoose = require('mongoose');
const dns = require('dns');
dns.setServers(['8.8.8.8']); // Force Google DNS to resolve MongoDB SRV records
const dotenv = require('dotenv');
const path = require('path');
const bcrypt = require('bcryptjs');

dotenv.config({ path: path.resolve('d:/POD Project/GoldMine Pro/v1/goldmine-pro-nextjs/.env.local') });

async function seed() {
  try {
    const MONGODB_URI = process.env.MONGODB_URI;
    if (!MONGODB_URI) throw new Error('MONGODB_URI is missing');

    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Define temporary schemas to avoid import issues
    const User = mongoose.models.User || mongoose.model('User', new mongoose.Schema({}, { strict: false }));
    const Wallet = mongoose.models.Wallet || mongoose.model('Wallet', new mongoose.Schema({}, { strict: false }));
    const Withdrawal = mongoose.models.Withdrawal || mongoose.model('Withdrawal', new mongoose.Schema({}, { strict: false }));
    const Plan = mongoose.models.Plan || mongoose.model('Plan', new mongoose.Schema({}, { strict: false }));

    // 1. Ensure Diamond Plan exists
    let plan = await Plan.findOne({ name: 'Diamond' });
    if (!plan) {
      plan = await Plan.create({
        name: 'Diamond',
        slug: 'diamond',
        price: 4999,
        originalPrice: 9999,
        duration: 30,
        miningRate: 25,
        goldPerPoint: 0.005,
        isActive: true,
        sortOrder: 4,
        icon: '💎',
        color: '#ff00ff'
      });
    }

    // 2. Clear previous test data
    await User.deleteMany({ phone: { $in: ['9999999999', '8888888888'] } });
    
    const hashedPassword = await bcrypt.hash('password123', 12);

    // 3. Create Withdrawer User
    const withdrawer = await User.create({
      fullName: 'John Withdrawer',
      email: 'john@test.com',
      password: hashedPassword,
      phone: '9999999999',
      role: 'user',
      isPhoneVerified: true,
      isKYCVerified: true,
      referralCode: 'GM' + Math.random().toString(36).substring(2, 8).toUpperCase(),
      paymentMethods: [{
        type: 'upi',
        upiId: 'john@ybl',
        isPrimary: true,
        isVerified: true
      }]
    });

    // Setup Withdrawer Wallet
    await Wallet.deleteMany({ user: withdrawer._id });
    await Wallet.create({
      user: withdrawer._id,
      cashBalance: 10000,
      pointsBalance: 0,
      goldBalance: 0,
      totalInvestment: 0,
      pendingWithdrawal: 4999
    });

    // Create Approved Withdrawal
    await Withdrawal.deleteMany({ user: withdrawer._id });
    const withdrawal = await Withdrawal.create({
      user: withdrawer._id,
      amount: 4999,
      status: 'approved',
      paymentMethod: {
        type: 'upi',
        upiId: 'john@ybl'
      },
      withdrawalMonth: new Date().toISOString().slice(0, 7),
      scheduledDate: new Date()
    });

    // 4. Create Subscriber User
    const subscriber = await User.create({
      fullName: 'Alice Subscriber',
      email: 'alice@test.com',
      password: hashedPassword,
      phone: '8888888888',
      role: 'user',
      isPhoneVerified: true,
      isKYCVerified: true
    });

    console.log('✨ P2P Test Data seeded successfully!');
    console.log('Alice: alice@test.com / password123');
    console.log('John: john@test.com / password123');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seed();
