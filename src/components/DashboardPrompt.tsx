'use client';

import { useRouter } from 'next/navigation';
import { X, User } from 'lucide-react';
import { motion } from 'motion/react';

interface DashboardPromptProps {
  onClose: () => void;
  username?: string;
}

export default function DashboardPrompt({ onClose, username }: DashboardPromptProps) {
  const router = useRouter();

  return (
    <motion.div
      initial={{ opacity: 0, x: 360, y: 0 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      exit={{ opacity: 0, x: 360, transition: { duration: 0.2, ease: 'easeIn' } }}
      transition={{ type: 'spring', stiffness: 280, damping: 28 }}
      className="
        fixed top-20 right-4 md:top-24 md:right-6 z-50 max-w-sm w-[calc(100vw-2rem)] rounded-2xl overflow-hidden
        bg-glass-bg border border-glass-border backdrop-blur-2xl
        shadow-[0_16px_36px_rgba(0,0,0,0.25)] flex flex-col p-4 select-none
      "
      style={{
        boxShadow: '0 12px 30px rgba(0, 0, 0, 0.15), inset 0 1px 0px rgba(255, 255, 255, 0.08)',
      }}
    >
      {/* Top Banner Header: macOS Notification Style */}
      <div className="flex items-center justify-between pb-2 border-b border-glass-border/30 mb-2.5">
        <div className="flex items-center gap-1.5">
          {/* Circular logo badge */}
          <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-[#F25A2B] to-[#7C5CFF] flex items-center justify-center">
            <span className="text-[7px] text-white font-mono font-bold">A</span>
          </div>
          <span className="text-[10px] font-mono font-bold tracking-wider text-ink-3 uppercase">
            ArtisTant
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[9px] text-ink-3 font-mono">now</span>
          <button
            onClick={onClose}
            className="
              text-ink-3 hover:text-rose-500 hover:bg-ink/5 dark:hover:bg-white/5 p-0.5 rounded
              transition-colors duration-150 cursor-pointer
            "
            aria-label="Dismiss notification"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Notification Body */}
      <div className="flex gap-3 items-start">
        {/* App Icon or Avatar */}
        <div className="
          w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0
          bg-gradient-to-br from-[#F25A2B]/10 to-[#7C5CFF]/10 border border-[#F25A2B]/20 dark:border-white/10
        ">
          <User className="w-5 h-5 text-brand" />
        </div>

        {/* Text Content */}
        <div className="flex-1 min-w-0 pr-1">
          <h4 className="text-xs font-bold text-ink leading-snug">
            {username ? `@${username}` : 'Creator Account'}
          </h4>
          <p className="text-[11px] text-ink-2 mt-0.5 leading-relaxed font-medium">
            You can view your profile through your dashboard.
          </p>

          {/* Action Buttons */}
          <div className="mt-3 flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => router.push('/dashboard')}
              className="
                px-4 py-1.5 rounded-lg text-[10px] font-bold text-white shadow-md cursor-pointer
                bg-gradient-to-r from-[#F25A2B] to-[#7C5CFF] hover:shadow-[#F25A2B]/10
                transition-all duration-200 font-mono uppercase tracking-wide
              "
            >
              Open Dashboard
            </motion.button>
            
            <button
              onClick={onClose}
              className="
                px-3 py-1.5 rounded-lg text-[10px] font-semibold text-ink-2 hover:text-ink hover:bg-ink/5 dark:hover:bg-white/5
                transition-all duration-200 cursor-pointer font-mono uppercase tracking-wide border border-glass-border/40
              "
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
