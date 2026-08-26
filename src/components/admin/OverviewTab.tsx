'use client';

import { motion } from 'motion/react';
import { Users, Mail, Calendar as CalendarIcon, Activity, ChevronRight, Zap, CheckCircle2 } from 'lucide-react';
import type { AdminWaitlistEntry } from '@/lib/waitlist';
import type { BookingRequestEntry } from '@/lib/admin-actions';
import GlowingAdminCard from './GlowingAdminCard';

interface OverviewTabProps {
  registrations: AdminWaitlistEntry[];
  activityLogs: any[];
  bookingRequests: BookingRequestEntry[];
  user: any;
  isLiveMode: boolean;
  autoVerifyCount: number;
  onTabChange: (tab: string) => void;
  onRunAutoVerify: () => void;
}

export default function OverviewTab({
  registrations,
  activityLogs,
  bookingRequests,
  user,
  isLiveMode,
  autoVerifyCount,
  onTabChange,
  onRunAutoVerify,
}: OverviewTabProps) {
  const verifiedCount = registrations.filter(r => r.is_verified).length;
  const pendingRequests = bookingRequests.filter(r => r.status === 'pending').length;

  const roleCounts = {
    Founder: registrations.filter(r => r.role === 'founder').length,
    'Performing Artist': registrations.filter(r => r.role === 'artist').length,
    Venue: registrations.filter(r => r.role === 'venue').length,
    Vendor: registrations.filter(r => r.role === 'vendor').length,
    Fan: registrations.filter(r => !r.role || r.role === 'fan').length,
  };

  const total = registrations.length || 1;

  const roles = [
    { name: 'Founders', count: roleCounts.Founder, color: '#FFB800' },
    { name: 'Performing Artists', count: roleCounts['Performing Artist'], color: '#7C5CFF' },
    { name: 'Venues', count: roleCounts.Venue, color: '#F25A2B' },
    { name: 'Vendors', count: roleCounts.Vendor, color: '#00F2FE' },
    { name: 'Fans', count: roleCounts.Fan, color: '#E1306C' },
  ];

  return (
    <div className="space-y-12">
      {/* Auto-Verify Banner */}
      {autoVerifyCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-amber-500/10 border border-amber-500/30 rounded-3xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 backdrop-blur-xl"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0">
              <Zap className="w-6 h-6 text-amber-500" />
            </div>
            <div>
              <h3 className="text-amber-500 font-bold text-lg">Verification Engine Ready</h3>
              <p className="text-amber-500/70 text-sm">
                {autoVerifyCount} profiles meet the criteria for automatic verification based on social linking and complete profiles.
              </p>
            </div>
          </div>
          <button
            onClick={onRunAutoVerify}
            className="px-6 py-3 bg-amber-500 text-black font-bold rounded-xl hover:bg-amber-400 transition-colors whitespace-nowrap"
          >
            Run Engine
          </button>
        </motion.div>
      )}

      {/* KPI Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <GlowingAdminCard className="bg-bg-card border border-line-soft rounded-3xl p-6 md:p-7 backdrop-blur-xl">
          <div className="flex justify-between items-start mb-4">
            <div className="text-[10px] font-mono font-bold tracking-[0.15em] uppercase text-ink-3">Total Waitlist</div>
            <Users className="w-4 h-4 text-ink-3" />
          </div>
          <div className="text-3xl font-display font-black text-ink">{registrations.length}</div>
        </GlowingAdminCard>

        <GlowingAdminCard className="bg-bg-card border border-line-soft rounded-3xl p-6 md:p-7 backdrop-blur-xl">
          <div className="flex justify-between items-start mb-4">
            <div className="text-[10px] font-mono font-bold tracking-[0.15em] uppercase text-ink-3">Verified Profiles</div>
            <CheckCircle2 className="w-4 h-4 text-[#7C5CFF]" />
          </div>
          <div className="text-3xl font-display font-black text-ink">{verifiedCount}</div>
        </GlowingAdminCard>

        <GlowingAdminCard className="bg-bg-card border border-line-soft rounded-3xl p-6 md:p-7 backdrop-blur-xl">
          <div className="flex justify-between items-start mb-4">
            <div className="text-[10px] font-mono font-bold tracking-[0.15em] uppercase text-ink-3">Booking Inquiries</div>
            <CalendarIcon className="w-4 h-4 text-[#F25A2B]" />
          </div>
          <div className="flex items-baseline gap-2">
            <div className="text-3xl font-display font-black text-ink">{bookingRequests.length}</div>
            {pendingRequests > 0 && (
              <div className="text-xs font-bold text-[#F25A2B] bg-[#F25A2B]/10 px-2 py-0.5 rounded-full">
                {pendingRequests} pending
              </div>
            )}
          </div>
        </GlowingAdminCard>

        <GlowingAdminCard className="bg-bg-card border border-line-soft rounded-3xl p-6 md:p-7 backdrop-blur-xl">
          <div className="flex justify-between items-start mb-4">
            <div className="text-[10px] font-mono font-bold tracking-[0.15em] uppercase text-ink-3">Broadcast Reach</div>
            <Mail className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-display font-black text-ink">{registrations.length}</div>
        </GlowingAdminCard>

        <GlowingAdminCard className="bg-bg-card border border-line-soft rounded-3xl p-6 md:p-7 backdrop-blur-xl">
          <div className="flex justify-between items-start mb-4">
            <div className="text-[10px] font-mono font-bold tracking-[0.15em] uppercase text-ink-3">Traffic Activity</div>
            <Activity className="w-4 h-4 text-[#D4567A]" />
          </div>
          <div className="text-3xl font-display font-black text-ink">{activityLogs.length}</div>
        </GlowingAdminCard>
      </div>

      {/* Operations Launchpad */}
      <div>
        <h3 className="text-xs font-mono font-bold tracking-[0.15em] uppercase text-ink-3 mb-6">Operations Launchpad</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <button
            onClick={() => onTabChange('emails')}
            className="group text-left p-6 bg-bg-card border border-line-soft rounded-3xl hover:border-[#7C5CFF]/50 transition-colors backdrop-blur-xl"
          >
            <div className="w-12 h-12 rounded-xl bg-[#7C5CFF]/10 flex items-center justify-center mb-6">
              <Mail className="w-6 h-6 text-[#7C5CFF]" />
            </div>
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-ink">Broadcast Studio</h4>
              <ChevronRight className="w-4 h-4 text-ink-3 group-hover:translate-x-1 transition-transform" />
            </div>
            <p className="text-sm text-ink-3 mt-2">Design and send targeted email campaigns to waitlist segments.</p>
          </button>

          <button
            onClick={() => onTabChange('requests')}
            className="group text-left p-6 bg-bg-card border border-line-soft rounded-3xl hover:border-[#F25A2B]/50 transition-colors backdrop-blur-xl"
          >
            <div className="w-12 h-12 rounded-xl bg-[#F25A2B]/10 flex items-center justify-center mb-6">
              <CalendarIcon className="w-6 h-6 text-[#F25A2B]" />
            </div>
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-ink">Booking Requests Ops</h4>
              <ChevronRight className="w-4 h-4 text-ink-3 group-hover:translate-x-1 transition-transform" />
            </div>
            <p className="text-sm text-ink-3 mt-2">Manage inquiries, match artists, and oversee event logistics.</p>
          </button>

          <button
            onClick={() => onTabChange('registrations')}
            className="group text-left p-6 bg-bg-card border border-line-soft rounded-3xl hover:border-cyan-500/50 transition-colors backdrop-blur-xl"
          >
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center mb-6">
              <Users className="w-6 h-6 text-cyan-500" />
            </div>
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-ink">Directory & Bulk Ops</h4>
              <ChevronRight className="w-4 h-4 text-ink-3 group-hover:translate-x-1 transition-transform" />
            </div>
            <p className="text-sm text-ink-3 mt-2">Search profiles, edit details, and run bulk verifications.</p>
          </button>
        </div>
      </div>

      {/* Ecosystem Role Breakdown & Diagnostics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <GlowingAdminCard className="bg-bg-card border border-line-soft rounded-3xl p-6 md:p-8 backdrop-blur-xl h-full">
            <h3 className="text-xs font-mono font-bold tracking-[0.15em] uppercase text-ink-3 mb-8">Ecosystem Role Breakdown</h3>
            <div className="space-y-6">
              {roles.map(role => (
                <div key={role.name}>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-bold text-ink-2">{role.name}</span>
                    <span className="text-ink-3">{role.count} profiles</span>
                  </div>
                  <div className="h-2 w-full bg-bg-soft rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(role.count / total) * 100}%` }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: role.color }}
                      transition={{ duration: 1, ease: "easeOut" }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </GlowingAdminCard>
        </div>

        <div>
          <GlowingAdminCard className="bg-bg-card border border-line-soft rounded-3xl p-6 md:p-8 backdrop-blur-xl h-full">
            <h3 className="text-xs font-mono font-bold tracking-[0.15em] uppercase text-ink-3 mb-8">System Diagnostics</h3>
            <div className="space-y-6">
              <div>
                <div className="text-[10px] font-mono font-bold tracking-[0.15em] uppercase text-ink-3 mb-1">Database Mode</div>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${isLiveMode ? 'bg-[#F25A2B]' : 'bg-emerald-400'}`} />
                  <span className="font-medium text-ink">{isLiveMode ? 'Supabase Live' : 'Sandbox / Local'}</span>
                </div>
              </div>
              <div>
                <div className="text-[10px] font-mono font-bold tracking-[0.15em] uppercase text-ink-3 mb-1">Auto-Sync</div>
                <div className="font-medium text-ink">Every 10s</div>
              </div>
              <div>
                <div className="text-[10px] font-mono font-bold tracking-[0.15em] uppercase text-ink-3 mb-1">Admin Session</div>
                <div className="font-medium text-ink truncate">{user?.email || 'Authenticated'}</div>
              </div>
            </div>
          </GlowingAdminCard>
        </div>
      </div>
    </div>
  );
}
