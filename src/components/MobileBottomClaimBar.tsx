'use client';

import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { type User } from 'firebase/auth';
import { type WaitlistEntry } from '@/lib/waitlist';
import { ArrowRight, Shield, Check, X, AlertCircle, LogIn, LogOut, User as UserIcon, Sun, Moon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';

interface MobileBottomClaimBarProps {
  user: User | null;
  userReservation: WaitlistEntry | null;
  usernameInput: string;
  setUsernameInput: (val: string) => void;
  availStatus: 'idle' | 'checking' | 'available' | 'taken' | 'invalid' | 'locked';
  validationError: string | null;
  onSignInClick: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onSignOut: () => Promise<void>;
  suggestions: string[];
  suggestionsLoading: boolean;
  onSuggestionClick: (name: string) => void;
  isHighlighted?: boolean;
}

export default function MobileBottomClaimBar({
  user,
  userReservation,
  usernameInput,
  setUsernameInput,
  availStatus,
  validationError,
  onSignInClick,
  onSubmit,
  onSignOut,
  suggestions,
  suggestionsLoading,
  onSuggestionClick,
  isHighlighted = false
}: MobileBottomClaimBarProps) {
  const router = useRouter();
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Sync mounted state to avoid hydration issues
  useEffect(() => {
    setMounted(true);
  }, []);

  // Sync and observe dark mode transitions matching Navbar.tsx
  useEffect(() => {
    const checkDark = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    };
    
    // Initial check
    checkDark();

    // Create mutation observer to listen for class changes on document root
    const observer = new MutationObserver(checkDark);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => observer.disconnect();
  }, []);

  // Close dropdown menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  const handleLogoClick = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleToggleTheme = () => {
    setTheme(resolvedTheme === "light" ? "dark" : "light");
    setMenuOpen(false);
  };

  const handleSignIn = () => {
    onSignInClick();
    setMenuOpen(false);
  };

  const handleSignOutClick = async () => {
    await onSignOut();
    setMenuOpen(false);
  };

  // Shared Liquid Glassmorphism styling configuration
  const glassStyle = {
    background: isDarkMode ? 'rgba(18, 20, 28, 0.45)' : 'rgba(255, 255, 255, 0.45)',
    backdropFilter: 'blur(24px) saturate(190%)',
    WebkitBackdropFilter: 'blur(24px) saturate(190%)',
  };

  const capsuleStyle = {
    ...glassStyle,
    border: isFocused 
      ? '1px solid var(--accent-high)' 
      : isDarkMode ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0, 0, 0, 0.08)',
    boxShadow: isFocused 
      ? isDarkMode 
        ? '0 12px 40px rgba(0, 0, 0, 0.4), inset 0 1px 0px rgba(255, 255, 255, 0.12), 0 0 15px var(--accent-high-glow)' 
        : '0 12px 40px rgba(0, 0, 0, 0.15), inset 0 1px 1px rgba(255, 255, 255, 0.4), 0 0 15px var(--accent-high-glow)'
      : isDarkMode
        ? '0 8px 32px rgba(0, 0, 0, 0.25), inset 0 1px 0px rgba(255, 255, 255, 0.12)'
        : '0 4px 30px rgba(0, 0, 0, 0.02), inset 0 1px 1px rgba(255, 255, 255, 0.4)'
  };

  const dropdownStyle = {
    ...glassStyle,
    border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0, 0, 0, 0.08)',
    boxShadow: isDarkMode 
      ? '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0px rgba(255, 255, 255, 0.12)'
      : '0 4px 30px rgba(0, 0, 0, 0.05), inset 0 1px 1px rgba(255, 255, 255, 0.4)'
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-2 pointer-events-auto select-none">
      
      {/* ── Floating Suggestions & Validation Tooltip Panel above the capsule ── */}
      <div className="relative w-full flex flex-col items-center gap-2">
        <AnimatePresence>
          {/* Suggestions List */}
          {suggestions.length > 0 && !suggestionsLoading && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="
                flex items-center gap-1.5 p-1.5 rounded-xl border shadow-[0_8px_24px_rgba(0,0,0,0.15)] 
              "
              style={dropdownStyle}
            >
              <span className="text-[9px] text-ink-3 uppercase tracking-wider font-mono font-bold pl-1.5">Try:</span>
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => onSuggestionClick(suggestion)}
                  className="
                    px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold cursor-pointer transition-all duration-150
                    bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 text-brand hover:bg-brand/10 hover:border-brand/30
                  "
                >
                  @{suggestion}
                </button>
              ))}
            </motion.div>
          )}

          {/* Validation Status message */}
          {availStatus !== 'idle' && (suggestions.length === 0 || availStatus === 'checking' || availStatus === 'available') && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.95 }}
              className="
                px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-[0_8px_24px_rgba(0,0,0,0.15)]
              "
              style={{
                ...dropdownStyle,
                borderColor: 
                  availStatus === 'available' ? 'rgba(52, 211, 153, 0.4)' :
                  availStatus === 'taken' ? 'rgba(255, 90, 95, 0.4)' :
                  availStatus === 'locked' ? 'rgba(212, 175, 55, 0.4)' :
                  availStatus === 'invalid' ? 'rgba(255, 199, 44, 0.4)' :
                  'rgba(124, 92, 255, 0.4)'
              }}
            >
              {availStatus === 'checking' && (
                <span className="text-brand animate-pulse">Checking availability...</span>
              )}
              {availStatus === 'available' && (
                <span className="text-emerald-500 flex items-center gap-1 font-bold">
                  <Check className="w-3.5 h-3.5 stroke-[3]" /> Handle is available!
                </span>
              )}
              {availStatus === 'taken' && (
                <span className="text-rose-500 flex items-center gap-1">
                  <X className="w-3.5 h-3.5 stroke-[3]" /> Taken — try another
                </span>
              )}
              {availStatus === 'locked' && (
                <span className="text-amber-500 flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5" /> Premium handle locked
                </span>
              )}
              {availStatus === 'invalid' && (
                <span className="text-amber-500 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> {validationError}
                </span>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── THE UNIFIED FLOATING CAPSULE CONTAINER ── */}
      <motion.div
        className="
          h-[54px] w-[330px] sm:w-[390px] md:w-[440px] rounded-full transition-all duration-300
          flex items-center justify-between px-2.5
        "
        style={capsuleStyle}
        animate={isHighlighted ? {
          scale: [1, 1.04, 0.98, 1.02, 1],
          borderColor: '#7C5CFF',
          boxShadow: isDarkMode 
            ? '0 0 25px rgba(124, 92, 255, 0.85), inset 0 1px 0px rgba(255, 255, 255, 0.12)' 
            : '0 0 25px rgba(124, 92, 255, 0.45), inset 0 1px 1px rgba(255, 255, 255, 0.4)'
        } : {}}
        transition={isHighlighted ? { duration: 0.8, times: [0, 0.25, 0.5, 0.75, 1], ease: 'easeInOut' } : {}}
      >
        
        {/* 1. Left Section: Logo Button */}
        <button
          type="button"
          onClick={handleLogoClick}
          className="w-10 h-10 rounded-full flex items-center justify-center hover:scale-105 transition-transform duration-200 cursor-pointer shrink-0"
          title="Scroll to top"
          aria-label="Scroll to top"
        >
          <img 
            src="/logo_a.png" 
            className="w-[32px] h-[32px] object-contain dark:invert-0 invert" 
            alt="ArtisTant Logo" 
          />
        </button>

        <div className="w-[1px] h-5 bg-glass-border mx-1 shrink-0" />

        {/* 2. Middle Section: Claim Input / Dashboard details */}
        <div className="flex-1 min-w-0 px-1.5 flex items-center h-full">
          {userReservation ? (
            // Logged In & Reserved Layout
            <div className="flex items-center justify-between w-full gap-2">
              <div className="flex flex-col min-w-0 text-left">
                <span className="text-[8px] text-ink-3 font-mono uppercase tracking-wider">Reserved</span>
                <span className="font-mono text-xs font-bold text-zinc-900 dark:text-white truncate">@{userReservation.username}</span>
              </div>
              <button
                onClick={() => router.push('/dashboard')}
                className="
                  btn-high shrink-0 py-1.5 px-3 text-[10px] font-bold transition-all duration-200
                  flex items-center gap-0.5 cursor-pointer
                "
              >
                Dashboard <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          ) : (
            // Waitlist claim input layout
            <form onSubmit={onSubmit} className="flex items-center w-full gap-1">
              <span className="font-mono text-sm text-brand font-bold pointer-events-none select-none z-10">@</span>
              <input
                id="bottom-username-input"
                type="text"
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                placeholder="yourname"
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                className="
                  w-full font-mono text-xs py-2 rounded-xl outline-none border-0 bg-transparent bottom-bar-input
                "
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="none"
                spellCheck="false"
              />
              <button
                type="submit"
                disabled={availStatus !== 'available' && availStatus !== 'locked'}
                className={`
                  shrink-0 px-3.5 py-1.5 rounded-full text-[9px] font-bold font-mono uppercase tracking-wider transition-all duration-200 cursor-pointer bottom-claim-btn
                  ${availStatus === 'available' || availStatus === 'locked'
                    ? 'bg-brand hover:bg-brand-2 text-white shadow-md'
                    : 'cursor-not-allowed'}
                `}
              >
                {availStatus === 'locked' ? 'Req' : 'Claim'}
              </button>
            </form>
          )}
        </div>

        <div className="w-[1px] h-5 bg-glass-border mx-1 shrink-0" />

        {/* 3. Right Section: Hamburger Menu dropdown */}
        <div className="relative shrink-0" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            className="w-10 h-10 rounded-full flex items-center justify-center hover:scale-105 transition-transform duration-200 text-ink hover:text-brand cursor-pointer"
            title="Menu"
            aria-label="Menu"
          >
            {/* Custom two-line hamburger icon */}
            <svg width="20" height="14" viewBox="0 0 20 14" fill="none" className="stroke-current">
              <line 
                x1="3" 
                y1="4" 
                x2="17" 
                y2="4" 
                stroke="currentColor" 
                strokeWidth="2.4" 
                strokeLinecap="round"
                className={`origin-center transition-all duration-200 ${menuOpen ? 'rotate-45 translate-y-[3px]' : ''}`}
              />
              <line 
                x1="3" 
                y1="10" 
                x2="17" 
                y2="10" 
                stroke="currentColor" 
                strokeWidth="2.4" 
                strokeLinecap="round"
                className={`origin-center transition-all duration-200 ${menuOpen ? '-rotate-45 -translate-y-[3px]' : ''}`}
              />
            </svg>
          </button>

          {/* Floating dropdown popup bubble */}
          <AnimatePresence>
            {menuOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 15 }}
                transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                className="
                  absolute bottom-16 right-0 min-w-[170px] rounded-2xl p-1.5 flex flex-col gap-1 z-50 shadow-[0_12px_40px_rgba(0,0,0,0.25)]
                "
                style={dropdownStyle}
              >
                {user ? (
                  <>
                    <button
                      onClick={() => { router.push('/dashboard'); setMenuOpen(false); }}
                      className="flex items-center gap-2.5 w-full text-left px-3.5 py-2.5 text-xs font-semibold rounded-xl text-ink hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
                    >
                      <UserIcon className="w-4 h-4 text-brand" />
                      Dashboard
                    </button>
                    <div className="h-[1px] bg-glass-border my-0.5" />
                  </>
                ) : (
                  <>
                    <button
                      onClick={handleSignIn}
                      className="flex items-center gap-2.5 w-full text-left px-3.5 py-2.5 text-xs font-semibold rounded-xl text-ink hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
                    >
                      <LogIn className="w-4 h-4 text-brand" />
                      Sign In / Log In
                    </button>
                    <div className="h-[1px] bg-glass-border my-0.5" />
                  </>
                )}

                <button
                  onClick={handleToggleTheme}
                  className="flex items-center gap-2.5 w-full text-left px-3.5 py-2.5 text-xs font-semibold rounded-xl text-ink hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
                >
                  {mounted && resolvedTheme === "light" ? (
                    <>
                      <Moon className="w-4 h-4 text-brand" />
                      <span>Dark Mode</span>
                    </>
                  ) : (
                    <>
                      <Sun className="w-4 h-4 text-brand" />
                      <span>Light Mode</span>
                    </>
                  )}
                </button>

                {user && (
                  <>
                    <div className="h-[1px] bg-glass-border my-0.5" />
                    <button
                      onClick={handleSignOutClick}
                      className="flex items-center gap-2.5 w-full text-left px-3.5 py-2.5 text-xs font-semibold rounded-xl text-ink-3 hover:text-ink hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 text-rose-500" />
                      Sign Out
                    </button>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </motion.div>
    </div>
  );
}
