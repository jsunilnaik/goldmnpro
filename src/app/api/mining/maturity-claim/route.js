import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { requireAuth } from '@/lib/auth';
import Wallet from '@/models/Wallet';
import Transaction from '@/models/Transaction';

/**
 * POST: Claim matured gold reserves
 * Releases pendingMaturityValue into cashBalance if 7 days have passed.
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

    // --- 7 DAY CHECK ---
    const MATURITY_PERIOD_SECONDS = 7 * 24 * 60 * 60; // 7 days
    const lastRelease = wallet.lastMaturityReleaseAt || wallet.createdAt;
    const now = new Date();
    
    // For testing/development verification, you might reduce this to 60 seconds
    const secondsSinceLastRelease = Math.floor((now - lastRelease) / 1000);
    const secondsRemaining = MATURITY_PERIOD_SECONDS - secondsSinceLastRelease;

    if (secondsRemaining > 0) {
      const days = Math.floor(secondsRemaining / 86400);
      const hours = Math.floor((secondsRemaining % 86400) / 3600);
      const minutes = Math.floor((secondsRemaining % 3600) / 60);
      
      return NextResponse.json({ 
        message: `Reserve is still maturing. Please wait ${days}d ${hours}h ${minutes}m.`,
        remainingSeconds: secondsRemaining
      }, { status: 403 });
    }

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
      description: 'Released 7-day Gold Reserves to wallet',
      balanceAfter: {
        points: updatedWallet.pointsBalance,
        gold: updatedWallet.goldBalance,
        cash: updatedWallet.cashBalance,
      },
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
