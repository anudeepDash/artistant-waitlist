'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'motion/react';
import s from './home.module.css';

const COLUMNS = [
  {
    title: 'Product',
    links: [
      { href: '#how', label: 'How payments work' },
      { href: '#features', label: 'Features' },
      { href: '#for-you', label: 'Who it’s for' },
      { href: '/card', label: 'Your digital card' },
    ],
  },
  {
    title: 'Company',
    links: [
      { href: '/careers', label: 'Careers' },
      { href: '/changelog', label: 'What’s new' },
      { href: '/links', label: 'Official links & QR' },
      { href: 'mailto:hello@artistant.in', label: 'Contact us' },
    ],
  },
  {
    title: 'Follow',
    links: [
      { href: 'https://instagram.com/artistant.in', label: 'Instagram', external: true },
      { href: 'https://www.linkedin.com/company/artistantco/', label: 'LinkedIn', external: true },
      { href: 'https://x.com/artistant_in', label: 'X / Twitter', external: true },
    ],
  },
];

export default function HomeFooter() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end end'] });
  const y = useTransform(scrollYProgress, [0, 1], ['45%', '0%']);
  const opacity = useTransform(scrollYProgress, [0, 1], [0.2, 1]);

  return (
    <footer className={s.footer}>
      <div className={s.container}>
        <div className={s.footTop}>
          <div className={s.footBrand}>
            <Link href="/" className={s.brand} aria-label="Artistant home">
              <img src="/logo_a.png" alt="" />
              <img src="/logo_wordmark_flat.png" alt="Artistant" className={s.brandWordmark} />
            </Link>
            <p className={s.footTag}>The safe way to book live artists in India. Made in Bengaluru, for every stage.</p>
          </div>
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <div className={s.footColTitle}>{col.title}</div>
              <ul className={s.footLinks}>
                {col.links.map((l) => (
                  <li key={l.label}>
                    {'external' in l ? (
                      <a href={l.href} target="_blank" rel="noopener noreferrer">
                        {l.label}
                      </a>
                    ) : l.href.startsWith('/') ? (
                      <Link href={l.href}>{l.label}</Link>
                    ) : (
                      <a href={l.href}>{l.label}</a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div ref={ref} className={s.footWord} aria-hidden="true">
          <motion.span className={s.footWordInner} style={{ y, opacity }}>
            artistant
          </motion.span>
        </div>

        <div className={s.footBottom}>
          <span>© {new Date().getFullYear()} Artistant. All rights reserved.</span>
          <span style={{ display: 'flex', gap: 20 }}>
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
            <Link href="/admin">Team</Link>
          </span>
        </div>
      </div>
    </footer>
  );
}
