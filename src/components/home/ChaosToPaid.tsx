'use client';

import React, { useRef, useState } from 'react';
import { motion, useMotionValueEvent, useReducedMotion, useTransform, type MotionValue } from 'motion/react';
import Phone from './Phone';
import { useSectionProgress } from './primitives';
import { CHAOS, type Side } from './sides';
import s from './chaos.module.css';

// Where each message sits inside the phone's stage, so none of them cross the headline.
const SPOTS = [
  { left: '0%', top: '6%', r: -6 },
  { left: '56%', top: '14%', r: 5 },
  { left: '2%', top: '40%', r: 4 },
  { left: '58%', top: '48%', r: -4 },
  { left: '4%', top: '74%', r: -3, sm: true },
  { left: '54%', top: '80%', r: 6, sm: true },
];

/** A WhatsApp-style message, the way these conversations usually arrive. */
function ChatBubble({ text, time, mine, width }: { text: string; time: string; mine?: boolean; width?: number }) {
  return (
    <div className={mine ? s.chatMine : s.chat} style={width ? { maxWidth: width } : undefined}>
      {text}
      <span className={s.chatMeta}>
        {time} {mine && <span className={s.ticks}>✓✓</span>}
      </span>
    </div>
  );
}

function ChaosBubble({
  b,
  i,
  progress,
}: {
  b: (typeof SPOTS)[number] & { text: string; mine?: boolean };
  i: number;
  progress: MotionValue<number>;
}) {
  // Push each bubble away from the centre as the phone arrives.
  const dx = parseFloat(b.left) < 40 ? -1 : 1;
  const dy = parseFloat(b.top) < 45 ? -1 : 1;
  const start = 0.12 + (i % 4) * 0.04;
  const x = useTransform(progress, [start, start + 0.3], [0, dx * 220]);
  const y = useTransform(progress, [start, start + 0.3], [0, dy * 120]);
  const rotate = useTransform(progress, [start, start + 0.3], [b.r, b.r + dx * 25]);
  const opacity = useTransform(progress, [start + 0.1, start + 0.3], [1, 0]);
  const blur = useTransform(progress, [start, start + 0.3], ['blur(0px)', 'blur(8px)']);
  return (
    <motion.div
      className={`${s.bubble} ${b.sm ? s.hideSm : ''}`}
      style={{ left: b.left, top: b.top, x, y, rotate, opacity, filter: blur }}
      initial={{ scale: 0 }}
      whileInView={{ scale: 1 }}
      viewport={{ once: true }}
      transition={{ type: 'spring', stiffness: 260, damping: 16, delay: i * 0.08 }}
    >
      <ChatBubble text={b.text} mine={b.mine} time={`11:${String(40 + i * 3).padStart(2, '0')} PM`} />
    </motion.div>
  );
}

export default function ChaosToPaid({ side }: { side: Side }) {
  const story = CHAOS[side];
  const NOTES = story.notes;
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const scrollYProgress = useSectionProgress(ref, ['start start', 'end end']);
  const [shown, setShown] = useState(0);

  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    setShown(NOTES.filter((n) => v >= n.at).length);
  });

  const titleAOpacity = useTransform(scrollYProgress, [0.26, 0.34], [1, 0]);
  const titleAY = useTransform(scrollYProgress, [0.26, 0.34], [0, -40]);
  const titleBOpacity = useTransform(scrollYProgress, [0.36, 0.46], [0, 1]);
  const titleBY = useTransform(scrollYProgress, [0.36, 0.46], [40, 0]);
  const phoneY = useTransform(scrollYProgress, [0.22, 0.5], ['70%', '0%']);
  const phoneRotate = useTransform(scrollYProgress, [0.22, 0.5], [-12, 0]);
  const phoneScale = useTransform(scrollYProgress, [0.22, 0.5], [0.85, 1]);

  const notesShown = reduce ? NOTES.length : shown;

  return (
    <section ref={ref} className={s.track} id="how">
      <div className={s.sticky}>
        <div className={`${s.inner}`}>
          <div className={s.copy}>
            <div className={s.stack}>
              <motion.div className={s.layer} style={reduce ? { opacity: 0 } : { opacity: titleAOpacity, y: titleAY }}>
                <span className={s.kicker}>
                  <i>01</i> How it is now
                </span>
                <h2 className={s.title}>{story.before.title}</h2>
                <p className={s.text}>{story.before.text}</p>
              </motion.div>
              <motion.div className={`${s.layer} ${s.after}`} style={reduce ? undefined : { opacity: titleBOpacity, y: titleBY }}>
                <span className={s.kicker}>
                  <i>02</i> With Artistant
                </span>
                <h2 className={s.title}>{story.after.title}</h2>
                <p className={s.text}>{story.after.text}</p>
              </motion.div>
            </div>
            <div className={s.stat}>
              <b>{story.stat.big}</b>
              <span>{story.stat.text}</span>
            </div>
          </div>

          <div className={s.stage}>
            {!reduce && (
              <div className={s.bubbles} aria-hidden="true">
                {story.chats.map((c, i) => (
                  <ChaosBubble key={c.text} b={{ ...SPOTS[i], ...c }} i={i} progress={scrollYProgress} />
                ))}
              </div>
            )}

            <motion.div className={s.phoneWrap} style={reduce ? undefined : { y: phoneY, rotate: phoneRotate, scale: phoneScale }}>
              <Phone
                width="min(300px, calc(100cqh * 0.45), 70cqw)"
                time="10:42"
                background="linear-gradient(180deg,#3a1a10 0%,#1a0d14 40%,#0a0a0a 100%)"
              >
                <div className={s.lock}>
                  <div className={s.lockDate}>Saturday, 14 December</div>
                  <div className={s.lockTime}>10:42</div>
                </div>
                <div className={s.notes} aria-live="polite">
                  {NOTES.slice(0, notesShown).map((n, i) => (
                    <motion.div
                      key={i}
                      className={s.note}
                      initial={{ opacity: 0, y: -16, scale: 0.92 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ type: 'spring', stiffness: 380, damping: 26 }}
                    >
                      <span className={s.noteIcon}>
                        <img src="/logo_a.png" alt="" />
                      </span>
                      <div style={{ flex: 1 }}>
                        <div className={s.noteHead}>
                          <span>{n.app}</span>
                          <span>now</span>
                        </div>
                        <div className={s.noteText}>{n.text}</div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </Phone>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
