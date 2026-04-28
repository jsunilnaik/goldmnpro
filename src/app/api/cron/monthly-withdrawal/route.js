import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Withdrawal from '@/models/Withdrawal';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get('secret');

    if (secret !== process.env.CRON_SECRET) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const today = new Date();
    const withdrawalDate = parseInt(process.env.WITHDRAWAL_DATE || '15');
    const windowEnd = withdrawalDate + 3;

    // Check if we're past the withdrawal window
    if (today.getDate() > windowEnd) {
      // Auto-reject any pending withdrawals from last window
      const currentMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;

      const expired = await Withdrawal.updateMany(
        {
          status: 'pending',
          withdrawalMonth: currentMonth,
        },
        {
          status: 'rejected',
          rejectionReason: 'Withdrawal window expired - not processed in time',
        }
      );

      return NextResponse.json({
        message: 'Monthly withdrawal cron completed',
        expiredWithdrawals: expired.modifiedCount,
        timestamp: new Date().toISOString(),
      });
    }

    return NextResponse.json({
      message: 'Within withdrawal window - no action needed',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Monthly withdrawal cron error:', error);
    return NextResponse.json(
      { message: 'Cron failed', error: error.message },
      { status: 500 }
    );
  }
}