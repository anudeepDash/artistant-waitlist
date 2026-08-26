'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { getPublicCreatorsDirectoryAction } from '@/lib/profile-actions';
import { motion, AnimatePresence } from 'motion/react';
import { Search, MapPin, CheckCircle, Sparkles, Filter, Music, ArrowRight, UserCheck, Briefcase } from 'lucide-react';
import Link from 'next/link';

const CATEGORIES = [
  { id: 'all', label: 'All Creators' },
  { id: 'singer', label: 'Singers & Vocalists' },
  { id: 'dj', label: 'DJs & Electronic' },
  { id: 'band', label: 'Bands & Collectives' },
  { id: 'comedian', label: 'Stand-Up Comedians' },
  { id: 'dancer', label: 'Dancers & Choreographers' },
  { id: 'mc_rapper', label: 'MCs & Rappers' },
  { id: 'instrumentalist', label: 'Instrumentalists' },
];

const CITIES = ['all', 'Bengaluru', 'Mumbai', 'Delhi NCR', 'Goa', 'Hyderabad', 'Pune'];

export default function DirectoryPage() {
  const [creators, setCreators] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedCity, setSelectedCity] = useState('all');
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  const fetchCreators = async () => {
    setLoading(true);
    try {
      const data = await getPublicCreatorsDirectoryAction({
        category: selectedCategory,
        city: selectedCity,
        search,
        verifiedOnly,
      });
      setCreators(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCreators();
  }, [selectedCategory, selectedCity, verifiedOnly]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCreators();
  };

  return (
    <main className="min-h-screen bg-[var(--bg)] text-[var(--ink)] flex flex-col font-sans">
      <Navbar />

      {/* Header Banner */}
      <section className="relative pt-32 pb-16 px-4 sm:px-6 md:px-12 border-b border-[var(--line-soft)] overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-40 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#F25A2B]/15 via-transparent to-transparent"
        />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#F25A2B]/30 bg-[#F25A2B]/10 text-[#F25A2B] text-xs font-mono font-semibold uppercase tracking-wider mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Public Artist Directory</span>
          </div>

          <h1 className="font-display font-black text-4xl sm:text-6xl text-[var(--ink)] tracking-tight leading-tight mb-4">
            Discover Verified <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F25A2B] via-[#D4567A] to-[#7C5CFF]">Live Performers</span>
          </h1>

          <p className="text-[var(--ink-2)] text-base sm:text-xl max-w-2xl mx-auto font-light leading-relaxed mb-8">
            Explore independent singers, DJs, bands, and comedians ready for direct bookings.
          </p>

          {/* Search Form */}
          <form onSubmit={handleSearchSubmit} className="max-w-xl mx-auto relative flex items-center">
            <Search className="absolute left-4 w-5 h-5 text-zinc-400 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by artist name or @username..."
              className="w-full pl-12 pr-28 py-3.5 rounded-full border border-[var(--line)] bg-[var(--bg-card)] text-sm text-[var(--ink)] placeholder:text-zinc-500 focus:outline-none focus:border-[#7C5CFF] shadow-lg transition-all"
            />
            <button
              type="submit"
              className="absolute right-1.5 px-5 py-2 rounded-full bg-[#7C5CFF] text-white text-xs font-bold font-mono uppercase hover:bg-[#6838FF] transition-all cursor-pointer"
            >
              Search
            </button>
          </form>
        </div>
      </section>

      {/* Filter Controls */}
      <section className="py-6 px-4 sm:px-6 md:px-12 border-b border-[var(--line-soft)] bg-[var(--bg-card)]">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          
          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto w-full lg:w-auto pb-2 lg:pb-0 hide-scrollbar">
            <Link
              href="/card"
              className="px-4 py-2 rounded-full text-xs font-mono font-bold uppercase whitespace-nowrap transition-all cursor-pointer bg-gradient-to-r from-[#F25A2B] to-[#7C5CFF] text-white shadow-md flex items-center gap-1.5 shrink-0 hover:scale-[1.03] active:scale-95"
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>Founders & Executive Team</span>
            </Link>

            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-full text-xs font-mono font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-[#F25A2B] text-white shadow-md'
                    : 'bg-black/20 text-zinc-400 hover:text-white border border-white/5'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* City & Verified Filters */}
          <div className="flex items-center gap-3 shrink-0">
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="px-3.5 py-2 rounded-full border border-[var(--line)] bg-[var(--bg)] text-xs font-mono text-[var(--ink)] focus:outline-none focus:border-[#7C5CFF]"
            >
              <option value="all">All Cities</option>
              {CITIES.filter(c => c !== 'all').map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>

            <button
              onClick={() => setVerifiedOnly(!verifiedOnly)}
              className={`px-3.5 py-2 rounded-full border text-xs font-mono font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                verifiedOnly
                  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                  : 'bg-black/20 border-white/10 text-zinc-400 hover:text-white'
              }`}
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Verified Only</span>
            </button>
          </div>
        </div>
      </section>

      {/* Directory Grid */}
      <section className="py-12 px-4 sm:px-6 md:px-12 max-w-7xl mx-auto w-full flex-1">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-2 border-[#7C5CFF] border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-mono text-zinc-400">Loading artists...</span>
          </div>
        ) : creators.length === 0 ? (
          <div className="py-20 text-center text-zinc-400 space-y-3">
            <Music className="w-10 h-10 mx-auto text-zinc-600" />
            <h3 className="text-lg font-bold text-white font-display">No artists found</h3>
            <p className="text-xs font-light max-w-md mx-auto">
              Try adjusting your category or city filters to discover available talent.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mobile-swipe-carousel">
            {creators.map((creator) => (
              <motion.div
                key={creator.username}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="group relative rounded-3xl border border-[var(--line)] bg-[var(--bg-card)] overflow-hidden shadow-xl hover:border-white/20 transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Top Cover / Header */}
                  <div className="h-28 w-full bg-gradient-to-r from-[#1A0E25] via-[#120D1D] to-[#1F122B] relative overflow-hidden">
                    {creator.cover_photo_url ? (
                      <img src={creator.cover_photo_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-[#F25A2B]/20 to-[#7C5CFF]/20 opacity-50" />
                    )}

                    {creator.is_verified && (
                      <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1 backdrop-blur-md">
                        <CheckCircle className="w-3 h-3" />
                        <span>Verified</span>
                      </span>
                    )}
                  </div>

                  {/* Profile Avatar & Details */}
                  <div className="px-5 pt-0 pb-4 relative">
                    <div className="-mt-10 mb-3 flex items-end justify-between">
                      <div className="w-16 h-16 rounded-2xl border-2 border-[var(--bg-card)] overflow-hidden bg-black shadow-lg">
                        {creator.profile_photo_url ? (
                          <img src={creator.profile_photo_url} alt={creator.display_name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-zinc-800 text-white font-bold font-mono">
                            {creator.username.slice(0, 2).toUpperCase()}
                          </div>
                        )}
                      </div>

                      <span className="text-[10px] font-mono font-semibold uppercase px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-zinc-400">
                        {creator.category || 'Performer'}
                      </span>
                    </div>

                    <h3 className="font-display font-bold text-lg text-[var(--ink)] tracking-tight truncate">
                      {creator.display_name || creator.username}
                    </h3>
                    <p className="text-xs font-mono text-[#7C5CFF] mb-2 truncate">
                      @{creator.username}
                    </p>

                    {creator.city && (
                      <div className="flex items-center gap-1 text-xs text-zinc-400 font-light mb-3">
                        <MapPin className="w-3.5 h-3.5 text-[#F25A2B]" />
                        <span>{creator.city}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Action */}
                <div className="px-5 pb-5 pt-2 border-t border-[var(--line-soft)]">
                  <Link
                    href={`/${creator.username}`}
                    className="w-full py-2.5 px-4 rounded-xl bg-white/5 hover:bg-[#7C5CFF] text-white text-xs font-mono font-bold uppercase transition-all flex items-center justify-center gap-2 group-hover:shadow-md cursor-pointer"
                  >
                    <span>View Booking Page</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      <Footer />
    </main>
  );
}
