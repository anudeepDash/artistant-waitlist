'use client';

import React, { useRef, useState } from 'react';
import { AnimatePresence, motion, useMotionValueEvent, useScroll, useSpring, useTransform } from 'motion/react';
import { CheckIcon, EASE, Eyebrow, Reveal, SplitWords, useMediaQuery } from './primitives';
import s from './home.module.css';

const TOTAL = 180000;

const STEPS = [
  {
    title: 'The full fee is locked in',
    text: 'Once the booking is confirmed, the booker pays the whole amount into a protected account. The money is real — and it’s waiting.',
  },
  {
    title: 'Half goes out right away',
    text: '50% reaches the artist the moment the contract is signed. Enough for flights, the hotel and paying the band in advance.',
  },
  {
    title: 'A quarter when they arrive',
    text: 'Another 25% is released at soundcheck, once the artist checks in at the venue or shares a 4-digit stage code.',
  },
  {
    title: 'The rest after the show',
    text: 'The final 25% lands two hours after the show — as long as nobody has raised a problem.',
  },
];

// Scroll progress → share of the fee released to the artist (holds on each step).
const PROGRESS_STOPS = [0, 0.18, 0.3, 0.45, 0.55, 0.7, 0.8, 1];
const RELEASED_STOPS = [0, 0, 0.5, 0.5, 0.75, 0.75, 1, 1];

export default function PaymentFlow() {
  const trackRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: trackRef, offset: ['start start', 'end end'] });
  const released = useSpring(useTransform(scrollYProgress, PROGRESS_STOPS, RELEASED_STOPS), {
    stiffness: 120,
    damping: 26,
  });
  const amount = useTransform(released, (v) => `₹${(Math.round((v * TOTAL) / 500) * 500).toLocaleString('en-IN')}`);
  const [active, setActive] = useState(0);
  // On phones the section isn't pinned, so every step stays expanded.
  const pinned = useMediaQuery('(min-width: 901px) and (prefers-reduced-motion: no-preference)');

  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    setActive(v < 0.24 ? 0 : v < 0.5 ? 1 : v < 0.75 ? 2 : 3);
  });

  return (
    <section id="how" ref={trackRef} className={s.flowTrack}>
      <div className={s.flowSticky}>
        <div className={s.container}>
          <div className={s.flowGrid}>
            <div>
              <Eyebrow>How payments work</Eyebrow>
              <h2 className={`${s.h2} ${s.flowTitle}`}>
                <SplitWords text="Money moves" inView />
                <SplitWords text="when the show does." inView delay={0.1} className={s.gradText} />
              </h2>
              <div className={s.flowSteps}>
                {STEPS.map((step, i) => (
                  <div
                    key={step.title}
                    className={`${s.flowStep} ${i === active ? s.flowStepActive : ''} ${i < active ? s.flowStepDone : ''}`}
                  >
                    <span className={s.flowStepNum}>{i < active ? <CheckIcon size={14} /> : `0${i + 1}`}</span>
                    <div>
                      <div className={s.flowStepTitle}>{step.title}</div>
                      <AnimatePresence initial={false}>
                        {(!pinned || i === active) && (
                          <motion.div
                            className={s.flowStepText}
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.5, ease: EASE }}
                          >
                            <p>{step.text}</p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Reveal>
              <div className={s.flowVisual}>
                <div className={s.flowGlow} />
                <svg className={s.flowRing} viewBox="0 0 100 100" aria-hidden="true">
                  <defs>
                    <linearGradient id="ring-grad" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#F25A2B" />
                      <stop offset="50%" stopColor="#D4567A" />
                      <stop offset="100%" stopColor="#7C5CFF" />
                    </linearGradient>
                  </defs>
                  <circle cx="50" cy="50" r="44" stroke="rgba(255,255,255,0.07)" strokeWidth="5" fill="none" />
                  <circle cx="50" cy="50" r="36" stroke="rgba(255,255,255,0.04)" strokeWidth="0.4" fill="none" strokeDasharray="1 2" />
                  <motion.circle
                    cx="50"
                    cy="50"
                    r="44"
                    stroke="url(#ring-grad)"
                    strokeWidth="5"
                    strokeLinecap="round"
                    fill="none"
                    style={{ pathLength: released }}
                  />
                </svg>
                <div className={s.flowCenter}>
                  <div className={s.flowCenterLabel}>Paid to artist</div>
                  <motion.div className={s.flowCenterAmt}>{amount}</motion.div>
                  <div className={s.flowCenterOf}>of ₹1,80,000 · held safely until then</div>
                </div>
                <div className={s.flowTicks} aria-hidden="true">
                  <span className={s.flowTick} style={{ left: '50%', bottom: '-2%', transform: 'translateX(-50%)' }}>50%</span>
                  <span className={s.flowTick} style={{ left: '-4%', top: '50%', transform: 'translateY(-50%)' }}>75%</span>
                  <span className={s.flowTick} style={{ left: '50%', top: '-2%', transform: 'translateX(-50%)' }}>100%</span>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
