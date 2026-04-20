import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { signToken } from '@/lib/jwt';
import { createNotification } from '@/lib/notifications';

export async function POST(request) {
  try {
    await connectDB();

    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find user with password
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user) {
      return NextResponse.json(
        { message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Check if account is locked
    if (user.isLocked()) {
      const lockTimeMs = user.loginAttempts.lockedUntil - new Date();
      const lockMinutes = Math.max(1, Math.ceil(lockTimeMs / 60000));
      return NextResponse.json(
        { message: `Account is temporarily locked due to multiple failed attempts. Please try again in ${lockMinutes} ${lockMinutes === 1 ? 'minute' : 'minutes'}.` },
        { status: 423 }
      );
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      // Increment failed attempts
      user.loginAttempts.count += 1;
      user.loginAttempts.lastAttempt = new Date();

      if (user.loginAttempts.count >= 5) {
        user.loginAttempts.lockedUntil = new Date(Date.now() + 30 * 60 * 1000); // Lock for 30 mins
      }
      await user.save();

      return NextResponse.json(
        { message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Check if active
    if (!user.isActive) {
      return NextResponse.json(
        { message: 'Account has been deactivated. Contact support.' },
        { status: 403 }
      );
    }

    // Reset login attempts on success
    user.loginAttempts = { count: 0, lastAttempt: null, lockedUntil: null };
    user.lastLogin = new Date();
    user.lastLoginIP = request.headers.get('x-forwarded-for') || 'unknown';
    await user.save();

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
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });

    // Create persistent notification (Disabled)
    /*
    await createNotification(user._id, {
      title: 'Login Successful',
      message: 'You have logged into your GoldMine Pro account.',
      type: 'system'
    });
    */

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}