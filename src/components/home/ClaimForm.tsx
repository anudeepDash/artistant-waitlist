'use client';

import React from 'react';
import { AnimatePresence, motion, useAnimate } from 'motion/react';
import type { UsernameClaim } from '@/hooks/useUsernameClaim';
import type { WaitlistEntry } from '@/lib/waitlist';
import { ArrowIcon, CheckIcon, EASE } from './primitives';
import s from './home.module.css';

interface ClaimFormProps {
  claim: UsernameClaim;
  inputId: string;
  reservation: WaitlistEntry | null;
  onSubmit: () => void;
  onDashboard: () => void;
  className?: string;
}

export default function ClaimForm({ claim, inputId, reservation, onSubmit, onDashboard, className }: ClaimFormProps) {
  const { username, setUsername, status, error, suggestions, suggestionsLoading } = claim;
  const [shakeScope, animateShake] = useAnimate<HTMLDivElement>();

  if (reservation) {
    return (
      <motion.div
        className={`${s.reserved} ${className ?? ''}`}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: EASE }}
      >
        <span className={s.reservedCheck}>
          <CheckIcon size={18} />
        </span>
        <div className={s.reservedText}>
          <div className={s.reservedLabel}>Your name is saved. We&apos;ll email you when your spot opens.</div>
          <div className={s.reservedName}>artistant.in/{reservation.username}</div>
        </div>
        <button type="button" className={s.btnPrimary} onClick={onDashboard}>
          Dashboard <ArrowIcon size={14} />
        </button>
      </motion.div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (status === 'available' || status === 'locked') {
      onSubmit();
      return;
    }
    if (shakeScope.current) animateShake(shakeScope.current, { x: [0, -10, 9, -6, 4, 0] }, { duration: 0.45 });
    document.getElementById(inputId)?.focus();
  };

  const fieldTone =
    status === 'available' ? s.claimOk : status === 'taken' ? s.claimBad : status === 'locked' || status === 'invalid' ? s.claimWarn : '';

  const statusTone =
    status === 'available' ? s.statusOk : status === 'taken' ? s.statusBad : status === 'checking' ? s.statusWait : s.statusWarn;

  const statusText =
    status === 'checking'
      ? 'Checking if it’s free…'
      : status === 'available'
        ? `Nice — artistant.in/${username} is free.`
        : status === 'taken'
          ? 'Someone already has this one. Try another.'
          : error;

  return (
    <form className={`${s.claim} ${className ?? ''}`} onSubmit={handleSubmit} noValidate>
      <div ref={shakeScope}>
        <label className={`${s.claimField} ${fieldTone}`} htmlFor={inputId}>
          <span className={s.claimPrefix}>artistant.in/</span>
          <input
            id={inputId}
            className={s.claimInput}
            type="text"
            placeholder="yourname"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="none"
            spellCheck={false}
            maxLength={24}
            aria-describedby={`${inputId}-status`}
            data-lpignore="true"
            data-1p-ignore="true"
          />
          <span className={s.claimIcon} aria-hidden="true">
            {status === 'checking' && <span className={s.spinner} />}
            {status === 'available' && (
              <span className={s.statusOk}>
                <CheckIcon size={16} />
              </span>
            )}
          </span>
          <button
            type="submit"
            className={`${s.claimSubmit} ${status === 'available' ? '' : s.claimSubmitIdle}`}
          >
            {status === 'locked' ? 'Request this name' : 'Claim my name'}
          </button>
        </label>
      </div>

      <div id={`${inputId}-status`} className={`${s.claimStatus} ${statusTone}`} aria-live="polite">
        <AnimatePresence mode="wait">
          {status !== 'idle' && statusText && (
            <motion.span
              key={status + (error ?? '')}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.25 }}
            >
              {statusText}
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {(suggestions.length > 0 || (suggestionsLoading && status !== 'checking')) && (
          <motion.div
            className={s.suggestions}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.35, ease: EASE }}
          >
            {suggestionsLoading && suggestions.length === 0 ? (
              <span className={s.statusWait} style={{ fontSize: 12 }}>Finding free names…</span>
            ) : (
              suggestions.map((name, i) => (
                <motion.button
                  key={name}
                  type="button"
                  className={s.suggestion}
                  onClick={() => {
                    setUsername(name);
                    document.getElementById(inputId)?.focus();
                  }}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05, duration: 0.3 }}
                >
                  {name}
                </motion.button>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </form>
  );
}
