'use client';

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { motion, AnimatePresence } from 'motion/react';
import { Briefcase, MapPin, DollarSign, Calendar, Sparkles, Send, CheckCircle2, X } from 'lucide-react';

const GIG_OPPORTUNITIES = [
  {
    id: 'gig-1',
    title: 'Lead Acoustic Vocalist for High-End Lounge',
    organizer: 'The Black Rabbit Lounge',
    city: 'Bengaluru',
    budget: '₹25,000 - ₹35,000 / Set',
    type: 'Club / Venue Gig',
    date: 'Aug 18, 2026',
    desc: 'Seeking a soulful acoustic vocalist for weekly Friday night acoustic sessions. Must have showreels and 2+ hours live set repertoire.',
    category: 'singer',
  },
  {
    id: 'gig-[#2]',
    title: 'Headliner DJ for Sunset Beach Showcase',
    organizer: 'Sunburn Select Gigs',
    city: 'Goa',
    budget: '₹50,000 - ₹75,000',
    type: 'Festival / Outdoor',
    date: 'Aug 22, 2026',
    desc: 'Looking for a high-energy House/Techno DJ to perform a 90-minute sunset set. Sound check provided on site.',
    category: 'dj',
  },
  {
    id: 'gig-3',
    title: 'Corporate Annual Gala Stand-Up Opener',
    organizer: 'TechCorp India Summit',
    city: 'Mumbai',
    budget: '₹40,000',
    type: 'Corporate Event',
    date: 'Sep 05, 2026',
    desc: 'Looking for an energetic, clean-humor stand-up comedian for a 30-minute opening performance.',
    category: 'comedian',
  },
  {
    id: 'gig-4',
    title: 'Live Fusion Band for Destination Wedding',
    organizer: 'Royal Celebrations Co.',
    city: 'Udaipur / Delhi NCR',
    budget: '₹1,20,000 - ₹1,50,000',
    type: 'Wedding / Private Gala',
    date: 'Sep 14, 2026',
    desc: '4-piece fusion band needed for sangeet evening. Full PA sound setup provided.',
    category: 'band',
  },
];

export default function GigBoardPage() {
  const [selectedGig, setSelectedGig] = useState<any | null>(null);
  const [proposalSubmitted, setProposalSubmitted] = useState(false);
  const [performerHandle, setPerformerHandle] = useState('');
  const [proposalText, setProposalText] = useState('');

  const handleSubmitProposal = (e: React.FormEvent) => {
    e.preventDefault();
    setProposalSubmitted(true);
    setTimeout(() => {
      setProposalSubmitted(false);
      setSelectedGig(null);
      setPerformerHandle('');
      setProposalText('');
    }, 2500);
  };

  return (
    <main className="min-h-screen bg-[var(--bg)] text-[var(--ink)] flex flex-col font-sans">
      <Navbar />

      {/* Header */}
      <section className="relative pt-32 pb-16 px-4 sm:px-6 md:px-12 border-b border-[var(--line-soft)] overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-40 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#7C5CFF]/15 via-transparent to-transparent"
        />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#7C5CFF]/30 bg-[#7C5CFF]/10 text-[#7C5CFF] text-xs font-mono font-semibold uppercase tracking-wider mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Opportunities Board</span>
          </div>

          <h1 className="font-display font-black text-4xl sm:text-6xl text-[var(--ink)] tracking-tight leading-tight mb-4">
            Live Gigs & <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F25A2B] via-[#D4567A] to-[#7C5CFF]">Brand Calls</span>
          </h1>

          <p className="text-[var(--ink-2)] text-base sm:text-xl max-w-2xl mx-auto font-light leading-relaxed">
            Apply to verified gig calls from premium venues, event planners, and corporate brands.
          </p>
        </div>
      </section>

      {/* Gigs List */}
      <section className="py-12 px-4 sm:px-6 md:px-12 max-w-6xl mx-auto w-full flex-1">
        <div className="space-y-6 mobile-swipe-carousel">
          {GIG_OPPORTUNITIES.map((gig) => (
            <motion.div
              key={gig.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 sm:p-8 rounded-3xl border border-[var(--line)] bg-[var(--bg-card)] shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:border-white/20 transition-all"
            >
              <div className="space-y-3 flex-1">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-[#F25A2B]/10 text-[#F25A2B] border border-[#F25A2B]/30">
                    {gig.type}
                  </span>
                  <div className="flex items-center gap-1 text-xs font-mono text-zinc-400">
                    <MapPin className="w-3.5 h-3.5 text-zinc-500" />
                    <span>{gig.city}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs font-mono text-zinc-400">
                    <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                    <span>{gig.date}</span>
                  </div>
                </div>

                <h3 className="font-display font-bold text-xl sm:text-2xl text-[var(--ink)]">
                  {gig.title}
                </h3>
                <p className="text-xs font-mono text-zinc-400">
                  Posted by <strong className="text-white">{gig.organizer}</strong>
                </p>
                <p className="text-sm text-[var(--ink-2)] font-light leading-relaxed">
                  {gig.desc}
                </p>
              </div>

              {/* Budget & Action */}
              <div className="flex flex-col items-start md:items-end gap-3 shrink-0 w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0 border-[var(--line-soft)]">
                <div className="text-left md:text-right">
                  <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest block font-semibold">
                    Payout / Budget
                  </span>
                  <span className="font-mono font-extrabold text-lg sm:text-xl text-emerald-400">
                    {gig.budget}
                  </span>
                </div>

                <button
                  onClick={() => setSelectedGig(gig)}
                  className="w-full md:w-auto px-6 py-3 rounded-full bg-gradient-to-r from-[#F25A2B] to-[#7C5CFF] text-white font-bold text-xs font-mono uppercase tracking-wider hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer shadow-md"
                >
                  Submit Proposal
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Proposal Drawer Modal */}
      <AnimatePresence>
        {selectedGig && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-lg p-6 sm:p-8 rounded-3xl border border-white/10 bg-[#0F0F12] text-white shadow-2xl overflow-hidden"
            >
              <button
                onClick={() => setSelectedGig(null)}
                className="absolute top-4 right-4 p-2 rounded-full text-zinc-400 hover:text-white transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              {proposalSubmitted ? (
                <div className="py-12 text-center space-y-3">
                  <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
                  <h3 className="font-display font-bold text-2xl text-white">Proposal Submitted!</h3>
                  <p className="text-xs text-zinc-400 font-light">
                    The organizer will review your Artistant portfolio link and reach out directly.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmitProposal} className="space-y-4">
                  <div>
                    <span className="text-[10px] font-mono text-[#F25A2B] font-bold uppercase tracking-wider block mb-1">
                      {selectedGig.type}
                    </span>
                    <h3 className="font-display font-bold text-xl text-white">
                      {selectedGig.title}
                    </h3>
                  </div>

                  <div>
                    <label className="text-xs font-mono text-zinc-400 block mb-1.5">
                      Your Artistant @Username
                    </label>
                    <input
                      type="text"
                      required
                      value={performerHandle}
                      onChange={(e) => setPerformerHandle(e.target.value)}
                      placeholder="e.g. kaavya"
                      className="w-full px-4 py-3 rounded-2xl border border-white/10 bg-black/40 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#7C5CFF]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-mono text-zinc-400 block mb-1.5">
                      Proposal / Performance Note
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={proposalText}
                      onChange={(e) => setProposalText(e.target.value)}
                      placeholder="Briefly state your set duration, tech setup, and availability..."
                      className="w-full px-4 py-3 rounded-2xl border border-white/10 bg-black/40 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#7C5CFF]"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#F25A2B] to-[#7C5CFF] text-white font-bold text-xs font-mono uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.01] active:scale-[0.99] transition-all"
                  >
                    <Send className="w-4 h-4" />
                    <span>Send Proposal via Artistant</span>
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Footer />
    </main>
  );
}
