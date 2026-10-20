import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Serves the admin panel on the admin.* subdomain (admin.artistant.in, admin.localhost)
 * by rewriting its paths under /admin.
 *
 * Rate limiting used to live here as a blanket "30 POSTs per IP per minute" rule. Every
 * Server Action is a POST, so ordinary browsing (username checks while typing, dashboard
 * loads) tripped it and actions failed with 429 — especially for users sharing a mobile
 * carrier IP. Abuse-prone actions now rate limit themselves (see src/lib/rate-limit.ts).
 */
export const config = {
  matcher: [
    {
      source: '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|xml|webmanifest)$).*)',
      has: [{ type: 'host', value: 'admin\\..*' }],
    },
  ],
};

export default function proxy(req: NextRequest) {
  const url = req.nextUrl.clone();
  const hostname = (req.headers.get('host') || '').split(':')[0];

  if (hostname === 'admin.artistant.in' || hostname === 'admin.localhost') {
    if (url.pathname === '/') {
      url.pathname = '/admin';
      return NextResponse.rewrite(url);
    }
    if (!url.pathname.startsWith('/admin')) {
      url.pathname = `/admin${url.pathname}`;
      return NextResponse.rewrite(url);
    }
  }

  return NextResponse.next();
}
