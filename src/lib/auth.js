import { cookies } from 'next/headers';
import { verifyToken } from './jwt';
import { db } from './atlas';

export async function getAuthUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;

  if (!token) return null;

  const decoded = await verifyToken(token);
  if (!decoded || !decoded.userId) return null;

  // Use the Edge-compatible Data API driver
  try {
    const user = await db.findById('users', decoded.userId);

    if (!user || user.isActive === false) return null;

    // Remove sensitive fields
    delete user.password;
    delete user.otp;

    return user;
  } catch (error) {
    console.error('Auth check error:', error);
    return null;
  }
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