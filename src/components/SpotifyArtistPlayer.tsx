'use client';

import React, { useState, useEffect } from 'react';
import { ExternalLink, Music, Loader2 } from 'lucide-react';

interface SpotifyArtistPlayerProps {
  spotifyUrl: string;
  artistName?: string;
  isLight?: boolean;
}

const SpotifyIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.587 14.424c-.18.295-.573.398-.87.204-2.365-1.446-5.352-1.772-8.84-1.026-.34.074-.68-.142-.752-.482-.072-.34.142-.68.482-.752 3.825-.82 7.126-.445 9.775 1.176.293.18.397.575.205.88zM17.81 13.7c-.226.367-.716.485-1.08.26-2.73-1.674-6.903-2.18-9.87-1.272-.416.126-.84-.112-.968-.527-.127-.417.11-.843.528-.966 3.42-1.042 8.026-.47 11.21 1.482.365.225.485.716.262 1.082zm.12-2.915C14.48 8.74 8.41 8.52 4.908 9.58c-.496.15-1.015-.13-1.165-.625-.15-.494.13-1.015.626-1.165 4.02-1.216 10.744-.972 14.73 1.393.447.265.597.842.33 1.29-.265.447-.842.597-1.29.33z" />
  </svg>
);

/**
 * Resolves any Spotify input (URL, handle, name, ID) into a valid embed URL
 * by calling our /api/spotify backend which uses the Spotify Web API.
 */
export function SpotifyArtistPlayer({ spotifyUrl, artistName, isLight = false }: SpotifyArtistPlayerProps) {
  const [resolvedEmbedUrl, setResolvedEmbedUrl] = useState<string | null>(null);
  const [resolvedSpotifyUrl, setResolvedSpotifyUrl] = useState<string>('');
  const [resolvedArtistName, setResolvedArtistName] = useState<string>(artistName || '');
  const [resolvedFollowers, setResolvedFollowers] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!spotifyUrl) {
      setLoading(false);
      setError(true);
      return;
    }

    setLoading(true);
    setError(false);

    // Call our backend API which resolves any input → valid Spotify ID → embed URL
    fetch(`/api/spotify?url=${encodeURIComponent(spotifyUrl)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.embedUrl) {
          setResolvedEmbedUrl(data.embedUrl);
          setResolvedSpotifyUrl(data.spotifyUrl || spotifyUrl);
          if (data.artist?.name) setResolvedArtistName(data.artist.name);
          if (data.artist?.followers) setResolvedFollowers(data.artist.followers);
        } else {
          // Fallback: if the URL already looks like a valid Spotify URL, try direct embed
          const directEmbed = tryDirectEmbed(spotifyUrl);
          if (directEmbed) {
            setResolvedEmbedUrl(directEmbed.embedUrl);
            setResolvedSpotifyUrl(directEmbed.spotifyUrl);
          } else {
            setError(true);
          }
        }
        setLoading(false);
      })
      .catch(() => {
        // Network error fallback
        const directEmbed = tryDirectEmbed(spotifyUrl);
        if (directEmbed) {
          setResolvedEmbedUrl(directEmbed.embedUrl);
          setResolvedSpotifyUrl(directEmbed.spotifyUrl);
        } else {
          setError(true);
        }
        setLoading(false);
      });
  }, [spotifyUrl]);

  const displayName = resolvedArtistName || artistName || 'Artist';
  const openUrl = resolvedSpotifyUrl || spotifyUrl;

  // ─── LOADING STATE ───
  if (loading) {
    return (
      <div className="relative w-full group">
        <div className="absolute -inset-1.5 bg-gradient-to-br from-[#1DB954]/20 via-[#1ed760]/8 to-[#1DB954]/15 rounded-[28px] blur-2xl opacity-60 pointer-events-none" />
        <div className={`relative w-full rounded-[24px] overflow-hidden border backdrop-blur-xl ${
          isLight
            ? 'bg-white/90 border-black/8'
            : 'bg-[#0a0b12]/95 border-white/8'
        }`}>
          {/* Watermark */}
          <SpotifyIcon className={`absolute -right-8 -bottom-8 w-56 h-56 pointer-events-none -rotate-12 ${
            isLight ? 'text-[#1DB954]/[0.04]' : 'text-[#1DB954]/[0.06]'
          }`} />
          <div className="flex flex-col items-center justify-center gap-4 py-20 relative z-10">
            <div className="relative">
              <div className="w-10 h-10 border-2 border-[#1DB954]/40 border-t-[#1DB954] rounded-full animate-spin" />
              <SpotifyIcon className="w-4 h-4 text-[#1DB954] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            </div>
            <p className={`text-xs font-mono tracking-widest uppercase ${isLight ? 'text-zinc-400' : 'text-white/30'}`}>
              Connecting to Spotify...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ─── ERROR / NO EMBED STATE ───
  if (error || !resolvedEmbedUrl) {
    return (
      <div className="relative w-full group">
        <div className="absolute -inset-1.5 bg-gradient-to-br from-[#1DB954]/20 via-[#1ed760]/8 to-[#1DB954]/15 rounded-[28px] blur-2xl opacity-60 pointer-events-none" />
        <div className={`relative w-full rounded-[24px] overflow-hidden border backdrop-blur-xl p-8 ${
          isLight
            ? 'bg-white/90 border-black/8'
            : 'bg-[#0a0b12]/95 border-white/8'
        }`}>
          <SpotifyIcon className={`absolute -right-8 -bottom-8 w-56 h-56 pointer-events-none -rotate-12 ${
            isLight ? 'text-[#1DB954]/[0.04]' : 'text-[#1DB954]/[0.06]'
          }`} />
          <div className="flex flex-col items-center gap-4 relative z-10">
            <SpotifyIcon className="w-12 h-12 text-[#1DB954] animate-pulse" />
            <p className={`text-sm font-medium text-center ${isLight ? 'text-zinc-600' : 'text-white/60'}`}>
              Stream {displayName}&apos;s music on Spotify
            </p>
            <a
              href={openUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 px-6 py-3 rounded-full text-sm font-bold text-black bg-[#1DB954] hover:bg-[#1ed760] hover:scale-[1.03] transition-all shadow-xl shadow-[#1DB954]/20"
            >
              <SpotifyIcon className="w-5 h-5" />
              Open on Spotify
            </a>
          </div>
        </div>
      </div>
    );
  }

  // ─── MAIN PLAYER ───
  // Determine embed height based on type
  const isTrack = resolvedEmbedUrl.includes('/embed/track/');
  const embedHeight = isTrack ? 152 : 352;

  return (
    <div className="relative w-full group">
      {/* Ambient glow */}
      <div className="absolute -inset-2 bg-gradient-to-br from-[#1DB954]/25 via-[#1ed760]/10 to-[#7C5CFF]/15 rounded-[30px] blur-2xl opacity-60 group-hover:opacity-90 transition-opacity duration-700 pointer-events-none" />

      {/* Glass container */}
      <div className={`relative w-full rounded-[24px] overflow-hidden border backdrop-blur-xl transition-all duration-300 ${
        isLight
          ? 'bg-white/90 border-black/8 shadow-[0_12px_40px_rgba(0,0,0,0.06)]'
          : 'bg-[#0a0b12]/95 border-white/8 shadow-[0_20px_60px_rgba(0,0,0,0.5)]'
      }`}>
        {/* BIG SPOTIFY LOGO WATERMARK */}
        <SpotifyIcon className={`absolute -right-6 -bottom-6 w-52 h-52 md:w-64 md:h-64 pointer-events-none -rotate-12 transition-transform duration-700 group-hover:scale-110 group-hover:rotate-[-8deg] ${
          isLight ? 'text-[#1DB954]/[0.05]' : 'text-[#1DB954]/[0.07]'
        }`} />

        {/* Top bar with artist info */}
        <div className="relative z-10 px-5 pt-5 pb-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
              isLight ? 'bg-[#1DB954]/10' : 'bg-[#1DB954]/15'
            }`}>
              <SpotifyIcon className="w-5 h-5 text-[#1DB954]" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h4 className={`text-sm font-bold tracking-tight truncate ${isLight ? 'text-zinc-900' : 'text-white'}`}>
                  {displayName}
                </h4>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[8px] font-mono font-bold uppercase tracking-wider shrink-0 ${
                  isLight 
                    ? 'bg-[#1DB954]/10 text-[#1DB954] border border-[#1DB954]/20' 
                    : 'bg-[#1DB954]/10 text-[#1DB954] border border-[#1DB954]/25'
                }`}>
                  Spotify
                </span>
              </div>
              {resolvedFollowers > 0 && (
                <p className={`text-[10px] font-mono mt-0.5 ${isLight ? 'text-zinc-400' : 'text-white/30'}`}>
                  {resolvedFollowers.toLocaleString()} followers
                </p>
              )}
            </div>
          </div>

          <a
            href={openUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-mono font-bold transition-all shrink-0 ${
              isLight 
                ? 'text-[#1DB954] bg-[#1DB954]/8 border border-[#1DB954]/15 hover:bg-[#1DB954] hover:text-white' 
                : 'text-[#1DB954] bg-[#1DB954]/10 border border-[#1DB954]/20 hover:bg-[#1DB954] hover:text-black'
            }`}
          >
            <span className="hidden sm:inline">Open in Spotify</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        {/* Spotify Native Embed Player — handles ALL playback, song list, album art */}
        <div className="relative z-10 px-5 pb-5">
          <div className={`w-full rounded-2xl overflow-hidden border ${
            isLight ? 'border-black/5' : 'border-white/5'
          }`}>
            <iframe
              key={resolvedEmbedUrl}
              src={resolvedEmbedUrl}
              width="100%"
              height={embedHeight}
              frameBorder="0"
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
              style={{ borderRadius: '12px', display: 'block', background: '#282828' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Fallback: try to construct a direct embed URL from the raw input
 * when API call fails. Only works with valid Spotify URLs containing 22-char IDs.
 */
function tryDirectEmbed(input: string): { embedUrl: string; spotifyUrl: string } | null {
  if (!input) return null;
  const clean = input.trim();

  const patterns: Array<{ match: string; type: string }> = [
    { match: 'spotify.com/artist/', type: 'artist' },
    { match: 'spotify.com/track/', type: 'track' },
    { match: 'spotify.com/album/', type: 'album' },
    { match: 'spotify.com/playlist/', type: 'playlist' },
  ];

  for (const { match, type } of patterns) {
    if (clean.includes(match)) {
      const id = clean.split(match)[1]?.split('?')[0]?.split('/')[0];
      if (id && /^[a-zA-Z0-9]{22}$/.test(id)) {
        return {
          embedUrl: `https://open.spotify.com/embed/${type}/${id}?utm_source=generator&theme=0`,
          spotifyUrl: `https://open.spotify.com/${type}/${id}`,
        };
      }
    }
  }

  // Handle raw 22-char ID
  if (/^[a-zA-Z0-9]{22}$/.test(clean)) {
    return {
      embedUrl: `https://open.spotify.com/embed/artist/${clean}?utm_source=generator&theme=0`,
      spotifyUrl: `https://open.spotify.com/artist/${clean}`,
    };
  }

  return null;
}
