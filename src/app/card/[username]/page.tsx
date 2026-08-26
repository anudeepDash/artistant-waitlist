'use client';

import React, { useState, use } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { 
  Download, Calendar, PhoneCall, Mail, MessageSquare, 
  QrCode, Share2, Check, ExternalLink, ShieldCheck, 
  ArrowLeft, Sparkles, MapPin, Building, FileText, CheckCircle2, UserCheck, Briefcase
} from 'lucide-react';
import { InstagramIcon, LinkedinIcon, TwitterIcon, GithubIcon } from '@/components/SocialIcons';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ParticleBackground from '@/components/ParticleBackground';
import BusinessCardPreview from '@/components/BusinessCardPreview';
import BookCallModal from '@/components/BookCallModal';
import LinktreeQRModal from '@/components/LinktreeQRModal';
import { getTeamMember, downloadVCard, type TeamMember } from '@/lib/team-data';

interface PageProps {
  params: Promise<{ username: string }>;
}

export default function MemberBusinessCardPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const username = resolvedParams.username;

  const member: TeamMember = getTeamMember(username);

  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const pageUrl = `https://artistant.in/card/${member.username}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(pageUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0D14] text-white flex flex-col font-sans selection:bg-[#F25A2B] selection:text-white relative overflow-hidden">
      {/* Particle Background */}
      <div className="fixed inset-0 pointer-events-none opacity-40 z-0">
        <ParticleBackground />
      </div>

      <Navbar />

      {/* Hero Header */}
      <section className="relative pt-28 pb-8 px-4 md:px-6 overflow-hidden flex flex-col items-center justify-center text-center z-10">
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-[#F25A2B]/25 via-[#7C5CFF]/25 to-[#D4567A]/15 blur-[120px] pointer-events-none" />

        <div className="relative z-10 max-w-xl w-full flex flex-col items-center">
          
          {/* Back link */}
          <Link
            href="/card"
            className="
              inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/70 hover:text-white text-xs font-mono mb-6 transition-all hover:bg-white/10 shadow-md
            "
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>All Executive Cards</span>
          </Link>

          {/* Profile Avatar */}
          <motion.div 
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative mb-5 group"
          >
            <div className="w-28 h-28 md:w-32 md:h-32 rounded-full p-1 bg-gradient-to-tr from-[#F25A2B] via-[#D4567A] to-[#7C5CFF] shadow-[0_0_50px_rgba(242,90,43,0.3)] transition-transform duration-500 group-hover:scale-105">
              <div className="w-full h-full rounded-full bg-[#0E101A] flex items-center justify-center p-2 overflow-hidden">
                <img
                  src={member.avatarUrl}
                  alt={member.name}
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
            <div className="absolute -bottom-1 -right-1 bg-[#0E101A] border-2 border-emerald-400 p-1.5 rounded-full text-emerald-400 shadow-xl">
              <ShieldCheck className="w-4.5 h-4.5" />
            </div>
          </motion.div>

          {/* Name & Badge */}
          <div className="flex items-center gap-2 mb-1">
            <h1 className="font-display text-3xl md:text-4xl font-extrabold tracking-tight text-white">
              {member.name}
            </h1>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#F25A2B]/20 text-[#F25A2B] border border-[#F25A2B]/30">
              {member.badge}
            </span>
          </div>

          <p className="text-xs md:text-sm font-semibold text-transparent bg-clip-text bg-gradient-to-r from-[#F25A2B] to-[#7C5CFF] mb-2">
            {member.role} • {member.company}
          </p>

          <p className="text-xs font-mono text-white/50 mb-4 flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-[#F25A2B]" />
            <span>{member.location}</span>
          </p>

          <p className="text-sm text-white/80 max-w-md leading-relaxed font-normal mb-6">
            {member.tagline}
          </p>

          {/* Primary Quick Actions */}
          <div className="flex flex-wrap items-center justify-center gap-3 w-full max-w-md">
            <button
              onClick={() => downloadVCard(member)}
              className="
                flex-1 py-3.5 px-5 rounded-2xl bg-gradient-to-r from-[#F25A2B] to-[#7C5CFF] text-white font-bold text-xs uppercase tracking-wider
                flex items-center justify-center gap-2 shadow-xl shadow-[#F25A2B]/20 hover:scale-[1.03] active:scale-95 transition-all cursor-pointer
              "
            >
              <Download className="w-4 h-4" />
              <span>Save Contact (.vcf)</span>
            </button>

            <button
              onClick={() => setIsBookModalOpen(true)}
              className="
                flex-1 py-3.5 px-5 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/15 text-white font-bold text-xs uppercase tracking-wider
                flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95 shadow-md
              "
            >
              <Calendar className="w-4 h-4 text-[#7C5CFF]" />
              <span>Block Calendar</span>
            </button>

            <button
              onClick={() => setIsQRModalOpen(true)}
              className="
                p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/15 text-white transition-all cursor-pointer shadow-md
              "
              aria-label="View QR Code"
              title="Printable QR Code"
            >
              <QrCode className="w-4.5 h-4.5 text-[#F25A2B]" />
            </button>

            <button
              onClick={handleCopyLink}
              className="
                p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/15 text-white transition-all cursor-pointer shadow-md
              "
              aria-label="Copy Card Link"
              title="Copy Profile Link"
            >
              {copiedLink ? <Check className="w-4.5 h-4.5 text-emerald-400" /> : <Share2 className="w-4.5 h-4.5" />}
            </button>
          </div>
        </div>
      </section>

      {/* Main Content Layout */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 pb-24 z-10 space-y-8">
        
        {/* Interactive 3D Business Card */}
        <div className="p-6 md:p-8 rounded-3xl bg-white/[0.02] border border-white/10 backdrop-blur-xl shadow-2xl flex flex-col items-center">
          <div className="w-full flex items-center justify-between pb-4 border-b border-white/10 mb-6">
            <span className="text-[10px] font-mono uppercase font-bold text-[#F25A2B] tracking-widest flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5" />
              PHYSICAL & DIGITAL BUSINESS CARD
            </span>
            <span className="text-[10px] font-mono text-white/40">artistant.in/card/{member.username}</span>
          </div>

          <BusinessCardPreview
            member={member}
            onDownloadVCard={() => downloadVCard(member)}
            onBookCall={() => setIsBookModalOpen(true)}
          />
        </div>

        {/* Direct Channels & Bio Card */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Direct Contact Channels */}
          <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/10 space-y-4 shadow-xl">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#7C5CFF] font-bold block">
              DIRECT CHANNELS
            </span>

            <div className="space-y-2.5">
              <a
                href={`mailto:${member.email}`}
                className="
                  p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-semibold
                  flex items-center justify-between transition-colors cursor-pointer block
                "
              >
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-[#F25A2B]" />
                  <span>Email: {member.email}</span>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-white/40" />
              </a>

              <a
                href={`tel:${member.phone.replace(/\s+/g, '')}`}
                className="
                  p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-semibold
                  flex items-center justify-between transition-colors cursor-pointer block
                "
              >
                <div className="flex items-center gap-3">
                  <PhoneCall className="w-4 h-4 text-emerald-400" />
                  <span>Call: {member.phone}</span>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-white/40" />
              </a>

              {member.socials.whatsapp && (
                <a
                  href={member.socials.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="
                    p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-semibold
                    flex items-center justify-between transition-colors cursor-pointer block
                  "
                >
                  <div className="flex items-center gap-3">
                    <MessageSquare className="w-4 h-4 text-emerald-500" />
                    <span>WhatsApp Direct Sync</span>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-white/40" />
                </a>
              )}

              {member.socials.linkedin && (
                <a
                  href={member.socials.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="
                    p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-semibold
                    flex items-center justify-between transition-colors cursor-pointer block
                  "
                >
                  <div className="flex items-center gap-3">
                    <LinkedinIcon className="w-4 h-4 text-sky-400" />
                    <span>LinkedIn Profile</span>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-white/40" />
                </a>
              )}

              {member.socials.twitter && (
                <a
                  href={member.socials.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="
                    p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-semibold
                    flex items-center justify-between transition-colors cursor-pointer block
                  "
                >
                  <div className="flex items-center gap-3">
                    <TwitterIcon className="w-4 h-4 text-sky-300" />
                    <span>X (Twitter) Handle</span>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-white/40" />
                </a>
              )}

              {member.socials.github && (
                <a
                  href={member.socials.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="
                    p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-semibold
                    flex items-center justify-between transition-colors cursor-pointer block
                  "
                >
                  <div className="flex items-center gap-3">
                    <GithubIcon className="w-4 h-4 text-purple-400" />
                    <span>GitHub Profile</span>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-white/40" />
                </a>
              )}
            </div>
          </div>

          {/* Highlights & Portfolio Deck */}
          <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/10 space-y-4 flex flex-col justify-between shadow-xl">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#F25A2B] font-bold block mb-3">
                KEY HIGHLIGHTS & INITIATIVES
              </span>

              <div className="space-y-2.5">
                {member.highlights.map((h, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-xs text-white/80 leading-relaxed font-normal">
                    <CheckCircle2 className="w-4 h-4 text-[#F25A2B] shrink-0 mt-0.5" />
                    <span>{h}</span>
                  </div>
                ))}
              </div>
            </div>

            {member.featuredLink && (
              <div className="pt-4 border-t border-white/10">
                <a
                  href={member.featuredLink.url}
                  className="
                    p-4 rounded-2xl bg-gradient-to-r from-white/10 to-white/5 border border-white/15 text-white font-bold text-xs
                    flex flex-col gap-1 transition-all hover:scale-[1.01] cursor-pointer block shadow-lg
                  "
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[#F25A2B] font-mono uppercase tracking-wider text-[10px]">
                      FEATURED LINK
                    </span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-sm font-display">{member.featuredLink.title}</span>
                  <span className="text-[11px] text-white/60 font-normal leading-normal">
                    {member.featuredLink.description}
                  </span>
                </a>
              </div>
            )}
          </div>

        </div>

      </main>

      {/* Booking & QR Modals */}
      <BookCallModal
        isOpen={isBookModalOpen}
        onClose={() => setIsBookModalOpen(false)}
        member={member}
      />

      <LinktreeQRModal
        isOpen={isQRModalOpen}
        onClose={() => setIsQRModalOpen(false)}
        targetUrl={pageUrl}
        title={`${member.name} — Business Card QR`}
        subtitle={`Scan to save ${member.name}'s contact details`}
      />

      <Footer />
    </div>
  );
}
