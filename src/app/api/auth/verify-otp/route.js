import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { signToken } from '@/lib/jwt';

export async function POST(request) {
  try {
    await connectDB();

    const { phone, otp, action } = await request.json();

    const user = await User.findOne({ phone });
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // Resend OTP
    if (action === 'resend') {
      const newOtp = user.generateOTP();
      await user.save();
      console.log(`New OTP for ${phone}: ${newOtp}`);
      // TODO: Send via SMS
      return NextResponse.json({ message: 'OTP resent' });
    }

    // Verify OTP
    if (!user.otp || !user.otp.code) {
      return NextResponse.json({ message: 'No OTP found. Request a new one.' }, { status: 400 });
    }

    if (user.otp.expiresAt < new Date()) {
      return NextResponse.json({ message: 'OTP expired. Request a new one.' }, { status: 400 });
    }

    if (user.otp.attempts >= 5) {
      return NextResponse.json({ message: 'Too many attempts. Request a new OTP.' }, { status: 429 });
    }

    if (user.otp.code !== otp) {
      user.otp.attempts += 1;
      await user.save();
      return NextResponse.json({ message: 'Invalid OTP' }, { status: 400 });
    }

    // OTP verified
    user.isPhoneVerified = true;
    user.otp = undefined;
    await user.save();

    const token = await signToken({ userId: user._id, role: user.role });

    const response = NextResponse.json({
      message: 'Phone verified successfully',
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
      },
    });

    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Verify OTP error:', error);
    return NextResponse.json(
      { message: 'Verification failed' },
      { status: 500 }
    );
  }
}