'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';

interface ExitIntentModalProps {
  onClaimClick: () => void;
}

export default function ExitIntentModal({ onClaimClick }: ExitIntentModalProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [hasDismissed, setHasDismissed] = useState(false);

  useEffect(() => {
    // Check local storage so we don't spam users who already dismissed it in this session
    const dismissed = sessionStorage.getItem('artistant_exit_modal_dismissed');
    if (dismissed === 'true') {
      setHasDismissed(true);
      return;
    }

    const handleMouseLeave = (e: MouseEvent) => {
      // Trigger if cursor leaves through top of window
      if (e.clientY <= 10 && !hasDismissed) {
        setIsVisible(true);
      }
    };

    document.addEventListener('mouseleave', handleMouseLeave);
    return () => document.removeEventListener('mouseleave', handleMouseLeave);
  }, [hasDismissed]);

  const handleClose = () => {
    setIsVisible(false);
    setHasDismissed(true);
    sessionStorage.setItem('artistant_exit_modal_dismissed', 'true');
  };

  const handleAction = () => {
    handleClose();
    onClaimClick();
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="relative w-full max-w-md p-6 sm:p-8 rounded-3xl border border-white/10 bg-[#0F0F12] text-white shadow-2xl overflow-hidden"
          >
            {/* Ambient Background Glow */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -top-24 -right-24 w-64 h-64 rounded-full bg-gradient-to-br from-[#F25A2B]/30 to-[#7C5CFF]/30 blur-3xl opacity-60"
            />

            {/* Close Button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 p-2 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
              aria-label="Close exit modal"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 mb-5 rounded-full border border-[#F25A2B]/30 bg-[#F25A2B]/10 text-[#F25A2B] text-xs font-mono font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Wait! Before You Leave</span>
            </div>

            {/* Heading */}
            <h3 className="font-display text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-snug mb-3">
              Lock Your Custom <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F25A2B] to-[#7C5CFF]">@username</span>
            </h3>

            {/* Body Copy */}
            <p className="text-sm text-zinc-300 leading-relaxed mb-6 font-light">
              Don&apos;t let someone else claim your performer handle. Get founding access, early booking rollout, and 0% commission on your first gig.
            </p>

            {/* Feature Highlights */}
            <div className="space-y-2.5 mb-6 text-xs text-zinc-400 font-mono">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#F25A2B]" />
                <span>100 Base Points instantly unlocked</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#7C5CFF]" />
                <span>Cohort 001 Priority Rollout consideration</span>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <button
                onClick={handleAction}
                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#F25A2B] to-[#7C5CFF] text-white font-bold text-sm uppercase tracking-wider shadow-lg hover:shadow-[#F25A2B]/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Reserve My Username</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={handleClose}
                className="w-full sm:w-auto py-3.5 px-4 text-xs font-mono text-zinc-400 hover:text-white transition-colors cursor-pointer text-center"
              >
                Maybe Later
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
