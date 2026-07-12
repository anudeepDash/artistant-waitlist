'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'motion/react';
import { useParams, useRouter } from 'next/navigation';
import { 
  type WaitlistEntry 
} from '@/lib/waitlist';
import { incrementProfileVisitorsAction, getPublicProfileDataAction } from '@/lib/profile-actions';
import { useTheme } from 'next-themes';
import { 
  X, MapPin, Share2, ExternalLink, ChevronDown, Mail, Phone, 
  LockKeyhole, Award, Play, Pause, Volume2 
} from 'lucide-react';
import ParticleBackground from '@/components/ParticleBackground';

/* ──────────────────────────────────────────────────────────────────────────
   INLINE SVG ICONS
   ────────────────────────────────────────────────────────────────────────── */

const InstagramIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);
const SpotifyIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.587 14.424c-.18.295-.573.398-.87.204-2.365-1.446-5.352-1.772-8.84-1.026-.34.074-.68-.142-.752-.482-.072-.34.142-.68.482-.752 3.825-.82 7.126-.445 9.775 1.176.293.18.397.575.205.88zM17.81 13.7c-.226.367-.716.485-1.08.26-2.73-1.674-6.903-2.18-9.87-1.272-.416.126-.84-.112-.968-.527-.127-.417.11-.843.528-.966 3.42-1.042 8.026-.47 11.21 1.482.365.225.485.716.262 1.082zm.12-2.915C14.48 8.74 8.41 8.52 4.908 9.58c-.496.15-1.015-.13-1.165-.625-.15-.494.13-1.015.626-1.165 4.02-1.216 10.744-.972 14.73 1.393.447.265.597.842.33 1.29-.265.447-.842.597-1.29.33z" />
  </svg>
);
const YouTubeIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M21.582 6.186a2.506 2.506 0 0 0-1.762-1.766C18.265 4 12 4 12 4s-6.265 0-7.82.42a2.506 2.506 0 0 0-1.762 1.766C2 7.74 2 12 2 12s0 4.26.418 5.814a2.506 2.506 0 0 0 1.762 1.766C5.735 20 12 20 12 20s6.265 0 7.82-.42a2.506 2.506 0 0 0 1.762-1.766C22 16.26 22 12 22 12s0-4.26-.418-5.814zM10 15.464V8.536L16 12l-6 3.464z" />
  </svg>
);
const PlayIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M8 5v14l11-7z"/></svg>
);
const MusicNoteIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
  </svg>
);
const ImageGridIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
  </svg>
);
const VideoIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
  </svg>
);

const categoryLabels: Record<string, string> = {
  singer: 'Singer',
  dj: 'DJ',
  band: 'Band',
  comedian: 'Comedian',
  dancer: 'Dancer',
  mc_rapper: 'MC / Rapper',
  instrumentalist: 'Instrumentalist',
  other: 'Artist',
};

const GALLERY_IMAGES = [
  { url: '/gallery_1.png', caption: 'Live Concert Set' },
  { url: '/gallery_2.png', caption: 'Acoustic Vibe Session' },
  { url: '/gallery_3.png', caption: 'Sunset Festival Mainstage' },
  { url: '/gallery_4.png', caption: 'Backstage Warmup Session' },
  { url: '/gallery_5.png', caption: 'Crowd Connection Moment' },
  { url: '/gallery_6.png', caption: 'Soundcheck & Setup Jam' },
];

const TRACKS = [
  { id: 1, title: 'Live Performance Showcase — Cohort 1 Preview', src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
  { id: 2, title: 'Studio Electronic Demo — System Preview', src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3' },
];

export default function PublicProfilePage() {
  const params = useParams();
  const username = params?.username as string;
  const router = useRouter();

  const [reservation, setReservation] = useState<WaitlistEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [copied, setCopied] = useState(false);
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);
  const [isContactOpen, setIsContactOpen] = useState(false);

  // Dynamic user stats for Founding Badge / Card
  const [points, setPoints] = useState<number>(100);
  const [waitlistPos, setWaitlistPos] = useState<number | null>(null);
  const [cohortVal, setCohortVal] = useState<string>('003');

  // 3D Tilt Card State
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [sheenX, setSheenX] = useState(50);
  const [sheenY, setSheenY] = useState(50);

  // Audio player state
  const [currentPlayingTrack, setCurrentPlayingTrack] = useState<number | null>(null);
  const [audioPlaying, setAudioPlaying] = useState<boolean>(false);
  const [audioProgress, setAudioProgress] = useState<number>(0);
  const [audioCurrentTime, setAudioCurrentTime] = useState<string>('00:00');
  const [audioDuration, setAudioDuration] = useState<string>('00:00');
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0]);
  const heroScale = useTransform(scrollY, [0, 400], [1, 1.08]);

  useEffect(() => { setMounted(true); }, []);
  const isLight = mounted && resolvedTheme === 'light';

  useEffect(() => {
    if (!username) return;
    getPublicProfileDataAction(username).then((data) => {
      if (!data) {
        setLoading(false);
        return;
      }
      setReservation(data.reservation);
      setPoints(data.points);
      setWaitlistPos(data.waitlistPos);
      setCohortVal(data.cohortVal);
      setLoading(false);
      
      const visitedKey = `visited_${data.reservation.username}`;
      if (!localStorage.getItem(visitedKey)) {
        incrementProfileVisitorsAction(data.reservation.username).catch(console.error);
        localStorage.setItem(visitedKey, 'true');
      }
    }).catch(err => { 
      console.error(err); 
      setLoading(false); 
    });
  }, [username]);

  useEffect(() => {
    if (reservation?.custom_status_message) {
      const timer = setTimeout(() => setShowNotification(true), 1200);
      return () => clearTimeout(timer);
    }
  }, [reservation]);

  const handleShare = async () => {
    const url = `${window.location.origin}/${reservation?.username}`;
    if (navigator.share) {
      try { await navigator.share({ title: `${reservation?.display_name} on Artistant`, url }); } catch {}
    } else {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // 3D Card Hover Handlers
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const xc = rect.width / 2;
    const yc = rect.height / 2;
    setRotateX((yc - y) / 12);
    setRotateY((x - xc) / 12);
    setSheenX((x / rect.width) * 100);
    setSheenY((y / rect.height) * 100);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
    setSheenX(50);
    setSheenY(50);
  };

  // Audio Playback Handlers
  const handlePlayPause = (trackId: number) => {
    if (!audioRef.current) return;
    
    const track = TRACKS.find(t => t.id === trackId);
    if (!track) return;

    if (currentPlayingTrack === trackId) {
      if (audioPlaying) {
        audioRef.current.pause();
        setAudioPlaying(false);
      } else {
        audioRef.current.play().catch(console.error);
        setAudioPlaying(true);
      }
    } else {
      audioRef.current.src = track.src;
      audioRef.current.load();
      audioRef.current.play().then(() => {
        setAudioPlaying(true);
      }).catch(console.error);
      setCurrentPlayingTrack(trackId);
    }
  };

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    const cur = audioRef.current.currentTime;
    const dur = audioRef.current.duration || 1;
    setAudioProgress((cur / dur) * 100);
    setAudioCurrentTime(formatTime(cur));
  };

  const handleLoadedMetadata = () => {
    if (!audioRef.current) return;
    setAudioDuration(formatTime(audioRef.current.duration));
  };

  const handleAudioEnded = () => {
    setAudioPlaying(false);
    setAudioProgress(0);
    setAudioCurrentTime('00:00');
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return '00:00';
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleScrub = (value: number) => {
    if (!audioRef.current) return;
    const dur = audioRef.current.duration;
    if (!dur) return;
    const newTime = (value / 100) * dur;
    audioRef.current.currentTime = newTime;
    setAudioProgress(value);
  };

  // Check YouTube Video Id
  const getYouTubeEmbedId = (url: string) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050508]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-[3px] border-[#7C5CFF] border-t-transparent rounded-full animate-spin" />
          <span className="text-white/40 text-xs font-mono tracking-widest uppercase">Loading portfolio</span>
        </div>
      </div>
    );
  }

  if (!reservation) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#050508] gap-6">
        <img src="/logo_a.png" alt="Artistant" className="w-12 h-12 opacity-40" />
        <h1 className="text-2xl font-bold text-white/80">Artist not found</h1>
        <button onClick={() => router.push('/')} className="px-6 py-3 bg-[#7C5CFF] text-white rounded-full font-bold text-sm hover:bg-[#6B4FE0] transition-colors">Return Home</button>
      </div>
    );
  }

  const displayName = reservation.display_name || reservation.username;
  const categoryLabel = categoryLabels[reservation.category || ''] || reservation.category || 'Artist';
  const genres = reservation.genres || [];
  const hasSocials = reservation.instagram_url || reservation.spotify_url || reservation.youtube_url;

  // Verify contact buttons eligibility
  const emailVal = reservation.email;
  const phoneVal = reservation.phone;
  const isEmailEnabled = reservation.contact_email_enabled !== false && !!emailVal;
  const isPhoneEnabled = reservation.contact_phone_enabled === true && !!phoneVal;
  const hasContact = isEmailEnabled || isPhoneEnabled;

  const youtubeId = reservation.youtube_url ? getYouTubeEmbedId(reservation.youtube_url) : null;

  return (
    <div className="min-h-screen w-full bg-[#050508] font-sans overflow-x-hidden relative text-white selection:bg-[#7C5CFF]/30">

      {/* Global CSS Styles for dancing waveform equalizer animation */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes eq-bar-anim {
          0%, 100% { height: 4px; }
          50% { height: 16px; }
        }
        .animate-eq-bar-1 { animation: eq-bar-anim 0.8s ease-in-out infinite; }
        .animate-eq-bar-2 { animation: eq-bar-anim 0.5s ease-in-out infinite 0.1s; }
        .animate-eq-bar-3 { animation: eq-bar-anim 0.7s ease-in-out infinite 0.2s; }
        .animate-eq-bar-4 { animation: eq-bar-anim 0.6s ease-in-out infinite 0.15s; }
        .animate-eq-bar-5 { animation: eq-bar-anim 0.9s ease-in-out infinite 0.05s; }
      `}} />

      {/* Premium background particles and grid mask */}
      <ParticleBackground />

      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div 
          className="absolute inset-0 opacity-15"
          style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
            maskImage: "radial-gradient(ellipse 70% 60% at 50% 50%, black 40%, transparent 95%)",
            WebkitMaskImage: "radial-gradient(ellipse 70% 60% at 50% 50%, black 40%, transparent 95%)",
          }}
        />
        
        {/* Colorful flowing glowing blur orbs */}
        <div className="absolute top-[10%] left-[-15%] w-[600px] h-[600px] rounded-full opacity-[0.06] blur-[120px]" style={{ background: 'radial-gradient(circle, #7C5CFF 0%, transparent 70%)' }} />
        <div className="absolute top-[40%] right-[-15%] w-[750px] h-[750px] rounded-full opacity-[0.05] blur-[130px]" style={{ background: 'radial-gradient(circle, #F25A2B 0%, transparent 70%)' }} />
        <div className="absolute bottom-[20%] left-[10%] w-[600px] h-[600px] rounded-full opacity-[0.06] blur-[120px]" style={{ background: 'radial-gradient(circle, #D4567A 0%, transparent 70%)' }} />
      </div>

      {/* Broadcast Notification */}
      <AnimatePresence>
        {showNotification && reservation.custom_status_message && (
          <motion.div
            initial={{ opacity: 0, y: -60, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -30, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 380, damping: 28 }}
            className="fixed top-5 left-1/2 -translate-x-1/2 md:left-auto md:translate-x-0 md:right-6 z-[60] w-[360px] max-w-[calc(100vw-24px)] rounded-2xl overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(12,12,18,0.92) 0%, rgba(20,16,32,0.92) 100%)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              border: '1px solid rgba(124,92,255,0.15)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(124,92,255,0.08)',
            }}
          >
            <div className="px-4 py-2 flex items-center justify-between border-b border-white/[0.04]">
              <div className="flex items-center gap-2">
                <img src="/logo_a.png" alt="A" className="w-3.5 h-3.5 opacity-50" />
                <span className="text-[10px] font-bold text-white/35 uppercase tracking-[0.15em]">New Message</span>
              </div>
              <button onClick={() => setShowNotification(false)} className="w-5 h-5 rounded-full flex items-center justify-center hover:bg-white/10 text-white/30 hover:text-white/60 transition-colors">
                <X className="w-3 h-3" />
              </button>
            </div>
            <div className="p-4 flex gap-3 items-start">
              <div className="w-10 h-10 rounded-full shrink-0 overflow-hidden ring-2 ring-[#7C5CFF]/20 flex items-center justify-center bg-gradient-to-br from-[#7C5CFF]/20 to-[#D4567A]/20">
                {reservation.profile_photo_url ? (
                  <img src={reservation.profile_photo_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-sm font-bold text-white/70">{displayName[0].toUpperCase()}</span>
                )}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-bold text-white/90 truncate">{displayName}</span>
                <p className="text-[13px] text-white/50 mt-0.5 leading-relaxed">{reservation.custom_status_message}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <div ref={heroRef} className="relative w-full min-h-[90vh] md:min-h-[95vh] flex flex-col overflow-hidden">
        <motion.div style={{ scale: heroScale }} className="absolute inset-0">
          {reservation.profile_photo_url ? (
            <img src={reservation.profile_photo_url} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#1a0d2e] via-[#0d0d1a] to-[#0a0a0f]">
              <div className="absolute inset-0 opacity-20" style={{
                backgroundImage: `radial-gradient(circle at 20% 50%, #7C5CFF 0%, transparent 50%), radial-gradient(circle at 80% 20%, #F25A2B 0%, transparent 50%), radial-gradient(circle at 50% 80%, #D4567A 0%, transparent 50%)`,
              }} />
            </div>
          )}
        </motion.div>

        {/* Fades to make layout readable */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#050508]/30 via-transparent to-[#050508]" />
        <div className="absolute inset-0 bg-[#050508]/40 backdrop-blur-[2px]" />

        {/* Top Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="relative z-20 flex items-center justify-between px-5 md:px-10 pt-6 md:pt-8 w-full"
        >
          <a href="/" className="flex items-center gap-2.5 group">
            <img src="/logo_a.png" alt="Artistant" className="w-7 h-7 opacity-70 group-hover:opacity-100 transition-opacity" />
            <span className="text-[11px] font-mono font-bold text-white/40 uppercase tracking-[0.2em] group-hover:text-white/60 transition-colors hidden sm:block">Artistant Portfolio</span>
          </a>
          <div className="flex items-center gap-3">
            <motion.a
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              href="/"
              className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold text-white/70 hover:text-white transition-colors border border-white/10"
              style={{
                background: 'rgba(255,255,255,0.04)',
                backdropFilter: 'blur(12px)',
              }}
            >
              <span>Visit Artistant</span>
            </motion.a>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleShare}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold text-white/70 hover:text-white transition-colors"
              style={{
                background: 'rgba(255,255,255,0.06)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{copied ? 'Copied!' : 'Share'}</span>
            </motion.button>
          </div>
        </motion.div>

        {/* Artist Header Details (Grid: Left Content, Right 3D Card) */}
        <div className="relative z-20 mt-auto px-5 md:px-10 pb-10 md:pb-16 w-full max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-end">
            
            {/* Left Content column */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.7 }}
              className="lg:col-span-7 text-left space-y-4"
            >
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-[0.15em]"
                  style={{
                    background: 'linear-gradient(135deg, rgba(124,92,255,0.15) 0%, rgba(212,86,122,0.15) 100%)',
                    border: '1px solid rgba(124,92,255,0.2)',
                    color: '#B49FFF',
                    backdropFilter: 'blur(8px)',
                  }}
                >
                  {categoryLabel}
                </span>
                {reservation.city && (
                  <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] font-bold text-white/50 bg-white/[0.05] border border-white/[0.06] backdrop-blur-sm">
                    <MapPin className="w-3 h-3 text-[#F25A2B]" /> {reservation.city}
                  </span>
                )}
              </div>

              {/* Display Name + Verified Founding Badge */}
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-[-0.03em] leading-[0.95] font-display flex flex-wrap items-center gap-x-4 gap-y-2">
                <span>{displayName}</span>
                {points >= 500 && (
                  <span 
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider bg-gradient-to-r from-emerald-500/15 to-teal-500/15 border border-emerald-500/30 text-emerald-400 select-none shrink-0"
                    style={{
                      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05), 0 0 15px rgba(52, 211, 153, 0.15)',
                      backdropFilter: 'blur(8px)',
                    }}
                    title="Verified Founding Artist Badge"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34D399]" />
                    <span>Founding Artist</span>
                  </span>
                )}
              </h1>

              <p className="text-sm md:text-base font-mono text-white/35 tracking-wide">@{reservation.username}</p>

              {genres.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {genres.map(g => (
                    <span key={g} className="px-3 py-1 rounded-full text-xs font-medium text-[#c0b3ff] bg-white/[0.04] border border-white/[0.06]">{g}</span>
                  ))}
                </div>
              )}

              {reservation.bio && (
                <p className="text-white/60 text-sm md:text-base leading-relaxed max-w-xl pt-2">{reservation.bio}</p>
              )}

              {/* Social Links & Contact */}
              <div className="flex flex-wrap items-center gap-3 pt-4">
                {reservation.instagram_url && (
                  <a href={reservation.instagram_url} target="_blank" rel="noopener noreferrer"
                    className="group flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 hover:scale-[1.03]"
                    style={{
                      background: 'linear-gradient(135deg, rgba(225,48,108,0.1) 0%, rgba(252,175,69,0.06) 100%)',
                      border: '1px solid rgba(225,48,108,0.18)',
                    }}
                  >
                    <InstagramIcon className="w-4 h-4 text-[#E1306C]" />
                    <span className="text-white/70 group-hover:text-white transition-colors">Instagram</span>
                  </a>
                )}
                {reservation.spotify_url && (
                  <a href={reservation.spotify_url} target="_blank" rel="noopener noreferrer"
                    className="group flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 hover:scale-[1.03]"
                    style={{
                      background: 'rgba(29,185,84,0.08)',
                      border: '1px solid rgba(29,185,84,0.18)',
                    }}
                  >
                    <SpotifyIcon className="w-4 h-4 text-[#1DB954]" />
                    <span className="text-white/70 group-hover:text-white transition-colors">Spotify</span>
                  </a>
                )}
                {reservation.youtube_url && (
                  <a href={reservation.youtube_url} target="_blank" rel="noopener noreferrer"
                    className="group flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 hover:scale-[1.03]"
                    style={{
                      background: 'rgba(255,0,0,0.06)',
                      border: '1px solid rgba(255,0,0,0.15)',
                    }}
                  >
                    <YouTubeIcon className="w-4 h-4 text-[#FF0000]" />
                    <span className="text-white/70 group-hover:text-white transition-colors">YouTube</span>
                  </a>
                )}

                {/* Floating Contact Drawer Action */}
                {hasContact && (
                  <button
                    onClick={() => setIsContactOpen(true)}
                    className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 bg-white text-black hover:bg-white/90 active:scale-95 shadow-[0_10px_30px_rgba(255,255,255,0.05)]"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Contact</span>
                  </button>
                )}
              </div>
            </motion.div>
            
            {/* Right Column: Featured Founding Card */}
            {reservation.feature_founding_card && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.7 }}
                className="lg:col-span-5 flex justify-center lg:justify-end w-full"
              >
                <div className="w-full max-w-sm aspect-[1.58/1] relative" style={{ perspective: 1200 }}>
                  <motion.div
                    ref={cardRef}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                    animate={{ rotateX, rotateY }}
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                    className="w-full h-full relative rounded-[2rem] p-[1.5px] overflow-hidden group cursor-pointer shadow-[0_30px_90px_-20px_rgba(0,0,0,0.9)]"
                    style={{
                      background: 'linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.01) 40%, rgba(124,92,255,0.2))',
                      transformStyle: 'preserve-3d',
                    }}
                  >
                    <div 
                      className="relative w-full h-full bg-[#050508]/90 rounded-[1.95rem] p-5 flex flex-col justify-between overflow-hidden border border-white/5"
                      style={{
                        isolation: 'isolate',
                        WebkitMaskImage: '-webkit-radial-gradient(white, black)'
                      }}
                    >
                      {/* Decorative Circles */}
                      <div className="absolute -right-20 -bottom-20 w-80 h-80 rounded-full border border-white/[0.02] flex items-center justify-center pointer-events-none">
                        <div className="w-60 h-60 rounded-full border border-white/[0.01] flex items-center justify-center" />
                      </div>

                      {/* Sheen effect */}
                      <div 
                        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                        style={{
                          background: `radial-gradient(circle 180px at ${sheenX}% ${sheenY}%, rgba(255,255,255,0.06), transparent)`,
                        }}
                      />

                      {/* Card Top Row */}
                      <div className="flex justify-between items-start z-10 w-full">
                        <div className="flex items-center gap-2">
                          <img src="/logo_a.png" alt="A" className="w-5 h-5 object-contain opacity-80" />
                          <span className="font-mono text-[8px] font-bold tracking-[0.2em] text-white/40">FOUNDING CARD</span>
                        </div>
                        <span 
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-mono text-[8px] font-bold uppercase tracking-wider relative overflow-hidden transition-all duration-300 ${
                            points >= 500 
                              ? 'bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 text-emerald-400' 
                              : 'bg-white/[0.02] border border-white/5 text-white/40'
                          }`}
                        >
                          {points >= 500 ? (
                            <>
                              <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
                              <span>Founding Artist</span>
                            </>
                          ) : (
                            <>
                              <span className="w-1 h-1 rounded-full bg-white/20" />
                              <span>Founding Artist</span>
                              <LockKeyhole className="w-2 h-2 text-white/30 ml-0.5" />
                            </>
                          )}
                        </span>
                      </div>

                      {/* Rank Position (Center) */}
                      <div className="flex flex-col items-center justify-center z-10 flex-1 my-1">
                        <h1 className="font-display font-black leading-none text-white tracking-tighter text-4xl sm:text-5xl" style={{ textShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
                          #{waitlistPos || '---'}
                        </h1>
                        <span className="text-[8px] font-mono tracking-[0.2em] uppercase text-white/25 mt-1">Waitlist Rank</span>
                      </div>

                      {/* Card Bottom Row */}
                      <div className="flex justify-between items-end z-10 w-full border-t border-white/[0.04] pt-3">
                        <div className="flex flex-col text-left">
                          <span className="text-[7px] font-mono tracking-widest text-white/35 uppercase">Artist Name</span>
                          <span className="text-[10px] font-bold text-white/80 truncate max-w-[120px]">{displayName}</span>
                        </div>
                        <div className="flex flex-col text-right">
                          <span className="text-[7px] font-mono tracking-widest text-white/35 uppercase">Cohort / Status</span>
                          <span className="text-[8px] font-mono tracking-wider text-[#7C5CFF] font-bold">COHORT {cohortVal} · FOUNDING</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            )}

          </div>
        </div>

        <motion.div
          style={{ opacity: heroOpacity }}
          className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-1"
        >
          <ChevronDown className="w-4 h-4 text-white/20 animate-bounce" />
        </motion.div>
      </div>

      {/* Public profile sections based on custom ordering */}
      <div className="relative z-10 max-w-5xl mx-auto px-5 md:px-10 pb-20">
        {(reservation.section_order || ['gallery', 'video', 'audio']).map((section) => {
          if (section === 'gallery') {
            return (
              <motion.section
                key="gallery"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5 }}
                className="mb-16 pt-8"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/5 border border-white/10">
                    <span className="text-[#7C5CFF] font-bold text-xs">01</span>
                  </div>
                  <div>
                    <h2 className="text-lg font-bold tracking-tight">Gig Gallery</h2>
                    <p className="text-[10px] text-white/30 font-mono tracking-wider uppercase">Live Gigs & Moments</p>
                  </div>
                </div>

                {/* Grid with Real visual assets */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                  {GALLERY_IMAGES.map((img, i) => (
                    <motion.div
                      key={i}
                      whileHover={{ scale: 1.02, y: -4 }}
                      onClick={() => setLightboxImg(img.url)}
                      className="aspect-square rounded-2xl overflow-hidden relative group bg-white/[0.01] border border-white/[0.05] cursor-pointer shadow-md"
                    >
                      <img src={img.url} alt={img.caption} className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-all duration-500" />
                      
                      {/* Dark overlay showing title on hover */}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4 text-left">
                        <span className="text-[8px] font-mono tracking-widest text-[#B49FFF] uppercase mb-0.5">Gig Moment</span>
                        <p className="text-xs font-bold text-white truncate">{img.caption}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.section>
            );
          }

          if (section === 'video') {
            return (
              <motion.section
                key="video"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5 }}
                className="mb-16"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/5 border border-white/10">
                    <span className="text-[#D4567A] font-bold text-xs">02</span>
                  </div>
                  <div>
                    <h2 className="text-lg font-bold tracking-tight">Featured Showreel</h2>
                    <p className="text-[10px] text-white/30 font-mono tracking-wider uppercase">Performances & Showreel</p>
                  </div>
                </div>

                {/* Iframe wrapper for youtube URLs, with cover fallback */}
                {youtubeId ? (
                  <div className="w-full aspect-video rounded-3xl overflow-hidden relative border border-white/[0.06] bg-black shadow-[0_15px_50px_-15px_rgba(0,0,0,0.8)]">
                    <iframe
                      width="100%"
                      height="100%"
                      src={`https://www.youtube.com/embed/${youtubeId}?autoplay=0&rel=0`}
                      title="YouTube video player"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full"
                    />
                  </div>
                ) : (
                  <div
                    className="w-full aspect-video rounded-3xl overflow-hidden relative group border border-white/[0.04] flex items-center justify-center cursor-pointer shadow-lg"
                    onClick={() => {
                      if (reservation.youtube_url) {
                        window.open(reservation.youtube_url, '_blank');
                      }
                    }}
                  >
                    <img src="/gallery_3.png" alt="Showreel background cover" className="absolute inset-0 w-full h-full object-cover opacity-35 group-hover:scale-103 transition-transform duration-700" />
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                    
                    <div className="relative z-10 w-20 h-20 rounded-full bg-gradient-to-br from-[#D4567A]/20 to-[#7C5CFF]/20 border border-white/20 flex items-center justify-center shadow-[0_0_30px_rgba(124,92,255,0.2)] group-hover:shadow-[0_0_50px_rgba(124,92,255,0.4)] group-hover:scale-110 transition-all duration-300 backdrop-blur-sm">
                      <Play className="w-7 h-7 text-white ml-1 filter drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]" />
                    </div>
                    
                    <div className="absolute bottom-6 left-6 text-left z-10">
                      <span className="text-[9px] font-mono font-bold tracking-widest text-[#B49FFF] uppercase mb-1 block">Click to Watch</span>
                      <h3 className="text-sm font-bold text-white/90">Artist Showreel & Live Highlights</h3>
                    </div>
                  </div>
                )}
              </motion.section>
            );
          }

          if (section === 'audio') {
            return (
              <motion.section
                key="audio"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5 }}
                className="mb-16"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/5 border border-white/10">
                    <span className="text-[#F25A2B] font-bold text-xs">03</span>
                  </div>
                  <div>
                    <h2 className="text-lg font-bold tracking-tight">Audio Samples</h2>
                    <p className="text-[10px] text-white/30 font-mono tracking-wider uppercase">Tracks & Demos</p>
                  </div>
                </div>

                {/* Hidden html audio component */}
                <audio 
                  ref={audioRef}
                  onTimeUpdate={handleTimeUpdate}
                  onLoadedMetadata={handleLoadedMetadata}
                  onEnded={handleAudioEnded}
                />

                {/* Custom functional audio track rows */}
                <div className="space-y-3">
                  {TRACKS.map((track) => (
                    <div
                      key={track.id}
                      className={`flex flex-col gap-3 p-4 rounded-2xl border transition-all duration-300 text-left ${
                        currentPlayingTrack === track.id
                          ? 'bg-white/[0.03] border-white/10 shadow-lg'
                          : 'bg-white/[0.01] border-white/[0.03] hover:border-white/5'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => handlePlayPause(track.id)}
                          className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 text-[#F25A2B] active:scale-95 transition-all"
                        >
                          {currentPlayingTrack === track.id && audioPlaying ? (
                            <Pause className="w-4 h-4 text-white" />
                          ) : (
                            <Play className="w-4 h-4 text-white ml-0.5" />
                          )}
                        </button>
                        
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-white/80 truncate">{track.title}</p>
                          <span className="text-[9px] font-mono text-white/20 uppercase tracking-widest mt-0.5 block">
                            {currentPlayingTrack === track.id ? 'Now Playing' : 'Demo Stream'}
                          </span>
                        </div>

                        {/* Equalizer animation */}
                        {currentPlayingTrack === track.id && audioPlaying && (
                          <div className="flex items-end gap-0.5 h-4 px-2 shrink-0">
                            <span className="w-[2px] bg-[#F25A2B] rounded-full animate-eq-bar-1" />
                            <span className="w-[2px] bg-[#D4567A] rounded-full animate-eq-bar-2" />
                            <span className="w-[2px] bg-[#7C5CFF] rounded-full animate-eq-bar-3" />
                            <span className="w-[2px] bg-[#D4567A] rounded-full animate-eq-bar-4" />
                            <span className="w-[2px] bg-[#F25A2B] rounded-full animate-eq-bar-5" />
                          </div>
                        )}

                        <span className="text-[11px] font-mono text-white/25">
                          {currentPlayingTrack === track.id ? audioCurrentTime : '00:00'}
                        </span>
                      </div>

                      {/* Timeline controller for the active track */}
                      {currentPlayingTrack === track.id && (
                        <div className="flex items-center gap-3 pt-1">
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={audioProgress}
                            onChange={(e) => handleScrub(parseFloat(e.target.value))}
                            className="flex-1 h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-[#F25A2B] focus:outline-none"
                            style={{
                              backgroundImage: `linear-gradient(to right, #F25A2B 0%, #F25A2B ${audioProgress}%, rgba(255,255,255,0.1) ${audioProgress}%, rgba(255,255,255,0.1) 100%)`
                            }}
                          />
                          <span className="text-[10px] font-mono text-white/40 shrink-0">{audioDuration}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </motion.section>
            );
          }

          return null;
        })}
      </div>

      {/* Visit Artistant Call to Action Banner */}
      <div className="relative z-10 max-w-5xl mx-auto px-5 md:px-10 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="rounded-[2rem] p-[1.5px] bg-gradient-to-r from-[rgba(255,255,255,0.08)] to-transparent"
        >
          <div className="bg-[#0A0A10]/90 rounded-[1.9rem] p-8 md:p-10 backdrop-blur-xl border border-white/[0.03] flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 rounded-full opacity-10 pointer-events-none" style={{
              background: 'radial-gradient(circle, rgba(124,92,255,0.3) 0%, rgba(242,90,43,0.1) 50%, transparent 100%)',
              filter: 'blur(40px)',
            }} />
            <div className="space-y-2 text-center md:text-left z-10">
              <h3 className="text-xl md:text-2xl font-display font-black text-white leading-tight">Rebuilding India&apos;s Live Economy</h3>
              <p className="text-xs text-white/50 max-w-md font-mono leading-relaxed">
                Artistant is the booking, contract, and escrow infrastructure designed to empower independent live artists. Secure your handle today.
              </p>
            </div>
            <motion.a
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              href="/"
              className="px-6 py-3 rounded-xl bg-white text-black text-xs font-bold font-mono uppercase hover:bg-white/90 transition-colors z-10 shrink-0 cursor-pointer shadow-[0_10px_20px_rgba(255,255,255,0.05)]"
            >
              Visit Artistant
            </motion.a>
          </div>
        </motion.div>
      </div>

      <footer className="relative z-10 border-t border-white/[0.04] py-8">
        <div className="max-w-5xl mx-auto px-5 md:px-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <a href="/" className="flex items-center gap-2.5 group">
            <img src="/logo_a.png" alt="" className="w-5 h-5 opacity-35" />
            <span className="text-xs text-white/25">
              Powered by <span className="font-bold text-white/40">Artistant Portfolio</span>
            </span>
          </a>
          <span className="text-[10px] font-mono text-white/15">@{reservation.username}</span>
        </div>
      </footer>

      {/* Lightbox Modal overlay */}
      <AnimatePresence>
        {lightboxImg && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setLightboxImg(null)}
              className="absolute inset-0 bg-black/90 backdrop-blur-xl"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 15 }}
              className="relative max-w-5xl max-h-[85vh] z-10 flex flex-col items-center"
            >
              <button
                onClick={() => setLightboxImg(null)}
                className="absolute -top-12 right-0 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
              
              <img 
                src={lightboxImg} 
                alt="Enlarged stage photo" 
                className="max-w-full max-h-[75vh] object-contain rounded-2xl border border-white/10 shadow-2xl" 
              />
              
              {GALLERY_IMAGES.find(img => img.url === lightboxImg)?.caption && (
                <span className="text-white/60 text-xs font-mono tracking-wider mt-4">
                  {GALLERY_IMAGES.find(img => img.url === lightboxImg)?.caption}
                </span>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Contact Options Modal Overlay */}
      <AnimatePresence>
        {isContactOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsContactOpen(false)}
              className="absolute inset-0 bg-black/75 backdrop-blur-md"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 15 }}
              className="relative w-full max-w-sm rounded-3xl overflow-hidden p-6 z-10 border border-white/10"
              style={{
                background: 'linear-gradient(135deg, rgba(10,10,14,0.96) 0%, rgba(18,14,28,0.96) 100%)',
              }}
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-sm font-mono tracking-widest text-white/40 uppercase">Contact Options</h3>
                <button
                  onClick={() => setIsContactOpen(false)}
                  className="w-7 h-7 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 text-white/40 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3">
                {isEmailEnabled && (
                  <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.04] flex flex-col gap-2 text-left">
                    <span className="text-[9px] font-mono font-bold text-white/30 uppercase tracking-widest flex items-center gap-1.5">
                      <Mail className="w-3 h-3 text-[#7C5CFF]" /> Email Address
                    </span>
                    <span className="text-sm font-bold text-white/90 truncate">{emailVal}</span>
                    <a
                      href={`mailto:${emailVal}`}
                      className="mt-1 text-center py-2.5 rounded-xl bg-white text-black font-bold text-xs hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                      Send Mail
                    </a>
                  </div>
                )}

                {isPhoneEnabled && (
                  <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.04] flex flex-col gap-2 text-left">
                    <span className="text-[9px] font-mono font-bold text-white/30 uppercase tracking-widest flex items-center gap-1.5">
                      <Phone className="w-3 h-3 text-[#F25A2B]" /> Mobile Number
                    </span>
                    <span className="text-sm font-bold text-white/90 truncate">{phoneVal}</span>
                    <div className="grid grid-cols-2 gap-2 mt-1">
                      <a
                        href={`tel:${phoneVal}`}
                        className="text-center py-2.5 rounded-xl bg-white/5 border border-white/10 font-bold text-xs text-white hover:bg-white/10 active:scale-95 transition-all"
                      >
                        Call Mobile
                      </a>
                      <a
                        href={`https://wa.me/${phoneVal.replace(/\+/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-center py-2.5 rounded-xl bg-[#25D366] font-bold text-xs text-white hover:scale-[1.02] active:scale-95 transition-all"
                      >
                        WhatsApp
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
