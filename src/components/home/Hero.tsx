'use client';

import React, { useRef } from 'react';
import { AnimatePresence, motion, useReducedMotion, useSpring, useTransform } from 'motion/react';
import type { UsernameClaim } from '@/hooks/useUsernameClaim';
import type { WaitlistEntry } from '@/lib/waitlist';
import ClaimForm from './ClaimForm';
import Phone, { PhoneBody } from './Phone';
import { DiscoverScreen, ProfileScreen, VenueScreen } from './Screens';
import { ArrowIcon, EASE, useSectionProgress } from './primitives';
import { SIDE_ORDER, type Side } from './sides';
import h from './hero.module.css';
import base from './home.module.css';


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

const ORDER = SIDE_ORDER;

interface HeroProps {
  side: Side;
  onSide: (side: Side) => void;
  claim: UsernameClaim;
  reservation: WaitlistEntry | null;
  onClaimSubmit: () => void;
  onRole: (role: 'organizer' | 'venue') => void;
}

export default function Hero({ side, onSide, claim, reservation, onClaimSubmit, onRole }: HeroProps) {
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

      <div className={`${base.container} ${h.inner}`}>
        <motion.div className={h.copy} style={reduce ? undefined : { y: contentY, opacity: contentOpacity }}>
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
                onClick={() => onSide(k)}
              >
                {k === side && (
                  <motion.span layoutId="hero-side" className={h.switchPill} transition={{ type: 'spring', stiffness: 420, damping: 34 }} />
                )}
                <span className={h.switchText}>{SIDES[k].tab}</span>
              </button>
            ))}
          </motion.div>

          {/*
            All three headlines stay mounted in one grid cell and slide in or out.
            Nothing waits on an exit animation, so quick clicks can't leave a line stuck.
          */}
          <h1 className={h.h1}>
            {ORDER.map((k) => {
              const on = k === side;
              return (
                <span key={k} className={h.h1Layer} aria-hidden={!on}>
                  {[SIDES[k].line1, SIDES[k].line2].map((line, i) => (
                    <span key={line} className={h.mask}>
                      <motion.span
                        className={i === 1 ? h.h1Em : undefined}
                        initial={false}
                        animate={on ? { y: '0%', opacity: 1 } : { y: '110%', opacity: 0 }}
                        transition={
                          on
                            ? { duration: 0.9, ease: EASE, delay: 0.12 + i * 0.08 }
                            : { duration: 0.35, ease: [0.7, 0, 0.84, 0] }
                        }
                      >
                        {line}
                      </motion.span>
                    </span>
                  ))}
                </span>
              );
            })}
          </h1>

          <div className={h.below}>
            {ORDER.map((k) => {
              const on = k === side;
              return (
                <motion.div
                  key={k}
                  className={h.belowLayer}
                  inert={!on}
                  aria-hidden={!on}
                  initial={false}
                  animate={on ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
                  transition={{ duration: on ? 0.6 : 0.2, ease: EASE, delay: on ? 0.2 : 0 }}
                  style={{ pointerEvents: on ? 'auto' : 'none' }}
                >
                  <p className={h.lead}>{SIDES[k].lead}</p>
                  {k === 'artist' ? (
                    <>
                      <ClaimForm
                        claim={claim}
                        inputId="username-waitlist-input"
                        reservation={reservation}
                        onSubmit={onClaimSubmit}
                        className={h.claim}
                      />
                      {!reservation && <p className={h.small}>Free for artists. Takes 30 seconds. Bengaluru opens first.</p>}
                    </>
                  ) : (
                    <div className={h.actions}>
                      <button type="button" className={base.btnAccent} onClick={() => onRole(k === 'host' ? 'organizer' : 'venue')}>
                        {k === 'host' ? 'Join as a host' : 'List your space'} <ArrowIcon size={15} />
                      </button>
                      <a href="#how" className={base.btnGhost}>
                        See how it works
                      </a>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        <motion.div className={h.device} style={reduce ? undefined : { y: phoneY }}>
          <motion.div
            className={h.deviceTilt}
            style={{ rotateY: tiltX, rotateX: tiltY }}
            initial={{ opacity: 0, y: 80, rotate: 6 }}
            animate={{ opacity: 1, y: 0, rotate: 0 }}
            transition={{ duration: 1.3, ease: EASE, delay: 0.45 }}
          >
            <Phone width={290} edge>
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
                  ) : (
                    <PhoneBody>{side === 'host' ? <DiscoverScreen /> : <VenueScreen />}</PhoneBody>
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
      </div>

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
