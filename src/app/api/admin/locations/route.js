export const runtime = 'edge';
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Location from '@/models/Location';
import User from '@/models/User';
import { getAllCities } from '@/lib/india-cities';
import { requireAuth } from '@/lib/auth';

// GET — Fetch all locations (with optional filters)
export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const state = searchParams.get('state') || '';
    const tier = searchParams.get('tier') || '';
    const activeOnly = searchParams.get('active') !== 'false';

    const query = {};
    if (state) query.state = state;
    if (tier) query.tier = parseInt(tier);
    if (activeOnly) query.isActive = true;

    const locations = await Location.find(query)
      .sort({ state: 1, city: 1 })
      .lean();

    // Get distinct values for filters
    const states = await Location.distinct('state', activeOnly ? { isActive: true } : {});

    return NextResponse.json({
      locations,
      states: states.sort(),
      total: locations.length,
    });
  } catch (error) {
    console.error('Locations fetch error:', error);
    return NextResponse.json(
      { message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST — Seed all locations from india-cities data
export async function POST(request) {
  try {
    const user = await requireAuth();
    if (user.role !== 'admin') {
      return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
    }

    await connectDB();
    const { autoRepair = false } = await request.json().catch(() => ({}));

    if (autoRepair) {
      await User.updateMany(
        { $or: [{ city: { $in: [null, ''] } }, { state: { $in: [null, ''] } }] },
        { $set: { city: 'Mumbai', state: 'Maharashtra', tier: 1 } }
      );
    }

    const allCities = getAllCities();
    let created = 0;
    let skipped = 0;

    // Upsert each city
    const bulkOps = allCities.map(city => ({
      updateOne: {
        filter: { city: city.name, state: city.state },
        update: {
          $setOnInsert: {
            city: city.name,
            state: city.state,
            tier: city.tier,
            region: city.region,
            isActive: true,
            userCount: 0,
          },
        },
        upsert: true,
      },
    }));

    const result = await Location.bulkWrite(bulkOps);
    created = result.upsertedCount;
    skipped = allCities.length - created;

    // Identify users with MISSING location data
    const unsetCount = await User.countDocuments({
      $or: [
        { city: { $in: [null, ''] } },
        { state: { $in: [null, ''] } },
      ]
    });

    // Update user counts for each location
    const userCounts = await User.aggregate([
      { $match: { city: { $ne: null }, state: { $ne: null } } },
      { $group: { _id: { city: '$city', state: '$state' }, count: { $sum: 1 } } },
    ]);

    for (const entry of userCounts) {
      await Location.updateOne(
        { city: entry._id.city, state: entry._id.state },
        { $set: { userCount: entry.count } }
      );
    }

    return NextResponse.json({
      message: `Locations seeded: ${created} created, ${skipped} already existed. Identified ${unsetCount} users with missing location data.`,
      created,
      skipped,
      unsetCount,
      totalLocations: await Location.countDocuments(),
    });
  } catch (error) {
    console.error('Location seed error:', error);
    return NextResponse.json(
      { message: error.message || 'Seed failed' },
      { status: 500 }
    );
  }
}

// PATCH — Toggle isActive status for a location
export async function PATCH(request) {
  try {
    const user = await requireAuth();
    if (user.role !== 'admin') {
      return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
    }

    await connectDB();
    const body = await request.json();
    const { id, isActive } = body;

    if (!id) {
      return NextResponse.json({ message: 'Location ID required' }, { status: 400 });
    }

    const location = await Location.findByIdAndUpdate(
      id,
      { isActive: isActive },
      { new: true }
    );

    if (!location) {
      return NextResponse.json({ message: 'Location not found' }, { status: 404 });
    }

    // Bulk block/unblock users in this city (except admins)
    const userUpdateResult = await User.updateMany(
      { city: location.city, state: location.state, role: { $ne: 'admin' } },
      { $set: { isActive: isActive } }
    );

    return NextResponse.json({
      message: `Location ${location.city} is now ${location.isActive ? 'Active' : 'Inactive'}. ${userUpdateResult.modifiedCount} users ${location.isActive ? 'unblocked' : 'blocked'}.`,
      location,
      affectedUsers: userUpdateResult.modifiedCount
    });
  } catch (error) {
    console.error('Location update error:', error);
    return NextResponse.json(
      { message: error.message || 'Update failed' },
      { status: 500 }
    );
  }
}
