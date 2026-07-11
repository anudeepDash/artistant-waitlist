import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (e.g. svg, png, etc.)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

// Basic in-memory rate limiter for serverless environments.
const rateLimitMap = new Map<string, { count: number; timestamp: number }>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const MAX_ATTEMPTS = 5;

export default function middleware(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
  
  if (req.method === 'POST') {
    const now = Date.now();
    const windowStart = now - RATE_LIMIT_WINDOW_MS;
    const record = rateLimitMap.get(ip);
    
    if (!record || record.timestamp < windowStart) {
      rateLimitMap.set(ip, { count: 1, timestamp: now });
    } else {
      record.count += 1;
      if (record.count > MAX_ATTEMPTS) {
        return new NextResponse(
          JSON.stringify({ error: 'Too many requests. Please try again later.' }),
          { status: 429, headers: { 'Content-Type': 'application/json' } }
        );
      }
      rateLimitMap.set(ip, record);
    }
  }

  const url = req.nextUrl;
  
  // Get hostname (e.g., admin.artistant.in, localhost:3000)
  const hostname = req.headers.get('host') || '';

  // Remove port for domain matching (useful for localhost testing)
  const currentHost = hostname.replace(`:${url.port}`, '');

  // Check if the request is for the admin subdomain
  if (currentHost === 'admin.artistant.in' || currentHost === 'admin.localhost') {
    // If the path is the root of the subdomain, rewrite to /admin
    if (url.pathname === '/') {
      url.pathname = '/admin';
      return NextResponse.rewrite(url);
    }
    
    // If the path isn't already pointing to /admin, prefix it
    if (!url.pathname.startsWith('/admin')) {
      url.pathname = `/admin${url.pathname}`;
      return NextResponse.rewrite(url);
    }
  } else {
    // Optional: If someone tries to access /admin on the main domain, redirect them to the subdomain
    // Uncomment this when you go fully live with the subdomain
    /*
    if (url.pathname.startsWith('/admin')) {
      const isLocal = currentHost === 'localhost';
      const redirectHost = isLocal ? 'admin.localhost:3000' : 'admin.artistant.in';
      const redirectProtocol = isLocal ? 'http' : 'https';
      const newPath = url.pathname.replace('/admin', '') || '/';
      
      return NextResponse.redirect(`${redirectProtocol}://${redirectHost}${newPath}`);
    }
    */
  }

  return NextResponse.next();
}
