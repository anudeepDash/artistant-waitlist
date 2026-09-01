'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '@/hooks/useAuth';
import { signInWithGoogle, signInWithEmail, signOut as firebaseSignOut } from '@/lib/auth';
import { checkIsAdminAction } from '@/lib/admin-actions';
import AdminLoginGate from '@/components/admin/AdminLoginGate';
import MiniGameModal from '@/components/MiniGameModal';
import MarketFeedbackModal from '@/components/MarketFeedbackModal';
import { Lock, ExternalLink, X, QrCode, Zap, MessageSquarePlus } from 'lucide-react';

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

  // ── Show toast helper ──
  const showToast = useCallback((msg: string) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast(msg);
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
                className="text-[#F25A2B] cursor-pointer hover:scale-150 inline-block transition-transform duration-200 active:scale-75 select-none"
                onClick={handleDotClick}
                title="Click me"
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

            {/* ── Action Cards ── */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-md flex flex-col gap-3 mb-6"
            >
              {/* Shape the Platform */}
              <button
                type="button"
                onClick={() => setShowFeedbackModal(true)}
                className="group w-full flex items-center justify-between p-4 sm:p-5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] hover:border-white/[0.12] transition-all duration-300 text-left gap-3 cursor-pointer active:scale-[0.98]"
              >
                <div className="flex flex-col gap-0.5">
                  <h3 className="text-sm sm:text-base font-semibold tracking-tight text-white">
                    Shape the Platform
                  </h3>
                  <p className="text-zinc-500 text-[11px] sm:text-xs">
                    Tell us what&apos;s broken in live entertainment.
                  </p>
                </div>
                <div className="w-9 h-9 sm:w-10 sm:h-10 bg-white/[0.04] rounded-lg border border-white/[0.06] flex items-center justify-center shrink-0 group-hover:bg-white/[0.08] transition-colors">
                  <MessageSquarePlus className="w-4 h-4 text-white/30 group-hover:text-white/50 transition-colors" />
                </div>
              </button>

              {/* Play Game */}
              <button
                type="button"
                onClick={() => setShowMiniGame(true)}
                className="group w-full flex items-center justify-between p-4 sm:p-5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] hover:border-white/[0.12] transition-all duration-300 text-left gap-3 cursor-pointer active:scale-[0.98]"
              >
                <div className="flex flex-col gap-0.5">
                  <h3 className="text-sm sm:text-base font-semibold tracking-tight text-white">
                    Stack
                  </h3>
                  <p className="text-zinc-500 text-[11px] sm:text-xs">
                    Tap to stack. Don&apos;t miss.
                  </p>
                </div>
                <div className="w-9 h-9 sm:w-10 sm:h-10 bg-white/[0.04] rounded-lg border border-white/[0.06] flex items-center justify-center shrink-0 group-hover:bg-white/[0.08] transition-colors">
                  <Zap className="w-4 h-4 text-white/30 group-hover:text-white/50 transition-colors" />
                </div>
              </button>

              {/* Take Artistant Anywhere */}
              <div className="w-full flex items-center justify-between p-4 sm:p-5 rounded-2xl bg-white/[0.03] border border-white/[0.06] text-left gap-3">
                <div className="flex flex-col gap-0.5">
                  <h3 className="text-sm sm:text-base font-semibold tracking-tight text-white">
                    Take Artistant Anywhere
                  </h3>
                  <p className="text-zinc-500 text-[11px] sm:text-xs">
                    The booking engine in your pocket.
                  </p>
                </div>
                <div className="relative w-9 h-9 sm:w-10 sm:h-10 bg-white/[0.04] rounded-lg border border-white/[0.06] flex items-center justify-center shrink-0 overflow-hidden">
                  <QrCode className="w-4 h-4 text-white/20" />
                  <div className="absolute inset-0 backdrop-blur-[3px] bg-black/50 flex items-center justify-center">
                    <span className="text-[6px] font-mono font-bold text-white/60 uppercase tracking-widest text-center leading-tight">
                      Soon
                    </span>
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

          </main>

          {/* ── Footer ── */}
          <footer className="relative z-10 w-full max-w-3xl flex items-center justify-between text-[10px] font-mono text-zinc-600 pb-2 shrink-0">
            <span className="tracking-widest uppercase">
              ArtisTant &bull; Coming Soon
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
