'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="min-h-[100dvh] flex flex-col items-center justify-center gap-6 px-6 text-center bg-[#050508] text-white">
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold">Something went wrong</h1>
        <p className="text-sm text-white/60 max-w-sm">
          We hit an unexpected error loading this page. Please try again.
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="px-6 py-3 rounded-full bg-[#7C5CFF] hover:bg-[#6B4FE0] text-white text-sm font-bold transition-colors"
        >
          Try again
        </button>
        <Link href="/" className="px-6 py-3 rounded-full border border-white/15 hover:border-white/30 text-white/80 text-sm font-semibold transition-colors">
          Go home
        </Link>
      </div>
    </main>
  );
}
