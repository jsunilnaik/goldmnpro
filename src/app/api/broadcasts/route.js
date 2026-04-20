import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Broadcast from '@/models/Broadcast';
import User from '@/models/User';
import { requireAuth } from '@/lib/auth';

export async function GET(request) {
  try {
    const sessionUser = await requireAuth();
    await connectDB();

    // Fetch full user profile to get city/state
    const user = await User.findById(sessionUser._id).select('city state');
    
    // Query for relevant active broadcasts
    // Priority: 
    // 1. Matching City
    // 2. Global
    const query = {
      isActive: true,
      $or: [
        { targetType: 'global' },
      ]
    };

    if (user?.city && user?.state) {
      query.$or.push({ 
        targetType: 'city', 
        targetCity: user.city, 
        targetState: user.state 
      });
    }

    const broadcasts = await Broadcast.find(query)
      .sort({ createdAt: -1 })
      .limit(5); // Return a few recent ones, UI will decide priority

    return NextResponse.json({ broadcasts });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
