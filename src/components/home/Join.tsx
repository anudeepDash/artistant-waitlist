'use client';

import React from 'react';
import ClaimForm from './ClaimForm';
import type { UsernameClaim } from '@/hooks/useUsernameClaim';
import type { WaitlistEntry } from '@/lib/waitlist';
import { ArrowIcon, Reveal, SplitWords } from './primitives';
import s from './home.module.css';

interface JoinProps {
  claim: UsernameClaim;
  reservation: WaitlistEntry | null;
  onClaimSubmit: () => void;
  onDashboard: () => void;
  onRole: (role: 'organizer' | 'venue') => void;
}

export default function Join({ claim, reservation, onClaimSubmit, onDashboard, onRole }: JoinProps) {
  return (
    <section id="join" className={s.join}>
      <div className={s.joinGlow} aria-hidden="true" />
      <div className={s.container} style={{ position: 'relative' }}>
        <Reveal>
          <span className={s.eyebrow}>
            <span className={s.eyebrowDot} />
            Join the waitlist
          </span>
        </Reveal>
        <h2 className={s.joinTitle}>
          <SplitWords text="Your name." inView />
          <SplitWords text="Your stage." inView delay={0.1} />
          <SplitWords text="Claim it first." inView delay={0.2} className={s.gradText} />
        </h2>
        <Reveal delay={0.2}>
          <p className={s.lead} style={{ margin: '28px auto 0' }}>
            Spots open city by city and category by category. Save your artistant.in name now and you’ll be first in line
            when yours opens.
          </p>
        </Reveal>

        <Reveal delay={0.3} className={s.joinForm}>
          <ClaimForm
            claim={claim}
            inputId="username-join-input"
            reservation={reservation}
            onSubmit={onClaimSubmit}
            onDashboard={onDashboard}
          />
        </Reveal>

        <div className={s.joinOthers}>
          <Reveal>
            <button type="button" className={s.roleCard} onClick={() => onRole('organizer')}>
              <span className={s.roleIcon} style={{ color: '#7C5CFF' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="3" y="4" width="18" height="18" rx="2" />
                  <path d="M16 2v4M8 2v4M3 10h18" />
                </svg>
              </span>
              <span className={s.roleText}>
                <span className={s.roleTitle}>I book artists</span>
                <span className={s.roleSub} style={{ display: 'block' }}>
                  For companies, wedding planners and college fests.
                </span>
              </span>
              <span className={s.roleArrow}>
                <ArrowIcon />
              </span>
            </button>
          </Reveal>
          <Reveal delay={0.08}>
            <button type="button" className={s.roleCard} onClick={() => onRole('venue')}>
              <span className={s.roleIcon} style={{ color: '#F25A2B' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <path d="M9 22V12h6v10" />
                </svg>
              </span>
              <span className={s.roleText}>
                <span className={s.roleTitle}>I run a venue</span>
                <span className={s.roleSub} style={{ display: 'block' }}>
                  Weekly live nights with resident artists.
                </span>
              </span>
              <span className={s.roleArrow}>
                <ArrowIcon />
              </span>
            </button>
          </Reveal>
        </div>

        <p className={s.fine}>By joining, you’ll get emails about your spot and our launch. No spam, ever.</p>
      </div>
    </section>
  );
}
