import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { requireAuth } from '@/lib/auth';
import User from '@/models/User';

export async function GET(request) {
  try {
    const user = await requireAuth();
    await connectDB();

    const userData = await User.findById(user._id)
      .select('-password -otp')
      .populate({
        path: 'currentPlan',
        populate: { path: 'plan' },
      });

    return NextResponse.json({ user: userData });
  } catch (error) {
    return NextResponse.json(
      { message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}