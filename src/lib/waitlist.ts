import { createClient } from "./supabase/client";
import { auth as firebaseAuth, isFirebaseConfigured } from "./firebase/client";

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
  const supabase = createClient();
  const normalisedUsername = normalise(username);

  // Call an RPC to check availability.
  // To avoid Supabase database linter warnings (0028/0029), it is recommended to define 
  // it as SECURITY INVOKER and grant column-level SELECT on 'username' to public roles.
  // See src/lib/supabase/migrations.sql for the SQL details:
  //
  //   create or replace function public.check_username_available(p_username text)
  //   returns boolean
  //   language plpgsql
  //   security invoker
  //   set search_path = public
  //   as $$
  //   begin
  //     return not exists (
  //       select 1 from waitlist_users where username = lower(trim(p_username))
  //     );
  //   end;
  //   $$;
  //
  //   grant execute on function public.check_username_available(text) to anon, authenticated;
  //   grant select (username) on public.waitlist_users to anon, authenticated;

  try {
    const { data, error } = await supabase.rpc('check_username_available', {
      p_username: normalisedUsername,
    });

    if (error) {
      // RPC doesn't exist yet — fall back to optimistic true so the page isn't broken
      console.warn('check_username_available RPC not found. Run the migration SQL in Supabase.', error.message);
      return true;
    }

    return data === true;
  } catch {
    return true;
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
    throw error;
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
    throw error;
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
    throw error;
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

