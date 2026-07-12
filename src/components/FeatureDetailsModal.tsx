'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface FeatureDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  feature: {
    title: string;
    desc: string;
    timeline: string;
    icon: React.ReactNode;
    whatIsIt?: string;
    benefit?: string;
    about?: string;
  } | null;
  phase: {
    phase: string;
    label: string;
    timeline: string;
    accentColor: string;
  } | null;
  onReserveClick: () => void;
}

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
} as const;

const cardVariants = {
  hidden: { opacity: 0, scale: 0.9, y: 30 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: 'spring', damping: 25, stiffness: 280 },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 20,
    transition: { duration: 0.2, ease: 'easeInOut' },
  },
} as const;

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
} as const;

const fadeUpItem = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 100, damping: 15 },
  },
} as const;

export default function FeatureDetailsModal({
  isOpen,
  onClose,
  feature,
  phase,
  onReserveClick,
}: FeatureDetailsModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!feature || !phase) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="feature-overlay"
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-y-auto backdrop-blur-md"
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={onClose}
          style={{
            background: 'rgba(5, 7, 10, 0.88)',
          }}
        >
          {/* Modal Card wrapper - centered, scrollable on small screens */}
          <div className="min-h-full w-full flex items-center justify-center py-8">
            <motion.div
              key="feature-card"
              className="relative max-w-lg w-full rounded-[2.5rem] p-6 sm:p-10 overflow-hidden"
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={(e) => e.stopPropagation()}
              style={{
                background: 'rgba(14, 21, 36, 0.94)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.7)',
              }}
            >
              {/* Dynamic Glow Background */}
              <div
                className="absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-35 pointer-events-none blur-[80px]"
                style={{
                  background: `radial-gradient(circle, ${phase.accentColor} 0%, transparent 70%)`,
                }}
              />
              <div
                className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full opacity-20 pointer-events-none blur-[100px]"
                style={{
                  background: 'radial-gradient(circle, #7C5CFF 0%, transparent 70%)',
                }}
              />

              {/* Close Button */}
              <button
                type="button"
                onClick={onClose}
                className="absolute top-6 right-6 text-ink-2 hover:text-white transition-colors p-2 rounded-full hover:bg-white/5"
                aria-label="Close modal"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>

              <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                className="relative z-10 flex flex-col gap-6"
              >
                {/* Header Section: Icon + Phase Label + Title */}
                <motion.div variants={fadeUpItem} className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                  <div
                    className="w-16 h-16 rounded-[1.25rem] flex items-center justify-center border shadow-lg backdrop-blur-md relative animate-pulse-subtle"
                    style={{
                      borderColor: 'rgba(255, 255, 255, 0.08)',
                      background: 'rgba(255, 255, 255, 0.03)',
                      color: phase.accentColor,
                    }}
                  >
                    <div
                      className="absolute inset-0 rounded-[1.25rem] opacity-25 blur-sm"
                      style={{ backgroundColor: phase.accentColor }}
                    />
                    <div className="relative z-10 scale-125">{feature.icon}</div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <span
                      className="font-mono text-xs uppercase tracking-widest font-bold"
                      style={{ color: phase.accentColor }}
                    >
                      Phase {phase.phase} • {phase.label}
                    </span>
                    <h2 className="font-display font-black text-2xl sm:text-3xl text-ink leading-tight">
                      {feature.title}
                    </h2>
                  </div>
                </motion.div>

                <hr style={{ borderColor: 'rgba(255, 255, 255, 0.06)' }} />

                {/* Body Content Sections */}
                <div className="flex flex-col gap-6 font-sans">
                  {/* Section 1: What is it? */}
                  <motion.div variants={fadeUpItem} className="flex flex-col gap-1.5">
                    <h3
                      className="font-mono text-[10px] uppercase tracking-widest font-bold opacity-60"
                      style={{ color: phase.accentColor }}
                    >
                      What is it?
                    </h3>
                    <p className="text-white text-base leading-relaxed">
                      {feature.whatIsIt || feature.desc}
                    </p>
                  </motion.div>

                  {/* Section 2: The Benefit */}
                  {feature.benefit && (
                    <motion.div variants={fadeUpItem} className="flex flex-col gap-1.5">
                      <h3
                        className="font-mono text-[10px] uppercase tracking-widest font-bold opacity-60"
                        style={{ color: phase.accentColor }}
                      >
                        The Benefit
                      </h3>
                      <div
                        className="p-4 rounded-2xl border"
                        style={{
                          background: 'rgba(255, 255, 255, 0.02)',
                          borderColor: 'rgba(255, 255, 255, 0.04)',
                        }}
                      >
                        <p className="text-emerald-400/90 text-sm font-semibold leading-relaxed">
                          {feature.benefit}
                        </p>
                      </div>
                    </motion.div>
                  )}

                  {/* Section 3: About / Infrastructure */}
                  {feature.about && (
                    <motion.div variants={fadeUpItem} className="flex flex-col gap-1.5">
                      <h3
                        className="font-mono text-[10px] uppercase tracking-widest font-bold opacity-60"
                        style={{ color: phase.accentColor }}
                      >
                        About the Infrastructure
                      </h3>
                      <p className="text-ink-2 text-sm leading-relaxed">
                        {feature.about}
                      </p>
                    </motion.div>
                  )}
                </div>

                <hr style={{ borderColor: 'rgba(255, 255, 255, 0.06)' }} />

                {/* Footer CTAs */}
                <motion.div variants={fadeUpItem} className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    type="button"
                    onClick={onReserveClick}
                    className="flex-1 py-4 px-6 rounded-2xl text-center text-sm font-bold text-white transition-all transform active:scale-95 cursor-pointer shadow-lg hover:shadow-xl hover:brightness-110"
                    style={{
                      background: 'linear-gradient(135deg, #F25A2B 0%, #7C5CFF 100%)',
                    }}
                  >
                    Reserve Handle & Get Access
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="py-4 px-6 rounded-2xl text-center text-sm font-bold text-ink-2 hover:text-white transition-all hover:bg-white/5 border cursor-pointer"
                    style={{
                      borderColor: 'rgba(255, 255, 255, 0.08)',
                    }}
                  >
                    Close
                  </button>
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
