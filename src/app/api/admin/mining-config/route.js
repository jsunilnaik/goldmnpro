import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { requireAdmin } from '@/lib/auth';
import Plan from '@/models/Plan';
import AdminConfig from '@/models/AdminConfig';

export async function GET(request) {
  try {
    await requireAdmin();
    await connectDB();

    const configs = await AdminConfig.getAllConfigs();
    const plans = await Plan.find({}).sort({ price: 1 });

    return NextResponse.json({ configs, plans });
  } catch (error) {
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

    const body = await request.json();

    switch (body.action) {
      case 'save_plan': {
        const planData = {
          name: body.name,
          slug: body.slug || body.name.toLowerCase().replace(/\s+/g, '-'),
          price: parseFloat(body.price),
          originalPrice: body.originalPrice ? parseFloat(body.originalPrice) : null,
          duration: parseInt(body.duration),
          miningRate: parseFloat(body.miningRate),
          goldPerPoint: body.goldPerPoint || 0.00001,
          dailySessionLimit: 1, // CONCEPT: Only one session for all plans
          isActive: body.isActive !== false,
          isPopular: body.isPopular || false,
        };

        if (body.planId) {
          await Plan.findByIdAndUpdate(body.planId, planData);
        } else {
          await Plan.create(planData);
        }
        break;
      }

      case 'save_config': {
        const { key, value } = body;
        if (!key) throw new Error('Key is required');
        await AdminConfig.setConfig(key, value, 'system', admin._id);
        break;
      }

      case 'update_configs': {
        const { configs } = body;
        if (!configs) throw new Error('Configs object is required');

        // Mapping frontend keys to database keys
        const keyMap = {
          goldPricePerGram: 'gold_price_per_gram',
          pointsToGoldRatio: 'points_to_gold_ratio',
          maxMiningSessionHours: 'max_mining_session_hours',
          minWithdrawalAmount: 'min_withdrawal_amount',
          withdrawalDate: 'withdrawal_date',
          withdrawalWindowDays: 'withdrawal_window_days',
          tdsPer: 'tds_percentage',
          processingFee: 'processing_fee',
          referralBonusDefault: 'referral_bonus_default',
          bonusMultiplierActive: 'bonus_multiplier_active',
          bonusMultiplierValue: 'bonus_multiplier_value',
          newSubscriberCooldownDays: 'new_subscriber_cooldown_days'
        };

        const updatePromises = Object.entries(configs).map(([feKey, value]) => {
          const dbKey = keyMap[feKey];
          if (dbKey) {
            // Determine category based on key
            let category = 'system';
            if (dbKey.includes('mining') || dbKey.includes('gold')) category = 'mining';
            else if (dbKey.includes('withdrawal') || dbKey.includes('tds') || dbKey.includes('fee') || dbKey.includes('cooldown')) category = 'withdrawal';
            else if (dbKey.includes('referral')) category = 'referral';
            
            return AdminConfig.setConfig(dbKey, value, category, admin._id);
          }
          return null;
        }).filter(Boolean);

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