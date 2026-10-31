import Link from 'next/link';
import HomeFooter from '@/components/home/HomeFooter';
import s from '@/components/home/home.module.css';

export const metadata = {
  title: 'Page not found',
  robots: { index: false },
};

export default function NotFound() {
  return (
    <div className={s.page}>
      <main
        className={s.container}
        style={{ minHeight: '70vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 28 }}
      >
        <Link href="/" aria-label="Artistant home">
          <img src="/brand/wordmark.svg" alt="Artistant" width={140} height={26} />
        </Link>
        <h1 className={s.serif} style={{ margin: 0, fontSize: 'clamp(40px, 7vw, 88px)', lineHeight: 1 }}>
          Wrong <em>stage.</em>
        </h1>
        <p style={{ margin: 0, maxWidth: 520, color: 'var(--ink-2)', fontSize: 18, lineHeight: 1.5 }}>
          This page doesn&apos;t exist any more. Everything about Artistant lives on the homepage.
        </p>
        <div>
          <Link href="/" className={s.btnGrad}>
            Go to the homepage
          </Link>
        </div>
      </main>
      <HomeFooter />
    </div>
  );
}
