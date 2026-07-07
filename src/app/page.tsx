'use client';

import React from 'react';
import { motion } from 'motion/react';
import ParticleBackground from '@/components/ParticleBackground';

export default function Home() {
  return (
    <main className="relative min-h-screen bg-black text-white overflow-hidden flex items-center justify-center font-sans selection:bg-[var(--brand-1)] selection:text-black">
      {/* Dynamic Background */}
      <div className="absolute inset-0 z-0">
        <ParticleBackground />
      </div>
      
      {/* Gradient Overlays */}
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-black/20 via-black/60 to-black/90 pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[var(--brand-1)]/10 blur-[120px] pointer-events-none rounded-full" />

      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center flex flex-col items-center mt-[-10vh]">
        {/* Logo / Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="mb-8"
        >
          <div className="inline-flex items-center justify-center px-4 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-[var(--brand-1)] animate-pulse mr-2" />
            <span className="text-xs font-medium tracking-widest text-white/80 uppercase">Production Update</span>
          </div>
        </motion.div>

        {/* Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight mb-6"
        >
          <span className="block text-white">We're gearing up</span>
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[var(--brand-1)] to-[var(--brand-3)]">
            for launch.
          </span>
        </motion.h1>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="text-lg md:text-2xl text-white/60 font-light max-w-2xl mx-auto mb-12 leading-relaxed"
        >
          The Artistant waitlist is currently on hold as we prepare our infrastructure for the production release. Thank you to everyone who has secured their spot.
        </motion.p>

        {/* Decorative Element */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="flex flex-col items-center justify-center space-y-4"
        >
          <div className="w-px h-16 bg-gradient-to-b from-[var(--brand-1)]/50 to-transparent" />
          <div className="flex items-center space-x-2 text-white/40 text-sm font-light">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
            <span>Securing the future of live performance.</span>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
