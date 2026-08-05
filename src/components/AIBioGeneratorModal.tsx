'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, X, Copy, Check, Wand2, RefreshCw } from 'lucide-react';

interface AIBioGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectBio: (bioText: string) => void;
  userCategory?: string;
}

export default function AIBioGeneratorModal({
  isOpen,
  onClose,
  onSelectBio,
  userCategory = 'singer',
}: AIBioGeneratorModalProps) {
  const [vibe, setVibe] = useState<'soulful' | 'energetic' | 'sleek' | 'corporate'>('soulful');
  const [highlights, setHighlights] = useState('');
  const [generating, setGenerating] = useState(false);
  const [generatedBios, setGeneratedBios] = useState<string[]>([]);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const handleGenerate = () => {
    setGenerating(true);
    setTimeout(() => {
      const categoryLabel = userCategory.toUpperCase();
      const extra = highlights ? ` Notable highlights include: ${highlights}.` : '';

      let bios: string[] = [];
      if (vibe === 'soulful') {
        bios = [
          `Independent ${categoryLabel} crafting immersive live sonic experiences. Specializing in acoustic arrangements, emotional depth, and captivating stage presence.${extra} Available for club showcases, festival sets, and intimate venue bookings worldwide.`,
          `Elevating live music with a distinct acoustic voice and expressive genre-blending sets. Driven by passion, performance precision, and audience connection.${extra} Book direct for private galas, venue residencies, and festival slots.`,
        ];
      } else if (vibe === 'energetic') {
        bios = [
          `High-energy ${categoryLabel} bringing explosive stage presence and dancefloor-filling anthems.${extra} Tested across top nightlife venues and festival stages. Direct bookings open for peak weekend slots.`,
          `Unstoppable live performance energy. Blending peak-time club anthems with crowd-engaging live performance flair.${extra} Book direct via Artistant with zero agency markups.`,
        ];
      } else if (vibe === 'sleek') {
        bios = [
          `Curated live soundscapes and premium performance design by independent ${categoryLabel}.${extra} Delivering polished, high-fidelity sets for luxury brand launches, upscale lounges, and private galas.`,
          `Sleek, modern, and effortless live performance aesthetic. House showreels, riders, and instant availability parameters.${extra} Direct booking inquiries welcome.`,
        ];
      } else {
        bios = [
          `Professional ${categoryLabel} with extensive corporate event and gala experience. Reliable, punctual, and equipped with comprehensive tech riders.${extra} Open for corporate summits, awards nights, and brand activations.`,
          `Seasoned live performer delivering tailored entertainment for high-profile corporate clients and private celebrations.${extra} Transparent rates and instant calendar confirmation.`,
        ];
      }

      setGeneratedBios(bios);
      setGenerating(false);
    }, 1000);
  };

  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative w-full max-w-xl p-6 sm:p-8 rounded-3xl border border-white/10 bg-[#0F0F12] text-white shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
          >
            {/* Background Glow */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -top-24 -right-24 w-64 h-64 rounded-full bg-gradient-to-br from-[#7C5CFF]/30 to-[#F25A2B]/20 blur-3xl opacity-60"
            />

            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full text-zinc-400 hover:text-white transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="mb-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#7C5CFF]/30 bg-[#7C5CFF]/10 text-[#7C5CFF] text-[10px] font-mono font-bold uppercase tracking-wider mb-3">
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Creative Studio</span>
              </div>
              <h3 className="font-display font-extrabold text-2xl text-white">
                AI Performer Bio Generator
              </h3>
              <p className="text-xs text-zinc-400 font-light mt-1">
                Generate polished, high-converting portfolio bios tailored to your performance vibe.
              </p>
            </div>

            {/* Vibe Selection */}
            <div className="space-y-4 mb-6">
              <div>
                <label className="text-xs font-mono text-zinc-400 block mb-2">
                  Select Performance Vibe
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'soulful', label: 'Soulful & Acoustic' },
                    { id: 'energetic', label: 'High Energy & Peak' },
                    { id: 'sleek', label: 'Sleek & Luxury' },
                    { id: 'corporate', label: 'Corporate & Clean' },
                  ].map((v) => (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => setVibe(v.id as any)}
                      className={`p-2.5 rounded-xl border text-xs font-mono text-center transition-all cursor-pointer ${
                        vibe === v.id
                          ? 'bg-[#7C5CFF] border-[#7C5CFF] text-white font-bold shadow-md'
                          : 'bg-black/30 border-white/10 text-zinc-400 hover:text-white'
                      }`}
                    >
                      {v.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-mono text-zinc-400 block mb-1.5">
                  Key Highlights / Achievements (Optional)
                </label>
                <input
                  type="text"
                  value={highlights}
                  onChange={(e) => setHighlights(e.target.value)}
                  placeholder="e.g. Opened for Sunburn 2025, 50+ corporate shows..."
                  className="w-full px-4 py-3 rounded-2xl border border-white/10 bg-black/40 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#7C5CFF]"
                />
              </div>

              <button
                type="button"
                onClick={handleGenerate}
                disabled={generating}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#F25A2B] to-[#7C5CFF] text-white font-bold text-xs font-mono uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50"
              >
                {generating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Crafting Bios...</span>
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4" />
                    <span>Generate AI Bios</span>
                  </>
                )}
              </button>
            </div>

            {/* Generated Output Options */}
            {generatedBios.length > 0 && (
              <div className="space-y-3 pt-4 border-t border-white/10">
                <span className="text-xs font-mono font-bold text-[#F25A2B] uppercase tracking-wider block">
                  Select a Bio Option
                </span>
                {generatedBios.map((bio, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all space-y-3"
                  >
                    <p className="text-xs text-zinc-300 font-light leading-relaxed">
                      {bio}
                    </p>
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => handleCopy(bio, idx)}
                        className="px-3 py-1.5 rounded-lg bg-black/40 text-zinc-400 hover:text-white text-[11px] font-mono flex items-center gap-1 cursor-pointer"
                      >
                        {copiedIdx === idx ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedIdx === idx ? 'Copied' : 'Copy'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          onSelectBio(bio);
                          onClose();
                        }}
                        className="px-3 py-1.5 rounded-lg bg-[#7C5CFF] text-white text-[11px] font-mono font-bold uppercase cursor-pointer hover:bg-[#6838FF] transition-colors"
                      >
                        Use This Bio
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
