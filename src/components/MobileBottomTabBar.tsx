'use client';

import React from 'react';
import { motion } from 'motion/react';
import { usePathname, useRouter } from 'next/navigation';
import { type User } from 'firebase/auth';
import { type WaitlistEntry } from '@/lib/waitlist';
import { Home, Sparkles, Music, Menu as MenuIcon, User as UserIcon } from 'lucide-react';

interface MobileBottomTabBarProps {
  user: User | null;
  userReservation: WaitlistEntry | null;
  onOpenDrawer: () => void;
}

export default function MobileBottomTabBar({
  user,
  userReservation,
  onOpenDrawer,
}: MobileBottomTabBarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleTabClick = (tabId: string, path?: string) => {
    if (tabId === 'menu') {
      onOpenDrawer();
      return;
    }

    if (tabId === 'features') {
      if (pathname === '/') {
        const el = document.getElementById('ecosystem') || document.getElementById('roadmap');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
          return;
        }
      }
      router.push('/#ecosystem');
      return;
    }

    if (path) {
      if (pathname === path) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        router.push(path);
      }
    }
  };

  const tabs = [
    {
      id: 'home',
      label: 'Home',
      icon: Home,
      path: '/',
      isActive: pathname === '/',
    },
    {
      id: 'features',
      label: 'Features',
      icon: Sparkles,
      isActive: false,
    },
    {
      id: 'demo',
      label: 'Demo',
      icon: Music,
      path: '/kaavya',
      isActive: pathname === '/kaavya',
    },
    {
      id: 'menu',
      label: user ? 'Account' : 'Menu',
      icon: user ? UserIcon : MenuIcon,
      isActive: false,
    },
  ];

  return (
    <nav 
      aria-label="Mobile app navigation"
      className="
        fixed bottom-0 inset-x-0 z-[90] sm:hidden
        bg-[#10121B]/90 dark:bg-[#090A10]/95 backdrop-blur-2xl
        border-t border-white/10 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]
        pb-[max(0.75rem,env(safe-area-inset-bottom,0px))] pt-2 px-3
        pointer-events-auto select-none
      "
    >
      <div className="flex items-center justify-around max-w-md mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleTabClick(tab.id, tab.path)}
              className="
                flex flex-col items-center gap-1 py-1 px-3 rounded-2xl relative
                transition-all duration-200 cursor-pointer active:scale-90
              "
            >
              {tab.isActive && (
                <motion.div
                  layoutId="activeMobileTabIndicator"
                  className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#F25A2B]/20 to-[#7C5CFF]/20 border border-[#F25A2B]/30"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}

              <div className="relative">
                <Icon 
                  className={`w-5 h-5 transition-colors ${
                    tab.isActive 
                      ? 'text-[#F25A2B]' 
                      : 'text-white/60 hover:text-white'
                  }`} 
                />
                {tab.id === 'demo' && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#7C5CFF] animate-pulse" />
                )}
              </div>

              <span 
                className={`text-[10px] font-mono font-bold tracking-wider uppercase transition-colors ${
                  tab.isActive 
                    ? 'text-white' 
                    : 'text-white/50'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
