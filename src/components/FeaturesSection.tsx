'use client';

import { motion, useScroll, useTransform } from 'motion/react';
import { useRef } from 'react';

const FEATURES = [
  {
    title: 'Core Client-Artist Matching',
    description: 'The Client-Artist Engine: The primary booking hub where clients and artists connect, negotiate, and finalize contracts with transparent terms and real-time availability.',
  },
  {
    title: 'ArtisTant Escrow & Protection',
    description: 'Client funds are securely escrowed upon booking and released post-performance. Guaranteed payment for artists, guaranteed performances for clients.',
  },
  {
    title: 'ArtisTant Concierge',
    description: 'Powered by Newbi (NB). Premium curation managing complex bookings, vendor coordination, dispute resolutions, and white-glove event management.',
  },
  {
    title: 'ArtisTant Exclusives',
    description: 'Artists entirely managed by the ArtisTant ecosystem. We handle their full booking calendar, tour logistics, brand deals, and concierge services.',
  },
  {
    title: 'Vendor & Venue Ecosystem',
    description: 'Connect directly with venues, stage builders, lighting technicians, and sound engineers to orchestrate your entire event from one platform.',
  },
  {
    title: 'Artist Backstage Hub',
    description: 'A private network for artists to hire session musicians, borrow gear, or collaborate on creative projects seamlessly.',
  },
  {
    title: 'Audience Favorites',
    description: 'Data-driven rankings ensuring event organizers book the most highly-rated, trending performers in their specific demographic.',
  },
  {
    title: 'Discover Setlist Songs',
    description: 'Preview an artist\'s exact repertoire before booking, ensuring their musical direction aligns perfectly with your event\'s vibe.',
  },
  {
    title: 'Review Your Live Artist',
    description: 'A verified, closed-loop rating system. Only actual clients can review artists, ensuring absolute trust and platform integrity.',
  },
  {
    title: 'Make Live Requests',
    description: 'During the event, attendees can safely interact and make live song or shoutout requests directly to the artist via the ArtisTant interface.',
  },
];

export default function FeaturesSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Create a beautiful scrolling fade effect
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start']
  });

  return (
    <section id="features" className="relative py-32 px-6 md:px-12 bg-black min-h-[150vh]" ref={containerRef}>
      
      {/* Sticky Header */}
      <div className="sticky top-32 z-10 mb-32 mix-blend-difference">
        <h2 className="text-4xl md:text-6xl font-display font-medium text-white tracking-tight">
          The Ecosystem.
        </h2>
        <p className="text-neutral-500 mt-4 text-lg max-w-md">
          A comprehensive suite of tools designed to elevate the live performance industry into a seamless, high-end experience.
        </p>
      </div>

      {/* Feature List Container */}
      <div className="relative z-20 max-w-6xl mx-auto flex flex-col gap-24 mt-48 pb-32">
        {FEATURES.map((feature, index) => {
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-20%' }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="group flex flex-col md:flex-row gap-8 md:gap-16 border-t border-white/10 pt-12 hover:border-white/30 transition-colors duration-500"
            >
              <div className="md:w-1/3">
                <span className="text-neutral-600 font-mono text-sm mb-4 block">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <h3 className="text-2xl md:text-4xl font-display font-medium text-white tracking-tight group-hover:text-brand-orange transition-colors duration-500">
                  {feature.title}
                </h3>
              </div>
              <div className="md:w-2/3 flex items-center">
                <p className="text-neutral-400 text-lg md:text-xl font-light leading-relaxed max-w-2xl">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
