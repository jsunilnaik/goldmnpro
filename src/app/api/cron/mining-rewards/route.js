import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import MiningSession from '@/models/MiningSession';
import Wallet from '@/models/Wallet';
import Transaction from '@/models/Transaction';
import Subscription from '@/models/Subscription';

export async function GET(request) {
  try {
    // Verify cron secret
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get('secret');

    if (secret !== process.env.CRON_SECRET) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // Find sessions active for more than 24 hours and auto-claim them
    const maxDuration = 24 * 60 * 60 * 1000; // 24 hours in ms
    const cutoff = new Date(Date.now() - maxDuration);

    const staleSessions = await MiningSession.find({
      status: 'active',
      startedAt: { $lt: cutoff },
    });

    let processed = 0;

    for (const session of staleSessions) {
      const now = new Date();
      const durationMs = now - session.startedAt;
      const durationHours = Math.min(durationMs / (1000 * 60 * 60), 24);
      const pointsEarned = durationHours * session.miningRate * session.bonusMultiplier;
      const goldEarned = pointsEarned * 0.00001;
      const cashValue = goldEarned * 6000;

      session.status = 'claimed';
      session.endedAt = now;
      session.pointsEarned = pointsEarned;
      session.goldEarned = goldEarned;
      session.valueEarned = cashValue;
      session.duration = Math.floor(durationMs / 60000);
      session.isClaimed = true;
      session.claimedAt = now;
      await session.save();

      await Wallet.findOneAndUpdate(
        { user: session.user },
        {
          $inc: {
            pointsBalance: pointsEarned,
            goldBalance: goldEarned,
            cashBalance: cashValue,
            totalPointsEarned: pointsEarned,
            totalGoldEarned: goldEarned,
            totalCashEarned: cashValue,
          },
          lastMiningCreditAt: now,
        }
      );

      await Subscription.findByIdAndUpdate(session.subscription, {
        $inc: {
          totalPointsMined: pointsEarned,
          totalGoldEarned: goldEarned,
          totalValueEarned: cashValue,
        },
      });

      await Transaction.create({
        user: session.user,
        type: 'mining_reward',
        category: 'credit',
        amount: cashValue,
        points: pointsEarned,
        gold: goldEarned,
        status: 'completed',
        description: `Auto-claimed mining reward (${Math.floor(durationHours)}h session)`,
        referenceId: session._id.toString(),
        referenceType: 'mining',
      });

      processed++;
    }

    // Also expire subscriptions
    const expiredSubs = await Subscription.updateMany(
      { status: 'active', endDate: { $lt: new Date() } },
      { status: 'expired' }
    );

    return NextResponse.json({
      message: 'Cron completed',
      sessionsProcessed: processed,
      subscriptionsExpired: expiredSubs.modifiedCount,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Mining rewards cron error:', error);
    return NextResponse.json(
      { message: 'Cron failed', error: error.message },
      { status: 500 }
    );
  }
}