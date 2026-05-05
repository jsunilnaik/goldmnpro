import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { requireAuth } from '@/lib/auth';
import Plan from '@/models/Plan';
import Subscription from '@/models/Subscription';
import User from '@/models/User';
import PaymentMatch from '@/models/PaymentMatch';
import { sendP2PPaymentAlert } from '@/lib/sms';
import { createNotification } from '@/lib/notifications';

export async function POST(request) {
    try {
        const user = await requireAuth();
        await connectDB();

        const { planId, subscriptionId, utr, screenshot, } = await request.json();

        // ── Validate UTR format ─────────────────────────────────
        // Strip all non-digit chars, then enforce exactly 12 digits.
        const cleanUtr = (utr || '').replace(/\D/g, '').trim();
        if (!cleanUtr || !/^\d{12}$/.test(cleanUtr)) {
            return NextResponse.json(
                { message: 'Please enter a valid 12-digit UTR number' },
                { status: 400 }
            );
        }

        // ── Dual Duplicate UTR Check ────────────────────────────
        // Check BOTH Subscription.utr AND PaymentMatch.proof.utr to prevent
        // a single UTR being re-used across two different payment flows.
        const [existingSubUtr, existingMatchUtr] = await Promise.all([
            Subscription.findOne({ utr: cleanUtr }),
            PaymentMatch.findOne({ 'proof.utr': cleanUtr }),
        ]);

        if (existingSubUtr || existingMatchUtr) {
            return NextResponse.json(
                { message: 'This UTR has already been used. Please submit a fresh payment.' },
                { status: 400 }
            );
        }

        // ── Resolve Subscription ────────────────────────────────
        let subscription;
        if (subscriptionId) {
            subscription = await Subscription.findById(subscriptionId);
        }

        if (!subscription) {
            // Fallback: create one if it doesn't exist (legacy compatibility)
            const plan = await Plan.findById(planId);
            if (!plan) {
                return NextResponse.json({ message: 'Plan not found' }, { status: 404 });
            }
            subscription = await Subscription.create({
                user: user._id,
                plan: planId,
                status: 'pending',
                amountPaid: plan.price,
            });
        }

        // ── P2P Flow: Update matched PaymentMatch records ───────
        const matches = await PaymentMatch.find({ subscription: subscription._id });

        if (matches.length > 0) {
            for (const match of matches) {
                match.status = 'paid';
                match.proof = {
                    utr: cleanUtr,
                    screenshot: screenshot || null,
                    updatedAt: new Date(),
                };
                await match.save();

                // Notify Withdrawer via SMS — include amount and match reference
                try {
                    const withdrawer = await User.findById(match.withdrawer);
                    if (withdrawer?.phone) {
                        await sendP2PPaymentAlert(withdrawer.phone, match.amount);
                    }
                    // In-app notification to withdrawer
                    await createNotification(match.withdrawer, {
                        title: 'Payment Received — Please Confirm ✅',
                        message: `A user has paid ₹${match.amount} to your UPI. Check your bank app and confirm receipt.`,
                        type: 'withdrawal',
                        actionUrl: '/withdraw',
                    });
                } catch (err) {
                    console.error('P2P notify withdrawer error:', err);
                }
            }

            subscription.status = 'pending_verification';
            subscription.utr = cleanUtr;
            subscription.screenshot = screenshot || null;
            await subscription.save();

            return NextResponse.json({
                message: 'Payment proof submitted! Please wait for the recipient to confirm receipt in their bank app.',
                status: 'pending_verification',
                subscription,
            });
        }

        // ── Legacy / Direct Flow (no P2P match — admin reviews) ─
        subscription.utr = cleanUtr;
        subscription.screenshot = screenshot || null;
        subscription.status = 'pending_verification';
        await subscription.save();

        return NextResponse.json({
            message: 'Payment proof submitted! Your subscription will be activated after admin verification.',
            status: 'pending_verification',
            subscription,
        });

    } catch (error) {
        console.error('❌ UTR Submission Error:', error);

        // Mongoose duplicate key (UTR unique index violation)
        if (error.code === 11000) {
            return NextResponse.json(
                { message: 'This UTR has already been used. Please submit a fresh payment.' },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { message: 'Failed to process payment. Please try again.' },
            { status: 500 }
        );
    }
}
