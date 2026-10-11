'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from 'motion/react';
import { Reveal, SplitWords, useMediaQuery } from './primitives';
import s from './home.module.css';

const CARDS = [
  {
    badge: 'SOS · 3 hours',
    title: 'Find a stand-in, fast',
    text: 'Drummer down with fever? Flight missed? Send an SOS and trusted session musicians within 25 km get an alert. Their fee is paid straight from the gig.',
    img: '/gallery_6.png',
  },
  {
    badge: 'Crew',
    title: 'The right sound engineer',
    text: 'Find live sound and lighting crew by the mixers they actually know — DiGiCo, Yamaha, Avid, Allen & Heath — matched to the venue’s gear.',
    img: '/gallery_5.png',
  },
  {
    badge: 'Gear share',
    title: 'Rent gear, skip the cargo',
    text: 'Flying instruments can eat 35% of a fee. Rent drums, amps and in-ear kits from verified musicians in Bengaluru, Mumbai and Delhi instead.',
    img: '/gallery_2.png',
  },
  {
    badge: 'Artists only',
    title: 'Honest venue notes',
    text: 'Private notes from artists who’ve played there: monitor limits, power cuts, green-room safety — and whether the promoter pays on time.',
    img: '/gallery_4.png',
  },
];

export default function Backstage() {
  const trackRef = useRef<HTMLElement>(null);
  const rowRef = useRef<HTMLDivElement>(null);
  const isDesktop = useMediaQuery('(min-width: 901px)');
  const reduce = useReducedMotion();
  const pinned = isDesktop && !reduce;
  const [distance, setDistance] = useState(0);

  useEffect(() => {
    const row = rowRef.current;
    if (!row || !pinned) return;
    const measure = () => setDistance(Math.max(0, row.scrollWidth - window.innerWidth + 48));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(row);
    window.addEventListener('resize', measure);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [pinned]);

  const { scrollYProgress } = useScroll({ target: trackRef, offset: ['start start', 'end end'] });
  const smooth = useSpring(scrollYProgress, { stiffness: 110, damping: 28, mass: 0.3 });
  const x = useTransform(smooth, [0, 1], [0, -distance]);

  const intro = (
    <>
      <Reveal>
        <span className={s.eyebrow}>
          <span className={s.eyebrowDot} />
          Artistant Backstage
        </span>
      </Reveal>
      <h2 className={s.h2}>
        <SplitWords text="Help for the" inView />
        <SplitWords text="day of the show." inView delay={0.1} className={s.gradText} />
      </h2>
      <Reveal>
        <p className={s.lead}>
          An invite-only space where artists and crew help each other when things go sideways — because live shows
          always find a way to.
        </p>
      </Reveal>
    </>
  );

  return (
    <section ref={trackRef} id="backstage" className={`${s.hTrack} ${pinned ? '' : s.hNative}`}>
      <div className={s.hSticky}>
        {!pinned && <div className={s.hIntroStatic}>{intro}</div>}
        <motion.div ref={rowRef} className={s.hRow} style={pinned ? { x } : undefined}>
          {pinned && <div className={s.hIntro}>{intro}</div>}

          {CARDS.map((c, i) => (
            <motion.article
              key={c.title}
              className={s.hCard}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '0px -5% 0px 0px' }}
              transition={{ duration: 0.8, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className={s.hCardArt}>
                <img src={c.img} alt="" loading="lazy" />
                <span className={s.hCardBadge}>{c.badge}</span>
              </div>
              <div className={s.cardBody}>
                <h3 className={s.cardTitle}>{c.title}</h3>
                <p className={s.cardText}>{c.text}</p>
              </div>
            </motion.article>
          ))}
        </motion.div>

        {pinned && (
          <div className={s.hProgress} aria-hidden="true">
            <motion.div className={s.hProgressFill} style={{ scaleX: smooth }} />
          </div>
        )}
      </div>
    </section>
  );
}
