'use client';

import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { ArrowIcon, CheckIcon, Reveal } from './primitives';
import s from './other.module.css';
import base from './home.module.css';

const CARDS = [
  {
    role: 'organizer' as const,
    cls: base.roleHost,
    tag: 'For hosts',
    img: '/photos/garba.webp',
    alt: 'Garba dancers in bright lehengas',
    title: (
      <>
        Book the act, <em>not the agency.</em>
      </>
    ),
    text: 'Weddings, college fests, office parties and house concerts. Find the right artist, see the real price and book in a few taps.',
    points: [
      'Verified artists with clear prices',
      'Your money is held safely until the show is done',
      'Artist drops out? A backup within 90 minutes',
      'A proper contract and GST invoice every time',
    ],
    cta: 'Join as a host',
  },
  {
    role: 'venue' as const,
    cls: base.roleVenue,
    tag: 'For venues',
    img: '/photos/mixer.webp',
    alt: 'A lit-up DJ mixer at a venue',
    title: (
      <>
        Your room, <em>booked out.</em>
      </>
    ),
    text: 'Cafés, bars, clubs and hotels. Plan weekly nights and 4- or 8-week residencies with artists who actually turn up.',
    points: [
      'One monthly GST invoice for all your shows',
      'Fees go down the longer you book the same act',
      'Resident artist sick? A matched replacement, sent for you',
      'Tech riders checked against your sound gear',
    ],
    cta: 'List your space',
  },
];

function Card({ c, onRole }: { c: (typeof CARDS)[number]; onRole: (role: 'organizer' | 'venue') => void }) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], ['-10%', '10%']);

  return (
    <article ref={ref} className={`${s.card} ${c.cls}`}>
      <div className={s.media}>
        <motion.img src={c.img} alt={c.alt} style={{ y }} loading="lazy" />
        <span className={s.tag}>{c.tag}</span>
      </div>
      <div className={s.body}>
        <h3 className={s.cardTitle}>{c.title}</h3>
        <p className={s.text}>{c.text}</p>
        <ul className={s.points}>
          {c.points.map((p) => (
            <li key={p}>
              <span className={s.check}>
                <CheckIcon size={10} />
              </span>
              {p}
            </li>
          ))}
        </ul>
        <button type="button" className={`${base.btnAccent} ${s.cta}`} onClick={() => onRole(c.role)}>
          {c.cta} <ArrowIcon size={15} />
        </button>
      </div>
    </article>
  );
}

export default function OtherSide({ onRole }: { onRole: (role: 'organizer' | 'venue') => void }) {
  return (
    <section id="hosts" className={s.section}>
      <div className={base.container}>
        <div className={s.head}>
          <Reveal>
            <span className={base.label}>The other side of the stage</span>
          </Reveal>
          <Reveal delay={0.05}>
            <h2 className={base.title}>
              Booking an artist? <em>Same safe deal.</em>
            </h2>
          </Reveal>
        </div>
        <div className={s.grid}>
          {CARDS.map((c, i) => (
            <Reveal key={c.role} delay={i * 0.1}>
              <Card c={c} onRole={onRole} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
