export const runtime = 'edge';
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { requireAuth } from '@/lib/auth';
import PaymentMatch from '@/models/PaymentMatch';
import Subscription from '@/models/Subscription';
import Withdrawal from '@/models/Withdrawal';
import User from '@/models/User';
import Wallet from '@/models/Wallet';
import Transaction from '@/models/Transaction';
import Plan from '@/models/Plan';
import { recordInflow } from '@/lib/treasury';
import { createNotification } from '@/lib/notifications';

export async function POST(request) {
  try {
    const user = await requireAuth();
    await connectDB();

    const { matchId } = await request.json();

    const match = await PaymentMatch.findById(matchId);
    if (!match) {
      return NextResponse.json({ message: 'Match not found' }, { status: 404 });
    }

    if (match.withdrawer.toString() !== user._id.toString()) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
    }

    if (match.status === 'confirmed') {
      return NextResponse.json({ message: 'Already confirmed' });
    }

    // 1. Mark match as confirmed
    match.status = 'confirmed';
    await match.save();

    // 1b. Notify Subscriber
    await createNotification(match.subscriber, {
      title: 'Payment Received! ✅',
      message: `The recipient has confirmed receipt of your payment (Match ID: ${match._id.toString().slice(-6)}). Admin will finalize shortly.`,
      type: 'payment',
      actionUrl: '/plans'
    });

    // 2. Settlement logic removed (Migrated to Admin Final Approval)
    // The match is now waiting for Admin to click "Finalize & Activate"
    
    return NextResponse.json({
      success: true,
      message: 'Receipt confirmed! Your request is now waiting for final Admin verification.',
      matchStatus: match.status
    });

  } catch (error) {
    console.error('Confirm Receipt Error:', error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
