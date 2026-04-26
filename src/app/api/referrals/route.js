export const runtime = 'edge';
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { requireAuth } from '@/lib/auth';
import User from '@/models/User';
import Transaction from '@/models/Transaction';
import { getNetworkStats } from '@/lib/referral-engine';
import mongoose from 'mongoose';

export async function GET(request) {
  try {
    const user = await requireAuth();
    await connectDB();

    // 1. Direct referrals (Level 1)
    const directReferrals = await User.find({ referredBy: user._id })
      .select('fullName email createdAt currentPlan referralCount')
      .populate({
        path: 'currentPlan',
        populate: { path: 'plan', select: 'name' },
      })
      .sort({ createdAt: -1 });

    // 2. Network stats (multi-level breakdown)
    const networkStats = await getNetworkStats(new mongoose.Types.ObjectId(user._id));

    // 3. Recent commission transactions (across all levels)
    const recentCommissions = await Transaction.find({
      user: user._id,
      type: 'referral_bonus',
    })
      .sort({ createdAt: -1 })
      .limit(30)
      .lean();

    return NextResponse.json({
      referralCode: user.referralCode,
      directReferrals,
      totalDirectReferrals: directReferrals.length,
      networkStats,
      recentCommissions,
    });
  } catch (error) {
    console.error('Referrals error:', error);
    return NextResponse.json(
      { message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}