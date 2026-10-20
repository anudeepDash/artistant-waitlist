'use client';

import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { EASE, Reveal } from './primitives';
import { FAQS, type Side } from './sides';
import s from './home.module.css';

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

export default function Faq({ side }: { side: Side }) {
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
              {FAQS[side].map((f, i) => (
                <Item key={f.q} q={f.q} a={f.a} i={i} />
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
