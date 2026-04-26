export const runtime = 'edge';
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { requireAuth } from '@/lib/auth';
import MiningSession from '@/models/MiningSession';
import Subscription from '@/models/Subscription';
import Plan from '@/models/Plan';
import Wallet from '@/models/Wallet';
import { handleApiError } from '@/lib/api-error';

export async function GET(request) {
  try {
    const user = await requireAuth();
    await connectDB();

    // Active session
    const activeSession = await MiningSession.findOne({
      user: user._id,
      status: 'active',
    }).sort({ createdAt: -1 }).lean();

    // Today's sessions & earnings
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const [todaySessionsCount, todaySessions] = await Promise.all([
      MiningSession.countDocuments({
        user: user._id,
        createdAt: { $gte: startOfToday },
      }),
      MiningSession.find({
        user: user._id,
        status: 'claimed',
        claimedAt: { $gte: startOfToday },
      }).lean()
    ]);

    const todayEarnings = todaySessions.reduce((sum, s) => sum + s.valueEarned, 0);

    // Active subscription
    const subscription = await Subscription.findOne({
      user: user._id,
      status: 'active',
      endDate: { $gt: new Date() },
    })
    .populate('plan')
    .lean();

    // Calculate accurate remaining potential
    // Calculate accurate remaining potential
    const planMax = subscription ? (subscription.amountPaid || subscription.plan?.price) * 2 : 0;
    const currentEarned = subscription?.totalValueEarned || 0;
    const remainingToCap = Math.max(0, planMax - currentEarned);
    
    // Calculate daily breakdown
    const totalDays = subscription?.plan?.duration || 30;
    const amountPaid = subscription?.amountPaid || 0;
    const dailyPrincipalReturn = amountPaid / totalDays;
    const dailyProfitPart = amountPaid / totalDays; // For 2X total
    const netDailyMining = dailyPrincipalReturn + dailyProfitPart;
    
    const startDate = subscription?.startDate ? new Date(subscription.startDate) : new Date();
    const daysElapsed = Math.floor((new Date() - startDate) / (1000 * 60 * 60 * 24));

    // Get current wallet maturity status
    const wallet = await Wallet.findOne({ user: user._id }).select('pendingMaturityValue lastMaturityReleaseAt createdAt').lean();

    // Dynamic Quota Logic (Carry-over & Fractional support)
    const dailyFrequency = subscription?.plan?.dailySessionLimit || 1;
    const totalAllowedToDate = Math.ceil((daysElapsed + 1) * dailyFrequency);
    const sessionsCompleted = subscription?.sessionsCompleted || 0;
    
    // Hard daily check
    const sessionsDoneToday = await MiningSession.countDocuments({
      user: user._id,
      createdAt: { $gte: startOfToday },
    });
    
    const isSessionAvailable = (sessionsCompleted < totalAllowedToDate) && 
                               (dailyFrequency < 1 || sessionsDoneToday < Math.ceil(dailyFrequency));

    return NextResponse.json({
      activeSession,
      todayEarnings,
      remainingToCap,
      sessionsToday: sessionsDoneToday,
      dailySessionLimit: Math.ceil(dailyFrequency),
      totalSessionsLimit: subscription?.totalSessionsExpected || 30,
      sessionsCompleted,
      isSessionAvailable,
      totalAllowedToDate,
      daysUntilNextSession: isSessionAvailable ? 0 : Math.max(1, Math.ceil((sessionsCompleted + 1) / dailyFrequency) - (daysElapsed + 1)),
      maxSessionMinutes: subscription?.plan?.maxSessionMinutes || 1440,
      maturity: {
        pendingValue: wallet?.pendingMaturityValue || 0,
        lastReleaseAt: wallet?.lastMaturityReleaseAt || wallet?.createdAt,
      },
      subscription: subscription ? {
        planName: subscription.plan?.name,
        miningRate: subscription.plan?.miningRate,
        daysRemaining: subscription.daysRemaining,
        endDate: subscription.endDate,
        amountPaid: subscription.amountPaid,
        totalValueEarned: subscription.totalValueEarned, // Tracked progress
        dailyPrincipalReturn,
        dailyProfitPart,
        netDailyMining,
        totalDays,
        daysElapsed: Math.max(0, daysElapsed),
        sessionsCompleted: subscription.sessionsCompleted || 0,
        totalSessionsExpected: subscription.totalSessionsExpected || 30
      } : null,
      hasActivePlan: !!subscription,
    });
  } catch (error) {
    return handleApiError(error, 'Mining status error');
  }
}