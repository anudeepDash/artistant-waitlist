'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ArrowRight, Check } from 'lucide-react';
import { submitMarketFeedbackAction, type MarketFeedbackInput } from '@/lib/admin-actions';

interface MarketFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ROLES = [
  { id: 'artist', label: 'Artist' },
  { id: 'venue', label: 'Venue' },
  { id: 'organizer', label: 'Organizer' },
  { id: 'fan', label: 'Fan' },
  { id: 'other', label: 'Other' },
] as const;

export default function MarketFeedbackModal({ isOpen, onClose }: MarketFeedbackModalProps) {
  const [activeTab, setActiveTab] = useState<'problem' | 'feature_request'>('problem');
  const [role, setRole] = useState<string>('artist');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || message.trim().length < 5) {
      setErrorMsg('Please write at least a few words.');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');

    try {
      const payload: MarketFeedbackInput = {
        name: name.trim() || undefined,
        email: email.trim() || undefined,
        role: role as any,
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
        <div className="fixed inset-0 z-[10002] flex items-center justify-center p-4 sm:p-8 bg-black/90 backdrop-blur-2xl overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-lg bg-[#0A0A0F] border border-white/[0.08] rounded-2xl shadow-2xl text-white my-auto"
          >
            {/* ─── Close ─── */}
            <button
              type="button"
              onClick={onClose}
              className="absolute top-4 right-4 z-10 w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 text-zinc-500 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>

            {/* ─── Content ─── */}
            <div className="px-6 pt-6 pb-2 sm:px-8 sm:pt-8">
              {/* Eyebrow */}
              <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-500 mb-3">
                Shape the platform
              </p>

              {/* Headline */}
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white leading-tight mb-4">
                Tell us what's broken<br className="sm:hidden" /> in live entertainment.
              </h2>

              {/* Mission — tight editorial copy, no cards */}
              <p className="text-[13px] text-zinc-400 leading-relaxed mb-6">
                <span className="text-white font-medium">ArtisTant</span> is a direct marketplace
                for live musicians, DJs, bands & venues — eliminating{' '}
                <span className="text-[#F25A2B] font-medium">20‑40% broker cuts</span>, replacing
                60‑day payment delays with{' '}
                <span className="text-[#06B6D4] font-medium">instant escrow</span>, and killing
                fragmented WhatsApp coordination with{' '}
                <span className="text-[#A78BFA] font-medium">verified direct bookings</span>.
              </p>
            </div>

            {/* ─── Form ─── */}
            {!submitted ? (
              <form onSubmit={handleSubmit} className="px-6 pb-6 sm:px-8 sm:pb-8 space-y-5">
                {/* Tab Toggle */}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab('problem')}
                    className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer border ${
                      activeTab === 'problem'
                        ? 'bg-white/[0.08] border-white/20 text-white'
                        : 'bg-transparent border-white/[0.06] text-zinc-500 hover:text-zinc-300 hover:border-white/10'
                    }`}
                  >
                    Market Problem
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('feature_request')}
                    className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer border ${
                      activeTab === 'feature_request'
                        ? 'bg-white/[0.08] border-white/20 text-white'
                        : 'bg-transparent border-white/[0.06] text-zinc-500 hover:text-zinc-300 hover:border-white/10'
                    }`}
                  >
                    Feature Request
                  </button>
                </div>

                {/* Role Pills */}
                <div>
                  <label className="block text-[11px] text-zinc-500 mb-2">
                    I am a
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {ROLES.map((r) => (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => setRole(r.id)}
                        className={`px-3 py-1 rounded-full text-[11px] font-medium transition-all cursor-pointer border ${
                          role === r.id
                            ? 'bg-white text-black border-white'
                            : 'bg-transparent border-white/[0.08] text-zinc-500 hover:text-zinc-300 hover:border-white/15'
                        }`}
                      >
                        {r.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label className="block text-[11px] text-zinc-500 mb-2">
                    {activeTab === 'problem'
                      ? 'Describe the problem you face'
                      : 'What feature would help you most?'}
                  </label>
                  <textarea
                    rows={3}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={
                      activeTab === 'problem'
                        ? 'e.g. Promoters ghosting after the gig, no way to verify venue legitimacy…'
                        : 'e.g. Auto-generated riders, split payouts for band members…'
                    }
                    className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.08] text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-white/20 transition-colors resize-none leading-relaxed"
                  />
                </div>

                {/* Contact — single row */}
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Name (optional)"
                    className="w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-white/20 transition-colors"
                  />
                  <input
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email (optional)"
                    className="w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-white/20 transition-colors"
                  />
                </div>

                {/* Error */}
                {errorMsg && (
                  <p className="text-xs text-red-400">{errorMsg}</p>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 rounded-xl bg-white text-black font-semibold text-sm tracking-tight hover:bg-zinc-200 active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-40"
                >
                  <span>{submitting ? 'Sending…' : 'Send to Founders'}</span>
                  {!submitting && <ArrowRight className="w-3.5 h-3.5" />}
                </button>
              </form>
            ) : (
              /* ─── Success State ─── */
              <div className="px-6 pb-8 sm:px-8 text-center">
                <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                  <Check className="w-5 h-5 text-emerald-400" />
                </div>

                <h3 className="text-lg font-semibold text-white mb-1.5">
                  Received.
                </h3>

                <p className="text-xs text-zinc-500 max-w-xs mx-auto mb-5 leading-relaxed">
                  Our founding team reads every submission. Your input directly shapes what we build.
                </p>

                <button
                  type="button"
                  onClick={resetForm}
                  className="px-5 py-2 rounded-full bg-white/[0.06] hover:bg-white/10 border border-white/[0.08] text-zinc-300 hover:text-white text-xs font-medium cursor-pointer transition-all"
                >
                  Submit another
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
