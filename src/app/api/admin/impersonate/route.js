import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { requireAdmin } from '@/lib/auth';
import User from '@/models/User';
import { signToken, verifyToken } from '@/lib/jwt';
import { cookies } from 'next/headers';

export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const action = searchParams.get('action') || 'start'; // 'start' or 'stop'

    const cookieStore = await cookies();

    if (action === 'start') {
      await requireAdmin();
      if (!userId) {
        return NextResponse.json({ message: 'User ID is required' }, { status: 400 });
      }

      const user = await User.findById(userId);
      if (!user) {
        return NextResponse.json({ message: 'User not found' }, { status: 404 });
      }

      // Generate token for target user
      const userToken = await signToken({ userId: user._id, role: user.role });
      
      // Get current admin token
      const adminToken = cookieStore.get('auth-token')?.value;

      const response = NextResponse.json({ 
        message: `Impersonating ${user.fullName}`,
        redirect: '/dashboard'
      });

      // Save admin token for "Switch Back"
      if (adminToken) {
        response.cookies.set('admin-impersonator-token', adminToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 1 * 60 * 60, // 1 hour for impersonation safety
          path: '/',
        });
      }

      // Set auth-token to target user
      response.cookies.set('auth-token', userToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 1 * 60 * 60,
        path: '/',
      });

      return response;
    } 
    
    if (action === 'stop') {
      const impersonatorToken = cookieStore.get('admin-impersonator-token')?.value;
      
      if (!impersonatorToken) {
        return NextResponse.json({ message: 'No active impersonation found' }, { status: 400 });
      }

      // Verify the impersonator token is actually an admin
      const decoded = await verifyToken(impersonatorToken);
      if (!decoded || decoded.role !== 'admin') {
         return NextResponse.json({ message: 'Invalid impersonator session' }, { status: 403 });
      }

      const response = NextResponse.json({ 
        message: 'Returned to admin session',
        redirect: '/admin/users'
      });

      // Restore admin token
      response.cookies.set('auth-token', impersonatorToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60,
        path: '/',
      });

      // Clear impersonator token
      response.cookies.delete('admin-impersonator-token');

      return response;
    }

    return NextResponse.json({ message: 'Invalid action' }, { status: 400 });

  } catch (error) {
    console.error('Impersonation error:', error);
    return NextResponse.json(
      { message: error.message || 'Internal server error' },
      { status: error.message.includes('Forbidden') ? 403 : 500 }
    );
  }
}
