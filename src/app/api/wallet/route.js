export const runtime = 'edge';
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { requireAuth } from '@/lib/auth';
import Wallet from '@/models/Wallet';

export async function GET(request) {
  try {
    const user = await requireAuth();
    await connectDB();

    let wallet = await Wallet.findOne({ user: user._id });

    // Create wallet if doesn't exist
    if (!wallet) {
      wallet = await Wallet.create({ user: user._id });
    }

    return NextResponse.json({ wallet });
  } catch (error) {
    return NextResponse.json(
      { message: error.message || 'Internal server error' },
      { status: error.message === 'Unauthorized' ? 401 : 500 }
    );
  }
}