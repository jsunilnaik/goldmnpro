import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Plan from '@/models/Plan';

export async function GET(request) {
  try {
    await connectDB();

    const plans = await Plan.find({ isActive: true }).sort({ sortOrder: 1, price: 1 });

    return NextResponse.json({ plans });
  } catch (error) {
    console.error('Fetch plans error:', error);
    return NextResponse.json(
      { message: 'Failed to fetch plans' },
      { status: 500 }
    );
  }
}