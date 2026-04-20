import { SignJWT, jwtVerify, decodeJwt } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-fallback-secret-for-dev');
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export async function signToken(payload) {
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
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);

    // Sanitize payload for existing sessions to prevent Cast to ObjectId errors
    if (payload.userId && typeof payload.userId !== 'string') {
      // Handle the nested buffer object case from the error
      if (typeof payload.userId === 'object' && payload.userId.buffer) {
        payload.userId = Buffer.from(Object.values(payload.userId.buffer)).toString('hex');
      } else {
        payload.userId = payload.userId.toString();
      }
    }

    return payload;
  } catch (error) {
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