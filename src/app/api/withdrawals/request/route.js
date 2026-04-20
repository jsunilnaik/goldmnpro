import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { requireAuth } from '@/lib/auth';
import User from '@/models/User';
import Wallet from '@/models/Wallet';
import Withdrawal from '@/models/Withdrawal';
import Transaction from '@/models/Transaction';
import Subscription from '@/models/Subscription';
import AdminConfig from '@/models/AdminConfig';
import { canProcessWithdrawal, checkUserCooldown, checkVelocity, reserveFunds } from '@/lib/treasury';
import { createNotification } from '@/lib/notifications';

export async function POST(request) {
  try {
    const currentUser = await requireAuth();
    await connectDB();

    const { amount, paymentMethodId } = await request.json();

    const configs = await AdminConfig.getAllConfigs();

    // 1. Global Block Check
    if (configs.withdrawals_enabled_globally === false) {
      return NextResponse.json(
        { message: 'Withdrawals are currently disabled by the administrator. Please try again later.' },
        { status: 403 }
      );
    }

    // 2. Individual User Lock Check
    const user = await User.findById(currentUser._id);
    if (user.withdrawalLockUntil && new Date() < user.withdrawalLockUntil) {
      return NextResponse.json(
        { message: `Your withdrawals are restricted until ${user.withdrawalLockUntil.toLocaleDateString()}.` },
        { status: 403 }
      );
    }

    // Prioritize 'daily' from env if set, otherwise use database with env fallback
    const withdrawalDateConfig = process.env.WITHDRAWAL_DATE === 'daily' 
      ? 'daily' 
      : (configs.withdrawal_date || process.env.WITHDRAWAL_DATE || '15');
      
    const WINDOW_DAYS = parseInt(configs.withdrawal_window_days || process.env.WITHDRAWAL_WINDOW_DAYS || '3');
    const MIN_WITHDRAWAL = parseInt(configs.min_withdrawal_amount || process.env.MIN_WITHDRAWAL_AMOUNT || '500');
    const MAX_WITHDRAWAL = parseInt(configs.max_withdrawal_amount || '500000');

    // Validate withdrawal window
    const today = new Date();
    const dayOfMonth = today.getDate();
    let isWindowOpen = false;
    let windowMessage = '';

    if (withdrawalDateConfig === 'daily') {
      isWindowOpen = true;
    } else {
      const allowedDays = withdrawalDateConfig.toString().split(',').map(d => parseInt(d.trim()));
      
      for (const startDay of allowedDays) {
        if (dayOfMonth >= startDay && dayOfMonth <= (startDay + WINDOW_DAYS)) {
          isWindowOpen = true;
          break;
        }
      }

      if (!isWindowOpen) {
        const dateDesc = allowedDays.length > 1 
          ? `the ${allowedDays.join('th, ')}th` 
          : `the ${allowedDays[0]}th`;
        windowMessage = `Withdrawals are only available from ${dateDesc} to ${allowedDays.map(d => d + WINDOW_DAYS).join('th, ')}th of each month.`;
      }
    }

    if (!isWindowOpen) {
      return NextResponse.json(
        { message: windowMessage || 'Withdrawal window is closed.' },
        { status: 400 }
      );
    }

    // Validate amount
    const ALLOWED_AMOUNTS = [1000, 2000, 3000, 4999, 9999, 19999];
    if (!amount || !ALLOWED_AMOUNTS.includes(amount)) {
      return NextResponse.json(
        { message: `Invalid withdrawal amount. Allowed amounts are: ₹${ALLOWED_AMOUNTS.join(', ₹')}` },
        { status: 400 }
      );
    }

    // --- TREASURY PRE-FLIGHT CHECKS ---
    // 1. Check pool health & daily caps
    const treasuryCheck = await canProcessWithdrawal(amount);
    if (!treasuryCheck.allowed) {
      return NextResponse.json(
        { message: treasuryCheck.reason },
        { status: 400 }
      );
    }

    // 2. Check user cooldowns
    const cooldownCheck = await checkUserCooldown(currentUser._id, Subscription, Withdrawal, User);
    if (!cooldownCheck.allowed) {
      return NextResponse.json(
        { message: cooldownCheck.reason },
        { status: 400 }
      );
    }

    // 3. Check velocity limit
    const velocityCheck = await checkVelocity(currentUser._id, amount, Wallet);
    if (!velocityCheck.allowed) {
      return NextResponse.json(
        { message: velocityCheck.reason },
        { status: 400 }
      );
    }
    // ------------------------------------

    // Check wallet balance
    const wallet = await Wallet.findOne({ user: currentUser._id });
    if (!wallet || wallet.cashBalance < amount) {
      return NextResponse.json(
        { message: 'Insufficient balance' },
        { status: 400 }
      );
    }

    // Validate KYC
    const isDev = process.env.NODE_ENV === 'development';
    if (!user.isKYCVerified && !isDev) {
      return NextResponse.json(
        { message: 'KYC verification required before withdrawal' },
        { status: 400 }
      );
    }

    // Get payment method
    let paymentMethod = user.paymentMethods.find(m => m.type === 'upi' && m.isPrimary) || 
                        user.paymentMethods.find(m => m.type === 'upi');

    if (!paymentMethod) {
      return NextResponse.json(
        { message: 'A verified UPI ID is required for withdrawals. Please add one in your profile.' },
        { status: 400 }
      );
    }

    const TDS_PERCENTAGE = parseInt(configs.tds_percentage || '30');
    const PROCESSING_FEE = parseInt(configs.processing_fee || '10');

    // Calculate amounts
    const tdsAmount = Math.round((amount * TDS_PERCENTAGE) / 100);
    const feeAmount = PROCESSING_FEE;
    const netAmount = amount - tdsAmount - feeAmount;

    // Check for existing pending withdrawal this month
    const currentMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
    const existingWithdrawal = await Withdrawal.findOne({
      user: currentUser._id,
      withdrawalMonth: currentMonth,
      status: { $in: ['pending', 'approved', 'processing'] },
    });

    if (existingWithdrawal) {
      return NextResponse.json(
        { message: 'You already have a pending withdrawal this month' },
        { status: 400 }
      );
    }

    // Calculate scheduled date (use first day if multiple)
    const firstAllowedDay = withdrawalDateConfig === 'daily' ? today.getDate() : parseInt(withdrawalDateConfig.toString().split(',')[0]);
    const scheduledDate = new Date(today.getFullYear(), today.getMonth(), firstAllowedDay);

    // Create withdrawal request
    const withdrawal = await Withdrawal.create({
      user: currentUser._id,
      amount,
      status: 'pending',
      paymentMethod: {
        type: paymentMethod.type,
        upiId: paymentMethod.upiId,
        bankName: paymentMethod.bankName,
        accountNumber: paymentMethod.accountNumber,
        ifscCode: paymentMethod.ifscCode,
        accountHolderName: paymentMethod.accountHolderName,
      },
      withdrawalMonth: currentMonth,
      scheduledDate,
      tdsDeducted: tdsAmount,
      processingFee: feeAmount,
      netAmount,
    });

    // Reserve funds in global treasury
    await reserveFunds(amount);

    // Deduct from wallet and add to pending
    wallet.cashBalance -= amount;
    wallet.pendingWithdrawal += amount;
    await wallet.save();

    // Record transaction
    await Transaction.create({
      user: currentUser._id,
      type: 'withdrawal',
      category: 'debit',
      amount,
      status: 'pending',
      description: `Withdrawal request - ₹${amount.toLocaleString('en-IN')}`,
      referenceId: withdrawal._id.toString(),
      referenceType: 'withdrawal',
      balanceAfter: {
        points: wallet.pointsBalance,
        gold: wallet.goldBalance,
        cash: wallet.cashBalance,
      },
    });

    // Notification
    await createNotification(currentUser._id, {
      title: 'Withdrawal Requested',
      message: `Your request for ₹${amount.toLocaleString('en-IN')} has been submitted.`,
      type: 'withdrawal',
      actionUrl: '/withdraw'
    });

    return NextResponse.json({
      message: 'Withdrawal request submitted successfully',
      withdrawal,
    });
  } catch (error) {
    console.error('Withdrawal request error:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to process withdrawal' },
      { status: 500 }
    );
  }
}