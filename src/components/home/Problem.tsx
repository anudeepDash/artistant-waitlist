'use client';

import React, { useRef } from 'react';
import { useScroll } from 'motion/react';
import { CountUp, Eyebrow, Reveal, ScrubWord } from './primitives';
import s from './home.module.css';

// Words wrapped in *asterisks* are highlighted.
const STATEMENT =
  'Today, live gigs in India run on WhatsApp chats and hope. Payments show up *a month late.* Middlemen charge *three to five times more* for the same act. And when someone cancels the night before, *the stage goes dark.*';

const WORDS = (() => {
  let highlighted = false;
  return STATEMENT.split(' ').map((raw) => {
    if (raw.startsWith('*')) highlighted = true;
    const hl = highlighted;
    if (raw.endsWith('*') || raw.endsWith('*.')) highlighted = false;
    return { word: raw.replace(/\*/g, ''), hl };
  });
})();

const STATS = [
  { to: 68, suffix: '%', text: 'of artists wait more than 30 days to get paid after a show.' },
  { to: 5, prefix: '3–', suffix: 'x', text: 'markup on the same act as it passes through middlemen.' },
  { to: 73, suffix: '%', text: 'of performers have no website — just DMs and WhatsApp threads.' },
  { to: 12, suffix: 'M', text: 'weddings a year in India, and 4 in 5 book live entertainment.' },
];

export default function Problem() {
  const ref = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.85', 'end 0.5'] });

  return (
    <section className={s.section} id="problem">
      <div className={s.container}>
        <Eyebrow>The problem</Eyebrow>
        <p ref={ref} className={s.bigStatement}>
          {WORDS.map(({ word, hl }, i) => {
            const start = i / WORDS.length;
            return (
              <React.Fragment key={i}>
                <ScrubWord progress={scrollYProgress} range={[start, start + 1 / WORDS.length]} className={hl ? s.hl : undefined}>
                  {word}
                </ScrubWord>{' '}
              </React.Fragment>
            );
          })}
        </p>

        <div className={s.stats}>
          {STATS.map((st, i) => (
            <Reveal key={i} className={s.stat} delay={i * 0.08}>
              <div className={`${s.statNum} ${i % 2 ? s.gradText : ''}`}>
                <CountUp to={st.to} prefix={st.prefix} suffix={st.suffix} />
              </div>
              <div className={s.statText}>{st.text}</div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
