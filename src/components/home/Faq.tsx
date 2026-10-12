'use client';

import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { EASE, Reveal } from './primitives';
import s from './home.module.css';

export const FAQS = [
  {
    q: 'What is Artistant?',
    a: 'An app for booking live artists in India. Clients find you, sign a proper contract and pay your full fee into a safe account before the show. You get half before you travel, a quarter at soundcheck and the rest after the show. No chasing, no ghosting, no middlemen.',
  },
  {
    q: 'Is it really free for artists?',
    a: 'Yes. Claiming your name and setting up your booking page costs nothing. We only take a small fee when you get booked through Artistant — 6% the first time with a new client, and just 1% when they book you again.',
  },
  {
    q: 'How do I get paid before the gig?',
    a: 'The moment the contract is signed, 50% of your fee is released to you — enough for flights, hotel and paying your band. Another 25% lands when you check in at soundcheck, and the last 25% two hours after the show.',
  },
  {
    q: 'My client wants to pay in cash. Is that okay?',
    a: 'Yes. For weddings and private events, the client pays 30–40% online to lock the date and hands you the rest in cash at soundcheck. You share a 4-digit code once you have it, and your contract and protection switch on.',
  },
  {
    q: 'What if I fall sick or can’t make it?',
    a: 'Life happens. We line up a replacement with a similar score and sound within 90 minutes so the show goes on. If just one bandmate is out, send an SOS on Backstage and trusted session players nearby get pinged.',
  },
  {
    q: 'What’s a Bookability Score?',
    a: 'A score out of 100 built only from real Artistant bookings: showing up on time, getting booked again, rarely cancelling and replying fast. It grows with every good show — and higher scores get the bigger gigs.',
  },
  {
    q: 'My city or category isn’t open yet. What now?',
    a: 'Claim your name anyway. We open city by city and category by category so every listed artist actually gets work. Bengaluru is first, then Mumbai and Delhi NCR — you’ll be first in line when yours opens.',
  },
  {
    q: 'I manage a few artists. Is there something for me?',
    a: 'Yes — Artistant PRO. One calendar for your whole roster, a booking page on your own domain, 0% Artistant fee on clients you bring yourself, and automatic payouts to band and crew.',
  },
];

function Item({ q, a, i }: { q: string; a: string; i: number }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`${s.faqItem} ${open ? s.faqItemOpen : ''}`}>
      <button type="button" className={s.faqQ} onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        <span className={s.faqNum}>{String(i + 1).padStart(2, '0')}</span>
        {q}
        <motion.span className={s.faqPlus} animate={{ rotate: open ? 45 : 0 }} transition={{ duration: 0.35, ease: EASE }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
            <path d="M12 5v14M5 12h14" />
          </svg>
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            className={s.faqA}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.45, ease: EASE }}
          >
            <p className={s.faqAInner}>{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Faq() {
  return (
    <section id="faq" className={s.section}>
      <div className={s.container}>
        <div className={s.faqGrid}>
          <div className={s.faqHead}>
            <Reveal>
              <span className={s.label}>FAQ</span>
            </Reveal>
            <Reveal delay={0.05}>
              <h2 className={s.faqTitle}>
                Good questions, <em>straight answers.</em>
              </h2>
            </Reveal>
            <Reveal delay={0.1}>
              <p className={s.lead}>
                Anything else? Write to us at{' '}
                <a href="mailto:hello@artistant.in" style={{ color: 'var(--ink)' }}>
                  hello@artistant.in
                </a>
                .
              </p>
            </Reveal>
          </div>
          <Reveal>
            <div className={s.faqList}>
              {FAQS.map((f, i) => (
                <Item key={f.q} q={f.q} a={f.a} i={i} />
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
