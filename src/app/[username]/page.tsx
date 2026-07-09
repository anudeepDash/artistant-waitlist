'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, useMotionValueEvent } from 'motion/react';
import { useAuth } from '@/hooks/useAuth';
import { getUserReservation, getWaitlistPosition, getReferralCount, type WaitlistEntry } from '@/lib/waitlist';
import { signOut } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import {
  Lock, Check, LogOut, CheckCircle, Copy, Sparkles, Award, Shield, Zap,
  Star, Calendar, Users, MessageSquare, TrendingUp, Gift, ChevronRight,
  ExternalLink, DownloadCloud, Smartphone, HelpCircle, Trophy
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

/* ═══════════════════════════════════════════════════
   SCROLL CONVERGENCE MOCKUP SHOWCASE
   ═══════════════════════════════════════════════════ */

function StaticModulesShowcase({ cohort }: { cohort: string }) {
  return (
    <div className="relative w-full py-20 bg-black rounded-[3rem] border border-white/5 overflow-hidden my-12 flex flex-col items-center">
      
      {/* Subtle grid background */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{
        backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
        backgroundSize: '30px 30px'
      }} />

      {/* Title above */}
      <div className="text-center px-4 mb-16 relative z-30">
        <span className="font-mono text-[9px] text-[#7C5CFF] uppercase tracking-[0.25em] font-bold">Consolidated Ecosystem</span>
        <h2 className="font-display font-black text-2xl md:text-3xl text-white uppercase tracking-tight mt-1">Unlocking Modules</h2>
        <p className="text-[10px] font-mono text-[#9BA4B8] mt-1.5 uppercase tracking-wider">All direct routing, calendars & safe escrow in one creative hub</p>
      </div>

      {/* Mockups Container */}
      <div className="relative w-full max-w-4xl h-[450px] flex items-center justify-center scale-[0.55] sm:scale-80 md:scale-[0.9] lg:scale-100 transition-all z-10">
        
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


    </div>
  );
}

/* ═══════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════ */

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
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [activeStoryTemplate, setActiveStoryTemplate] = useState<number>(0);

  // 3D Card Hover Effect state
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [sheenX, setSheenX] = useState(50);
  const [sheenY, setSheenY] = useState(50);

  // Points & Cohort system
  const points = 100 + referrals * 50;
  const targetPoints = 250;
  const isCohort1 = points >= targetPoints;
  const progressPercentage = Math.min(100, ((points - 100) / (targetPoints - 100)) * 100);
  const referralsNeeded = Math.max(0, 3 - referrals);
  const cohort = waitlistPos ? Math.ceil(waitlistPos / 100).toString().padStart(3, '0') : '003';

  // ── Cinematic Bottom Ticker Timer ──
  useEffect(() => {
    const interval = setInterval(() => {
      setTextIndex((prev) => (prev + 1) % CINEMATIC_FEATURES.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // ── Auth + Data fetch ──
  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.push('/?auth=true'); return; }

    getUserReservation(user.uid)
      .then(async (res) => {
        if (!res) { router.push('/'); return; }
        setReservation(res);
        try { setReferrals(await getReferralCount(res.username)); } catch { setReferrals(0); }
        try { setWaitlistPos(await getWaitlistPosition(res.reserved_at, user.uid, res.position_override)); } catch {}
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [user, authLoading, router]);

  // ── Profile menu outside click ──
  useEffect(() => {
    if (!profileMenuOpen) return;
    const close = () => setProfileMenuOpen(false);
    window.addEventListener('click', close);
    return () => window.removeEventListener('click', close);
  }, [profileMenuOpen]);

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

  const handleDownloadStory = async (templateId: number = activeStoryTemplate) => {
    if (!reservation) return;
    showToast("Generating high-res story pass...");
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 1080;
      canvas.height = 1920;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error("Could not get 2d context");

      // Common Background Base
      ctx.fillStyle = '#050505';
      ctx.fillRect(0, 0, 1080, 1920);

      // Grid Layout Overlay
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.015)';
      ctx.lineWidth = 1;
      for (let x = 0; x < canvas.width; x += 80) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += 80) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
      }

      // Reusable 3D tilted card drawer
      const draw3DCard = (x: number, y: number, w: number, h: number, bgStyle: string | CanvasGradient, borderStyle: string, textColor: string) => {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(-0.06); // slight rotation angle
        ctx.transform(0.96, 0.04, -0.04, 0.9, 0, 0); // 3D skew perspective matrix

        // Backdrop
        ctx.fillStyle = bgStyle;
        ctx.beginPath();
        ctx.roundRect(-w / 2, -h / 2, w, h, 40);
        ctx.fill();

        // Highlight stroke border
        ctx.strokeStyle = borderStyle;
        ctx.lineWidth = 3;
        ctx.stroke();

        // Concentric radar lines behind
        ctx.strokeStyle = textColor === '#FFFFFF' ? 'rgba(255, 255, 255, 0.015)' : 'rgba(124, 92, 255, 0.04)';
        ctx.beginPath(); ctx.arc(150, 50, 200, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.arc(150, 50, 100, 0, Math.PI * 2); ctx.stroke();

        // Top Row
        ctx.fillStyle = textColor;
        ctx.font = 'bold 22px monospace';
        ctx.textAlign = 'left';
        ctx.fillText('PIONEER PASSPORT', -w / 2 + 45, -h / 2 + 65);

        ctx.textAlign = 'right';
        ctx.fillText(`COHORT ${cohort}`, w / 2 - 45, -h / 2 + 65);

        // Center Position Rank
        ctx.textAlign = 'center';
        ctx.font = '900 120px "Space Grotesk", sans-serif';
        ctx.fillText(`#${waitlistPos || '---'}`, 0, 30);

        ctx.font = 'bold 18px monospace';
        ctx.fillStyle = textColor === '#FFFFFF' ? 'rgba(255,255,255,0.4)' : 'rgba(15,15,20,0.4)';
        ctx.fillText('WAITLIST POSITION RANK', 0, 85);

        // Bottom Row
        ctx.textAlign = 'left';
        ctx.fillStyle = textColor;
        ctx.font = 'bold 38px "Space Grotesk", sans-serif';
        ctx.fillText(`@${reservation.username}`, -w / 2 + 45, h / 2 - 75);
        ctx.font = 'bold 15px monospace';
        ctx.fillStyle = textColor === '#FFFFFF' ? 'rgba(255,255,255,0.4)' : 'rgba(15,15,20,0.4)';
        ctx.fillText('VERIFIED PIONEER NODE', -w / 2 + 45, h / 2 - 45);

        // Barcode
        ctx.textAlign = 'right';
        ctx.fillStyle = textColor === '#FFFFFF' ? 'rgba(255,255,255,0.15)' : 'rgba(124,92,255,0.2)';
        ctx.font = 'bold 22px monospace';
        ctx.fillText('||||| | |||| | |||', w / 2 - 45, h / 2 - 50);

        ctx.restore();
      };

      if (templateId === 0) {
        // TEMPLATE 0: DARK PREMIUM
        const bgGrad = ctx.createLinearGradient(0, 0, 1080, 1920);
        bgGrad.addColorStop(0, '#101015');
        bgGrad.addColorStop(1, '#050507');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, 1080, 1920);

        // Glowing backdrop
        const glow = ctx.createRadialGradient(540, 960, 0, 540, 960, 900);
        glow.addColorStop(0, 'rgba(242, 90, 43, 0.12)');
        glow.addColorStop(1, 'transparent');
        ctx.fillStyle = glow;
        ctx.fillRect(0, 0, 1080, 1920);

        // Draw 3D Card
        draw3DCard(540, 580, 800, 500, 'rgba(255,255,255,0.02)', 'rgba(255,255,255,0.08)', '#FFFFFF');

        // Middle Statement
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '900 52px "Space Grotesk", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('I HAVE OPTED FOR', 540, 1050);
        ctx.fillText('NO MIDDLEMEN.', 540, 1130);

        ctx.fillStyle = '#F25A2B';
        ctx.font = 'bold 22px monospace';
        ctx.fillText('• commission-free direct booking •', 540, 1210);

        // Features List
        const feats = [
          "Direct client-to-artist routing",
          "GigSafe security deposit escrow",
          "Auto-synced availability booking"
        ];
        ctx.font = 'bold 26px monospace';
        ctx.fillStyle = '#9BA4B8';
        feats.forEach((feat, idx) => {
          ctx.fillText(`[✔] ${feat.toUpperCase()}`, 540, 1320 + idx * 75);
        });

      } else if (templateId === 1) {
        // TEMPLATE 1: BRAND GRADIENT (Rebel Poster style)
        const grad = ctx.createLinearGradient(0, 0, 1080, 1920);
        grad.addColorStop(0, '#F25A2B');
        grad.addColorStop(1, '#7C5CFF');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 1080, 1920);

        // Subtle dark wash overlay
        ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
        ctx.fillRect(0, 0, 1080, 1920);

        // Draw Tilted Card with gradient background
        const cardGrad = ctx.createLinearGradient(-400, -250, 400, 250);
        cardGrad.addColorStop(0, 'rgba(25,25,30,0.85)');
        cardGrad.addColorStop(1, 'rgba(10,10,12,0.95)');
        draw3DCard(540, 580, 800, 500, cardGrad, 'rgba(255,255,255,0.15)', '#FFFFFF');

        // Typography stack
        ctx.font = '900 60px "Space Grotesk", sans-serif';
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText("NO COMMISSIONS.", 540, 1050);
        ctx.fillText("ARTIST FIRST.", 540, 1140);
        
        ctx.fillStyle = 'rgba(255,255,255,0.6)';
        ctx.font = 'bold 22px monospace';
        ctx.fillText('• reclaiming creative value •', 540, 1220);

        // Features list
        const feats = [
          "Direct bookings (0% fees)",
          "GigSafe escrow guarantees",
          "Custom portfolio @handle"
        ];
        ctx.font = 'bold 26px monospace';
        ctx.fillStyle = '#FFFFFF';
        feats.forEach((feat, idx) => {
          ctx.fillText(`[✔] ${feat.toUpperCase()}`, 540, 1330 + idx * 75);
        });

      } else {
        // TEMPLATE 2: CLEAN LIGHT (Futuristic Blueprint)
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, 1080, 1920);

        // Blueprint lines
        ctx.strokeStyle = 'rgba(124, 92, 255, 0.08)';
        ctx.lineWidth = 1;
        for (let x = 0; x < canvas.width; x += 60) {
          ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
        }
        for (let y = 0; y < canvas.height; y += 60) {
          ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
        }

        // Draw 3D Card in light-blueprint styling
        draw3DCard(540, 580, 800, 500, 'rgba(124, 92, 255, 0.03)', 'rgba(124, 92, 255, 0.15)', '#0F0F14');

        // Telemetry details below
        ctx.fillStyle = '#7C5CFF';
        ctx.font = '900 52px "Space Grotesk", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('CREATIVE INFRASTRUCTURE', 540, 1050);

        ctx.fillStyle = '#0F0F14';
        ctx.font = 'bold 22px monospace';
        ctx.fillText(`• node unlocked // cohort ${cohort} •`, 540, 1130);

        const feats = [
          "DIRECT GIG BOOKING SYSTEM",
          "ESCROW PAYMENT INFRASTRUCTURE",
          "VERIFIED AVAILABILITY STATES"
        ];
        ctx.font = 'bold 26px monospace';
        ctx.fillStyle = '#7C5CFF';
        feats.forEach((feat, idx) => {
          ctx.fillText(`[✔] ${feat}`, 540, 1240 + idx * 75);
        });
      }

      // Shared bottom link
      ctx.textAlign = 'center';
      ctx.fillStyle = templateId === 2 ? '#9BA4B8' : '#5C6680';
      ctx.font = 'bold 28px monospace';
      ctx.fillText('artistant.in', 540, 1760);

      // Trigger high-res image download
      const dataUrl = canvas.toDataURL('image/png', 1.0);
      const link = document.createElement('a');
      link.download = `Artistant_Pass_${reservation.username}.png`;
      link.href = dataUrl;
      link.click();
      showToast("Story pass saved successfully!");
    } catch (e) {
      console.error(e);
      showToast("Error generating image.");
    }
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
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  })();

  /* ═══════════════════════════════════════════
     RENDER — DASHBOARD LAYOUT
     ═══════════════════════════════════════════ */
  return (
    <div className="min-h-screen text-[#F0EFF4] relative overflow-x-hidden selection:bg-[#7C5CFF]/30 selection:text-white" style={{ background: '#0A0A0A' }}>

      {/* ── AMBIENT BACKGROUND GLOWS ── */}
      <div className="absolute top-[10%] left-[-10%] w-[50%] h-[50%] bg-[#F25A2B]/3 rounded-full blur-[150px] pointer-events-none z-0 animate-pulse" style={{ animationDuration: '8s' }} />
      <div className="absolute top-[40%] right-[-10%] w-[45%] h-[45%] bg-[#7C5CFF]/3 rounded-full blur-[150px] pointer-events-none z-0" />
      <div className="absolute bottom-[10%] left-[-15%] w-[60%] h-[60%] bg-[#D4567A]/2 rounded-full blur-[180px] pointer-events-none z-0" />

      {/* ── Toast ── */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -20, x: '-50%' }}
            className="fixed top-20 left-1/2 z-[100] px-5 py-2.5 rounded-2xl text-xs font-semibold flex items-center gap-2 border border-white/10 backdrop-blur-xl"
            style={{ background: 'rgba(10,10,10,0.9)', color: '#fff', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}
          >
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ TOP BAR ═══ */}
      <header
        className="sticky top-0 z-50 flex items-center justify-between px-6 md:px-12 h-20 border-b border-white/5"
        style={{ background: 'rgba(10,10,10,0.85)', backdropFilter: 'blur(24px)' }}
      >
        <a href="/" className="flex items-center shrink-0 transition-transform active:scale-95">
          <img src="/logo_wordmark.png" alt="Artistant" style={{ height: '180px', width: 'auto', display: 'block' }} className="opacity-95" />
        </a>
        <div className="hidden md:flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#9BA4B8]/40">
          <span>Portal</span>
          <ChevronRight className="w-3 h-3 text-[#9BA4B8]/20" />
          <span className="text-[#7C5CFF] font-bold">@{reservation.username}</span>
        </div>
        <div className="flex items-center gap-3">
          {/* Vouch Points Badge */}
          <div className="flex items-center gap-1.5 h-10 px-3.5 rounded-full bg-white/5 border border-white/10 font-mono text-[10px] uppercase tracking-wider font-bold text-white shadow-inner select-none">
            <Trophy className="w-3.5 h-3.5 text-[#F25A2B]" />
            <span>{points} Authority</span>
          </div>

          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setProfileMenuOpen(!profileMenuOpen)}
              className="flex items-center gap-2.5 h-10 pl-1.5 pr-4 rounded-full transition-all bg-white/5 border border-white/10 hover:border-white/20 active:scale-95"
            >
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                style={{ background: 'linear-gradient(135deg, #F25A2B, #7C5CFF)' }}>
                {reservation.username[0].toUpperCase()}
              </div>
              <span className="text-xs font-bold text-white/80 hidden sm:block">@{reservation.username}</span>
            </button>
            <AnimatePresence>
              {profileMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.96 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-3 w-64 rounded-2xl overflow-hidden backdrop-blur-xl border border-white/10"
                  style={{ background: 'rgba(15,15,22,0.95)', boxShadow: '0 24px 70px -12px rgba(0,0,0,0.9)' }}
                >
                  <div className="p-4 border-b border-white/5 bg-black/40">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white"
                        style={{ background: 'linear-gradient(135deg, #F25A2B, #7C5CFF)' }}>
                        {reservation.username[0].toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-white truncate">@{reservation.username}</div>
                        <div className="text-[10px] text-[#5C6680] truncate font-mono mt-0.5">{user?.email}</div>
                      </div>
                    </div>
                  </div>
                  <div className="p-2">
                    <button onClick={handleSignOut}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-red-400 hover:bg-red-500/10 transition-colors text-left font-mono uppercase tracking-wider">
                      <LogOut className="w-3.5 h-3.5" /> Sign Out
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      {/* ═══ DASHBOARD CONTENT (App Workspace View) ═══ */}
      <main className="max-w-6xl mx-auto px-6 py-10 md:py-16 space-y-12 relative z-10">
        
        {/* ── TOP HERO BANNER (PIONEER IDENTITY) ── */}
        <section className="flex flex-col items-center text-center max-w-3xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mb-8">
            <span className="font-mono text-[9px] text-[#7C5CFF] uppercase tracking-[0.25em] font-bold mb-4 block">Claimed Identity Verified // @{reservation.username}</span>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white uppercase" style={{ fontFamily: 'var(--font-display)' }}>
              Lock Your Name.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F25A2B] via-[#D4567A] to-[#7C5CFF]">Upgrade Your Bookings.</span>
            </h1>
            <p className="text-xs md:text-sm text-[#9BA4B8]/80 mt-4 leading-relaxed max-w-2xl">
              Claim your <span className="text-white font-bold font-mono">@{reservation.username}</span> handle to secure your professional booking link. No more messy WhatsApp threads, hidden middleman fees, or chasing payments. Just a clean profile, GigSafe Escrow, and complete Artistant Protection for every show.
            </p>
          </motion.div>

          {/* 3D TILT PIONEER PASS CARD */}
          <div className="w-full max-w-md aspect-[1.58/1] relative mb-8" style={{ perspective: 1200 }}>
            <motion.div
              ref={cardRef}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              animate={{ rotateX, rotateY }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="w-full h-full relative rounded-[2.5rem] p-[1.5px] overflow-hidden group cursor-pointer shadow-[0_30px_90px_-20px_rgba(0,0,0,0.9)]"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.01) 40%, rgba(124,92,255,0.2))',
                transformStyle: 'preserve-3d',
              }}
            >
              <div className="relative w-full h-full bg-[#050508]/90 rounded-[2.4rem] p-6 flex flex-col justify-between overflow-hidden border border-white/5">
                <div className="absolute -right-20 -bottom-20 w-80 h-80 rounded-full border border-white/[0.02] flex items-center justify-center pointer-events-none">
                  <div className="w-60 h-60 rounded-full border border-white/[0.01] flex items-center justify-center" />
                </div>

                {/* Top Row */}
                <div className="flex justify-between items-start z-10">
                  <div className="flex items-center gap-2">
                    <img src="/logo_a.png" alt="A" className="w-6 h-6 object-contain opacity-80" />
                    <span className="font-mono text-[9px] font-bold tracking-[0.2em] text-[#9BA4B8]">PIONEER PASSPORT</span>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-mono text-[9px] font-bold uppercase tracking-widest bg-white/[0.03] border border-white/10 shadow-lg">
                    <span className="w-1.5 h-1.5 rounded-full animate-pulse shadow-[0_0_8px_currentColor]" style={{ background: isCohort1 ? '#7C5CFF' : '#F25A2B' }} />
                    {isCohort1 ? 'Cohort 1 VIP' : `Cohort ${cohort} Node`}
                  </span>
                </div>

                {/* Rank Pos (Center) */}
                <div className="flex flex-col items-center justify-center z-10 flex-1 my-4">
                  <h1 className="font-display font-black leading-none text-white tracking-tighter text-5xl md:text-6xl" style={{ textShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
                    #{waitlistPos || '---'}
                  </h1>
                  <div className="flex flex-col items-center mt-2.5">
                    <span className="font-mono text-[9px] font-bold tracking-[0.35em] text-[#5C6680] mb-0.5">WAITLIST RANK • COHORT {cohort}</span>
                    <span className="font-mono text-[8px] font-bold tracking-[0.15em] text-[#F25A2B]">{isCohort1 ? 'BETA ACCESS GRANTED' : 'POSITION SECURED'}</span>
                  </div>
                </div>

                {/* Bottom Row */}
                <div className="flex justify-between items-end z-10">
                  <div className="flex flex-col text-left">
                    <span className="font-display text-xl md:text-2xl font-black tracking-tight text-white">@{reservation.username}</span>
                    <span className="text-[9px] uppercase font-mono tracking-widest text-[#5C6680] mt-0.5">Verified Node</span>
                  </div>
                  <div className="flex flex-col items-end opacity-20 font-mono text-[6px] tracking-wider text-[#9BA4B8]">
                    <span>||||| | |||| | |||</span>
                  </div>
                </div>

                {/* Holographic Effects */}
                <div className="absolute inset-0 pointer-events-none mix-blend-color-dodge transition-opacity duration-300 opacity-0 group-hover:opacity-60"
                  style={{ background: `radial-gradient(circle at ${sheenX}% ${sheenY}%, rgba(124,92,255,0.2) 0%, rgba(212,86,122,0.1) 40%, transparent 70%)` }} />
                <div className="absolute inset-0 pointer-events-none mix-blend-overlay transition-opacity duration-500 opacity-0 group-hover:opacity-100"
                  style={{
                    background: `linear-gradient(135deg, transparent 30%, rgba(255,255,255,0.06) 45%, rgba(255,255,255,0.12) 50%, rgba(255,255,255,0.06) 55%, transparent 70%)`,
                    transform: `translateX(${(sheenX - 50) * 1.2}px) translateY(${(sheenY - 50) * 1.2}px)`
                  }} />
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── DASHBOARD TWO-COLUMN WORKSPACE ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
           
           {/* LEFT COLUMN: REFERRALS HUB (7 Cols) */}
           <div className="lg:col-span-7 space-y-6">
              
              {/* Network Authority Panel */}
              <div className="rounded-[2.5rem] p-[1.5px] bg-gradient-to-b from-white/10 to-transparent shadow-2xl relative overflow-hidden group">
                <div className="bg-[#06060A]/95 rounded-[2.4rem] p-6 md:p-8 backdrop-blur-xl border border-white/5 relative">
                  <div className="absolute -left-20 -top-20 w-48 h-48 rounded-full bg-[#7C5CFF]/3 blur-[80px] pointer-events-none" />

                  <h3 className="font-mono text-[10px] font-bold text-[#9BA4B8] uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                    <TrendingUp className="w-3.5 h-3.5 text-[#7C5CFF]" /> Network Authority
                  </h3>

                  <div className="flex justify-between items-end mb-6">
                    <div>
                      <span className="font-mono text-[9px] text-[#5C6680] uppercase tracking-widest block">Authority Standing</span>
                      <div className="font-display font-black text-5xl mt-2 tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-white/40 drop-shadow-[0_4px_12px_rgba(255,255,255,0.15)]">
                        {points} <span className="font-mono text-xs font-bold text-[#7C5CFF]">AUTH</span>
                      </div>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 shadow-inner flex items-center justify-center">
                      <Trophy className="w-4 h-4 text-[#F25A2B] drop-shadow-[0_0_8px_rgba(242,90,43,0.4)]" />
                    </div>
                  </div>

                  <div className="relative">
                    {/* Punchy single-line directive above progress bar */}
                    <p className="font-mono text-[10px] text-white uppercase tracking-wider mb-3 leading-relaxed">
                      Secure 3 verified peers to unlock Cohort 1 VIP Access and priority GigSafe onboarding.
                    </p>

                    {/* Segmented hardware-style track */}
                    <div className="relative w-full h-3 rounded-full bg-black/40 border border-white/5 overflow-hidden p-0.5 shadow-inner">
                      <div className="absolute inset-0 flex pointer-events-none z-20">
                        <div className="w-px h-full bg-white/10" style={{ marginLeft: '25%' }} />
                        <div className="w-px h-full bg-white/10" style={{ marginLeft: '50%' }} />
                        <div className="w-px h-full bg-white/10" style={{ marginLeft: '75%' }} />
                      </div>
                      <motion.div 
                        className="h-full rounded-full bg-gradient-to-r from-[#F25A2B] via-[#D4567A] to-[#7C5CFF]" 
                        initial={{ width: 0 }} 
                        whileInView={{ width: `${progressPercentage}%` }} 
                        viewport={{ once: true }} 
                        transition={{ duration: 1.2, ease: "easeOut" }} 
                      />
                    </div>

                    <div className="flex justify-between items-center mt-3.5">
                      <span className="text-[9px] text-[#5C6680] font-mono uppercase tracking-widest">VIP Level Target</span>
                      <span className="text-[9px] text-[#5C6680] font-mono uppercase tracking-widest">{points}/250</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Vouch Link Copy & WhatsApp Invite Panel */}
              <div className="rounded-[2.5rem] p-[1.5px] bg-gradient-to-b from-white/10 to-transparent shadow-2xl relative overflow-hidden group">
                <div className="bg-[#06060A]/95 rounded-[2.4rem] p-6 md:p-8 backdrop-blur-xl border border-white/5 relative">
                  <div className="absolute -right-20 -bottom-20 w-48 h-48 rounded-full bg-[#F25A2B]/2 blur-[80px] pointer-events-none" />

                  <h3 className="font-mono text-[10px] font-bold text-[#9BA4B8] uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 text-[#F25A2B]" /> Referral Engine
                  </h3>
                  
                  <h4 className="text-lg font-display font-black text-white uppercase tracking-tight mb-2">
                    Skip the Line. Become a Founding Artist.
                  </h4>
                  <p className="text-xs text-[#9BA4B8] mb-6 font-sans leading-relaxed">
                    The Beta opens soon. Want day-one access? Invite your network. When 3 artists use your link to join, you skip the waitlist, unlock your <strong className="text-white font-bold">"Founding Artist"</strong> badge, and get priority search ranking when organizers start booking.
                  </p>

                  {/* Massive WhatsApp Share Button */}
                  <div className="mb-6">
                    <a 
                      href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`Hey! I just locked my booking handle on Artistant. It lets you take direct client bookings, handles your contracts, and secures your money in escrow before you even perform. Claim your name before someone else takes it: artistant.in/?ref=${reservation.username}`)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-center gap-3 h-14 rounded-2xl bg-[#25D366] hover:bg-[#1EBE57] text-white font-mono text-xs uppercase tracking-[0.15em] font-extrabold shadow-[0_10px_25px_-5px_rgba(37,211,102,0.35)] w-full transition-all active:scale-95 text-center"
                    >
                      <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.49-3.232l.41.244c1.51.897 3.254 1.371 5.041 1.373 5.768 0 10.457-4.694 10.46-10.463.002-2.796-1.085-5.422-3.06-7.397C17.382 2.548 14.76 1.46 11.967 1.46c-5.772 0-10.462 4.693-10.465 10.463-.001 1.815.48 3.59 1.391 5.116l.272.455-1.012 3.693 3.791-.994zM16.52 14.18c-.247-.124-1.463-.72-1.69-.802-.226-.083-.392-.124-.556.124-.165.247-.64.802-.784.966-.143.166-.288.187-.535.063-.247-.125-1.045-.385-1.99-1.23-.736-.656-1.233-1.466-1.378-1.714-.144-.247-.015-.38.109-.504.112-.112.247-.288.371-.432.124-.144.165-.247.247-.412.083-.165.042-.31-.02-.432-.063-.124-.556-1.339-.763-1.833-.201-.484-.406-.418-.556-.426-.144-.008-.31-.008-.475-.008-.165 0-.433.062-.66.309-.227.247-.866.845-.866 2.06 0 1.216.886 2.39 1.01 2.554.124.165 1.744 2.663 4.224 3.732.59.255 1.05.407 1.41.52.592.188 1.13.162 1.557.098.475-.072 1.463-.598 1.67-1.175.206-.577.206-1.071.144-1.175-.062-.103-.227-.165-.475-.29z"/>
                      </svg>
                      Share via WhatsApp
                    </a>
                  </div>
                  
                  {/* Copier Terminal Input */}
                  <div className="flex items-center gap-3 bg-black/40 border border-white/5 p-1.5 rounded-2xl shadow-inner mb-6">
                    <div className="flex-1 px-4 py-2 text-[#9BA4B8] font-mono text-xs truncate select-all">
                      artistant.in/?ref={reservation.username}
                    </div>
                    <button 
                      onClick={copyReferralLink} 
                      className="h-10 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-white font-mono text-[10px] uppercase font-bold tracking-widest shadow-md active:scale-95 transition-all shrink-0 flex items-center gap-1.5 border border-white/10"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3.5 h-3.5" /> Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" /> Copy Link
                        </>
                      )}
                    </button>
                  </div>

                  {/* Copy Share Message Block */}
                  <div className="border-t border-white/5 pt-6 mb-6">
                    <span className="font-mono text-[9px] text-[#5C6680] uppercase tracking-widest block mb-3">Copy Raw Share Text</span>
                    <div className="flex items-start gap-3 bg-black/40 border border-white/5 p-3.5 rounded-2xl shadow-inner">
                      <p className="flex-1 text-[11px] font-mono text-[#9BA4B8] leading-relaxed select-all font-mono">
                        Hey! I just locked my booking handle on Artistant. It lets you take direct client bookings, handles your contracts, and secures your money in escrow before you even perform. Claim your name before someone else takes it: artistant.in/?ref={reservation.username}
                      </p>
                      <button 
                        onClick={() => {
                          const shareText = `Hey! I just locked my booking handle on Artistant. It lets you take direct client bookings, handles your contracts, and secures your money in escrow before you even perform. Claim your name before someone else takes it: artistant.in/?ref=${reservation.username}`;
                          navigator.clipboard.writeText(shareText);
                          showToast("Invite text copied!");
                        }}
                        className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white shadow-md active:scale-95 transition-all shrink-0"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Active Nodes Grid */}
                  <div className="mb-4">
                    <span className="font-mono text-[9px] text-[#5C6680] uppercase tracking-widest block mb-4.5">Vouch Nodes ({referrals} verified)</span>
                    <div className="grid grid-cols-3 gap-3">
                      {Array.from({ length: 3 }).map((_, idx) => {
                        const active = idx < referrals;
                        return (
                          <div 
                            key={idx} 
                            className={`flex flex-col justify-between p-3.5 rounded-2xl border h-20 transition-all ${
                              active 
                                ? 'bg-[#F25A2B]/5 border-[#F25A2B]/20 shadow-[inset_0_1px_15px_rgba(242,90,43,0.05)]' 
                                : 'bg-white/[0.01] border-white/5 opacity-40'
                            }`}
                          >
                            <div className="flex justify-between items-center">
                              <span className="font-mono text-[8px] text-[#5C6680] font-bold">NODE 0{idx + 1}</span>
                              {active ? (
                                <span className="w-1.5 h-1.5 rounded-full bg-[#F25A2B] shadow-[0_0_8px_#F25A2B] animate-pulse" />
                              ) : (
                                <Lock className="w-2.5 h-2.5 text-[#5C6680]" />
                              )}
                            </div>
                            <span className={`font-mono text-[9px] uppercase tracking-wider font-extrabold ${active ? 'text-white' : 'text-[#5C6680]'}`}>
                              {active ? 'CONNECTED' : 'STANDBY'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Verified Performers Fine Print */}
                  <div className="font-mono text-[8px] text-[#5C6680] leading-normal uppercase tracking-wider text-center border-t border-white/5 pt-4 mt-4">
                    * Invites only count when the referred user is a verified, gigging performer.
                  </div>
                </div>
              </div>

              {/* Reward Drop Panel */}
              <div className="rounded-[2.5rem] p-[1.5px] bg-gradient-to-b from-white/10 to-transparent shadow-xl relative overflow-hidden group">
                <div className="bg-[#06060A]/95 rounded-[2.4rem] p-6 md:p-8 backdrop-blur-xl border border-white/5 border-l-[3px] border-l-[#D4567A]">
                  <h3 className="font-mono text-[10px] font-bold text-[#9BA4B8] uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                    <Gift className="w-3.5 h-3.5 text-[#D4567A]" /> The All-Access Pass (Reward Drop)
                  </h3>
                  <p className="text-xs text-[#9BA4B8]/80 font-sans leading-relaxed">
                  </p>
                  
                  {/* Live Status Badge */}
                  <div className="mt-5 flex items-center gap-2 bg-[#D4567A]/5 border border-[#D4567A]/15 rounded-xl px-4 py-2.5 font-mono text-[9px] uppercase tracking-wider text-[#D4567A]">
                    <Sparkles className="w-3 h-3 animate-spin" style={{ animationDuration: '4s' }} />
                    <span>Active prize pool // Hardware drops en-route</span>
                  </div>
                </div>
              </div>

           </div>

           {/* RIGHT COLUMN: INSTAGRAM STORY STUDIO (5 Cols) */}
           <div className="lg:col-span-5 space-y-6">
              
              <div className="rounded-[2.5rem] p-[1.5px] bg-gradient-to-b from-white/10 to-transparent shadow-2xl relative overflow-hidden group h-full">
                <div className="bg-[#06060A]/95 rounded-[2.4rem] p-6 md:p-8 backdrop-blur-xl border border-white/5 flex flex-col items-center h-full">
                  
                  <h3 className="font-mono text-[10px] font-bold text-[#9BA4B8] uppercase tracking-[0.2em] mb-6 self-start flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-[#F25A2B]" /> IG Story Studio
                  </h3>

                  {/* Glass preview Phone hardware bezel */}
                  <div className="relative w-full max-w-[230px] aspect-[9/16] rounded-[2.4rem] p-2 bg-[#0C0C12] border-4 border-white/10 shadow-[0_25px_60px_rgba(0,0,0,0.85)] flex flex-col justify-between mb-6 overflow-hidden">
                    
                    {/* Camera notch cutout */}
                    <div className="absolute top-3.5 left-1/2 -translate-x-1/2 w-14 h-3.5 rounded-full bg-black/80 border border-white/5 z-20" />

                    <div className="relative w-full h-full rounded-[2rem] overflow-hidden flex flex-col justify-between p-5 text-left transition-all duration-300" 
                         style={{ 
                           background: activeStoryTemplate === 0 ? 'linear-gradient(180deg, #101015, #050507)' : 
                                      activeStoryTemplate === 1 ? 'linear-gradient(135deg, #F25A2B, #7C5CFF)' : 
                                      '#FFFFFF',
                           color: activeStoryTemplate === 2 ? '#0F0F14' : '#FFFFFF'
                         }}>
                      
                      {/* Mini pass card inside preview */}
                      <div className="w-full aspect-[1.58/1] rounded-xl p-3 flex flex-col justify-between relative overflow-hidden border shadow-inner transition-all duration-300"
                        style={{
                          background: activeStoryTemplate === 1 
                            ? 'linear-gradient(135deg, rgba(25,25,30,0.85), rgba(10,10,12,0.95))' 
                            : activeStoryTemplate === 2 
                              ? 'rgba(124, 92, 255, 0.03)' 
                              : 'rgba(255, 255, 255, 0.02)',
                          borderColor: activeStoryTemplate === 2 ? 'rgba(124, 92, 255, 0.15)' : 'rgba(255, 255, 255, 0.08)',
                          transform: 'rotate(-4deg) skewX(-4deg) scale(0.95)'
                        }}
                      >
                        <div className="flex justify-between items-center text-[5px] font-mono font-bold">
                          <span className={activeStoryTemplate === 2 ? 'text-[#7C5CFF]' : 'text-white/60'}>PASSPORT</span>
                          <span className="opacity-80">COHORT {cohort}</span>
                        </div>
                        <div className="text-center my-auto flex flex-col items-center">
                          <span className="text-xl font-display font-black leading-none">#{waitlistPos || '---'}</span>
                          <span className="text-[4px] font-mono tracking-widest opacity-40">WAITLIST POSITION</span>
                        </div>
                        <div className="flex justify-between items-end text-[6px] font-bold">
                          <span className="font-display">@{reservation.username}</span>
                          <span className="opacity-20 text-[4px]">|||||</span>
                        </div>
                      </div>

                      {/* Copy Statement */}
                      <div className="text-center flex-1 flex flex-col justify-center my-3">
                        {activeStoryTemplate === 0 && (
                          <>
                            <h4 className="font-display font-black text-[11px] uppercase tracking-tight leading-snug text-white">
                              I HAVE OPTED FOR<br />NO MIDDLEMEN.
                            </h4>
                            <p className="text-[5px] font-mono tracking-widest uppercase text-[#F25A2B] mt-1.5">
                              • commission-free direct booking •
                            </p>
                          </>
                        )}
                        {activeStoryTemplate === 1 && (
                          <>
                            <h4 className="font-display font-black text-[12px] uppercase tracking-tight leading-snug text-white">
                              NO COMMISSIONS.<br />ARTIST FIRST.
                            </h4>
                            <p className="text-[5px] font-mono tracking-widest uppercase text-white/60 mt-1.5">
                              • RECLAIMING CREATIVE VALUE •
                            </p>
                          </>
                        )}
                        {activeStoryTemplate === 2 && (
                          <>
                            <h4 className="font-display font-black text-[10px] uppercase tracking-tight leading-snug text-[#7C5CFF]">
                              CREATIVE INFRASTRUCTURE
                            </h4>
                            <p className="text-[5px] font-mono tracking-widest uppercase text-[#0F0F14] mt-1.5">
                              • NODE UNLOCKED // COHORT {cohort} •
                            </p>
                          </>
                        )}
                      </div>

                      {/* Bullet points */}
                      <div className="space-y-0.5 text-[6px] font-mono text-left opacity-75">
                        {activeStoryTemplate === 0 && (
                          <>
                            <div>[✔] Direct client-to-artist routing</div>
                            <div>[✔] GigSafe security deposit escrow</div>
                            <div>[✔] Auto-synced availability booking</div>
                          </>
                        )}
                        {activeStoryTemplate === 1 && (
                          <>
                            <div>[✔] Direct bookings (0% fees)</div>
                            <div>[✔] GigSafe escrow guarantees</div>
                            <div>[✔] Custom portfolio @handle</div>
                          </>
                        )}
                        {activeStoryTemplate === 2 && (
                          <>
                            <div className="text-[#7C5CFF]">[✔] DIRECT GIG BOOKING SYSTEM</div>
                            <div className="text-[#7C5CFF]">[✔] ESCROW PAYMENT INFRASTRUCTURE</div>
                            <div className="text-[#7C5CFF]">[✔] VERIFIED AVAILABILITY STATES</div>
                          </>
                        )}
                      </div>

                      {/* Brand Link */}
                      <div className="text-center text-[7px] font-mono font-bold tracking-widest opacity-35 uppercase mt-3">
                        artistant.in
                      </div>
                    </div>
                  </div>

                  {/* Secondary Theme Selector (Capsule Switches) */}
                  <div className="flex items-center gap-2.5 mb-6 mt-4 z-10">
                    <span className="font-mono text-[8px] text-[#5C6680] uppercase tracking-wider font-bold">Preset Theme:</span>
                    <div className="flex bg-black/60 border border-white/5 p-0.5 rounded-lg">
                      {["01", "02", "03"].map((name, idx) => (
                        <button 
                          key={idx} 
                          onClick={() => setActiveStoryTemplate(idx)}
                          className={`w-7 h-7 flex items-center justify-center text-[9px] font-mono font-bold rounded-md transition-all ${
                            activeStoryTemplate === idx 
                              ? 'bg-gradient-to-r from-[#F25A2B] to-[#7C5CFF] text-white shadow-sm' 
                              : 'text-[#5C6680] hover:text-white bg-transparent'
                          }`}
                        >
                          {name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Shifting Gradient Action button */}
                  <button 
                    onClick={() => handleDownloadStory()}
                    className="w-full flex items-center justify-center gap-2.5 h-12 rounded-xl text-xs font-mono uppercase tracking-widest font-bold bg-gradient-to-r from-[#F25A2B] via-[#D4567A] to-[#7C5CFF] hover:opacity-90 active:scale-95 transition-all text-white shadow-[0_10px_25px_-5px_rgba(242,90,43,0.35)] shrink-0 mt-6"
                  >
                    <DownloadCloud className="w-4 h-4" /> Download IG Pass
                  </button>
                </div>

             </div>

          </div>

        </div>

      </main>

      {/* ── FULL WIDTH: THE ECOSYSTEM ACCESS (STATIC MOCKUP SHOWCASE) ── */}
      <StaticModulesShowcase cohort={cohort} />

      {/* ═══ FOOTER BAR ═══ */}
      <footer className="w-full px-8 md:px-16 py-10 flex flex-col sm:flex-row items-center justify-between gap-6 bg-[#020202] border-t border-white/5 relative z-10">
        <div className="flex items-center gap-3">
          <img src="/logo_a.png" alt="Artistant" className="w-6 h-6 opacity-60" />
          <span className="font-mono text-[9px] text-[#5C6680] uppercase tracking-widest font-bold">artistant.in // waitlist</span>
        </div>
        <div className="flex items-center gap-6">
          <a href="/terms" className="font-mono text-[9px] text-[#5C6680] uppercase tracking-widest font-bold hover:text-white transition-colors">Terms</a>
          <a href="/privacy" className="font-mono text-[9px] text-[#5C6680] uppercase tracking-widest font-bold hover:text-white transition-colors">Privacy</a>
          <a href="/" className="font-mono text-[9px] text-[#5C6680] uppercase tracking-widest font-bold hover:text-white transition-colors flex items-center gap-1.5">
            Home <ExternalLink className="w-3 h-3 text-[#F25A2B]" />
          </a>
          <div className="w-px h-4 bg-white/10" />
          <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="text-[#5C6680] hover:text-white transition-colors font-mono text-[9px] uppercase tracking-widest font-bold">
             LinkedIn
          </a>
        </div>
      </footer>

      {/* ── STICKY CINEMATIC BANNER ── */}
      <div className="fixed bottom-0 left-0 w-full h-10 md:h-12 z-50 flex items-center justify-center border-t border-white/10 bg-[#0a0a0a]/80 backdrop-blur-md overflow-hidden">
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
              <img src="/logo_wordmark.png" alt="ArtisTant" className="h-6 md:h-8 w-auto object-contain opacity-90 drop-shadow-lg" />
            ) : (
              <div className="flex items-center gap-2 md:gap-3 px-4">
                <span className="font-display text-[10px] md:text-xs font-black tracking-widest uppercase text-transparent bg-clip-text whitespace-nowrap" style={{ 
                  backgroundImage: 'linear-gradient(135deg, #F25A2B 0%, #D4567A 50%, #7C5CFF 100%)' 
                }}>
                  {CINEMATIC_FEATURES[textIndex].title}
                </span>
                <span className="hidden md:inline-block w-1 h-1 rounded-full bg-white/30" />
                <span className="hidden md:inline-block text-[#9BA4B8] font-mono text-[10px] uppercase tracking-wider whitespace-nowrap opacity-70">
                  {CINEMATIC_FEATURES[textIndex].desc}
                </span>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

    </div>
  );
}
