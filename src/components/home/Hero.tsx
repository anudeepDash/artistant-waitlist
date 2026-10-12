'use client';

import React, { useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion, useSpring, useTransform } from 'motion/react';
import type { UsernameClaim } from '@/hooks/useUsernameClaim';
import type { WaitlistEntry } from '@/lib/waitlist';
import ClaimForm from './ClaimForm';
import Phone from './Phone';
import { DiscoverScreen, ProfileScreen, VenueScreen } from './Screens';
import { ArrowIcon, EASE, useSectionProgress } from './primitives';
import h from './hero.module.css';
import base from './home.module.css';

type Side = 'artist' | 'host' | 'venue';

const SIDES: Record<
  Side,
  { tab: string; role: string; photo: string; caption: string; line1: string; line2: string; lead: string }
> = {
  artist: {
    tab: 'I perform',
    role: base.roleArtist,
    photo: '/photos/crowd-bengaluru.webp',
    caption: 'Concert night · Bengaluru',
    line1: 'Get paid.',
    line2: 'Not ghosted.',
    lead: 'Your own booking page, a proper contract, and half your fee before you even travel. The safe way to get booked for gigs in India.',
  },
  host: {
    tab: 'I’m hosting',
    role: base.roleHost,
    photo: '/photos/sangeet-dance.webp',
    caption: 'Sangeet night',
    line1: 'Book the act,',
    line2: 'not the agency.',
    lead: 'Verified artists, clear prices and a real contract. Your money stays safe until the show is done, and if an artist drops out we find a backup.',
  },
  venue: {
    tab: 'I have a space',
    role: base.roleVenue,
    photo: '/photos/band-stage.webp',
    caption: 'Live band · Ahmedabad',
    line1: 'Your room,',
    line2: 'booked out.',
    lead: 'Fill your calendar with artists who actually show up. Weekly nights, residencies and one-off shows, planned and paid from one place.',
  },
};

const ORDER: Side[] = ['artist', 'host', 'venue'];

interface HeroProps {
  claim: UsernameClaim;
  reservation: WaitlistEntry | null;
  onClaimSubmit: () => void;
  onDashboard: () => void;
  onRole: (role: 'organizer' | 'venue') => void;
}

export default function Hero({ claim, reservation, onClaimSubmit, onDashboard, onRole }: HeroProps) {
  const [side, setSide] = useState<Side>('artist');
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const cur = SIDES[side];

  const scrollYProgress = useSectionProgress(ref, ['start start', 'end start']);
  const photoScale = useTransform(scrollYProgress, [0, 1], [1, 1.18]);
  const contentY = useTransform(scrollYProgress, [0, 1], [0, -120]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const phoneY = useTransform(scrollYProgress, [0, 1], [0, 140]);

  // The phone leans towards the pointer.
  const tiltX = useSpring(0, { stiffness: 120, damping: 18 });
  const tiltY = useSpring(0, { stiffness: 120, damping: 18 });

  const onPointerMove = (e: React.PointerEvent<HTMLElement>) => {
    if (reduce || e.pointerType !== 'mouse') return;
    const r = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    e.currentTarget.style.setProperty('--sx', `${px * 100}%`);
    e.currentTarget.style.setProperty('--sy', `${py * 100}%`);
    tiltX.set((px - 0.5) * 14);
    tiltY.set((py - 0.5) * -10);
  };

  return (
    <section ref={ref} className={`${h.hero} ${cur.role}`} onPointerMove={onPointerMove} aria-label="Artistant">
      <motion.div className={h.photos} style={reduce ? undefined : { scale: photoScale }} aria-hidden="true">
        <AnimatePresence initial={false}>
          <motion.img
            key={cur.photo}
            src={cur.photo}
            alt=""
            className={h.photo}
            initial={{ opacity: 0, scale: 1.08 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ opacity: { duration: 0.9, ease: 'easeOut' }, scale: { duration: 2.4, ease: EASE } }}
            fetchPriority="high"
          />
        </AnimatePresence>
      </motion.div>
      <div className={h.shade} aria-hidden="true" />
      <div className={h.spot} aria-hidden="true" />

      <motion.div className={`${base.container} ${h.inner}`} style={reduce ? undefined : { y: contentY, opacity: contentOpacity }}>
        <div className={h.copy}>
          <motion.div
            className={h.ask}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: EASE, delay: 0.2 }}
          >
            Which side of the <em>stage</em> are you on?
          </motion.div>

          <motion.div
            className={h.switch}
            role="tablist"
            aria-label="Which side of the stage are you on?"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: EASE, delay: 0.3 }}
          >
            {ORDER.map((k) => (
              <button
                key={k}
                type="button"
                role="tab"
                aria-selected={k === side}
                className={`${h.switchBtn} ${k === side ? h.switchOn : ''}`}
                onClick={() => setSide(k)}
              >
                {k === side && (
                  <motion.span layoutId="hero-side" className={h.switchPill} transition={{ type: 'spring', stiffness: 420, damping: 34 }} />
                )}
                <span className={h.switchText}>{SIDES[k].tab}</span>
              </button>
            ))}
          </motion.div>

          <h1 className={h.h1}>
            <AnimatePresence mode="wait" initial={false}>
              <motion.span key={side} className={h.h1Inner} initial="hide" animate="show" exit="out">
                {[cur.line1, cur.line2].map((line, i) => (
                  <span key={line} className={h.mask}>
                    <motion.span
                      className={i === 1 ? h.h1Em : undefined}
                      variants={{
                        hide: { y: '108%', rotate: 3 },
                        show: { y: '0%', rotate: 0, transition: { duration: 1, ease: EASE, delay: 0.35 + i * 0.1 } },
                        out: { y: '-108%', transition: { duration: 0.35, ease: [0.7, 0, 0.84, 0], delay: i * 0.04 } },
                      }}
                    >
                      {line}
                    </motion.span>
                  </span>
                ))}
              </motion.span>
            </AnimatePresence>
          </h1>

          <div className={h.below}>
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={side}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE, delay: 0.25 } }}
                exit={{ opacity: 0, y: -10, transition: { duration: 0.25 } }}
              >
                <p className={h.lead}>{cur.lead}</p>
                {side === 'artist' ? (
                  <>
                    <ClaimForm
                      claim={claim}
                      inputId="username-waitlist-input"
                      reservation={reservation}
                      onSubmit={onClaimSubmit}
                      onDashboard={onDashboard}
                      className={h.claim}
                    />
                    {!reservation && <p className={h.small}>Free for artists. Takes 30 seconds. Bengaluru opens first.</p>}
                  </>
                ) : (
                  <div className={h.actions}>
                    <button type="button" className={base.btnAccent} onClick={() => onRole(side === 'host' ? 'organizer' : 'venue')}>
                      {side === 'host' ? 'Join as a host' : 'List your space'} <ArrowIcon size={15} />
                    </button>
                    <a href="#hosts" className={base.btnGhost}>
                      See how it works
                    </a>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        <motion.div className={h.device} style={reduce ? undefined : { y: phoneY }}>
          <motion.div
            className={h.deviceTilt}
            style={{ rotateY: tiltX, rotateX: tiltY }}
            initial={{ opacity: 0, y: 80, rotate: 6 }}
            animate={{ opacity: 1, y: 0, rotate: 0 }}
            transition={{ duration: 1.3, ease: EASE, delay: 0.45 }}
          >
            <Phone width={290}>
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={side}
                  style={{ height: '100%' }}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  transition={{ duration: 0.45, ease: EASE }}
                >
                  {side === 'artist' ? (
                    <ProfileScreen username={reservation?.username ?? claim.username} />
                  ) : side === 'host' ? (
                    <DiscoverScreen />
                  ) : (
                    <VenueScreen />
                  )}
                </motion.div>
              </AnimatePresence>
            </Phone>
            {side === 'artist' && !reservation && (
              <motion.span
                className={h.hint}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.6, duration: 0.6 }}
              >
                ← type your name, watch your page appear
              </motion.span>
            )}
          </motion.div>
        </motion.div>
      </motion.div>

      <div className={`${base.container} ${h.foot}`}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={cur.caption}
            className={h.caption}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <span className={base.dot} /> {cur.caption}
          </motion.span>
        </AnimatePresence>
        <a href="#how" className={h.scroll}>
          Scroll <span aria-hidden="true">↓</span>
        </a>
      </div>
    </section>
  );
}
