'use client';

import React, { useRef } from 'react';
import { motion, useTransform } from 'motion/react';
import type { UsernameClaim } from '@/hooks/useUsernameClaim';
import type { WaitlistEntry } from '@/lib/waitlist';
import ClaimForm from './ClaimForm';
import { ArrowIcon, Reveal, SplitWords, useSectionProgress } from './primitives';
import { ENCORE, SIDE_CTA, SIDE_ROLE, type Role, type Side } from './sides';
import s from './encore.module.css';
import base from './home.module.css';

interface EncoreProps {
  side: Side;
  claim: UsernameClaim;
  reservation: WaitlistEntry | null;
  onClaimSubmit: () => void;
  onRole: (role: Role) => void;
}

export default function Encore({ side, claim, reservation, onClaimSubmit, onRole }: EncoreProps) {
  const ref = useRef<HTMLElement>(null);
  const e = ENCORE[side];
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
        <motion.img src={e.photo} alt="" style={{ scale }} loading="lazy" />
        <div className={s.shade} />
      </motion.div>

      <div className={`${base.container} ${s.inner}`}>
        <Reveal>
          <span className={s.encore}>Encore</span>
        </Reveal>
        <h2 className={s.title}>
          <SplitWords text={e.line1} inView />
          <SplitWords text={e.line2} inView delay={0.12} className={s.em} />
        </h2>
        <Reveal delay={0.15}>
          <p className={s.lead}>{e.lead}</p>
        </Reveal>
        <Reveal delay={0.2} className={s.form}>
          {side === 'artist' ? (
            <ClaimForm claim={claim} inputId="username-join-input" reservation={reservation} onSubmit={onClaimSubmit} center />
          ) : (
            <button type="button" className={`${base.btnAccent} ${s.cta}`} onClick={() => onRole(SIDE_ROLE[side])}>
              {SIDE_CTA[side]} <ArrowIcon size={16} />
            </button>
          )}
        </Reveal>
        <Reveal delay={0.25}>
          <p className={s.note}>{e.note}</p>
        </Reveal>
      </div>
    </section>
  );
}
