'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Globe,
  Clock,
  Shield,
  Activity,
  Save,
  AlertTriangle,
  Database,
  RefreshCw,
  LayoutTemplate,
  Loader2,
  Share2,
  Lock,
  Zap,
  Sparkles,
  CheckCircle2,
  Sliders,
  Settings,
  Mail,
  Flame,
  Radio,
  FileText,
  Calendar,
  ChevronRight,
  ExternalLink,
  RotateCcw,
  Eye
} from 'lucide-react';
import { SiteSettings, adminGetSiteSettingsAction, adminUpdateSiteSettingsAction } from '@/lib/admin-actions';

const DEFAULT_SITE_SETTINGS: SiteSettings = {
  site_title: "ArtisTant",
  site_tagline: "The Future of Live Performance",
  support_email: "support@artistant.in",
  hero_headline: "Elevate Your Artistry",
  hero_subheading: "Join India's premier network of verified musicians, bands, and production crew.",
  enable_countdown: true,
  countdown_target_date: "2026-12-31T23:59:59.000Z",
  countdown_headline: "The revolution begins in",
  countdown_cta_text: "Join Waitlist",
  enable_registrations: true,
  auto_verify_registrations: false,
  maintenance_mode: false,
  founding_artist_limit: 1000,
  instagram_url: "https://instagram.com/artistant.in",
  twitter_url: "https://twitter.com/artistant",
  youtube_url: "",
  spotify_url: "",
  whatsapp_number: "",
};

interface SiteSettingsTabProps {
  getIdToken: (forceRefresh?: boolean) => Promise<string | null>;
  showToast: (msg: string) => void;
  setShowSettingsSqlModal: (show: boolean) => void;
  siteSettingsError: string | null;
  setSiteSettingsError: (err: string | null) => void;
}

export default function SiteSettingsTab({
  getIdToken,
  showToast,
  setShowSettingsSqlModal,
  siteSettingsError,
  setSiteSettingsError
}: SiteSettingsTabProps) {
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [activeCategory, setActiveCategory] = useState<'all' | 'branding' | 'hero' | 'countdown' | 'security' | 'social'>('all');

  // Live Countdown Ticker Calculation
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number }>({
    days: 0, hours: 0, minutes: 0, seconds: 0
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  useEffect(() => {
    if (!siteSettings.countdown_target_date) return;

    const interval = setInterval(() => {
      try {
        const target = new Date(siteSettings.countdown_target_date).getTime();
        const now = new Date().getTime();
        const diff = target - now;

        if (diff > 0) {
          setTimeLeft({
            days: Math.floor(diff / (1000 * 60 * 60 * 24)),
            hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
            minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
            seconds: Math.floor((diff % (1000 * 60)) / 1000),
          });
        } else {
          setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        }
      } catch {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [siteSettings.countdown_target_date]);

  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      const data = await adminGetSiteSettingsAction();
      setSiteSettings(data);
      setSiteSettingsError(null);
    } catch (err: any) {
      console.error("Error fetching site settings:", err);
      setSiteSettingsError(err.message || "Failed to load site settings from Supabase.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    setSavingSettings(true);
    try {
      const token = await getIdToken();
      if (!token) return;
      const res = await adminUpdateSiteSettingsAction(token, siteSettings);
      if (res.success && res.settings) {
        showToast("Global site configuration saved successfully!");
        setSiteSettings(res.settings);
        setSiteSettingsError(null);
      } else {
        throw new Error(res.message || "Update failed");
      }
    } catch (err: any) {
      console.error("Failed to save settings:", err);
      showToast(`Error saving settings: ${err.message}`);
      setSiteSettingsError(err.message || "Failed to save to database");
    } finally {
      setSavingSettings(false);
    }
  };

  const updateSetting = <K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) => {
    setSiteSettings(prev => ({ ...prev, [key]: value }));
  };

  // Helper for datetime-local input formatting
  const formatForDatetimeInput = (isoString: string) => {
    if (!isoString) return "";
    try {
      const date = new Date(isoString);
      if (isNaN(date.getTime())) return "";
      const pad = (n: number) => n.toString().padStart(2, '0');
      const year = date.getFullYear();
      const month = pad(date.getMonth() + 1);
      const day = pad(date.getDate());
      const hours = pad(date.getHours());
      const minutes = pad(date.getMinutes());
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    } catch {
      return "";
    }
  };

  const setDateOffsetDays = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    updateSetting('countdown_target_date', d.toISOString());
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 bg-bg-card border border-line-soft rounded-3xl backdrop-blur-xl w-full">
        <Loader2 className="w-8 h-8 text-[#7C5CFF] animate-spin" />
        <p className="text-xs font-mono text-ink-3 mt-4 tracking-widest uppercase font-bold">Loading site configuration...</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 text-left animate-in fade-in duration-300">

      {/* ═══════════════════════════════════════════════════════════════════════
          STATION COMMAND HEADER
          ═══════════════════════════════════════════════════════════════════════ */}
      <div className="bg-bg-card border border-line-soft rounded-3xl p-6 backdrop-blur-2xl shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-30">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#F25A2B] via-[#D4567A] to-[#7C5CFF] flex items-center justify-center shadow-lg shadow-[#7C5CFF]/25 shrink-0">
            <Settings className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-display font-bold text-ink tracking-tight">Platform Configuration</h2>
              <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/15 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                LIVE CONFIG ENGINE
              </span>
            </div>
            <p className="text-xs text-ink-3 mt-0.5 font-sans">
              Manage platform branding, launch countdowns, registration rules, and social connections.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setSiteSettings(DEFAULT_SITE_SETTINGS)}
            className="px-4 py-2.5 rounded-xl border border-line-soft bg-bg-soft/80 hover:bg-bg-soft text-ink-3 hover:text-ink text-xs font-bold transition-all cursor-pointer flex items-center gap-2"
            title="Reset settings to default"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>

          <button
            type="button"
            onClick={handleSaveSettings}
            disabled={savingSettings}
            className="bg-gradient-to-r from-[#F25A2B] via-[#D4567A] to-[#7C5CFF] text-white rounded-xl py-2.5 px-6 text-xs font-bold transition-all shadow-lg shadow-[#7C5CFF]/25 hover:opacity-95 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer border border-white/10 uppercase tracking-wider font-mono"
          >
            {savingSettings ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {savingSettings ? "Saving Config..." : "Save Configuration"}
          </button>
        </div>
      </div>

      {/* Category Pill Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-1">
        {[
          { id: 'all', label: 'All Settings', icon: Sliders },
          { id: 'branding', label: 'Branding & Details', icon: Globe },
          { id: 'hero', label: 'Hero Content', icon: LayoutTemplate },
          { id: 'countdown', label: 'Countdown & Urgency', icon: Clock },
          { id: 'security', label: 'Security & Access', icon: Shield },
          { id: 'social', label: 'Social & Channels', icon: Share2 },
        ].map((tab) => {
          const isActive = activeCategory === tab.id;
          const IconComp = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveCategory(tab.id as any)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center gap-2 border ${
                isActive
                  ? "bg-gradient-to-r from-[#7C5CFF]/20 to-[#F25A2B]/10 border-[#7C5CFF] text-ink shadow-md"
                  : "bg-bg-card/70 border-line-soft text-ink-3 hover:text-ink hover:bg-bg-card"
              }`}
            >
              <IconComp className={`w-3.5 h-3.5 ${isActive ? "text-[#7C5CFF]" : "text-ink-3"}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Error Banner */}
      <AnimatePresence>
        {siteSettingsError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 bg-hot/10 border border-hot/20 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div className="flex gap-3 text-hot">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <div className="text-sm">
                <p className="font-bold">Database Error</p>
                <p className="opacity-90">{siteSettingsError}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowSettingsSqlModal(true)}
              className="px-4 py-2 bg-hot/20 hover:bg-hot/30 text-hot text-xs font-bold font-mono rounded-lg flex items-center gap-2 transition-colors shrink-0 cursor-pointer"
            >
              <Database className="w-3.5 h-3.5" />
              View SQL Fix
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════════════════════════════════════════════════════════════════════
          CONFIGURATION CARDS GRID
          ═══════════════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* 1. Global Details & Branding Card */}
        {(activeCategory === 'all' || activeCategory === 'branding') && (
          <div className="bg-bg-card border border-line-soft p-6 sm:p-7 rounded-3xl space-y-5 backdrop-blur-2xl shadow-xl hover:border-[#7C5CFF]/30 transition-all">
            <div className="border-b border-line-soft pb-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#7C5CFF]/15 text-[#7C5CFF] flex items-center justify-center border border-[#7C5CFF]/25">
                <Globe className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-display font-bold text-ink">Global Branding & Identity</h3>
                <p className="text-xs text-ink-3">Platform title, tagline, and support contact</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-ink-3">Site Title</label>
                <input
                  type="text"
                  value={siteSettings.site_title}
                  onChange={(e) => updateSetting('site_title', e.target.value)}
                  className="w-full bg-bg-soft/40 border border-line-soft text-ink rounded-xl px-4 py-2.5 text-xs font-semibold focus:border-[#7C5CFF] focus:ring-2 focus:ring-[#7C5CFF]/20 transition-all outline-none"
                  placeholder="ArtisTant"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-ink-3">Site Tagline</label>
                <input
                  type="text"
                  value={siteSettings.site_tagline}
                  onChange={(e) => updateSetting('site_tagline', e.target.value)}
                  className="w-full bg-bg-soft/40 border border-line-soft text-ink rounded-xl px-4 py-2.5 text-xs font-semibold focus:border-[#7C5CFF] focus:ring-2 focus:ring-[#7C5CFF]/20 transition-all outline-none"
                  placeholder="The Future of Live Performance"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-ink-3">Support Contact Email</label>
                <input
                  type="email"
                  value={siteSettings.support_email}
                  onChange={(e) => updateSetting('support_email', e.target.value)}
                  className="w-full bg-bg-soft/40 border border-line-soft text-ink rounded-xl px-4 py-2.5 text-xs font-mono font-semibold focus:border-[#7C5CFF] focus:ring-2 focus:ring-[#7C5CFF]/20 transition-all outline-none"
                  placeholder="support@artistant.in"
                />
              </div>
            </div>
          </div>
        )}

        {/* 2. Hero & Homepage Copy Card */}
        {(activeCategory === 'all' || activeCategory === 'hero') && (
          <div className="bg-bg-card border border-line-soft p-6 sm:p-7 rounded-3xl space-y-5 backdrop-blur-2xl shadow-xl hover:border-[#F25A2B]/30 transition-all">
            <div className="border-b border-line-soft pb-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#F25A2B]/15 text-[#F25A2B] flex items-center justify-center border border-[#F25A2B]/25">
                <LayoutTemplate className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-display font-bold text-ink">Hero & Headline Content</h3>
                <p className="text-xs text-ink-3">Main landing page copy & value proposition</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-ink-3">Hero Main Headline</label>
                <input
                  type="text"
                  value={siteSettings.hero_headline}
                  onChange={(e) => updateSetting('hero_headline', e.target.value)}
                  className="w-full bg-bg-soft/40 border border-line-soft text-ink rounded-xl px-4 py-2.5 text-xs font-semibold focus:border-[#F25A2B] focus:ring-2 focus:ring-[#F25A2B]/20 transition-all outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-ink-3">Hero Subheading Copy</label>
                <textarea
                  value={siteSettings.hero_subheading}
                  onChange={(e) => updateSetting('hero_subheading', e.target.value)}
                  rows={3}
                  className="w-full bg-bg-soft/40 border border-line-soft text-ink rounded-xl px-4 py-2.5 text-xs focus:border-[#F25A2B] focus:ring-2 focus:ring-[#F25A2B]/20 transition-all outline-none resize-none leading-relaxed"
                />
              </div>
            </div>
          </div>
        )}

        {/* 3. Countdown & Urgency Studio Card */}
        {(activeCategory === 'all' || activeCategory === 'countdown') && (
          <div className="bg-bg-card border border-line-soft p-6 sm:p-7 rounded-3xl space-y-6 backdrop-blur-2xl shadow-xl hover:border-amber-500/30 transition-all lg:col-span-2">
            <div className="border-b border-line-soft pb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center border border-amber-500/25">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-display font-bold text-ink">Countdown & Launch Urgency Studio</h3>
                  <p className="text-xs text-ink-3">Live timer preview, target date selection, and banner headline</p>
                </div>
              </div>

              {/* Enable Switch Toggle */}
              <button
                type="button"
                onClick={() => updateSetting('enable_countdown', !siteSettings.enable_countdown)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 border ${
                  siteSettings.enable_countdown
                    ? "bg-amber-500/15 text-amber-400 border-amber-500/30 shadow-sm"
                    : "bg-bg-soft text-ink-3 border-line-soft"
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${siteSettings.enable_countdown ? "bg-amber-400 animate-ping" : "bg-ink-3"}`} />
                <span>{siteSettings.enable_countdown ? "Countdown Enabled" : "Countdown Disabled"}</span>
              </button>
            </div>

            {siteSettings.enable_countdown && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

                {/* Left Controls: Picker & Presets */}
                <div className="lg:col-span-7 space-y-4">
                  
                  {/* Date & Time Picker Row */}
                  <div className="space-y-2">
                    <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-ink-3">
                      Target Launch Date & Time Selector
                    </label>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                      <div className="relative flex-1">
                        <input
                          type="datetime-local"
                          value={formatForDatetimeInput(siteSettings.countdown_target_date)}
                          onChange={(e) => {
                            if (e.target.value) {
                              try {
                                const d = new Date(e.target.value);
                                if (!isNaN(d.getTime())) {
                                  updateSetting('countdown_target_date', d.toISOString());
                                }
                              } catch (err) {
                                console.error(err);
                              }
                            }
                          }}
                          className="w-full bg-bg-soft/50 border border-line-soft hover:border-amber-400/50 text-ink rounded-2xl px-4 py-3 text-xs font-mono focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all outline-none [color-scheme:dark] cursor-pointer"
                        />
                      </div>

                      {/* Quick Presets */}
                      <div className="flex items-center gap-1 bg-bg-soft border border-line-soft p-1 rounded-2xl">
                        {[
                          { label: '+24h', days: 1 },
                          { label: '+3d', days: 3 },
                          { label: '+7d', days: 7 },
                          { label: '+30d', days: 30 },
                        ].map((btn) => (
                          <button
                            key={btn.label}
                            type="button"
                            onClick={() => setDateOffsetDays(btn.days)}
                            className="px-3 py-1.5 text-xs font-mono font-bold text-ink-3 hover:text-amber-400 hover:bg-amber-400/10 rounded-xl transition-all cursor-pointer"
                            title={`Set target date to ${btn.days} day(s) from now`}
                          >
                            {btn.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Banner Headline & CTA Inputs */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-ink-3">Banner Headline Text</label>
                      <input
                        type="text"
                        value={siteSettings.countdown_headline}
                        onChange={(e) => updateSetting('countdown_headline', e.target.value)}
                        className="w-full bg-bg-soft/40 border border-line-soft text-ink rounded-xl px-4 py-2.5 text-xs font-semibold focus:border-amber-400 transition-all outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-ink-3">CTA Button Label</label>
                      <input
                        type="text"
                        value={siteSettings.countdown_cta_text}
                        onChange={(e) => updateSetting('countdown_cta_text', e.target.value)}
                        className="w-full bg-bg-soft/40 border border-line-soft text-ink rounded-xl px-4 py-2.5 text-xs font-semibold focus:border-amber-400 transition-all outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Right Live Banner & Timer Card Mockup */}
                <div className="lg:col-span-5 bg-gradient-to-br from-[#0F172A] to-[#1E1B4B] border border-amber-500/30 rounded-3xl p-5 shadow-2xl text-center space-y-4 relative overflow-hidden">
                  <div className="flex items-center justify-between text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400 border-b border-amber-500/20 pb-2">
                    <span className="flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5 text-amber-400" />
                      Live Banner Preview
                    </span>
                    <span className="bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-500/30 text-amber-300">
                      Active Website Mock
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-widest block mb-1">
                      {siteSettings.countdown_headline || "The revolution begins in"}
                    </span>
                    
                    {/* Running Ticker Grid */}
                    <div className="grid grid-cols-4 gap-2 pt-2">
                      {[
                        { label: "DAYS", value: timeLeft.days },
                        { label: "HOURS", value: timeLeft.hours },
                        { label: "MINS", value: timeLeft.minutes },
                        { label: "SECS", value: timeLeft.seconds },
                      ].map((t) => (
                        <div key={t.label} className="bg-black/50 border border-white/10 p-2.5 rounded-2xl backdrop-blur-md">
                          <div className="text-xl font-display font-extrabold text-white tracking-tight">
                            {String(t.value).padStart(2, '0')}
                          </div>
                          <div className="text-[8px] font-mono font-bold text-slate-400 tracking-wider mt-0.5">
                            {t.label}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-1">
                    <span className="inline-block px-5 py-2 text-xs font-bold uppercase tracking-wider rounded-full bg-gradient-to-r from-[#F25A2B] to-[#7C5CFF] text-white shadow-md">
                      {siteSettings.countdown_cta_text || "Join Waitlist"}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 4. Access Control & Security Card */}
        {(activeCategory === 'all' || activeCategory === 'security') && (
          <div className="bg-bg-card border border-line-soft p-6 sm:p-7 rounded-3xl space-y-5 backdrop-blur-2xl shadow-xl hover:border-emerald-500/30 transition-all">
            <div className="border-b border-line-soft pb-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center border border-emerald-500/25">
                <Shield className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-display font-bold text-ink">Access Protocols & Security</h3>
                <p className="text-xs text-ink-3">Registration permissions and emergency lockdown</p>
              </div>
            </div>

            <div className="space-y-3">
              <label className="flex items-center justify-between p-4 rounded-2xl bg-bg-soft/40 border border-line-soft cursor-pointer hover:border-emerald-500/40 transition-all">
                <span className="text-xs font-bold text-ink flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-400" />
                  Allow New Waitlist Signups
                </span>
                <input
                  type="checkbox"
                  checked={siteSettings.enable_registrations}
                  onChange={(e) => updateSetting('enable_registrations', e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-500 bg-bg-card border-line-soft cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-4 rounded-2xl bg-bg-soft/40 border border-line-soft cursor-pointer hover:border-emerald-500/40 transition-all">
                <span className="text-xs font-bold text-ink flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#7C5CFF]" />
                  Auto-Verify New Accounts Instantly
                </span>
                <input
                  type="checkbox"
                  checked={siteSettings.auto_verify_registrations}
                  onChange={(e) => updateSetting('auto_verify_registrations', e.target.checked)}
                  className="w-4 h-4 rounded text-[#7C5CFF] focus:ring-[#7C5CFF] bg-bg-card border-line-soft cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-4 rounded-2xl bg-red-500/10 border border-red-500/30 cursor-pointer hover:bg-red-500/15 transition-all">
                <span className="text-xs font-bold text-red-400 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                  Maintenance Mode (Platform Lockdown)
                </span>
                <input
                  type="checkbox"
                  checked={siteSettings.maintenance_mode}
                  onChange={(e) => updateSetting('maintenance_mode', e.target.checked)}
                  className="w-4 h-4 rounded text-red-500 focus:ring-red-500 bg-bg-card border-red-500/50 cursor-pointer"
                />
              </label>
            </div>
          </div>
        )}

        {/* 5. Social Links & Communication Channels Card */}
        {(activeCategory === 'all' || activeCategory === 'social') && (
          <div className="bg-bg-card border border-line-soft p-6 sm:p-7 rounded-3xl space-y-5 backdrop-blur-2xl shadow-xl hover:border-[#7C5CFF]/30 transition-all">
            <div className="border-b border-line-soft pb-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#7C5CFF]/15 text-[#7C5CFF] flex items-center justify-center border border-[#7C5CFF]/25">
                <Share2 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-display font-bold text-ink">Social Links & Channels</h3>
                <p className="text-xs text-ink-3">Official platform social profiles & direct support channels</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-ink-3">Instagram URL</label>
                <input
                  type="text"
                  value={siteSettings.instagram_url}
                  onChange={(e) => updateSetting('instagram_url', e.target.value)}
                  className="w-full bg-bg-soft/40 border border-line-soft text-ink rounded-xl px-4 py-2.5 text-xs font-mono focus:border-[#7C5CFF] transition-all outline-none"
                  placeholder="https://instagram.com/..."
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-ink-3">X / Twitter URL</label>
                <input
                  type="text"
                  value={siteSettings.twitter_url}
                  onChange={(e) => updateSetting('twitter_url', e.target.value)}
                  className="w-full bg-bg-soft/40 border border-line-soft text-ink rounded-xl px-4 py-2.5 text-xs font-mono focus:border-[#7C5CFF] transition-all outline-none"
                  placeholder="https://twitter.com/..."
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-ink-3">Spotify URL</label>
                <input
                  type="text"
                  value={siteSettings.spotify_url}
                  onChange={(e) => updateSetting('spotify_url', e.target.value)}
                  className="w-full bg-bg-soft/40 border border-line-soft text-ink rounded-xl px-4 py-2.5 text-xs font-mono focus:border-[#7C5CFF] transition-all outline-none"
                  placeholder="https://open.spotify.com/..."
                />
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
