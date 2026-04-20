import { cookies } from 'next/headers';
import { verifyToken } from './jwt';
import connectDB from './mongodb';
import User from '@/models/User';

export async function getAuthUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;

  if (!token) return null;

  const decoded = await verifyToken(token);
  if (!decoded) return null;

  await connectDB();
  const user = await User.findById(decoded.userId)
    .select('-password -otp')
    .populate('currentPlan')
    .lean();

  if (!user || !user.isActive) return null;

  return user;
}

export async function requireAuth() {
  const user = await getAuthUser();
  if (!user) {
    throw new Error('Unauthorized');
  }
  return user;
}

export async function requireAdmin() {
  const user = await requireAuth();
  if (user.role !== 'admin') {
    throw new Error('Forbidden: Admin access required');
  }
  return user;
}