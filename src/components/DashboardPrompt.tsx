'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { X, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface DashboardPromptProps {
  onClose: () => void;
  username?: string;
  profilePhotoUrl?: string | null;
  autoHideDuration?: number; // Duration in ms before auto-hiding (default 5000ms)
}

export default function DashboardPrompt({ 
  onClose, 
  username, 
  profilePhotoUrl,
  autoHideDuration = 5000 
}: DashboardPromptProps) {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(true);
  const onCloseRef = useRef(onClose);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Keep onCloseRef current without triggering effect re-runs
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  const handleDismiss = () => {
    setIsVisible(false);
    onCloseRef.current();
  };

  const startAutoHideTimer = () => {
    if (autoHideDuration > 0) {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        setIsVisible(false);
        onCloseRef.current();
      }, autoHideDuration);
    }
  };

  const clearAutoHideTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  useEffect(() => {
    startAutoHideTimer();
    return () => clearAutoHideTimer();
  }, [autoHideDuration]);

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.92 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -15, scale: 0.92, transition: { duration: 0.15 } }}
      transition={{ type: 'spring', stiffness: 420, damping: 30 }}
      onMouseEnter={clearAutoHideTimer}
      onMouseLeave={startAutoHideTimer}
      className="fixed top-16 right-4 md:top-20 md:right-6 z-[100] select-none group max-w-[300px] w-full"
    >
      {/* Ambient Gradient Glow Background */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-[#F25A2B]/40 via-[#D4567A]/30 to-[#7C5CFF]/40 rounded-2xl blur-lg opacity-60 group-hover:opacity-100 transition duration-500" />

      {/* Main Solid Glass Box — 100% Opaque bg-[#0C0D14] to eliminate transparency bleed */}
      <div className="relative rounded-2xl bg-[#0C0D14] border border-white/20 p-3.5 shadow-[0_20px_60px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col gap-3">
        {/* Decorative Light Rays */}
        <div className="absolute -top-12 -right-12 w-28 h-28 bg-[#7C5CFF]/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-28 h-28 bg-[#F25A2B]/20 rounded-full blur-2xl pointer-events-none" />

        {/* Top Header Strip */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#F25A2B] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#F25A2B]"></span>
            </span>
            <span className="text-[10px] font-mono font-bold tracking-widest text-white/70 uppercase flex items-center gap-1">
              ArtisTant
            </span>
          </div>

          <button
            onClick={handleDismiss}
            className="text-white/60 hover:text-white hover:bg-white/10 p-1 rounded-lg transition-all duration-150 cursor-pointer"
            aria-label="Dismiss prompt"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Main Content Info */}
        <div className="flex items-center gap-3">
          {/* Avatar Ring */}
          <div className="relative flex-shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#F25A2B] via-[#D4567A] to-[#7C5CFF] p-[1.5px] shadow-md">
              <div className="w-full h-full bg-[#12131A] rounded-[10.5px] overflow-hidden flex items-center justify-center font-mono font-bold text-xs text-white uppercase">
                {profilePhotoUrl ? (
                  <img
                    src={profilePhotoUrl}
                    alt={username ? `@${username}` : 'Artist'}
                    className="w-full h-full object-cover rounded-[9.5px]"
                  />
                ) : (
                  username ? username.charAt(0) : 'A'
                )}
              </div>
            </div>
          </div>

          {/* User Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <h4 className="text-xs font-bold text-white truncate tracking-tight">
                {username ? `@${username}` : 'Creator Account'}
              </h4>
              <span className="px-1.5 py-0.2 text-[8.5px] font-mono font-semibold bg-[#7C5CFF]/20 text-[#A78BFA] border border-[#7C5CFF]/30 rounded-full">
                Active
              </span>
            </div>
            <p className="text-[10.5px] text-white/70 truncate font-medium mt-0.5">
              Manage your profile & dashboard
            </p>
          </div>
        </div>

        {/* Primary CTA */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => router.push('/dashboard')}
          className="
            w-full py-2 px-3 rounded-xl cursor-pointer
            bg-gradient-to-r from-[#F25A2B] via-[#D4567A] to-[#7C5CFF]
            hover:shadow-[0_4px_20px_rgba(242,90,43,0.35)]
            text-white font-mono text-[10.5px] font-bold tracking-wider uppercase
            flex items-center justify-center gap-2 transition-all duration-200 group/btn
          "
        >
          <span>Open Dashboard</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
        </motion.button>

        {/* Subtle Auto-Hide Timer Bar Indicator */}
        <div className="w-full h-0.5 bg-white/15 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: '100%' }}
            animate={{ width: '0%' }}
            transition={{ duration: autoHideDuration / 1000, ease: 'linear' }}
            className="h-full bg-gradient-to-r from-[#F25A2B] to-[#7C5CFF]"
          />
        </div>
      </div>
    </motion.div>
  );
}
