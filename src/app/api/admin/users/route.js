export const runtime = 'edge';
import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/mongodb';
import { requireAdmin } from '@/lib/auth';
import User from '@/models/User';
import Wallet from '@/models/Wallet';
import Plan from '@/models/Plan';
import Subscription from '@/models/Subscription';
import Transaction from '@/models/Transaction';
import { createNotification } from '@/lib/notifications';
import { activateSubscription } from '@/lib/subscriptions';

export async function GET(request) {
  try {
    await requireAdmin();
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const filter = searchParams.get('filter') || 'all';
    const search = searchParams.get('search') || '';
    const cityFilter = searchParams.get('city') || '';
    const stateFilter = searchParams.get('state') || '';
    const tierFilter = searchParams.get('tier') || '';
    const planFilter = searchParams.get('plan') || '';
    const roleFilter = searchParams.get('role') || 'all';

    const query = {};

    if (roleFilter !== 'all') {
      query.role = roleFilter;
    }

    if (filter === 'active') query.isActive = true;
    if (filter === 'inactive') query.isActive = false;
    if (filter === 'kyc_pending') query['kyc.status'] = 'submitted';

    if (cityFilter) {
      if (cityFilter === 'none') query.city = { $in: [null, ''] };
      else query.city = cityFilter;
    }
    if (stateFilter) {
      if (stateFilter === 'none') query.state = { $in: [null, ''] };
      else query.state = stateFilter;
    }
    if (tierFilter) {
      if (tierFilter === 'none') query.tier = { $in: [null, 0] };
      else query.tier = parseInt(tierFilter);
    }

    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { city: { $regex: search, $options: 'i' } },
        { state: { $regex: search, $options: 'i' } },
      ];
    }

    // If plan filter is set, find users with that plan first
    let planUserIds = null;
    if (planFilter) {
      const Subscription = (await import('@/models/Subscription')).default;
      const activeSubs = await Subscription.find({ 
        plan: planFilter, 
        status: 'active' 
      }).select('user').lean();
      planUserIds = activeSubs.map(s => s.user);
      query._id = { $in: planUserIds };
    }

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .select('-password -otp')
      .populate({
        path: 'currentPlan',
        populate: { path: 'plan', select: 'name price' },
      });

    // Fetch stats for these users
    const userIds = users.map(u => u._id);
    const wallets = await Wallet.find({ user: { $in: userIds } });
    const allPlans = await Plan.find({ isActive: true }).select('name').lean();

    const usersWithStats = users.map(user => {
      const wallet = wallets.find(w => w.user.toString() === user._id.toString());
      return {
        ...user.toObject(),
        stats: {
          totalInvestment: wallet?.totalInvestment || 0,
          totalWithdrawn: wallet?.totalWithdrawn || 0,
          totalEarnings: wallet?.totalCashEarned || 0,
          referralEarnings: wallet?.totalReferralEarnings || 0,
          pointsBalance: wallet?.pointsBalance || 0,
          goldBalance: wallet?.goldBalance || 0,
          pendingWithdrawal: wallet?.pendingWithdrawal || 0,
        }
      };
    });

    return NextResponse.json({
      users: usersWithStats,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      availablePlans: allPlans,
    });
  } catch (error) {
    console.error('Admin users error:', error);
    return NextResponse.json(
      { message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await requireAdmin();
    await connectDB();

    const { fullName, email, phone, password, role = 'user', city, state, tier } = await request.json();

    if (!fullName || !email || !phone || !password) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    const existingUser = await User.findOne({ 
      $or: [{ email }, { phone }] 
    });

    if (existingUser) {
      return NextResponse.json(
        { message: 'Email or phone already registered' }, 
        { status: 400 }
      );
    }

    // Check if city is active
    const Location = (await import('@/models/Location')).default;
    const location = await Location.findOne({ city, state });
    const shouldBeActive = location ? location.isActive : true;

    const user = new User({
      fullName,
      email,
      phone,
      password,
      role,
      city,
      state,
      tier,
      isKYCVerified: false,
      isActive: role === 'admin' ? true : shouldBeActive,
    });

    await user.save();

    // Increment location count if provided
    if (city && state) {
      try {
        const Location = (await import('@/models/Location')).default;
        await Location.updateOne(
          { city, state },
          { $inc: { userCount: 1 } },
          { upsert: true }
        );
      } catch (locError) {
        console.error('Admin create location sync error:', locError);
      }
    }

    // Create associated wallet
    const Wallet = (await import('@/models/Wallet')).default;
    await Wallet.create({ user: user._id });

    return NextResponse.json({ 
      message: 'User created successfully',
      user: { id: user._id, fullName: user.fullName, email: user.email, city, state }
    }, { status: 201 });

  } catch (error) {
    console.error('Admin create user error:', error);
    return NextResponse.json(
      { message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    await requireAdmin();
    await connectDB();

    const body = await request.json();
    console.log('Admin PUT Action:', body.action, 'Target User:', body.userId);
    console.log('Body Payload:', JSON.stringify(body, null, 2));

    const { userId, action, userData } = body;

    const user = await User.findById(userId).populate({
      path: 'currentPlan',
      populate: { path: 'plan', select: 'name price duration' },
    });
    
    if (!user) {
      console.error('User not found:', userId);
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    let resultUser = user;

    switch (action) {
      case 'activate':
        resultUser = await User.findByIdAndUpdate(userId, { isActive: true }, { new: true });
        
        await createNotification(userId, {
          title: 'Account Activated',
          message: 'Your account has been activated by the administrator.',
          type: 'system'
        });
        
        break;

      case 'deactivate':
        resultUser = await User.findByIdAndUpdate(userId, { isActive: false }, { new: true });
        
        await createNotification(userId, {
          title: 'Account Suspended',
          message: 'Your account has been suspended by the administrator.',
          type: 'system'
        });
        
        break;

      case 'verify_kyc':
        resultUser = await User.findByIdAndUpdate(userId, { 
          isKYCVerified: true, 
          'kyc.status': 'verified' 
        }, { new: true });
        await createNotification(userId, {
          title: 'KYC Verified',
          message: 'Congratulations! Your identity verification has been approved.',
          type: 'system'
        });
        break;

      case 'reject_kyc':
        resultUser = await User.findByIdAndUpdate(userId, { 
          isKYCVerified: false, 
          'kyc.status': 'rejected' 
        }, { new: true });
        await createNotification(userId, {
          title: 'KYC Rejected',
          message: 'Your identity verification was rejected.',
          type: 'system'
        });
        break;

      case 'update_details':
        // 1. Get existing user to check location changes
        const existingUser = await User.findById(userId);
        if (!existingUser) {
          return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        const oldCity = existingUser.city;
        const oldState = existingUser.state;

        const updates = {};
        if (userData.fullName) updates.fullName = userData.fullName;
        if (userData.email) updates.email = userData.email;
        if (userData.phone) updates.phone = userData.phone;
        if (userData.role) updates.role = userData.role;
        if (userData.city !== undefined) updates.city = userData.city || null;
        if (userData.state !== undefined) updates.state = userData.state || null;
        if (userData.tier !== undefined) updates.tier = userData.tier || null;
        
        if (userData.kyc) {
          if (userData.kyc.panNumber) updates['kyc.panNumber'] = userData.kyc.panNumber;
          if (userData.kyc.aadharNumber) updates['kyc.aadharNumber'] = userData.kyc.aadharNumber;
          
          if (userData.isKYCVerified !== undefined) {
             updates.isKYCVerified = userData.isKYCVerified;
             updates['kyc.status'] = userData.isKYCVerified ? 'verified' : 'rejected';
          }
        }

        resultUser = await User.findByIdAndUpdate(userId, updates, { new: true });

        // 2. Synchronize Location Counts and Status
        const newCity = resultUser.city;
        const newState = resultUser.state;

        if (newCity !== oldCity || newState !== oldState) {
          try {
            const Location = (await import('@/models/Location')).default;
            
            // Check if new location is active and sync user status if it's not an admin
            if (resultUser.role !== 'admin') {
              const location = await Location.findOne({ city: newCity, state: newState });
              if (location && resultUser.isActive !== location.isActive) {
                resultUser.isActive = location.isActive;
                await resultUser.save();
              }
            }

            // Decrement old
            if (oldCity && oldState) {
              await Location.updateOne({ city: oldCity, state: oldState }, { $inc: { userCount: -1 } });
            }
            // Increment new
            if (newCity && newState) {
              await Location.updateOne(
                { city: newCity, state: newState },
                { $inc: { userCount: 1 }, $set: { tier: resultUser.tier } },
                { upsert: true }
              );
            }
          } catch (locError) {
            console.error('Location sync error:', locError);
          }
        }
        break;

      case 'assign_plan': {
        const { planId } = body;
        if (!mongoose.isValidObjectId(planId)) {
          return NextResponse.json({ message: 'Invalid Plan ID' }, { status: 400 });
        }

        const plan = await Plan.findById(planId);
        if (!plan) return NextResponse.json({ message: 'Plan not found' }, { status: 404 });

        // 1. Create a pending subscription first
        const subscription = await Subscription.create({
          user: userId,
          plan: planId,
          status: 'pending',
          amountPaid: plan.price,
          paymentMethod: 'admin_manual'
        });

        // 2. Use the central activation helper to handle all wallet/commission logic
        await activateSubscription(subscription._id, 'admin');

        break;
      }

      case 'adjust_wallet': {
        const { cash = 0, points = 0, gold = 0, reason = 'Admin Adjustment' } = body;
        const wallet = await Wallet.findOne({ user: userId });
        if (!wallet) return NextResponse.json({ message: 'Wallet not found' }, { status: 404 });

        wallet.cashBalance += cash;
        wallet.pointsBalance += points;
        wallet.goldBalance += gold;

        if (cash > 0) wallet.totalCashEarned += cash;
        if (points > 0) wallet.totalPointsEarned += points;
        if (gold > 0) wallet.totalGoldEarned += gold;

        await wallet.save();

        await Transaction.create({
          user: userId,
          type: 'adjustment',
          category: (cash >= 0 && points >= 0 && gold >= 0) ? 'credit' : 'debit',
          amount: Math.abs(cash),
          points: Math.abs(points),
          gold: Math.abs(gold),
          status: 'completed',
          description: reason,
          referenceType: 'system',
          balanceAfter: {
            points: wallet.pointsBalance,
            gold: wallet.goldBalance,
            cash: wallet.cashBalance,
          }
        });

        await createNotification(userId, {
          title: 'Wallet Adjustment',
          message: `Your wallet balance has been adjusted for: ${reason}`,
          type: 'payment'
        });
        break;
      }

      case 'set_withdrawal_lock': {
        const { lockUntil } = body;
        resultUser = await User.findByIdAndUpdate(userId, { 
          withdrawalLockUntil: lockUntil ? new Date(lockUntil) : null 
        }, { new: true });
        
        if (lockUntil) {
          
          await createNotification(userId, {
            title: 'Withdrawals Locked',
            message: `Your withdrawals are restricted until ${new Date(lockUntil).toLocaleDateString()}.`,
            type: 'system'
          });
          
        }
        break;
      }

      default:
        return NextResponse.json({ message: 'Invalid action' }, { status: 400 });
    }

    // Always re-populate to ensure frontend gets latest nested data
    const finalUser = await User.findById(userId).populate({
      path: 'currentPlan',
      populate: { path: 'plan', select: 'name price duration' },
    });

    // Get fresh wallet stats
    const freshWallet = await Wallet.findOne({ user: userId });
    const userWithStats = {
      ...finalUser.toObject(),
      stats: {
        totalInvestment: freshWallet?.totalInvestment || 0,
        totalWithdrawn: freshWallet?.totalWithdrawn || 0,
        totalEarnings: freshWallet?.totalCashEarned || 0,
        referralEarnings: freshWallet?.totalReferralEarnings || 0,
        pointsBalance: freshWallet?.pointsBalance || 0,
        goldBalance: freshWallet?.goldBalance || 0,
        pendingWithdrawal: freshWallet?.pendingWithdrawal || 0,
      }
    };

    return NextResponse.json({ 
      message: 'Action completed successfully',
      user: userWithStats 
    });
  } catch (error) {
    console.error('Admin update user error:', error);
    return NextResponse.json(
      { 
        message: error.message || 'Internal server error',
        error: error.name,
        details: error.errors ? Object.keys(error.errors).map(key => `${key}: ${error.errors[key].message}`).join(', ') : null
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    await requireAdmin();
    await connectDB();

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ message: 'Missing userId' }, { status: 400 });
    }

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // Delete user
    await User.findByIdAndDelete(userId);

    // Cleanup associated data (Wallets, Sessions etc.)
    const Wallet = (await import('@/models/Wallet')).default;
    await Wallet.findOneAndDelete({ user: userId });

    return NextResponse.json({ message: 'User and associated data permanently deleted' });
  } catch (error) {
    console.error('Admin delete user error:', error);
    return NextResponse.json(
      { message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
