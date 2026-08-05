'use client';

import React, { useState, useEffect } from 'react';
import { Clock, Flame, ArrowRight, X, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CountdownBannerProps {
  targetDate?: Date;
  headline?: string;
  ctaText?: string;
  enabled?: boolean;
  onClaimClick?: () => void;
  onDismiss?: () => void;
}

export default function CountdownBanner({ 
  targetDate, 
  headline = "Cohort 001 Priority Rollout", 
  ctaText = "Claim Access Keys", 
  enabled = true, 
  onClaimClick, 
  onDismiss 
}: CountdownBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  const handleDismiss = () => {
    setDismissed(true);
    if (onDismiss) onDismiss();
  };
  const destination = targetDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);

  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const updateTime = () => {
      const diff = destination.getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [destination]);

  if (dismissed || !enabled) return null;

  return (
    <div className="relative w-full h-11 sm:h-12 bg-[#090714]/95 backdrop-blur-xl border-b border-white/10 text-white select-none shadow-[0_8px_32px_rgba(0,0,0,0.3)] pointer-events-auto">
      {/* Top Laser Accent Line */}
      <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#F25A2B] via-50% to-[#7C5CFF]" />

      <div className="max-w-7xl mx-auto h-full px-3 sm:px-6 flex items-center justify-between gap-3">
        
        {/* Left: Live Status & Label */}
        <div className="flex items-center gap-2.5 min-w-0">
          {/* Live Pulsing Dot */}
          <div className="relative flex h-2.5 w-2.5 shrink-0 items-center justify-center">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#F25A2B] opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#F25A2B]" />
          </div>

          <div className="flex items-center gap-2 truncate">
            <span className="px-2.5 py-0.5 rounded-full bg-[#F25A2B]/15 border border-[#F25A2B]/30 text-[#F25A2B] text-[10px] font-mono font-extrabold uppercase tracking-wider shrink-0">
              Beta Wave
            </span>
            <span className="text-xs font-bold font-display text-white tracking-tight truncate">
              {headline}
            </span>
            <span className="hidden lg:inline text-xs text-zinc-400 font-light truncate">
              — Lock @username for 0% fee guarantee
            </span>
          </div>
        </div>

        {/* Center: High-Tech Digit Cards */}
        <div className="flex items-center gap-1 sm:gap-1.5 font-mono text-xs">
          {/* Days */}
          <div className="flex items-center gap-1 bg-black/60 border border-white/15 rounded-lg px-2 py-0.5 shadow-inner">
            <span className="font-extrabold text-[#F25A2B] text-xs sm:text-sm">
              {String(timeLeft.days).padStart(2, '0')}
            </span>
            <span className="text-[10px] text-zinc-400 uppercase font-medium">d</span>
          </div>

          <span className="text-zinc-500 font-bold animate-pulse">:</span>

          {/* Hours */}
          <div className="flex items-center gap-1 bg-black/60 border border-white/15 rounded-lg px-2 py-0.5 shadow-inner">
            <span className="font-extrabold text-white text-xs sm:text-sm">
              {String(timeLeft.hours).padStart(2, '0')}
            </span>
            <span className="text-[10px] text-zinc-400 uppercase font-medium">h</span>
          </div>

          <span className="text-zinc-500 font-bold animate-pulse">:</span>

          {/* Minutes */}
          <div className="flex items-center gap-1 bg-black/60 border border-white/15 rounded-lg px-2 py-0.5 shadow-inner">
            <span className="font-extrabold text-white text-xs sm:text-sm">
              {String(timeLeft.minutes).padStart(2, '0')}
            </span>
            <span className="text-[10px] text-zinc-400 uppercase font-medium">m</span>
          </div>

          <span className="text-zinc-500 font-bold animate-pulse">:</span>

          {/* Seconds */}
          <div className="flex items-center gap-1 bg-black/60 border border-white/15 rounded-lg px-2 py-0.5 shadow-inner">
            <span className="font-extrabold text-[#7C5CFF] text-xs sm:text-sm">
              {String(timeLeft.seconds).padStart(2, '0')}
            </span>
            <span className="text-[10px] text-zinc-400 uppercase font-medium">s</span>
          </div>
        </div>

        {/* Right: Shiny Action Pill & Dismiss */}
        <div className="flex items-center gap-2 shrink-0">
          {onClaimClick && (
            <button
              onClick={onClaimClick}
              className="group px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-gradient-to-r from-[#F25A2B] via-[#D4567A] to-[#7C5CFF] text-white text-[10px] sm:text-xs font-mono font-bold uppercase tracking-wider shadow-md hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span>{ctaText}</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </button>
          )}

          <button
            onClick={handleDismiss}
            className="p-1 rounded-full text-zinc-500 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
            aria-label="Dismiss launch banner"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
