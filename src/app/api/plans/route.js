import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Plan from '@/models/Plan';
import { handleApiError } from '@/lib/api-error';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    await connectDB();

    const plans = await Plan.find({ isActive: true }).sort({ sortOrder: 1, price: 1 });

    return NextResponse.json({ plans });
  } catch (error) {
    return handleApiError(error, 'Fetch plans error');
  }
}