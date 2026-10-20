import Link from 'next/link';

export const metadata = {
  title: 'Page not found',
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <main className="min-h-[100dvh] flex flex-col items-center justify-center gap-6 px-6 text-center bg-[#050508] text-white">
      <img src="/logo_a.png" alt="Artistant" width={48} height={60} className="opacity-60" />
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold">This page doesn&apos;t exist</h1>
        <p className="text-sm text-white/60 max-w-sm">
          The link may be broken, or the artist profile may have moved to a new username.
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link href="/" className="px-6 py-3 rounded-full bg-[#7C5CFF] hover:bg-[#6B4FE0] text-white text-sm font-bold transition-colors">
          Go home
        </Link>
        <Link href="/links" className="px-6 py-3 rounded-full border border-white/15 hover:border-white/30 text-white/80 text-sm font-semibold transition-colors">
          All links
        </Link>
      </div>
    </main>
  );
}
