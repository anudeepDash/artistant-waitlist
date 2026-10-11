'use client';

import React, { useRef } from 'react';
import { motion, useInView } from 'motion/react';
import { CheckIcon, CountUp, EASE, Eyebrow, Reveal, SplitWords, SpotlightCard } from './primitives';
import s from './home.module.css';

const SCORE_PARTS = [
  { label: 'Shows up on time', pct: 35, fill: 0.96 },
  { label: 'Gets booked again', pct: 25, fill: 0.88 },
  { label: 'Rarely cancels', pct: 20, fill: 0.94 },
  { label: 'Replies quickly', pct: 20, fill: 0.86 },
];

function ScoreVisual() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '0px 0px -15% 0px' });
  return (
    <div ref={ref}>
      <div className={s.scoreWrap}>
        <div className={s.scoreRing}>
          <svg viewBox="0 0 100 100" aria-hidden="true">
            <defs>
              <linearGradient id="score-grad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#5A32FA" />
                <stop offset="100%" stopColor="#00F0FF" />
              </linearGradient>
            </defs>
            <circle cx="50" cy="50" r="42" stroke="rgba(255,255,255,0.07)" strokeWidth="7" fill="none" />
            <motion.circle
              cx="50"
              cy="50"
              r="42"
              stroke="url(#score-grad)"
              strokeWidth="7"
              strokeLinecap="round"
              fill="none"
              initial={{ pathLength: 0 }}
              animate={inView ? { pathLength: 0.92 } : undefined}
              transition={{ duration: 1.8, ease: EASE }}
            />
          </svg>
          <div className={s.scoreNum}>
            <CountUp to={92} />
            <small>Elite</small>
          </div>
        </div>
        <div className={s.bars}>
          {SCORE_PARTS.map((p, i) => (
            <div key={p.label} className={s.barRow}>
              <span>{p.label}</span>
              <span className={s.barPct}>{p.pct}%</span>
              <div className={s.barTrack}>
                <motion.div
                  className={s.barFill}
                  initial={{ scaleX: 0 }}
                  animate={inView ? { scaleX: p.fill } : undefined}
                  transition={{ duration: 1.2, delay: 0.2 + i * 0.12, ease: EASE }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className={s.tiers}>
        <span className={s.tier}>New · 0–60</span>
        <span className={s.tier}>Rising · 60–75</span>
        <span className={s.tier}>Trusted · 75–90</span>
        <span className={s.tierOn}>Elite · 90+</span>
      </div>
    </div>
  );
}

function BackupVisual() {
  const pins = [
    { left: '18%', top: '22%', img: '/gallery_2.png', d: 0.6 },
    { left: '74%', top: '30%', img: '/gallery_5.png', d: 1.2 },
    { left: '62%', top: '72%', img: '/gallery_6.png', d: 1.8 },
  ];
  return (
    <div className={s.radar} aria-hidden="true">
      <span className={s.radarRing} />
      <span className={s.radarRing} />
      <span className={s.radarRing} />
      <span className={s.radarCore}>FINDING A BACKUP</span>
      {pins.map((p) => (
        <motion.span
          key={p.img}
          className={s.radarPin}
          style={{ left: p.left, top: p.top, backgroundImage: `url(${p.img})` }}
          initial={{ opacity: 0, scale: 0 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: p.d, type: 'spring', stiffness: 260, damping: 18 }}
        />
      ))}
    </div>
  );
}

function FeesVisual() {
  const cols = [
    { label: 'First booking', value: '10%', h: 100, low: false },
    { label: 'Book again', value: '3%', h: 34, low: true },
  ];
  return (
    <div className={s.fees}>
      {cols.map((c, i) => (
        <div key={c.label} className={s.feeCol}>
          <motion.div
            className={`${s.feeBar} ${c.low ? s.feeBarLow : ''}`}
            style={{ height: `${c.h}%` }}
            initial={{ scaleY: 0 }}
            whileInView={{ scaleY: 1 }}
            viewport={{ once: true, margin: '0px 0px -15% 0px' }}
            transition={{ duration: 1, delay: 0.15 + i * 0.25, ease: EASE }}
          >
            {c.value}
          </motion.div>
          <div className={s.feeLabel}>{c.label}</div>
        </div>
      ))}
    </div>
  );
}

function ScopeVisual() {
  const rows = [
    { q: 'What’s the event?', a: 'Company annual day' },
    { q: 'How many guests?', a: '800, outdoors' },
    { q: 'Who brings sound?', a: 'Artist brings rig' },
    { q: 'Timings', a: '8–10 PM, soundcheck 5' },
  ];
  return (
    <div className={s.scope}>
      {rows.map((r, i) => (
        <Reveal key={r.q} delay={0.1 + i * 0.1} y={12}>
          <div className={s.scopeRow}>
            <span className={s.scopeCheck}>
              <CheckIcon size={14} />
            </span>
            <span className={s.scopeQ}>{r.q}</span>
            <span className={s.scopeA}>{r.a}</span>
          </div>
        </Reveal>
      ))}
      <Reveal delay={0.55} y={12}>
        <div className={s.agent}>
          <span className={s.agentAvatar}>R</span>
          <span>
            <strong>Riya from Artistant</strong> joined the chat to finalise your contract
          </span>
        </div>
      </Reveal>
    </div>
  );
}

function PageVisual() {
  const busy = [3, 4, 10, 11, 12, 17, 18, 24, 25];
  const open = [5, 6, 13, 19, 20, 26, 27];
  return (
    <div>
      <div className={s.urlBar}>
        <span>artistant.in/</span>
        <strong>kaavya</strong>
      </div>
      <div className={s.cal} aria-hidden="true">
        {Array.from({ length: 28 }, (_, i) => i + 1).map((d, i) => (
          <motion.span
            key={d}
            className={`${s.calDay} ${busy.includes(d) ? s.calBusy : ''} ${open.includes(d) ? s.calOpen : ''}`}
            initial={{ opacity: 0, scale: 0.6 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.015, duration: 0.4, ease: EASE }}
          >
            {d}
          </motion.span>
        ))}
      </div>
    </div>
  );
}

function RosterVisual() {
  const items = [
    { n: 40, label: 'Acoustic acts' },
    { n: 30, label: 'Live bands' },
    { n: 50, label: 'Club DJs' },
    { n: 20, label: 'College headliners' },
  ];
  return (
    <div className={s.roster}>
      {items.map((it) => (
        <div key={it.label} className={s.rosterItem}>
          <div className={s.rosterNum}>
            <CountUp to={it.n} />
          </div>
          <div className={s.rosterLabel}>{it.label}</div>
        </div>
      ))}
    </div>
  );
}

export default function Features() {
  return (
    <section id="features" className={s.section}>
      <div className={s.container}>
        <div className={s.sectionHead}>
          <Eyebrow>What’s inside</Eyebrow>
          <h2 className={s.h2}>
            <SplitWords text="Built so nobody" inView />
            <SplitWords text="gets let down." inView delay={0.1} className={s.gradText} />
          </h2>
          <Reveal>
            <p className={s.lead}>
              Not another directory of profiles. Artistant is the system that makes a booking actually happen — and go
              right.
            </p>
          </Reveal>
        </div>

        <div className={s.bento}>
          <SpotlightCard className={s.span4}>
            <div className={s.cardBody}>
              <div className={s.cardKicker}>Bookability Score</div>
              <h3 className={s.cardTitle}>A trust score earned at real shows — not star ratings.</h3>
              <p className={s.cardText}>
                Every artist gets a score out of 100, built only from what actually happened on Artistant bookings. No fake
                reviews, nothing self-reported.
              </p>
            </div>
            <div className={s.cardVisual}>
              <ScoreVisual />
            </div>
          </SpotlightCard>

          <SpotlightCard className={s.span2} delay={0.08}>
            <div className={s.cardBody}>
              <div className={s.cardKicker}>Backup guarantee</div>
              <h3 className={s.cardTitle}>A replacement in 90 minutes.</h3>
              <p className={s.cardText}>
                If an artist can’t make it, we line up someone with the same score and a similar sound. The stage never goes
                dark.
              </p>
            </div>
            <div className={s.cardVisual}>
              <BackupVisual />
            </div>
          </SpotlightCard>

          <SpotlightCard className={s.span2}>
            <div className={s.cardBody}>
              <div className={s.cardKicker}>Fair fees</div>
              <h3 className={s.cardTitle}>Fees that shrink when you rebook.</h3>
              <p className={s.cardText}>
                10% on a first booking, split between booker and artist. Book the same artist again and it drops to 3%.
              </p>
            </div>
            <div className={s.cardVisual}>
              <FeesVisual />
            </div>
          </SpotlightCard>

          <SpotlightCard className={s.span2} delay={0.08}>
            <div className={s.cardBody}>
              <div className={s.cardKicker}>Help for big events</div>
              <h3 className={s.cardTitle}>Four questions, then a real person.</h3>
              <p className={s.cardText}>
                Planning something over ₹50,000? Tell us the basics and someone from our team helps you sort the details and
                the contract.
              </p>
            </div>
            <div className={s.cardVisual}>
              <ScopeVisual />
            </div>
          </SpotlightCard>

          <SpotlightCard className={s.span2} delay={0.16}>
            <div className={s.cardBody}>
              <div className={s.cardKicker}>Your booking page</div>
              <h3 className={s.cardTitle}>One link instead of ten PDFs.</h3>
              <p className={s.cardText}>
                Your videos, open dates, tech rider and reviews on one page that bookers can book straight from.
              </p>
            </div>
            <div className={s.cardVisual}>
              <PageVisual />
            </div>
          </SpotlightCard>

          <SpotlightCard className={s.span3}>
            <div className={s.cardBody}>
              <div className={s.cardKicker}>A short list, not a crowded one</div>
              <h3 className={s.cardTitle}>Every artist listed is getting work.</h3>
              <p className={s.cardText}>
                We only add as many artists as bookers in each city need. If someone gets no requests for 60 days, they leave
                search for a while — but keep all their tools. Our first Bengaluru line-up:
              </p>
            </div>
            <div className={s.cardVisual}>
              <RosterVisual />
            </div>
          </SpotlightCard>

          <SpotlightCard className={s.span3} delay={0.08}>
            <div className={s.cardBody}>
              <div className={s.cardKicker}>Tech riders, sorted</div>
              <h3 className={s.cardTitle}>No surprises at soundcheck.</h3>
              <p className={s.cardText}>
                Share your setup once. We check it against what the venue actually has — mics, monitors, mixer, stage size — and
                flag anything missing days before the show, not minutes.
              </p>
            </div>
            <div className={s.cardVisual}>
              <ul className={s.checklist}>
                {[
                  ['4 vocal mics', true],
                  ['2 monitor wedges', true],
                  ['Yamaha CL5 mixer', true],
                  ['Drum riser — venue doesn’t have one, renting nearby', false],
                ].map(([item, ok], i) => (
                  <Reveal as="li" key={item as string} delay={0.1 + i * 0.08} y={12}>
                    <span
                      className={s.checkIcon}
                      style={ok ? undefined : { background: 'rgba(232,194,106,0.14)', color: '#E8C26A' }}
                    >
                      {ok ? <CheckIcon size={11} /> : '!'}
                    </span>
                    {item}
                  </Reveal>
                ))}
              </ul>
            </div>
          </SpotlightCard>
        </div>
      </div>
    </section>
  );
}
