'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'motion/react';
import { useParams, useRouter } from 'next/navigation';
import { incrementProfileVisitorsAction, getPublicProfileDataAction, type PublicProfileReservation } from '@/lib/profile-actions';
import { useTheme } from 'next-themes';
import { 
  X, MapPin, Share2, Mail, Phone, LockKeyhole, ArrowLeft, Heart
} from 'lucide-react';

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

export default function PublicProfilePage() {
  const params = useParams();
  const username = params?.username as string;
  const router = useRouter();

  const [reservation, setReservation] = useState<PublicProfileReservation | null>(null);
  const [loading, setLoading] = useState(true);
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [copied, setCopied] = useState(false);
  const [liked, setLiked] = useState(false);
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);
  const [isContactOpen, setIsContactOpen] = useState(false);

  // Dynamic user stats for Founding Card / Badge
  const [points, setPoints] = useState<number>(100);
  const [waitlistPos, setWaitlistPos] = useState<number | null>(null);
  const [cohortVal, setCohortVal] = useState<string>('003');

  // 3D Tilt Card State
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [sheenX, setSheenX] = useState(50);
  const [sheenY, setSheenY] = useState(50);

  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  const heroScale = useTransform(scrollY, [0, 400], [1, 1.05]);

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
    const rect = e.currentTarget.getBoundingClientRect();
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

  // Check YouTube Video Id
  const getYouTubeEmbedId = (url: string) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  // Check Instagram Video/Reel Id
  const getInstagramEmbedId = (url: string) => {
    if (!url) return null;
    const match = url.match(/instagram\.com\/(?:p|reel|tv)\/([^/?#&]+)/i);
    return match ? match[1] : null;
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
  const hasSocials = reservation.instagram_url || reservation.spotify_url || reservation.youtube_channel_url;

  // Verify contact buttons eligibility
  const emailVal = reservation.email;
  const phoneVal = reservation.phone;
  const isEmailEnabled = reservation.contact_email_enabled !== false && !!emailVal;
  const isPhoneEnabled = reservation.contact_phone_enabled === true && !!phoneVal;
  const hasContact = isEmailEnabled || isPhoneEnabled;

  const youtubeId = reservation.youtube_url ? getYouTubeEmbedId(reservation.youtube_url) : null;
  const instagramVideoId = reservation.instagram_url ? getInstagramEmbedId(reservation.instagram_url) : null;

  // Dynamically map gallery photos (No fallback default images)
  const displayGallery = reservation.gallery_photos && reservation.gallery_photos.length > 0
    ? reservation.gallery_photos.map((url, i) => ({ url, caption: `Gig Performance ${i + 1}` }))
    : [];

  // Helper function to render the waitlist placement certificate / founding card
  const renderFoundingCard = (isMobile: boolean) => {
    if (!reservation?.feature_founding_card) return null;
    return (
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className={isMobile 
          ? "space-y-6 text-left" 
          : `hidden md:block space-y-6 text-left pt-8 border-t ${isLight ? 'border-black/[0.06]' : 'border-white/[0.04]'}`
        }
      >
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center border shadow-sm ${isLight ? 'bg-white border-black/10' : 'bg-white/5 border border-white/10'}`}>
            <span className="text-[#F25A2B] font-bold text-xs font-mono">
              <span className="inline md:hidden">01</span>
              <span className="hidden md:inline">03</span>
            </span>
          </div>
          <div>
            <h2 className={`text-lg font-bold tracking-tight ${isLight ? 'text-zinc-900' : 'text-white'}`}>Founding Status</h2>
            <p className={`text-[10px] font-mono tracking-wider uppercase ${isLight ? 'text-zinc-400' : 'text-white/30'}`}>Waitlist Placement Certificate</p>
          </div>
        </div>

        <div className="flex justify-center w-full py-4">
          <div className="w-full max-w-md aspect-[1.58/1] relative mx-auto" style={{ perspective: 1200 }}>
            <motion.div
              ref={cardRef}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              animate={{ rotateX, rotateY }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className={`w-full h-full relative rounded-[2.5rem] p-[1.5px] overflow-hidden group cursor-pointer ${isLight ? 'shadow-[0_20px_50px_rgba(124,92,255,0.08)]' : 'shadow-[0_30px_90px_-20px_rgba(0,0,0,0.9)]'}`}
              style={{
                background: isLight 
                  ? 'linear-gradient(135deg, rgba(124,92,255,0.2), rgba(242,90,43,0.1) 40%, rgba(255,255,255,0.5))' 
                  : 'linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.01) 40%, rgba(124,92,255,0.2))',
                transformStyle: 'preserve-3d',
              }}
            >
              <div 
                className={`relative w-full h-full rounded-[2.4rem] p-5 md:p-6 flex flex-col justify-between overflow-hidden border ${isLight ? 'bg-white/90 border-[#7C5CFF]/15' : 'bg-[#050508]/90 border border-white/5'}`}
                style={{
                  isolation: 'isolate',
                  WebkitMaskImage: '-webkit-radial-gradient(white, black)'
                }}
              >
                {/* Decorative Circles */}
                <div className={`absolute -right-20 -bottom-20 w-80 h-80 rounded-full border flex items-center justify-center pointer-events-none ${isLight ? 'border-[#7C5CFF]/5' : 'border-white/[0.02]'}`}>
                  <div className={`w-60 h-60 rounded-full border flex items-center justify-center ${isLight ? 'border-[#7C5CFF]/3' : 'border-white/[0.01]'}`} />
                </div>

                {/* Sheen effect */}
                <div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                  style={{
                    background: isLight 
                      ? `radial-gradient(circle 180px at ${sheenX}% ${sheenY}%, rgba(124,92,255,0.08), transparent)`
                      : `radial-gradient(circle 180px at ${sheenX}% ${sheenY}%, rgba(255,255,255,0.06), transparent)`,
                  }}
                />

                {/* Card Top Row */}
                <div className="flex justify-between items-start z-10 w-full">
                  <div className="flex items-center gap-2">
                    <img src="/logo_a.png" alt="A" className="w-6 h-6 object-contain opacity-80" />
                    <span className="font-mono text-[9px] font-bold tracking-[0.2em] text-[var(--ink-2)]">FOUNDING CARD</span>
                  </div>
                  <span 
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-mono text-[9px] font-bold uppercase tracking-wider relative overflow-hidden transition-all duration-300 ${
                      points >= 500 
                        ? isLight 
                          ? 'bg-emerald-50 border border-emerald-200 text-emerald-700 shadow-sm'
                          : 'bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 text-emerald-400 shadow-[0_2px_10px_rgba(16,185,129,0.1)]' 
                        : isLight 
                          ? 'bg-black/[0.04] border border-black/8 text-black/45 shadow-sm'
                          : 'bg-white/[0.02] border border-white/5 text-white/40 shadow-sm'
                    }`}
                    style={{
                      backdropFilter: 'blur(8px)',
                      WebkitBackdropFilter: 'blur(8px)',
                      boxShadow: points >= 500
                        ? isLight
                          ? 'none'
                          : 'inset 0 1px 0 rgba(255,255,255,0.1), inset 0 -1px 0 rgba(0,0,0,0.2), 0 2px 8px rgba(16,185,129,0.08)'
                        : isLight
                          ? 'inset 0 1px 0 rgba(255,255,255,0.6), inset 0 -1px 0 rgba(0,0,0,0.03)'
                          : 'inset 0 1px 0 rgba(255,255,255,0.03), inset 0 -1px 0 rgba(0,0,0,0.4), 0 2px 6px rgba(0,0,0,0.15)',
                    }}
                  >
                    {points >= 500 ? (
                      <>
                        <span className={`w-1.5 h-1.5 rounded-full ${isLight ? 'bg-emerald-500' : 'bg-emerald-400 animate-pulse shadow-[0_0_8px_#34D399]'}`} />
                        <span>Founding Artist</span>
                      </>
                    ) : (
                      <>
                        <span className={`w-1.5 h-1.5 rounded-full ${isLight ? 'bg-black/20' : 'bg-white/20'}`} />
                        <span>Founding Artist</span>
                        <LockKeyhole className={`w-2.5 h-2.5 ${isLight ? 'text-black/35' : 'text-white/30'} ml-0.5 shrink-0`} />
                      </>
                    )}
                  </span>
                </div>

                {/* Rank Position (Center) */}
                <div className="flex flex-col items-center justify-center z-10 flex-1 my-1 md:my-2">
                  <h1 className={`font-display font-black leading-none tracking-tighter text-4xl sm:text-6xl ${isLight ? 'text-zinc-900' : 'text-white'}`} style={{ textShadow: isLight ? '0 10px 30px rgba(124,92,255,0.06)' : '0 10px 30px rgba(0,0,0,0.5)' }}>
                    #{waitlistPos || '---'}
                  </h1>
                  <div className="flex flex-col items-center mt-1.5 md:mt-2.5">
                    <span className="font-mono text-[8px] sm:text-[9px] font-bold tracking-[0.2em] sm:tracking-[0.3em] text-[var(--ink-3)] whitespace-nowrap">WAITLIST RANK • COHORT {cohortVal}</span>
                    <span className="font-mono text-[7.5px] sm:text-[8px] font-bold tracking-[0.12em] sm:tracking-[0.15em] text-[#F25A2B] whitespace-nowrap">{(cohortVal === '001' || cohortVal === '1') ? 'BETA ACCESS GRANTED' : 'POSITION SECURED'}</span>
                  </div>
                </div>

                {/* Bottom Row */}
                <div className="flex justify-between items-center z-10 w-full">
                  <div className="flex flex-col text-left">
                    <span className={`font-display text-xl md:text-2xl font-black tracking-tight ${isLight ? 'text-zinc-800' : 'text-white'}`}>@{reservation.username}</span>
                    <span className={`text-[9px] uppercase font-mono tracking-widest mt-0.5 ${isLight ? 'text-zinc-400' : 'text-white/40'}`}>Verified Artist</span>
                  </div>
                  <div className="flex flex-col items-end">
                    <img src="/logo_wordmark.png" alt="ArtisTant" className={`w-24 md:w-32 h-auto object-contain opacity-85 -my-3 md:-my-4 ${isLight ? 'invert' : 'dark:invert-0'}`} />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>
    );
  };

  return (
    <div className={`min-h-screen w-full font-sans overflow-x-hidden relative transition-colors duration-300 ${isLight ? 'bg-[#FAF9FD] text-zinc-900 selection:bg-[#7C5CFF]/15' : 'bg-[#050508] text-white selection:bg-[#7C5CFF]/30'}`}>

      {/* Import Playfair Display font dynamically */}
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&display=swap');
        .font-serif-display {
          font-family: 'Playfair Display', Georgia, serif;
        }
      `}} />

      {/* Premium backgrounds, grid mask, and color flows */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden" aria-hidden="true">
        {/* Decorative radial gradients matching AuthModal styling */}
        <div className={`absolute top-0 left-0 w-full h-[50vh] transition-opacity duration-300 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-[#F25A2B] via-transparent to-transparent pointer-events-none ${isLight ? 'opacity-[0.12]' : 'opacity-50'}`} style={{ '--tw-gradient-from-position': '0%', '--tw-gradient-via-position': '50%' } as any} />
        <div className={`absolute top-0 right-0 w-full h-[60vh] transition-opacity duration-300 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#7C5CFF] via-transparent to-transparent pointer-events-none ${isLight ? 'opacity-[0.12]' : 'opacity-45'}`} style={{ '--tw-gradient-from-position': '0%', '--tw-gradient-via-position': '50%' } as any} />

        <div 
          className="absolute inset-0 transition-opacity duration-300"
          style={{
            backgroundImage: isLight 
              ? "linear-gradient(rgba(124,92,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(124,92,255,0.04) 1px, transparent 1px)"
              : "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
            maskImage: "radial-gradient(ellipse 70% 60% at 50% 50%, black 40%, transparent 95%)",
            WebkitMaskImage: "radial-gradient(ellipse 70% 60% at 50% 50%, black 40%, transparent 95%)",
            opacity: isLight ? 0.7 : 0.15
          }}
        />
        
        {/* Colorful flowing glowing blur orbs */}
        <div className="absolute top-[5%] left-[-10%] w-[550px] h-[550px] rounded-full blur-[110px] pointer-events-none animate-pulse transition-opacity duration-300" style={{ background: 'radial-gradient(circle, #7C5CFF 0%, transparent 70%)', animationDuration: '10s', opacity: isLight ? 0.08 : 0.25 }} />
        <div className="absolute top-[35%] right-[-10%] w-[650px] h-[650px] rounded-full blur-[120px] pointer-events-none transition-opacity duration-300" style={{ background: 'radial-gradient(circle, #F25A2B 0%, transparent 70%)', opacity: isLight ? 0.07 : 0.2 }} />
        <div className="absolute bottom-[15%] left-[5%] w-[550px] h-[550px] rounded-full blur-[110px] pointer-events-none animate-pulse transition-opacity duration-300" style={{ background: 'radial-gradient(circle, #D4567A 0%, transparent 70%)', animationDuration: '14s', opacity: isLight ? 0.07 : 0.22 }} />
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
              background: isLight
                ? 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(245,242,255,0.95) 100%)'
                : 'linear-gradient(135deg, rgba(12,12,18,0.92) 0%, rgba(20,16,32,0.92) 100%)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              border: isLight ? '1px solid rgba(124,92,255,0.2)' : '1px solid rgba(124,92,255,0.15)',
              boxShadow: isLight
                ? '0 20px 50px rgba(124,92,255,0.08), 0 0 0 1px rgba(124,92,255,0.05)'
                : '0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(124,92,255,0.08)',
            }}
          >
            <div className={`px-4 py-2 flex items-center justify-between border-b ${isLight ? 'border-black/[0.05]' : 'border-white/[0.04]'}`}>
              <div className="flex items-center gap-2">
                <img src="/logo_a.png" alt="A" className={`w-3.5 h-3.5 ${isLight ? 'opacity-70' : 'opacity-50'}`} />
                <span className={`text-[10px] font-bold uppercase tracking-[0.15em] ${isLight ? 'text-zinc-500' : 'text-white/35'}`}>New Message</span>
              </div>
              <button onClick={() => setShowNotification(false)} className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors ${isLight ? 'hover:bg-black/5 text-zinc-400 hover:text-zinc-700' : 'hover:bg-white/10 text-white/30 hover:text-white/60'}`}>
                <X className="w-3 h-3" />
              </button>
            </div>
            <div className="p-4 flex gap-3 items-start">
              <div className={`w-10 h-10 rounded-full shrink-0 overflow-hidden ring-2 flex items-center justify-center ${isLight ? 'ring-[#7C5CFF]/15 bg-gradient-to-br from-[#7C5CFF]/10 to-[#D4567A]/10' : 'ring-[#7C5CFF]/20 bg-gradient-to-br from-[#7C5CFF]/20 to-[#D4567A]/20'}`}>
                {reservation.profile_photo_url ? (
                  <img src={reservation.profile_photo_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className={`text-sm font-bold ${isLight ? 'text-zinc-700' : 'text-white/70'}`}>{displayName[0].toUpperCase()}</span>
                )}
              </div>
              <div className="flex flex-col min-w-0">
                <span className={`text-sm font-bold truncate ${isLight ? 'text-zinc-900' : 'text-white/90'}`}>{displayName}</span>
                <p className={`text-[13px] mt-0.5 leading-relaxed ${isLight ? 'text-zinc-600' : 'text-white/50'}`}>{reservation.custom_status_message}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── MOBILE HEADER (Visible only on mobile/tablet) ── */}
      <div ref={heroRef} className="relative w-full h-[40vh] sm:h-[48vh] overflow-hidden block md:hidden">
        {/* Background Image */}
        <motion.div style={{ scale: heroScale }} className="absolute inset-0 w-full h-full">
          {reservation.profile_photo_url ? (
            <img src={reservation.profile_photo_url} alt={displayName} className="w-full h-full object-cover object-center" />
          ) : (
            <div className={`w-full h-full ${isLight ? 'bg-gradient-to-br from-[#f5f3f7] via-[#edeaf0] to-[#e4e0e8]' : 'bg-gradient-to-br from-[#1a0d2e] via-[#0d0d1a] to-[#0a0a0f]'}`} />
          )}
        </motion.div>

        {/* Backdrop Overlay */}
        <div className={`absolute inset-0 transition-colors duration-300 ${isLight ? 'bg-gradient-to-b from-black/15 via-transparent via-55% to-[#FAF9FD]' : 'bg-gradient-to-b from-black/35 via-transparent via-55% to-[#050508]'}`} />

        {/* Top Controls Bar (Mobile version) */}
        <div className="absolute top-5 left-0 right-0 px-5 z-30 flex items-center justify-between">
          <button 
            onClick={() => router.push('/')}
            className={`w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md transition-all active:scale-95 cursor-pointer shadow-lg ${isLight ? 'bg-white/75 hover:bg-white/90 border border-black/10 text-zinc-900' : 'bg-black/40 hover:bg-black/60 border border-white/10 text-white'}`}
          >
            <ArrowLeft className="w-4.5 h-4.5" />
          </button>

          {/* Artistant Wordmark Logo Badge */}
          <div className={`absolute left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-1 rounded-full backdrop-blur-md shadow-lg select-none ${isLight ? 'bg-white/80 border border-black/10' : 'bg-black/45 border border-white/10'}`}>
            <img src="/logo_wordmark_flat.png" alt="ArtisTant" className="h-[18px] w-auto object-contain dark:invert-0 invert" />
            <span className={`text-[9px] font-mono font-bold tracking-[0.2em] border-l pl-2 uppercase ${isLight ? 'text-zinc-500 border-black/15' : 'text-white/50 border-white/15'}`}>PORTFOLIO</span>
          </div>
        </div>

        {/* Bottom Hero Overlay details (Category, Name & Genres) */}
        <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-transparent to-transparent flex flex-col gap-2 z-20">
          <div className="text-left space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`px-3.5 py-1 rounded-full text-[10px] font-bold backdrop-blur-sm uppercase tracking-wider font-mono shadow-sm ${isLight ? 'text-zinc-800 bg-white/90 border border-black/10' : 'text-white/85 bg-black/45 border border-white/10'}`}>
                {categoryLabel}
              </span>
              {reservation.city && (
                <span className={`inline-flex items-center gap-1 px-3.5 py-1 rounded-full text-[10px] font-bold backdrop-blur-sm uppercase tracking-wider font-mono shadow-sm ${isLight ? 'text-zinc-800 bg-white/90 border border-black/10' : 'text-white/85 bg-black/45 border border-white/10'}`}>
                  <MapPin className="w-2.5 h-2.5 text-[#F25A2B]" /> {reservation.city}
                </span>
              )}
            </div>
            <div className="flex items-center justify-between gap-4">
              <h1 className={`text-4xl font-black leading-tight font-serif-display ${isLight ? 'text-zinc-950' : 'text-white'}`}>
                {displayName}
              </h1>
              <div className="flex items-center gap-3 shrink-0">
                <button 
                  onClick={() => setLiked(!liked)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md transition-all active:scale-95 cursor-pointer shadow-lg ${isLight ? 'bg-white/75 hover:bg-white/90 border border-black/10 text-zinc-900' : 'bg-black/40 hover:bg-black/60 border border-white/10 text-white'}`}
                >
                  <Heart className={`w-4.5 h-4.5 transition-colors ${liked ? 'fill-red-500 text-red-500' : isLight ? 'text-zinc-800' : 'text-white'}`} />
                </button>
                <button 
                  onClick={handleShare}
                  className={`w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md transition-all active:scale-95 cursor-pointer shadow-lg ${isLight ? 'bg-white/75 hover:bg-white/90 border border-black/10 text-zinc-900' : 'bg-black/40 hover:bg-black/60 border border-white/10 text-white'}`}
                >
                  <Share2 className="w-4.5 h-4.5" />
                </button>
              </div>
            </div>
            {genres.length > 0 && (
              <p className={`text-xs font-mono tracking-wider ${isLight ? 'text-zinc-600' : 'text-white/50'}`}>
                {genres.join(' · ')}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ── DESKTOP HEADER BAR (Visible only on desktop md and up) ── */}
      <div className="hidden md:flex max-w-5xl mx-auto px-8 py-6 items-center justify-between z-30 relative">
        <button 
          onClick={() => router.push('/')}
          className={`w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md transition-all active:scale-95 cursor-pointer ${isLight ? 'bg-white border border-black/10 text-zinc-900 shadow-sm hover:bg-zinc-50' : 'bg-white/[0.02] hover:bg-white/5 border border-white/10 text-white'}`}
        >
          <ArrowLeft className="w-4.5 h-4.5" />
        </button>

        {/* Desktop Artistant Logo Portfolio Badge */}
        <div className={`absolute left-1/2 -translate-x-1/2 flex items-center gap-3.5 px-5 py-2.5 rounded-full backdrop-blur-md shadow-lg select-none ${isLight ? 'bg-white border border-black/10' : 'bg-white/[0.02] border border-white/10'}`}>
          <img src="/logo_wordmark_flat.png" alt="ArtisTant" className="h-[22px] w-auto object-contain dark:invert-0 invert" />
          <span className={`text-[10px] font-mono font-bold tracking-[0.3em] border-l pl-3.5 uppercase ${isLight ? 'text-zinc-500 border-black/15' : 'text-white/50 border-white/15'}`}>PORTFOLIO</span>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => setLiked(!liked)}
            className={`w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md transition-all active:scale-95 cursor-pointer ${isLight ? 'bg-white border border-black/10 text-zinc-900 shadow-sm hover:bg-zinc-50' : 'bg-white/[0.02] hover:bg-white/5 border border-white/10 text-white'}`}
          >
            <Heart className={`w-4.5 h-4.5 transition-colors ${liked ? 'fill-red-500 text-red-500' : isLight ? 'text-zinc-800' : 'text-white'}`} />
          </button>
          <button 
            onClick={handleShare}
            className={`w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md transition-all active:scale-95 cursor-pointer ${isLight ? 'bg-white border border-black/10 text-zinc-900 shadow-sm hover:bg-zinc-50' : 'bg-white/[0.02] hover:bg-white/5 border border-white/10 text-white'}`}
          >
            <Share2 className="w-4.5 h-4.5" />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 max-w-4xl mx-auto px-5 md:px-8 py-8 space-y-12 pb-24">
        
        {/* ── DESKTOP SPLIT COLUMN VIEW (Only on desktop) ── */}
        <div className={`hidden md:flex gap-10 items-start border-b pb-10 ${isLight ? 'border-black/[0.06]' : 'border-white/[0.04]'}`}>
          {/* Left Column: Portrait Photo card */}
          <div className="w-[320px] shrink-0">
            <div className={`aspect-[3/4] w-full rounded-[2.5rem] overflow-hidden border relative shadow-md ${isLight ? 'border-black/10 bg-white shadow-[0_20px_50px_rgba(124,92,255,0.06)]' : 'border-white/10 bg-white/[0.01] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)]'}`}>
              {reservation.profile_photo_url ? (
                <img src={reservation.profile_photo_url} alt={displayName} className="w-full h-full object-cover object-center" />
              ) : (
                <div className={`w-full h-full flex items-center justify-center ${isLight ? 'bg-gradient-to-br from-[#f5f3f7] via-[#edeaf0] to-[#e4e0e8]' : 'bg-gradient-to-br from-[#1a0d2e] via-[#0d0d1a] to-[#0a0a0f]'}`}>
                  <span className={`text-4xl font-black ${isLight ? 'text-black/10' : 'text-white/10'}`}>{displayName[0].toUpperCase()}</span>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Bio, Connect links & Metadata */}
          <div className="flex-1 space-y-6 text-left">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`inline-block px-3.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider font-mono shadow-sm ${isLight ? 'text-zinc-800 bg-white border border-black/10' : 'text-white/80 bg-white/[0.04] border border-white/5'}`}>
                  {categoryLabel}
                </span>
                {reservation.city && (
                  <span className={`inline-flex items-center gap-1 px-3.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider font-mono shadow-sm ${isLight ? 'text-zinc-800 bg-white border border-black/10' : 'text-white/80 bg-white/[0.04] border border-white/5'}`}>
                    <MapPin className="w-2.5 h-2.5 text-[#F25A2B]" /> {reservation.city}
                  </span>
                )}
              </div>
              <h1 className={`text-5xl font-black leading-tight font-serif-display ${isLight ? 'text-zinc-900' : 'text-white'}`}>
                {displayName}
              </h1>
              {genres.length > 0 && (
                <p className={`text-xs font-mono tracking-wider ${isLight ? 'text-zinc-500' : 'text-white/40'}`}>
                  {genres.join(' · ')}
                </p>
              )}
            </div>

            {(reservation.bio || reservation.city || genres.length > 0) && (
              <div className="space-y-4 text-left">
                <h2 className={`text-[10px] font-mono font-bold uppercase tracking-widest ${isLight ? 'text-zinc-400' : 'text-white/30'}`}>About</h2>
                {reservation.bio && (
                  <p className={`text-sm leading-relaxed whitespace-pre-wrap ${isLight ? 'text-zinc-700' : 'text-white/60'}`}>{reservation.bio}</p>
                )}
                
                {/* Metadata Grid */}
                <div className="grid grid-cols-2 gap-3 pt-2 max-w-md">
                  {reservation.city && (
                    <div className={`p-4 rounded-2xl border transition-all ${isLight ? 'bg-white border-black/10 shadow-sm' : 'bg-white/[0.01] border-white/[0.03]'}`}>
                      <span className={`text-[9px] font-mono font-bold uppercase tracking-widest block ${isLight ? 'text-zinc-400' : 'text-white/30'}`}>Location</span>
                      <span className={`text-sm font-bold mt-1.5 block truncate flex items-center gap-1.5 ${isLight ? 'text-zinc-800' : 'text-white/80'}`}>
                        <MapPin className="w-3.5 h-3.5 text-[#F25A2B]" /> {reservation.city}
                      </span>
                    </div>
                  )}
                  <div className={`p-4 rounded-2xl border transition-all ${isLight ? 'bg-white border-black/10 shadow-sm' : 'bg-white/[0.01] border-white/[0.03]'}`}>
                    <span className={`text-[9px] font-mono font-bold uppercase tracking-widest block ${isLight ? 'text-zinc-400' : 'text-white/30'}`}>Type</span>
                    <span className={`text-sm font-bold mt-1.5 block truncate ${isLight ? 'text-zinc-800' : 'text-white/80'}`}>{categoryLabel}</span>
                  </div>
                  {genres.length > 0 && (
                    <div className={`col-span-2 p-4 rounded-2xl border transition-all ${isLight ? 'bg-white border-black/10 shadow-sm' : 'bg-white/[0.01] border-white/[0.03]'}`}>
                      <span className={`text-[9px] font-mono font-bold uppercase tracking-widest block ${isLight ? 'text-zinc-400' : 'text-white/30'}`}>Genres</span>
                      <span className={`text-sm font-bold mt-1.5 block whitespace-normal break-words ${isLight ? 'text-[#7C5CFF]' : 'text-[#c0b3ff]'}`}>{genres.join(', ')}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Connect Section (Desktop inline version) */}
            {(hasContact || hasSocials) && (
              <div className={`space-y-4 pt-4 border-t ${isLight ? 'border-black/[0.06]' : 'border-white/[0.04]'}`}>
                <h2 className={`text-[10px] font-mono font-bold uppercase tracking-widest ${isLight ? 'text-zinc-400' : 'text-white/30'}`}>Connect</h2>
                <div className="grid grid-cols-2 gap-3">
                  {hasContact && (
                    <div 
                      onClick={() => setIsContactOpen(true)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between min-h-[120px] shadow-sm ${isLight ? 'bg-white border-black/10 hover:border-[#7C5CFF]/30 hover:shadow-md' : 'bg-white/[0.01] border-white/[0.03] hover:bg-white/[0.02] hover:border-white/10'}`}
                    >
                      <div className="flex flex-col gap-1 text-left">
                        <span className={`text-[8px] font-mono font-bold uppercase tracking-wider ${isLight ? 'text-zinc-500' : 'text-white/35'}`}>Contact</span>
                        <span className={`text-xs font-bold ${isLight ? 'text-zinc-900' : 'text-white/90'}`}>Get in Touch</span>
                      </div>
                      <span className="text-[10px] font-bold text-[#7C5CFF] mt-2 block">Open Options &rsaquo;</span>
                    </div>
                  )}

                  {reservation.instagram_url && (
                    <a 
                      href={reservation.instagram_url} target="_blank" rel="noopener noreferrer"
                      className={`p-4 rounded-2xl border transition-all flex flex-col justify-between min-h-[120px] shadow-sm ${isLight ? 'bg-white border-black/10 hover:border-[#7C5CFF]/30 hover:shadow-md' : 'bg-white/[0.01] border-white/[0.03] hover:bg-white/[0.02] hover:border-white/10'}`}
                    >
                      <div className="flex flex-col gap-1 text-left">
                        <span className={`text-[8px] font-mono font-bold uppercase tracking-wider flex items-center gap-1 ${isLight ? 'text-zinc-500' : 'text-white/35'}`}>
                          <InstagramIcon className="w-3 h-3 text-[#E1306C]" /> Instagram
                        </span>
                        <span className={`text-xs font-bold truncate ${isLight ? 'text-zinc-900' : 'text-white/90'}`}>@{reservation.instagram_url.split('/').pop() || reservation.username}</span>
                      </div>
                      <span className={`text-[10px] font-bold mt-2 block ${isLight ? 'text-zinc-400' : 'text-white/40'}`}>View Page &rsaquo;</span>
                    </a>
                  )}

                  {reservation.spotify_url && (
                    <a 
                      href={reservation.spotify_url} target="_blank" rel="noopener noreferrer"
                      className={`p-4 rounded-2xl border transition-all flex flex-col justify-between min-h-[120px] shadow-sm ${isLight ? 'bg-white border-black/10 hover:border-[#7C5CFF]/30 hover:shadow-md' : 'bg-white/[0.01] border-white/[0.03] hover:bg-white/[0.02] hover:border-white/10'}`}
                    >
                      <div className="flex flex-col gap-1 text-left">
                        <span className={`text-[8px] font-mono font-bold uppercase tracking-wider flex items-center gap-1 ${isLight ? 'text-zinc-500' : 'text-white/35'}`}>
                          <SpotifyIcon className="w-3 h-3 text-[#1DB954]" /> Spotify
                        </span>
                        <span className={`text-xs font-bold ${isLight ? 'text-zinc-900' : 'text-white/90'}`}>Artist Profile</span>
                      </div>
                      <span className={`text-[10px] font-bold mt-2 block ${isLight ? 'text-zinc-400' : 'text-white/40'}`}>Open Spotify &rsaquo;</span>
                    </a>
                  )}

                  {reservation.youtube_channel_url && (
                    <a 
                      href={reservation.youtube_channel_url} target="_blank" rel="noopener noreferrer"
                      className={`p-4 rounded-2xl border transition-all flex flex-col justify-between min-h-[120px] shadow-sm ${isLight ? 'bg-white border-black/10 hover:border-[#7C5CFF]/30 hover:shadow-md' : 'bg-white/[0.01] border-white/[0.03] hover:bg-white/[0.02] hover:border-white/10'}`}
                    >
                      <div className="flex flex-col gap-1 text-left">
                        <span className={`text-[8px] font-mono font-bold uppercase tracking-wider flex items-center gap-1 ${isLight ? 'text-zinc-500' : 'text-white/35'}`}>
                          <YouTubeIcon className="w-3 h-3 text-[#FF0000]" /> YouTube
                        </span>
                        <span className={`text-xs font-bold ${isLight ? 'text-zinc-900' : 'text-white/90'}`}>Channel Page</span>
                      </div>
                      <span className={`text-[10px] font-bold mt-2 block ${isLight ? 'text-zinc-400' : 'text-white/40'}`}>Open YouTube &rsaquo;</span>
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── MOBILE-ONLY MAIN BLOCKS (Only on mobile/tablet) ── */}
        <div className="block md:hidden space-y-12">
          {renderFoundingCard(true)}

          {/* About Section */}
          {(reservation.bio || reservation.city || genres.length > 0) && (
            <section className="space-y-4 text-left">
              <h2 className={`text-2xl font-serif-display font-bold ${isLight ? 'text-zinc-900' : 'text-white/90'}`}>About</h2>
              {reservation.bio && (
                <p className={`text-sm md:text-base leading-relaxed whitespace-pre-wrap ${isLight ? 'text-zinc-700' : 'text-white/60'}`}>{reservation.bio}</p>
              )}
              
              {/* Metadata Grid */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                {reservation.city && (
                  <div className={`p-4 rounded-2xl border transition-all ${isLight ? 'bg-white border-black/10 shadow-sm' : 'bg-white/[0.01] border-white/[0.03]'}`}>
                    <span className={`text-[9px] font-mono font-bold uppercase tracking-widest block ${isLight ? 'text-zinc-400' : 'text-white/30'}`}>Location</span>
                    <span className={`text-sm font-bold mt-1.5 block truncate flex items-center gap-1.5 ${isLight ? 'text-zinc-800' : 'text-white/80'}`}>
                      <MapPin className="w-3.5 h-3.5 text-[#F25A2B]" /> {reservation.city}
                    </span>
                  </div>
                )}
                <div className={`p-4 rounded-2xl border transition-all ${isLight ? 'bg-white border-black/10 shadow-sm' : 'bg-white/[0.01] border-white/[0.03]'}`}>
                  <span className={`text-[9px] font-mono font-bold uppercase tracking-widest block ${isLight ? 'text-zinc-400' : 'text-white/30'}`}>Type</span>
                  <span className={`text-sm font-bold mt-1.5 block truncate ${isLight ? 'text-zinc-800' : 'text-white/80'}`}>{categoryLabel}</span>
                </div>
                {genres.length > 0 && (
                  <div className={`col-span-2 p-4 rounded-2xl border transition-all ${isLight ? 'bg-white border-black/10 shadow-sm' : 'bg-white/[0.01] border-white/[0.03]'}`}>
                    <span className={`text-[9px] font-mono font-bold uppercase tracking-widest block ${isLight ? 'text-zinc-400' : 'text-white/30'}`}>Genres</span>
                    <span className={`text-sm font-bold mt-1.5 block whitespace-normal break-words ${isLight ? 'text-[#7C5CFF]' : 'text-[#c0b3ff]'}`}>{genres.join(', ')}</span>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Connect Section (Mobile view card grid) */}
          {(hasContact || hasSocials) && (
            <section className={`space-y-4 text-left border-t pt-8 ${isLight ? 'border-black/[0.06]' : 'border-white/[0.04]'}`}>
              <h2 className={`text-2xl font-serif-display font-bold ${isLight ? 'text-zinc-900' : 'text-white/90'}`}>Connect</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Contact Card */}
                {hasContact && (
                  <div 
                    onClick={() => setIsContactOpen(true)}
                    className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between min-h-[140px] shadow-sm ${isLight ? 'bg-white border-black/10 hover:border-[#7C5CFF]/30 hover:shadow-md' : 'bg-white/[0.01] border-white/[0.03] hover:bg-white/[0.02] hover:border-white/10'}`}
                  >
                    <div className="flex flex-col gap-1.5 text-left">
                      <span className={`text-[9px] font-mono font-bold uppercase tracking-widest flex items-center gap-1.5 ${isLight ? 'text-zinc-500' : 'text-white/35'}`}>
                        <Mail className="w-3.5 h-3.5 text-[#7C5CFF]" /> Contact Artist
                      </span>
                      <span className={`text-sm font-bold mt-1 ${isLight ? 'text-zinc-900' : 'text-white/90'}`}>Get in Touch</span>
                      <p className={`text-[10px] mt-0.5 leading-relaxed ${isLight ? 'text-zinc-500' : 'text-white/40'}`}>Reach out via secure email, mobile phone, or WhatsApp.</p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsContactOpen(true);
                      }}
                      className={`mt-3 text-center py-2 px-4 rounded-xl font-bold text-xs active:scale-[0.98] transition-all max-w-[120px] cursor-pointer shadow-sm ${isLight ? 'bg-[#7C5CFF] text-white hover:bg-[#6838FF]' : 'bg-white text-black hover:bg-white/90'}`}
                    >
                      Open Details
                    </button>
                  </div>
                )}

                {/* Instagram Card */}
                {reservation.instagram_url && (
                  <div className={`p-5 rounded-2xl border flex flex-col gap-2 shadow-sm ${isLight ? 'bg-white border-black/10' : 'bg-white/[0.01] border-white/[0.03]'}`}>
                    <span className={`text-[9px] font-mono font-bold uppercase tracking-widest flex items-center gap-1.5 ${isLight ? 'text-zinc-500' : 'text-white/30'}`}>
                      <InstagramIcon className="w-3.5 h-3.5 text-[#E1306C]" /> Instagram
                    </span>
                    <span className={`text-sm font-bold truncate ${isLight ? 'text-zinc-900' : 'text-white/90'}`}>@{reservation.instagram_url.split('/').pop() || reservation.username}</span>
                    <a
                      href={reservation.instagram_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`mt-2 text-center py-2.5 rounded-xl font-bold text-xs active:scale-[1.02] transition-all max-w-[120px] ${isLight ? 'bg-zinc-50 border border-black/10 text-zinc-800 hover:bg-zinc-100' : 'bg-white/5 border border-white/10 text-white hover:bg-white/10'}`}
                    >
                      View Instagram
                    </a>
                  </div>
                )}

                {/* Spotify Card */}
                {reservation.spotify_url && (
                  <div className={`p-5 rounded-2xl border flex flex-col gap-2 shadow-sm ${isLight ? 'bg-white border-black/10' : 'bg-white/[0.01] border-white/[0.03]'}`}>
                    <span className={`text-[9px] font-mono font-bold uppercase tracking-widest flex items-center gap-1.5 ${isLight ? 'text-zinc-500' : 'text-white/30'}`}>
                      <SpotifyIcon className="w-3.5 h-3.5 text-[#1DB954]" /> Spotify
                    </span>
                    <span className={`text-sm font-bold truncate ${isLight ? 'text-zinc-900' : 'text-white/90'}`}>Artist Profile</span>
                    <a
                      href={reservation.spotify_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`mt-2 text-center py-2.5 rounded-xl font-bold text-xs active:scale-[1.02] transition-all max-w-[120px] ${isLight ? 'bg-zinc-50 border border-black/10 text-zinc-800 hover:bg-zinc-100' : 'bg-white/5 border border-white/10 text-white hover:bg-white/10'}`}
                    >
                      Open Spotify
                    </a>
                  </div>
                )}

                {/* YouTube Card */}
                {reservation.youtube_channel_url && (
                  <div className={`p-5 rounded-2xl border flex flex-col gap-2 shadow-sm ${isLight ? 'bg-white border-black/10' : 'bg-white/[0.01] border-white/[0.03]'}`}>
                    <span className={`text-[9px] font-mono font-bold uppercase tracking-widest flex items-center gap-1.5 ${isLight ? 'text-zinc-500' : 'text-white/35'}`}>
                      <YouTubeIcon className="w-3.5 h-3.5 text-[#FF0000]" /> YouTube
                    </span>
                    <span className={`text-sm font-bold truncate ${isLight ? 'text-zinc-900' : 'text-white/90'}`}>Channel Page</span>
                    <a
                      href={reservation.youtube_channel_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`mt-2 text-center py-2.5 rounded-xl font-bold text-xs active:scale-[1.02] transition-all max-w-[120px] ${isLight ? 'bg-zinc-50 border border-black/10 text-zinc-800 hover:bg-zinc-100' : 'bg-white/5 border border-white/10 text-white hover:bg-white/10'}`}
                    >
                      Open YouTube
                    </a>
                  </div>
                )}

              </div>
            </section>
          )}
        </div>

        {/* ── COMMON SECTIONS (Gig Gallery, Video, Founding card) ── */}
        
        {/* Dynamic Section Ordering */}
        {(reservation.section_order || ['gallery', 'video', 'audio']).map((section) => {
          
          // Gig Gallery Section (Render only if images uploaded!)
          if (section === 'gallery') {
            if (displayGallery.length === 0) return null;
            return (
              <motion.section
                key="gallery"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5 }}
                className="space-y-4 text-left"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center border shadow-sm ${isLight ? 'bg-white border-black/10' : 'bg-white/5 border border-white/10'}`}>
                    <span className="text-[#7C5CFF] font-bold text-xs font-mono">
                      <span className="inline md:hidden">{reservation.feature_founding_card ? '02' : '01'}</span>
                      <span className="hidden md:inline">01</span>
                    </span>
                  </div>
                  <div>
                    <h2 className={`text-lg font-bold tracking-tight ${isLight ? 'text-zinc-900' : 'text-white'}`}>Gig Gallery</h2>
                    <p className={`text-[10px] font-mono tracking-wider uppercase ${isLight ? 'text-zinc-400' : 'text-white/30'}`}>Live Gigs & Moments</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-4">
                  {displayGallery.map((img, i) => (
                    <motion.div
                      key={i}
                      whileHover={{ scale: 1.02, y: -4 }}
                      onClick={() => setLightboxImg(img.url)}
                      className={`aspect-square rounded-2xl overflow-hidden relative group border cursor-pointer shadow-sm ${isLight ? 'bg-white border-black/10' : 'bg-white/[0.01] border border-white/[0.05]'}`}
                    >
                      <img src={img.url} alt={img.caption} className={`w-full h-full object-cover transition-all duration-500 ${isLight ? 'opacity-95 group-hover:opacity-100' : 'opacity-70 group-hover:opacity-100'}`} />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                        <span className="text-[8px] font-mono tracking-widest text-[#B49FFF] uppercase mb-0.5">Gig Moment</span>
                        <p className="text-xs font-bold text-white truncate">{img.caption}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.section>
            );
          }

          // Featured Video Section (Render only if Youtube link uploaded!)
          if (section === 'video') {
            if (!youtubeId && !instagramVideoId && !reservation.youtube_url) return null;
            return (
              <motion.section
                key="video"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5 }}
                className="space-y-4 text-left"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center border shadow-sm ${isLight ? 'bg-white border-black/10' : 'bg-white/5 border border-white/10'}`}>
                    <span className="text-[#D4567A] font-bold text-xs font-mono">
                      <span className="inline md:hidden">{reservation.feature_founding_card ? '03' : '02'}</span>
                      <span className="hidden md:inline">02</span>
                    </span>
                  </div>
                  <div>
                    <h2 className={`text-lg font-bold tracking-tight ${isLight ? 'text-zinc-900' : 'text-white'}`}>Featured Showreel</h2>
                    <p className={`text-[10px] font-mono tracking-wider uppercase ${isLight ? 'text-zinc-400' : 'text-white/30'}`}>Performances & Showreel</p>
                  </div>
                </div>

                <div className={`w-full aspect-video rounded-3xl overflow-hidden relative border bg-black shadow-md ${isLight ? 'border-black/10 shadow-[0_15px_40px_rgba(124,92,255,0.06)]' : 'border-white/[0.06] shadow-[0_15px_50px_-15px_rgba(0,0,0,0.8)]'}`}>
                  {youtubeId ? (
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
                  ) : instagramVideoId ? (
                    <iframe
                      width="100%"
                      height="100%"
                      src={`https://www.instagram.com/p/${instagramVideoId}/embed`}
                      title="Instagram video player"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full"
                    />
                  ) : reservation.youtube_url ? (
                    <video
                      src={reservation.youtube_url}
                      controls
                      playsInline
                      className="w-full h-full object-cover"
                    />
                  ) : null}
                </div>
              </motion.section>
            );
          }

          return null;
        })}

        {/* Founding Status Section (Featured 3D Card) */}
        {renderFoundingCard(false)}

      </div>

      {/* Visit Artistant Call to Action Banner */}
      <div className="relative z-10 max-w-4xl mx-auto px-5 md:px-8 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className={`rounded-[2rem] p-[1.5px] ${isLight ? 'bg-gradient-to-r from-[rgba(124,92,255,0.12)] to-transparent' : 'bg-gradient-to-r from-[rgba(255,255,255,0.08)] to-transparent'}`}
        >
          <div className={`rounded-[1.9rem] p-8 md:p-10 backdrop-blur-xl border flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden shadow-sm ${isLight ? 'bg-white border-[#7C5CFF]/10 shadow-[0_20px_40px_rgba(124,92,255,0.06)]' : 'bg-[#0A0A10]/90 border-white/[0.03]'}`}>
            {/* Giant Background Watermark Logo A */}
            <img 
              src="/logo_a.png" 
              alt="" 
              className={`absolute -bottom-[20%] -left-[5%] h-[130%] w-auto max-w-none pointer-events-none z-0 select-none transition-all duration-300 ${isLight ? 'opacity-[0.05]' : 'opacity-[0.12]'}`}
            />

            <div className="absolute top-0 right-0 w-80 h-80 rounded-full opacity-10 pointer-events-none" style={{
              background: 'radial-gradient(circle, rgba(124,92,255,0.3) 0%, rgba(242,90,43,0.1) 50%, transparent 100%)',
              filter: 'blur(40px)',
            }} />
            <div className="space-y-2 text-center md:text-left z-10">
              <h3 className={`text-xl md:text-2xl font-display font-black leading-tight ${isLight ? 'text-zinc-900' : 'text-white'}`}>
                India&apos;s Live Economy,{' '}
                <span className="bg-gradient-to-r from-[#F25A2B] to-[#7C5CFF] bg-clip-text text-transparent inline-block">
                  Rebuilt
                </span>
              </h3>
              <p className={`text-xs max-w-md font-mono leading-relaxed ${isLight ? 'text-zinc-600' : 'text-white/50'}`}>
                Artistant is the booking, contract, and escrow infrastructure designed to empower independent live artists. Secure your handle today.
              </p>
            </div>
            <motion.a
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              href="/"
              className={`px-6 py-3 rounded-xl text-xs font-bold font-mono uppercase transition-all z-10 shrink-0 cursor-pointer shadow-md ${isLight ? 'bg-[#7C5CFF] text-white hover:bg-[#6838FF] shadow-[0_10px_20px_rgba(124,92,255,0.15)]' : 'bg-white text-black hover:bg-white/90 shadow-[0_10px_20px_rgba(255,255,255,0.05)]'}`}
            >
              Visit Artistant
            </motion.a>
          </div>
        </motion.div>
      </div>

      <footer className={`relative z-10 border-t py-8 ${isLight ? 'border-black/[0.06]' : 'border-white/[0.04]'}`}>
        <div className="max-w-4xl mx-auto px-5 md:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <a href="/" className="flex items-center gap-2.5 group">
            <img src="/logo_a.png" alt="" className={`w-5 h-5 transition-all duration-300 ${isLight ? 'opacity-70' : 'opacity-35'}`} />
            <span className={`text-xs ${isLight ? 'text-zinc-400' : 'text-white/25'}`}>
              Powered by <span className={`font-bold ${isLight ? 'text-zinc-600' : 'text-white/40'}`}>Artistant Portfolio</span>
            </span>
          </a>
          <span className={`text-[10px] font-mono ${isLight ? 'text-zinc-400' : 'text-white/15'}`}>@{reservation.username}</span>
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
                className={`absolute -top-12 right-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isLight ? 'bg-white/80 hover:bg-white/95 text-zinc-900 border border-black/10 shadow-sm animate-none' : 'bg-white/10 hover:bg-white/20 text-white'}`}
              >
                <X className="w-4 h-4" />
              </button>
              
              <img 
                src={lightboxImg} 
                alt="Enlarged stage photo" 
                className={`max-w-full max-h-[75vh] object-contain rounded-2xl border shadow-2xl ${isLight ? 'border-black/10' : 'border-white/10'}`} 
              />
              
              {displayGallery.find(img => img.url === lightboxImg)?.caption && (
                <span className="text-white/60 text-xs font-mono tracking-wider mt-4">
                  {displayGallery.find(img => img.url === lightboxImg)?.caption}
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
              className={`relative w-full max-w-sm rounded-3xl overflow-hidden p-6 z-10 border shadow-xl`}
              style={{
                background: isLight 
                  ? 'linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(245,242,255,0.98) 100%)'
                  : 'linear-gradient(135deg, rgba(10,10,14,0.96) 0%, rgba(18,14,28,0.96) 100%)',
                borderColor: isLight ? 'rgba(124,92,255,0.15)' : 'rgba(255,255,255,0.1)'
              }}
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className={`text-sm font-mono tracking-widest uppercase ${isLight ? 'text-zinc-500' : 'text-white/40'}`}>Contact Options</h3>
                <button
                  onClick={() => setIsContactOpen(false)}
                  className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors cursor-pointer ${isLight ? 'bg-black/5 hover:bg-black/10 text-zinc-500 hover:text-zinc-800' : 'bg-white/5 hover:bg-white/10 text-white/40 hover:text-white'}`}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3">
                {isEmailEnabled && (
                  <div className={`p-4 rounded-2xl border flex flex-col gap-2 text-left shadow-sm ${isLight ? 'bg-zinc-50/50 border-black/5' : 'bg-white/[0.02] border-white/[0.04]'}`}>
                    <span className={`text-[9px] font-mono font-bold uppercase tracking-widest flex items-center gap-1.5 ${isLight ? 'text-zinc-500' : 'text-white/30'}`}>
                      <Mail className="w-3.5 h-3.5 text-[#7C5CFF]" /> Email Address
                    </span>
                    <span className={`text-sm font-bold truncate ${isLight ? 'text-zinc-950' : 'text-white/90'}`}>{emailVal}</span>
                    <a
                      href={`mailto:${emailVal}`}
                      className={`mt-1 text-center py-2.5 rounded-xl font-bold text-xs hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer shadow-sm ${isLight ? 'bg-[#7C5CFF] text-white hover:bg-[#6838FF]' : 'bg-white text-black hover:bg-white/90'}`}
                    >
                      Send Mail
                    </a>
                  </div>
                )}

                {isPhoneEnabled && (
                  <div className={`p-4 rounded-2xl border flex flex-col gap-2 text-left shadow-sm ${isLight ? 'bg-zinc-50/50 border-black/5' : 'bg-white/[0.02] border-white/[0.04]'}`}>
                    <span className={`text-[9px] font-mono font-bold uppercase tracking-widest flex items-center gap-1.5 ${isLight ? 'text-zinc-500' : 'text-white/30'}`}>
                      <Phone className="w-3.5 h-3.5 text-[#F25A2B]" /> Mobile Number
                    </span>
                    <span className={`text-sm font-bold truncate ${isLight ? 'text-zinc-950' : 'text-white/90'}`}>{phoneVal}</span>
                    <div className="grid grid-cols-2 gap-2 mt-1">
                      <a
                        href={`tel:${phoneVal}`}
                        className={`text-center py-2.5 rounded-xl font-bold text-xs active:scale-95 transition-all cursor-pointer border ${isLight ? 'bg-white border-black/10 text-zinc-800 hover:bg-zinc-50' : 'bg-white/5 border border-white/10 text-white hover:bg-white/10'}`}
                      >
                        Call Mobile
                      </a>
                      <a
                        href={`https://wa.me/${phoneVal.replace(/\+/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-center py-2.5 rounded-xl bg-[#25D366] font-bold text-xs text-white hover:scale-[1.02] active:scale-95 transition-all cursor-pointer shadow-sm"
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
