const { MongoClient } = require('mongodb');
const dns = require('dns');
dns.setServers(['8.8.8.8']);
const dotenv = require('dotenv');
const path = require('path');
const bcrypt = require('bcryptjs');

dotenv.config({ path: path.resolve('d:/POD Project/GoldMine Pro/v1/goldmine-pro-nextjs/.env.local') });

async function seed() {
  const client = new MongoClient(process.env.MONGODB_URI);
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB via Native Driver');
    const db = client.db();
    const users = db.collection('users');
    const wallets = db.collection('wallets');
    const withdrawals = db.collection('withdrawals');
    const plans = db.collection('plans');

    // 1. Ensure Diamond Plan exists
    let plan = await plans.findOne({ name: 'Diamond' });
    if (!plan) {
      const planRes = await plans.insertOne({
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
        color: '#ff00ff',
        createdAt: new Date(),
        updatedAt: new Date()
      });
      plan = { _id: planRes.insertedId };
    }

    // 2. Prepare Users: Find and Cleanup OLD users first
    const oldUsers = await users.find({ phone: { $in: ['9999999999', '8888888888'] } }).toArray();
    const oldUserIds = oldUsers.map(u => u._id);

    if (oldUserIds.length > 0) {
        console.log(`🧹 Cleaning up data for ${oldUserIds.length} old test users...`);
        await wallets.deleteMany({ user: { $in: oldUserIds } });
        await withdrawals.deleteMany({ user: { $in: oldUserIds } });
        await db.collection('paymentmatches').deleteMany({ 
            $or: [
                { subscriber: { $in: oldUserIds } },
                { withdrawer: { $in: oldUserIds } }
            ]
        });
        await users.deleteMany({ _id: { $in: oldUserIds } });
    }
    
    const hashedPassword = await bcrypt.hash('password123', 12);

    // 3. Create John
    const johnRes = await users.insertOne({
      fullName: 'John Withdrawer',
      email: 'john@test.com',
      password: hashedPassword,
      phone: '9999999999',
      role: 'user',
      isPhoneVerified: true,
      isKYCVerified: true,
      referralCode: 'GMJOHN' + Math.floor(1000 + Math.random() * 9000),
      paymentMethods: [{
        type: 'upi',
        upiId: 'john@ybl',
        isPrimary: true,
        isVerified: true
      }],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    const johnId = johnRes.insertedId;

    // Create John's Wallet
    await wallets.deleteMany({ user: johnId });
    await wallets.insertOne({
      user: johnId,
      cashBalance: 10000,
      pointsBalance: 0,
      goldBalance: 0,
      totalPointsEarned: 0,
      totalGoldEarned: 0,
      totalCashEarned: 0,
      totalInvestment: 0,
      pendingWithdrawal: 4999,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Create John's Withdrawal
    await withdrawals.deleteMany({ user: johnId });
    await withdrawals.insertOne({
      user: johnId,
      amount: 4999,
      status: 'approved',
      paymentMethod: {
        type: 'upi',
        upiId: 'john@ybl'
      },
      withdrawalMonth: new Date().toISOString().slice(0, 7),
      scheduledDate: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // 4. Create Alice
    await users.insertOne({
      fullName: 'Alice Subscriber',
      email: 'alice@test.com',
      password: hashedPassword,
      phone: '8888888888',
      role: 'user',
      isPhoneVerified: true,
      isKYCVerified: true,
      referralCode: 'GMALICE' + Math.floor(1000 + Math.random() * 9000),
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    console.log('✨ P2P Test Data seeded successfully via Native Driver!');
    console.log('Credentials: password123');

  } catch (error) {
    console.error('❌ Seeding failed:', error);
  } finally {
    await client.close();
  }
}

seed();
