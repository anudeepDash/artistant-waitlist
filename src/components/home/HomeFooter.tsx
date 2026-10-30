'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import { motion, useTransform } from 'motion/react';
import { ArrowIcon, useSectionProgress } from './primitives';
import s from './home.module.css';

export default function HomeFooter() {
  const ref = useRef<HTMLDivElement>(null);
  const scrollYProgress = useSectionProgress(ref, ['start end', 'end end']);
  const clip = useTransform(scrollYProgress, [0.05, 0.9], ['inset(0 100% 0 0)', 'inset(0 0% 0 0)']);

  return (
    <footer className={s.footer}>
      <div className={s.container}>
        <div className={s.footBrand}>
          <p className={s.footTag}>
            Made in Bengaluru, for <em>every stage</em> in India.
          </p>
          <button
            type="button"
            className={s.footTop}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            Back to top
            <span className={s.footTopArrow}>
              <ArrowIcon size={14} />
            </span>
          </button>
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
