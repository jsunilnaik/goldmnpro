export const runtime = 'edge';
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { requireAdmin } from '@/lib/auth';
import User from '@/models/User';
import Subscription from '@/models/Subscription';
import Transaction from '@/models/Transaction';
import Withdrawal from '@/models/Withdrawal';
import MiningSession from '@/models/MiningSession';

export async function GET(request) {
  try {
    await requireAdmin();
    await connectDB();

    const { searchParams } = new URL(request.url);
    const state = searchParams.get('state');
    const city = searchParams.get('city');

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Build user query for filtering
    const userQuery = { role: 'user' };
    if (state) userQuery.state = state;
    if (city) userQuery.city = city;

    // Fetch user IDs for cross-collection filtering if location is set
    let userIds = null;
    if (state || city) {
      const users = await User.find(userQuery).select('_id');
      userIds = users.map(u => u._id);
    }

    // Helper to build collection queries
    const withUserFilter = (baseQuery) => {
      if (userIds) return { ...baseQuery, user: { $in: userIds } };
      return baseQuery;
    };

    const [
      totalUsers,
      newUsersToday,
      activeSubscriptions,
      totalRevenueAgg,
      revenueTodayAgg,
      pendingWithdrawalsCount,
      pendingAmountAgg,
      totalWithdrawnAgg,
      activeMining,
      recentUsers,
      pendingWithdrawals,
    ] = await Promise.all([
      User.countDocuments(userQuery),
      User.countDocuments({ ...userQuery, createdAt: { $gte: today } }),
      Subscription.countDocuments(withUserFilter({ status: 'active', endDate: { $gt: new Date() } })),
      Transaction.aggregate([
        { $match: withUserFilter({ type: 'plan_purchase', status: 'completed' }) },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      Transaction.aggregate([
        { $match: withUserFilter({ type: 'plan_purchase', status: 'completed', createdAt: { $gte: today } }) },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      Withdrawal.countDocuments(withUserFilter({ status: 'pending' })),
      Withdrawal.aggregate([
        { $match: withUserFilter({ status: 'pending' }) },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      Withdrawal.aggregate([
        { $match: withUserFilter({ status: 'completed' }) },
        { $group: { _id: null, total: { $sum: '$netAmount' } } },
      ]),
      MiningSession.countDocuments(withUserFilter({ status: 'active' })),
      User.find(userQuery).sort({ createdAt: -1 }).limit(5).select('fullName email createdAt'),
      Withdrawal.find(withUserFilter({ status: 'pending' }))
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('user', 'fullName email'),
    ]);

    const subscriptionRate = totalUsers > 0
      ? ((activeSubscriptions / totalUsers) * 100).toFixed(1)
      : 0;

    return NextResponse.json({
      stats: {
        totalUsers,
        newUsersToday,
        activeSubscriptions,
        subscriptionRate,
        totalRevenue: totalRevenueAgg[0]?.total || 0,
        revenueToday: revenueTodayAgg[0]?.total || 0,
        pendingWithdrawals: pendingWithdrawalsCount,
        pendingAmount: pendingAmountAgg[0]?.total || 0,
        totalWithdrawn: totalWithdrawnAgg[0]?.total || 0,
        activeMining,
      },
      recentUsers,
      pendingWithdrawals,
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    return NextResponse.json(
      { message: error.message || 'Internal server error' },
      { status: error.message === 'Unauthorized' ? 401 : 500 }
    );
  }
}