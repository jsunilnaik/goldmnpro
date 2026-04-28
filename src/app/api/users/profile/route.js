import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Wallet from '@/models/Wallet';
import Location from '@/models/Location';
import { requireAuth } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function GET(request) {
  try {
    await connectDB();
    const authUser = await requireAuth();
    
    // Fetch user and wallet
    const user = await User.findById(authUser._id).populate({
      path: 'currentPlan',
      populate: { path: 'plan' }
    });
    
    const wallet = await Wallet.findOne({ user: authUser._id });

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // REGION BLOCK CHECK
    let isBlocked = false;
    if (user.role !== 'admin' && user.city && user.state) {
        const location = await Location.findOne({ city: user.city, state: user.state });
        if (location && location.isActive === false) {
            isBlocked = true;
        }
    }

    return NextResponse.json({ user, wallet, isBlocked });
  } catch (error) {
    return NextResponse.json(
      { message: error.message || 'Internal server error' },
      { status: error.message === 'Unauthorized' ? 401 : 500 }
    );
  }
}

export async function PUT(request) {
  try {
    await connectDB();
    const authUser = await requireAuth();
    const body = await request.json();
    const user = await User.findById(authUser._id);

    if (!user) {
        return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    switch (body.action) {
      case 'add_payment': {
        const paymentMethod = {
          type: body.type,
          isVerified: false
        };

        if (body.type === 'upi') {
          if (!body.upiId || !body.upiId.includes('@')) {
            return NextResponse.json({ message: 'Invalid UPI ID' }, { status: 400 });
          }
          paymentMethod.upiId = body.upiId;
        } else if (body.type === 'bank_account') {
          if (!body.bankName || !body.accountNumber || !body.ifscCode || !body.accountHolderName) {
            return NextResponse.json({ message: 'All bank details required' }, { status: 400 });
          }
          paymentMethod.bankName = body.bankName;
          paymentMethod.accountNumber = body.accountNumber;
          paymentMethod.ifscCode = body.ifscCode;
          paymentMethod.accountHolderName = body.accountHolderName;
        }

        paymentMethod.isPrimary = !user.paymentMethods || user.paymentMethods.length === 0;
        user.paymentMethods.push(paymentMethod);
        await user.save();
        break;
      }

      case 'submit_kyc': {
        if (!body.panNumber || !body.aadharNumber) {
          return NextResponse.json({ message: 'PAN and Aadhar required' }, { status: 400 });
        }

        user.kyc = {
            panNumber: body.panNumber,
            aadharNumber: body.aadharNumber,
            status: 'submitted'
        };
        await user.save();
        break;
      }

      case 'change_password': {
        const userWithPass = await User.findById(user._id).select('+password');
        const isValid = await userWithPass.comparePassword(body.currentPassword);
        if (!isValid) {
          return NextResponse.json({ message: 'Current password is incorrect' }, { status: 400 });
        }

        userWithPass.password = body.newPassword;
        await userWithPass.save();
        break;
      }

      default: {
        // Regular profile update
        if (body.fullName) user.fullName = body.fullName;
        if (body.state !== undefined) user.state = body.state;
        if (body.city !== undefined) user.city = body.city;
        if (body.tier !== undefined) user.tier = body.tier;
        
        await user.save();
        break;
      }
    }

    return NextResponse.json({
      message: 'Profile updated successfully',
      user: user,
    });
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}