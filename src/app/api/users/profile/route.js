export const runtime = 'edge';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/mongodb';
import { requireAuth } from '@/lib/auth';
import User from '@/models/User';
import Wallet from '@/models/Wallet';
import Subscription from '@/models/Subscription';
import Plan from '@/models/Plan';

export async function GET(request) {
  try {
    const user = await requireAuth();
    await connectDB();

    const userData = await User.findById(user._id)
      .select('-password -otp')
      .populate({
        path: 'currentPlan',
        populate: { path: 'plan' },
      })
      .lean();

    const wallet = await Wallet.findOne({ user: user._id }).lean();
    
    // REGION BLOCK CHECK
    let isBlocked = false;
    if (userData.role !== 'admin' && userData.city && userData.state) {
      const Location = (await import('@/models/Location')).default;
      const location = await Location.findOne({ city: userData.city, state: userData.state });
      if (location && !location.isActive) {
        isBlocked = true;
      }
    }

    return NextResponse.json({ user: userData, wallet, isBlocked });
  } catch (error) {
    return NextResponse.json(
      { message: error.message || 'Internal server error' },
      { status: error.message === 'Unauthorized' ? 401 : 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const currentUser = await requireAuth();
    await connectDB();

    const body = await request.json();
    const user = await User.findById(currentUser._id).select('+password');

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    switch (body.action) {
      case 'add_payment': {
        const paymentMethod = {
          type: body.type,
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

        paymentMethod.isPrimary = user.paymentMethods.length === 0;

        user.paymentMethods.push(paymentMethod);
        await user.save();
        break;
      }

      case 'remove_payment': {
        const idx = body.paymentIndex;
        if (idx >= 0 && idx < user.paymentMethods.length) {
          user.paymentMethods.splice(idx, 1);
          await user.save();
        }
        break;
      }

      case 'submit_kyc': {
        if (!body.panNumber || !body.aadharNumber) {
          return NextResponse.json({ message: 'PAN and Aadhar required' }, { status: 400 });
        }

        // Validate PAN format
        const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
        if (!panRegex.test(body.panNumber)) {
          return NextResponse.json({ message: 'Invalid PAN format' }, { status: 400 });
        }

        // Validate Aadhar (12 digits)
        if (body.aadharNumber.length !== 12 || !/^\d{12}$/.test(body.aadharNumber)) {
          return NextResponse.json({ message: 'Invalid Aadhar number' }, { status: 400 });
        }

        user.kyc = {
          panNumber: body.panNumber,
          aadharNumber: body.aadharNumber,
          status: 'submitted',
        };
        await user.save();
        break;
      }

      case 'change_password': {
        if (!body.currentPassword || !body.newPassword) {
          return NextResponse.json({ message: 'All fields required' }, { status: 400 });
        }

        const isValid = await bcrypt.compare(body.currentPassword, user.password);
        if (!isValid) {
          return NextResponse.json({ message: 'Current password is incorrect' }, { status: 400 });
        }

        if (body.newPassword.length < 8) {
          return NextResponse.json({ message: 'Password must be at least 8 characters' }, { status: 400 });
        }

        user.password = body.newPassword; // Pre-save hook will hash it
        await user.save();
        break;
      }

      default: {
        // Regular profile update
        const oldState = user.state;
        const oldCity = user.city;

        if (body.fullName) {
          user.fullName = body.fullName;
        }
        if (body.state !== undefined) {
          user.state = body.state || null;
        }
        if (body.city !== undefined) {
          user.city = body.city || null;
        }
        if (body.tier !== undefined) {
          user.tier = body.tier || null;
        }
        
        await user.save();

        // Update Location counts if city/state changed
        if (user.city !== oldCity || user.state !== oldState) {
          try {
            const Location = (await import('@/models/Location')).default;
            // Decrement old
            if (oldCity && oldState) {
              await Location.updateOne(
                { city: oldCity, state: oldState },
                { $inc: { userCount: -1 } }
              );
            }
            // Increment new
            if (user.city && user.state) {
              await Location.updateOne(
                { city: user.city, state: user.state },
                { 
                  $inc: { userCount: 1 },
                  $set: { tier: user.tier }
                },
                { upsert: true }
              );
            }
          } catch (locError) {
            console.error('Location sync error:', locError);
          }
        }
        break;
      }
    }

    const updatedUser = await User.findById(user._id)
      .select('-password -otp')
      .populate({
        path: 'currentPlan',
        populate: { path: 'plan' },
      })
      .lean();

    return NextResponse.json({
      message: 'Profile updated successfully',
      user: updatedUser,
    });
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}