'use client';

import React, { useRef } from 'react';
import { motion, useScroll, useSpring, useTransform } from 'motion/react';
import { CountUp, Eyebrow, Reveal, SplitWords, useMediaQuery } from './primitives';
import s from './home.module.css';

const PHASES = [
  {
    when: 'Now',
    title: 'Bengaluru’s first line-up',
    text: 'We’re hand-picking our first artists across acoustic acts, live bands, club DJs and college headliners.',
    now: true,
  },
  {
    when: 'Next',
    title: 'Opening to bookers',
    text: 'Event companies, wedding planners and college fest teams start booking — with our team on hand for big events.',
  },
  {
    when: 'Then',
    title: 'Mumbai & Delhi NCR',
    text: 'Once Bengaluru runs smoothly, we take the same playbook to the next cities.',
  },
];

const PROOF = [
  { to: 200, suffix: '+', text: 'artists already asked to join' },
  { to: 15, suffix: '+', text: 'event agencies trying it early' },
  { to: 8, text: 'companies asked for early access' },
  { to: 5, text: 'college fests on board' },
  { to: 0, prefix: '₹', text: 'spent on ads. All word of mouth.' },
];

export default function Launch() {
  const ref = useRef<HTMLDivElement>(null);
  const vertical = useMediaQuery('(max-width: 760px)');
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.8', 'end 0.55'] });
  const fill = useSpring(useTransform(scrollYProgress, [0, 1], [0, 1]), { stiffness: 100, damping: 26 });

  return (
    <section id="launch" className={s.section}>
      <div className={s.container}>
        <div className={s.sectionHead}>
          <Eyebrow>Where we’re starting</Eyebrow>
          <h2 className={s.h2}>
            <SplitWords text="Bengaluru first." inView />
            <SplitWords text="Then everywhere." inView delay={0.1} className={s.gradText} />
          </h2>
          <Reveal>
            <p className={s.lead}>
              We’re growing city by city, so every artist we list gets real bookings — and every booker finds someone
              great.
            </p>
          </Reveal>
        </div>

        <div ref={ref} className={s.timeline}>
          <div className={s.timelineLine} aria-hidden="true">
            <motion.div className={s.timelineFill} style={vertical ? { scaleY: fill, height: '100%' } : { scaleX: fill }} />
          </div>
          {PHASES.map((p, i) => (
            <Reveal key={p.title} className={s.phase} delay={i * 0.12}>
              <span className={`${s.phaseDot} ${p.now ? s.phaseDotNow : ''}`} aria-hidden="true" />
              <div className={`${s.phaseWhen} ${p.now ? s.phaseNow : ''}`}>{p.when}</div>
              <h3 className={s.phaseTitle}>{p.title}</h3>
              <p className={s.phaseText}>{p.text}</p>
            </Reveal>
          ))}
        </div>

        <div className={s.proof}>
          {PROOF.map((p, i) => (
            <Reveal key={p.text} className={s.proofItem} delay={i * 0.06}>
              <div className={`${s.proofNum} ${i === 0 ? s.gradText : ''}`}>
                <CountUp to={p.to} prefix={p.prefix} suffix={p.suffix} />
              </div>
              <div className={s.proofText}>{p.text}</div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
