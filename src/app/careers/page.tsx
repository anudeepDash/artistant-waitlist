'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { 
  adminGetCareerJobsAction, 
  submitCareerApplicationAction, 
  type CareerJob 
} from '@/lib/admin-actions';
import { useAuth } from '@/hooks/useAuth';
import { ToastNotification } from '@/components/ToastNotification';
import { 
  Briefcase, 
  MapPin, 
  Clock, 
  Sparkles, 
  Zap, 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle2, 
  XCircle, 
  Search, 
  Send, 
  Globe, 
  Heart, 
  Code, 
  Palette, 
  Rocket, 
  Flame, 
  ExternalLink 
} from 'lucide-react';

export default function CareersPage() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<CareerJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDept, setSelectedDept] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Application Modal State
  const [selectedJob, setSelectedJob] = useState<CareerJob | null>(null);
  const [applicantName, setApplicantName] = useState('');
  const [applicantEmail, setApplicantEmail] = useState('');
  const [applicantPhone, setApplicantPhone] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [resumeUrl, setResumeUrl] = useState('');
  const [experienceYears, setExperienceYears] = useState('3+ Years');
  const [coverNote, setCoverNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  useEffect(() => {
    adminGetCareerJobsAction()
      .then((data) => {
        if (data && data.length > 0) setJobs(data);
      })
      .catch((err) => console.warn('Using default career jobs:', err))
      .finally(() => setLoading(false));
  }, []);

  const departments = ['All', ...Array.from(new Set(jobs.map((j) => j.department)))];

  const filteredJobs = jobs.filter((j) => {
    if (!j.is_active) return false;
    if (selectedDept !== 'All' && j.department !== selectedDept) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        j.title.toLowerCase().includes(q) ||
        j.department.toLowerCase().includes(q) ||
        j.description.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJob || !applicantName.trim() || !applicantEmail.trim()) return;

    setSubmitting(true);
    try {
      const res = await submitCareerApplicationAction({
        job_id: selectedJob.id,
        job_title: selectedJob.title,
        applicant_name: applicantName,
        email: applicantEmail,
        phone: applicantPhone,
        portfolio_url: portfolioUrl,
        resume_url: resumeUrl,
        experience_years: experienceYears,
        cover_note: coverNote,
      });

      setToastMsg(res.message || 'Application submitted successfully! We will reach out shortly.');
      setSelectedJob(null);
      setApplicantName('');
      setApplicantEmail('');
      setApplicantPhone('');
      setPortfolioUrl('');
      setResumeUrl('');
      setCoverNote('');
    } catch (err: any) {
      setToastMsg(`Submission error: ${err.message || 'Please try again.'}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="bg-tech-grid min-h-screen relative" style={{ background: 'var(--bg)', color: 'var(--ink)' }}>
      {/* Toast Notifications */}
      <ToastNotification message={toastMsg} onClose={() => setToastMsg(null)} position="top-right" />

      {/* Navigation Header */}
      <Navbar user={user} />

      {/* ──────────────────────── HERO SECTION ──────────────────────── */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 max-w-7xl mx-auto text-center overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-r from-[#F25A2B]/15 via-[#7C5CFF]/20 to-[#D4567A]/15 blur-3xl pointer-events-none rounded-full" />

        <div className="relative z-10 space-y-6 max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#F25A2B]/15 border border-[#F25A2B]/30 text-[#F25A2B] text-xs font-mono font-extrabold uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5" />
            <span>CAREERS @ ARTISTANT</span>
          </div>

          {/* Main Title */}
          <h1 
            className="text-4xl sm:text-6xl lg:text-7xl font-display font-extrabold tracking-tight text-ink uppercase"
            style={{ fontFamily: '"Space Grotesk", sans-serif', lineHeight: 1.05 }}
          >
            BUILD THE FUTURE OF <br />
            <span className="bg-gradient-to-r from-[#F25A2B] via-[#D4567A] to-[#7C5CFF] bg-clip-text text-transparent">
              LIVE PERFORMANCE
            </span>
          </h1>

          <p className="text-base sm:text-lg text-ink-2 max-w-2xl mx-auto font-sans leading-relaxed">
            We are building India&apos;s first dedicated booking operating system — replacing informal WhatsApp chats, unreliable middle-men, and delayed payments with autonomous booking infrastructure.
          </p>

          {/* Quick Metrics Banner */}
          <div className="pt-6 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {[
              { label: 'Platform Fee', val: '0% Lifetime', color: '#F25A2B' },
              { label: 'Target Market', val: 'India Live Gig Ops', color: '#7C5CFF' },
              { label: 'Work Culture', val: 'Remote & Async', color: '#D4567A' },
              { label: 'Open Positions', val: `${jobs.filter(j => j.is_active).length} Roles`, color: '#00E5FF' },
            ].map((m) => (
              <div key={m.label} className="p-4 rounded-2xl bg-bg-card border border-line-soft shadow-lg text-center space-y-1">
                <span className="text-base sm:text-xl font-display font-bold block" style={{ color: m.color }}>
                  {m.val}
                </span>
                <span className="text-[10px] font-mono text-ink-3 uppercase tracking-wider block">
                  {m.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ──────────────────────── CULTURE & PERKS BENTO GRID ──────────────────────── */}
      <section className="py-16 px-4 sm:px-6 max-w-7xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <span className="text-xs font-mono font-bold text-[#7C5CFF] uppercase tracking-widest block">
            WHY JOIN ARTISTANT?
          </span>
          <h2 className="text-2xl sm:text-4xl font-display font-bold text-ink uppercase">
            CULTURE &amp; FOUNDING PERKS
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              title: "0% Commission Ethos",
              icon: Zap,
              color: "#F25A2B",
              desc: "We stand firmly with artists. Our infrastructure passes 100% of performance earnings directly to creators without agent markups."
            },
            {
              title: "Remote-First & Flexible",
              icon: Globe,
              color: "#7C5CFF",
              desc: "Work from anywhere in India with flexible core async hours. We measure outcomes, speed of execution, and pristine code."
            },
            {
              title: "Early Equity & Growth",
              icon: Rocket,
              color: "#D4567A",
              desc: "Every core team member receives generous founding equity grants, transparent ownership, and high upward mobility."
            },
            {
              title: "Creator-First Community",
              icon: Heart,
              color: "#00E5FF",
              desc: "Direct access to top performing artists, DJs, bands, and festival curators across India. Test products with real legends."
            },
            {
              title: "Sub-50ms Engineering",
              icon: Code,
              color: "#F25A2B",
              desc: "We obsess over latency, smooth web socket synchronization, atomic escrow locks, and high-performance frontend interfaces."
            },
            {
              title: "Live Gig & Show Stipend",
              icon: Flame,
              color: "#7C5CFF",
              desc: "Annual stipend allocated specifically to buy tickets for live music concerts, stand-up comedy, and cultural festivals."
            }
          ].map((perk) => (
            <motion.div
              key={perk.title}
              whileHover={{ y: -4, borderColor: perk.color }}
              className="p-7 rounded-3xl bg-bg-card border border-line-soft shadow-xl space-y-3 relative overflow-hidden group transition-all"
            >
              <div 
                className="w-12 h-12 rounded-2xl flex items-center justify-center border transition-all"
                style={{ backgroundColor: `${perk.color}15`, borderColor: `${perk.color}30`, color: perk.color }}
              >
                <perk.icon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-display font-bold text-ink tracking-tight uppercase">
                {perk.title}
              </h3>
              <p className="text-xs text-ink-2 leading-relaxed font-sans">
                {perk.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ──────────────────────── OPEN POSITIONS DIRECTORY ──────────────────────── */}
      <section id="openings" className="py-16 px-4 sm:px-6 max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-line-soft/60 pb-6">
          <div>
            <span className="text-xs font-mono font-bold text-[#F25A2B] uppercase tracking-widest block">
              JOIN THE TEAM
            </span>
            <h2 className="text-2xl sm:text-4xl font-display font-bold text-ink uppercase">
              OPEN OPPORTUNITIES ({filteredJobs.length})
            </h2>
          </div>

          {/* Department Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
            {departments.map((dept) => (
              <button
                key={dept}
                onClick={() => setSelectedDept(dept)}
                className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer whitespace-nowrap ${
                  selectedDept === dept
                    ? "bg-[#7C5CFF] text-white shadow-lg shadow-[#7C5CFF]/30"
                    : "bg-bg-card text-ink-3 hover:text-ink border border-line-soft"
                }`}
              >
                {dept}
              </button>
            ))}
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-ink-3 absolute left-4 top-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search open roles, skills, or departments..."
            className="w-full pl-11 pr-4 py-3 rounded-2xl bg-bg-card border border-line-soft text-ink text-xs focus:outline-none focus:border-[#7C5CFF]"
          />
        </div>

        {/* Job Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredJobs.map((job) => (
            <motion.div
              key={job.id}
              whileHover={{ scale: 1.01, borderColor: '#F25A2B' }}
              className="p-7 rounded-3xl bg-bg-card border border-line-soft shadow-xl space-y-5 flex flex-col justify-between transition-all group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="px-3 py-1 rounded-full bg-[#F25A2B]/15 text-[#F25A2B] border border-[#F25A2B]/30 text-[10px] font-mono font-bold uppercase tracking-wider">
                    {job.department}
                  </span>
                  <span className="px-3 py-1 rounded-full bg-bg-soft text-ink-3 border border-line-soft text-[10px] font-mono">
                    {job.job_type}
                  </span>
                </div>

                <h3 className="text-xl font-display font-bold text-ink tracking-tight group-hover:text-[#F25A2B] transition-colors">
                  {job.title}
                </h3>

                <p className="text-xs text-ink-2 leading-relaxed font-sans line-clamp-3">
                  {job.description}
                </p>

                {/* Requirements Pills */}
                {job.requirements && job.requirements.length > 0 && (
                  <div className="space-y-1.5 pt-2">
                    <span className="text-[10px] font-mono uppercase font-bold text-ink-3 block">Key Criteria</span>
                    <ul className="space-y-1 text-xs text-ink-2 font-mono">
                      {job.requirements.slice(0, 2).map((req, idx) => (
                        <li key={idx} className="flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span className="truncate">{req}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-line-soft/50 flex items-center justify-between gap-3">
                <div className="text-xs font-mono text-ink-3 space-y-0.5">
                  <div className="flex items-center gap-1.5 font-bold text-ink">
                    <MapPin className="w-3.5 h-3.5 text-[#F25A2B]" />
                    <span>{job.location}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px]">
                    <Clock className="w-3.5 h-3.5 text-[#7C5CFF]" />
                    <span>{job.salary_range}</span>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedJob(job)}
                  className="px-5 py-2.5 rounded-2xl bg-[#F25A2B] hover:bg-[#d9481c] text-white font-mono font-bold text-xs shadow-lg shadow-[#F25A2B]/30 transition-all active:scale-95 cursor-pointer flex items-center gap-2"
                >
                  <span>Apply Now</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredJobs.length === 0 && (
          <div className="p-12 text-center rounded-3xl bg-bg-card border border-line-soft text-ink-3 font-mono text-sm space-y-2">
            <p>No open positions match your search filters right now.</p>
            <button
              onClick={() => { setSelectedDept('All'); setSearchQuery(''); }}
              className="text-[#7C5CFF] font-bold hover:underline"
            >
              Clear filters
            </button>
          </div>
        )}
      </section>

      {/* ──────────────────────── APPLICATION MODAL DIALOG ──────────────────────── */}
      <AnimatePresence>
        {selectedJob && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl bg-bg-card border border-line-soft rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-left my-auto"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-line-soft flex items-start justify-between bg-bg-soft/30">
                <div>
                  <span className="text-[10px] font-mono text-[#F25A2B] font-bold uppercase tracking-wider block">
                    APPLYING FOR {selectedJob.department.toUpperCase()}
                  </span>
                  <h3 className="text-xl font-display font-bold text-ink">
                    {selectedJob.title}
                  </h3>
                  <div className="flex items-center gap-4 text-xs font-mono text-ink-3 mt-1.5">
                    <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-[#F25A2B]" /> {selectedJob.location}</span>
                    <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-[#7C5CFF]" /> {selectedJob.salary_range}</span>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedJob(null)}
                  className="w-8 h-8 rounded-xl flex items-center justify-center bg-bg-soft text-ink-3 hover:text-ink transition-all cursor-pointer shrink-0"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Application Form */}
              <form onSubmit={handleApplySubmit} className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-mono font-bold text-ink-2 mb-1 block">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={applicantName}
                      onChange={(e) => setApplicantName(e.target.value)}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full px-4 py-2.5 rounded-xl bg-bg-soft border border-line-soft text-ink text-xs focus:outline-none focus:border-[#F25A2B]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-mono font-bold text-ink-2 mb-1 block">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={applicantEmail}
                      onChange={(e) => setApplicantEmail(e.target.value)}
                      placeholder="e.g. rahul@domain.com"
                      className="w-full px-4 py-2.5 rounded-xl bg-bg-soft border border-line-soft text-ink font-mono text-xs focus:outline-none focus:border-[#F25A2B]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-mono font-bold text-ink-2 mb-1 block">Phone / WhatsApp Number</label>
                    <input
                      type="text"
                      value={applicantPhone}
                      onChange={(e) => setApplicantPhone(e.target.value)}
                      placeholder="e.g. +91 98765 43210"
                      className="w-full px-4 py-2.5 rounded-xl bg-bg-soft border border-line-soft text-ink font-mono text-xs focus:outline-none focus:border-[#F25A2B]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-mono font-bold text-ink-2 mb-1 block">Years of Experience</label>
                    <select
                      value={experienceYears}
                      onChange={(e) => setExperienceYears(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-bg-soft border border-line-soft text-ink text-xs focus:outline-none"
                    >
                      <option value="1-2 Years">1 - 2 Years</option>
                      <option value="3-5 Years">3 - 5 Years</option>
                      <option value="5+ Years">5+ Years</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-mono font-bold text-ink-2 mb-1 block">
                    Portfolio / GitHub / LinkedIn URL *
                  </label>
                  <input
                    type="url"
                    required
                    value={portfolioUrl}
                    onChange={(e) => setPortfolioUrl(e.target.value)}
                    placeholder="https://github.com/username or https://behance.net/username"
                    className="w-full px-4 py-2.5 rounded-xl bg-bg-soft border border-line-soft text-ink font-mono text-xs focus:outline-none focus:border-[#F25A2B]"
                  />
                </div>

                <div>
                  <label className="text-xs font-mono font-bold text-ink-2 mb-1 block">
                    Resume / PDF Link (Google Drive, Notion, Cloud storage)
                  </label>
                  <input
                    type="url"
                    value={resumeUrl}
                    onChange={(e) => setResumeUrl(e.target.value)}
                    placeholder="https://drive.google.com/file/d/..."
                    className="w-full px-4 py-2.5 rounded-xl bg-bg-soft border border-line-soft text-ink font-mono text-xs focus:outline-none focus:border-[#F25A2B]"
                  />
                </div>

                <div>
                  <label className="text-xs font-mono font-bold text-ink-2 mb-1 block">
                    Why Artistant? (Short Cover Note)
                  </label>
                  <textarea
                    rows={4}
                    value={coverNote}
                    onChange={(e) => setCoverNote(e.target.value)}
                    placeholder="Tell us about the cool things you've built and why you want to build for creators..."
                    className="w-full p-3 rounded-xl bg-bg-soft border border-line-soft text-ink font-sans text-xs focus:outline-none focus:border-[#F25A2B]"
                  />
                </div>

                <div className="pt-3 border-t border-line-soft flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setSelectedJob(null)}
                    className="px-4 py-2.5 rounded-xl bg-bg-soft text-ink-2 text-xs font-mono font-bold hover:text-ink cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2.5 rounded-xl bg-[#F25A2B] hover:bg-[#d9481c] text-white font-mono font-bold text-xs shadow-lg shadow-[#F25A2B]/30 transition-all active:scale-95 disabled:opacity-50 cursor-pointer flex items-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>{submitting ? 'Submitting...' : 'Submit Application'}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <Footer />
    </main>
  );
}
