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
    background: isDarkMode ? 'rgba(16, 18, 24, 0.85)' : 'rgba(255, 255, 255, 0.88)',
    backdropFilter: 'blur(24px) saturate(190%)',
    WebkitBackdropFilter: 'blur(24px) saturate(190%)',
  };

  const capsuleStyle = {
    ...glassStyle,
    border: isFocused 
      ? '1px solid rgba(242, 90, 43, 0.5)' 
      : isDarkMode ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid rgba(0, 0, 0, 0.08)',
    boxShadow: isFocused 
      ? isDarkMode 
        ? '0 16px 40px rgba(0, 0, 0, 0.5), inset 0 1px 0px rgba(255, 255, 255, 0.15), 0 0 20px rgba(242, 90, 43, 0.25)' 
        : '0 12px 32px rgba(0, 0, 0, 0.12), inset 0 1px 1px rgba(255, 255, 255, 0.6), 0 0 15px rgba(242, 90, 43, 0.2)'
      : isDarkMode
        ? '0 12px 36px rgba(0, 0, 0, 0.4), inset 0 1px 0px rgba(255, 255, 255, 0.12)'
        : '0 8px 30px rgba(0, 0, 0, 0.06), inset 0 1px 1px rgba(255, 255, 255, 0.6)'
  };

  const dropdownStyle = {
    ...glassStyle,
    border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid rgba(0, 0, 0, 0.08)',
    boxShadow: isDarkMode 
      ? '0 12px 36px rgba(0, 0, 0, 0.4), inset 0 1px 0px rgba(255, 255, 255, 0.12)'
      : '0 8px 30px rgba(0, 0, 0, 0.08), inset 0 1px 1px rgba(255, 255, 255, 0.6)'
  };

  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-2 pointer-events-auto select-none w-full max-w-[460px] px-4">
      
      {/* ── Floating Suggestions & Validation Tooltip Panel above the capsule ── */}
      <div className="relative w-full flex flex-col items-center gap-1.5">
        <AnimatePresence>
          {/* Suggestions List */}
          {suggestions.length > 0 && !suggestionsLoading && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.96 }}
              className="
                flex items-center gap-1.5 p-1.5 rounded-2xl border shadow-lg max-w-full overflow-x-auto no-scrollbar
              "
              style={dropdownStyle}
            >
              <span className="text-[9px] text-ink-3 uppercase tracking-wider font-mono font-bold pl-2 shrink-0">Try:</span>
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => onSuggestionClick(suggestion)}
                  className="
                    px-2.5 py-1 rounded-xl text-[10px] font-mono font-bold cursor-pointer transition-all duration-150 shrink-0
                    bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 text-brand hover:bg-brand/10 hover:border-brand/30
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
              initial={{ opacity: 0, y: 6, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6, scale: 0.96 }}
              className="
                px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 shadow-lg backdrop-blur-md
              "
              style={{
                ...dropdownStyle,
                borderColor: 
                  availStatus === 'available' ? 'rgba(52, 211, 153, 0.4)' :
                  availStatus === 'taken' ? 'rgba(255, 90, 95, 0.4)' :
                  availStatus === 'locked' ? 'rgba(212, 175, 55, 0.4)' :
                  availStatus === 'invalid' ? 'rgba(255, 199, 44, 0.4)' :
                  'rgba(242, 90, 43, 0.4)'
              }}
            >
              {availStatus === 'checking' && (
                <span className="text-brand animate-pulse text-[11px] font-mono font-medium">Checking handle availability...</span>
              )}
              {availStatus === 'available' && (
                <span className="text-emerald-500 flex items-center gap-1.5 text-xs font-bold">
                  <Check className="w-3.5 h-3.5 stroke-[3]" /> Handle is available!
                </span>
              )}
              {availStatus === 'taken' && (
                <span className="text-rose-500 flex items-center gap-1.5 text-xs font-medium">
                  <X className="w-3.5 h-3.5 stroke-[3]" /> Taken — try another
                </span>
              )}
              {availStatus === 'locked' && (
                <span className="text-amber-500 flex items-center gap-1.5 text-xs font-medium">
                  <Shield className="w-3.5 h-3.5" /> Premium handle locked
                </span>
              )}
              {availStatus === 'invalid' && (
                <span className="text-amber-500 flex items-center gap-1.5 text-xs font-medium">
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
          h-[54px] w-full rounded-full transition-all duration-300
          flex items-center justify-between pl-4 pr-2 sm:pr-2.5 gap-1.5
        "
        style={capsuleStyle}
        animate={isHighlighted ? {
          scale: [1, 1.03, 0.98, 1.01, 1],
          borderColor: '#F25A2B',
          boxShadow: isDarkMode 
            ? '0 0 30px rgba(242, 90, 43, 0.6), inset 0 1px 0px rgba(255, 255, 255, 0.2)' 
            : '0 0 25px rgba(242, 90, 43, 0.35), inset 0 1px 1px rgba(255, 255, 255, 0.6)'
        } : {}}
        transition={isHighlighted ? { duration: 0.8, times: [0, 0.25, 0.5, 0.75, 1], ease: 'easeInOut' } : {}}
      >
        
        {/* Middle Section: Claim Input / Dashboard details */}
        <div className="flex-1 min-w-0 flex items-center h-full px-1">
          {userReservation ? (
            // Logged In & Reserved Layout
            <div className="flex items-center justify-between w-full gap-2">
              <div className="flex flex-col min-w-0 text-left">
                <span className="text-[8px] text-ink-3 font-mono uppercase tracking-wider leading-none">Reserved</span>
                <span className="font-mono text-xs font-bold text-ink truncate">@{userReservation.username}</span>
              </div>
              <button
                onClick={() => router.push('/dashboard')}
                className="
                  bg-gradient-to-r from-[#F25A2B] to-[#7C5CFF] hover:opacity-95 text-white
                  shrink-0 py-1.5 px-3 rounded-full text-[10px] font-bold font-mono uppercase tracking-wider
                  flex items-center gap-1 cursor-pointer transition-all duration-200 shadow-sm hover:scale-[1.02]
                "
              >
                Dashboard <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          ) : (
            // Waitlist claim input layout
            <form onSubmit={onSubmit} className="flex items-center w-full gap-1.5">
              <div className="flex items-center gap-1 flex-1 min-w-0">
                <span className="font-mono text-xs sm:text-sm text-brand font-bold select-none shrink-0">@</span>
                <input
                  id="bottom-username-input"
                  type="text"
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                  placeholder="yourname"
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  className="
                    w-full font-mono text-xs sm:text-sm py-1.5 bg-transparent outline-none border-0 text-ink placeholder:text-ink-3 placeholder:opacity-50
                  "
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="none"
                  spellCheck="false"
                />
              </div>

              <button
                type="submit"
                disabled={availStatus !== 'available' && availStatus !== 'locked'}
                className={`
                  shrink-0 px-4 py-2 rounded-full text-[10px] sm:text-xs font-bold font-mono uppercase tracking-wider 
                  transition-all duration-200 cursor-pointer shadow-md
                  ${availStatus === 'available' || availStatus === 'locked'
                    ? 'bg-gradient-to-r from-[#F25A2B] to-[#7C5CFF] hover:scale-[1.04] active:scale-[0.96] text-white'
                    : 'bg-black/5 dark:bg-white/10 text-ink-3 border border-black/5 dark:border-white/5 cursor-not-allowed opacity-50'}
                `}
              >
                {availStatus === 'locked' ? 'Req' : 'Claim'}
              </button>
            </form>
          )}
        </div>

        <div className="w-[1px] h-4 bg-black/10 dark:bg-white/10 mx-0.5 shrink-0" />

        {/* 3. Right Section: Hamburger Menu dropdown */}
        <div className="relative shrink-0" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            className="w-9 h-9 rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all duration-200 text-ink hover:text-brand cursor-pointer"
            title="Menu"
            aria-label="Menu"
          >
            {/* Custom two-line minimalist hamburger icon */}
            <svg width="18" height="12" viewBox="0 0 18 12" fill="none" className="stroke-current">
              <line 
                x1="2" 
                y1="3" 
                x2="16" 
                y2="3" 
                stroke="currentColor" 
                strokeWidth="2.2" 
                strokeLinecap="round"
                className={`origin-center transition-all duration-200 ${menuOpen ? 'rotate-45 translate-y-[3px]' : ''}`}
              />
              <line 
                x1="2" 
                y1="9" 
                x2="16" 
                y2="9" 
                stroke="currentColor" 
                strokeWidth="2.2" 
                strokeLinecap="round"
                className={`origin-center transition-all duration-200 ${menuOpen ? '-rotate-45 -translate-y-[3px]' : ''}`}
              />
            </svg>
          </button>

          {/* Floating dropdown popup bubble */}
          <AnimatePresence>
            {menuOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 12 }}
                transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                className="
                  absolute bottom-14 right-0 min-w-[170px] rounded-2xl p-1.5 flex flex-col gap-1 z-50 shadow-xl backdrop-blur-2xl
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
                    <div className="h-[1px] bg-black/5 dark:bg-white/5 my-0.5" />
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
                    <div className="h-[1px] bg-black/5 dark:bg-white/5 my-0.5" />
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
                    <div className="h-[1px] bg-black/5 dark:bg-white/5 my-0.5" />
                    <button
                      onClick={handleSignOutClick}
                      className="flex items-center gap-2.5 w-full text-left px-3.5 py-2.5 text-xs font-semibold rounded-xl text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
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

