import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { requireAuth } from '@/lib/auth';
import MiningSession from '@/models/MiningSession';
import Wallet from '@/models/Wallet';
import Transaction from '@/models/Transaction';
import Subscription from '@/models/Subscription';
import AdminConfig from '@/models/AdminConfig';
import User from '@/models/User';

export async function POST(request) {
  try {
    const user = await requireAuth();
    await connectDB();

    const { sessionId } = await request.json();
    
    // Look for the specific session, or ANY active session for this user as a fallback
    let query = { user: user._id, status: 'active' };
    if (sessionId) {
      query._id = sessionId;
    }

    const [existingSession, goldPrice, pointsRatio] = await Promise.all([
      MiningSession.findOne(query).lean(),
      AdminConfig.getConfig('gold_price_per_gram', 6000),
      AdminConfig.getConfig('points_to_gold_ratio', 0.00001),
    ]);

    if (!existingSession) {
      // Find ANY session for this user to see if it even exists but is in a different state
      const anySession = await MiningSession.findOne({ user: user._id }).sort({ createdAt: -1 });
      
      return NextResponse.json(
        { 
          message: 'No active mining session found', 
          debug: {
            requestedId: sessionId,
            lastSessionStatus: anySession?.status,
            lastSessionId: anySession?._id
          }
        },
        { status: 404 }
      );
    }

    // 1. Get Wallet to check Mining Balance (the cap)
    const wallet = await Wallet.findOne({ user: user._id });
    if (!wallet) throw new Error('Wallet not found');

    const remainingPotential = wallet.miningBalance || 0;

    // 2. Fetch Subscription and Plan for duration limits
    let subscription = await Subscription.findById(existingSession.subscription).populate('plan');
    
    // Fallback: If the linked subscription is missing, try to find the user's current active plan
    if (!subscription) {
      subscription = await Subscription.findOne({
        user: user._id,
        status: 'active',
        endDate: { $gt: new Date() }
      }).populate('plan');
    }

    if (!subscription) throw new Error('No active subscription found. Please ensure you have an active plan.');
    if (!subscription.plan) throw new Error('Plan details not found. Please contact support.');

    // 2.5 Calculate accurate remaining potential for this specific plan
    const planMax = (subscription.amountPaid || subscription.plan.price) * 2;
    const currentEarned = subscription.totalValueEarned || 0;
    const remainingToCap = Math.max(0, planMax - currentEarned);

    // 3. Calculate earnings
    const now = new Date();
    const actualDurationMs = now - existingSession.startedAt;
    const actualDurationMinutes = Math.floor(actualDurationMs / 60000);
    
    // CAP Duration based on plan
    const maxMinutes = subscription.plan.maxSessionMinutes || 1440; // Default 24h
    const cappedMinutes = Math.min(actualDurationMinutes, maxMinutes);
    const cappedDurationHours = cappedMinutes / 60;

    // 3. APPLY 2X TRIPLE-UNIT REWARD LOGIC
    const investment = (subscription.amountPaid || subscription.plan.price);
    const totalPotential = investment * 2;
    const duration = subscription.plan.duration || 30;
    const expectedSessions = subscription.totalSessionsExpected || subscription.plan.dailySessionLimit || duration;
    
    // Tiered Duration Logic
    const planName = (subscription.plan.name || 'Bronze').toLowerCase();
    const tieredTimes = { diamond: 1, gold: 2, silver: 4, bronze: 8 };
    const maxSessionTime = tieredTimes[planName] || 8;
    const minMiningMinutes = maxSessionTime / 2;

    const fullSessionValue = totalPotential / expectedSessions;
    const sessionCost = investment / expectedSessions;

    let cashEarned = 0;
    let pointsEarned = 0;
    let goldEarned = 0;

    if (cappedMinutes >= minMiningMinutes) {
      // Reward Ratio based on time spent
      const ratio = Math.min(1, cappedMinutes / maxSessionTime);
      
      // Calculate split: 100% Cash Back + 50% extra in Gold + 50% extra in Points
      // This sums to 200% (2X) of the session cost.
      
      const totalSessionReward = fullSessionValue * ratio;
      cashEarned = Math.floor(sessionCost * ratio); // 1:1 Return of investment
      
      const bonusValueINR = totalSessionReward - cashEarned;
      const goldValueINR = bonusValueINR * 0.5;
      const pointsValueINR = bonusValueINR * 0.5;

      // Unit Conversions
      const pointValueINR = goldPrice * pointsRatio; // gram_price * ratio (e.g., 6000 * 0.00001 = 0.06)
      
      goldEarned = goldValueINR / goldPrice;
      pointsEarned = Math.floor(pointsValueINR / pointValueINR);
    }

    const isCapReached = (subscription.sessionsCompleted + 1) >= expectedSessions;

    // 4. Update session
    const session = await MiningSession.findOneAndUpdate(
      { _id: existingSession._id, user: user._id, status: 'active' },
      {
        $set: {
          status: 'claimed',
          endedAt: now,
          pointsEarned,
          goldEarned,
          valueEarned: cashEarned,
          duration: cappedMinutes,
          isClaimed: true,
          claimedAt: now,
          isCapReached,
        },
      },
      { new: true }
    ).lean();

    if (!session) {
      return NextResponse.json(
        { message: 'Session already claimed or not found' },
        { status: 400 }
      );
    }

    // 5. Update wallet (Divert to MATURITY balances)
    // The total INR value (Cash return + Gold bonus value) are added to pendingMaturityValue
    const totalINRValue = cashEarned + (goldEarned * goldPrice);

    const updatedWallet = await Wallet.findOneAndUpdate(
      { user: user._id },
      {
        $inc: {
          pointsBalance: pointsEarned,
          // goldBalance: goldEarned, // REMOVED: Gold is now reserved as value
          // cashBalance: cashEarned, // REMOVED: Cash is now reserved
          pendingMaturityValue: totalINRValue, // THE NEW GOLD RESERVE
          miningBalance: -cashEarned, // Still DEDUCT from potential immediately
          totalPointsEarned: pointsEarned,
          totalGoldEarned: goldEarned,
          totalCashEarned: cashEarned, 
        },
        lastMiningCreditAt: now,
      },
      { new: true }
    );

    // 6. Update subscription stats
    const subUpdate = {
      $inc: {
        totalPointsMined: pointsEarned,
        totalGoldEarned: goldEarned,
        totalValueEarned: cashEarned,
        sessionsCompleted: 1,
      },
    };

    if (isCapReached) {
        subUpdate.$set = { 
            status: 'exhausted',
        };
    }

    await Subscription.findByIdAndUpdate(session.subscription, subUpdate);

    // Record transaction
    await Transaction.create({
      user: user._id,
      type: 'mining_reward',
      category: 'credit',
      amount: cashEarned,
      points: pointsEarned,
      gold: goldEarned,
      status: 'completed',
      description: `Mining Reward - Session ${(subscription.sessionsCompleted || 0) + 1}`,
      referenceId: session._id.toString(),
      referenceType: 'mining',
      balanceAfter: {
        points: updatedWallet.pointsBalance,
        gold: updatedWallet.goldBalance,
        cash: updatedWallet.cashBalance,
      },
    });

    return NextResponse.json({
      message: cashEarned > 0 ? 'Mining reward claimed successfully!' : `Mining stopped. Min ${minMiningMinutes}m required for cash rewards.`,
      pointsClaimed: pointsEarned,
      goldClaimed: goldEarned,
      cashClaimed: cashEarned,
      duration: session.duration,
      wallet: {
        pointsBalance: updatedWallet.pointsBalance,
        goldBalance: updatedWallet.goldBalance,
        cashBalance: updatedWallet.cashBalance,
      },
    });
  } catch (error) {
    console.error('Claim error:', error);
    return NextResponse.json(
      { message: 'Failed to claim rewards: ' + error.message, error: error.stack },
      { status: 500 }
    );
  }
}