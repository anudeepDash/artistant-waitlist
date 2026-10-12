'use client';

import React, { useRef } from 'react';
import { motion, useTransform } from 'motion/react';
import type { UsernameClaim } from '@/hooks/useUsernameClaim';
import type { WaitlistEntry } from '@/lib/waitlist';
import ClaimForm from './ClaimForm';
import { Reveal, SplitWords, useSectionProgress } from './primitives';
import s from './encore.module.css';
import base from './home.module.css';

interface EncoreProps {
  claim: UsernameClaim;
  reservation: WaitlistEntry | null;
  onClaimSubmit: () => void;
  onDashboard: () => void;
}

export default function Encore({ claim, reservation, onClaimSubmit, onDashboard }: EncoreProps) {
  const ref = useRef<HTMLElement>(null);
  const scrollYProgress = useSectionProgress(ref, ['start end', 'end end']);
  const scale = useTransform(scrollYProgress, [0, 1], [1.25, 1]);
  // The photo opens out from a rounded card to the full screen.
  const clip = useTransform(scrollYProgress, (p) => {
    const t = Math.min(1, Math.max(0, p));
    return `inset(0 ${(1 - t) * 6}% round ${(1 - t) * 48}px)`;
  });

  return (
    <section ref={ref} id="join" className={s.section}>
      <motion.div className={s.media} style={{ clipPath: clip }} aria-hidden="true">
        <motion.img src="/photos/fire-stage.webp" alt="" style={{ scale }} loading="lazy" />
        <div className={s.shade} />
      </motion.div>

      <div className={`${base.container} ${s.inner}`}>
        <Reveal>
          <span className={s.encore}>Encore</span>
        </Reveal>
        <h2 className={s.title}>
          <SplitWords text="The stage is" inView />
          <SplitWords text="yours." inView delay={0.12} className={s.em} />
        </h2>
        <Reveal delay={0.15}>
          <p className={s.lead}>Claim your name in 30 seconds. We&apos;ll email you the moment your spot opens.</p>
        </Reveal>
        <Reveal delay={0.2} className={s.form}>
          <ClaimForm
            claim={claim}
            inputId="username-join-input"
            reservation={reservation}
            onSubmit={onClaimSubmit}
            onDashboard={onDashboard}
            center
          />
        </Reveal>
        <Reveal delay={0.25}>
          <p className={s.note}>Free for artists · No card needed · Bengaluru first, then Mumbai and Delhi NCR</p>
        </Reveal>
      </div>
    </section>
  );
}
