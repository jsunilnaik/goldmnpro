export const runtime = 'edge';
import { NextResponse } from 'next/server';
import { db } from '@/lib/atlas';
import { requireAdmin } from '@/lib/auth';

export async function GET(request) {
  try {
    await requireAdmin();
    
    // Fetch all configs
    const configs = await db.find('adminconfigs', {});
    const plans = await db.find('plans', {}, { price: 1 });

    // Format configs into a key-value map for the frontend
    const configMap = {};
    if (Array.isArray(configs)) {
        configs.forEach(c => {
            if (c.key) configMap[c.key] = c.value;
        });
    }

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
    const admin = await requireAdmin();
    const body = await request.json();

    switch (body.action) {
      case 'save_plan': {
        const planData = {
          name: body.name,
          slug: body.slug || body.name.toLowerCase().replace(/\s+/g, '-'),
          price: parseFloat(body.price),
          duration: parseInt(body.duration),
          miningRate: parseFloat(body.miningRate),
          isActive: body.isActive !== false,
          updatedAt: { "$date": new Date().toISOString() }
        };

        if (body.planId) {
          await db.updateOne('plans', { _id: { "$oid": body.planId } }, { "$set": planData });
        } else {
          planData.createdAt = { "$date": new Date().toISOString() };
          await db.insertOne('plans', planData);
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
            return db.updateOne('adminconfigs', 
                { key: dbKey }, 
                { "$set": { value, updatedAt: { "$date": new Date().toISOString() } } },
                true // upsert
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