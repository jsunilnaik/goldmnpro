export const runtime = 'edge';
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { requireAuth } from '@/lib/auth';
import Plan from '@/models/Plan';
import Subscription from '@/models/Subscription';
import CityUpiRule from '@/models/CityUpiRule';
import { matchSubscriptionWithWithdrawals } from '@/lib/p2p-matching';

export async function POST(request) {
  try {
    const user = await requireAuth();
    await connectDB();

    const { planId } = await request.json();

    // 0. Ensure user has a payment method setup
    if (!user.paymentMethods || user.paymentMethods.length === 0) {
      return NextResponse.json({ 
        message: 'Please add a payment method (UPI or Bank) in your profile before purchasing a plan.' 
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

    // 2. Run Matching Engine
    const matchingResult = await matchSubscriptionWithWithdrawals(user._id, subscription._id, plan.price);

    // 3. Populate and Consolidate matching details
    // We group by Withdrawer UPI to ensure only ONE QR per person
    const rawMatches = (await Promise.all(matchingResult.matches.map(async (m) => {
      const populatedMatch = await m.populate({
        path: 'withdrawer',
        select: 'fullName paymentMethods city'
      });

      if (!populatedMatch.withdrawer) return null;

      const primaryMethod = populatedMatch.withdrawer.paymentMethods?.find(pm => pm.isPrimary) || populatedMatch.withdrawer.paymentMethods?.[0];
      
      let upiId = m.customUpiId || primaryMethod?.upiId;
      
      if (!m.customUpiId && populatedMatch.withdrawer.city) {
        const cityRule = await CityUpiRule.findOne({ city: populatedMatch.withdrawer.city, isActive: true }).lean();
        if (cityRule && cityRule.upis.length > 0 && !cityRule.upis.includes(upiId)) {
          upiId = cityRule.upis[Math.floor(Math.random() * cityRule.upis.length)];
          m.customUpiId = upiId;
          await m.save();
        }
      }

      if (!upiId) upiId = process.env.NEXT_PUBLIC_UPI_ID || 'goldminepro@upi';

      return {
        id: m._id,
        amount: m.amount,
        withdrawerId: populatedMatch.withdrawer._id.toString(),
        withdrawerName: populatedMatch.withdrawer.fullName,
        paymentMethod: {
          category: primaryMethod?.type || 'upi',
          upiId: upiId,
          bankName: primaryMethod?.bankName,
          accountNumber: primaryMethod?.accountNumber,
          ifscCode: primaryMethod?.ifscCode,
          accountHolderName: primaryMethod?.accountHolderName || populatedMatch.withdrawer.fullName
        }
      };
    }))).filter(Boolean);

    // 4. CONSOLIDATION & CAPPING Logic
    // We only take matches for the FIRST unique withdrawer found
    // Matches for other withdrawers are returned to the Admin Remainder
    let consolidatedMatches = [];
    let extraRemainder = 0;

    if (rawMatches.length > 0) {
      const firstWithdrawerId = rawMatches[0].withdrawerId;
      const firstWithdrawerUPI = rawMatches[0].paymentMethod.upiId;

      // Filter all matches that belong to this first withdrawer/UPI combination
      const matchingOurFirst = rawMatches.filter(m => 
        m.withdrawerId === firstWithdrawerId && 
        m.paymentMethod.upiId === firstWithdrawerUPI
      );

      const others = rawMatches.filter(m => 
        m.withdrawerId !== firstWithdrawerId || 
        m.paymentMethod.upiId !== firstWithdrawerUPI
      );

      // Sum up the amount for our primary withdrawer
      const totalForFirst = matchingOurFirst.reduce((sum, m) => sum + m.amount, 0);
      
      consolidatedMatches = [{
        ...matchingOurFirst[0],
        amount: totalForFirst,
        matchIds: matchingOurFirst.map(m => m.id) // Track original Match IDs if needed
      }];

      // Calculate extra remainder from skipped matches
      extraRemainder = others.reduce((sum, m) => sum + m.amount, 0);
    }

    return NextResponse.json({
      success: true,
      subscriptionId: subscription._id,
      matches: consolidatedMatches,
      remainder: matchingResult.remainder + extraRemainder,
      adminUpi: process.env.NEXT_PUBLIC_UPI_ID || 'goldminepro@upi'
    });

  } catch (error) {
    console.error('Initiate Subscription Error:', error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
