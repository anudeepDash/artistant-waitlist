'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Ban, BadgeCheck, Check, Copy, ExternalLink, Mail, X } from 'lucide-react';
import type { WaitlistRole } from '@/lib/waitlist';
import { displayName, formatDateTime, statusOf, titleCase, type Person } from './data';
import { Avatar, EASE, Spinner, StatusPill, Switch, cx } from './ui';
import s from './admin.module.css';

const ROLES: WaitlistRole[] = ['artist', 'venue', 'vendor', 'fan', 'founder'];

export type PersonPatch = { is_verified?: boolean; is_blocked?: boolean; exclude_from_waitlist?: boolean };

interface DrawerProps {
  person: Person;
  place: number | undefined;
  referred: number;
  referrer: Person | undefined;
  busy: string | null;
  onClose: () => void;
  onPatch: (p: Person, patch: PersonPatch) => void;
  onRole: (p: Person, role: WaitlistRole) => void;
  onEmail: (p: Person) => void;
  onOpenPerson: (p: Person) => void;
}

function CopyValue({ value }: { value: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      className={s.copy}
      title="Copy"
      onClick={() => {
        navigator.clipboard?.writeText(value).then(() => {
          setDone(true);
          setTimeout(() => setDone(false), 1400);
        });
      }}
    >
      {value}
      {done ? <Check size={13} /> : <Copy size={13} />}
    </button>
  );
}

function ExtLink({ href, label }: { href: string; label: string }) {
  const safe = /^https?:\/\//i.test(href) ? href : `https://${href}`;
  return (
    <a className={s.copy} href={safe} target="_blank" rel="noreferrer noopener">
      {label} <ExternalLink size={12} />
    </a>
  );
}

export default function PersonDrawer({
  person: p,
  place,
  referred,
  referrer,
  busy,
  onClose,
  onPatch,
  onRole,
  onEmail,
  onOpenPerson,
}: DrawerProps) {
  const status = statusOf(p);
  const name = displayName(p);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const links = [
    p.instagram_url && { href: p.instagram_url, label: 'Instagram' },
    p.spotify_url && { href: p.spotify_url, label: 'Spotify' },
    (p.youtube_channel_url || p.youtube_url) && { href: (p.youtube_channel_url || p.youtube_url) as string, label: 'YouTube' },
  ].filter(Boolean) as { href: string; label: string }[];

  return (
    <>
      <motion.div
        className={s.scrim}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onClose}
      />
      <motion.aside
        className={s.drawer}
        role="dialog"
        aria-modal="true"
        aria-label={name}
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ duration: 0.35, ease: EASE }}
      >
        <div className={s.drawerHead}>
          <StatusPill status={status} />
          <button type="button" className={s.iconBtn} onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <div className={s.drawerBody}>
          <div className={s.profile}>
            <Avatar name={name} src={p.profile_photo_url} large />
            <div style={{ minWidth: 0 }}>
              <div className={s.profileName}>{name}</div>
              <div className={s.whoHandle} style={{ fontSize: 13, marginTop: 4 }}>
                @{p.username}
                {place ? ` · #${place} in the queue` : p.exclude_from_waitlist ? ' · not counted in the queue' : ''}
              </div>
            </div>
          </div>

          {p.bio && <p className={s.muted} style={{ margin: '0 0 4px', fontSize: 13 }}>{p.bio}</p>}

          <dl className={s.facts}>
            <dt>Email</dt>
            <dd><CopyValue value={p.email} /></dd>
            <dt>Phone</dt>
            <dd>{p.phone ? <CopyValue value={p.phone} /> : <span className={s.muted}>—</span>}</dd>
            <dt>City</dt>
            <dd>{p.city || <span className={s.muted}>—</span>}</dd>
            <dt>Does</dt>
            <dd>{p.category ? titleCase(p.category) : <span className={s.muted}>—</span>}</dd>
            {p.genres && p.genres.length > 0 && (
              <>
                <dt>Genres</dt>
                <dd className={s.chips}>{p.genres.map((g) => <span key={g} className={s.tag}>{g}</span>)}</dd>
              </>
            )}
            {p.event_types && p.event_types.length > 0 && (
              <>
                <dt>Plays at</dt>
                <dd className={s.chips}>{p.event_types.map((g) => <span key={g} className={s.tag}>{g}</span>)}</dd>
              </>
            )}
            <dt>Joined</dt>
            <dd>{formatDateTime(p.reserved_at)}</dd>
            <dt>Referred by</dt>
            <dd>
              {p.referred_by ? (
                referrer ? (
                  <button type="button" className={s.link} onClick={() => onOpenPerson(referrer)}>@{p.referred_by}</button>
                ) : (
                  `@${p.referred_by}`
                )
              ) : (
                <span className={s.muted}>No one</span>
              )}
            </dd>
            <dt>Brought in</dt>
            <dd>{referred} {referred === 1 ? 'person' : 'people'}</dd>
            {links.length > 0 && (
              <>
                <dt>Links</dt>
                <dd className={s.chips} style={{ gap: 14 }}>
                  {links.map((l) => <ExtLink key={l.label} {...l} />)}
                </dd>
              </>
            )}
          </dl>

          <div className={s.toggleRow}>
            <div className={s.toggleText}>
              <div className={s.toggleTitle}>Count in the queue</div>
              <div className={s.toggleDesc}>Turn off for test accounts and the team, so they don’t push others down.</div>
            </div>
            <Switch
              on={!p.exclude_from_waitlist}
              busy={busy === 'exclude_from_waitlist'}
              label="Count in the queue"
              onChange={() => onPatch(p, { exclude_from_waitlist: !p.exclude_from_waitlist })}
            />
          </div>

          <div className={s.toggleRow}>
            <div className={s.toggleText}>
              <div className={s.toggleTitle}>Role</div>
              <div className={s.toggleDesc}>Which side of Artistant they’re on.</div>
            </div>
            <select
              className={s.select}
              style={{ width: 130, height: 36 }}
              value={p.role || 'artist'}
              disabled={busy === 'role'}
              onChange={(e) => onRole(p, e.target.value as WaitlistRole)}
              aria-label="Role"
            >
              {ROLES.map((r) => <option key={r} value={r}>{titleCase(r)}</option>)}
            </select>
          </div>

          <div className={s.toggleRow}>
            <div className={s.toggleText}>
              <div className={s.toggleTitle}>Profile</div>
              <div className={s.toggleDesc}>Only the team can see profiles until launch.</div>
            </div>
            <a className={cx(s.btn, s.btnSm)} href={`/${p.username}`} target="_blank" rel="noreferrer">
              Open <ExternalLink size={12} />
            </a>
          </div>
        </div>

        <div className={s.drawerActions}>
          {status !== 'blocked' && (
            <button
              type="button"
              className={cx(s.btn, status === 'review' && s.btnAccent)}
              disabled={!!busy}
              onClick={() => onPatch(p, { is_verified: !p.is_verified })}
              title="They get an email either way"
            >
              {busy === 'is_verified' ? <Spinner size={14} /> : <BadgeCheck size={15} />}
              {p.is_verified ? 'Remove verification' : 'Verify'}
            </button>
          )}
          <button type="button" className={s.btn} onClick={() => onEmail(p)}>
            <Mail size={15} /> Email
          </button>
          <button
            type="button"
            className={cx(s.btn, !p.is_blocked && s.btnDanger)}
            disabled={!!busy}
            onClick={() => onPatch(p, { is_blocked: !p.is_blocked })}
          >
            {busy === 'is_blocked' ? <Spinner size={14} /> : <Ban size={15} />}
            {p.is_blocked ? 'Unblock' : 'Block'}
          </button>
        </div>
      </motion.aside>
    </>
  );
}
