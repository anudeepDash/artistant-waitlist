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
  uid: string; // The user_id from auth.users
  username: string;
  email: string;
  displayName: string;
  role?: WaitlistRole;
  /** Artist sub-category (Singer, DJ, etc.) */
  category?: ArtistCategory;
  /** Up to 3 genre/niche tags */
  genres?: string[];
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

  // Call a SECURITY DEFINER RPC so unauthenticated users can check availability.
  // Run this SQL once in Supabase SQL editor to create the function:
  //
  //   create or replace function public.check_username_available(p_username text)
  //   returns boolean
  //   language plpgsql
  //   security definer
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



  const { uid, username, email, displayName, role, category, genres } = input;
  const normalisedUsername = normalise(username);

  const { error } = await supabase.from("waitlist_users").insert({
    user_id: uid,
    username: normalisedUsername,
    email: email,
    display_name: displayName,
    role: role || null,
    ...(category ? { category } : {}),
    ...(genres && genres.length > 0 ? { genres } : {}),
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
