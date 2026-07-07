'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const SEQUENCE_DATA = [
  {
    id: 'link',
    title: 'Your Custom @username Link',
    desc: 'A clean, premium public bio linking videos, audio tracks, and technical specifications.',
    image: '/mockups/screen_12.jpg',
    position: 'top',
    scale: 1,
    yOffset: 0
  },
  {
    id: 'rates',
    title: 'Transparent Standard Rates',
    desc: 'Live performance calendar showing set prices upfront to cut negotiations.',
    image: '/mockups/screen_43.jpg',
    position: 'top',
    scale: 1,
    yOffset: 0
  },
  {
    id: 'booking',
    title: 'Direct 1-on-1 Booking',
    desc: 'No agents, no markup filters. Clients book you directly with 100% earnings.',
    image: '/mockups/screen_15.jpg',
    position: 'top',
    scale: 1,
    yOffset: 0
  },
  {
    id: 'escrow',
    title: 'Gigsafe Escrow Protection',
    desc: 'Funds are secured in Gigsafe escrow before show starts, auto-releasing post-performance.',
    image: '/mockups/screen_17.jpg',
    position: 'top',
    scale: 1,
    yOffset: 0
  }
];

export default function UIMockupSequence() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((current) => (current + 1) % SEQUENCE_DATA.length);
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div 
      className="comparison-card artistant relative flex flex-col !p-0 overflow-hidden border border-white/10 shadow-2xl"
      style={{
        background: '#0A0A0A',
        color: '#FFFFFF'
      }}
    >
      {/* Subtle Background Glow */}
      <div className="absolute inset-0 bg-gradient-to-tr from-[#7C5CFF]/10 to-[#F25A2B]/5 opacity-50 pointer-events-none" />

      {/* TOP HEADER: The Artistant Way */}
      <div className="absolute top-0 left-0 w-full p-8 md:p-10 z-30">
        <div className="flex items-center gap-3 md:gap-4">
          <span className="font-display text-2xl md:text-[32px] tracking-wide uppercase text-white font-bold leading-none">THE</span>
          <span className="font-display text-3xl md:text-[40px] tracking-tight font-black text-transparent bg-clip-text bg-gradient-to-r from-[#F25A2B] via-[#D4567A] to-[#7C5CFF] leading-none -mt-1">
            ArtisTant
          </span>
          <span className="font-display text-2xl md:text-[32px] tracking-wide uppercase text-white font-bold leading-none">WAY</span>
        </div>
      </div>

      {/* MAIN MOCKUP AREA */}
      <div className="flex-1 w-full min-h-[400px] md:min-h-[480px] relative">
        {/* Animated Phone Mockup */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeIndex}
            initial={{ opacity: 0, scale: 0.95, x: "-50%", y: "-35%" }}
            animate={{ opacity: 1, scale: 1, x: "-50%", y: "-40%" }}
            exit={{ opacity: 0, scale: 1.05, x: "-50%", y: "-40%" }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            className="absolute top-1/2 left-1/2 w-[45%] max-w-[180px] aspect-[9/19] rounded-[1.5rem] border-[4px] border-[#161616] shadow-2xl overflow-hidden bg-[#0A0A0A] z-10"
          >
            {/* Top Notch */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-3 bg-[#161616] rounded-b-lg z-20" />
            
            {/* Real Mockup Image */}
            <img
              src={SEQUENCE_DATA[activeIndex].image}
              alt={SEQUENCE_DATA[activeIndex].title}
              className="w-full h-full object-cover"
              style={{ 
                objectPosition: SEQUENCE_DATA[activeIndex].position || 'top',
                transform: `scale(${SEQUENCE_DATA[activeIndex].scale || 1}) translateY(${SEQUENCE_DATA[activeIndex].yOffset || 0}%)`
              }}
            />
          </motion.div>
        </AnimatePresence>

        {/* BOTTOM GRADIENT: Black to Transparent */}
        <div className="absolute inset-x-0 bottom-0 h-[45%] bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/90 to-transparent flex flex-col justify-end p-6 md:p-8 pointer-events-none z-20">
          
          <div className="pointer-events-auto w-full relative z-30">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4 }}
              >
                <h4 className="font-display font-bold text-lg md:text-xl text-white mb-2">
                  {SEQUENCE_DATA[activeIndex].title}
                </h4>
                <p className="text-xs md:text-sm text-gray-400 leading-relaxed font-light">
                  {SEQUENCE_DATA[activeIndex].desc}
                </p>
              </motion.div>
            </AnimatePresence>

            {/* Progress Indicators */}
            <div className="flex items-center gap-2 mt-4">
              {SEQUENCE_DATA.map((item, idx) => {
                const isActive = idx === activeIndex;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveIndex(idx)}
                    className={`h-1 transition-all duration-500 rounded-full ${
                      isActive 
                        ? 'w-8 bg-gradient-to-r from-[#F25A2B] via-[#D4567A] to-[#7C5CFF]' 
                        : 'w-2 bg-white/20 hover:bg-white/40'
                    }`}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
