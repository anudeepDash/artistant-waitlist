import type { AdminWaitlistEntry } from '@/lib/waitlist';

/* Shared types and helpers for the admin. Pure functions only, no React. */

export type Person = AdminWaitlistEntry;

export interface ActivityLog {
  id?: string;
  user_id: string | null;
  email: string | null;
  username: string | null;
  action_type: 'visit' | 'login' | 'waitlist_register' | string;
  user_agent: string | null;
  referrer: string | null;
  created_at: string;
}

export interface AdminMember {
  id: string;
  email: string;
  added_by?: string | null;
  created_at: string;
}

export type View = 'overview' | 'people' | 'email' | 'team';
export const VIEWS: View[] = ['overview', 'people', 'email', 'team'];

export type Status = 'review' | 'verified' | 'blocked';
export type StatusFilter = 'all' | Status;

/** Must match the super-admin the server actions refuse to remove. */
export const SUPER_ADMIN_EMAIL = 'anudeepdash2004@gmail.com';

export function statusOf(p: Person): Status {
  if (p.is_blocked) return 'blocked';
  if (p.is_verified) return 'verified';
  return 'review';
}

export const STATUS_LABEL: Record<Status, string> = {
  review: 'To review',
  verified: 'Verified',
  blocked: 'Blocked',
};

/** Blocked people and people hidden from the count don't take a place in the queue. */
export function countsTowardQueue(p: Person): boolean {
  return !p.is_blocked && !p.exclude_from_waitlist;
}

/**
 * Place in the queue, worked out the same way the public site does it
 * (getWaitlistPositionAction): active members who reserved at or before this person.
 */
export function queuePositions(people: Person[]): Map<string, number> {
  const active = people
    .filter(countsTowardQueue)
    .map((p) => ({ id: p.id, t: Date.parse(p.reserved_at) }))
    .sort((a, b) => a.t - b.t);
  const out = new Map<string, number>();
  let i = 0;
  while (i < active.length) {
    // People who reserved at the same instant share the higher number, like the `lte` count.
    let j = i;
    while (j + 1 < active.length && active[j + 1].t === active[i].t) j++;
    for (let k = i; k <= j; k++) out.set(active[k].id, j + 1);
    i = j + 1;
  }
  return out;
}

export function referralCounts(people: Person[]): Map<string, number> {
  const out = new Map<string, number>();
  for (const p of people) {
    const ref = p.referred_by?.trim().toLowerCase();
    if (ref) out.set(ref, (out.get(ref) || 0) + 1);
  }
  return out;
}

export function displayName(p: Person): string {
  return p.display_name?.trim() || p.username;
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  return ((parts[0][0] || '') + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase();
}

export function titleCase(s: string): string {
  if (/^dj$/i.test(s.trim())) return 'DJ';
  return s.replace(/[_-]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export function matchesSearch(p: Person, q: string): boolean {
  if (!q) return true;
  const needle = q.trim().toLowerCase().replace(/^@/, '');
  return [p.username, p.email, p.display_name, p.phone, p.city, p.category]
    .some((v) => typeof v === 'string' && v.toLowerCase().includes(needle));
}

/* ───────────── Dates ───────────── */

const DAY = 24 * 60 * 60 * 1000;

export function startOfDay(t: number): number {
  const d = new Date(t);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export function timeAgo(iso: string | null | undefined, now = Date.now()): string {
  if (!iso) return '—';
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return '—';
  const s = Math.max(0, Math.round((now - t) / 1000));
  if (s < 60) return 'just now';
  const m = Math.round(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.round(h / 24);
  if (d < 7) return `${d}d ago`;
  return formatDate(iso);
}

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  const sameYear = d.getFullYear() === new Date().getFullYear();
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', ...(sameYear ? {} : { year: 'numeric' }) });
}

export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' });
}

/** Sign-ups per calendar day for the last `days` days, oldest first. */
export function dailyCounts(isoDates: string[], days: number, now = Date.now()): { day: number; count: number }[] {
  const today = startOfDay(now);
  const first = today - (days - 1) * DAY;
  const buckets = Array.from({ length: days }, (_, i) => ({ day: first + i * DAY, count: 0 }));
  for (const iso of isoDates) {
    const t = Date.parse(iso);
    if (Number.isNaN(t) || t < first) continue;
    // Round to absorb the odd 23/25-hour day around clock changes.
    const idx = Math.round((startOfDay(t) - first) / DAY);
    if (idx >= 0 && idx < days) buckets[idx].count++;
  }
  return buckets;
}

export function countSince(isoDates: string[], from: number, to = Infinity): number {
  let n = 0;
  for (const iso of isoDates) {
    const t = Date.parse(iso);
    if (t >= from && t < to) n++;
  }
  return n;
}

export const DAY_MS = DAY;

/** Most common values of a field, highest first. */
export function topValues(values: (string | null | undefined)[], limit: number): { label: string; count: number }[] {
  const counts = new Map<string, { label: string; count: number }>();
  for (const raw of values) {
    const v = raw?.trim();
    if (!v) continue;
    const key = v.toLowerCase();
    const hit = counts.get(key);
    if (hit) hit.count++;
    else counts.set(key, { label: v, count: 1 });
  }
  return [...counts.values()].sort((a, b) => b.count - a.count).slice(0, limit);
}

/* ───────────── Export ───────────── */

function csvCell(v: unknown): string {
  if (v === null || v === undefined) return '';
  let s = Array.isArray(v) ? v.join('; ') : String(v);
  // Stop spreadsheet apps treating a cell as a formula.
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function peopleToCsv(people: Person[], positions: Map<string, number>): string {
  const header = ['Place', 'Username', 'Name', 'Email', 'Phone', 'Role', 'Category', 'City', 'Genres', 'Status', 'Referred by', 'Joined'];
  const rows = people.map((p) => [
    positions.get(p.id) ?? '',
    p.username,
    displayName(p),
    p.email,
    p.phone,
    p.role,
    p.category,
    p.city,
    p.genres,
    STATUS_LABEL[statusOf(p)],
    p.referred_by,
    p.reserved_at,
  ]);
  return [header, ...rows].map((r) => r.map(csvCell).join(',')).join('\r\n');
}

export function downloadText(filename: string, text: string, type = 'text/csv;charset=utf-8') {
  const blob = new Blob(['﻿' + text], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/* ───────────── Activity ───────────── */

export function deviceOf(ua: string | null): string {
  if (!ua) return 'Unknown device';
  const l = ua.toLowerCase();
  const os = l.includes('iphone') || l.includes('ipad') ? 'iOS'
    : l.includes('android') ? 'Android'
    : l.includes('mac os') || l.includes('macintosh') ? 'Mac'
    : l.includes('windows') ? 'Windows'
    : l.includes('linux') ? 'Linux' : 'Unknown';
  const browser = l.includes('edg/') ? 'Edge'
    : l.includes('instagram') ? 'Instagram'
    : l.includes('chrome') || l.includes('crios') ? 'Chrome'
    : l.includes('firefox') || l.includes('fxios') ? 'Firefox'
    : l.includes('safari') ? 'Safari' : 'Browser';
  return `${browser} · ${os}`;
}

export function referrerHost(ref: string | null): string | null {
  if (!ref) return null;
  try {
    const h = new URL(ref).hostname.replace(/^www\./, '');
    return h.endsWith('artistant.in') ? null : h;
  } catch {
    return null;
  }
}

export const ACTIVITY_LABEL: Record<string, string> = {
  visit: 'Visit',
  login: 'Sign-in',
  waitlist_register: 'Sign-up',
};
