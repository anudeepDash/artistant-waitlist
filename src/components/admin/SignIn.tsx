'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { signInWithEmail, signInWithGoogle } from '@/lib/auth';
import { EASE, Spinner, errorText } from './ui';
import s from './admin.module.css';

export type GateState = 'loading' | 'signed-out' | 'denied';

function GoogleMark() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" aria-hidden>
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

export default function SignIn({
  state,
  email,
  error,
  onSignOut,
}: {
  state: GateState;
  /** The signed-in account, when access was denied. */
  email?: string | null;
  error?: string | null;
  onSignOut: () => void;
}) {
  const [busy, setBusy] = useState<'google' | 'email' | null>(null);
  const [form, setForm] = useState({ email: '', password: '' });
  const [formError, setFormError] = useState<string | null>(null);

  const google = async () => {
    if (busy) return;
    setBusy('google');
    setFormError(null);
    try {
      await signInWithGoogle();
    } catch (err) {
      const code = (err as { code?: string })?.code;
      if (code !== 'auth/popup-closed-by-user' && code !== 'auth/cancelled-popup-request') {
        setFormError(errorText(err, 'Google sign-in didn’t work. Try again.'));
      }
    } finally {
      setBusy(null);
    }
  };

  const withEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy || !form.email || !form.password) return;
    setBusy('email');
    setFormError(null);
    try {
      await signInWithEmail(form.email.trim(), form.password);
    } catch (err) {
      const code = (err as { code?: string })?.code || '';
      setFormError(
        /invalid-credential|wrong-password|user-not-found/.test(code)
          ? 'That email and password don’t match.'
          : errorText(err, 'Couldn’t sign in. Try again.'),
      );
    } finally {
      setBusy(null);
    }
  };

  const shownError = formError || error;

  return (
    <div className={`${s.app} ${s.gate}`}>
      <motion.div
        className={s.gateCard}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE }}
      >
        <span className={s.gateStripe} aria-hidden />
        <Link href="/" className={s.brand}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/wordmark.svg" alt="Artistant" width={108} height={20} />
          <span className={s.brandTag}>Admin</span>
        </Link>

        {state === 'loading' && (
          <>
            <h1 className={s.gateTitle}>One moment.</h1>
            <p className={s.gateText}>Checking your account.</p>
            <div className={s.loader}><Spinner /> Loading</div>
          </>
        )}

        {state === 'denied' && (
          <>
            <h1 className={s.gateTitle}>No access.</h1>
            <p className={s.gateText}>
              <b style={{ color: 'var(--ink)' }}>{email}</b> isn’t on the admin team. Ask an admin to add
              you, or sign in with a different account.
            </p>
            <button type="button" className={`${s.btn} ${s.btnPrimary}`} style={{ width: '100%', height: 44 }} onClick={onSignOut}>
              Sign out
            </button>
          </>
        )}

        {state === 'signed-out' && (
          <>
            <h1 className={s.gateTitle}>Sign in.</h1>
            <p className={s.gateText}>For the Artistant team only.</p>
            <div className={s.gateForm}>
              <button type="button" className={`${s.btn} ${s.btnPrimary}`} onClick={google} disabled={!!busy}>
                {busy === 'google' ? <Spinner /> : <GoogleMark />}
                Continue with Google
              </button>
              <div className={s.or}>or</div>
              <form className={s.gateForm} onSubmit={withEmail}>
                <input
                  className={s.input}
                  type="email"
                  placeholder="Email"
                  autoComplete="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                />
                <input
                  className={s.input}
                  type="password"
                  placeholder="Password"
                  autoComplete="current-password"
                  required
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                />
                <button type="submit" className={s.btn} disabled={!!busy}>
                  {busy === 'email' && <Spinner />}
                  Sign in with email
                </button>
              </form>
            </div>
          </>
        )}

        {shownError && state !== 'loading' && <div className={s.error} role="alert">{shownError}</div>}
      </motion.div>
    </div>
  );
}
