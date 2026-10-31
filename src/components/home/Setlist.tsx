'use client';

import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import Phone, { PhoneBody } from './Phone';
import {
  BackupScreen,
  DiscoverScreen,
  HostBackupScreen,
  HostPayScreen,
  InvoiceScreen,
  PaidScreen,
  ProfileScreen,
  QuoteScreen,
  ResidencyScreen,
  SubScreen,
  VenueScreen,
} from './Screens';
import { CheckIcon, EASE, Reveal } from './primitives';
import { SETLIST, type ScreenKey, type Side } from './sides';
import s from './setlist.module.css';
import base from './home.module.css';

function Screen({ k }: { k: Exclude<ScreenKey, 'profile' | 'score'> }) {
  switch (k) {
    case 'paid':
      return <PaidScreen />;
    case 'backup':
      return <BackupScreen />;
    case 'discover':
      return <DiscoverScreen />;
    case 'quote':
      return <QuoteScreen />;
    case 'hostpay':
      return <HostPayScreen />;
    case 'hostbackup':
      return <HostBackupScreen />;
    case 'venue':
      return <VenueScreen />;
    case 'residency':
      return <ResidencyScreen />;
    case 'sub':
      return <SubScreen />;
    case 'invoice':
      return <InvoiceScreen />;
  }
}

function TrackPhone({ k, username, width }: { k: ScreenKey; username: string; width: number }) {
  // The score screen is a real screenshot from the app.
  if (k === 'score') {
    return (
      <Phone width={width} bare>
        <img loading="lazy" decoding="async" src="/mockups/screen_13.jpg" alt="The Bookability Score screen in the Artistant app, showing a score of 82, Trusted" />
      </Phone>
    );
  }
  if (k === 'profile') {
    return (
      <Phone width={width} edge>
        <ProfileScreen username={username} />
      </Phone>
    );
  }
  return (
    <Phone width={width} edge>
      <PhoneBody>
        <Screen k={k} />
      </PhoneBody>
    </Phone>
  );
}

export default function Setlist({ side, username }: { side: Side; username: string }) {
  const [active, setActive] = useState(0);
  const { title, lead, tracks } = SETLIST[side];

  return (
    <section id="features" className={s.section}>
      <div className={base.container}>
        <div className={s.head}>
          <Reveal>
            <span className={base.label}>What you get</span>
          </Reveal>
          <Reveal delay={0.05}>
            <h2 className={base.title}>{title}</h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className={base.lead}>{lead}</p>
          </Reveal>
        </div>

        <div className={s.grid}>
          <ol className={s.tracks}>
            {tracks.map((t, i) => (
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
                  <TrackPhone k={t.screen} username={username} width={260} />
                </div>
              </motion.li>
            ))}
          </ol>

          <div className={s.stickyCol}>
            <div className={s.sticky}>
              <div className={s.rail} aria-hidden="true">
                {tracks.map((t, i) => (
                  <span key={t.id} className={`${s.railItem} ${i === active ? s.railOn : ''}`}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                ))}
              </div>
              <div className={s.phone}>
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.div
                    key={tracks[active].id}
                    initial={{ opacity: 0, y: 40, rotate: 3 }}
                    animate={{ opacity: 1, y: 0, rotate: 0 }}
                    exit={{ opacity: 0, y: -30, rotate: -2 }}
                    transition={{ duration: 0.5, ease: EASE }}
                  >
                    <TrackPhone k={tracks[active].screen} username={username} width={300} />
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
