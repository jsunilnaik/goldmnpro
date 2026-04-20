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

    // Check daily session limit
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const sessionsToday = await MiningSession.countDocuments({
      user: user._id,
      createdAt: { $gte: startOfToday },
    });

    const limit = 1; // GLOBAL LIMIT: Only one session per day
    if (sessionsToday >= limit) {
      return NextResponse.json(
        { 
          message: `Daily mining quota reached (1/1). Please return tomorrow!`,
          sessionsToday,
          limit
        },
        { status: 403 }
      );
    }

    // Calculate session cost (Gradual Spending - Now 1 session/day)
    const duration = subscription.plan.duration || 30;
    const expectedSessions = subscription.totalSessionsExpected || duration;
    
    // Ensure subscription has the expected session count stored accurately
    if (!subscription.totalSessionsExpected) {
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