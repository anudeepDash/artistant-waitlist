import { checkUsernameAvailableAction } from "./admin-actions";
import {
  getMyReservationAction,
  getReferralCountAction,
  getWaitlistPositionAction,
  reserveUsernameAction,
  resolveClaimReservationAction,
  updateMyContactInfoAction,
  type ResolveClaimParams,
} from "./waitlist-actions";

/*
 * Browser-facing waitlist helpers. The database work happens in server actions
 * (./waitlist-actions); these wrappers attach the signed-in user's ID token.
 */
async function currentIdToken(): Promise<string> {
  const { auth } = await import("./firebase/client");
  const user = auth.currentUser;
  if (!user) throw new Error("Please sign in first.");
  return user.getIdToken();
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** The set of roles a waitlist member can select or be assigned. */
export type WaitlistRole = "artist" | "venue" | "vendor" | "fan" | "founder";

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
 * Reserves a username for the signed-in user.
 *
 * @throws {Error} if the username is already taken.
 */
export async function reserveUsername(input: ReserveUsernameInput): Promise<void> {
  // The server takes the user id from the sign-in token, not from the input.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { uid, ...rest } = input;
  await reserveUsernameAction(await currentIdToken(), rest);
}

/**
 * Retrieves the signed-in user's waitlist entry, if one exists.
 * The arguments are kept for existing callers; the server identifies the user from their token.
 */
export async function getUserReservation(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _uid?: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _email?: string | null,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _phone?: string | null,
): Promise<WaitlistEntry | null> {
  try {
    return await getMyReservationAction(await currentIdToken());
  } catch (error) {
    console.error("Error fetching reservation:", error);
    return null;
  }
}

export type { ResolveClaimParams };

/**
 * Finds a profile to claim by id, username or email. Returns public fields only.
 */
export async function resolveClaimReservation(params: ResolveClaimParams): Promise<WaitlistEntry | null> {
  try {
    return await resolveClaimReservationAction(params);
  } catch (error) {
    console.error("Error resolving claim:", error);
    return null;
  }
}

/** Fetch a profile to claim by its id, username or email. */
export async function getReservationById(id: string): Promise<WaitlistEntry | null> {
  return resolveClaimReservation({ id });
}

/** Public profile lookup by username (public fields only). */
export async function getWaitlistEntryByUsername(username: string): Promise<WaitlistEntry | null> {
  return resolveClaimReservation({ username });
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
export async function getWaitlistPosition(reservedAt: string, userId: string, positionOverride?: number | null): Promise<number> {
  if (positionOverride !== undefined && positionOverride !== null) return positionOverride;
  // Stable stand-in if the count can't be read.
  const fallback = () => 120 + ((new Date(reservedAt).getTime() + Math.abs(userId.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0))) % 780);
  try {
    return (await getWaitlistPositionAction(reservedAt)) ?? fallback();
  } catch {
    return fallback();
  }
}

export async function getReferralCount(username: string): Promise<number> {
  return getReferralCountAction(username).catch(() => 0);
}

/** Count of verified users referred by a given username. */
export async function getVerifiedReferralCount(username: string): Promise<number> {
  return getReferralCountAction(username, true).catch(() => 0);
}

/** Count of unverified/pending users referred by a given username. */
export async function getUnverifiedReferralCount(username: string): Promise<number> {
  return getReferralCountAction(username, false).catch(() => 0);
}

/**
 * Updates the signed-in user's contact details if they are missing or different.
 */
export async function updateReservationContactInfo(
  _id: string,
  _existingReservation: WaitlistEntry,
  email?: string | null,
  phone?: string | null,
): Promise<void> {
  try {
    await updateMyContactInfoAction(await currentIdToken(), email, phone);
  } catch (error) {
    console.error("Error updating reservation contact info:", error);
  }
}
