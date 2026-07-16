'use client';

import { useRouter } from 'next/navigation';
import { LayoutDashboard, X } from 'lucide-react';
import { motion } from 'motion/react';

interface DashboardPromptProps {
  onClose: () => void;
  username?: string;
}

export default function DashboardPrompt({ onClose, username }: DashboardPromptProps) {
  const router = useRouter();

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 30, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 350, damping: 30 }}
      className="
        fixed bottom-6 right-6 z-50 max-w-sm w-[calc(100vw-3rem)] rounded-2xl p-5
        bg-glass-bg border border-glass-border backdrop-blur-xl
        shadow-2xl shadow-black/40 flex items-start gap-4 select-none
      "
      style={{
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.3), inset 0 1px 0px rgba(255, 255, 255, 0.1)',
      }}
    >
      {/* Brand Glowing Accent Line */}
      <div 
        className="absolute top-0 left-0 bottom-0 w-1.5 rounded-l-2xl"
        style={{
          background: 'linear-gradient(to bottom, #F25A2B, #7C5CFF)',
        }}
      />

      {/* Icon */}
      <div className="
        w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0
        bg-brand/10 dark:bg-white/5 border border-brand/20 dark:border-white/10
      ">
        <LayoutDashboard className="w-5 h-5 text-brand" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pr-2">
        <h4 className="text-sm font-semibold text-ink leading-snug">
          Logged in {username ? `as @${username}` : ''}
        </h4>
        <p className="text-xs text-ink-2 mt-1 leading-relaxed">
          You can view your profile through your dashboard.
        </p>

        {/* CTA Button */}
        <div className="mt-3.5 flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => router.push('/dashboard')}
            className="
              px-4 py-2 rounded-xl text-xs font-bold text-white shadow-lg cursor-pointer
              bg-gradient-to-r from-[#F25A2B] to-[#7C5CFF] hover:shadow-[#F25A2B]/15
              transition-all duration-200
            "
          >
            Open Dashboard
          </motion.button>
          
          <button
            onClick={onClose}
            className="
              px-3 py-2 rounded-xl text-xs font-semibold text-ink-2 hover:text-ink hover:bg-ink/5 dark:hover:bg-white/5
              transition-all duration-200 cursor-pointer
            "
          >
            Dismiss
          </button>
        </div>
      </div>

      {/* Small top-right close cross */}
      <button
        onClick={onClose}
        className="
          text-ink-3 hover:text-ink p-1 rounded-lg hover:bg-ink/5 dark:hover:bg-white/5
          transition-colors duration-200 cursor-pointer absolute top-3.5 right-3.5
        "
        aria-label="Dismiss banner"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
}
