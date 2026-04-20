import { NextResponse } from 'next/server';
import { verifyToken } from './lib/jwt';

// Define public paths that don't require authentication
const PUBLIC_PATHS = new Set([
  '/',
  '/login',
  '/signup',
  '/forgot-password',
  '/verify-otp',
  '/legal/privacy',
  '/legal/terms',
  '/legal/security',
  '/legal/disclaimer',
  '/legal/guidance',
  '/about',
  '/contact',
  '/leaderboard',
  '/how-it-works',
  '/favicon.ico',
  '/manifest.json',
  '/sw.js',
]);

// Auth-only routes (redirect to dashboard if already logged in)
const AUTH_ONLY_PATHS = new Set([
  '/login',
  '/signup',
  '/forgot-password',
  '/verify-otp',
]);

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('auth-token')?.value;

  // 1. Skip system/static paths
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/auth') || 
    pathname.startsWith('/api/reviews') || 
    pathname.startsWith('/api/cron') ||
    pathname.includes('.') // Skip files with extensions
  ) {
    return NextResponse.next();
  }

  const isPublicPath = PUBLIC_PATHS.has(pathname);
  const isAuthOnlyPath = AUTH_ONLY_PATHS.has(pathname);

  // 2. Handle Protected Routes (Default)
  if (!isPublicPath) {
    // Check for valid session
    let decoded = null;
    if (token) {
      decoded = await verifyToken(token);
    }

    if (!decoded) {
      // Redirect to login if unauthenticated
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      const response = NextResponse.redirect(loginUrl);
      if (token) response.cookies.delete('auth-token');
      return response;
    }

    // Admin-only protection
    if (pathname.startsWith('/admin') && decoded.role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  // 3. Prevent logged-in users from hitting login/signup pages
  if (isAuthOnlyPath && token) {
    const decoded = await verifyToken(token);
    if (decoded) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  // 4. Add security headers to all responses
  const response = NextResponse.next();
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  
  return response;
}

export const config = {
  // Broad matcher to capture all non-static paths
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
