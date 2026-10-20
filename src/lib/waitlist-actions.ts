'use server';

/*
 * Waitlist reads and writes, done on the server with the service-role key.
 *
 * These used to run in the browser with the public anon key, which meant the
 * waitlist_users table had to be open to anyone holding that key. Now every
 * caller is identified from a verified Firebase ID token, public lookups return
 * only public fields, and the table can be closed to anon access with RLS.
 */

import { getAdminSupabaseClient } from './supabase/admin';
import { verifyIdToken } from './firebase/admin';
import { ensureValidDisplayName, type ReserveUsernameInput, type WaitlistEntry } from './waitlist';

function db() {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) throw new Error('The server is missing its database key.');
  return getAdminSupabaseClient();
}

const USERNAME_RE = /^[a-z0-9_.]{3,30}$/;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const EMAIL_RE = /^[^\s@]{1,64}@[^\s@]{1,190}\.[^\s@]{2,}$/;

const clip = (v: unknown, n: number) => (typeof v === 'string' ? v.trim().slice(0, n) : '');
const clipList = (v: unknown, items = 12, n = 40) =>
  Array.isArray(v) ? v.filter((x) => typeof x === 'string').slice(0, items).map((x) => x.trim().slice(0, n)) : [];
const indianPhone = (phone: string) => `+91${phone.replace(/\D/g, '').slice(-10)}`;

/** Keeps only https links on the expected hosts. */
function safeLink(value: unknown, hosts: string[]): string {
  const v = clip(value, 500);
  if (!v) return '';
  try {
    const u = new URL(v);
    const h = u.hostname.toLowerCase();
    return u.protocol === 'https:' && hosts.some((x) => h === x || h.endsWith(`.${x}`)) ? u.toString() : '';
  } catch {
    return '';
  }
}

function tidy(entry: WaitlistEntry): WaitlistEntry {
  entry.display_name = ensureValidDisplayName(entry.display_name, entry.username, entry.email);
  return entry;
}

/* ───────────── The caller's own reservation ───────────── */

/**
 * Returns the signed-in user's waitlist entry. A row that was imported for their
 * verified email or phone, and is still unclaimed, is linked to them on first sign-in.
 */
export async function getMyReservationAction(idToken: string): Promise<WaitlistEntry | null> {
  const decoded = await verifyIdToken(idToken);
  const client = db();

  const { data: own } = await client.from('waitlist_users').select('*').eq('user_id', decoded.uid).limit(1);
  if (own && own.length > 0) return tidy(own[0] as WaitlistEntry);

  // No row yet: look for an unclaimed one made for this verified email or phone number.
  const email = decoded.email_verified ? (decoded.email || '').trim().toLowerCase() : '';
  const phone = decoded.phone_number ? indianPhone(decoded.phone_number) : '';
  let match: WaitlistEntry | null = null;
  if (email && EMAIL_RE.test(email)) {
    const { data } = await client.from('waitlist_users').select('*').ilike('email', email).is('user_id', null).limit(1);
    match = (data?.[0] as WaitlistEntry) ?? null;
  }
  if (!match && phone) {
    const { data } = await client.from('waitlist_users').select('*').eq('phone', phone).is('user_id', null).limit(1);
    match = (data?.[0] as WaitlistEntry) ?? null;
  }
  if (!match) return null;

  const { error } = await client.from('waitlist_users').update({ user_id: decoded.uid }).eq('id', match.id).is('user_id', null);
  if (error) {
    console.error('Error linking reservation to user:', error);
    return null;
  }
  match.user_id = decoded.uid;
  return tidy(match);
}

/** Creates or updates the signed-in user's reservation. */
export async function reserveUsernameAction(idToken: string, input: Omit<ReserveUsernameInput, 'uid'>): Promise<void> {
  const decoded = await verifyIdToken(idToken);
  const client = db();

  const username = clip(input.username, 30).toLowerCase();
  if (!USERNAME_RE.test(username)) {
    throw new Error('Username must be 3-30 characters long and can only contain letters, numbers, underscores, and dots.');
  }
  const referredBy = clip(input.referredBy, 30).toLowerCase();
  if (referredBy && referredBy === username) throw new Error('You cannot refer yourself.');

  // The sign-in email wins. Phone sign-ins have none, so they may supply one.
  const email = (decoded.email || clip(input.email, 254)).toLowerCase();
  if (email && !EMAIL_RE.test(email)) throw new Error('Please check your email address.');

  const payload = {
    user_id: decoded.uid,
    username,
    email,
    display_name: ensureValidDisplayName(clip(input.displayName, 80), username, email),
    role: input.role && ['artist', 'venue', 'vendor', 'fan', 'founder'].includes(input.role) ? input.role : null,
    ...(input.category ? { category: clip(input.category, 40) } : {}),
    ...(input.genres?.length ? { genres: clipList(input.genres, 6) } : {}),
    ...(input.phone ? { phone: indianPhone(clip(input.phone, 20)) } : {}),
    ...(referredBy && USERNAME_RE.test(referredBy) ? { referred_by: referredBy } : {}),
    ...(input.city ? { city: clip(input.city, 80) } : {}),
    ...(input.eventTypes?.length ? { event_types: clipList(input.eventTypes) } : {}),
    ...(input.spotifyUrl ? { spotify_url: safeLink(input.spotifyUrl, ['spotify.com', 'spotify.link']) } : {}),
    ...(input.instagramUrl ? { instagram_url: safeLink(input.instagramUrl, ['instagram.com']) } : {}),
    ...(input.youtubeUrl ? { youtube_url: safeLink(input.youtubeUrl, ['youtube.com', 'youtu.be']) } : {}),
    ...(input.youtubeChannelUrl ? { youtube_channel_url: safeLink(input.youtubeChannelUrl, ['youtube.com']) } : {}),
    ...(input.bio ? { bio: clip(input.bio, 1000) } : {}),
    ...(input.profilePhotoUrl ? { profile_photo_url: safeLink(input.profilePhotoUrl, ['googleusercontent.com', new URL(process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://x.invalid').hostname]) } : {}),
  };

  const { data: existing, error: checkError } = await client.from('waitlist_users').select('id').eq('user_id', decoded.uid).maybeSingle();
  if (checkError) {
    const ref = crypto.randomUUID();
    console.error('Error Ref:', ref, checkError);
    throw new Error('An internal error occurred. Ref: ' + ref);
  }

  const { error } = existing
    ? await client.from('waitlist_users').update(payload).eq('id', existing.id)
    : await client.from('waitlist_users').insert(payload);

  if (error) {
    if (error.code === '23505') throw new Error(`Username "${username}" is already taken.`);
    const ref = crypto.randomUUID();
    console.error('Error Ref:', ref, error);
    throw new Error('An internal error occurred. Ref: ' + ref);
  }
}

/** Fills in a missing or changed email/phone on the signed-in user's own reservation. */
export async function updateMyContactInfoAction(idToken: string, email?: string | null, phone?: string | null): Promise<void> {
  const decoded = await verifyIdToken(idToken);
  const client = db();
  const { data: row } = await client.from('waitlist_users').select('id, email, phone').eq('user_id', decoded.uid).maybeSingle();
  if (!row) return;

  const updates: { email?: string; phone?: string } = {};
  const cleanEmail = clip(email, 254).toLowerCase();
  if (cleanEmail && EMAIL_RE.test(cleanEmail) && cleanEmail !== (row.email || '').toLowerCase()) updates.email = cleanEmail;
  if (phone && clip(phone, 20).replace(/\D/g, '').length >= 10) {
    const p = indianPhone(clip(phone, 20));
    if (p !== row.phone) updates.phone = p;
  }
  if (Object.keys(updates).length === 0) return;

  const { error } = await client.from('waitlist_users').update(updates).eq('id', row.id);
  if (error) console.error('Error updating reservation contact info:', error);
}

/* ───────────── Public lookups (no email or phone) ───────────── */

const PUBLIC_FIELDS =
  'id, username, display_name, role, reserved_at, category, genres, city, bio, spotify_url, instagram_url, youtube_url, youtube_channel_url, profile_photo_url, cover_photo_url, user_id';

/** What the claim page needs to show a profile before it's claimed. Never includes contact details. */
function toPublicEntry(row: Record<string, unknown>): WaitlistEntry & { claimed: boolean } {
  const { user_id, ...rest } = row as unknown as WaitlistEntry;
  const entry = tidy({ ...(rest as WaitlistEntry), user_id: '', email: '' });
  return { ...entry, claimed: Boolean(user_id) };
}

export interface ResolveClaimParams {
  id?: string | null;
  username?: string | null;
  email?: string | null;
  token?: string | null;
}

/** Finds a profile for the claim page by its id, username or email. */
export async function resolveClaimReservationAction(params: ResolveClaimParams): Promise<(WaitlistEntry & { claimed: boolean }) | null> {
  const client = db();
  const rawId = clip(params.id || params.token, 254);
  const rawUsername = clip(params.username, 254);
  const rawEmail = clip(params.email, 254);

  if (rawId && UUID_RE.test(rawId)) {
    const { data } = await client.from('waitlist_users').select(PUBLIC_FIELDS).eq('id', rawId).maybeSingle();
    if (data) return toPublicEntry(data);
  }

  const candidateUsername = (rawUsername && !rawUsername.includes('@') ? rawUsername : '') || (rawId && !rawId.includes('@') && !UUID_RE.test(rawId) ? rawId : '');
  if (candidateUsername && USERNAME_RE.test(candidateUsername.toLowerCase())) {
    const { data } = await client.from('waitlist_users').select(PUBLIC_FIELDS).eq('username', candidateUsername.toLowerCase()).maybeSingle();
    if (data) return toPublicEntry(data);
  }

  const candidateEmail = (rawEmail || (rawId.includes('@') ? rawId : '') || (rawUsername.includes('@') ? rawUsername : '')).toLowerCase();
  if (candidateEmail && EMAIL_RE.test(candidateEmail)) {
    // Exact match only (no wildcards), so this can't be used to search for addresses.
    const { data } = await client.from('waitlist_users').select(PUBLIC_FIELDS).eq('email', candidateEmail).maybeSingle();
    if (data) return toPublicEntry(data);
  }

  return null;
}

/* ───────────── Counts ───────────── */

/** Place in the queue: how many active members reserved at or before this time. */
export async function getWaitlistPositionAction(reservedAt: string): Promise<number | null> {
  if (Number.isNaN(Date.parse(reservedAt))) return null;
  const { count, error } = await db()
    .from('waitlist_users')
    .select('id', { count: 'exact', head: true })
    .or('exclude_from_waitlist.is.null,exclude_from_waitlist.eq.false')
    .eq('is_blocked', false)
    .lte('reserved_at', reservedAt);
  return error || !count ? null : count;
}

/** How many people signed up with this username as their referrer. */
export async function getReferralCountAction(username: string, verified?: boolean): Promise<number> {
  const u = clip(username, 30).toLowerCase();
  if (!USERNAME_RE.test(u)) return 0;
  let q = db().from('waitlist_users').select('id', { count: 'exact', head: true }).eq('referred_by', u);
  if (verified !== undefined) q = q.eq('is_verified', verified);
  const { count, error } = await q;
  return error ? 0 : count || 0;
}
