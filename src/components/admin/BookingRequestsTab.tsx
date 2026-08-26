'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Mail, Smartphone, MapPin, Send, Trash2, Calendar as CalendarIcon, AlertTriangle } from 'lucide-react';
import type { BookingRequestEntry } from '@/lib/admin-actions';
import GlowingAdminCard from './GlowingAdminCard';

interface BookingRequestsTabProps {
  bookingRequests: BookingRequestEntry[];
  bookingRequestsError: string | null;
  onUpdateStatus: (requestId: string, newStatus: 'pending' | 'contacted' | 'confirmed' | 'archived') => void;
  onDelete: (requestId: string) => void;
  onShowSqlMigration: () => void;
}

export default function BookingRequestsTab({
  bookingRequests,
  bookingRequestsError,
  onUpdateStatus,
  onDelete,
  onShowSqlMigration
}: BookingRequestsTabProps) {
  const [requestSearchQuery, setRequestSearchQuery] = useState('');
  const [requestStatusFilter, setRequestStatusFilter] = useState('all');

  const filteredRequests = useMemo(() => {
    return bookingRequests.filter(req => {
      const matchesSearch = (req.client_name?.toLowerCase() || '').includes(requestSearchQuery.toLowerCase()) ||
                            (req.artist_username?.toLowerCase() || '').includes(requestSearchQuery.toLowerCase()) ||
                            (req.client_email?.toLowerCase() || '').includes(requestSearchQuery.toLowerCase());
      const matchesFilter = requestStatusFilter === 'all' || req.status === requestStatusFilter;
      return matchesSearch && matchesFilter;
    });
  }, [bookingRequests, requestSearchQuery, requestStatusFilter]);

  const pendingCount = bookingRequests.filter(r => r.status === 'pending').length;
  const contactedCount = bookingRequests.filter(r => r.status === 'contacted').length;
  const confirmedCount = bookingRequests.filter(r => r.status === 'confirmed').length;

  return (
    <div className="space-y-8">
      {bookingRequestsError && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-amber-500/10 border border-amber-500/30 rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3 text-amber-500">
            <AlertTriangle className="w-5 h-5" />
            <div>
              <p className="font-medium">Database Migration Required</p>
              <p className="text-sm opacity-80">{bookingRequestsError}</p>
            </div>
          </div>
          <button 
            onClick={onShowSqlMigration}
            className="px-4 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-500 rounded-full text-sm font-medium transition-colors"
          >
            View SQL Migration
          </button>
        </motion.div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {[
          { label: "Total Booking Requests", value: bookingRequests.length, color: 'text-ink', glow: 'rgba(124,92,255,0.08)' },
          { label: "Pending Review", value: pendingCount, color: 'text-[#F25A2B]', glow: 'rgba(242,90,43,0.08)' },
          { label: "Contacted", value: contactedCount, color: 'text-[#7C5CFF]', glow: 'rgba(124,92,255,0.08)' },
          { label: "Confirmed / Locked", value: confirmedCount, color: 'text-emerald-500 dark:text-emerald-400', glow: 'rgba(16,185,129,0.08)' },
        ].map((card, i) => (
          <GlowingAdminCard
            key={card.label}
            idx={i}
            className="bg-bg-card border border-line-soft rounded-3xl p-6 relative overflow-hidden backdrop-blur-xl shadow-lg text-left"
            style={{ boxShadow: `0 10px 30px -10px ${card.glow}` }}
          >
            <p className="text-[10px] font-mono font-bold text-ink-3 uppercase tracking-wider">{card.label}</p>
            <h3 className={`text-3xl font-display font-extrabold mt-2 ${card.color}`}>
              {card.value}
            </h3>
          </GlowingAdminCard>
        ))}
      </div>

      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-ink tracking-tight">Client Booking Requests</h2>
            <p className="text-ink-3 text-sm mt-1">Manage and track artist booking inquiries.</p>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-4 h-4 text-ink-3 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search requests..."
                value={requestSearchQuery}
                onChange={e => setRequestSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 bg-bg border border-line-soft rounded-full text-sm text-ink w-48 focus:outline-none focus:border-ink-3 transition-colors"
              />
            </div>
            <select
              value={requestStatusFilter}
              onChange={e => setRequestStatusFilter(e.target.value)}
              className="px-4 py-2 bg-bg border border-line-soft rounded-full text-sm text-ink focus:outline-none focus:border-ink-3 transition-colors appearance-none"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="contacted">Contacted</option>
              <option value="confirmed">Confirmed</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <AnimatePresence>
            {filteredRequests.map(req => {
              const isPending = req.status === 'pending';
              const isConfirmed = req.status === 'confirmed';
              const isContacted = req.status === 'contacted';
              const isArchived = req.status === 'archived';

              let borderColor = 'border-line-soft';
              if (isPending) borderColor = 'border-[#F25A2B]/40';
              if (isConfirmed) borderColor = 'border-emerald-500/40';
              if (isContacted) borderColor = 'border-[#7C5CFF]/40';

              return (
                <motion.div
                  key={req.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`bg-bg-card border ${borderColor} rounded-3xl p-6 flex flex-col gap-5 ${isArchived ? 'opacity-70' : ''}`}
                >
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <p className="text-[10px] font-bold text-ink-3 uppercase tracking-wider mb-1">
                        Booking Inquiry For
                      </p>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2 py-0.5 bg-bg-soft border border-line-soft rounded-md text-xs font-medium text-ink-2">
                          {req.event_type}
                        </span>
                        <h3 className="text-lg font-semibold text-ink">
                          {req.artist_display_name || req.artist_username}
                        </h3>
                      </div>
                    </div>
                    
                    <select
                      value={req.status}
                      onChange={e => onUpdateStatus(req.id, e.target.value as any)}
                      className={`text-xs font-medium px-3 py-1.5 rounded-full appearance-none cursor-pointer outline-none border transition-colors
                        ${isPending ? 'bg-[#F25A2B]/10 text-[#F25A2B] border-[#F25A2B]/20 hover:bg-[#F25A2B]/20' : 
                          isConfirmed ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/20' :
                          isContacted ? 'bg-[#7C5CFF]/10 text-[#7C5CFF] border-[#7C5CFF]/20 hover:bg-[#7C5CFF]/20' :
                          'bg-bg-soft text-ink-2 border-line-soft hover:bg-bg'}
                      `}
                    >
                      <option value="pending">Pending</option>
                      <option value="contacted">Contacted</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-sm">
                    <div>
                      <p className="text-ink-3 text-xs mb-1">Client Name</p>
                      <p className="font-medium text-ink truncate">{req.client_name}</p>
                    </div>
                    <div>
                      <p className="text-ink-3 text-xs mb-1">Budget</p>
                      <p className="font-medium text-ink">{req.budget}</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CalendarIcon className="w-4 h-4 text-ink-3" />
                      <span className="font-medium text-ink">{req.event_date || 'TBD'}</span>
                    </div>
                    <div className="flex items-center gap-1.5 truncate">
                      <MapPin className="w-4 h-4 text-ink-3 shrink-0" />
                      <span className="font-medium text-ink truncate">{req.city}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-line-soft">
                    {req.client_email && (
                      <a href={`mailto:${req.client_email}`} className="flex items-center gap-1.5 text-xs text-ink-2 hover:text-ink transition-colors">
                        <Mail className="w-3.5 h-3.5" />
                        <span>{req.client_email}</span>
                      </a>
                    )}
                    {req.client_phone && (
                      <>
                        <a href={`tel:${req.client_phone}`} className="flex items-center gap-1.5 text-xs text-ink-2 hover:text-ink transition-colors">
                          <Smartphone className="w-3.5 h-3.5" />
                          <span>{req.client_phone}</span>
                        </a>
                      </>
                    )}
                  </div>

                  {req.notes && (
                    <div className="bg-bg-soft rounded-xl p-3">
                      <p className="text-sm text-ink-2 italic line-clamp-3">"{req.notes}"</p>
                    </div>
                  )}

                  <div className="flex items-center gap-2 mt-auto pt-2">
                    <a
                      href={`mailto:${req.client_email}?subject=Regarding your booking inquiry on Artistant`}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-[#7C5CFF]/10 hover:bg-[#7C5CFF]/20 text-[#7C5CFF] rounded-xl text-sm font-medium transition-colors"
                    >
                      <Send className="w-4 h-4" />
                      Email Client
                    </a>
                    {req.client_phone && (
                      <a
                        href={`https://wa.me/${req.client_phone.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-xl text-sm font-medium transition-colors"
                      >
                        <Smartphone className="w-4 h-4" />
                        WhatsApp
                      </a>
                    )}
                    <button
                      onClick={() => onDelete(req.id)}
                      className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl transition-colors shrink-0"
                      title="Delete Request"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
          {filteredRequests.length === 0 && (
            <div className="col-span-1 md:col-span-2 text-center py-12 text-ink-3">
              No booking requests found matching your filters.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
