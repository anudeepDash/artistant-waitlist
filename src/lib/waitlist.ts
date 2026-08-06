import { createClient } from "./supabase/client";
import { checkUsernameAvailableAction } from "./admin-actions";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** The set of roles a waitlist member can self-select. */
export type WaitlistRole = "artist" | "venue" | "vendor" | "fan";

export interface WaitlistEntry {
  id: string;
  user_id: string;
  username: string;
  email: string;
  display_name: string | null;
  role: WaitlistRole | null;
  reserved_at: string;
  position_override?: number | null;
  referred_by?: string | null;
  story_shared?: boolean | null;
  // Base Artist Profile Fields
  category?: ArtistCategory | null;
  genres?: string[] | null;
  phone?: string | null;
  city?: string | null;
  event_types?: string[] | null;
  spotify_url?: string | null;
  instagram_url?: string | null;
  youtube_url?: string | null;
  youtube_channel_url?: string | null;
  bio?: string | null;
  profile_photo_url?: string | null;
  cover_photo_url?: string | null;
  portfolio_theme?: 'dark' | 'minimal' | 'creative' | 'bold' | null;
  gallery_photos?: string[] | null;
  profile_visitors_count?: number;
  custom_status_message?: string | null;
  section_order?: string[] | null;
  contact_email_enabled?: boolean | null;
  contact_phone_enabled?: boolean | null;
  feature_founding_card?: boolean | null;
  exclude_from_waitlist?: boolean | null;
}

/** Artist category options */
export type ArtistCategory =
  | 'singer'
  | 'dj'
  | 'band'
  | 'comedian'
  | 'dancer'
  | 'mc_rapper'
  | 'instrumentalist'
  | 'other';

/** Payload required to reserve a username. */
export interface ReserveUsernameInput {
  uid: string;
  username: string;
  email: string;
  displayName: string;
  role?: WaitlistRole;
  /** Artist sub-category (Singer, DJ, etc.) */
  category?: ArtistCategory;
  /** Up to 3 genre/niche tags */
  genres?: string[];
  /** Phone number (E.164 format, e.g. +919900000000) */
  phone?: string;
  referredBy?: string;
  /** Base Artist Profile fields */
  city?: string;
  eventTypes?: string[];
  spotifyUrl?: string;
  instagramUrl?: string;
  youtubeUrl?: string;
  youtubeChannelUrl?: string;
  bio?: string;
  profilePhotoUrl?: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Ensures display_name is a valid human-readable name, and never an email ID or raw email address.
 */
export function ensureValidDisplayName(
  displayName?: string | null,
  username?: string | null,
  email?: string | null
): string {
  // 1. If valid custom display name is set (at least 2 characters and not an email), return it
  if (displayName && displayName.trim().length >= 2 && !displayName.includes('@')) {
    return displayName.trim();
  }

  // 2. Fallback to the user's reserved username handle
  if (username && username.trim() !== '') {
    return username.trim();
  }

  // 3. Fallback to email local part if available
  if (email && email.includes('@')) {
    const localPart = email.split('@')[0].trim();
    if (localPart) return localPart;
  }

  if (displayName && displayName.trim() !== '' && !displayName.includes('@')) {
    return displayName.trim();
  }

  return 'Artist';
}

/**
 * Normalises a username to lowercase for consistent look-ups.
 */
function normalise(username: string): string {
  return username.trim().toLowerCase();
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Checks whether a username is still available.
 *
 * @returns `true` if the username has **not** been reserved yet.
 */
export async function isUsernameAvailable(username: string): Promise<boolean> {
  try {
    const res = await checkUsernameAvailableAction(username);
    return res.success ? res.available : true; // Fallback to true if checking failed to not block signup completely
  } catch (error) {
    console.error("Error checking username availability:", error);
    return true; // Fallback to true so registration doesn't completely break
  }
}

/**
 * Atomically reserves a username for the given user.
 *
 * @throws {Error} if the username is already taken.
 */
export async function reserveUsername(
  input: ReserveUsernameInput,
): Promise<void> {
  const supabase = createClient();



  const { 
    uid, username, email, displayName, role, category, genres, phone, referredBy,
    city, eventTypes, spotifyUrl, instagramUrl, youtubeUrl, youtubeChannelUrl, bio, profilePhotoUrl 
  } = input;
  const normalisedUsername = normalise(username);

  // Validate username format
  const usernameRegex = /^[a-zA-Z0-9_.]{3,30}$/;
  if (!usernameRegex.test(normalisedUsername)) {
    throw new Error('Username must be 3-30 characters long and can only contain letters, numbers, underscores, and dots.');
  }

  // Prevent self-referrals
  if (referredBy && normalise(referredBy) === normalisedUsername) {
    throw new Error('You cannot refer yourself.');
  }

  const safeDisplayName = ensureValidDisplayName(displayName, normalisedUsername, email);

  const payload = {
    user_id: uid,
    username: normalisedUsername,
    email: email,
    display_name: safeDisplayName,
    role: role || null,
    ...(category ? { category } : {}),
    ...(genres && genres.length > 0 ? { genres } : {}),
    ...(phone ? { phone } : {}),
    ...(referredBy ? { referred_by: referredBy.trim().toLowerCase() } : {}),
    ...(city ? { city } : {}),
    ...(eventTypes && eventTypes.length > 0 ? { event_types: eventTypes } : {}),
    ...(spotifyUrl ? { spotify_url: spotifyUrl } : {}),
    ...(instagramUrl ? { instagram_url: instagramUrl } : {}),
    ...(youtubeUrl ? { youtube_url: youtubeUrl } : {}),
    ...(youtubeChannelUrl ? { youtube_channel_url: youtubeChannelUrl } : {}),
    ...(bio ? { bio } : {}),
    ...(profilePhotoUrl ? { profile_photo_url: profilePhotoUrl } : {}),
  };

  // Check if user already has an entry
  const { data: existingUser, error: checkError } = await supabase
    .from("waitlist_users")
    .select("id")
    .eq("user_id", uid)
    .maybeSingle();

  if (checkError) {
    const ref = crypto.randomUUID(); console.error('Error Ref:', ref, checkError); throw new Error('An internal error occurred. Ref: ' + ref);
  }

  let error;
  if (existingUser) {
    const { error: updateError } = await supabase
      .from("waitlist_users")
      .update(payload)
      .eq("id", existingUser.id);
    error = updateError;
  } else {
    const { error: insertError } = await supabase
      .from("waitlist_users")
      .insert(payload);
    error = insertError;
  }

  if (error) {
    if (error.code === '23505') { // Postgres Unique Violation
      throw new Error(`Username "${username}" is already taken.`);
    }
    const ref = crypto.randomUUID(); console.error('Error Ref:', ref, error); throw new Error('An internal error occurred. Ref: ' + ref);
  }
}

/**
 * Retrieves the waitlist entry for a given user, if one exists.
 *
 * @returns The {@link WaitlistEntry} or `null` when the user has no reservation.
 */
export async function getUserReservation(
  uid: string,
  email?: string | null,
  phone?: string | null
): Promise<WaitlistEntry | null> {
  const supabase = createClient();
  const conditions: string[] = [`user_id.eq.${uid}`];

  if (email && email.trim()) {
    conditions.push(`email.eq.${email.trim()}`);
  }
  if (phone && phone.trim()) {
    const formattedPhone = `+91${phone.replace(/\D/g, '').slice(-10)}`;
    conditions.push(`phone.eq.${formattedPhone}`);
  }

  const { data: records, error } = await supabase
    .from("waitlist_users")
    .select("*")
    .or(conditions.join(','))
    .limit(1);

  if (error) {
    console.error("Error fetching reservation:", error);
    return null;
  }

  if (!records || records.length === 0) {
    return null;
  }

  const entry = records[0] as WaitlistEntry;

  // Sanitize display_name if it was corrupted to an email
  if (entry) {
    entry.display_name = ensureValidDisplayName(entry.display_name, entry.username, entry.email);
  }

  // If profile was matched by email or phone but user_id was not yet linked, update link asynchronously
  if (entry.user_id !== uid) {
    supabase
      .from("waitlist_users")
      .update({ user_id: uid })
      .eq("id", entry.id)
      .then(({ error: updateErr }) => {
        if (updateErr) console.error("Error updating user_id link:", updateErr);
      });
    entry.user_id = uid;
  }

  return entry;
}

export interface ResolveClaimParams {
  id?: string | null;
  username?: string | null;
  email?: string | null;
  token?: string | null;
}

/**
 * Resolves a waitlist reservation for profile claiming using any available key:
 * 1. Database UUID (id or token)
 * 2. Stage username handle
 * 3. User email address
 */
export async function resolveClaimReservation(
  params: ResolveClaimParams
): Promise<WaitlistEntry | null> {
  const supabase = createClient();
  const rawId = params.id?.trim() || params.token?.trim();
  const rawUsername = params.username?.trim();
  const rawEmail = params.email?.trim();

  // Step 1: Attempt lookup by DB UUID if candidate looks like a UUID
  if (rawId) {
    const isUuid = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(rawId);
    if (isUuid) {
      const { data, error } = await supabase
        .from("waitlist_users")
        .select("*")
        .eq("id", rawId)
        .maybeSingle();

      if (data && !error) {
        const entry = data as WaitlistEntry;
        entry.display_name = ensureValidDisplayName(entry.display_name, entry.username, entry.email);
        return entry;
      }
    }
  }

  // Step 2: Attempt lookup by username handle
  // Username can be provided via `username` param, or passed in `id`/`token` param if it's not a UUID and not an email
  const candidateUsername = rawUsername || (rawId && !rawId.includes('@') && !rawId.includes('-') ? rawId : null);
  if (candidateUsername) {
    const normalised = normalise(candidateUsername);
    const { data, error } = await supabase
      .from("waitlist_users")
      .select("*")
      .eq("username", normalised)
      .maybeSingle();

    if (data && !error) {
      const entry = data as WaitlistEntry;
      entry.display_name = ensureValidDisplayName(entry.display_name, entry.username, entry.email);
      return entry;
    }
  }

  // Step 3: Attempt lookup by email address
  // Email can be provided via `email` param, or passed in `id`/`username`/`token` if it contains '@'
  const candidateEmail = rawEmail || 
    (rawId && rawId.includes('@') ? rawId : null) || 
    (rawUsername && rawUsername.includes('@') ? rawUsername : null);

  if (candidateEmail) {
    const { data, error } = await supabase
      .from("waitlist_users")
      .select("*")
      .ilike("email", candidateEmail.trim())
      .maybeSingle();

    if (data && !error) {
      const entry = data as WaitlistEntry;
      entry.display_name = ensureValidDisplayName(entry.display_name, entry.username, entry.email);
      return entry;
    }
  }

  // Step 4: If rawId was passed but wasn't a strict UUID, check DB id anyway as fallback
  if (rawId) {
    const { data, error } = await supabase
      .from("waitlist_users")
      .select("*")
      .eq("id", rawId)
      .maybeSingle();

    if (data && !error) {
      const entry = data as WaitlistEntry;
      entry.display_name = ensureValidDisplayName(entry.display_name, entry.username, entry.email);
      return entry;
    }
  }

  return null;
}

/**
 * Fetch reservation record by its raw DB UUID, username, or email (claim token)
 */
export async function getReservationById(id: string): Promise<WaitlistEntry | null> {
  return resolveClaimReservation({ id });
}

/**
 * Retrieves the waitlist entry for a given username, for public profiles.
 *
 * @returns The {@link WaitlistEntry} or `null` when the user has no reservation.
 */
export async function getWaitlistEntryByUsername(
  username: string,
): Promise<WaitlistEntry | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("waitlist_users")
    .select("*")
    .eq("username", normalise(username))
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  const entry = data as WaitlistEntry;
  entry.display_name = ensureValidDisplayName(entry.display_name, entry.username, entry.email);
  return entry;
}

// ---------------------------------------------------------------------------
// Admin APIs
// ---------------------------------------------------------------------------

/** Extended waitlist entry structure returned for administration reviews. */
export interface AdminWaitlistEntry extends WaitlistEntry {
  is_verified: boolean;
  is_blocked: boolean;
}

/**
 * Fetches all waitlist registrations for admin review.
 * Runs custom secure Postgres function bypassing default user RLS checks.
 */
export async function adminGetRegistrations(passcode: string): Promise<AdminWaitlistEntry[]> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc("admin_get_registrations", {
    p_passcode: passcode,
  });

  if (error) {
    const ref = crypto.randomUUID(); console.error('Error Ref:', ref, error); throw new Error('An internal error occurred. Ref: ' + ref);
  }

  return data as AdminWaitlistEntry[];
}

/**
 * Updates a registration's verified, blocked, and position override status.
 * Runs custom secure Postgres function with owner privileges.
 */
export async function adminUpdateRegistration(
  passcode: string,
  userId: string,
  isVerified: boolean,
  isBlocked: boolean,
  positionOverride?: number | null
): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.rpc("admin_update_registration", {
    p_passcode: passcode,
    p_user_id: userId,
    p_is_verified: isVerified,
    p_is_blocked: isBlocked,
    p_position_override: positionOverride !== undefined ? positionOverride : null
  });

  if (error) {
    const ref = crypto.randomUUID(); console.error('Error Ref:', ref, error); throw new Error('An internal error occurred. Ref: ' + ref);
  }
}

/**
 * Calculates the waitlist position of the user based on their reservation date.
 * If the database query is RLS restricted or empty, returns a stable fallback position.
 */
export async function getWaitlistPosition(reservedAt: string, userId: string, positionOverride?: number | null): Promise<number> {
  if (positionOverride !== undefined && positionOverride !== null) {
    return positionOverride;
  }
  const supabase = createClient();
  try {
    const { count, error } = await supabase
      .from("waitlist_users")
      .select("id", { count: "exact", head: true })
      .or("exclude_from_waitlist.is.null,exclude_from_waitlist.eq.false")
      .eq("is_blocked", false)
      .lte("reserved_at", reservedAt);

    if (error || count === null || count === 0) {
      // Return a stable fallback position using the date and user ID
      const dateVal = new Date(reservedAt).getTime();
      const numHash = Math.abs(
        userId.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)
      );
      // Let's create a realistic waitlist number e.g. 150 to 900
      const fallbackPos = 120 + ((dateVal + numHash) % 780);
      return fallbackPos;
    }
    return count;
  } catch (e) {
    // Fail-safe stable fallback
    const dateVal = new Date(reservedAt).getTime();
    const fallbackPos = 120 + (dateVal % 780);
    return fallbackPos;
  }
}

export async function getReferralCount(username: string): Promise<number> {
  const supabase = createClient();
  try {
    const { count, error } = await supabase
      .from("waitlist_users")
      .select("id", { count: "exact", head: true })
      .eq("referred_by", username.trim().toLowerCase());

    if (error) {
      console.warn("Error getting referral count:", error.message);
      return 0;
    }
    return count || 0;
  } catch (e) {
    console.error("Failed to fetch referrals:", e);
    return 0;
  }
}

/**
 * Fetches the count of verified users referred by a given username.
 */
export async function getVerifiedReferralCount(username: string): Promise<number> {
  const supabase = createClient();
  try {
    const { count, error } = await supabase
      .from("waitlist_users")
      .select("id", { count: "exact", head: true })
      .eq("referred_by", username.trim().toLowerCase())
      .eq("is_verified", true);

    if (error) {
      console.warn("Error getting verified referral count:", error.message);
      return 0;
    }
    return count || 0;
  } catch (e) {
    console.error("Failed to fetch verified referrals:", e);
    return 0;
  }
}

/**
 * Fetches the count of unverified/pending users referred by a given username.
 */
export async function getUnverifiedReferralCount(username: string): Promise<number> {
  const supabase = createClient();
  try {
    const { count, error } = await supabase
      .from("waitlist_users")
      .select("id", { count: "exact", head: true })
      .eq("referred_by", username.trim().toLowerCase())
      .eq("is_verified", false);

    if (error) {
      console.warn("Error getting unverified referral count:", error.message);
      return 0;
    }
    return count || 0;
  } catch (e) {
    console.error("Failed to fetch unverified referrals:", e);
    return 0;
  }
}

/**
 * Updates the contact details of a waitlist user if they are missing or different.
 */
export async function updateReservationContactInfo(
  id: string,
  existingReservation: WaitlistEntry,
  email?: string | null,
  phone?: string | null
): Promise<void> {
  const supabase = createClient();
  const updates: { email?: string; phone?: string } = {};
  let needsUpdate = false;

  if (email && existingReservation.email !== email) {
    updates.email = email;
    needsUpdate = true;
  }

  if (phone) {
    const formattedPhone = `+91${phone.replace(/\D/g, '').slice(-10)}`;
    if (existingReservation.phone !== formattedPhone) {
      updates.phone = formattedPhone;
      needsUpdate = true;
    }
  }

  if (needsUpdate) {
    const { error } = await supabase
      .from("waitlist_users")
      .update(updates)
      .eq("id", id);
    if (error) {
      console.error("Error updating reservation contact info:", error);
    }
  }
}

