'use client';

import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { ArrowIcon, CheckIcon, Reveal } from './primitives';
import { SIDE_ORDER, type Role, type Side } from './sides';
import s from './other.module.css';
import base from './home.module.css';

const CARDS: Record<
  Side,
  {
    cls: string;
    tag: string;
    img: string;
    alt: string;
    title: React.ReactNode;
    text: string;
    points: string[];
    cta: string;
    role?: Role;
    page: string;
  }
> = {
  artist: {
    cls: base.roleArtist,
    tag: 'For artists',
    img: '/photos/dj-hands.webp',
    alt: 'A DJ’s hands on the decks',
    title: (
      <>
        Get paid. <em>Not ghosted.</em>
      </>
    ),
    text: 'Bands, DJs, singers, classical and folk acts. Your own booking page, a real contract and half your fee before you travel.',
    points: ['Free booking page at artistant.in/yourname', 'Half your fee before you travel', 'A backup if you can’t make it'],
    cta: 'Claim your name',
    page: 'See the artist page',
  },
  host: {
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
    points: ['Verified artists with clear prices', 'Your money is held safely until the show is done', 'Artist drops out? A backup within 90 minutes'],
    cta: 'Join as a host',
    role: 'organizer',
    page: 'See the host page',
  },
  venue: {
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
    points: ['One monthly GST invoice for all your shows', 'Fees go down the longer you book the same act', 'Resident artist sick? A matched replacement'],
    cta: 'List your space',
    role: 'venue',
    page: 'See the venue page',
  },
};

const TITLE: Record<Side, React.ReactNode> = {
  artist: (
    <>
      Booking an artist? <em>Same safe deal.</em>
    </>
  ),
  host: (
    <>
      Artist or venue? <em>There’s a page for you.</em>
    </>
  ),
  venue: (
    <>
      Artist or host? <em>There’s a page for you.</em>
    </>
  ),
};

function Card({ k, onSide, onRole }: { k: Side; onSide: (side: Side) => void; onRole: (role: Role) => void }) {
  const c = CARDS[k];
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], ['-10%', '10%']);

  return (
    <article ref={ref} className={`${s.card} ${c.cls}`}>
      <div className={s.media}>
        <motion.img src={c.img} alt={c.alt} style={{ y }} loading="lazy" />
      </div>
      <div className={s.body}>
        <span className={`${base.label} ${s.cardLabel}`}>{c.tag}</span>
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
        <div className={s.actions}>
          {c.role ? (
            <button type="button" className={base.btnAccent} onClick={() => onRole(c.role!)}>
              {c.cta} <ArrowIcon size={15} />
            </button>
          ) : null}
          <button type="button" className={c.role ? s.pageLink : base.btnAccent} onClick={() => onSide(k)}>
            {c.role ? c.page : c.cta} {c.role ? <span aria-hidden="true">↑</span> : <ArrowIcon size={15} />}
          </button>
        </div>
      </div>
    </article>
  );
}

export default function OtherSide({ side, onSide, onRole }: { side: Side; onSide: (side: Side) => void; onRole: (role: Role) => void }) {
  return (
    <section id="others" className={s.section}>
      <div className={base.container}>
        <div className={s.head}>
          <Reveal>
            <span className={base.label}>The other side of the stage</span>
          </Reveal>
          <Reveal delay={0.05}>
            <h2 className={base.title}>{TITLE[side]}</h2>
          </Reveal>
        </div>
        <div className={s.grid}>
          {SIDE_ORDER.filter((k) => k !== side).map((k, i) => (
            <Reveal key={k} delay={i * 0.1}>
              <Card k={k} onSide={onSide} onRole={onRole} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
