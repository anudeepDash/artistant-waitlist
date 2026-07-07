"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  adminGetRegistrations, 
  adminUpdateRegistration, 
  type AdminWaitlistEntry 
} from "@/lib/waitlist";
import { 
  sendWelcomeEmailAction, 
  sendMassEmailAction 
} from "@/lib/email-actions";
import { 
  Users, 
  CheckCircle2, 
  XCircle, 
  Search, 
  Lock, 
  Database, 
  Layers, 
  Download, 
  Share2, 
  Calendar as CalendarIcon, 
  Image as ImageIcon, 
  Eye, 
  Settings, 
  Sparkles, 
  AlertCircle,
  Copy,
  ChevronRight,
  LogOut,
  RefreshCw,
  Plus,
  Mail,
  Send,
  ShieldAlert,
  Flame,
  ArrowUpRight,
  Smartphone,
  Monitor
} from "lucide-react";

// ---------------------------------------------------------------------------
// Sandbox Mock Data fallback
// ---------------------------------------------------------------------------
const MOCK_REGISTRATIONS: AdminWaitlistEntry[] = [
  {
    id: "mock-1",
    user_id: "uid-m1",
    username: "shreya.voice",
    email: "shreya@voice.in",
    display_name: "Shreya Sharma",
    role: "artist",
    category: "singer",
    genres: ["Classical", "Bollywood", "Sufi"],
    phone: "+91 98765 43210",
    reserved_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    is_verified: true,
    is_blocked: false,
    position_override: 1
  },
  {
    id: "mock-2",
    user_id: "uid-m2",
    username: "social_bengaluru",
    email: "events@socialind.com",
    display_name: "Social Indiranagar",
    role: "venue",
    category: "club",
    genres: [],
    phone: "+91 80422 13344",
    reserved_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    is_verified: false,
    is_blocked: false,
    position_override: null
  },
  {
    id: "mock-3",
    user_id: "uid-m3",
    username: "karthik.grooves",
    email: "karthik.beats@gmail.com",
    display_name: "Karthik Raja",
    role: "artist",
    category: "dj",
    genres: ["Techno", "House"],
    phone: "+91 99001 12233",
    reserved_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    is_verified: true,
    is_blocked: false,
    position_override: null
  },
  {
    id: "mock-4",
    user_id: "uid-m4",
    username: "spitfire_mc",
    email: "mc.spitfire@yahoo.com",
    display_name: "MC Spitfire",
    role: "artist",
    category: "mc_rapper",
    genres: ["Hip Hop", "Rap"],
    phone: "+91 77665 54433",
    reserved_at: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(),
    is_verified: false,
    is_blocked: true,
    position_override: null
  },
  {
    id: "mock-5",
    user_id: "uid-m5",
    username: "soundslive",
    email: "rentals@soundslive.in",
    display_name: "Sounds Live Bengaluru",
    role: "vendor",
    category: "audio_visual",
    genres: [],
    phone: "+91 98888 77777",
    reserved_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    is_verified: false,
    is_blocked: false,
    position_override: null
  }
];

// ---------------------------------------------------------------------------
// Social Post Calendar Schedule
// ---------------------------------------------------------------------------
interface SocialPost {
  id: string;
  date: string;
  day: string;
  time: string;
  platform: "Instagram" | "Twitter/X" | "LinkedIn";
  type: "milestone" | "feature" | "countdown";
  title: string;
  caption: string;
  graphicPreset: {
    type: "milestone" | "feature" | "countdown";
    title: string;
    subText: string;
    stat?: string;
    theme: "cyber" | "sunset" | "indigo";
    featureKey?: string;
  };
}

const SOCIAL_CALENDAR: SocialPost[] = [
  {
    id: "post-1",
    date: "2026-07-06",
    day: "Mon",
    time: "11:00 AM",
    platform: "Instagram",
    type: "feature",
    title: "Spotlight: The Bookability Score™",
    caption: "📊 Reliability metrics that change the game. Book verified talent with data-backed confidence. #ArtistantBackstage #BookabilityScore",
    graphicPreset: {
      type: "feature",
      title: "THE BOOKABILITY SCORE™",
      subText: "DATA-BACKED RELIABILITY RATING FOR PERFORMERS",
      theme: "cyber",
      featureKey: "bookability"
    }
  },
  {
    id: "post-2",
    date: "2026-07-08",
    day: "Wed",
    time: "03:30 PM",
    platform: "Twitter/X",
    type: "milestone",
    title: "Milestone: 500 waitlist registrations!",
    caption: "🚀 500+ creators and venues onboard the live network. The stage is set. Claim your username at artistant.in! #ArtistantWaitlist",
    graphicPreset: {
      type: "milestone",
      title: "WAITLIST RISING",
      subText: "CREATORS CLAIMING THEIR SLOTS ON THE LIVE NETWORK",
      stat: "500+",
      theme: "sunset"
    }
  },
  {
    id: "post-3",
    date: "2026-07-10",
    day: "Fri",
    time: "06:00 PM",
    platform: "LinkedIn",
    type: "feature",
    title: "Spotlight: GigSafe Escrow",
    caption: "🔒 Zero payment delays. Zero cancellations. GigSafe Escrow secures event budgets upfront. #GigSafe #FintechEvents",
    graphicPreset: {
      type: "feature",
      title: "GIGSAFE ESCROW",
      subText: "SECURED PAYMENT PROTOCOLS FOR THE ENTERTAINMENT ECONOMY",
      theme: "indigo",
      featureKey: "escrow"
    }
  }
];

export default function AdminPage() {
  // ---------------------------------------------------------------------------
  // Security & Core State
  // ---------------------------------------------------------------------------
  const [passcode, setPasscode] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [authError, setAuthError] = useState("");
  const [isLiveMode, setIsLiveMode] = useState(false);
  const [registrations, setRegistrations] = useState<AdminWaitlistEntry[]>(MOCK_REGISTRATIONS);
  const [isLoading, setIsLoading] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);
  
  // Tabs: registrations | graphics | calendar | emailing
  const [activeTab, setActiveTab] = useState<"registrations" | "graphics" | "calendar" | "emailing">("registrations");
  
  // Notification Toast
  const [successToast, setSuccessToast] = useState<string | null>(null);
  
  // Waitlist Queries & Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showSqlMigration, setShowSqlMigration] = useState(false);
  
  // ---------------------------------------------------------------------------
  // Unified Graphics Engine State
  // ---------------------------------------------------------------------------
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [graphicType, setGraphicType] = useState<"milestone" | "feature" | "countdown">("milestone");
  const [canvasLayout, setCanvasLayout] = useState<"square" | "portrait">("square"); // square (1:1) vs portrait (9:16)
  const [unifiedTheme, setUnifiedTheme] = useState<"cyber" | "sunset" | "indigo">("cyber");
  
  // Canvas Parameters
  const [gHeadline, setGHeadline] = useState("THE BOOKABILITY SCORE™");
  const [gSubtext, setGSubtext] = useState("DATA-BACKED RELIABILITY RATING FOR PERFORMERS");
  const [gMilestoneStat, setGMilestoneStat] = useState("500+");
  const [gMilestoneTitle, setGMilestoneTitle] = useState("WAITLIST UNLOCKED");
  const [gCountdownTarget, setGCountdownTarget] = useState("2026-10-31");

  // ---------------------------------------------------------------------------
  // Email Broadcast Engine State
  // ---------------------------------------------------------------------------
  const [emailSubject, setEmailSubject] = useState("Exclusive early access keys for ArtisTant 🚀");
  const [emailHeader, setEmailHeader] = useState("Your ArtisTant waitlist handle is secured.");
  const [emailBody, setEmailBody] = useState(
    "We are opening the first stage of beta onboarding. Build your verified profile, set up your Bookability Score rating, and secure your event bookings early.\n\nClick the link below to verify your device credentials."
  );
  const [emailCtaText, setEmailCtaText] = useState("Claim Access Keys");
  const [emailCtaUrl, setEmailCtaUrl] = useState("https://artistant.in");
  const [emailAlias, setEmailAlias] = useState("official"); // official | support | founder
  const [emailPreviewMode, setEmailPreviewMode] = useState<"desktop" | "mobile">("mobile");
  
  const [emailSending, setEmailSending] = useState(false);
  const [emailLogs, setEmailLogs] = useState<string[]>([]);
  const [showLogTerminal, setShowLogTerminal] = useState(false);

  // ---------------------------------------------------------------------------
  // Persistence & Initial Validation
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const savedPass = localStorage.getItem("artistant_admin_passcode");
    if (savedPass) {
      setPasscode(savedPass);
      verifyAndLoad(savedPass);
    }
  }, []);

  // Redraw Canvas on change
  useEffect(() => {
    if (isUnlocked && (activeTab === "graphics" || activeTab === "calendar")) {
      drawUnifiedCanvas();
    }
  }, [
    isUnlocked, 
    activeTab, 
    graphicType, 
    canvasLayout, 
    unifiedTheme, 
    gHeadline, 
    gSubtext, 
    gMilestoneStat, 
    gMilestoneTitle, 
    gCountdownTarget
  ]);

  // Toast Timer
  useEffect(() => {
    if (successToast) {
      const timer = setTimeout(() => setSuccessToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [successToast]);

  const showToast = (msg: string) => {
    setSuccessToast(msg);
  };

  // ---------------------------------------------------------------------------
  // API Fetch & Authentication
  // ---------------------------------------------------------------------------
  const verifyAndLoad = async (pass: string) => {
    setIsLoading(true);
    setAuthError("");
    setDbError(null);
    try {
      const data = await adminGetRegistrations(pass);
      setRegistrations(data);
      setIsLiveMode(true);
      setIsUnlocked(true);
      localStorage.setItem("artistant_admin_passcode", pass);
      showToast("Live Database Node Connected Successfully!");
    } catch (err: any) {
      console.warn("Supabase fetch failed. Falling back to Sandbox LocalStorage.", err);
      if (err.message?.includes("Invalid admin passcode") || err.code === "PGRST301") {
        setAuthError("Access Credential Invalid.");
        setIsUnlocked(false);
        localStorage.removeItem("artistant_admin_passcode");
      } else {
        // Fallback Sandbox
        const sandbox = localStorage.getItem("artistant_sandbox_registrations");
        if (sandbox) {
          setRegistrations(JSON.parse(sandbox));
        } else {
          setRegistrations(MOCK_REGISTRATIONS);
          localStorage.setItem("artistant_sandbox_registrations", JSON.stringify(MOCK_REGISTRATIONS));
        }
        setIsLiveMode(false);
        setIsUnlocked(true);
        localStorage.setItem("artistant_admin_passcode", pass);
        setDbError("Supabase RPC failed. Switched to Sandbox Demo mode. See SQL configuration below.");
        showToast("Unlocked Sandbox Control Node");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passcode.trim()) {
      setAuthError("Credential passcode is required.");
      return;
    }
    verifyAndLoad(passcode);
  };

  const handleLogout = () => {
    localStorage.removeItem("artistant_admin_passcode");
    setIsUnlocked(false);
    setPasscode("");
    setAuthError("");
  };

  // ---------------------------------------------------------------------------
  // Action Handlers: Verify, Block, Position Override
  // ---------------------------------------------------------------------------
  const handleVerifyAndLock = async (reg: AdminWaitlistEntry) => {
    const nextState = !reg.is_verified;
    const updated = registrations.map(r => {
      if (r.user_id === reg.user_id) return { ...r, is_verified: nextState };
      return r;
    });
    setRegistrations(updated);

    try {
      if (isLiveMode) {
        await adminUpdateRegistration(passcode, reg.user_id, nextState, reg.is_blocked, reg.position_override);
        if (nextState) {
          // Send welcome email action
          await sendWelcomeEmailAction({
            email: reg.email,
            name: reg.display_name || reg.username,
            username: reg.username
          });
          showToast(`User Verified. Welcome Email Dispatched to @${reg.username}!`);
        } else {
          showToast(`Verification revoked for @${reg.username}`);
        }
      } else {
        localStorage.setItem("artistant_sandbox_registrations", JSON.stringify(updated));
        showToast(`Sandbox: @${reg.username} verification updated!`);
      }
    } catch (err) {
      console.error(err);
      showToast("Error updating database.");
    }
  };

  const handleToggleBlock = async (reg: AdminWaitlistEntry) => {
    const nextState = !reg.is_blocked;
    const updated = registrations.map(r => {
      if (r.user_id === reg.user_id) return { ...r, is_blocked: nextState };
      return r;
    });
    setRegistrations(updated);

    try {
      if (isLiveMode) {
        await adminUpdateRegistration(passcode, reg.user_id, reg.is_verified, nextState, reg.position_override);
        showToast(`User @${reg.username} block status toggled!`);
      } else {
        localStorage.setItem("artistant_sandbox_registrations", JSON.stringify(updated));
        showToast(`Sandbox: @${reg.username} block state updated!`);
      }
    } catch (err) {
      console.error(err);
      showToast("Error saving block status.");
    }
  };

  const handleSavePositionOverride = async (userId: string, val: number | null) => {
    const updated = registrations.map(r => {
      if (r.user_id === userId) return { ...r, position_override: val };
      return r;
    });
    setRegistrations(updated);

    try {
      const reg = registrations.find(r => r.user_id === userId);
      if (reg) {
        if (isLiveMode) {
          await adminUpdateRegistration(passcode, userId, reg.is_verified, reg.is_blocked, val);
          showToast(`Priority Override set to position ${val ?? "Auto"}!`);
        } else {
          localStorage.setItem("artistant_sandbox_registrations", JSON.stringify(updated));
          showToast(`Sandbox: Override saved.`);
        }
      }
    } catch (err) {
      console.error(err);
      showToast("Failed to save priority override.");
    }
  };

  const handleToggleDbMode = () => {
    if (isLiveMode) {
      const sandbox = localStorage.getItem("artistant_sandbox_registrations");
      setRegistrations(sandbox ? JSON.parse(sandbox) : MOCK_REGISTRATIONS);
      setIsLiveMode(false);
      setDbError("Switched manually to Sandbox Environment.");
      showToast("Switched to Sandbox Mode");
    } else {
      verifyAndLoad(passcode);
    }
  };

  // ---------------------------------------------------------------------------
  // Heuristics Auto-Verification Engine
  // ---------------------------------------------------------------------------
  const evaluateAutoVerify = (reg: AdminWaitlistEntry) => {
    if (reg.is_verified || reg.is_blocked) return { eligible: false, reasons: [] };
    const reasons: string[] = [];

    // Rule 1: Completed name properties
    if (reg.username.length >= 3 && reg.display_name && reg.display_name.trim().length >= 3) {
      reasons.push("Profile completed");
    } else {
      return { eligible: false, reasons: [] };
    }

    // Rule 2: Valid format contact
    if (reg.email.includes("@") && reg.email.includes(".")) {
      reasons.push("Validated email format");
    } else {
      return { eligible: false, reasons: [] };
    }

    // Rule 3: Supply validation
    if (reg.role === "artist") {
      if (reg.category && reg.genres && reg.genres.length > 0) {
        reasons.push("Defined category & genres");
      } else {
        return { eligible: false, reasons: [] };
      }
    } else if (reg.role === "venue" || reg.role === "vendor") {
      if (reg.phone && reg.phone.trim().length >= 8) {
        reasons.push("Contact validation");
      } else {
        return { eligible: false, reasons: [] };
      }
    }

    return { eligible: true, reasons };
  };

  const autoVerifyCount = registrations.filter(r => evaluateAutoVerify(r).eligible).length;

  const runAutoVerifyEngine = async () => {
    const candidates = registrations.filter(r => evaluateAutoVerify(r).eligible);
    if (candidates.length === 0) {
      showToast("No new accounts meet auto-verify criteria.");
      return;
    }

    setIsLoading(true);
    let count = 0;
    const updated = [...registrations];

    for (const reg of candidates) {
      try {
        if (isLiveMode) {
          await adminUpdateRegistration(passcode, reg.user_id, true, reg.is_blocked, reg.position_override);
          await sendWelcomeEmailAction({
            email: reg.email,
            name: reg.display_name || reg.username,
            username: reg.username
          });
        }
        
        const idx = updated.findIndex(u => u.user_id === reg.user_id);
        if (idx !== -1) {
          updated[idx] = { ...updated[idx], is_verified: true };
        }
        count++;
      } catch (err) {
        console.error("Heuristics failure for @" + reg.username, err);
      }
    }

    setRegistrations(updated);
    if (!isLiveMode) {
      localStorage.setItem("artistant_sandbox_registrations", JSON.stringify(updated));
    }
    setIsLoading(false);
    showToast(`Engine Complete: Auto-verified ${count} registrations & fired onboarding templates.`);
  };

  // ---------------------------------------------------------------------------
  // Unified Graphics Canvas Engine
  // ---------------------------------------------------------------------------
  const drawUnifiedCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = 1080;
    const height = canvasLayout === "square" ? 1080 : 1920; // 1:1 or 9:16 portrait
    canvas.width = width;
    canvas.height = height;

    // 1. strictly Onyx Black Base with dynamic theme gradient overlays
    let grad = ctx.createLinearGradient(0, 0, width, height);
    if (unifiedTheme === "cyber") {
      grad.addColorStop(0, "#121212");
      grad.addColorStop(0.5, "#181D26");
      grad.addColorStop(1, "#121212");
    } else if (unifiedTheme === "sunset") {
      grad.addColorStop(0, "#121212");
      grad.addColorStop(0.5, "#26191A");
      grad.addColorStop(1, "#121212");
    } else {
      grad.addColorStop(0, "#121212");
      grad.addColorStop(0.5, "#1D192C");
      grad.addColorStop(1, "#121212");
    }
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Grid rendering (10% borders look)
    ctx.strokeStyle = "rgba(255, 255, 255, 0.02)";
    ctx.lineWidth = 1.5;
    const gridSize = 60;
    for (let x = 0; x < width; x += gridSize) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke();
    }
    for (let y = 0; y < height; y += gridSize) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
    }

    // Centered glow radial overlay
    const radial = ctx.createRadialGradient(width/2, height/2, 50, width/2, height/2, 550);
    if (unifiedTheme === "cyber") {
      radial.addColorStop(0, "rgba(0, 240, 255, 0.07)");
      radial.addColorStop(1, "rgba(0,0,0,0)");
    } else if (unifiedTheme === "sunset") {
      radial.addColorStop(0, "rgba(255, 75, 75, 0.07)");
      radial.addColorStop(1, "rgba(0,0,0,0)");
    } else {
      radial.addColorStop(0, "rgba(90, 50, 250, 0.07)");
      radial.addColorStop(1, "rgba(0,0,0,0)");
    }
    ctx.fillStyle = radial;
    ctx.fillRect(0, 0, width, height);

    // Decorative corner anchors (Electric Indigo / Cyan / Coral accents)
    const offset = 60;
    const size = 35;
    ctx.strokeStyle = unifiedTheme === "cyber" ? "#00F0FF" : unifiedTheme === "sunset" ? "#FF4B4B" : "#5A32FA";
    ctx.lineWidth = 4.5;
    // Top-Left
    ctx.beginPath(); ctx.moveTo(offset, offset + size); ctx.lineTo(offset, offset); ctx.lineTo(offset + size, offset); ctx.stroke();
    // Top-Right
    ctx.beginPath(); ctx.moveTo(width - offset - size, offset); ctx.lineTo(width - offset, offset); ctx.lineTo(width - offset, offset + size); ctx.stroke();
    // Bottom-Left
    ctx.beginPath(); ctx.moveTo(offset, height - offset - size); ctx.lineTo(offset, height - offset); ctx.lineTo(offset + size, height - offset); ctx.stroke();
    // Bottom-Right
    ctx.beginPath(); ctx.moveTo(width - offset - size, height - offset); ctx.lineTo(width - offset, height - offset); ctx.lineTo(width - offset, height - offset - size); ctx.stroke();

    // 2. Logo Branding
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    ctx.font = "bold 28px 'Space Grotesk', sans-serif";
    ctx.letterSpacing = "6px";
    const brandY = 140;

    ctx.textAlign = "right";
    ctx.fillStyle = "#FF4B4B"; // Coral
    ctx.fillText("ARTIS", width / 2 - 4, brandY);
    ctx.textAlign = "left";
    ctx.fillStyle = "#5A32FA"; // Electric Indigo
    ctx.fillText("TANT", width / 2 + 4, brandY);

    ctx.beginPath();
    ctx.fillStyle = "#00F0FF"; // Cyan Dot
    ctx.arc(width / 2, brandY + 30, 4.5, 0, Math.PI * 2);
    ctx.fill();

    // 3. Dynamic Rendering based on Type
    ctx.textAlign = "center";
    if (graphicType === "milestone") {
      ctx.shadowBlur = 40;
      ctx.shadowColor = unifiedTheme === "cyber" ? "rgba(0, 240, 255, 0.3)" : unifiedTheme === "sunset" ? "rgba(255, 75, 75, 0.3)" : "rgba(90, 50, 250, 0.3)";
      ctx.font = "900 190px 'Big Shoulders Display', sans-serif";
      ctx.fillStyle = "#ffffff";
      const statY = height / 2 - 20;
      ctx.fillText(gMilestoneStat, width / 2, statY);
      ctx.shadowBlur = 0; // reset

      // Milestone Title in Space Grotesk
      ctx.font = "bold 40px 'Space Grotesk', sans-serif";
      ctx.fillStyle = unifiedTheme === "cyber" ? "#00F0FF" : unifiedTheme === "sunset" ? "#FF4B4B" : "#5A32FA";
      ctx.letterSpacing = "4px";
      ctx.fillText(gMilestoneTitle.toUpperCase(), width / 2, statY + 120);

      // Description/Subtext
      ctx.font = "400 20px 'Inter', sans-serif";
      ctx.fillStyle = "#A3A3A3";
      ctx.letterSpacing = "0px";
      wrapText(ctx, gSubtext, width / 2, statY + 190, width - 260, 32);

    } else if (graphicType === "feature") {
      const iconX = width / 2;
      const iconY = height / 2 - 130;

      // Glow bubble
      ctx.beginPath();
      ctx.fillStyle = "rgba(255, 255, 255, 0.02)";
      ctx.arc(iconX, iconY, 75, 0, Math.PI * 2);
      ctx.fill();

      // Feature icon vectors
      ctx.lineWidth = 5;
      ctx.strokeStyle = unifiedTheme === "cyber" ? "#00F0FF" : unifiedTheme === "sunset" ? "#FF4B4B" : "#5A32FA";
      ctx.beginPath();
      if (gHeadline.toLowerCase().includes("bookability")) {
        ctx.moveTo(iconX - 30, iconY + 15);
        ctx.lineTo(iconX - 10, iconY - 15);
        ctx.lineTo(iconX + 10, iconY + 5);
        ctx.lineTo(iconX + 30, iconY - 20);
      } else if (gHeadline.toLowerCase().includes("escrow") || gHeadline.toLowerCase().includes("gigsafe")) {
        ctx.moveTo(iconX - 25, iconY - 25);
        ctx.lineTo(iconX + 25, iconY - 25);
        ctx.lineTo(iconX + 25, iconY + 5);
        ctx.bezierCurveTo(iconX + 25, iconY + 20, iconX, iconY + 35, iconX, iconY + 35);
        ctx.bezierCurveTo(iconX, iconY + 35, iconX - 25, iconY + 20, iconX - 25, iconY + 5);
        ctx.closePath();
      } else {
        // Connected grid node
        ctx.arc(iconX - 20, iconY - 15, 6, 0, Math.PI * 2);
        ctx.arc(iconX + 20, iconY - 15, 6, 0, Math.PI * 2);
        ctx.arc(iconX, iconY + 20, 6, 0, Math.PI * 2);
        ctx.moveTo(iconX - 14, iconY - 15); ctx.lineTo(iconX + 14, iconY - 15);
        ctx.moveTo(iconX - 16, iconY - 10); ctx.lineTo(iconX - 4, iconY + 14);
        ctx.moveTo(iconX + 16, iconY - 10); ctx.lineTo(iconX + 4, iconY + 14);
      }
      ctx.stroke();

      // Spotlight Header (Space Grotesk)
      ctx.font = "900 68px 'Big Shoulders Display', sans-serif";
      ctx.fillStyle = "#ffffff";
      ctx.fillText(gHeadline.toUpperCase(), width / 2, height / 2 + 50);

      // Feature Sub-tag
      ctx.font = "bold 20px 'Space Grotesk', sans-serif";
      ctx.fillStyle = unifiedTheme === "cyber" ? "#00F0FF" : unifiedTheme === "sunset" ? "#FF4B4B" : "#5A32FA";
      ctx.letterSpacing = "4px";
      ctx.fillText("CORE PLATFORM INFRASTRUCTURE DROP", width / 2, height / 2 + 105);

      // Spotlight body text
      ctx.font = "400 20px 'Inter', sans-serif";
      ctx.fillStyle = "#A3A3A3";
      ctx.letterSpacing = "0px";
      wrapText(ctx, gSubtext, width / 2, height / 2 + 155, width - 220, 32);

    } else if (graphicType === "countdown") {
      const target = new Date(gCountdownTarget).getTime();
      const now = new Date().getTime();
      const diff = target - now;
      const daysLeft = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));

      ctx.shadowBlur = 40;
      ctx.shadowColor = unifiedTheme === "cyber" ? "rgba(0, 240, 255, 0.3)" : unifiedTheme === "sunset" ? "rgba(255, 75, 75, 0.3)" : "rgba(90, 50, 250, 0.3)";
      ctx.font = "900 220px 'Big Shoulders Display', sans-serif";
      ctx.fillStyle = "#ffffff";
      const countY = height / 2 - 30;
      ctx.fillText(daysLeft.toString(), width / 2, countY);
      ctx.shadowBlur = 0; // reset

      // Countdown Title
      ctx.font = "bold 42px 'Space Grotesk', sans-serif";
      ctx.fillStyle = unifiedTheme === "cyber" ? "#00F0FF" : unifiedTheme === "sunset" ? "#FF4B4B" : "#5A32FA";
      ctx.letterSpacing = "5px";
      ctx.fillText("DAYS UNTIL BETA LAUNCH", width / 2, countY + 120);

      // Details
      ctx.font = "400 20px 'Inter', sans-serif";
      ctx.fillStyle = "#A3A3A3";
      ctx.letterSpacing = "0px";
      ctx.fillText(`Target Launch Date: ${new Date(gCountdownTarget).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}`, width / 2, countY + 185);
      ctx.font = "italic 18px 'Inter', sans-serif";
      ctx.fillStyle = "#737373";
      ctx.fillText("Claim handles and reserve priority placements at artistant.in", width / 2, countY + 230);
    }

    // 4. Footer link (Space Grotesk)
    ctx.font = "bold 20px 'Space Grotesk', sans-serif";
    ctx.fillStyle = "#525252";
    ctx.letterSpacing = "4px";
    ctx.fillText("ARTISTANT.IN  |  JOIN THE ECONOMY", width / 2, height - 130);
  };

  const wrapText = (ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number) => {
    const words = text.split(" ");
    let line = "";
    let currentY = y;

    for (let n = 0; n < words.length; n++) {
      let testLine = line + words[n] + " ";
      let metrics = ctx.measureText(testLine);
      let testWidth = metrics.width;
      if (testWidth > maxWidth && n > 0) {
        ctx.fillText(line, x, currentY);
        line = words[n] + " ";
        currentY += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, x, currentY);
  };

  const handleDownloadUnified = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.download = `artistant_${graphicType}_${canvasLayout}.png`;
    link.href = url;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Premium Graphic PNG Exported!");
  };

  const handleApplyPreset = (post: SocialPost) => {
    setActiveTab("graphics");
    setGraphicType(post.type);
    setUnifiedTheme(post.graphicPreset.theme);
    if (post.type === "milestone") {
      setGMilestoneStat(post.graphicPreset.stat || "500+");
      setGMilestoneTitle(post.graphicPreset.title);
      setGSubtext(post.graphicPreset.subText);
    } else if (post.type === "feature") {
      setGHeadline(post.graphicPreset.title);
      setGSubtext(post.graphicPreset.subText);
    }
    showToast(`Preset: "${post.title}" loaded in Graphics Studio.`);
  };

  // ---------------------------------------------------------------------------
  // Email Dispatch Campaign Builder
  // ---------------------------------------------------------------------------
  const getSelectedRecipientsList = () => {
    if (roleFilter === "all" && statusFilter === "all" && !searchQuery) {
      return registrations;
    }
    return filteredRegistrations;
  };

  const handleSendEmailBroadcast = async () => {
    const targets = getSelectedRecipientsList().filter(r => !r.is_blocked);
    if (targets.length === 0) {
      showToast("No eligible recipients found.");
      return;
    }

    const recipientEmails = targets.map(t => ({
      email: t.email,
      name: t.display_name || t.username
    }));

    if (!window.confirm(`Initiate mass email broadcast to ${targets.length} waitlisted users?`)) {
      return;
    }

    setEmailSending(true);
    setShowLogTerminal(true);
    setEmailLogs([]);

    const log = (msg: string) => {
      setEmailLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
    };

    log(`Initializing Artistant Campaign Node...`);
    log(`Selected Alias: "${emailAlias}@artistant.in"`);
    log(`Loaded template layout "artistant-mail-template.html"...`);
    log(`Compiled ${targets.length} target records for broadcast.`);

    try {
      const res = await sendMassEmailAction({
        passcode,
        recipients: recipientEmails,
        subject: emailSubject,
        messageBody: emailBody,
        ctaText: emailCtaText,
        ctaUrl: emailCtaUrl
      });

      if (res.success) {
        log(`Broadcast Complete. Verification results:`);
        res.details?.forEach((d: any) => {
          log(` -> ${d.email}: ${d.success ? "DELIVERED SUCCESS" : "FAILED: " + d.error}`);
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

  // ---------------------------------------------------------------------------
  // Filter Waitlist
  // ---------------------------------------------------------------------------
  const filteredRegistrations = registrations.filter(reg => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = 
      reg.username.toLowerCase().includes(searchLower) ||
      reg.email.toLowerCase().includes(searchLower) ||
      (reg.display_name && reg.display_name.toLowerCase().includes(searchLower)) ||
      (reg.phone && reg.phone.toLowerCase().includes(searchLower));

    const matchesRole = roleFilter === "all" || reg.role === roleFilter;

    let matchesStatus = true;
    if (statusFilter === "verified") {
      matchesStatus = reg.is_verified && !reg.is_blocked;
    } else if (statusFilter === "blocked") {
      matchesStatus = reg.is_blocked;
    } else if (statusFilter === "pending") {
      matchesStatus = !reg.is_verified && !reg.is_blocked;
    }

    return matchesSearch && matchesRole && matchesStatus;
  });

  const totalCount = registrations.length;
  const verifiedCount = registrations.filter(r => r.is_verified).length;
  const blockedCount = registrations.filter(r => r.is_blocked).length;
  const pendingCount = totalCount - verifiedCount - blockedCount;

  // ---------------------------------------------------------------------------
  // Render Security Access screen
  // ---------------------------------------------------------------------------
  if (!isUnlocked) {
    return (
      <div className="min-h-screen bg-[#121212] text-[#F0EFF4] flex flex-col justify-center items-center px-4 relative overflow-hidden font-sans">
        <style dangerouslySetInnerHTML={{ __html: `
          @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;700&family=Inter:wght@400;500;600;700&family=Big+Shoulders+Display:wght@800;900&display=swap');
          .font-space { font-family: 'Space Grotesk', sans-serif; }
          .font-inter { font-family: 'Inter', sans-serif; }
        `}} />
        
        {/* Cinematic Backdrop nodes */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(90,50,250,0.06),transparent_65%)] pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:50px_50px] pointer-events-none" />

        <div className="max-w-md w-full bg-[#1E1E1E] border border-white/10 p-8 rounded-2xl shadow-2xl relative z-10">
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-24 h-24 bg-[#1E1E1E] border border-white/10 rounded-full flex items-center justify-center shadow-2xl">
            <Lock className="w-9 h-9 text-[#00F0FF] animate-pulse" />
          </div>

          <div className="text-center mt-8 mb-8">
            <h1 className="text-3xl font-space font-bold tracking-tight mb-2">
              <span className="text-[#FF4B4B]">ARTIS</span>
              <span className="text-[#5A32FA]">TANT</span>
            </h1>
            <p className="text-xs font-mono text-[#A3A3A3] uppercase tracking-[0.25em]">
              Administrative Core Console
            </p>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-5 font-inter">
            <div>
              <label className="block text-xs font-mono uppercase text-[#A3A3A3] tracking-wider mb-2">
                Access Code Credential
              </label>
              <input
                type="password"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="••••••••••••••••"
                className="w-full bg-[#121212] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-neutral-700 font-mono focus:outline-none focus:border-[#5A32FA] transition-all text-center"
                autoFocus
              />
            </div>

            {authError && (
              <div className="flex items-center gap-2 text-xs font-mono text-[#FF4B4B] bg-[#FF4B4B]/10 border border-[#FF4B4B]/20 p-3 rounded-lg">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-[#5A32FA] to-[#00F0FF] hover:opacity-95 text-white font-space font-bold tracking-wider py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg disabled:opacity-50"
            >
              {isLoading ? (
                <RefreshCw className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Unlock Command Nodes
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
            <p className="text-center text-[10px] font-mono text-[#737373]">
              Default passcode: <span className="text-[#A3A3A3]">ARTISTANT_ADMIN_2026</span>
            </p>
          </form>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Render Console Main Layout
  // ---------------------------------------------------------------------------
  return (
    <div className="min-h-screen bg-[#121212] text-[#F0EFF4] font-inter relative pb-20 overflow-x-hidden selection:bg-[#00F0FF] selection:text-[#121212]">
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&family=Inter:wght@400;500;600;700&family=Big+Shoulders+Display:wght@800;900&display=swap');
        .font-space { font-family: 'Space Grotesk', sans-serif; }
        .font-inter { font-family: 'Inter', sans-serif; }
      `}} />

      {/* Cinematic Glowing Background Gradients */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-15%] left-[-15%] w-[45%] h-[45%] bg-[#5A32FA]/5 rounded-full blur-[160px] animate-pulse" />
        <div className="absolute bottom-[-15%] right-[-15%] w-[40%] h-[40%] bg-[#00F0FF]/5 rounded-full blur-[160px] animate-pulse" />
        <div className="absolute top-[25%] right-[-5%] w-[35%] h-[35%] bg-[#FF4B4B]/3 rounded-full blur-[140px] animate-pulse" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.005)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.005)_1px,transparent_1px)] bg-[size:60px_60px]" />
      </div>

      {/* Success Toast */}
      {successToast && (
        <div className="fixed bottom-8 right-8 z-50 bg-[#1E1E1E] border border-white/10 border-l-4 border-l-[#00F0FF] text-[#F0EFF4] font-space text-sm px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-slide-up">
          <Sparkles className="w-5 h-5 text-[#FF4B4B] animate-spin" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Header Panel */}
      <header className="border-b border-white/10 bg-[#121212]/80 backdrop-blur-md sticky top-0 z-40 relative">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-space font-bold tracking-tight flex items-center">
              <span className="text-[#FF4B4B]">ARTIS</span>
              <span className="text-[#5A32FA]">TANT</span>
              <span className="text-[#A3A3A3] text-[10px] font-mono ml-3 border border-white/10 px-2 py-0.5 rounded uppercase tracking-wider bg-white/5">
                Admin Console
              </span>
            </h1>

            {/* Mode switch */}
            <div 
              onClick={handleToggleDbMode}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono cursor-pointer border select-none transition-all ${
                isLiveMode 
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/25" 
                  : "bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/25"
              }`}
              title="Click to toggle DB vs Sandbox"
            >
              <Database className="w-3 h-3" />
              <span>{isLiveMode ? "LIVE NETWORK" : "SANDBOX NODE"}</span>
              <RefreshCw className="w-2.5 h-2.5 animate-spin" style={{ animationDuration: '6s' }} />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => setShowSqlMigration(!showSqlMigration)}
              className="px-3 py-1.5 rounded-lg border border-white/10 hover:bg-white/5 text-[11px] font-mono text-[#A3A3A3] flex items-center gap-2 transition-all"
            >
              <Layers className="w-3.5 h-3.5" />
              SQL Migration schema
            </button>
            <a 
              href="/"
              target="_blank"
              className="px-3 py-1.5 rounded-lg border border-white/10 hover:bg-white/5 text-[11px] font-mono text-[#A3A3A3] flex items-center gap-2 transition-all"
            >
              <Eye className="w-3.5 h-3.5" />
              Launch Site
            </a>
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 rounded-lg border border-[#FF4B4B]/20 hover:bg-[#FF4B4B]/10 text-[11px] font-mono text-[#FF4B4B] flex items-center gap-2 transition-all"
            >
              <LogOut className="w-3.5 h-3.5" />
              Lock Dashboard
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 pt-8 space-y-8 relative z-10">
        
        {/* Sandbox Fallback Alerts */}
        {dbError && (
          <div className="bg-[#1E1E1E] border border-white/10 border-l-4 border-l-amber-500 text-amber-300 p-5 rounded-xl text-sm font-inter flex items-start gap-4">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-amber-500" />
            <div>
              <p className="font-space font-bold mb-1">Sandbox Environment Active</p>
              <p className="text-[#A3A3A3] text-xs">{dbError}</p>
              <button 
                onClick={() => setShowSqlMigration(true)}
                className="text-xs text-[#00F0FF] underline mt-3 block hover:text-[#00F0FF]/80 font-mono"
              >
                Inspect SQL Migrations to Go Live &rarr;
              </button>
            </div>
          </div>
        )}

        {/* Database Migration instructions */}
        {showSqlMigration && (
          <div className="bg-[#1E1E1E] border border-white/10 rounded-2xl p-6 relative overflow-hidden animate-slide-down">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-space text-sm font-bold text-[#FF4B4B] flex items-center gap-2">
                <Database className="w-4 h-4 text-[#FF4B4B]" />
                Supabase Schema Upgrade Script
              </h3>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(`
ALTER TABLE waitlist_users ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false;
ALTER TABLE waitlist_users ADD COLUMN IF NOT EXISTS is_blocked BOOLEAN DEFAULT false;
ALTER TABLE waitlist_users ADD COLUMN IF NOT EXISTS position_override INTEGER DEFAULT NULL;

CREATE OR REPLACE FUNCTION admin_get_registrations(p_passcode text)
RETURNS TABLE (
  id uuid,
  user_id text,
  username text,
  email text,
  display_name text,
  role text,
  category text,
  genres text[],
  phone text,
  reserved_at timestamptz,
  is_verified boolean,
  is_blocked boolean,
  position_override integer
)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF p_passcode != 'ARTISTANT_ADMIN_2026' THEN
    RAISE EXCEPTION 'Invalid admin passcode';
  END IF;
  RETURN QUERY SELECT w.id, w.user_id, w.username, w.email, w.display_name, w.role, w.category, w.genres, w.phone, w.reserved_at, w.is_verified, w.is_blocked, w.position_override
  FROM waitlist_users w ORDER BY COALESCE(w.position_override, 999999) ASC, w.reserved_at DESC;
END; $$;

CREATE OR REPLACE FUNCTION admin_update_registration(p_passcode text, p_user_id text, p_is_verified boolean, p_is_blocked boolean, p_position_override integer DEFAULT NULL)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF p_passcode != 'ARTISTANT_ADMIN_2026' THEN
    RAISE EXCEPTION 'Invalid admin passcode';
  END IF;
  UPDATE waitlist_users
  SET is_verified = p_is_verified, is_blocked = p_is_blocked, position_override = p_position_override
  WHERE user_id = p_user_id;
END; $$;
                  `);
                  showToast("SQL script copied successfully!");
                }}
                className="px-3 py-1 rounded-lg bg-[#121212] border border-white/10 hover:bg-[#1E1E1E] text-xs font-mono flex items-center gap-1.5 transition-all text-[#A3A3A3]"
              >
                <Copy className="w-3.5 h-3.5" />
                Copy SQL
              </button>
            </div>
            <p className="text-xs text-[#A3A3A3] mb-4 leading-relaxed font-inter">
              Run this SQL script in your <strong>Supabase SQL Editor</strong> to add the `position_override` waitlist column and update administrative bypass procedures.
            </p>
            <pre className="bg-[#121212] text-xs font-mono p-4 rounded-xl overflow-x-auto text-[#A3A3A3] border border-white/10 max-h-48">
{`-- SQL UPGRADE SCHEMA
ALTER TABLE waitlist_users ADD COLUMN IF NOT EXISTS position_override INTEGER DEFAULT NULL;

-- Update get function
CREATE OR REPLACE FUNCTION admin_get_registrations(p_passcode text)...`}
            </pre>
          </div>
        )}

        {/* Dynamic Navigation Tabs */}
        <div className="flex border-b border-white/10 gap-1 font-space overflow-x-auto">
          <button
            onClick={() => setActiveTab("registrations")}
            className={`px-6 py-3.5 border-b-2 font-bold transition-all text-sm flex items-center gap-2 whitespace-nowrap ${
              activeTab === "registrations" 
                ? "border-[#5A32FA] text-white bg-white/[0.02]" 
                : "border-transparent text-[#A3A3A3] hover:text-white"
            }`}
          >
            <Users className="w-4 h-4 text-[#5A32FA]" />
            Waitlist Command Center ({totalCount})
          </button>
          <button
            onClick={() => setActiveTab("graphics")}
            className={`px-6 py-3.5 border-b-2 font-bold transition-all text-sm flex items-center gap-2 whitespace-nowrap ${
              activeTab === "graphics" 
                ? "border-[#00F0FF] text-white bg-white/[0.02]" 
                : "border-transparent text-[#A3A3A3] hover:text-white"
            }`}
          >
            <ImageIcon className="w-4 h-4 text-[#00F0FF]" />
            Social Graphics Studio
          </button>
          <button
            onClick={() => setActiveTab("calendar")}
            className={`px-6 py-3.5 border-b-2 font-bold transition-all text-sm flex items-center gap-2 whitespace-nowrap ${
              activeTab === "calendar" 
                ? "border-[#FF4B4B] text-white bg-white/[0.02]" 
                : "border-transparent text-[#A3A3A3] hover:text-white"
            }`}
          >
            <CalendarIcon className="w-4 h-4 text-[#FF4B4B]" />
            Social Posting Calendar
          </button>
          <button
            onClick={() => setActiveTab("emailing")}
            className={`px-6 py-3.5 border-b-2 font-bold transition-all text-sm flex items-center gap-2 whitespace-nowrap ${
              activeTab === "emailing" 
                ? "border-[#5A32FA] text-white bg-white/[0.02]" 
                : "border-transparent text-[#A3A3A3] hover:text-white"
            }`}
          >
            <Mail className="w-4 h-4 text-[#5A32FA]" />
            Email Broadcast Engine
          </button>
        </div>

        {/* ===================================================================
            TAB 1: WAITLIST COMMAND CENTER
            =================================================================== */}
        {activeTab === "registrations" && (
          <div className="space-y-8 animate-in fade-in duration-200">
            
            {/* Command metrics bento */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 font-space">
              <div className="bg-[#1E1E1E] border border-white/10 p-6 rounded-2xl flex items-center justify-between shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-white/[0.01] rounded-full blur-lg" />
                <div>
                  <p className="text-xs font-mono uppercase text-[#A3A3A3] tracking-widest">Global Waitlist</p>
                  <p className="text-3xl font-bold mt-1 text-white">{totalCount}</p>
                </div>
                <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center">
                  <Users className="w-5 h-5 text-neutral-400" />
                </div>
              </div>

              <div className="bg-[#1E1E1E] border border-white/10 p-6 rounded-2xl flex items-center justify-between shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-[#00F0FF]/[0.01] rounded-full blur-lg" />
                <div>
                  <p className="text-xs font-mono uppercase text-[#A3A3A3] tracking-widest">Verified Artists</p>
                  <p className="text-3xl font-bold text-[#00F0FF] mt-1">{verifiedCount}</p>
                </div>
                <div className="w-12 h-12 bg-[#00F0FF]/10 border border-[#00F0FF]/20 rounded-xl flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-[#00F0FF]" />
                </div>
              </div>

              <div className="bg-[#1E1E1E] border border-white/10 p-6 rounded-2xl flex items-center justify-between shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-[#5A32FA]/[0.01] rounded-full blur-lg" />
                <div>
                  <p className="text-xs font-mono uppercase text-[#A3A3A3] tracking-widest">Pending Sync</p>
                  <p className="text-3xl font-bold text-[#5A32FA] mt-1">{pendingCount}</p>
                </div>
                <div className="w-12 h-12 bg-[#5A32FA]/10 border border-[#5A32FA]/20 rounded-xl flex items-center justify-center">
                  <Flame className="w-5 h-5 text-[#5A32FA]" />
                </div>
              </div>

              <div className="bg-[#1E1E1E] border border-white/10 p-6 rounded-2xl flex items-center justify-between shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-[#FF4B4B]/[0.01] rounded-full blur-lg" />
                <div>
                  <p className="text-xs font-mono uppercase text-[#A3A3A3] tracking-widest">Suspended Accounts</p>
                  <p className="text-3xl font-bold text-[#FF4B4B] mt-1">{blockedCount}</p>
                </div>
                <div className="w-12 h-12 bg-[#FF4B4B]/10 border border-[#FF4B4B]/20 rounded-xl flex items-center justify-center">
                  <XCircle className="w-5 h-5 text-[#FF4B4B]" />
                </div>
              </div>
            </div>

            {/* Heuristics suggestion banner */}
            {autoVerifyCount > 0 && (
              <div className="bg-[#1E1E1E] border border-[#5A32FA]/30 p-5 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-xl">
                <div>
                  <h4 className="font-space font-bold text-white text-base flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-[#00F0FF] animate-bounce" />
                    Auto-Verification Suggestions Available
                  </h4>
                  <p className="text-xs text-[#A3A3A3] mt-1 max-w-2xl">
                    {autoVerifyCount} pending registration(s) match the complete validation heuristics profile (profile names complete, email domain syntax verified, categories, and target supply genres assigned).
                  </p>
                </div>
                <button
                  onClick={runAutoVerifyEngine}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#5A32FA] to-[#00F0FF] hover:opacity-90 text-white font-space text-xs font-bold flex items-center gap-2 transition-all self-stretch md:self-auto text-center justify-center"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Auto-Verify {autoVerifyCount} Artists
                </button>
              </div>
            )}

            {/* Table toolstrip */}
            <div className="bg-[#1E1E1E] border border-white/10 p-4 rounded-2xl flex flex-col md:flex-row gap-4 items-center justify-between shadow-md">
              <div className="relative w-full md:w-80 font-inter">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A3A3A3]" />
                <input
                  type="text"
                  placeholder="Search name, handle, email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#121212] border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-[#5A32FA] transition-all"
                />
              </div>

              <div className="flex flex-wrap items-center gap-4 w-full md:w-auto font-mono text-xs text-[#A3A3A3]">
                <div className="flex items-center gap-2">
                  <span>Role:</span>
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="bg-[#121212] border border-white/10 rounded-lg px-3 py-1.5 focus:outline-none focus:border-[#5A32FA] text-white"
                  >
                    <option value="all">All Roles</option>
                    <option value="artist">Artist</option>
                    <option value="venue">Venue</option>
                    <option value="vendor">Vendor</option>
                    <option value="fan">Fan</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <span>Status:</span>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="bg-[#121212] border border-white/10 rounded-lg px-3 py-1.5 focus:outline-none focus:border-[#5A32FA] text-white"
                  >
                    <option value="all">All statuses</option>
                    <option value="verified">Verified Only</option>
                    <option value="pending">Pending Only</option>
                    <option value="blocked">Blocked Only</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Scannable Data Table */}
            <div className="bg-[#1E1E1E] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-sm font-inter">
                  <thead>
                    <tr className="border-b border-white/10 bg-[#1E1E1E]/80 text-[#A3A3A3] text-xs font-mono uppercase tracking-wider">
                      <th className="px-6 py-4">User Handle</th>
                      <th className="px-6 py-4">Role / Category</th>
                      <th className="px-6 py-4">Contact Info</th>
                      <th className="px-6 py-4">Waitlist Override</th>
                      <th className="px-6 py-4">Verify & Lock</th>
                      <th className="px-6 py-4 text-right">Clearance Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredRegistrations.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-[#A3A3A3] font-mono">
                          No matching waitlist nodes found.
                        </td>
                      </tr>
                    ) : (
                      filteredRegistrations.map((reg) => {
                        const heuristics = evaluateAutoVerify(reg);
                        return (
                          <tr 
                            key={reg.id} 
                            className={`hover:bg-white/[0.02] transition-all duration-150 ${
                              reg.is_blocked ? "opacity-40" : ""
                            }`}
                          >
                            <td className="px-6 py-4">
                              <div>
                                <div className="font-bold text-white flex items-center gap-2">
                                  {reg.display_name || "Unspecified Node"}
                                  {reg.is_verified && (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-[#00F0FF]/10 text-[#00F0FF] border border-[#00F0FF]/25">
                                      VERIFIED
                                    </span>
                                  )}
                                  {heuristics.eligible && (
                                    <span 
                                      className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-[#5A32FA]/10 text-[#5A32FA] border border-[#5A32FA]/25 cursor-help"
                                      title={`Auto-verify candidate: ${heuristics.reasons.join(", ")}`}
                                    >
                                      SUGGESTED
                                    </span>
                                  )}
                                </div>
                                <div className="text-xs font-mono text-[#FF4B4B] mt-0.5">
                                  @{reg.username}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div>
                                <span className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-mono uppercase font-bold border ${
                                  reg.role === "artist" ? "bg-[#5A32FA]/15 text-[#5A32FA] border-[#5A32FA]/20" :
                                  reg.role === "venue" ? "bg-[#00F0FF]/15 text-[#00F0FF] border-[#00F0FF]/20" :
                                  reg.role === "vendor" ? "bg-[#FF4B4B]/15 text-[#FF4B4B] border-[#FF4B4B]/20" :
                                  "bg-white/5 text-neutral-400 border-white/5"
                                }`}>
                                  {reg.role || "fan"}
                                </span>
                                {reg.category && (
                                  <span className="block text-xs text-[#A3A3A3] mt-1 capitalize font-mono text-[11px]">
                                    Category: {reg.category.replace("_", " ")}
                                  </span>
                                )}
                                {reg.genres && reg.genres.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mt-1.5">
                                    {reg.genres.map(g => (
                                      <span key={g} className="text-[9px] font-mono bg-white/5 text-neutral-400 px-1.5 py-0.5 rounded border border-white/5">
                                        #{g}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 font-mono text-xs text-[#A3A3A3] space-y-0.5">
                              <div className="text-white/80">{reg.email}</div>
                              {reg.phone && <div className="text-neutral-500">{reg.phone}</div>}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <input
                                  type="number"
                                  placeholder="Auto"
                                  value={reg.position_override ?? ""}
                                  onChange={(e) => {
                                    const val = e.target.value === "" ? null : parseInt(e.target.value, 10);
                                    handleSavePositionOverride(reg.user_id, val);
                                  }}
                                  className="w-16 bg-[#121212] border border-white/10 rounded-lg px-2 py-1 text-xs text-white text-center font-mono focus:outline-none focus:border-[#00F0FF]"
                                />
                                <span className="text-[10px] font-mono text-neutral-500">
                                  {reg.position_override ? `#${reg.position_override}` : "Queue"}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <button
                                onClick={() => handleVerifyAndLock(reg)}
                                className={`px-3 py-1.5 rounded-lg font-mono text-xs font-bold transition-all border ${
                                  reg.is_verified 
                                    ? "bg-[#00F0FF]/10 text-[#00F0FF] border-[#00F0FF]/30 hover:bg-[#00F0FF]/20" 
                                    : "bg-gradient-to-r from-[#5A32FA] to-[#00F0FF] text-white border-transparent hover:opacity-90"
                                }`}
                              >
                                {reg.is_verified ? "Locked" : "Verify & Lock"}
                              </button>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <button
                                onClick={() => handleToggleBlock(reg)}
                                className={`px-2.5 py-1.5 rounded-lg border text-xs font-mono transition-all ${
                                  reg.is_blocked 
                                    ? "bg-[#FF4B4B]/10 text-[#FF4B4B] border-[#FF4B4B]/30 hover:bg-[#FF4B4B]/20" 
                                    : "border-white/10 text-neutral-400 hover:text-white hover:bg-white/5"
                                }`}
                              >
                                {reg.is_blocked ? "Unsuspend" : "Suspend"}
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ===================================================================
            TAB 2: SOCIAL GRAPHICS STUDIO
            =================================================================== */}
        {activeTab === "graphics" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in duration-200">
            
            {/* Left Graphics Parameter Control Panel */}
            <div className="lg:col-span-5 space-y-8">
              
              {/* Studio Settings */}
              <div className="bg-[#1E1E1E] border border-white/10 p-6 rounded-2xl space-y-6">
                <h3 className="text-base font-space font-bold text-white border-b border-white/5 pb-3 flex items-center gap-2">
                  <Settings className="w-4 h-4 text-[#00F0FF]" />
                  Graphics Parameters
                </h3>

                {/* Switch Graphic Type Mode */}
                <div>
                  <label className="block text-xs font-mono uppercase text-[#A3A3A3] tracking-wider mb-2.5">
                    Studio Generation Target
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { type: "milestone", label: "Milestone" },
                      { type: "feature", label: "Feature Drop" },
                      { type: "countdown", label: "Countdown" }
                    ].map(t => (
                      <button
                        key={t.type}
                        onClick={() => setGraphicType(t.type as any)}
                        className={`py-2 rounded-lg font-space text-xs font-bold border transition-all ${
                          graphicType === t.type 
                            ? "border-[#5A32FA] bg-[#5A32FA]/15 text-white" 
                            : "border-white/10 text-[#A3A3A3] hover:bg-white/5"
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Aspect Layout Ratio dimensions */}
                <div>
                  <label className="block text-xs font-mono uppercase text-[#A3A3A3] tracking-wider mb-2.5">
                    Output Aspect Ratio
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setCanvasLayout("square")}
                      className={`py-2 rounded-lg font-space text-xs font-bold border transition-all ${
                        canvasLayout === "square" 
                          ? "border-[#00F0FF] bg-[#00F0FF]/10 text-white" 
                          : "border-white/10 text-[#A3A3A3] hover:bg-white/5"
                      }`}
                    >
                      Square (1:1 Ratio)
                    </button>
                    <button
                      onClick={() => setCanvasLayout("portrait")}
                      className={`py-2 rounded-lg font-space text-xs font-bold border transition-all ${
                        canvasLayout === "portrait" 
                          ? "border-[#00F0FF] bg-[#00F0FF]/10 text-white" 
                          : "border-white/10 text-[#A3A3A3] hover:bg-white/5"
                      }`}
                    >
                      Portrait (9:16 Ratio)
                    </button>
                  </div>
                </div>

                {/* Theme Selector */}
                <div>
                  <label className="block text-xs font-mono uppercase text-[#A3A3A3] tracking-wider mb-2.5">
                    Creative Glow Theme
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => setUnifiedTheme("cyber")}
                      className={`py-2 rounded-lg border text-xs font-mono flex flex-col items-center gap-1 transition-all ${
                        unifiedTheme === "cyber" 
                          ? "border-[#00F0FF] bg-[#00F0FF]/5 text-white" 
                          : "border-white/10 text-[#A3A3A3] hover:bg-white/5"
                      }`}
                    >
                      <span className="w-2 h-2 rounded-full bg-[#00F0FF]" />
                      Cyber Neon
                    </button>
                    <button
                      onClick={() => setUnifiedTheme("sunset")}
                      className={`py-2 rounded-lg border text-xs font-mono flex flex-col items-center gap-1 transition-all ${
                        unifiedTheme === "sunset" 
                          ? "border-[#FF4B4B] bg-[#FF4B4B]/5 text-white" 
                          : "border-white/10 text-[#A3A3A3] hover:bg-white/5"
                      }`}
                    >
                      <span className="w-2 h-2 rounded-full bg-[#FF4B4B]" />
                      Retro Sunset
                    </button>
                    <button
                      onClick={() => setUnifiedTheme("indigo")}
                      className={`py-2 rounded-lg border text-xs font-mono flex flex-col items-center gap-1 transition-all ${
                        unifiedTheme === "indigo" 
                          ? "border-[#5A32FA] bg-[#5A32FA]/5 text-white" 
                          : "border-white/10 text-[#A3A3A3] hover:bg-white/5"
                      }`}
                    >
                      <span className="w-2 h-2 rounded-full bg-[#5A32FA]" />
                      Deep Indigo
                    </button>
                  </div>
                </div>
              </div>

              {/* Dynamic Parameter Editor Panel */}
              <div className="bg-[#1E1E1E] border border-white/10 p-6 rounded-2xl space-y-6">
                
                {graphicType === "milestone" && (
                  <>
                    <h3 className="text-base font-space font-bold text-white border-b border-white/5 pb-3 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-[#FF4B4B]" />
                      Milestone Settings
                    </h3>
                    <div>
                      <label className="block text-xs font-mono uppercase text-[#A3A3A3] tracking-wider mb-2">Live Metric Count</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={gMilestoneStat}
                          onChange={(e) => setGMilestoneStat(e.target.value)}
                          className="flex-1 bg-[#121212] border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-[#5A32FA]"
                        />
                        <button
                          onClick={() => {
                            setGMilestoneStat(`${totalCount}+`);
                            showToast("Pulled live database count!");
                          }}
                          className="px-3 bg-white/5 border border-white/10 rounded-xl text-xs hover:bg-white/10 transition-all font-mono"
                          title="Pull Live Total"
                        >
                          Live DB
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-mono uppercase text-[#A3A3A3] tracking-wider mb-2">Headline Title</label>
                      <input
                        type="text"
                        value={gMilestoneTitle}
                        onChange={(e) => setGMilestoneTitle(e.target.value)}
                        className="w-full bg-[#121212] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#5A32FA]"
                      />
                    </div>
                  </>
                )}

                {graphicType === "feature" && (
                  <>
                    <h3 className="text-base font-space font-bold text-white border-b border-white/5 pb-3 flex items-center gap-2">
                      <Layers className="w-4 h-4 text-[#00F0FF]" />
                      Feature Drop Spotlight
                    </h3>
                    <div>
                      <label className="block text-xs font-mono uppercase text-[#A3A3A3] tracking-wider mb-2">Spotlight Core Title</label>
                      <input
                        type="text"
                        value={gHeadline}
                        onChange={(e) => setGHeadline(e.target.value)}
                        className="w-full bg-[#121212] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#5A32FA]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono uppercase text-[#A3A3A3] tracking-wider mb-2">Feature Presets</label>
                      <div className="grid grid-cols-2 gap-2 mt-1">
                        {[
                          { key: "bookability", label: "Bookability Score™", desc: "DATA-BACKED RELIABILITY RATING FOR PERFORMERS" },
                          { key: "escrow", label: "GigSafe Escrow", desc: "SECURED PAYMENT PROTOCOLS FOR THE ENTERTAINMENT ECONOMY" },
                          { key: "backstage", label: "Backstage™", desc: "YOUR COLLABORATIVE LOCAL GIG WORKFORCE AND CREW" }
                        ].map(preset => (
                          <button
                            key={preset.key}
                            onClick={() => {
                              setGHeadline(preset.label);
                              setGSubtext(preset.desc);
                            }}
                            className="px-2 py-1.5 rounded bg-[#121212] border border-white/5 text-[10px] font-mono hover:border-[#00F0FF] transition-all text-neutral-400 text-left"
                          >
                            {preset.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {graphicType === "countdown" && (
                  <>
                    <h3 className="text-base font-space font-bold text-white border-b border-white/5 pb-3 flex items-center gap-2">
                      <CalendarIcon className="w-4 h-4 text-[#5A32FA]" />
                      Beta Countdown Settings
                    </h3>
                    <div>
                      <label className="block text-xs font-mono uppercase text-[#A3A3A3] tracking-wider mb-2">Target Beta Launch Date</label>
                      <input
                        type="date"
                        value={gCountdownTarget}
                        onChange={(e) => setGCountdownTarget(e.target.value)}
                        className="w-full bg-[#121212] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#5A32FA] font-mono"
                      />
                    </div>
                  </>
                )}

                {/* Subtext description editor (common for Milestone & Feature) */}
                {graphicType !== "countdown" && (
                  <div>
                    <label className="block text-xs font-mono uppercase text-[#A3A3A3] tracking-wider mb-2">Description Subtext</label>
                    <textarea
                      value={gSubtext}
                      onChange={(e) => setGSubtext(e.target.value)}
                      rows={3}
                      className="w-full bg-[#121212] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#5A32FA] resize-none"
                    />
                  </div>
                )}

                {/* Proactive strategic data triggers */}
                <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl font-mono text-[10px] text-[#A3A3A3] space-y-1.5">
                  <p className="font-bold text-[#FF4B4B]">PROACTIVE FLEX PRESETS:</p>
                  <button
                    onClick={() => {
                      setGraphicType("milestone");
                      setGMilestoneStat("68%");
                      setGMilestoneTitle("PAYMENT DELAYS");
                      setGSubtext("68% of performers report payment delays of 30+ days in the industry. We cure this on Artistant.");
                    }}
                    className="block text-left underline hover:text-white"
                  >
                    Load Stat: "68% Payment Delays..."
                  </button>
                  <button
                    onClick={() => {
                      setGraphicType("feature");
                      setGHeadline("REPLACEMENT ASSURED");
                      setGSubtext("Organizers book with absolute safety. Equivalent standby performers dispatched automatically on cancellations.");
                    }}
                    className="block text-left underline hover:text-white"
                  >
                    Load Spotlight: "Replacement Backup..."
                  </button>
                </div>

                <div className="flex gap-4 pt-2">
                  <button
                    onClick={handleDownloadUnified}
                    className="flex-1 bg-gradient-to-r from-[#5A32FA] to-[#00F0FF] hover:opacity-95 text-white font-space font-bold tracking-wider py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg"
                  >
                    <Download className="w-4 h-4" />
                    Download PNG
                  </button>
                  <button
                    onClick={() => {
                      showToast("Proactive: Unified content pushed directly to launch story queue!");
                    }}
                    className="px-4 bg-[#121212] border border-white/10 rounded-xl flex items-center justify-center hover:bg-white/5 transition-all text-[#A3A3A3] hover:text-white"
                    title="Push directly to Instagram/LinkedIn Queue"
                  >
                    <ArrowUpRight className="w-5 h-5 text-[#00F0FF]" />
                  </button>
                </div>

              </div>

            </div>

            {/* Right Graphics Preview Pane */}
            <div className="lg:col-span-7 space-y-4">
              <div className="bg-[#1E1E1E] border border-white/10 p-6 rounded-2xl flex flex-col items-center">
                <div className="w-full flex justify-between items-center mb-4">
                  <span className="text-xs font-mono uppercase tracking-wider text-[#A3A3A3]">Graphics preview canvas pane</span>
                  <span className="text-xs font-mono text-[#00F0FF]">
                    {canvasLayout === "square" ? "1080 x 1080 (Square)" : "1080 x 1920 (Portrait 9:16)"}
                  </span>
                </div>

                <div className="bg-[#121212] border border-white/10 p-4 rounded-xl max-w-full flex items-center justify-center overflow-auto shadow-inner relative" style={{ minHeight: '350px' }}>
                  <canvas 
                    ref={canvasRef} 
                    className={`h-auto border border-white/5 shadow-2xl rounded max-w-[280px] sm:max-w-[320px] md:max-w-[380px] lg:max-w-[400px]`}
                  />
                </div>
              </div>
            </div>

          </div>
        )}

        {/* ===================================================================
            TAB 3: SOCIAL POSTING CALENDAR
            =================================================================== */}
        {activeTab === "calendar" && (
          <div className="space-y-8 animate-in fade-in duration-200">
            <div className="bg-[#1E1E1E] border border-white/10 p-6 rounded-2xl shadow-xl">
              <h3 className="text-lg font-space font-bold text-white mb-2 flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-[#FF4B4B]" />
                Launch Post Schedule & presets
              </h3>
              <p className="text-sm text-[#A3A3A3] max-w-3xl leading-relaxed">
                Click any scheduled posting task below to instantly load its design preset parameters directly into the **Social Graphics Studio** to preview, download, and queue them.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {SOCIAL_CALENDAR.map((post) => (
                <div 
                  key={post.id} 
                  className="bg-[#1E1E1E] border border-white/10 hover:border-[#00F0FF]/30 rounded-2xl p-6 transition-all duration-300 flex flex-col justify-between group relative overflow-hidden shadow-md"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-white/[0.005] rounded-full blur-xl pointer-events-none group-hover:bg-[#00F0FF]/[0.02]" />
                  
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-xs font-mono text-[#A3A3A3] flex items-center gap-1.5">
                        <CalendarIcon className="w-3.5 h-3.5" />
                        {post.date} ({post.day}) @ {post.time}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono border font-bold ${
                        post.platform === "Instagram" ? "bg-[#5A32FA]/10 text-[#5A32FA] border-[#5A32FA]/20" :
                        post.platform === "Twitter/X" ? "bg-white/5 text-white border-white/10" :
                        "bg-[#00F0FF]/10 text-[#00F0FF] border-[#00F0FF]/20"
                      }`}>
                        {post.platform}
                      </span>
                    </div>

                    <h4 className="text-base font-space font-bold text-white mb-2 group-hover:text-[#00F0FF] transition-colors">
                      {post.title}
                    </h4>

                    <p className="text-xs text-[#A3A3A3] leading-relaxed mb-4 italic bg-[#121212] p-3 rounded-lg border border-white/5 line-clamp-3">
                      {post.caption}
                    </p>
                  </div>

                  <div className="flex gap-2 mt-4 pt-4 border-t border-white/5">
                    <button
                      onClick={() => handleApplyPreset(post)}
                      className="flex-1 bg-[#121212] border border-white/10 hover:bg-gradient-to-r hover:from-[#5A32FA] hover:to-[#00F0FF] hover:text-white text-[#A3A3A3] font-space font-bold text-xs py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all"
                    >
                      <ImageIcon className="w-3.5 h-3.5" />
                      Load design parameters
                    </button>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(post.caption);
                        showToast("Caption copied!");
                      }}
                      className="px-3 bg-[#121212] hover:bg-white/5 text-[#A3A3A3] hover:text-white rounded-lg border border-white/10 text-xs font-mono transition-all"
                    >
                      Copy
                    </button>
                  </div>
                </div>
              ))}
              
              {/* Custom Scheduler slot */}
              <div className="bg-[#1E1E1E]/30 border-2 border-dashed border-white/10 hover:border-[#5A32FA]/40 rounded-2xl p-6 transition-all duration-300 flex flex-col justify-center items-center gap-3 text-center cursor-pointer min-h-[250px] shadow-sm">
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                  <Plus className="w-5 h-5 text-neutral-400" />
                </div>
                <span className="font-space font-bold text-xs text-[#A3A3A3]">Add custom calendar task</span>
                <span className="text-[10px] text-neutral-600 max-w-[200px]">Draft future drops and countdown releases.</span>
              </div>
            </div>
          </div>
        )}

        {/* ===================================================================
            TAB 4: EMAIL BROADCAST ENGINE
            =================================================================== */}
        {activeTab === "emailing" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in duration-200">
            
            {/* Left Email Composer Form */}
            <div className="lg:col-span-6 space-y-6">
              <div className="bg-[#1E1E1E] border border-white/10 p-6 rounded-2xl space-y-6 shadow-2xl">
                <h3 className="text-base font-space font-bold text-white border-b border-white/5 pb-3 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-[#5A32FA]" />
                  Campaign Composer
                </h3>

                {/* Sender Alias Selection */}
                <div>
                  <label className="block text-xs font-mono uppercase text-[#A3A3A3] tracking-wider mb-2">Sender Alias</label>
                  <select
                    value={emailAlias}
                    onChange={(e) => setEmailAlias(e.target.value)}
                    className="w-full bg-[#121212] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#5A32FA]"
                  >
                    <option value="official">ArtisTant Official (info@artistant.in)</option>
                    <option value="support">ArtisTant Support (support@artistant.in)</option>
                    <option value="founder">ArtisTant Founder (founder@artistant.in)</option>
                  </select>
                </div>

                {/* Email Subject */}
                <div>
                  <label className="block text-xs font-mono uppercase text-[#A3A3A3] tracking-wider mb-2">Campaign Subject</label>
                  <input
                    type="text"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    className="w-full bg-[#121212] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#5A32FA]"
                  />
                </div>

                {/* Email Header banner line */}
                <div>
                  <label className="block text-xs font-mono uppercase text-[#A3A3A3] tracking-wider mb-2">Email Header Greeting</label>
                  <input
                    type="text"
                    value={emailHeader}
                    onChange={(e) => setEmailHeader(e.target.value)}
                    className="w-full bg-[#121212] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#5A32FA]"
                  />
                </div>

                {/* Email Body text */}
                <div>
                  <label className="block text-xs font-mono uppercase text-[#A3A3A3] tracking-wider mb-2">Message Body Copy (HTML supported)</label>
                  <textarea
                    value={emailBody}
                    onChange={(e) => setEmailBody(e.target.value)}
                    rows={6}
                    className="w-full bg-[#121212] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#5A32FA] resize-none"
                  />
                </div>

                {/* Call To Action Buttons configs */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono uppercase text-[#A3A3A3] tracking-wider mb-2">CTA Link Text</label>
                    <input
                      type="text"
                      value={emailCtaText}
                      onChange={(e) => setEmailCtaText(e.target.value)}
                      className="w-full bg-[#121212] border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-[#5A32FA]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono uppercase text-[#A3A3A3] tracking-wider mb-2">CTA Destination URL</label>
                    <input
                      type="text"
                      value={emailCtaUrl}
                      onChange={(e) => setEmailCtaUrl(e.target.value)}
                      className="w-full bg-[#121212] border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-[#5A32FA] font-mono"
                    />
                  </div>
                </div>

                {/* Sending stats readout */}
                <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl flex justify-between items-center font-space">
                  <div>
                    <span className="text-[10px] font-mono text-[#A3A3A3] block uppercase tracking-widest">Active targets list</span>
                    <span className="text-lg font-bold text-white">{getSelectedRecipientsList().filter(r=>!r.is_blocked).length} users ready</span>
                  </div>
                  <button
                    onClick={handleSendEmailBroadcast}
                    disabled={emailSending}
                    className="px-5 py-3 rounded-xl bg-gradient-to-r from-[#5A32FA] to-[#00F0FF] hover:opacity-90 text-white text-xs font-bold font-space tracking-wider flex items-center gap-2 transition-all disabled:opacity-50"
                  >
                    {emailSending ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    Launch Broadcast Campaign
                  </button>
                </div>
              </div>
            </div>

            {/* Right Email Preview frame & execution log terminal */}
            <div className="lg:col-span-6 space-y-6">
              
              {/* Interactive preview display */}
              <div className="bg-[#1E1E1E] border border-white/10 p-6 rounded-2xl shadow-2xl space-y-4">
                <div className="flex justify-between items-center border-b border-white/5 pb-3">
                  <span className="text-xs font-mono uppercase text-[#A3A3A3] tracking-wider">Email client live preview</span>
                  <div className="flex bg-[#121212] border border-white/10 rounded-lg p-0.5">
                    <button
                      onClick={() => setEmailPreviewMode("mobile")}
                      className={`p-1.5 rounded transition-all ${
                        emailPreviewMode === "mobile" ? "bg-white/5 text-[#00F0FF]" : "text-neutral-500 hover:text-neutral-300"
                      }`}
                      title="Mobile View"
                    >
                      <Smartphone className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setEmailPreviewMode("desktop")}
                      className={`p-1.5 rounded transition-all ${
                        emailPreviewMode === "desktop" ? "bg-white/5 text-[#00F0FF]" : "text-neutral-500 hover:text-neutral-300"
                      }`}
                      title="Desktop View"
                    >
                      <Monitor className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Email template frame wrapper strictly matching brand HTML welcome style */}
                <div className="flex justify-center bg-neutral-900 border border-white/5 p-4 rounded-xl overflow-y-auto max-h-[500px]">
                  <div 
                    className={`bg-[#0B1120] text-[#F0EFF4] text-left p-6 border rounded-xl relative ${
                      emailPreviewMode === "mobile" ? "w-[320px]" : "w-full max-w-[500px]"
                    }`}
                    style={{
                      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                      borderColor: '#1E2A42'
                    }}
                  >
                    {/* Watermark preview simulation overlay */}
                    <div 
                      className="absolute inset-0 opacity-[0.03] pointer-events-none"
                      style={{
                        backgroundImage: "url('https://raw.githubusercontent.com/anudeepDash/artistant-waitlist/main/public/logo_a_watermark.png')",
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'center center',
                        backgroundSize: '200px 200px'
                      }}
                    />

                    {/* Wordmark logo banner */}
                    <div className="text-center mb-6">
                      <span className="font-bold text-lg tracking-widest text-[#F0EFF4]">ARTISTANT</span>
                    </div>

                    <div className="p-1.5 rounded-xl bg-gradient-to-r from-[#FF4B4B] via-[#5A32FA] to-[#00F0FF]">
                      <div className="bg-[#0B1120] p-5 rounded-lg space-y-4">
                        <p className="text-white font-bold text-sm">Hey username,</p>
                        
                        <p className="text-white/90 font-bold text-xs uppercase tracking-wider text-[#00F0FF]">{emailHeader}</p>
                        
                        <p 
                          className="text-[#9BA4B8] text-xs leading-relaxed whitespace-pre-wrap"
                          dangerouslySetInnerHTML={{ __html: emailBody }}
                        />

                        {emailCtaText && (
                          <div className="pt-2 text-center">
                            <a 
                              href={emailCtaUrl} 
                              target="_blank" 
                              className="inline-block px-5 py-2.5 bg-[#5A32FA] text-white font-bold text-xs rounded-lg transition-all"
                              style={{ textDecoration: 'none' }}
                            >
                              {emailCtaText}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-[#1E2A42] text-center space-y-2">
                      <p className="text-[10px] text-neutral-500">You are receiving this official launch communication as part of the Artistant waitlist.</p>
                      <p className="text-[10px] text-[#FF4B4B] font-mono">Bengaluru, IN | artistant.in</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Execution progress terminal */}
              {showLogTerminal && (
                <div className="bg-black border border-white/10 rounded-2xl overflow-hidden shadow-2xl animate-slide-up">
                  <div className="bg-neutral-900 px-4 py-2 border-b border-white/5 flex justify-between items-center">
                    <span className="text-[10px] font-mono font-bold text-[#A3A3A3] flex items-center gap-1.5">
                      <div className={`w-2 h-2 rounded-full ${emailSending ? "bg-amber-500 animate-ping" : "bg-emerald-500"}`} />
                      Execution Broadcast Terminal
                    </span>
                    <button 
                      onClick={() => setShowLogTerminal(false)}
                      className="text-neutral-500 hover:text-neutral-300 text-xs font-bold"
                    >
                      Close
                    </button>
                  </div>
                  <pre className="p-4 max-h-48 overflow-y-auto text-[10px] font-mono text-[#A3A3A3] space-y-1.5 bg-[#121212] text-left">
                    {emailLogs.length === 0 ? (
                      <span className="text-neutral-600 italic">No execution logs active.</span>
                    ) : (
                      emailLogs.map((logStr, i) => (
                        <div key={i} className={logStr.includes("FAILED") ? "text-[#FF4B4B]" : logStr.includes("SUCCESS") ? "text-[#00F0FF]" : ""}>
                          {logStr}
                        </div>
                      ))
                    )}
                  </pre>
                </div>
              )}

            </div>

          </div>
        )}

      </main>
    </div>
  );
}
