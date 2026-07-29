import { NextRequest, NextResponse } from 'next/server';

let tokenCache: { token: string; expiresAt: number } | null = null;

async function getSpotifyAccessToken(): Promise<string | null> {
  const now = Date.now();
  if (tokenCache && tokenCache.expiresAt > now + 60000) {
    return tokenCache.token;
  }

  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (clientId && clientSecret) {
    try {
      const authHeader = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
      const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${authHeader}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'grant_type=client_credentials',
        next: { revalidate: 3600 },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.access_token) {
          tokenCache = {
            token: data.access_token,
            expiresAt: now + (data.expires_in || 3600) * 1000,
          };
          return data.access_token;
        }
      }
    } catch (err) {
      console.warn('Spotify Client Credentials token fetch failed:', err);
    }
  }

  return null;
}

export interface SpotifyTrackItem {
  id: string;
  name: string;
  artist_name: string;
  album_name: string;
  album_art: string;
  preview_url: string | null;
  duration_ms: number;
  popularity?: number;
  external_url: string;
  uri: string;
}

export interface SpotifyArtistInfo {
  id: string;
  name: string;
  images: Array<{ url: string; height?: number; width?: number }>;
  genres?: string[];
  followers?: number;
  external_url: string;
}

export interface SpotifyApiResponse {
  success: boolean;
  type: 'artist' | 'track' | 'album' | 'playlist' | 'search';
  artist: SpotifyArtistInfo | null;
  tracks: SpotifyTrackItem[];
  embedUrl: string;
  spotifyUrl: string;
  error?: string;
}

const EMBED_PARAMS = 'utm_source=generator&theme=0';

function makeEmbedUrl(type: string, id: string): string {
  return `https://open.spotify.com/embed/${type}/${id}?${EMBED_PARAMS}`;
}

function makeSpotifyUrl(type: string, id: string): string {
  return `https://open.spotify.com/${type}/${id}`;
}

/**
 * Parses any Spotify input into a structured type + id/query.
 * Handles:
 *   - Full URLs: https://open.spotify.com/artist/ABC123...
 *   - URLs with non-ID slugs: https://open.spotify.com/artist/SomeHandle (→ search)
 *   - Spotify URIs: spotify:artist:ABC123...
 *   - Raw 22-char base62 IDs
 *   - Plain text (artist name) → search
 */
function parseSpotifyInput(input: string): { type: 'artist' | 'track' | 'album' | 'playlist' | 'search'; id?: string; query?: string } {
  const clean = input.trim();

  // URL patterns
  const urlPatterns: Array<{ match: string; type: 'artist' | 'track' | 'album' | 'playlist' }> = [
    { match: 'spotify.com/artist/', type: 'artist' },
    { match: 'spotify.com/track/', type: 'track' },
    { match: 'spotify.com/album/', type: 'album' },
    { match: 'spotify.com/playlist/', type: 'playlist' },
  ];

  for (const { match, type } of urlPatterns) {
    if (clean.includes(match)) {
      const slug = clean.split(match)[1]?.split('?')[0]?.split('/')[0];
      if (slug && /^[a-zA-Z0-9]{22}$/.test(slug)) {
        return { type, id: slug };
      }
      // Non-standard slug (handle or name in URL) → use as search query
      if (slug) {
        return { type: 'search', query: decodeURIComponent(slug) };
      }
    }
  }

  // URI patterns
  const uriPatterns: Array<{ prefix: string; type: 'artist' | 'track' | 'album' }> = [
    { prefix: 'spotify:artist:', type: 'artist' },
    { prefix: 'spotify:track:', type: 'track' },
    { prefix: 'spotify:album:', type: 'album' },
  ];

  for (const { prefix, type } of uriPatterns) {
    if (clean.startsWith(prefix)) {
      return { type, id: clean.slice(prefix.length) };
    }
  }

  // Raw 22-char base62 ID
  if (/^[a-zA-Z0-9]{22}$/.test(clean)) {
    return { type: 'artist', id: clean };
  }

  // Everything else is a search query (artist name, handle, etc.)
  return { type: 'search', query: clean };
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const input = searchParams.get('url') || searchParams.get('artistId') || searchParams.get('query');

  if (!input) {
    return NextResponse.json<SpotifyApiResponse>({
      success: false,
      type: 'artist',
      artist: null,
      tracks: [],
      embedUrl: '',
      spotifyUrl: '',
      error: 'Missing Spotify URL or ID parameter',
    }, { status: 400 });
  }

  const parsed = parseSpotifyInput(input);
  const token = await getSpotifyAccessToken();

  let artistInfo: SpotifyArtistInfo | null = null;
  const tracks: SpotifyTrackItem[] = [];
  let embedUrl = '';
  let spotifyUrl = '';

  try {
    // If we have a direct ID and no token, just construct embed URL
    if (!token) {
      if (parsed.id) {
        embedUrl = makeEmbedUrl(parsed.type, parsed.id);
        spotifyUrl = makeSpotifyUrl(parsed.type, parsed.id);
      }
      return NextResponse.json<SpotifyApiResponse>({
        success: !!parsed.id,
        type: parsed.type,
        artist: null,
        tracks: [],
        embedUrl,
        spotifyUrl,
      });
    }

    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };

    let resolvedType = parsed.type;
    let resolvedId = parsed.id;

    // ── SEARCH RESOLUTION ──
    // If input is a search query (plain name, handle, or invalid URL slug),
    // resolve it to a real Spotify artist ID
    if (parsed.type === 'search' && parsed.query) {
      const searchRes = await fetch(
        `https://api.spotify.com/v1/search?q=${encodeURIComponent(parsed.query)}&type=artist&limit=1`,
        { headers }
      );
      if (searchRes.ok) {
        const searchData = await searchRes.json();
        const topArtist = searchData.artists?.items?.[0];
        if (topArtist) {
          resolvedType = 'artist';
          resolvedId = topArtist.id;
        }
      }
    }

    // ── RESOLVE TRACK → get artist info ──
    if (resolvedType === 'track' && resolvedId) {
      embedUrl = makeEmbedUrl('track', resolvedId);
      spotifyUrl = makeSpotifyUrl('track', resolvedId);

      try {
        const trackRes = await fetch(`https://api.spotify.com/v1/tracks/${resolvedId}`, { headers });
        if (trackRes.ok) {
          const trackData = await trackRes.json();
          if (trackData.artists?.[0]?.id) {
            // Also fetch artist info for display
            const aRes = await fetch(`https://api.spotify.com/v1/artists/${trackData.artists[0].id}`, { headers });
            if (aRes.ok) {
              const aData = await aRes.json();
              artistInfo = {
                id: aData.id,
                name: aData.name,
                images: aData.images || [],
                genres: aData.genres || [],
                followers: aData.followers?.total || 0,
                external_url: aData.external_urls?.spotify || '',
              };
            }
          }
        }
      } catch {}
    }

    // ── RESOLVE ALBUM ──
    if (resolvedType === 'album' && resolvedId) {
      embedUrl = makeEmbedUrl('album', resolvedId);
      spotifyUrl = makeSpotifyUrl('album', resolvedId);

      try {
        const albumRes = await fetch(`https://api.spotify.com/v1/albums/${resolvedId}`, { headers });
        if (albumRes.ok) {
          const albumData = await albumRes.json();
          if (albumData.artists?.[0]?.id) {
            const aRes = await fetch(`https://api.spotify.com/v1/artists/${albumData.artists[0].id}`, { headers });
            if (aRes.ok) {
              const aData = await aRes.json();
              artistInfo = {
                id: aData.id,
                name: aData.name,
                images: aData.images || [],
                genres: aData.genres || [],
                followers: aData.followers?.total || 0,
                external_url: aData.external_urls?.spotify || '',
              };
            }
          }
        }
      } catch {}
    }

    // ── RESOLVE PLAYLIST ──
    if (resolvedType === 'playlist' && resolvedId) {
      embedUrl = makeEmbedUrl('playlist', resolvedId);
      spotifyUrl = makeSpotifyUrl('playlist', resolvedId);
    }

    // ── RESOLVE ARTIST ──
    if (resolvedType === 'artist' && resolvedId) {
      embedUrl = makeEmbedUrl('artist', resolvedId);
      spotifyUrl = makeSpotifyUrl('artist', resolvedId);

      try {
        const artistRes = await fetch(`https://api.spotify.com/v1/artists/${resolvedId}`, { headers });
        if (artistRes.ok) {
          const aData = await artistRes.json();
          artistInfo = {
            id: aData.id,
            name: aData.name,
            images: aData.images || [],
            genres: aData.genres || [],
            followers: aData.followers?.total || 0,
            external_url: aData.external_urls?.spotify || spotifyUrl,
          };
        }
      } catch {}
    }

    return NextResponse.json<SpotifyApiResponse>({
      success: !!embedUrl,
      type: resolvedType as SpotifyApiResponse['type'],
      artist: artistInfo,
      tracks,
      embedUrl,
      spotifyUrl,
    });
  } catch (err: any) {
    console.error('Error fetching Spotify data:', err);
    return NextResponse.json<SpotifyApiResponse>({
      success: false,
      type: parsed.type,
      artist: null,
      tracks: [],
      embedUrl: parsed.id ? makeEmbedUrl(parsed.type, parsed.id) : '',
      spotifyUrl: parsed.id ? makeSpotifyUrl(parsed.type, parsed.id) : '',
      error: err?.message || 'Failed to fetch Spotify data',
    }, { status: 500 });
  }
}
