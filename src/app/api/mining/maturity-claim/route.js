import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { requireAuth } from '@/lib/auth';
import Wallet from '@/models/Wallet';
import Transaction from '@/models/Transaction';

/**
 * POST: Claim matured gold reserves
 * Releases pendingMaturityValue into cashBalance immediately upon user request.
 */
export async function POST(request) {
  try {
    const user = await requireAuth();
    await connectDB();

    const wallet = await Wallet.findOne({ user: user._id });
    if (!wallet) return NextResponse.json({ message: 'Wallet not found' }, { status: 404 });

    const pendingValue = wallet.pendingMaturityValue || 0;
    if (pendingValue <= 0) {
      return NextResponse.json({ message: 'No pending reserves to claim' }, { status: 400 });
    }

    // Release to Wallet is now immediate as per user request
    const now = new Date();

    // --- RELEASE LOGIC (Atomic Update) ---
    const updatedWallet = await Wallet.findOneAndUpdate(
      { user: user._id, pendingMaturityValue: { $gt: 0 } },
      {
        $inc: { 
          cashBalance: pendingValue 
        },
        $set: { 
          pendingMaturityValue: 0,
          lastMaturityReleaseAt: now
        }
      },
      { new: true }
    );

    if (!updatedWallet) {
       return NextResponse.json({ message: 'Maturity claim failed. Maybe already claimed?' }, { status: 500 });
    }

    // Record Transaction
    await Transaction.create({
      user: user._id,
      type: 'maturity_release',
      category: 'credit',
      amount: pendingValue,
      status: 'completed',
      description: 'Released Gold Reserves to wallet',
      balanceAfter: {
        points: updatedWallet.pointsBalance,
        gold: updatedWallet.goldBalance,
        cash: updatedWallet.cashBalance,
      },
      referenceType: 'system',
    });

    return NextResponse.json({
      message: `✅ ₹${pendingValue.toFixed(2)} successfully released to your wallet!`,
      releasedAmount: pendingValue,
      wallet: {
        cashBalance: updatedWallet.cashBalance,
        pendingMaturityValue: updatedWallet.pendingMaturityValue,
      }
    });

  } catch (error) {
    console.error('Maturity claim error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
