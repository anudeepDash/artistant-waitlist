'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, useInView, useReducedMotion } from 'motion/react';
import { CheckIcon, Eyebrow, Reveal, SplitWords, SpotlightCard } from './primitives';
import s from './home.module.css';

const CODE = ['4', '8', '2', '1'];

function CodeEntry() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: '0px 0px -15% 0px' });
  const reduce = useReducedMotion();
  const [filled, setFilled] = useState(0);

  useEffect(() => {
    if (!inView || reduce) return;
    // Type the code in, hold on the confirmed state, then loop.
    let n = 0;
    const id = setInterval(() => {
      n = (n + 1) % (CODE.length + 4);
      setFilled(n);
    }, 520);
    return () => clearInterval(id);
  }, [inView, reduce]);

  const shown = reduce ? CODE.length + 1 : filled;
  const confirmed = shown > CODE.length;

  return (
    <div ref={ref}>
      <div className={s.otp}>
        {CODE.map((d, i) => (
          <motion.div
            key={i}
            className={`${s.otpBox} ${i < shown ? s.otpBoxFilled : ''}`}
            animate={i < shown ? { scale: [0.9, 1] } : { scale: 1 }}
            transition={{ duration: 0.25 }}
          >
            {i < shown ? d : ''}
          </motion.div>
        ))}
      </div>
      <motion.div
        className={s.tagGreen}
        style={{ marginTop: 14 }}
        animate={{ opacity: confirmed ? 1 : 0.25 }}
        transition={{ duration: 0.3 }}
      >
        <CheckIcon size={11} /> Cash received · contract active
      </motion.div>
    </div>
  );
}

export default function TwoWaysToPay() {
  return (
    <section className={s.section} style={{ paddingTop: 0 }}>
      <div className={s.container}>
        <div className={s.sectionHead}>
          <Eyebrow>Cash or online</Eyebrow>
          <h2 className={s.h2}>
            <SplitWords text="Paying part in cash?" inView />
            <SplitWords text="That’s fine too." inView delay={0.1} className={s.gradText} />
          </h2>
          <Reveal>
            <p className={s.lead}>
              Every event pays differently. Artistant works the way your event already does — and still keeps everyone
              covered.
            </p>
          </Reveal>
        </div>

        <div className={s.payTwo}>
          <SpotlightCard>
            <div className={s.cardBody}>
              <div className={s.cardKicker}>Weddings &amp; private parties</div>
              <h3 className={s.cardTitle}>Lock the date online. Pay the rest in cash.</h3>
              <p className={s.cardText}>
                Pay 30–40% online to confirm the booking. Hand over the rest in cash at soundcheck. The artist gives you a
                4-digit code once they’ve got it — enter it, and your contract and protection kick in.
              </p>
            </div>
            <div className={s.cardVisual}>
              <div className={s.splitBar}>
                <div className={s.splitOnline} style={{ width: '36%' }}>
                  36% online
                </div>
                <div className={s.splitCash}>64% cash at the venue</div>
              </div>
              <CodeEntry />
            </div>
          </SpotlightCard>

          <SpotlightCard delay={0.1}>
            <div className={s.cardBody}>
              <div className={s.cardKicker}>Companies &amp; colleges</div>
              <h3 className={s.cardTitle}>Everything online, with the paperwork done.</h3>
              <p className={s.cardText}>
                Add Artistant as a vendor once, then book any artist through us. You get proper GST invoices, TDS taken care
                of, and one contract format your finance team will recognise.
              </p>
            </div>
            <div className={s.cardVisual}>
              <ul className={s.checklist}>
                {['Sign up as a vendor once', 'GST invoice for every booking', 'TDS handled for you', 'Claim your GST input credit'].map(
                  (item, i) => (
                    <Reveal as="li" key={item} delay={0.1 + i * 0.08} y={12}>
                      <span className={s.checkIcon}>
                        <CheckIcon size={11} />
                      </span>
                      {item}
                    </Reveal>
                  ),
                )}
              </ul>
            </div>
          </SpotlightCard>
        </div>
      </div>
    </section>
  );
}
