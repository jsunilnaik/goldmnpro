import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(request) {
  try {
    await connectDB();

    const { email, otp, newPassword, action } = await request.json();

    const user = await User.findOne({ email: email?.toLowerCase() }).select('+password');
    if (!user) {
      return NextResponse.json({ message: 'No account found with this email' }, { status: 404 });
    }

    switch (action) {
      case 'send_otp': {
        const otpCode = user.generateOTP();
        await user.save();

        // TODO: Send OTP via email
        console.log(`Password reset OTP for ${email}: ${otpCode}`);

        return NextResponse.json({ message: 'OTP sent to your email' });
      }

      case 'verify_otp': {
        if (!user.otp || !user.otp.code) {
          return NextResponse.json({ message: 'No OTP found' }, { status: 400 });
        }
        if (user.otp.expiresAt < new Date()) {
          return NextResponse.json({ message: 'OTP expired' }, { status: 400 });
        }
        if (user.otp.code !== otp) {
          user.otp.attempts += 1;
          await user.save();
          return NextResponse.json({ message: 'Invalid OTP' }, { status: 400 });
        }

        return NextResponse.json({ message: 'OTP verified' });
      }

      case 'reset_password': {
        // Verify OTP again for security
        if (!user.otp || user.otp.code !== otp) {
          return NextResponse.json({ message: 'Invalid session' }, { status: 400 });
        }

        if (!newPassword || newPassword.length < 8) {
          return NextResponse.json({ message: 'Password must be at least 8 characters' }, { status: 400 });
        }

        user.password = newPassword; // Pre-save hook hashes it
        user.otp = undefined;
        user.loginAttempts = { count: 0, lastAttempt: null, lockedUntil: null };
        await user.save();

        return NextResponse.json({ message: 'Password reset successful' });
      }

      default:
        return NextResponse.json({ message: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}