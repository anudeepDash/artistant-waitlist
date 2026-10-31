'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { LoaderCircle } from 'lucide-react';
import { initials, STATUS_LABEL, type Status } from './data';
import s from './admin.module.css';

export const EASE = [0.16, 1, 0.3, 1] as const;

export function cx(...names: (string | false | null | undefined)[]): string {
  return names.filter(Boolean).join(' ');
}

export function Spinner({ size = 16 }: { size?: number }) {
  return <LoaderCircle size={size} className={s.spin} aria-hidden />;
}

export function Avatar({ name, src, large }: { name: string; src?: string | null; large?: boolean }) {
  const [broken, setBroken] = useState(false);
  return (
    <span className={cx(s.avatar, large && s.avatarLg)} aria-hidden>
      {src && !broken ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" loading="lazy" onError={() => setBroken(true)} />
      ) : (
        initials(name)
      )}
    </span>
  );
}

export function StatusPill({ status }: { status: Status }) {
  return <span className={cx(s.pill, s[`pill_${status}`])}>{STATUS_LABEL[status]}</span>;
}

export function Switch({ on, onChange, label, busy }: { on: boolean; onChange: () => void; label: string; busy?: boolean }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      disabled={busy}
      className={cx(s.switch, on && s.switchOn)}
      onClick={onChange}
    />
  );
}

/* ───────────── Confirm dialog ───────────── */

export interface ConfirmOptions {
  title: string;
  body: React.ReactNode;
  confirm: string;
  danger?: boolean;
}

/** Promise-based confirm: `if (await ask({...})) ...`. Render `dialog` once. */
export function useConfirm() {
  const [state, setState] = useState<(ConfirmOptions & { resolve: (ok: boolean) => void }) | null>(null);

  const ask = useCallback(
    (opts: ConfirmOptions) => new Promise<boolean>((resolve) => setState({ ...opts, resolve })),
    [],
  );

  const close = (ok: boolean) => {
    state?.resolve(ok);
    setState(null);
  };

  const dialog = (
    <AnimatePresence>
      {state && <ConfirmDialog key="confirm" {...state} onClose={close} />}
    </AnimatePresence>
  );

  return { ask, dialog };
}

function ConfirmDialog({ title, body, confirm, danger, onClose }: ConfirmOptions & { onClose: (ok: boolean) => void }) {
  const okRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    okRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <motion.div
      className={s.dialogWrap}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      onMouseDown={(e) => e.target === e.currentTarget && onClose(false)}
    >
      <motion.div
        className={s.dialog}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        initial={{ opacity: 0, y: 12, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 8, scale: 0.98 }}
        transition={{ duration: 0.25, ease: EASE }}
      >
        <h2 id="confirm-title" className={s.dialogTitle}>{title}</h2>
        <div className={s.dialogText}>{body}</div>
        <div className={s.dialogActions}>
          <button type="button" className={s.btn} onClick={() => onClose(false)}>Cancel</button>
          <button
            ref={okRef}
            type="button"
            className={cx(s.btn, danger ? s.btnDanger : s.btnAccent)}
            onClick={() => onClose(true)}
          >
            {confirm}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ───────────── Toast ───────────── */

export interface ToastMsg {
  id: number;
  text: string;
  error?: boolean;
}

export function Toast({ toast, onDone }: { toast: ToastMsg | null; onDone: () => void }) {
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(onDone, toast.error ? 6000 : 3200);
    return () => clearTimeout(t);
  }, [toast, onDone]);

  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          key={toast.id}
          role="status"
          className={cx(s.toast, toast.error && s.toastError)}
          initial={{ opacity: 0, y: 16, x: '-50%' }}
          animate={{ opacity: 1, y: 0, x: '-50%' }}
          exit={{ opacity: 0, y: 10, x: '-50%' }}
          transition={{ duration: 0.25, ease: EASE }}
        >
          <span className={s.toastDot} />
          {toast.text}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** Server actions throw generic errors in production; keep what's useful. */
export function errorText(err: unknown, fallback = 'Something went wrong.'): string {
  const msg = err instanceof Error ? err.message : typeof err === 'string' ? err : '';
  if (!msg || /Server Components render|digest/i.test(msg)) return fallback;
  return msg;
}
