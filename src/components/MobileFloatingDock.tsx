'use client';

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Home, Menu as MenuIcon, Shield } from 'lucide-react';

interface MobileFloatingDockProps {
  isAdmin?: boolean;
  onOpenDrawer: () => void;
}

export default function MobileFloatingDock({
  isAdmin = false,
  onOpenDrawer,
}: MobileFloatingDockProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleHomeClick = () => {
    if (pathname === '/') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      router.push('/');
    }
  };

  const handleAdminClick = () => {
    router.push('/admin');
  };

  return (
    <div 
      className="
        fixed bottom-[calc(1.5rem+env(safe-area-inset-bottom,0px))] inset-x-0 z-[100] 
        pointer-events-none px-6 flex items-center justify-between sm:hidden
      "
    >
      {/* ── LEFT: Home Liquid Glass Round Button ── */}
      <button
        type="button"
        onClick={handleHomeClick}
        className="
          pointer-events-auto w-14 h-14 rounded-full flex items-center justify-center
          backdrop-blur-2xl bg-white/15 dark:bg-black/60 
          border border-white/30 dark:border-white/15 
          shadow-[0_12px_40px_rgba(0,0,0,0.35)] text-ink dark:text-white 
          hover:text-[#F25A2B] dark:hover:text-[#F25A2B] 
          active:scale-90 transition-all duration-200 cursor-pointer group
        "
        title="Home"
        aria-label="Go to Home"
      >
        <Home className="w-6 h-6 transition-transform group-hover:scale-110" />
      </button>

      {/* ── MIDDLE: Admin Liquid Glass Button (when admin) ── */}
      {isAdmin ? (
        <button
          type="button"
          onClick={handleAdminClick}
          className="
            pointer-events-auto px-4 h-12 rounded-full flex items-center gap-2
            backdrop-blur-2xl bg-purple-600/30 dark:bg-purple-900/40 
            border border-purple-500/40 text-purple-300 dark:text-purple-200 
            shadow-[0_10px_35px_rgba(124,58,237,0.3)] font-mono text-xs uppercase font-extrabold 
            hover:bg-purple-600/40 active:scale-95 transition-all duration-200 cursor-pointer
          "
          title="Admin Console"
          aria-label="Admin Console"
        >
          <Shield className="w-4 h-4 text-purple-400" />
          <span>Admin</span>
        </button>
      ) : <div className="w-1" />}

      {/* ── RIGHT: Menu Liquid Glass Round Button ── */}
      <button
        type="button"
        onClick={onOpenDrawer}
        className="
          pointer-events-auto w-14 h-14 rounded-full flex items-center justify-center
          backdrop-blur-2xl bg-white/15 dark:bg-black/60 
          border border-white/30 dark:border-white/15 
          shadow-[0_12px_40px_rgba(0,0,0,0.35)] text-ink dark:text-white 
          hover:text-[#F25A2B] dark:hover:text-[#F25A2B] 
          active:scale-90 transition-all duration-200 cursor-pointer group
        "
        title="Menu"
        aria-label="Open Menu Drawer"
      >
        <MenuIcon className="w-6 h-6 transition-transform group-hover:scale-110" />
      </button>
    </div>
  );
}
