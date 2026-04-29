import { SignJWT, jwtVerify, decodeJwt } from 'jose';

export async function signToken(payload) {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    console.warn('⚠️ JWT_SECRET is not defined. Using fallback secret.');
  }
  const JWT_SECRET = new TextEncoder().encode(secret || 'your-fallback-secret-for-dev');
  const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

  // Ensure userId is a string to prevent Cast to ObjectId errors
  if (payload.userId && typeof payload.userId !== 'string') {
    payload.userId = payload.userId.toString();
  }

  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(JWT_EXPIRES_IN)
    .sign(JWT_SECRET);
}

export async function verifyToken(token) {
  const secret = process.env.JWT_SECRET;
  const JWT_SECRET = new TextEncoder().encode(secret || 'your-fallback-secret-for-dev');
  
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    console.log('✅ Token verified successfully. Payload:', payload);

    // Sanitize payload for existing sessions to prevent Cast to ObjectId errors
    if (payload.userId && typeof payload.userId !== 'string') {
      if (typeof payload.userId === 'object' && payload.userId.buffer) {
        const buf = new Uint8Array(Object.values(payload.userId.buffer));
        payload.userId = Array.from(buf).map(b => b.toString(16).padStart(2, '0')).join('');
      } else {
        payload.userId = String(payload.userId);
      }
    }

    return payload;
  } catch (error) {
    console.error('❌ Token verification failed:', error.message);
    return null;
  }
}

export function decodeToken(token) {
  try {
    return decodeJwt(token);
  } catch (error) {
    return null;
  }
}