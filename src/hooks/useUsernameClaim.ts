'use client';

import { useEffect, useState } from 'react';
import { checkUsernameAvailableAction, checkMultipleUsernamesAvailableAction } from '@/lib/admin-actions';

export type AvailStatus = 'idle' | 'checking' | 'available' | 'taken' | 'invalid' | 'locked';

const RESERVED_USERNAMES = new Set([
  'admin', 'administrator', 'support', 'official', 'artistant', 'artist', 'tant',
  'mod', 'moderator', 'help', 'api', 'auth', 'login', 'logout', 'signin', 'signup',
  'register', 'user', 'username', 'null', 'undefined', 'root', 'system', 'security',
  'events', 'event', 'booking', 'bookings', 'gig', 'gigs', 'host', 'venue', 'fan',
  'developer', 'dev', 'webmaster', 'privacy', 'terms', 'about', 'contact', 'blog',
  'news', 'careers', 'jobs', 'faq', 'payment', 'billing', 'checkout', 'test',
  'demo', 'example',
]);

const PREMIUM_USERNAMES = new Set([
  'ai', 'india', 'dj', 'genre', 'genres', 'music', 'singer', 'band', 'comedian',
  'dancer', 'rapper', 'hiphop', 'rock', 'pop', 'jazz', 'techno', 'edm', 'live',
  'show', 'bangalore', 'mumbai', 'goa', 'delhi',
]);

const DEBOUNCE_MS = 500;

const isValidCandidate = (name: string) =>
  name.length >= 3 &&
  name.length <= 20 &&
  /^[a-z]/.test(name) &&
  /^[a-z0-9_]+$/.test(name) &&
  !RESERVED_USERNAMES.has(name) &&
  !PREMIUM_USERNAMES.has(name);

function getCandidateUsernames(raw: string): string[] {
  const clean = raw.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
  if (clean.length === 0) return [];

  const prefixes = ['the_', 'iam_', 'real_'];
  const suffixes = ['_live', '_official', '_music', '_art', '_sound', '_hq', '_show'];
  const candidates = [
    ...prefixes.map((p) => `${p}${clean}`),
    ...suffixes.map((s) => `${clean}${s}`),
    `${clean}_${new Date().getFullYear()}`,
    `${clean}99`,
  ].filter(isValidCandidate);

  return Array.from(new Set(candidates)).filter((c) => c !== clean);
}

async function findAvailableSuggestions(raw: string): Promise<string[]> {
  const candidates = getCandidateUsernames(raw);
  if (candidates.length === 0) return [];
  const availability = await checkMultipleUsernamesAvailableAction(candidates);
  return candidates.filter((c) => availability[c]).slice(0, 4);
}

type LocalCheck =
  | { kind: 'idle' }
  | { kind: 'ok' }
  | { kind: 'invalid' | 'locked'; message: string; suggest: boolean };

/** Format rules that can be checked without asking the server. */
function checkLocally(raw: string): LocalCheck {
  if (raw.length === 0) return { kind: 'idle' };
  if (raw.length < 3) return { kind: 'invalid', message: 'Use at least 3 characters', suggest: raw.length >= 2 };
  if (raw.length > 20) return { kind: 'invalid', message: 'Keep it to 20 characters or fewer', suggest: false };
  if (!/^[a-z]/.test(raw)) return { kind: 'invalid', message: 'Start with a letter', suggest: true };
  if (!/^[a-z0-9_]+$/.test(raw)) return { kind: 'invalid', message: 'Letters, numbers and underscores only', suggest: false };
  if (RESERVED_USERNAMES.has(raw)) return { kind: 'invalid', message: 'This name is reserved', suggest: true };
  if (PREMIUM_USERNAMES.has(raw)) return { kind: 'locked', message: 'This is a premium name — request it from us', suggest: true };
  return { kind: 'ok' };
}

type RemoteResult = { name: string; status: 'available' | 'taken' | 'error'; error?: string };
type SuggestionResult = { name: string; list: string[] };

/**
 * Live username validation + availability check with debounced suggestions.
 * Shared by every claim form on the landing page so they stay in sync.
 */
export function useUsernameClaim() {
  const [username, setUsernameRaw] = useState('');
  const [remote, setRemote] = useState<RemoteResult | null>(null);
  const [suggested, setSuggested] = useState<SuggestionResult | null>(null);

  const setUsername = (value: string) => setUsernameRaw(value.toLowerCase().replace(/[^a-z0-9_]/g, ''));

  const raw = username.trim().toLowerCase();
  const local = checkLocally(raw);
  const remoteForName = remote?.name === raw ? remote : null;

  useEffect(() => {
    if (local.kind === 'idle') return;
    if (local.kind !== 'ok' && !local.suggest) return;

    let cancelled = false;
    const timer = setTimeout(async () => {
      if (local.kind === 'ok') {
        try {
          const res = await checkUsernameAvailableAction(raw);
          if (cancelled) return;
          if (!res.success) {
            setRemote({ name: raw, status: 'error', error: res.error || 'Could not check this name. Try again.' });
            return;
          }
          setRemote({ name: raw, status: res.available ? 'available' : 'taken' });
          if (res.available) return;
        } catch (err) {
          if (!cancelled) {
            setRemote({ name: raw, status: 'error', error: err instanceof Error ? err.message : 'Could not check this name. Try again.' });
          }
          return;
        }
      }
      try {
        const list = await findAvailableSuggestions(raw);
        if (!cancelled) setSuggested({ name: raw, list });
      } catch {
        if (!cancelled) setSuggested({ name: raw, list: [] });
      }
    }, DEBOUNCE_MS);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
    // `local` is derived from `raw`, so `raw` is the only real dependency.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [raw]);

  let status: AvailStatus;
  let error: string | null = null;
  if (local.kind === 'idle') status = 'idle';
  else if (local.kind !== 'ok') {
    status = local.kind;
    error = local.message;
  } else if (!remoteForName) status = 'checking';
  else if (remoteForName.status === 'error') {
    status = 'invalid';
    error = remoteForName.error ?? null;
  } else status = remoteForName.status;

  const wantsSuggestions = (local.kind !== 'ok' && local.kind !== 'idle' && local.suggest) || status === 'taken' || status === 'checking';
  const suggestions = suggested?.name === raw && status !== 'available' ? suggested.list : [];
  const suggestionsLoading = wantsSuggestions && status !== 'available' && suggested?.name !== raw;

  return { username, setUsername, status, error, suggestions, suggestionsLoading };
}

export type UsernameClaim = ReturnType<typeof useUsernameClaim>;
