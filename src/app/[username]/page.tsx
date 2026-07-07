'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '@/hooks/useAuth';
import { getUserReservation, getWaitlistPosition, type WaitlistEntry } from '@/lib/waitlist';
import { signOut } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { 
  Lock, 
  Unlock, 
  Check, 
  Share2, 
  Download, 
  RefreshCw,
  User,
  LogOut,
  FileText,
  QrCode,
  Camera,
  Award,
  Layers,
  Shield,
  Zap,
  CheckCircle,
  MessageSquare
} from 'lucide-react';
import { toPng } from 'html-to-image';
import Footer from '@/components/Footer';
import Webcam from 'react-webcam';

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

/* ── SAAS Explainer Video Component (Ambient Loop) ── */
function SaaSExplainerVideo() {
  const [scene, setScene] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setScene((prev) => (prev + 1) % 3);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-full max-w-xl aspect-[16/10] bg-[#0A0A0A] border border-white/5 rounded-[2rem] overflow-hidden relative shadow-[0_24px_50px_-15px_rgba(0,0,0,0.8)] flex flex-col justify-between p-6 md:p-8">
      {/* Glare overlay */}
      <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0 pointer-events-none z-30" />
      
      {/* Dynamic Background Glow */}
      <AnimatePresence mode="wait">
        <motion.div
          key={scene}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.15 }}
          exit={{ opacity: 0 }}
          className={`absolute inset-0 blur-[60px] pointer-events-none z-0 rounded-[2rem] ${
            scene === 0 ? 'bg-red-500' : scene === 1 ? 'bg-[#7C5CFF]' : 'bg-[#F25A2B]'
          }`}
        />
      </AnimatePresence>

      {/* Video Watermark Info Header */}
      <div className="flex justify-between items-center z-10 opacity-40 font-mono text-[9px] tracking-widest uppercase">
        <span>Artistant Studio // Explainer</span>
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
          Scene 0{scene + 1}
        </span>
      </div>

      {/* Main Video Viewport content */}
      <div className="flex-1 flex flex-col justify-center items-center relative z-10 py-4 overflow-hidden">
        <AnimatePresence mode="wait">
          {scene === 0 && (
            <motion.div
              key="scene-0"
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1.05, y: -10 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center text-center max-w-md"
            >
              <span className="text-red-500 font-mono text-[10px] uppercase tracking-[0.2em] font-bold mb-2">The Friction</span>
              <h2 className="font-display text-2xl md:text-3xl font-black text-white tracking-tight uppercase leading-none mb-3">
                Live Bookings Are <span className="underline decoration-red-500/50">Broken</span>.
              </h2>
              <p className="text-white/60 text-xs md:text-sm leading-relaxed px-4">
                20% agent commission cuts, manual PDF riders, ghosting clients, and months of delay waiting on gig payouts.
              </p>
            </motion.div>
          )}

          {scene === 1 && (
            <motion.div
              key="scene-1"
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1.05, y: -10 }}
              transition={{ duration: 0.5 }}
              className="w-full flex flex-col items-center max-w-md"
            >
              <span className="text-[#7C5CFF] font-mono text-[10px] uppercase tracking-[0.2em] font-bold mb-3">The Blueprint</span>
              
              <div className="flex flex-col gap-2 w-full px-6">
                {[
                  { label: "Direct Bookings", detail: "1-on-1 secure client workspace", icon: <User className="w-4 h-4 text-[#7C5CFF]" /> },
                  { label: "GigSafe Escrow™", detail: "Instant release payouts", icon: <Shield className="w-4 h-4 text-emerald-400" /> },
                  { label: "Smart Tech Riders", detail: "Matched tech compatibility", icon: <Zap className="w-4 h-4 text-amber-400" /> }
                ].map((item, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="flex items-center gap-3 bg-white/5 border border-white/5 rounded-xl p-2.5"
                  >
                    <div className="p-1.5 bg-white/5 rounded-lg border border-white/10">{item.icon}</div>
                    <div className="text-left">
                      <h4 className="text-xs font-bold text-white">{item.label}</h4>
                      <p className="text-[10px] text-white/40">{item.detail}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {scene === 2 && (
            <motion.div
              key="scene-2"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.6 }}
              className="flex flex-col items-center text-center"
            >
              <h2 className="font-display text-2xl md:text-3xl font-black text-white tracking-tight uppercase leading-none mb-4">
                India's Live Economy, <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F25A2B] to-[#7C5CFF]">Rebuilt.</span>
              </h2>
              
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="mt-2 flex items-center justify-center gap-2"
              >
                <img src="/logo_a.png" alt="A" className="w-8 h-8 object-contain" />
                <img src="/logo_wordmark.png" alt="Artistant" className="h-6 object-contain" />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Progress Scene Bar Indicator */}
      <div className="grid grid-cols-3 gap-2 z-10 w-full">
        {[0, 1, 2].map((idx) => (
          <div key={idx} className="h-1 bg-white/10 rounded-full overflow-hidden">
            {scene === idx && (
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 4.5, ease: "linear" }}
                className="h-full bg-white"
              />
            )}
            {scene > idx && <div className="w-full h-full bg-white/40" />}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [reservation, setReservation] = useState<WaitlistEntry | null>(null);
  const [waitlistPos, setWaitlistPos] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  // Scroll state for navbar
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const [referrals, setReferrals] = useState<number>(0);
  const [copied, setCopied] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  
  // UI Toggles
  const [storyTemplate, setStoryTemplate] = useState<'vip' | 'manifesto' | 'genesis' | 'selfie'>('vip');
  
  // Selfie Camera State
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [capturedSelfie, setCapturedSelfie] = useState<string | null>(null);
  const webcamRef = useRef<Webcam>(null);

  const captureSelfie = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) setCapturedSelfie(imageSrc);
  }, [webcamRef]);

  const retakeSelfie = () => setCapturedSelfie(null);

  const downloadSelfie = () => {
    setStoryTemplate('selfie');
    setTimeout(handleDownloadStory, 100);
  };

  // Suggestion Form State
  const [suggestionText, setSuggestionText] = useState('');
  const [isSubmittingSuggestion, setIsSubmittingSuggestion] = useState(false);

  
  // State for the cinematic text sequence
  const [textIndex, setTextIndex] = useState(0);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/?auth=true');
      return;
    }

    getUserReservation(user.uid)
      .then(async (res) => {
        if (!res) {
          router.push('/#join');
          return;
        }
        setReservation(res);

        const pos = await getWaitlistPosition(res.reserved_at, user.uid, res.position_override);
        setWaitlistPos(pos);

        const storedReferrals = localStorage.getItem(`referrals_${user.uid}`);
        if (storedReferrals !== null) {
          setReferrals(parseInt(storedReferrals, 10));
        } else {
          localStorage.setItem(`referrals_${user.uid}`, '0');
          setReferrals(0);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error loading waitlist profile:', err);
        setLoading(false);
      });
  }, [user, authLoading, router]);

  // Cinematic Text Sequence Timer
  useEffect(() => {
    const interval = setInterval(() => {
      setTextIndex((prev) => (prev + 1) % CINEMATIC_FEATURES.length);
    }, 2000); // Sped up to 2 seconds for a punchier sequence
    return () => clearInterval(interval);
  }, []);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleCopyLink = () => {
    if (!reservation) return;
    const inviteLink = `https://artistant.in/invite/${reservation.username}`;
    navigator.clipboard.writeText(inviteLink)
      .then(() => {
        setCopied(true);
        triggerToast('Invite link copied to clipboard!');
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => triggerToast('Failed to copy.'));
  };

  const handleWhatsAppShare = () => {
    if (!reservation) return;
    const inviteLink = `https://artistant.in/invite/${reservation.username}`;
    const text = `I just unlocked my Pioneer Pass on ArtisTant!\n\nJoin the movement for:\n✅ 0% Platform Fees\n✅ Direct Bookings\n✅ GigSafe Escrow\n\nClaim your spot before the Beta locks: ${inviteLink}`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };


  const handleDownloadCard = async () => {
    const el = document.getElementById('pioneer-pass-card');
    if (!el) return;
    try {
      const dataUrl = await toPng(el, { cacheBust: true, pixelRatio: 2 });
      const link = document.createElement('a');
      link.download = `pioneer-pass-${reservation?.username}.png`;
      link.href = dataUrl;
      link.click();
      setToastMessage('Pass downloaded for sharing!');
      setTimeout(() => setToastMessage(null), 3000);
    } catch (err) {
      console.error(err);
      setToastMessage('Failed to download pass.');
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  const handleShareCard = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Pioneer Pass',
          text: `Check out my Pioneer Pass on ArtisTant! @${reservation?.username}`,
          url: `https://artistant.in/invite/${reservation?.username}`
        });
      } catch (err) {
        console.error('Error sharing', err);
      }
    } else {
      setToastMessage('Native share not supported on this browser.');
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  const handleSuggestionSubmit = () => {
    if (!suggestionText.trim()) return;
    setIsSubmittingSuggestion(true);
    // Simulate saving to backend
    setTimeout(() => {
      setSuggestionText('');
      setIsSubmittingSuggestion(false);
      triggerToast('Idea logged! Our engine is learning.');
    }, 1000);
  };

  const handleDownloadStory = async () => {
    if (!reservation) return;
    
    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 1920;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Dark Onyx luxury background
    ctx.fillStyle = '#050505';
    ctx.fillRect(0, 0, 1080, 1920);

    // Subtle line grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.02)';
    ctx.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += 80) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += 80) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
    }

    if (storyTemplate === 'vip') {
      // Frosted luxury membership pass
      const bgGrad = ctx.createLinearGradient(0, 0, 1080, 1920);
      bgGrad.addColorStop(0, '#121212');
      bgGrad.addColorStop(1, '#020202');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, 1080, 1920);

      // Gold/Orange luxury border glow
      const glow = ctx.createRadialGradient(540, 960, 0, 540, 960, 800);
      glow.addColorStop(0, 'rgba(242, 90, 43, 0.1)');
      glow.addColorStop(1, 'transparent');
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, 1080, 1920);

      // Top logo
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '900 50px "Space Grotesk", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('ARTISTANT', 540, 320);

      ctx.font = 'bold 20px monospace';
      ctx.fillStyle = '#F25A2B';
      ctx.fillText('PIONEER CREDENTIALS', 540, 370);

      // Large waitlist position
      ctx.font = '900 130px "Space Grotesk", sans-serif';
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText(`#${waitlistPos || '---'}`, 540, 850);

      ctx.font = 'bold 24px monospace';
      ctx.fillStyle = '#9BA4B8';
      ctx.fillText('WAITLIST POSITION', 540, 920);
      ctx.fillText(`COHORT ${cohort}`, 540, 960);

      // Details plaque at bottom
      ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(140, 1250, 800, 240, 40);
      ctx.fill();
      ctx.stroke();

      ctx.textAlign = 'left';
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 44px "Space Grotesk", sans-serif';
      ctx.fillText(`@${reservation.username}`, 200, 1360);

      ctx.font = 'bold 22px monospace';
      ctx.fillStyle = '#7C5CFF';
      ctx.fillText('FOUNDING ARTIST PASS', 200, 1420);

      // Footer
      ctx.textAlign = 'center';
      ctx.fillStyle = '#5C6680';
      ctx.font = 'bold 28px monospace';
      ctx.fillText('artistant.in', 540, 1750);
      
    } else if (storyTemplate === 'manifesto') {
      // Luxury Editorial Typography Poster
      ctx.fillStyle = '#050505';
      ctx.fillRect(0, 0, 1080, 1920);

      ctx.fillStyle = '#D4567A';
      ctx.font = 'bold 28px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('THE MANIFESTO', 540, 300);

      ctx.font = '900 90px "Space Grotesk", sans-serif';
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText("NO COMMISSIONS.", 540, 680);
      ctx.fillText("NO MIDDLEMEN.", 540, 790);
      ctx.fillStyle = '#D4567A';
      ctx.fillText("ARTIST FIRST.", 540, 900);

      ctx.font = 'bold 44px "Space Grotesk", sans-serif';
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText(`@${reservation.username}`, 540, 1300);

      ctx.fillStyle = '#5C6680';
      ctx.font = 'bold 28px monospace';
      ctx.fillText('artistant.in', 540, 1750);

    } else if (storyTemplate === 'genesis') {
      // Tech-telemetry verified card
      ctx.fillStyle = '#030303';
      ctx.fillRect(0, 0, 1080, 1920);

      // Radar Concentric Circles
      ctx.strokeStyle = 'rgba(124, 92, 255, 0.1)';
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(540, 850, 260, 0, Math.PI*2); ctx.stroke();
      ctx.beginPath(); ctx.arc(540, 850, 180, 0, Math.PI*2); ctx.stroke();

      ctx.textAlign = 'center';
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '900 70px "Space Grotesk", sans-serif';
      ctx.fillText("GENESIS MEMBER", 540, 840);
      ctx.fillStyle = '#7C5CFF';
      ctx.font = 'bold 36px monospace';
      ctx.fillText("NODE STATUS: VERIFIED", 540, 900);

      // Detail card
      ctx.fillStyle = 'rgba(255, 255, 255, 0.02)';
      ctx.strokeStyle = 'rgba(124, 92, 255, 0.2)';
      ctx.beginPath();
      ctx.roundRect(140, 1300, 800, 200, 30);
      ctx.fill();
      ctx.stroke();

      ctx.textAlign = 'left';
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 38px "Space Grotesk", sans-serif';
      ctx.fillText(`@${reservation.username}`, 200, 1410);

      ctx.textAlign = 'right';
      ctx.fillStyle = '#7C5CFF';
      ctx.font = 'bold 30px monospace';
      ctx.fillText(`COHORT ${cohort}`, 880, 1410);

      ctx.textAlign = 'center';
      ctx.fillStyle = '#5C6680';
      ctx.font = 'bold 28px monospace';
      ctx.fillText('artistant.in', 540, 1750);

    } else if (storyTemplate === 'selfie' && capturedSelfie) {
      // Draw base selfie cropped to center
      await new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
          const aspect = 1080 / 1920;
          let sWidth = img.width;
          let sHeight = img.width / aspect;
          if (sHeight > img.height) {
            sHeight = img.height;
            sWidth = img.height * aspect;
          }
          const sx = (img.width - sWidth) / 2;
          const sy = (img.height - sHeight) / 2;
          ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, 1080, 1920);
          resolve(true);
        };
        img.src = capturedSelfie;
      });

      // Viewfinder Crop Marks / Cyber HUD
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 6;
      
      // Top Left Corner
      ctx.beginPath(); ctx.moveTo(80, 140); ctx.lineTo(80, 80); ctx.lineTo(140, 80); ctx.stroke();
      // Top Right Corner
      ctx.beginPath(); ctx.moveTo(1000, 140); ctx.lineTo(1000, 80); ctx.lineTo(940, 80); ctx.stroke();
      // Bottom Left Corner
      ctx.beginPath(); ctx.moveTo(80, 1780); ctx.lineTo(80, 1840); ctx.lineTo(140, 1840); ctx.stroke();
      // Bottom Right Corner
      ctx.beginPath(); ctx.moveTo(1000, 1780); ctx.lineTo(1000, 1840); ctx.lineTo(940, 1840); ctx.stroke();

      // Rec dot
      ctx.fillStyle = '#FF4B4B';
      ctx.beginPath(); ctx.arc(140, 150, 16, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 24px monospace';
      ctx.textAlign = 'left';
      ctx.fillText('REC', 175, 160);

      // Gradient overlay at bottom
      const bottomGrad = ctx.createLinearGradient(0, 1200, 0, 1920);
      bottomGrad.addColorStop(0, 'rgba(0,0,0,0)');
      bottomGrad.addColorStop(1, 'rgba(0,0,0,0.85)');
      ctx.fillStyle = bottomGrad;
      ctx.fillRect(0, 0, 1080, 1920);

      // Watermark
      ctx.textAlign = 'center';
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '900 80px "Space Grotesk", sans-serif';
      ctx.fillText(`@${reservation.username}`, 540, 1650);

      ctx.fillStyle = '#F25A2B';
      ctx.font = 'bold 36px monospace';
      ctx.fillText('VERIFIED PIONEER // ARTISTANT', 540, 1730);
    }

    const link = document.createElement('a');
    link.download = `artistant_pass_${reservation.username}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    triggerToast('Story graphic downloaded successfully!');
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#121212] relative overflow-hidden">
        {/* Pulsating background orb */}
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.3, 0.1] }} 
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }} 
          className="absolute w-64 h-64 bg-gradient-to-r from-[#F25A2B] via-[#D4567A] to-[#7C5CFF] rounded-full blur-[100px]" 
        />
        
        {/* Animated 'A' Logo */}
        <motion.div 
          animate={{ scale: [0.95, 1.05, 0.95] }} 
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }} 
          className="relative z-10 flex flex-col items-center"
        >
          <img src="/logo_a.png" alt="ArtisTant" className="w-20 h-20 md:w-24 md:h-24 object-contain mb-8 drop-shadow-2xl" />
          <div className="flex gap-2">
            <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0 }} className="w-1.5 h-1.5 rounded-full bg-[#F25A2B]" />
            <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.2 }} className="w-1.5 h-1.5 rounded-full bg-[#D4567A]" />
            <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.4 }} className="w-1.5 h-1.5 rounded-full bg-[#7C5CFF]" />
          </div>
        </motion.div>
      </div>
    );
  }

  if (!reservation) return null;

  const cohort = waitlistPos ? Math.ceil(waitlistPos / 100).toString().padStart(3, '0') : '003';
  const isUnlocked = referrals >= 3;

  return (
    <main className="min-h-screen bg-[#121212] text-[#F0EFF4] relative flex flex-col items-center pb-40 overflow-x-hidden font-body">
      
      {/* Header (Transparent, Official Assets) */}
      <header className="absolute top-0 w-full z-50 px-6 md:px-12 py-8 flex items-center justify-between">
        <a href="/" className="flex items-center transition-transform hover:opacity-80">
          <img src="/logo_wordmark.png" alt="ArtisTant" className="h-10 md:h-12 object-contain" />
        </a>
        <div className="relative">
          <button 
            onClick={() => setProfileMenuOpen(!profileMenuOpen)}
            className="w-12 h-12 rounded-full bg-[#1A1A1A] border border-white/10 flex items-center justify-center hover:bg-white/10 hover:border-white/20 transition-all shadow-lg"
          >
            <User className="w-5 h-5 text-white" />
          </button>
          
          <AnimatePresence>
            {profileMenuOpen && (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 mt-3 w-64 bg-[#161616] border border-white/10 rounded-2xl shadow-2xl overflow-hidden origin-top-right font-sans"
              >
                <div className="px-4 py-3 border-b border-white/5 bg-[#0A0A0A]">
                  <div className="text-sm font-bold text-white truncate">@{reservation.username}</div>
                  <div className="text-xs text-[#5C6680] truncate">{user?.email || 'user@example.com'}</div>
                </div>
                <div className="p-2">
                  <button onClick={() => { setProfileMenuOpen(false); triggerToast('Application review opening...'); }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 text-sm text-[#9BA4B8] hover:text-white transition-colors text-left font-medium">
                    <FileText className="w-4 h-4" /> Review Application
                  </button>
                </div>
                <div className="p-2 border-t border-white/5">
                  <button onClick={handleSignOut} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#F25A2B]/10 text-sm text-[#F25A2B] transition-colors text-left font-medium">
                    <LogOut className="w-4 h-4" /> Logout
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* 
        ========================================================================
        HERO SECTION: Digital Pass & SaaS Explainer Side-by-Side
        ========================================================================
      */}
      <div className="w-full pt-32 px-6 flex flex-col items-center relative z-10">
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          
          {/* LEFT: Digital Pass Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col items-center w-full"
          >
            <div id="pioneer-pass-card" className="relative w-full aspect-[16/9] md:aspect-[2/1] rounded-[2rem] p-[2px] overflow-hidden shadow-[0_20px_80px_-20px_rgba(242,90,43,0.3)] bg-black">
              {/* Static Gradient Border */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#F25A2B] via-[#D4567A] to-[#7C5CFF] opacity-50" />
              
              {/* Inner Card content */}
              <div className="relative w-full h-full bg-[#0a0a0a]/90 backdrop-blur-xl rounded-[calc(2rem-2px)] p-6 md:p-8 flex flex-col justify-between overflow-hidden">
                {/* Top Row */}
                <div className="flex justify-between items-start z-10">
                  <div className="flex items-center gap-2">
                    <img src="/logo_a.png" alt="A" className="w-6 h-6 object-contain opacity-80" />
                    <span className="font-display font-bold text-sm tracking-widest text-white/80 uppercase">Pioneer Pass</span>
                  </div>
                  {referrals >= 5 ? (
                    <div className="flex items-center gap-2 bg-gradient-to-r from-amber-500/20 to-yellow-600/20 px-3 py-1 rounded-full border border-amber-500/30 backdrop-blur-md shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                      <Award className="w-3.5 h-3.5 text-amber-400" />
                      <span className="text-[10px] uppercase font-mono tracking-widest text-amber-400 font-bold">Founding Artist</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 bg-white/5 px-3 py-1 rounded-full border border-white/10 backdrop-blur-md">
                      <span className="w-2 h-2 rounded-full bg-white/20" />
                      <span className="text-[10px] uppercase font-mono tracking-widest text-white/40 font-bold">Pending Founder</span>
                    </div>
                  )}
                </div>

                {/* Center Row: Number */}
                <div className="flex flex-col items-center justify-center z-10 flex-1 my-4 md:my-0">
                  <h1 
                    className="font-display text-7xl md:text-8xl font-black tracking-tighter text-white/5 px-4"
                    style={{ textShadow: '1px 1px 2px rgba(255,255,255,0.3), -1px -1px 2px rgba(0,0,0,0.8)' }}
                  >
                    #{waitlistPos || '---'}
                  </h1>
                  <div className="flex flex-col items-center mt-3 opacity-60">
                    <span className="font-mono text-[10px] text-white tracking-[0.3em] uppercase mb-1">
                      Waitlist Position
                    </span>
                    <span className="font-mono text-[9px] text-white/70 tracking-widest uppercase">
                      Cohort {cohort}
                    </span>
                  </div>
                </div>

                {/* Bottom Row */}
                <div className="flex justify-between items-end z-10">
                  <div className="flex flex-col">
                    <span className="font-display text-lg md:text-xl font-medium text-white/60 tracking-wide mb-1">@{reservation.username}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] md:text-[10px] uppercase font-mono tracking-widest text-white/40 z-10">Verified on</span>
                      <div className="w-20 md:w-24 h-4 flex items-center relative">
                        <img src="/logo_wordmark.png" alt="ArtisTant" className="absolute left-0 w-[300%] max-w-none object-contain drop-shadow-md origin-left pointer-events-none" style={{ transform: 'scale(0.8)' }} />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <QrCode className="w-8 h-8 md:w-10 md:h-10 text-white/20" />
                    <img src="/logo_a.png" alt="Artistant A" className="w-10 h-10 md:w-12 md:h-12 object-contain opacity-80" />
                  </div>
                </div>

                {/* Glass Glare Effect */}
                <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0 pointer-events-none" />
              </div>
            </div>

            {/* Sharing buttons */}
            <div className="mt-6 flex flex-wrap justify-center gap-3 w-full relative z-20">
              <button onClick={handleDownloadCard} className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#1E1E1E] border border-white/10 text-white text-sm font-bold hover:bg-white/5 transition-all active:scale-95 shadow-md">
                <Camera className="w-4 h-4 text-[#F25A2B]" /> Get Sharing Pass
              </button>
              <button onClick={handleShareCard} className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#1E1E1E] border border-white/10 text-white text-sm font-bold hover:bg-white/5 transition-all active:scale-95 shadow-md">
                <Share2 className="w-4 h-4 text-[#7C5CFF]" /> Share Profile Link
              </button>
            </div>
          </motion.div>

          {/* RIGHT: SaaS Explainer Video */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="w-full flex justify-center"
          >
            <SaaSExplainerVideo />
          </motion.div>

        </div>
      </div>

      {/* 
        ========================================================================
        BENTO SECTION: Cohort Privileges, Feedback Loop, Vouch Network
        ========================================================================
      */}
      <div className="w-full max-w-6xl px-6 grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 relative z-10 mt-12 mb-12">
        
        {/* PANEL 1: COHORT PRIVILEGES */}
        <div className="md:col-span-2 rounded-[2rem] bg-[#0A0A0A]/90 backdrop-blur-xl border border-white/5 p-6 md:p-8 relative overflow-hidden flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-[#F25A2B]/10 via-transparent to-transparent pointer-events-none" />
          
          <div className="flex-1 text-center md:text-left">
            <h3 className="font-display text-2xl font-black text-white mb-2 tracking-tight">
              Cohort {cohort} Privileges
            </h3>
            <p className="text-[#9BA4B8] text-sm leading-relaxed max-w-2xl">
              The initial class class class class receives <strong className="text-[#F25A2B]">0% commission on the 1st Gig</strong>, exclusive verified badge status, priority access to upcoming beta layers, and direct VIP onboarding assistance.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-[#F25A2B]/10 border border-[#F25A2B]/20 rounded-2xl p-4 max-w-sm">
            <RefreshCw className="w-5 h-5 text-[#F25A2B] shrink-0 animate-spin" style={{ animationDuration: '6s' }} />
            <p className="text-xs text-[#F25A2B] font-medium leading-relaxed">
              <strong>Refer to Upgrade:</strong> Every invitation boosts position waitlist rank, granting you premium tier credentials.
            </p>
          </div>
        </div>

        {/* PANEL 2: FEATURE SUGGESTION BOX */}
        <div className="rounded-[2rem] bg-[#0A0A0A]/90 backdrop-blur-xl border border-white/5 p-6 md:p-8 relative overflow-hidden flex flex-col justify-between">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#7C5CFF]/10 via-transparent to-transparent pointer-events-none" />
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-xl bg-[#7C5CFF]/10 border border-[#7C5CFF]/20">
                <MessageSquare className="w-5 h-5 text-[#7C5CFF]" />
              </div>
              <span className="font-mono text-xs text-[#7C5CFF] uppercase tracking-widest font-bold">Feedback Loop</span>
            </div>
            
            <h3 className="font-display text-2xl font-black mb-2 text-white tracking-tight">
              Shape The Platform
            </h3>
            <p className="text-[#9BA4B8] text-sm mb-6 leading-relaxed">
              Have a killer feature idea? Or a massive industry problem you want us to solve? Drop it below. We build for the artists, by the artists.
            </p>
          </div>

          <div className="relative z-10 flex flex-col gap-3">
            <textarea 
              value={suggestionText}
              onChange={(e) => setSuggestionText(e.target.value)}
              placeholder="I wish ArtisTant could..."
              className="w-full bg-[#121212] border border-white/5 rounded-2xl p-4 text-white text-sm outline-none focus:border-[#7C5CFF]/40 transition-colors resize-none h-28 font-body"
            />
            <button 
              onClick={handleSuggestionSubmit}
              disabled={isSubmittingSuggestion || !suggestionText.trim()}
              className="w-full py-3.5 rounded-xl bg-white text-black font-bold text-sm hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(255,255,255,0.05)]"
            >
              {isSubmittingSuggestion ? 'Submitting...' : 'Send Idea'}
            </button>
          </div>
        </div>

        {/* PANEL 3: VOUCH NETWORK */}
        <div className="rounded-[2rem] bg-[#0A0A0A]/90 border border-white/5 backdrop-blur-xl p-6 md:p-8 relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#F25A2B]/5 blur-[80px] rounded-full pointer-events-none" />
          
          <div>
            <div className="flex items-center gap-3 mb-6 relative z-10">
              <Share2 className="w-5 h-5 text-[#F25A2B]" />
              <span className="font-mono text-xs text-[#F25A2B] uppercase tracking-widest font-bold">The Vouch Network</span>
            </div>
            <h3 className="font-display text-2xl font-black mb-3 text-white tracking-tight relative z-10">
              Curate the Ecosystem.
            </h3>
            <p className="text-[#9BA4B8] text-sm mb-6 leading-relaxed max-w-sm relative z-10">
              Invite peers to earn 1 Base Point per referral. Invite regional heavyweights? We manually verify and grant a <span className="text-[#F25A2B] font-bold">10x multiplier</span>.
            </p>
          </div>

          {/* Metrics Dashboard */}
          <div className="grid grid-cols-2 gap-4 mb-6 relative z-10">
            <div className="bg-black/50 border border-white/5 rounded-2xl p-4 flex flex-col gap-1">
              <span className="font-mono text-[9px] text-[#9BA4B8] uppercase tracking-widest mb-2 font-bold">Base Referrals</span>
              <div className="flex items-end gap-2">
                <span className="font-display text-4xl font-black text-white leading-none">{referrals}</span>
                <span className="text-[10px] text-[#5C6680] mb-1 font-mono">/ 5</span>
              </div>
              <div className="w-full h-1 bg-white/5 rounded-full mt-2 overflow-hidden">
                <div className="h-full bg-[#7C5CFF] rounded-full transition-all duration-1000" style={{ width: `${Math.min((referrals / 5) * 100, 100)}%` }} />
              </div>
            </div>
            
            <div className="bg-black/50 border border-white/5 rounded-2xl p-4 flex flex-col gap-1 relative overflow-hidden">
              <span className="font-mono text-[9px] text-[#F25A2B] uppercase tracking-widest font-bold relative z-10 mb-2">Vouch Points</span>
              <div className="flex items-end gap-2 relative z-10">
                <span className="font-display text-4xl font-black text-white leading-none">{referrals * 1}</span>
                <span className="text-[10px] text-[#5C6680] mb-1 font-mono">/ 100</span>
              </div>
              <div className="w-full h-1 bg-white/5 rounded-full mt-2 overflow-hidden relative z-10">
                <div className="h-full bg-[#F25A2B] rounded-full transition-all duration-1000" style={{ width: `${Math.min(((referrals * 1) / 100) * 100, 100)}%` }} />
              </div>
            </div>
          </div>
          
          {/* Copy Link Input */}
          <div className="flex items-center gap-2 bg-black/60 border border-white/5 rounded-2xl p-2 shadow-inner mb-4 relative z-10">
            <input 
              type="text" 
              readOnly 
              value={`artistant.in/invite/${reservation.username}`} 
              className="w-full px-4 bg-transparent text-[#9BA4B8] font-mono text-sm outline-none"
            />
            <button 
              onClick={handleCopyLink}
              className="px-4 py-2.5 rounded-xl bg-white text-black hover:opacity-90 text-xs font-bold transition-all shrink-0"
            >
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch gap-3 relative z-10">
            <button onClick={handleWhatsAppShare} className="flex-1 py-3 px-6 rounded-xl border border-white/5 bg-[#121212] hover:bg-white/5 flex items-center justify-center gap-3 text-sm font-bold text-white transition-all">
              <Share2 className="w-4 h-4 text-[#F25A2B]" /> WhatsApp Invite
            </button>
            
            <div className="flex-[1.5] bg-[#121212] rounded-xl p-2.5 border border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#D4567A]/20 flex items-center justify-center">
                  <FileText className="w-4 h-4 text-[#D4567A]" />
                </div>
                <div>
                  <p className="font-bold text-white text-[11px] leading-tight">Feature Promo Kit</p>
                  <p className="text-[#5C6680] text-[9px] uppercase tracking-wider">For Socials</p>
                </div>
              </div>
              <button onClick={() => { setStoryTemplate('vip'); setTimeout(handleDownloadStory, 100); }} className="text-[10px] font-bold bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-colors text-white">
                Download
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 
        ========================================================================
        CAROUSEL SECTION: Story Graphics Redesign
        ========================================================================
      */}
      <div className="w-full flex flex-col items-center mt-12 md:mt-16">
        <div className="flex items-center gap-3 mb-6 relative z-10">
          <Layers className="w-5 h-5 text-[#7C5CFF]" />
          <span className="font-mono text-xs text-[#7C5CFF] uppercase tracking-widest font-bold">Share Your Status</span>
        </div>

        <style dangerouslySetInnerHTML={{__html: `
          .hide-scrollbar::-webkit-scrollbar { display: none; }
          .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        `}} />

        {/* Swipeable Container */}
        <div className="w-full max-w-[100vw] overflow-x-auto snap-x snap-mandatory flex gap-6 pb-8 px-6 md:px-0 md:justify-center hide-scrollbar">
          
          {/* TEMPLATE A: VIP PASS */}
          <div className="snap-center shrink-0 flex flex-col items-center gap-6">
            <div className="w-[300px] aspect-[9/16] rounded-[2.5rem] p-6 relative overflow-hidden shadow-[0_0_40px_rgba(242,90,43,0.15)] border border-white/10 bg-[#0A0A0A] flex flex-col justify-between group transform transition-transform duration-500 hover:scale-[1.02]">
              {/* Glossy overlay */}
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 pointer-events-none" />
              
              {/* Lanyard hole */}
              <div className="absolute top-4 left-1/2 -translate-x-1/2 w-16 h-2.5 rounded-full bg-black/60 shadow-inner border border-white/5" />

              {/* Top Logo */}
              <div className="relative z-10 w-full flex flex-col items-center pt-8">
                <img src="/logo_wordmark.png" alt="ArtisTant" className="w-32 h-auto opacity-100 drop-shadow-md mb-2" />
                <div className="bg-black/40 border border-white/10 px-3 py-1 rounded-full backdrop-blur-md">
                  <span className="font-mono text-[8px] text-[#F25A2B] tracking-widest uppercase font-bold">Pioneer Credentials</span>
                </div>
              </div>

              {/* Middle: Waitlist Position */}
              <div className="relative z-10 w-full flex flex-col items-center mt-2 text-center">
                <h2 className="font-display font-black text-6xl text-white tracking-tighter mb-2">
                  #{waitlistPos || '---'}
                </h2>
                <span className="font-mono text-[9px] text-white/50 tracking-widest uppercase mb-1">
                  Waitlist Position
                </span>
                <span className="font-mono text-[8px] text-[#F25A2B] tracking-widest uppercase font-bold">
                  Cohort {cohort}
                </span>
              </div>
              
              {/* Bottom: ID Badge */}
              <div className="relative z-10 w-full flex flex-col items-center pb-2">
                <div className="w-full flex items-center justify-between bg-black/50 border border-white/10 rounded-2xl p-3 shadow-inner">
                  <div className="flex flex-col text-left">
                    <span className="font-body font-bold text-white text-sm truncate w-24">@{reservation.username}</span>
                    <span className="font-mono text-[8px] text-[#7C5CFF] tracking-widest uppercase font-bold">Founding Pass</span>
                  </div>
                  <QrCode className="w-8 h-8 text-white/50" />
                </div>
                <p className="mt-4 text-white/30 font-mono text-[8px] tracking-widest uppercase font-bold">
                  artistant.in
                </p>
              </div>
            </div>
            <button onClick={() => { setStoryTemplate('vip'); setTimeout(handleDownloadStory, 100); }} className="flex items-center justify-center w-full gap-2 px-6 py-3 rounded-full bg-[#1E1E1E] border border-white/10 text-white text-sm font-bold hover:bg-[#F25A2B] hover:border-[#F25A2B] active:scale-95 transition-all shadow-xl">
              <Download className="w-4 h-4" /> Get VIP Pass
            </button>
          </div>

          {/* TEMPLATE B: THE MANIFESTO */}
          <div className="snap-center shrink-0 flex flex-col items-center gap-6">
            <div className="w-[300px] aspect-[9/16] rounded-[2.5rem] p-6 relative overflow-hidden shadow-[0_0_50px_rgba(212,86,122,0.15)] border border-white/10 bg-[#050505] flex flex-col justify-between group transform transition-transform duration-500 hover:scale-[1.02]">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-[#D4567A]/10 blur-[100px] pointer-events-none rounded-full" />
              
              <div className="relative z-10 w-full flex justify-center items-center mt-2">
                 <span className="font-mono text-[9px] text-[#D4567A] uppercase font-bold tracking-widest bg-[#D4567A]/10 px-4 py-2 rounded-full border border-[#D4567A]/20">The Manifesto</span>
              </div>
              
              <div className="relative z-10 flex flex-col items-center mt-12 mb-12">
                <h2 className="font-display font-black text-[22px] text-white uppercase leading-[1.3] tracking-tighter text-center px-2">
                  NO COMMISSIONS.<br />
                  NO MIDDLEMEN.<br />
                  <span className="text-[#D4567A]">ARTIST FIRST.</span>
                </h2>
                <h3 className="font-display font-bold text-sm text-white/50 uppercase tracking-widest mt-6 text-center">
                  @{reservation.username}
                </h3>
              </div>
              
              <div className="relative z-10 mt-auto pt-4 flex justify-center items-center">
                <img src="/logo_wordmark.png" alt="ArtisTant" className="w-24 opacity-60" />
              </div>
            </div>
            <button onClick={() => { setStoryTemplate('manifesto'); setTimeout(handleDownloadStory, 100); }} className="flex items-center justify-center w-full gap-2 px-6 py-3 rounded-full bg-[#1E1E1E] border border-white/10 text-white text-sm font-bold hover:bg-[#D4567A] hover:border-[#D4567A] active:scale-95 transition-all shadow-xl">
              <Download className="w-4 h-4" /> Get Rebel Card
            </button>
          </div>

          {/* TEMPLATE C: GENESIS NODE */}
          <div className="snap-center shrink-0 flex flex-col items-center gap-6">
            <div className="w-[300px] aspect-[9/16] rounded-[2.5rem] p-6 relative overflow-hidden shadow-[0_0_50px_rgba(124,92,255,0.15)] border border-white/10 bg-[#050505] flex flex-col justify-between group transform transition-transform duration-500 hover:scale-[1.02]">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-[#7C5CFF]/10 blur-[100px] rounded-full pointer-events-none" />
              
              <div className="relative z-10 w-full flex justify-center items-center mt-2">
                <img src="/logo_a.png" alt="A" className="w-8 h-8 opacity-80" />
              </div>
              
              <div className="relative z-10 flex flex-col items-center my-auto">
                <div className="relative w-36 h-36 flex items-center justify-center">
                  <motion.div 
                    animate={{ rotate: 360 }} 
                    transition={{ repeat: Infinity, duration: 25, ease: "linear" }}
                    className="absolute inset-0 rounded-full border border-dashed border-[#7C5CFF]/30"
                  />
                  <div className="absolute inset-4 rounded-full bg-[#7C5CFF]/5 backdrop-blur-sm border border-[#7C5CFF]/15 flex flex-col items-center justify-center">
                    <span className="font-display font-black text-xl text-white">GENESIS</span>
                    <span className="font-display font-bold text-xs text-[#7C5CFF]">MEMBER</span>
                  </div>
                </div>
                
                <div className="mt-8 text-center">
                  <p className="font-mono text-[9px] text-[#9BA4B8] uppercase tracking-widest mb-1 font-bold">Node Identity</p>
                  <p className="font-body font-black text-lg text-white drop-shadow-md">@{reservation.username}</p>
                </div>
              </div>
              
              <div className="relative z-10 w-full flex justify-center pb-2">
                <p className="font-mono text-[#5C6680] text-[9px] font-bold uppercase tracking-widest">artistant.in</p>
              </div>
            </div>
            <button onClick={() => { setStoryTemplate('genesis'); setTimeout(handleDownloadStory, 100); }} className="flex items-center justify-center w-full gap-2 px-6 py-3 rounded-full bg-[#1E1E1E] border border-white/10 text-white text-sm font-bold hover:bg-[#7C5CFF] hover:border-[#7C5CFF] active:scale-95 transition-all shadow-xl">
              <Download className="w-4 h-4" /> Get Genesis Card
            </button>
          </div>

          {/* TEMPLATE D: SELFIE PASS */}
          <div className="snap-center shrink-0 flex flex-col items-center gap-6">
            <div className="w-[300px] aspect-[9/16] rounded-[2.5rem] p-6 relative overflow-hidden shadow-[0_0_50px_rgba(255,255,255,0.05)] border border-white/10 bg-[#0A0A0A] flex flex-col items-center justify-center group transform transition-transform duration-500 hover:scale-[1.02] cursor-pointer"
                 onClick={() => setIsCameraOpen(true)}>
              <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Camera className="w-8 h-8 text-white/80" />
              </div>
              <h3 className="font-display font-black text-2xl text-white mb-2">Selfie Pass</h3>
              <p className="text-center text-[#9BA4B8] text-xs px-4">Snap a photo with our custom founding filter.</p>
            </div>
            <button onClick={() => setIsCameraOpen(true)} className="flex items-center justify-center w-full gap-2 px-6 py-3 rounded-full bg-white text-black text-sm font-bold hover:bg-gray-200 active:scale-95 transition-all shadow-xl">
              <Camera className="w-4 h-4" /> Open Camera
            </button>
          </div>

        </div>
      </div>

      {/* SELFIE CAMERA MODAL */}
      <AnimatePresence>
        {isCameraOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center p-4"
          >
            <div className="w-full max-w-sm aspect-[9/16] bg-black rounded-[2.5rem] overflow-hidden relative border-4 border-white/10 shadow-[0_0_100px_rgba(255,255,255,0.1)]">
              {capturedSelfie ? (
                <div className="w-full h-full relative">
                  <img src={capturedSelfie} alt="Selfie" className="w-full h-full object-cover" />
                  
                  {/* Overlay Filter Preview */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
                  <div className="absolute inset-0 border-[6px] border-white/20 pointer-events-none rounded-[2.2rem]" />
                  <div className="absolute bottom-10 left-0 w-full flex flex-col items-center pointer-events-none">
                    <span className="font-display font-black text-4xl text-white drop-shadow-xl">@{reservation.username}</span>
                    <span className="font-mono text-[#F25A2B] font-bold text-sm tracking-widest uppercase mt-2">Artistant Waitlist</span>
                  </div>
                </div>
              ) : (
                <Webcam
                  audio={false}
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  videoConstraints={{ facingMode: "user", aspectRatio: 9/16 }}
                  className="w-full h-full object-cover"
                />
              )}

              {/* Controls */}
              <div className="absolute bottom-6 left-0 w-full flex justify-center gap-6 z-20 px-6">
                {!capturedSelfie ? (
                  <button onClick={captureSelfie} className="w-16 h-16 rounded-full bg-white flex items-center justify-center border-4 border-white/30 hover:scale-105 active:scale-95 transition-transform shadow-xl">
                    <div className="w-12 h-12 rounded-full border-2 border-black" />
                  </button>
                ) : (
                  <>
                    <button onClick={retakeSelfie} className="px-6 py-3 rounded-full bg-[#1E1E1E] text-white font-bold hover:bg-white/10 transition-colors border border-white/20 text-sm">
                      Retake
                    </button>
                    <button onClick={() => { downloadSelfie(); setIsCameraOpen(false); }} className="px-6 py-3 rounded-full bg-white text-black font-bold flex items-center gap-2 hover:bg-gray-200 transition-colors shadow-xl text-sm">
                      <Download className="w-4 h-4" /> Save
                    </button>
                  </>
                )}
              </div>

              {/* Close button */}
              <button onClick={() => { setIsCameraOpen(false); retakeSelfie(); }} className="absolute top-6 right-6 w-10 h-10 rounded-full bg-black/50 border border-white/20 flex items-center justify-center text-white hover:bg-white/10 transition-colors z-20 backdrop-blur-md">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M13 1L1 13M1 1L13 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
            </div>
            
            <p className="mt-6 text-white/50 text-xs font-mono uppercase tracking-widest">
              {!capturedSelfie ? 'Position yourself in the frame' : 'Looking good!'}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast notifications */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 50, x: '-50%' }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-[#161616] border border-white/10 text-white px-5 py-3 rounded-2xl text-xs font-medium shadow-2xl flex items-center gap-2.5 font-sans"
          >
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="w-full relative z-50 bg-[#080808] border-t border-white/5 mt-20">
        <Footer />
      </div>
    </main>
  );
}
