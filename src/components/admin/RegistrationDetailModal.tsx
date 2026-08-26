'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import type { AdminWaitlistEntry } from '@/lib/waitlist';
import {
  XCircle,
  CheckCircle2,
  Award,
  UserMinus,
  Mail,
  Smartphone,
  MapPin,
  ExternalLink,
} from 'lucide-react';

interface RegistrationDetailModalProps {
  selectedReg: AdminWaitlistEntry | null;
  onClose: () => void;
  onVerify: (reg: AdminWaitlistEntry) => void;
  onBlock: (reg: AdminWaitlistEntry) => void;
  onToggleFoundingCard: (reg: AdminWaitlistEntry) => void;
  onToggleExclude: (reg: AdminWaitlistEntry) => void;
  onSavePositionOverride: (reg: AdminWaitlistEntry, val: number | null) => void;
  onRoleChange: (userId: string, newRole: string) => void;
}

export default function RegistrationDetailModal({
  selectedReg,
  onClose,
  onVerify,
  onBlock,
  onToggleFoundingCard,
  onToggleExclude,
  onSavePositionOverride,
  onRoleChange,
}: RegistrationDetailModalProps) {
  const [posOverrideInput, setPosOverrideInput] = useState<string>('');

  useEffect(() => {
    if (selectedReg) {
      setPosOverrideInput(
        selectedReg.position_override !== null && selectedReg.position_override !== undefined
          ? String(selectedReg.position_override)
          : ''
      );
    }
  }, [selectedReg]);

  if (!selectedReg) return null;

  const handleOverrideSave = () => {
    const raw = posOverrideInput.trim();
    const val = raw === '' ? null : parseInt(raw, 10);
    const parsedVal = isNaN(val as number) ? null : val;
    onSavePositionOverride(selectedReg, parsedVal);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-md cursor-pointer z-[100]"
          onClick={onClose}
        />

        {/* Modal Dialog Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: 'spring', stiffness: 350, damping: 28 }}
          className="relative w-full max-w-2xl max-h-[90vh] bg-bg-card border border-line-soft rounded-[2.5rem] shadow-2xl flex flex-col z-[110] overflow-hidden backdrop-blur-2xl text-left my-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal Top Bar */}
          <div className="px-7 pt-6 pb-2 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-brand animate-pulse" />
              <span className="text-[10px] font-mono font-bold uppercase tracking-[0.14em] text-ink-3">
                Waitlist Node Detail
              </span>
            </div>

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-2xl flex items-center justify-center bg-bg-soft border border-line-soft text-ink-3 hover:text-ink hover:bg-bg-soft-hover transition-all cursor-pointer active:scale-95"
              title="Close"
            >
              <XCircle className="w-4.5 h-4.5" />
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="p-7 pt-2 space-y-6 overflow-y-auto flex-1 custom-scrollbar">
            {/* HERO PROFILE SECTION */}
            <div className="bg-bg-soft/30 border border-line-soft rounded-[2rem] p-6 space-y-5">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
                {/* Big DP Avatar */}
                <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-3xl overflow-hidden bg-bg-soft border-2 border-line-soft shadow-xl shrink-0 group">
                  {selectedReg.profile_photo_url ? (
                    <img
                      src={selectedReg.profile_photo_url}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#F25A2B] to-[#7C5CFF] text-white font-display font-black text-3xl shadow-inner">
                      {(selectedReg.display_name || selectedReg.username || 'U')[0].toUpperCase()}
                    </div>
                  )}
                </div>

                {/* Profile Info */}
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                    <h2 className="text-2xl sm:text-3xl font-display font-black text-ink uppercase tracking-tight leading-none flex items-center gap-2">
                      <span>{selectedReg.display_name || selectedReg.username}</span>
                      {selectedReg.is_verified && (
                        <CheckCircle2 className="w-6 h-6 text-[#7C5CFF] shrink-0" />
                      )}
                    </h2>
                  </div>

                  <p className="text-sm font-mono text-brand font-semibold">
                    @{selectedReg.username}
                  </p>

                  {/* Status Badges */}
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                    <span
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-mono font-bold tracking-[0.08em]"
                      style={
                        selectedReg.is_verified
                          ? { background: 'linear-gradient(135deg, #F25A2B, #7C5CFF)', color: 'white' }
                          : { background: 'var(--bg-soft)', color: 'var(--ink-3)', border: '1px solid var(--line-soft)' }
                      }
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      {selectedReg.is_verified ? 'VERIFIED' : 'PENDING'}
                    </span>

                    {selectedReg.feature_founding_card && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-mono font-bold tracking-[0.08em] bg-[#7C5CFF]/10 text-[#7C5CFF] border border-[#7C5CFF]/20">
                        <Award className="w-3 h-3" />
                        FOUNDING CARD
                      </span>
                    )}

                    {selectedReg.exclude_from_waitlist && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-mono font-bold tracking-[0.08em] bg-amber-500/10 text-amber-500 border border-amber-500/20">
                        <UserMinus className="w-3 h-3" />
                        EXCLUDED FROM RANK
                      </span>
                    )}

                    {selectedReg.is_blocked && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-mono font-bold tracking-[0.08em] bg-hot/10 text-hot border border-hot/20">
                        <XCircle className="w-3 h-3" />
                        SUSPENDED
                      </span>
                    )}

                    {selectedReg.role && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-mono font-bold uppercase tracking-[0.08em] bg-bg-soft border border-line-soft text-ink-2">
                        {selectedReg.role}
                      </span>
                    )}
                  </div>

                  {/* View Live Link */}
                  <div className="pt-2 flex justify-center sm:justify-start">
                    <a
                      href={`/${selectedReg.username}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 rounded-2xl text-xs font-mono font-bold uppercase flex items-center gap-2 bg-bg-soft border border-line-soft hover:bg-bg-soft-hover text-ink transition-all cursor-pointer shadow-sm active:scale-95"
                    >
                      <ExternalLink className="w-4 h-4 text-brand" />
                      <span>View Live Profile</span>
                    </a>
                  </div>
                </div>
              </div>

              {/* Bio Card */}
              {selectedReg.bio && (
                <div className="bg-bg-card/70 border border-line-soft rounded-2xl p-4 text-xs text-ink-2 leading-relaxed">
                  <span className="text-[9px] font-mono font-bold text-ink-3 uppercase tracking-widest block mb-1">
                    Biography
                  </span>
                  {selectedReg.bio}
                </div>
              )}
            </div>

            {/* Quick Management Controls */}
            <div className="bg-bg-soft/20 border border-line-soft rounded-[1.75rem] p-5 space-y-3">
              <p className="text-[10px] font-mono font-bold uppercase tracking-[0.12em] text-ink-3">
                Quick Management Controls
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <button
                  onClick={() => onVerify(selectedReg)}
                  className="py-3 px-3 rounded-2xl text-[10px] font-mono font-bold tracking-[0.06em] uppercase flex items-center justify-center gap-1.5 transition-all duration-200 cursor-pointer active:scale-95"
                  style={
                    selectedReg.is_verified
                      ? { background: 'var(--bg-soft)', color: 'var(--brand-3)', border: '1px solid rgba(124,92,255,0.3)' }
                      : { background: 'linear-gradient(135deg, #F25A2B, #7C5CFF)', color: 'white', border: 'none', boxShadow: '0 4px 14px -3px rgba(242,90,43,0.4)' }
                  }
                >
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>{selectedReg.is_verified ? 'Unverify' : 'Verify'}</span>
                </button>

                <button
                  onClick={() => onBlock(selectedReg)}
                  className="py-3 px-3 rounded-2xl text-[10px] font-mono font-bold tracking-[0.06em] uppercase flex items-center justify-center gap-1.5 transition-all duration-200 cursor-pointer active:scale-95"
                  style={
                    selectedReg.is_blocked
                      ? { background: 'rgba(255,75,75,0.12)', color: 'var(--hot)', border: '1px solid rgba(255,75,75,0.3)' }
                      : { background: 'var(--bg-soft)', color: 'var(--ink-3)', border: '1px solid var(--line-soft)' }
                  }
                >
                  <XCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{selectedReg.is_blocked ? 'Restore' : 'Suspend'}</span>
                </button>

                <button
                  onClick={() => onToggleFoundingCard(selectedReg)}
                  className="py-3 px-3 rounded-2xl text-[10px] font-mono font-bold tracking-[0.06em] uppercase flex items-center justify-center gap-1.5 transition-all duration-200 cursor-pointer active:scale-95"
                  style={
                    selectedReg.feature_founding_card
                      ? { background: 'rgba(124,92,255,0.12)', color: 'var(--brand-3)', border: '1px solid rgba(124,92,255,0.3)' }
                      : { background: 'var(--bg-soft)', color: 'var(--ink-3)', border: '1px solid var(--line-soft)' }
                  }
                >
                  <Award className="w-3.5 h-3.5 shrink-0" />
                  <span>{selectedReg.feature_founding_card ? 'Unfeature' : 'Feature Card'}</span>
                </button>

                <button
                  onClick={() => onToggleExclude(selectedReg)}
                  className="py-3 px-3 rounded-2xl text-[10px] font-mono font-bold tracking-[0.06em] uppercase flex items-center justify-center gap-1.5 transition-all duration-200 cursor-pointer active:scale-95"
                  style={
                    selectedReg.exclude_from_waitlist
                      ? { background: 'rgba(242,90,43,0.12)', color: 'var(--brand-1)', border: '1px solid rgba(242,90,43,0.3)' }
                      : { background: 'var(--bg-soft)', color: 'var(--ink-3)', border: '1px solid var(--line-soft)' }
                  }
                >
                  <UserMinus className="w-3.5 h-3.5 shrink-0" />
                  <span>{selectedReg.exclude_from_waitlist ? 'Include Rank' : 'Exclude Rank'}</span>
                </button>
              </div>
            </div>

            {/* Details Bento Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Contact Info Bento Box */}
              <div className="bg-bg-soft/30 border border-line-soft rounded-[1.75rem] p-5 space-y-3">
                <p className="text-[10px] font-mono font-bold uppercase tracking-[0.12em] text-ink-3">
                  Contact Information
                </p>
                <div className="space-y-2.5 text-xs font-mono">
                  <div className="flex items-center gap-2.5 text-ink">
                    <Mail className="w-3.5 h-3.5 text-ink-3 shrink-0" />
                    <span className="truncate select-all">{selectedReg.email}</span>
                  </div>
                  {selectedReg.phone && (
                    <div className="flex items-center gap-2.5 text-ink">
                      <Smartphone className="w-3.5 h-3.5 text-ink-3 shrink-0" />
                      <span className="select-all">{selectedReg.phone}</span>
                    </div>
                  )}
                  {selectedReg.city && (
                    <div className="flex items-center gap-2.5 text-ink">
                      <MapPin className="w-3.5 h-3.5 text-ink-3 shrink-0" />
                      <span>{selectedReg.city}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Queue Management Bento Box */}
              <div className="bg-bg-soft/30 border border-line-soft rounded-[1.75rem] p-5 space-y-3">
                <p className="text-[10px] font-mono font-bold uppercase tracking-[0.12em] text-ink-3">
                  Queue Management
                </p>
                <div className="flex items-center gap-3 pt-0.5">
                  <span className="text-xs text-ink-2 font-mono">Queue Override:</span>
                  <input
                    type="number"
                    placeholder="Auto"
                    value={posOverrideInput}
                    onChange={(e) => setPosOverrideInput(e.target.value)}
                    onBlur={handleOverrideSave}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        (e.target as HTMLInputElement).blur();
                      }
                    }}
                    className="w-16 bg-bg-soft border border-line-soft rounded-xl py-1 px-2 text-xs text-ink text-center font-mono font-bold focus:outline-none focus:border-brand transition-all"
                  />
                  <span className="text-[10px] font-mono text-ink-3">
                    {selectedReg.position_override ? `#${selectedReg.position_override}` : 'Auto-Queue'}
                  </span>
                </div>
                <div className="text-[10px] font-mono text-ink-3 pt-2.5 border-t border-line-soft flex justify-between items-center">
                  <span>Registered:</span>
                  <span className="text-ink-2 font-bold">
                    {selectedReg.reserved_at ? new Date(selectedReg.reserved_at).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
              </div>

              {/* Assign Role Bento Box */}
              <div className="bg-bg-soft/30 border border-line-soft rounded-[1.75rem] p-5 space-y-2 md:col-span-2">
                <p className="text-[10px] font-mono font-bold uppercase tracking-[0.12em] text-ink-3">
                  Ecosystem Member Role
                </p>
                <select
                  value={selectedReg.role || 'fan'}
                  onChange={(e) => onRoleChange(selectedReg.user_id, e.target.value)}
                  className="w-full bg-bg-soft border border-line-soft rounded-xl py-2 px-3 text-xs text-ink font-mono font-bold uppercase cursor-pointer focus:outline-none focus:border-brand"
                >
                  <option value="founder">👑 Founder & Executive Team</option>
                  <option value="artist">🎤 Performing Artist</option>
                  <option value="venue">🎪 Partner Venue / Club</option>
                  <option value="vendor">🛠️ Vendor / Tech Provider</option>
                  <option value="fan">🎟️ Fan / Enthusiast</option>
                </select>
              </div>
            </div>

            {/* Classification & Genres */}
            {(selectedReg.category || (selectedReg.genres && selectedReg.genres.length > 0)) && (
              <div className="bg-bg-soft/20 border border-line-soft rounded-[1.75rem] p-5 space-y-2.5">
                <p className="text-[10px] font-mono font-bold uppercase tracking-[0.12em] text-ink-3">
                  Classification & Genres
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  {selectedReg.category && (
                    <span className="text-xs text-ink font-semibold capitalize bg-bg-soft border border-line-soft px-3.5 py-1.5 rounded-xl">
                      {selectedReg.category.replace('_', ' ')}
                    </span>
                  )}
                  {selectedReg.genres &&
                    selectedReg.genres.map((g) => (
                      <span
                        key={g}
                        className="text-xs font-mono px-3 py-1.5 rounded-xl text-ink-2 bg-bg-soft/40 border border-line-soft"
                      >
                        #{g}
                      </span>
                    ))}
                </div>
              </div>
            )}

            {/* External Portals */}
            {(selectedReg.instagram_url || selectedReg.spotify_url || selectedReg.youtube_url || selectedReg.youtube_channel_url) && (
              <div className="bg-bg-soft/20 border border-line-soft rounded-[1.75rem] p-5 space-y-3">
                <p className="text-[10px] font-mono font-bold uppercase tracking-[0.12em] text-ink-3">
                  External Portals
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {selectedReg.instagram_url && (
                    <a
                      href={
                        selectedReg.instagram_url.startsWith('http')
                          ? selectedReg.instagram_url
                          : `https://instagram.com/${selectedReg.instagram_url}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 rounded-2xl bg-bg-soft/40 border border-line-soft hover:bg-bg-soft transition-all group"
                    >
                      <div
                        className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0 shadow-sm"
                        style={{ background: 'linear-gradient(135deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)' }}
                      >
                        <span className="text-white text-[9px] font-black">IG</span>
                      </div>
                      <span className="text-xs font-mono text-ink-2 truncate flex-1 group-hover:text-ink">
                        Instagram
                      </span>
                      <ExternalLink className="w-3.5 h-3.5 text-ink-3" />
                    </a>
                  )}
                  {selectedReg.spotify_url && (
                    <a
                      href={
                        selectedReg.spotify_url.startsWith('http')
                          ? selectedReg.spotify_url
                          : `https://open.spotify.com/artist/${selectedReg.spotify_url}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 rounded-2xl bg-bg-soft/40 border border-line-soft hover:bg-bg-soft transition-all group"
                    >
                      <div className="w-7 h-7 rounded-xl flex items-center justify-center bg-[#1DB954] shadow-sm">
                        <span className="text-white text-[9px] font-black">SP</span>
                      </div>
                      <span className="text-xs font-mono text-ink-2 truncate flex-1 group-hover:text-ink">
                        Spotify
                      </span>
                      <ExternalLink className="w-3.5 h-3.5 text-ink-3" />
                    </a>
                  )}
                  {(selectedReg.youtube_url || selectedReg.youtube_channel_url) && (
                    <a
                      href={
                        (selectedReg.youtube_channel_url || selectedReg.youtube_url || '').startsWith('http')
                          ? selectedReg.youtube_channel_url || selectedReg.youtube_url || ''
                          : `https://youtube.com/@${selectedReg.youtube_channel_url || selectedReg.youtube_url}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 rounded-2xl bg-bg-soft/40 border border-line-soft hover:bg-bg-soft transition-all group sm:col-span-2"
                    >
                      <div className="w-7 h-7 rounded-xl flex items-center justify-center bg-[#FF0000] shrink-0 shadow-sm">
                        <span className="text-white text-[9px] font-black">YT</span>
                      </div>
                      <span className="text-xs font-mono text-ink-2 truncate flex-1 group-hover:text-ink">
                        YouTube
                      </span>
                      <ExternalLink className="w-3.5 h-3.5 text-ink-3" />
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
