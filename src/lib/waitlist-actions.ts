'use server';

import crypto from 'crypto';
import { verifyIdToken } from './firebase/admin';
import { getAdminSupabaseClient } from './supabase/admin';
import {
  type ReserveUsernameInput,
  type WaitlistEntry,
  ensureValidDisplayName,
} from './waitlist-shared';
import {
  UUID_REGEX,
  cleanStringArray,
  cleanText,
  isValidEmail,
  normaliseUsername,
  sanitizeUrl,
  validateUsername,
} from './validation';

/**
 * Waitlist reads/writes that used to run in the browser with the public anon key.
 * Every action derives the caller's identity from a verified Firebase ID token, so
 * the database no longer needs to grant anon/authenticated roles any table access.
 */

const IMPORTED_UID_PREFIX = 'imported_';

/** A row is unclaimed when it was pre-registered by an import and never linked to a login. */
function isUnclaimed(row: { user_id?: string | null }): boolean {
  return !row.user_id || row.user_id.startsWith(IMPORTED_UID_PREFIX);
}

function formatIndianPhone(phone: string | null | undefined): string | null {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, '').slice(-10);
  return digits.length === 10 ? `+91${digits}` : null;
}

function withCleanDisplayName(entry: WaitlistEntry): WaitlistEntry {
  return { ...entry, display_name: ensureValidDisplayName(entry.display_name, entry.username, entry.email) };
}

function maskEmail(email: string | null | undefined): string {
  if (!email || !email.includes('@')) return '';
  const [local, domain] = email.split('@');
  return `${local.slice(0, 2)}${'*'.repeat(Math.max(1, local.length - 2))}@${domain}`;
}

/**
 * Returns the caller's waitlist entry. If none is linked yet, links an unclaimed
 * (imported) entry that matches the caller's *verified* email or phone number.
 */
export async function getMyReservationAction(idToken: string): Promise<WaitlistEntry | null> {
  const decoded = await verifyIdToken(idToken);
  const client = getAdminSupabaseClient();

  const { data: own } = await client
    .from('waitlist_users')
    .select('*')
    .eq('user_id', decoded.uid)
    .limit(1);
  if (own && own.length > 0) return withCleanDisplayName(own[0] as WaitlistEntry);

  const candidates: WaitlistEntry[] = [];
  if (decoded.email && decoded.email_verified) {
    const { data } = await client
      .from('waitlist_users')
      .select('*')
      .ilike('email', decoded.email.trim())
      .limit(5);
    if (data) candidates.push(...(data as WaitlistEntry[]));
  }
  const phone = formatIndianPhone(decoded.phone_number);
  if (phone) {
    const { data } = await client.from('waitlist_users').select('*').eq('phone', phone).limit(5);
    if (data) candidates.push(...(data as WaitlistEntry[]));
  }

  const match = candidates.find(isUnclaimed);
  if (!match) return null;

  const { error } = await client
    .from('waitlist_users')
    .update({ user_id: decoded.uid })
    .eq('id', match.id);
  if (error) {
    console.error('Error linking reservation to user:', error.message);
    return null;
  }
  return withCleanDisplayName({ ...match, user_id: decoded.uid });
}

/** Creates or updates the caller's username reservation. */
export async function reserveUsernameAction(
  idToken: string,
  input: Omit<ReserveUsernameInput, 'uid'>,
): Promise<void> {
  const decoded = await verifyIdToken(idToken);
  const uid = decoded.uid;

  const usernameError = validateUsername(input.username);
  if (usernameError) throw new Error(usernameError);
  const username = normaliseUsername(input.username);

  const referredBy = input.referredBy ? normaliseUsername(input.referredBy) : null;
  if (referredBy && referredBy === username) {
    throw new Error('You cannot refer yourself.');
  }

  // Prefer identity details verified by Firebase over anything typed into the form.
  const email = decoded.email || (isValidEmail(input.email) ? input.email.trim().toLowerCase() : '');
  const phone = formatIndianPhone(decoded.phone_number) || formatIndianPhone(input.phone);
  const genres = cleanStringArray(input.genres, 5, 40);
  const eventTypes = cleanStringArray(input.eventTypes, 10, 40);
  const city = cleanText(input.city, 80);
  const bio = cleanText(input.bio, 1000);
  const spotifyUrl = sanitizeUrl(input.spotifyUrl);
  const instagramUrl = sanitizeUrl(input.instagramUrl);
  const youtubeUrl = sanitizeUrl(input.youtubeUrl);
  const youtubeChannelUrl = sanitizeUrl(input.youtubeChannelUrl);
  const profilePhotoUrl = sanitizeUrl(input.profilePhotoUrl);
  const allowedRoles = ['artist', 'venue', 'vendor', 'fan'];

  const payload = {
    user_id: uid,
    username,
    email,
    display_name: ensureValidDisplayName(cleanText(input.displayName, 80), username, email),
    role: input.role && allowedRoles.includes(input.role) ? input.role : null,
    ...(input.category ? { category: cleanText(input.category, 40) } : {}),
    ...(genres.length > 0 ? { genres } : {}),
    ...(phone ? { phone } : {}),
    ...(referredBy && /^[a-z0-9_.]{3,30}$/.test(referredBy) ? { referred_by: referredBy } : {}),
    ...(city ? { city } : {}),
    ...(eventTypes.length > 0 ? { event_types: eventTypes } : {}),
    ...(spotifyUrl ? { spotify_url: spotifyUrl } : {}),
    ...(instagramUrl ? { instagram_url: instagramUrl } : {}),
    ...(youtubeUrl ? { youtube_url: youtubeUrl } : {}),
    ...(youtubeChannelUrl ? { youtube_channel_url: youtubeChannelUrl } : {}),
    ...(bio ? { bio } : {}),
    ...(profilePhotoUrl ? { profile_photo_url: profilePhotoUrl } : {}),
  };

  const client = getAdminSupabaseClient();
  const { data: existing, error: checkError } = await client
    .from('waitlist_users')
    .select('id')
    .eq('user_id', uid)
    .maybeSingle();

  if (checkError) {
    const ref = crypto.randomUUID();
    console.error('Error Ref:', ref, checkError);
    throw new Error('An internal error occurred. Ref: ' + ref);
  }

  const { error } = existing
    ? await client.from('waitlist_users').update(payload).eq('id', existing.id)
    : await client.from('waitlist_users').insert(payload);

  if (error) {
    if (error.code === '23505') {
      throw new Error(`Username "${username}" is already taken.`);
    }
    const ref = crypto.randomUUID();
    console.error('Error Ref:', ref, error);
    throw new Error('An internal error occurred. Ref: ' + ref);
  }
}

/** Fills in the caller's contact email/phone when their entry has none yet. */
export async function updateMyContactInfoAction(
  idToken: string,
  email?: string | null,
  phone?: string | null,
): Promise<void> {
  const decoded = await verifyIdToken(idToken);
  const client = getAdminSupabaseClient();

  const { data: entry } = await client
    .from('waitlist_users')
    .select('id, email, phone')
    .eq('user_id', decoded.uid)
    .maybeSingle();
  if (!entry) return;

  const updates: { email?: string; phone?: string } = {};
  const verifiedEmail = decoded.email || (isValidEmail(email) ? email.trim().toLowerCase() : null);
  if (!entry.email && verifiedEmail) updates.email = verifiedEmail;
  const formattedPhone = formatIndianPhone(decoded.phone_number) || formatIndianPhone(phone);
  if (!entry.phone && formattedPhone) updates.phone = formattedPhone;

  if (Object.keys(updates).length === 0) return;
  const { error } = await client.from('waitlist_users').update(updates).eq('id', entry.id);
  if (error) console.error('Error updating reservation contact info:', error.message);
}

export interface ResolveClaimParams {
  id?: string | null;
  username?: string | null;
  email?: string | null;
  token?: string | null;
}

/**
 * Public lookup used by the /claim page. Returns profile fields needed to render the
 * claim wizard; contact details are masked and never returned in full.
 */
export async function resolveClaimReservationAction(params: ResolveClaimParams): Promise<WaitlistEntry | null> {
  const client = getAdminSupabaseClient();
  const rawId = (params.id || params.token || '').trim();
  const rawUsername = (params.username || '').trim();
  const rawEmail = (params.email || '').trim();

  let row: WaitlistEntry | null = null;

  if (rawId && UUID_REGEX.test(rawId)) {
    const { data } = await client.from('waitlist_users').select('*').eq('id', rawId).maybeSingle();
    row = (data as WaitlistEntry) || null;
  }

  const candidateUsername = rawUsername || (rawId && !rawId.includes('@') && !UUID_REGEX.test(rawId) ? rawId : '');
  if (!row && candidateUsername) {
    const norm = normaliseUsername(candidateUsername);
    if (/^[a-z0-9_.]{3,30}$/.test(norm)) {
      const { data } = await client.from('waitlist_users').select('*').eq('username', norm).maybeSingle();
      row = (data as WaitlistEntry) || null;
    }
  }

  const candidateEmail = rawEmail || (rawId.includes('@') ? rawId : '') || (rawUsername.includes('@') ? rawUsername : '');
  if (!row && isValidEmail(candidateEmail)) {
    const { data } = await client
      .from('waitlist_users')
      .select('*')
      .ilike('email', candidateEmail.trim())
      .limit(1);
    row = (data?.[0] as WaitlistEntry) || null;
  }

  if (!row) return null;
  const clean = withCleanDisplayName(row);
  return {
    ...clean,
    email: maskEmail(row.email),
    phone: null,
    // Only expose whether the profile is still claimable, not the linked account id.
    user_id: isUnclaimed(row) ? '' : 'claimed',
  };
}

export async function getReferralCountAction(username: string): Promise<number> {
  const norm = normaliseUsername(username);
  if (!/^[a-z0-9_.]{3,30}$/.test(norm)) return 0;
  const { count, error } = await getAdminSupabaseClient()
    .from('waitlist_users')
    .select('id', { count: 'exact', head: true })
    .eq('referred_by', norm);
  if (error) {
    console.warn('Error getting referral count:', error.message);
    return 0;
  }
  return count || 0;
}

/** Number of non-excluded, non-blocked members who joined on or before `reservedAt`. */
export async function getWaitlistPositionCountAction(reservedAt: string): Promise<number | null> {
  if (Number.isNaN(Date.parse(reservedAt))) return null;
  const { count, error } = await getAdminSupabaseClient()
    .from('waitlist_users')
    .select('id', { count: 'exact', head: true })
    .or('exclude_from_waitlist.is.null,exclude_from_waitlist.eq.false')
    .eq('is_blocked', false)
    .lte('reserved_at', reservedAt);
  if (error) return null;
  return count;
}
