'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import { 
  QrCode, Share2, Copy, Check, Sparkles, ExternalLink, ShieldCheck, 
  Search, Music, Layers, Calendar, UserCheck, Briefcase, MessageSquare, 
  Globe, Ticket, ArrowUpRight, Heart, Award
} from 'lucide-react';
import { InstagramIcon, YoutubeIcon, LinkedinIcon } from '@/components/SocialIcons';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ParticleBackground from '@/components/ParticleBackground';
import LinktreeQRModal from '@/components/LinktreeQRModal';
import { getLinktreeItems, type LinktreeItem } from '@/lib/linktree-data';

const ICON_MAP: Record<string, any> = {
  UserCheck,
  Ticket,
  Music,
  Layers,
  Calendar,
  Briefcase,
  Award,
  Sparkles,
  MessageSquare,
  Instagram: InstagramIcon,
  Youtube: YoutubeIcon,
  Linkedin: LinkedinIcon,
  Globe
};

export default function LinksPage() {
  const [linksList, setLinksList] = useState<LinktreeItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isQRModalOpen, setIsQRModalOpen] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  const loadLinks = () => {
    setLinksList(getLinktreeItems());
  };

  useEffect(() => {
    loadLinks();
    window.addEventListener('artistant-links-updated', loadLinks);
    return () => window.removeEventListener('artistant-links-updated', loadLinks);
  }, []);

  const filteredLinks = linksList.filter((item) => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleCopyPageUrl = async () => {
    try {
      await navigator.clipboard.writeText('https://artistant.in/links');
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0D14] text-white flex flex-col font-sans selection:bg-[#F25A2B] selection:text-white relative overflow-hidden">
      {/* Particle background */}
      <div className="fixed inset-0 pointer-events-none opacity-40 z-0">
        <ParticleBackground />
      </div>

      <Navbar />

      {/* Hero Header Section */}
      <section className="relative pt-32 pb-12 px-4 md:px-6 overflow-hidden flex flex-col items-center justify-center text-center z-10">
        {/* Glowing Orbs Background */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-[#F25A2B]/25 via-[#7C5CFF]/25 to-[#D4567A]/15 blur-[120px] pointer-events-none" />

        <div className="relative z-10 max-w-xl w-full flex flex-col items-center">
          {/* Avatar / Logo Badge with 3D animation */}
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="relative mb-6 group"
          >
            <div className="w-28 h-28 md:w-32 md:h-32 rounded-3xl p-1 bg-gradient-to-tr from-[#F25A2B] via-[#D4567A] to-[#7C5CFF] shadow-[0_0_50px_rgba(242,90,43,0.3)] transition-transform duration-500 group-hover:scale-105">
              <div className="w-full h-full rounded-[22px] bg-[#0E101A] flex items-center justify-center p-3.5 overflow-hidden">
                <img
                  src="/logo_a_highres.png"
                  alt="Artistant"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
            {/* Live Indicator Pulse */}
            <div className="absolute -bottom-1 -right-1 bg-[#0E101A] border-2 border-[#F25A2B] px-3 py-0.5 rounded-full flex items-center gap-1.5 shadow-xl">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-white">LIVE HUB</span>
            </div>
          </motion.div>

          {/* Title & Tagline */}
          <div className="flex items-center gap-2 mb-2">
            <h1 className="font-display text-4xl md:text-5xl font-extrabold tracking-tight text-white">
              Artistant
            </h1>
            <ShieldCheck className="w-7 h-7 text-[#F25A2B]" />
          </div>

          <p className="text-xs md:text-sm font-mono text-[#F25A2B] font-bold uppercase tracking-widest mb-3 px-3 py-1 rounded-full bg-[#F25A2B]/10 border border-[#F25A2B]/20">
            artistant.in/links
          </p>

          <p className="text-sm md:text-base text-white/80 max-w-md leading-relaxed mb-6 font-normal">
            India&apos;s Live Entertainment Infrastructure — Rebuilt for Artists, Organizers & Venues.
          </p>

          {/* Header Action Bar */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsQRModalOpen(true)}
              className="
                px-5 py-3 rounded-2xl bg-gradient-to-r from-[#F25A2B] via-[#D4567A] to-[#7C5CFF] text-white font-bold text-xs uppercase tracking-wider
                flex items-center gap-2 shadow-xl shadow-[#F25A2B]/25 hover:scale-[1.04] active:scale-95 transition-all cursor-pointer
              "
            >
              <QrCode className="w-4 h-4" />
              <span>Show QR Code</span>
            </button>

            <button
              onClick={handleCopyPageUrl}
              className="
                px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/15 text-white font-semibold text-xs
                flex items-center gap-2 transition-all cursor-pointer active:scale-95 shadow-md
              "
            >
              {copiedLink ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400 font-bold">Link Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4" />
                  <span>Share Profile</span>
                </>
              )}
            </button>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="flex-1 max-w-2xl w-full mx-auto px-4 pb-24 z-10 space-y-6">
        
        {/* Category Filters */}
        <div className="flex items-center justify-center gap-2 flex-wrap">
          {[
            { id: 'all', label: 'All Links' },
            { id: 'ecosystem', label: '🚀 Platform' },
            { id: 'artists', label: '🎨 Artists & Gigs' },
            { id: 'venues', label: '🎪 Events' },
            { id: 'community', label: '💬 Socials' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedCategory(tab.id)}
              className={`
                px-4 py-2 rounded-full text-xs font-mono font-semibold transition-all cursor-pointer
                ${selectedCategory === tab.id
                  ? 'bg-white text-black font-bold shadow-xl scale-105'
                  : 'bg-white/5 hover:bg-white/10 text-white/70 border border-white/10'}
              `}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Input Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-white/40 absolute left-4.5 top-3.5" />
          <input
            type="text"
            placeholder="Search links, gigs, events, or portals..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="
              w-full pl-11 pr-4 py-3.5 rounded-2xl bg-white/5 border border-white/10 text-white text-xs md:text-sm
              placeholder:text-white/30 focus:outline-none focus:border-[#F25A2B] transition-colors shadow-lg
            "
          />
        </div>

        {/* Links Cards Grid */}
        <div className="space-y-3.5">
          {filteredLinks.length === 0 ? (
            <div className="py-12 text-center text-white/50 text-xs font-mono">
              No links matching your search criteria.
            </div>
          ) : (
            filteredLinks.map((item, idx) => {
              const IconComponent = ICON_MAP[item.iconName] || Sparkles;
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.04, duration: 0.3 }}
                >
                  <a
                    href={item.url}
                    target={item.isExternal ? '_blank' : '_self'}
                    rel={item.isExternal ? 'noopener noreferrer' : ''}
                    className={`
                      group relative w-full p-4 md:p-5 rounded-2xl border transition-all duration-300 flex items-center justify-between gap-4
                      cursor-pointer block shadow-xl
                      ${item.featured 
                        ? 'bg-gradient-to-r from-[#1A1C2E] via-[#121424] to-[#181A2A] border-[#F25A2B]/40 hover:border-[#F25A2B] shadow-[#F25A2B]/10 hover:scale-[1.01]' 
                        : 'bg-white/[0.03] hover:bg-white/[0.06] border-white/10 hover:border-white/20 hover:scale-[1.005]'}
                    `}
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      {/* Icon */}
                      <div 
                        className={`
                          w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border transition-transform duration-300 group-hover:scale-110
                          ${item.featured
                            ? 'bg-gradient-to-tr from-[#F25A2B]/20 to-[#7C5CFF]/20 border-[#F25A2B]/40 text-[#F25A2B]'
                            : 'bg-white/5 border-white/10 text-white'}
                        `}
                      >
                        <IconComponent className="w-5 h-5" />
                      </div>

                      {/* Text details */}
                      <div className="min-w-0 flex flex-col gap-0.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-display font-bold text-sm md:text-base text-white group-hover:text-[#F25A2B] transition-colors truncate">
                            {item.title}
                          </h3>
                          {item.badge && (
                            <span 
                              className={`
                                text-[9px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full text-white bg-gradient-to-r ${item.badgeColor || 'from-white/20 to-white/10'}
                              `}
                            >
                              {item.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-white/60 line-clamp-1 leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                    </div>

                    {/* Action Indicator */}
                    <div className="shrink-0 text-white/40 group-hover:text-white group-hover:translate-x-1 transition-all">
                      {item.isExternal ? (
                        <ArrowUpRight className="w-5 h-5 text-[#F25A2B]" />
                      ) : (
                        <ExternalLink className="w-4 h-4" />
                      )}
                    </div>
                  </a>
                </motion.div>
              );
            })
          )}
        </div>

        {/* Footer Brand Banner */}
        <div className="pt-10 text-center space-y-2">
          <Link href="/" className="inline-block transition-transform hover:scale-105">
            <img
              src="/logo_wordmark_flat.png"
              alt="Artistant"
              className="h-5 mx-auto object-contain dark:invert-0 invert opacity-60 hover:opacity-100 transition-opacity"
            />
          </Link>
          <p className="text-[11px] font-mono text-white/40 uppercase tracking-widest">
            artistant.in • The Bookability Engine™
          </p>
        </div>
      </main>

      {/* QR Modal */}
      <LinktreeQRModal
        isOpen={isQRModalOpen}
        onClose={() => setIsQRModalOpen(false)}
        targetUrl="https://artistant.in/links"
        title="Artistant Links Hub QR"
        subtitle="Scan to access artistant.in/links"
      />

      <Footer />
    </div>
  );
}
