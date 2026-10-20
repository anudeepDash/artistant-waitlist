/**
 * Input validation helpers shared by server actions and client forms.
 * Pure functions only — safe to import from both server and client code.
 */

export const USERNAME_REGEX = /^[a-z0-9_.]{3,30}$/;

/**
 * Handles that collide with top-level routes or are otherwise reserved.
 * A profile at artistant.in/<handle> would be unreachable for these.
 */
export const RESERVED_USERNAMES = new Set([
  'admin', 'api', 'app', 'card', 'careers', 'changelog', 'claim', 'dashboard',
  'directory', 'events', 'gigs', 'links', 'privacy', 'terms', 'sitemap.xml',
  'robots.txt', 'favicon.ico', 'icon.png', 'login', 'logout', 'signup', 'signin',
  'register', 'settings', 'support', 'help', 'about', 'contact', 'root', 'www',
  'mail', 'static', 'assets', 'public', 'null', 'undefined', 'artistant',
  'official', 'team', 'security', 'billing',
]);

export function normaliseUsername(username: string): string {
  return (username || '').trim().toLowerCase();
}

/** Returns an error message, or null when the handle is acceptable. */
export function validateUsername(username: string): string | null {
  const norm = normaliseUsername(username);
  if (!USERNAME_REGEX.test(norm)) {
    return 'Username must be 3-30 characters long and can only contain letters, numbers, underscores, and dots.';
  }
  if (RESERVED_USERNAMES.has(norm) || norm.startsWith('.') || norm.endsWith('.')) {
    return `"${norm}" is reserved. Please choose another username.`;
  }
  return null;
}

export const EMAIL_REGEX = /^[^\s@]{1,64}@[^\s@]{1,190}\.[^\s@]{2,}$/;

export function isValidEmail(email: unknown): email is string {
  return typeof email === 'string' && email.length <= 254 && EMAIL_REGEX.test(email.trim());
}

/** Trims and truncates free text; returns null for empty input. */
export function cleanText(value: unknown, maxLength: number): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.slice(0, maxLength);
}

/**
 * Accepts http(s) URLs only (blocks javascript:, data:, etc.).
 * Bare domains like "instagram.com/foo" are upgraded to https://.
 * Returns null for empty or invalid input.
 */
export function sanitizeUrl(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  let candidate = value.trim();
  if (!candidate) return null;
  if (candidate.length > 2048) return null;
  if (!/^[a-z][a-z0-9+.-]*:/i.test(candidate)) {
    candidate = `https://${candidate.replace(/^\/+/, '')}`;
  }
  try {
    const url = new URL(candidate);
    if (url.protocol !== 'https:' && url.protocol !== 'http:') return null;
    if (!url.hostname.includes('.')) return null;
    return url.toString();
  } catch {
    return null;
  }
}

/** Keeps only characters that are safe inside a PostgREST filter value. */
export function sanitizeFilterValue(value: string, maxLength = 100): string {
  return (value || '').replace(/[^a-zA-Z0-9 _.@+-]/g, '').trim().slice(0, maxLength);
}

export function cleanStringArray(value: unknown, maxItems: number, maxLength: number): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((v): v is string => typeof v === 'string')
    .map((v) => v.trim().slice(0, maxLength))
    .filter(Boolean)
    .slice(0, maxItems);
}

export const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
