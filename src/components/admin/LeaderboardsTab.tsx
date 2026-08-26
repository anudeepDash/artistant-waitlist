'use client';

import { motion } from 'motion/react';
import { Trophy, Users } from 'lucide-react';
import type { AdminWaitlistEntry } from '@/lib/waitlist';
import GlowingAdminCard from './GlowingAdminCard';

interface LeaderboardsTabProps {
  leaderboards: Array<AdminWaitlistEntry & { refs: number; points: number }>;
}

export default function LeaderboardsTab({ leaderboards }: LeaderboardsTabProps) {
  const pointsRanked = [...leaderboards].sort((a, b) => b.points - a.points);
  const refsRanked = [...leaderboards].sort((a, b) => b.refs - a.refs);

  const getRankStyle = (index: number) => {
    switch(index) {
      case 0: return 'text-[#FFB800] bg-[#FFB800]/10 border-[#FFB800]/30'; // Gold
      case 1: return 'text-zinc-300 bg-zinc-300/10 border-zinc-300/30';     // Silver
      case 2: return 'text-[#b45309] bg-[#b45309]/10 border-[#b45309]/30';   // Bronze
      default: return 'text-ink-3 bg-bg-soft border-transparent';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Points Ranking */}
      <GlowingAdminCard className="h-[600px] bg-bg-card border border-line-soft rounded-3xl overflow-hidden flex flex-col backdrop-blur-md">
        <div className="p-6 border-b border-line-soft shrink-0">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-10 h-10 rounded-xl bg-[#F25A2B]/10 flex items-center justify-center">
              <Trophy className="w-5 h-5 text-[#F25A2B]" />
            </div>
            <div>
              <h2 className="font-display font-bold text-xl text-ink">Points Ranking</h2>
              <div className="text-xs font-medium text-[#F25A2B]">Base 100 + 50 per referral</div>
            </div>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-2">
          <div className="space-y-1">
            {pointsRanked.map((user, i) => (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-4 p-3 rounded-2xl hover:bg-bg-soft transition-colors"
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border ${getRankStyle(i)} shrink-0`}>
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-ink truncate">{user.display_name || user.email?.split('@')[0]}</div>
                  <div className="text-xs text-ink-3 truncate">@{user.username || 'anonymous'}</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-mono font-bold text-ink">{user.points}</div>
                  <div className="text-[10px] text-ink-3 uppercase tracking-wider">PTS</div>
                </div>
              </motion.div>
            ))}
            {pointsRanked.length === 0 && (
              <div className="p-8 text-center text-ink-3">No data available</div>
            )}
          </div>
        </div>
      </GlowingAdminCard>

      {/* Network Builders */}
      <GlowingAdminCard className="h-[600px] bg-bg-card border border-line-soft rounded-3xl overflow-hidden flex flex-col backdrop-blur-md">
        <div className="p-6 border-b border-line-soft shrink-0">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-10 h-10 rounded-xl bg-[#7C5CFF]/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-[#7C5CFF]" />
            </div>
            <div>
              <h2 className="font-display font-bold text-xl text-ink">Network Builders</h2>
              <div className="text-xs font-medium text-[#7C5CFF]">Ranked by total referrals</div>
            </div>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-2">
          <div className="space-y-1">
            {refsRanked.map((user, i) => (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-4 p-3 rounded-2xl hover:bg-bg-soft transition-colors"
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border ${getRankStyle(i)} shrink-0`}>
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-ink truncate">{user.display_name || user.email?.split('@')[0]}</div>
                  <div className="text-xs text-ink-3 truncate">@{user.username || 'anonymous'}</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-mono font-bold text-[#7C5CFF]">{user.refs}</div>
                  <div className="text-[10px] text-[#7C5CFF]/70 uppercase tracking-wider">REFS</div>
                </div>
              </motion.div>
            ))}
            {refsRanked.length === 0 && (
              <div className="p-8 text-center text-ink-3">No data available</div>
            )}
          </div>
        </div>
      </GlowingAdminCard>
    </div>
  );
}
