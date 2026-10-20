/**
 * Waitlist types and pure helpers shared by server actions and client code.
 */

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

/** Extended waitlist entry structure returned for administration reviews. */
export interface AdminWaitlistEntry extends WaitlistEntry {
  is_verified: boolean;
  is_blocked: boolean;
}
