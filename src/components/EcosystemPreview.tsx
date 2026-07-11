'use client';

import { useRef } from 'react';
import { motion, useInView } from 'motion/react';

/* ──────────────────────────────────────────────
   EcosystemPreview — Bento-grid feature showcase
   Scroll-animated section presenting core ArtisTant
   features in a visually rich, asymmetric grid.
   ────────────────────────────────────────────── */

/* ── Reusable animation variants ─────────────── */

/** Fade-up variant for individual cards */
const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  }),
} as const;

/** Stats counter fade-in */
const statVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: (i: number) => ({
    opacity: 1,
    scale: 1,
    transition: {
      delay: i * 0.15,
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  }),
} as const;

/* ── Icon circle helper ──────────────────────── */

/** Renders an emoji inside a gradient-tinted circle */
function IconCircle({
  emoji,
  color,
  size = 'md',
}: {
  emoji: string;
  /** Tailwind bg class for the tinted circle */
  color: string;
  size?: 'sm' | 'md' | 'lg';
}) {
  const sizeClasses = {
    sm: 'w-10 h-10 text-lg',
    md: 'w-12 h-12 text-xl',
    lg: 'w-16 h-16 text-3xl',
  };

  return (
    <span
      className={`inline-flex items-center justify-center rounded-full ${color} ${sizeClasses[size]}`}
      aria-hidden="true"
    >
      {emoji}
    </span>
  );
}

/* ── Bookability Score bar component ─────────── */

function ScoreBar({ label, percent }: { label: string; percent: number }) {
  return (
    <div className="flex items-center gap-3 text-xs sm:text-sm">
      <span className="w-24 sm:w-40 shrink-0 text-text-secondary truncate">{label}</span>
      <div className="relative h-2 flex-1 rounded-full bg-bg-tertiary overflow-hidden">
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-accent-gold to-brand-orange"
          initial={{ width: 0 }}
          whileInView={{ width: `${percent}%` }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.3 }}
        />
      </div>
      <span className="w-10 text-right text-accent-gold font-semibold">
        {percent}%
      </span>
    </div>
  );
}

/* ── Escrow flow step pill ───────────────────── */

function FlowStep({ label, isLast }: { label: string; isLast?: boolean }) {
  return (
    <>
      <span className="rounded-full bg-bg-tertiary border border-glass-border px-3 py-1.5 text-xs md:text-sm text-text-primary font-medium whitespace-nowrap">
        {label}
      </span>
      {!isLast && (
        <span className="text-brand-orange text-lg" aria-hidden="true">
          →
        </span>
      )}
    </>
  );
}

/* ── Coming Soon mini card ───────────────────── */

function ComingSoonCard({ emoji, title }: { emoji: string; title: string }) {
  return (
    <div className="glass-card p-4 opacity-60 hover:opacity-80 transition-opacity duration-300 flex flex-col items-center gap-2 min-w-[140px] shrink-0">
      <span className="text-2xl" aria-hidden="true">
        {emoji}
      </span>
      <span className="text-text-secondary text-sm font-medium text-center">
        {title}
      </span>
      <span className="rounded-full bg-brand-purple/15 text-brand-purple px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider">
        Coming Soon
      </span>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   Main Component
   ═══════════════════════════════════════════════ */

export default function EcosystemPreview() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });

  return (
    <section
      id="features"
      ref={sectionRef}
      className="relative py-24 md:py-32 px-6 overflow-hidden"
    >
      {/* ── Background decorative orbs ── */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="orb orb-purple animate-float-slow w-[500px] h-[500px] -top-40 -right-40 opacity-40" />
        <div className="orb orb-orange animate-float w-[400px] h-[400px] bottom-20 -left-32 opacity-30" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl">
        {/* ════════════════════════════════════════
           Section Header
           ════════════════════════════════════════ */}
        <motion.div
          className="mb-16 md:mb-20 text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] as const }}
        >
          <p className="text-brand-orange text-xs font-semibold uppercase tracking-widest mb-4">
            The Ecosystem
          </p>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-text-primary mb-6">
            Built for both sides of the booking.
          </h2>
          <p className="text-text-secondary text-lg max-w-2xl mx-auto">
            Everything artists and clients need, from discovery to payout.
          </p>
        </motion.div>

        {/* ════════════════════════════════════════
           Bento Grid — Core Features
           4-col desktop, 2-col tablet, 1-col mobile
           ════════════════════════════════════════ */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {/* ── Card A: Client-Artist Engine (large, 2×2) ── */}
          <motion.div
            className="bento-card p-6 md:p-8 md:col-span-2 lg:col-span-2 lg:row-span-2 flex flex-col justify-between"
            custom={0}
            variants={cardVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
          >
            <div>
              <IconCircle emoji="🤝" color="bg-gradient-to-br from-brand-orange/20 to-brand-coral/20" size="lg" />

              <h3 className="text-xl md:text-2xl font-display font-bold text-text-primary mt-5 mb-3">
                The Client-Artist Engine
              </h3>

              <p className="text-text-secondary leading-relaxed mb-6">
                The primary booking hub where clients and artists connect,
                negotiate, and finalize contracts with transparent terms and
                real-time availability.
              </p>

              {/* Sub-features */}
              <ul className="space-y-2 mb-6">
                {[
                  'Search artists by date, genre, budget',
                  'Live calendar — real-time availability',
                  'Transparent pricing & terms',
                ].map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-2 text-text-secondary text-sm"
                  >
                    <span className="text-brand-orange mt-0.5 shrink-0">→</span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            {/* Audience badges */}
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider text-accent-green bg-accent-green/10">
                For Clients
              </span>
              <span className="rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brand-orange bg-brand-orange/10">
                For Artists
              </span>
            </div>
          </motion.div>

          {/* ── Card B: Escrow & Protection (wide) ── */}
          <motion.div
            className="bento-card p-6 md:p-8 md:col-span-2 lg:col-span-2"
            custom={1}
            variants={cardVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
          >
            <IconCircle emoji="🛡️" color="bg-accent-green/15" />

            <h3 className="text-xl md:text-2xl font-display font-bold text-text-primary mt-5 mb-3">
              ArtisTant Escrow &amp; Protection
            </h3>

            <p className="text-text-secondary leading-relaxed mb-6">
              Client funds secured in escrow upon booking. Released only after
              performance. Artists guaranteed payment, clients guaranteed the
              show.
            </p>

            {/* Mini flow diagram */}
            <div className="flex flex-wrap items-center gap-2 md:gap-3">
              <FlowStep label="Book" />
              <FlowStep label="Funds Locked" />
              <FlowStep label="Perform" />
              <FlowStep label="Payment Released" isLast />
            </div>
          </motion.div>

          {/* ── Card C: Concierge · Newbi (wide) ── */}
          <motion.div
            className="bento-card p-6 md:p-8 md:col-span-2 lg:col-span-2"
            custom={2}
            variants={cardVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
          >
            <IconCircle emoji="🎩" color="bg-brand-purple/15" />

            <h3 className="text-xl md:text-2xl font-display font-bold text-text-primary mt-5 mb-2">
              ArtisTant Concierge
            </h3>
            <p className="text-text-muted text-sm mb-3">
              Powered by Newbi (NB)
            </p>

            <p className="text-text-secondary leading-relaxed">
              Premium support and curation. Complex bookings, vendor
              coordination, dispute resolution, and white-glove event
              management.
            </p>
          </motion.div>

          {/* ── Card D: Bookability Score™ (wide) ── */}
          <motion.div
            className="bento-card p-6 md:p-8 md:col-span-2 lg:col-span-2"
            custom={3}
            variants={cardVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
          >
            <IconCircle emoji="📊" color="bg-accent-gold/15" />

            <h3 className="text-xl md:text-2xl font-display font-bold text-text-primary mt-5 mb-3">
              The{' '}
              <span className="text-accent-gold">Bookability Score™</span>
            </h3>

            <p className="text-text-secondary leading-relaxed mb-5">
              A credit score for artists. We rate reliability, not just talent.
            </p>

            {/* Score metrics as horizontal bars */}
            <div className="space-y-3 mb-4">
              <ScoreBar label="Show-up reliability" percent={35} />
              <ScoreBar label="Repeat-book rate" percent={25} />
              <ScoreBar label="Dispute / cancel rate" percent={20} />
              <ScoreBar label="Response speed" percent={20} />
            </div>

            <p className="text-brand-orange text-sm font-medium">
              → Every booking on us makes the score smarter.
            </p>
          </motion.div>

          {/* ── Card E: Artist Backstage Hub (wide) ── */}
          <motion.div
            className="bento-card p-6 md:p-8 md:col-span-2 lg:col-span-2"
            custom={4}
            variants={cardVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
          >
            <IconCircle emoji="🎸" color="bg-brand-coral/15" />

            <h3 className="text-xl md:text-2xl font-display font-bold text-text-primary mt-5 mb-3">
              Artist Backstage Hub
            </h3>

            <p className="text-text-secondary leading-relaxed mb-5">
              Your dedicated management suite. Coordinate sets, handle live
              logistics, manage EPK, riders, and client operations — all in one
              place.
            </p>

            {/* Sub-feature pills */}
            <div className="flex flex-wrap gap-2">
              {['Free EPK', 'Sample sets & calendar', 'One-tap rider requirements'].map(
                (item) => (
                  <span
                    key={item}
                    className="rounded-full bg-bg-tertiary border border-glass-border px-3 py-1.5 text-xs md:text-sm text-text-secondary"
                  >
                    {item}
                  </span>
                ),
              )}
            </div>
          </motion.div>
        </div>

        {/* ════════════════════════════════════════
           Stats Banner
           ════════════════════════════════════════ */}
        <motion.div
          className="glass-card mt-12 md:mt-16 py-6 px-4 md:px-8 flex flex-col md:flex-row items-center justify-around gap-8 md:gap-4"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] as const }}
        >
          {[
            {
              value: '10%',
              label: 'platform fee · split 60/40 client/artist',
            },
            {
              value: 'T+2hrs',
              label: 'artist payout after show-end confirmation',
            },
            {
              value: '₹0',
              label: 'to list, build a profile, or take a booking',
            },
          ].map((stat, i) => (
            <motion.div
              key={stat.value}
              className="text-center"
              custom={i}
              variants={statVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <p className="text-3xl md:text-4xl font-display font-bold text-brand-orange mb-1">
                {stat.value}
              </p>
              <p className="text-text-secondary text-sm max-w-[220px] mx-auto">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* ════════════════════════════════════════
           Coming Soon Section
           Later-phase features, shown at reduced opacity.
           ════════════════════════════════════════ */}
        <motion.div
          className="mt-16 md:mt-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <p className="text-text-muted text-sm font-semibold uppercase tracking-widest mb-6 text-center">
            Coming Soon
          </p>

          {/* Horizontal scroll on mobile, flex-wrap on larger screens */}
          <div className="flex gap-4 overflow-x-auto overflow-y-hidden pb-4 md:flex-wrap md:justify-center md:overflow-visible scrollbar-hide">
            {[
              { emoji: '⭐', title: 'Audience Favorites' },
              { emoji: '🎵', title: 'Discover Setlist Songs' },
              { emoji: '📝', title: 'Review Your Live Artist' },
              { emoji: '🎤', title: 'Make Live Requests' },
              { emoji: '🏟️', title: 'Vendor & Venue Ecosystem' },
            ].map((item) => (
              <ComingSoonCard
                key={item.title}
                emoji={item.emoji}
                title={item.title}
              />
            ))}
          </div>
        </motion.div>

        {/* Bottom divider */}
        <div className="section-divider mt-20 md:mt-24" />
      </div>
    </section>
  );
}
