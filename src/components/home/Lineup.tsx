'use client';

import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { ArrowIcon, EASE, Reveal } from './primitives';
import s from './lineup.module.css';
import base from './home.module.css';

const ACTS = [
  { n: 50, what: 'club DJs', size: s.l1 },
  { n: 40, what: 'acoustic acts', size: s.l2 },
  { n: 30, what: 'live bands', size: s.l2 },
  { n: 20, what: 'college headliners', size: s.l3 },
];

export default function Lineup({ username, onClaim }: { username: string; onClaim: () => void }) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const photoY = useTransform(scrollYProgress, [0, 1], ['-8%', '8%']);
  const posterRotate = useTransform(scrollYProgress, [0, 0.5, 1], [-2.5, 0, 1.5]);

  return (
    <section ref={ref} id="founding" className={s.section}>
      <div className={base.container}>
        <div className={s.head}>
          <Reveal>
            <span className={`${base.label} ${s.labelDay}`}>The first 140</span>
          </Reveal>
          <Reveal delay={0.05}>
            <h2 className={s.title}>
              A small line-up, <em>on purpose.</em>
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className={s.lead}>
              We&apos;re opening Bengaluru with just 140 artists, matched to what bookers are actually asking for. Fewer artists means
              every one of them gets real gigs. Mumbai and Delhi NCR come next.
            </p>
          </Reveal>
        </div>

        <motion.div
          className={s.poster}
          style={{ rotate: posterRotate }}
          initial={{ opacity: 0, y: 80 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '0px 0px -10% 0px' }}
          transition={{ duration: 1.1, ease: EASE }}
        >
          <div className={s.photo}>
            <motion.img src="/photos/street-art-dj.webp" alt="Street art of a DJ on a café wall" style={{ y: photoY }} loading="lazy" decoding="async" />
          </div>

          <div className={s.bill}>
            <div className={s.billTop}>
              <img src="/brand/wordmark.svg" alt="Artistant" className={s.billBrand} />
              <span>presents</span>
            </div>

            <div className={s.billName}>
              The Founding <em>140</em>
            </div>

            <ul className={s.acts}>
              {ACTS.map((a, i) => (
                <motion.li
                  key={a.what}
                  className={a.size}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, ease: EASE, delay: 0.2 + i * 0.1 }}
                >
                  <b>{a.n}</b> {a.what}
                </motion.li>
              ))}
            </ul>

            <div className={s.intro}>
              <span className={s.introLabel}>and introducing</span>
              <span className={s.you}>@{username || 'you'}</span>
            </div>

            <div className={s.billFoot}>
              <span>Hand-picked</span>
              <span>Paid on time</span>
              <span>Booked first</span>
            </div>
          </div>
        </motion.div>

        <Reveal className={s.ctaRow} delay={0.1}>
          <button type="button" className={base.btnInk} onClick={onClaim}>
            Get on the line-up <ArrowIcon size={15} />
          </button>
          <span className={s.ctaNote}>Spots are split by category, so claim yours early.</span>
        </Reveal>
      </div>
    </section>
  );
}
