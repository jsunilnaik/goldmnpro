import { cookies } from 'next/headers';
import { verifyToken } from './jwt';
import connectDB from './mongodb';
import User from '@/models/User';

export async function getAuthUser() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;

    if (!token) return null;

    const decoded = await verifyToken(token);
    if (!decoded || !decoded.userId) {
      console.log('❌ Auth check failed: Invalid or missing token/payload');
      return null;
    }

    await connectDB();
    const user = await User.findById(decoded.userId).lean();

    if (!user) {
      console.log(`❌ Auth check failed: User [${decoded.userId}] not found in database`);
      return null;
    }

    if (user.isActive === false) {
      console.log(`❌ Auth check failed: User [${decoded.userId}] is inactive`);
      return null;
    }

    // Remove sensitive fields
    const { password, otp, ...safeUser } = user;
    return { ...safeUser, _id: user._id.toString() };
  } catch (error) {
    console.error('Auth check error:', error);
    return null;
  }
}

export async function requireAuth() {
  const user = await getAuthUser();
  if (!user) {
    const error = new Error('Unauthorized');
    error.status = 401;
    throw error;
  }
  return user;
}

export async function requireAdmin() {
  const user = await requireAuth();
  if (user.role !== 'admin') {
    const error = new Error('Forbidden: Admin access required');
    error.status = 403;
    throw error;
  }
  return user;
}