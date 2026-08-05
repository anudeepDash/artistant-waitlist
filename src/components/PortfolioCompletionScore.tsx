'use client';

import React from 'react';
import { type WaitlistEntry } from '@/lib/waitlist';
import { CheckCircle2, Circle, Sparkles, ArrowRight, ShieldAlert } from 'lucide-react';

interface PortfolioCompletionScoreProps {
  reservation: WaitlistEntry;
  onActionClick: (tab: string) => void;
}

export default function PortfolioCompletionScore({ reservation, onActionClick }: PortfolioCompletionScoreProps) {
  // Items scoring
  const items = [
    {
      id: 'photo',
      title: 'Profile Avatar',
      points: 15,
      completed: Boolean(reservation.profile_photo_url),
      tip: 'Add a high-res performer avatar (+15%)',
      actionTab: 'profile',
    },
    {
      id: 'cover',
      title: 'Custom Cover Banner',
      points: 15,
      completed: Boolean(reservation.cover_photo_url),
      tip: 'Upload a stage/performance cover banner (+15%)',
      actionTab: 'cover',
    },
    {
      id: 'bio',
      title: 'Artist Bio',
      points: 15,
      completed: Boolean(reservation.bio && reservation.bio.trim().length >= 15),
      tip: 'Write a compelling performance bio (+15%)',
      actionTab: 'profile',
    },
    {
      id: 'category',
      title: 'Category & Genres',
      points: 15,
      completed: Boolean(reservation.category && reservation.genres && reservation.genres.length > 0),
      tip: 'Set your primary category & musical genres (+15%)',
      actionTab: 'profile',
    },
    {
      id: 'location',
      title: 'Location / City',
      points: 10,
      completed: Boolean(reservation.city),
      tip: 'Add your home base city for local gigs (+10%)',
      actionTab: 'profile',
    },
    {
      id: 'media',
      title: 'Showreel or Gallery',
      points: 15,
      completed: Boolean((reservation.gallery_photos && reservation.gallery_photos.length > 0)),
      tip: 'Upload a showreel video or stage photo (+15%)',
      actionTab: 'media',
    },
    {
      id: 'social',
      title: 'Spotify or Social Link',
      points: 15,
      completed: Boolean(reservation.spotify_url || reservation.youtube_url || reservation.instagram_url),
      tip: 'Link your Spotify, YouTube or Instagram (+15%)',
      actionTab: 'profile',
    },
  ];

  const totalScore = items.reduce((acc, item) => item.completed ? acc + item.points : acc, 0);
  const remainingTips = items.filter(i => !i.completed);

  return (
    <div className="p-6 sm:p-8 rounded-3xl border border-[var(--line)] bg-[var(--bg-card)] shadow-xl relative overflow-hidden">
      {/* Background Glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-20 -right-20 w-56 h-56 rounded-full bg-gradient-to-br from-[#7C5CFF]/15 to-[#F25A2B]/10 blur-3xl"
      />

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#7C5CFF]/30 bg-[#7C5CFF]/10 text-[#7C5CFF] text-[10px] font-mono font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3 h-3" />
            <span>Profile Optimization Engine</span>
          </div>
          <h3 className="font-display font-bold text-xl sm:text-2xl text-[var(--ink)]">
            Portfolio Completion Score
          </h3>
          <p className="text-xs text-[var(--ink-2)] font-light mt-1">
            Complete your profile items to boost your ranking on the public artist directory.
          </p>
        </div>

        {/* Circular / Large Score Badge */}
        <div className="flex items-center gap-3 bg-black/40 px-5 py-3 rounded-2xl border border-white/10 shrink-0">
          <div className="relative w-12 h-12 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-zinc-800"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-[#7C5CFF]"
                strokeDasharray={`${totalScore}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <span className="absolute font-mono font-extrabold text-xs text-white">
              {totalScore}%
            </span>
          </div>
          <div>
            <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest block font-semibold">
              Status
            </span>
            <span className="text-xs font-bold text-white">
              {totalScore === 100 ? '🔥 Fully Optimized' : totalScore >= 70 ? '⚡ Highly Complete' : '📝 In Progress'}
            </span>
          </div>
        </div>
      </div>

      {/* Completion Checklist Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
        {items.map((item) => (
          <div
            key={item.id}
            className={`flex items-center gap-2.5 p-3 rounded-xl border text-xs font-mono transition-all ${
              item.completed
                ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400'
                : 'bg-black/20 border-white/5 text-zinc-400'
            }`}
          >
            {item.completed ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <Circle className="w-4 h-4 text-zinc-600 shrink-0" />
            )}
            <span className="truncate">{item.title}</span>
            <span className="ml-auto font-bold opacity-75">+{item.points}%</span>
          </div>
        ))}
      </div>

      {/* Actionable Recommendations */}
      {remainingTips.length > 0 && (
        <div className="pt-4 border-t border-[var(--line-soft)]">
          <div className="flex items-center gap-2 text-xs font-bold text-[#F25A2B] font-mono uppercase tracking-wider mb-3">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Recommended Tips to Hit 100%</span>
          </div>
          <div className="space-y-2">
            {remainingTips.slice(0, 3).map((tip) => (
              <div
                key={tip.id}
                className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 hover:border-[#7C5CFF]/30 transition-all group cursor-pointer"
                onClick={() => onActionClick(tip.actionTab)}
              >
                <span className="text-xs text-zinc-300 font-light">{tip.tip}</span>
                <span className="text-[11px] font-mono font-bold text-[#7C5CFF] group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                  <span>Fix</span>
                  <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
