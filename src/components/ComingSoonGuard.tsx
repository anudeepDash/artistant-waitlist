'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';

// The gate is large (sign-in, a mini game, feedback form), so it's only downloaded
// on routes that actually show it. Public routes skip it entirely.
const ComingSoonGate = dynamic(() => import('./ComingSoonGate'));

// Routes that are live for everyone; every other route stays behind the gate.
// /admin has its own sign-in, so it skips the gate rather than showing two.
const PUBLIC_PATHS = new Set(['/', '/privacy', '/terms']);
const PUBLIC_PREFIXES = ['/admin'];

export default function ComingSoonGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (PUBLIC_PATHS.has(pathname) || PUBLIC_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    return <>{children}</>;
  }
  return <ComingSoonGate>{children}</ComingSoonGate>;
}
