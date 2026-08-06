"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Mail,
  Send,
  Users,
  ChevronDown,
  RefreshCw,
  Plus,
  Trash2,
  Paperclip,
  CheckCircle2,
  Layers3,
  UserCheck,
  Megaphone,
  Ticket,
  Crown,
  FileText,
  AtSign,
  Columns2,
  Moon,
  Sun,
  Bold,
  Italic,
  Underline,
  List,
  Heading1,
  Heading2,
  Link2,
  Quote,
  Eye,
  Sparkles,
  X,
  Sliders,
  LayoutGrid,
  Zap,
  Flame,
  ArrowRight,
  Terminal,
  Check,
  Smartphone,
  Globe,
  Radio,
  FileCode,
  ShieldCheck,
  Copy,
  ChevronRight
} from "lucide-react";
import { sendMassEmailAction } from "@/lib/email-actions";

export interface EmailAttachmentItem {
  id: string;
  title: string;
  fileType: string;
  size: string;
  url: string;
  description?: string;
}

interface BroadcastStudioProps {
  user: any;
  registrations: any[];
  filteredRegistrations: any[];
  selectedUserIds: string[];
  setSelectedUserIds: (ids: string[]) => void;
  showToast: (msg: string) => void;
  getIdToken: () => Promise<string>;
  roleFilter: string;
  statusFilter: string;
  searchQuery: string;
}

export default function BroadcastStudio({
  user,
  registrations,
  filteredRegistrations,
  selectedUserIds,
  setSelectedUserIds,
  showToast,
  getIdToken,
  roleFilter,
  statusFilter,
  searchQuery,
}: BroadcastStudioProps) {
  // ---------------------------------------------------------------------------
  // Broadcast Engine State
  // ---------------------------------------------------------------------------
  const [emailTemplateType, setEmailTemplateType] = useState<
    "standard" | "welcome" | "vip" | "newsletter" | "raw" | "plain_minimal" | "migrated_artist"
  >("standard");
  const [emailSubject, setEmailSubject] = useState("Exclusive early access keys for ArtisTant 🚀");
  const [emailPillTag, setEmailPillTag] = useState("⚡ WAITLIST ACTIVE");
  const [emailHeader, setEmailHeader] = useState("Your ArtisTant waitlist handle is secured.");
  const [emailBody, setEmailBody] = useState(
    "We are opening the first stage of beta onboarding. Build your verified profile, set up your Bookability Score rating, and secure your event bookings early.\n\nClick the link below to verify your device credentials."
  );
  const [emailCtaText, setEmailCtaText] = useState("Claim Access Keys");
  const [emailCtaUrl, setEmailCtaUrl] = useState("https://artistant.in");
  const [emailClientTheme, setEmailClientTheme] = useState<"dark" | "light">("dark");
  const [emailAlias, setEmailAlias] = useState("official");
  const [emailAudienceMode, setEmailAudienceMode] = useState<
    "all" | "filtered" | "selected" | "migrated_artists" | "custom_emails"
  >("all");

  // Custom Single Email Input State
  const [customSingleEmailInput, setCustomSingleEmailInput] = useState("");
  const [customEmailChips, setCustomEmailChips] = useState<string[]>([]);

  // Preview Persona & View Mode State
  const [emailPreviewPersona, setEmailPreviewPersona] = useState<"admin" | "first_recipient" | "tags">("admin");
  const [emailStudioViewMode, setEmailStudioViewMode] = useState<"canvas_editor" | "split_preview">("canvas_editor");

  // Dropdown Toggles
  const [showAudienceDropdown, setShowAudienceDropdown] = useState(false);
  const [showAliasDropdown, setShowAliasDropdown] = useState(false);
  const [showRecipientDrawer, setShowRecipientDrawer] = useState(false);

  // Attachments State
  const [emailAttachments, setEmailAttachments] = useState<EmailAttachmentItem[]>([]);
  const [showAddAttachmentModal, setShowAddAttachmentModal] = useState(false);
  const [newAttTitle, setNewAttTitle] = useState("");
  const [newAttType, setNewAttType] = useState("PDF");
  const [newAttSize, setNewAttSize] = useState("1.5 MB");
  const [newAttUrl, setNewAttUrl] = useState("");

  // Dispatch & Terminal Logs
  const [emailSending, setEmailSending] = useState(false);
  const [testEmailSending, setTestEmailSending] = useState(false);
  const [emailLogs, setEmailLogs] = useState<string[]>([]);
  const [showLogTerminal, setShowLogTerminal] = useState(false);

  // Click Outside Refs
  const audienceRef = useRef<HTMLDivElement>(null);
  const aliasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (audienceRef.current && !audienceRef.current.contains(event.target as Node)) {
        setShowAudienceDropdown(false);
      }
      if (aliasRef.current && !aliasRef.current.contains(event.target as Node)) {
        setShowAliasDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ---------------------------------------------------------------------------
  // Target Audience Resolution
  // ---------------------------------------------------------------------------
  const getSelectedRecipientsList = () => {
    if (emailAudienceMode === "custom_emails") {
      return customEmailChips.map((email, idx) => ({
        id: `custom-email-${idx}-${email}`,
        user_id: `custom-${idx}`,
        email: email,
        display_name: email.split("@")[0] || "Member",
        username: email.split("@")[0] || "member",
        role: "artist",
        is_blocked: false,
        created_at: new Date().toISOString(),
      }));
    }
    if (emailAudienceMode === "migrated_artists") {
      return registrations.filter(
        (r) => (r.user_id?.startsWith("imported_") || r.is_migrated) && !r.is_blocked
      );
    }
    if (emailAudienceMode === "selected" && selectedUserIds.length > 0) {
      return registrations.filter((r) => selectedUserIds.includes(r.id));
    }
    if (emailAudienceMode === "filtered") {
      return filteredRegistrations;
    }
    if (roleFilter === "all" && statusFilter === "all" && !searchQuery) {
      return registrations;
    }
    return filteredRegistrations;
  };

  // ---------------------------------------------------------------------------
  // Custom Single Email Handlers
  // ---------------------------------------------------------------------------
  const handleAddCustomEmail = (rawText?: string) => {
    const raw = rawText || customSingleEmailInput;
    if (!raw.trim()) return;
    const parts = raw
      .split(/[\s,;\n]+/)
      .map((e) => e.trim().toLowerCase())
      .filter((e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e));

    if (parts.length === 0) {
      showToast("Please enter a valid email address (e.g. artist@domain.com)");
      return;
    }
    const updated = Array.from(new Set([...customEmailChips, ...parts]));
    setCustomEmailChips(updated);
    setCustomSingleEmailInput("");
    setEmailAudienceMode("custom_emails");
    showToast(`Added ${parts.length} single email ID(s). Total: ${updated.length}`);
  };

  const handleRemoveCustomEmail = (emailToRemove: string) => {
    setCustomEmailChips((prev) => prev.filter((e) => e !== emailToRemove));
  };

  // ---------------------------------------------------------------------------
  // Preview Persona Generator
  // ---------------------------------------------------------------------------
  const getPreviewPersona = () => {
    if (emailPreviewPersona === "admin") {
      const adminName = user?.displayName || user?.email?.split("@")[0] || "Anudeep";
      const adminHandle = user?.email?.split("@")[0] || "anudeep";
      return { name: adminName, username: adminHandle };
    }
    if (emailPreviewPersona === "first_recipient") {
      const activeList = getSelectedRecipientsList();
      if (activeList.length > 0) {
        const target = activeList[0];
        return {
          name: target.display_name || target.username || "Valued Member",
          username: target.username || target.email?.split("@")[0] || "member",
        };
      }
    }
    return { name: "{{name}}", username: "{{username}}" };
  };

  // ---------------------------------------------------------------------------
  // Template Preset Loader
  // ---------------------------------------------------------------------------
  const loadTemplatePreset = (
    type: "standard" | "welcome" | "vip" | "newsletter" | "raw" | "plain_minimal" | "migrated_artist"
  ) => {
    setEmailTemplateType(type);
    switch (type) {
      case "migrated_artist":
        setEmailAudienceMode("migrated_artists");
        setEmailPillTag("🚀 ARTIST ONBOARDING");
        setEmailSubject("Welcome to ArtisTant, {{name}}! Your Artist Profile is Ready ✨");
        setEmailHeader("Your Artist Account Has Been Migrated to ArtisTant");
        setEmailBody(
          "Welcome to ArtisTant Official! Your artist portfolio and profile credentials have been successfully created.\n\nClaim your profile, set up your Bookability Score, link your Spotify & Instagram, and start receiving direct gig requests.\n\nClick below to verify your login and activate your Founding Artist badge."
        );
        setEmailCtaText("Activate Artist Profile");
        setEmailCtaUrl("https://artistant.in/claim?id={{id}}");
        setEmailAlias("welcome");
        showToast("Loaded Migrated Artist Onboarding Template!");
        break;
      case "welcome":
        setEmailPillTag("⚡ WAITLIST ACTIVE");
        setEmailSubject("Your ArtisTant username @{{username}} is secured! 🚀");
        setEmailHeader("Welcome to the stage. @username is officially stashed.");
        setEmailBody(
          "It's official. You've successfully claimed your premium username on ArtisTant!\n\nYour professional portfolio page is live. Promoters and clients can visit your portfolio to view your bio, listen to previews, inspect details, and request direct bookings.\n\nYou can customize, update, or complete all these details at any time by logging into your ArtisTant Dashboard."
        );
        setEmailCtaText("Open Your Dashboard");
        setEmailCtaUrl("https://artistant.in/dashboard");
        setEmailAlias("welcome");
        showToast("Loaded Stage Pass / Welcome Template!");
        break;
      case "vip":
        setEmailPillTag("👑 VIP EXCLUSIVE PASS");
        setEmailSubject("VIP Founder Access Pass Granted 🌟");
        setEmailHeader("You have been selected for Early VIP Rollout");
        setEmailBody(
          "As a top-tier Founding Artist on ArtisTant, you have been unlocked for VIP Priority Concierge. Enjoy zero platform commissions on your first 5 bookings and direct concierge assistance.\n\nClaim your VIP Pass key below before public access opens."
        );
        setEmailCtaText("Claim VIP Access Pass");
        setEmailCtaUrl("https://artistant.in/claim?id={{id}}");
        setEmailAlias("founder");
        showToast("Loaded VIP Exclusive Pass Template!");
        break;
      case "newsletter":
        setEmailPillTag("⚡ RELEASE NOTES");
        setEmailSubject("ArtisTant Digest & Monthly Feature Drop ⚡");
        setEmailHeader("Fresh Tools & Performance Upgrades");
        setEmailBody(
          "Here is your monthly summary of platform updates, new media showreel features, Spotify & Instagram stats integration, and upcoming venue partnerships.\n\nRead the full release note or access your creator suite below."
        );
        setEmailCtaText("View Release Notes");
        setEmailCtaUrl("https://artistant.in");
        setEmailAlias("info");
        showToast("Loaded Product Digest Template!");
        break;
      case "plain_minimal":
        setEmailPillTag("");
        setEmailSubject("Direct note from ArtisTant Team");
        setEmailHeader("");
        setEmailBody(
          "Hello {{name}},\n\nI am reaching out to share a quick update regarding your profile and setup on ArtisTant.\n\nEverything is set up and ready for your review. Let us know if you need any help getting started."
        );
        setEmailCtaText("");
        setEmailCtaUrl("");
        setEmailAlias("official");
        showToast("Loaded Plain Minimal Letter Template!");
        break;
      case "raw":
        setEmailPillTag("");
        setEmailSubject("Quick Note from ArtisTant Team");
        setEmailHeader("");
        setEmailBody(
          "Hello {{name}},\n\nThis is a direct message regarding your account status and upcoming events on ArtisTant.\n\nPlease reply directly to this email or reach out via support if you need any assistance."
        );
        setEmailCtaText("");
        setEmailCtaUrl("");
        setEmailAlias("official");
        showToast("Loaded Direct Markdown Mode!");
        break;
      case "standard":
      default:
        setEmailPillTag("📢 ANNOUNCEMENT");
        setEmailSubject("Exclusive early access keys for ArtisTant 🚀");
        setEmailHeader("Your ArtisTant waitlist handle is secured.");
        setEmailBody(
          "We are opening the first stage of beta onboarding. Build your verified profile, set up your Bookability Score rating, and secure your event bookings early.\n\nClick the link below to verify your device credentials."
        );
        setEmailCtaText("Claim Access Keys");
        setEmailCtaUrl("https://artistant.in");
        setEmailAlias("official");
        showToast("Loaded Standard Announcement Template!");
        break;
    }
  };

  // ---------------------------------------------------------------------------
  // Dispatch Handlers
  // ---------------------------------------------------------------------------
  const handleSendEmailBroadcast = async () => {
    const targets = getSelectedRecipientsList().filter((r) => !r.is_blocked);
    if (targets.length === 0) {
      showToast("No eligible recipients found.");
      return;
    }

    const recipientEmails = targets.map((t) => ({
      email: t.email,
      name: t.display_name || t.username,
      username: t.username || "artist",
      id: t.id,
    }));

    if (
      !window.confirm(
        `Initiate mass email broadcast [${emailTemplateType.toUpperCase()}] to ${targets.length} user(s)?`
      )
    ) {
      return;
    }

    setEmailSending(true);
    setShowLogTerminal(true);
    setEmailLogs([]);

    const log = (msg: string) => {
      setEmailLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
    };

    log(`Initializing ArtisTant Broadcast Node...`);
    log(`Sender Alias: "${emailAlias}@artistant.in"`);
    log(`Template: "${emailTemplateType.toUpperCase()}"`);
    log(`Target Recipients: ${targets.length} record(s)`);

    try {
      const idToken = await getIdToken();
      const res = await sendMassEmailAction({
        idToken,
        recipients: recipientEmails,
        subject: emailSubject,
        messageBody: emailBody,
        ctaText: emailCtaText,
        ctaUrl: emailCtaUrl,
        senderAlias: emailAlias,
        templateType: emailTemplateType,
        emailHeader: emailHeader,
        pillTag: emailPillTag,
        attachments: emailAttachments,
      });

      if (res.success) {
        log(`Broadcast Complete. Summary:`);
        res.details?.forEach((d: any) => {
          log(` -> ${d.email}: ${d.success ? "DELIVERED SUCCESS" : "FAILED: " + (d.message || d.error)}`);
        });
        log(`Status: ${res.message}`);
        showToast("Mass email broadcast complete!");
      } else {
        log(`Broadcast node error: ${res.message}`);
      }
    } catch (err: any) {
      log(`Execution crash: ${err.message || err}`);
    } finally {
      setEmailSending(false);
    }
  };

  const handleSendTestEmail = async () => {
    if (!user?.email) {
      showToast("No logged-in admin email found for test dispatch.");
      return;
    }

    setTestEmailSending(true);
    setShowLogTerminal(true);
    setEmailLogs((prev) => [
      ...prev,
      `[${new Date().toLocaleTimeString()}] Dispatching test preview email to ${user.email}...`,
    ]);

    try {
      const idToken = await getIdToken();
      const res = await sendMassEmailAction({
        idToken,
        recipients: [
          {
            email: user.email,
            name: user.displayName || "Admin",
            username: "admin",
            id: user.uid,
          },
        ],
        subject: `[TEST PREVIEW] ${emailSubject}`,
        messageBody: emailBody,
        ctaText: emailCtaText,
        ctaUrl: emailCtaUrl,
        senderAlias: emailAlias,
        templateType: emailTemplateType,
        emailHeader: emailHeader,
        pillTag: emailPillTag,
        attachments: emailAttachments,
      });

      if (res.success) {
        setEmailLogs((prev) => [
          ...prev,
          `[${new Date().toLocaleTimeString()}] ✅ Test email delivered to ${user.email}!`,
        ]);
        showToast(`Test email dispatched to ${user.email}`);
      } else {
        setEmailLogs((prev) => [
          ...prev,
          `[${new Date().toLocaleTimeString()}] ❌ Test email failed: ${res.message}`,
        ]);
      }
    } catch (err: any) {
      setEmailLogs((prev) => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] ❌ Test email error: ${err.message || err}`,
      ]);
    } finally {
      setTestEmailSending(false);
    }
  };

  const activeRecipientsCount = getSelectedRecipientsList().filter((r) => !r.is_blocked).length;
  const persona = getPreviewPersona();

  const aliasMap: Record<string, string> = {
    official: "info@artistant.in",
    support: "support@artistant.in",
    founder: "founder@artistant.in",
    welcome: "welcome@artistant.in",
    security: "security@artistant.in",
  };

  const templateCards = [
    { id: "standard", title: "Announcement", desc: "Standard header, banner & CTA", icon: Megaphone, color: "#F25A2B" },
    { id: "migrated_artist", title: "Artist Onboarding", desc: "Migrated artist credentials pass", icon: UserCheck, color: "#10B981" },
    { id: "welcome", title: "Stage Pass", desc: "Waitlist pass stub & username claim", icon: Ticket, color: "#7C5CFF" },
    { id: "vip", title: "VIP Access Pass", desc: "Gold VIP founder priority ticket", icon: Crown, color: "#FFB800" },
    { id: "newsletter", title: "Product Digest", desc: "Release notes & feature drop", icon: Layers3, color: "#00E5FF" },
    { id: "plain_minimal", title: "Plain Letter", desc: "Minimalist unbranded direct text email", icon: Mail, color: "#A855F7" },
    { id: "raw", title: "Direct Markdown", desc: "Pure markdown / raw text formatting", icon: FileText, color: "#94A3B8" },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300 text-left">

      {/* ═══════════════════════════════════════════════════════════════════════
          STUDIO HEADER & CONTROL BAR
          ═══════════════════════════════════════════════════════════════════════ */}
      <div className="bg-bg-card border border-line-soft rounded-3xl p-5 sm:p-6 backdrop-blur-2xl shadow-2xl relative z-30">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-line-soft pb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#F25A2B] via-[#D4567A] to-[#7C5CFF] flex items-center justify-center shadow-lg shadow-[#7C5CFF]/25">
              <Sparkles className="w-6 h-6 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-display font-bold text-ink tracking-tight">Broadcast Studio</h2>
                <span className="text-[10px] font-mono font-bold text-[#7C5CFF] bg-[#7C5CFF]/15 px-2.5 py-0.5 rounded-full border border-[#7C5CFF]/30">
                  PRO MAILER v3.0
                </span>
              </div>
              <p className="text-xs text-ink-3 mt-0.5 font-sans">
                Compose, edit directly on live template graphics, target single email IDs, and broadcast emails.
              </p>
            </div>
          </div>

          {/* View Mode Switcher */}
          <div className="flex items-center gap-3">
            <div className="flex rounded-2xl p-1 bg-bg-soft border border-line-soft shadow-inner">
              <button
                type="button"
                onClick={() => setEmailStudioViewMode("canvas_editor")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                  emailStudioViewMode === "canvas_editor"
                    ? "bg-gradient-to-r from-[#F25A2B] to-[#7C5CFF] text-white shadow-md"
                    : "text-ink-3 hover:text-ink"
                }`}
              >
                <Mail className="w-4 h-4" />
                <span>Interactive Mail Canvas</span>
              </button>
              <button
                type="button"
                onClick={() => setEmailStudioViewMode("split_preview")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                  emailStudioViewMode === "split_preview"
                    ? "bg-gradient-to-r from-[#F25A2B] to-[#7C5CFF] text-white shadow-md"
                    : "text-ink-3 hover:text-ink"
                }`}
              >
                <Columns2 className="w-4 h-4" />
                <span>Split Inspector</span>
              </button>
            </div>
          </div>
        </div>

        {/* Addressing Row: To, From, Persona, Actions */}
        <div className="pt-4 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3 flex-1">

            {/* Target Audience (To) */}
            <div className="relative" ref={audienceRef}>
              <div className="text-[9px] font-mono font-bold uppercase tracking-wider text-ink-3 mb-1">
                Recipient Target (To):
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowAudienceDropdown(!showAudienceDropdown);
                  setShowAliasDropdown(false);
                }}
                className="flex items-center gap-2 bg-bg-soft hover:bg-bg-soft/80 border border-line-soft rounded-full px-4 py-2 text-xs font-bold text-ink transition-all cursor-pointer shadow-sm"
              >
                <Users className="w-3.5 h-3.5 text-[#7C5CFF]" />
                <span className="truncate max-w-[150px]">
                  {emailAudienceMode === "custom_emails"
                    ? "Single Email IDs"
                    : emailAudienceMode === "migrated_artists"
                    ? "Migrated Artists"
                    : emailAudienceMode === "all"
                    ? "All Members"
                    : emailAudienceMode === "filtered"
                    ? "Filtered Directory"
                    : "Selected Users"}
                </span>
                <span className="text-[10px] font-mono font-bold bg-[#7C5CFF]/15 text-[#7C5CFF] px-2 py-0.5 rounded-full border border-[#7C5CFF]/20">
                  {activeRecipientsCount}
                </span>
                <ChevronDown className={`w-3.5 h-3.5 text-ink-3 transition-transform ${showAudienceDropdown ? "rotate-180" : ""}`} />
              </button>

              {showAudienceDropdown && (
                <div className="absolute top-full left-0 mt-2 z-[100] min-w-[240px] bg-bg-card border border-line-soft rounded-2xl p-2 shadow-2xl space-y-1 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150 text-left">
                  <button
                    type="button"
                    onClick={() => { setEmailAudienceMode("custom_emails"); setShowAudienceDropdown(false); }}
                    className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                      emailAudienceMode === "custom_emails" ? "bg-[#7C5CFF]/15 text-[#7C5CFF]" : "text-ink hover:bg-bg-soft"
                    }`}
                  >
                    <span className="flex items-center gap-2"><AtSign className="w-3.5 h-3.5 text-[#7C5CFF]" /> Single Email IDs (Custom)</span>
                    <span className="font-mono text-[10px]">({customEmailChips.length})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { setEmailAudienceMode("migrated_artists"); setShowAudienceDropdown(false); }}
                    className={`w-full text-left px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                      emailAudienceMode === "migrated_artists" ? "bg-emerald-500/15 text-emerald-400" : "text-ink hover:bg-bg-soft"
                    }`}
                  >
                    <span>Migrated Artists</span>
                    <span className="font-mono text-[10px]">({registrations.filter(r => (r.is_migrated || r.user_id?.startsWith("imported_")) && !r.is_blocked).length})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { setEmailAudienceMode("all"); setShowAudienceDropdown(false); }}
                    className={`w-full text-left px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                      emailAudienceMode === "all" ? "bg-[#7C5CFF]/15 text-[#7C5CFF]" : "text-ink hover:bg-bg-soft"
                    }`}
                  >
                    <span>All Members</span>
                    <span className="font-mono text-[10px]">({registrations.filter(r => !r.is_blocked).length})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { setEmailAudienceMode("filtered"); setShowAudienceDropdown(false); }}
                    className={`w-full text-left px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                      emailAudienceMode === "filtered" ? "bg-[#7C5CFF]/15 text-[#7C5CFF]" : "text-ink hover:bg-bg-soft"
                    }`}
                  >
                    <span>Filtered Directory</span>
                    <span className="font-mono text-[10px]">({filteredRegistrations.filter(r => !r.is_blocked).length})</span>
                  </button>
                </div>
              )}
            </div>

            {/* Sender Address (From) */}
            <div className="relative" ref={aliasRef}>
              <div className="text-[9px] font-mono font-bold uppercase tracking-wider text-ink-3 mb-1">
                Sender Address (From):
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowAliasDropdown(!showAliasDropdown);
                  setShowAudienceDropdown(false);
                }}
                className="flex items-center gap-2 bg-bg-soft hover:bg-bg-soft/80 border border-line-soft rounded-full px-4 py-2 text-xs font-bold text-ink transition-all cursor-pointer shadow-sm"
              >
                <Mail className="w-3.5 h-3.5 text-[#F25A2B]" />
                <span className="truncate">{aliasMap[emailAlias] || "info@artistant.in"}</span>
                <ChevronDown className={`w-3.5 h-3.5 text-ink-3 transition-transform ${showAliasDropdown ? "rotate-180" : ""}`} />
              </button>

              {showAliasDropdown && (
                <div className="absolute top-full left-0 mt-2 z-[100] min-w-[220px] bg-bg-card border border-line-soft rounded-2xl p-2 shadow-2xl space-y-1 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150 text-left">
                  {Object.entries(aliasMap).map(([key, label]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => { setEmailAlias(key); setShowAliasDropdown(false); }}
                      className={`w-full text-left px-3.5 py-2 rounded-xl text-xs font-mono transition-all flex items-center justify-between cursor-pointer ${
                        emailAlias === key ? "bg-[#F25A2B]/15 text-[#F25A2B] font-bold" : "text-ink hover:bg-bg-soft"
                      }`}
                    >
                      <span>{label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Preview Persona Switcher */}
            <div>
              <div className="text-[9px] font-mono font-bold uppercase tracking-wider text-ink-3 mb-1">
                Preview Target Persona:
              </div>
              <div className="flex rounded-full p-0.5 bg-bg-soft border border-line-soft shadow-inner">
                <button
                  type="button"
                  onClick={() => setEmailPreviewPersona("admin")}
                  className={`px-3 py-1 rounded-full text-[10.5px] font-bold transition-all cursor-pointer ${
                    emailPreviewPersona === "admin" ? "bg-[#7C5CFF] text-white shadow-sm" : "text-ink-3 hover:text-ink"
                  }`}
                >
                  You ({user?.displayName?.split(" ")[0] || "Admin"})
                </button>
                <button
                  type="button"
                  onClick={() => setEmailPreviewPersona("first_recipient")}
                  className={`px-3 py-1 rounded-full text-[10.5px] font-bold transition-all cursor-pointer ${
                    emailPreviewPersona === "first_recipient" ? "bg-[#7C5CFF] text-white shadow-sm" : "text-ink-3 hover:text-ink"
                  }`}
                >
                  Recipient Sample
                </button>
                <button
                  type="button"
                  onClick={() => setEmailPreviewPersona("tags")}
                  className={`px-3 py-1 rounded-full text-[10.5px] font-bold transition-all cursor-pointer ${
                    emailPreviewPersona === "tags" ? "bg-[#7C5CFF] text-white shadow-sm" : "text-ink-3 hover:text-ink"
                  }`}
                >
                  Raw Tags
                </button>
              </div>
            </div>

            {/* Inspect Audience Queue Toggle */}
            <div>
              <div className="text-[9px] font-mono font-bold uppercase tracking-wider text-ink-3 mb-1">
                Audience Queue:
              </div>
              <button
                type="button"
                onClick={() => setShowRecipientDrawer(!showRecipientDrawer)}
                className={`px-3.5 py-1.5 rounded-full border text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                  showRecipientDrawer
                    ? "bg-[#7C5CFF]/15 border-[#7C5CFF]/40 text-[#7C5CFF]"
                    : "bg-bg-soft hover:bg-bg-soft/80 border-line-soft text-ink-2"
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>Inspect List ({activeRecipientsCount})</span>
                <ChevronDown className={`w-3 h-3 transition-transform ${showRecipientDrawer ? "rotate-180" : ""}`} />
              </button>
            </div>
          </div>

          {/* Action Dispatch Buttons */}
          <div className="flex items-center gap-3 pt-2 lg:pt-0 border-t lg:border-t-0 border-line-soft">
            <button
              onClick={handleSendTestEmail}
              disabled={testEmailSending || emailSending}
              className="py-2 px-4 rounded-full text-xs font-bold flex items-center justify-center gap-2 text-ink bg-bg-soft hover:bg-bg-soft/80 border border-line-soft disabled:opacity-50 transition-all cursor-pointer shadow-sm active:scale-95"
            >
              {testEmailSending ? <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#7C5CFF]" /> : <Send className="w-3.5 h-3.5 text-ink-3" />}
              {testEmailSending ? "Sending..." : "Test Email"}
            </button>

            <button
              onClick={handleSendEmailBroadcast}
              disabled={emailSending || activeRecipientsCount === 0}
              className="py-2.5 px-6 rounded-full text-xs font-bold flex items-center justify-center gap-2 text-white bg-gradient-to-r from-[#F25A2B] via-[#D4567A] to-[#7C5CFF] hover:opacity-95 disabled:opacity-50 transition-all cursor-pointer shadow-lg shadow-[#7C5CFF]/25 active:scale-95 border border-white/10 uppercase tracking-wider font-mono"
            >
              {emailSending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              {emailSending ? "Dispatching..." : `Send Broadcast (${activeRecipientsCount})`}
            </button>
          </div>
        </div>

        {/* Single Email ID Custom Recipient Entry Bar */}
        {emailAudienceMode === "custom_emails" && (
          <div className="mt-4 bg-bg-soft/50 border border-[#7C5CFF]/30 p-4 rounded-2xl space-y-3 text-left animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono font-bold text-[#7C5CFF] uppercase tracking-wider flex items-center gap-2">
                <AtSign className="w-4 h-4" />
                Single Email ID Recipient Entry ({customEmailChips.length} Added)
              </label>
              <span className="text-[10px] font-mono text-ink-3">
                Type single email addresses or paste comma/space separated lists
              </span>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="email"
                value={customSingleEmailInput}
                onChange={(e) => setCustomSingleEmailInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === ",") {
                    e.preventDefault();
                    handleAddCustomEmail();
                  }
                }}
                placeholder="Enter single email ID (e.g. artist@domain.com) and press Enter..."
                className="flex-1 h-10 bg-bg-card border border-line-soft focus:border-[#7C5CFF] text-xs font-mono font-semibold text-ink placeholder:text-ink-3/40 rounded-xl px-4 transition-all outline-none"
              />
              <button
                type="button"
                onClick={() => handleAddCustomEmail()}
                className="px-5 h-10 bg-[#7C5CFF] text-white text-xs font-mono font-bold rounded-xl hover:bg-[#7C5CFF]/90 transition-all cursor-pointer flex items-center gap-1.5 shadow-md"
              >
                <Plus className="w-4 h-4" /> Add Email
              </button>
            </div>

            {/* Chips Display */}
            {customEmailChips.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 pt-1">
                {customEmailChips.map((emailStr) => (
                  <span
                    key={emailStr}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#7C5CFF]/15 text-[#7C5CFF] border border-[#7C5CFF]/30 rounded-full font-mono text-xs font-bold shadow-sm"
                  >
                    <span>{emailStr}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveCustomEmail(emailStr)}
                      className="hover:text-red-400 cursor-pointer ml-1 text-sm font-bold"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Collapsible Recipient Queue Inspector Drawer */}
        {showRecipientDrawer && (
          <div className="mt-4 bg-bg-card border border-line-soft rounded-2xl p-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200 relative z-30 shadow-xl backdrop-blur-xl text-left">
            <div className="flex items-center justify-between border-b border-line-soft pb-2">
              <div className="flex items-center gap-2 text-xs font-bold text-ink">
                <Users className="w-4 h-4 text-[#7C5CFF]" />
                <span>Active Target Recipients ({activeRecipientsCount} Members)</span>
              </div>
              <button
                onClick={() => setShowRecipientDrawer(false)}
                className="text-[10px] font-mono font-bold text-ink-3 hover:text-ink cursor-pointer px-2.5 py-0.5 rounded-full bg-bg-soft border border-line-soft"
              >
                Close [✕]
              </button>
            </div>

            <div className="max-h-44 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 pr-1">
              {getSelectedRecipientsList()
                .filter((r) => !r.is_blocked)
                .map((reg) => (
                  <div
                    key={reg.id || reg.user_id}
                    className="flex items-center gap-2.5 bg-bg-soft/50 border border-line-soft rounded-xl p-2 text-xs hover:border-[#7C5CFF]/30 transition-colors"
                  >
                    <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-[#7C5CFF] to-[#D4567A] text-white font-mono font-bold flex items-center justify-center text-[10px] shrink-0 shadow-sm">
                      {reg.display_name?.charAt(0) || reg.username?.charAt(0) || "A"}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-ink truncate text-xs">{reg.display_name || reg.username}</div>
                      <div className="text-[9.5px] text-ink-3 font-mono truncate">{reg.email}</div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>

      {/* ── 2. Campaign Template Presets Gallery ── */}
      <div className="bg-bg-card border border-line-soft p-5 rounded-3xl backdrop-blur-2xl shadow-xl space-y-3 text-left">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono font-bold text-ink-3 uppercase tracking-wider flex items-center gap-2">
            <Layers3 className="w-4 h-4 text-[#7C5CFF]" />
            Campaign Template Presets
          </span>
          <span className="text-[10px] font-mono text-ink-3 uppercase">
            Active: <strong className="text-[#7C5CFF]">{emailTemplateType.replace("_", " ").toUpperCase()}</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3">
          {templateCards.map((card) => {
            const isActive = emailTemplateType === card.id;
            const IconComp = card.icon;
            return (
              <button
                key={card.id}
                type="button"
                onClick={() => loadTemplatePreset(card.id as any)}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
                  isActive
                    ? "bg-gradient-to-br from-[#7C5CFF]/15 to-[#F25A2B]/10 border-[#7C5CFF] text-ink shadow-md ring-1 ring-[#7C5CFF]/40"
                    : "bg-bg-soft/40 border-line-soft text-ink-3 hover:text-ink hover:bg-bg-soft"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div
                    className="w-7 h-7 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${card.color}20`, color: card.color }}
                  >
                    <IconComp className="w-4 h-4" />
                  </div>
                  {isActive && <CheckCircle2 className="w-4 h-4 text-[#7C5CFF]" />}
                </div>
                <div>
                  <div className="text-xs font-bold text-ink truncate">{card.title}</div>
                  <div className="text-[9.5px] text-ink-3 font-mono line-clamp-1 mt-0.5">{card.desc}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── 3. Main Workspace: Interactive Canvas vs Split Inspector ── */}
      {emailStudioViewMode === "canvas_editor" ? (
        /* ══ GMAIL STUDIO MODE: Interactive Direct Writing Canvas ══ */
        <div className="bg-bg-card border border-line-soft rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-left backdrop-blur-2xl">
          {/* Canvas Toolbar & Theme Switcher */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-line-soft pb-4">
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-[#10B981] animate-ping" />
              <div>
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-ink flex items-center gap-2">
                  Interactive Email Composer
                  <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20 font-bold">
                    Direct Canvas Typing Active
                  </span>
                </h3>
                <p className="text-[11px] text-ink-3 mt-0.5">
                  Type & edit subject, pill tag, header title, body text, and CTA buttons directly on the email mockup below.
                </p>
              </div>
            </div>

            {/* Dark/Light Email Client Theme Switcher */}
            <div className="flex rounded-xl p-0.5 bg-bg-soft border border-line-soft shadow-inner">
              <button
                type="button"
                onClick={() => setEmailClientTheme("dark")}
                className={`px-3 py-1 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer flex items-center gap-1 uppercase ${
                  emailClientTheme === "dark"
                    ? "bg-gradient-to-r from-[#F25A2B] to-[#7C5CFF] text-white shadow-sm"
                    : "text-ink-3 hover:text-ink"
                }`}
              >
                <Moon className="w-3 h-3" /> Dark Client
              </button>
              <button
                type="button"
                onClick={() => setEmailClientTheme("light")}
                className={`px-3 py-1 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer flex items-center gap-1 uppercase ${
                  emailClientTheme === "light"
                    ? "bg-gradient-to-r from-[#F25A2B] to-[#7C5CFF] text-white shadow-sm"
                    : "text-ink-3 hover:text-ink"
                }`}
              >
                <Sun className="w-3 h-3" /> Light Client
              </button>
            </div>
          </div>

          {/* Quick Insert & Formatting Shortcuts Toolbar */}
          <div className="bg-bg-soft/50 border border-line-soft rounded-2xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] font-mono font-bold text-ink-3 uppercase mr-1">Dynamic Tags:</span>
              {[
                { label: "{{name}}", value: "{{name}}" },
                { label: "{{username}}", value: "{{username}}" },
                { label: "{{claim_url}}", value: "{{claim_url}}" },
              ].map((v) => (
                <button
                  key={v.label}
                  type="button"
                  onClick={() => setEmailBody((prev) => prev + ` ${v.value}`)}
                  className="text-[10px] font-mono text-[#7C5CFF] bg-[#7C5CFF]/15 hover:bg-[#7C5CFF]/25 border border-[#7C5CFF]/30 px-2.5 py-1 rounded-lg cursor-pointer transition-all font-bold"
                >
                  {v.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1">
              {[
                { icon: Bold, title: "Bold", insert: "**text**" },
                { icon: Italic, title: "Italic", insert: "*text*" },
                { icon: List, title: "Bullet List", insert: "\n• Item 1\n• Item 2\n" },
                { icon: Link2, title: "Link", insert: " [link](https://artistant.in)" },
              ].map((btn) => (
                <button
                  key={btn.title}
                  type="button"
                  title={btn.title}
                  onClick={() => setEmailBody((prev) => prev + btn.insert)}
                  className="p-1.5 rounded-lg text-ink-3 hover:text-ink hover:bg-bg-soft transition-colors cursor-pointer border border-line-soft/50"
                >
                  <btn.icon className="w-3.5 h-3.5" />
                </button>
              ))}
            </div>
          </div>

          {/* Interactive macOS / Gmail Window Mockup */}
          <div
            className={`rounded-3xl border transition-all duration-300 shadow-2xl overflow-hidden max-w-3xl mx-auto ${
              emailClientTheme === "dark"
                ? "bg-[#0D0E15] border-white/10 text-slate-200"
                : "bg-[#FFFFFF] border-slate-200 text-slate-900 shadow-xl"
            }`}
          >
            {/* Header / Envelope Title Bar */}
            <div
              className={`p-5 sm:p-6 border-b space-y-3.5 ${
                emailClientTheme === "dark" ? "bg-[#08090E] border-white/10" : "bg-slate-50 border-slate-200"
              }`}
            >
              <div className="flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 uppercase font-bold">From:</span>
                  <span className="font-bold text-[#F25A2B] bg-[#F25A2B]/10 px-2.5 py-0.5 rounded-md border border-[#F25A2B]/20">
                    {aliasMap[emailAlias]}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 uppercase font-bold">To:</span>
                  <span className="font-bold text-[#7C5CFF]">{activeRecipientsCount} Target Recipient(s)</span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9.5px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                  Subject Line (Direct Editing)
                </label>
                <input
                  type="text"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  className={`w-full text-base sm:text-lg font-bold transition-all outline-none rounded-xl px-3 py-2 border ${
                    emailClientTheme === "dark"
                      ? "bg-[#141622] text-white border-white/10 focus:border-[#7C5CFF]"
                      : "bg-white text-slate-900 border-slate-200 focus:border-[#7C5CFF]"
                  }`}
                  placeholder="Type email subject line here..."
                />
              </div>
            </div>

            {/* Content Body Canvas */}
            <div className="p-6 sm:p-8 space-y-6 text-left">
              {emailTemplateType === "raw" || emailTemplateType === "plain_minimal" ? (
                <div className="flex items-center justify-between border-b border-slate-200/40 pb-4">
                  <img src="/logo_wordmark_flat.png" alt="ArtisTant" className="h-6 w-auto object-contain" />
                  <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">
                    PLAIN DIRECT MAIL
                  </span>
                </div>
              ) : (
                <div className="w-full space-y-3">
                  <div className="flex items-center justify-between">
                    <img src="/logo_wordmark_flat.png" alt="ArtisTant" className="h-6 w-auto object-contain" />
                    <input
                      type="text"
                      value={emailPillTag}
                      onChange={(e) => setEmailPillTag(e.target.value)}
                      className="text-[10px] font-mono font-bold px-3 py-1 rounded-full uppercase tracking-wider border outline-none bg-transparent text-[#F25A2B] border-[#F25A2B]/40 focus:border-[#F25A2B]"
                      placeholder="⚡ TAG"
                    />
                  </div>
                  <div className="h-0.5 w-full bg-gradient-to-r from-[#F25A2B] via-[#D4567A] to-[#7C5CFF]" />
                </div>
              )}

              {emailTemplateType !== "raw" && (
                <div>
                  <label className="text-[9px] font-mono text-slate-400 uppercase font-bold block mb-1">
                    Inner Heading / Banner Title
                  </label>
                  <input
                    type="text"
                    value={emailHeader}
                    onChange={(e) => setEmailHeader(e.target.value)}
                    className={`w-full font-display font-bold text-xl sm:text-2xl leading-tight transition-all outline-none rounded-xl px-3 py-2 border ${
                      emailClientTheme === "dark"
                        ? "bg-[#141622] text-white border-white/10 focus:border-[#7C5CFF]"
                        : "bg-slate-50 text-slate-900 border-slate-200 focus:border-[#7C5CFF]"
                    }`}
                    placeholder="Inner email header title..."
                  />
                </div>
              )}

              <div className="pt-2">
                <p className={`font-bold text-sm ${emailClientTheme === "dark" ? "text-white" : "text-slate-900"}`}>
                  Hey {persona.name},
                </p>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-mono text-slate-400 uppercase font-bold block mb-1">
                  Email Body Content (Direct Typing)
                </label>
                <textarea
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  rows={10}
                  className={`w-full text-xs sm:text-sm leading-relaxed transition-all outline-none rounded-2xl p-4 border font-sans ${
                    emailClientTheme === "dark"
                      ? "bg-[#141622] text-slate-200 border-white/10 focus:border-[#7C5CFF]"
                      : "bg-slate-50 text-slate-800 border-slate-200 focus:border-[#7C5CFF]"
                  }`}
                  placeholder="Write your email body content directly here..."
                />
              </div>

              {/* Pass Card Graphic for Welcome / VIP / Migrated */}
              {(emailTemplateType === "welcome" ||
                emailTemplateType === "vip" ||
                emailTemplateType === "migrated_artist") && (
                <div className="bg-[#0F172A] rounded-2xl overflow-hidden border border-slate-700 shadow-xl my-4 text-left">
                  <div className="h-1 bg-gradient-to-r from-[#F25A2B] via-[#FFB800] to-[#7C5CFF]" />
                  <div className="p-4 flex items-center justify-between">
                    <div>
                      <div className="text-[8px] font-mono font-extrabold text-[#7C5CFF] uppercase tracking-widest">
                        ARTISTANT FOUNDING PASS
                      </div>
                      <div className="text-xs font-extrabold text-white mt-0.5">Founding Artist Handle Reserved</div>
                    </div>
                    <span className="text-[8.5px] font-mono font-bold text-emerald-400 bg-emerald-500/15 px-3 py-1 rounded-full border border-emerald-500/30">
                      ✓ VERIFIED 100 PTS
                    </span>
                  </div>
                  <div className="px-4 py-2.5 bg-[#0B1120] flex items-center justify-between border-t border-dashed border-slate-700/80 font-mono text-xs">
                    <div className="text-[9px] text-slate-300">
                      PASSENGER: {persona.name} (@{persona.username})
                    </div>
                    <div className="text-[9px] text-[#F25A2B] font-extrabold">
                      ART-{persona.username.toUpperCase().slice(0, 8)}-2026
                    </div>
                  </div>
                </div>
              )}

              {/* CTA Inputs */}
              <div
                className={`p-4 rounded-2xl border space-y-3 ${
                  emailClientTheme === "dark" ? "bg-[#141622] border-white/10" : "bg-slate-50 border-slate-200"
                }`}
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      CTA Button Text
                    </label>
                    <input
                      type="text"
                      value={emailCtaText}
                      onChange={(e) => setEmailCtaText(e.target.value)}
                      className="w-full text-xs font-bold text-ink bg-bg-card border border-line-soft rounded-xl px-3 py-2 outline-none focus:border-[#7C5CFF]"
                      placeholder="CTA Button Text"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      CTA Destination URL
                    </label>
                    <input
                      type="text"
                      value={emailCtaUrl}
                      onChange={(e) => setEmailCtaUrl(e.target.value)}
                      className="w-full text-xs font-mono text-ink bg-bg-card border border-line-soft rounded-xl px-3 py-2 outline-none focus:border-[#7C5CFF]"
                      placeholder="https://artistant.in"
                    />
                  </div>
                </div>

                {emailCtaText && (
                  <div className="pt-2 text-center">
                    <span className="inline-block px-8 py-3 font-bold text-xs rounded-full uppercase tracking-wider shadow-lg bg-gradient-to-r from-[#F25A2B] via-[#D4567A] to-[#7C5CFF] text-white">
                      {emailCtaText}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ══ SPLIT INSPECTOR MODE ══ */
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
          {/* Form Left */}
          <div className="xl:col-span-6 bg-bg-card border border-line-soft rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5 text-left backdrop-blur-xl">
            <div className="flex items-center justify-between border-b border-line-soft pb-3">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-ink">Document Composer</h3>
              <span className="text-[10px] font-mono text-ink-3 uppercase bg-bg-soft px-2.5 py-1 rounded-lg border border-line-soft">
                {emailTemplateType} template
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
              <div className="sm:col-span-8">
                <label className="text-[10px] font-mono font-bold text-ink-3 uppercase tracking-wider block mb-1">
                  Email Subject Line
                </label>
                <input
                  type="text"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  className="w-full h-10 bg-bg-soft/40 border border-line-soft focus:border-[#7C5CFF] text-xs font-bold text-ink rounded-xl px-4 outline-none"
                />
              </div>
              <div className="sm:col-span-4">
                <label className="text-[10px] font-mono font-bold text-ink-3 uppercase tracking-wider block mb-1">
                  Pill Tag
                </label>
                <input
                  type="text"
                  value={emailPillTag}
                  onChange={(e) => setEmailPillTag(e.target.value)}
                  className="w-full h-10 bg-bg-soft/40 border border-line-soft focus:border-[#7C5CFF] text-xs font-mono font-bold text-ink rounded-xl px-4 outline-none uppercase"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-mono font-bold text-ink-3 uppercase tracking-wider block mb-1">
                Inner Heading Title
              </label>
              <input
                type="text"
                value={emailHeader}
                onChange={(e) => setEmailHeader(e.target.value)}
                className="w-full h-10 bg-bg-soft/40 border border-line-soft focus:border-[#7C5CFF] text-xs text-ink font-semibold rounded-xl px-4 outline-none"
              />
            </div>

            <div>
              <label className="text-[10px] font-mono font-bold text-ink-3 uppercase tracking-wider block mb-1">
                Body Message
              </label>
              <textarea
                value={emailBody}
                onChange={(e) => setEmailBody(e.target.value)}
                rows={10}
                className="w-full bg-bg-soft/40 border border-line-soft rounded-2xl p-4 text-xs text-ink focus:outline-none resize-none leading-relaxed font-normal focus:border-[#7C5CFF]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-mono font-bold text-ink-3 uppercase tracking-wider block mb-1">
                  CTA Label
                </label>
                <input
                  type="text"
                  value={emailCtaText}
                  onChange={(e) => setEmailCtaText(e.target.value)}
                  className="w-full bg-bg-soft/40 border border-line-soft rounded-xl px-4 py-2 text-xs text-ink font-bold outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] font-mono font-bold text-ink-3 uppercase tracking-wider block mb-1">
                  CTA Destination URL
                </label>
                <input
                  type="text"
                  value={emailCtaUrl}
                  onChange={(e) => setEmailCtaUrl(e.target.value)}
                  className="w-full bg-bg-soft/40 border border-line-soft rounded-xl px-4 py-2 text-xs font-mono text-ink outline-none"
                />
              </div>
            </div>
          </div>

          {/* Preview Right */}
          <div className="xl:col-span-6 xl:sticky xl:top-6 space-y-0 text-left bg-bg-card border border-line-soft rounded-3xl p-0 shadow-2xl backdrop-blur-xl overflow-hidden">
            <div className="bg-bg-soft/70 border-b border-line-soft px-5 py-3 flex items-center justify-between">
              <span className="text-[11px] font-mono font-bold text-ink-3 uppercase tracking-wider">
                Live Preview Canvas
              </span>
              <button
                type="button"
                onClick={() => setEmailClientTheme(emailClientTheme === "dark" ? "light" : "dark")}
                className="text-[10px] font-mono font-bold text-ink-3 hover:text-ink px-2.5 py-1 rounded-lg border border-line-soft bg-bg-card cursor-pointer"
              >
                {emailClientTheme === "dark" ? "☀️ Light Mode" : "🌙 Dark Mode"}
              </button>
            </div>

            <div className="p-4 max-h-[680px] overflow-y-auto">
              <div
                className={`p-5 rounded-2xl border ${
                  emailClientTheme === "dark"
                    ? "bg-[#0D0E15] border-white/10 text-slate-200"
                    : "bg-white border-slate-200 text-slate-900 shadow-lg"
                }`}
              >
                <div className="space-y-4 text-left">
                  {emailPillTag && (
                    <span className="text-[9px] font-mono font-bold px-3 py-1 rounded-full uppercase bg-[#F25A2B]/15 text-[#F25A2B] border border-[#F25A2B]/30 inline-block">
                      {emailPillTag}
                    </span>
                  )}
                  {emailHeader && <h3 className="font-bold text-lg leading-snug">{emailHeader}</h3>}
                  <p className="font-semibold text-xs">Hey {persona.name},</p>
                  <div
                    className="text-xs leading-relaxed space-y-2 text-slate-300 font-normal"
                    dangerouslySetInnerHTML={{
                      __html: emailBody
                        .replaceAll("{{name}}", persona.name)
                        .replaceAll("{{username}}", persona.username)
                        .replaceAll("{{claim_url}}", emailCtaUrl || "https://artistant.in")
                        .replace(/\n\n/g, "</p><p>")
                        .replace(/\n/g, "<br/>"),
                    }}
                  />
                  {emailCtaText && (
                    <div className="pt-3 text-center">
                      <span className="px-6 py-2.5 rounded-full text-xs font-bold bg-gradient-to-r from-[#F25A2B] to-[#7C5CFF] text-white inline-block">
                        {emailCtaText}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── 4. Execution Terminal Log ── */}
      {showLogTerminal && (
        <div className="bg-bg-card border border-line-soft rounded-3xl overflow-hidden shadow-2xl backdrop-blur-xl mt-6 text-left">
          <div className="bg-bg-soft/70 px-5 py-3 border-b border-line-soft flex justify-between items-center">
            <span className="text-xs font-mono font-bold text-ink flex items-center gap-2 uppercase tracking-wider">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  emailSending || testEmailSending ? "bg-amber-400 animate-ping" : "bg-emerald-400"
                }`}
              />
              Execution Terminal ({emailLogs.length} Events)
            </span>
            <button
              onClick={() => setShowLogTerminal(false)}
              className="text-[10px] font-mono text-ink-3 hover:text-ink cursor-pointer px-2.5 py-1 rounded-full bg-bg-card border border-line-soft font-bold"
            >
              Hide Terminal [✕]
            </button>
          </div>
          <div className="p-4 bg-[#08090E] max-h-48 overflow-y-auto font-mono text-[11px] space-y-1.5 text-left">
            {emailLogs.map((logStr, i) => (
              <div
                key={i}
                className={
                  logStr.includes("✅")
                    ? "text-emerald-400 font-semibold"
                    : logStr.includes("❌") || logStr.includes("FAILED")
                    ? "text-red-400 font-semibold"
                    : "text-slate-300"
                }
              >
                {logStr}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
