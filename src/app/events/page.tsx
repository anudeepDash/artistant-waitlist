'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { motion } from 'motion/react';
import { Calendar, MapPin, Sparkles, Clock, Ticket } from 'lucide-react';

const EVENTS = [
  {
    id: 'evt-1',
    title: 'ArtisTant Founding Artists Showcase Live',
    date: 'Aug 25, 2026',
    time: '7:00 PM IST',
    city: 'Bengaluru',
    venue: 'Indiranagar Social',
    desc: 'An exclusive live performance showcase featuring Cohort 001 independent vocalists and DJs.',
    tag: 'Platform Showcase',
  },
  {
    id: 'evt-2',
    title: 'Independent Artist Masterclass: Direct Booking & Riders',
    date: 'Sep 02, 2026',
    time: '5:00 PM IST',
    city: 'Online Stream',
    venue: 'ArtisTant Live Studio',
    desc: 'Workshop on setting performance rates, technical rider best practices, and 0% fee contracts.',
    tag: 'Workshop',
  },
  {
    id: 'evt-3',
    title: 'Mumbai Indie Sunset Sessions',
    date: 'Sep 12, 2026',
    time: '6:30 PM IST',
    city: 'Mumbai',
    venue: 'Bandra Amphitheatre',
    desc: 'Sunset acoustic gig featuring 4 verified Artistant performers.',
    tag: 'Live Concert',
  },
];

export default function EventsPage() {
  return (
    <main className="min-h-screen bg-[var(--bg)] text-[var(--ink)] flex flex-col font-sans">
      <Navbar />

      {/* Header Banner */}
      <section className="relative pt-32 pb-16 px-4 sm:px-6 md:px-12 border-b border-[var(--line-soft)] overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-40 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#D4567A]/15 via-transparent to-transparent"
        />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#D4567A]/30 bg-[#D4567A]/10 text-[#D4567A] text-xs font-mono font-semibold uppercase tracking-wider mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Event Calendar</span>
          </div>

          <h1 className="font-display font-black text-4xl sm:text-6xl text-[var(--ink)] tracking-tight leading-tight mb-4">
            Showcases & <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F25A2B] via-[#D4567A] to-[#7C5CFF]">Live Events</span>
          </h1>

          <p className="text-[var(--ink-2)] text-base sm:text-xl max-w-2xl mx-auto font-light leading-relaxed">
            Discover live artist showcases, creator workshops, and performance meetups.
          </p>
        </div>
      </section>

      {/* Event Cards */}
      <section className="py-16 px-4 sm:px-6 md:px-12 max-w-5xl mx-auto w-full flex-1">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mobile-swipe-carousel">
          {EVENTS.map((event, idx) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="p-6 sm:p-8 rounded-3xl border border-[var(--line)] bg-[var(--bg-card)] shadow-xl flex flex-col justify-between hover:border-white/20 transition-all group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-4">
                  <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-[#D4567A]/10 text-[#D4567A] border border-[#D4567A]/30">
                    {event.tag}
                  </span>
                  <div className="flex items-center gap-1 text-xs font-mono text-zinc-400">
                    <MapPin className="w-3.5 h-3.5 text-[#F25A2B]" />
                    <span>{event.city}</span>
                  </div>
                </div>

                <h3 className="font-display font-bold text-xl text-[var(--ink)] mb-2 leading-snug">
                  {event.title}
                </h3>

                <div className="space-y-1.5 mb-4 text-xs font-mono text-zinc-400">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#7C5CFF]" />
                    <span>{event.date}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-zinc-500" />
                    <span>{event.time}</span>
                  </div>
                </div>

                <p className="text-xs text-[var(--ink-2)] font-light leading-relaxed mb-6">
                  {event.desc}
                </p>
              </div>

              <div className="pt-4 border-t border-[var(--line-soft)] flex items-center justify-between">
                <span className="text-xs font-mono text-zinc-400 font-semibold">{event.venue}</span>
                <button className="px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-[#D4567A] text-white text-[11px] font-mono font-bold uppercase transition-all cursor-pointer flex items-center gap-1">
                  <Ticket className="w-3.5 h-3.5" />
                  <span>RSVP</span>
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <Footer />
    </main>
  );
}
