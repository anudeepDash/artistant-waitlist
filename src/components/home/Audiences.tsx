'use client';

import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowIcon, CheckIcon, EASE, Eyebrow, Reveal, SplitWords } from './primitives';
import s from './home.module.css';

type Action = 'claim' | 'organizer' | 'venue';

const AUDIENCES: {
  id: string;
  tab: string;
  who: string;
  title: string;
  points: string[];
  big: string;
  bigSub: string;
  img: string;
  tint: string;
  cta: string;
  action: Action;
}[] = [
  {
    id: 'artists',
    tab: 'Artists',
    who: 'Singers, bands, DJs, comics and every live act',
    title: 'Get paid on time. Every time.',
    points: [
      'Half your fee before you travel',
      'Your own booking page at artistant.in/yourname',
      'A trust score that grows with every good show',
      'Lower fees when clients book you again',
      'Backstage: stand-ins, sound crew and gear when you need them',
    ],
    big: '50%',
    bigSub: 'of your fee, paid the moment the contract is signed.',
    img: '/gallery_3.png',
    tint: 'linear-gradient(135deg, #F25A2B, #D4567A)',
    cta: 'Claim your name',
    action: 'claim',
  },
  {
    id: 'bookers',
    tab: 'Bookers',
    who: 'Event companies, wedding planners and college fest teams',
    title: 'Book with real peace of mind.',
    points: [
      'Verified artists with a real track record',
      'Clear prices — no middleman markups',
      'A proper contract for every booking',
      'GST invoices and TDS handled for companies',
      'A replacement within 90 minutes if anything goes wrong',
      'A real person to help with big events',
    ],
    big: '90 min',
    bigSub: 'to line up a replacement if your artist can’t make it.',
    img: '/gallery_4.png',
    tint: 'linear-gradient(135deg, #7C5CFF, #00F0FF)',
    cta: 'Join as a booker',
    action: 'organizer',
  },
  {
    id: 'venues',
    tab: 'Venues',
    who: 'Cafés, lounges, clubs and hotels with live nights · Artistant Residencies',
    title: 'Live nights every week. No paperwork.',
    points: [
      'Book a resident act for 4 or 8 weeks at a time',
      'Pay week by week — not two months up front',
      'One GST invoice a month, for everything',
      'Fees drop from 10% to 7% to 5% the longer you go',
      'An automatic stand-in if your act is sick or stuck',
      'Or rotate through a shortlist of artists you love',
    ],
    big: '5%',
    bigSub: 'fees from your 6th show — cheaper than doing it by hand.',
    img: '/gallery_1.png',
    tint: 'linear-gradient(135deg, #D4567A, #7C5CFF)',
    cta: 'Join as a venue',
    action: 'venue',
  },
  {
    id: 'pro',
    tab: 'Managers & top acts',
    who: 'Artist managers, agencies and touring acts · Artistant PRO',
    title: 'Run your whole roster from one place.',
    points: [
      'A booking page on your own domain',
      '0% Artistant fee on clients you bring yourself',
      'One calendar for every artist — no double bookings',
      'Pay band, sound and crew their share automatically',
      'GST reports and invoices done for you',
      'See who viewed your profile, from which city, at what budget',
    ],
    big: '0%',
    bigSub: 'Artistant fee on bookings from your own clients.',
    img: '/gallery_6.png',
    tint: 'linear-gradient(135deg, #5A32FA, #F25A2B)',
    cta: 'Get early access',
    action: 'claim',
  },
];

export default function Audiences({ onAction }: { onAction: (action: Action) => void }) {
  const [active, setActive] = useState(AUDIENCES[0].id);
  const current = AUDIENCES.find((a) => a.id === active) ?? AUDIENCES[0];

  return (
    <section id="for-you" className={s.section}>
      <div className={s.container}>
        <div className={s.sectionHead}>
          <Eyebrow>Who it’s for</Eyebrow>
          <h2 className={s.h2}>
            <SplitWords text="One platform for" inView />
            <SplitWords text="everyone on the bill." inView delay={0.1} className={s.gradText} />
          </h2>
        </div>

        <Reveal>
          <div className={s.tabs} role="tablist" aria-label="Who Artistant is for">
            {AUDIENCES.map((a) => (
              <button
                key={a.id}
                type="button"
                role="tab"
                aria-selected={a.id === active}
                aria-controls={`aud-panel-${a.id}`}
                className={`${s.tab} ${a.id === active ? s.tabActive : ''}`}
                onClick={() => setActive(a.id)}
              >
                {a.id === active && (
                  <motion.span layoutId="aud-pill" className={s.tabPill} transition={{ type: 'spring', stiffness: 380, damping: 32 }} />
                )}
                <span className={s.tabLabel}>{a.tab}</span>
              </button>
            ))}
          </div>
        </Reveal>

        <Reveal>
          <div className={s.audPanel} role="tabpanel" id={`aud-panel-${current.id}`}>
            <AnimatePresence mode="wait">
              <motion.div
                key={current.id}
                className={s.audText}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.45, ease: EASE }}
              >
                <div className={s.audWho}>{current.who}</div>
                <h3 className={s.audTitle}>{current.title}</h3>
                <ul className={s.checklist}>
                  {current.points.map((p, i) => (
                    <motion.li
                      key={p}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 + i * 0.05, duration: 0.4, ease: EASE }}
                    >
                      <span className={s.checkIcon}>
                        <CheckIcon size={11} />
                      </span>
                      {p}
                    </motion.li>
                  ))}
                </ul>
                <div className={s.audCta}>
                  <button type="button" className={s.btnPrimary} onClick={() => onAction(current.action)}>
                    {current.cta} <ArrowIcon size={14} />
                  </button>
                </div>
              </motion.div>
            </AnimatePresence>

            <div className={s.audArt}>
              <AnimatePresence mode="popLayout">
                <motion.img
                  key={current.img}
                  src={current.img}
                  alt=""
                  className={s.audArtImg}
                  initial={{ opacity: 0, scale: 1.08 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.8, ease: EASE }}
                />
              </AnimatePresence>
              <motion.div className={s.audArtTint} animate={{ background: current.tint }} transition={{ duration: 0.6 }} />
              <div className={s.audArtShade} />
              <AnimatePresence mode="wait">
                <motion.div
                  key={current.id}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.5, ease: EASE }}
                >
                  <div className={`${s.audBig} ${s.gradText}`}>{current.big}</div>
                  <div className={s.audBigSub}>{current.bigSub}</div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export type { Action as AudienceAction };
