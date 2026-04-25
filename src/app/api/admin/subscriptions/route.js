import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { requireAdmin } from '@/lib/auth';
import Subscription from '@/models/Subscription';
import Plan from '@/models/Plan';
import User from '@/models/User';
import Transaction from '@/models/Transaction';
import Wallet from '@/models/Wallet';
import { recordInflow } from '@/lib/treasury';
import { activateSubscription } from '@/lib/subscriptions';

// GET: List subscriptions with filtering
export async function GET(request) {
    try {
        await requireAdmin();
        await connectDB();

        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status') || 'pending_verification';
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const skip = (page - 1) * limit;

        const query = {};
        if (status !== 'all') query.status = status;

        const [subscriptions, total] = await Promise.all([
            Subscription.find(query)
                .populate('user', 'fullName email phone')
                .populate('plan', 'name price duration miningRate')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            Subscription.countDocuments(query),
        ]);

        return NextResponse.json({
            subscriptions,
            totalPages: Math.ceil(total / limit),
            total,
            page,
        });
    } catch (error) {
        console.error('Admin subscriptions list error:', error);
        return NextResponse.json(
            { message: error.message || 'Internal server error' },
            { status: error.message === 'Unauthorized' ? 401 : 500 }
        );
    }
}

// POST: Approve or reject a subscription
export async function POST(request) {
    try {
        await requireAdmin();
        await connectDB();

        const { subscriptionId, action, reason } = await request.json();

        if (!subscriptionId || !action) {
            return NextResponse.json(
                { message: 'Missing subscriptionId or action' },
                { status: 400 }
            );
        }

        const subscription = await Subscription.findById(subscriptionId)
            .populate('plan')
            .populate('user', 'fullName email referredBy');

        if (!subscription) {
            return NextResponse.json(
                { message: 'Subscription not found' },
                { status: 404 }
            );
        }

        // Validation logic based on action
        if (action === 'approve' || action === 'reject') {
            if (subscription.status !== 'pending_verification') {
                return NextResponse.json(
                    { message: `Cannot ${action} a subscription with status "${subscription.status}"` },
                    { status: 400 }
                );
            }
        }

        if (action === 'approve') {
            await activateSubscription(subscriptionId, 'admin');

            return NextResponse.json({
                message: `✅ Subscription approved! The user's plan is now active and wallet balances have been synced.`,
            });
        } else if (action === 'reject') {
            subscription.status = 'rejected';
            subscription.rejectionReason = reason || 'Payment could not be verified';
            await subscription.save();

            return NextResponse.json({
                message: `Subscription rejected for ${subscription.user?.fullName || 'Unknown User'}.`,
                subscription,
            });
        } else if (action === 'cancel') {
            const MiningSession = (await import('@/models/MiningSession')).default;

            // Cancel subscription
            subscription.status = 'cancelled';
            subscription.rejectionReason = reason || 'Subscription cancelled by admin';
            await subscription.save();

            // Clear user's current plan if it's this one
            if (subscription.user) {
                await User.findOneAndUpdate(
                    { _id: subscription.user._id, currentPlan: subscription._id },
                    { $set: { currentPlan: null } }
                );
            }

            // Terminate any active mining sessions for this subscription
            await MiningSession.updateMany(
                { subscription: subscription._id, status: { $in: ['active', 'paused'] } },
                { 
                    $set: { 
                        status: 'completed',
                        endedAt: new Date(),
                        bonusReason: 'Subscription cancelled by admin'
                    } 
                }
            );

            return NextResponse.json({
                message: `❌ Subscription cancelled for ${subscription.user?.fullName || 'Unknown User'}. Their access and any active mining sessions have been revoked.`,
                subscription,
            });
        } else if (action === 'delete') {
            // Check if it's the current plan and clear it first
            await User.findOneAndUpdate(
                { currentPlan: subscription._id },
                { $set: { currentPlan: null } }
            );

            // Delete the subscription record
            await Subscription.findByIdAndDelete(subscriptionId);

            return NextResponse.json({
                message: `🗑️ Subscription for ${subscription.user?.fullName || 'Unknown User'} has been permanently deleted.`,
            });
        } else {
            return NextResponse.json(
                { message: 'Invalid action. Use "approve", "reject", "cancel", or "delete".' },
                { status: 400 }
            );
        }
    } catch (error) {
        console.error('Admin subscription action error:', error);
        return NextResponse.json(
            { message: error.message || 'Internal server error' },
            { status: error.message === 'Unauthorized' ? 401 : 500 }
        );
    }
}

