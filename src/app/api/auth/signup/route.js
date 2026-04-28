import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Wallet from '@/models/Wallet';
import Location from '@/models/Location';
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
        { email: validated.email.toLowerCase() },
        { phone: validated.phone }
      ]
    });

    if (existingUser) {
      return NextResponse.json(
        { message: existingUser.email === validated.email.toLowerCase() ? 'Email already registered' : 'Phone number already registered' },
        { status: 400 }
      );
    }

    // Check if city is active
    const location = await Location.findOne({ city: validated.city, state: validated.state });
    if (location && location.isActive === false) {
      return NextResponse.json(
        { message: `GoldMine Pro is currently not available in ${validated.city}.` },
        { status: 403 }
      );
    }

    // Handle referral
    let referredByUserId = null;
    if (validated.referralCode) {
      const referredByUser = await User.findOne({ referralCode: validated.referralCode });
      if (referredByUser) {
        referredByUserId = referredByUser._id;
      }
    }

    // Create user
    const user = await User.create({
      fullName: validated.fullName,
      email: validated.email.toLowerCase(),
      phone: validated.phone,
      password: validated.password,
      referredBy: referredByUserId,
      city: validated.city,
      state: validated.state,
      tier: validated.tier || 1,
    });

    // Generate OTP
    const otp = user.generateOTP();
    await user.save();
    console.log(`OTP for ${user.phone}: ${otp}`);

    // Create wallet
    await Wallet.create({ user: user._id });

    // Update Location Count
    await Location.findOneAndUpdate(
        { city: validated.city, state: validated.state },
        { 
          $inc: { userCount: 1 },
          $set: { tier: validated.tier || 1 }
        },
        { upsert: true }
    );

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

    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });

    return response;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: 'Validation error', errors: error.errors }, { status: 400 });
    }
    console.error('Signup error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}