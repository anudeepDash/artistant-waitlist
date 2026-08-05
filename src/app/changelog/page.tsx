'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { motion } from 'motion/react';
import { Sparkles, Tag, ArrowRight, ShieldCheck, Flame, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

const CHANGELOG_ENTRIES = [
  {
    version: 'v1.4.0',
    date: 'August 2026',
    title: 'Public Artist Directory & Opportunity Board Preview',
    badge: 'Latest Release',
    badgeColor: 'bg-[#F25A2B]/10 text-[#F25A2B] border-[#F25A2B]/30',
    summary: 'Introducing search & filtering across artists, cities, categories, and direct gig inquiries.',
    changes: [
      'Added public creator directory page with genre, location, and verified badge filters.',
      'Launched Gig & Opportunity Board for venue calls and brand collaborations.',
      'Released custom cover banner image uploads for performer portfolios.',
      'Added dynamic portfolio completion scoring with instant improvement tips.',
    ],
  },
  {
    version: 'v1.3.0',
    date: 'July 2026',
    title: 'Founding Card Generator & Referral Leaderboard',
    badge: 'Feature Wave',
    badgeColor: 'bg-[#7C5CFF]/10 text-[#7C5CFF] border-[#7C5CFF]/30',
    summary: 'Custom social sharing card generator and dynamic points leaderboard for early access rewards.',
    changes: [
      'Released dynamic Founding Card Instagram story generator.',
      'Top referrers leaderboard with rank history tracking and cohort tiering.',
      'Verified referral email notification pipeline.',
      'Mobile floating dock and bottom claim bar improvements.',
    ],
  },
  {
    version: 'v1.2.0',
    date: 'June 2026',
    title: 'Media Showreels & Spotify Integration',
    badge: 'Media Update',
    badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    summary: 'High-performance audio previews and video showreels directly on performer booking pages.',
    changes: [
      'Embedded Spotify artist player preview with custom theme integration.',
      'Support for uploading HD performance showreel videos.',
      'Drag-and-drop portfolio section reordering.',
      'Direct booking inquiry form with instant email alerts.',
    ],
  },
  {
    version: 'v1.0.0',
    date: 'May 2026',
    title: 'ArtisTant Network Beta Launch',
    badge: 'Major Milestone',
    badgeColor: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
    summary: 'Official launch of India\'s first live performance booking infrastructure waitlist.',
    changes: [
      'Custom @username handle reservation routing (artistant.in/username).',
      '3D scatter scroll hero and bento product roadmap.',
      'Firebase Auth & Supabase infrastructure integration.',
      'Verified artist badge pipeline and admin management suite.',
    ],
  },
];

export default function ChangelogPage() {
  return (
    <main className="min-h-screen bg-[var(--bg)] text-[var(--ink)] flex flex-col font-sans">
      <Navbar />

      {/* Header Banner */}
      <section className="relative pt-32 pb-16 px-4 sm:px-6 md:px-12 border-b border-[var(--line-soft)] overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-40 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#7C5CFF]/20 via-transparent to-transparent"
        />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#7C5CFF]/30 bg-[#7C5CFF]/10 text-[#7C5CFF] text-xs font-mono font-semibold uppercase tracking-wider mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Changelog & Release Notes</span>
          </div>

          <h1 className="font-display font-black text-4xl sm:text-6xl text-[var(--ink)] tracking-tight leading-tight mb-4">
            What&apos;s New in <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F25A2B] via-[#D4567A] to-[#7C5CFF]">ArtisTant</span>
          </h1>

          <p className="text-[var(--ink-2)] text-base sm:text-xl max-w-2xl mx-auto font-light leading-relaxed">
            Follow our journey as we build India&apos;s live performance booking infrastructure.
          </p>
        </div>
      </section>

      {/* Changelog Timeline Section */}
      <section className="py-16 px-4 sm:px-6 md:px-12 max-w-4xl mx-auto w-full flex-1">
        <div className="space-y-12 relative before:absolute before:inset-0 before:left-3 sm:before:left-8 before:w-0.5 before:bg-[var(--line-soft)]">
          {CHANGELOG_ENTRIES.map((entry, idx) => (
            <motion.div
              key={entry.version}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
              className="relative pl-10 sm:pl-20"
            >
              {/* Timeline Dot */}
              <div className="absolute left-1.5 sm:left-6 top-1.5 w-4 h-4 rounded-full bg-[#F25A2B] border-4 border-[var(--bg)] shadow-md" />

              {/* Card Content */}
              <div className="p-6 sm:p-8 rounded-3xl border border-[var(--line)] bg-[var(--bg-card)] shadow-xl space-y-4">
                {/* Meta Header */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-lg text-[var(--ink)]">
                      {entry.version}
                    </span>
                    <span className={`text-xs font-mono font-semibold px-2.5 py-1 rounded-full border ${entry.badgeColor}`}>
                      {entry.badge}
                    </span>
                  </div>
                  <span className="text-xs font-mono text-zinc-400">
                    {entry.date}
                  </span>
                </div>

                {/* Title & Summary */}
                <h3 className="font-display font-bold text-xl sm:text-2xl text-[var(--ink)]">
                  {entry.title}
                </h3>
                <p className="text-sm text-[var(--ink-2)] font-light leading-relaxed">
                  {entry.summary}
                </p>

                {/* Detailed Changes List */}
                <div className="pt-4 border-t border-[var(--line-soft)] space-y-2">
                  {entry.changes.map((change, cIdx) => (
                    <div key={cIdx} className="flex items-start gap-2.5 text-xs text-[var(--ink-2)] font-mono">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{change}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <Footer />
    </main>
  );
}
