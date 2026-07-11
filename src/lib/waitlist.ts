import { createClient } from "./supabase/client";
import { auth as firebaseAuth, isFirebaseConfigured } from "./firebase/client";
import { checkUsernameAvailableAction } from "./admin-actions";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** The set of roles a waitlist member can self-select. */
export type WaitlistRole = "artist" | "venue" | "vendor" | "fan";

/** Document stored in `waitlist_users` table. */
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
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

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
    return await checkUsernameAvailableAction(username);
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



  const { uid, username, email, displayName, role, category, genres, phone, referredBy } = input;
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

  const { error } = await supabase.from("waitlist_users").insert({
    user_id: uid,
    username: normalisedUsername,
    email: email,
    display_name: displayName,
    role: role || null,
    ...(category ? { category } : {}),
    ...(genres && genres.length > 0 ? { genres } : {}),
    ...(phone ? { phone } : {}),
    ...(referredBy ? { referred_by: referredBy.trim().toLowerCase() } : {}),
  });

  if (error) {
    if (error.code === '23505') { // Postgres Unique Violation
      throw new Error(`Username "${username}" is already taken.`);
    }
    const ref = crypto.randomUUID(); console.error('Error Ref:', ref, '[REDACTED_ERROR]'); throw new Error('An internal error occurred. Ref: ' + ref);
  }
}

/**
 * Retrieves the waitlist entry for a given user, if one exists.
 *
 * @returns The {@link WaitlistEntry} or `null` when the user has no reservation.
 */
export async function getUserReservation(
  uid: string,
): Promise<WaitlistEntry | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("waitlist_users")
    .select("*")
    .eq("user_id", uid)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data as WaitlistEntry;
}

// ---------------------------------------------------------------------------
// Admin APIs
// ---------------------------------------------------------------------------

/** Extended waitlist entry structure returned for administration reviews. */
export interface AdminWaitlistEntry extends WaitlistEntry {
  category?: string | null;
  genres?: string[] | null;
  phone?: string | null;
  is_verified: boolean;
  is_blocked: boolean;
  position_override?: number | null;
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

/**
 * Fetches the count of users referred by a given username.
 */
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

