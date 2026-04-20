import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Wallet from '@/models/Wallet';
import Withdrawal from '@/models/Withdrawal';
import Plan from '@/models/Plan';
import Transaction from '@/models/Transaction';
import mongoose from 'mongoose';

export async function GET(request) {
  if (process.env.NODE_ENV !== 'development' && !process.env.NEXT_PUBLIC_DEV_MODE) {
    return NextResponse.json({ message: 'Only available in dev mode' }, { status: 403 });
  }

  try {
    await connectDB();

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

    // 2. Clear previous test data to keep it clean
    await User.deleteMany({ phone: { $in: ['9999999999', '8888888888'] } });
    
    // 3. Create Withdrawer User
    const withdrawer = await User.create({
      fullName: 'John Withdrawer',
      email: 'john@test.com',
      password: 'password123',
      phone: '9999999999',
      role: 'user',
      isPhoneVerified: true,
      isKYCVerified: true,
      paymentMethods: [{
        type: 'upi',
        upiId: 'john@ybl',
        isPrimary: true,
        isVerified: true
      }]
    });

    // Setup Withdrawer Wallet
    await Wallet.create({
      user: withdrawer._id,
      cashBalance: 10000,
      pointsBalance: 0,
      goldBalance: 0,
      totalInvestment: 0,
      pendingWithdrawal: 4999
    });

    // Create Approved Withdrawal
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
      password: 'password123',
      phone: '8888888888',
      role: 'user',
      isPhoneVerified: true,
      isKYCVerified: true
    });

    return NextResponse.json({
      message: 'Test data seeded successfully!',
      instructions: [
        'Login as Alice (alice@test.com / password123) to start a subscription',
        'Login as John (john@test.com / password123) to check balances',
        'John has an APPROVED withdrawal of ₹4999 waiting to be matched'
      ],
      details: {
        withdrawerId: withdrawer._id,
        subscriberId: subscriber._id,
        planId: plan._id,
        withdrawalId: withdrawal._id
      }
    });

  } catch (error) {
    console.error('Seeding error:', error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
