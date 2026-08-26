'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { 
  Briefcase, QrCode, Download, PhoneCall, ArrowRight, ShieldCheck, 
  UserCheck, Sparkles, Calendar, Mail, ExternalLink, Share2, Check
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ParticleBackground from '@/components/ParticleBackground';
import BusinessCardPreview from '@/components/BusinessCardPreview';
import BookCallModal from '@/components/BookCallModal';
import LinktreeQRModal from '@/components/LinktreeQRModal';
import { getAllTeamMembersMap, downloadVCard, type TeamMember } from '@/lib/team-data';

export default function CardDirectoryPage() {
  const [teamMap, setTeamMap] = useState<Record<string, TeamMember>>({});
  const [selectedUsername, setSelectedUsername] = useState<string>('anudeep');
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);

  const loadTeam = () => {
    const map = getAllTeamMembersMap();
    setTeamMap(map);
    const keys = Object.keys(map);
    if (keys.length > 0 && !map[selectedUsername]) {
      setSelectedUsername(keys[0]);
    }
  };

  useEffect(() => {
    loadTeam();
    window.addEventListener('artistant-team-updated', loadTeam);
    return () => window.removeEventListener('artistant-team-updated', loadTeam);
  }, []);

  const membersList = Object.values(teamMap);
  const selectedMember = teamMap[selectedUsername] || membersList[0];

  const activeUrl = selectedMember ? `https://artistant.in/card/${selectedMember.username}` : 'https://artistant.in/card';

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(activeUrl);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2500);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0D14] text-white flex flex-col font-sans selection:bg-[#F25A2B] selection:text-white relative overflow-hidden">
      {/* Ambient background particles */}
      <div className="fixed inset-0 pointer-events-none opacity-40 z-0">
        <ParticleBackground />
      </div>

      <Navbar />

      {/* Header */}
      <section className="relative pt-32 pb-12 px-4 md:px-6 overflow-hidden flex flex-col items-center justify-center text-center z-10">
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-[#7C5CFF]/25 via-[#F25A2B]/25 to-[#D4567A]/15 blur-[120px] pointer-events-none" />

        <div className="relative z-10 max-w-2xl w-full flex flex-col items-center">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#F25A2B]/15 border border-[#F25A2B]/30 text-[#F25A2B] font-mono text-xs uppercase font-bold tracking-wider mb-4 shadow-lg"
          >
            <Briefcase className="w-4 h-4" />
            <span>Digital Business Cards & Executive Hub</span>
          </motion.div>

          <h1 className="font-display text-4xl md:text-6xl font-extrabold tracking-tight text-white mb-3">
            Artistant Executive Team
          </h1>

          <p className="text-sm md:text-base text-white/70 max-w-lg leading-relaxed mb-6 font-normal">
            Physical business card QR codes & interactive digital profiles for instant contact saving, calendar syncs, and direct partner outreach.
          </p>

          {/* Member Selector Pills */}
          <div className="flex items-center justify-center gap-2 flex-wrap max-w-2xl">
            {membersList.map((m) => (
              <button
                key={m.username}
                onClick={() => setSelectedUsername(m.username)}
                className={`
                  px-4 py-2 rounded-2xl text-xs font-mono font-semibold transition-all cursor-pointer flex items-center gap-2 shadow-md
                  ${selectedUsername === m.username
                    ? 'bg-gradient-to-r from-[#F25A2B] to-[#7C5CFF] text-white font-bold scale-105 shadow-xl'
                    : 'bg-white/5 hover:bg-white/10 text-white/70 border border-white/10'}
                `}
              >
                <span>{m.name}</span>
                <span className="text-[10px] opacity-60">({m.badge})</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Main Interactive Preview Section */}
      {selectedMember && (
        <main className="flex-1 max-w-4xl w-full mx-auto px-4 pb-24 z-10 space-y-12">
          
          {/* 3D Card Display Container */}
          <div className="p-6 md:p-10 rounded-3xl bg-white/[0.02] border border-white/10 backdrop-blur-xl shadow-2xl flex flex-col items-center">
            <div className="w-full flex items-center justify-between pb-6 border-b border-white/10 mb-8">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-[#121422] border border-[#F25A2B] flex items-center justify-center font-display font-bold text-white text-lg shadow-lg">
                  {selectedMember.name[0]}
                </div>
                <div>
                  <h2 className="font-display text-lg md:text-xl font-bold text-white">{selectedMember.name}</h2>
                  <p className="text-xs text-[#F25A2B] font-mono font-semibold">{selectedMember.role}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href={`/card/${selectedMember.username}`}
                  className="
                    px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white font-mono text-xs font-bold uppercase
                    flex items-center gap-1.5 transition-all cursor-pointer shadow-md
                  "
                >
                  <span>Direct Page</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Interactive Card Preview */}
            <BusinessCardPreview
              member={selectedMember}
              onDownloadVCard={() => downloadVCard(selectedMember)}
              onBookCall={() => setIsBookModalOpen(true)}
            />

            <p className="text-xs font-mono text-white/40 mt-6 text-center">
              💡 Tap card above to flip between physical front side and printable QR code back side.
            </p>
          </div>

          {/* Member Bio & Quick Contact Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Bio & Department */}
            <div className="p-6 md:p-8 rounded-3xl bg-white/[0.02] border border-white/10 flex flex-col justify-between shadow-xl">
              <div className="space-y-3">
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#F25A2B] font-bold block">
                  ABOUT & MISSION
                </span>
                <h3 className="font-display text-xl font-bold text-white">{selectedMember.tagline}</h3>
                <p className="text-xs md:text-sm text-white/70 leading-relaxed font-normal">
                  {selectedMember.bio}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-white/10 font-mono text-xs text-white/50 space-y-1">
                <div>📍 Location: {selectedMember.location}</div>
                <div>🏢 Department: {selectedMember.department}</div>
              </div>
            </div>

            {/* Direct Actions & QR Exporter */}
            <div className="p-6 md:p-8 rounded-3xl bg-white/[0.02] border border-white/10 space-y-4 flex flex-col justify-between shadow-xl">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#7C5CFF] font-bold block mb-3">
                  QUICK CONNECT OPTIONS
                </span>

                <div className="space-y-2.5">
                  <button
                    onClick={() => downloadVCard(selectedMember)}
                    className="
                      w-full p-3.5 rounded-2xl bg-gradient-to-r from-[#F25A2B] to-[#7C5CFF] text-white font-bold text-xs uppercase tracking-wider
                      flex items-center justify-between cursor-pointer hover:scale-[1.01] transition-transform shadow-lg shadow-[#F25A2B]/15
                    "
                  >
                    <div className="flex items-center gap-2.5">
                      <Download className="w-4 h-4" />
                      <span>Download vCard Contact (.vcf)</span>
                    </div>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setIsBookModalOpen(true)}
                    className="
                      w-full p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/15 text-white font-semibold text-xs
                      flex items-center justify-between cursor-pointer transition-colors
                    "
                  >
                    <div className="flex items-center gap-2.5">
                      <Calendar className="w-4 h-4 text-[#F25A2B]" />
                      <span>Schedule 1-on-1 Meeting</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-white/40" />
                  </button>

                  <button
                    onClick={() => setIsQRModalOpen(true)}
                    className="
                      w-full p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/15 text-white font-semibold text-xs
                      flex items-center justify-between cursor-pointer transition-colors
                    "
                  >
                    <div className="flex items-center gap-2.5">
                      <QrCode className="w-4 h-4 text-[#7C5CFF]" />
                      <span>Print QR Code Exporter</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-white/40" />
                  </button>

                  <button
                    onClick={handleCopyUrl}
                    className="
                      w-full p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/15 text-white font-semibold text-xs
                      flex items-center justify-between cursor-pointer transition-colors
                    "
                  >
                    <div className="flex items-center gap-2.5">
                      {copiedUrl ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4 text-amber-400" />}
                      <span>{copiedUrl ? 'Card URL Copied!' : 'Copy Direct Card Link'}</span>
                    </div>
                    <span className="text-[10px] font-mono text-white/40">artistant.in/card/{selectedMember.username}</span>
                  </button>
                </div>
              </div>

              {/* Direct Channels */}
              <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs font-mono">
                <a href={`mailto:${selectedMember.email}`} className="text-[#F25A2B] hover:underline flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5" />
                  <span>{selectedMember.email}</span>
                </a>
              </div>
            </div>
          </div>

        </main>
      )}

      {/* Booking & QR Modals */}
      {selectedMember && (
        <>
          <BookCallModal
            isOpen={isBookModalOpen}
            onClose={() => setIsBookModalOpen(false)}
            member={selectedMember}
          />

          <LinktreeQRModal
            isOpen={isQRModalOpen}
            onClose={() => setIsQRModalOpen(false)}
            targetUrl={activeUrl}
            title={`${selectedMember.name} Business Card QR`}
            subtitle={`Scan to open ${selectedMember.name}'s digital contact card`}
          />
        </>
      )}

      <Footer />
    </div>
  );
}
