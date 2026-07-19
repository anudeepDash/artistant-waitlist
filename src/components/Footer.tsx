import Link from 'next/link';
import { QrCode } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="relative bg-bg border-t border-line-soft py-12 md:py-20 px-[var(--gutter)] overflow-hidden z-10">
      
      {/* Background Orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30 dark:opacity-100">
        <div className="absolute -bottom-48 -left-48 w-96 h-96 rounded-full bg-[#F25A2B]/10 blur-[80px]"></div>
        <div className="absolute -bottom-48 -right-48 w-96 h-96 rounded-full bg-[#7C5CFF]/10 blur-[80px]"></div>
      </div>
 
      <div className="max-w-[1360px] mx-auto relative z-10">
        
        {/* Top Section */}
        <div className="flex flex-col lg:flex-row justify-between items-start gap-10 md:gap-16 mb-12 md:mb-20">
          
          {/* Brand Column */}
          <div className="flex flex-col items-start gap-1 lg:w-[45%]">
            <Link href="/" className="inline-block transition-transform duration-300 hover:scale-105 hover:opacity-90">
              <img src="/logo_wordmark_flat.png" alt="ArtisTant" className="w-[180px] md:w-[240px] h-auto object-contain object-left pointer-events-none dark:invert-0 invert" />
            </Link>
            
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 relative z-10">
              <h2 className="font-display text-lg sm:text-xl md:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-ink to-ink/60 leading-tight tracking-tight whitespace-nowrap">
                Step into The Bookability Engine™.
              </h2>
              <span className="text-[10px] font-mono uppercase tracking-widest px-4 py-1.5 rounded-full bg-black/5 dark:bg-white/5 border border-line text-ink backdrop-blur-md shadow-[0_0_20px_rgba(242,90,43,0.08)] dark:shadow-[0_0_20px_rgba(242,90,43,0.15)] transition-all duration-300 hover:bg-black/10 dark:hover:bg-white/10 hover:border-line whitespace-nowrap w-fit">
                Launching Soon
              </span>
            </div>
            
            <p className="font-mono text-[11px] font-bold tracking-[0.06em] uppercase flex items-center gap-2 mt-4">
              <span className="text-ink-3">India's Live Economy,</span>
              <span className="bg-gradient-to-r from-[#F25A2B] to-[#7C5CFF] text-transparent bg-clip-text">Rebuilt</span>
            </p>
          </div>

          {/* Links Columns */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-12 lg:w-3/5 lg:pl-12">
            
            {/* Help */}
            <div className="flex flex-col gap-6">
              <h3 className="text-ink font-semibold text-xs tracking-[0.15em] uppercase opacity-90">Help</h3>
              <div className="flex flex-col gap-4">
                <a href="mailto:hello@artistant.in" className="text-ink-2 hover:text-ink transition-colors duration-300 relative group w-fit text-[15px] cursor-pointer">
                  Contact Us
                  <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-ink transition-all duration-300 group-hover:w-full opacity-50"></span>
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div className="flex flex-col gap-6">
              <h3 className="text-ink font-semibold text-xs tracking-[0.15em] uppercase opacity-90">Quick Links</h3>
              <div className="flex flex-col gap-4">
                <Link href="/#join" className="text-ink-2 hover:text-ink transition-colors duration-300 relative group w-fit text-[15px] cursor-pointer">
                  Reserve Username
                  <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-ink transition-all duration-300 group-hover:w-full opacity-50"></span>
                </Link>
                <Link href="/#problem-voices" className="text-ink-2 hover:text-ink transition-colors duration-300 relative group w-fit text-[15px] cursor-pointer">
                  Voices
                  <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-ink transition-all duration-300 group-hover:w-full opacity-50"></span>
                </Link>
                <Link href="/#standard" className="text-ink-2 hover:text-ink transition-colors duration-300 relative group w-fit text-[15px] cursor-pointer">
                  Roadmap
                  <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-ink transition-all duration-300 group-hover:w-full opacity-50"></span>
                </Link>
                <Link href="/admin" className="text-ink-2 hover:text-ink transition-colors duration-300 relative group w-fit text-[15px] cursor-pointer flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                  Admin Portal
                  <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-ink transition-all duration-300 group-hover:w-full opacity-50"></span>
                </Link>
              </div>
            </div>

            {/* Socials */}
            <div className="flex flex-col gap-6">
              <h3 className="text-ink font-semibold text-xs tracking-[0.15em] uppercase opacity-90">Socials</h3>
              <div className="flex flex-col gap-4">
                <a href="https://instagram.com/artistant.in" target="_blank" rel="noopener noreferrer" className="text-ink-2 hover:text-ink transition-colors duration-300 flex items-center gap-2 group w-fit text-[15px] cursor-pointer">
                  Instagram
                  <svg className="w-3.5 h-3.5 opacity-50 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
                <a href="https://www.linkedin.com/company/artistantco/" target="_blank" rel="noopener noreferrer" className="text-ink-2 hover:text-ink transition-colors duration-300 flex items-center gap-2 group w-fit text-[15px] cursor-pointer">
                  LinkedIn
                  <svg className="w-3.5 h-3.5 opacity-50 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            </div>

          </div>
        </div>

        {/* Middle Section: Download App Banner (Glassmorphic Card) */}
        <div className="w-full flex flex-col md:flex-row items-center justify-between p-8 md:p-10 rounded-[2rem] bg-black/[0.02] dark:bg-white/[0.03] border border-line backdrop-blur-xl mb-16 shadow-[0_8px_32px_var(--shadow-base)] relative overflow-hidden group cursor-pointer hover:bg-black/[0.04] dark:hover:bg-white/[0.05] transition-colors duration-500">
          {/* Subtle shine effect on hover */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-ink/[0.03] dark:via-white/[0.08] to-transparent -translate-x-[100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out pointer-events-none"></div>
          
          <div className="flex flex-col gap-3 mb-8 md:mb-0 z-10 text-center md:text-left">
            <h3 className="text-ink font-display text-2xl md:text-3xl font-bold tracking-tight">Take Artistant Anywhere</h3>
            <p className="text-ink-3 text-sm md:text-base max-w-md">The complete booking engine in your pocket. Manage your creative business on the go.</p>
          </div>

          <div className="flex items-center gap-6 z-10">
            <div className="flex flex-col justify-center text-right hidden sm:flex">
              <span className="text-ink font-medium text-base leading-tight mb-1">Scan to Download</span>
              <span className="text-xs text-ink-3 leading-tight">Available on iOS & Android</span>
            </div>
            
            <div className="relative w-24 h-24 bg-black/[0.05] dark:bg-white/[0.08] rounded-2xl border border-line flex items-center justify-center overflow-hidden shrink-0 shadow-[0_4px_24px_var(--shadow-base)] backdrop-blur-2xl transition-transform duration-500 hover:scale-105 hover:bg-black/[0.08] dark:hover:bg-white/[0.12]">
              <QrCode className="w-12 h-12 text-ink/30" />
              {/* Overlay */}
              <div className="absolute inset-0 backdrop-blur-[8px] bg-black/40 dark:bg-black/60 flex items-center justify-center">
                 <span className="text-[10px] font-bold text-white uppercase tracking-[0.2em] text-center leading-tight">
                   Coming<br/>Soon
                 </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-line-soft flex flex-col md:flex-row justify-between items-center gap-6 text-[13px] text-ink-3">
          <div className="flex flex-col md:flex-row items-center gap-3 md:gap-5 text-center md:text-left">
            <span>© {new Date().getFullYear()} Artistant. All rights reserved.</span>
            <span className="hidden md:inline-block opacity-20">|</span>
            <span className="font-mono text-[10px] tracking-widest uppercase text-ink-3 flex items-center gap-2">
              The Ultimate Creative Linkup <span className="w-1.5 h-1.5 rounded-full bg-[#F25A2B] shadow-[0_0_8px_#F25A2B] animate-pulse"></span>
            </span>
          </div>
          <div className="flex gap-8 items-center font-medium">
            <Link href="/terms" className="hover:text-ink transition-colors duration-300 cursor-pointer">Terms of Service</Link>
            <Link href="/privacy" className="hover:text-ink transition-colors duration-300 cursor-pointer">Privacy Policy</Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
