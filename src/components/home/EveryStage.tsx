'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion, useSpring, useTransform } from 'motion/react';
import { useSectionProgress } from './primitives';
import type { Side } from './sides';
import s from './stage.module.css';
import base from './home.module.css';

const STAGES = [
  { img: '/photos/sangeet-dance.webp', type: 'Weddings & sangeets', who: 'Booked by families and wedding planners', tall: false },
  { img: '/photos/fire-stage.webp', type: 'College fests', who: 'Booked by student fest teams', tall: false },
  { img: '/photos/dj-stage.webp', type: 'Club nights', who: 'Booked by clubs and promoters', tall: true },
  { img: '/photos/garba.webp', type: 'Garba & dandiya', who: 'Booked by housing societies and event teams', tall: false },
  { img: '/photos/sitar.webp', type: 'Classical baithaks', who: 'Booked by hosts and cultural trusts', tall: false },
  { img: '/photos/street-art-dj.webp', type: 'Cafés & house gigs', who: 'Booked by cafés and small venues', tall: true },
  { img: '/photos/band-stage.webp', type: 'Concerts', who: 'Booked by venues and promoters', tall: false },
  { img: '/photos/tabla.webp', type: 'Festive & company nights', who: 'Booked by brands and office teams', tall: false },
];

export default function EveryStage({ side }: { side: Side }) {
  const track = useRef<HTMLElement>(null);
  const row = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const [dist, setDist] = useState(0);

  // How far the strip has to slide so its last card ends at the right edge.
  useEffect(() => {
    const el = row.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setDist(Math.max(0, el.scrollWidth - window.innerWidth)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const scrollYProgress = useSectionProgress(track, ['start start', 'end end']);
  const smooth = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.0005 });
  const x = useTransform(smooth, [0, 1], [0, -dist]);
  const bar = useTransform(smooth, [0, 1], [0, 1]);

  if (reduce) {
    return (
      <section className={s.static} aria-label="Every stage in India">
        <div className={s.row} style={{ overflowX: 'auto' }}>
          <Intro side={side} />
          {STAGES.map((st, i) => (
            <Card key={st.type} st={st} i={i} />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section ref={track} id="stages" className={s.track} style={{ height: `calc(100vh + ${dist}px)` }} aria-label="Every stage in India">
      <div className={s.sticky}>
        <motion.div ref={row} className={s.row} style={{ x }}>
          <Intro side={side} />
          {STAGES.map((st, i) => (
            <Card key={st.type} st={st} i={i} />
          ))}
        </motion.div>
        <div className={`${base.container} ${s.progressWrap}`} aria-hidden="true">
          <span className={s.progressLabel}>Every stage</span>
          <span className={s.progress}>
            <motion.span className={s.progressFill} style={{ scaleX: bar }} />
          </span>
          <span className={s.progressLabel}>{String(STAGES.length).padStart(2, '0')} kinds of gig</span>
        </div>
      </div>
    </section>
  );
}

const INTRO: Record<Side, string> = {
  artist:
    'Sangeets, fests, club nights, baithaks and the café down the road. Wherever you play, the booking, the contract and the money work the same way.',
  host: 'Weddings, fests, office parties and house concerts. Whatever you’re planning, the booking, the contract and the payment work the same way.',
  venue: 'From a café open mic to a club’s weekend DJ. Whatever your room, booking and paying artists works the same way.',
};

function Intro({ side }: { side: Side }) {
  return (
    <div className={s.intro}>
      <span className={base.label}>Made for India</span>
      <h2 className={s.introTitle}>
        Every stage
        <br />
        in <em>India.</em>
      </h2>
      <p className={s.introText}>{INTRO[side]}</p>
    </div>
  );
}

function Card({ st, i }: { st: (typeof STAGES)[number]; i: number }) {
  return (
    <figure className={`${s.card} ${st.tall ? s.cardTall : ''}`}>
      <div className={s.imgWrap}>
        <img src={st.img} alt={st.type} loading="lazy" className={s.img} />
      </div>
      <figcaption className={s.caption}>
        <span className={s.capNum}>{String(i + 1).padStart(2, '0')}</span>
        <span className={s.capType}>{st.type}</span>
        <span className={s.capWho}>{st.who}</span>
      </figcaption>
    </figure>
  );
}
