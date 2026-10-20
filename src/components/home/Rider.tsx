'use client';

import React from 'react';
import { motion } from 'motion/react';
import { EASE, Reveal } from './primitives';
import { RIDER, type Side } from './sides';
import s from './rider.module.css';
import base from './home.module.css';

export default function Rider({ side, username }: { side: Side; username: string }) {
  const r = RIDER[side];
  return (
    <section id="fees" className={s.section}>
      <div className={`${base.container} ${s.grid}`}>
        <div className={s.copy}>
          <Reveal>
            <span className={base.label}>{r.label}</span>
          </Reveal>
          <Reveal delay={0.05}>
            <h2 className={base.title}>{r.title}</h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className={base.lead}>{r.lead}</p>
          </Reveal>
        </div>

        <motion.article
          className={s.doc}
          initial={{ opacity: 0, y: 90, rotate: 4 }}
          whileInView={{ opacity: 1, y: 0, rotate: 1.2 }}
          viewport={{ once: true, margin: '0px 0px -15% 0px' }}
          transition={{ duration: 1.1, ease: EASE }}
          aria-label={`Artistant fees: ${r.docMeta}`}
        >
          <header className={s.docHead}>
            <img src="/brand/wordmark.svg" alt="Artistant" className={s.docBrand} />
            <span className={s.docMeta}>{r.docMeta}</span>
          </header>

          <ol className={s.clauses}>
            {r.clauses.map((c, i) => (
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
            <div className={s.scheduleLabel}>{r.scheduleLabel}</div>
            <div className={s.scheduleRow} style={side === 'venue' ? { gridTemplateColumns: '1fr 1fr 1fr' } : undefined}>
              {r.schedule.map((x, i) => (
                <div key={x.when} className={s.step}>
                  <motion.span
                    className={s.stepBar}
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, ease: EASE, delay: 0.6 + i * 0.2 }}
                  />
                  <b>{x.big}</b>
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
              <span className={`${s.signature} ${s.signYou}`}>{side === 'artist' && username ? `@${username}` : 'you'}</span>
              <span className={s.signLine}>{r.signer}</span>
            </div>
          </footer>
        </motion.article>
      </div>
      <p className={`${base.container} ${s.fine}`}>{r.fine}</p>
    </section>
  );
}
