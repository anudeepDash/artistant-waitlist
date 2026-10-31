import React from 'react';
import Link from 'next/link';
import HomeFooter from './HomeFooter';
import base from './home.module.css';
import s from './legal.module.css';

/** The privacy and terms pages, in the same dark room as the homepage. */
export default function LegalShell({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`${base.page} ${base.roleArtist}`}>
      <header className={s.bar}>
        <nav className={`${base.container} ${s.barInner}`} aria-label="Main">
          <Link href="/" className={base.brand} aria-label="Artistant home">
            <img src="/brand/wordmark.svg" alt="Artistant" width={118} height={22} />
          </Link>
          <Link href="/" className={s.back}>
            <span aria-hidden="true">←</span> Back to home
          </Link>
        </nav>
      </header>

      <main className={`${base.container} ${s.main}`}>
        <span className={base.label}>Legal</span>
        <h1 className={s.title}>{title}</h1>
        <p className={s.updated}>Last updated · {updated}</p>
        <div className={s.body}>{children}</div>
      </main>

      <HomeFooter />
    </div>
  );
}
