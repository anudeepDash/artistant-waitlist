'use client';

import React from 'react';
import { motion } from 'motion/react';
import { CheckIcon, EASE } from './primitives';
import s from './screens.module.css';

/*
 * App screens drawn in the app's own language: the one dark room, serif titles,
 * money in mono, one accent colour per side of the stage.
 */

export function ProfileScreen({ username }: { username: string }) {
  const name = username || 'yourname';
  const days = [
    ['Fri', '18', true],
    ['Sat', '19', false],
    ['Sun', '20', true],
    ['Fri', '25', true],
    ['Sat', '26', true],
  ] as const;
  return (
    <div className={s.scr} style={{ '--accent': 'var(--brand-orange)' } as React.CSSProperties}>
      <div className={s.url}>
        <span className={s.lock} aria-hidden="true" />
        artistant.in/<b>{name}</b>
      </div>
      <div className={s.cover} style={{ backgroundImage: 'url(/photos/dj-stage.webp)' }}>
        <span className={s.coverTag}>▶ 0:42 live set</span>
      </div>
      <div className={s.profile}>
        <span className={s.avatar}>{name[0]?.toUpperCase()}</span>
        <div className={s.profileText}>
          <div className={s.name}>@{name}</div>
          <div className={s.meta}>DJ · Bengaluru</div>
        </div>
        <span className={s.score}>
          82<small>Trusted</small>
        </span>
      </div>
      <div className={s.priceRow}>
        <span>From</span>
        <b>₹40,000</b>
        <span>/ 90 min set</span>
      </div>
      <div className={s.kicker}>Open dates</div>
      <div className={s.days}>
        {days.map(([d, n, open]) => (
          <span key={d + n} className={open ? s.dayOpen : s.dayBusy}>
            <small>{d}</small>
            {n}
          </span>
        ))}
      </div>
      <div className={s.chips}>
        <span>Tech rider</span>
        <span>Videos</span>
        <span>Reviews</span>
      </div>
      <div className={s.cta}>Request a booking</div>
    </div>
  );
}

export function DiscoverScreen() {
  const small = [
    { img: '/photos/sitar.webp', name: 'Sitar recital', meta: 'Classical · 2 pc', price: '₹25,000' },
    { img: '/photos/dj-hands.webp', name: 'Club DJ set', meta: 'Bollywood · House', price: '₹35,000' },
  ];
  return (
    <div className={s.scr} style={{ '--accent': 'var(--brand-violet)' } as React.CSSProperties}>
      <div className={s.head}>
        <div className={s.h1}>Discover</div>
        <div className={s.meta}>Bengaluru · this weekend</div>
      </div>
      <div className={s.search}>⌕ Search artists, genres, cities</div>
      <div className={s.filters}>
        <span className={s.filterOn}>For you</span>
        <span>Bands</span>
        <span>DJs</span>
        <span>Classical</span>
      </div>
      <div className={s.feature} style={{ backgroundImage: 'url(/photos/band-stage.webp)' }}>
        <span className={s.featureTag}>Verified</span>
        <div className={s.featureText}>
          <div className={s.name}>Indie folk band</div>
          <div className={s.meta}>5 pc · 82 score · <b className={s.money}>₹42,000</b> / 90 min</div>
        </div>
      </div>
      <div className={s.grid2}>
        {small.map((a) => (
          <div key={a.name} className={s.tile}>
            <span className={s.tileImg} style={{ backgroundImage: `url(${a.img})` }} />
            <div className={s.tileName}>{a.name}</div>
            <div className={s.meta}>{a.meta}</div>
            <div className={s.money}>{a.price}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function VenueScreen() {
  const nights = [
    { d: 'Thu', n: '17', what: 'Acoustic night', who: 'Booked · 2 pc duo', ok: true },
    { d: 'Fri', n: '18', what: 'Bollywood DJ night', who: 'Booked · contract signed', ok: true },
    { d: 'Sat', n: '19', what: 'Live band', who: '3 artists sent quotes', ok: false },
    { d: 'Sun', n: '20', what: 'Open mic', who: 'Open — post it', ok: false },
  ];
  return (
    <div className={s.scr} style={{ '--accent': 'var(--brand-blue)' } as React.CSSProperties}>
      <div className={s.head}>
        <div className={s.meta}>Your space · Indiranagar</div>
        <div className={s.h1}>
          This <em>week</em>
        </div>
      </div>
      <div className={s.list}>
        {nights.map((x, i) => (
          <motion.div
            key={x.n}
            className={s.night}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 + i * 0.12, duration: 0.5, ease: EASE }}
          >
            <span className={s.date}>
              <small>{x.d}</small>
              {x.n}
            </span>
            <span className={s.nightText}>
              <b>{x.what}</b>
              <span>{x.who}</span>
            </span>
            <span className={x.ok ? s.tick : s.pending}>{x.ok ? <CheckIcon size={9} /> : '•'}</span>
          </motion.div>
        ))}
      </div>
      <div className={s.resid}>
        <div className={s.kicker}>Residency</div>
        <div className={s.residText}>Jazz Thursdays · 8 weeks · same trio</div>
      </div>
      <div className={s.cta}>Post a night</div>
    </div>
  );
}

export function PaidScreen() {
  const rows = [
    ['Contract signed', '₹90,000', true],
    ['Checked in at soundcheck', '₹45,000', true],
    ['2 hours after the show', '₹45,000', false],
  ] as const;
  return (
    <div className={s.scr} style={{ '--accent': 'var(--brand-orange)' } as React.CSSProperties}>
      <div className={s.head}>
        <div className={s.meta}>Wedding sangeet · Jaipur</div>
        <div className={s.h1}>
          Sat, <em>14 Dec</em>
        </div>
      </div>
      <div className={s.card}>
        <div className={s.kicker}>Your fee</div>
        <div className={s.amount}>₹1,80,000</div>
        <div className={s.safe}>● Held safely for you</div>
        <div className={s.bar}>
          <motion.span
            className={s.barFill}
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 0.75 }}
            viewport={{ once: true }}
            transition={{ duration: 1.3, ease: EASE, delay: 0.3 }}
          />
        </div>
      </div>
      <div className={s.card}>
        {rows.map(([t, a, done], i) => (
          <div key={t} className={s.row}>
            <span className={done ? s.tick : s.pending}>{done ? <CheckIcon size={9} /> : i + 1}</span>
            <span className={s.rowText}>{t}</span>
            <span className={s.money}>{a}</span>
          </div>
        ))}
      </div>
      <div className={s.note}>Cash part? Confirm it with a 4-digit code.</div>
    </div>
  );
}

export function BackupScreen() {
  const people = [
    { i: 'A', name: 'Arjun · drums', meta: '88 score · 2.1 km', ok: true },
    { i: 'M', name: 'Meera · drums', meta: '91 score · 4.8 km' },
    { i: 'R', name: 'Rohit · drums', meta: '84 score · 6.3 km' },
  ];
  return (
    <div className={s.scr} style={{ '--accent': 'var(--brand-pink)' } as React.CSSProperties}>
      <div className={s.head}>
        <div className={s.meta}>Backstage</div>
        <div className={s.h1}>
          SOS <em>sent</em>
        </div>
      </div>
      <div className={s.sos}>
        <span className={s.sosTag}>● Tonight · 8 PM</span>
        <b>Need a drummer</b>
        <span className={s.meta}>Indiranagar · paid from the gig</span>
      </div>
      <div className={s.card}>
        {people.map((p, i) => (
          <motion.div
            key={p.name}
            className={s.row}
            initial={{ opacity: 0, x: 16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 + i * 0.22, duration: 0.5, ease: EASE }}
          >
            <span className={s.face}>{p.i}</span>
            <span className={s.rowText}>
              {p.name}
              <small>{p.meta}</small>
            </span>
            {p.ok && <span className={s.accepted}>On it</span>}
          </motion.div>
        ))}
      </div>
      <div className={s.ctaSoft}>Arjun is 12 min away</div>
    </div>
  );
}
