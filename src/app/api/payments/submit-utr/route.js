export const runtime = 'edge';
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { requireAuth } from '@/lib/auth';
import Plan from '@/models/Plan';
import Subscription from '@/models/Subscription';
import User from '@/models/User';
import Transaction from '@/models/Transaction';
import Wallet from '@/models/Wallet';
import PaymentMatch from '@/models/PaymentMatch';
import { sendP2PPaymentAlert } from '@/lib/sms';
import AdminConfig from '@/models/AdminConfig';
import { recordInflow, recordReferralOutflow } from '@/lib/treasury';
import { activateSubscription } from '@/lib/subscriptions';
import { createNotification } from '@/lib/notifications';

export async function POST(request) {
    try {
        const user = await requireAuth();
        await connectDB();

        const { planId, subscriptionId, utr, screenshot, matches: matchProofs } = await request.json();

        // Validate UTR — must be exactly 12 digits
        if (!utr || !/^\d{12}$/.test(utr.trim())) {
            return NextResponse.json(
                { message: 'Please enter a valid 12-digit UTR number' },
                { status: 400 }
            );
        }

        const cleanUtr = utr.trim();

        // Check for duplicate UTR
        const existingUtr = await Subscription.findOne({ utr: cleanUtr });
        if (existingUtr) {
            return NextResponse.json(
                { message: 'This UTR has already been used.' },
                { status: 400 }
            );
        }

        let subscription;
        if (subscriptionId) {
            subscription = await Subscription.findById(subscriptionId);
        }

        if (!subscription) {
            // Fallback: create one if it doesn't exist (Legacy compatibility)
            const plan = await Plan.findById(planId);
            subscription = await Subscription.create({
                user: user._id,
                plan: planId,
                status: 'pending',
                amountPaid: plan.price,
            });
        }

        // Update matches status
        const PaymentMatch = (await import('@/models/PaymentMatch')).default;
        const matches = await PaymentMatch.find({ subscription: subscription._id });

        if (matches.length > 0) {
            // P2P Flow
            for (const match of matches) {
                match.status = 'paid';
                match.proof = { 
                    utr: cleanUtr, 
                    screenshot: screenshot || null,
                    updatedAt: new Date() 
                };
                await match.save();

                // Notify Withdrawer
                try {
                    const withdrawer = await User.findById(match.withdrawer);
                    if (withdrawer?.phone) {
                        await sendP2PPaymentAlert(withdrawer.phone, match.amount);
                    }
                } catch (err) {
                    console.error('P2P SMS Alert error:', err);
                }
            }

            subscription.status = 'pending_verification';
            subscription.utr = cleanUtr;
            subscription.screenshot = screenshot || null;
            await subscription.save();

            return NextResponse.json({
                message: 'Payment proof submitted! Please wait for the recipients to confirm the funds in their bank.',
                status: 'pending_verification',
                subscription,
            });
        }

        // Legacy/Direct Flow (Admin)
        subscription.utr = cleanUtr;
        subscription.screenshot = screenshot || null;
        await subscription.save();
        
        // Always set to pending_verification - manual admin approval required as per requirements
        subscription.status = 'pending_verification';
        await subscription.save();

        return NextResponse.json({
            message: 'Payment proof submitted! Your subscription will be activated after admin verification.',
            status: 'pending_verification',
            subscription,
        });

    } catch (error) {
        console.error('❌ UTR Submission Error:', error);

        // Handle duplicate key error for UTR
        if (error.code === 11000) {
            return NextResponse.json(
                { message: 'This UTR has already been used.' },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { message: 'Failed to process payment. Please try again.' },
            { status: 500 }
        );
    }
}
