'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'motion/react';
import type { User } from 'firebase/auth';
import type { WaitlistEntry } from '@/lib/waitlist';
import { EASE } from './primitives';
import s from './home.module.css';

const LINKS = [
  { href: '#how', label: 'How it works' },
  { href: '#features', label: 'What you get' },
  { href: '#founding', label: 'The first 140' },
  { href: '#fees', label: 'Fees' },
  { href: '#faq', label: 'FAQ' },
];

interface HomeNavProps {
  user: User | null;
  reservation: WaitlistEntry | null;
  onSignIn: () => void;
  onClaim: () => void;
  onDashboard: () => void;
}

export default function HomeNav({ user, reservation, onSignIn, onClaim, onDashboard }: HomeNavProps) {
  const [solid, setSolid] = useState(false);
  const [open, setOpen] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, 'change', (y) => setSolid(y > 40));

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  const initial = (reservation?.username?.[0] ?? user?.displayName?.[0] ?? user?.email?.[0] ?? 'A').toUpperCase();
  const photo = reservation?.profile_photo_url || user?.photoURL;

  return (
    <>
      <motion.header
        className={`${s.nav} ${solid && !open ? s.navSolid : ''}`}
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: EASE, delay: 0.2 }}
      >
        <nav className={s.navInner} aria-label="Main">
          <Link href="/" className={s.brand} aria-label="Artistant home">
            <img src="/brand/wordmark.svg" alt="Artistant" width={118} height={22} />
          </Link>

          <div className={s.navLinks}>
            {LINKS.map((l) => (
              <a key={l.href} href={l.href} className={s.navLink}>
                {l.label}
              </a>
            ))}
          </div>

          <div className={s.navActions}>
            {user ? (
              <button type="button" className={s.avatarBtn} onClick={onDashboard} aria-label="Open your dashboard">
                {photo ? <img src={photo} alt="" referrerPolicy="no-referrer" /> : initial}
              </button>
            ) : (
              <button type="button" className={`${s.navSignIn} ${s.hideSm}`} onClick={onSignIn}>
                Sign in
              </button>
            )}
            {!reservation && (
              <button type="button" className={s.navCta} onClick={onClaim}>
                Claim your name
              </button>
            )}
            <button
              type="button"
              className={s.menuBtn}
              onClick={() => setOpen((o) => !o)}
              aria-label={open ? 'Close menu' : 'Open menu'}
              aria-expanded={open}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                {open ? <path d="M6 6l12 12M18 6 6 18" /> : <path d="M4 8h16M4 16h16" />}
              </svg>
            </button>
          </div>
        </nav>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div
            className={s.mobileMenu}
            initial={{ clipPath: 'circle(0% at 92% 6%)' }}
            animate={{ clipPath: 'circle(150% at 92% 6%)' }}
            exit={{ clipPath: 'circle(0% at 92% 6%)' }}
            transition={{ duration: 0.6, ease: EASE }}
          >
            {LINKS.map((l, i) => (
              <motion.a
                key={l.href}
                href={l.href}
                className={s.mobileMenuLink}
                onClick={() => setOpen(false)}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + i * 0.06, duration: 0.6, ease: EASE }}
              >
                <small>{String(i + 1).padStart(2, '0')}</small>
                {l.label}
              </motion.a>
            ))}
            <motion.div
              className={s.mobileMenuFoot}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6, ease: EASE }}
            >
              {!reservation && (
                <button
                  type="button"
                  className={s.btnGrad}
                  onClick={() => {
                    setOpen(false);
                    onClaim();
                  }}
                >
                  Claim your name — it&apos;s free
                </button>
              )}
              <button
                type="button"
                className={s.btnWhite}
                onClick={() => {
                  setOpen(false);
                  if (user) onDashboard();
                  else onSignIn();
                }}
              >
                {user ? 'Open dashboard' : 'Sign in'}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
