'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Download, Share2, Copy, Check, Sparkles, QrCode } from 'lucide-react';
import { generateQRCodeDataUrl, generateQRCodeSVG, downloadStringAsFile, QR_THEMES } from '@/lib/qr-helper';

interface LinktreeQRModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetUrl?: string;
  title?: string;
  subtitle?: string;
}

export default function LinktreeQRModal({
  isOpen,
  onClose,
  targetUrl = 'https://artistant.in/links',
  title = 'Artistant Official QR',
  subtitle = 'Scan to access artistant.in/links hub'
}: LinktreeQRModalProps) {
  const [selectedThemeId, setSelectedThemeId] = useState('artistant');
  const [showLogo, setShowLogo] = useState(true);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const activeTheme = QR_THEMES.find(t => t.id === selectedThemeId) || QR_THEMES[0];

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    const generate = async () => {
      try {
        const url = await generateQRCodeDataUrl(targetUrl, {
          colorDark: activeTheme.dark,
          colorLight: activeTheme.light,
          width: 500,
          margin: 2,
          errorCorrectionLevel: 'H'
        });
        if (isMounted) {
          setQrDataUrl(url);
        }
      } catch (err) {
        console.error('Failed to render QR Code', err);
      }
    };

    generate();
    return () => { isMounted = false; };
  }, [isOpen, targetUrl, selectedThemeId, activeTheme]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(targetUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDownloadPNG = () => {
    if (!qrDataUrl) return;
    setDownloading(true);
    const link = document.createElement('a');
    link.href = qrDataUrl;
    link.download = `artistant_qr_${selectedThemeId}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => setDownloading(false), 600);
  };

  const handleDownloadSVG = async () => {
    try {
      const svgContent = await generateQRCodeSVG(targetUrl, {
        colorDark: activeTheme.dark,
        colorLight: activeTheme.light,
        width: 800,
        margin: 2,
        errorCorrectionLevel: 'H'
      });
      downloadStringAsFile(svgContent, `artistant_qr_${selectedThemeId}.svg`, 'image/svg+xml');
    } catch (err) {
      console.error(err);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: subtitle,
          url: targetUrl
        });
      } catch (e) {
        // user cancelled or share failed
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="
              relative w-full max-w-md bg-[#12141D] text-white rounded-3xl p-6 md:p-8
              border border-white/10 shadow-2xl overflow-hidden z-10
            "
          >
            {/* Background Glow */}
            <div 
              className="absolute -top-24 -right-24 w-64 h-64 rounded-full blur-[90px] pointer-events-none opacity-40"
              style={{ background: activeTheme.dark }}
            />

            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-white/5 border border-white/10">
                  <QrCode className="w-5 h-5 text-[#F25A2B]" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-lg leading-tight">{title}</h3>
                  <p className="text-xs text-white/60 font-mono mt-0.5">{targetUrl}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* QR Code Canvas Frame */}
            <div className="flex flex-col items-center justify-center my-4">
              <div 
                className="relative p-5 rounded-2xl border flex flex-col items-center justify-center transition-all duration-300 shadow-xl"
                style={{
                  backgroundColor: activeTheme.light,
                  borderColor: activeTheme.border,
                }}
              >
                {qrDataUrl ? (
                  <div className="relative">
                    <img
                      src={qrDataUrl}
                      alt="Artistant QR Code"
                      className="w-56 h-56 md:w-64 md:h-64 object-contain rounded-lg"
                    />
                    
                    {/* Logo Overlay */}
                    {showLogo && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-12 h-12 rounded-xl bg-[#121212] border-2 border-[#F25A2B] p-1.5 flex items-center justify-center shadow-2xl">
                          <img
                            src="/logo_a_highres.png"
                            alt="A"
                            className="w-full h-full object-contain"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="w-64 h-64 flex items-center justify-center">
                    <div className="w-8 h-8 border-2 border-white/20 border-t-[#F25A2B] rounded-full animate-spin" />
                  </div>
                )}
              </div>

              <div className="mt-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[11px] font-mono uppercase tracking-wider text-white/60">
                  Ready to scan with any camera
                </span>
              </div>
            </div>

            {/* Customization Options */}
            <div className="space-y-4 my-6">
              {/* Theme Picker */}
              <div>
                <label className="text-[11px] font-mono uppercase font-bold text-white/50 tracking-wider block mb-2">
                  QR Theme Style
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {QR_THEMES.map((theme) => (
                    <button
                      key={theme.id}
                      onClick={() => setSelectedThemeId(theme.id)}
                      className={`
                        px-3 py-2 rounded-xl border text-xs font-semibold flex items-center gap-2.5 transition-all cursor-pointer text-left
                        ${selectedThemeId === theme.id 
                          ? 'border-[#F25A2B] bg-[#F25A2B]/15 text-white' 
                          : 'border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'}
                      `}
                    >
                      <span 
                        className="w-3.5 h-3.5 rounded-full shrink-0 border border-white/20"
                        style={{ background: theme.dark }}
                      />
                      <span className="truncate">{theme.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Logo Toggle */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#F25A2B]" />
                  <span className="text-xs font-medium text-white">Artistant Logo Overlay</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowLogo(!showLogo)}
                  className={`
                    w-11 h-6 rounded-full transition-colors relative cursor-pointer
                    ${showLogo ? 'bg-[#F25A2B]' : 'bg-white/20'}
                  `}
                >
                  <span
                    className={`
                      absolute top-1 w-4 h-4 rounded-full bg-white transition-transform
                      ${showLogo ? 'left-6' : 'left-1'}
                    `}
                  />
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-2 border-t border-white/10">
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleDownloadPNG}
                  disabled={downloading}
                  className="
                    py-2.5 px-4 rounded-xl bg-[#F25A2B] hover:bg-[#F25A2B]/90 text-white font-bold text-xs uppercase tracking-wider
                    flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95 disabled:opacity-50
                  "
                >
                  <Download className="w-4 h-4" /> PNG High-Res
                </button>

                <button
                  onClick={handleDownloadSVG}
                  className="
                    py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white font-bold text-xs uppercase tracking-wider
                    flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95
                  "
                >
                  <Download className="w-4 h-4" /> Vector SVG
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleCopyLink}
                  className="
                    py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 hover:text-white font-semibold text-xs
                    flex items-center justify-center gap-2 transition-all cursor-pointer
                  "
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span className="text-emerald-400 font-bold">Link Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" /> Copy Link
                    </>
                  )}
                </button>

                <button
                  onClick={handleShare}
                  className="
                    py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 hover:text-white font-semibold text-xs
                    flex items-center justify-center gap-2 transition-all cursor-pointer
                  "
                >
                  <Share2 className="w-4 h-4" /> Share QR
                </button>
              </div>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
