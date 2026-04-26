export const runtime = 'edge';
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { requireAuth } from '@/lib/auth';
import Subscription from '@/models/Subscription';
import MiningSession from '@/models/MiningSession';
import Plan from '@/models/Plan';
import Wallet from '@/models/Wallet';
import { handleApiError } from '@/lib/api-error';
import { createNotification } from '@/lib/notifications';

export async function POST(request) {
  try {
    const user = await requireAuth();
    // connectDB is already called in requireAuth()

    // Check for active subscription - PRIORITIZE the currentPlan linked to user
    let subscription;
    if (user.currentPlan) {
      subscription = await Subscription.findOne({
        _id: user.currentPlan,
        status: 'active',
        endDate: { $gt: new Date() },
      }).populate('plan');
    }

    // Fallback search if currentPlan reference is missing but an active subscription exists
    if (!subscription) {
      subscription = await Subscription.findOne({
        user: user._id,
        status: 'active',
        endDate: { $gt: new Date() },
      }).populate('plan');
    }

    if (!subscription) {
      return NextResponse.json(
        { message: 'No active plan. Please subscribe first.' },
        { status: 403 }
      );
    }

    // 2X Cap Check (Resurrection Logic)
    const maxPotential = (subscription.amountPaid || subscription.plan.price) * 2;
    if (subscription.totalValueEarned >= maxPotential) {
       // Optional: Mark subscription as exhausted if not already
       if (subscription.status !== 'exhausted') {
         subscription.status = 'exhausted';
         await subscription.save();
       }
       return NextResponse.json(
         { message: 'Plan earning potential exhausted (Reached 2X). Please resurrect your plan to continue.' },
         { status: 403 }
       );
    }

    // Check for existing active session
    const existingSession = await MiningSession.findOne({
      user: user._id,
      status: 'active',
    });

    if (existingSession) {
      return NextResponse.json(
        { message: 'Mining session already active. Claim rewards first.' },
        { status: 400 }
      );
    }

    // Check dynamic session quota (Allows for fractional limits like 10 sessions / 30 days)
    const startDate = new Date(subscription.startDate || subscription.createdAt);
    const daysElapsed = Math.floor((new Date() - startDate) / (1000 * 60 * 60 * 24));
    const dailyFrequency = subscription.plan.dailySessionLimit || 1;
    
    // Total sessions allowed up to today (including carry-over)
    const totalAllowedToDate = Math.ceil((daysElapsed + 1) * dailyFrequency);
    const sessionsCompleted = subscription.sessionsCompleted || 0;

    if (sessionsCompleted >= totalAllowedToDate) {
      return NextResponse.json(
        { 
          message: `Your current quota is exhausted. Based on your plan frequency, your next session will be available later.`,
          sessionsCompleted,
          totalAllowedToDate,
          daysElapsed
        },
        { status: 403 }
      );
    }

    // Also check hard daily cap (if dailyFrequency > 1, allow multiple today)
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const sessionsDoneToday = await MiningSession.countDocuments({
      user: user._id,
      createdAt: { $gte: startOfToday },
    });

    if (dailyFrequency >= 1 && sessionsDoneToday >= Math.ceil(dailyFrequency)) {
        return NextResponse.json(
            { message: `Daily mining quota reached (${sessionsDoneToday}/${Math.ceil(dailyFrequency)}). Please return tomorrow!` },
            { status: 403 }
        );
    }

    // Calculate session cost (Gradual Spending - Now 1 session/day)
    const duration = subscription.plan.duration || 30;
    // TREAT dailySessionLimit as TOTAL SESSIONS for the plan duration
    const expectedSessions = subscription.totalSessionsExpected || subscription.plan.dailySessionLimit || duration;
    
    // Ensure subscription has the expected session count stored accurately
    if (!subscription.totalSessionsExpected || subscription.totalSessionsExpected !== expectedSessions) {
      await Subscription.findByIdAndUpdate(subscription._id, { totalSessionsExpected: expectedSessions });
    }

    const sessionCost = Math.floor(subscription.amountPaid / expectedSessions);

    // 1. Deduct cost from wallet
    const wallet = await Wallet.findOne({ user: user._id });
    if (!wallet || wallet.cashBalance < sessionCost) {
      return NextResponse.json(
        { message: 'Insufficient balance to start mining. Plan requires ₹' + sessionCost + ' per session.' },
        { status: 400 }
      );
    }

    await Wallet.findOneAndUpdate(
      { user: user._id },
      { $inc: { cashBalance: -sessionCost } }
    );

    // Create new mining session
    const session = await MiningSession.create({
      user: user._id,
      subscription: subscription._id,
      miningRate: subscription.plan.miningRate,
      status: 'active',
      startedAt: new Date(),
    });

    // Fire and forget notification (Optional)
    /*
    createNotification(user._id, {
      title: 'Mining Session Started',
      message: `Allocated ₹${sessionCost} from your investment for this session.`,
      type: 'mining'
    });
    */

    return NextResponse.json({
      message: 'Mining started',
      session,
    });
  } catch (error) {
    console.error('Start mining error:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to start mining' },
      { status: 500 }
    );
  }
}