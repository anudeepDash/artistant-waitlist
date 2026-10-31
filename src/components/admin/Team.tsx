'use client';

import React, { useState } from 'react';
import { Trash2, UserPlus } from 'lucide-react';
import { SUPER_ADMIN_EMAIL, formatDate, type AdminMember } from './data';
import { PageHead } from './Shell';
import { Avatar, Spinner, cx } from './ui';
import s from './admin.module.css';

interface TeamProps {
  admins: AdminMember[];
  myEmail: string | null;
  onAdd: (email: string) => Promise<boolean>;
  onRemove: (email: string) => void;
  busy: string | null;
}

export default function Team({ admins, myEmail, onAdd, onRemove, busy }: TeamProps) {
  const [email, setEmail] = useState('');
  const valid = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
  const exists = admins.some((a) => a.email.toLowerCase() === email.trim().toLowerCase());

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid || exists || busy) return;
    if (await onAdd(email.trim().toLowerCase())) setEmail('');
  };

  const sorted = [...admins].sort((a, b) => {
    if (a.email.toLowerCase() === SUPER_ADMIN_EMAIL) return -1;
    if (b.email.toLowerCase() === SUPER_ADMIN_EMAIL) return 1;
    return Date.parse(a.created_at) - Date.parse(b.created_at);
  });

  return (
    <>
      <PageHead
        kicker="Team"
        title={<>Who can open <em>admin</em>.</>}
        sub="Anyone here can see every sign-up and email the waitlist. They need to sign in with this exact address, and it has to be verified (Google sign-in always is)."
      />

      <div className={s.grid2} style={{ marginTop: 0 }}>
        <div className={s.card}>
          <div className={s.cardHead}>
            <h2 className={s.h2}>Admins</h2>
            <span className={s.muted} style={{ fontSize: 13 }}>{admins.length}</span>
          </div>
          <div className={s.list}>
            {sorted.map((a) => {
              const isSuper = a.email.toLowerCase() === SUPER_ADMIN_EMAIL;
              const isMe = a.email.toLowerCase() === myEmail?.toLowerCase();
              return (
                <div key={a.id || a.email} className={s.listRow}>
                  <Avatar name={a.email} />
                  <span className={s.listMain}>
                    <span className={s.listTitle}>
                      {a.email}
                      {isMe && <span className={s.muted} style={{ fontWeight: 400 }}> · you</span>}
                    </span>
                    <span className={s.listSub}>
                      {isSuper
                        ? 'Owner · can’t be removed'
                        : `Added ${formatDate(a.created_at)}${a.added_by ? ` by ${a.added_by}` : ''}`}
                    </span>
                  </span>
                  {!isSuper && (
                    <button
                      type="button"
                      className={cx(s.iconBtn)}
                      onClick={() => onRemove(a.email)}
                      disabled={!!busy}
                      aria-label={`Remove ${a.email}`}
                      title="Remove access"
                    >
                      {busy === a.email ? <Spinner size={15} /> : <Trash2 size={15} />}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <form className={cx(s.card, s.stack)} onSubmit={submit} style={{ alignSelf: 'start' }}>
          <h2 className={s.h2}>Add someone</h2>
          <label className={s.field}>
            <span className={s.fieldLabel}>Email</span>
            <input
              className={s.input}
              type="email"
              placeholder="name@artistant.in"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <p className={s.muted} style={{ margin: 0, fontSize: 13 }}>
            {exists ? 'They’re already on the team.' : 'They’ll get an email saying they have access.'}
          </p>
          <button type="submit" className={cx(s.btn, s.btnPrimary)} disabled={!valid || exists || !!busy}>
            {busy === 'add' ? <Spinner size={14} /> : <UserPlus size={15} />} Give access
          </button>
        </form>
      </div>
    </>
  );
}
