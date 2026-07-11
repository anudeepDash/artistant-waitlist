"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { 
  type AdminWaitlistEntry 
} from "@/lib/waitlist";
import {
  adminGetRegistrationsAction,
  adminUpdateRegistrationAction,
  checkIsAdminAction,
  adminGetActivityLogsAction,
  adminGetAdminsAction,
  adminAddAdminAction,
  adminRemoveAdminAction
} from "@/lib/admin-actions";
import { 
  sendWelcomeEmailAction, 
  sendMassEmailAction 
} from "@/lib/email-actions";
import { useAuth } from "@/hooks/useAuth";
import { signInWithGoogle, signOut as firebaseSignOut } from "@/lib/auth";
import { motion, AnimatePresence } from "motion/react";
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
  Monitor,
  Trophy,
  Bell,
  BarChart3,
  FileText,
  Briefcase,
  Megaphone,
  Mail as MailIcon,
  Menu,
  Trash2,
  Globe,
  Activity
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

const MOCK_ACTIVITY_LOGS: any[] = [
  {
    id: "act-1",
    user_id: "uid-m1",
    email: "shreya@voice.in",
    username: "shreya.voice",
    action_type: "waitlist_register",
    user_agent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
    referrer: "https://google.com",
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "act-2",
    user_id: "anonymous",
    email: null,
    username: null,
    action_type: "visit",
    user_agent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
    referrer: "https://instagram.com",
    created_at: new Date(Date.now() - 5 * 60 * 1000).toISOString()
  }
];

const MOCK_ADMINS: any[] = [
  {
    id: "adm-1",
    email: "anudeepdash2004@gmail.com",
    added_by: "system",
    created_at: new Date("2026-07-01T00:00:00.000Z").toISOString()
  }
];

/* ── Glowing Admin Card Component ── */
function GlowingAdminCard({ children, className, style, idx = 0, ...props }: any) {
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const mediaQueryMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const checkMotion = () => {
      setReduceMotion(mediaQueryMotion.matches || window.innerWidth < 768);
    };
    checkMotion();
    window.addEventListener('resize', checkMotion, { passive: true });
    mediaQueryMotion.addEventListener('change', checkMotion);
    return () => {
      window.removeEventListener('resize', checkMotion);
      mediaQueryMotion.removeEventListener('change', checkMotion);
    };
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (reduceMotion) return;
    const { clientX, clientY, currentTarget } = e;
    const rect = currentTarget.getBoundingClientRect();
    setCoords({
      x: clientX - rect.left,
      y: clientY - rect.top,
    });
  };

  return (
    <motion.div
      className={className}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(!reduceMotion)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={reduceMotion ? {} : { y: -6 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      style={{
        position: 'relative',
        overflow: 'hidden',
        transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.4s, box-shadow 0.4s, background-color 0.4s',
        ...style
      }}
      {...props}
    >
      {isHovered && !reduceMotion && (
        <div
          style={{
            position: 'absolute',
            top: coords.y - 120,
            left: coords.x - 120,
            width: '240px',
            height: '240px',
            background: 'radial-gradient(circle, rgba(255, 255, 255, 0.04) 0%, transparent 70%)',
            borderRadius: '50%',
            pointerEvents: 'none',
            mixBlendMode: "var(--glow-blend, screen)" as any,
            filter: 'blur(20px)',
            zIndex: 0,
          }}
        />
      )}
      <div className="relative z-10 w-full h-full flex flex-col justify-between">
        {children}
      </div>
    </motion.div>
  );
}

/* ── Parse User Agent Helper ── */
function parseUserAgent(ua: string | null): string {
  if (!ua) return "Unknown Device";
  const lower = ua.toLowerCase();
  let os = "Unknown OS";
  if (lower.includes("macintosh") || lower.includes("mac os")) os = "macOS";
  else if (lower.includes("windows")) os = "Windows";
  else if (lower.includes("android")) os = "Android";
  else if (lower.includes("iphone") || lower.includes("ipad")) os = "iOS";
  else if (lower.includes("linux")) os = "Linux";
  let browser = "Unknown Browser";
  if (lower.includes("chrome") || lower.includes("chromium")) browser = "Chrome";
  else if (lower.includes("firefox")) browser = "Firefox";
  else if (lower.includes("safari") && !lower.includes("chrome")) browser = "Safari";
  else if (lower.includes("edge")) browser = "Edge";

  return `${browser} on ${os}`;
}

export default function AdminPage() {
  // ---------------------------------------------------------------------------
  // Security & Core State
  // ---------------------------------------------------------------------------
  const { user, loading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);
  
  // We keep a pseudo-passcode for the server actions, as they currently require it.
  const passcode = "ARTISTANT_ADMIN_2026";
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [authError, setAuthError] = useState("");
  const [isLiveMode, setIsLiveMode] = useState(false);
  const [registrations, setRegistrations] = useState<AdminWaitlistEntry[]>(MOCK_REGISTRATIONS);
  const [isLoading, setIsLoading] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);
  
  // Visitor Activities and Admin List States
  const [activityLogs, setActivityLogs] = useState<any[]>(MOCK_ACTIVITY_LOGS);
  const [adminUsers, setAdminUsers] = useState<any[]>(MOCK_ADMINS);
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [activityFilter, setActivityFilter] = useState("all");
  const [activitySearch, setActivitySearch] = useState("");
  
  // Tabs: registrations | leaderboards | members | admins | graphics | calendar | emailing
  const [activeTab, setActiveTab] = useState<"registrations" | "leaderboards" | "members" | "admins" | "graphics" | "calendar" | "emailing">("registrations");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Notification Toast
  const [successToast, setSuccessToast] = useState<string | null>(null);
  
  // Waitlist Queries & Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"table" | "card">("card");
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
  // Verify Admin Access dynamically
  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setIsAdmin(false);
      setCheckingAdmin(false);
      setIsUnlocked(false);
      return;
    }
    
    const checkAccess = async () => {
      setCheckingAdmin(true);
      try {
        const isAuth = await checkIsAdminAction(user.email || "");
        setIsAdmin(isAuth);
        if (isAuth && !isUnlocked && !isLoading) {
          await verifyAndLoad(passcode);
        }
      } catch (e) {
        console.error("Error verifying admin access:", e);
        setIsAdmin(false);
      } finally {
        setCheckingAdmin(false);
      }
    };
    
    checkAccess();
  }, [user, authLoading, isUnlocked]);

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

  // Auto-sync polling every 10 seconds
  useEffect(() => {
    if (!isUnlocked || !isAdmin || !isLiveMode) return;

    const interval = setInterval(() => {
      verifyAndLoad(passcode, true);
    }, 10000);

    return () => clearInterval(interval);
  }, [isUnlocked, isAdmin, isLiveMode]);

  // ---------------------------------------------------------------------------
  // API Fetch & Authentication
  // ---------------------------------------------------------------------------
  const verifyAndLoad = async (pass: string, isSilent = false) => {
    if (!isSilent) setIsLoading(true);
    setAuthError("");
    setDbError(null);
    try {
      const [regs, logs, admins] = await Promise.all([
        adminGetRegistrationsAction(pass),
        adminGetActivityLogsAction(pass),
        adminGetAdminsAction(pass)
      ]);
      setRegistrations(regs);
      setActivityLogs(logs);
      setAdminUsers(admins);
      setIsLiveMode(true);
      setIsUnlocked(true);
      if (!isSilent) showToast("Connected to Live Database.");
    } catch (err: any) {
      console.warn("Supabase fetch failed. Falling back to Sandbox LocalStorage / Mock Data.", err);
      if (err.message?.includes("Invalid admin passcode") || err.code === "PGRST301") {
        setAuthError("Server Access Credential Invalid.");
        setIsUnlocked(false);
      } else {
        // Fallback Sandbox
        const sandboxRegs = localStorage.getItem("artistant_sandbox_registrations");
        setRegistrations(sandboxRegs ? JSON.parse(sandboxRegs) : MOCK_REGISTRATIONS);
        
        const sandboxLogs = localStorage.getItem("artistant_sandbox_logs");
        setActivityLogs(sandboxLogs ? JSON.parse(sandboxLogs) : MOCK_ACTIVITY_LOGS);
        
        const sandboxAdmins = localStorage.getItem("artistant_sandbox_admins");
        setAdminUsers(sandboxAdmins ? JSON.parse(sandboxAdmins) : MOCK_ADMINS);
        
        setIsLiveMode(false);
        setIsUnlocked(true);
      }
    } finally {
      if (!isSilent) setIsLoading(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signInWithGoogle();
    } catch (err) {
      console.error(err);
      setAuthError("Failed to sign in with Google.");
    }
  };

  const handleLogout = async () => {
    try {
      await firebaseSignOut();
      setIsUnlocked(false);
      setIsAdmin(false);
      setAuthError("");
    } catch (err) {
      console.error(err);
    }
  };

  // ---------------------------------------------------------------------------
  // Action Handlers: Admin membership management
  // ---------------------------------------------------------------------------
  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminEmail) return;
    const targetEmail = newAdminEmail.trim().toLowerCase();
    
    try {
      if (isLiveMode) {
        await adminAddAdminAction(passcode, targetEmail, user?.email || "system");
        const admins = await adminGetAdminsAction(passcode);
        setAdminUsers(admins);
      } else {
        const newAdmin = {
          id: `mock-admin-${Date.now()}`,
          email: targetEmail,
          added_by: user?.email || "sandbox_user",
          created_at: new Date().toISOString()
        };
        const updated = [newAdmin, ...adminUsers];
        setAdminUsers(updated);
        localStorage.setItem("artistant_sandbox_admins", JSON.stringify(updated));
      }
      setNewAdminEmail("");
      showToast(`Admin ${targetEmail} added successfully!`);
    } catch (err: any) {
      console.error(err);
      showToast(`Failed to add admin: ${err.message}`);
    }
  };

  const handleRemoveAdmin = async (emailToRemove: string) => {
    const normalised = emailToRemove.trim().toLowerCase();
    if (normalised === "anudeepdash2004@gmail.com") {
      showToast("Cannot remove super-admin.");
      return;
    }
    
    try {
      if (isLiveMode) {
        await adminRemoveAdminAction(passcode, normalised);
        const admins = await adminGetAdminsAction(passcode);
        setAdminUsers(admins);
      } else {
        const updated = adminUsers.filter(a => a.email.toLowerCase() !== normalised);
        setAdminUsers(updated);
        localStorage.setItem("artistant_sandbox_admins", JSON.stringify(updated));
      }
      showToast(`Admin ${normalised} access revoked.`);
    } catch (err: any) {
      console.error(err);
      showToast(`Failed to remove admin: ${err.message}`);
    }
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
        await adminUpdateRegistrationAction(passcode, reg.user_id, nextState, reg.is_blocked, reg.position_override);
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
        await adminUpdateRegistrationAction(passcode, reg.user_id, reg.is_verified, nextState, reg.position_override);
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
          await adminUpdateRegistrationAction(passcode, userId, reg.is_verified, reg.is_blocked, val);
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
      const sandboxRegs = localStorage.getItem("artistant_sandbox_registrations");
      setRegistrations(sandboxRegs ? JSON.parse(sandboxRegs) : MOCK_REGISTRATIONS);
      
      const sandboxLogs = localStorage.getItem("artistant_sandbox_logs");
      setActivityLogs(sandboxLogs ? JSON.parse(sandboxLogs) : MOCK_ACTIVITY_LOGS);
      
      const sandboxAdmins = localStorage.getItem("artistant_sandbox_admins");
      setAdminUsers(sandboxAdmins ? JSON.parse(sandboxAdmins) : MOCK_ADMINS);
      
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
          await adminUpdateRegistrationAction(passcode, reg.user_id, true, reg.is_blocked, reg.position_override);
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
  // Leaderboards Calculation
  // ---------------------------------------------------------------------------
  const leaderboards = useMemo(() => {
    const referralCounts: Record<string, number> = {};
    registrations.forEach(r => {
      if (r.referred_by) {
        const ref = r.referred_by.toLowerCase().trim();
        referralCounts[ref] = (referralCounts[ref] || 0) + 1;
      }
    });

    const enriched = registrations.map(reg => {
      const refs = referralCounts[reg.username.toLowerCase().trim()] || 0;
      const points = 100 + (refs * 50); // 100 base + 50 per referral
      return { ...reg, refs, points };
    });

    return enriched.sort((a, b) => b.points - a.points);
  }, [registrations]);

  // ---------------------------------------------------------------------------
  // Render Logic
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
      <div className="min-h-screen bg-bg text-ink flex flex-col justify-center items-center px-4 relative overflow-hidden">
        {/* Homepage-style cinematic backdrop */}
        <div className="absolute inset-0" style={{
          background: `
            radial-gradient(ellipse 70% 50% at 50% 40%, rgba(124,92,255,0.08), transparent 60%),
            radial-gradient(ellipse 60% 40% at 25% 70%, rgba(242,90,43,0.06), transparent 55%),
            radial-gradient(ellipse 50% 40% at 75% 80%, rgba(212,86,122,0.05), transparent 50%)
          `
        }} />
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(rgba(124,92,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(124,92,255,0.04) 1px, transparent 1px)',
          backgroundSize: '80px 80px',
          maskImage: 'radial-gradient(ellipse 70% 60% at 50% 40%, black 20%, transparent 70%)',
          WebkitMaskImage: 'radial-gradient(ellipse 70% 60% at 50% 40%, black 20%, transparent 70%)',
        }} />

        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 max-w-md w-full"
        >
          {/* Brand clean icon */}
          <div className="flex justify-center mb-8">
            <div className="w-20 h-20 rounded-[22px] flex items-center justify-center bg-bg-soft border border-line-soft shadow-[0_8px_24px_-6px_rgba(0,0,0,0.2)]">
              <Lock className="w-9 h-9 text-ink" />
            </div>
          </div>

          {/* Card matching homepage feature-card style */}
          <div className="bg-bg-soft border border-line-soft rounded-[28px] p-10 relative overflow-hidden" style={{
            transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.4s, box-shadow 0.4s'
          }}>
            {/* Watermark like homepage cards */}
            <div className="absolute top-4 right-6 select-none pointer-events-none" style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: '80px',
              lineHeight: 0.8,
              color: 'rgba(255,255,255,0.03)'
            }}>A</div>

            <div className="text-center mb-8 relative z-10">
              <h1 className="text-3xl font-display font-bold tracking-tight mb-3">
                <span className="logo-typo">
                  <span className="artis">Artis</span><span className="tant">Tant</span>
                </span>
              </h1>
              <p className="text-[11px] font-mono font-semibold tracking-[0.12em] uppercase" style={{ color: 'var(--brand-1)' }}>
                Admin Console
              </p>
            </div>

            <div className="space-y-5 relative z-10">
              {authLoading || checkingAdmin ? (
                <div className="flex justify-center items-center py-6">
                  <RefreshCw className="w-8 h-8 animate-spin text-ink-3" />
                </div>
              ) : user ? (
                !isAdmin ? (
                  <div className="text-center space-y-4">
                    <div className="flex items-center justify-center gap-2 text-sm font-mono bg-hot/10 border border-hot/20 p-4 rounded-2xl" style={{ color: 'var(--hot)' }}>
                      <ShieldAlert className="w-5 h-5 shrink-0" />
                      <span>Access Denied. You do not have clearance.</span>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="text-xs text-ink-2 hover:text-ink underline underline-offset-4 transition-colors cursor-pointer"
                    >
                      Sign out of {user.email}
                    </button>
                  </div>
                ) : (
                  <div className="flex justify-center items-center py-6 text-sm font-mono animate-pulse text-ink-3">
                    Verifying Credentials...
                  </div>
                )
              ) : (
                <button
                  onClick={handleLoginSubmit}
                  disabled={isLoading || authLoading}
                  className="w-full bg-ink text-bg border border-line-soft font-display font-bold tracking-wider py-4 rounded-2xl flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-50 cursor-pointer"
                >
                  Sign In with Google
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}

              {authError && (
                <div className="flex items-center gap-2 text-xs font-mono bg-hot/10 border border-hot/20 p-3 rounded-xl mt-4" style={{ color: 'var(--hot)' }}>
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{authError}</span>
                </div>
              )}
            </div>

            {/* Footer matching homepage card-footer style */}
            <div className="mt-8 pt-5 flex justify-between items-center" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              <span className="text-[11px] font-mono font-semibold tracking-[0.08em]" style={{ color: 'var(--brand-1)' }}>
                SECURE ACCESS
              </span>
              <span className="text-[18px]" style={{ color: 'var(--brand-1)' }}>↗</span>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Render Console Main Layout
  // ---------------------------------------------------------------------------
  return (
    <div className="min-h-screen bg-bg text-ink relative overflow-hidden selection:bg-brand selection:text-white">
      {/* Homepage-style cinematic backdrop */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0" style={{
          background: `
            radial-gradient(ellipse 70% 50% at 50% 40%, rgba(124,92,255,0.08), transparent 60%),
            radial-gradient(ellipse 60% 40% at 25% 70%, rgba(242,90,43,0.06), transparent 55%),
            radial-gradient(ellipse 50% 40% at 75% 80%, rgba(212,86,122,0.05), transparent 50%)
          `
        }} />
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(rgba(124,92,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(124,92,255,0.04) 1px, transparent 1px)',
          backgroundSize: '80px 80px',
          maskImage: 'radial-gradient(ellipse 70% 60% at 50% 40%, black 20%, transparent 70%)',
          WebkitMaskImage: 'radial-gradient(ellipse 70% 60% at 50% 40%, black 20%, transparent 70%)',
        }} />
      </div>

      {/* Success Toast */}
      {successToast && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-8 right-8 z-50 bg-bg-card border border-line-soft text-ink text-sm px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3"
        >
          <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-bg-soft border border-line-soft">
            <Sparkles className="w-4 h-4 text-brand" />
          </div>
          <span>{successToast}</span>
        </motion.div>
      )}

      {/* ===================================================================
          APP SHELL — SIDEBAR + CONTENT
          =================================================================== */}
      <div className="flex h-screen overflow-hidden relative z-10">
        
        {/* Mobile Sidebar Backdrop */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-35 md:hidden cursor-pointer"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* ─── Sidebar ─── */}
        <motion.aside 
          initial={{ x: -300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className={`fixed md:relative top-0 bottom-0 left-0 w-[280px] bg-bg border-r border-line-soft flex flex-col flex-shrink-0 z-40 transition-transform duration-300 md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
        >
          {/* Brand Logo — exact homepage logo-typo */}
          <div className="px-8 pt-8 pb-6">
            <a href="/" target="_blank" className="block group">
              <h1 className="text-2xl logo-typo tracking-tight">
                <span className="artis">Artis</span><span className="tant">Tant</span>
              </h1>
              <p className="text-[11px] font-mono font-semibold tracking-[0.12em] uppercase mt-2" style={{ color: 'var(--brand-1)' }}>
                Admin Console
              </p>
            </a>
          </div>

          <div className="h-px mx-6" style={{ background: 'rgba(255,255,255,0.05)' }} />

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
            <p className="text-[10px] font-mono font-semibold tracking-[0.12em] uppercase px-4 pb-3" style={{ color: 'var(--ink-3)' }}>
              Command Center
            </p>
            
            {([
              { id: "registrations", label: "Waitlist", icon: Users, accent: 'var(--brand-1)' },
              { id: "leaderboards", label: "Leaderboards", icon: Trophy, accent: 'var(--brand-2)' },
              { id: "members", label: "Visitor Activity", icon: Eye, accent: 'var(--brand-3)' },
              { id: "admins", label: "Manage Admins", icon: Settings, accent: 'var(--brand-4)' },
            ] as const).map(item => (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all text-[14px] ${
                  activeTab === item.id 
                    ? "bg-bg-soft text-ink" 
                    : "text-ink-2 hover:text-ink hover:bg-bg-soft/50"
                }`}
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
                  activeTab === item.id 
                    ? 'bg-brand shadow-[0_4px_12px_-4px_rgba(242,90,43,0.25)]' 
                    : 'bg-bg-soft'
                }`}>
                  <item.icon className="w-4 h-4" style={{ color: activeTab === item.id ? '#ffffff' : 'var(--ink-3)' }} />
                </div>
                <span className="font-medium">{item.label}</span>
              </button>
            ))}

            <div className="pt-4 pb-2">
              <p className="text-[10px] font-mono font-semibold tracking-[0.12em] uppercase px-4 pb-3" style={{ color: 'var(--ink-3)' }}>
                Growth & Marketing
              </p>
            </div>

            {([
              { id: "graphics", label: "Content Wall", icon: ImageIcon, accent: 'var(--brand-3)' },
              { id: "calendar", label: "Social Calendar", icon: CalendarIcon, accent: 'var(--hot)' },
              { id: "emailing", label: "Broadcasts", icon: Mail, accent: 'var(--brand-4)' },
            ] as const).map(item => (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all text-[14px] ${
                  activeTab === item.id 
                    ? "bg-bg-soft text-ink" 
                    : "text-ink-2 hover:text-ink hover:bg-bg-soft/50"
                }`}
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
                  activeTab === item.id 
                    ? 'bg-brand shadow-[0_4px_12px_-4px_rgba(242,90,43,0.25)]' 
                    : 'bg-bg-soft'
                }`}>
                  <item.icon className="w-4 h-4" style={{ color: activeTab === item.id ? '#ffffff' : 'var(--ink-3)' }} />
                </div>
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </nav>

          {/* Bottom profile card */}
          <div className="p-4 border-t border-line-soft">
            <div className="bg-bg-soft border border-line-soft rounded-[20px] p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-[14px] flex items-center justify-center text-white font-display font-bold text-sm" style={{
                  background: 'var(--brand-3)',
                  boxShadow: '0 4px 12px -4px rgba(124,92,255,0.35)'
                }}>
                  A
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-ink truncate">Admin</p>
                  <p className="text-[10px] font-mono tracking-[0.08em] uppercase" style={{ color: 'var(--brand-1)' }}>Developer</p>
                </div>
                <button onClick={handleLogout} className="text-ink-3 hover:text-hot transition-colors p-1" title="Lock Dashboard">
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
              <div className="flex items-center gap-2 mt-3 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <div className={`w-2 h-2 rounded-full ${isLiveMode ? "bg-[#22C55E] shadow-[0_0_8px_#22C55E]" : "bg-amber-500 shadow-[0_0_8px_orange]"}`} />
                <span className="text-[10px] font-mono tracking-[0.08em] uppercase text-ink-3">{isLiveMode ? "Live Database" : "Sandbox Mode"}</span>
              </div>
            </div>
          </div>
        </motion.aside>

        {/* ─── Main Content Canvas ─── */}
        <main className="flex-1 overflow-y-auto relative scroll-smooth">
          {/* Top bar */}
          <header className="sticky top-0 z-30 backdrop-blur-xl border-b border-line-soft px-4 md:px-8 py-5 flex items-center justify-between" style={{ background: 'color-mix(in srgb, var(--bg) 80%, transparent)' }}>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setSidebarOpen(true)}
                className="md:hidden p-2 rounded-xl border border-line-soft bg-bg-soft text-ink-2 hover:text-ink cursor-pointer hover:bg-bg-card transition-all"
                aria-label="Open sidebar"
              >
                <Menu className="w-5 h-5" />
              </button>
              <h2 className="text-xl font-display font-bold tracking-tight text-ink uppercase">
                {activeTab === "registrations" && "Waitlist"}
                {activeTab === "leaderboards" && "Leaderboards"}
                {activeTab === "members" && "Visitor Activity"}
                {activeTab === "admins" && "Manage Admins"}
                {activeTab === "graphics" && "Content Wall"}
                {activeTab === "calendar" && "Calendar"}
                {activeTab === "emailing" && "Broadcasts"}
              </h2>
            </div>
            <div className="flex items-center gap-3">
              <a href="/" target="_blank" className="nav-cta text-xs" style={{ padding: '8px 16px' }}>
                View Site <span className="arrow">↗</span>
              </a>
            </div>
          </header>

          <div className="p-8 max-w-[1400px] mx-auto space-y-8 pb-32">
            
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              >
                {/* ===================================================================
                    TAB 1: WAITLIST COMMAND CENTER
                    =================================================================== */}
                {activeTab === "registrations" && (
                  <div className="space-y-8">
                    
                    {/* Metric cards — homepage feature-card style */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                      {[
                        { label: "Global Waitlist", value: totalCount, color: 'var(--ink)', Icon: Users },
                        { label: "Verified Artists", value: verifiedCount, color: 'var(--brand-3)', Icon: CheckCircle2 },
                        { label: "Pending Review", value: pendingCount, color: 'var(--brand-1)', Icon: Flame },
                        { label: "Suspended", value: blockedCount, color: 'var(--hot)', Icon: XCircle },
                      ].map((card, i) => (
                        <GlowingAdminCard
                          key={card.label}
                          idx={i}
                          initial={{ opacity: 0, y: 30 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.08, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                          className="bg-bg-soft border border-line-soft rounded-[28px] p-8 cursor-default group"
                        >
                          {/* Watermark number */}
                          <div className="absolute top-3 right-5 select-none pointer-events-none" style={{
                            fontFamily: 'var(--font-display)',
                            fontWeight: 700,
                            fontSize: '72px',
                            lineHeight: 0.8,
                            color: 'rgba(255,255,255,0.03)'
                          }}>{String(i + 1).padStart(2, '0')}</div>

                          <div className="flex justify-between items-start mb-6">
                            <div className="w-14 h-14 rounded-[18px] flex items-center justify-center bg-bg-card border border-line-soft shadow-sm">
                              <card.Icon className="w-6 h-6 text-brand" />
                            </div>
                          </div>

                          <div>
                            <p className="text-4xl font-display font-bold tracking-tight" style={{ color: card.color }}>{card.value}</p>
                            <p className="text-[11px] font-mono font-semibold tracking-[0.12em] uppercase mt-2" style={{ color: 'var(--brand-1)' }}>{card.label}</p>
                          </div>
                        </GlowingAdminCard>
                      ))}
                    </div>

                    {/* Heuristics suggestion banner */}
                    {autoVerifyCount > 0 && (
                      <GlowingAdminCard 
                        idx={4}
                        className="bg-bg-soft border border-line-soft rounded-[28px] p-8"
                      >
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                          <div className="flex items-start gap-4">
                            <div className="w-14 h-14 rounded-[18px] flex items-center justify-center flex-shrink-0 bg-bg-card border border-line-soft shadow-sm">
                              <Sparkles className="w-6 h-6 text-brand" />
                            </div>
                            <div>
                              <h4 className="font-display font-bold text-ink text-lg uppercase tracking-tight">
                                Auto-Verify Available
                              </h4>
                              <p className="text-sm text-ink-2 mt-1 max-w-2xl leading-relaxed">
                                {autoVerifyCount} pending registration(s) match the complete validation heuristics profile.
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={runAutoVerifyEngine}
                            className="nav-cta text-xs flex items-center gap-2 flex-shrink-0"
                            style={{ padding: '12px 24px' }}
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            Auto-Verify {autoVerifyCount}
                          </button>
                        </div>
                      </GlowingAdminCard>
                    )}

            {/* Toolbar */}
            <div className="bg-bg-soft border border-line-soft p-5 rounded-[28px] flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="relative w-full md:w-80">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-3" />
                <input
                  type="text"
                  placeholder="Search name, handle, email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-bg border border-line-soft rounded-full pl-11 pr-4 py-2.5 text-sm text-ink placeholder-ink-3 focus:outline-none transition-all"
                  style={{ borderColor: searchQuery ? 'var(--brand-1)' : '' }}
                />
              </div>

              <div className="flex flex-wrap items-center gap-3 w-full md:w-auto font-mono text-xs text-ink-2">
                {/* View Mode Toggle */}
                <div className="flex rounded-full p-0.5" style={{ background: 'var(--bg-2)', border: '1px solid rgba(255,255,255,0.04)' }}>
                  <button
                    onClick={() => setViewMode("table")}
                    className="px-4 py-2 rounded-full transition-all flex items-center gap-1.5 text-[11px] font-bold tracking-[0.06em] uppercase"
                    style={viewMode === "table" ? {
                      background: 'linear-gradient(135deg, #F25A2B, #7C5CFF)',
                      color: 'white',
                      boxShadow: '0 4px 12px -4px rgba(242,90,43,0.3)',
                    } : { color: 'var(--ink-3)' }}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    Table
                  </button>
                  <button
                    onClick={() => setViewMode("card")}
                    className="px-4 py-2 rounded-full transition-all flex items-center gap-1.5 text-[11px] font-bold tracking-[0.06em] uppercase"
                    style={viewMode === "card" ? {
                      background: 'linear-gradient(135deg, #F25A2B, #7C5CFF)',
                      color: 'white',
                      boxShadow: '0 4px 12px -4px rgba(242,90,43,0.3)',
                    } : { color: 'var(--ink-3)' }}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Cards
                  </button>
                </div>

                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="rounded-full px-4 py-2 text-[11px] font-bold tracking-[0.06em] uppercase focus:outline-none text-ink cursor-pointer"
                  style={{ background: 'var(--bg-2)', border: '1px solid rgba(255,255,255,0.04)' }}
                >
                  <option value="all">All Roles</option>
                  <option value="artist">Artist</option>
                  <option value="venue">Venue</option>
                  <option value="vendor">Vendor</option>
                  <option value="fan">Fan</option>
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="rounded-full px-4 py-2 text-[11px] font-bold tracking-[0.06em] uppercase focus:outline-none text-ink cursor-pointer"
                  style={{ background: 'var(--bg-2)', border: '1px solid rgba(255,255,255,0.04)' }}
                >
                  <option value="all">All Status</option>
                  <option value="verified">Verified</option>
                  <option value="pending">Pending</option>
                  <option value="blocked">Blocked</option>
                </select>
              </div>
            </div>

            {/* Data View */}
            {viewMode === "table" ? (
              <div className="bg-bg-soft border border-line-soft rounded-[28px] overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-left text-sm">
                    <thead>
                      <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }} className="text-ink-3 text-[10px] font-mono font-bold uppercase tracking-[0.12em]">
                        <th className="px-8 py-5">Artist</th>
                        <th className="px-6 py-5">Role</th>
                        <th className="px-6 py-5">Contact</th>
                        <th className="px-6 py-5">Position</th>
                        <th className="px-6 py-5">Status</th>
                        <th className="px-6 py-5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRegistrations.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-6 py-12 text-center text-ink-2 font-mono">
                            No matching waitlist nodes found.
                          </td>
                        </tr>
                      ) : (
                        filteredRegistrations.map((reg) => {
                          const heuristics = evaluateAutoVerify(reg);
                          return (
                            <tr 
                              key={reg.id} 
                              className={`hover:bg-ink/[0.02] transition-all duration-150 ${
                                reg.is_blocked ? "opacity-40" : ""
                              }`}
                            >
                              <td className="px-6 py-4">
                                <div>
                                  <div className="font-bold text-ink flex items-center gap-2">
                                    {reg.display_name || "Unspecified Node"}
                                    {reg.is_verified && (
                                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-[0.08em]" style={{
                                        background: 'linear-gradient(135deg, #F25A2B, #7C5CFF)',
                                        color: 'white',
                                        boxShadow: '0 4px 12px -4px rgba(242,90,43,0.35)',
                                      }}>
                                        VERIFIED
                                      </span>
                                    )}
                                    {heuristics.eligible && (
                                       <span 
                                         className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-mono font-bold tracking-[0.08em]"
                                         style={{
                                           background: 'var(--bg-2)',
                                           color: 'var(--brand-3)',
                                           border: '1px solid rgba(124,92,255,0.2)',
                                         }}
                                         title={`Auto-verify candidate: ${heuristics.reasons.join(", ")}`}
                                       >
                                         SUGGESTED
                                       </span>
                                     )}
                                   </div>
                                   <div className="text-xs font-mono mt-0.5" style={{ color: 'var(--brand-1)' }}>
                                     @{reg.username}
                                   </div>
                                 </div>
                               </td>
                              <td className="px-6 py-4">
                                 <div>
                                   <span className="inline-block px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-[0.08em]" style={{
                                     background: 'var(--bg-2)',
                                     color: reg.role === 'artist' ? 'var(--brand-3)' : reg.role === 'venue' ? 'var(--brand-2)' : reg.role === 'vendor' ? 'var(--brand-1)' : 'var(--ink-3)',
                                     border: `1px solid color-mix(in srgb, ${reg.role === 'artist' ? 'var(--brand-3)' : reg.role === 'venue' ? 'var(--brand-2)' : reg.role === 'vendor' ? 'var(--brand-1)' : 'var(--ink-3)'} 20%, transparent)`,
                                   }}>
                                     {reg.role || "fan"}
                                   </span>
                                   {reg.category && (
                                     <span className="block text-xs text-ink-2 mt-1 capitalize font-mono text-[11px]">
                                       Category: {reg.category.replace("_", " ")}
                                     </span>
                                   )}
                                   {reg.genres && reg.genres.length > 0 && (
                                     <div className="flex flex-wrap gap-1 mt-1.5">
                                       {reg.genres.map(g => (
                                         <span key={g} className="text-[9px] font-mono px-2 py-0.5 rounded-full text-ink-2" style={{
                                           background: 'var(--bg-2)',
                                           border: '1px solid rgba(255,255,255,0.04)',
                                         }}>
                                           #{g}
                                         </span>
                                       ))}
                                     </div>
                                   )}
                                 </div>
                               </td>
                              <td className="px-6 py-4 font-mono text-xs text-ink-2 space-y-0.5">
                                <div className="text-ink/80">{reg.email}</div>
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
                                     className="w-16 bg-bg border border-line-soft rounded-full px-2 py-1 text-xs text-ink text-center font-mono focus:outline-none focus:border-brand-1 transition-all"
                                   />
                                   <span className="text-[10px] font-mono text-neutral-500">
                                     {reg.position_override ? `#${reg.position_override}` : "Queue"}
                                   </span>
                                 </div>
                               </td>
                              <td className="px-6 py-4">
                                 <button
                                   onClick={() => handleVerifyAndLock(reg)}
                                   className="py-1.5 px-4 rounded-full text-[10px] font-mono font-bold tracking-[0.06em] uppercase transition-all"
                                   style={reg.is_verified ? {
                                     background: 'var(--bg-2)',
                                     color: 'var(--brand-3)',
                                     border: '1px solid rgba(124,92,255,0.2)',
                                   } : {
                                     background: 'linear-gradient(135deg, #F25A2B, #7C5CFF)',
                                     color: 'white',
                                     border: 'none',
                                     boxShadow: '0 4px 12px -4px rgba(242,90,43,0.3)',
                                   }}
                                 >
                                   {reg.is_verified ? "Locked" : "Verify"}
                                 </button>
                               </td>
                              <td className="px-6 py-4 text-right">
                                 <button
                                   onClick={() => handleToggleBlock(reg)}
                                   className="py-1.5 px-4 rounded-full text-[10px] font-mono font-bold tracking-[0.06em] uppercase transition-all"
                                   style={reg.is_blocked ? {
                                     background: 'rgba(255,75,75,0.1)',
                                     color: 'var(--hot)',
                                     border: '1px solid rgba(255,75,75,0.2)',
                                   } : {
                                     background: 'var(--bg-2)',
                                     color: 'var(--ink-3)',
                                     border: '1px solid rgba(255,255,255,0.04)',
                                   }}
                                 >
                                   {reg.is_blocked ? "Restore" : "Suspend"}
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
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredRegistrations.length === 0 ? (
                  <div className="col-span-full py-12 text-center text-ink-2 font-mono bg-bg-soft rounded-[28px] border border-line-soft">
                    No matching registrations found.
                  </div>
                ) : (
                  filteredRegistrations.map((reg, idx) => {
                    const heuristics = evaluateAutoVerify(reg);
                    const roleColors: Record<string, string> = {
                      artist: 'var(--brand-3)',
                      venue: 'var(--brand-2)',
                      vendor: 'var(--brand-1)',
                    };
                    const roleColor = roleColors[reg.role || ''] || 'var(--ink-3)';
                    const initials = (reg.display_name || 'U')[0].toUpperCase();

                    return (
                      <GlowingAdminCard 
                        key={reg.id}
                        idx={idx}
                        className={`bg-bg-soft border border-line-soft rounded-[28px] p-8 flex flex-col gap-0 ${
                          reg.is_blocked ? "opacity-50" : ""
                        }`}
                        style={{ minHeight: '380px' }}
                      >
                        {/* Watermark initial */}
                        <div className="absolute top-3 right-6 select-none pointer-events-none" style={{
                          fontFamily: 'var(--font-display)',
                          fontWeight: 700,
                          fontSize: '80px',
                          lineHeight: 0.8,
                          color: 'rgba(255,255,255,0.03)'
                        }}>{initials}</div>

                        {/* Top: Icon + Status badges */}
                        <div className="flex justify-between items-start mb-5 z-10">
                          <div className="w-14 h-14 rounded-[18px] flex items-center justify-center bg-bg-card border border-line-soft shadow-sm text-brand font-display font-bold text-xl">
                            {initials}
                          </div>
                          <div className="flex flex-col gap-1.5 items-end">
                            {reg.is_verified && (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-mono font-bold tracking-[0.08em] bg-brand text-white shadow-[0_4px_12px_-4px_rgba(242,90,43,0.25)]">
                                VERIFIED
                              </span>
                            )}
                            {heuristics.eligible && (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-mono font-bold tracking-[0.08em] cursor-help" style={{
                                background: 'var(--bg-2)',
                                color: 'var(--brand-3)',
                                border: '1px solid rgba(124,92,255,0.2)',
                              }} title={`Auto-verify: ${heuristics.reasons.join(", ")}`}>
                                SUGGESTED
                              </span>
                            )}
                            {reg.is_blocked && (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-mono font-bold tracking-[0.08em]" style={{
                                background: 'rgba(255,75,75,0.1)',
                                color: 'var(--hot)',
                                border: '1px solid rgba(255,75,75,0.2)',
                              }}>
                                SUSPENDED
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Identity */}
                        <div className="mb-1 z-10">
                          <h3 className="font-display font-bold text-xl text-ink uppercase tracking-tight leading-tight pr-4">
                            {reg.display_name || "Unknown"}
                          </h3>
                          <p className="text-sm font-mono mt-1" style={{ color: 'var(--brand-1)' }}>
                            @{reg.username}
                          </p>
                        </div>

                        {/* Role & Tags */}
                        <div className="mb-auto z-10 pt-3">
                          <span className="inline-block px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-[0.08em]" style={{
                            background: 'var(--bg-2)',
                            color: roleColor,
                            border: `1px solid color-mix(in srgb, ${roleColor} 20%, transparent)`,
                          }}>
                            {reg.role || "fan"}
                          </span>
                          
                          {(reg.category || (reg.genres && reg.genres.length > 0)) && (
                            <div className="mt-3 space-y-2">
                              {reg.category && (
                                <p className="text-xs text-ink-2 capitalize">
                                  <span className="text-ink-3">Category:</span> {reg.category.replace("_", " ")}
                                </p>
                              )}
                              {reg.genres && reg.genres.length > 0 && (
                                <div className="flex flex-wrap gap-1.5">
                                  {reg.genres.map(g => (
                                    <span key={g} className="text-[10px] font-mono px-2 py-0.5 rounded-full text-ink-2" style={{
                                      background: 'var(--bg-2)',
                                      border: '1px solid rgba(255,255,255,0.04)',
                                    }}>
                                      #{g}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Contact info */}
                        <div className="text-xs text-ink-2 space-y-1 mt-4 pt-4 z-10" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                          <div className="flex items-center gap-2">
                            <Mail className="w-3.5 h-3.5 text-ink-3" />
                            <span>{reg.email}</span>
                          </div>
                          {reg.phone && (
                            <div className="flex items-center gap-2">
                              <Smartphone className="w-3.5 h-3.5 text-ink-3" />
                              <span>{reg.phone}</span>
                            </div>
                          )}
                        </div>

                        {/* Card Footer — matching homepage card-footer */}
                        <div className="mt-4 pt-4 flex items-center gap-3 z-10" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                          <button
                            onClick={() => handleVerifyAndLock(reg)}
                            className="flex-1 py-2.5 rounded-full text-[11px] font-mono font-bold tracking-[0.06em] uppercase flex items-center justify-center gap-2 transition-all"
                            style={reg.is_verified ? {
                              background: 'var(--bg-2)',
                              color: 'var(--brand-3)',
                              border: '1px solid rgba(124,92,255,0.2)',
                            } : {
                              background: 'linear-gradient(135deg, #F25A2B, #7C5CFF)',
                              color: 'white',
                              border: 'none',
                              boxShadow: '0 4px 16px -4px rgba(242,90,43,0.4)',
                            }}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            {reg.is_verified ? "Locked" : "Verify"}
                          </button>
                          
                          <button
                            onClick={() => handleToggleBlock(reg)}
                            className="flex-1 py-2.5 rounded-full text-[11px] font-mono font-bold tracking-[0.06em] uppercase flex items-center justify-center gap-2 transition-all"
                            style={reg.is_blocked ? {
                              background: 'rgba(255,75,75,0.1)',
                              color: 'var(--hot)',
                              border: '1px solid rgba(255,75,75,0.2)',
                            } : {
                              background: 'var(--bg-2)',
                              color: 'var(--ink-3)',
                              border: '1px solid rgba(255,255,255,0.04)',
                            }}
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            {reg.is_blocked ? "Restore" : "Suspend"}
                          </button>
                        </div>
                      </GlowingAdminCard>
                    );
                  })
                )}
              </div>
            )}
          </div>
        )}

        {/* ===================================================================
            TAB X: LEADERBOARDS
            =================================================================== */}
        {activeTab === "leaderboards" && (
          <div className="space-y-8 animate-in fade-in duration-200">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Points Leaderboard */}
              <GlowingAdminCard idx={0} className="bg-bg-soft border border-line-soft rounded-[28px] overflow-hidden flex flex-col h-[600px]">
                <div className="p-8 flex items-center gap-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <div className="w-12 h-12 rounded-[16px] flex items-center justify-center flex-shrink-0 bg-bg-card border border-line-soft shadow-sm">
                    <Trophy className="w-5 h-5 text-brand" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-ink text-lg uppercase tracking-tight">Points Ranking</h3>
                    <p className="text-[11px] font-mono font-semibold tracking-[0.12em] uppercase mt-0.5" style={{ color: 'var(--brand-1)' }}>Base 100 + 50 per referral</p>
                  </div>
                </div>
                <div className="overflow-y-auto flex-1 p-6 space-y-2">
                  {leaderboards.map((user, idx) => (
                    <div key={`pts-${user.id}`} className="flex items-center justify-between p-4 rounded-2xl transition-all" style={{
                      background: idx < 3 ? 'var(--bg-2)' : 'transparent',
                      border: idx < 3 ? '1px solid rgba(255,255,255,0.04)' : '1px solid transparent',
                    }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'var(--bg-2)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.04)'; }}
                    onMouseLeave={(e) => { if (idx >= 3) { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.borderColor = 'transparent'; } }}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-mono font-bold text-[11px] ${
                          idx === 0 ? "text-amber-400" :
                          idx === 1 ? "text-slate-300" :
                          idx === 2 ? "text-amber-600" :
                          "text-ink-3"
                        }`} style={{ background: idx < 3 ? 'rgba(255,255,255,0.05)' : 'var(--bg-2)' }}>
                          #{idx + 1}
                        </div>
                        <div>
                          <p className="font-semibold text-ink text-sm">{user.display_name || user.username}</p>
                          <p className="text-[11px] font-mono text-ink-3">@{user.username}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-display font-bold" style={{ color: 'var(--brand-1)' }}>{user.points}</p>
                        <p className="text-[10px] font-mono text-ink-3 uppercase tracking-[0.08em]">pts</p>
                      </div>
                    </div>
                  ))}
                </div>
              </GlowingAdminCard>

              {/* Referrals Leaderboard */}
              <GlowingAdminCard idx={1} className="bg-bg-soft border border-line-soft rounded-[28px] overflow-hidden flex flex-col h-[600px]">
                <div className="p-8 flex items-center gap-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <div className="w-12 h-12 rounded-[16px] flex items-center justify-center flex-shrink-0 bg-bg-card border border-line-soft shadow-sm">
                    <Users className="w-5 h-5 text-brand" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-ink text-lg uppercase tracking-tight">Network Builders</h3>
                    <p className="text-[11px] font-mono font-semibold tracking-[0.12em] uppercase mt-0.5" style={{ color: 'var(--brand-1)' }}>Ranked by referrals</p>
                  </div>
                </div>
                <div className="overflow-y-auto flex-1 p-6 space-y-2">
                  {[...leaderboards]
                    .sort((a, b) => (b.refs || 0) - (a.refs || 0))
                    .map((user, idx) => (
                    <div key={`ref-${user.id}`} className="flex items-center justify-between p-4 rounded-2xl transition-all" style={{
                      background: idx < 3 ? 'var(--bg-2)' : 'transparent',
                      border: idx < 3 ? '1px solid rgba(255,255,255,0.04)' : '1px solid transparent',
                    }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'var(--bg-2)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.04)'; }}
                    onMouseLeave={(e) => { if (idx >= 3) { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.borderColor = 'transparent'; } }}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-mono font-bold text-[11px] ${
                          idx === 0 ? "text-amber-400" :
                          idx === 1 ? "text-slate-300" :
                          idx === 2 ? "text-amber-600" :
                          "text-ink-3"
                        }`} style={{ background: idx < 3 ? 'rgba(255,255,255,0.05)' : 'var(--bg-2)' }}>
                          #{idx + 1}
                        </div>
                        <div>
                          <p className="font-semibold text-ink text-sm">{user.display_name || user.username}</p>
                          <p className="text-[11px] font-mono text-ink-3">@{user.username}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-display font-bold" style={{ color: 'var(--brand-3)' }}>{user.refs || 0}</p>
                        <p className="text-[10px] font-mono text-ink-3 uppercase tracking-[0.08em]">refs</p>
                      </div>
                    </div>
                  ))}
                </div>
              </GlowingAdminCard>

            </div>
          </div>
        )}

        {/* ===================================================================
            TAB: VISITOR ACTIVITY (MEMBERS)
            =================================================================== */}
        {activeTab === "members" && (
          <div className="space-y-8 animate-in fade-in duration-200">
            {/* Overview cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-bg-soft border border-line-soft rounded-[24px] p-6 relative overflow-hidden">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[11px] font-mono text-ink-3 uppercase tracking-wider">Total Traffic (Visits)</p>
                    <h3 className="text-3xl font-display font-bold mt-2 text-ink">
                      {activityLogs.filter(l => l.action_type === 'visit').length}
                    </h3>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-bg-card border border-line-soft flex items-center justify-center">
                    <Globe className="w-5 h-5 text-ink-2" />
                  </div>
                </div>
              </div>

              <div className="bg-bg-soft border border-line-soft rounded-[24px] p-6 relative overflow-hidden">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[11px] font-mono text-ink-3 uppercase tracking-wider">Distinct Logins</p>
                    <h3 className="text-3xl font-display font-bold mt-2 text-ink">
                      {new Set(activityLogs.filter(l => l.action_type === 'login').map(l => l.email || l.user_id)).size}
                    </h3>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-bg-card border border-line-soft flex items-center justify-center">
                    <Lock className="w-5 h-5 text-ink-2" />
                  </div>
                </div>
              </div>

              <div className="bg-bg-soft border border-line-soft rounded-[24px] p-6 relative overflow-hidden">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[11px] font-mono text-ink-3 uppercase tracking-wider">Total Waitlisted</p>
                    <h3 className="text-3xl font-display font-bold mt-2 text-ink">
                      {registrations.length}
                    </h3>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-bg-card border border-line-soft flex items-center justify-center">
                    <Users className="w-5 h-5 text-ink-2" />
                  </div>
                </div>
              </div>
            </div>

            {/* Filter and Table Card */}
            <div className="bg-bg-soft border border-line-soft rounded-[28px] p-8 space-y-6">
              <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                <div>
                  <h3 className="text-lg font-display font-bold text-ink">Recent Session Actions</h3>
                  <p className="text-xs text-ink-3 mt-1">Real-time interactions on the Artistant platform</p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                  {/* Search */}
                  <div className="relative flex-1 sm:w-64">
                    <Search className="w-4 h-4 text-ink-3 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search email, user..."
                      value={activitySearch}
                      onChange={(e) => setActivitySearch(e.target.value)}
                      className="w-full bg-bg-card border border-line-soft text-ink rounded-2xl pl-10 pr-4 py-2.5 text-xs font-mono focus:outline-none focus:border-ink transition-all"
                    />
                  </div>

                  {/* Filter Select */}
                  <select
                    value={activityFilter}
                    onChange={(e) => setActivityFilter(e.target.value)}
                    className="bg-bg-card border border-line-soft text-ink rounded-2xl px-4 py-2.5 text-xs focus:outline-none focus:border-ink transition-all cursor-pointer"
                  >
                    <option value="all">All Events</option>
                    <option value="visit">Visits Only</option>
                    <option value="login">Logins Only</option>
                    <option value="waitlist_register">Waitlist Registrations</option>
                  </select>
                </div>
              </div>

              {/* Logs Table */}
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-line-soft text-[10px] font-mono text-ink-3 uppercase tracking-wider text-left">
                      <th className="pb-3 font-semibold">Time</th>
                      <th className="pb-3 font-semibold">Event</th>
                      <th className="pb-3 font-semibold">User Ident</th>
                      <th className="pb-3 font-semibold">Browser / OS</th>
                      <th className="pb-3 font-semibold">Referrer</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line-soft/50">
                    {activityLogs
                      .filter(log => {
                        if (activityFilter !== "all" && log.action_type !== activityFilter) return false;
                        if (activitySearch) {
                          const query = activitySearch.toLowerCase();
                          const emailMatch = log.email?.toLowerCase().includes(query);
                          const usernameMatch = log.username?.toLowerCase().includes(query);
                          const refMatch = log.referrer?.toLowerCase().includes(query);
                          return emailMatch || usernameMatch || refMatch;
                        }
                        return true;
                      })
                      .map((log) => (
                        <tr key={log.id} className="text-xs font-mono hover:bg-bg-card/30 transition-colors">
                          <td className="py-4 text-ink-2">{new Date(log.created_at).toLocaleString()}</td>
                          <td className="py-4">
                            {log.action_type === 'visit' && (
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase bg-zinc-800/50 text-zinc-300 border border-zinc-700/50">
                                Visit
                              </span>
                            )}
                            {log.action_type === 'login' && (
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase bg-blue-950/40 text-blue-300 border border-blue-900/50">
                                Login
                              </span>
                            )}
                            {log.action_type === 'waitlist_register' && (
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase bg-amber-950/40 text-amber-300 border border-amber-900/50">
                                Waitlist
                              </span>
                            )}
                          </td>
                          <td className="py-4 font-semibold text-ink">
                            {log.username ? `@${log.username}` : (log.email || "Anonymous Visitor")}
                          </td>
                          <td className="py-4 text-ink-3 truncate max-w-[200px]" title={log.user_agent}>
                            {parseUserAgent(log.user_agent)}
                          </td>
                          <td className="py-4 text-ink-2">{log.referrer || "Direct"}</td>
                        </tr>
                      ))}
                    {activityLogs.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-ink-3">No activity logs captured yet.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ===================================================================
            TAB: ADMIN CLEARANCE (ADMINS)
            =================================================================== */}
        {activeTab === "admins" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-200">
            {/* Left form column */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-bg-soft border border-line-soft p-8 rounded-[28px] space-y-6">
                <div className="border-b border-line-soft pb-5">
                  <h3 className="text-lg font-display font-bold text-ink">Grant Clearance</h3>
                  <p className="text-xs text-ink-3 mt-1">Authorize a team member to access this console.</p>
                </div>

                <form onSubmit={handleAddAdmin} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono uppercase tracking-[0.08em] text-ink-3">Google Account Email</label>
                    <input
                      type="email"
                      required
                      placeholder="developer@artistant.in"
                      value={newAdminEmail}
                      onChange={(e) => setNewAdminEmail(e.target.value)}
                      className="w-full bg-bg-card border border-line-soft text-ink rounded-2xl px-4 py-3.5 text-xs font-mono focus:outline-none focus:border-ink transition-all"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-ink text-bg font-display font-bold tracking-wider py-3.5 rounded-2xl flex items-center justify-center gap-2 hover:opacity-90 transition-all cursor-pointer text-xs uppercase"
                  >
                    <Plus className="w-4 h-4" />
                    Grant Admin Role
                  </button>
                </form>
              </div>
            </div>

            {/* Right table list column */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-bg-soft border border-line-soft p-8 rounded-[28px] space-y-6">
                <div className="border-b border-line-soft pb-5">
                  <h3 className="text-lg font-display font-bold text-ink">Authorized Administrators</h3>
                  <p className="text-xs text-ink-3 mt-1">Active console credentials with full table write privileges.</p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-line-soft text-[10px] font-mono text-ink-3 uppercase tracking-wider text-left">
                        <th className="pb-3 font-semibold">User Email</th>
                        <th className="pb-3 font-semibold">Granted By</th>
                        <th className="pb-3 font-semibold">Access Date</th>
                        <th className="pb-3 text-right font-semibold">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-line-soft/50">
                      {/* Seed default hardcoded super admin display */}
                      <tr className="text-xs font-mono hover:bg-bg-card/30 transition-colors">
                        <td className="py-4 flex items-center gap-3 font-semibold text-ink">
                          <div className="w-8 h-8 rounded-lg bg-indigo-950/30 text-indigo-300 flex items-center justify-center font-display font-bold">
                            S
                          </div>
                          <span>anudeepdash2004@gmail.com</span>
                        </td>
                        <td className="py-4 text-ink-2">system</td>
                        <td className="py-4 text-ink-3">Jul 1, 2026</td>
                        <td className="py-4 text-right">
                          <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-zinc-800 text-zinc-400 border border-zinc-700">
                            Super-Admin
                          </span>
                        </td>
                      </tr>

                      {adminUsers
                        .filter(admin => admin.email !== 'anudeepdash2004@gmail.com')
                        .map((admin) => (
                          <tr key={admin.id} className="text-xs font-mono hover:bg-bg-card/30 transition-colors">
                            <td className="py-4 flex items-center gap-3 font-semibold text-ink">
                              <div className="w-8 h-8 rounded-lg bg-bg-card border border-line-soft text-ink flex items-center justify-center font-display font-bold">
                                {admin.email.substring(0, 1).toUpperCase()}
                              </div>
                              <span>{admin.email}</span>
                            </td>
                            <td className="py-4 text-ink-2">{admin.added_by || "unknown"}</td>
                            <td className="py-4 text-ink-3">{new Date(admin.created_at).toLocaleDateString()}</td>
                            <td className="py-4 text-right">
                              <button
                                onClick={() => handleRemoveAdmin(admin.email)}
                                className="p-2 bg-red-950/20 text-red-400 hover:text-red-300 rounded-lg border border-red-900/30 hover:border-red-900 transition-colors cursor-pointer"
                                title="Revoke access"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===================================================================
            TAB 2: MARKETING CONTENT WALL
            =================================================================== */}
        {activeTab === "graphics" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in duration-200">
            
            {/* Left Graphics Parameter Control Panel */}
            <div className="lg:col-span-5 space-y-8">
              
              {/* Studio Settings */}
              <div className="bg-bg-soft border border-line-soft p-8 rounded-[28px] space-y-6">
                <div className="flex items-center gap-4 border-b border-line-soft pb-5">
                  <div className="w-12 h-12 rounded-[16px] flex items-center justify-center flex-shrink-0 bg-bg-card border border-line-soft shadow-sm">
                    <Settings className="w-5 h-5 text-brand" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-ink text-lg uppercase tracking-tight">Graphics Parameters</h3>
                    <p className="text-[11px] font-mono font-semibold tracking-[0.12em] uppercase mt-0.5" style={{ color: 'var(--brand-1)' }}>Configure unified studio output</p>
                  </div>
                </div>

                {/* Switch Graphic Type Mode */}
                <div>
                  <label className="block text-[10px] font-mono font-semibold uppercase text-ink-3 tracking-[0.12em] mb-3">
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
                        className="py-2.5 rounded-full font-mono text-[11px] font-bold uppercase tracking-[0.06em] transition-all border"
                        style={graphicType === t.type ? {
                          background: 'linear-gradient(135deg, #F25A2B, #7C5CFF)',
                          color: 'white',
                          border: 'none',
                          boxShadow: '0 4px 12px -4px rgba(242,90,43,0.3)',
                        } : {
                          background: 'var(--bg-2)',
                          color: 'var(--ink-3)',
                          borderColor: 'rgba(255,255,255,0.04)',
                        }}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Aspect Layout Ratio dimensions */}
                <div>
                  <label className="block text-[10px] font-mono font-semibold uppercase text-ink-3 tracking-[0.12em] mb-3">
                    Output Aspect Ratio
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setCanvasLayout("square")}
                      className="py-2.5 rounded-full font-mono text-[11px] font-bold uppercase tracking-[0.06em] transition-all border"
                      style={canvasLayout === "square" ? {
                        background: 'linear-gradient(135deg, #F25A2B, #7C5CFF)',
                        color: 'white',
                        border: 'none',
                        boxShadow: '0 4px 12px -4px rgba(242,90,43,0.3)',
                      } : {
                        background: 'var(--bg-2)',
                        color: 'var(--ink-3)',
                        borderColor: 'rgba(255,255,255,0.04)',
                      }}
                    >
                      Square (1:1)
                    </button>
                    <button
                      onClick={() => setCanvasLayout("portrait")}
                      className="py-2.5 rounded-full font-mono text-[11px] font-bold uppercase tracking-[0.06em] transition-all border"
                      style={canvasLayout === "portrait" ? {
                        background: 'linear-gradient(135deg, #F25A2B, #7C5CFF)',
                        color: 'white',
                        border: 'none',
                        boxShadow: '0 4px 12px -4px rgba(242,90,43,0.3)',
                      } : {
                        background: 'var(--bg-2)',
                        color: 'var(--ink-3)',
                        borderColor: 'rgba(255,255,255,0.04)',
                      }}
                    >
                      Portrait (9:16)
                    </button>
                  </div>
                </div>

                {/* Theme Selector */}
                <div>
                  <label className="block text-[10px] font-mono font-semibold uppercase text-ink-3 tracking-[0.12em] mb-3">
                    Creative Glow Theme
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { key: "cyber", label: "Cyber Neon", dot: "#D4567A" },
                      { key: "sunset", label: "Retro Sunset", dot: "#F25A2B" },
                      { key: "indigo", label: "Deep Indigo", dot: "#7C5CFF" }
                    ].map(theme => (
                      <button
                        key={theme.key}
                        onClick={() => setUnifiedTheme(theme.key as any)}
                        className="py-2 rounded-xl border text-[10px] font-mono flex flex-col items-center gap-1.5 transition-all"
                        style={unifiedTheme === theme.key ? {
                          background: 'var(--bg-2)',
                          color: 'var(--ink)',
                          borderColor: theme.dot,
                        } : {
                          background: 'transparent',
                          color: 'var(--ink-3)',
                          borderColor: 'rgba(255,255,255,0.04)',
                        }}
                      >
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: theme.dot }} />
                        {theme.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Dynamic Parameter Editor Panel */}
              <div className="bg-bg-soft border border-line-soft p-8 rounded-[28px] space-y-6">
                
                {graphicType === "milestone" && (
                  <>
                    <h3 className="text-base font-display font-bold text-ink border-b border-line-soft pb-3 flex items-center gap-2">
                      <Sparkles className="w-4 h-4" style={{ color: 'var(--brand-1)' }} />
                      Milestone Settings
                    </h3>
                    <div>
                      <label className="block text-xs font-mono uppercase text-ink-2 tracking-wider mb-2">Live Metric Count</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={gMilestoneStat}
                          onChange={(e) => setGMilestoneStat(e.target.value)}
                          className="flex-1 bg-bg border border-line-soft rounded-2xl px-4 py-2.5 text-sm text-ink focus:outline-none focus:border-brand-1 transition-all"
                        />
                        <button
                          onClick={() => {
                            setGMilestoneStat(`${totalCount}+`);
                            showToast("Pulled live database count!");
                          }}
                          className="px-4 py-2.5 rounded-2xl text-xs hover:text-ink transition-all font-mono"
                          style={{ background: 'var(--bg-2)', border: '1px solid rgba(255,255,255,0.04)' }}
                          title="Pull Live Total"
                        >
                          Live DB
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-mono uppercase text-ink-2 tracking-wider mb-2">Headline Title</label>
                      <input
                        type="text"
                        value={gMilestoneTitle}
                        onChange={(e) => setGMilestoneTitle(e.target.value)}
                        className="w-full bg-bg border border-line-soft rounded-2xl px-4 py-2.5 text-sm text-ink focus:outline-none focus:border-brand-1 transition-all"
                      />
                    </div>
                  </>
                )}

                {graphicType === "feature" && (
                  <>
                    <h3 className="text-base font-display font-bold text-ink border-b border-line-soft pb-3 flex items-center gap-2">
                      <Layers className="w-4 h-4" style={{ color: 'var(--brand-3)' }} />
                      Feature Drop Spotlight
                    </h3>
                    <div>
                      <label className="block text-xs font-mono uppercase text-ink-2 tracking-wider mb-2">Spotlight Core Title</label>
                      <input
                        type="text"
                        value={gHeadline}
                        onChange={(e) => setGHeadline(e.target.value)}
                        className="w-full bg-bg border border-line-soft rounded-2xl px-4 py-2.5 text-sm text-ink focus:outline-none focus:border-brand-1 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono uppercase text-ink-2 tracking-wider mb-2">Feature Presets</label>
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
                            className="px-3 py-2 rounded-xl bg-bg border border-line-soft text-[10px] font-mono hover:border-brand-1 transition-all text-neutral-400 text-left"
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
                    <h3 className="text-base font-display font-bold text-ink border-b border-line-soft pb-3 flex items-center gap-2">
                      <CalendarIcon className="w-4 h-4" style={{ color: 'var(--brand-2)' }} />
                      Beta Countdown Settings
                    </h3>
                    <div>
                      <label className="block text-xs font-mono uppercase text-ink-2 tracking-wider mb-2">Target Beta Launch Date</label>
                      <input
                        type="date"
                        value={gCountdownTarget}
                        onChange={(e) => setGCountdownTarget(e.target.value)}
                        className="w-full bg-bg border border-line-soft rounded-2xl px-4 py-2.5 text-sm text-ink focus:outline-none focus:border-brand-1 transition-all font-mono"
                      />
                    </div>
                  </>
                )}

                {/* Subtext description editor (common for Milestone & Feature) */}
                {graphicType !== "countdown" && (
                  <div>
                    <label className="block text-xs font-mono uppercase text-ink-2 tracking-wider mb-2">Description Subtext</label>
                    <textarea
                      value={gSubtext}
                      onChange={(e) => setGSubtext(e.target.value)}
                      rows={3}
                      className="w-full bg-bg border border-line-soft rounded-2xl px-4 py-2.5 text-sm text-ink focus:outline-none focus:border-brand-1 transition-all resize-none"
                    />
                  </div>
                )}

                {/* Proactive strategic data triggers */}
                <div className="p-4 bg-bg border border-line-soft rounded-2xl font-mono text-[10px] text-ink-3 space-y-1.5">
                  <p className="font-bold text-brand-1">PROACTIVE FLEX PRESETS:</p>
                  <button
                    onClick={() => {
                      setGraphicType("milestone");
                      setGMilestoneStat("68%");
                      setGMilestoneTitle("PAYMENT DELAYS");
                      setGSubtext("68% of performers report payment delays of 30+ days in the industry. We cure this on Artistant.");
                    }}
                    className="block text-left underline hover:text-ink transition-colors"
                  >
                    Load Stat: "68% Payment Delays..."
                  </button>
                  <button
                    onClick={() => {
                      setGraphicType("feature");
                      setGHeadline("REPLACEMENT ASSURED");
                      setGSubtext("Organizers book with absolute safety. Equivalent standby performers dispatched automatically on cancellations.");
                    }}
                    className="block text-left underline hover:text-ink transition-colors"
                  >
                    Load Spotlight: "Replacement Backup..."
                  </button>
                </div>

                <div className="flex gap-4 pt-2">
                  <button
                    onClick={handleDownloadUnified}
                    className="flex-grow py-3 rounded-full text-[11px] font-mono font-bold tracking-[0.06em] uppercase flex items-center justify-center gap-2 transition-all"
                    style={{
                      background: 'linear-gradient(135deg, #F25A2B, #7C5CFF)',
                      color: 'white',
                      boxShadow: '0 4px 16px -4px rgba(242,90,43,0.4)',
                    }}
                  >
                    <Download className="w-4 h-4" />
                    Download PNG
                  </button>
                  <button
                    onClick={() => {
                      showToast("Proactive: Unified content pushed directly to launch story queue!");
                    }}
                    className="px-4 py-3 rounded-full flex items-center justify-center hover:text-ink transition-all text-ink-3"
                    style={{ background: 'var(--bg-2)', border: '1px solid rgba(255,255,255,0.04)' }}
                    title="Push directly to Instagram/LinkedIn Queue"
                  >
                    <ArrowUpRight className="w-4 h-4" />
                  </button>
                </div>

              </div>

            </div>

            {/* Right Graphics Preview Pane */}
            <div className="lg:col-span-7 space-y-4">
              <div className="bg-bg-soft border border-line-soft p-8 rounded-[28px] flex flex-col items-center">
                <div className="w-full flex justify-between items-center mb-5">
                  <span className="text-[10px] font-mono font-semibold uppercase tracking-[0.12em]" style={{ color: 'var(--brand-1)' }}>Graphics preview canvas pane</span>
                  <span className="text-xs font-mono text-ink-3">
                    {canvasLayout === "square" ? "1080 x 1080 (Square)" : "1080 x 1920 (Portrait 9:16)"}
                  </span>
                </div>

                <div className="w-full bg-bg border border-line-soft p-4 rounded-2xl flex items-center justify-center overflow-auto shadow-inner relative" style={{ minHeight: '350px' }}>
                  <canvas 
                    ref={canvasRef} 
                    className="h-auto border border-line-soft shadow-2xl rounded-2xl max-w-[280px] sm:max-w-[320px] md:max-w-[380px] lg:max-w-[400px]"
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
            <div className="bg-bg-soft border border-line-soft p-8 rounded-[28px] flex items-center gap-4">
              <div className="w-12 h-12 rounded-[16px] flex items-center justify-center flex-shrink-0 bg-bg-card border border-line-soft shadow-sm">
                <CalendarIcon className="w-5 h-5 text-brand" />
              </div>
              <div>
                <h3 className="font-display font-bold text-ink text-lg uppercase tracking-tight">Launch Post Schedule</h3>
                <p className="text-[11px] font-mono font-semibold tracking-[0.12em] uppercase mt-0.5" style={{ color: 'var(--brand-1)' }}>Draft, preview and queue social graphics</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {SOCIAL_CALENDAR.map((post, idx) => (
                <GlowingAdminCard 
                  key={post.id} 
                  idx={idx}
                  className="bg-bg-soft border border-line-soft rounded-[28px] p-8 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex justify-between items-center mb-5">
                      <span className="text-[10px] font-mono font-bold text-ink-3 flex items-center gap-1.5 uppercase tracking-[0.08em]">
                        <CalendarIcon className="w-3.5 h-3.5" />
                        {post.date} @ {post.time}
                      </span>
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-[0.08em]" style={{
                        background: 'var(--bg-2)',
                        color: 'var(--brand-1)',
                        border: '1px solid rgba(255,255,255,0.04)',
                      }}>
                        {post.platform}
                      </span>
                    </div>

                    <h4 className="text-base font-display font-bold text-ink uppercase tracking-tight mb-3">
                      {post.title}
                    </h4>

                    <p className="text-xs text-ink-2 leading-relaxed mb-6 italic bg-bg p-4 rounded-2xl border border-line-soft line-clamp-3">
                      {post.caption}
                    </p>
                  </div>

                  <div className="flex gap-2 mt-4 pt-4 border-t border-line-soft">
                    <button
                      onClick={() => handleApplyPreset(post)}
                      className="flex-1 py-2.5 rounded-full text-[11px] font-mono font-bold tracking-[0.06em] uppercase flex items-center justify-center gap-2 transition-all"
                      style={{
                        background: 'linear-gradient(135deg, #F25A2B, #7C5CFF)',
                        color: 'white',
                        border: 'none',
                        boxShadow: '0 4px 12px -4px rgba(242,90,43,0.3)',
                      }}
                    >
                      <ImageIcon className="w-3.5 h-3.5" />
                      Load Preset
                    </button>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(post.caption);
                        showToast("Caption copied!");
                      }}
                      className="px-4 py-2.5 rounded-full text-[11px] font-mono font-bold tracking-[0.06em] uppercase transition-all"
                      style={{ background: 'var(--bg-2)', border: '1px solid rgba(255,255,255,0.04)' }}
                    >
                      Copy
                    </button>
                  </div>
                </GlowingAdminCard>
              ))}
              
              {/* Custom Scheduler slot */}
              <div 
                className="border-2 border-dashed border-line-soft hover:border-brand-1 rounded-[28px] p-8 flex flex-col justify-center items-center gap-4 text-center cursor-pointer min-h-[280px] transition-all bg-bg-soft/25"
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background = 'var(--bg-soft)';
                  (e.currentTarget as HTMLElement).style.borderColor = 'var(--brand-1)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background = 'var(--bg-soft)/25';
                  (e.currentTarget as HTMLElement).style.borderColor = '';
                }}
              >
                <div className="w-12 h-12 rounded-full bg-bg flex items-center justify-center border border-line-soft">
                  <Plus className="w-5 h-5 text-ink-3" />
                </div>
                <div>
                  <span className="font-display font-bold text-sm text-ink uppercase tracking-tight block">Add Custom Task</span>
                  <span className="text-[11px] text-ink-3 max-w-[200px] mt-1.5 block leading-normal">Draft future drops and countdown releases.</span>
                </div>
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
              <div className="bg-bg-soft border border-line-soft p-8 rounded-[28px] space-y-6">
                <div className="flex items-center gap-4 border-b border-line-soft pb-5">
                  <div className="w-12 h-12 rounded-[16px] flex items-center justify-center flex-shrink-0 bg-bg-card border border-line-soft shadow-sm">
                    <Mail className="w-5 h-5 text-brand" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-ink text-lg uppercase tracking-tight">Campaign Composer</h3>
                    <p className="text-[11px] font-mono font-semibold tracking-[0.12em] uppercase mt-0.5" style={{ color: 'var(--brand-1)' }}>Draft and broadcast mailers</p>
                  </div>
                </div>

                {/* Sender Alias Selection */}
                <div>
                  <label className="block text-[10px] font-mono font-semibold uppercase text-ink-3 tracking-[0.12em] mb-2.5">Sender Alias</label>
                  <select
                    value={emailAlias}
                    onChange={(e) => setEmailAlias(e.target.value)}
                    className="w-full bg-bg border border-line-soft rounded-2xl px-4 py-3 text-sm text-ink focus:outline-none focus:border-brand-1 transition-all cursor-pointer"
                  >
                    <option value="official">ArtisTant Official (info@artistant.in)</option>
                    <option value="support">ArtisTant Support (support@artistant.in)</option>
                    <option value="founder">ArtisTant Founder (founder@artistant.in)</option>
                  </select>
                </div>

                {/* Email Subject */}
                <div>
                  <label className="block text-[10px] font-mono font-semibold uppercase text-ink-3 tracking-[0.12em] mb-2.5">Campaign Subject</label>
                  <input
                    type="text"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    className="w-full bg-bg border border-line-soft rounded-2xl px-4 py-3 text-sm text-ink focus:outline-none focus:border-brand-1 transition-all"
                  />
                </div>

                {/* Email Header banner line */}
                <div>
                  <label className="block text-[10px] font-mono font-semibold uppercase text-ink-3 tracking-[0.12em] mb-2.5">Email Header Greeting</label>
                  <input
                    type="text"
                    value={emailHeader}
                    onChange={(e) => setEmailHeader(e.target.value)}
                    className="w-full bg-bg border border-line-soft rounded-2xl px-4 py-3 text-sm text-ink focus:outline-none focus:border-brand-1 transition-all"
                  />
                </div>

                {/* Email Body text */}
                <div>
                  <label className="block text-[10px] font-mono font-semibold uppercase text-ink-3 tracking-[0.12em] mb-2.5">Message Body Copy (HTML supported)</label>
                  <textarea
                    value={emailBody}
                    onChange={(e) => setEmailBody(e.target.value)}
                    rows={6}
                    className="w-full bg-bg border border-line-soft rounded-2xl px-4 py-3.5 text-sm text-ink focus:outline-none focus:border-brand-1 transition-all resize-none"
                  />
                </div>

                {/* Call To Action Buttons configs */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-mono font-semibold uppercase text-ink-3 tracking-[0.12em] mb-2.5">CTA Link Text</label>
                    <input
                      type="text"
                      value={emailCtaText}
                      onChange={(e) => setEmailCtaText(e.target.value)}
                      className="w-full bg-bg border border-line-soft rounded-2xl px-4 py-3 text-sm text-ink focus:outline-none focus:border-brand-1 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono font-semibold uppercase text-ink-3 tracking-[0.12em] mb-2.5">CTA Destination URL</label>
                    <input
                      type="text"
                      value={emailCtaUrl}
                      onChange={(e) => setEmailCtaUrl(e.target.value)}
                      className="w-full bg-bg border border-line-soft rounded-2xl px-4 py-3 text-sm text-ink focus:outline-none focus:border-brand-1 transition-all font-mono"
                    />
                  </div>
                </div>

                {/* Sending stats readout */}
                <div className="p-5 bg-bg border border-line-soft rounded-[20px] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-ink-3 block uppercase tracking-[0.08em]">Active Targets List</span>
                    <span className="text-base font-bold text-ink mt-0.5 block">{getSelectedRecipientsList().filter(r=>!r.is_blocked).length} users ready</span>
                  </div>
                  <button
                    onClick={handleSendEmailBroadcast}
                    disabled={emailSending}
                    className="w-full sm:w-auto py-3 px-6 rounded-full text-[11px] font-mono font-bold tracking-[0.06em] uppercase flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                    style={{
                      background: 'linear-gradient(135deg, #F25A2B, #7C5CFF)',
                      color: 'white',
                      boxShadow: '0 4px 16px -4px rgba(242,90,43,0.4)',
                    }}
                  >
                    {emailSending ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    Launch Broadcast
                  </button>
                </div>
              </div>
            </div>

            {/* Right Email Preview frame & execution log terminal */}
            <div className="lg:col-span-6 space-y-6">
              
              {/* Interactive preview display */}
              <div className="bg-bg-soft border border-line-soft p-8 rounded-[28px] space-y-5">
                <div className="flex justify-between items-center border-b border-line-soft pb-4">
                  <span className="text-[10px] font-mono font-semibold uppercase tracking-[0.12em]" style={{ color: 'var(--brand-1)' }}>Email client live preview</span>
                  <div className="flex rounded-full p-0.5" style={{ background: 'var(--bg-2)', border: '1px solid rgba(255,255,255,0.04)' }}>
                    <button
                      onClick={() => setEmailPreviewMode("mobile")}
                      className="p-2 rounded-full transition-all text-ink-3 hover:text-ink"
                      style={emailPreviewMode === "mobile" ? { background: 'var(--bg-card)', color: 'var(--brand-1)' } : {}}
                      title="Mobile View"
                    >
                      <Smartphone className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setEmailPreviewMode("desktop")}
                      className="p-2 rounded-full transition-all text-ink-3 hover:text-ink"
                      style={emailPreviewMode === "desktop" ? { background: 'var(--bg-card)', color: 'var(--brand-1)' } : {}}
                      title="Desktop View"
                    >
                      <Monitor className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Email template frame wrapper strictly matching brand HTML welcome style */}
                <div className="flex justify-center bg-bg border border-line-soft p-4 rounded-[20px] overflow-y-auto max-h-[500px]">
                  <div 
                    className={`bg-[#0B1120] text-ink text-left p-6 border rounded-xl relative ${
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
                      <span className="font-bold text-lg tracking-widest text-ink font-display">ARTISTANT</span>
                    </div>

                    <div className="p-px bg-line-soft rounded-xl">
                      <div className="bg-[#0B1120] p-5 rounded-lg space-y-4">
                        <p className="text-ink font-bold text-sm">Hey username,</p>
                        
                        <p className="font-bold text-xs uppercase tracking-wider" style={{ color: 'var(--brand-1)' }}>{emailHeader}</p>
                        
                        <p 
                          className="text-[#9BA4B8] text-xs leading-relaxed whitespace-pre-wrap"
                          dangerouslySetInnerHTML={{ __html: emailBody }}
                        />

                        {emailCtaText && (
                          <div className="pt-2 text-center">
                            <a 
                              href={emailCtaUrl} 
                              target="_blank" 
                              className="inline-block px-5 py-2.5 text-white font-bold text-xs rounded-full transition-all bg-brand"
                              style={{ 
                                textDecoration: 'none'
                              }}
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
                <div className="bg-bg-soft border border-line-soft rounded-[28px] overflow-hidden shadow-2xl animate-slide-up">
                  <div className="bg-bg px-6 py-4 border-b border-line-soft flex justify-between items-center">
                    <span className="text-[10px] font-mono font-bold text-ink-3 flex items-center gap-1.5 uppercase tracking-[0.08em]">
                      <div className={`w-2 h-2 rounded-full ${emailSending ? "bg-amber-500 animate-ping" : "bg-[#22C55E]"}`} />
                      Execution Broadcast Terminal
                    </span>
                    <button 
                      onClick={() => setShowLogTerminal(false)}
                      className="text-ink-3 hover:text-ink text-xs font-mono uppercase tracking-[0.06em] font-bold"
                    >
                      Close
                    </button>
                  </div>
                  <pre className="p-6 max-h-48 overflow-y-auto text-[10px] font-mono text-ink-2 space-y-1.5 bg-bg text-left">
                    {emailLogs.length === 0 ? (
                      <span className="text-ink-3 italic">No execution logs active.</span>
                    ) : (
                      emailLogs.map((logStr, i) => (
                        <div key={i} className={logStr.includes("FAILED") ? "text-hot" : logStr.includes("SUCCESS") ? "text-brand-3" : ""}>
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

              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
}
