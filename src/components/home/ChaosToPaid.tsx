'use client';

import React, { useRef, useState } from 'react';
import { motion, useMotionValueEvent, useReducedMotion, useTransform, type MotionValue } from 'motion/react';
import Phone from './Phone';
import { useMediaQuery, useSectionProgress } from './primitives';
import s from './chaos.module.css';

// Every line here is something working artists hear far too often.
const CHAOS = [
  { text: 'bro payment next week pakka 🙏', left: '6%', top: '30%', r: -6, green: true },
  { text: 'can you do it for exposure? crowd bahut bada hai', left: '68%', top: '26%', r: 5 },
  { text: 'advance? event ke baad dekhte hain', left: '3%', top: '58%', r: 4, sm: true },
  { text: 'sorry yaar, event cancel ho gaya. aaj.', left: '72%', top: '55%', r: -4, green: true },
  { text: 'rate thoda kam karo na, regular client hain', left: '14%', top: '80%', r: -3 },
  { text: 'sound system? venue pe kuch toh hoga', left: '64%', top: '80%', r: 6, sm: true },
  { text: 'who gave you this number?', left: '36%', top: '22%', r: 2, sm: true },
];

const NOTES = [
  { at: 0.5, app: 'Payment', when: 'now', text: <><b>₹90,000 received</b> — half your fee for Wedding Sangeet, Jaipur. Book those flights ✈️</> },
  { at: 0.6, app: 'Contract', when: 'now', text: <><b>Contract signed</b> by you and the client. Date locked.</> },
  { at: 0.7, app: 'Check-in', when: 'now', text: <><b>You&apos;re checked in.</b> ₹45,000 released at soundcheck.</> },
  { at: 0.8, app: 'Show day', when: 'now', text: <><b>Show done 🎉</b> Final ₹45,000 on its way. Rebooking this client: 1% fee.</> },
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

function ChaosBubble({ b, i, progress }: { b: (typeof CHAOS)[number]; i: number; progress: MotionValue<number> }) {
  // Push each bubble away from the centre as the phone arrives.
  const dx = parseFloat(b.left) < 50 ? -1 : 1;
  const dy = parseFloat(b.top) < 50 ? -1 : 1;
  const start = 0.12 + (i % 4) * 0.04;
  const x = useTransform(progress, [start, start + 0.3], [0, dx * 260]);
  const y = useTransform(progress, [start, start + 0.3], [0, dy * 140]);
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
      <ChatBubble text={b.text} mine={b.green} time={`11:${String(40 + i * 3).padStart(2, '0')} PM`} width={230} />
    </motion.div>
  );
}

export default function ChaosToPaid() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const small = useMediaQuery('(max-width: 760px)');
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
        <div className={s.titles}>
          <motion.h2 className={s.title} style={reduce ? { opacity: 0 } : { opacity: titleAOpacity, y: titleAY }}>
            <span className={s.titleSmall}>From</span>
            <span className={s.quote}>“Bro, payment <em>kab?</em>”</span>
          </motion.h2>
          <motion.h2 className={s.title} style={reduce ? undefined : { opacity: titleBOpacity, y: titleBY }}>
            <span className={s.titleSmall}>To</span>
            <span className={s.quote}>
              “Paid. <span className={s.grad}>On time.</span>”
            </span>
          </motion.h2>
        </div>

        {!reduce && (
          <div className={s.bubbles} aria-hidden="true">
            {CHAOS.map((b, i) => (
              <ChaosBubble key={b.text} b={b} i={i} progress={scrollYProgress} />
            ))}
          </div>
        )}

        <motion.div className={s.stage} style={reduce ? undefined : { y: phoneY, rotate: phoneRotate, scale: phoneScale }}>
          <Phone width={small ? 250 : 300} time="10:42" background="linear-gradient(180deg,#3a1a10 0%,#1a0d14 40%,#0a0a0a 100%)">
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
                      <span>{n.when}</span>
                    </div>
                    <div className={s.noteText}>{n.text}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </Phone>
        </motion.div>

        <div className={s.stat}>
          <b>68%</b> of artists wait 30+ days to get paid. On Artistant, half lands before you pack.
        </div>
      </div>
    </section>
  );
}
