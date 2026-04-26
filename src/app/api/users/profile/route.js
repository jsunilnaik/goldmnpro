export const runtime = 'edge';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/atlas';
import { requireAuth } from '@/lib/auth';

export async function GET(request) {
  try {
    const authUser = await requireAuth();
    
    // Fetch user and wallet in parallel
    const [user, wallet] = await Promise.all([
      db.findById('users', authUser._id),
      db.findOne('wallets', { user: { "$oid": authUser._id } })
    ]);

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // Manual population of the Plan if it exists
    if (user.currentPlan) {
        const subId = user.currentPlan.$oid || user.currentPlan;
        const subscription = await db.findById('subscriptions', subId);
        if (subscription && subscription.plan) {
            const planId = subscription.plan.$oid || subscription.plan;
            subscription.plan = await db.findById('plans', planId);
            user.currentPlan = subscription;
        }
    }

    // REGION BLOCK CHECK (Simplified for Edge)
    let isBlocked = false;
    if (user.role !== 'admin' && user.city && user.state) {
        const location = await db.findOne('locations', { city: user.city, state: user.state });
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
    const authUser = await requireAuth();
    const body = await request.json();

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

        // Fetch current user to check payment methods length
        const user = await db.findById('users', authUser._id);
        paymentMethod.isPrimary = !user.paymentMethods || user.paymentMethods.length === 0;

        await db.updateOne('users', 
            { _id: { "$oid": authUser._id } }, 
            { "$push": { "paymentMethods": paymentMethod } }
        );
        break;
      }

      case 'submit_kyc': {
        if (!body.panNumber || !body.aadharNumber) {
          return NextResponse.json({ message: 'PAN and Aadhar required' }, { status: 400 });
        }

        await db.updateOne('users', 
            { _id: { "$oid": authUser._id } }, 
            { 
                "$set": { 
                    "kyc.panNumber": body.panNumber,
                    "kyc.aadharNumber": body.aadharNumber,
                    "kyc.status": "submitted"
                } 
            }
        );
        break;
      }

      case 'change_password': {
        const user = await db.findOne('users', { _id: { "$oid": authUser._id } });
        const isValid = await bcrypt.compare(body.currentPassword, user.password);
        if (!isValid) {
          return NextResponse.json({ message: 'Current password is incorrect' }, { status: 400 });
        }

        const hashed = await bcrypt.hash(body.newPassword, 12);
        await db.updateOne('users', 
            { _id: { "$oid": authUser._id } }, 
            { "$set": { "password": hashed } }
        );
        break;
      }

      default: {
        // Regular profile update
        const updateData = {};
        if (body.fullName) updateData.fullName = body.fullName;
        if (body.state !== undefined) updateData.state = body.state;
        if (body.city !== undefined) updateData.city = body.city;
        if (body.tier !== undefined) updateData.tier = body.tier;
        
        await db.updateOne('users', 
            { _id: { "$oid": authUser._id } }, 
            { "$set": updateData }
        );
        break;
      }
    }

    // Return updated user
    const updatedUser = await db.findById('users', authUser._id);
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