'use client';

import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { EASE, Eyebrow, Reveal, SplitWords } from './primitives';
import s from './home.module.css';

export const FAQS = [
  {
    q: 'What is Artistant?',
    a: 'A safer way to book live artists in India. Bookers find verified performers, sign a proper contract and pay into a protected account. Artists get paid in steps — half before they travel, a quarter when they arrive, and the rest after the show.',
  },
  {
    q: 'Is it free for artists?',
    a: 'Yes. Claiming your name and setting up your booking page is free. We only take a small fee when a booking happens through Artistant. Managers and touring acts can add PRO tools later if they want them.',
  },
  {
    q: 'What does “money held safely” mean?',
    a: 'When a booking is confirmed, the booker’s payment goes into a protected account with our regulated payment partners — not into anyone’s pocket. It’s released to the artist step by step as the show happens, so artists don’t chase payments and bookers never pay for a no-show.',
  },
  {
    q: 'What if part of the payment is in cash?',
    a: 'That’s fine. For weddings and private events, the booker pays 30–40% online to lock the date and hands over the rest in cash at soundcheck. The artist shares a 4-digit code once they’ve received it, and entering that code activates the contract and our protection.',
  },
  {
    q: 'What is the Bookability Score?',
    a: 'A score out of 100 built only from real Artistant bookings: showing up on time (35%), getting booked again (25%), rarely cancelling or having disputes (20%) and replying quickly (20%). Artists move from New to Rising, Trusted and Elite as it grows.',
  },
  {
    q: 'What happens if an artist cancels?',
    a: 'We line up a replacement with a similar score and sound within 90 minutes, and the booker’s money stays protected. If one member of a band falls sick, a trusted session musician nearby can step in through Backstage.',
  },
  {
    q: 'What are the fees?',
    a: 'A first booking has a 10% fee, split between the booker (4%) and the artist (6%). When the same booker books the same artist again, it drops to 3% in total. Venue residencies go down to 5% from the sixth show.',
  },
  {
    q: 'Why can’t everyone join straight away?',
    a: 'We add artists city by city based on what bookers are actually looking for, so everyone listed gets real work. Claim your name now and you’ll be first in line when your city and category open.',
  },
  {
    q: 'Where and when are you launching?',
    a: 'Bengaluru first, then Mumbai and Delhi NCR. Join the waitlist and we’ll email you the moment your spot opens.',
  },
];

function Item({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`${s.faqItem} ${open ? s.faqItemOpen : ''}`}>
      <button type="button" className={s.faqQ} onClick={() => setOpen((o) => !o)} aria-expanded={open}>
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
    <section id="faq" className={s.section} style={{ paddingTop: 0 }}>
      <div className={s.container}>
        <div className={s.faqGrid}>
          <div className={s.faqHead}>
            <Eyebrow>Questions</Eyebrow>
            <h2 className={s.h2}>
              <SplitWords text="Good questions." inView />
              <SplitWords text="Straight answers." inView delay={0.1} className={s.gradText} />
            </h2>
            <Reveal>
              <p className={s.lead}>
                Still wondering about something? Write to us at{' '}
                <a href="mailto:hello@artistant.in" style={{ color: 'var(--ink)' }}>
                  hello@artistant.in
                </a>
                .
              </p>
            </Reveal>
          </div>
          <Reveal>
            <div className={s.faqList}>
              {FAQS.map((f) => (
                <Item key={f.q} q={f.q} a={f.a} />
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
