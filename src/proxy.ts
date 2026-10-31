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

// Pages that are live. Every other page is not launched yet and sends visitors to the homepage.
const LIVE_PATHS = new Set(['/', '/privacy', '/terms']);
const LIVE_PREFIXES = ['/admin'];

function isLivePage(pathname: string): boolean {
  if (LIVE_PATHS.has(pathname)) return true;
  if (LIVE_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`))) return true;
  // Files (robots.txt, sitemap.xml, icons, the manifest), share images and Next/Vercel internals.
  if (pathname.startsWith('/_next') || pathname.startsWith('/_vercel')) return true;
  if (/\/(opengraph|twitter)-image(\/|$)/.test(pathname)) return true;
  return /\.[a-z0-9]+$/i.test(pathname);
}

// Basic in-memory rate limiter for serverless environments.
const rateLimitMap = new Map<string, { count: number; timestamp: number }>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const MAX_ATTEMPTS = 30;

export default function proxy(req: NextRequest) {
  // On Vercel the first x-forwarded-for entry is the real client. A missing header is
  // treated as an unknown client, not as localhost, so it can't skip the limit.
  const ip = (req.headers.get('x-forwarded-for') || '').split(',')[0].trim() || 'unknown';
  const isDev = process.env.NODE_ENV === 'development';

  if (req.method === 'POST' && !isDev) {
    const now = Date.now();
    // Keep memory bounded: drop expired entries once the map gets large.
    if (rateLimitMap.size > 5000) {
      for (const [key, rec] of rateLimitMap) if (rec.timestamp < now - RATE_LIMIT_WINDOW_MS) rateLimitMap.delete(key);
    }
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

  // A broken %-escape in the path otherwise crashes the page render with a 500.
  try {
    decodeURIComponent(url.pathname);
  } catch {
    return new NextResponse('Bad request', { status: 400 });
  }

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
    // Unlaunched pages go to the homepage, keeping the query (e.g. ?ref= referral codes).
    if ((req.method === 'GET' || req.method === 'HEAD') && !isLivePage(url.pathname)) {
      const home = url.clone();
      home.pathname = '/';
      return NextResponse.redirect(home, 307);
    }

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
