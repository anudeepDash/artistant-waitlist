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
      {/* ─────────────────────────────────────────────────────────────
          1. Underlying Website Content (Heavily Blurred for Non-Admins)
         ───────────────────────────────────────────────────────────── */}
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

      {/* ─────────────────────────────────────────────────────────────
          2. Minimalist, Clean & Uncluttered "LET US COOK" Stage
         ───────────────────────────────────────────────────────────── */}
      {!isAdminUnlocked && (
        <div className="fixed inset-0 z-[9999] flex flex-col justify-between items-center p-4 sm:p-8 md:p-12 bg-[#08080C]/80 backdrop-blur-3xl select-none overflow-y-auto overflow-x-hidden min-h-[100dvh]">
          
          {/* Subtle Ambient Radial Glows */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] sm:w-[700px] h-[600px] sm:h-[700px] bg-[radial-gradient(ellipse_at_center,rgba(242,90,43,0.1)_0%,rgba(124,92,255,0.06)_50%,transparent_70%)] blur-[120px]" />
          </div>

          {/* Top Bar: Ultra-Clean Logo Only */}
          <header className="relative z-10 w-full max-w-5xl flex items-center justify-center pt-2">
            <button
              type="button"
              onClick={handleSecretClick}
              className="text-center focus:outline-none cursor-default"
              title="ArtisTant"
            >
              <img
                src="/logo_wordmark_flat.png"
                alt="ArtisTant"
                className="h-6 sm:h-7 w-auto object-contain"
              />
            </button>
          </header>

          {/* Center Stage: Minimal, Bold, Mobile-Optimized */}
          <main className="relative z-10 flex flex-col items-center justify-center text-center my-auto max-w-4xl w-full px-2 sm:px-4 py-6 sm:py-8 space-y-5 sm:space-y-6">
            
            {/* Minimalist Audio Oscillogram */}
            <div className="flex items-center gap-1 sm:gap-1.5 h-4 sm:h-5 opacity-70">
              {[20, 60, 40, 90, 50, 30, 80, 100, 70, 35, 85, 45, 95, 60, 25, 75, 40].map((h, i) => (
                <motion.div
                  key={i}
                  animate={{
                    scaleY: [0.3, 1, 0.4],
                    opacity: [0.4, 1, 0.4]
                  }}
                  transition={{
                    duration: 1 + (i % 5) * 0.15,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: i * 0.06
                  }}
                  className="w-[2px] h-full bg-gradient-to-t from-[#F25A2B] to-[#7C5CFF] rounded-full origin-center"
                />
              ))}
            </div>

            {/* Single Line Headline (Fluid clamp scaling for all screen widths) */}
            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="font-display text-[clamp(2.1rem,8.5vw,5.5rem)] font-black uppercase tracking-tight text-white leading-none whitespace-nowrap"
            >
              LET US COOK<span className="text-[#F25A2B]">.</span>
            </motion.h1>

            {/* Clean Editorial Copy & Back With A Bang */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-2.5 sm:space-y-3 w-full flex flex-col items-center"
            >
              {/* Single Line Description (Fluid clamp scaling for mobile) */}
              <p className="text-[clamp(0.72rem,3.4vw,1.35rem)] font-display font-medium text-zinc-200 tracking-tight leading-none whitespace-nowrap">
                India&apos;s live entertainment marketplace &amp; artist network.
              </p>
              
              {/* Single Line Sub-Values */}
              <p className="font-mono text-[clamp(0.58rem,2.4vw,0.85rem)] text-zinc-400 tracking-wider whitespace-nowrap">
                Direct gig bookings &bull; Escrow protection &bull; Zero broker cuts
              </p>

              <p className="text-[clamp(0.68rem,2.6vw,0.875rem)] font-mono font-bold tracking-[0.2em] uppercase text-transparent bg-clip-text bg-gradient-to-r from-[#F25A2B] via-[#D4567A] to-[#7C5CFF] pt-1 whitespace-nowrap">
                We will be back with a bang.
              </p>
            </motion.div>

            {/* Interactive Actions: Problem & Feature Request + Mini-Game */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-wrap items-center justify-center gap-2.5 pt-1"
            >
              {/* Problems & Feature Requests Modal Button */}
              <button
                type="button"
                onClick={() => setShowFeedbackModal(true)}
                className="group inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-white/20 text-xs sm:text-sm font-mono text-zinc-200 transition-all duration-300 cursor-pointer shadow-lg active:scale-95 hover:shadow-[0_0_25px_rgba(124,92,255,0.2)]"
              >
                <MessageSquarePlus className="w-3.5 h-3.5 text-[#7C5CFF] group-hover:scale-110 transition-transform duration-300" />
                <span>Problems &amp; Feature Requests</span>
              </button>

              {/* Mini-Game Trigger */}
              <button
                type="button"
                onClick={() => setShowMiniGame(true)}
                className="group inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-white/20 text-xs sm:text-sm font-mono text-zinc-200 transition-all duration-300 cursor-pointer shadow-lg active:scale-95 hover:shadow-[0_0_25px_rgba(242,90,43,0.2)]"
              >
                <Zap className="w-3.5 h-3.5 text-[#F25A2B] group-hover:scale-110 transition-transform duration-300" />
                <span>Play Soundwave Rider</span>
              </button>
            </motion.div>

            {/* Clean, Slim "Take Artistant Anywhere" Card (Mobile-Optimized) */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-lg flex items-center justify-between p-4 sm:p-5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.05] border border-white/10 backdrop-blur-xl transition-all duration-300 text-left gap-3 sm:gap-4 mt-2"
            >
              <div className="flex flex-col gap-0.5 sm:gap-1">
                <h3 className="font-display text-sm sm:text-base md:text-lg font-bold tracking-tight text-white">
                  Take Artistant Anywhere
                </h3>
                <p className="text-zinc-400 text-[11px] sm:text-xs leading-relaxed max-w-xs">
                  The complete booking engine in your pocket.
                </p>
              </div>

              <div className="relative w-12 h-12 sm:w-14 sm:h-14 bg-white/[0.05] rounded-xl border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                <QrCode className="w-6 h-6 sm:w-8 sm:h-8 text-white/30" />
                <div className="absolute inset-0 backdrop-blur-[4px] bg-black/60 flex items-center justify-center">
                  <span className="text-[7px] sm:text-[8px] font-bold text-white uppercase tracking-widest text-center leading-tight font-mono">
                    Coming<br />Soon
                  </span>
                </div>
              </div>
            </motion.div>

          </main>

          {/* Bottom Bar */}
          <footer className="relative z-10 w-full max-w-5xl flex items-center justify-between text-[10px] sm:text-[11px] font-mono text-zinc-500 pb-1">
            <span className="tracking-widest uppercase opacity-70">
              ArtisTant &bull; Coming Soon
            </span>

            {/* Invisible / subtle console trigger */}
            <button
              type="button"
              onClick={() => setShowAdminModal(true)}
              className="opacity-20 hover:opacity-100 transition-opacity p-2 text-zinc-500 hover:text-zinc-300 cursor-pointer"
              title="Admin Authentication (⌘K)"
            >
              <Lock className="w-3.5 h-3.5" />
            </button>
          </footer>

          {/* ─────────────────────────────────────────────────────────────
              The Market Problem & Feature Request Modal Panel
             ───────────────────────────────────────────────────────────── */}
          <MarketFeedbackModal
            isOpen={showFeedbackModal}
            onClose={() => setShowFeedbackModal(false)}
          />

          {/* ─────────────────────────────────────────────────────────────
              The Playable Mini-Game Modal Panel
             ───────────────────────────────────────────────────────────── */}
          <MiniGameModal
            isOpen={showMiniGame}
            onClose={() => setShowMiniGame(false)}
          />

          {/* ─────────────────────────────────────────────────────────────
              The Original Full AdminLoginGate Modal Panel
             ───────────────────────────────────────────────────────────── */}
          <AnimatePresence>
            {showAdminModal && (
              <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/90 backdrop-blur-2xl animate-in fade-in duration-200">
                <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl">
                  {/* Close button */}
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

      {/* ─────────────────────────────────────────────────────────────
          3. Floating Admin Status Pill (When Unlocked)
         ───────────────────────────────────────────────────────────── */}
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
