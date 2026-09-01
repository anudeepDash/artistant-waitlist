'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '@/hooks/useAuth';
import { signInWithGoogle, signInWithEmail, signOut as firebaseSignOut } from '@/lib/auth';
import { checkIsAdminAction } from '@/lib/admin-actions';
import AdminLoginGate from '@/components/admin/AdminLoginGate';
import MiniGameModal from '@/components/MiniGameModal';
import MarketFeedbackModal from '@/components/MarketFeedbackModal';
import { Lock, ExternalLink, X, QrCode, Zap, MessageSquarePlus, Gamepad2, ArrowUpRight, CheckCircle2, FileText } from 'lucide-react';

const ADMIN_STORAGE_KEY = 'artistant_admin_bypass_active';
const KNOWN_ADMIN_EMAILS = ['anudeepdash2004@gmail.com'];

// ── Rotating taglines ──
const TAGLINES = [
  '"We will be back with a bang."',
  '"First they ignore you, then they copy your escrow."',
  '"No middlemen were harmed in the making of this platform."',
  '"POV: You just booked a gig without losing 40% to a broker."',
  '"Ctrl+Z the entire booking agent industry."',
  '"Your promoter\'s promoter is shaking rn."',
  '"Built different. Literally — no WhatsApp groups."',
  '"This is not a drill. Unless your drill plays bass."',
  '"Cooking something so fire, even Spotify can\'t stream it."',
  '"If you know, you know. If you don\'t, you will."',
];

// ── Secret word triggers ──
// Type these words anywhere on the page to trigger responses
const SECRET_WORDS: Record<string, string> = {
  'cook':     '👨‍🍳 The kitchen is heating up.',
  'gig':      '🎤 Your next gig is closer than you think.',
  'music':    '🎵 Music is the universal language. Payments shouldn\'t need a translator.',
  'hire':     '💼 Soon you won\'t need a middleman for that.',
  'escrow':   '🔒 Smart move. Your money is safe with us.',
  'broker':   '🚫 We don\'t do that here.',
  'artistant':'🔥 You found us.',
  'anudeep':  '👑 The founder sees you.',
  'help':     '🤫 Try clicking the dot in "LET US COOK."',
  'sorry':    '💅 No apologies needed. Just vibes.',
  'hello':    '👋 Hey! We\'re still cooking. Come back soon.',
  'please':   '🫡 Since you asked nicely... still cooking though.',
  'money':    '💸 20-40% of your gig fee, gone to a broker? Not anymore.',
  'whatsapp': '📱 "Bhai gig confirm hai na?" — Never again.',
  'india':    '🇮🇳 Built for India\'s live entertainment scene.',
};


// ── Shake detection threshold ──
const SHAKE_THRESHOLD = 25;
const SHAKE_COUNT_TRIGGER = 3;

// ── Console art (fires once on mount) ──
const CONSOLE_ART = `
%c╔═══════════════════════════════════════════════════╗
║                                                   ║
║     █████  ██████  ████████ ██ ███████ ████████   ║
║    ██   ██ ██   ██    ██    ██ ██         ██      ║
║    ███████ ██████     ██    ██ ███████    ██      ║
║    ██   ██ ██   ██    ██    ██      ██    ██      ║
║    ██   ██ ██   ██    ██    ██ ███████    ██      ║
║                                                   ║
║    🔥  We're hiring. Drop us a line.              ║
║    👀  You found the console. Respect.            ║
║    🎤  artistant.com                              ║
║                                                   ║
╚═══════════════════════════════════════════════════╝`;

interface ComingSoonGuardProps {
  children: React.ReactNode;
}

// ── Particle type for the dot click effect ──
interface DotParticle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  char: string;
}

export default function ComingSoonGuard({ children }: ComingSoonGuardProps) {
  const { user, loading: authLoading } = useAuth();

  const [isAdminUnlocked, setIsAdminUnlocked] = useState<boolean>(false);
  const [checkingAdmin, setCheckingAdmin] = useState<boolean>(false);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [showAdminModal, setShowAdminModal] = useState<boolean>(false);
  const [showMiniGame, setShowMiniGame] = useState<boolean>(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState<boolean>(false);

  // Auth states for AdminLoginGate
  const [loginEmail, setLoginEmail] = useState<string>('');
  const [loginPassword, setLoginPassword] = useState<string>('');
  const [isSigningIn, setIsSigningIn] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Click counter for secret logo trigger
  const [logoClicks, setLogoClicks] = useState<number>(0);

  // Easter egg state
  const [currentTagline, setCurrentTagline] = useState(0);
  const [toast, setToast] = useState<string | null>(null);
  const [greeting, setGreeting] = useState('');
  const [dotParticles, setDotParticles] = useState<DotParticle[]>([]);
  const [dotClickCount, setDotClickCount] = useState(0);
  const [shakeTriggered, setShakeTriggered] = useState(false);
  const [longPressActive, setLongPressActive] = useState(false);
  const [idleMsg, setIdleMsg] = useState<string | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [hintDismissed, setHintDismissed] = useState(false);

  // Refs
  const typedBuffer = useRef('');
  const typedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const particleIdCounter = useRef(0);
  const shakeCount = useRef(0);
  const lastAccel = useRef({ x: 0, y: 0, z: 0 });
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const shakeRecentlyFired = useRef(false);

  // ── Console art on mount ──
  useEffect(() => {
    console.log(CONSOLE_ART, 'color: #F25A2B; font-size: 10px; font-family: monospace;');
  }, []);

  // ── Time-based greeting ──
  useEffect(() => {
    const h = new Date().getHours();
    if (h < 5) setGreeting('Late night, huh?');
    else if (h < 12) setGreeting('Good morning');
    else if (h < 17) setGreeting('Good afternoon');
    else if (h < 21) setGreeting('Good evening');
    else setGreeting('Night owl mode');
  }, []);

  // ── Rotating taglines ──
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTagline(prev => (prev + 1) % TAGLINES.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // ── Delayed hint — appears after 10s, fades out after 18s ──
  useEffect(() => {
    if (isAdminUnlocked || hintDismissed) return;
    const showTimer = setTimeout(() => setShowHint(true), 10000);
    const hideTimer = setTimeout(() => {
      setShowHint(false);
      setHintDismissed(true);
    }, 25000);
    return () => { clearTimeout(showTimer); clearTimeout(hideTimer); };
  }, [isAdminUnlocked, hintDismissed]);

  // ── Show toast helper ──
  const showToast = useCallback((msg: string) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast(msg);
    // Dismiss the hint once someone discovers an easter egg
    setShowHint(false);
    setHintDismissed(true);
    toastTimer.current = setTimeout(() => setToast(null), 3500);
  }, []);

  // ── Idle detection: after 45s of no interaction ──
  const resetIdleTimer = useCallback(() => {
    setIdleMsg(null);
    if (idleTimer.current) clearTimeout(idleTimer.current);
    idleTimer.current = setTimeout(() => {
      const msgs = [
        'Still here? We appreciate the patience.',
        'You\'ve been staring at this page longer than most gig promoters take to pay.',
        'This page has more visitors than your last open mic. (jk, we love you)',
        'Fun fact: You\'ve now spent more time here than it takes to book a gig on ArtisTant.',
      ];
      setIdleMsg(msgs[Math.floor(Math.random() * msgs.length)]);
    }, 45000);
  }, []);

  useEffect(() => {
    if (isAdminUnlocked) return;
    resetIdleTimer();

    const onActivity = () => resetIdleTimer();
    window.addEventListener('mousemove', onActivity);
    window.addEventListener('keydown', onActivity);
    window.addEventListener('touchstart', onActivity);
    return () => {
      window.removeEventListener('mousemove', onActivity);
      window.removeEventListener('keydown', onActivity);
      window.removeEventListener('touchstart', onActivity);
      if (idleTimer.current) clearTimeout(idleTimer.current);
    };
  }, [isAdminUnlocked, resetIdleTimer]);

  // ── Secret word detection (type anywhere on page) ──
  useEffect(() => {
    if (isAdminUnlocked) return;

    const handleType = (e: KeyboardEvent) => {
      // Skip modifier keys, arrows, etc.
      if (e.key.length !== 1) return;

      typedBuffer.current += e.key.toLowerCase();

      // Keep buffer to reasonable length
      if (typedBuffer.current.length > 30) {
        typedBuffer.current = typedBuffer.current.slice(-20);
      }

      // Check if any secret word is at the end of the buffer
      for (const [word, response] of Object.entries(SECRET_WORDS)) {
        if (typedBuffer.current.endsWith(word)) {
          showToast(response);
          typedBuffer.current = '';
          break;
        }
      }

      // Clear buffer after 2s of no typing
      if (typedTimer.current) clearTimeout(typedTimer.current);
      typedTimer.current = setTimeout(() => { typedBuffer.current = ''; }, 2000);
    };

    window.addEventListener('keydown', handleType);
    return () => window.removeEventListener('keydown', handleType);
  }, [isAdminUnlocked, showToast]);

  // ── Shake detection (mobile) — shake your phone to trigger ──
  useEffect(() => {
    if (isAdminUnlocked) return;

    const shakeMessages = [
      '📳 You shook the page! Didn\'t break anything... this time.',
      '🫨 Earthquake detected. Magnitude: vibes.',
      '📳 Shake it off, shake it off 🎵 — but the launch date stays.',
      '🫨 Your phone called. It said stop shaking it.',
    ];

    let shakeTimeout: ReturnType<typeof setTimeout> | null = null;

    const handleMotion = (e: DeviceMotionEvent) => {
      if (shakeRecentlyFired.current) return;

      const acc = e.accelerationIncludingGravity;
      if (!acc || acc.x === null || acc.y === null || acc.z === null) return;

      const dx = Math.abs(acc.x - lastAccel.current.x);
      const dy = Math.abs(acc.y - lastAccel.current.y);
      const dz = Math.abs(acc.z - lastAccel.current.z);

      lastAccel.current = { x: acc.x, y: acc.y, z: acc.z };

      if (dx + dy + dz > SHAKE_THRESHOLD) {
        shakeCount.current++;

        // Reset count if no more shakes within 800ms
        if (shakeTimeout) clearTimeout(shakeTimeout);
        shakeTimeout = setTimeout(() => { shakeCount.current = 0; }, 800);

        if (shakeCount.current >= SHAKE_COUNT_TRIGGER) {
          shakeCount.current = 0;
          shakeRecentlyFired.current = true;
          setTimeout(() => { shakeRecentlyFired.current = false; }, 5000);

          setShakeTriggered(true);
          showToast(shakeMessages[Math.floor(Math.random() * shakeMessages.length)]);
          setTimeout(() => setShakeTriggered(false), 1500);
        }
      }
    };

    window.addEventListener('devicemotion', handleMotion);
    return () => {
      window.removeEventListener('devicemotion', handleMotion);
      if (shakeTimeout) clearTimeout(shakeTimeout);
    };
  }, [isAdminUnlocked, showToast]);

  // ── Long-press headline (3s hold) — works on both mobile and desktop ──
  const handleHeadlinePressStart = () => {
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
    longPressTimer.current = setTimeout(() => {
      setLongPressActive(true);
      showToast('🤐 You held it for 3 seconds. Fine — the launch is closer than you think.');
      setTimeout(() => setLongPressActive(false), 3000);
    }, 3000);
  };

  const handleHeadlinePressEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };
  const handleDotClick = (e: React.MouseEvent) => {
    e.stopPropagation();

    const rect = (e.target as HTMLElement).getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;

    // Spawn emoji particles from the dot
    const emojis = ['🔥', '🍳', '👨‍🍳', '💥', '✨', '🎵', '🎤', '🎸', '🥁', '🎹'];
    const newParticles: DotParticle[] = [];
    for (let i = 0; i < 8; i++) {
      const angle = (Math.PI * 2 * i) / 8 + (Math.random() - 0.5) * 0.5;
      newParticles.push({
        id: particleIdCounter.current++,
        x: cx,
        y: cy,
        vx: Math.cos(angle) * (2 + Math.random() * 3),
        vy: Math.sin(angle) * (2 + Math.random() * 3) - 2,
        life: 1,
        char: emojis[Math.floor(Math.random() * emojis.length)],
      });
    }
    setDotParticles(prev => [...prev, ...newParticles]);

    // Animate particles out
    const animateParticles = () => {
      setDotParticles(prev => {
        const next = prev.map(p => ({
          ...p,
          x: p.x + p.vx,
          y: p.y + p.vy,
          vy: p.vy + 0.15,
          life: p.life - 0.025,
        })).filter(p => p.life > 0);
        if (next.length > 0) requestAnimationFrame(animateParticles);
        return next;
      });
    };
    requestAnimationFrame(animateParticles);

    const count = dotClickCount + 1;
    setDotClickCount(count);

    if (count === 1) showToast('🔥 The dot is interactive. Keep going.');
    else if (count === 5) showToast('🍳 Now we\'re cooking.');
    else if (count === 10) showToast('👨‍🍳 Chef mode activated.');
    else if (count === 20) showToast('💥 You\'re officially obsessed.');
    else if (count === 50) showToast('🏆 50 clicks. We\'re adding you to the credits.');
    else if (count === 100) showToast('🐐 100. GOAT status. Screenshot this.');
  };

  // ── Core admin logic (unchanged) ──

  const verifyAdminStatus = useCallback(async () => {
    try {
      if (typeof window !== 'undefined') {
        const storedBypass = localStorage.getItem(ADMIN_STORAGE_KEY);
        if (storedBypass === 'true') {
          setIsAdminUnlocked(true);
          setIsAdmin(true);
          return;
        }
      }

      if (user) {
        setCheckingAdmin(true);
        const userEmail = user.email?.trim().toLowerCase() || '';
        if (KNOWN_ADMIN_EMAILS.includes(userEmail)) {
          setIsAdmin(true);
          setIsAdminUnlocked(true);
          if (typeof window !== 'undefined') {
            localStorage.setItem(ADMIN_STORAGE_KEY, 'true');
          }
          setCheckingAdmin(false);
          return;
        }

        try {
          const token = await user.getIdToken();
          const adminCheck = await checkIsAdminAction(token);
          setIsAdmin(adminCheck);
          if (adminCheck) {
            setIsAdminUnlocked(true);
            if (typeof window !== 'undefined') {
              localStorage.setItem(ADMIN_STORAGE_KEY, 'true');
            }
          }
        } catch (err) {
          console.warn('Admin check error:', err);
          setIsAdmin(false);
        } finally {
          setCheckingAdmin(false);
        }
      } else {
        setIsAdmin(false);
        setIsAdminUnlocked(false);
      }
    } catch (e) {
      console.warn('Error verifying admin access:', e);
      setIsAdminUnlocked(false);
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading) {
      verifyAdminStatus();
    }
  }, [user, authLoading, verifyAdminStatus]);

  // Keyboard shortcut: Cmd+K / Ctrl+K / `~`
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setShowAdminModal(prev => !prev);
      } else if (e.key === '~' || ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 'a')) {
        e.preventDefault();
        setShowAdminModal(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Lock body scrolling when overlay is active
  useEffect(() => {
    if (!isAdminUnlocked) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, [isAdminUnlocked]);

  // Secret Logo Trigger: 3 clicks
  const handleSecretClick = () => {
    const next = logoClicks + 1;
    setLogoClicks(next);
    if (next >= 3) {
      setShowAdminModal(true);
      setLogoClicks(0);
    }
  };

  // Google Login Submit
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSigningIn(true);
    setAuthError('');

    try {
      const res = await signInWithGoogle();
      if (res?.user) {
        const userEmail = res.user.email?.trim().toLowerCase() || '';
        if (KNOWN_ADMIN_EMAILS.includes(userEmail)) {
          setIsAdmin(true);
          setIsAdminUnlocked(true);
          localStorage.setItem(ADMIN_STORAGE_KEY, 'true');
          setShowAdminModal(false);
          return;
        }

        const token = await res.user.getIdToken();
        const adminCheck = await checkIsAdminAction(token);
        setIsAdmin(adminCheck);
        if (adminCheck) {
          setIsAdminUnlocked(true);
          localStorage.setItem(ADMIN_STORAGE_KEY, 'true');
          setShowAdminModal(false);
        } else {
          setAuthError(`Account (${userEmail}) is not an administrator.`);
        }
      }
    } catch (err: any) {
      console.error('Sign-in error:', err);
      setAuthError(err?.message || 'Authentication failed.');
    } finally {
      setIsSigningIn(false);
    }
  };

  // Email / Password Login Submit
  const handleEmailLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      setAuthError('Please enter your email and password.');
      return;
    }

    setIsSigningIn(true);
    setAuthError('');

    try {
      const res = await signInWithEmail(loginEmail.trim(), loginPassword);
      if (res?.user) {
        const userEmail = res.user.email?.trim().toLowerCase() || '';
        if (KNOWN_ADMIN_EMAILS.includes(userEmail)) {
          setIsAdmin(true);
          setIsAdminUnlocked(true);
          localStorage.setItem(ADMIN_STORAGE_KEY, 'true');
          setShowAdminModal(false);
          return;
        }

        const token = await res.user.getIdToken();
        const adminCheck = await checkIsAdminAction(token);
        setIsAdmin(adminCheck);
        if (adminCheck) {
          setIsAdminUnlocked(true);
          localStorage.setItem(ADMIN_STORAGE_KEY, 'true');
          setShowAdminModal(false);
        } else {
          setAuthError(`Account (${userEmail}) is not an administrator.`);
        }
      }
    } catch (err: any) {
      setAuthError(err?.message || 'Invalid email or password.');
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      await firebaseSignOut();
    } catch (e) {
      console.warn('Sign out error:', e);
    }
    localStorage.removeItem(ADMIN_STORAGE_KEY);
    setIsAdmin(false);
    setIsAdminUnlocked(false);
  };

  const verifyAndLoad = () => {
    localStorage.setItem(ADMIN_STORAGE_KEY, 'true');
    setIsAdminUnlocked(true);
    setShowAdminModal(false);
  };

  const handleLockSite = () => {
    localStorage.removeItem(ADMIN_STORAGE_KEY);
    setIsAdminUnlocked(false);
  };

  return (
    <div className="relative min-h-[100dvh] w-full font-sans bg-[#08080C] text-white overflow-x-hidden">
      {/* ─── 1. Underlying Website Content (Blurred for Non-Admins) ─── */}
      <div
        className={`transition-all duration-1000 ease-out ${
          !isAdminUnlocked
            ? 'filter blur-3xl opacity-15 pointer-events-none select-none overflow-hidden max-h-screen scale-[0.98]'
            : 'filter-none opacity-100 pointer-events-auto select-auto scale-100'
        }`}
        aria-hidden={!isAdminUnlocked}
        inert={!isAdminUnlocked ? true : undefined}
      >
        {children}
      </div>

      {/* ─── 2. Coming Soon Overlay ─── */}
      {!isAdminUnlocked && (
        <div
          className={`fixed inset-0 z-[9999] flex flex-col items-center p-4 sm:p-8 md:p-12 bg-[#08080C] select-none overflow-y-auto overflow-x-hidden min-h-[100dvh] ${
            shakeTriggered ? 'animate-[wiggle_0.3s_ease-in-out_3]' : ''
          }`}
        >

          {/* ── Top Nav ── */}
          <header className="relative z-10 w-full max-w-3xl flex items-center justify-between pt-2 sm:pt-4 shrink-0">
            <button
              type="button"
              onClick={handleSecretClick}
              className="focus:outline-none cursor-default"
              title="ArtisTant"
            >
              <img
                src="/logo_wordmark_flat.png"
                alt="ArtisTant"
                className="h-5 sm:h-6 w-auto object-contain"
              />
            </button>

            <span className="text-[10px] font-mono text-zinc-600 tracking-wide">
              {greeting}
            </span>
          </header>

          {/* ── Center Stage ── */}
          <main className="relative z-10 flex-1 flex flex-col items-center justify-center text-center max-w-3xl w-full px-2 sm:px-4">

            {/* Eyebrow */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="text-[10px] font-mono uppercase tracking-[0.25em] text-zinc-600 mb-6"
            >
              Coming Soon
            </motion.p>

            {/* Headline — long-press for 3s for a secret, the dot is also clickable */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="font-display text-[clamp(2.4rem,9vw,6rem)] font-black uppercase tracking-tight text-white leading-[0.9] whitespace-nowrap mb-4 cursor-default"
              onMouseDown={handleHeadlinePressStart}
              onMouseUp={handleHeadlinePressEnd}
              onMouseLeave={handleHeadlinePressEnd}
              onTouchStart={handleHeadlinePressStart}
              onTouchEnd={handleHeadlinePressEnd}
            >
              LET US COOK
              <span
                className="text-[#F25A2B] cursor-pointer hover:scale-150 inline-block transition-transform duration-200 active:scale-75 select-none animate-pulse"
                onClick={handleDotClick}
                role="button"
                tabIndex={0}
              >
                .
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="text-[clamp(0.75rem,3.2vw,1.3rem)] font-display font-medium text-zinc-300 tracking-tight leading-tight whitespace-nowrap mb-3"
            >
              India&apos;s live entertainment marketplace &amp; artist network.
            </motion.p>

            {/* Value line */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="font-mono text-[clamp(0.58rem,2.2vw,0.8rem)] text-zinc-500 tracking-wider whitespace-nowrap mb-2"
            >
              Direct gig bookings &bull; Escrow protection &bull; Zero broker cuts
            </motion.p>

            {/* Rotating tagline */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="h-6 flex items-center justify-center mb-8"
            >
              <AnimatePresence mode="wait">
                <motion.p
                  key={currentTagline}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.4 }}
                  className="text-[12px] sm:text-[13px] text-zinc-500 font-mono italic"
                >
                  {TAGLINES[currentTagline]}
                </motion.p>
              </AnimatePresence>
            </motion.div>

            {/* ── Interactive Cards ── */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-lg flex flex-col gap-3 mb-6"
            >
              {/* Card 1: Shape the Platform — Feedback & Feature Roadmap Blueprint */}
              <button
                type="button"
                onClick={() => setShowFeedbackModal(true)}
                className="group w-full rounded-2xl bg-gradient-to-br from-white/[0.04] to-white/[0.01] hover:from-white/[0.07] hover:to-white/[0.02] border border-white/[0.08] hover:border-white/[0.18] transition-all duration-300 overflow-hidden text-left cursor-pointer active:scale-[0.98]"
              >
                <div className="flex items-stretch">
                  {/* Left: Form & Feature Blueprint Mockup */}
                  <div className="w-20 sm:w-24 shrink-0 bg-white/[0.02] border-r border-white/[0.06] flex items-center justify-center py-4 sm:py-5 group-hover:bg-white/[0.04] transition-colors relative overflow-hidden">
                    {/* Stylized Document / Form Card */}
                    <div className="w-10 sm:w-11 h-16 sm:h-[4.5rem] rounded-lg border border-white/[0.12] bg-[#0c0c14] p-1.5 flex flex-col justify-between shadow-inner relative group-hover:border-[#F25A2B]/40 transition-colors">
                      {/* Top row: Radio dot + line */}
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full border border-[#F25A2B] bg-[#F25A2B]/20 flex items-center justify-center shrink-0">
                          <div className="w-0.5 h-0.5 rounded-full bg-[#F25A2B]" />
                        </div>
                        <div className="w-full h-[2px] rounded-full bg-white/[0.15]" />
                      </div>

                      {/* Middle row: Checkbox + input rows */}
                      <div className="flex flex-col gap-1 my-auto">
                        <div className="flex items-center gap-1">
                          <div className="w-1.5 h-1.5 rounded-[2px] bg-white/[0.2] border border-white/[0.3] flex items-center justify-center shrink-0" />
                          <div className="w-3/4 h-[2px] rounded-full bg-white/[0.1]" />
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-1.5 h-1.5 rounded-[2px] bg-white/[0.2] border border-white/[0.3] flex items-center justify-center shrink-0" />
                          <div className="w-1/2 h-[2px] rounded-full bg-white/[0.1]" />
                        </div>
                      </div>

                      {/* Bottom action button */}
                      <div className="w-full h-2 rounded-sm bg-white/[0.08] group-hover:bg-white/[0.15] transition-colors flex items-center justify-center">
                        <div className="w-1/2 h-[2px] rounded-full bg-white/40" />
                      </div>
                    </div>
                  </div>

                  {/* Right: Content & Badges */}
                  <div className="flex-1 p-4 sm:p-5 flex flex-col justify-center gap-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-sm sm:text-base font-semibold tracking-tight text-white flex items-center gap-1.5">
                          Shape the Platform
                          <ArrowUpRight className="w-3.5 h-3.5 text-white/40 group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                        </h3>
                        <p className="text-zinc-500 text-[11px] sm:text-xs leading-relaxed mt-0.5">
                          Tell us what&apos;s broken in live entertainment &amp; what features you want built.
                        </p>
                      </div>
                    </div>

                    {/* Tags / Pills */}
                    <div className="flex items-center gap-2 pt-0.5">
                      <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/[0.04] border border-white/[0.06]">
                        <MessageSquarePlus className="w-2.5 h-2.5 text-[#F25A2B]" />
                        <span className="text-[9px] font-mono text-zinc-400">Market Issues</span>
                      </div>
                      <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/[0.04] border border-white/[0.06]">
                        <FileText className="w-2.5 h-2.5 text-[#7C5CFF]" />
                        <span className="text-[9px] font-mono text-zinc-400">Feature Requests</span>
                      </div>
                    </div>
                  </div>
                </div>
              </button>

              {/* Card 2: Stack — Arcade Game Mockup */}
              <button
                type="button"
                onClick={() => setShowMiniGame(true)}
                className="group w-full rounded-2xl bg-gradient-to-br from-white/[0.04] to-white/[0.01] hover:from-white/[0.07] hover:to-white/[0.02] border border-white/[0.08] hover:border-white/[0.18] transition-all duration-300 overflow-hidden text-left cursor-pointer active:scale-[0.98]"
              >
                <div className="flex items-stretch">
                  {/* Left: Animated Arcade Stack Mockup */}
                  <div className="w-20 sm:w-24 shrink-0 bg-white/[0.02] border-r border-white/[0.06] flex items-center justify-center py-4 sm:py-5 group-hover:bg-white/[0.04] transition-colors relative overflow-hidden">
                    {/* Stylized Arcade Screen */}
                    <div className="w-10 sm:w-11 h-16 sm:h-[4.5rem] rounded-lg border border-white/[0.12] bg-[#0c0c14] p-1.5 flex flex-col justify-end items-center gap-[3px] shadow-inner relative overflow-hidden group-hover:border-purple-400/40 transition-colors">
                      {/* Scanline hint */}
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/[0.02] to-transparent pointer-events-none" />

                      {/* Moving top block */}
                      <motion.div
                        animate={{ x: [-6, 6, -6] }}
                        transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                        className="w-5 h-1.5 rounded-[1px] bg-white border-t border-white shadow-[0_0_8px_rgba(255,255,255,0.4)]"
                      />

                      {/* Placed stack blocks */}
                      <div className="w-6 h-1.5 rounded-[1px] bg-white/40 border-t border-white/60" />
                      <div className="w-7 h-1.5 rounded-[1px] bg-white/25 border-t border-white/40" />
                      <div className="w-8 h-2 rounded-[1px] bg-white/15 border-t border-white/25" />
                    </div>
                  </div>

                  {/* Right: Content & Badges */}
                  <div className="flex-1 p-4 sm:p-5 flex flex-col justify-center gap-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-sm sm:text-base font-semibold tracking-tight text-white flex items-center gap-1.5">
                          Stack — Mini Arcade
                          <ArrowUpRight className="w-3.5 h-3.5 text-white/40 group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                        </h3>
                        <p className="text-zinc-500 text-[11px] sm:text-xs leading-relaxed mt-0.5">
                          One-tap precision block stacker. Beat your high score while you wait.
                        </p>
                      </div>
                    </div>

                    {/* Tags / Pills */}
                    <div className="flex items-center gap-2 pt-0.5">
                      <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white/[0.04] border border-white/[0.06]">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-[9px] font-mono text-zinc-400">Playable Now</span>
                      </div>
                      <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/[0.04] border border-white/[0.06]">
                        <Zap className="w-2.5 h-2.5 text-amber-400" />
                        <span className="text-[9px] font-mono text-zinc-400">Tap to Place</span>
                      </div>
                    </div>
                  </div>
                </div>
              </button>

              {/* Card 3: Take Artistant Anywhere — Mobile App Preview */}
              <div className="w-full rounded-2xl bg-gradient-to-br from-white/[0.04] to-white/[0.01] border border-white/[0.08] overflow-hidden text-left">
                <div className="flex items-stretch">
                  {/* Left: Phone silhouette */}
                  <div className="w-20 sm:w-24 shrink-0 bg-white/[0.02] border-r border-white/[0.06] flex items-center justify-center py-4 sm:py-5">
                    <div className="w-10 sm:w-11 h-16 sm:h-[4.5rem] rounded-lg border-2 border-white/[0.12] bg-[#0c0c14] relative shadow-inner">
                      {/* Notch */}
                      <div className="absolute top-1 left-1/2 -translate-x-1/2 w-4 h-1 rounded-full bg-white/[0.08]" />
                      {/* Screen content hint */}
                      <div className="absolute inset-[5px] top-3.5 flex flex-col gap-[3px]">
                        <div className="w-full h-[3px] rounded-full bg-white/[0.1]" />
                        <div className="w-3/4 h-[3px] rounded-full bg-white/[0.06]" />
                        <div className="w-1/2 h-[3px] rounded-full bg-white/[0.06]" />
                      </div>
                      {/* Home bar */}
                      <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-4 h-[2px] rounded-full bg-white/[0.1]" />
                    </div>
                  </div>

                  {/* Right: Content */}
                  <div className="flex-1 p-4 sm:p-5 flex flex-col justify-center gap-2">
                    <div>
                      <h3 className="text-sm sm:text-base font-semibold tracking-tight text-white">
                        Take Artistant Anywhere
                      </h3>
                      <p className="text-zinc-500 text-[11px] sm:text-xs leading-relaxed mt-0.5">
                        Direct gig bookings, escrow payments &amp; artist network in your pocket.
                      </p>
                    </div>

                    {/* App store hints */}
                    <div className="flex items-center gap-2 pt-0.5">
                      <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-white/[0.04] border border-white/[0.06]">
                        <svg className="w-3 h-3 text-white/40" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
                        <span className="text-[9px] font-mono text-white/40 uppercase tracking-wider">iOS App</span>
                      </div>
                      <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-white/[0.04] border border-white/[0.06]">
                        <svg className="w-3 h-3 text-white/40" viewBox="0 0 24 24" fill="currentColor"><path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 01-.61-.92V2.734a1 1 0 01.609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.198l2.807 1.626a1 1 0 010 1.73l-2.808 1.626L15.206 12l2.492-2.491zM5.864 2.658L16.802 8.99l-2.303 2.303-8.635-8.635z"/></svg>
                        <span className="text-[9px] font-mono text-white/40 uppercase tracking-wider">Android</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Idle message */}
            <AnimatePresence>
              {idleMsg && (
                <motion.p
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-[11px] text-zinc-600 font-mono italic mb-4"
                >
                  {idleMsg}
                </motion.p>
              )}
            </AnimatePresence>

            {/* Whisper hint — appears after 10s, auto-hides */}
            <AnimatePresence>
              {showHint && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.5 }}
                  className="text-[11px] text-zinc-700 font-mono tracking-wide mb-2"
                >
                  psst — this page has secrets. poke around.
                </motion.p>
              )}
            </AnimatePresence>

          </main>

          {/* ── Footer ── */}
          <footer className="relative z-10 w-full max-w-3xl flex items-center justify-between text-[10px] font-mono text-zinc-600 pb-2 shrink-0">
            <span className="tracking-widest uppercase">
              ArtisTant &bull; Coming Soon &bull; <span className="text-zinc-700 normal-case tracking-normal">try typing something</span>
            </span>

            <button
              type="button"
              onClick={() => setShowAdminModal(true)}
              className="opacity-15 hover:opacity-100 transition-opacity p-2 text-zinc-500 hover:text-zinc-300 cursor-pointer"
              title="Admin (⌘K)"
            >
              <Lock className="w-3 h-3" />
            </button>
          </footer>

          {/* ── Modals ── */}
          <MarketFeedbackModal
            isOpen={showFeedbackModal}
            onClose={() => setShowFeedbackModal(false)}
          />

          <MiniGameModal
            isOpen={showMiniGame}
            onClose={() => setShowMiniGame(false)}
          />

          <AnimatePresence>
            {showAdminModal && (
              <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/90 backdrop-blur-2xl animate-in fade-in duration-200">
                <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl">
                  <button
                    type="button"
                    onClick={() => setShowAdminModal(false)}
                    className="absolute top-6 right-6 z-50 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-zinc-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer text-sm font-bold"
                  >
                    <X className="w-4 h-4" />
                  </button>

                  <AdminLoginGate
                    authLoading={authLoading}
                    checkingAdmin={checkingAdmin}
                    user={user}
                    isAdmin={isAdmin}
                    isUnlocked={isAdminUnlocked}
                    isLoading={isLoading}
                    isSigningIn={isSigningIn}
                    loginEmail={loginEmail}
                    setLoginEmail={setLoginEmail}
                    loginPassword={loginPassword}
                    setLoginPassword={setLoginPassword}
                    authError={authError}
                    handleLogout={handleLogout}
                    verifyAndLoad={verifyAndLoad}
                    handleLoginSubmit={handleLoginSubmit}
                    handleEmailLoginSubmit={handleEmailLoginSubmit}
                  />
                </div>
              </div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* ── Toast notification ── */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -10, x: '-50%' }}
            className="fixed bottom-8 left-1/2 z-[10003] px-5 py-2.5 bg-white text-black text-xs font-medium rounded-full shadow-2xl whitespace-nowrap"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Dot click particles (emoji confetti) ── */}
      {dotParticles.map(p => (
        <span
          key={p.id}
          className="fixed z-[10004] pointer-events-none text-lg select-none"
          style={{
            left: p.x,
            top: p.y,
            opacity: p.life,
            transform: `translate(-50%, -50%)`,
          }}
        >
          {p.char}
        </span>
      ))}

      {/* ─── 3. Floating Admin Status Pill (When Unlocked) ─── */}
      {isAdminUnlocked && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-5 right-5 z-[9999] flex items-center gap-3 bg-[#0F0F17]/95 border border-emerald-500/40 px-4 py-2 rounded-full shadow-[0_10px_35px_rgba(0,0,0,0.85)] backdrop-blur-xl text-xs text-emerald-400"
        >
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-mono font-bold uppercase tracking-wider text-[11px] text-white">
              Admin Active
            </span>
          </div>

          <span className="text-zinc-600">|</span>

          <a
            href="/admin"
            className="text-zinc-300 hover:text-white flex items-center gap-1 font-mono text-[11px] transition-colors"
          >
            Portal
            <ExternalLink className="w-3 h-3" />
          </a>

          <span className="text-zinc-600">|</span>

          <button
            type="button"
            onClick={handleLockSite}
            className="text-zinc-400 hover:text-red-400 font-mono text-[11px] cursor-pointer transition-colors flex items-center gap-1"
            title="Re-lock site"
          >
            <Lock className="w-3.5 h-3.5" />
            Lock
          </button>
        </motion.div>
      )}
    </div>
  );
}
