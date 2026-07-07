'use client';

import { useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import { useRouter } from 'next/navigation';

/* ──────────────────────────────────────────────
   SuccessConfirmation — the celebratory payoff
   Shown after a successful username reservation.
   Features confetti rain, a spring-scaled checkmark,
   stagger-animated copy, and a close CTA.
   ────────────────────────────────────────────── */

interface SuccessConfirmationProps {
  /** The username that was just reserved */
  username: string;
  /** Called when the user dismisses the confirmation */
  onClose: () => void;
}

/* ── Brand palette for confetti pieces ──────── */
const CONFETTI_COLORS = [
  '#E8523F', // brand-orange
  '#D4567A', // brand-coral
  '#6B5CE7', // brand-purple
  '#4C3FBF', // brand-deep-purple
  '#F59E0B', // accent-gold
  '#34D399', // accent-green
  '#22D3EE', // accent-cyan
  '#F5F5F7', // text-primary (white-ish)
];

const CONFETTI_COUNT = 45;

/** Generates an array of confetti piece configurations */
function generateConfetti() {
  return Array.from({ length: CONFETTI_COUNT }, (_, i) => ({
    id: i,
    color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
    left: `${Math.random() * 100}%`,
    rotation: Math.random() * 360,
    delay: `${Math.random() * 2}s`,
    /* Vary sizes slightly for visual depth */
    width: 6 + Math.random() * 6,
    height: 6 + Math.random() * 6,
  }));
}

/* ── Motion variant presets ────────────────── */

/** Container: orchestrates stagger across all children */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.25,
    },
  },
};

/** Item: slides up + fades in */
const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  },
};

/** Checkmark circle: spring scale from 0 → 1 */
const checkmarkVariants = {
  hidden: { scale: 0, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 260,
      damping: 20,
      delay: 0.1,
    },
  },
};

export default function SuccessConfirmation({
  username,
  onClose,
}: SuccessConfirmationProps) {
  const router = useRouter();
  /* ── Generate confetti pieces once on mount ── */
  const confetti = useMemo(() => generateConfetti(), []);

  /* ── Prevent body scroll while confirmation is open ── */
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  return (
    <div className="relative flex flex-col items-center justify-center min-h-full w-full">
      {/* ── Confetti layer ── */}
      <div
        aria-hidden="true"
        className="absolute inset-0 overflow-hidden pointer-events-none"
      >
        {confetti.map((piece) => (
          <div
            key={piece.id}
            className="confetti-piece"
            style={{
              left: piece.left,
              top: '-10px',
              backgroundColor: piece.color,
              width: piece.width,
              height: piece.height,
              transform: `rotate(${piece.rotation}deg)`,
              animationDelay: piece.delay,
            }}
          />
        ))}
      </div>

      {/* ── Main content ── */}
      <motion.div
        className="relative z-10 flex flex-col items-center text-center px-6 max-w-md mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* ── Checkmark circle with spring-in ── */}
        <motion.div
          variants={checkmarkVariants}
          className="mb-8"
        >
          <div className="w-20 h-20 rounded-full flex items-center justify-center shadow-lg shadow-brand-orange/25" style={{ background: 'linear-gradient(135deg, #F25A2B, #D4567A, #7C5CFF)' }}>
            <svg
              className="w-10 h-10"
              viewBox="0 0 24 24"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <motion.polyline
                points="20 6 9 17 4 12"
                stroke="white"
                strokeWidth={3}
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ delay: 0.35, duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
              />
            </svg>
          </div>
        </motion.div>

        {/* ── Heading ── */}
        <motion.h2
          variants={itemVariants}
          className="text-3xl font-display font-bold brand-text mb-4"
        >
          You&apos;re on the list!
        </motion.h2>

        {/* ── Reserved username pill ── */}
        <motion.div variants={itemVariants} className="mb-6">
          <div
            style={{
              display: 'inline-block',
              padding: '10px 28px',
              borderRadius: '999px',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.12)',
              backdropFilter: 'blur(8px)',
            }}
          >
            <span
              style={{
                fontSize: '22px',
                fontWeight: 800,
                background: 'linear-gradient(135deg, #F25A2B 0%, #D4567A 50%, #7C5CFF 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                fontFamily: 'var(--font-display, sans-serif)',
                display: 'inline-block',
              }}
            >
              @{username}
            </span>
          </div>
        </motion.div>

        {/* ── Confirmation copy ── */}
        <motion.p
          variants={itemVariants}
          className="text-text-secondary leading-relaxed mb-8"
        >
          You&apos;ve secured your spot on ArtisTant. We&apos;ll notify you
          when it&apos;s time to set up your artist profile.
        </motion.p>

        {/* ── Early Access badge ── */}
        <motion.div variants={itemVariants} className="mb-10">
          <div className="inline-flex items-center gap-2 rounded-full px-5 py-2" style={{ border: '1px solid rgba(242,90,43,0.3)', backgroundColor: 'rgba(242,90,43,0.08)' }}>
            <span style={{ color: '#F25A2B' }} className="text-lg">★</span>
            <span style={{ color: '#F25A2B' }} className="font-semibold text-sm tracking-wide uppercase font-mono">
              Early Access Member
            </span>
          </div>
        </motion.div>

        {/* ── View Profile button ── */}
        <motion.button
          variants={itemVariants}
          onClick={() => {
            router.push(`/${username}`);
            onClose();
          }}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          className="rounded-full gradient-bg px-8 py-3 text-sm font-semibold text-white cursor-pointer transition-all duration-200 shadow-lg shadow-brand-orange/20"
        >
          View My Profile Dashboard
        </motion.button>
      </motion.div>
    </div>
  );
}
