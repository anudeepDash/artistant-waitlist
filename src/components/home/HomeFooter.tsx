'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import { motion, useTransform } from 'motion/react';
import { useSectionProgress } from './primitives';
import { SIDE_LABEL, SIDE_ORDER, type Side } from './sides';
import s from './home.module.css';

const COLUMNS = [
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

export default function HomeFooter({ onSide }: { onSide: (side: Side) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const scrollYProgress = useSectionProgress(ref, ['start end', 'end end']);
  const clip = useTransform(scrollYProgress, [0.05, 0.9], ['inset(0 100% 0 0)', 'inset(0 0% 0 0)']);

  return (
    <footer className={s.footer}>
      <div className={s.container}>
        <div className={s.footTop}>
          <div className={s.footBrand}>
            <Link href="/" className={s.brand} aria-label="Artistant home">
              <img src="/brand/wordmark.svg" alt="Artistant" width={118} height={22} />
            </Link>
            <p className={s.footTag}>
              Made in Bengaluru, for <em>every stage</em> in India.
            </p>
          </div>
          <div>
            <div className={s.footColTitle}>Pages</div>
            <ul className={s.footLinks}>
              {SIDE_ORDER.map((k) => (
                <li key={k}>
                  <button type="button" className={s.footLinkBtn} onClick={() => onSide(k)}>
                    For {SIDE_LABEL[k].toLowerCase()}
                  </button>
                </li>
              ))}
              <li>
                <Link href="/card">Your digital card</Link>
              </li>
            </ul>
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
      </div>

      <div ref={ref} className={s.footWord} aria-hidden="true">
        <img src="/brand/wordmark-white.svg" alt="" className={s.footWordGhost} loading="lazy" />
        <motion.img src="/brand/wordmark.svg" alt="" style={{ clipPath: clip }} loading="lazy" />
      </div>

      <div className={s.container}>
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
