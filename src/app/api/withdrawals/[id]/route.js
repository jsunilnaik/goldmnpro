import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { requireAuth } from '@/lib/auth';
import Withdrawal from '@/models/Withdrawal';

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const user = await requireAuth();
    await connectDB();

    const withdrawal = await Withdrawal.findOne({
      _id: id,
      user: user._id,
    });

    if (!withdrawal) {
      return NextResponse.json(
        { message: 'Withdrawal not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ withdrawal });
  } catch (error) {
    return NextResponse.json(
      { message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// Cancel withdrawal
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const user = await requireAuth();
    await connectDB();

    const withdrawal = await Withdrawal.findOne({
      _id: id,
      user: user._id,
      status: 'pending',
    });

    if (!withdrawal) {
      return NextResponse.json(
        { message: 'Withdrawal not found or cannot be cancelled' },
        { status: 404 }
      );
    }

    // Refund to wallet
    const Wallet = (await import('@/models/Wallet')).default;
    await Wallet.findOneAndUpdate(
      { user: user._id },
      {
        $inc: {
          cashBalance: withdrawal.amount,
          pendingWithdrawal: -withdrawal.amount,
        },
      }
    );

    withdrawal.status = 'cancelled';
    await withdrawal.save();

    // Update transaction
    const Transaction = (await import('@/models/Transaction')).default;
    await Transaction.findOneAndUpdate(
      { referenceId: withdrawal._id.toString(), type: 'withdrawal' },
      { status: 'cancelled' }
    );

    return NextResponse.json({ message: 'Withdrawal cancelled and amount refunded' });
  } catch (error) {
    return NextResponse.json(
      { message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}