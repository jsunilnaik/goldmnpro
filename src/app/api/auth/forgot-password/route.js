export const runtime = 'edge';
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { sendPasswordResetEmail } from '@/lib/mailer';
import { sendSMS } from '@/lib/sms';
import crypto from 'crypto';

export async function POST(request) {
  try {
    await connectDB();

    const { identifier } = await request.json(); // email or phone

    if (!identifier) {
      return NextResponse.json({ message: 'Email or phone is required' }, { status: 400 });
    }

    // Find user by email or phone
    const user = await User.findOne({
      $or: [
        { email: identifier.toLowerCase() },
        { phone: identifier }
      ]
    });

    if (!user) {
      return NextResponse.json({ message: 'No account found with this identifier' }, { status: 404 });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    user.resetPasswordToken = resetPasswordToken;
    user.resetPasswordExpires = Date.now() + 30 * 60 * 1000; // 30 minutes
    await user.save();

    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}&id=${user._id}`;

    let sent = false;
    if (user.email && identifier.includes('@')) {
      await sendPasswordResetEmail(user.email, resetUrl, user.fullName);
      sent = true;
    } else if (user.phone) {
      const message = `GoldMine Pro: Reset your password here: ${resetUrl}. Valid for 30 mins.`;
      await sendSMS(user.phone, message);
      sent = true;
    }

    if (!sent) {
        return NextResponse.json({ message: 'Could not determine where to send the link' }, { status: 400 });
    }

    return NextResponse.json({ message: 'Password reset link sent successfully' });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}