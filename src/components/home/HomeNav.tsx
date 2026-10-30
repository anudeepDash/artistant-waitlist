'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'motion/react';
import type { User } from 'firebase/auth';
import type { WaitlistEntry } from '@/lib/waitlist';
import { signOut } from '@/lib/auth';
import { EASE } from './primitives';
import { NAV_LINKS, SIDE_CTA, SIDE_LABEL, SIDE_ORDER, type Side } from './sides';
import s from './home.module.css';

interface HomeNavProps {
  side: Side;
  onSide: (side: Side) => void;
  user: User | null;
  reservation: WaitlistEntry | null;
  onSignIn: () => void;
  /** The main action for the current side: claim a name, or open the host / venue sign-up. */
  onCta: () => void;
}

function SideSwitch({ side, onSide, id }: { side: Side; onSide: (side: Side) => void; id: string }) {
  return (
    <div className={s.sideSwitch} role="tablist" aria-label="Show the page for">
      {SIDE_ORDER.map((k) => (
        <button
          key={k}
          type="button"
          role="tab"
          aria-selected={k === side}
          className={`${s.sideBtn} ${k === side ? s.sideOn : ''}`}
          onClick={() => onSide(k)}
        >
          {k === side && <motion.span layoutId={`side-${id}`} className={s.sidePill} transition={{ type: 'spring', stiffness: 420, damping: 34 }} />}
          <span className={s.sideText}>{SIDE_LABEL[k]}</span>
        </button>
      ))}
    </div>
  );
}

async function handleSignOut() {
  try {
    await signOut();
  } catch (err) {
    console.error('Sign out failed:', err);
  }
}

/** The signed-in avatar, which opens a small menu with the account's pages and sign out. */
function AccountMenu({ user, reservation }: { user: User; reservation: WaitlistEntry | null }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('pointerdown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const initial = (reservation?.username?.[0] ?? user.displayName?.[0] ?? user.email?.[0] ?? 'A').toUpperCase();
  const photo = reservation?.profile_photo_url || user.photoURL;

  return (
    <div ref={ref} className={s.account}>
      <button
        type="button"
        className={s.avatar}
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Your account"
      >
        {photo ? <img src={photo} alt="" referrerPolicy="no-referrer" /> : initial}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            className={s.accountMenu}
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.2, ease: EASE }}
          >
            <div className={s.accountWho}>
              <strong>{reservation ? `@${reservation.username}` : user.displayName || 'Signed in'}</strong>
              {user.email && <span>{user.email}</span>}
            </div>
            {reservation && (
              <>
                <Link role="menuitem" href={`/${reservation.username}`} className={s.accountItem} onClick={() => setOpen(false)}>
                  Your page
                </Link>
                <Link role="menuitem" href="/dashboard" className={s.accountItem} onClick={() => setOpen(false)}>
                  Dashboard
                </Link>
              </>
            )}
            <button
              role="menuitem"
              type="button"
              className={`${s.accountItem} ${s.accountSignOut}`}
              onClick={() => {
                setOpen(false);
                handleSignOut();
              }}
            >
              Sign out
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function HomeNav({ side, onSide, user, reservation, onSignIn, onCta }: HomeNavProps) {
  const [solid, setSolid] = useState(false);
  const [open, setOpen] = useState(false);
  const { scrollY } = useScroll();
  const links = NAV_LINKS[side];
  // Artists who already hold a name don't need the claim button any more.
  const showCta = side !== 'artist' || !reservation;

  useMotionValueEvent(scrollY, 'change', (y) => setSolid(y > 40));

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <>
      <motion.header
        className={`${s.nav} ${solid && !open ? s.navSolid : ''}`}
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: EASE, delay: 0.2 }}
      >
        <nav className={s.navInner} aria-label="Main">
          <div className={s.navLeft}>
            <Link href="/" className={s.brand} aria-label="Artistant home">
              <img src="/brand/wordmark.svg" alt="Artistant" width={118} height={22} />
            </Link>
            <div className={s.hideSm}>
              <SideSwitch side={side} onSide={onSide} id="nav" />
            </div>
          </div>

          <div className={s.navLinks}>
            {links.map((l) => (
              <a key={l.href} href={l.href} className={s.navLink}>
                {l.label}
              </a>
            ))}
          </div>

          <div className={s.navActions}>
            {user ? (
              <AccountMenu user={user} reservation={reservation} />
            ) : (
              <button type="button" className={`${s.navSignIn} ${s.hideSm}`} onClick={onSignIn}>
                Sign in
              </button>
            )}
            {showCta && (
              <button type="button" className={s.navCta} onClick={onCta}>
                {SIDE_CTA[side]}
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
            <motion.div
              className={s.mobileMenuSwitch}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.6, ease: EASE }}
            >
              <span className={s.label}>Show me the page for</span>
              <SideSwitch
                side={side}
                onSide={(k) => {
                  onSide(k);
                  setOpen(false);
                }}
                id="menu"
              />
            </motion.div>
            {links.map((l, i) => (
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
              {showCta && (
                <button
                  type="button"
                  className={s.btnGrad}
                  onClick={() => {
                    setOpen(false);
                    onCta();
                  }}
                >
                  {SIDE_CTA[side]}
                </button>
              )}
              {user ? (
                <button
                  type="button"
                  className={s.btnGhost}
                  onClick={() => {
                    setOpen(false);
                    handleSignOut();
                  }}
                >
                  Sign out
                </button>
              ) : (
                <button
                  type="button"
                  className={s.btnWhite}
                  onClick={() => {
                    setOpen(false);
                    onSignIn();
                  }}
                >
                  Sign in
                </button>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
