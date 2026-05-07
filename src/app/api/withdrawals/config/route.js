import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { requireAuth } from '@/lib/auth';
import AdminConfig from '@/models/AdminConfig';
import User from '@/models/User';

export async function GET() {
  try {
    const authUser = await requireAuth();
    await connectDB();

    const configs = await AdminConfig.getAllConfigs();
    const user = await User.findById(authUser._id).select('withdrawalSettings').lean();

    const windows = configs.withdrawal_windows || [];
    const now = new Date();
    
    // Check if any window is active
    let activeWindow = null;
    if (windows.length > 0) {
      activeWindow = windows.find(w => {
        const start = new Date(w.startTime);
        const end = new Date(w.endTime);
        return now >= start && now <= end;
      });
    }

    const isInstantGlobal = String(configs.instant_withdrawal_active).toLowerCase() === 'true' || configs.instant_withdrawal_active === true;
    const isInstantUser = user?.withdrawalSettings?.instantEnabled || false;
    const isInstant = isInstantGlobal || isInstantUser;

    return NextResponse.json({
      isWithdrawalOpen: !!activeWindow || isInstant,
      activeWindow,
      windows,
      isInstant,
      instantFee: parseInt(configs.instant_withdrawal_fee || '0'),
      standardFee: parseInt(configs.processing_fee || '10'),
      tdsPercentage: parseInt(configs.tds_percentage || '30'),
      minWithdrawal: parseInt(configs.min_withdrawal_amount || '500'),
      maxWithdrawal: parseInt(configs.max_withdrawal_amount || '500000'),
      cooldownDays: parseInt(configs.withdrawal_cooldown_days || '7')
    });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
