'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { RotateCw, Download, QrCode, ShieldCheck, Sparkles, PhoneCall } from 'lucide-react';
import { generateQRCodeDataUrl } from '@/lib/qr-helper';
import { type TeamMember } from '@/lib/team-data';

interface BusinessCardPreviewProps {
  member: TeamMember;
  onDownloadVCard?: () => void;
  onBookCall?: () => void;
}

export default function BusinessCardPreview({ member, onDownloadVCard, onBookCall }: BusinessCardPreviewProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');

  const cardUrl = `https://artistant.in/card/${member.username}`;

  useEffect(() => {
    let isMounted = true;
    generateQRCodeDataUrl(cardUrl, {
      colorDark: '#F25A2B',
      colorLight: '#0D0E15',
      width: 400,
      margin: 2
    }).then(url => {
      if (isMounted) setQrCodeUrl(url);
    });
    return () => { isMounted = false; };
  }, [cardUrl]);

  return (
    <div className="flex flex-col items-center justify-center space-y-6">
      {/* 3D Perspective Card Container */}
      <div 
        className="w-full max-w-[420px] h-[250px] md:h-[270px] cursor-pointer group select-none relative"
        style={{ perspective: '1200px' }}
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <motion.div
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="w-full h-full relative rounded-3xl transition-shadow shadow-2xl"
          style={{ transformStyle: 'preserve-3d' }}
        >
          {/* ════ FRONT SIDE ════ */}
          <div 
            className="
              absolute inset-0 rounded-3xl p-6 md:p-7 flex flex-col justify-between overflow-hidden
              bg-gradient-to-br from-[#1A1C2A] via-[#121420] to-[#0A0B12]
              border border-white/15 shadow-[0_20px_50px_rgba(0,0,0,0.8)]
            "
            style={{ backfaceVisibility: 'hidden' }}
          >
            {/* Holographic foil shine overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none group-hover:opacity-100 transition-opacity" />
            <div className="absolute -top-20 -right-20 w-48 h-48 rounded-full bg-[#F25A2B]/20 blur-[60px] pointer-events-none" />

            {/* Front Header */}
            <div className="flex items-center justify-between z-10">
              <div className="flex items-center gap-2">
                <img
                  src="/logo_wordmark_flat.png"
                  alt="Artistant"
                  className="h-4 md:h-5 object-contain dark:invert-0 invert"
                />
                <span className="text-[8px] font-mono uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-[#F25A2B]/20 text-[#F25A2B] border border-[#F25A2B]/30">
                  {member.badge}
                </span>
              </div>

              <div className="flex items-center gap-1 text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
                <ShieldCheck className="w-3 h-3" />
                <span>Verified</span>
              </div>
            </div>

            {/* Front Body */}
            <div className="z-10 my-auto pt-2">
              <h3 className="font-display font-bold text-2xl md:text-3xl text-white tracking-tight leading-tight">
                {member.name}
              </h3>
              <p className="text-xs md:text-sm font-medium text-transparent bg-clip-text bg-gradient-to-r from-[#F25A2B] to-[#7C5CFF] mt-0.5">
                {member.role}
              </p>
              <p className="text-[11px] text-white/50 font-mono mt-1 truncate">
                {member.company} • {member.department}
              </p>
            </div>

            {/* Front Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-white/10 z-10 text-[10px] font-mono text-white/60">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#F25A2B] animate-pulse" />
                <span>artistant.in/card/{member.username}</span>
              </div>

              <div className="flex items-center gap-1 text-white/40 group-hover:text-white transition-colors">
                <RotateCw className="w-3 h-3" />
                <span>Tap to Flip</span>
              </div>
            </div>
          </div>

          {/* ════ BACK SIDE ════ */}
          <div 
            className="
              absolute inset-0 rounded-3xl p-6 md:p-7 flex items-center justify-between overflow-hidden
              bg-gradient-to-br from-[#0E101A] via-[#141624] to-[#0A0C16]
              border border-[#F25A2B]/30 shadow-[0_20px_50px_rgba(0,0,0,0.8)]
            "
            style={{ 
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)'
            }}
          >
            <div className="absolute -bottom-20 -left-20 w-48 h-48 rounded-full bg-[#7C5CFF]/20 blur-[60px] pointer-events-none" />

            {/* Left Info */}
            <div className="flex flex-col justify-between h-full z-10 max-w-[200px]">
              <div>
                <span className="text-[9px] font-mono uppercase tracking-widest text-[#F25A2B] font-bold block mb-1">
                  OFFICIAL BUSINESS CARD
                </span>
                <h4 className="font-display text-lg font-bold text-white leading-tight">{member.name}</h4>
                <p className="text-[11px] text-white/60 font-mono mt-0.5">{member.email}</p>
                <p className="text-[11px] text-white/60 font-mono">{member.phone}</p>
              </div>

              <div className="space-y-1">
                <span className="text-[9px] font-mono uppercase text-white/40 block">Scan QR Code</span>
                <p className="text-[10px] text-white/70 leading-tight">
                  Point smartphone camera to instantly save contact details & block calendar.
                </p>
              </div>
            </div>

            {/* Right QR Code Frame */}
            <div className="flex flex-col items-center justify-center z-10">
              <div className="p-2.5 rounded-2xl bg-[#0D0E15] border border-[#F25A2B]/40 shadow-xl relative">
                {qrCodeUrl ? (
                  <div className="relative">
                    <img src={qrCodeUrl} alt="QR Code" className="w-28 h-28 object-contain rounded-lg" />
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-6 h-6 rounded-md bg-[#121212] border border-[#F25A2B] p-0.5 flex items-center justify-center">
                        <img src="/logo_a_highres.png" alt="A" className="w-full h-full object-contain" />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="w-28 h-28 flex items-center justify-center">
                    <QrCode className="w-8 h-8 text-[#F25A2B] animate-pulse" />
                  </div>
                )}
              </div>
              <span className="text-[9px] font-mono text-white/40 mt-1">NFC & QR Enabled</span>
            </div>

          </div>
        </motion.div>
      </div>

      {/* Card Action Controls */}
      <div className="flex flex-wrap items-center justify-center gap-3 w-full max-w-[420px]">
        {onDownloadVCard && (
          <button
            onClick={onDownloadVCard}
            className="
              flex-1 py-3 px-4 rounded-2xl bg-[#F25A2B] hover:bg-[#F25A2B]/90 text-white font-bold text-xs uppercase tracking-wider
              flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-[#F25A2B]/20 active:scale-95
            "
          >
            <Download className="w-4 h-4" /> Save Contact (.vcf)
          </button>
        )}

        {onBookCall && (
          <button
            onClick={onBookCall}
            className="
              flex-1 py-3 px-4 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/15 text-white font-bold text-xs uppercase tracking-wider
              flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95
            "
          >
            <PhoneCall className="w-4 h-4 text-[#7C5CFF]" /> Block Calendar
          </button>
        )}
      </div>
    </div>
  );
}
