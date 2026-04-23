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

    let broadcasts = await Broadcast.find(query)
      .sort({ createdAt: -1 })
      .limit(10); // Fetch a few more to allow for filtering

    // Client-side filtering for exclusions/inclusions
    if (user?.state || user?.city) {
      console.log(`DEBUG: Filtering broadcasts for User [${user.city}, ${user.state}]`);
      broadcasts = broadcasts.filter(b => {
        console.log(`DEBUG: Checking Broadcast [${b.title}]`);
        
        // Inclusion takes absolute priority (Exceptions)
        if (user.city && b.includedCities?.includes(user.city)) {
          console.log(`DEBUG: --> INCLUDED by city exception [${user.city}]`);
          return true;
        }

        // Otherwise check exclusions
        if (user.state && b.excludedStates?.includes(user.state)) {
          console.log(`DEBUG: --> EXCLUDED by state [${user.state}]`);
          return false;
        }
        if (user.city && b.excludedCities?.includes(user.city)) {
          console.log(`DEBUG: --> EXCLUDED by city [${user.city}]`);
          return false;
        }
        
        console.log(`DEBUG: --> ALLOWED (No exclusions matched)`);
        return true;
      });
    } else {
      console.log(`DEBUG: User has no city/state defined. Skipping regional filters.`);
    }

    // Limit back to 5 after filtering
    broadcasts = broadcasts.slice(0, 5);

    return NextResponse.json({ broadcasts });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
