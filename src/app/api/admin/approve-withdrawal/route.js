export const runtime = 'edge';
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { requireAdmin } from '@/lib/auth';
import Withdrawal from '@/models/Withdrawal';
import Wallet from '@/models/Wallet';
import Transaction from '@/models/Transaction';
import { recordOutflow, releaseFunds } from '@/lib/treasury';
import { createNotification } from '@/lib/notifications';

export async function GET(request) {
  try {
    await requireAdmin();
    await connectDB();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'pending';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const query = {};
    if (status !== 'all') query.status = status;

    const total = await Withdrawal.countDocuments(query);
    const withdrawals = await Withdrawal.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('user', 'fullName email phone isKYCVerified');

    return NextResponse.json({
      withdrawals,
      total,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    return NextResponse.json(
      { message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const admin = await requireAdmin();
    await connectDB();

    const { withdrawalId, action, reason, transactionRef } = await request.json();

    const withdrawal = await Withdrawal.findById(withdrawalId).populate('user');
    if (!withdrawal) {
      return NextResponse.json({ message: 'Withdrawal not found' }, { status: 404 });
    }

    switch (action) {
      case 'approve': {
        const AdminConfig = require('@/models/AdminConfig').default || require('@/models/AdminConfig');
        const configs = await AdminConfig.getAllConfigs();
        const TDS_PERCENTAGE = parseInt(configs.tds_percentage || '30');
        const PROCESSING_FEE = parseInt(configs.processing_fee || '10');

        // Calculate deductions
        const tdsAmount = Math.round((withdrawal.amount * TDS_PERCENTAGE) / 100);
        const processingFee = PROCESSING_FEE;
        const netAmount = withdrawal.amount - tdsAmount - processingFee;

        withdrawal.status = 'approved';
        withdrawal.processedBy = admin._id;
        withdrawal.processedAt = new Date();
        withdrawal.tdsDeducted = tdsAmount;
        withdrawal.processingFee = processingFee;
        withdrawal.netAmount = netAmount;
        await withdrawal.save();

        // Notify User
        if (withdrawal.user) {
          await createNotification(withdrawal.user._id, {
            title: 'Withdrawal Approved',
            message: `Your withdrawal of ₹${withdrawal.amount.toLocaleString('en-IN')} has been approved and matched! check Match Section.`,
            type: 'withdrawal',
            actionUrl: '/withdraw'
          });
        }
        break;
      }

      case 'reject': {
        withdrawal.status = 'rejected';
        withdrawal.processedBy = admin._id;
        withdrawal.processedAt = new Date();
        withdrawal.rejectionReason = reason;
        await withdrawal.save();

        // Refund to wallet
        if (withdrawal.user) {
          await Wallet.findOneAndUpdate(
            { user: withdrawal.user._id },
            {
              $inc: {
                cashBalance: withdrawal.amount,
                pendingWithdrawal: -withdrawal.amount,
              },
            }
          );

          // Record refund transaction
          await Transaction.create({
            user: withdrawal.user._id,
            type: 'refund',
            category: 'credit',
            amount: withdrawal.amount,
            status: 'completed',
            description: `Withdrawal rejected - Amount refunded`,
            referenceId: withdrawal._id.toString(),
            referenceType: 'withdrawal',
          });
        }
        
        // Release from global treasury reserve
        await releaseFunds(withdrawal.amount);

        // Notify User
        if (withdrawal.user) {
          await createNotification(withdrawal.user._id, {
            title: 'Withdrawal Rejected',
            message: `Your withdrawal of ₹${withdrawal.amount.toLocaleString('en-IN')} was rejected. Reason: ${reason || 'Not specified'}`,
            type: 'withdrawal',
            actionUrl: '/withdraw'
          });
        }
        break;
      }

      case 'complete': {
        withdrawal.status = 'completed';
        withdrawal.transactionRef = transactionRef;
        await withdrawal.save();

        // Update wallet
        if (withdrawal.user) {
          await Wallet.findOneAndUpdate(
            { user: withdrawal.user._id },
            {
              $inc: {
                pendingWithdrawal: -withdrawal.amount,
                totalWithdrawn: withdrawal.netAmount || withdrawal.amount,
              },
              lastWithdrawalAt: new Date(),
            }
          );
        }

        // Update transaction status
        await Transaction.findOneAndUpdate(
          { referenceId: withdrawal._id.toString(), type: 'withdrawal' },
          { status: 'completed' }
        );

        // Record actual treasury outflow (deducts from reserved, adds to outflow)
        await recordOutflow(
          withdrawal.amount, 
          'withdrawals', 
          withdrawal.tdsDeducted || 0, 
          withdrawal.processingFee || 0
        );

        // Notify User
        if (withdrawal.user) {
          await createNotification(withdrawal.user._id, {
            title: 'Withdrawal Completed',
            message: `Funds for ₹${withdrawal.amount.toLocaleString('en-IN')} have been transferred! Transaction ID: ${transactionRef}`,
            type: 'withdrawal',
            actionUrl: '/withdraw'
          });
        }
        break;
      }

      default:
        return NextResponse.json({ message: 'Invalid action' }, { status: 400 });
    }

    return NextResponse.json({ message: `Withdrawal ${action}d successfully` });
  } catch (error) {
    console.error('Approve withdrawal error:', error);
    return NextResponse.json(
      { message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}