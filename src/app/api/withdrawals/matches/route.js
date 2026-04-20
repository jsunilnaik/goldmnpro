import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { requireAuth } from '@/lib/auth';
import PaymentMatch from '@/models/PaymentMatch';

export async function GET(request) {
  try {
    const user = await requireAuth();
    await connectDB();

    const matches = await PaymentMatch.find({
      withdrawer: user._id,
      status: { $in: ['matched', 'paid'] }
    })
    .populate({
        path: 'subscriber',
        select: 'fullName'
    })
    .sort({ createdAt: -1 });

    return NextResponse.json({ matches });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
