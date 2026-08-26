'use client';

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';

import {
  BarChart3,
  Users,
  QrCode,
  Mail,
  CalendarIcon,
  Trophy,
  Eye,
  Shield,
  Briefcase,
  Settings,
  LogOut,
  Menu,
  Search,
  Moon,
  Sun,
  ArrowUpRight,
} from 'lucide-react';
import { ToastNotification } from '@/components/ToastNotification';

interface AdminShellProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  bookingRequestsCount: number;
  user: any;
  userDisplayName: string;
  userRole: string;
  handleLogout: () => void;
  setShowCommandPalette: (show: boolean) => void;
  mounted: boolean;
  theme: string | undefined;
  setTheme: (theme: string) => void;
  resolvedTheme: string | undefined;
  successToast: string | null;
  setSuccessToast: (msg: string | null) => void;
}

export default function AdminShell({
  children,
  activeTab,
  setActiveTab,
  sidebarOpen,
  setSidebarOpen,
  bookingRequestsCount,
  user,
  userDisplayName,
  userRole,
  handleLogout,
  setShowCommandPalette,
  mounted,
  setTheme,
  resolvedTheme,
  successToast,
  setSuccessToast,
}: AdminShellProps) {
  const tabs = [
    { id: "overview", label: "Executive Overview", icon: BarChart3, accent: '#00F2FE', count: null },
    { id: "registrations", label: "Waitlist Directory", icon: Users, accent: 'var(--brand-1)', count: null },
    { id: "links_cards", label: "Links & Founder Cards", icon: QrCode, accent: '#F25A2B', count: null },
    { id: "emails", label: "Broadcast Studio", icon: Mail, accent: '#7C5CFF', count: null },
    { id: "requests", label: "Booking Requests", icon: CalendarIcon, accent: '#F25A2B', count: bookingRequestsCount },
    { id: "leaderboards", label: "Leaderboards", icon: Trophy, accent: 'var(--brand-2)', count: null },
    { id: "members", label: "Visitor Activity", icon: Eye, accent: 'var(--brand-3)', count: null },
    { id: "admins", label: "Manage Admins", icon: Shield, accent: 'var(--brand-4)', count: null },
    { id: "careers", label: "Careers", icon: Briefcase, accent: '#F25A2B', count: null },
    { id: "settings", label: "Site Settings", icon: Settings, accent: '#00F2FE', count: null },
  ] as const;

  return (
    <div className="min-h-screen bg-bg text-ink relative overflow-hidden selection:bg-brand selection:text-white admin-console-wrapper">
      {/* Homepage-style cinematic backdrop */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse 70% 50% at 50% 40%, rgba(124,92,255,0.08), transparent 60%),
              radial-gradient(ellipse 60% 40% at 25% 70%, rgba(242,90,43,0.06), transparent 55%),
              radial-gradient(ellipse 50% 40% at 75% 80%, rgba(212,86,122,0.05), transparent 50%)
            `,
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'linear-gradient(rgba(124,92,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(124,92,255,0.04) 1px, transparent 1px)',
            backgroundSize: '80px 80px',
            maskImage: 'radial-gradient(ellipse 70% 60% at 50% 40%, black 20%, transparent 70%)',
            WebkitMaskImage: 'radial-gradient(ellipse 70% 60% at 50% 40%, black 20%, transparent 70%)',
          }}
        />
      </div>

      {/* Redesigned Notification Toast */}
      <ToastNotification
        message={successToast}
        onClose={() => setSuccessToast(null)}
        position="top-right"
      />

      {/* ===================================================================
          APP SHELL — SIDEBAR + CONTENT
          =================================================================== */}
      <div className="flex h-screen overflow-hidden relative z-10">
        {/* Mobile Sidebar Backdrop */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-35 md:hidden cursor-pointer"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* ─── Sidebar Navigation Panel ─── */}
        <motion.aside
          initial={{ x: -300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className={`fixed md:relative top-0 bottom-0 left-0 w-[290px] flex flex-col flex-shrink-0 z-40 transition-transform duration-300 md:translate-x-0 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
          } md:my-5 md:ml-5 md:rounded-[2.4rem] border-r md:border border-white/20 dark:border-white/10 bg-white/[0.04] dark:bg-[#0A0B12]/75 backdrop-blur-3xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.3),0_25px_60px_rgba(0,0,0,0.5)] overflow-hidden`}
        >
          {/* Top Liquid Specular Light Highlight */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent pointer-events-none" />

          {/* Brand Logo & Console Tag */}
          <div className="px-8 pt-8 pb-5">
            <a href="/" target="_blank" className="inline-block group">
              <img
                src="/logo_wordmark_flat.png"
                alt="ArtisTant"
                className="h-[21px] w-auto object-contain dark:invert-0 invert block"
              />
              <p className="text-[9.5px] font-mono font-bold tracking-[0.26em] uppercase text-[#F25A2B] mt-1 whitespace-nowrap">
                Command center
              </p>
            </a>
          </div>

          <div className="h-px mx-6 bg-gradient-to-r from-transparent via-white/20 dark:via-white/10 to-transparent" />

          {/* Navigation Links Menu */}
          <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1.5 relative text-left">
            <p className="text-[9px] font-mono font-bold tracking-[0.18em] uppercase px-4 pb-2 text-ink-3 dark:text-slate-400">
              Management Suite
            </p>

            <div className="space-y-1.5 relative">
              {tabs.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setSidebarOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl transition-all duration-300 text-xs font-semibold relative group overflow-hidden cursor-pointer backdrop-blur-xl ${
                      isActive
                        ? "bg-white/15 dark:bg-white/[0.08] text-ink dark:text-white border border-white/20 dark:border-white/15 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4),0_8px_20px_rgba(0,0,0,0.25)] font-bold"
                        : "text-ink-2 dark:text-slate-400 border border-transparent hover:border-white/10 hover:bg-white/10 dark:hover:bg-white/[0.04] hover:text-ink dark:hover:text-white"
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeSidebarTab"
                        className="absolute inset-0 rounded-2xl bg-gradient-to-r from-white/10 to-transparent pointer-events-none"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}

                    <div className="flex items-center gap-3.5 z-10">
                      <div
                        className="w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-300 border backdrop-blur-md shadow-sm"
                        style={{
                          backgroundColor: isActive ? `${item.accent}25` : 'rgba(255,255,255,0.05)',
                          borderColor: isActive ? `${item.accent}50` : 'rgba(255,255,255,0.1)',
                          color: isActive ? item.accent : 'var(--ink-3)',
                        }}
                      >
                        <item.icon className="w-4 h-4 transition-transform group-hover:scale-110 duration-300" style={{ color: isActive ? item.accent : undefined }} />
                      </div>
                      <span className={`font-semibold transition-colors duration-200 ${isActive ? "text-ink dark:text-white font-bold" : "text-ink-2 dark:text-slate-400 group-hover:text-ink dark:group-hover:text-white"}`}>
                        {item.label}
                      </span>
                    </div>

                    {item.count !== null && item.count > 0 && (
                      <span className="z-10 px-2.5 py-0.5 rounded-full text-[9px] font-mono font-extrabold bg-[#F25A2B] text-white shadow-[0_0_10px_rgba(242,90,43,0.4)]">
                        {item.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </nav>

          {/* Console Profile & System Health readout */}
          <div className="p-4 border-t border-white/15 dark:border-white/10">
            <div className="bg-white/10 dark:bg-white/[0.04] border border-white/20 dark:border-white/10 rounded-3xl p-4 backdrop-blur-2xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-mono font-bold text-sm shrink-0 bg-gradient-to-br from-[#7C5CFF] to-[#D4567A] shadow-[0_4px_12px_rgba(124,92,255,0.3)] border border-white/20 relative overflow-hidden">
                  {user?.photoURL ? (
                    <img src={user.photoURL} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span>{userDisplayName ? userDisplayName[0].toUpperCase() : "A"}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-xs font-bold text-ink dark:text-white truncate" title={userDisplayName}>{userDisplayName}</p>
                  <p className="text-[9px] font-mono tracking-[0.1em] uppercase mt-0.5 text-ink-3 dark:text-slate-400 font-bold">{userRole || "Administrator"}</p>
                </div>
                <button onClick={handleLogout} className="text-ink-3 dark:text-slate-400 hover:text-red-400 transition-colors p-2 cursor-pointer rounded-xl hover:bg-white/15 dark:hover:bg-white/10" title="Sign Out">
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="mt-3 pt-3 border-t border-white/15 dark:border-white/10 flex items-center justify-between text-[10px] font-mono">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.6)] animate-pulse" />
                  <span className="text-ink-2 dark:text-slate-300 font-bold uppercase tracking-wider">Database Connection</span>
                </div>
                <span className="text-emerald-500 dark:text-emerald-400 font-bold uppercase">Active</span>
              </div>
            </div>
          </div>
        </motion.aside>

        <main className="flex-1 overflow-y-scroll relative scroll-smooth flex flex-col h-screen">
          {/* Apple Liquid Glass Floating Navbar Capsule */}
          <header className="sticky top-0 z-[45] px-4 md:px-8 pt-4 pb-2">
            <div className="mx-auto w-full max-w-[1400px] navbar-liquid-glass rounded-3xl md:rounded-full px-5 py-3 md:px-7 md:py-3.5 flex items-center justify-between shadow-2xl transition-all duration-300">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="md:hidden p-2.5 rounded-2xl border border-white/20 dark:border-white/10 bg-white/10 dark:bg-white/5 text-ink-2 dark:text-slate-300 hover:text-ink dark:hover:text-white cursor-pointer hover:bg-white/20 dark:hover:bg-white/10 transition-all backdrop-blur-xl"
                  aria-label="Open sidebar"
                >
                  <Menu className="w-4 h-4" />
                </button>

                <div className="flex flex-col text-left">
                  <span className="text-[9px] font-mono font-bold tracking-[0.25em] text-[#7C5CFF] uppercase">Admin Console</span>
                  <h2 className="text-base md:text-lg font-display font-bold tracking-tight text-ink dark:text-white uppercase mt-0.5" style={{ fontFamily: '"Space Grotesk", sans-serif' }}>
                    {activeTab === "overview" && "Executive Overview & Analytics"}
                    {activeTab === "registrations" && "Waitlist Directory"}
                    {activeTab === "emails" && "Email Broadcast Studio"}
                    {activeTab === "requests" && "Client Booking Requests Ops"}
                    {activeTab === "leaderboards" && "Leaderboard Rankings"}
                    {activeTab === "members" && "Visitor Activity Logs"}
                    {activeTab === "admins" && "System Administrators"}
                    {activeTab === "links_cards" && "Links & Founder Business Cards Studio"}
                    {activeTab === "settings" && "Platform Configuration"}
                    {activeTab === "careers" && "Careers Management"}
                  </h2>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowCommandPalette(true)}
                  className="flex items-center gap-2.5 px-4 py-2 rounded-full border border-white/20 dark:border-white/10 bg-white/10 dark:bg-white/5 hover:bg-white/20 dark:hover:bg-white/10 text-ink-2 dark:text-slate-300 hover:text-ink dark:hover:text-white text-xs font-mono transition-all duration-300 cursor-pointer shadow-sm backdrop-blur-xl"
                  title="Quick Search & Command Palette (Cmd+K)"
                >
                  <Search className="w-3.5 h-3.5 text-[#7C5CFF]" />
                  <span className="hidden sm:inline">Search...</span>
                  <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 rounded-lg bg-white/15 dark:bg-white/10 border border-white/20 dark:border-white/15 text-[10px] text-ink-3 dark:text-slate-300 font-mono font-bold shadow-inner">
                    ⌘K
                  </kbd>
                </button>

                {mounted && (
                  <button
                    onClick={() => setTheme(resolvedTheme === "light" ? "dark" : "light")}
                    className="p-2.5 rounded-full border border-white/20 dark:border-white/10 bg-white/10 dark:bg-white/5 hover:bg-white/20 dark:hover:bg-white/10 text-ink-2 dark:text-slate-300 hover:text-ink dark:hover:text-white cursor-pointer transition-all duration-300 backdrop-blur-xl"
                    aria-label="Toggle Theme"
                    title={resolvedTheme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
                  >
                    {resolvedTheme === "light" ? (
                      <Moon className="w-4 h-4" />
                    ) : (
                      <Sun className="w-4 h-4" />
                    )}
                  </button>
                )}

                <a
                  href="/"
                  target="_blank"
                  className="flex items-center gap-2 px-5 py-2 rounded-full border border-white/20 dark:border-white/15 bg-gradient-to-r from-[#7C5CFF] to-[#6342E8] hover:opacity-95 text-white text-xs font-mono font-bold uppercase tracking-wider transition-all duration-300 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4),0_8px_20px_rgba(124,92,255,0.3)] backdrop-blur-xl"
                >
                  Launch Portal <ArrowUpRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </header>

          <div className="p-4 md:p-8 max-w-[1400px] mx-auto space-y-6 md:space-y-8 pb-32">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="w-full"
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
}
