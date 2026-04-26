export const runtime = 'edge';
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { requireAdmin } from '@/lib/auth';
import User from '@/models/User';
import CityUpiRule from '@/models/CityUpiRule';

/**
 * POST /api/admin/city-upis/bulk-update
 *
 * Round-Robin UPI Distribution Engine
 * ─────────────────────────────────────
 * Given: 20 UPIs in pool, 100 users in the city
 * Result: Each UPI is assigned to exactly 5 users (100 ÷ 20 = 5)
 *
 * Algorithm:
 *   user[0]  → pool[0 % 20] = pool[0]
 *   user[1]  → pool[1 % 20] = pool[1]
 *   ...
 *   user[19] → pool[19 % 20] = pool[19]
 *   user[20] → pool[20 % 20] = pool[0]  ← cycles
 *   user[21] → pool[21 % 20] = pool[1]
 *   ...etc
 */
export async function POST(request) {
  try {
    const admin = await requireAdmin();
    await connectDB();

    const { city } = await request.json();

    if (!city) {
      return NextResponse.json({ message: 'City is required' }, { status: 400 });
    }

    // 1. Get the UPI pool for this city
    const rule = await CityUpiRule.findOne({ city: city.trim(), isActive: true });
    if (!rule || rule.upis.length === 0) {
      return NextResponse.json(
        { message: `No active UPI pool found for "${city}". Create a pool first.` },
        { status: 404 }
      );
    }

    const upiPool = rule.upis;
    const poolSize = upiPool.length;

    // 2. Get all users in this city (sorted by _id for stable order)
    const cityUsers = await User.find({ city: city.trim(), role: 'user' })
      .sort({ _id: 1 })
      .select('_id fullName paymentMethods');

    if (cityUsers.length === 0) {
      return NextResponse.json(
        { message: `No users found in "${city}"` },
        { status: 404 }
      );
    }

    // 3. Track how many users each UPI gets
    const upiAssignments = Object.fromEntries(upiPool.map(upi => [upi, 0]));

    // 4. Build MongoDB bulk operations (efficient single DB roundtrip)
    const bulkOps = cityUsers.map((user, index) => {
      // Round-robin: user #0→pool[0], user #1→pool[1], user #20→pool[0]...
      const assignedUpi = upiPool[index % poolSize];
      upiAssignments[assignedUpi]++;

      // Preserve existing bank accounts, replace only UPI payment methods
      const nonUpiMethods = (user.paymentMethods || []).filter(m => m.type !== 'upi');

      return {
        updateOne: {
          filter: { _id: user._id },
          update: {
            $set: {
              paymentMethods: [
                ...nonUpiMethods,
                {
                  type: 'upi',
                  upiId: assignedUpi,
                  isPrimary: true,
                  isVerified: true,
                  accountHolderName: user.fullName || '',
                }
              ]
            }
          }
        }
      };
    });

    // 5. Execute all updates in one bulk operation
    const result = await User.bulkWrite(bulkOps, { ordered: false });

    // 6. Build per-UPI distribution summary for admin display
    const distribution = upiPool.map((upi, idx) => ({
      slot: idx + 1,
      upi,
      usersAssigned: upiAssignments[upi] || 0,
    }));

    const usersPerUpi = Math.ceil(cityUsers.length / poolSize);

    console.log(`✅ Round-Robin UPI Sync: City=${city}, Pool=${poolSize}, Users=${cityUsers.length}, Modified=${result.modifiedCount}`);

    return NextResponse.json({
      success: true,
      message: `✅ Done! ${poolSize} UPIs distributed across ${cityUsers.length} users in ${city} (≈${usersPerUpi} users per UPI)`,
      stats: {
        city,
        totalUsers: cityUsers.length,
        poolSize,
        usersPerUpi,
        modifiedCount: result.modifiedCount,
      },
      distribution,
    });

  } catch (error) {
    console.error('Bulk UPI Round-Robin Error:', error);
    return NextResponse.json({ message: error.message || 'Internal server error' }, { status: 500 });
  }
}
