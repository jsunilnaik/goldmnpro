import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { requireAdmin } from '@/lib/auth';
import Treasury from '@/models/Treasury';
import AdminConfig from '@/models/AdminConfig';
import { getPoolHealth, pauseWithdrawals, resumeWithdrawals } from '@/lib/treasury';

export async function GET(request) {
  try {
    await requireAdmin();
    await connectDB();

    const stats = await getPoolHealth();
    const configs = await AdminConfig.getAllConfigs();

    return NextResponse.json({
      stats,
      configs: {
        reserveRatio: parseInt(configs.treasury_reserve_ratio || '20'),
        dailyCap: parseInt(configs.daily_payout_cap || '5000000'),
        cooldownDays: parseInt(configs.withdrawal_cooldown_days || '7'),
        maxVelocity: parseInt(configs.max_withdrawal_percent_of_earnings || '80'),
      }
    });

  } catch (error) {
    console.error('Treasury API Error:', error);
    return NextResponse.json(
      { message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const admin = await requireAdmin();
    await connectDB();

    const { action, reason } = await request.json();

    let result;
    if (action === 'pause') {
      result = await pauseWithdrawals(admin.email, reason);
    } else if (action === 'resume') {
      result = await resumeWithdrawals();
    } else {
      return NextResponse.json({ message: 'Invalid action' }, { status: 400 });
    }

    return NextResponse.json({
      message: `Withdrawals naturally ${action}d successfully`,
      isWithdrawalPaused: result.isWithdrawalPaused,
      pauseReason: result.pauseReason,
    });
    
  } catch (error) {
    console.error('Treasury Toggle Error:', error);
    return NextResponse.json(
      { message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
