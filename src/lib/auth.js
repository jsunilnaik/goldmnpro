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
    if (error.message.includes('MONGODB_URI')) {
      console.error('❌ Auth Check Error: Database configuration missing (MONGODB_URI)');
    } else if (error.name === 'MongooseServerSelectionError') {
      console.error('❌ Auth Check Error: Database connection timeout/failed');
    } else if (error.message.includes('initial connection is complete')) {
      console.error('❌ Auth Check Error: Mongoose connection race condition detected');
    } else {
      console.error('❌ Auth check unexpected error:', {
        message: error.message,
        name: error.name,
        stack: error.stack?.split('\n').slice(0, 3).join('\n')
      });
    }
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