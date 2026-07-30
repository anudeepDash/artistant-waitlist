/**
 * Utility functions for parsing, validating, and formatting Spotify URLs, URIs, and IDs.
 */

export interface ParsedSpotifyInput {
  type: 'artist' | 'track' | 'album' | 'playlist' | 'show' | 'episode' | 'search';
  id?: string;
  query?: string;
  isUrl: boolean;
}

const EMBED_PARAMS = 'utm_source=generator&theme=0';

export function makeEmbedUrl(type: string, id: string): string {
  const validTypes = ['artist', 'track', 'album', 'playlist', 'show', 'episode'];
  const safeType = validTypes.includes(type) ? type : 'artist';
  return `https://open.spotify.com/embed/${safeType}/${id}?${EMBED_PARAMS}`;
}

export function makeSpotifyUrl(type: string, id: string): string {
  const validTypes = ['artist', 'track', 'album', 'playlist', 'show', 'episode'];
  const safeType = validTypes.includes(type) ? type : 'artist';
  return `https://open.spotify.com/${safeType}/${id}`;
}

export function sanitizeSpotifyInput(input: string): string {
  if (!input) return '';
  let clean = input.trim();
  // Extract URL if user pasted an <iframe> HTML tag
  if (clean.includes('<iframe') && clean.includes('src=')) {
    const match = clean.match(/src=["']([^"']+)["']/i);
    if (match && match[1]) {
      clean = match[1];
    }
  }
  return clean;
}

/**
 * Parses any Spotify input (URL, international URL, URI, embed link, raw ID, search query).
 * Prevents treating Spotify URLs as plain text search queries (which previously caused random top artists to be returned).
 */
export function parseSpotifyInput(rawInput: string): ParsedSpotifyInput {
  const clean = sanitizeSpotifyInput(rawInput);
  if (!clean) {
    return { type: 'artist', isUrl: false };
  }

  const isUrl =
    /^https?:\/\//i.test(clean) ||
    clean.includes('spotify.com') ||
    clean.includes('spotify.link') ||
    clean.startsWith('spotify:');

  // 1. URI pattern: spotify:artist:ID, spotify:track:ID, spotify:album:ID, etc.
  const uriMatch = clean.match(/^spotify:(artist|track|album|playlist|show|episode):([a-zA-Z0-9]{15,35})/i);
  if (uriMatch) {
    return {
      type: uriMatch[1].toLowerCase() as ParsedSpotifyInput['type'],
      id: uriMatch[2],
      isUrl: true,
    };
  }

  // 2. Comprehensive URL pattern matching any domain path structure:
  // e.g. open.spotify.com/artist/ID
  // e.g. open.spotify.com/intl-es/artist/ID
  // e.g. open.spotify.com/intl-de/track/ID?si=xyz
  // e.g. open.spotify.com/embed/artist/ID
  // e.g. open.spotify.com/user/username/playlist/ID
  const urlMatch = clean.match(
    /(?:spotify\.com|spotify\.link)\/(?:[a-zA-Z0-9_-]+\/)*(artist|track|album|playlist|show|episode)\/([a-zA-Z0-9]{15,35})/i
  );
  if (urlMatch) {
    return {
      type: urlMatch[1].toLowerCase() as ParsedSpotifyInput['type'],
      id: urlMatch[2],
      isUrl: true,
    };
  }

  // 3. Fallback URL extraction: if URL contains /artist/ /track/ /album/ etc. anywhere
  const fallbackUrlMatch = clean.match(/\/(artist|track|album|playlist|show|episode)\/([a-zA-Z0-9]{15,35})/i);
  if (fallbackUrlMatch) {
    return {
      type: fallbackUrlMatch[1].toLowerCase() as ParsedSpotifyInput['type'],
      id: fallbackUrlMatch[2],
      isUrl: true,
    };
  }

  // 4. Raw Spotify ID (18 to 35 base62 alphanumeric characters)
  if (/^[a-zA-Z0-9]{18,35}$/.test(clean)) {
    return {
      type: 'artist',
      id: clean,
      isUrl: false,
    };
  }

  // 5. CRITICAL: If input is a URL or link (contains http or spotify.com/spotify:), BUT no ID could be extracted:
  // DO NOT treat as a search query! URL text searches cause Spotify API to return random popular artists.
  if (isUrl) {
    return {
      type: 'artist',
      id: undefined,
      query: undefined,
      isUrl: true,
    };
  }

  // 6. Plain text artist name search query (e.g. "Daft Punk")
  return {
    type: 'search',
    query: clean,
    isUrl: false,
  };
}
