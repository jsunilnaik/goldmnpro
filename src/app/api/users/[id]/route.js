import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { requireAuth } from '@/lib/auth';
import User from '@/models/User';
import Wallet from '@/models/Wallet';

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const currentUser = await requireAuth();
    await connectDB();

    // Only allow users to view their own data, or admins to view any
    if (currentUser._id.toString() !== id && currentUser.role !== 'admin') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const user = await User.findById(id)
      .select('-password -otp')
      .populate({
        path: 'currentPlan',
        populate: { path: 'plan' },
      });

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const wallet = await Wallet.findOne({ user: id });

    return NextResponse.json({ user, wallet });
  } catch (error) {
    return NextResponse.json(
      { message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}