'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, useMotionValueEvent } from 'motion/react';
import { useAuth } from '@/hooks/useAuth';
import { getUserReservation, getWaitlistPosition, getReferralCount, type WaitlistEntry } from '@/lib/waitlist';
import { getWaitlistDashboardDataAction, markStorySharedAction, type PublicLeaderboardEntry } from '@/lib/admin-actions';
import { 
  updateCustomStatusMessageAction, 
  uploadProfilePhotoAction, 
  updateSectionOrderAction, 
  updateContactSettingsAction, 
  updateProfileDetailsAction,
  updateFeatureFoundingCardAction
} from '@/lib/profile-actions';
import { signOut } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import Navbar from '@/components/Navbar';
import {
  Lock, LockKeyhole, Check, LogOut, CheckCircle, Copy, Sparkles, Award, Shield, Zap,
  Star, Calendar, Users, MessageSquare, TrendingUp, Gift, ChevronRight,
  ExternalLink, DownloadCloud, Smartphone, HelpCircle, Trophy, X, Camera, Mail
} from 'lucide-react';

/* ═══════════════════════════════════════════════════
   FEATURES LIST (Ecosystem Suite)
   ═══════════════════════════════════════════════════ */

const UPCOMING_FEATURES = [
  { image: '/mockups/screen_2.jpg', title: 'Portfolio Website', status: 'launch', desc: 'Your custom @username booking hub. A single link to house your media, riders, and contact info.' },
  { image: '/mockups/screen_12.jpg', title: 'Live Calendar', status: 'launch', desc: 'Automated availability management. Clients see open dates instantly.' },
  { image: '/mockups/screen_9.jpg', title: 'Direct Booking Engine', status: 'launch', desc: 'No agents, no broker cuts. 100% direct client-to-artist workflow.' },
  { image: '/mockups/screen_16.jpg', title: 'GigSafe Escrow', status: 'soon', desc: 'Zero ghosting. Secure payments where funds are held and auto-released post-gig.' },
  { image: '/mockups/screen_11.jpg', title: 'Verified Reviews', status: 'soon', desc: 'Escrow-verified review prompts sent to organizers to build your reputation.' },
];

const CINEMATIC_FEATURES = [
  { title: "GigSafe Escrow", desc: "Secure upfront payments & zero ghosting." },
  { title: "Artistant Backstage™", desc: "An internal industry network for performers." },
  { title: "Smart Tech Riders", desc: "Matches technical requirements to venue inventory." },
  { title: "Live Calendar Engine", desc: "Automated real-time availability." },
  { title: "Direct 1-on-1 Booking", desc: "No agents, no massive broker cuts." },
  { title: "Replacement Guarantee", desc: "Platform sources a verified replacement." },
  { title: "Verified Live Reviews", desc: "Data-backed, escrow-verified reputations." },
  { title: "NewBi Concierge", desc: "White-glove VIP booking management." },
  { title: "Artistant Exclusives", desc: "Curated premium gigs for top-tier artists." },
  { title: "Vendor & Venue Ecosystem", desc: "Connecting performers with trusted local crews." },
  { title: "One App. Both Sides.", desc: "For the artist. For the client." },
  { isLogo: true, desc: "The ultimate creative link-up." }
];

// Custom inline SVG icons for social media
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

const getInstagramHandle = (url: string) => {
  if (!url) return '';
  let clean = url.trim().split('?')[0].replace(/\/$/, '');
  if (clean.includes('instagram.com/')) {
    return clean.split('instagram.com/').pop() || '';
  }
  return clean;
};

const getSpotifyHandle = (url: string) => {
  if (!url) return '';
  let clean = url.trim().split('?')[0].replace(/\/$/, '');
  if (clean.includes('spotify.com/artist/')) {
    return clean.split('spotify.com/artist/').pop() || '';
  }
  return clean;
};

const getYoutubeHandle = (url: string) => {
  if (!url) return '';
  let clean = url.trim().split('?')[0].replace(/\/$/, '');
  if (clean.includes('youtube.com/@')) {
    return clean.split('youtube.com/@').pop() || '';
  }
  if (clean.includes('youtube.com/')) {
    const match = clean.match(/youtube\.com\/(?:c\/|user\/|channel\/)?@?([^/]+)/);
    if (match && match[1]) return match[1];
    return clean.split('youtube.com/').pop() || '';
  }
  return clean.startsWith('@') ? clean.slice(1) : clean;
};

const makeInstagramUrl = (input: string) => {
  const handle = getInstagramHandle(input);
  return handle ? `https://instagram.com/${handle}` : '';
};

const makeSpotifyUrl = (input: string) => {
  const handle = getSpotifyHandle(input);
  return handle ? `https://open.spotify.com/artist/${handle}` : '';
};

const makeYoutubeUrl = (input: string) => {
  const handle = getYoutubeHandle(input);
  return handle ? `https://youtube.com/@${handle}` : '';
};


const LinkedinIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

/* ═══════════════════════════════════════════════════
   SCROLL CONVERGENCE MOCKUP SHOWCASE
   ═══════════════════════════════════════════════════ */

function StaticModulesShowcase({ cohort }: { cohort: string }) {
  return (
    <div className="relative w-full py-20 bg-transparent overflow-hidden my-12 flex flex-col items-center">
      
      {/* Subtle grid background */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{
        backgroundImage: 'radial-gradient(circle, var(--ink) 1px, transparent 1px)',
        backgroundSize: '30px 30px'
      }} />

      {/* Title above */}
      <div className="text-center px-4 mb-16 relative z-30">
        <span className="font-mono text-[9px] text-[#7C5CFF] uppercase tracking-[0.25em] font-bold">Consolidated Ecosystem</span>
        <h2 className="font-display font-black text-2xl md:text-3xl text-ink uppercase tracking-tight mt-1">Unlocking Modules</h2>
        <p className="text-[10px] font-mono text-ink-2 mt-1.5 uppercase tracking-wider">All direct routing, calendars & safe escrow in one creative hub</p>
      </div>

      {/* Mockups Container */}
      <div className="relative w-full max-w-4xl h-[260px] sm:h-[360px] md:h-[450px] flex items-center justify-center scale-[0.55] sm:scale-80 md:scale-[0.9] lg:scale-100 transition-all z-10">
        
        {/* SCREEN 1: Far Left (Portfolio) */}
        <div 
          className="absolute w-[185px] aspect-[720/1565] rounded-[2.2rem] border-[4px] border-white/10 bg-[#050508] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.6)]"
          style={{ transform: 'translateX(-240px) translateY(70px) rotate(-24deg)', transformOrigin: 'bottom center', zIndex: 11 }}
        >
          <img src="/mockups/screen_2.jpg" alt="Portfolio" className="w-full h-full object-cover object-top opacity-85" />
        </div>

        {/* SCREEN 2: Mid Left (Calendar) */}
        <div 
          className="absolute w-[185px] aspect-[720/1565] rounded-[2.2rem] border-[4px] border-white/10 bg-[#050508] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.6)]"
          style={{ transform: 'translateX(-120px) translateY(30px) rotate(-12deg)', transformOrigin: 'bottom center', zIndex: 12 }}
        >
          <img src="/mockups/screen_12.jpg" alt="Calendar" className="w-full h-full object-cover object-top opacity-85" />
        </div>

        {/* SCREEN 3: Center (Booking) with wordmark logo overlay */}
        <div 
          className="absolute w-[185px] aspect-[720/1565] rounded-[2.2rem] border-[4px] border-white/15 bg-[#050508] overflow-hidden shadow-[0_25px_60px_rgba(0,0,0,0.7)]"
          style={{ transform: 'translateX(0px) translateY(0px) rotate(0deg)', transformOrigin: 'bottom center', zIndex: 30 }}
        >
          <img src="/mockups/screen_9.jpg" alt="Booking" className="w-full h-full object-cover object-top opacity-40" />
          {/* Logo overlay on the center screen */}
          <div className="absolute inset-0 bg-[#0A0A0E]/90 flex flex-col items-center justify-center p-5 z-20">
            <img src="/logo_wordmark.png" alt="Artistant" className="w-[125px] object-contain mb-3" />
            <p className="text-[9px] font-mono text-[#9BA4B8] uppercase tracking-widest text-center">STAGE VERIFIED</p>
            <span className="font-mono text-[8px] text-[#5C6680] mt-1">COHORT {cohort}</span>
          </div>
        </div>

        {/* SCREEN 4: Mid Right (Escrow) */}
        <div 
          className="absolute w-[185px] aspect-[720/1565] rounded-[2.2rem] border-[4px] border-white/10 bg-[#050508] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.6)]"
          style={{ transform: 'translateX(120px) translateY(30px) rotate(12deg)', transformOrigin: 'bottom center', zIndex: 14 }}
        >
          <img src="/mockups/screen_16.jpg" alt="Escrow" className="w-full h-full object-cover object-top opacity-85" />
        </div>

        {/* SCREEN 5: Far Right (Reviews) */}
        <div 
          className="absolute w-[185px] aspect-[720/1565] rounded-[2.2rem] border-[4px] border-white/10 bg-[#050508] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.6)]"
          style={{ transform: 'translateX(240px) translateY(70px) rotate(24deg)', transformOrigin: 'bottom center', zIndex: 15 }}
        >
          <img src="/mockups/screen_11.jpg" alt="Reviews" className="w-full h-full object-cover object-top opacity-85" />
        </div>

      </div>

      {/* Beta Dropping Soon Info Card */}
      <div className="mt-12 max-w-2xl mx-4 px-6 py-5 rounded-[2rem] bg-gradient-to-b from-[#7C5CFF]/10 to-transparent border border-[#7C5CFF]/20 text-center relative z-20 shadow-xl backdrop-blur-md">
        <span className="font-mono text-[9px] text-[#F25A2B] uppercase tracking-[0.2em] font-bold block mb-2">BETA DROPPING SOON</span>
        <h4 className="font-display font-black text-lg text-ink uppercase tracking-tight mb-2">
          Cohort 1 Early Beta Privilege
        </h4>
        <p className="text-xs text-ink-2 leading-relaxed">
          Artists qualifying for <strong className="text-ink text-[#7C5CFF]">Cohort 1</strong> will get exclusive Beta access before anyone else. This early entry allows you to start building your verified <strong className="text-ink">Bookability Score™</strong> ahead of the general public. A stronger Bookability Score directly boosts your visibility, translating to higher frequency of booking routing. Additionally, Cohort 1 artists will get their first gig platform fee waived!
        </p>
      </div>

    </div>
  );
}

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

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [reservation, setReservation] = useState<WaitlistEntry | null>(null);
  const [waitlistPos, setWaitlistPos] = useState<number | null>(null);
  const [textIndex, setTextIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [referrals, setReferrals] = useState<number>(0);
  const [copied, setCopied] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [activeStoryTemplate, setActiveStoryTemplate] = useState<number>(0);

  // Profile customization form states
  const [displayName, setDisplayName] = useState('');
  const [category, setCategory] = useState('');
  const [genres, setGenres] = useState<string[]>([]);
  const [city, setCity] = useState('');
  const [bio, setBio] = useState('');
  const [instagramUrl, setInstagramUrl] = useState('');
  const [spotifyUrl, setSpotifyUrl] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmailEnabled, setContactEmailEnabled] = useState(true);
  const [contactPhoneEnabled, setContactPhoneEnabled] = useState(false);
  const [sectionOrder, setSectionOrder] = useState<string[]>(['gallery', 'video', 'audio']);
  const [featureFoundingCard, setFeatureFoundingCard] = useState(false);
  const [newGenreInput, setNewGenreInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [activeInfo, setActiveInfo] = useState<string | null>(null);
  const [rawTextOpen, setRawTextOpen] = useState(false);
  const { resolvedTheme } = useTheme();
  const isLight = mounted && resolvedTheme === 'light';
  const [isHelpExpanded, setIsHelpExpanded] = useState(false);
  const [hasPoppedOut, setHasPoppedOut] = useState(false);
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isCustomizerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isCustomizerOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsCustomizerOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (hasPoppedOut) return;
      if (window.scrollY > 150) {
        setHasPoppedOut(true);
        setIsHelpExpanded(true);
        setTimeout(() => {
          setIsHelpExpanded(false);
        }, 3000);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasPoppedOut]);

  // 3D Card Hover Effect state
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [sheenX, setSheenX] = useState(50);
  const [sheenY, setSheenY] = useState(50);

  // Points & Cohort system (Dynamic)
  const [verifiedReferrals, setVerifiedReferrals] = useState<number>(0);

  const handleCopyProfileLink = () => {
    if (!reservation) return;
    const link = `https://artistant.in/${reservation.username}`;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(link).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };
  const [unverifiedReferrals, setUnverifiedReferrals] = useState<number>(0);
  const [points, setPoints] = useState<number>(100);
  const [cohortVal, setCohortVal] = useState<string>('003');
  const [storyShared, setStoryShared] = useState<boolean>(false);
  const [leaderboard, setLeaderboard] = useState<PublicLeaderboardEntry[]>([]);
  const [foundingArtists, setFoundingArtists] = useState<PublicLeaderboardEntry[]>([]);
  const [totalArtistsCount, setTotalArtistsCount] = useState<number>(0);
  const [foundingLimit, setFoundingLimit] = useState<number>(50);

  const targetPoints = 250;
  const isCohort1 = cohortVal === '001';
  // Progress is relative to 500 PTS (Founding Artist Tier)
  const progressPercentage = Math.min(100, ((points - 100) / (500 - 100)) * 100);
  const referralsNeeded = Math.max(0, Math.ceil((500 - points) / 50));
  const cohort = cohortVal;

  // ── Cinematic Bottom Ticker Timer ──
  useEffect(() => {
    const interval = setInterval(() => {
      setTextIndex((prev) => (prev + 1) % CINEMATIC_FEATURES.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // ── Legacy Fallback Loader ──
  const loadLegacyFallback = async (uid: string, entry: WaitlistEntry) => {
    try {
      const rawRefs = await getReferralCount(entry.username);
      setVerifiedReferrals(rawRefs); // Treat all as verified in fallback
      const pos = await getWaitlistPosition(entry.reserved_at, uid, entry.position_override);
      setWaitlistPos(pos);
      setCohortVal(pos ? Math.ceil(pos / 100).toString().padStart(3, '0') : '003');
      const dbStoryShared = entry.story_shared === true;
      setStoryShared(dbStoryShared);
      setPoints(100 + rawRefs * 50 + (dbStoryShared ? 80 : 0));
    } catch (err) {
      console.error("Fallback load failed:", err);
    }
  };

  // ── Dashboard Data Loader ──
  const loadDashboardData = async (entry: WaitlistEntry) => {
    try {
      const idToken = await user!.getIdToken();
      const data = await getWaitlistDashboardDataAction(idToken);
      setLeaderboard(data.leaderboard);
      setFoundingArtists(data.foundingArtists);
      setTotalArtistsCount(data.totalArtistsCount);
      setFoundingLimit(data.foundingLimit);
      
      if (data.currentUserStats) {
        setVerifiedReferrals(data.currentUserStats.verifiedReferrals);
        setUnverifiedReferrals(data.currentUserStats.unverifiedReferrals);
        setPoints(data.currentUserStats.points);
        setWaitlistPos(data.currentUserStats.rank);
        setCohortVal(data.currentUserStats.cohort);
        
        let dbStoryShared = data.currentUserStats.storyShared;
        setStoryShared(dbStoryShared);
      } else {
        await loadLegacyFallback(user!.uid, entry);
      }
    } catch (e) {
      console.error("Error loading dashboard data, using legacy fallback:", e);
      await loadLegacyFallback(user!.uid, entry);
    }
  };

  // ── Auth + Data fetch ──
  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.push('/?auth=true'); return; }

    getUserReservation(user.uid)
      .then(async (res) => {
        if (!res) { router.push('/'); return; }
        setReservation(res);
        setDisplayName(res.display_name || '');
        setCategory(res.category || '');
        setGenres(res.genres || []);
        setCity(res.city || '');
        setBio(res.bio || '');
        setInstagramUrl(res.instagram_url || '');
        setSpotifyUrl(res.spotify_url || '');
        setYoutubeUrl(res.youtube_url || '');
        setContactEmail(res.email || '');
        setContactPhone(res.phone || '');
        setContactEmailEnabled(res.contact_email_enabled !== false);
        setContactPhoneEnabled(res.contact_phone_enabled === true);
        setSectionOrder(res.section_order || ['gallery', 'video', 'audio']);
        setFeatureFoundingCard(res.feature_founding_card === true);
        await loadDashboardData(res);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [user, authLoading, router]);

  // Helper to trigger story sharing completion
  const handleCompleteStoryTask = async () => {
    if (!user || !reservation) return;
    try {
      const idToken = await user.getIdToken();
      await markStorySharedAction(idToken);
    } catch (e) {
      console.warn("Failed to mark story shared in DB:", e);
    }
    setStoryShared(true);
    await loadDashboardData(reservation);
    showToast("Story shared: +80 PTS added!");
  };



  const moveSection = async (index: number, direction: 'up' | 'down') => {
    const newOrder = [...sectionOrder];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newOrder.length) return;
    
    // Swap
    const temp = newOrder[index];
    newOrder[index] = newOrder[targetIndex];
    newOrder[targetIndex] = temp;
    
    setSectionOrder(newOrder);
    
    if (user) {
      try {
        const idToken = await user.getIdToken();
        await updateSectionOrderAction(idToken, newOrder);
        showToast("Section order updated!");
      } catch (err) {
        console.error(err);
        showToast("Failed to save section order");
      }
    }
  };

  const handleSaveContactSettings = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      const idToken = await user.getIdToken();
      await updateContactSettingsAction(idToken, {
        email: contactEmail,
        phone: contactPhone,
        contact_email_enabled: contactEmailEnabled,
        contact_phone_enabled: contactPhoneEnabled,
      });
      showToast("Contact settings updated!");
      if (reservation) {
        setReservation({
          ...reservation,
          email: contactEmail,
          phone: contactPhone,
          contact_email_enabled: contactEmailEnabled,
          contact_phone_enabled: contactPhoneEnabled,
        });
      }
    } catch (err: any) {
      showToast(err.message || "Failed to update contact settings");
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleFeatureFoundingCard = async (val: boolean) => {
    if (!user) return;
    setFeatureFoundingCard(val);
    try {
      const idToken = await user.getIdToken();
      await updateFeatureFoundingCardAction(idToken, val);
      showToast(val ? "Founding Card featured on portfolio!" : "Founding Card hidden from portfolio!");
      if (reservation) {
        setReservation({
          ...reservation,
          feature_founding_card: val,
        });
      }
    } catch (err: any) {
      console.error(err);
      showToast("Migration required! Run supabase_migration_feature_founding_card.sql in Supabase SQL editor.");
      setFeatureFoundingCard(!val);
    }
  };

  const handleSaveProfileDetails = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      const idToken = await user.getIdToken();
      await updateProfileDetailsAction(idToken, {
        display_name: displayName,
        category: category,
        genres: genres,
        city: city,
        bio: bio,
        instagram_url: instagramUrl,
        spotify_url: spotifyUrl,
        youtube_url: youtubeUrl,
      });
      showToast("Profile details updated!");
      if (reservation) {
        setReservation({
          ...reservation,
          display_name: displayName,
          category: category as any,
          genres: genres,
          city: city,
          bio: bio,
          instagram_url: instagramUrl,
          spotify_url: spotifyUrl,
          youtube_url: youtubeUrl,
        });
      }
    } catch (err: any) {
      showToast(err.message || "Failed to save profile details");
    } finally {
      setIsSaving(false);
    }
  };

  // ── Helpers ──
  const showToast = (msg: string) => { setToastMessage(msg); setTimeout(() => setToastMessage(null), 3000); };

  const copyReferralLink = () => {
    if (!reservation) return;
    navigator.clipboard.writeText(`https://artistant.in/?ref=${reservation.username}`).then(() => {
      setCopied(true);
      showToast('Referral link copied!');
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleSignOut = async () => { try { await signOut(); router.push('/'); } catch {} };



  // ── 3D Card tilt logic ──
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const xc = rect.width / 2;
    const yc = rect.height / 2;
    setRotateX((yc - y) / 10);
    setRotateY((x - xc) / 10);
    setSheenX((x / rect.width) * 100);
    setSheenY((y / rect.height) * 100);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
    setSheenX(50);
    setSheenY(50);
  };

  /* ═══════════════════════════════════════════════════
     STORY GENERATOR CANVAS RENDERING
     ═══════════════════════════════════════════════════ */

  const handleShareStory = async (platform: 'whatsapp' | 'instagram' | 'x', templateId: number = activeStoryTemplate) => {
    if (!reservation) return;
    showToast("Preparing your founding pass...");
    
    try {
      // Preload the official wordmark logo image
      const logoImg = new Image();
      logoImg.src = '/logo_wordmark.png';
      await new Promise((resolve) => {
        logoImg.onload = resolve;
        logoImg.onerror = resolve;
      });

      const canvas = document.createElement('canvas');
      canvas.width = 1080;
      canvas.height = 1920;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error("Could not get 2d context");

      // ── Helper: rounded rect fill ──
      const fillRoundRect = (x: number, y: number, w: number, h: number, r: number, style: string | CanvasGradient) => {
        ctx.fillStyle = style;
        ctx.beginPath();
        ctx.roundRect(x, y, w, h, r);
        ctx.fill();
      };

      // ── Helper: rounded rect stroke ──
      const strokeRoundRect = (x: number, y: number, w: number, h: number, r: number, style: string, lw: number) => {
        ctx.strokeStyle = style;
        ctx.lineWidth = lw;
        ctx.beginPath();
        ctx.roundRect(x, y, w, h, r);
        ctx.stroke();
      };

      // ── Helper: draw the Artistant wordmark logo image ──
      const drawLogo = (cx: number, y: number, width: number, invertColor: boolean) => {
        if (!logoImg.complete || logoImg.naturalWidth === 0) return;
        ctx.save();
        if (invertColor) {
          ctx.filter = 'invert(1)';
        }
        const aspect = logoImg.naturalHeight / logoImg.naturalWidth;
        const height = width * aspect;
        ctx.drawImage(logoImg, cx - width / 2, y, width, height);
        ctx.restore();
      };

      // ── Helper: draw the pass card (flat, clean, no skew) ──
      const drawPassCard = (x: number, y: number, w: number, h: number, cardBg: string | CanvasGradient, borderColor: string, textColor: string, accentColor: string) => {
        ctx.save();
        // Card background
        fillRoundRect(x, y, w, h, 32, cardBg);
        strokeRoundRect(x, y, w, h, 32, borderColor, 2);

        // Top label row
        ctx.font = 'bold 20px monospace';
        ctx.fillStyle = accentColor;
        ctx.textAlign = 'left';
        ctx.fillText('FOUNDING CARD', x + 40, y + 52);
        ctx.textAlign = 'right';
        ctx.fillStyle = textColor;
        ctx.globalAlpha = 0.5;
        ctx.fillText('FOUNDING ARTIST', x + w - 40, y + 52);
        ctx.globalAlpha = 1;

        // Divider line
        ctx.strokeStyle = borderColor;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x + 40, y + 72);
        ctx.lineTo(x + w - 40, y + 72);
        ctx.stroke();

        // Center: Position number
        ctx.textAlign = 'center';
        ctx.fillStyle = textColor;
        ctx.font = `900 96px "Space Grotesk", sans-serif`;
        ctx.fillText(`#${waitlistPos || '---'}`, x + w / 2, y + h / 2 + 12);
        ctx.font = 'bold 16px monospace';
        ctx.fillStyle = textColor;
        ctx.globalAlpha = 0.35;
        ctx.fillText('WAITLIST POSITION', x + w / 2, y + h / 2 + 48);
        ctx.globalAlpha = 1;

        // Bottom row
        ctx.textAlign = 'left';
        ctx.fillStyle = textColor;
        ctx.font = `bold 30px "Space Grotesk", sans-serif`;
        ctx.fillText(`@${reservation.username}`, x + 40, y + h - 48);
        ctx.font = 'bold 14px monospace';
        ctx.fillStyle = textColor;
        ctx.globalAlpha = 0.3;
        ctx.fillText('VERIFIED ARTIST', x + 40, y + h - 22);
        ctx.globalAlpha = 1;

        // Bottom-right: barcode placeholder
        ctx.textAlign = 'right';
        ctx.fillStyle = accentColor;
        ctx.globalAlpha = 0.2;
        ctx.font = 'bold 20px monospace';
        ctx.fillText('||||| | |||| | |||', x + w - 40, y + h - 30);
        ctx.globalAlpha = 1;

        ctx.restore();
      };

      // ── Helper: draw feature list ──
      const drawFeatures = (cx: number, startY: number, features: string[], color: string, checkColor: string) => {
        ctx.textAlign = 'center';
        features.forEach((feat, idx) => {
          ctx.font = 'bold 26px monospace';
          ctx.fillStyle = checkColor;
          const text = `✓  ${feat}`;
          ctx.fillStyle = color;
          ctx.fillText(text, cx, startY + idx * 60);
        });
      };

      // ═════════════════════════════════════════
      // TEMPLATE 0: DARK NOIR
      // ═════════════════════════════════════════
      if (templateId === 0) {
        // Base
        const bg = ctx.createLinearGradient(0, 0, 0, 1920);
        bg.addColorStop(0, '#0A0A10');
        bg.addColorStop(1, '#04040A');
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, 1080, 1920);

        // Subtle radial glow behind card
        const glow = ctx.createRadialGradient(540, 680, 0, 540, 680, 600);
        glow.addColorStop(0, 'rgba(242, 90, 43, 0.08)');
        glow.addColorStop(0.5, 'rgba(124, 92, 255, 0.04)');
        glow.addColorStop(1, 'transparent');
        ctx.fillStyle = glow;
        ctx.fillRect(0, 0, 1080, 1920);

        // Fine grid lines
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.012)';
        ctx.lineWidth = 1;
        for (let i = 0; i < 1080; i += 90) {
          ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, 1920); ctx.stroke();
        }
        for (let i = 0; i < 1920; i += 90) {
          ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(1080, i); ctx.stroke();
        }

        // Logo
        drawLogo(540, 95, 460, false);
        ctx.textAlign = 'center';
        ctx.font = 'bold 14px monospace';
        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        ctx.fillText('FOUNDING MEMBER PASSPORT', 540, 240);

        // Card
        const cardGrad = ctx.createLinearGradient(100, 350, 980, 750);
        cardGrad.addColorStop(0, 'rgba(255,255,255,0.03)');
        cardGrad.addColorStop(1, 'rgba(255,255,255,0.01)');
        drawPassCard(100, 340, 880, 380, cardGrad, 'rgba(255,255,255,0.08)', '#FFFFFF', '#F25A2B');

        // Headline
        ctx.textAlign = 'center';
        ctx.fillStyle = '#FFFFFF';
        ctx.font = `900 56px "Space Grotesk", sans-serif`;
        ctx.fillText('I CHOSE ZERO', 540, 920);
        ctx.fillText('MIDDLEMEN.', 540, 990);

        // Accent subtitle
        ctx.font = 'bold 22px monospace';
        const accentGrad = ctx.createLinearGradient(300, 0, 780, 0);
        accentGrad.addColorStop(0, '#F25A2B');
        accentGrad.addColorStop(1, '#7C5CFF');
        ctx.fillStyle = accentGrad;
        ctx.fillText('DIRECT BOOKING ECOSYSTEM', 540, 1060);

        // Divider
        const divGrad = ctx.createLinearGradient(240, 0, 840, 0);
        divGrad.addColorStop(0, 'transparent');
        divGrad.addColorStop(0.3, 'rgba(255,255,255,0.1)');
        divGrad.addColorStop(0.7, 'rgba(255,255,255,0.1)');
        divGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = divGrad;
        ctx.fillRect(240, 1110, 600, 1);

        // Features
        drawFeatures(540, 1200, [
          'DIRECT CLIENT-TO-ARTIST ROUTING',
          'GIGSAFE ESCROW PAYMENT SECURITY',
          'AUTO-SYNCED AVAILABILITY BOOKING'
        ], 'rgba(255,255,255,0.5)', '#F25A2B');

        // CTA box
        fillRoundRect(240, 1440, 600, 90, 20, 'rgba(255,255,255,0.04)');
        strokeRoundRect(240, 1440, 600, 90, 20, 'rgba(255,255,255,0.08)', 1);
        ctx.textAlign = 'center';
        ctx.font = `bold 18px monospace`;
        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        ctx.fillText('SECURE YOUR NAME BEFORE SOMEONE ELSE DOES', 540, 1495);

        // Bottom branding
        ctx.fillStyle = 'rgba(255,255,255,0.15)';
        ctx.font = 'bold 16px monospace';
        ctx.fillText('ARTISTANT.IN', 540, 1780);

      // ═════════════════════════════════════════
      // TEMPLATE 1: GRADIENT EDITORIAL
      // ═════════════════════════════════════════
      } else if (templateId === 1) {
        // Gradient background
        const bg = ctx.createLinearGradient(0, 0, 1080, 1920);
        bg.addColorStop(0, '#7C5CFF');
        bg.addColorStop(0.4, '#D4567A');
        bg.addColorStop(1, '#F25A2B');
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, 1080, 1920);

        // Dark overlay for depth
        const overlay = ctx.createLinearGradient(0, 0, 0, 1920);
        overlay.addColorStop(0, 'rgba(0,0,0,0.25)');
        overlay.addColorStop(0.5, 'rgba(0,0,0,0.1)');
        overlay.addColorStop(1, 'rgba(0,0,0,0.35)');
        ctx.fillStyle = overlay;
        ctx.fillRect(0, 0, 1080, 1920);

        // Logo
        drawLogo(540, 95, 460, false);
        ctx.textAlign = 'center';
        ctx.font = 'bold 14px monospace';
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.fillText('FOUNDING MEMBER PASSPORT', 540, 240);

        // Card (dark glass)
        const cardBg = ctx.createLinearGradient(100, 340, 980, 720);
        cardBg.addColorStop(0, 'rgba(10,10,15,0.8)');
        cardBg.addColorStop(1, 'rgba(5,5,8,0.9)');
        drawPassCard(100, 340, 880, 380, cardBg, 'rgba(255,255,255,0.12)', '#FFFFFF', '#F25A2B');

        // Headline
        ctx.textAlign = 'center';
        ctx.fillStyle = '#FFFFFF';
        ctx.font = `900 60px "Space Grotesk", sans-serif`;
        ctx.fillText('BUILT FOR STAGE.', 540, 930);
        ctx.fillText('ARTIST FIRST.', 540, 1005);

        ctx.font = 'bold 22px monospace';
        ctx.fillStyle = 'rgba(255,255,255,0.65)';
        ctx.fillText('RECLAIMING CREATIVE VALUE', 540, 1075);

        // Divider
        ctx.fillStyle = 'rgba(255,255,255,0.15)';
        ctx.fillRect(340, 1120, 400, 1);

        // Features
        drawFeatures(540, 1210, [
          'DIRECT CLIENT BOOKINGS',
          'GIGSAFE ESCROW GUARANTEES',
          'CUSTOM PORTFOLIO @HANDLE'
        ], 'rgba(255,255,255,0.6)', '#FFFFFF');

        // CTA box
        fillRoundRect(240, 1440, 600, 90, 20, 'rgba(0,0,0,0.2)');
        strokeRoundRect(240, 1440, 600, 90, 20, 'rgba(255,255,255,0.15)', 1);
        ctx.textAlign = 'center';
        ctx.font = `bold 18px monospace`;
        ctx.fillStyle = 'rgba(255,255,255,0.6)';
        ctx.fillText('CLAIM YOUR @HANDLE NOW', 540, 1495);

        // Bottom branding
        ctx.fillStyle = 'rgba(255,255,255,0.25)';
        ctx.font = 'bold 16px monospace';
        ctx.fillText('ARTISTANT.IN', 540, 1780);

      // ═════════════════════════════════════════
      // TEMPLATE 2: CLEAN LIGHT MINIMAL
      // ═════════════════════════════════════════
      } else if (templateId === 2) {
        // White background
        ctx.fillStyle = '#FAFAFA';
        ctx.fillRect(0, 0, 1080, 1920);

        // Subtle dot grid pattern
        ctx.fillStyle = 'rgba(124, 92, 255, 0.06)';
        for (let x = 60; x < 1080; x += 40) {
          for (let y = 60; y < 1920; y += 40) {
            ctx.beginPath();
            ctx.arc(x, y, 1.2, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        // Logo
        drawLogo(540, 95, 460, true);
        ctx.textAlign = 'center';
        ctx.font = 'bold 14px monospace';
        ctx.fillStyle = 'rgba(15,15,20,0.35)';
        ctx.fillText('FOUNDING MEMBER PASSPORT', 540, 240);

        // Card (light glass)
        drawPassCard(100, 340, 880, 380, '#FFFFFF', 'rgba(124, 92, 255, 0.12)', '#0F0F14', '#7C5CFF');

        // Outer card shadow
        ctx.save();
        ctx.shadowColor = 'rgba(124, 92, 255, 0.08)';
        ctx.shadowBlur = 40;
        ctx.shadowOffsetY = 12;
        fillRoundRect(100, 340, 880, 380, 32, '#FFFFFF');
        ctx.restore();
        // Redraw the card cleanly on top of shadow
        drawPassCard(100, 340, 880, 380, '#FFFFFF', 'rgba(124, 92, 255, 0.12)', '#0F0F14', '#7C5CFF');

        // Headline
        ctx.textAlign = 'center';
        ctx.fillStyle = '#0F0F14';
        ctx.font = `900 56px "Space Grotesk", sans-serif`;
        ctx.fillText('BUILT FOR ARTISTS.', 540, 930);
        ctx.fillText('NOT PLATFORMS.', 540, 1000);

        ctx.font = 'bold 22px monospace';
        ctx.fillStyle = '#7C5CFF';
        ctx.fillText(`COHORT ${cohort} · FOUNDING ARTIST`, 540, 1070);

        // Divider
        const divGrad2 = ctx.createLinearGradient(240, 0, 840, 0);
        divGrad2.addColorStop(0, 'transparent');
        divGrad2.addColorStop(0.3, 'rgba(124,92,255,0.15)');
        divGrad2.addColorStop(0.7, 'rgba(124,92,255,0.15)');
        divGrad2.addColorStop(1, 'transparent');
        ctx.fillStyle = divGrad2;
        ctx.fillRect(240, 1120, 600, 1);

        // Features
        drawFeatures(540, 1210, [
          'DIRECT GIG BOOKING SYSTEM',
          'ESCROW PAYMENT INFRASTRUCTURE',
          'VERIFIED AVAILABILITY SYNC'
        ], '#7C5CFF', '#7C5CFF');

        // CTA box
        fillRoundRect(240, 1440, 600, 90, 20, 'rgba(124, 92, 255, 0.05)');
        strokeRoundRect(240, 1440, 600, 90, 20, 'rgba(124, 92, 255, 0.12)', 1);
        ctx.textAlign = 'center';
        ctx.font = `bold 18px monospace`;
        ctx.fillStyle = 'rgba(15,15,20,0.4)';
        ctx.fillText('SECURE YOUR NAME BEFORE IT\'S TAKEN', 540, 1495);

        // Bottom branding
        ctx.fillStyle = '#7C5CFF';
        ctx.globalAlpha = 0.35;
        ctx.font = 'bold 16px monospace';
        ctx.fillText('ARTISTANT.IN', 540, 1780);
        ctx.globalAlpha = 1;

      // ═════════════════════════════════════════
      // TEMPLATE 3: LIVE ECONOMY
      // ═════════════════════════════════════════
      } else {
        // Slate dark background
        const bg = ctx.createLinearGradient(0, 0, 0, 1920);
        bg.addColorStop(0, '#0F172A');
        bg.addColorStop(1, '#020617');
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, 1080, 1920);

        // Subtle gradient glow in the center
        const glow = ctx.createRadialGradient(540, 680, 0, 540, 680, 600);
        glow.addColorStop(0, 'rgba(124, 92, 255, 0.12)');
        glow.addColorStop(0.5, 'rgba(242, 90, 43, 0.04)');
        glow.addColorStop(1, 'transparent');
        ctx.fillStyle = glow;
        ctx.fillRect(0, 0, 1080, 1920);

        // Diagonal light grid lines
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.015)';
        ctx.lineWidth = 1;
        for (let i = 0; i < 1080; i += 60) {
          ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, 1920); ctx.stroke();
        }
        for (let i = 0; i < 1920; i += 60) {
          ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(1080, i); ctx.stroke();
        }

        // Logo
        drawLogo(540, 95, 460, false);
        ctx.textAlign = 'center';
        ctx.font = 'bold 14px monospace';
        ctx.fillStyle = 'rgba(255,255,255,0.35)';
        ctx.fillText('FOUNDING MEMBER PASSPORT', 540, 240);

        // Card (dark semi-transparent)
        const cardBg = ctx.createLinearGradient(100, 340, 980, 720);
        cardBg.addColorStop(0, 'rgba(255,255,255,0.04)');
        cardBg.addColorStop(1, 'rgba(255,255,255,0.01)');
        drawPassCard(100, 340, 880, 380, cardBg, 'rgba(255,255,255,0.1)', '#FFFFFF', '#F25A2B');

        // Headline
        ctx.textAlign = 'center';
        ctx.fillStyle = '#FFFFFF';
        ctx.font = `900 56px "Space Grotesk", sans-serif`;
        ctx.fillText('I AM ON ARTISTANT.', 540, 920);
        
        ctx.font = `900 50px "Space Grotesk", sans-serif`;
        ctx.fillStyle = 'rgba(255,255,255,0.85)';
        ctx.fillText("THEY ARE REBUILDING INDIA'S", 540, 990);
        ctx.fillText('LIVE ECONOMY.', 540, 1055);

        // Divider
        ctx.fillStyle = 'rgba(255,255,255,0.12)';
        ctx.fillRect(240, 1120, 600, 1);

        // Features or details
        drawFeatures(540, 1210, [
          'DIRECT ARTIST-TO-CLIENT CONNECTIONS',
          'SECURE ESCROW INFRASTRUCTURE',
          `PROFILE: ARTISTANT.IN/${reservation.username.toUpperCase()}`
        ], 'rgba(255,255,255,0.65)', '#7C5CFF');

        // CTA box with the profile link
        fillRoundRect(180, 1440, 720, 90, 20, 'rgba(124, 92, 255, 0.08)');
        strokeRoundRect(180, 1440, 720, 90, 20, 'rgba(124, 92, 255, 0.2)', 1);
        ctx.textAlign = 'center';
        ctx.font = `bold 18px monospace`;
        ctx.fillStyle = '#A391FF';
        ctx.fillText(`GO CHECK MY PROFILE OUT ON ARTISTANT.IN/${reservation.username.toUpperCase()}`, 540, 1495);

        // Bottom branding
        ctx.fillStyle = 'rgba(255,255,255,0.25)';
        ctx.font = 'bold 16px monospace';
        ctx.fillText('ARTISTANT.IN', 540, 1780);
      }

      // 2. Share / Download Flow (Only creative, no text)
      canvas.toBlob(async (blob) => {
        if (!blob) throw new Error("Blob generation failed");

        const file = new File([blob], `Artistant_Pass_${reservation.username}.png`, { type: 'image/png' });
        
        // Attempt Native Web Share first (supported by iOS/Android Chrome/Safari)
        if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
          try {
            await navigator.share({
              files: [file]
            });
            showToast("Founding Pass shared successfully!");
            await handleCompleteStoryTask();
            return;
          } catch (err) {
            console.log("Web Share cancelled/failed, falling back to download:", err);
          }
        }

        // Fallback for Desktop: Trigger download
        const dataUrl = canvas.toDataURL('image/png', 1.0);
        const link = document.createElement('a');
        link.download = `Artistant_Pass_${reservation.username}.png`;
        link.href = dataUrl;
        link.click();

        // Copy image to clipboard so user can paste it on desktop
        let copiedToClipboard = false;
        try {
          if (navigator.clipboard && navigator.clipboard.write) {
            await navigator.clipboard.write([
              new ClipboardItem({
                [blob.type]: blob
              })
            ]);
            copiedToClipboard = true;
          }
        } catch (clipErr) {
          console.error("Clipboard image write failed:", clipErr);
        }

        // Launch Web Intents or show generic toast
        if (platform === 'whatsapp') {
          showToast(copiedToClipboard ? "Creative pass downloaded & copied! Opening WhatsApp..." : "Creative pass saved to downloads! Opening WhatsApp...");
          setTimeout(() => {
            window.open(`https://web.whatsapp.com`, '_blank');
          }, 800);
        } else if (platform === 'x') {
          showToast(copiedToClipboard ? "Creative pass downloaded & copied! Opening X..." : "Creative pass saved to downloads! Opening X...");
          setTimeout(() => {
            window.open(`https://x.com`, '_blank');
          }, 800);
        } else {
          showToast(copiedToClipboard ? "Creative pass graphic saved & copied to clipboard!" : "Creative pass graphic saved! Upload to stories.");
        }
        await handleCompleteStoryTask();
      }, 'image/png');

    } catch (e) {
      console.error(e);
      showToast("Error generating image.");
    }
  };

  const renderMobilePreview = () => {
    if (!reservation) return null;
    return (
      <div 
        onClick={() => window.open(`/${reservation.username}`, '_blank')}
        className="relative w-[300px] h-[600px] rounded-[3rem] border-[6px] border-[#1C1C1E] bg-[#050508] shadow-[0_25px_60px_rgba(0,0,0,0.8)] overflow-hidden cursor-pointer group hover:scale-[1.01] transition-transform duration-300 select-none"
      >
        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-4 bg-[#1C1C1E] rounded-b-xl z-40 flex items-center justify-center">
          <div className="w-10 h-1 bg-black/40 rounded-full" />
        </div>

        {/* Scrollable Mobile Content */}
        <div className="w-full h-full overflow-y-auto px-4 pt-6 pb-12 text-left space-y-5 scrollbar-none">
          
          {/* Hero Profile Mock */}
          <div className="relative pt-6 pb-4 flex flex-col items-center text-center border-b border-white/[0.04]">
            {/* Photo or initial letter */}
            <div className="w-16 h-16 rounded-2xl overflow-hidden bg-gradient-to-br from-[#7C5CFF]/20 to-[#D4567A]/20 flex items-center justify-center border border-white/10 mb-2 shadow-lg">
              {reservation.profile_photo_url ? (
                <img src={reservation.profile_photo_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-xl font-black text-white/50">{displayName[0]?.toUpperCase() || 'A'}</span>
              )}
            </div>
            <h4 className="text-sm font-black text-white truncate max-w-full leading-tight">{displayName || 'Artist'}</h4>
            <p className="text-[9px] font-mono text-white/40">@{reservation.username}</p>
            
            {/* Category & City */}
            <div className="flex flex-wrap items-center justify-center gap-1 mt-2.5">
              <span className="px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-wider bg-[#7C5CFF]/15 text-[#B49FFF] border border-[#7C5CFF]/20">
                {categoryLabels[category] || category || 'Artist'}
              </span>
              {city && (
                <span className="px-1.5 py-0.5 rounded-full text-[8px] font-medium text-white/50 bg-white/[0.05] border border-white/[0.06]">
                  📍 {city}
                </span>
              )}
            </div>

            {/* Genres */}
            {genres.length > 0 && (
              <div className="flex flex-wrap justify-center gap-1 mt-2">
                {genres.map(g => (
                  <span key={g} className="px-1.5 py-0.5 rounded-full text-[7px] text-white/40 bg-white/[0.03] border border-white/[0.05]">{g}</span>
                ))}
              </div>
            )}

            {/* Bio */}
            {bio && <p className="text-[9px] text-white/50 leading-relaxed mt-2.5 max-w-[200px]">{bio}</p>}

            {/* Contact Button */}
            {(contactEmailEnabled || contactPhoneEnabled) && (
              <div className="mt-3 w-full">
                <div className="w-full text-center py-1.5 rounded-lg text-[9px] font-bold bg-white text-black flex items-center justify-center gap-1">
                  <Mail className="w-2.5 h-2.5" />
                  <span>Contact {displayName || 'Artist'}</span>
                </div>
              </div>
            )}
          </div>

          {/* Ordered Sections */}
          <div className="space-y-4">
            {sectionOrder.map((sec) => {
              if (sec === 'gallery') {
                return (
                  <div key="gallery" className="space-y-1.5">
                    <div className="flex items-center gap-1">
                      <ImageGridIcon className="w-2.5 h-2.5 text-[#7C5CFF]" />
                      <span className="text-[9px] font-bold text-white/80">Gig Gallery</span>
                    </div>
                    <div className="grid grid-cols-3 gap-1">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="aspect-square rounded-lg bg-white/[0.02] border border-white/[0.05] flex items-center justify-center">
                          <ImageGridIcon className="w-2.5 h-2.5 text-white/5" />
                        </div>
                      ))}
                    </div>
                  </div>
                );
              }
              if (sec === 'video') {
                return (
                  <div key="video" className="space-y-1.5">
                    <div className="flex items-center gap-1">
                      <VideoIcon className="w-2.5 h-2.5 text-[#D4567A]" />
                      <span className="text-[9px] font-bold text-white/80">Featured Video</span>
                    </div>
                    <div className="w-full aspect-video rounded-xl bg-white/[0.02] border border-white/[0.05] flex items-center justify-center">
                      <PlayIcon className="w-3.5 h-3.5 text-white/10" />
                    </div>
                  </div>
                );
              }
              if (sec === 'audio') {
                return (
                  <div key="audio" className="space-y-1.5">
                    <div className="flex items-center gap-1">
                      <MusicNoteIcon className="w-2.5 h-2.5 text-[#F25A2B]" />
                      <span className="text-[9px] font-bold text-white/80">Audio Samples</span>
                    </div>
                    <div className="space-y-1">
                      {[1, 2].map(i => (
                        <div key={i} className="flex items-center gap-2 p-1.5 rounded-lg bg-white/[0.01] border border-white/[0.03]">
                          <PlayIcon className="w-2 h-2 text-[#F25A2B]/40" />
                          <div className="flex-1">
                            <div className="h-1 w-10 bg-white/10 rounded-full" />
                          </div>
                          <span className="text-[7px] font-mono text-white/20">--:--</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              }
              return null;
            })}
          </div>
        </div>

        {/* Open page hover banner */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-2 z-50">
          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white border border-white/25">
            <ExternalLink className="w-4 h-4" />
          </div>
          <span className="text-[10px] font-bold text-white/80 font-mono tracking-wider">OPEN LIVE PROFILE</span>
        </div>
      </div>
    );
  };

  /* ── Loading State ── */
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0A0A0A]">
        <div className="w-10 h-10 border-[3px] border-white/5 border-t-[#F25A2B] rounded-full animate-spin" />
      </div>
    );
  }

  if (!reservation) return null;

  const greeting = (() => {
    if (!mounted) return 'Welcome';
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  })();

  /* ═══════════════════════════════════════════
     RENDER — DASHBOARD LAYOUT
     ═══════════════════════════════════════════ */
  return (
    <div className="min-h-screen text-[var(--ink)] relative overflow-x-hidden selection:bg-[#7C5CFF]/30 selection:text-white transition-colors duration-300" style={{ background: 'var(--bg)' }}>

      {/* ── AMBIENT BACKGROUND GLOWS ── */}
      <div className={`absolute top-[10%] left-[-10%] w-[50%] h-[50%] ${isLight ? 'bg-[#F25A2B]/8' : 'bg-[#F25A2B]/3'} rounded-full blur-[150px] pointer-events-none z-0 animate-pulse`} style={{ animationDuration: '8s' }} />
      <div className={`absolute top-[40%] right-[-10%] w-[45%] h-[45%] ${isLight ? 'bg-[#7C5CFF]/7' : 'bg-[#7C5CFF]/3'} rounded-full blur-[150px] pointer-events-none z-0`} />
      <div className={`absolute bottom-[10%] left-[-15%] w-[60%] h-[60%] ${isLight ? 'bg-[#D4567A]/5' : 'bg-[#D4567A]/2'} rounded-full blur-[180px] pointer-events-none z-0`} />

      {/* ── Toast ── */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -20, x: '-50%' }}
            className="fixed top-20 left-1/2 z-[100] px-5 py-2.5 rounded-2xl text-xs font-semibold flex items-center gap-2 border border-[var(--line-soft)] backdrop-blur-xl"
            style={{ background: 'var(--glass-bg)', color: 'var(--ink)', boxShadow: '0 10px 30px var(--shadow-base)' }}
          >
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ TOP BAR ═══ */}
      <Navbar
        user={user}
        userReservation={reservation}
        onSignInClick={() => router.push('/?auth=true')}
        onSignOut={handleSignOut}
        onProfileClick={() => router.push('/dashboard')}
        foundingPoints={points}
      />

      {/* ═══ DASHBOARD CONTENT (App Workspace View) ═══ */}
      <main className="max-w-6xl mx-auto px-6 pt-24 pb-10 md:pt-36 md:pb-16 space-y-12 relative z-10">
        
        {/* ── DASHBOARD GREETING ── */}
        <section className="flex flex-col items-center text-center max-w-3xl mx-auto mb-10">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="flex flex-col items-center w-full mb-4">
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-[var(--ink)] uppercase" style={{ fontFamily: 'var(--font-display)' }}>
              {greeting},<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F25A2B] via-[#D4567A] to-[#7C5CFF]">@{reservation.username}</span>
            </h1>
          </motion.div>
        </section>

        {/* ── PROFILE CUSTOMIZER & LIVE PREVIEW WORKSPACE ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-12 relative z-10">
          
          {/* LEFT COLUMN: LIVE PREVIEW (5 Cols) */}
          <div className="lg:col-span-5 lg:sticky lg:top-28 flex flex-col items-center">
            <div className="flex items-center justify-between w-full max-w-[300px] mb-3 px-2">
              <h3 className="text-[10px] font-bold text-[var(--ink-2)] font-mono uppercase tracking-widest">Live Preview</h3>
              <button 
                onClick={() => window.open(`/${reservation.username}`, '_blank')}
                className="text-[10px] font-bold text-[#7C5CFF] hover:underline flex items-center gap-1"
              >
                <span>Open Page</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </button>
            </div>
            
            {renderMobilePreview()}

            {/* Customize Profile Button */}
            <button
              onClick={() => setIsCustomizerOpen(true)}
              className="mt-6 w-full max-w-[300px] py-3.5 px-6 rounded-2xl text-xs font-bold text-white bg-gradient-to-r from-[#F25A2B] via-[#D4567A] to-[#7C5CFF] hover:scale-[1.02] active:scale-95 transition-all shadow-[0_10px_25px_rgba(124,92,255,0.25)] flex items-center justify-center gap-2 group cursor-pointer"
            >
              <Sparkles className="w-4 h-4 group-hover:rotate-12 transition-transform duration-300" />
              <span>Customize Profile</span>
            </button>
          </div>

          {/* RIGHT COLUMN: CONTROLS & FORM (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* 3D TILT FOUNDING CARD */}
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
                  className={`relative w-full h-full ${isLight ? 'bg-[#FFFFFF]/90' : 'bg-[#050508]/90'} rounded-[2.4rem] p-5 md:p-6 flex flex-col justify-between overflow-hidden border ${isLight ? 'border-[#7C5CFF]/15' : 'border-white/5'}`}
                  style={{
                    isolation: 'isolate',
                    WebkitMaskImage: '-webkit-radial-gradient(white, black)'
                  }}
                >
                  <div className={`absolute -right-20 -bottom-20 w-80 h-80 rounded-full border ${isLight ? 'border-[#7C5CFF]/5' : 'border-white/[0.02]'} flex items-center justify-center pointer-events-none`}>
                    <div className={`w-60 h-60 rounded-full border ${isLight ? 'border-[#7C5CFF]/5' : 'border-white/[0.01]'} flex items-center justify-center`} />
                  </div>

                  {/* Top Row */}
                  <div className="flex justify-between items-start z-10 w-full">
                    <div className="flex items-center gap-2">
                      <img src="/logo_a.png" alt="A" className="w-6 h-6 object-contain opacity-80 dark:invert-0 invert" />
                      <span className="font-mono text-[9px] font-bold tracking-[0.2em] text-[var(--ink-2)]">FOUNDING CARD</span>
                    </div>
                    <div className="flex items-center gap-1.5">
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
                            <span className={`w-1 h-1 rounded-full ${isLight ? 'bg-black/20' : 'bg-white/20'}`} />
                            <span>Founding Artist</span>
                            <LockKeyhole className={`w-2.5 h-2.5 ${isLight ? 'text-black/35' : 'text-white/30'} ml-0.5 shrink-0`} />
                          </>
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Rank Pos (Center) */}
                  <div className="flex flex-col items-center justify-center z-10 flex-1 my-1 md:my-2">
                    <h1 className="font-display font-black leading-none text-[var(--ink)] tracking-tighter text-4xl md:text-6xl" style={{ textShadow: isLight ? '0 10px 30px rgba(124,92,255,0.06)' : '0 10px 30px rgba(0,0,0,0.5)' }}>
                      #{waitlistPos || '---'}
                    </h1>
                    <div className="flex flex-col items-center mt-1.5 md:mt-2.5">
                      <span className="font-mono text-[9px] font-bold tracking-[0.35em] text-[var(--ink-3)]">WAITLIST RANK • COHORT {cohort}</span>
                      <span className="font-mono text-[8px] font-bold tracking-[0.15em] text-[#F25A2B]">{isCohort1 ? 'BETA ACCESS GRANTED' : 'POSITION SECURED'}</span>
                    </div>
                  </div>

                  {/* Bottom Row */}
                  <div className="flex justify-between items-center z-10">
                    <div className="flex flex-col text-left">
                      <span className="font-display text-xl md:text-2xl font-black tracking-tight text-[var(--ink)]">@{reservation.username}</span>
                      <span className="text-[9px] uppercase font-mono tracking-widest text-[var(--ink-3)] mt-0.5">Verified Artist</span>
                    </div>
                    <div className="flex flex-col items-end">
                      <img src="/logo_wordmark.png" alt="ArtisTant" className="w-24 md:w-32 h-auto object-contain opacity-85 dark:invert-0 invert -my-3 md:-my-4" />
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* ── PROFILE ANALYTICS & BROADCAST ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Visitors Card */}
              <div className={`p-6 rounded-3xl border ${isLight ? 'bg-white border-[#7C5CFF]/10 shadow-[0_8px_30px_rgba(124,92,255,0.08)]' : 'bg-[#0A0A0F] border-white/5 shadow-[0_8px_30px_rgba(0,0,0,0.4)]'} flex flex-col justify-center items-center relative overflow-hidden group`}>
                <div className={`absolute -right-10 -top-10 w-32 h-32 ${isLight ? 'bg-[#7C5CFF]/5' : 'bg-[#7C5CFF]/10'} rounded-full blur-2xl group-hover:bg-[#7C5CFF]/20 transition-all`} />
                <h3 className="text-sm font-bold text-[var(--ink-2)] mb-2 uppercase tracking-wider font-mono">Profile Visitors</h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-black font-display text-[var(--ink)] tracking-tighter">{reservation.profile_visitors_count || 0}</span>
                  <span className="text-xs text-[var(--ink-3)] font-medium">views</span>
                </div>
              </div>

              {/* Broadcast Card */}
              <div className={`p-6 rounded-3xl border ${isLight ? 'bg-white border-[#F25A2B]/10 shadow-[0_8px_30px_rgba(242,90,43,0.08)]' : 'bg-[#0A0A0F] border-white/5 shadow-[0_8px_30px_rgba(0,0,0,0.4)]'} flex flex-col justify-between relative overflow-hidden`}>
                <div className="flex flex-col gap-3 z-10">
                  <h3 className="text-sm font-bold text-[var(--ink)] flex items-center gap-2">
                    Broadcast Message
                  </h3>
                  <p className="text-[11px] text-[var(--ink-2)] leading-snug">Set a custom status that fans will see as a notification when they visit your profile.</p>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="e.g. New single out Friday!"
                      className="flex-1 min-w-0 bg-[var(--line-soft)] border border-[var(--line)] rounded-xl px-3 py-2 text-xs text-[var(--ink)] focus:outline-none focus:border-[#7C5CFF] transition-colors placeholder-[var(--ink-3)]"
                      defaultValue={reservation.custom_status_message || ''}
                      id="broadcastInput"
                      maxLength={60}
                    />
                    <button 
                      onClick={async () => {
                        const input = document.getElementById('broadcastInput') as HTMLInputElement;
                        if (!input) return;
                        try {
                          const idToken = await user!.getIdToken();
                          await updateCustomStatusMessageAction(idToken, input.value);
                          setToastMessage('Broadcast message updated!');
                          setTimeout(() => setToastMessage(null), 3000);
                        } catch (err) {
                          console.error(err);
                        }
                      }}
                      className="bg-[var(--ink)] text-[var(--bg)] px-4 py-2 rounded-xl text-xs font-bold hover:scale-105 transition-all shrink-0"
                    >
                      Set
                    </button>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

          {/* ── DASHBOARD TWO-COLUMN WORKSPACE ── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
             
            {/* LEFT COLUMN: REFERRALS HUB (7 Cols) */}
            <div className="lg:col-span-7 space-y-6">
               
              {/* Founding Network Status Card */}
              <div className="rounded-[2.5rem] p-[1.5px] bg-gradient-to-b from-[var(--line)] to-transparent shadow-2xl relative overflow-hidden group">
                <div className="bg-bg-card/95 rounded-[2.4rem] p-6 md:p-8 backdrop-blur-xl border border-line-soft relative">
                  <div className="absolute -left-20 -top-20 w-48 h-48 rounded-full bg-[#7C5CFF]/3 blur-[80px] pointer-events-none" />

                  <div className="flex justify-between items-center mb-6">
                    <h3 className="font-mono text-[10px] font-bold text-ink-2 uppercase tracking-[0.2em] flex items-center gap-2">
                      <TrendingUp className="w-3.5 h-3.5 text-[#7C5CFF]" /> Founding Status
                    </h3>
                    <motion.button 
                      onClick={() => setActiveInfo('why-refer')}
                      animate={{ width: isHelpExpanded ? 82 : 20 }}
                      className="rounded-full flex items-center justify-center text-[10px] font-mono font-bold text-white bg-gradient-to-br from-[#7C5CFF] to-[#D4567A] border border-white/10 shadow-[0_0_8px_rgba(124,92,255,0.3)] cursor-pointer overflow-hidden whitespace-nowrap gap-1"
                      style={{ width: isHelpExpanded ? '82px' : '20px', height: '20px', minWidth: '20px', padding: isHelpExpanded ? '0 7px' : '0' }}
                      title="Why invite peers?"
                    >
                      <span>?</span>
                      {isHelpExpanded && (
                        <span className="text-[7px] tracking-wider uppercase">Invite Info</span>
                      )}
                    </motion.button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center mb-6">
                    <div>
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="font-mono text-[9px] text-ink-3 tracking-widest block uppercase font-bold">Current Standing</span>
                        <motion.button 
                          onClick={() => setActiveInfo('vouch-points')}
                          animate={{ width: isHelpExpanded ? 80 : 16 }}
                          className="rounded-full flex items-center justify-center text-[8px] font-mono font-bold text-white bg-gradient-to-br from-[#7C5CFF] to-[#D4567A] border border-white/10 shadow-[0_0_6px_rgba(124,92,255,0.3)] cursor-pointer overflow-hidden whitespace-nowrap gap-1"
                          style={{ width: isHelpExpanded ? '80px' : '16px', height: '16px', minWidth: '16px', padding: isHelpExpanded ? '0 5px' : '0' }}
                          title="How points work"
                        >
                          <span>?</span>
                          {isHelpExpanded && (
                            <span className="text-[7px] tracking-wider uppercase">Points Info</span>
                          )}
                        </motion.button>
                      </div>
                      <div className="font-display font-black text-5xl mt-2 tracking-tight text-ink drop-shadow-[0_4px_12px_var(--shadow-base)] flex items-baseline gap-1.5">
                        {points} <span className="font-mono text-xs font-bold text-[#7C5CFF]">PTS</span>
                      </div>
                      <p className="text-[10px] text-ink-2 mt-2 font-mono">
                        Base 100 PTS + 50 PTS per verified referral + 80 PTS for Story task.
                      </p>
                    </div>

                    {/* Vouch Slots Progress Panel */}
                    <div className="w-full h-32 bg-black/5 dark:bg-black/30 border border-line-soft rounded-3xl p-4 shadow-inner">
                      <div className="grid grid-cols-3 gap-3 w-full h-full items-center">
                        {Array.from({ length: 3 }).map((_, idx) => {
                          const active = idx < verifiedReferrals;
                          return (
                            <div 
                              key={idx}
                              className={`flex flex-col items-center justify-center p-2 rounded-2xl border transition-all duration-300 relative overflow-hidden ${
                                active 
                                  ? 'bg-gradient-to-b from-[#7C5CFF]/12 to-[#D4567A]/4 border-[#7C5CFF]/20 shadow-[0_4px_12px_rgba(124,92,255,0.08)]' 
                                  : 'bg-black/10 dark:bg-white/[0.01] border-line-soft'
                              }`}
                              style={{ height: '96px' }}
                            >
                              {active ? (
                                <>
                                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#7C5CFF] to-[#D4567A] flex items-center justify-center text-white mb-2 shadow-[0_0_10px_rgba(124,92,255,0.4)]">
                                    <Check className="w-3.5 h-3.5" />
                                  </div>
                                  <span className="font-mono text-[9px] uppercase tracking-wider text-[#34D399] font-bold">Vouched</span>
                                  <span className="font-mono text-[7px] text-ink-3 uppercase tracking-widest mt-0.5 font-bold">Artist {idx + 1}</span>
                                </>
                              ) : (
                                <>
                                  <div className="w-7 h-7 rounded-full bg-black/20 dark:bg-white/5 flex items-center justify-center text-ink-3 mb-2 border border-line-soft">
                                    <LockKeyhole className="w-3 h-3 opacity-40 text-ink-3" />
                                  </div>
                                  <span className="font-mono text-[9px] uppercase tracking-wider text-ink-3 opacity-60">Locked</span>
                                  <span className="font-mono text-[7px] text-ink-3 uppercase tracking-widest mt-0.5">Artist {idx + 1}</span>
                                </>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="relative space-y-4">
                    <div>
                      <p className="font-mono text-[9px] text-ink-2 uppercase tracking-wider mb-2.5 leading-relaxed">
                        Progress to Founding Artist Badge:
                      </p>

                      {/* Segmented hardware-style progress track */}
                      <div className="relative w-full h-3 rounded-full bg-black/10 dark:bg-black/40 border border-line-soft overflow-hidden p-0.5 shadow-inner">
                        <div className="absolute inset-0 flex pointer-events-none z-20">
                          <div className="w-px h-full bg-black/10 dark:bg-white/10" style={{ marginLeft: '25%' }} />
                          <div className="w-px h-full bg-black/10 dark:bg-white/10" style={{ marginLeft: '50%' }} />
                          <div className="w-px h-full bg-black/10 dark:bg-white/10" style={{ marginLeft: '75%' }} />
                        </div>
                        <motion.div 
                          className="h-full rounded-full bg-gradient-to-r from-[#F25A2B] via-[#D4567A] to-[#7C5CFF]" 
                          initial={{ width: 0 }} 
                          whileInView={{ width: `${progressPercentage}%` }} 
                          viewport={{ once: true }} 
                          transition={{ duration: 1.2, ease: "easeOut" }} 
                        />
                      </div>

                      <div className="flex justify-between items-center mt-3">
                        <span className="text-[9px] text-ink-3 font-mono uppercase tracking-widest">Founding Artist Level (500 PTS)</span>
                        <span className="text-[9px] text-ink-3 font-mono uppercase tracking-widest font-bold">{points}/500 PTS</span>
                      </div>
                    </div>

                    {/* Unverified Referrals pending notice */}
                    {unverifiedReferrals > 0 && (
                      <div className="px-4 py-3 rounded-2xl bg-amber-500/5 border border-amber-500/10 text-amber-500/90 text-[10px] font-mono flex items-center gap-2.5 shadow-inner">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse shrink-0 shadow-[0_0_8px_rgba(245,158,11,0.6)]" />
                        <span>Your referrals are being verified. Once approved, points will unlock and climb your rank! ({unverifiedReferrals} pending)</span>
                      </div>
                    )}

                    {/* Dynamic competitive notification */}
                    {verifiedReferrals >= 3 ? (
                      <div className="px-4 py-3 rounded-2xl bg-[#7C5CFF]/10 border border-[#7C5CFF]/20 text-[var(--ink)] text-[10px] font-mono leading-relaxed shadow-sm">
                        🚀 **You've referred {verifiedReferrals} peers! But don't stop there.** Earning more points helps you climb the leaderboard, secure your priority position in **Cohort 001**, and prevents other artists from overtaking your rank!
                      </div>
                    ) : (
                      <div className="text-[9px] font-mono text-ink-3 text-left">
                        Refer active artists to earn points, climb the leaderboard, and claim a spot in Cohort 1.
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Referral Invite & Vouch Engine Card */}
              <div className="rounded-[2.5rem] p-[1.5px] bg-gradient-to-b from-[var(--line)] to-transparent shadow-2xl relative overflow-hidden group">
                <div className="bg-bg-card/95 rounded-[2.4rem] p-6 md:p-8 backdrop-blur-xl border border-line-soft relative">
                  <div className="absolute -right-20 -bottom-20 w-48 h-48 rounded-full bg-[#F25A2B]/2 blur-[80px] pointer-events-none" />

                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-mono text-[10px] font-bold text-ink-2 uppercase tracking-[0.2em] flex items-center gap-2">
                      <Users className="w-3.5 h-3.5 text-[#F25A2B]" /> Vouch Engine
                    </h3>
                    <div className="flex items-center gap-2">
                      {verifiedReferrals > 0 ? (
                        <span className="font-mono text-[9px] uppercase font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full select-none">
                          {verifiedReferrals} approved
                        </span>
                      ) : (
                        <span className="font-mono text-[9px] uppercase font-bold text-amber-500 bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-full select-none animate-pulse">
                          0 approved
                        </span>
                      )}
                      <motion.button 
                        onClick={() => setActiveInfo('why-refer')}
                        animate={{ width: isHelpExpanded ? 82 : 20 }}
                        className="rounded-full flex items-center justify-center text-[10px] font-mono font-bold text-white bg-gradient-to-br from-[#7C5CFF] to-[#D4567A] border border-white/10 shadow-[0_0_8px_rgba(124,92,255,0.3)] cursor-pointer overflow-hidden whitespace-nowrap gap-1"
                        style={{ width: isHelpExpanded ? '82px' : '20px', height: '20px', minWidth: '20px', padding: isHelpExpanded ? '0 7px' : '0' }}
                        title="Why share stories?"
                      >
                        <span>?</span>
                        {isHelpExpanded && (
                          <span className="text-[7px] tracking-wider uppercase">Invite Info</span>
                        )}
                      </motion.button>
                    </div>
                  </div>

                  <h4 className="text-xl font-display font-black text-ink uppercase tracking-tight mb-2.5">
                    Fast-Track to Cohort 1 & Founding Status
                  </h4>
                  <p className="text-xs text-ink-2 mb-6 leading-relaxed">
                    Access is released in rollouts. Earn <strong className="text-ink">250 PTS</strong> to qualify for Cohort 1 priority access (includes first gig platform fee waived), and reach <strong className="text-ink">500 PTS</strong> to claim a permanent verified <strong className="text-ink">"Founding Artist"</strong> badge. The first 50 Founding Artists receive a lifetime <strong className="text-ink">0% Platform Fee</strong> guarantee!
                  </p>

                  {/* Share Tools */}
                  <div className="space-y-4 mb-6">
                    {/* Copy Link Input Bar */}
                    <div className="flex items-center gap-3 bg-black/5 dark:bg-black/40 border border-line-soft p-1.5 rounded-2xl shadow-inner">
                      <div className="flex-1 px-4 py-2 text-ink-2 font-mono text-xs truncate select-all">
                        artistant.in/?ref={reservation.username}
                      </div>
                      <button 
                        onClick={copyReferralLink} 
                        className="h-10 px-4 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 border border-black/10 dark:border-white/10 text-ink font-mono text-[10px] uppercase font-bold tracking-widest shadow-md active:scale-95 transition-all shrink-0 flex items-center gap-1.5"
                      >
                        {copied ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" /> Copied
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" /> Copy Link
                          </>
                        )}
                      </button>
                    </div>

                    {/* Quick-Share Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <button 
                        onClick={() => handleShareStory('whatsapp')}
                        className="flex items-center justify-center gap-2.5 h-12 rounded-xl bg-[#25D366]/8 hover:bg-[#25D366]/18 border border-[#25D366]/30 text-[#25D366] font-mono text-[10px] uppercase tracking-wider font-bold transition-all duration-300 active:scale-95 cursor-pointer"
                      >
                        <span>Share via</span>
                        <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 448 512">
                          <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"/>
                        </svg>
                      </button>
                      <button 
                        onClick={() => handleShareStory('instagram')}
                        className="flex items-center justify-center gap-2.5 h-12 rounded-xl bg-[#E1306C]/8 hover:bg-[#E1306C]/18 border border-[#E1306C]/30 text-[#E1306C] font-mono text-[10px] uppercase tracking-wider font-bold transition-all duration-300 active:scale-95 cursor-pointer"
                      >
                        <span>Share via</span>
                        <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.333 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
                        </svg>
                      </button>
                      <button 
                        onClick={() => handleShareStory('x')}
                        className={`flex items-center justify-center gap-2.5 h-12 rounded-xl font-mono text-[10px] uppercase tracking-wider font-bold transition-all duration-300 active:scale-95 cursor-pointer flex-1 sm:flex-none ${
                          isLight 
                            ? 'bg-black/[0.04] hover:bg-black/[0.08] border border-black/15 text-black' 
                            : 'bg-white/[0.03] hover:bg-white/[0.08] border border-white/20 text-white'
                        }`}
                      >
                        <span>Share via</span>
                        <svg className="w-3.5 h-3.5 fill-current shrink-0" viewBox="0 0 24 24">
                          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Expandable Message Box */}
                  <div className="border-t border-line-soft pt-4">
                    <button 
                      onClick={() => setRawTextOpen(!rawTextOpen)}
                      className="w-full flex items-center justify-between text-[9px] font-mono uppercase text-ink-3 hover:text-ink transition-colors py-1"
                    >
                      <span>Show Invite Copywriting Template</span>
                      <span>{rawTextOpen ? '[-]' : '[+]'}</span>
                    </button>
                    
                    <AnimatePresence>
                      {rawTextOpen && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden mt-3"
                        >
                          <div className="flex items-start gap-3 bg-black/5 dark:bg-black/50 border border-line-soft p-4 rounded-2xl shadow-inner text-left relative group/raw">
                            <p className="flex-1 text-[11px] font-mono text-ink-2 leading-relaxed select-all">
                              Hey! I just locked my booking handle on Artistant. It lets you take direct client bookings, handles your contracts, and secures your money in escrow before you even perform. Claim your name before someone else takes it: artistant.in/?ref={reservation.username}
                            </p>
                            <button 
                              onClick={() => {
                                const shareText = `Hey! I just locked my booking handle on Artistant. It lets you take direct client bookings, handles your contracts, and secures your money in escrow before you even perform. Claim your name before someone else takes it: artistant.in/?ref=${reservation.username}`;
                                navigator.clipboard.writeText(shareText);
                                showToast("Invite template copied!");
                              }}
                              className="p-2.5 rounded-lg bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 border border-black/10 dark:border-white/10 text-ink-2 hover:text-ink transition-colors"
                              title="Copy raw text"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>


            </div>

            {/* RIGHT COLUMN: INSTAGRAM STORY STUDIO (5 Cols) */}
            <div className="lg:col-span-5 space-y-6">
               
              <div className="rounded-[2.5rem] p-[1.5px] bg-gradient-to-b from-[var(--line)] to-transparent shadow-2xl relative overflow-hidden group">
                <div className="bg-bg-card/95 rounded-[2.4rem] p-6 md:p-8 backdrop-blur-xl border border-line-soft flex flex-col items-center">
                  
                  {/* Header */}
                  <div className="flex justify-between items-center w-full mb-2">
                    <h3 className="font-mono text-[10px] font-bold text-ink-2 uppercase tracking-[0.2em]">
                      Story Generator
                    </h3>
                    <div>
                      {storyShared ? (
                        <span className="font-mono text-[9px] uppercase font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full select-none">
                          +80 PTS Earned
                        </span>
                      ) : (
                        <span className="font-mono text-[9px] uppercase font-bold text-amber-500 bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-full select-none animate-pulse">
                          Pending Share
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-[11px] text-ink-2 leading-relaxed self-start mb-5">
                    Generate and share your Founding Card as an Instagram or WhatsApp story. <strong className="text-ink">To claim points, you must mention @artistant and put your referral link: `artistant.in/?ref={reservation.username}` on your Story!</strong>
                  </p>

                  {/* ── Template Selector Tabs ── */}
                  <div className="flex w-full gap-1.5 mb-5">
                    {[
                      { name: 'Dark Noir', bg: '#0A0A10' },
                      { name: 'Gradient', bg: '' },
                      { name: 'Light', bg: '#FAFAFA' },
                      { name: 'Live Economy', bg: '#0F172A' }
                    ].map((tmpl, idx) => (
                      <button 
                        key={idx}
                        onClick={() => setActiveStoryTemplate(idx)}
                        className={`flex-1 h-9 rounded-lg font-mono text-[8px] uppercase tracking-wider font-bold transition-all duration-300 cursor-pointer border ${
                          activeStoryTemplate === idx 
                            ? 'border-[#F25A2B]/50 shadow-[0_0_12px_rgba(242,90,43,0.15)] scale-[1.02]' 
                            : 'border-line-soft hover:border-line opacity-60 hover:opacity-100'
                        }`}
                        style={{
                          background: idx === 1 ? 'linear-gradient(135deg, #7C5CFF, #D4567A, #F25A2B)' : tmpl.bg,
                          color: idx === 2 ? '#0F0F14' : '#FFFFFF'
                        }}
                      >
                        {tmpl.name}
                      </button>
                    ))}
                  </div>

                  {/* ── Story Preview Card ── */}
                  <div className="relative w-full max-w-[260px] aspect-[9/16] rounded-2xl overflow-hidden shadow-[0_20px_50px_var(--shadow-heavy)] border border-line-soft mb-5 transition-all duration-500"
                    style={{
                      background: activeStoryTemplate === 0 
                        ? 'linear-gradient(180deg, #0A0A10, #04040A)' 
                        : activeStoryTemplate === 1 
                          ? 'linear-gradient(135deg, #7C5CFF, #D4567A, #F25A2B)' 
                          : activeStoryTemplate === 2
                            ? '#FAFAFA'
                            : 'linear-gradient(180deg, #0F172A, #020617)',
                    }}
                  >
                    {/* Dark overlay for template 1 */}
                    {activeStoryTemplate === 1 && (
                      <div className="absolute inset-0 bg-black/20 z-[1]" />
                    )}

                    {/* Dot grid for template 2 */}
                    {activeStoryTemplate === 2 && (
                      <div className="absolute inset-0 z-[1]" style={{
                        backgroundImage: 'radial-gradient(circle, rgba(124,92,255,0.08) 1px, transparent 1px)',
                        backgroundSize: '12px 12px'
                      }} />
                    )}

                    {/* Grid lines for template 0 and 3 */}
                    {(activeStoryTemplate === 0 || activeStoryTemplate === 3) && (
                      <div className="absolute inset-0 z-[1]" style={{
                        backgroundImage: 'linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)',
                        backgroundSize: '28px 28px'
                      }} />
                    )}

                    {/* Glow for template 0 */}
                    {activeStoryTemplate === 0 && (
                      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full z-[1]" style={{
                        background: 'radial-gradient(circle, rgba(242,90,43,0.1) 0%, rgba(124,92,255,0.05) 50%, transparent 100%)'
                      }} />
                    )}

                    {/* Glow for template 3 */}
                    {activeStoryTemplate === 3 && (
                      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full z-[1]" style={{
                        background: 'radial-gradient(circle, rgba(124,92,255,0.12) 0%, rgba(242,90,43,0.05) 50%, transparent 100%)'
                      }} />
                    )}

                    <div className="relative z-[2] flex flex-col items-center justify-between h-full px-4 py-5">
                      {/* Logo */}
                      <div className="text-center flex flex-col items-center gap-0.5 select-none">
                        <img 
                          src="/logo_wordmark.png" 
                          alt="Artistant" 
                          className={`h-5 w-auto object-contain transition-all ${
                            activeStoryTemplate === 2 ? 'invert' : ''
                          }`} 
                        />
                        <span className={`text-[4px] font-mono tracking-widest uppercase ${activeStoryTemplate === 2 ? 'text-[#0F0F14]/35' : 'text-white/30'} mt-0.5`}>
                          FOUNDING MEMBER PASSPORT
                        </span>
                      </div>

                      {/* Mini Pass Card */}
                      <div className="w-full rounded-lg p-2.5 flex flex-col gap-1 border transition-all duration-300"
                        style={{
                          background: activeStoryTemplate === 0 
                            ? 'rgba(255,255,255,0.02)' 
                            : activeStoryTemplate === 1 
                              ? 'rgba(10,10,15,0.75)' 
                              : activeStoryTemplate === 2
                                ? '#FFFFFF'
                                : 'rgba(255,255,255,0.03)',
                          borderColor: activeStoryTemplate === 2 ? 'rgba(124,92,255,0.12)' : 'rgba(255,255,255,0.08)',
                          boxShadow: activeStoryTemplate === 2 ? '0 4px 20px rgba(124,92,255,0.06)' : 'none'
                        }}
                      >
                        <div className="flex justify-between items-center text-[4px] font-mono font-bold">
                          <span style={{ color: activeStoryTemplate === 2 ? '#7C5CFF' : '#F25A2B' }}>FOUNDING CARD</span>
                          <span style={{ color: activeStoryTemplate === 2 ? '#0F0F14' : '#FFFFFF', opacity: 0.5 }}>FOUNDING ARTIST</span>
                        </div>
                        <div className="w-full h-px" style={{ background: activeStoryTemplate === 2 ? 'rgba(124,92,255,0.1)' : 'rgba(255,255,255,0.06)' }} />
                        <div className="text-center py-2">
                          <div className="text-2xl font-display font-black leading-none" style={{ color: activeStoryTemplate === 2 ? '#0F0F14' : '#FFFFFF' }}>
                            #{waitlistPos || '---'}
                          </div>
                          <div className="text-[3.5px] font-mono tracking-widest mt-0.5" style={{ color: activeStoryTemplate === 2 ? '#0F0F14' : '#FFFFFF', opacity: 0.35 }}>
                            WAITLIST POSITION
                          </div>
                        </div>
                        <div className="flex justify-between items-end">
                          <div>
                            <div className="text-[7px] font-bold" style={{ color: activeStoryTemplate === 2 ? '#0F0F14' : '#FFFFFF', fontFamily: '"Space Grotesk", sans-serif' }}>
                              @{reservation.username}
                            </div>
                            <div className="text-[3px] font-mono" style={{ color: activeStoryTemplate === 2 ? '#0F0F14' : '#FFFFFF', opacity: 0.3 }}>
                              VERIFIED ARTIST
                            </div>
                          </div>
                          <div className="text-[4px] font-mono" style={{ color: activeStoryTemplate === 2 ? '#7C5CFF' : '#FFFFFF', opacity: 0.2 }}>
                            ||||| | ||||
                          </div>
                        </div>
                      </div>

                      {/* Headline */}
                      <div className="text-center">
                        {activeStoryTemplate === 0 && (
                          <>
                            <h4 className="font-display font-black text-[11px] uppercase tracking-tight leading-snug text-white">I CHOSE ZERO<br />MIDDLEMEN.</h4>
                            <p className="text-[4.5px] font-mono tracking-widest uppercase mt-1" style={{ background: 'linear-gradient(90deg, #F25A2B, #7C5CFF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>DIRECT BOOKING ECOSYSTEM</p>
                          </>
                        )}
                        {activeStoryTemplate === 1 && (
                          <>
                            <h4 className="font-display font-black text-[12px] uppercase tracking-tight leading-snug text-white">BUILT FOR STAGE.<br />ARTIST FIRST.</h4>
                            <p className="text-[4.5px] font-mono tracking-widest uppercase text-white/50 mt-1">RECLAIMING CREATIVE VALUE</p>
                          </>
                        )}
                        {activeStoryTemplate === 2 && (
                          <>
                            <h4 className="font-display font-black text-[11px] uppercase tracking-tight leading-snug text-[#0F0F14]">BUILT FOR ARTISTS.<br />NOT PLATFORMS.</h4>
                            <p className="text-[4.5px] font-mono tracking-widest uppercase text-[#7C5CFF] mt-1">COHORT {cohort} · FOUNDING ARTIST</p>
                          </>
                        )}
                        {activeStoryTemplate === 3 && (
                          <>
                            <h4 className="font-display font-black text-[10px] uppercase tracking-tight leading-snug text-white">I AM ON ARTISTANT.</h4>
                            <p className="text-[4px] font-mono tracking-wider text-white/60 mt-1 leading-normal">THEY ARE REBUILDING<br />INDIA&apos;S LIVE ECONOMY.</p>
                          </>
                        )}
                      </div>

                      {/* Features */}
                      <div className="space-y-0.5 text-[5px] font-mono text-center" style={{ color: activeStoryTemplate === 2 ? '#7C5CFF' : 'rgba(255,255,255,0.5)' }}>
                        {activeStoryTemplate === 0 && (<><div>✓ Direct client-to-artist routing</div><div>✓ GigSafe escrow payment security</div><div>✓ Auto-synced availability booking</div></>)}
                        {activeStoryTemplate === 1 && (<><div>✓ Direct client bookings</div><div>✓ GigSafe escrow guarantees</div><div>✓ Custom portfolio @handle</div></>)}
                        {activeStoryTemplate === 2 && (<><div>✓ Direct gig booking system</div><div>✓ Escrow payment infrastructure</div><div>✓ Verified availability sync</div></>)}
                        {activeStoryTemplate === 3 && (<><div>✓ Direct artist-to-client connections</div><div>✓ Secure Escrow Infrastructure</div><div>✓ Check out my profile: artistant.in/{reservation.username}</div></>)}
                      </div>

                      {/* Bottom branding */}
                      <div className="text-[5px] font-mono font-bold tracking-widest uppercase" style={{ color: activeStoryTemplate === 2 ? '#7C5CFF' : '#FFFFFF', opacity: 0.25 }}>
                        ARTISTANT.IN
                      </div>
                    </div>
                  </div>

                  {/* Dot indicators */}
                  <div className="flex gap-2 mb-5">
                    {[0, 1, 2, 3].map(idx => (
                      <button
                        key={idx}
                        onClick={() => setActiveStoryTemplate(idx)}
                        className={`rounded-full transition-all duration-300 cursor-pointer ${
                          activeStoryTemplate === idx 
                            ? 'w-5 h-1.5 bg-gradient-to-r from-[#F25A2B] to-[#7C5CFF]' 
                            : 'w-1.5 h-1.5 bg-ink-3/30 hover:bg-ink-3/50'
                        }`}
                      />
                    ))}
                  </div>

                  {/* Share via Instagram Story Button */}
                  <button 
                    onClick={() => handleShareStory('instagram')}
                    className="w-full flex items-center justify-center gap-2.5 h-12 rounded-xl text-xs font-mono uppercase tracking-widest font-bold bg-gradient-to-r from-[#F25A2B] via-[#D4567A] to-[#7C5CFF] hover:opacity-90 active:scale-95 transition-all text-white shadow-[0_10px_25px_-5px_rgba(242,90,43,0.35)] shrink-0 cursor-pointer"
                  >
                    <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
                    </svg>
                    <span>Share via Instagram Story</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ── LEADERBOARD & FOUNDING ARTISTS SHOWCASE ── */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-12 text-left relative z-20">
            
            {/* LEADERBOARD (7 Columns) */}
            <div className="lg:col-span-7 space-y-6">
              <div className="rounded-[2.5rem] p-[1.5px] bg-gradient-to-b from-[var(--line)] to-transparent shadow-2xl relative overflow-hidden group">
                <div className="bg-bg-card/95 rounded-[2.4rem] p-6 md:p-8 backdrop-blur-xl border border-line-soft">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="font-mono text-[10px] font-bold text-ink-2 uppercase tracking-[0.2em] flex items-center gap-2">
                      <Trophy className="w-3.5 h-3.5 text-[#F25A2B]" /> Founding Leaderboard
                    </h3>
                  </div>

                  <h4 className="text-xl font-display font-black text-ink uppercase tracking-tight mb-4">
                    Top Standing Artists
                  </h4>

                  <div className="overflow-hidden border border-line-soft rounded-2xl bg-black/5 dark:bg-black/25">
                    <div className="max-h-[380px] overflow-y-auto custom-scrollbar">
                      <table className="w-full text-left border-collapse text-[11px] font-mono">
                        <thead>
                          <tr className="border-b border-line-soft bg-black/10 dark:bg-white/[0.02] text-ink-3">
                            <th className="py-2.5 px-4 font-bold uppercase tracking-wider text-[8px]">Rank</th>
                            <th className="py-2.5 px-4 font-bold uppercase tracking-wider text-[8px]">Artist Handle</th>
                            <th className="py-2.5 px-4 font-bold uppercase tracking-wider text-[8px] hidden sm:table-cell">Role</th>
                            <th className="py-2.5 px-4 font-bold uppercase tracking-wider text-[8px] text-right">Points</th>
                          </tr>
                        </thead>
                        <tbody>
                          {leaderboard.length === 0 ? (
                            <tr>
                              <td colSpan={4} className="py-8 text-center text-ink-3">No registrations found</td>
                            </tr>
                          ) : (
                            leaderboard.map((entry, idx) => {
                              const isSelf = entry.username === reservation.username;
                              const rankNum = idx + 1;
                              return (
                                <tr 
                                  key={idx} 
                                  className={`border-b border-line-soft/40 hover:bg-white/[0.02] transition-colors ${
                                    isSelf ? 'bg-gradient-to-r from-[#7C5CFF]/10 to-transparent font-bold text-[var(--ink)]' : 'text-ink-2'
                                  }`}
                                >
                                  <td className="py-3 px-4 flex items-center gap-1.5">
                                    {rankNum === 1 ? '🥇' : rankNum === 2 ? '🥈' : rankNum === 3 ? '🥉' : `#${rankNum}`}
                                    {entry.is_verified && (
                                      <Award className="w-3 h-3 text-[#7C5CFF]" title="Founding Artist" />
                                    )}
                                  </td>
                                  <td className="py-3 px-4 font-display font-bold text-ink">
                                    @{entry.username} {isSelf && <span className="text-[8px] font-mono text-[#7C5CFF] uppercase ml-1">(You)</span>}
                                  </td>
                                  <td className="py-3 px-4 hidden sm:table-cell uppercase text-[9px] opacity-70">
                                    {entry.role || 'Artist'}
                                  </td>
                                  <td className="py-3 px-4 text-right font-bold text-ink">
                                    {entry.points} <span className="text-[9px] text-[#7C5CFF] font-normal">PTS</span>
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* FOUNDING ARTISTS SHOWCASE (5 Columns) */}
            <div className="lg:col-span-5 space-y-6">
              <div className="rounded-[2.5rem] p-[1.5px] bg-gradient-to-b from-[var(--line)] to-transparent shadow-2xl relative overflow-hidden group">
                <div className="bg-bg-card/95 rounded-[2.4rem] p-6 md:p-8 backdrop-blur-xl border border-line-soft">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-mono text-[10px] font-bold text-ink-2 uppercase tracking-[0.2em] flex items-center gap-2">
                      <Award className="w-3.5 h-3.5 text-[#7C5CFF]" /> Founding Artists
                    </h3>
                    <span className="font-mono text-[9px] uppercase font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-[0_0_10px_rgba(16,185,129,0.1)]">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      {totalArtistsCount} / {foundingLimit} Claimed
                    </span>
                  </div>

                  <h4 className="text-xl font-display font-black text-ink uppercase tracking-tight mb-2.5">
                    Founding Cohort
                  </h4>
                  
                  <p className="text-[11px] text-ink-2 leading-relaxed mb-5">
                    Lifetime 0% Platform Fee bookings are reserved for the first 50 Founding Artists who reach 500 PTS. 
                    Once reached 50, the Founding slot limit will raise to 100!
                  </p>

                  {/* Premium Progress Bar */}
                  <div className="mb-6 space-y-1.5">
                    <div className="flex justify-between items-center text-[9px] font-mono text-ink-3 uppercase tracking-wider">
                      <span>Cohort Progress</span>
                      <span className="font-bold text-ink">{Math.round((totalArtistsCount / foundingLimit) * 100)}% Filled</span>
                    </div>
                    <div className="h-1.5 w-full bg-black/10 dark:bg-white/5 rounded-full overflow-hidden border border-line-soft relative">
                      <motion.div 
                        className="h-full rounded-full bg-gradient-to-r from-[#F25A2B] via-[#D4567A] to-[#7C5CFF]"
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(100, Math.max(0, (totalArtistsCount / foundingLimit) * 100))}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                      />
                    </div>
                  </div>

                  {/* Showcase Grid of Founding Artists */}
                  <div className="relative overflow-hidden border border-line-soft rounded-2xl bg-black/5 dark:bg-black/20 p-4 min-h-[240px] flex flex-col justify-center">
                    {foundingArtists.length === 0 ? (
                      <div className="relative flex flex-col items-center justify-center py-6 text-center z-10">
                        {/* Glowing aura */}
                        <div className="absolute w-44 h-44 rounded-full bg-gradient-to-br from-[#7C5CFF]/15 to-[#F25A2B]/5 blur-2xl -z-10 pointer-events-none" />
                        
                        {/* Floating Lock Icon Container */}
                        <motion.div 
                          animate={{ y: [0, -6, 0] }}
                          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                          className="w-14 h-14 rounded-2xl bg-white/[0.03] dark:bg-white/[0.02] border border-white/10 flex items-center justify-center shadow-lg backdrop-blur-md relative mb-4"
                        >
                          {/* Inner pulse */}
                          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#7C5CFF]/20 to-transparent animate-pulse -z-10" />
                          <Lock className="w-6 h-6 text-[#7C5CFF] drop-shadow-[0_0_8px_rgba(124,92,255,0.5)]" />
                        </motion.div>
                        
                        <h5 className="font-display font-black text-xs uppercase text-ink tracking-wider mb-1">
                          Vault is Sealed
                        </h5>
                        <span className="font-mono text-[9px] uppercase tracking-wider text-ink-3 max-w-[240px] mb-6 leading-relaxed">
                          No artists have claimed a founding slot yet. Be the first!
                        </span>

                        {/* Preview of Locked Slots */}
                        <div className="w-full grid grid-cols-2 gap-2 max-w-[320px]">
                          {[1, 2, 3, 4].map((num) => (
                            <div 
                              key={num}
                              className="py-2 px-3 rounded-xl border border-dashed border-line-soft bg-transparent hover:border-[#7C5CFF]/30 hover:bg-white/[0.01] transition-all duration-300 flex items-center gap-2 group cursor-help text-left"
                              title="Reach 500 PTS to unlock this slot"
                            >
                              <div className="w-5 h-5 rounded-full border border-dashed border-line-soft text-[8px] font-mono text-ink-3 flex items-center justify-center group-hover:border-[#7C5CFF]/50 group-hover:text-[#7C5CFF] transition-colors shrink-0">
                                #{num}
                              </div>
                              <div className="truncate">
                                <div className="text-[9px] font-mono text-ink-3 font-semibold group-hover:text-ink-2 transition-colors">
                                  Empty Slot
                                </div>
                                <div className="text-[7px] font-mono text-ink-3 opacity-60">
                                  500 PTS Required
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-2 max-h-[260px] overflow-y-auto custom-scrollbar">
                        {foundingArtists.map((artist, idx) => (
                          <motion.div 
                            key={idx}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            whileHover={{ scale: 1.02, translateY: -2 }}
                            className="p-3 rounded-xl border border-line-soft bg-bg-card hover:bg-bg-card-hover hover:border-[#7C5CFF]/30 flex items-center gap-3 text-left overflow-hidden transition-all duration-200 shadow-sm relative group"
                          >
                            {/* Avatar container with rotating-gradient hover border */}
                            <div className="relative shrink-0">
                              <div className="absolute -inset-0.5 bg-gradient-to-tr from-[#7C5CFF] to-[#F25A2B] rounded-full opacity-40 group-hover:opacity-100 transition-opacity duration-300 blur-[1px]" />
                              <div className="relative w-8 h-8 rounded-full bg-bg flex items-center justify-center font-display font-black text-[10px] text-ink shrink-0 shadow-inner">
                                {artist.username.slice(0, 2).toUpperCase()}
                              </div>
                            </div>
                            
                            <div className="truncate flex-1">
                              <div className="flex items-center gap-1">
                                <span className="font-display font-bold text-[10.5px] text-ink truncate">
                                  @{artist.username}
                                </span>
                                <Award className="w-2.5 h-2.5 text-[#7C5CFF] shrink-0" />
                              </div>
                              <div className="text-[7.5px] font-mono text-ink-3 uppercase tracking-wider">
                                {artist.role || 'Artist'}
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {/* Call-to-action foot note */}
                  <div className="mt-5 p-3.5 rounded-xl bg-gradient-to-r from-[#7C5CFF]/5 to-[#F25A2B]/5 border-l-2 border-[#7C5CFF] text-[9.5px] font-mono text-ink-2 leading-relaxed flex items-start gap-2.5 shadow-sm">
                    <Sparkles className="w-3.5 h-3.5 text-[#7C5CFF] shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-ink font-bold">Want to join the showcase?</strong> Refer peers to earn <span className="text-[#F25A2B] font-bold">+50 PTS</span> per approved invite and complete tasks to unlock your verified stamp!
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </section>

          {/* ── THE ECOSYSTEM ACCESS (STATIC MOCKUP SHOWCASE) ── */}
          <StaticModulesShowcase cohort={cohort} />


      </main>

      {/* ═══ FOOTER BAR ═══ */}
      <footer className="w-full px-8 md:px-16 pt-10 pb-20 md:pb-24 flex flex-col sm:flex-row items-center justify-between gap-6 bg-bg-soft border-t border-line-soft text-ink-2 relative z-10">
        <div className="flex items-center">
          <a href="/" className="inline-block transition-transform duration-300 hover:scale-105 hover:opacity-90 -ml-4 md:-ml-6 -mt-18 -mb-18 md:-mt-24 md:-mb-24">
            <img src="/logo_wordmark.png" alt="ArtisTant" className="w-[180px] md:w-[220px] h-auto object-contain object-left pointer-events-none dark:invert-0 invert" />
          </a>
        </div>
        <div className="flex items-center gap-6">
          <a href="/terms" className="font-mono text-[9px] text-[var(--ink-3)] uppercase tracking-widest font-bold hover:text-[var(--ink)] transition-colors">Terms</a>
          <a href="/privacy" className="font-mono text-[9px] text-[var(--ink-3)] uppercase tracking-widest font-bold hover:text-[var(--ink)] transition-colors">Privacy</a>
          <a href="/" className="font-mono text-[9px] text-[var(--ink-3)] uppercase tracking-widest font-bold hover:text-[var(--ink)] transition-colors flex items-center gap-1.5">
            Home <ExternalLink className="w-3 h-3 text-[#F25A2B]" />
          </a>
          <div className="w-px h-4 bg-[var(--line-soft)]" />
          <a href="https://instagram.com/artistant.in" target="_blank" rel="noopener noreferrer" className="font-mono text-[9px] text-[var(--ink-3)] uppercase tracking-widest font-bold hover:text-[var(--ink)] transition-colors flex items-center gap-1.5">
            <InstagramIcon className="w-3 h-3 text-[#F25A2B]" /> Instagram
          </a>
          <a href="https://www.linkedin.com/company/artistantco/" target="_blank" rel="noopener noreferrer" className="font-mono text-[9px] text-[var(--ink-3)] uppercase tracking-widest font-bold hover:text-[var(--ink)] transition-colors flex items-center gap-1.5">
            <LinkedinIcon className="w-3 h-3 text-[#7C5CFF]" /> LinkedIn
          </a>
        </div>
      </footer>

      {/* ── STICKY CINEMATIC BANNER ── */}
      <div className="fixed bottom-0 left-0 w-full h-12 md:h-14 z-50 flex items-center justify-center border-t border-[var(--line-soft)] bg-bg/80 backdrop-blur-md overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={textIndex}
            initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -10, filter: 'blur(4px)' }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="absolute w-full text-center flex items-center justify-center gap-2"
          >
            {CINEMATIC_FEATURES[textIndex].isLogo ? (
              <img src="/logo_wordmark.png" alt="ArtisTant" className="h-8 md:h-10 w-auto object-contain opacity-90 drop-shadow-lg dark:invert-0 invert" />
            ) : (
              <div className="flex items-center gap-2 md:gap-3 px-4">
                <span className="font-display text-[10px] md:text-xs font-black tracking-widest uppercase text-transparent bg-clip-text whitespace-nowrap" style={{ 
                  backgroundImage: 'linear-gradient(135deg, #F25A2B 0%, #D4567A 50%, #7C5CFF 100%)' 
                }}>
                  {CINEMATIC_FEATURES[textIndex].title}
                </span>
                <span className="hidden md:inline-block w-1 h-1 rounded-full bg-[var(--ink)]/30" />
                <span className="hidden md:inline-block text-[var(--ink-2)] font-mono text-[10px] uppercase tracking-wider whitespace-nowrap opacity-70">
                  {CINEMATIC_FEATURES[textIndex].desc}
                </span>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {activeInfo && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveInfo(null)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md overflow-hidden rounded-[2rem] border border-[var(--line-soft)] bg-[var(--bg-elevated)] p-6 shadow-2xl relative text-left"
            >
              <button 
                onClick={() => setActiveInfo(null)}
                className="absolute top-4 right-4 text-[var(--ink-3)] hover:text-[var(--ink)] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              {activeInfo === 'why-refer' && (
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#F25A2B]/10 flex items-center justify-center border border-[#F25A2B]/20">
                    <Users className="w-6 h-6 text-[#F25A2B]" />
                  </div>
                  <h4 className="font-display font-black text-xl text-[var(--ink)] uppercase tracking-tight">Why Refer Peers?</h4>
                  <p className="text-xs text-[var(--ink-2)] leading-relaxed">
                    Inviting active performers is the single best way to fast-track your priority standing. When verified peers join using your referral link:
                  </p>
                  <ul className="space-y-2.5">
                    <li className="flex items-start gap-2 text-xs text-[var(--ink)]">
                      <span className="text-[#F25A2B] font-bold font-mono">✔</span>
                      <span><strong>Dynamic Waitlist Boost:</strong> Earn +50 PTS per verified peer to climb ranks and secure Cohort 1.</span>
                    </li>
                    <li className="flex items-start gap-2 text-xs text-[var(--ink)]">
                      <span className="text-[#F25A2B] font-bold font-mono">✔</span>
                      <span><strong>0% Platform Fee:</strong> Secure lifetime 0% platform fee bookings (exclusive to the first 50 Founding Artists who reach 500 PTS).</span>
                    </li>
                    <li className="flex items-start gap-2 text-xs text-[var(--ink)]">
                      <span className="text-[#F25A2B] font-bold font-mono">✔</span>
                      <span><strong>Founding Badge:</strong> Get a verified Founding Artist stamp on your profile at 500 PTS.</span>
                    </li>
                  </ul>
                </div>
              )}
              {activeInfo === 'why-stories' && (
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#7C5CFF]/10 flex items-center justify-center border border-[#7C5CFF]/20">
                    <Sparkles className="w-6 h-6 text-[#7C5CFF]" />
                  </div>
                  <h4 className="font-display font-black text-xl text-[var(--ink)] uppercase tracking-tight">Why Share Stories?</h4>
                  <p className="text-xs text-[var(--ink-2)] leading-relaxed">
                    Sharing your Founding Member Card visual on Instagram/WhatsApp works as a highly engaging invite certificate:
                  </p>
                  <ul className="space-y-2.5">
                    <li className="flex items-start gap-2 text-xs text-[var(--ink)]">
                      <span className="text-[#7C5CFF] font-bold font-mono">✔</span>
                      <span><strong>Earn 80 PTS:</strong> Complete the task to jump up the waitlist ranks instantly.</span>
                    </li>
                    <li className="flex items-start gap-2 text-xs text-[var(--ink)]">
                      <span className="text-[#7C5CFF] font-bold font-mono">✔</span>
                      <span><strong>Tag Requirement:</strong> Tag/mention **@artistant** and include your referral link so peers can sign up.</span>
                    </li>
                    <li className="flex items-start gap-2 text-xs text-[var(--ink)]">
                      <span className="text-[#7C5CFF] font-bold font-mono">✔</span>
                      <span><strong>Establish Social Authority:</strong> Showcase your exclusive Founding Waitlist rank position.</span>
                    </li>
                  </ul>
                </div>
              )}
              {activeInfo === 'vouch-points' && (
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#D4567A]/10 flex items-center justify-center border border-[#D4567A]/20">
                    <Trophy className="w-6 h-6 text-[#D4567A]" />
                  </div>
                  <h4 className="font-display font-black text-xl text-[var(--ink)] uppercase tracking-tight">How Founding Points Work</h4>
                  <p className="text-xs text-[var(--ink-2)] leading-relaxed">
                    Your Founding Points represent your network standing:
                  </p>
                  <ul className="space-y-2.5">
                    <li className="flex items-start gap-2 text-xs text-[var(--ink)]">
                      <span className="text-[#D4567A] font-bold font-mono">✔</span>
                      <span><strong>100 PTS Base:</strong> Automatically unlocked upon reserving your handle.</span>
                    </li>
                    <li className="flex items-start gap-2 text-xs text-[var(--ink)]">
                      <span className="text-[#D4567A] font-bold font-mono">✔</span>
                      <span><strong>+50 PTS Per Verified Referral:</strong> Earned when a referred peer artist is verified by our team.</span>
                    </li>
                    <li className="flex items-start gap-2 text-xs text-[var(--ink)]">
                      <span className="text-[#D4567A] font-bold font-mono">✔</span>
                      <span><strong>+80 PTS Story Share Task:</strong> Earned by sharing your founding visual on social media.</span>
                    </li>
                    <li className="flex items-start gap-2 text-xs text-[var(--ink)]">
                      <span className="text-[#D4567A] font-bold font-mono">✔</span>
                      <span><strong>250 PTS Cohort 1 Eligibility:</strong> Hit 250 points to qualify for Cohort 1 consideration (includes first gig platform fee waived).</span>
                    </li>
                    <li className="flex items-start gap-2 text-xs text-[var(--ink)]">
                      <span className="text-[#D4567A] font-bold font-mono">✔</span>
                      <span><strong>500 PTS Founding Artist Badge:</strong> Unlocks the verified Founding Artist Badge permanently.</span>
                    </li>
                  </ul>
                </div>
              )}
              {activeInfo === 'how-cohorts' && (
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#7C5CFF]/10 flex items-center justify-center border border-[#7C5CFF]/20">
                    <Lock className="w-6 h-6 text-[#7C5CFF]" />
                  </div>
                  <h4 className="font-display font-black text-xl text-[var(--ink)] uppercase tracking-tight">How Cohorts Work</h4>
                  <p className="text-xs text-[var(--ink-2)] leading-relaxed">
                    Cohorts represent rollout phases based on your points leaderboard ranking:
                  </p>
                  <ul className="space-y-2.5">
                    <li className="flex items-start gap-2 text-xs text-[var(--ink)]">
                      <span className="text-[#7C5CFF] font-bold font-mono">✔</span>
                      <span><strong>Cohort 001 (Immediate Access):</strong> Assigned to the top 100 rank holders. Includes early beta entry and first gig platform fee waived.</span>
                    </li>
                    <li className="flex items-start gap-2 text-xs text-[var(--ink)]">
                      <span className="text-[#7C5CFF] font-bold font-mono">✔</span>
                      <span><strong>Cohort 002 & 003:</strong> Access is unlocked sequentially (Cohort 2 for ranks 101-300; Cohort 3 for ranks 301+).</span>
                    </li>
                    <li className="flex items-start gap-2 text-xs text-[var(--ink)]">
                      <span className="text-[#7C5CFF] font-bold font-mono">✔</span>
                      <span><strong>Dynamic Competition:</strong> Since other users are earning points, they can surpass you. **To stay in Cohort 1, you must keep referring and accumulating points!**</span>
                    </li>
                  </ul>
                </div>
              )}
              {activeInfo === 'founding-artist-badge' && (
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#7C5CFF]/10 flex items-center justify-center border border-[#7C5CFF]/20">
                    <Award className="w-6 h-6 text-[#7C5CFF]" />
                  </div>
                  <h4 className="font-display font-black text-xl text-[var(--ink)] uppercase tracking-tight">Founding Artist Badge</h4>
                  <p className="text-xs text-[var(--ink-2)] leading-relaxed">
                    Reach **500 PTS** (via verified referrals and tasks) to unlock the permanent verified **Founding Artist** tier.
                  </p>
 
                  <div className="bg-black/5 dark:bg-white/[0.02] border border-line-soft rounded-2xl p-4 space-y-3">
                    <h5 className="font-mono text-[9px] uppercase tracking-wider text-ink-3 font-bold">Acquisition Benefits:</h5>
                    <ul className="space-y-2.5">
                      <li className="flex items-start gap-2 text-xs text-[var(--ink)]">
                        <span className="text-[#34D399] font-bold font-mono">✔</span>
                        <span><strong>Permanent Profile Badge:</strong> Carries over directly to your public profile in the live app at launch.</span>
                      </li>
                      <li className="flex items-start gap-2 text-xs text-[var(--ink)]">
                        <span className="text-[#34D399] font-bold font-mono">✔</span>
                        <span><strong>0% Platform Fee Bookings:</strong> Pay zero platform fees forever (exclusive to the first 50 Founding Artists who reach 500 PTS!).</span>
                      </li>
                      <li className="flex items-start gap-2 text-xs text-[var(--ink)]">
                        <span className="text-[#34D399] font-bold font-mono">✔</span>
                        <span><strong>Priority Search Visibility:</strong> High-priority placement in client discovery match feeds.</span>
                      </li>
                      <li className="flex items-start gap-2 text-xs text-[var(--ink)]">
                        <span className="text-[#34D399] font-bold font-mono">✔</span>
                        <span><strong>Beta Backstage Access:</strong> First-dibs access keys to test & use the premium software.</span>
                      </li>
                      <li className="flex items-start gap-2 text-xs text-[var(--ink)]">
                        <span className="text-[#34D399] font-bold font-mono">✔</span>
                        <span><strong>Founding Welcome Kit:</strong> Unlocks a custom welcome pack with event tickets/passes.</span>
                      </li>
                    </ul>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isCustomizerOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCustomizerOpen(false)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 20, opacity: 0 }}
              transition={{ type: 'spring', duration: 0.5 }}
              onClick={(e) => e.stopPropagation()}
              className={`relative w-full max-w-6xl h-[90vh] md:h-[85vh] rounded-[2.5rem] overflow-hidden flex flex-col md:flex-row shadow-[0_30px_90px_rgba(0,0,0,0.8)] border ${
                isLight ? 'bg-[#F9F9FB] border-[#7C5CFF]/15' : 'bg-[#050508] border-white/10'
              }`}
            >
              {/* Close Button */}
              <button 
                onClick={() => setIsCustomizerOpen(false)}
                className={`absolute top-6 right-6 z-50 p-2.5 rounded-xl border transition-all cursor-pointer ${
                  isLight 
                    ? 'bg-black/5 border-black/10 text-black/70 hover:text-black hover:bg-black/10' 
                    : 'bg-white/5 border-white/10 text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                <X className="w-5 h-5" />
              </button>

              {/* LEFT SIDE: LIVE PREVIEW */}
              <div className={`w-full md:w-[45%] flex flex-col items-center justify-center p-8 select-none relative ${
                isLight ? 'bg-[#F0EFF4] border-r border-[#7C5CFF]/10' : 'bg-[#020204] border-r border-white/5'
              }`}>
                <div className="absolute top-6 left-8">
                  <h3 className={`text-xs font-bold uppercase font-mono tracking-widest ${isLight ? 'text-[#7C5CFF]' : 'text-transparent bg-clip-text bg-gradient-to-r from-[#F25A2B] to-[#7C5CFF]'}`}>
                    Live Preview
                  </h3>
                  <p className={`text-[9px] font-mono mt-0.5 ${isLight ? 'text-black/40' : 'text-white/40'}`}>Real-time portfolio rendering</p>
                </div>
                
                <div className="scale-[0.8] sm:scale-[0.85] md:scale-95 lg:scale-100 transition-all mt-6">
                  {renderMobilePreview()}
                </div>
              </div>

              {/* RIGHT SIDE: SETTINGS FORM (Scrollable) */}
              <div className="w-full md:w-[55%] h-full overflow-y-auto p-6 md:p-10 space-y-8 text-left scrollbar-none">
                <div className="pb-2 border-b border-[var(--line-soft)]">
                  <h2 className={`text-2xl font-black uppercase font-display tracking-tight ${isLight ? 'text-black' : 'text-white'}`}>
                    Edit Portfolio Profile
                  </h2>
                  <p className={`text-xs mt-1 ${isLight ? 'text-black/50' : 'text-white/50'}`}>
                    Customize your public page, reorder sections, and configure contact options.
                  </p>
                </div>

                {/* 1. PROFILE CUSTOMIZER CARD PANEL (Without icon) */}
                <div className={`p-6 rounded-3xl border ${isLight ? 'bg-white border-[#7C5CFF]/10 shadow-[0_8px_30px_rgba(124,92,255,0.08)]' : 'bg-[#0A0A0F] border-white/5 shadow-[0_8px_30px_rgba(0,0,0,0.4)]'} space-y-6 text-left`}>
                  <div className="flex items-center gap-2 pb-4 border-b border-[var(--line-soft)]">
                    <h3 className="text-base font-bold text-[var(--ink)]">Customize Portfolio</h3>
                  </div>

                  {/* Profile Photo */}
                  <div className="flex items-center gap-4">
                    <div className="relative group">
                      <div className={`w-16 h-16 rounded-xl overflow-hidden border ${reservation.profile_photo_url ? 'border-[#7C5CFF]/20' : 'border-dashed border-[var(--ink-3)]/30'} flex items-center justify-center shrink-0 bg-white/[0.02]`}>
                        {reservation.profile_photo_url ? (
                          <img src={reservation.profile_photo_url} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-xl font-black text-[var(--ink-3)]">{displayName[0]?.toUpperCase() || reservation.username[0].toUpperCase()}</span>
                        )}
                      </div>
                      <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                        <Camera className="w-4 h-4 text-white" />
                        <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file || !user) return;
                          try {
                            const reader = new FileReader();
                            reader.onload = async (ev) => {
                              const base64 = ev.target?.result as string;
                              if (!base64) return;
                              showToast('Uploading photo...');
                              const idToken = await user.getIdToken();
                              const ext = file.name.split('.').pop() || 'jpg';
                              const publicUrl = await uploadProfilePhotoAction(idToken, base64, ext);
                              setReservation({ ...reservation, profile_photo_url: publicUrl });
                              showToast('Profile photo updated!');
                            };
                            reader.readAsDataURL(file);
                          } catch (err) { console.error(err); showToast('Upload failed'); }
                        }} />
                      </label>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[var(--ink)]">Artist Photo</h4>
                      <p className="text-[10px] text-[var(--ink-2)] mt-0.5">Hover & click to upload/change photo</p>
                    </div>
                  </div>

                  {/* Details inputs */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Display Name */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-[var(--ink-2)] uppercase tracking-wider font-mono">Display Name</label>
                      <input
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="e.g. Anudeep Dash"
                        className="bg-[var(--line-soft)] border border-[var(--line)] rounded-xl px-3 py-2 text-xs text-[var(--ink)] focus:outline-none focus:border-[#7C5CFF] font-sans"
                      />
                    </div>

                    {/* Category dropdown */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-[var(--ink-2)] uppercase tracking-wider font-mono">Artist Type / Category</label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="bg-[var(--line-soft)] border border-[var(--line)] rounded-xl px-3 py-2 text-xs text-[var(--ink)] focus:outline-none focus:border-[#7C5CFF]"
                      >
                        <option value="singer">Singer</option>
                        <option value="dj">DJ</option>
                        <option value="band">Band</option>
                        <option value="comedian">Comedian</option>
                        <option value="dancer">Dancer</option>
                        <option value="mc_rapper">MC / Rapper</option>
                        <option value="instrumentalist">Instrumentalist</option>
                        <option value="other">Other / Custom</option>
                      </select>
                    </div>

                    {/* City */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-[var(--ink-2)] uppercase tracking-wider font-mono">Base City</label>
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="e.g. Pune, India"
                        className="bg-[var(--line-soft)] border border-[var(--line)] rounded-xl px-3 py-2 text-xs text-[var(--ink)] focus:outline-none focus:border-[#7C5CFF]"
                      />
                    </div>

                    {/* Social Instagram */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-[var(--ink-2)] uppercase tracking-wider font-mono">Instagram</label>
                      <div className="flex items-center bg-[var(--line-soft)] border border-[var(--line)] rounded-xl px-3 py-2 focus-within:border-[#7C5CFF] transition-all">
                        <InstagramIcon className="w-4 h-4 text-[#E1306C] shrink-0 mr-2" />
                        <span className="text-[var(--ink-3)] text-xs select-none font-mono mr-0.5 shrink-0">instagram.com/</span>
                        <input
                          type="text"
                          value={getInstagramHandle(instagramUrl)}
                          onChange={(e) => setInstagramUrl(makeInstagramUrl(e.target.value))}
                          placeholder="username"
                          className="flex-1 bg-transparent border-none p-0 text-xs text-[var(--ink)] placeholder-[var(--ink-3)]/50 focus:ring-0 focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Social Spotify */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-[var(--ink-2)] uppercase tracking-wider font-mono">Spotify</label>
                      <div className="flex items-center bg-[var(--line-soft)] border border-[var(--line)] rounded-xl px-3 py-2 focus-within:border-[#7C5CFF] transition-all">
                        <SpotifyIcon className="w-4 h-4 text-[#1DB954] shrink-0 mr-2" />
                        <span className="text-[var(--ink-3)] text-xs select-none font-mono mr-0.5 shrink-0">open.spotify.com/artist/</span>
                        <input
                          type="text"
                          value={getSpotifyHandle(spotifyUrl)}
                          onChange={(e) => setSpotifyUrl(makeSpotifyUrl(e.target.value))}
                          placeholder="artist_id"
                          className="flex-1 bg-transparent border-none p-0 text-xs text-[var(--ink)] placeholder-[var(--ink-3)]/50 focus:ring-0 focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Social YouTube */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-[var(--ink-2)] uppercase tracking-wider font-mono">YouTube</label>
                      <div className="flex items-center bg-[var(--line-soft)] border border-[var(--line)] rounded-xl px-3 py-2 focus-within:border-[#7C5CFF] transition-all">
                        <YouTubeIcon className="w-4 h-4 text-[#FF0000] shrink-0 mr-2" />
                        <span className="text-[var(--ink-3)] text-xs select-none font-mono mr-0.5 shrink-0">youtube.com/@</span>
                        <input
                          type="text"
                          value={getYoutubeHandle(youtubeUrl)}
                          onChange={(e) => setYoutubeUrl(makeYoutubeUrl(e.target.value))}
                          placeholder="channel"
                          className="flex-1 bg-transparent border-none p-0 text-xs text-[var(--ink)] placeholder-[var(--ink-3)]/50 focus:ring-0 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Bio */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-[var(--ink-2)] uppercase tracking-wider font-mono">Artist Bio</label>
                    <textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value.slice(0, 150))}
                      placeholder="Tell clients about your work, instruments, performance packages..."
                      rows={3}
                      className="bg-[var(--line-soft)] border border-[var(--line)] rounded-xl px-3 py-2 text-xs text-[var(--ink)] focus:outline-none focus:border-[#7C5CFF] font-sans"
                    />
                    <span className="text-[9px] text-[var(--ink-3)] text-right">{bio.length}/150 characters</span>
                  </div>

                  {/* Genres Tag editor */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-[var(--ink-2)] uppercase tracking-wider font-mono">Genre Tags (Max 3)</label>
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {genres.map((g) => (
                        <span key={g} className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-[#7C5CFF]/15 text-[#B49FFF] border border-[#7C5CFF]/20 flex items-center gap-1 font-mono">
                          {g}
                          <button onClick={() => setGenres(genres.filter(genre => genre !== g))} className="text-[10px] hover:text-white">&times;</button>
                        </span>
                      ))}
                    </div>
                    {genres.length < 3 && (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newGenreInput}
                          onChange={(e) => setNewGenreInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              const val = newGenreInput.trim();
                              if (val && !genres.includes(val)) {
                                setGenres([...genres, val]);
                                setNewGenreInput('');
                              }
                            }
                          }}
                          placeholder="Type tag & press enter"
                          className="flex-1 bg-[var(--line-soft)] border border-[var(--line)] rounded-xl px-3 py-2 text-xs text-[var(--ink)] focus:outline-none focus:border-[#7C5CFF] font-sans"
                        />
                        <button
                          onClick={() => {
                            const val = newGenreInput.trim();
                            if (val && !genres.includes(val)) {
                              setGenres([...genres, val]);
                              setNewGenreInput('');
                            }
                          }}
                          className="bg-[var(--ink)] text-[var(--bg)] px-3 py-2 rounded-xl text-xs font-bold hover:scale-105 transition-transform"
                        >
                          Add
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      disabled={isSaving}
                      onClick={handleSaveProfileDetails}
                      className="px-6 py-2.5 rounded-xl text-xs font-bold bg-white text-black hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                    >
                      {isSaving ? 'Saving...' : 'Save Profile details'}
                    </button>
                  </div>
                </div>

                {/* 2. Section Reordering Card (Without icon) */}
                <div className={`p-6 rounded-3xl border ${isLight ? 'bg-white border-[#7C5CFF]/10 shadow-[0_8px_30px_rgba(124,92,255,0.08)]' : 'bg-[#0A0A0F] border-white/5 shadow-[0_8px_30px_rgba(0,0,0,0.4)]'} space-y-4 text-left`}>
                  <div className="flex items-center gap-2 pb-2">
                    <h3 className="text-base font-bold text-[var(--ink)]">Section Reordering</h3>
                  </div>
                  <p className="text-[11px] text-[var(--ink-2)]">Shift sections up or down to re-arrange how they appear on your public portfolio page.</p>
                  
                  <div className="space-y-2">
                    {sectionOrder.map((section, idx) => {
                      const sectionNames: Record<string, string> = {
                        gallery: 'Gig Gallery',
                        video: 'Featured Video',
                        audio: 'Audio Samples',
                      };
                      return (
                        <div 
                          key={section} 
                          className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.01] border border-white/[0.03]"
                        >
                          <span className="text-xs font-bold text-white/80">{sectionNames[section] || section}</span>
                          <div className="flex items-center gap-1">
                            <button
                              disabled={idx === 0}
                              onClick={() => moveSection(idx, 'up')}
                              className="w-7 h-7 rounded-lg flex items-center justify-center bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none transition-colors text-xs"
                            >
                              &uarr;
                            </button>
                            <button
                              disabled={idx === sectionOrder.length - 1}
                              onClick={() => moveSection(idx, 'down')}
                              className="w-7 h-7 rounded-lg flex items-center justify-center bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none transition-colors text-xs"
                            >
                              &darr;
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Founding Card Toggle Card */}
                <div className={`p-6 rounded-3xl border ${isLight ? 'bg-white border-[#7C5CFF]/10 shadow-[0_8px_30px_rgba(124,92,255,0.08)]' : 'bg-[#0A0A0F] border-white/5 shadow-[0_8px_30px_rgba(0,0,0,0.4)]'} space-y-4 text-left`}>
                  <div className="flex items-center gap-2 pb-2">
                    <h3 className="text-base font-bold text-[var(--ink)]">Founding Card Feature</h3>
                  </div>
                  <p className="text-[11px] text-[var(--ink-2)]">Showcase your digital Founding Artist Pass certificate directly on your public portfolio page.</p>
                  
                  <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/[0.01] border border-white/[0.03]">
                    <span className="text-xs font-bold text-white/80">Feature Founding Card</span>
                    <button
                      onClick={() => handleToggleFeatureFoundingCard(!featureFoundingCard)}
                      className={`w-10 h-6 rounded-full p-1 transition-colors duration-200 focus:outline-none ${featureFoundingCard ? 'bg-[#7C5CFF]' : 'bg-white/10'}`}
                    >
                      <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 ${featureFoundingCard ? 'translate-x-4' : 'translate-x-0'}`} />
                    </button>
                  </div>
                </div>

                {/* 3. Contact Settings Card (Without icon) */}
                <div className={`p-6 rounded-3xl border ${isLight ? 'bg-white border-[#7C5CFF]/10 shadow-[0_8px_30px_rgba(124,92,255,0.08)]' : 'bg-[#0A0A0F] border-white/5 shadow-[0_8px_30px_rgba(0,0,0,0.4)]'} space-y-4 text-left`}>
                  <div className="flex items-center gap-2 pb-2">
                    <h3 className="text-base font-bold text-[var(--ink)]">Contact Options</h3>
                  </div>
                  <p className="text-[11px] text-[var(--ink-2)]">Enable buttons on your public profile so clients can call, message, or email you directly.</p>

                  <div className="space-y-4">
                    {/* Email settings */}
                    <div className="flex flex-col gap-2 p-3.5 rounded-2xl bg-white/[0.01] border border-white/[0.03]">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold">Email Contact Button</span>
                        <button
                          onClick={() => setContactEmailEnabled(!contactEmailEnabled)}
                          className={`w-10 h-6 rounded-full p-1 transition-colors duration-200 focus:outline-none ${contactEmailEnabled ? 'bg-[#7C5CFF]' : 'bg-white/10'}`}
                        >
                          <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 ${contactEmailEnabled ? 'translate-x-4' : 'translate-x-0'}`} />
                        </button>
                      </div>
                      {contactEmailEnabled && (
                        <input
                          type="email"
                          value={contactEmail}
                          onChange={(e) => setContactEmail(e.target.value)}
                          placeholder="Verify contact email"
                          className="bg-[var(--line-soft)] border border-[var(--line)] rounded-xl px-3 py-2 text-xs text-[var(--ink)] focus:outline-none focus:border-[#7C5CFF] mt-1 font-sans"
                        />
                      )}
                    </div>

                    {/* Phone settings */}
                    <div className="flex flex-col gap-2 p-3.5 rounded-2xl bg-white/[0.01] border border-white/[0.03]">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold">Phone Contact Button</span>
                        <button
                          onClick={() => setContactPhoneEnabled(!contactPhoneEnabled)}
                          className={`w-10 h-6 rounded-full p-1 transition-colors duration-200 focus:outline-none ${contactPhoneEnabled ? 'bg-[#7C5CFF]' : 'bg-white/10'}`}
                        >
                          <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 ${contactPhoneEnabled ? 'translate-x-4' : 'translate-x-0'}`} />
                        </button>
                      </div>
                      {contactPhoneEnabled && (
                        <input
                          type="text"
                          value={contactPhone}
                          onChange={(e) => setContactPhone(e.target.value)}
                          placeholder="Verify phone number (e.g. +919900000000)"
                          className="bg-[var(--line-soft)] border border-[var(--line)] rounded-xl px-3 py-2 text-xs text-[var(--ink)] focus:outline-none focus:border-[#7C5CFF] mt-1 font-sans"
                        />
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      disabled={isSaving}
                      onClick={handleSaveContactSettings}
                      className="px-6 py-2.5 rounded-xl text-xs font-bold bg-white text-black hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                    >
                      {isSaving ? 'Saving...' : 'Save Contact settings'}
                    </button>
                  </div>
                </div>

              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
