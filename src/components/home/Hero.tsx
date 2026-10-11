'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from 'motion/react';
import ClaimForm from './ClaimForm';
import type { UsernameClaim } from '@/hooks/useUsernameClaim';
import type { WaitlistEntry } from '@/lib/waitlist';
import { CheckIcon, EASE, SplitWords } from './primitives';
import s from './home.module.css';

interface HeroProps {
  claim: UsernameClaim;
  reservation: WaitlistEntry | null;
  onClaimSubmit: () => void;
  onDashboard: () => void;
  onBooker: () => void;
}

export default function Hero({ claim, reservation, onClaimSubmit, onDashboard, onBooker }: HeroProps) {
  const heroRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress: heroProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const textY = useTransform(heroProgress, [0, 1], [0, -140]);
  const textOpacity = useTransform(heroProgress, [0, 0.45], [1, 0]);

  const { scrollYProgress: stageProgress } = useScroll({ target: stageRef, offset: ['start end', 'start 0.2'] });
  const smoothStage = useSpring(stageProgress, { stiffness: 90, damping: 24, mass: 0.4 });
  const rotateX = useTransform(smoothStage, [0, 1], [26, 0]);
  const scale = useTransform(smoothStage, [0, 1], [0.86, 1]);
  const stageY = useTransform(smoothStage, [0, 1], [60, 0]);

  return (
    <section ref={heroRef} className={s.hero} id="top">
      <div className={s.heroBg} aria-hidden="true">
        <div className={s.auroraA} />
        <div className={s.auroraB} />
        <div className={s.auroraC} />
        <div className={s.grid} />
        <NeonA />
        <div className={s.noise} />
      </div>

      <div className={s.container}>
        <motion.div className={s.heroInner} style={{ y: textY, opacity: textOpacity }}>
          <motion.a
            href="#launch"
            className={s.pill}
            initial={{ opacity: 0, y: 12, filter: 'blur(6px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 0.8, ease: EASE }}
          >
            <span className={s.liveDot} />
            <span>
              <strong>Now onboarding artists</strong> in Bengaluru
            </span>
            <span aria-hidden="true">→</span>
          </motion.a>

          <h1 className={s.heroTitle}>
            <SplitWords text="Every gig, booked." delay={0.15} />
            <SplitWords text="Every artist, paid." className={s.gradText} delay={0.35} />
          </h1>

          <motion.p
            className={s.heroSub}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.7, ease: EASE }}
          >
            Artistant is the safe way to book live artists in India. A proper contract, the money held safely, and
            artists paid in steps — so nobody gets ghosted, and every show goes on.
          </motion.p>

          <motion.div
            className={s.heroForm}
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.85, ease: EASE }}
          >
            <ClaimForm
              claim={claim}
              inputId="username-waitlist-input"
              reservation={reservation}
              onSubmit={onClaimSubmit}
              onDashboard={onDashboard}
            />
          </motion.div>

          <motion.div
            className={s.heroNote}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.1 }}
          >
            <span>Free for artists</span>
            <span aria-hidden="true">·</span>
            <span>
              Booking artists or running a venue?{' '}
              <button type="button" className={s.linkBtn} onClick={onBooker}>
                Join as a booker
              </button>
            </span>
          </motion.div>
        </motion.div>

        <div ref={stageRef} className={s.heroStageWrap}>
          <motion.div
            className={s.heroStage}
            style={{ rotateX, scale, y: stageY }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2, delay: 0.9 }}
          >
            <BookingMockup />
          </motion.div>
        </div>
      </div>
      <div className={s.heroFade} aria-hidden="true" />
    </section>
  );
}

function NeonA() {
  const reduce = useReducedMotion();
  const draw = (delay: number) => ({
    initial: { pathLength: reduce ? 1 : 0, opacity: 0 },
    animate: { pathLength: 1, opacity: 1 },
    transition: { pathLength: { duration: 2.4, delay, ease: EASE }, opacity: { duration: 0.4, delay } },
  });
  return (
    <svg className={s.neonA} viewBox="0 0 400 420" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="neon-grad" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%" stopColor="#7C5CFF" />
          <stop offset="45%" stopColor="#D4567A" />
          <stop offset="100%" stopColor="#F25A2B" />
        </linearGradient>
        <filter id="neon-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="5" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <g stroke="url(#neon-grad)" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" filter="url(#neon-glow)">
        <motion.path d="M48 400 L176 72 Q200 18 224 72 L300 250" {...draw(0.3)} />
        <motion.path d="M200 168 L238 262 L162 262 Z" {...draw(0.9)} />
        <motion.path d="M118 400 Q170 330 250 312 Q300 300 330 340 L360 400" {...draw(1.3)} />
      </g>
    </svg>
  );
}

const MILESTONES = [
  { title: 'Contract signed', sub: 'Half up front, for flights, hotel & band', amt: '₹90,000' },
  { title: 'Artist arrived', sub: 'Checked in at soundcheck · code 4821', amt: '₹45,000' },
  { title: 'After the show', sub: 'Released 2 hours later, if all’s well', amt: '₹45,000' },
];
const RELEASED = [0, 50, 75, 100];

function BookingMockup() {
  const reduce = useReducedMotion();
  const [stage, setStage] = useState(1);

  useEffect(() => {
    if (reduce) return;
    const id = setInterval(() => setStage((v) => (v + 1) % 4), 2600);
    return () => clearInterval(id);
  }, [reduce]);

  const released = RELEASED[stage];
  const releasedAmt = (180000 * released) / 100;

  return (
    <div className={s.mockWrap}>
    <div className={s.mock}>
      <div className={s.mockBar}>
        <div className={s.mockDots}>
          <span />
          <span />
          <span />
        </div>
        <div className={s.mockUrl}>artistant.in/bookings/AT-2291</div>
        <span className={s.mockSafe}>
          <LockIcon /> Protected
        </span>
      </div>

      <div className={s.mockBody}>
        <div className={s.mockCol}>
          <div className={s.mockArtist}>
            <div className={s.mockAvatar} />
            <div>
              <div className={s.mockName}>Kaavya &amp; The Band</div>
              <div className={s.mockMeta}>Acoustic · 5 members · Bengaluru</div>
            </div>
            <span className={s.scoreBadge}>◆ 92 Elite</span>
          </div>

          <div className={s.mockEvent}>
            <div className={s.mockRowLabel}>Booking</div>
            <div className={s.mockEventTitle}>Wedding sangeet</div>
            <div className={s.mockRows}>
              <div>
                <div className={s.mockRowLabel}>Where</div>
                <div className={s.mockRowValue}>The Leela, Bengaluru</div>
              </div>
              <div>
                <div className={s.mockRowLabel}>When</div>
                <div className={s.mockRowValue}>Sat, 14 Dec · 7:30 PM</div>
              </div>
              <div>
                <div className={s.mockRowLabel}>Guests</div>
                <div className={s.mockRowValue}>350, indoors</div>
              </div>
              <div>
                <div className={s.mockRowLabel}>Sound</div>
                <div className={s.mockRowValue}>Venue provides</div>
              </div>
            </div>
            <div className={s.mockTags}>
              <span className={s.tagGreen}>
                <CheckIcon size={11} /> Contract signed
              </span>
              <span className={s.tag}>Tech rider matched</span>
              <span className={s.tag}>GST invoice</span>
            </div>
          </div>
        </div>

        <div className={s.mockCol}>
          <div className={s.mockPayLabel}>Payment</div>
          <div className={s.mockAmount}>₹1,80,000</div>
          <div className={s.mockAmountNote}>
            <LockIcon /> Held safely · ₹{releasedAmt.toLocaleString('en-IN')} sent to artist
          </div>
          <div className={s.meter}>
            <motion.div
              className={s.meterFill}
              animate={{ width: `${released}%` }}
              transition={{ duration: 1, ease: EASE }}
            />
          </div>
          <div className={s.milestones}>
            {MILESTONES.map((m, i) => {
              const done = i < stage;
              const active = i === stage;
              return (
                <div
                  key={m.title}
                  className={`${s.milestone} ${done ? s.milestoneDone : ''} ${active ? s.milestoneActive : ''}`}
                >
                  <span className={s.milestoneIcon}>{done ? <CheckIcon size={12} /> : <span style={{ fontSize: 11 }}>{i + 1}</span>}</span>
                  <div className={s.milestoneText}>
                    <div className={s.milestoneTitle}>{m.title}</div>
                    <div className={s.milestoneSub}>{m.sub}</div>
                  </div>
                  <span className={s.milestoneAmt}>{m.amt}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>

      <FloatChip className={s.chipRight} delay={1.4} duration={5}>
        <span className={s.floatChipIcon} style={{ background: 'rgba(52,211,153,0.14)', color: '#34D399' }}>
          <CheckIcon size={14} />
        </span>
        <span>
          Contract signed
          <span className={s.floatChipSub}>By both sides, in one tap</span>
        </span>
      </FloatChip>
      <FloatChip className={s.chipLeft} delay={1.6} duration={6}>
        <span className={s.floatChipIcon} style={{ background: 'rgba(255,75,75,0.14)', color: '#FF7A7A' }}>
          <LifebuoyIcon />
        </span>
        <span>
          Backup on standby
          <span className={s.floatChipSub}>Ready within 90 minutes</span>
        </span>
      </FloatChip>
      <FloatChip className={s.chipBottom} delay={1.8} duration={5.5}>
        <span className={s.floatChipIcon} style={{ background: 'rgba(0,240,255,0.12)', color: '#00F0FF' }}>◆</span>
        <span>
          Bookability Score 92
          <span className={s.floatChipSub}>Always on time, rarely cancels</span>
        </span>
      </FloatChip>
    </div>
  );
}

function FloatChip({
  children,
  className,
  delay,
  duration,
}: {
  children: React.ReactNode;
  className: string;
  delay: number;
  duration: number;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, scale: 0.9, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: reduce ? 0 : [0, -10, 0] }}
      transition={{
        opacity: { delay, duration: 0.6 },
        scale: { delay, duration: 0.6, ease: EASE },
        y: { delay, duration, repeat: Infinity, ease: 'easeInOut' },
      }}
    >
      {children}
    </motion.div>
  );
}

function LockIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="4" y="11" width="16" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </svg>
  );
}

function LifebuoyIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="4" />
      <path d="m5.6 5.6 3.6 3.6M14.8 14.8l3.6 3.6M18.4 5.6l-3.6 3.6M9.2 14.8l-3.6 3.6" />
    </svg>
  );
}
