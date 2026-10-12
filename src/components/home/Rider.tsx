'use client';

import React from 'react';
import { motion } from 'motion/react';
import { EASE, Reveal } from './primitives';
import s from './rider.module.css';
import base from './home.module.css';

const CLAUSES = [
  { what: 'Claiming your name and your booking page', note: 'Free, for good.', fee: '₹0' },
  { what: 'First booking with a new client', note: 'The client pays their own 4% on top.', fee: '6%' },
  { what: 'The same client books you again', note: 'So going around the app never makes sense.', fee: '1%' },
  { what: 'Clients you bring yourself', note: 'With Artistant PRO. Payment gateway charges only.', fee: '0%' },
];

const SCHEDULE = [
  { pct: '50%', when: 'when the contract is signed' },
  { pct: '25%', when: 'when you check in at soundcheck' },
  { pct: '25%', when: 'two hours after the show' },
];

export default function Rider({ username }: { username: string }) {
  return (
    <section id="fees" className={s.section}>
      <div className={`${base.container} ${s.grid}`}>
        <div className={s.copy}>
          <Reveal>
            <span className={base.label}>Fees</span>
          </Reveal>
          <Reveal delay={0.05}>
            <h2 className={base.title}>
              Free to join. <em>Fees that shrink.</em>
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className={base.lead}>
              Artists send venues a rider. Here&apos;s ours for you: what we charge, when you get paid, and nothing hidden in the
              small print.
            </p>
          </Reveal>
        </div>

        <motion.article
          className={s.doc}
          initial={{ opacity: 0, y: 90, rotate: 4 }}
          whileInView={{ opacity: 1, y: 0, rotate: 1.2 }}
          viewport={{ once: true, margin: '0px 0px -15% 0px' }}
          transition={{ duration: 1.1, ease: EASE }}
          aria-label="Artistant fees for artists"
        >
          <header className={s.docHead}>
            <img src="/brand/wordmark.svg" alt="Artistant" className={s.docBrand} />
            <span className={s.docMeta}>Artist rider · v1</span>
          </header>

          <ol className={s.clauses}>
            {CLAUSES.map((c, i) => (
              <Reveal as="li" key={c.what} className={s.clause} delay={0.2 + i * 0.08} y={12}>
                <span className={s.clauseNum}>{String(i + 1).padStart(2, '0')}</span>
                <span className={s.clauseText}>
                  {c.what}
                  <small>{c.note}</small>
                </span>
                <span className={s.fee}>{c.fee}</span>
              </Reveal>
            ))}
          </ol>

          <div className={s.schedule}>
            <div className={s.scheduleLabel}>How your fee reaches you</div>
            <div className={s.scheduleRow}>
              {SCHEDULE.map((x, i) => (
                <div key={x.when} className={s.step}>
                  <motion.span
                    className={s.stepBar}
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, ease: EASE, delay: 0.6 + i * 0.2 }}
                  />
                  <b>{x.pct}</b>
                  <span>{x.when}</span>
                </div>
              ))}
            </div>
          </div>

          <footer className={s.sign}>
            <div>
              <span className={s.signature}>Artistant</span>
              <span className={s.signLine}>For Artistant</span>
            </div>
            <div>
              <span className={`${s.signature} ${s.signYou}`}>{username ? `@${username}` : 'you'}</span>
              <span className={s.signLine}>The artist</span>
            </div>
          </footer>
        </motion.article>
      </div>
      <p className={`${base.container} ${s.fine}`}>Usual payment gateway charges apply. That&apos;s it.</p>
    </section>
  );
}
