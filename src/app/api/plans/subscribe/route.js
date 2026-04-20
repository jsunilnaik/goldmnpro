import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { requireAuth } from '@/lib/auth';
import Plan from '@/models/Plan';
import Subscription from '@/models/Subscription';

export async function GET(request) {
  try {
    const user = await requireAuth();
    await connectDB();

    const subscription = await Subscription.findOne({
      user: user._id,
      status: 'active',
      endDate: { $gt: new Date() },
    }).populate('plan');

    return NextResponse.json({
      hasActiveSubscription: !!subscription,
      subscription,
    });
  } catch (error) {
    return NextResponse.json(
      { message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}