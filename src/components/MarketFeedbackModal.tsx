'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Send, CheckCircle2, ShieldCheck, Banknote, Users, Sparkles, MessageSquarePlus, AlertCircle } from 'lucide-react';
import { submitMarketFeedbackAction, type MarketFeedbackInput } from '@/lib/admin-actions';

interface MarketFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MarketFeedbackModal({ isOpen, onClose }: MarketFeedbackModalProps) {
  const [activeTab, setActiveTab] = useState<'problem' | 'feature_request'>('problem');
  const [role, setRole] = useState<'artist' | 'venue' | 'organizer' | 'fan' | 'other'>('artist');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || message.trim().length < 5) {
      setErrorMsg('Please describe the problem or feature in at least a few words.');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');

    try {
      const payload: MarketFeedbackInput = {
        name: name.trim() || undefined,
        email: email.trim() || undefined,
        role,
        type: activeTab,
        message: message.trim(),
      };

      await submitMarketFeedbackAction(payload);
      setSubmitted(true);
    } catch (err: any) {
      console.error('Submission error:', err);
      setErrorMsg(err?.message || 'Failed to submit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setMessage('');
    setSubmitted(false);
    setErrorMsg('');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[10002] flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-2xl animate-in fade-in duration-200 select-none overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            className="relative w-full max-w-2xl rounded-3xl bg-[#0B0B12] border border-white/15 p-5 sm:p-8 shadow-[0_30px_90px_rgba(0,0,0,0.95)] text-white overflow-hidden my-auto max-h-[92vh] flex flex-col"
          >
            {/* Ambient Lighting */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-[radial-gradient(ellipse_at_top_right,rgba(242,90,43,0.12),transparent_70%)] pointer-events-none" />

            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6 shrink-0">
              <div className="flex items-center gap-2.5">
                <span className="flex h-2.5 w-2.5 rounded-full bg-[#F25A2B] animate-pulse" />
                <h2 className="text-base sm:text-lg font-display font-bold text-white tracking-tight">
                  What ArtisTant Is Building
                </h2>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer text-xs font-bold"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-y-auto space-y-6 pr-1 custom-scrollbar">
              
              {/* ── 1. The Market Problem: What ArtisTant Basically Is ── */}
              <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-4 sm:p-5 space-y-4">
                <div>
                  <h3 className="font-mono text-xs uppercase tracking-widest text-[#F25A2B] font-bold mb-1">
                    THE MISSION
                  </h3>
                  <p className="text-xs sm:text-sm text-zinc-200 leading-relaxed">
                    <strong className="text-white font-semibold">ArtisTant</strong> is India&apos;s direct marketplace and infrastructure for live musicians, DJs, bands, and venues. We exist to eliminate the broken middleman economy.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-white/5">
                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col gap-1">
                    <span className="font-mono text-[11px] font-bold text-red-400 flex items-center gap-1.5">
                      <Banknote className="w-3.5 h-3.5" /> Zero Broker Cuts
                    </span>
                    <p className="text-[11px] text-zinc-400 leading-snug">
                      No more losing 20–40% of your performance fees to unverified middlemen.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col gap-1">
                    <span className="font-mono text-[11px] font-bold text-[#06B6D4] flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5" /> Escrow Payouts
                    </span>
                    <p className="text-[11px] text-zinc-400 leading-snug">
                      100% of gig funds secured upfront before the show, released instantly on completion.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col gap-1">
                    <span className="font-mono text-[11px] font-bold text-[#A78BFA] flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5" /> Direct Bookings
                    </span>
                    <p className="text-[11px] text-zinc-400 leading-snug">
                      Verified artist profiles, real calendar availability, and direct venue contracts.
                    </p>
                  </div>
                </div>
              </div>

              {/* ── 2. Interactive Feature Request & Problem Form ── */}
              <div>
                {!submitted ? (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Mode Selector */}
                    <div className="flex rounded-xl bg-white/[0.04] p-1 border border-white/10">
                      <button
                        type="button"
                        onClick={() => setActiveTab('problem')}
                        className={`flex-1 py-2 rounded-lg text-xs font-mono font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                          activeTab === 'problem'
                            ? 'bg-[#F25A2B] text-white shadow-md'
                            : 'text-zinc-400 hover:text-white'
                        }`}
                      >
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>Market Problem to Solve</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setActiveTab('feature_request')}
                        className={`flex-1 py-2 rounded-lg text-xs font-mono font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                          activeTab === 'feature_request'
                            ? 'bg-[#7C5CFF] text-white shadow-md'
                            : 'text-zinc-400 hover:text-white'
                        }`}
                      >
                        <MessageSquarePlus className="w-3.5 h-3.5" />
                        <span>Feature Request</span>
                      </button>
                    </div>

                    {/* Role Selector */}
                    <div>
                      <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
                        I am a:
                      </label>
                      <div className="flex flex-wrap gap-1.5">
                        {[
                          { id: 'artist', label: 'Artist / Musician' },
                          { id: 'venue', label: 'Venue / Club' },
                          { id: 'organizer', label: 'Event Organizer' },
                          { id: 'fan', label: 'Fan / Audience' },
                        ].map((r) => (
                          <button
                            key={r.id}
                            type="button"
                            onClick={() => setRole(r.id as any)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors cursor-pointer border ${
                              role === r.id
                                ? 'bg-white/15 border-white text-white font-bold'
                                : 'bg-white/[0.02] border-white/10 text-zinc-400 hover:text-zinc-200'
                            }`}
                          >
                            {r.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Main Description Input */}
                    <div>
                      <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
                        {activeTab === 'problem'
                          ? 'What is the biggest problem in live gigs you want us to solve?'
                          : 'What feature would make your gig workflow 10x better?'}
                      </label>
                      <textarea
                        rows={3}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder={
                          activeTab === 'problem'
                            ? 'e.g., Promoters delaying payments for 60 days, fake promoters, last-minute venue cancellations...'
                            : 'e.g., Automated riders generator, split-payouts for band members, verified stage sound specs...'
                        }
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/15 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#F25A2B] transition-colors resize-none"
                      />
                    </div>

                    {/* Name & Contact Info (Optional) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Your Name or @handle (optional)"
                          className="w-full px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/15 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-white/30"
                        />
                      </div>
                      <div>
                        <input
                          type="text"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="Email or WhatsApp (optional)"
                          className="w-full px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/15 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-white/30"
                        />
                      </div>
                    </div>

                    {errorMsg && (
                      <p className="text-xs text-red-400 font-mono">{errorMsg}</p>
                    )}

                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-[#F25A2B] via-[#D4567A] to-[#7C5CFF] text-white font-mono font-bold text-xs uppercase tracking-wider shadow-lg hover:opacity-95 active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{submitting ? 'Submitting...' : 'Send To The Founders'}</span>
                    </button>
                  </form>
                ) : (
                  <div className="py-8 text-center space-y-3 rounded-2xl bg-white/[0.02] border border-white/10">
                    <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                    <h4 className="font-display text-lg font-bold text-white">
                      Voice Recorded!
                    </h4>
                    <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                      Thank you for sharing your thoughts. Our founding engineering team is reading every submission to shape the platform.
                    </p>
                    <button
                      type="button"
                      onClick={resetForm}
                      className="px-4 py-1.5 rounded-full bg-white/10 text-zinc-300 hover:text-white text-xs font-mono cursor-pointer transition-colors mt-2"
                    >
                      Submit Another Idea
                    </button>
                  </div>
                )}
              </div>

            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
