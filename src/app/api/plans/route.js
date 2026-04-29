import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Plan from '@/models/Plan';
import { handleApiError } from '@/lib/api-error';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    console.log('--- GET /api/plans started ---');
    
    console.log('DEBUG: Connecting to DB...');
    await connectDB();
    console.log('DEBUG: DB connected successfully');

    console.log('DEBUG: Querying Plans...');
    const plans = await Plan.find({ isActive: true }).sort({ sortOrder: 1, price: 1 });
    console.log(`DEBUG: Successfully fetched ${plans?.length} plans`);

    return NextResponse.json({ plans });
  } catch (error) {
    console.error('CRITICAL: Fetch plans API failure:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    return handleApiError(error, 'Fetch plans error');
  }
}