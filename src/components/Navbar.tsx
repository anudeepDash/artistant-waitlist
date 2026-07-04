'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';

/* ──────────────────────────────────────────────
   Navbar Props
   ────────────────────────────────────────────── */
interface NavbarProps {
  /** Callback fired when the "Reserve Your Spot" CTA is clicked */
  onCtaClick: () => void;
}

/** Navigation link definition */
interface NavLink {
  label: string;
  /** Target section ID (without the #) */
  sectionId: string;
}

/** Centre nav links — smooth-scroll to corresponding <section id="..."> */
const NAV_LINKS: NavLink[] = [
  { label: 'Features', sectionId: 'features' },
  { label: 'Exclusives', sectionId: 'exclusives' },
];

/* ──────────────────────────────────────────────
   Navbar Component
   ────────────────────────────────────────────── */
const Navbar = ({ onCtaClick }: NavbarProps) => {
  // ── Scroll-responsive opacity ──────────────
  const [scrolled, setScrolled] = useState(false);
  // ── Mobile menu toggle ─────────────────────
  const [mobileOpen, setMobileOpen] = useState(false);

  /* Listen for scroll to toggle the "scrolled" state.
     When > 20px down the page the navbar gets a more opaque background. */
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    // Run once on mount in case the page is already scrolled
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  /* Close mobile menu when viewport widens past the breakpoint */
  useEffect(() => {
    const mql = window.matchMedia('(min-width: 768px)');
    const onChange = (e: MediaQueryListEvent) => {
      if (e.matches) setMobileOpen(false);
    };
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, []);

  /** Smooth-scroll to a section and close mobile menu */
  const scrollToSection = useCallback(
    (sectionId: string) => {
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      setMobileOpen(false);
    },
    [],
  );

  return (
    <motion.nav
      /* ── Mount animation: fade-in + slide-down ── */
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] as const }}
      className={[
        // Positioning — fixed, full-width, always on top
        'fixed top-0 inset-x-0 z-50',
        // Outer padding keeps the bar floating inside the viewport
        'px-4 pt-4 md:px-6',
      ].join(' ')}
    >
      <div
        className={[
          // Glass card base
          'glass-card glass-card-hover',
          // Layout
          'mx-auto max-w-6xl flex items-center justify-between',
          'px-5 py-3 md:px-6 md:py-3.5',
          'rounded-2xl',
          // Smooth transition for the opacity shift on scroll
          'transition-[background,border-color] duration-300',
          // When scrolled, deepen the background and border
          scrolled
            ? 'bg-bg-secondary/85 border-glass-border/20 shadow-lg shadow-black/30'
            : 'bg-bg-secondary/60 border-glass-border',
        ].join(' ')}
      >
        {/* ── LEFT: Wordmark ──────────────────────── */}
        <a
          href="#"
          aria-label="ArtisTant home"
          onClick={(e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="shrink-0 flex items-center gap-2"
        >
          <img
            src="/logo_a.png"
            alt=""
            className="w-7 h-7 object-contain"
            aria-hidden="true"
          />
          <span className="gradient-text font-display text-xl md:text-2xl font-bold tracking-tight select-none">
            ArtisTant
          </span>
        </a>

        {/* ── CENTER: Desktop Nav Links ───────────── */}
        <ul className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <li key={link.sectionId}>
              <button
                type="button"
                onClick={() => scrollToSection(link.sectionId)}
                className="
                  relative font-body text-sm text-text-secondary
                  hover:text-text-primary transition-colors duration-200
                  after:absolute after:left-0 after:-bottom-1
                  after:h-[2px] after:w-0 after:rounded-full
                  after:bg-brand-orange after:transition-all after:duration-300
                  hover:after:w-full
                "
              >
                {link.label}
              </button>
            </li>
          ))}
        </ul>

        {/* ── RIGHT: CTA + Hamburger ──────────────── */}
        <div className="flex items-center gap-3">
          {/* CTA button — hidden on mobile, shown in hamburger menu instead */}
          <button
            type="button"
            onClick={onCtaClick}
            className="
              hidden md:inline-flex items-center
              gradient-bg cta-glow
              px-5 py-2 rounded-full
              font-body text-sm font-semibold text-white
              hover:scale-105 active:scale-[0.98]
              transition-transform duration-200
            "
          >
            Sign In
          </button>

          {/* ── Hamburger toggle (mobile only) ─────── */}
          <button
            type="button"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((prev) => !prev)}
            className="
              md:hidden relative w-8 h-8
              flex flex-col items-center justify-center gap-[5px]
            "
          >
            {/* Three-line → X morphing bars */}
            <motion.span
              animate={mobileOpen ? { rotate: 45, y: 7 } : { rotate: 0, y: 0 }}
              transition={{ duration: 0.25 }}
              className="block h-[2px] w-5 rounded-full bg-text-primary origin-center"
            />
            <motion.span
              animate={mobileOpen ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }}
              transition={{ duration: 0.2 }}
              className="block h-[2px] w-5 rounded-full bg-text-primary origin-center"
            />
            <motion.span
              animate={mobileOpen ? { rotate: -45, y: -7 } : { rotate: 0, y: 0 }}
              transition={{ duration: 0.25 }}
              className="block h-[2px] w-5 rounded-full bg-text-primary origin-center"
            />
          </button>
        </div>
      </div>

      {/* ── MOBILE MENU (dropdown) ────────────────── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="
              md:hidden mx-auto max-w-6xl mt-2
              glass-card overflow-hidden
              rounded-xl
            "
          >
            <div className="flex flex-col gap-1 p-4">
              {NAV_LINKS.map((link) => (
                <button
                  key={link.sectionId}
                  type="button"
                  onClick={() => scrollToSection(link.sectionId)}
                  className="
                    w-full text-left px-4 py-3 rounded-lg
                    font-body text-sm text-text-secondary
                    hover:text-text-primary hover:bg-bg-card/50
                    transition-colors duration-200
                  "
                >
                  {link.label}
                </button>
              ))}

              {/* CTA inside mobile menu */}
              <button
                type="button"
                onClick={() => {
                  setMobileOpen(false);
                  onCtaClick();
                }}
                className="
                  mt-2 w-full gradient-bg cta-glow
                  px-5 py-3 rounded-full
                  font-body text-sm font-semibold text-white text-center
                  hover:scale-[1.02] active:scale-[0.98]
                  transition-transform duration-200
                "
              >
                Sign In
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;
