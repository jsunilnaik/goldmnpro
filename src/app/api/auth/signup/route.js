export const runtime = 'edge';
import { NextResponse } from 'next/server';
import { db } from '@/lib/atlas';
import { signToken } from '@/lib/jwt';
import { z } from 'zod';
import bcrypt from 'bcryptjs';

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
    const body = await request.json();
    const validated = signupSchema.parse(body);

    // Check if user exists via Data API
    const existingUser = await db.findOne('users', {
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
    const location = await db.findOne('locations', { city: validated.city, state: validated.state });
    if (location && location.isActive === false) {
      return NextResponse.json(
        { message: `GoldMine Pro is currently not available in ${validated.city}.` },
        { status: 403 }
      );
    }

    // Handle referral
    let referredByUserId = null;
    if (validated.referralCode) {
      const referredByUser = await db.findOne('users', { referralCode: validated.referralCode });
      if (referredByUser) {
        referredByUserId = { "$oid": referredByUser._id };
      }
    }

    // Manual referral code generation
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let myReferralCode = 'GM';
    for (let i = 0; i < 6; i++) {
        myReferralCode += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    // Generate OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Create user object
    const newUser = {
      fullName: validated.fullName,
      email: validated.email.toLowerCase(),
      phone: validated.phone,
      password: await bcrypt.hash(validated.password, 12),
      referralCode: myReferralCode,
      referredBy: referredByUserId,
      city: validated.city || null,
      state: validated.state || null,
      tier: validated.tier || null,
      role: 'user',
      isActive: true,
      isEmailVerified: false,
      isPhoneVerified: false,
      isKYCVerified: false,
      referralCount: 0,
      referralEarnings: 0,
      paymentMethods: [],
      otp: {
        code: otpCode,
        expiresAt: { "$date": new Date(Date.now() + 10 * 60 * 1000).toISOString() },
        attempts: 0
      },
      createdAt: { "$date": new Date().toISOString() },
      updatedAt: { "$date": new Date().toISOString() }
    };

    const userId = await db.insertOne('users', newUser);

    // Create wallet
    await db.insertOne('wallets', {
        user: { "$oid": userId },
        balance: 0,
        totalEarnings: 0,
        createdAt: { "$date": new Date().toISOString() }
    });

    // Update Location Count
    await db.updateOne('locations', 
        { city: validated.city, state: validated.state },
        { 
          "$inc": { "userCount": 1 },
          "$set": { "tier": validated.tier || 1 }
        },
        true // upsert
    );

    // Generate token
    const token = await signToken({ userId: userId, role: 'user' });

    const response = NextResponse.json({
      message: 'Account created successfully',
      user: {
        id: userId,
        fullName: newUser.fullName,
        email: newUser.email,
        phone: newUser.phone,
        referralCode: newUser.referralCode,
      },
    }, { status: 201 });

    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: true,
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