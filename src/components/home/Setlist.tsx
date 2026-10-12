'use client';

import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import Phone from './Phone';
import { BackupScreen, PaidScreen, ProfileScreen } from './Screens';
import { CheckIcon, EASE, Reveal } from './primitives';
import s from './setlist.module.css';
import base from './home.module.css';

const TRACKS = [
  {
    id: 'paid',
    tag: 'Get paid',
    stat: '50 · 25 · 25',
    title: (
      <>
        Half before you <em>travel.</em>
      </>
    ),
    text: 'The client pays your full fee into a safe account before the show. You get 50% when the contract is signed, 25% when you check in at soundcheck, and the last 25% two hours after the show.',
    points: ['Cash gig? Still covered with a 4-digit code', 'GST invoices made for you', 'Nobody to chase. Ever.'],
  },
  {
    id: 'booked',
    tag: 'Get booked',
    stat: 'artistant.in/you',
    title: (
      <>
        One link. <em>Every gig.</em>
      </>
    ),
    text: 'Your booking page has your videos, open dates, prices and tech rider in one place. Clients find you, check your dates and book you straight from it.',
    points: ['Only active artists are listed, so you don’t get lost', 'Your tech rider is checked against the venue’s gear', 'Big event? Our team helps you close it'],
  },
  {
    id: 'backup',
    tag: 'Get backup',
    stat: '90 min',
    title: (
      <>
        Bandmate down? <em>Covered.</em>
      </>
    ),
    text: 'Send an SOS and trusted session players nearby get pinged. If you can’t make a show, we find a replacement with a similar score and sound within 90 minutes.',
    points: ['Find sound engineers who know your mixer', 'Rent gear on tour instead of shipping it', 'Honest venue notes from other artists'],
  },
  {
    id: 'rated',
    tag: 'Get rated',
    stat: 'Score / 100',
    title: (
      <>
        Respect, earned <em>on stage.</em>
      </>
    ),
    text: 'Your Bookability Score is built only from real shows: turning up on time, getting booked again, rarely cancelling and replying fast. No fake reviews. No buying stars.',
    points: ['New → Rising → Trusted → Elite', 'Higher score, bigger gigs', 'Same client books you again? Your fee drops to 1%'],
  },
];

function Screen({ i, username }: { i: number; username: string }) {
  if (i === 0) return <PaidScreen />;
  if (i === 1) return <ProfileScreen username={username} />;
  if (i === 2) return <BackupScreen />;
  return null;
}

function TrackPhone({ i, username, width }: { i: number; username: string; width: number }) {
  // The score screen is a real screenshot from the app.
  if (i === 3) {
    return (
      <Phone width={width} bare>
        <img src="/mockups/screen_13.jpg" alt="The Bookability Score screen in the Artistant app, showing a score of 82, Trusted" />
      </Phone>
    );
  }
  return (
    <Phone width={width}>
      <Screen i={i} username={username} />
    </Phone>
  );
}

export default function Setlist({ username }: { username: string }) {
  const [active, setActive] = useState(0);

  return (
    <section id="features" className={s.section}>
      <div className={base.container}>
        <div className={s.head}>
          <Reveal>
            <span className={base.label}>What you get</span>
          </Reveal>
          <Reveal delay={0.05}>
            <h2 className={base.title}>
              The business side, <em>handled.</em>
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className={base.lead}>Four things every working artist needs, and almost nobody has. All in one app, all free to set up.</p>
          </Reveal>
        </div>

        <div className={s.grid}>
          <ol className={s.tracks}>
            {TRACKS.map((t, i) => (
              <motion.li
                key={t.id}
                className={`${s.track} ${i === active ? s.trackOn : ''}`}
                onViewportEnter={() => setActive(i)}
                viewport={{ margin: '-45% 0px -45% 0px' }}
              >
                <div className={s.trackTop}>
                  <span className={s.num}>{String(i + 1).padStart(2, '0')}</span>
                  <span className={s.tag}>{t.tag}</span>
                  <span className={s.stat}>{t.stat}</span>
                </div>
                <h3 className={s.trackTitle}>{t.title}</h3>
                <p className={s.text}>{t.text}</p>
                <ul className={s.points}>
                  {t.points.map((p) => (
                    <li key={p}>
                      <span className={s.check}>
                        <CheckIcon size={10} />
                      </span>
                      {p}
                    </li>
                  ))}
                </ul>
                <div className={s.inlinePhone}>
                  <TrackPhone i={i} username={username} width={260} />
                </div>
              </motion.li>
            ))}
          </ol>

          <div className={s.stickyCol}>
            <div className={s.sticky}>
              <div className={s.rail} aria-hidden="true">
                {TRACKS.map((t, i) => (
                  <span key={t.id} className={`${s.railItem} ${i === active ? s.railOn : ''}`}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                ))}
              </div>
              <div className={s.phone}>
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={active}
                    initial={{ opacity: 0, y: 40, rotate: 3 }}
                    animate={{ opacity: 1, y: 0, rotate: 0 }}
                    exit={{ opacity: 0, y: -30, rotate: -2 }}
                    transition={{ duration: 0.5, ease: EASE }}
                  >
                    <TrackPhone i={active} username={username} width={300} />
                  </motion.div>
                </AnimatePresence>
                <div className={s.glow} aria-hidden="true" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
