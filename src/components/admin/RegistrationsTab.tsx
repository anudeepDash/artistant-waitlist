'use client';

import React from 'react';
import type { AdminWaitlistEntry } from '@/lib/waitlist';
import GlowingAdminCard from './GlowingAdminCard';
import { evaluateAutoVerify, ROLE_COLORS } from './shared';
import {
  Search,
  Layers,
  Eye,
  Mail,
  CheckCircle2,
  XCircle,
  Smartphone,
} from 'lucide-react';

interface RegistrationsTabProps {
  registrations: AdminWaitlistEntry[];
  filteredRegistrations: AdminWaitlistEntry[];
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  viewMode: 'table' | 'card';
  setViewMode: (mode: 'table' | 'card') => void;
  roleFilter: string;
  setRoleFilter: (role: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  selectedUserIds: string[];
  setSelectedUserIds: (ids: string[]) => void;
  autoVerifyCount: number;
  runAutoVerifyEngine: () => void;
  handleVerifyAndLock: (reg: AdminWaitlistEntry) => void;
  handleToggleBlock: (reg: AdminWaitlistEntry) => void;
  handleSavePositionOverride: (reg: AdminWaitlistEntry, val: number | null) => void;
  setSelectedReg: (reg: AdminWaitlistEntry | null) => void;
  setActiveTab: (tab: string) => void;
  setEmailAudienceMode: (mode: string) => void;
}

export default function RegistrationsTab({
  registrations,
  filteredRegistrations,
  searchQuery,
  setSearchQuery,
  viewMode,
  setViewMode,
  roleFilter,
  setRoleFilter,
  statusFilter,
  setStatusFilter,
  selectedUserIds,
  setSelectedUserIds,
  autoVerifyCount,
  runAutoVerifyEngine,
  handleVerifyAndLock,
  handleToggleBlock,
  handleSavePositionOverride,
  setSelectedReg,
  setActiveTab,
  setEmailAudienceMode,
}: RegistrationsTabProps) {
  return (
    <div className="space-y-6 text-left">
      {/* Auto-Approve Banner */}
      {autoVerifyCount > 0 && (
        <GlowingAdminCard
          idx={4}
          className="bg-emerald-500/10 dark:bg-emerald-500/5 border border-emerald-500/20 rounded-[1.5rem] p-6 shadow-lg backdrop-blur-xl animate-in fade-in duration-300 text-left"
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-3">
              <div>
                <h4 className="font-mono text-xs font-bold text-[#22C55E] uppercase tracking-wider flex items-center gap-1.5">
                  Suggested Approvals
                </h4>
                <p className="text-[11px] text-ink-2 mt-0.5">
                  {autoVerifyCount} pending artist(s) have completed their profiles and can be automatically approved.
                </p>
              </div>
            </div>
            <button
              onClick={runAutoVerifyEngine}
              className="bg-[#22C55E]/10 hover:bg-[#22C55E]/20 text-[#22C55E] border border-[#22C55E]/20 font-mono text-[9px] font-bold uppercase tracking-wider py-2 px-4 rounded-xl transition-all duration-300 shadow-sm cursor-pointer whitespace-nowrap"
            >
              Auto-Approve {autoVerifyCount} Artists
            </button>
          </div>
        </GlowingAdminCard>
      )}

      {/* Toolbar */}
      <div className="bg-bg-card border border-line-soft p-5 rounded-3xl flex flex-col md:flex-row gap-4 items-center justify-between backdrop-blur-md">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-3" />
          <input
            type="text"
            placeholder="Search name, handle, email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-bg-soft/40 border border-line-soft focus:border-[#7C5CFF] focus:ring-4 focus:ring-[#7C5CFF]/15 text-sm text-ink placeholder-ink-3 rounded-2xl pl-12 pr-4 py-3 transition-all outline-none"
            style={{ borderColor: searchQuery ? 'var(--brand-3)' : '' }}
          />
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3.5 w-full md:w-auto text-[11px] font-mono text-ink-2">
          {/* View Mode Toggle */}
          <div className="flex rounded-xl p-1 bg-bg-soft/40 border border-line-soft w-full sm:w-auto">
            <button
              onClick={() => setViewMode("table")}
              className="flex-1 sm:flex-initial px-4 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 font-bold uppercase tracking-[0.06em] cursor-pointer"
              style={viewMode === "table" ? {
                background: 'linear-gradient(135deg, #F25A2B, #7C5CFF)',
                color: 'white',
                boxShadow: '0 4px 12px -4px rgba(242,90,43,0.3)',
              } : { color: 'var(--ink-3)' }}
            >
              <Layers className="w-3.5 h-3.5" />
              Table
            </button>
            <button
              onClick={() => setViewMode("card")}
              className="flex-1 sm:flex-initial px-4 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 font-bold uppercase tracking-[0.06em] cursor-pointer"
              style={viewMode === "card" ? {
                background: 'linear-gradient(135deg, #F25A2B, #7C5CFF)',
                color: 'white',
                boxShadow: '0 4px 12px -4px rgba(242,90,43,0.3)',
              } : { color: 'var(--ink-3)' }}
            >
              <Eye className="w-3.5 h-3.5" />
              Cards
            </button>
          </div>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full sm:w-auto bg-bg-soft/40 border border-line-soft rounded-xl px-4 py-2.5 font-bold uppercase tracking-[0.06em] focus:outline-none text-ink cursor-pointer text-center"
          >
            <option value="all">All Roles</option>
            <option value="founder">Founder & Team</option>
            <option value="artist">Artist</option>
            <option value="venue">Venue</option>
            <option value="vendor">Vendor</option>
            <option value="fan">Fan</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-auto bg-bg-soft/40 border border-line-soft rounded-xl px-4 py-2.5 font-bold uppercase tracking-[0.06em] focus:outline-none text-ink cursor-pointer text-center"
          >
            <option value="all">All Status</option>
            <option value="verified">Verified</option>
            <option value="pending">Pending</option>
            <option value="blocked">Blocked</option>
          </select>

          <button
            onClick={() => {
              if (selectedUserIds.length > 0) {
                setEmailAudienceMode("selected");
              } else {
                setEmailAudienceMode("filtered");
              }
              setActiveTab("emails");
            }}
            className="w-full sm:w-auto py-2.5 px-4.5 rounded-xl border text-[11px] font-mono font-bold uppercase tracking-[0.06em] flex items-center justify-center gap-2 cursor-pointer transition-all duration-300"
            style={{
              background: 'rgba(124, 92, 255, 0.1)',
              color: '#7C5CFF',
              borderColor: 'rgba(124, 92, 255, 0.3)',
            }}
          >
            <Mail className="w-3.5 h-3.5" />
            Email Studio
            {selectedUserIds.length > 0 && (
              <span className="bg-[#7C5CFF] text-white px-1.5 py-0.5 rounded-full text-[8px] font-mono leading-none">
                {selectedUserIds.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Data View */}
      {viewMode === "table" ? (
        <div className="bg-bg-card border border-line-soft rounded-3xl overflow-hidden backdrop-blur-md shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full table-fixed border-collapse text-left text-sm min-w-[700px]">
              <thead>
                <tr className="border-b border-line-soft text-ink-3 text-[9px] font-mono font-bold uppercase tracking-[0.18em]">
                  <th className="px-3 py-4 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={filteredRegistrations.length > 0 && filteredRegistrations.every(r => selectedUserIds.includes(r.id))}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedUserIds(filteredRegistrations.map(r => r.id));
                        } else {
                          setSelectedUserIds([]);
                        }
                      }}
                      className="w-4 h-4 rounded border-line-soft bg-bg-soft/40 text-[#7C5CFF] focus:ring-0 cursor-pointer"
                    />
                  </th>
                  <th className="px-4 py-4 w-[28%]">Member Name & Handle</th>
                  <th className="px-3 py-4 w-[14%]">Role</th>
                  <th className="px-4 py-4 w-[30%]">Contact Details</th>
                  <th className="px-3 py-4 w-[13%]">Queue Rank</th>
                  <th className="px-3 py-4 w-[15%] text-right">Status & Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line-soft/30">
                {filteredRegistrations.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-14 text-center text-ink-3 font-mono text-xs">
                      No matching waitlist nodes found.
                    </td>
                  </tr>
                ) : (
                  filteredRegistrations.map((reg) => {
                    const heuristics = evaluateAutoVerify(reg);
                    const initials = (reg.display_name || reg.username || 'U')[0].toUpperCase();
                    return (
                      <tr
                        key={reg.id}
                        onClick={() => setSelectedReg(reg)}
                        className={`hover:bg-bg-card-hover/20 transition-colors cursor-pointer duration-150 ${
                          reg.is_blocked ? "opacity-30" : ""
                        }`}
                      >
                        <td className="px-3 py-3.5 w-10 text-center" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={selectedUserIds.includes(reg.id)}
                            onChange={() => {
                              if (selectedUserIds.includes(reg.id)) {
                                setSelectedUserIds(selectedUserIds.filter(id => id !== reg.id));
                              } else {
                                setSelectedUserIds([...selectedUserIds, reg.id]);
                              }
                            }}
                            className="w-4 h-4 rounded border-line-soft bg-bg-soft/40 text-[#7C5CFF] focus:ring-0 cursor-pointer"
                          />
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-8 h-8 rounded-xl overflow-hidden flex items-center justify-center font-display font-bold text-xs text-white shrink-0 bg-bg-soft">
                              {reg.profile_photo_url ? (
                                <img src={reg.profile_photo_url} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#7C5CFF] to-[#D4567A]">
                                  {initials}
                                </div>
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="font-bold text-ink flex items-center gap-1.5 text-xs truncate">
                                <span className="truncate">{reg.display_name || "Unspecified Node"}</span>
                                {reg.is_verified && (
                                  <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[7px] font-mono font-bold tracking-[0.08em] bg-gradient-to-r from-[#F25A2B] to-[#7C5CFF] text-white shrink-0">
                                    VERIFIED
                                  </span>
                                )}
                                {heuristics.eligible && (
                                  <span
                                    className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[7px] font-mono font-bold tracking-[0.08em] bg-bg-soft text-[#22C55E] border border-[#22C55E]/20 shrink-0"
                                    title={`Auto-verify candidate: ${heuristics.reasons.join(", ")}`}
                                  >
                                    SUGGESTED
                                  </span>
                                )}
                              </div>
                              <div className="text-[10px] font-mono mt-0.5 text-brand truncate">
                                @{reg.username}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-3.5">
                          <div className="truncate">
                            <span className="inline-block px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-[0.08em]" style={{
                              background: 'var(--bg-soft)',
                              color: reg.role === 'founder' ? '#FFB800' : reg.role === 'artist' ? 'var(--brand-3)' : reg.role === 'venue' ? 'var(--brand-2)' : reg.role === 'vendor' ? 'var(--brand-1)' : 'var(--ink-3)',
                              border: `1px solid color-mix(in srgb, ${reg.role === 'founder' ? '#FFB800' : reg.role === 'artist' ? 'var(--brand-3)' : reg.role === 'venue' ? 'var(--brand-2)' : reg.role === 'vendor' ? 'var(--brand-1)' : 'var(--ink-3)'} 15%, transparent)`,
                            }}>
                              {reg.role || "fan"}
                            </span>
                            {reg.category && (
                              <span className="block text-[10px] text-ink-3 mt-0.5 capitalize font-mono truncate">
                                {reg.category.replace("_", " ")}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3.5 font-mono text-[11px] text-ink-2 space-y-0.5 text-left min-w-0">
                          <div className="text-ink truncate" title={reg.email}>{reg.email}</div>
                          {reg.phone && <div className="text-ink-3 truncate">{reg.phone}</div>}
                        </td>
                        <td className="px-3 py-3.5">
                          <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="number"
                              placeholder="Auto"
                              defaultValue={reg.position_override ?? ""}
                              key={`table-${reg.id}-${reg.position_override ?? "auto"}`}
                              onBlur={(e) => {
                                const raw = e.target.value.trim();
                                const val = raw === "" ? null : parseInt(raw, 10);
                                const parsedVal = isNaN(val as number) ? null : val;
                                if (parsedVal !== (reg.position_override ?? null)) {
                                  handleSavePositionOverride(reg, parsedVal);
                                }
                              }}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  (e.target as HTMLInputElement).blur();
                                }
                              }}
                              className="w-12 bg-bg-soft border border-line-soft rounded-lg py-1 px-1 text-xs text-ink text-center font-mono focus:outline-none focus:border-brand transition-all"
                            />
                            <span className="text-[9px] font-mono text-ink-3 shrink-0">
                              {reg.position_override ? `#${reg.position_override}` : "Queue"}
                            </span>
                          </div>
                        </td>
                        <td className="px-3 py-3.5 text-right">
                          <div className="inline-flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => handleVerifyAndLock(reg)}
                              className="py-1 px-2.5 rounded-full text-[8px] font-mono font-bold tracking-[0.06em] uppercase transition-all cursor-pointer"
                              style={reg.is_verified ? {
                                background: 'var(--bg-soft)',
                                color: 'var(--brand-3)',
                                border: '1px solid rgba(124,92,255,0.2)',
                              } : {
                                background: 'linear-gradient(135deg, #F25A2B, #7C5CFF)',
                                color: 'white',
                                border: 'none',
                                boxShadow: '0 4px 12px -4px rgba(242,90,43,0.3)',
                              }}
                            >
                              {reg.is_verified ? "Verified" : "Verify"}
                            </button>
                            <button
                              onClick={() => handleToggleBlock(reg)}
                              className="py-1 px-2 rounded-full text-[8px] font-mono font-bold tracking-[0.06em] uppercase transition-all cursor-pointer"
                              style={reg.is_blocked ? {
                                background: 'rgba(255,75,75,0.1)',
                                color: 'var(--hot)',
                                border: '1px solid rgba(255,75,75,0.2)',
                              } : {
                                background: 'var(--bg-soft)',
                                color: 'var(--ink-3)',
                                border: '1px solid var(--line-soft)',
                              }}
                            >
                              {reg.is_blocked ? "Restore" : "Suspend"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRegistrations.length === 0 ? (
            <div className="col-span-full py-12 text-center text-ink-3 font-mono bg-bg-card border border-line-soft rounded-[2rem]">
              No matching registrations found.
            </div>
          ) : (
            filteredRegistrations.map((reg, idx) => {
              const heuristics = evaluateAutoVerify(reg);
              const roleColor = ROLE_COLORS[reg.role || ''] || 'var(--ink-3)';
              const initials = (reg.display_name || reg.username || 'U')[0].toUpperCase();

              return (
                <GlowingAdminCard
                  key={reg.id}
                  idx={idx}
                  onClick={() => setSelectedReg(reg)}
                  className={`bg-bg-card border border-line-soft rounded-[2rem] p-7 flex flex-col gap-0 cursor-pointer hover:border-white/10 hover:shadow-2xl hover:scale-[1.01] transition-all duration-300 ${
                    reg.is_blocked ? "opacity-40" : ""
                  }`}
                  style={{ minHeight: '390px' }}
                >
                  {/* Top: Icon + Status badges */}
                  <div className="flex justify-between items-start mb-5 z-10">
                    <div className="flex items-center gap-3">
                      <div className="relative flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selectedUserIds.includes(reg.id)}
                          onChange={() => {
                            if (selectedUserIds.includes(reg.id)) {
                              setSelectedUserIds(selectedUserIds.filter(id => id !== reg.id));
                            } else {
                              setSelectedUserIds([...selectedUserIds, reg.id]);
                            }
                          }}
                          className="w-4 h-4 rounded border-line-soft bg-bg-soft/40 text-[#7C5CFF] focus:ring-0 cursor-pointer z-10"
                        />
                        <div className="w-11 h-11 rounded-xl overflow-hidden flex items-center justify-center bg-bg-soft border border-line-soft font-display font-bold text-sm text-ink shadow-inner">
                          {reg.profile_photo_url ? (
                            <img src={reg.profile_photo_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#7C5CFF] to-[#D4567A] text-white">
                              {initials}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1.5 items-end">
                      {reg.is_verified && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold tracking-[0.08em] bg-gradient-to-r from-[#F25A2B] to-[#7C5CFF] text-white">
                          VERIFIED
                        </span>
                      )}
                      {reg.exclude_from_waitlist && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold tracking-[0.08em] bg-bg-soft text-purple-400 border border-purple-400/20">
                          TEAM
                        </span>
                      )}
                      {heuristics.eligible && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold tracking-[0.08em] bg-bg-soft text-[#22C55E] border border-[#22C55E]/20" title={`Auto-verify: ${heuristics.reasons.join(", ")}`}>
                          SUGGESTED
                        </span>
                      )}
                      {reg.is_blocked && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold tracking-[0.08em] bg-hot/10 text-hot border border-hot/20">
                          SUSPENDED
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Identity */}
                  <div className="mb-1 z-10 text-left">
                    <h3 className="font-display font-bold text-lg text-ink uppercase tracking-tight leading-tight pr-4 truncate">
                      {reg.display_name || "Unknown"}
                    </h3>
                    <p className="text-xs font-mono mt-1 text-brand">
                      @{reg.username}
                    </p>
                  </div>

                  {/* Role & Tags */}
                  <div className="mb-auto z-10 pt-3 text-left">
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-[0.08em]" style={{
                      background: 'var(--bg-soft)',
                      color: roleColor,
                      border: `1px solid color-mix(in srgb, ${roleColor} 15%, transparent)`,
                    }}>
                      {reg.role || "fan"}
                    </span>

                    {(reg.category || (reg.genres && reg.genres.length > 0)) && (
                      <div className="mt-3.5 space-y-2">
                        {reg.category && (
                          <p className="text-[11px] text-ink-2 capitalize">
                            <span className="text-ink-3 font-mono">Category:</span> {reg.category.replace("_", " ")}
                          </p>
                        )}
                        {reg.genres && reg.genres.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {reg.genres.map(g => (
                              <span key={g} className="text-[9px] font-mono px-2 py-0.5 rounded-full text-ink-2 bg-bg-soft/20 border border-line-soft">
                                #{g}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Contact info */}
                  <div className="text-xs text-ink-2 space-y-1.5 mt-5 pt-4 z-10 border-t border-line-soft text-left">
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-ink-3" />
                      <span className="truncate">{reg.email}</span>
                    </div>
                    {reg.phone && (
                      <div className="flex items-center gap-2">
                        <Smartphone className="w-3.5 h-3.5 text-ink-3" />
                        <span>{reg.phone}</span>
                      </div>
                    )}
                  </div>

                  {/* Card Actions */}
                  <div className="mt-5 pt-4 flex items-center gap-2.5 z-10 border-t border-line-soft" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => handleVerifyAndLock(reg)}
                      className="flex-1 py-2 rounded-xl text-[10px] font-mono font-bold tracking-[0.06em] uppercase flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                      style={reg.is_verified ? {
                        background: 'var(--bg-soft)',
                        color: 'var(--brand-3)',
                        border: '1px solid rgba(124,92,255,0.2)',
                      } : {
                        background: 'linear-gradient(135deg, #F25A2B, #7C5CFF)',
                        color: 'white',
                        border: 'none',
                        boxShadow: '0 4px 16px -4px rgba(242,90,43,0.4)',
                      }}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {reg.is_verified ? "Verified" : "Verify"}
                    </button>

                    <button
                      onClick={() => handleToggleBlock(reg)}
                      className="flex-1 py-2 rounded-xl text-[10px] font-mono font-bold tracking-[0.06em] uppercase flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                      style={reg.is_blocked ? {
                        background: 'rgba(255,75,75,0.1)',
                        color: 'var(--hot)',
                        border: '1px solid rgba(255,75,75,0.2)',
                      } : {
                        background: 'var(--bg-soft)',
                        color: 'var(--ink-3)',
                        border: '1px solid var(--line-soft)',
                      }}
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      {reg.is_blocked ? "Restore" : "Suspend"}
                    </button>
                  </div>
                </GlowingAdminCard>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
