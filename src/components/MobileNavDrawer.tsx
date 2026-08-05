'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useRouter, usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import { type User } from 'firebase/auth';
import { type WaitlistEntry } from '@/lib/waitlist';
import { 
  X, Home, Sparkles, User as UserIcon, LogIn, LogOut, Sun, Moon, 
  Shield, Layers, ChevronRight, Settings, ExternalLink, Calendar,
  Music, MapPin, Building, Ticket, Award
} from 'lucide-react';

interface MobileNavDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  userReservation: WaitlistEntry | null;
  isAdmin: boolean;
  foundingPoints?: number;
  onSignInClick: () => void;
  onSignOut: () => Promise<void>;
  onOpenRoleModal?: (role: 'organizer' | 'attendee' | 'venue') => void;
}

export default function MobileNavDrawer({
  isOpen,
  onClose,
  user,
  userReservation,
  isAdmin,
  foundingPoints,
  onSignInClick,
  onSignOut,
  onOpenRoleModal,
}: MobileNavDrawerProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { setTheme, resolvedTheme } = useTheme();

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleNavigate = (path: string) => {
    onClose();
    if (pathname === path) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      router.push(path);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex justify-end md:hidden">
          {/* Backdrop Blur Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            className="fixed inset-0 z-[9998] bg-black/75 backdrop-blur-xl"
          />

          {/* Slide-Over Drawer Container */}
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="
              relative w-[85vw] max-w-[340px] h-full flex flex-col justify-between
              bg-[#10121A]/98 dark:bg-[#0C0D14]/98 text-white
              border-l border-white/15 shadow-2xl z-[9999]
              pt-[calc(1.25rem+env(safe-area-inset-top,0px))]
              pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))]
              px-5 overflow-y-auto mobile-touch-scroll no-scrollbar
            "
          >
            {/* Top Bar inside Drawer */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <img
                  src="/logo_wordmark_flat.png"
                  alt="ArtisTant"
                  className="h-4 object-contain dark:invert-0 invert"
                />
                <span className="text-[9px] font-mono font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-[#F25A2B]/15 text-[#F25A2B] border border-[#F25A2B]/20">
                  APP
                </span>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors cursor-pointer active:scale-95"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Profile / Auth Card Header */}
            <div className="py-4">
              {user ? (
                <div 
                  onClick={() => handleNavigate('/dashboard')}
                  className="
                    p-3.5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 
                    transition-all duration-200 cursor-pointer flex items-center justify-between group
                  "
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div 
                      className="w-11 h-11 rounded-full text-white font-mono font-bold text-sm grid place-items-center shrink-0 overflow-hidden border border-white/20"
                      style={{ background: 'linear-gradient(135deg, #F25A2B 0%, #7C5CFF 100%)' }}
                    >
                      {userReservation?.profile_photo_url ? (
                        <img src={userReservation.profile_photo_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        userReservation?.username?.[0] ?? user.displayName?.[0] ?? user.email?.[0] ?? 'U'
                      )}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-bold text-white truncate leading-tight group-hover:text-[#F25A2B] transition-colors">
                        {userReservation ? `@${userReservation.username}` : (user.displayName || 'Creator')}
                      </span>
                      <span className="text-[11px] text-white/50 truncate font-mono mt-0.5">
                        {user.email || user.phoneNumber || 'Authenticated User'}
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-white/40 group-hover:text-white group-hover:translate-x-0.5 transition-all shrink-0" />
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-[#F25A2B]/15 to-[#7C5CFF]/15 border border-white/10 flex flex-col gap-3">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-bold text-white font-mono uppercase tracking-wider">Join ArtisTant</span>
                    <span className="text-[11px] text-white/60 leading-relaxed">
                      Reserve your handle & get early access to booking tools.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => { onClose(); onSignInClick(); }}
                    className="
                      w-full py-2.5 rounded-xl bg-gradient-to-r from-[#F25A2B] to-[#7C5CFF] 
                      text-white font-bold font-mono text-xs uppercase tracking-wider 
                      shadow-md hover:scale-[1.02] active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2
                    "
                  >
                    <LogIn className="w-4 h-4" /> Sign In / Claim Handle
                  </button>
                </div>
              )}
            </div>

            {/* Main Navigation Links */}
            <div className="flex-1 space-y-5 py-2">
              {/* Section 1: Core Navigation */}
              <div className="space-y-1">
                <span className="px-3 text-[10px] font-mono uppercase tracking-widest text-white/40 font-bold">
                  Navigation
                </span>

                <button
                  onClick={() => handleNavigate('/')}
                  className={`
                    w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold
                    transition-all cursor-pointer
                    ${pathname === '/' ? 'bg-[#F25A2B]/20 text-[#F25A2B] border border-[#F25A2B]/30' : 'text-white/80 hover:bg-white/5 hover:text-white'}
                  `}
                >
                  <div className="flex items-center gap-3">
                    <Home className="w-4 h-4" />
                    <span>Home & Waitlist</span>
                  </div>
                  {pathname === '/' && <div className="w-1.5 h-1.5 rounded-full bg-[#F25A2B]" />}
                </button>

                {user && (
                  <button
                    onClick={() => handleNavigate('/dashboard')}
                    className={`
                      w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold
                      transition-all cursor-pointer
                      ${pathname === '/dashboard' ? 'bg-[#F25A2B]/20 text-[#F25A2B] border border-[#F25A2B]/30' : 'text-white/80 hover:bg-white/5 hover:text-white'}
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <UserIcon className="w-4 h-4" />
                      <span>Creator Dashboard</span>
                    </div>
                    {pathname === '/dashboard' && <div className="w-1.5 h-1.5 rounded-full bg-[#F25A2B]" />}
                  </button>
                )}

                <button
                  onClick={() => handleNavigate('/kaavya')}
                  className={`
                    w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold
                    transition-all cursor-pointer
                    ${pathname === '/kaavya' ? 'bg-[#F25A2B]/20 text-[#F25A2B] border border-[#F25A2B]/30' : 'text-white/80 hover:bg-white/5 hover:text-white'}
                  `}
                >
                  <div className="flex items-center gap-3">
                    <Music className="w-4 h-4 text-purple-400" />
                    <span>Demo Artist Profile</span>
                  </div>
                  <span className="text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    Live Demo
                  </span>
                </button>

                <button
                  onClick={() => handleNavigate('/directory')}
                  className={`
                    w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold
                    transition-all cursor-pointer
                    ${pathname === '/directory' ? 'bg-[#F25A2B]/20 text-[#F25A2B] border border-[#F25A2B]/30' : 'text-white/80 hover:bg-white/5 hover:text-white'}
                  `}
                >
                  <div className="flex items-center gap-3">
                    <UserIcon className="w-4 h-4 text-[#F25A2B]" />
                    <span>Artist Directory</span>
                  </div>
                  {pathname === '/directory' && <div className="w-1.5 h-1.5 rounded-full bg-[#F25A2B]" />}
                </button>

                <button
                  onClick={() => handleNavigate('/gigs')}
                  className={`
                    w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold
                    transition-all cursor-pointer
                    ${pathname === '/gigs' ? 'bg-[#F25A2B]/20 text-[#F25A2B] border border-[#F25A2B]/30' : 'text-white/80 hover:bg-white/5 hover:text-white'}
                  `}
                >
                  <div className="flex items-center gap-3">
                    <Layers className="w-4 h-4 text-[#7C5CFF]" />
                    <span>Gig Opportunities</span>
                  </div>
                  {pathname === '/gigs' && <div className="w-1.5 h-1.5 rounded-full bg-[#7C5CFF]" />}
                </button>

                <button
                  onClick={() => handleNavigate('/events')}
                  className={`
                    w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold
                    transition-all cursor-pointer
                    ${pathname === '/events' ? 'bg-[#F25A2B]/20 text-[#F25A2B] border border-[#F25A2B]/30' : 'text-white/80 hover:bg-white/5 hover:text-white'}
                  `}
                >
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-[#D4567A]" />
                    <span>Event Calendar</span>
                  </div>
                  {pathname === '/events' && <div className="w-1.5 h-1.5 rounded-full bg-[#D4567A]" />}
                </button>

                <button
                  onClick={() => handleNavigate('/changelog')}
                  className={`
                    w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold
                    transition-all cursor-pointer
                    ${pathname === '/changelog' ? 'bg-[#F25A2B]/20 text-[#F25A2B] border border-[#F25A2B]/30' : 'text-white/80 hover:bg-white/5 hover:text-white'}
                  `}
                >
                  <div className="flex items-center gap-3">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>What&apos;s New</span>
                  </div>
                </button>

                {isAdmin && (
                  <button
                    onClick={() => handleNavigate('/admin')}
                    className={`
                      w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold
                      transition-all cursor-pointer
                      ${pathname === '/admin' ? 'bg-purple-600/30 text-purple-300 border border-purple-500/40' : 'text-purple-400 hover:bg-purple-600/20'}
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <Shield className="w-4 h-4" />
                      <span>Admin Portal</span>
                    </div>
                    <span className="text-[9px] font-mono uppercase font-bold px-1.5 py-0.5 rounded bg-purple-500/30 text-purple-200">
                      ADMIN
                    </span>
                  </button>
                )}
              </div>

              {/* Section 2: Roles Onboarding */}
              <div className="space-y-1 pt-2 border-t border-white/10">
                <span className="px-3 text-[10px] font-mono uppercase tracking-widest text-white/40 font-bold">
                  Onboarding & Roles
                </span>

                <button
                  onClick={() => { onClose(); onOpenRoleModal?.('organizer'); }}
                  className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-white/80 hover:bg-white/5 hover:text-white rounded-xl transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-[#F25A2B]" />
                    <span>For Event Hosts</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 opacity-40" />
                </button>

                <button
                  onClick={() => { onClose(); onOpenRoleModal?.('venue'); }}
                  className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-white/80 hover:bg-white/5 hover:text-white rounded-xl transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <Building className="w-4 h-4 text-purple-400" />
                    <span>For Partner Venues</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 opacity-40" />
                </button>

                <button
                  onClick={() => { onClose(); onOpenRoleModal?.('attendee'); }}
                  className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-white/80 hover:bg-white/5 hover:text-white rounded-xl transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <Ticket className="w-4 h-4 text-emerald-400" />
                    <span>For Show Attendees</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 opacity-40" />
                </button>
              </div>
            </div>

            {/* Bottom Controls & Sign Out */}
            <div className="pt-4 border-t border-white/10 space-y-3">
              {/* Theme Switcher Toggle */}
              <button
                type="button"
                onClick={() => setTheme(resolvedTheme === 'light' ? 'dark' : 'light')}
                className="
                  w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl
                  bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-white
                  transition-colors cursor-pointer active:scale-98
                "
              >
                <div className="flex items-center gap-2.5">
                  {resolvedTheme === 'light' ? (
                    <Moon className="w-4 h-4 text-[#F25A2B]" />
                  ) : (
                    <Sun className="w-4 h-4 text-[#F25A2B]" />
                  )}
                  <span>Appearance</span>
                </div>
                <span className="font-mono text-[10px] uppercase font-bold text-white/50 bg-white/10 px-2 py-0.5 rounded-full">
                  {resolvedTheme === 'light' ? 'Light' : 'Dark'}
                </span>
              </button>

              {user && (
                <button
                  type="button"
                  onClick={async () => { onClose(); await onSignOut(); }}
                  className="
                    w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl
                    bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-xs font-semibold text-rose-400
                    transition-colors cursor-pointer active:scale-98
                  "
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out Account</span>
                </button>
              )}
            </div>

          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}
