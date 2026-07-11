'use client';

import { motion } from 'motion/react';

interface HeroSectionProps {
  onClick?: () => void;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as const },
  },
};

export default function HeroSection({ onClick }: HeroSectionProps) {
  return (
    <section
      id="hero"
      className="relative min-h-screen flex flex-col items-center justify-center pt-24 pb-16 overflow-hidden bg-black"
    >
      {/* ── Ultra-Minimalist Radial Gradient ── */}
      {/* Gives a very subtle, sophisticated depth without glowing neons */}
      <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-neutral-900/40 via-black to-black opacity-60" />
      
      <motion.div
        className="relative z-10 w-full max-w-7xl px-6 md:px-12 flex flex-col items-center text-center mt-[-5vh]"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants} className="mb-6">
          <span className="text-[10px] uppercase tracking-[0.3em] text-neutral-500 border border-neutral-800 rounded-full px-4 py-2">
            The Ultimate Creative Link-Up
          </span>
        </motion.div>

        {/* ── Main Typography ── */}
        <motion.h1
          variants={itemVariants}
          className="font-display font-medium text-[42px] sm:text-6xl md:text-7xl lg:text-8xl xl:text-[110px] tracking-tight leading-[0.95] text-white select-none mb-8 max-w-[1000px]"
        >
          Book <span className="text-neutral-500 italic font-serif">Brilliance.</span><br />
          Experience <span className="text-neutral-500 italic font-serif">More.</span>
        </motion.h1>

        {/* ── Supporting Copy ── */}
        <motion.p
          variants={itemVariants}
          className="text-neutral-400 text-base md:text-xl font-light tracking-wide max-w-2xl mx-auto mb-10 md:mb-16 leading-relaxed px-4"
        >
          Artistant seamlessly connects independent talent with event organizers.
          Discovering, evaluating, and booking an artist is now as effortless as booking a ride.
        </motion.p>

        {/* ── Elegant Waitlist CTA ── */}
        <motion.div variants={itemVariants} className="flex flex-col items-center gap-6">
          <button
            onClick={onClick}
            className="group relative px-8 py-3.5 md:px-10 md:py-4 bg-brand-orange text-white font-medium text-xs md:text-sm tracking-widest uppercase rounded-full transition-all duration-500 hover:bg-white hover:text-black hover:scale-105 active:scale-95 overflow-hidden"
          >
            <span className="relative z-10">Join the Waitlist</span>
          </button>
        </motion.div>
      </motion.div>
    </section>
  );
}
