import { NextRequest, NextResponse } from 'next/server';
import { parseSpotifyInput, makeEmbedUrl, makeSpotifyUrl } from '@/lib/spotify';

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
  type: 'artist' | 'track' | 'album' | 'playlist' | 'show' | 'episode' | 'search';
  artist: SpotifyArtistInfo | null;
  tracks: SpotifyTrackItem[];
  embedUrl: string;
  spotifyUrl: string;
  error?: string;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const rawInput = searchParams.get('url') || searchParams.get('artistId') || searchParams.get('query');

  if (!rawInput) {
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

  let parsed = parseSpotifyInput(rawInput);

  // If input was a spotify.link short URL and didn't match an ID directly, attempt to resolve redirect
  if (parsed.isUrl && !parsed.id && rawInput.includes('spotify.link')) {
    try {
      const headRes = await fetch(rawInput, { method: 'HEAD', redirect: 'follow' });
      if (headRes.url && headRes.url !== rawInput) {
        parsed = parseSpotifyInput(headRes.url);
      }
    } catch {}
  }

  let resolvedType = parsed.type === 'search' ? 'artist' : parsed.type;
  let resolvedId = parsed.id;

  let embedUrl = resolvedId ? makeEmbedUrl(resolvedType, resolvedId) : '';
  let spotifyUrl = resolvedId ? makeSpotifyUrl(resolvedType, resolvedId) : (parsed.isUrl ? rawInput : '');

  const token = await getSpotifyAccessToken();

  let artistInfo: SpotifyArtistInfo | null = null;
  const tracks: SpotifyTrackItem[] = [];

  try {
    // If no API token available, but we have a valid ID extracted directly from URL/URI, return embedUrl directly!
    if (!token) {
      return NextResponse.json<SpotifyApiResponse>({
        success: !!resolvedId,
        type: resolvedType as SpotifyApiResponse['type'],
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

    // SEARCH RESOLUTION - Only performed for plain text search queries (NEVER for URLs!)
    if (parsed.type === 'search' && parsed.query && !parsed.isUrl) {
      const searchRes = await fetch(
        `https://api.spotify.com/v1/search?q=${encodeURIComponent(parsed.query)}&type=artist&limit=5`,
        { headers }
      );
      if (searchRes.ok) {
        const searchData = await searchRes.json();
        const items = searchData.artists?.items || [];
        const exactMatch = items.find((item: any) => item.name.toLowerCase() === parsed.query?.toLowerCase());
        const topArtist = exactMatch || items[0];
        if (topArtist) {
          resolvedType = 'artist';
          resolvedId = topArtist.id;
          embedUrl = makeEmbedUrl('artist', resolvedId!);
          spotifyUrl = makeSpotifyUrl('artist', resolvedId!);
        }
      }
    }

    // RESOLVE ARTIST DATA FROM SPOTIFY API
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

    // RESOLVE TRACK DATA FROM SPOTIFY API
    if (resolvedType === 'track' && resolvedId) {
      embedUrl = makeEmbedUrl('track', resolvedId);
      spotifyUrl = makeSpotifyUrl('track', resolvedId);

      try {
        const trackRes = await fetch(`https://api.spotify.com/v1/tracks/${resolvedId}`, { headers });
        if (trackRes.ok) {
          const trackData = await trackRes.json();
          if (trackData.artists?.[0]?.id) {
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

    // RESOLVE ALBUM DATA FROM SPOTIFY API
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

    // RESOLVE PLAYLIST / SHOW / EPISODE
    if ((resolvedType === 'playlist' || resolvedType === 'show' || resolvedType === 'episode') && resolvedId) {
      embedUrl = makeEmbedUrl(resolvedType, resolvedId);
      spotifyUrl = makeSpotifyUrl(resolvedType, resolvedId);
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
      success: !!embedUrl,
      type: resolvedType as SpotifyApiResponse['type'],
      artist: null,
      tracks: [],
      embedUrl,
      spotifyUrl,
      error: err?.message || 'Failed to fetch Spotify data',
    }, { status: embedUrl ? 200 : 500 });
  }
}
