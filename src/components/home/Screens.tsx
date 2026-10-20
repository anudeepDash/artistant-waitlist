'use client';

import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { CheckIcon, EASE } from './primitives';
import s from './screens.module.css';

/*
 * App screens drawn in the app's own language: the one dark room, bold grotesk titles,
 * money in mono, one accent colour per side of the stage.
 */

// Artists come in every shape, so the booking page cycles through a few of them.
const ACTS = [
  { kind: 'Live band', photo: '/photos/band-stage.webp', meta: 'Indie folk · 5 piece', price: '₹42,000', set: '90 min', score: 86, gigs: 41 },
  { kind: 'Sitar', photo: '/photos/sitar.webp', meta: 'Hindustani classical', price: '₹25,000', set: '60 min', score: 91, gigs: 63 },
  { kind: 'DJ', photo: '/photos/dj-stage.webp', meta: 'Bollywood · House', price: '₹35,000', set: '3 hr', score: 82, gigs: 37 },
  { kind: 'Folk dance', photo: '/photos/garba.webp', meta: 'Garba troupe · 8 dancers', price: '₹60,000', set: '45 min', score: 88, gigs: 29 },
  { kind: 'Tabla', photo: '/photos/tabla.webp', meta: 'Solo & accompaniment', price: '₹18,000', set: '60 min', score: 89, gigs: 52 },
];

const DAYS = [
  ['Fri', '18', true],
  ['Sat', '19', false],
  ['Sun', '20', true],
  ['Fri', '25', true],
  ['Sat', '26', true],
] as const;

/** An artist's booking page, edge to edge. Use inside <Phone edge>. */
export function ProfileScreen({ username, cycle = true }: { username: string; cycle?: boolean }) {
  const name = username || 'yourname';
  const reduce = useReducedMotion();
  const [i, setI] = useState(0);
  const act = ACTS[i];

  useEffect(() => {
    if (!cycle || reduce) return;
    const id = setInterval(() => setI((n) => (n + 1) % ACTS.length), 3200);
    return () => clearInterval(id);
  }, [cycle, reduce]);

  return (
    <div className={s.page} style={{ '--accent': 'var(--brand-orange)' } as React.CSSProperties}>
      <div className={s.hero}>
        <AnimatePresence initial={false}>
          <motion.img
            key={act.photo}
            src={act.photo}
            alt=""
            className={s.heroImg}
            initial={{ opacity: 0, scale: 1.12 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ opacity: { duration: 0.6 }, scale: { duration: 3.4, ease: 'linear' } }}
          />
        </AnimatePresence>
        <div className={s.heroShade} />
        <div className={s.heroTop}>
          <span className={s.url}>
            artistant.in/<b>{name}</b>
          </span>
        </div>
        <div className={s.heroText}>
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={act.kind}
              className={s.kind}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
            >
              {act.kind}
            </motion.span>
          </AnimatePresence>
          <div className={s.bigName}>
            @{name}
            <span className={s.verified} aria-label="Verified">
              <CheckIcon size={8} />
            </span>
          </div>
          <div className={s.heroMeta}>{act.meta} · Bengaluru</div>
        </div>
      </div>

      <div className={s.pageBody}>
        <div className={s.stats}>
          <div>
            <b className={s.scoreNum}>{act.score}</b>
            <span>Score</span>
          </div>
          <div>
            <b>{act.gigs}</b>
            <span>Gigs</span>
          </div>
          <div>
            <b>{act.price}</b>
            <span>{act.set} set</span>
          </div>
        </div>

        <div className={s.kicker}>Open dates</div>
        <div className={s.days}>
          {DAYS.map(([d, n, open]) => (
            <span key={d + n} className={open ? s.dayOpen : s.dayBusy}>
              <small>{d}</small>
              {n}
            </span>
          ))}
        </div>

        <div className={s.cta}>Check dates & book</div>
      </div>
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

/* ───────────── Host screens ───────────── */

export function QuoteScreen() {
  const lines = [
    ['Artist fee · 90 min set', '₹42,000'],
    ['Booking fee · 4%', '₹1,680'],
    ['Agency commission', '₹0'],
  ];
  return (
    <div className={s.scr} style={{ '--accent': 'var(--brand-violet)' } as React.CSSProperties}>
      <div className={s.quoteCover} style={{ backgroundImage: 'url(/photos/band-stage.webp)' }}>
        <span className={s.featureTag}>Verified</span>
      </div>
      <div className={s.head}>
        <div className={s.meta}>Indie folk band · 5 piece</div>
        <div className={s.h1}>
          Your <em>quote</em>
        </div>
      </div>
      <div className={s.card}>
        {lines.map(([t, a]) => (
          <div key={t} className={s.row}>
            <span className={s.rowText}>{t}</span>
            <span className={s.money}>{a}</span>
          </div>
        ))}
        <div className={`${s.row} ${s.totalRow}`}>
          <span className={s.rowText}>You pay</span>
          <span className={s.money}>₹43,680</span>
        </div>
      </div>
      <div className={s.note}>GST invoice included. Book them again later for a 2% fee.</div>
      <div className={s.cta}>Book for Sat, 14 Dec</div>
    </div>
  );
}

export function HostPayScreen() {
  const rows = [
    ['Paid into safe account', 'Today', true],
    ['Contract signed by both', 'Today', true],
    ['Artist checks in', 'Sat, 6 PM', false],
    ['Show done, artist fully paid', 'Sat, 11 PM', false],
  ] as const;
  return (
    <div className={s.scr} style={{ '--accent': 'var(--brand-violet)' } as React.CSSProperties}>
      <div className={s.head}>
        <div className={s.meta}>Sangeet · Jaipur</div>
        <div className={s.h1}>
          Money, <em>safe.</em>
        </div>
      </div>
      <div className={s.card}>
        <div className={s.kicker}>Held safely</div>
        <div className={s.amount}>₹43,680</div>
        <div className={s.safe}>● Not in anyone&apos;s personal account</div>
      </div>
      <div className={s.card}>
        {rows.map(([t, when, done], i) => (
          <div key={t} className={s.row}>
            <span className={done ? s.tick : s.pending}>{done ? <CheckIcon size={9} /> : i + 1}</span>
            <span className={s.rowText}>
              {t}
              <small>{when}</small>
            </span>
          </div>
        ))}
      </div>
      <div className={s.note}>Paying part in cash? Hand it over at soundcheck and the artist confirms with a code.</div>
    </div>
  );
}

export function HostBackupScreen() {
  return (
    <div className={s.scr} style={{ '--accent': 'var(--brand-violet)' } as React.CSSProperties}>
      <div className={s.head}>
        <div className={s.meta}>Office party · Fri, 8 PM</div>
        <div className={s.h1}>
          Show <em>saved.</em>
        </div>
      </div>
      <div className={s.alert}>
        <span className={s.sosTag}>● 2:14 PM</span>
        <b>Your singer is unwell</b>
        <span className={s.meta}>We&apos;re finding a match now</span>
      </div>
      <motion.div
        className={s.matchCard}
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.5, duration: 0.6, ease: EASE }}
      >
        <span className={s.matchImg} style={{ backgroundImage: 'url(/photos/sitar.webp)' }} />
        <div className={s.rowText}>
          <b>Replacement confirmed</b>
          <small>Acoustic duo · 88 score · same budget</small>
        </div>
        <span className={s.tick}>
          <CheckIcon size={9} />
        </span>
      </motion.div>
      <div className={s.card}>
        <div className={s.row}>
          <span className={s.rowText}>Found in</span>
          <span className={s.money}>38 min</span>
        </div>
        <div className={s.row}>
          <span className={s.rowText}>Extra cost to you</span>
          <span className={s.money}>₹0</span>
        </div>
      </div>
      <div className={s.cta}>See the new line-up</div>
    </div>
  );
}

/* ───────────── Venue screens ───────────── */

export function ResidencyScreen() {
  const weeks = [true, true, true, false, false, false, false, false];
  return (
    <div className={s.scr} style={{ '--accent': 'var(--brand-blue)' } as React.CSSProperties}>
      <div className={s.quoteCover} style={{ backgroundImage: 'url(/photos/mixer.webp)' }}>
        <span className={s.featureTag}>Residency</span>
      </div>
      <div className={s.head}>
        <div className={s.meta}>Jazz trio · Thursdays, 8 PM</div>
        <div className={s.h1}>
          Week <em>3 of 8</em>
        </div>
      </div>
      <div className={s.weeks}>
        {weeks.map((done, i) => (
          <span key={i} className={done ? s.weekDone : s.weekNext}>
            {done ? <CheckIcon size={9} /> : i + 1}
          </span>
        ))}
      </div>
      <div className={s.card}>
        <div className={s.row}>
          <span className={s.rowText}>
            Held for the next 14 days
            <small>Rolling, not two months upfront</small>
          </span>
          <span className={s.money}>₹36,000</span>
        </div>
        <div className={s.row}>
          <span className={s.rowText}>
            Paid to the trio this week
            <small>After Thursday&apos;s show</small>
          </span>
          <span className={s.money}>₹18,000</span>
        </div>
      </div>
      <div className={s.cta}>Extend to 12 weeks</div>
    </div>
  );
}

export function SubScreen() {
  return (
    <div className={s.scr} style={{ '--accent': 'var(--brand-blue)' } as React.CSSProperties}>
      <div className={s.head}>
        <div className={s.meta}>Thu, 24 Oct · Jazz Thursdays</div>
        <div className={s.h1}>
          Stage <em>covered.</em>
        </div>
      </div>
      <div className={s.alert}>
        <span className={s.sosTag}>● Resident unavailable</span>
        <b>Your jazz trio is unwell</b>
        <span className={s.meta}>No action needed from you</span>
      </div>
      <motion.div
        className={s.matchCard}
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.5, duration: 0.6, ease: EASE }}
      >
        <span className={s.matchImg} style={{ backgroundImage: 'url(/photos/band-stage.webp)' }} />
        <div className={s.rowText}>
          <b>Swing quartet is on</b>
          <small>Elite 90+ · similar sound · same fee</small>
        </div>
        <span className={s.tick}>
          <CheckIcon size={9} />
        </span>
      </motion.div>
      <div className={s.card}>
        <div className={s.row}>
          <span className={s.rowText}>Tech rider</span>
          <span className={s.money}>Fits your gear</span>
        </div>
        <div className={s.row}>
          <span className={s.rowText}>Confirmed</span>
          <span className={s.money}>40 min</span>
        </div>
      </div>
    </div>
  );
}

export function InvoiceScreen() {
  const lines = [
    ['Jazz Thursdays · 4 shows', '₹72,000'],
    ['Weekend DJ · 4 shows', '₹1,12,000'],
    ['Acoustic brunch · 1 show', '₹15,000'],
    ['Platform fee · 5% to 7%', '₹11,410'],
  ];
  return (
    <div className={s.scr} style={{ '--accent': 'var(--brand-blue)' } as React.CSSProperties}>
      <div className={s.head}>
        <div className={s.meta}>Your space · Indiranagar</div>
        <div className={s.h1}>
          October <em>invoice</em>
        </div>
      </div>
      <div className={s.card}>
        <div className={s.kicker}>9 shows · one GST invoice</div>
        {lines.map(([t, a]) => (
          <div key={t} className={s.row}>
            <span className={s.rowText}>{t}</span>
            <span className={s.money}>{a}</span>
          </div>
        ))}
        <div className={`${s.row} ${s.totalRow}`}>
          <span className={s.rowText}>Total before GST</span>
          <span className={s.money}>₹2,10,410</span>
        </div>
      </div>
      <div className={s.note}>Fees drop the longer you keep booking the same acts.</div>
      <div className={s.cta}>Download invoice</div>
    </div>
  );
}
