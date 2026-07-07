import React from 'react';
import { QrCode } from 'lucide-react';
import Link from 'next/link';

/**
 * Footer — Site footer with ArtisTant branding and links.
 * Glassmorphic Redesign.
 */
export default function Footer() {
  return (
    <footer className="relative w-full overflow-hidden border-t border-white/5 bg-[#0B1120]/60 backdrop-blur-2xl text-sm text-gray-400 mt-20">
      {/* Glassmorphic glowing backgrounds */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#F25A2B]/10 rounded-full blur-[128px] -z-10 pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[30rem] h-[30rem] bg-[#7C5CFF]/10 rounded-full blur-[128px] -z-10 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-white/5 to-transparent -z-10" />

      <div className="max-w-7xl mx-auto px-6 py-16 relative z-10">
        
        {/* Top Section */}
        <div className="flex flex-col lg:flex-row justify-between items-start gap-16 mb-20">
          
          {/* Brand Column */}
          <div className="flex flex-col items-start gap-1 lg:w-[45%]">
            <Link href="/" className="inline-block transition-transform duration-300 hover:scale-105 hover:opacity-90 -ml-6 md:-ml-8 -mt-24 -mb-24 md:-mt-32 md:-mb-32">
              <img src="/logo_wordmark.png" alt="ArtisTant" className="w-[240px] md:w-[320px] h-auto object-contain object-left pointer-events-none" />
            </Link>
            
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 relative z-10">
              <h2 className="font-display text-lg sm:text-xl md:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-white to-white/60 leading-tight tracking-tight whitespace-nowrap">
                Step into The Bookability Engine™.
              </h2>
              <span className="text-[10px] font-mono uppercase tracking-widest px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-white backdrop-blur-md shadow-[0_0_20px_rgba(242,90,43,0.15)] transition-all duration-300 hover:bg-white/10 hover:border-white/20 hover:shadow-[0_0_30px_rgba(242,90,43,0.25)] whitespace-nowrap w-fit">
                Launching Soon
              </span>
            </div>
            
            <p className="font-mono text-[11px] font-bold tracking-[0.06em] uppercase flex items-center gap-2 mt-4">
              <span className="text-white/40">India's Live Economy,</span>
              <span className="bg-gradient-to-r from-[#F25A2B] to-[#7C5CFF] text-transparent bg-clip-text">Rebuilt</span>
            </p>
          </div>

          {/* Links Columns */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-12 lg:w-3/5 lg:pl-12">
            
            {/* Help */}
            <div className="flex flex-col gap-6">
              <h3 className="text-white font-semibold text-xs tracking-[0.15em] uppercase opacity-90">Help</h3>
              <div className="flex flex-col gap-4">
                <a href="mailto:hello@artistant.in" className="text-gray-400 hover:text-white transition-colors duration-300 relative group w-fit text-[15px] cursor-pointer">
                  Contact Us
                  <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-white transition-all duration-300 group-hover:w-full opacity-50"></span>
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div className="flex flex-col gap-6">
              <h3 className="text-white font-semibold text-xs tracking-[0.15em] uppercase opacity-90">Quick Links</h3>
              <div className="flex flex-col gap-4">
                <Link href="/#join" className="text-gray-400 hover:text-white transition-colors duration-300 relative group w-fit text-[15px] cursor-pointer">
                  Reserve Username
                  <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-white transition-all duration-300 group-hover:w-full opacity-50"></span>
                </Link>
                <Link href="/#problem-voices" className="text-gray-400 hover:text-white transition-colors duration-300 relative group w-fit text-[15px] cursor-pointer">
                  Voices
                  <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-white transition-all duration-300 group-hover:w-full opacity-50"></span>
                </Link>
                <Link href="/#standard" className="text-gray-400 hover:text-white transition-colors duration-300 relative group w-fit text-[15px] cursor-pointer">
                  Roadmap
                  <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-white transition-all duration-300 group-hover:w-full opacity-50"></span>
                </Link>
              </div>
            </div>

            {/* Useful Links */}
            <div className="flex flex-col gap-6">
              <h3 className="text-white font-semibold text-xs tracking-[0.15em] uppercase opacity-90">Socials</h3>
              <div className="flex flex-col gap-4">
                <a href="https://instagram.com/artistant.in" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors duration-300 flex items-center gap-2 group w-fit text-[15px] cursor-pointer">
                  Instagram
                  <svg className="w-3.5 h-3.5 opacity-50 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            </div>

          </div>
        </div>

        {/* Middle Section: Download App Banner (Glassmorphic Card) */}
        <div className="w-full flex flex-col md:flex-row items-center justify-between p-8 md:p-10 rounded-[2rem] bg-white/[0.03] border border-white/10 backdrop-blur-xl mb-16 shadow-[0_8px_32px_rgba(0,0,0,0.4)] relative overflow-hidden group cursor-pointer hover:bg-white/[0.05] transition-colors duration-500">
          {/* Subtle shine effect on hover */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.08] to-transparent -translate-x-[100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out pointer-events-none"></div>
          
          <div className="flex flex-col gap-3 mb-8 md:mb-0 z-10 text-center md:text-left">
            <h3 className="text-white font-display text-2xl md:text-3xl font-bold tracking-tight">Take Artistant Anywhere</h3>
            <p className="text-gray-400 text-sm md:text-base max-w-md">The complete booking engine in your pocket. Manage your creative business on the go.</p>
          </div>

          <div className="flex items-center gap-6 z-10">
            <div className="flex flex-col justify-center text-right hidden sm:flex">
              <span className="text-white font-medium text-base leading-tight mb-1">Scan to Download</span>
              <span className="text-xs text-gray-400 leading-tight">Available on iOS & Android</span>
            </div>
            
            <div className="relative w-24 h-24 bg-white/[0.08] rounded-2xl border border-white/20 flex items-center justify-center overflow-hidden shrink-0 shadow-[0_4px_24px_rgba(0,0,0,0.3)] backdrop-blur-2xl transition-transform duration-500 hover:scale-105 hover:bg-white/[0.12] hover:border-white/30">
              <QrCode className="w-12 h-12 text-white/30" />
              {/* Overlay */}
              <div className="absolute inset-0 backdrop-blur-[8px] bg-black/40 flex items-center justify-center">
                 <span className="text-[10px] font-bold text-white uppercase tracking-[0.2em] text-center leading-tight">
                   Coming<br/>Soon
                 </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6 text-[13px] text-gray-500">
          <div className="flex flex-col md:flex-row items-center gap-3 md:gap-5 text-center md:text-left">
            <span>© {new Date().getFullYear()} Artistant Pvt. Ltd. All rights reserved.</span>
            <span className="hidden md:inline-block text-white/10">|</span>
            <span className="font-mono text-[10px] tracking-widest uppercase text-gray-400 flex items-center gap-2">
              The Ultimate Creative Linkup <span className="w-1.5 h-1.5 rounded-full bg-[#F25A2B] shadow-[0_0_8px_#F25A2B] animate-pulse"></span>
            </span>
          </div>
          <div className="flex gap-8 items-center font-medium">
            <Link href="/terms" className="hover:text-white transition-colors duration-300 cursor-pointer">Terms & Conditions</Link>
            <Link href="/privacy" className="hover:text-white transition-colors duration-300 cursor-pointer">Privacy Policy</Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
