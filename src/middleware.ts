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

export default function middleware(req: NextRequest) {
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
