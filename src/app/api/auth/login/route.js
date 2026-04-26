export const runtime = 'edge';
import { NextResponse } from 'next/server';
import { db } from '@/lib/atlas';
import { signToken } from '@/lib/jwt';
import bcrypt from 'bcryptjs';

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find user via Data API
    const user = await db.findOne('users', { email: email.toLowerCase() });

    if (!user) {
      return NextResponse.json(
        { message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Check if account is locked
    if (user.loginAttempts && user.loginAttempts.lockedUntil && new Date(user.loginAttempts.lockedUntil) > new Date()) {
      const lockTimeMs = new Date(user.loginAttempts.lockedUntil) - new Date();
      const lockMinutes = Math.max(1, Math.ceil(lockTimeMs / 60000));
      return NextResponse.json(
        { message: `Account is temporarily locked. Please try again in ${lockMinutes} minutes.` },
        { status: 423 }
      );
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      // Logic for incrementing failed attempts would go here via db.updateOne
      return NextResponse.json(
        { message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Check if active
    if (user.isActive === false) {
      return NextResponse.json(
        { message: 'Account has been deactivated. Contact support.' },
        { status: 403 }
      );
    }

    // Reset login attempts and update last login
    await db.updateOne('users', 
        { _id: { "$oid": user._id } }, 
        { 
            "$set": { 
                "loginAttempts": { count: 0, lastAttempt: null, lockedUntil: null },
                "lastLogin": { "$date": new Date().toISOString() },
                "lastLoginIP": request.headers.get('x-forwarded-for') || 'unknown'
            } 
        }
    );

    // Generate token
    const token = await signToken({ userId: user._id, role: user.role });

    const response = NextResponse.json({
      message: 'Login successful',
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar,
        role: user.role,
        referralCode: user.referralCode,
        isKYCVerified: user.isKYCVerified,
      },
    });

    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}