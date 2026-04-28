import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import AdminConfig from '@/models/AdminConfig';
import Plan from '@/models/Plan';
import { requireAdmin } from '@/lib/auth';

export async function GET(request) {
  try {
    await connectDB();
    await requireAdmin();
    
    const configs = await AdminConfig.find({});
    const plans = await Plan.find({}).sort({ price: 1 });

    const configMap = {};
    configs.forEach(c => {
        configMap[c.key] = c.value;
    });

    return NextResponse.json({ configs: configMap, plans });
  } catch (error) {
    return NextResponse.json(
      { message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await connectDB();
    await requireAdmin();
    const body = await request.json();

    switch (body.action) {
      case 'save_plan': {
        if (body.planId) {
          await Plan.findByIdAndUpdate(body.planId, {
            name: body.name,
            price: parseFloat(body.price),
            duration: parseInt(body.duration),
            miningRate: parseFloat(body.miningRate),
            isActive: body.isActive !== false
          });
        } else {
          await Plan.create({
            name: body.name,
            price: parseFloat(body.price),
            duration: parseInt(body.duration),
            miningRate: parseFloat(body.miningRate),
            isActive: body.isActive !== false
          });
        }
        break;
      }

      case 'update_configs': {
        const { configs } = body;
        const keyMap = {
          goldPricePerGram: 'gold_price_per_gram',
          pointsToGoldRatio: 'points_to_gold_ratio',
          maxMiningSessionHours: 'max_mining_session_hours',
          minWithdrawalAmount: 'min_withdrawal_amount',
          withdrawalDate: 'withdrawal_date',
          withdrawalWindowDays: 'withdrawal_window_days',
          tdsPer: 'tds_percentage',
          processingFee: 'processing_fee',
          referralBonusDefault: 'referral_bonus_default'
        };

        const updatePromises = Object.entries(configs).map(async ([feKey, value]) => {
          const dbKey = keyMap[feKey];
          if (dbKey) {
            return AdminConfig.findOneAndUpdate(
                { key: dbKey }, 
                { value },
                { upsert: true }
            );
          }
        });

        await Promise.all(updatePromises);
        break;
      }

      default:
        return NextResponse.json({ message: 'Invalid action' }, { status: 400 });
    }

    return NextResponse.json({ message: 'Configuration updated successfully' });
  } catch (error) {
    console.error('Mining config error:', error);
    return NextResponse.json(
      { message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}