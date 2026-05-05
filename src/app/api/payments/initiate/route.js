import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { requireAuth } from '@/lib/auth';
import Plan from '@/models/Plan';
import Subscription from '@/models/Subscription';
import { matchSubscriptionWithWithdrawals } from '@/lib/p2p-matching';

export async function POST(request) {
  try {
    const user = await requireAuth();
    await connectDB();

    const { planId } = await request.json();

    // 0. Ensure user has a payment method setup (required for P2P routing)
    if (!user.paymentMethods || user.paymentMethods.length === 0) {
      return NextResponse.json({
        message: 'Please add a payment method (UPI or Bank) in your profile before purchasing a plan.',
      }, { status: 403 });
    }

    const plan = await Plan.findById(planId);
    if (!plan || !plan.isActive) {
      return NextResponse.json({ message: 'Plan not found' }, { status: 404 });
    }

    // 1. Create a pending subscription
    const subscription = await Subscription.create({
      user: user._id,
      plan: plan._id,
      status: 'pending',
      amountPaid: plan.price,
    });

    // 2. Run the P2P Matching Engine
    //    Strategies: A (exact) → B (partial cover) → C (split ≤2)
    const matchingResult = await matchSubscriptionWithWithdrawals(
      user._id,
      subscription._id,
      plan.price
    );

    // 3. Build the consolidated response
    //    The engine already stores upiIntentUrl on each PaymentMatch.
    //    We populate withdrawer info for display.
    const matches = await Promise.all(
      (matchingResult.matches || []).map(async (m) => {
        await m.populate({ path: 'withdrawer', select: 'fullName paymentMethods city' });

        const withdrawer = m.withdrawer;
        if (!withdrawer) return null;

        const primaryMethod =
          withdrawer.paymentMethods?.find((pm) => pm.isPrimary) ||
          withdrawer.paymentMethods?.[0];

        const upiId =
          m.customUpiId ||
          primaryMethod?.upiId ||
          process.env.NEXT_PUBLIC_UPI_ID ||
          'goldminepro@upi';

        return {
          id: m._id,
          amount: m.amount,
          isExactMatch: m.isExactMatch,
          withdrawerName: withdrawer.fullName || 'GoldMine User',
          withdrawerId: withdrawer._id.toString(),
          // Pre-generated intent URL stored by the matching engine
          upiIntentUrl: m.upiIntentUrl,
          paymentMethod: {
            category: primaryMethod?.type || 'upi',
            upiId,
            bankName: primaryMethod?.bankName,
            accountNumber: primaryMethod?.accountNumber,
            ifscCode: primaryMethod?.ifscCode,
            accountHolderName: primaryMethod?.accountHolderName || withdrawer.fullName,
          },
        };
      })
    );

    // Filter nulls (matches where withdrawer was deleted/missing)
    const validMatches = matches.filter(Boolean);

    return NextResponse.json({
      success: true,
      subscriptionId: subscription._id,
      matches: validMatches,
      remainder: matchingResult.remainder ?? 0,
      adminUpi: process.env.NEXT_PUBLIC_UPI_ID || 'goldminepro@upi',
    });

  } catch (error) {
    console.error('Initiate Subscription Error:', error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
