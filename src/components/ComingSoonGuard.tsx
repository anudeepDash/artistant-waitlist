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

// ── Rotating taglines with meme references ──
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

// ── Footer easter egg messages ──
const FOOTER_MESSAGES = [
  'ArtisTant • Coming Soon',
  '👀 You\'re still here?',
  'Okay, you\'re persistent.',
  'Fine. We respect the grind.',
  'No secrets here. Or are there?',
  'Try ⌘K. Or don\'t. We\'re not your boss.',
  '🫡',
];

// ── Konami code sequence ──
const KONAMI = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','KeyB','KeyA'];

interface ComingSoonGuardProps {
  children: React.ReactNode;
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

  // Easter eggs
  const [currentTagline, setCurrentTagline] = useState(0);
  const [footerClickCount, setFooterClickCount] = useState(0);
  const [footerText, setFooterText] = useState(FOOTER_MESSAGES[0]);
  const [konamiActivated, setKonamiActivated] = useState(false);
  const [greeting, setGreeting] = useState('');
  const konamiProgress = useRef<string[]>([]);

  // Time-based greeting
  useEffect(() => {
    const h = new Date().getHours();
    if (h < 5) setGreeting('Late night, huh?');
    else if (h < 12) setGreeting('Good morning');
    else if (h < 17) setGreeting('Good afternoon');
    else if (h < 21) setGreeting('Good evening');
    else setGreeting('Night owl mode');
  }, []);

  // Rotating taglines
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTagline(prev => (prev + 1) % TAGLINES.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Footer easter egg
  const handleFooterEasterEgg = () => {
    const next = footerClickCount + 1;
    setFooterClickCount(next);
    if (next < FOOTER_MESSAGES.length) {
      setFooterText(FOOTER_MESSAGES[next]);
    } else {
      setFooterText(FOOTER_MESSAGES[0]);
      setFooterClickCount(0);
    }
  };

  // Konami code listener
  useEffect(() => {
    const handleKonami = (e: KeyboardEvent) => {
      konamiProgress.current.push(e.code);
      if (konamiProgress.current.length > KONAMI.length) {
        konamiProgress.current.shift();
      }
      if (konamiProgress.current.join(',') === KONAMI.join(',')) {
        setKonamiActivated(true);
        konamiProgress.current = [];
        setTimeout(() => setKonamiActivated(false), 3500);
      }
    };
    window.addEventListener('keydown', handleKonami);
    return () => window.removeEventListener('keydown', handleKonami);
  }, []);

  // Verify Admin Status
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
        <div className="fixed inset-0 z-[9999] flex flex-col items-center p-4 sm:p-8 md:p-12 bg-[#08080C] select-none overflow-y-auto overflow-x-hidden min-h-[100dvh]">

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

            <div className="flex items-center gap-3">
              {/* Konami hint — barely visible, rewards the curious */}
              <span
                className="text-[9px] font-mono text-zinc-700 hover:text-zinc-500 transition-colors hidden sm:block cursor-default select-text"
                title="Try typing this sequence…"
              >
                ↑↑↓↓←→←→BA
              </span>
              <span className="text-[10px] font-mono text-zinc-600 tracking-wide">
                {greeting}
              </span>
            </div>
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

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="font-display text-[clamp(2.4rem,9vw,6rem)] font-black uppercase tracking-tight text-white leading-[0.9] whitespace-nowrap mb-4"
            >
              LET US COOK<span className="text-[#F25A2B]">.</span>
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

            {/* Rotating tagline — meme-infused */}
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

            {/* Konami achievement toast */}
            <AnimatePresence>
              {konamiActivated && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="fixed top-6 left-1/2 -translate-x-1/2 z-[10003] px-5 py-2.5 bg-white text-black text-xs font-semibold rounded-full shadow-2xl"
                >
                  🎮 Achievement Unlocked: OG Gamer
                </motion.div>
              )}
            </AnimatePresence>

          </main>

          {/* ── Footer ── */}
          <footer className="relative z-10 w-full max-w-3xl flex items-center justify-between text-[10px] font-mono text-zinc-600 pb-2 shrink-0">
            <button
              type="button"
              onClick={handleFooterEasterEgg}
              className="tracking-widest uppercase cursor-default hover:text-zinc-400 transition-colors text-left"
            >
              {footerText}
            </button>

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
