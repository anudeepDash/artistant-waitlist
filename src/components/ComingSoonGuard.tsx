'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';

// The gate is large (sign-in, a mini game, feedback form), so it's only downloaded
// on routes that actually show it. Public routes skip it entirely.
const ComingSoonGate = dynamic(() => import('./ComingSoonGate'));

// Routes that are live for everyone; every other route stays behind the gate.
const PUBLIC_PATHS = new Set(['/', '/privacy', '/terms']);

export default function ComingSoonGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (PUBLIC_PATHS.has(pathname)) return <>{children}</>;
  return <ComingSoonGate>{children}</ComingSoonGate>;
}
