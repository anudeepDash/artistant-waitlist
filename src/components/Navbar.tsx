'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { type User } from 'firebase/auth';
import { type WaitlistEntry } from '@/lib/waitlist';
import { usePathname } from 'next/navigation';

/* ──────────────────────────────────────────────
   Navbar Props
   ────────────────────────────────────────────── */
interface NavbarProps {
  user: User | null;
  userReservation: WaitlistEntry | null;
  onSignInClick: () => void;
  onSignOut: () => Promise<void>;
  onProfileClick?: () => void;
  foundingPoints?: number;
}

/** Navigation link definition */
interface NavLink {
  label: string;
  sectionId: string;
}

/** Center nav links — smooth-scroll to corresponding <section id="..."> */
const NAV_LINKS: NavLink[] = [
  { label: 'Why Artistant', sectionId: 'problem-voices' },
  { label: 'Ecosystem', sectionId: 'ecosystem' },
  { label: 'Roadmap', sectionId: 'standard' },
];

/* ──────────────────────────────────────────────
   Navbar Component
   ────────────────────────────────────────────── */
const Navbar = ({ user, userReservation, onSignInClick, onSignOut, onProfileClick, foundingPoints }: NavbarProps) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);

  const pathname = usePathname();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Listen for scroll to toggle scrolled capsule state
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    // Run once on mount in case already scrolled
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when viewport widens past the breakpoint
  useEffect(() => {
    const mql = window.matchMedia('(min-width: 768px)');
    const onChange = (e: MediaQueryListEvent) => {
      if (e.matches) setMobileOpen(false);
    };
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, []);

  /** Smooth-scroll to a section or navigate to the landing page with anchor */
  const scrollToSection = useCallback((sectionId: string) => {
    if (pathname === '/') {
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } else {
      window.location.href = `/#${sectionId}`;
    }
    setMobileOpen(false);
  }, [pathname]);

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="fixed top-0 inset-x-0 z-50 px-4 pt-4 md:px-6 pointer-events-none"
    >
      <div
        className={[
          'mx-auto w-full transition-all duration-500 ease-out pointer-events-auto',
          scrolled
            ? 'max-w-4xl bg-glass-bg border border-glass-border/60 shadow-lg shadow-black/10 rounded-full py-2 px-5 md:py-2.5 md:px-7 backdrop-blur-xl'
            : 'max-w-7xl bg-transparent border-transparent py-4 px-6 md:px-10 rounded-none'
        ].join(' ')}
      >
        <div className="flex items-center justify-between">
          
          {/* ── LEFT: Wordmark ──────────────────────── */}
          <a
            href="/"
            aria-label="ArtisTant home"
            onClick={(e) => {
              if (pathname === '/') {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
            className="shrink-0 flex items-center"
          >
            <img
              src="/logo_wordmark.png"
              alt="ArtisTant"
              style={{
                height: scrolled ? '56px' : '90px',
                width: 'auto',
                display: 'block'
              }}
              className="object-contain transition-all duration-300 dark:invert-0 invert"
            />
          </a>

          {/* ── CENTER: Desktop Nav Links ───────────── */}
          {pathname === '/' && (
            <ul className="hidden md:flex items-center gap-1.5">
              {NAV_LINKS.map((link) => (
                <motion.li 
                  key={link.label}
                  onHoverStart={() => setHoveredLink(link.label)}
                  onHoverEnd={() => setHoveredLink(null)}
                  className="relative"
                >
                  {hoveredLink === link.label && (
                    <motion.div
                      layoutId="nav-hover-pill"
                      className="absolute inset-0 bg-ink/5 dark:bg-white/10 rounded-full -z-10"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                  <button
                    type="button"
                    onClick={() => scrollToSection(link.sectionId)}
                    className="
                      px-4 py-2 font-body text-xs font-semibold uppercase tracking-wider
                      text-ink-2 hover:text-ink transition-colors duration-200 cursor-pointer
                    "
                  >
                    {link.label}
                  </button>
                </motion.li>
              ))}
            </ul>
          )}

          {/* ── RIGHT: Controls & Profile ────────────── */}
          <div className="flex items-center gap-3">
            
            {/* Founding Points Badge (Profile Page specific) */}
            {foundingPoints !== undefined && (
              <div className="
                hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-full
                bg-ink/5 dark:bg-white/5 border border-glass-border font-mono text-[9px] uppercase tracking-wider font-bold text-ink select-none
              ">
                <svg className="w-3.5 h-3.5 text-[#F25A2B]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15a4 4 0 100-8 4 4 0 000 8z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v4M8 21h8M4 7h16" />
                </svg>
                <span>{foundingPoints} Founding Points</span>
              </div>
            )}

            <ThemeToggle />

            {/* Profile / Auth CTA */}
            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button 
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="
                    flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full
                    bg-ink/5 dark:bg-white/5 border border-glass-border hover:bg-ink/10 dark:hover:bg-white/10 
                    transition-all duration-200 cursor-pointer text-sm font-medium text-ink
                  "
                >
                  <div className="
                    w-6 h-6 rounded-full text-white font-mono font-bold text-xs uppercase
                    grid place-items-center flex-shrink-0
                  "
                  style={{ background: 'linear-gradient(135deg, #F25A2B 0%, #7C5CFF 100%)' }}
                  >
                    {userReservation?.username?.[0] ?? user.displayName?.[0] ?? user.email?.[0] ?? 'U'}
                  </div>
                  <span className="hidden sm:inline font-mono tracking-wide text-xs">
                    {userReservation ? `@${userReservation.username}` : 'Profile'}
                  </span>
                  <svg 
                    className={[
                      'w-3.5 h-3.5 opacity-60 transition-transform duration-300',
                      profileDropdownOpen ? 'rotate-180' : ''
                    ].join(' ')}
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                <AnimatePresence>
                  {profileDropdownOpen && (
                    <motion.div 
                      initial={{ opacity: 0, y: 15, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 15, scale: 0.95 }}
                      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                      className="
                        absolute right-0 top-full mt-3 w-64 rounded-2xl overflow-hidden z-50
                        border border-glass-border bg-glass-bg backdrop-blur-2xl
                        shadow-2xl shadow-black/40 flex flex-col
                      "
                    >
                      {/* User metadata */}
                      <div className="p-5 pb-4 flex flex-col gap-2.5">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-10 h-10 rounded-full text-white font-mono font-extrabold text-base grid place-items-center"
                            style={{ background: 'linear-gradient(135deg, #F25A2B 0%, #7C5CFF 100%)' }}
                          >
                            {userReservation?.username?.[0] ?? user.displayName?.[0] ?? user.email?.[0] ?? 'U'}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="text-sm font-bold text-ink truncate leading-tight">
                              {userReservation ? `@${userReservation.username}` : (user.displayName || 'Creator')}
                            </span>
                            <span className="text-xs text-ink-2 truncate leading-tight">
                              {user.email || user.phoneNumber || 'Authenticated User'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="h-[1px] bg-glass-border" />

                      {/* Dropdown actions */}
                      <div className="p-2 flex flex-col gap-1">
                        <button
                          onClick={() => {
                            setProfileDropdownOpen(false);
                            if (onProfileClick) {
                              onProfileClick();
                            }
                          }}
                          className="
                            flex items-center gap-3 w-full px-4 py-3 rounded-xl
                            text-left text-sm font-semibold text-ink cursor-pointer
                            hover:bg-ink/5 dark:hover:bg-white/5 transition-all duration-200
                          "
                        >
                          <svg className="w-4 h-4 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          View My Profile
                        </button>

                        <button
                          onClick={async () => {
                            setProfileDropdownOpen(false);
                            await onSignOut();
                          }}
                          className="
                            flex items-center gap-3 w-full px-4 py-3 rounded-xl
                            text-left text-sm font-semibold text-rose-500 cursor-pointer
                            hover:bg-rose-500/10 transition-all duration-200
                          "
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          Sign Out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <button
                type="button"
                onClick={onSignInClick}
                className="
                  inline-flex items-center gap-1.5 cursor-pointer
                  bg-gradient-to-r from-[#F25A2B] to-[#7C5CFF]
                  px-5 py-2 rounded-full
                  font-mono text-xs font-bold text-white uppercase tracking-wider
                  hover:scale-[1.04] active:scale-[0.97] shadow-lg shadow-[#F25A2B]/15
                  transition-all duration-200
                "
              >
                Sign In
                <svg className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            )}

            {/* ── Hamburger toggle (mobile only) ─────── */}
            {pathname === '/' && (
              <button
                type="button"
                aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={mobileOpen}
                onClick={() => setMobileOpen((prev) => !prev)}
                className="
                  md:hidden relative w-9 h-9 cursor-pointer
                  flex flex-col items-center justify-center gap-1.5 rounded-full
                  bg-ink/5 dark:bg-white/5 border border-glass-border
                "
              >
                <motion.span
                  animate={mobileOpen ? { rotate: 45, y: 5.5 } : { rotate: 0, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className="block h-[1.8px] w-4.5 rounded-full bg-ink origin-center"
                />
                <motion.span
                  animate={mobileOpen ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }}
                  transition={{ duration: 0.2 }}
                  className="block h-[1.8px] w-4.5 rounded-full bg-ink origin-center"
                />
                <motion.span
                  animate={mobileOpen ? { rotate: -45, y: -5.5 } : { rotate: 0, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className="block h-[1.8px] w-4.5 rounded-full bg-ink origin-center"
                />
              </button>
            )}
          </div>

        </div>
      </div>

      {/* ── MOBILE MENU (dropdown) ────────────────── */}
      {pathname === '/' && (
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              key="mobile-menu"
              initial={{ opacity: 0, y: -10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="
                md:hidden mx-auto max-w-lg mt-3
                glass-card border border-glass-border/60 bg-glass-bg backdrop-blur-2xl
                rounded-2xl overflow-hidden shadow-2xl shadow-black/30 pointer-events-auto
              "
            >
              <div className="flex flex-col gap-1 p-3">
                {NAV_LINKS.map((link) => (
                  <button
                    key={link.sectionId}
                    type="button"
                    onClick={() => scrollToSection(link.sectionId)}
                    className="
                      w-full text-left px-5 py-3.5 rounded-xl cursor-pointer
                      font-body text-sm font-semibold text-ink-2
                      hover:text-ink hover:bg-ink/5 dark:hover:bg-white/5
                      transition-all duration-200
                    "
                  >
                    {link.label}
                  </button>
                ))}

                {/* Sign In / Profile action in mobile menu if not signed in */}
                {!user && (
                  <button
                    type="button"
                    onClick={() => {
                      setMobileOpen(false);
                      onSignInClick();
                    }}
                    className="
                      mt-2 w-full gradient-bg cta-glow cursor-pointer
                      py-3.5 rounded-full
                      font-mono text-xs font-bold text-white text-center uppercase tracking-wider
                      hover:scale-[1.02] active:scale-[0.97]
                      transition-all duration-200
                    "
                  >
                    Sign In
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </motion.nav>
  );
};

export default Navbar;
