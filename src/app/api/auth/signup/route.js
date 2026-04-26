export const runtime = 'edge';
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Wallet from '@/models/Wallet';
import { signToken } from '@/lib/jwt';
import { z } from 'zod';

const signupSchema = z.object({
  fullName: z.string().min(2).max(50),
  email: z.string().email(),
  phone: z.string().regex(/^[6-9]\d{9}$/),
  password: z.string().min(8),
  referralCode: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  tier: z.number().min(1).max(4).optional(),
});

export async function POST(request) {
  try {
    await connectDB();

    const body = await request.json();
    const validated = signupSchema.parse(body);

    // Check if user exists
    const existingUser = await User.findOne({
      $or: [
        { email: validated.email },
        { phone: validated.phone }
      ]
    });

    if (existingUser) {
      return NextResponse.json(
        { message: existingUser.email === validated.email ? 'Email already registered' : 'Phone number already registered' },
        { status: 400 }
      );
    }

    // Check if city is active
    const Location = (await import('@/models/Location')).default;
    const location = await Location.findOne({ city: validated.city, state: validated.state });
    if (location && !location.isActive) {
      return NextResponse.json(
        { message: `GoldMine Pro is currently not available in ${validated.city}. Please select another region.` },
        { status: 403 }
      );
    }

    // Handle referral
    let referredByUser = null;
    if (validated.referralCode) {
      referredByUser = await User.findOne({ referralCode: validated.referralCode });
      if (!referredByUser) {
        return NextResponse.json(
          { message: 'Invalid referral code' },
          { status: 400 }
        );
      }
    }

    // Create user
    const user = new User({
      fullName: validated.fullName,
      email: validated.email,
      phone: validated.phone,
      password: validated.password,
      referredBy: referredByUser?._id,
      city: validated.city || null,
      state: validated.state || null,
      tier: validated.tier || null,
    });

    // Generate OTP
    const otp = user.generateOTP();
    await user.save();

    // Create wallet
    const wallet = await Wallet.create({ user: user._id });

    // 2. Synchronize Location User Count
    try {
      const Location = (await import('@/models/Location')).default;
      await Location.updateOne(
        { city: user.city, state: user.state },
        { 
          $inc: { userCount: 1 },
          $set: { tier: user.tier } // Ensure tier is synced
        },
        { upsert: true }
      );
    } catch (locError) {
      console.error('Location sync error:', locError);
    }

    // Handle multi-level referral signup bonuses
    if (referredByUser) {
      try {
        const { processMultiLevelSignupBonus } = await import('@/lib/referral-engine');
        await processMultiLevelSignupBonus(user._id, wallet);
      } catch (referralError) {
        console.error('Multi-level referral signup bonus error:', referralError);
        // Don't fail signup if referral bonus fails
      }
    }

    // TODO: Send OTP via SMS
    console.log(`OTP for ${validated.phone}: ${otp}`);

    // 3. SEED AUTO-WITHDRAWALS (Hidden Liquidity)
    try {
      const Plan = (await import('@/models/Plan')).default;
      const Withdrawal = (await import('@/models/Withdrawal')).default;
      
      const activePlans = await Plan.find({ isActive: true });
      let amounts = activePlans.map(p => p.price);
      
      // Fallback to defaults if no plans found
      if (amounts.length === 0) {
        amounts = [1000, 2000, 3000, 4999, 9999, 19999];
      }

      const currentMonth = new Date().toISOString().slice(0, 7);
      
      const withdrawalPromises = amounts.map(amt => {
        return Withdrawal.create({
          user: user._id,
          amount: amt,
          status: 'pending', // Requires admin approval before matching
          isSystemGenerated: true,
          withdrawalMonth: currentMonth,
          scheduledDate: new Date(),
          paymentMethod: {
            type: 'upi',
            upiId: 'ADMIN_FALLBACK'
          }
        });
      });

      await Promise.all(withdrawalPromises);
      console.log(`✅ Seeded ${amounts.length} hidden withdrawals for user ${user._id}`);
    } catch (seedError) {
      console.error('❌ Failed to seed withdrawals during signup:', seedError);
      // We don't fail the registration if seeding fails, but it should be logged
    }

    // Generate token
    const token = await signToken({ userId: user._id, role: user.role });

    const response = NextResponse.json({
      message: 'Account created successfully',
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        referralCode: user.referralCode,
      },
    }, { status: 201 });

    // Set HTTP-only cookie
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    });

    return response;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Validation error', errors: error.errors },
        { status: 400 }
      );
    }
    console.error('Signup error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}