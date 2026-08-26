'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Calendar, Clock, User, Mail, Building, CheckCircle2, ArrowRight } from 'lucide-react';
import { type TeamMember } from '@/lib/team-data';

interface BookCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: TeamMember;
}

export default function BookCallModal({ isOpen, onClose, member }: BookCallModalProps) {
  const [duration, setDuration] = useState<'15' | '30' | '45'>('30');
  const [selectedDate, setSelectedDate] = useState<string>('2026-08-14');
  const [selectedTime, setSelectedTime] = useState<string>('15:00');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [agenda, setAgenda] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 1000);
  };

  const handleReset = () => {
    setSubmitted(false);
    setName('');
    setEmail('');
    setCompany('');
    setAgenda('');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ type: 'spring', damping: 26, stiffness: 320 }}
            className="
              relative w-full max-w-lg bg-[#12141F] text-white rounded-3xl p-6 md:p-8
              border border-white/10 shadow-2xl overflow-hidden z-10 my-8 max-h-[90vh] overflow-y-auto no-scrollbar
            "
          >
            {/* Header Background Glow */}
            <div className="absolute -top-24 -left-24 w-64 h-64 rounded-full bg-[#7C5CFF]/30 blur-[90px] pointer-events-none" />

            {/* Top Bar */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#F25A2B] to-[#7C5CFF] p-0.5 shrink-0">
                  <div className="w-full h-full rounded-full bg-[#12141F] flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-[#F25A2B]" />
                  </div>
                </div>
                <div>
                  <h3 className="font-display font-bold text-lg leading-tight">Block Calendar & Sync</h3>
                  <p className="text-xs text-white/60 font-mono mt-0.5">With {member.name} ({member.role})</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {submitted ? (
              <div className="py-8 flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h4 className="font-display text-xl font-bold text-white">Meeting Request Sent!</h4>
                <p className="text-sm text-white/70 max-w-sm leading-relaxed">
                  Your meeting request for <strong className="text-white">{duration} minutes</strong> on{' '}
                  <strong className="text-[#F25A2B]">{selectedDate} at {selectedTime}</strong> has been logged.
                </p>
                <div className="w-full p-4 rounded-2xl bg-white/5 border border-white/10 text-left text-xs font-mono space-y-1.5 text-white/70">
                  <div className="text-white font-bold mb-1">Meeting Details:</div>
                  <div>Participant: {name} ({email})</div>
                  <div>Organization: {company || 'Independent'}</div>
                  <div>Host: {member.name} ({member.email})</div>
                </div>
                <button
                  onClick={handleReset}
                  className="
                    w-full py-3 rounded-xl bg-gradient-to-r from-[#F25A2B] to-[#7C5CFF]
                    text-white font-bold text-xs uppercase tracking-wider shadow-lg hover:scale-[1.02] active:scale-95 transition-all cursor-pointer mt-4
                  "
                >
                  Done & Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* 1. Meeting Duration */}
                <div>
                  <label className="text-[11px] font-mono uppercase font-bold text-white/50 tracking-wider block mb-2">
                    Select Meeting Type & Duration
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: '15', label: '15 Min', desc: 'Quick Intro Chat' },
                      { id: '30', label: '30 Min', desc: 'Strategic Sync' },
                      { id: '45', label: '45 Min', desc: 'Demo & Deep Dive' },
                    ].map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setDuration(item.id as any)}
                        className={`
                          p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-1
                          ${duration === item.id
                            ? 'border-[#F25A2B] bg-[#F25A2B]/15 text-white shadow-md'
                            : 'border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'}
                        `}
                      >
                        <div className="flex items-center gap-1.5 font-bold text-xs">
                          <Clock className="w-3.5 h-3.5 text-[#F25A2B]" />
                          <span>{item.label}</span>
                        </div>
                        <span className="text-[10px] text-white/50 leading-tight">{item.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Date & Time Selection */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-mono uppercase font-bold text-white/50 tracking-wider block mb-1.5">
                      Preferred Date
                    </label>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      required
                      className="
                        w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white text-xs font-mono
                        focus:outline-none focus:border-[#F25A2B] transition-colors
                      "
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-mono uppercase font-bold text-white/50 tracking-wider block mb-1.5">
                      Time Slot (IST)
                    </label>
                    <select
                      value={selectedTime}
                      onChange={(e) => setSelectedTime(e.target.value)}
                      className="
                        w-full px-3.5 py-2.5 rounded-xl bg-[#1A1C28] border border-white/15 text-white text-xs font-mono
                        focus:outline-none focus:border-[#F25A2B] transition-colors
                      "
                    >
                      <option value="11:00">11:00 AM IST</option>
                      <option value="14:00">02:00 PM IST</option>
                      <option value="15:00">03:00 PM IST</option>
                      <option value="16:30">04:30 PM IST</option>
                      <option value="18:00">06:00 PM IST</option>
                    </select>
                  </div>
                </div>

                {/* 3. Contact Form */}
                <div className="space-y-3 pt-2 border-t border-white/10">
                  <div>
                    <label className="text-[11px] font-mono uppercase font-bold text-white/50 tracking-wider block mb-1">
                      Your Full Name *
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-white/40 absolute left-3.5 top-3" />
                      <input
                        type="text"
                        placeholder="e.g. Vikramaditya Shah"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="
                          w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white text-xs
                          placeholder:text-white/30 focus:outline-none focus:border-[#F25A2B] transition-colors
                        "
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-mono uppercase font-bold text-white/50 tracking-wider block mb-1">
                      Your Work Email *
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-white/40 absolute left-3.5 top-3" />
                      <input
                        type="email"
                        placeholder="vikram@company.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="
                          w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white text-xs
                          placeholder:text-white/30 focus:outline-none focus:border-[#F25A2B] transition-colors
                        "
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-mono uppercase font-bold text-white/50 tracking-wider block mb-1">
                      Company / Venue / Brand
                    </label>
                    <div className="relative">
                      <Building className="w-4 h-4 text-white/40 absolute left-3.5 top-3" />
                      <input
                        type="text"
                        placeholder="e.g. Blue Frog Events / Venture Capital"
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        className="
                          w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white text-xs
                          placeholder:text-white/30 focus:outline-none focus:border-[#F25A2B] transition-colors
                        "
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-mono uppercase font-bold text-white/50 tracking-wider block mb-1">
                      Topic & Agenda
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Brief note on what you would like to discuss..."
                      value={agenda}
                      onChange={(e) => setAgenda(e.target.value)}
                      className="
                        w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white text-xs
                        placeholder:text-white/30 focus:outline-none focus:border-[#F25A2B] transition-colors resize-none
                      "
                    />
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="
                    w-full py-3.5 rounded-xl bg-gradient-to-r from-[#F25A2B] via-[#D4567A] to-[#7C5CFF]
                    text-white font-bold text-xs uppercase tracking-wider shadow-xl hover:scale-[1.02] active:scale-95 transition-all cursor-pointer
                    flex items-center justify-center gap-2 disabled:opacity-50 mt-4
                  "
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Confirm Calendar Reservation</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
