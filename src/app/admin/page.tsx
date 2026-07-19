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
import { useTheme } from "next-themes";
import { signInWithGoogle, signInWithEmail, signOut as firebaseSignOut } from "@/lib/auth";
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
  Cpu,
  Award, 
  AlertCircle,
  Copy,
  ChevronRight,
  ChevronDown,
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
  Activity,
  MapPin,
  User,
  UserMinus,
  ExternalLink,
  Shield,
  Zap,
  Sun,
  Moon
} from "lucide-react";

// ---------------------------------------------------------------------------
// Sandbox Mock Data fallback
// ---------------------------------------------------------------------------
const []: AdminWaitlistEntry[] = [
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

const []: any[] = [
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

const []: any[] = [
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
  const { theme: resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);
  
  // Helper to get the current user's Firebase ID token for server action auth
  const getIdToken = async (): Promise<string> => {
    if (!user) throw new Error('Not authenticated');
    return user.getIdToken();
  };

  const [isUnlocked, setIsUnlocked] = useState(false);
  const [authError, setAuthError] = useState("");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [isLiveMode, setIsLiveMode] = useState(false);
  const [registrations, setRegistrations] = useState<AdminWaitlistEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);
  
  // Visitor Activities and Admin List States
  const [activityLogs, setActivityLogs] = useState<any[]>([]);
  const [adminUsers, setAdminUsers] = useState<any[]>([]);
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [activityFilter, setActivityFilter] = useState("all");
  const [activitySearch, setActivitySearch] = useState("");
  
  // Tabs: registrations | leaderboards | members | admins
  const [activeTab, setActiveTab] = useState<"registrations" | "leaderboards" | "members" | "admins">("registrations");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedReg, setSelectedReg] = useState<AdminWaitlistEntry | null>(null);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [showEmailComposer, setShowEmailComposer] = useState(false);

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
        const idToken = await getIdToken();
        const isAuth = await checkIsAdminAction(idToken);
        setIsAdmin(isAuth);
        if (isAuth && !isUnlocked && !isLoading) { await verifyAndLoad(); }
      } catch (e) {
        console.error("Error verifying admin access: [REDACTED_ERROR]");
        setIsAdmin(false);
      } finally {
        setCheckingAdmin(false);
      }
    };
    
    checkAccess();
  }, [user, authLoading, isUnlocked]);



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
      verifyAndLoad(true);
    }, 10000);

    return () => clearInterval(interval);
  }, [isUnlocked, isAdmin, isLiveMode]);

  // ---------------------------------------------------------------------------
  // API Fetch & Authentication
  // ---------------------------------------------------------------------------
  const verifyAndLoad = async (isSilent = false) => {
    if (!isSilent) setIsLoading(true);
    setAuthError("");
    setDbError(null);
    try {
      const idToken = await getIdToken();
      const [regs, logs, admins] = await Promise.all([
        adminGetRegistrationsAction(idToken),
        adminGetActivityLogsAction(idToken),
        adminGetAdminsAction(idToken)
      ]);
      setRegistrations(regs);
      setActivityLogs(logs);
      setAdminUsers(admins);
      setIsLiveMode(true);
      setIsUnlocked(true);
      if (!isSilent) showToast("Connected to Live Database.");
    } catch (err: any) {
      console.warn("Supabase fetch failed. Falling back to Sandbox LocalStorage / Mock Data.", err);
      if (err.message?.includes("Unauthorized") || err.code === "PGRST301") {
        setAuthError("Authorization failed. You may not have admin access.");
        setIsUnlocked(false);
      } else {
        // Fallback Sandbox
        const sandboxRegs = localStorage.getItem("artistant_sandbox_registrations");
        setRegistrations(sandboxRegs ? JSON.parse(sandboxRegs) : []);
        
        const sandboxLogs = localStorage.getItem("artistant_sandbox_logs");
        setActivityLogs(sandboxLogs ? JSON.parse(sandboxLogs) : []);
        
        const sandboxAdmins = localStorage.getItem("artistant_sandbox_admins");
        setAdminUsers(sandboxAdmins ? JSON.parse(sandboxAdmins) : []);
        
        setIsLiveMode(false);
        setIsUnlocked(true);
      }
    } finally {
      if (!isSilent) setIsLoading(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSigningIn) return;
    setIsSigningIn(true);
    setAuthError("");
    try {
      await signInWithGoogle();
    } catch (err) {
      console.error("[REDACTED_ERROR] PII stripped from client log.");
      setAuthError("Failed to sign in with Google.");
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleEmailLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) return;
    if (isSigningIn) return;
    setIsSigningIn(true);
    setAuthError("");
    try {
      await signInWithEmail(loginEmail, loginPassword);
    } catch (err: any) {
      console.error("Email sign in error:", err);
      setAuthError(err.message || "Failed to sign in with email.");
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      await firebaseSignOut();
      setIsUnlocked(false);
      setIsAdmin(false);
      setAuthError("");
    } catch (err) {
      console.error("[REDACTED_ERROR] PII stripped from client log.");
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
        const idToken = await getIdToken();
        await adminAddAdminAction(idToken, targetEmail, user?.email || "system");
        const admins = await adminGetAdminsAction(idToken);
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
      console.error("[REDACTED_ERROR] PII stripped from client log.");
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
        const idToken = await getIdToken();
        await adminRemoveAdminAction(idToken, normalised);
        const admins = await adminGetAdminsAction(idToken);
        setAdminUsers(admins);
      } else {
        const updated = adminUsers.filter(a => a.email.toLowerCase() !== normalised);
        setAdminUsers(updated);
        localStorage.setItem("artistant_sandbox_admins", JSON.stringify(updated));
      }
      showToast(`Admin ${normalised} access revoked.`);
    } catch (err: any) {
      console.error("[REDACTED_ERROR] PII stripped from client log.");
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
    if (selectedReg && selectedReg.user_id === reg.user_id) {
      setSelectedReg(prev => prev ? { ...prev, is_verified: nextState } : null);
    }

    try {
      if (isLiveMode) {
        const idToken = await getIdToken();
        await adminUpdateRegistrationAction(
          idToken, 
          reg.user_id, 
          nextState, 
          reg.is_blocked, 
          reg.position_override, 
          reg.feature_founding_card ?? false,
          reg.exclude_from_waitlist ?? false
        );
        if (nextState) {
          showToast(`User Verified. Verification Email Dispatched to @${reg.username}!`);
        } else {
          showToast(`Verification revoked for @${reg.username}`);
        }
      } else {
        localStorage.setItem("artistant_sandbox_registrations", JSON.stringify(updated));
        showToast(`Sandbox: @${reg.username} verification updated!`);
      }
    } catch (err) {
      console.error("[REDACTED_ERROR] PII stripped from client log.");
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
    if (selectedReg && selectedReg.user_id === reg.user_id) {
      setSelectedReg(prev => prev ? { ...prev, is_blocked: nextState } : null);
    }

    try {
      if (isLiveMode) {
        const idToken = await getIdToken();
        await adminUpdateRegistrationAction(
          idToken, 
          reg.user_id, 
          reg.is_verified, 
          nextState, 
          reg.position_override, 
          reg.feature_founding_card ?? false,
          reg.exclude_from_waitlist ?? false
        );
        showToast(`User @${reg.username} block status toggled!`);
      } else {
        localStorage.setItem("artistant_sandbox_registrations", JSON.stringify(updated));
        showToast(`Sandbox: @${reg.username} block state updated!`);
      }
    } catch (err) {
      console.error("[REDACTED_ERROR] PII stripped from client log.");
      showToast("Error saving block status.");
    }
  };

  const handleToggleFoundingCard = async (reg: AdminWaitlistEntry) => {
    const nextState = !reg.feature_founding_card;
    const updated = registrations.map(r => {
      if (r.user_id === reg.user_id) return { ...r, feature_founding_card: nextState };
      return r;
    });
    setRegistrations(updated);
    if (selectedReg && selectedReg.user_id === reg.user_id) {
      setSelectedReg(prev => prev ? { ...prev, feature_founding_card: nextState } : null);
    }

    try {
      if (isLiveMode) {
        const idToken = await getIdToken();
        await adminUpdateRegistrationAction(
          idToken, 
          reg.user_id, 
          reg.is_verified, 
          reg.is_blocked, 
          reg.position_override, 
          nextState,
          reg.exclude_from_waitlist ?? false
        );
        showToast(nextState ? `Featured @${reg.username} as Founding Card!` : `Unfeatured @${reg.username} as Founding Card.`);
      } else {
        localStorage.setItem("artistant_sandbox_registrations", JSON.stringify(updated));
        showToast(`Sandbox: @${reg.username} founding card toggled!`);
      }
    } catch (err) {
      console.error("[REDACTED_ERROR] PII stripped from client log.");
      showToast("Error saving founding card status.");
    }
  };

  const handleToggleExcludeFromWaitlist = async (reg: AdminWaitlistEntry) => {
    const nextState = !reg.exclude_from_waitlist;
    const updated = registrations.map(r => {
      if (r.user_id === reg.user_id) return { ...r, exclude_from_waitlist: nextState };
      return r;
    });
    setRegistrations(updated);
    if (selectedReg && selectedReg.user_id === reg.user_id) {
      setSelectedReg(prev => prev ? { ...prev, exclude_from_waitlist: nextState } : null);
    }

    try {
      if (isLiveMode) {
        const idToken = await getIdToken();
        await adminUpdateRegistrationAction(
          idToken, 
          reg.user_id, 
          reg.is_verified, 
          reg.is_blocked, 
          reg.position_override, 
          reg.feature_founding_card ?? false,
          nextState
        );
        showToast(nextState ? `Excluded @${reg.username} from waitlist rank.` : `Restored waitlist rank for @${reg.username}.`);
      } else {
        localStorage.setItem("artistant_sandbox_registrations", JSON.stringify(updated));
        showToast(`Sandbox: @${reg.username} rank exclusion toggled!`);
      }
    } catch (err) {
      console.error("[REDACTED_ERROR] PII stripped from client log.");
      showToast("Error saving waitlist exclusion status.");
    }
  };

  const handleSavePositionOverride = async (userId: string, val: number | null) => {
    const updated = registrations.map(r => {
      if (r.user_id === userId) return { ...r, position_override: val };
      return r;
    });
    setRegistrations(updated);
    if (selectedReg && selectedReg.user_id === userId) {
      setSelectedReg(prev => prev ? { ...prev, position_override: val } : null);
    }

    try {
      const reg = registrations.find(r => r.user_id === userId);
      if (reg) {
        if (isLiveMode) {
          const idToken = await getIdToken();
          await adminUpdateRegistrationAction(
            idToken, 
            userId, 
            reg.is_verified, 
            reg.is_blocked, 
            val, 
            reg.feature_founding_card ?? false,
            reg.exclude_from_waitlist ?? false
          );
          showToast(`Priority Override set to position ${val ?? "Auto"}!`);
        } else {
          localStorage.setItem("artistant_sandbox_registrations", JSON.stringify(updated));
          showToast(`Sandbox: Override saved.`);
        }
      }
    } catch (err) {
      console.error("[REDACTED_ERROR] PII stripped from client log.");
      showToast("Failed to save priority override.");
    }
  };

  const handleToggleDbMode = () => {
    if (isLiveMode) {
      const sandboxRegs = localStorage.getItem("artistant_sandbox_registrations");
      setRegistrations(sandboxRegs ? JSON.parse(sandboxRegs) : []);
      
      const sandboxLogs = localStorage.getItem("artistant_sandbox_logs");
      setActivityLogs(sandboxLogs ? JSON.parse(sandboxLogs) : []);
      
      const sandboxAdmins = localStorage.getItem("artistant_sandbox_admins");
      setAdminUsers(sandboxAdmins ? JSON.parse(sandboxAdmins) : []);
      
      setIsLiveMode(false);
      setDbError("Switched manually to Sandbox Environment.");
      showToast("Switched to Sandbox Mode");
    } else {
      verifyAndLoad();
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
          const idToken = await getIdToken();
          await adminUpdateRegistrationAction(
            idToken, 
            reg.user_id, 
            true, 
            reg.is_blocked, 
            reg.position_override,
            reg.feature_founding_card ?? false,
            reg.exclude_from_waitlist ?? false
          );
        }
        
        const idx = updated.findIndex(u => u.user_id === reg.user_id);
        if (idx !== -1) {
          updated[idx] = { ...updated[idx], is_verified: true };
        }
        count++;
      } catch (err) {
        console.error("Heuristics failure for @" + reg.username, "[REDACTED_ERROR]");
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
  // Email Dispatch Campaign Builder
  // ---------------------------------------------------------------------------
  const getSelectedRecipientsList = () => {
    if (selectedUserIds.length > 0) {
      return registrations.filter(r => selectedUserIds.includes(r.id));
    }
    if (roleFilter === "all" && statusFilter === "all" && !searchQuery) {
      return registrations;
    }
    return filteredRegistrations;
  };

  const loadMigrationCampaignPreset = () => {
    // Migrated artists are those where user_id starts with 'imported_' and role is artist
    const migrated = registrations.filter(r => r.user_id?.startsWith('imported_') && r.role === 'artist');
    if (migrated.length === 0) {
      showToast("No pending migrated artists found (all profiles claimed or none imported).");
      return;
    }

    setSelectedUserIds(migrated.map(r => r.id));
    setEmailSubject("You're First in Line: Claim Your ArtisTant Username! 🚀");
    setEmailHeader("Founding Artist Exclusive Onboarding");
    setEmailBody(
      "As one of our founding artists on the previous waitlist, we wanted to ensure you get VIP treatment.<br><br>" +
      "You are officially <strong>first in line</strong> for our new exclusive waitlist! We've automatically migrated your profile. Now it's time to secure your unique <strong>@username</strong> before the platform opens to the public.<br><br>" +
      "Here are the three main pillars of the ArtisTant ecosystem you'll soon experience:<br><br>" +
      "1. <strong>The Bookability Score™</strong>: A 0–100 rating built from real outcomes on the platform. A credit score for reliability, not vibes.<br><br>" +
      "2. <strong>GigSafe Escrow</strong>: Clients pay upfront into secure escrow. Money is released to you automatically T+1 after the show ends.<br><br>" +
      "3. <strong>Prices, In Public</strong>: No \"DM for price.\" Publish packaged pricing, keep your calendar live, and let bookings happen in minutes.<br><br>" +
      "Plus, you'll get access to these core features:<br><br>" +
      "• <strong>Your Free Portfolio Website</strong>: Your professional booking identity, housing showreels, riders, and contact parameters.<br>" +
      "• <strong>Live Calendar & Availability</strong>: Automated calendar management. Clients see open dates instantly.<br>" +
      "• <strong>Direct 1-on-1 Booking Engine</strong>: 100% direct client-to-artist workflow. No agents, no broker cuts.<br><br>" +
      "Click the button below to head to the platform, authenticate, and officially claim your handle!"
    );
    setEmailCtaText("Claim My Username");
    setEmailCtaUrl("https://artistant.in/claim");
    setEmailAlias("official");
    showToast(`Preset Loaded! Selected ${migrated.length} migrated artist(s).`);
  };

  const handleSendEmailBroadcast = async () => {
    const targets = getSelectedRecipientsList().filter(r => !r.is_blocked);
    if (targets.length === 0) {
      showToast("No eligible recipients found.");
      return;
    }

    const recipientEmails = targets.map(t => ({
      email: t.email,
      name: t.display_name || t.username,
      username: t.username || 'artist',
      id: t.id
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
      const idToken = await getIdToken();
      const res = await sendMassEmailAction({
        idToken,
        recipients: recipientEmails,
        subject: emailSubject,
        messageBody: emailBody,
        ctaText: emailCtaText,
        ctaUrl: emailCtaUrl,
        senderAlias: emailAlias,
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
  const portfolioCompleteCount = registrations.filter(r => r.profile_photo_url || r.bio || (r.gallery_photos && r.gallery_photos.length > 0) || r.instagram_url || r.spotify_url || r.youtube_url).length;

  // ---------------------------------------------------------------------------
  // Render Security Access screen
  // ---------------------------------------------------------------------------
  if (!isUnlocked) {
    return (
      <div className="min-h-screen bg-[#07070a] text-white flex flex-col justify-center items-center px-4 relative overflow-hidden">
        {/* Cinematic Backdrop with soft glowing orbs */}
        <div className="absolute inset-0 pointer-events-none z-0">
          <div className="absolute inset-0" style={{
            background: `
              radial-gradient(ellipse 80% 50% at 50% -10%, rgba(124,92,255,0.18), transparent 70%),
              radial-gradient(ellipse 60% 40% at 20% 80%, rgba(242,90,43,0.1), transparent 60%),
              radial-gradient(ellipse 50% 50% at 80% 90%, rgba(212,86,122,0.08), transparent 60%)
            `
          }} />
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
            maskImage: 'radial-gradient(ellipse 60% 60% at 50% 50%, black, transparent 80%)',
            WebkitMaskImage: 'radial-gradient(ellipse 60% 60% at 50% 50%, black, transparent 80%)',
          }} />
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 30, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 w-full max-w-sm md:max-w-4xl mx-4 rounded-3xl md:rounded-[2.4rem] shadow-[0_30px_100px_-15px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col md:flex-row border border-white/5 bg-[#0f0f15]/85 backdrop-blur-2xl"
        >
          {/* Left Column (Brand / Visual Showcase) */}
          <div className="hidden md:flex flex-col justify-between w-1/2 p-12 relative overflow-hidden bg-black/40 border-r border-white/5">
            {/* Ambient glows inside left column */}
            <div className="absolute -top-[20%] -left-[20%] w-[120%] h-[120%] opacity-20 bg-[radial-gradient(circle_at_top_left,rgba(242,90,43,0.4),transparent_50%)] pointer-events-none" />
            <div className="absolute -bottom-[20%] -right-[20%] w-[120%] h-[120%] opacity-25 bg-[radial-gradient(circle_at_bottom_right,rgba(124,92,255,0.4),transparent_50%)] pointer-events-none" />
            
            {/* Giant Graphic Watermark */}
            <img 
              src="/logo_a.png" 
              alt="" 
              className="absolute -bottom-[10%] -left-[10%] h-[100%] w-auto max-w-none opacity-40 pointer-events-none z-0 select-none"
            />

            <div className="relative z-10 mt-auto">
              <span className="text-[10px] font-mono font-bold tracking-[0.25em] text-[#7C5CFF] uppercase block mb-3">Restricted Area</span>
              <h3 className="font-display text-4xl font-bold text-white leading-tight mb-4 tracking-tight">
                Admin Portal
              </h3>
              <p className="text-white/50 text-sm leading-relaxed font-medium">
                Access to this dashboard is restricted to authorized personnel only. Please sign in to verify your credentials.
              </p>
            </div>
          </div>

          {/* Right Column (Auth Action Panel) */}
          <div className="w-full md:w-1/2 p-10 sm:p-14 relative flex flex-col justify-center min-h-[520px]">
            <div className="text-center mb-8">
              <h2 className="font-display text-3xl font-bold text-white tracking-tight">
                Sign In
              </h2>
              <p className="text-xs text-white/40 font-mono uppercase tracking-wider mt-1.5">Verify Administrator Account</p>
            </div>

            <div className="space-y-6 relative z-10">
              {authLoading || checkingAdmin ? (
                <div className="flex flex-col items-center justify-center py-10 gap-3">
                  <div className="relative w-10 h-10 flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full border border-[#7C5CFF]/15" />
                    <div className="absolute inset-0 rounded-full border border-transparent border-t-[#7C5CFF] animate-spin" />
                    <div className="w-2 h-2 rounded-full bg-[#7C5CFF] animate-ping" />
                  </div>
                  <span className="text-[9px] font-mono font-bold text-zinc-500 uppercase tracking-widest mt-2">Verifying Credentials</span>
                </div>
              ) : user ? (
                !isAdmin ? (
                  <div className="text-center space-y-6">
                    <div className="flex flex-col items-center gap-3 text-sm font-mono bg-hot/5 border border-hot/15 p-6 rounded-2xl text-hot">
                      <ShieldAlert className="w-8 h-8 shrink-0 mb-1" />
                      <span className="font-bold tracking-tight text-base">Access Denied</span>
                      <span className="text-xs text-white/60 leading-relaxed">Your account is not registered as an administrator. Please contact support if you believe this is an error.</span>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="text-xs text-white/50 hover:text-[#FF4B4B] underline underline-offset-4 transition-colors cursor-pointer"
                    >
                      Sign out of {user.email}
                    </button>
                  </div>
                ) : !isUnlocked ? (
                  <div className="text-center space-y-6">
                    <div className="flex flex-col items-center justify-center gap-4 text-sm font-mono bg-white/[0.02] border border-white/5 p-6 rounded-[24px]">
                      <Lock className="w-6 h-6 text-[#7C5CFF] shrink-0 mb-1 animate-pulse" />
                      <span className="text-white/70 text-xs">Credentials verified. Access authorized.</span>
                      <button 
                        onClick={() => verifyAndLoad()}
                        disabled={isLoading}
                        className="w-full mt-2 bg-gradient-to-r from-[#F25A2B] to-[#7C5CFF] text-white font-bold py-4 rounded-xl disabled:opacity-50 hover:opacity-95 active:scale-[0.99] transition-all cursor-pointer text-sm shadow-[0_4px_20px_-5px_rgba(124,92,255,0.4)]"
                      >
                        {isLoading ? 'Loading...' : 'Enter Dashboard'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-center items-center py-8 text-sm font-mono animate-pulse text-[#7C5CFF] tracking-wider">
                    Redirecting to Dashboard...
                  </div>
                )
              ) : (
                <div className="space-y-4">
                  {/* Google Login Option */}
                  <button
                    onClick={handleLoginSubmit}
                    disabled={isLoading || authLoading || isSigningIn}
                    className="relative flex items-center justify-center w-full py-4 px-5 rounded-2xl bg-white/[0.03] border border-white/10 text-white font-semibold text-sm hover:bg-white/[0.08] hover:border-white/20 active:scale-[0.99] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-sm"
                  >
                    {isSigningIn ? (
                      <span className="animate-spin h-5 w-5 border-2 border-white/40 border-t-white rounded-full mr-3" />
                    ) : (
                      <svg className="w-5 h-5 mr-3 shrink-0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                      </svg>
                    )}
                    Continue with Google
                  </button>

                  {/* Apple Login Option */}
                  <button
                    type="button"
                    disabled
                    className="relative flex items-center justify-center w-full py-4 px-5 rounded-2xl bg-white border border-white/10 text-black font-semibold text-sm opacity-35 cursor-not-allowed select-none"
                  >
                    <svg className="w-5 h-5 mr-3 shrink-0" viewBox="0 0 24 24" fill="black" xmlns="http://www.w3.org/2000/svg">
                      <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.32 2.32-1.55 4.3-3.74 4.25z"/>
                    </svg>
                    Continue with Apple
                  </button>

                  {/* Phone Login Option */}
                  <button
                    type="button"
                    disabled
                    className="relative flex items-center justify-center w-full py-4 px-5 rounded-2xl bg-white/[0.02] border border-white/5 text-white font-semibold text-sm opacity-35 cursor-not-allowed select-none"
                  >
                    <Smartphone className="w-4 h-4 mr-3 shrink-0 text-white/50" />
                    Continue with Phone
                  </button>

                  {/* Divider */}
                  <div className="flex items-center gap-4 py-2">
                    <span className="flex-1 h-px bg-gradient-to-r from-transparent to-white/10" />
                    <span className="text-white/20 text-[9px] font-mono font-bold uppercase tracking-[0.15em]">
                      or console login
                    </span>
                    <span className="flex-1 h-px bg-gradient-to-l from-transparent to-white/10" />
                  </div>

                  {/* Email Sign In Form */}
                  <form onSubmit={handleEmailLoginSubmit} className="space-y-3.5">
                    <input
                      type="email"
                      required
                      placeholder="Email address"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      className="w-full px-5 py-4 bg-black/40 border border-white/10 rounded-2xl text-white placeholder-white/20 text-sm focus:border-[#7C5CFF]/70 focus:ring-4 focus:ring-[#7C5CFF]/15 transition-all duration-300 outline-none"
                      autoComplete="email"
                    />
                    <input
                      type="password"
                      required
                      placeholder="Security password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="w-full px-5 py-4 bg-black/40 border border-white/10 rounded-2xl text-white placeholder-white/20 text-sm focus:border-[#7C5CFF]/70 focus:ring-4 focus:ring-[#7C5CFF]/15 transition-all duration-300 outline-none"
                      autoComplete="current-password"
                    />
                    <button
                      type="submit"
                      disabled={isLoading || isSigningIn}
                      className="w-full bg-[#7C5CFF] text-white font-bold py-4 rounded-2xl hover:bg-[#7C5CFF]/90 active:scale-[0.99] transition-all duration-300 disabled:opacity-50 text-sm cursor-pointer shadow-md"
                    >
                      {isSigningIn ? 'Signing in...' : 'Sign In'}
                    </button>
                  </form>
                </div>
              )}

              {authError && (
                <div className="flex items-center gap-2 text-xs font-mono bg-hot/10 border border-hot/20 p-4 rounded-xl mt-4 text-hot">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{authError}</span>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // Compute logged-in user profile details
  const userDisplayName = user?.displayName || (user?.email ? user.email.split('@')[0] : 'Admin');
  const currentUserAdminRecord = adminUsers.find(a => a.email === user?.email);
  const userRole = currentUserAdminRecord ? currentUserAdminRecord.role : (user?.email === 'anudeepdash2004@gmail.com' ? 'Developer' : 'Admin');

  // ---------------------------------------------------------------------------
  // Render Console Main Layout
  // ---------------------------------------------------------------------------
  return (
    <div className="min-h-screen bg-bg text-ink relative overflow-hidden selection:bg-brand selection:text-white admin-console-wrapper">
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
            <CheckCircle2 className="w-4 h-4 text-brand" />
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
          className={`fixed md:relative top-0 bottom-0 left-0 w-[290px] flex flex-col flex-shrink-0 z-40 transition-transform duration-300 md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} md:my-5 md:ml-5 md:rounded-[2rem] border-r md:border border-line-soft bg-bg-card shadow-xl md:shadow-2xl dark:shadow-none`}
        >
          {/* Brand Logo & Console Tag */}
          <div className="px-8 pt-8 pb-5">
            <a href="/" target="_blank" className="block group">
              <img
                src="/logo_wordmark_flat.png"
                alt="ArtisTant"
                className="h-[20px] w-auto object-contain dark:invert-0 invert"
              />
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="inline-flex w-1.5 h-1.5 rounded-full bg-brand animate-pulse" />
                <p className="text-[10px] font-mono font-bold tracking-[0.15em] uppercase text-[#F25A2B]">
                  Command center
                </p>
              </div>
            </a>
          </div>

          <div className="h-px mx-6 bg-gradient-to-r from-transparent via-line-soft to-transparent" />

          {/* Navigation Links */}
          <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1.5 relative text-left">
            <p className="text-[9px] font-mono font-bold tracking-[0.18em] uppercase px-4 pb-2 text-ink-3">
              Management Suite
            </p>
            
            <div className="space-y-1 relative">
              {([
                { id: "registrations", label: "Waitlist", icon: Users, accent: 'var(--brand-1)' },
                { id: "leaderboards", label: "Leaderboards", icon: Trophy, accent: 'var(--brand-2)' },
                { id: "members", label: "Visitor Activity", icon: Eye, accent: 'var(--brand-3)' },
                { id: "admins", label: "Manage Admins", icon: Settings, accent: 'var(--brand-4)' },
              ] as const).map(item => (
                <button
                  key={item.id}
                  onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
                  className="w-full flex items-center gap-3.5 px-4 py-3.5 rounded-xl transition-all text-xs font-semibold relative group overflow-hidden cursor-pointer"
                >
                  {/* Sliding active pill indicator */}
                  {activeTab === item.id && (
                    <motion.div
                      layoutId="activeSidebarTab"
                      className="absolute inset-0 rounded-xl bg-bg-soft dark:bg-white/[0.03] border border-line-soft"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      style={{
                        boxShadow: `0 4px 15px -4px color-mix(in srgb, ${item.accent} 20%, transparent)`
                      }}
                    />
                  )}
                  
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center transition-all border z-10"
                    style={{
                      backgroundColor: activeTab === item.id ? item.accent : 'var(--bg-soft)',
                      borderColor: activeTab === item.id ? 'transparent' : 'var(--line-soft)'
                    }}
                  >
                    <item.icon className="w-3.5 h-3.5 transition-transform group-hover:scale-105 duration-300" style={{ color: activeTab === item.id ? '#ffffff' : 'var(--ink-3)' }} />
                  </div>
                  <span className={`font-semibold z-10 transition-colors duration-200 ${activeTab === item.id ? "text-ink font-bold" : "text-ink-2 group-hover:text-ink"}`}>
                    {item.label}
                  </span>
                </button>
              ))}
            </div>
          </nav>

          {/* Console Profile & System Health readout */}
          <div className="p-4 border-t border-line-soft">
            <div className="bg-bg-soft/50 border border-line-soft rounded-2xl p-4 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-mono font-bold text-sm shrink-0 bg-gradient-to-br from-[#7C5CFF] to-[#D4567A] shadow-[0_4px_12px_rgba(124,92,255,0.25)] border border-white/10 relative overflow-hidden">
                  {user?.photoURL ? (
                    <img src={user.photoURL} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span>{userDisplayName ? userDisplayName[0].toUpperCase() : "A"}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-xs font-bold text-ink truncate" title={userDisplayName}>{userDisplayName}</p>
                  <p className="text-[9px] font-mono tracking-[0.1em] uppercase mt-0.5 text-ink-3 font-bold">{userRole || "Administrator"}</p>
                </div>
                <button onClick={handleLogout} className="text-ink-3 hover:text-red-400 transition-colors p-1.5 cursor-pointer rounded-lg hover:bg-bg-soft/80" title="Sign Out">
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="mt-3 pt-3 border-t border-line-soft flex items-center justify-between text-[10px] font-mono">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse" />
                  <span className="text-ink-2 font-bold uppercase tracking-wider">Database Connection</span>
                </div>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold uppercase">Active</span>
              </div>
            </div>
          </div>
        </motion.aside>

        {/* ─── Main Content Canvas ─── */}
        <main className="flex-1 overflow-y-auto relative scroll-smooth flex flex-col h-screen">
          {/* Premium Header */}
          <header className="sticky top-0 z-30 backdrop-blur-xl border-b border-line-soft px-6 md:px-10 py-5 flex items-center justify-between" style={{ background: 'transparent' }}>
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setSidebarOpen(true)}
                className="md:hidden p-2.5 rounded-xl border border-line-soft bg-bg-card/50 text-ink-2 hover:text-ink cursor-pointer hover:bg-bg-soft transition-all"
                aria-label="Open sidebar"
              >
                <Menu className="w-4 h-4" />
              </button>
              
              <div className="flex flex-col text-left">
                <span className="text-[9px] font-mono font-bold tracking-[0.25em] text-[#7C5CFF] uppercase">Admin Console</span>
                <h2 className="text-lg font-display font-bold tracking-tight text-ink uppercase mt-0.5" style={{ fontFamily: '"Space Grotesk", sans-serif' }}>
                  {activeTab === "registrations" && "Waitlist Directory"}
                  {activeTab === "leaderboards" && "Leaderboard Rankings"}
                  {activeTab === "members" && "Visitor Activity Logs"}
                  {activeTab === "admins" && "System Administrators"}
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {mounted && (
                <button
                  onClick={() => setTheme(resolvedTheme === "light" ? "dark" : "light")}
                  className="p-2.5 rounded-xl border border-line-soft bg-bg-card/30 hover:bg-bg-soft text-ink-2 hover:text-ink cursor-pointer transition-all"
                  aria-label="Toggle Theme"
                  title={resolvedTheme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
                >
                  {resolvedTheme === "light" ? (
                    <Moon className="w-4 h-4" />
                  ) : (
                    <Sun className="w-4 h-4" />
                  )}
                </button>
              )}
              
              <a 
                href="/" 
                target="_blank" 
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-[#7C5CFF]/30 bg-[#7C5CFF]/10 hover:bg-[#7C5CFF]/20 text-[#7C5CFF] hover:text-[#7C5CFF] dark:hover:text-white text-xs font-mono font-bold uppercase tracking-wider transition-all duration-300 shadow-sm"
              >
                Launch Portal <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </header>

          <div className="p-4 md:p-8 max-w-[1400px] mx-auto space-y-6 md:space-y-8 pb-32">
            
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
                  <div className="space-y-8 animate-in fade-in duration-200">
                    
                    {/* Metric cards — premium bento layout */}
                    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6">
                      {[
                        { label: "Global Waitlist", value: totalCount, glow: 'rgba(124,92,255,0.06)' },
                        { label: "Verified Artists", value: verifiedCount, glow: 'rgba(124,92,255,0.08)' },
                        { label: "Pending Review", value: pendingCount, glow: 'rgba(242,90,43,0.06)' },
                        { label: "Portfolio Setup", value: portfolioCompleteCount, glow: 'rgba(212,86,122,0.06)' },
                        { label: "Suspended", value: blockedCount, glow: 'rgba(255,75,75,0.06)' },
                      ].map((card, i) => (
                        <GlowingAdminCard
                          key={card.label}
                          idx={i}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.05, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                          className={`bg-bg-card border border-line-soft rounded-3xl p-6 md:p-8 cursor-default group backdrop-blur-xl relative overflow-hidden ${
                            i === 4 ? "col-span-2 lg:col-span-1 sm:col-span-1" : ""
                          }`}
                          style={{
                            boxShadow: `0 10px 30px -10px ${card.glow}`
                          }}
                        >
                          <div className="flex flex-col gap-1 text-left">
                            <span className="text-[10px] font-mono font-bold tracking-[0.15em] uppercase text-ink-3">{card.label}</span>
                            <span className="text-4xl font-display font-black tracking-tight text-ink mt-1">{card.value}</span>
                          </div>
                        </GlowingAdminCard>
                      ))}
                    </div>

                     {/* Heuristics suggestion banner */}
                     {autoVerifyCount > 0 && (
                       <GlowingAdminCard 
                         idx={4}
                         className="bg-emerald-500/10 dark:bg-emerald-500/5 border border-emerald-500/20 rounded-[1.5rem] p-6 shadow-lg backdrop-blur-xl animate-in fade-in duration-300 text-left"
                       >
                         <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                           <div className="flex items-center gap-3">
                             <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-emerald-500/10 dark:bg-[#22C55E]/10 border border-emerald-500/20 dark:border-[#22C55E]/20">
                               <Cpu className="w-4 h-4 text-[#22C55E]" />
                             </div>
                             <div>
                               <h4 className="font-mono text-xs font-bold text-[#22C55E] uppercase tracking-wider flex items-center gap-1.5">
                                 Suggested Approvals
                               </h4>
                               <p className="text-[11px] text-ink-2 mt-0.5">
                                 {autoVerifyCount} pending artist(s) have completed their profiles and can be automatically approved.
                               </p>
                             </div>
                           </div>
                           <button
                             onClick={runAutoVerifyEngine}
                             className="bg-[#22C55E]/10 hover:bg-[#22C55E]/20 text-[#22C55E] border border-[#22C55E]/20 font-mono text-[9px] font-bold uppercase tracking-wider py-2 px-4 rounded-xl transition-all duration-300 shadow-sm cursor-pointer whitespace-nowrap"
                           >
                             Auto-Approve {autoVerifyCount} Artists
                           </button>
                         </div>
                       </GlowingAdminCard>
                     )}

                    {/* Toolbar */}
                    <div className="bg-bg-card border border-line-soft p-5 rounded-3xl flex flex-col md:flex-row gap-4 items-center justify-between backdrop-blur-md">
                      <div className="relative w-full md:w-80">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-3" />
                        <input
                          type="text"
                          placeholder="Search name, handle, email..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full bg-bg-soft/40 border border-line-soft focus:border-[#7C5CFF] focus:ring-4 focus:ring-[#7C5CFF]/15 text-sm text-ink placeholder-ink-3 rounded-2xl pl-12 pr-4 py-3 transition-all outline-none"
                          style={{ borderColor: searchQuery ? 'var(--brand-3)' : '' }}
                        />
                      </div>

                      <div className="flex flex-col sm:flex-row items-center gap-3.5 w-full md:w-auto text-[11px] font-mono text-ink-2">
                        {/* View Mode Toggle */}
                        <div className="flex rounded-xl p-1 bg-bg-soft/40 border border-line-soft w-full sm:w-auto">
                          <button
                            onClick={() => setViewMode("table")}
                            className="flex-1 sm:flex-initial px-4 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 font-bold uppercase tracking-[0.06em] cursor-pointer"
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
                            className="flex-1 sm:flex-initial px-4 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 font-bold uppercase tracking-[0.06em] cursor-pointer"
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
                          className="w-full sm:w-auto bg-bg-soft/40 border border-line-soft rounded-xl px-4 py-2.5 font-bold uppercase tracking-[0.06em] focus:outline-none text-ink cursor-pointer text-center"
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
                          className="w-full sm:w-auto bg-bg-soft/40 border border-line-soft rounded-xl px-4 py-2.5 font-bold uppercase tracking-[0.06em] focus:outline-none text-ink cursor-pointer text-center"
                        >
                          <option value="all">All Status</option>
                          <option value="verified">Verified</option>
                          <option value="pending">Pending</option>
                          <option value="blocked">Blocked</option>
                        </select>

                        {/* Broadcast composer toggle button */}
                        <button
                          onClick={() => setShowEmailComposer(!showEmailComposer)}
                          className="w-full sm:w-auto py-2.5 px-4.5 rounded-xl border text-[11px] font-mono font-bold uppercase tracking-[0.06em] flex items-center justify-center gap-2 cursor-pointer transition-all duration-300"
                          style={showEmailComposer ? {
                            background: 'rgba(124, 92, 255, 0.1)',
                            color: '#7C5CFF',
                            borderColor: 'rgba(124, 92, 255, 0.3)',
                          } : {
                            background: 'var(--bg-soft)',
                            color: 'var(--ink-2)',
                            borderColor: 'var(--line-soft)',
                          }}
                        >
                          <Mail className="w-3.5 h-3.5" />
                          Broadcast
                          {selectedUserIds.length > 0 && (
                            <span className="bg-[#7C5CFF] text-white px-1.5 py-0.5 rounded-full text-[8px] font-mono leading-none">
                              {selectedUserIds.length}
                            </span>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Collapsible Email Composer */}
                    <AnimatePresence>
                      {showEmailComposer && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                          animate={{ opacity: 1, height: "auto", marginBottom: 24 }}
                          exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          <div className="bg-bg-card border border-line-soft p-6 md:p-8 rounded-[2rem] backdrop-blur-md shadow-2xl relative overflow-hidden text-left mt-6">
                            <div className="flex justify-between items-center border-b border-line-soft pb-4 mb-6">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-[#7C5CFF]/10 border border-[#7C5CFF]/20">
                                  <Mail className="w-4 h-4 text-[#7C5CFF]" />
                                </div>
                                <div>
                                  <h3 className="font-mono text-xs font-bold text-ink uppercase tracking-wider">Campaign Email Composer</h3>
                                  <p className="text-[10px] text-ink-3 uppercase font-mono tracking-wider mt-0.5">
                                    {selectedUserIds.length > 0 
                                      ? `Target: ${selectedUserIds.length} Selected Artist(s)` 
                                      : `Target: All Registered Users (${filteredRegistrations.filter(r => !r.is_blocked).length})`
                                    }
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={loadMigrationCampaignPreset}
                                  className="text-[#7C5CFF] hover:text-white font-mono text-[9px] md:text-[10px] uppercase font-bold tracking-wider cursor-pointer bg-[#7C5CFF]/10 border border-[#7C5CFF]/20 hover:bg-[#7C5CFF] px-3.5 py-1.5 rounded-lg transition-all"
                                >
                                  ⚡ Load Onboarding Preset
                                </button>
                                <button 
                                  onClick={() => setShowEmailComposer(false)}
                                  className="text-ink-3 hover:text-ink font-mono text-[10px] uppercase font-bold tracking-wider cursor-pointer bg-bg-soft/50 border border-line-soft px-3 py-1.5 rounded-lg hover:bg-bg-soft"
                                >
                                  Close
                                </button>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                              {/* Composer Fields */}
                              <div className="lg:col-span-7 space-y-5">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                  <div>
                                    <label className="block text-[9px] font-mono font-bold uppercase text-ink-3 tracking-wider mb-2">Sender Alias</label>
                                    <select
                                      value={emailAlias}
                                      onChange={(e) => setEmailAlias(e.target.value)}
                                      className="w-full bg-bg-soft/30 border border-line-soft rounded-xl px-3.5 py-2.5 text-xs text-ink focus:outline-none focus:border-[#7C5CFF] cursor-pointer"
                                    >
                                      <option value="official">ArtisTant Official (info@artistant.in)</option>
                                      <option value="support">ArtisTant Support (support@artistant.in)</option>
                                      <option value="founder">ArtisTant Founder (founder@artistant.in)</option>
                                    </select>
                                  </div>
                                  <div>
                                    <label className="block text-[9px] font-mono font-bold uppercase text-ink-3 tracking-wider mb-2">Email Subject</label>
                                    <input
                                      type="text"
                                      value={emailSubject}
                                      onChange={(e) => setEmailSubject(e.target.value)}
                                      className="w-full bg-bg-soft/30 border border-line-soft rounded-xl px-3.5 py-2.5 text-xs text-ink focus:outline-none focus:border-[#7C5CFF] transition-all"
                                    />
                                  </div>
                                </div>

                                <div>
                                  <label className="block text-[9px] font-mono font-bold uppercase text-ink-3 tracking-wider mb-2">Email Heading (Pill Tag Header)</label>
                                  <input
                                    type="text"
                                    value={emailHeader}
                                    onChange={(e) => setEmailHeader(e.target.value)}
                                    className="w-full bg-bg-soft/30 border border-line-soft rounded-xl px-3.5 py-2.5 text-xs text-ink focus:outline-none focus:border-[#7C5CFF] transition-all"
                                  />
                                </div>

                                <div>
                                  <label className="block text-[9px] font-mono font-bold uppercase text-ink-3 tracking-wider mb-2">Message Body (HTML supported)</label>
                                  <textarea
                                    value={emailBody}
                                    onChange={(e) => setEmailBody(e.target.value)}
                                    rows={8}
                                    className="w-full bg-bg-soft/30 border border-line-soft rounded-xl px-3.5 py-2.5 text-xs text-ink focus:outline-none focus:border-[#7C5CFF] transition-all resize-none"
                                  />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                  <div>
                                    <label className="block text-[9px] font-mono font-bold uppercase text-ink-3 tracking-wider mb-2">CTA Link Text</label>
                                    <input
                                      type="text"
                                      value={emailCtaText}
                                      onChange={(e) => setEmailCtaText(e.target.value)}
                                      className="w-full bg-bg-soft/30 border border-line-soft rounded-xl px-3.5 py-2.5 text-xs text-ink focus:outline-none focus:border-[#7C5CFF] transition-all"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-[9px] font-mono font-bold uppercase text-ink-3 tracking-wider mb-2">CTA Destination URL</label>
                                    <input
                                      type="text"
                                      value={emailCtaUrl}
                                      onChange={(e) => setEmailCtaUrl(e.target.value)}
                                      className="w-full bg-bg-soft/30 border border-line-soft rounded-xl px-3.5 py-2.5 text-xs text-ink focus:outline-none focus:border-[#7C5CFF] transition-all font-mono"
                                    />
                                  </div>
                                </div>

                                <div className="p-4 bg-bg-soft/20 border border-line-soft rounded-xl flex items-center justify-between">
                                  <span className="text-[10px] font-mono text-ink-2">
                                    Targets: <strong className="text-ink">{getSelectedRecipientsList().filter(r => !r.is_blocked).length}</strong> recipient(s) selected
                                  </span>
                                  <button
                                    onClick={handleSendEmailBroadcast}
                                    disabled={emailSending}
                                    className="py-2.5 px-5 rounded-xl text-[10px] font-mono font-bold tracking-wider uppercase flex items-center gap-2 text-white bg-gradient-to-r from-[#F25A2B] to-[#7C5CFF] hover:opacity-90 disabled:opacity-50 transition-all cursor-pointer shadow-md"
                                  >
                                    {emailSending ? (
                                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                    ) : (
                                      <Send className="w-3.5 h-3.5" />
                                    )}
                                    Send Broadcast
                                  </button>
                                </div>
                              </div>

                              {/* Live Email Preview */}
                              <div className="lg:col-span-5 space-y-4">
                                <div className="flex justify-between items-center">
                                  <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-ink-3">Live Brand Preview</span>
                                  <div className="flex rounded-lg p-1 bg-bg-soft/40 border border-line-soft">
                                    <button
                                      onClick={() => setEmailPreviewMode("mobile")}
                                      className={`p-1.5 rounded transition-all cursor-pointer ${
                                        emailPreviewMode === "mobile" ? "bg-bg-soft text-[#7C5CFF] border border-line-soft" : "text-ink-3 hover:text-ink"
                                      }`}
                                      title="Mobile View"
                                    >
                                      <Smartphone className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      onClick={() => setEmailPreviewMode("desktop")}
                                      className={`p-1.5 rounded transition-all cursor-pointer ${
                                        emailPreviewMode === "desktop" ? "bg-bg-soft text-[#7C5CFF] border border-line-soft" : "text-ink-3 hover:text-ink"
                                      }`}
                                      title="Desktop View"
                                    >
                                      <Monitor className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>

                                <div className="flex justify-center bg-bg-soft/40 border border-line-soft p-4 rounded-2xl overflow-y-auto max-h-[440px] shadow-inner">
                                  <div 
                                    className={`bg-white text-slate-800 text-left rounded-2xl overflow-hidden border border-slate-200 transition-all duration-300 relative shadow-lg ${
                                      emailPreviewMode === "mobile" ? "w-[280px]" : "w-full"
                                    }`}
                                    style={{
                                      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
                                    }}
                                  >
                                    {/* Branded Dark Header */}
                                    <div className="bg-[#0b1120] px-5 py-4 flex items-center justify-between">
                                      <img 
                                        src="/logo_wordmark_flat.png" 
                                        alt="Artistant" 
                                        className="h-[16px] w-auto object-contain"
                                        style={{ filter: 'none' }}
                                      />
                                    </div>
                                    
                                    {/* Top gradient line */}
                                    <div className="h-1 bg-gradient-to-r from-[#F25A2B] via-[#D4567A] to-[#7C5CFF]" />
                                    
                                    {/* Content Area */}
                                    <div className="p-6 bg-white space-y-4">
                                      {/* Pill Badge */}
                                      <div className="inline-block bg-[#FFF0EB] border border-[#FFD4C7] text-[#F25A2B] text-[8px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
                                        ⚡ WAITLIST ACTIVE
                                      </div>
                                      
                                      {/* Heading */}
                                      <h1 className="font-bold text-slate-900 text-base leading-tight pr-4">
                                        Welcome to the stage. <br />
                                        <span className="text-[#F25A2B]">@username</span> is officially stashed.
                                      </h1>
                                      
                                      <p className="text-slate-900 font-bold text-[11px]">Hey stageName,</p>
                                      
                                      {emailHeader && (
                                        <p className="font-bold text-[10px] uppercase tracking-wider text-[#F25A2B]">{emailHeader}</p>
                                      )}
                                      
                                      <div 
                                        className="text-slate-600 text-[10px] leading-relaxed whitespace-pre-wrap"
                                        dangerouslySetInnerHTML={{ __html: emailBody }}
                                      />
 
                                      {emailCtaText && (
                                        <div className="pt-2 text-center">
                                          <a 
                                            href={emailCtaUrl} 
                                            onClick={(e) => e.preventDefault()}
                                            className="inline-block px-5 py-2.5 text-white font-mono font-bold text-[9px] rounded-lg transition-all bg-gradient-to-r from-[#F25A2B] to-[#7C5CFF] uppercase tracking-wide shadow-sm"
                                            style={{ textDecoration: 'none' }}
                                          >
                                            {emailCtaText}
                                          </a>
                                        </div>
                                      )}
                                    </div>
 
                                    {/* Footer */}
                                    <div className="bg-slate-50 border-t border-slate-100 px-6 py-5 text-center space-y-2">
                                      <p className="text-[8px] text-slate-400 leading-normal">You are receiving this official launch communication as part of the Artistant waitlist.</p>
                                      <p className="text-[8px] text-[#F25A2B] font-mono tracking-wider font-bold">Bengaluru, IN | artistant.in</p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Logs Terminal */}
                            {showLogTerminal && (
                              <div className="mt-6 bg-bg-soft/40 border border-line-soft rounded-2xl overflow-hidden shadow-inner">
                                <div className="bg-bg-soft/50 px-5 py-3 border-b border-line-soft flex justify-between items-center">
                                  <span className="text-[9px] font-mono font-bold text-ink-3 flex items-center gap-1.5 uppercase tracking-wider">
                                    <span className={`w-1.5 h-1.5 rounded-full ${emailSending ? "bg-amber-500 animate-ping" : "bg-[#22C55E]"}`} />
                                    Execution Broadcast Terminal
                                  </span>
                                  <button 
                                    onClick={() => setShowLogTerminal(false)}
                                    className="text-ink-3 hover:text-ink text-[9px] font-mono uppercase tracking-wider font-bold cursor-pointer"
                                  >
                                    Close
                                  </button>
                                </div>
                                <pre className="p-4 max-h-36 overflow-y-auto text-[9px] font-mono bg-bg-soft/30 border border-line-soft text-ink-2 text-left">
                                  {emailLogs.length === 0 ? (
                                    <span className="text-zinc-600 italic">No execution logs active.</span>
                                  ) : (
                                    emailLogs.map((logStr, i) => (
                                      <div key={i} className={logStr.includes("FAILED") ? "text-red-400" : logStr.includes("SUCCESS") ? "text-[#22C55E]" : ""}>
                                        {logStr}
                                      </div>
                                    ))
                                  )}
                                </pre>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Data View */}
                    {viewMode === "table" ? (
                      <div className="bg-bg-card border border-line-soft rounded-3xl overflow-hidden backdrop-blur-md shadow-2xl">
                        <div className="overflow-x-auto">
                          <table className="w-full border-collapse text-left text-sm">
                            <thead>
                              <tr className="border-b border-line-soft text-ink-3 text-[9px] font-mono font-bold uppercase tracking-[0.18em]">
                                <th className="px-6 py-5 w-12 text-center">
                                  <input
                                    type="checkbox"
                                    checked={filteredRegistrations.length > 0 && filteredRegistrations.every(r => selectedUserIds.includes(r.id))}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        setSelectedUserIds(filteredRegistrations.map(r => r.id));
                                      } else {
                                        setSelectedUserIds([]);
                                      }
                                    }}
                                    className="w-4 h-4 rounded border-line-soft bg-bg-soft/40 text-[#7C5CFF] focus:ring-0 cursor-pointer"
                                  />
                                </th>
                                <th className="px-8 py-5">Artist Node</th>
                                <th className="px-6 py-5">Cleared Role</th>
                                <th className="px-6 py-5">Communication</th>
                                <th className="px-6 py-5">Position</th>
                                <th className="px-6 py-5">Clearance</th>
                                <th className="px-8 py-5 text-right">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-line-soft/30">
                              {filteredRegistrations.length === 0 ? (
                                <tr>
                                  <td colSpan={7} className="px-8 py-14 text-center text-ink-3 font-mono text-xs">
                                    No matching waitlist nodes found.
                                  </td>
                                </tr>
                              ) : (
                                filteredRegistrations.map((reg) => {
                                  const heuristics = evaluateAutoVerify(reg);
                                  const initials = (reg.display_name || reg.username || 'U')[0].toUpperCase();
                                  return (
                                    <tr 
                                      key={reg.id} 
                                      onClick={() => setSelectedReg(reg)}
                                      className={`hover:bg-bg-card-hover/20 transition-colors cursor-pointer duration-150 ${
                                        reg.is_blocked ? "opacity-30" : ""
                                      }`}
                                    >
                                      <td className="px-6 py-5 w-12 text-center" onClick={(e) => e.stopPropagation()}>
                                        <input
                                          type="checkbox"
                                          checked={selectedUserIds.includes(reg.id)}
                                          onChange={() => {
                                            if (selectedUserIds.includes(reg.id)) {
                                              setSelectedUserIds(selectedUserIds.filter(id => id !== reg.id));
                                            } else {
                                              setSelectedUserIds([...selectedUserIds, reg.id]);
                                            }
                                          }}
                                          className="w-4 h-4 rounded border-line-soft bg-bg-soft/40 text-[#7C5CFF] focus:ring-0 cursor-pointer"
                                        />
                                      </td>
                                      <td className="px-8 py-4.5">
                                        <div className="flex items-center gap-3">
                                          <div className="w-9 h-9 rounded-xl overflow-hidden flex items-center justify-center font-display font-bold text-sm text-white shrink-0 bg-bg-soft">
                                            {reg.profile_photo_url ? (
                                              <img src={reg.profile_photo_url} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#7C5CFF] to-[#D4567A]">
                                                {initials}
                                              </div>
                                            )}
                                          </div>
                                          <div>
                                            <div className="font-bold text-ink flex items-center gap-2 text-sm">
                                              {reg.display_name || "Unspecified Node"}
                                              {reg.is_verified && (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[8px] font-mono font-bold tracking-[0.08em] bg-gradient-to-r from-[#F25A2B] to-[#7C5CFF] text-white">
                                                  VERIFIED
                                                </span>
                                              )}
                                              {heuristics.eligible && (
                                                 <span 
                                                   className="inline-flex items-center px-2 py-0.5 rounded-full text-[8px] font-mono font-bold tracking-[0.08em] bg-bg-soft text-[#22C55E] border border-[#22C55E]/20"
                                                   title={`Auto-verify candidate: ${heuristics.reasons.join(", ")}`}
                                                 >
                                                   SUGGESTED
                                                 </span>
                                               )}
                                            </div>
                                            <div className="text-[11px] font-mono mt-0.5 text-brand">
                                              @{reg.username}
                                            </div>
                                          </div>
                                        </div>
                                      </td>
                                      <td className="px-6 py-4.5">
                                        <div>
                                          <span className="inline-block px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-[0.08em]" style={{
                                            background: 'var(--bg-soft)',
                                            color: reg.role === 'artist' ? 'var(--brand-3)' : reg.role === 'venue' ? 'var(--brand-2)' : reg.role === 'vendor' ? 'var(--brand-1)' : 'var(--ink-3)',
                                            border: `1px solid color-mix(in srgb, ${reg.role === 'artist' ? 'var(--brand-3)' : reg.role === 'venue' ? 'var(--brand-2)' : reg.role === 'vendor' ? 'var(--brand-1)' : 'var(--ink-3)'} 15%, transparent)`,
                                          }}>
                                            {reg.role || "fan"}
                                          </span>
                                          {reg.category && (
                                            <span className="block text-[10px] text-ink-3 mt-1 capitalize font-mono">
                                              {reg.category.replace("_", " ")}
                                            </span>
                                          )}
                                        </div>
                                      </td>
                                      <td className="px-6 py-4.5 font-mono text-[11px] text-ink-2 space-y-0.5 text-left">
                                        <div className="text-ink flex items-center">{reg.email}</div>
                                        {reg.phone && <div className="text-ink-3">{reg.phone}</div>}
                                      </td>
                                      <td className="px-6 py-4.5">
                                        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                          <input
                                            type="number"
                                            placeholder="Auto"
                                            value={reg.position_override ?? ""}
                                            onChange={(e) => {
                                              const val = e.target.value === "" ? null : parseInt(e.target.value, 10);
                                              handleSavePositionOverride(reg.user_id, val);
                                            }}
                                            className="w-14 bg-bg-soft border border-line-soft rounded-lg py-1 px-1.5 text-xs text-ink text-center font-mono focus:outline-none focus:border-brand transition-all"
                                          />
                                          <span className="text-[10px] font-mono text-ink-3">
                                            {reg.position_override ? `#${reg.position_override}` : "Queue"}
                                          </span>
                                        </div>
                                      </td>
                                      <td className="px-6 py-4.5">
                                        <button
                                          onClick={(e) => { e.stopPropagation(); handleVerifyAndLock(reg); }}
                                          className="py-1 px-3.5 rounded-full text-[9px] font-mono font-bold tracking-[0.06em] uppercase transition-all cursor-pointer"
                                          style={reg.is_verified ? {
                                            background: 'var(--bg-soft)',
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
                                      <td className="px-8 py-4.5 text-right">
                                        <button
                                          onClick={(e) => { e.stopPropagation(); handleToggleBlock(reg); }}
                                          className="py-1 px-3.5 rounded-full text-[9px] font-mono font-bold tracking-[0.06em] uppercase transition-all cursor-pointer"
                                          style={reg.is_blocked ? {
                                            background: 'rgba(255,75,75,0.1)',
                                            color: 'var(--hot)',
                                            border: '1px solid rgba(255,75,75,0.2)',
                                          } : {
                                            background: 'var(--bg-soft)',
                                            color: 'var(--ink-3)',
                                            border: '1px solid var(--line-soft)',
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
                          <div className="col-span-full py-12 text-center text-ink-3 font-mono bg-bg-card border border-line-soft rounded-[2rem]">
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
                            const initials = (reg.display_name || reg.username || 'U')[0].toUpperCase();

                            return (
                              <GlowingAdminCard 
                                key={reg.id}
                                idx={idx}
                                onClick={() => setSelectedReg(reg)}
                                className={`bg-bg-card border border-line-soft rounded-[2rem] p-7 flex flex-col gap-0 cursor-pointer hover:border-white/10 hover:shadow-2xl hover:scale-[1.01] transition-all duration-300 ${
                                  reg.is_blocked ? "opacity-40" : ""
                                }`}
                                style={{ minHeight: '390px' }}
                              >
                                {/* Top: Icon + Status badges */}
                                <div className="flex justify-between items-start mb-5 z-10">
                                  <div className="flex items-center gap-3">
                                    <div className="relative flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                      <input
                                        type="checkbox"
                                        checked={selectedUserIds.includes(reg.id)}
                                        onChange={() => {
                                          if (selectedUserIds.includes(reg.id)) {
                                            setSelectedUserIds(selectedUserIds.filter(id => id !== reg.id));
                                          } else {
                                            setSelectedUserIds([...selectedUserIds, reg.id]);
                                          }
                                        }}
                                        className="w-4 h-4 rounded border-line-soft bg-bg-soft/40 text-[#7C5CFF] focus:ring-0 cursor-pointer z-10"
                                      />
                                      <div className="w-11 h-11 rounded-xl overflow-hidden flex items-center justify-center bg-bg-soft border border-line-soft font-display font-bold text-sm text-ink shadow-inner">
                                        {reg.profile_photo_url ? (
                                          <img src={reg.profile_photo_url} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#7C5CFF] to-[#D4567A] text-white">
                                            {initials}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex flex-col gap-1.5 items-end">
                                    {reg.is_verified && (
                                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold tracking-[0.08em] bg-gradient-to-r from-[#F25A2B] to-[#7C5CFF] text-white">
                                        VERIFIED
                                      </span>
                                    )}
                                    {reg.exclude_from_waitlist && (
                                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold tracking-[0.08em] bg-bg-soft text-purple-400 border border-purple-400/20">
                                        TEAM
                                      </span>
                                    )}
                                    {heuristics.eligible && (
                                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold tracking-[0.08em] bg-bg-soft text-[#22C55E] border border-[#22C55E]/20" title={`Auto-verify: ${heuristics.reasons.join(", ")}`}>
                                        SUGGESTED
                                      </span>
                                    )}
                                    {reg.is_blocked && (
                                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold tracking-[0.08em] bg-hot/10 text-hot border border-hot/20">
                                        SUSPENDED
                                      </span>
                                    )}
                                  </div>
                                </div>

                                {/* Identity */}
                                <div className="mb-1 z-10 text-left">
                                  <h3 className="font-display font-bold text-lg text-ink uppercase tracking-tight leading-tight pr-4 truncate">
                                    {reg.display_name || "Unknown"}
                                  </h3>
                                  <p className="text-xs font-mono mt-1 text-brand">
                                    @{reg.username}
                                  </p>
                                </div>

                                {/* Role & Tags */}
                                <div className="mb-auto z-10 pt-3 text-left">
                                  <span className="inline-block px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-[0.08em]" style={{
                                    background: 'var(--bg-soft)',
                                    color: roleColor,
                                    border: `1px solid color-mix(in srgb, ${roleColor} 15%, transparent)`,
                                  }}>
                                    {reg.role || "fan"}
                                  </span>
                                  
                                  {(reg.category || (reg.genres && reg.genres.length > 0)) && (
                                    <div className="mt-3.5 space-y-2">
                                      {reg.category && (
                                        <p className="text-[11px] text-ink-2 capitalize">
                                          <span className="text-ink-3 font-mono">Category:</span> {reg.category.replace("_", " ")}
                                        </p>
                                      )}
                                      {reg.genres && reg.genres.length > 0 && (
                                        <div className="flex flex-wrap gap-1.5">
                                          {reg.genres.map(g => (
                                            <span key={g} className="text-[9px] font-mono px-2 py-0.5 rounded-full text-ink-2 bg-bg-soft/20 border border-line-soft">
                                              #{g}
                                            </span>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>

                                {/* Contact info */}
                                <div className="text-xs text-ink-2 space-y-1.5 mt-5 pt-4 z-10 border-t border-line-soft text-left">
                                  <div className="flex items-center gap-2">
                                    <Mail className="w-3.5 h-3.5 text-ink-3" />
                                    <span className="truncate">{reg.email}</span>
                                  </div>
                                  {reg.phone && (
                                    <div className="flex items-center gap-2">
                                      <Smartphone className="w-3.5 h-3.5 text-ink-3" />
                                      <span>{reg.phone}</span>
                                    </div>
                                  )}
                                </div>

                                {/* Card Actions */}
                                <div className="mt-5 pt-4 flex items-center gap-2.5 z-10 border-t border-line-soft" onClick={(e) => e.stopPropagation()}>
                                  <button
                                    onClick={() => handleVerifyAndLock(reg)}
                                    className="flex-1 py-2 rounded-xl text-[10px] font-mono font-bold tracking-[0.06em] uppercase flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                                    style={reg.is_verified ? {
                                      background: 'var(--bg-soft)',
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
                                    className="flex-1 py-2 rounded-xl text-[10px] font-mono font-bold tracking-[0.06em] uppercase flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                                    style={reg.is_blocked ? {
                                      background: 'rgba(255,75,75,0.1)',
                                      color: 'var(--hot)',
                                      border: '1px solid rgba(255,75,75,0.2)',
                                    } : {
                                      background: 'var(--bg-soft)',
                                      color: 'var(--ink-3)',
                                      border: '1px solid var(--line-soft)',
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
              <GlowingAdminCard idx={0} className="bg-bg-card border border-line-soft rounded-3xl overflow-hidden flex flex-col h-[600px] backdrop-blur-md">
                <div className="p-8 flex items-center gap-4 border-b border-line-soft text-left">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 bg-bg-soft border border-line-soft shadow-inner">
                    <Trophy className="w-5 h-5 text-brand" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-ink text-lg uppercase tracking-tight">Points Ranking</h3>
                    <p className="text-[10px] font-mono font-bold tracking-[0.12em] uppercase mt-1 text-[#F25A2B]">Base 100 + 50 per referral</p>
                  </div>
                </div>
                <div className="overflow-y-auto flex-1 p-6 space-y-2">
                  {leaderboards.map((user, idx) => (
                    <div key={`pts-${user.id}`} className={`flex items-center justify-between p-4 rounded-xl border border-transparent transition-all duration-200 hover:bg-bg-card-hover/20 hover:border-line-soft ${
                      idx < 3 ? 'bg-bg-soft/20 border-line-soft/30' : ''
                    }`}>
                      <div className="flex items-center gap-4">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-mono font-bold text-xs ${
                          idx === 0 ? "text-amber-500 bg-amber-400/10 border border-amber-400/20 shadow-[0_0_12px_rgba(251,191,36,0.15)]" :
                          idx === 1 ? "text-zinc-300 bg-zinc-300/10 border border-zinc-300/20" :
                          idx === 2 ? "text-[#b45309] bg-[#b45309]/10 border border-[#b45309]/20" :
                          "text-ink-3 bg-bg-soft/40"
                        }`}>
                          #{idx + 1}
                        </div>
                        <div className="text-left">
                          <p className="font-bold text-ink text-sm">{user.display_name || user.username}</p>
                          <p className="text-[10px] font-mono text-ink-3">@{user.username}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-display font-extrabold text-[#F25A2B]">{user.points}</p>
                        <p className="text-[9px] font-mono text-ink-3 uppercase tracking-[0.08em]">points</p>
                      </div>
                    </div>
                  ))}
                </div>
              </GlowingAdminCard>

              {/* Referrals Leaderboard */}
              <GlowingAdminCard idx={1} className="bg-bg-card border border-line-soft rounded-3xl overflow-hidden flex flex-col h-[600px] backdrop-blur-md">
                <div className="p-8 flex items-center gap-4 border-b border-line-soft text-left">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 bg-bg-soft border border-line-soft shadow-inner">
                    <Users className="w-5 h-5 text-brand" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-ink text-lg uppercase tracking-tight">Network Builders</h3>
                    <p className="text-[10px] font-mono font-bold tracking-[0.12em] uppercase mt-1 text-[#7C5CFF]">Ranked by total referrals</p>
                  </div>
                </div>
                <div className="overflow-y-auto flex-1 p-6 space-y-2">
                  {[...leaderboards]
                    .sort((a, b) => (b.refs || 0) - (a.refs || 0))
                    .map((user, idx) => (
                    <div key={`ref-${user.id}`} className={`flex items-center justify-between p-4 rounded-xl border border-transparent transition-all duration-200 hover:bg-bg-card-hover/20 hover:border-line-soft ${
                      idx < 3 ? 'bg-bg-soft/20 border-line-soft/30' : ''
                    }`}>
                      <div className="flex items-center gap-4">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-mono font-bold text-xs ${
                          idx === 0 ? "text-amber-400 bg-amber-400/10 border border-amber-400/20 shadow-[0_0_12px_rgba(251,191,36,0.15)]" :
                          idx === 1 ? "text-zinc-300 bg-zinc-300/10 border border-zinc-300/20" :
                          idx === 2 ? "text-[#b45309] bg-[#b45309]/10 border border-[#b45309]/20" :
                          "text-ink-3 bg-bg-soft/40"
                        }`}>
                          #{idx + 1}
                        </div>
                        <div className="text-left">
                          <p className="font-bold text-ink text-sm">{user.display_name || user.username}</p>
                          <p className="text-[10px] font-mono text-ink-3">@{user.username}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-display font-extrabold text-[#7C5CFF]">{user.refs || 0}</p>
                        <p className="text-[9px] font-mono text-ink-3 uppercase tracking-[0.08em]">referrals</p>
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
              <div className="bg-bg-card border border-line-soft rounded-3xl p-6 relative overflow-hidden backdrop-blur-md shadow-lg text-left">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[10px] font-mono font-bold text-ink-3 uppercase tracking-wider">Total Traffic (Visits)</p>
                    <h3 className="text-3xl font-display font-extrabold mt-2 text-ink">
                      {activityLogs.filter(l => l.action_type === 'visit').length}
                    </h3>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-bg-soft border border-line-soft flex items-center justify-center">
                    <Globe className="w-5 h-5 text-brand" />
                  </div>
                </div>
              </div>

              <div className="bg-bg-card border border-line-soft rounded-3xl p-6 relative overflow-hidden backdrop-blur-md shadow-lg text-left">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[10px] font-mono font-bold text-ink-3 uppercase tracking-wider">Distinct Logins</p>
                    <h3 className="text-3xl font-display font-extrabold mt-2 text-ink">
                      {new Set(activityLogs.filter(l => l.action_type === 'login').map(l => l.email || l.user_id)).size}
                    </h3>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-bg-soft border border-line-soft flex items-center justify-center">
                    <Lock className="w-5 h-5 text-brand" />
                  </div>
                </div>
              </div>

              <div className="bg-bg-card border border-line-soft rounded-3xl p-6 relative overflow-hidden backdrop-blur-md shadow-lg text-left">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[10px] font-mono font-bold text-ink-3 uppercase tracking-wider">Total Waitlisted</p>
                    <h3 className="text-3xl font-display font-extrabold mt-2 text-ink">
                      {registrations.length}
                    </h3>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-bg-soft border border-line-soft flex items-center justify-center">
                    <Users className="w-5 h-5 text-brand" />
                  </div>
                </div>
              </div>
            </div>

            {/* Filter and Table Card */}
            <div className="bg-bg-card border border-line-soft rounded-3xl p-8 space-y-6 backdrop-blur-md shadow-2xl">
              <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                <div className="text-left">
                  <h3 className="text-lg font-display font-bold text-ink uppercase tracking-tight">Recent Session Actions</h3>
                  <p className="text-xs text-ink-2 mt-1">Real-time developer & visitor logs on the platform</p>
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
                      className="w-full bg-bg-soft/40 border border-line-soft text-ink rounded-xl pl-10 pr-4 py-2.5 text-xs font-mono focus:border-[#7C5CFF] focus:ring-4 focus:ring-[#7C5CFF]/15 transition-all outline-none"
                    />
                  </div>

                  {/* Filter Select */}
                  <select
                    value={activityFilter}
                    onChange={(e) => setActivityFilter(e.target.value)}
                    className="bg-bg-soft/40 border border-line-soft text-ink rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-[#7C5CFF] transition-all cursor-pointer font-mono font-bold uppercase tracking-wider"
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
                    <tr className="border-b border-line-soft text-[9px] font-mono text-ink-3 uppercase tracking-widest text-left">
                      <th className="pb-3.5 font-bold">Time</th>
                      <th className="pb-3.5 font-bold">Event Node</th>
                      <th className="pb-3.5 font-bold">User Identity</th>
                      <th className="pb-3.5 font-bold">Browser / OS</th>
                      <th className="pb-3.5 font-bold">Referrer</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line-soft/30">
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
                        <tr key={log.id} className="text-xs font-mono hover:bg-bg-card-hover/20 transition-colors text-left">
                          <td className="py-4 text-ink-2">{new Date(log.created_at).toLocaleString()}</td>
                          <td className="py-4">
                            {log.action_type === 'visit' && (
                              <span className="px-2.5 py-0.5 rounded-full text-[8px] font-bold uppercase bg-bg-soft text-ink-3 border border-line-soft">
                                VISIT
                              </span>
                            )}
                            {log.action_type === 'login' && (
                              <span className="px-2.5 py-0.5 rounded-full text-[8px] font-bold uppercase bg-[#7C5CFF]/10 text-[#7C5CFF] border border-[#7C5CFF]/20">
                                LOGIN
                              </span>
                            )}
                            {log.action_type === 'waitlist_register' && (
                              <span className="px-2.5 py-0.5 rounded-full text-[8px] font-bold uppercase bg-[#F25A2B]/10 text-[#F25A2B] border border-[#F25A2B]/20">
                                REGISTRATION
                              </span>
                            )}
                          </td>
                          <td className="py-4 font-bold text-ink">
                            {log.username ? `@${log.username}` : (log.email || "Anonymous Visitor")}
                          </td>
                          <td className="py-4 text-ink-3 truncate max-w-[200px]" title={log.user_agent}>
                            {parseUserAgent(log.user_agent)}
                          </td>
                          <td className="py-4 text-ink-2">{log.referrer || "Direct Link"}</td>
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
              <div className="bg-bg-card border border-line-soft p-8 rounded-3xl space-y-6 backdrop-blur-md shadow-lg text-left">
                <div className="border-b border-line-soft pb-5">
                  <h3 className="text-lg font-display font-bold text-ink uppercase tracking-tight">Grant Clearance</h3>
                  <p className="text-xs text-ink-2 mt-1">Authorize a team member to access this console.</p>
                </div>

                <form onSubmit={handleAddAdmin} className="space-y-4">
                  <div className="space-y-2.5">
                    <label className="text-[9px] font-mono font-bold uppercase tracking-[0.12em] text-ink-3">Google Account Email</label>
                    <input
                      type="email"
                      required
                      placeholder="developer@artistant.in"
                      value={newAdminEmail}
                      onChange={(e) => setNewAdminEmail(e.target.value)}
                      className="w-full bg-bg-soft/40 border border-line-soft text-ink rounded-xl px-4 py-3.5 text-xs font-mono focus:border-[#7C5CFF] focus:ring-4 focus:ring-[#7C5CFF]/15 transition-all outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-[#F25A2B] to-[#7C5CFF] text-white font-display font-bold tracking-wider py-3.5 rounded-xl flex items-center justify-center gap-2 hover:opacity-95 active:scale-[0.98] transition-all cursor-pointer text-xs uppercase shadow-[0_4px_16px_-4px_rgba(242,90,43,0.3)]"
                  >
                    <Plus className="w-4 h-4" />
                    Grant Admin Role
                  </button>
                </form>
              </div>
            </div>

            {/* Right table list column */}
            <div className="lg:col-span-2 space-y-6 text-left">
              <div className="bg-bg-card border border-line-soft p-8 rounded-3xl space-y-6 backdrop-blur-md shadow-lg">
                <div className="border-b border-line-soft pb-5">
                  <h3 className="text-lg font-display font-bold text-ink uppercase tracking-tight">Authorized Administrators</h3>
                  <p className="text-xs text-ink-2 mt-1">Active console credentials with full table write privileges.</p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-line-soft text-[9px] font-mono text-ink-3 uppercase tracking-widest text-left">
                        <th className="pb-3.5 font-bold">User Email</th>
                        <th className="pb-3.5 font-bold">Granted By</th>
                        <th className="pb-3.5 font-bold">Access Date</th>
                        <th className="pb-3.5 text-right font-bold">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-line-soft/30">
                      {/* Seed default hardcoded super admin display */}
                      <tr className="text-xs font-mono hover:bg-bg-card-hover/20 transition-colors">
                        <td className="py-4 flex items-center gap-3 font-bold text-ink text-left">
                          <div className="w-8 h-8 rounded-lg bg-[#7C5CFF]/10 text-[#7C5CFF] border border-[#7C5CFF]/20 flex items-center justify-center font-display font-bold">
                            S
                          </div>
                          <span>anudeepdash2004@gmail.com</span>
                        </td>
                        <td className="py-4 text-ink-2">system</td>
                        <td className="py-4 text-ink-3">Jul 1, 2026</td>
                        <td className="py-4 text-right">
                          <span className="px-2.5 py-0.5 rounded-full text-[8px] font-bold uppercase bg-bg-soft text-ink-3 border border-line-soft">
                            Super-Admin
                          </span>
                        </td>
                      </tr>

                      {adminUsers
                        .filter(admin => admin.email !== 'anudeepdash2004@gmail.com')
                        .map((admin) => (
                          <tr key={admin.id} className="text-xs font-mono hover:bg-bg-card-hover/20 transition-colors">
                            <td className="py-4 flex items-center gap-3 font-bold text-ink text-left">
                              <div className="w-8 h-8 rounded-lg bg-bg-soft border border-line-soft text-ink flex items-center justify-center font-display font-bold">
                                {admin.email.substring(0, 1).toUpperCase()}
                              </div>
                              <span>{admin.email}</span>
                            </td>
                            <td className="py-4 text-ink-2">{admin.added_by || "unknown"}</td>
                            <td className="py-4 text-ink-3">{new Date(admin.created_at).toLocaleDateString()}</td>
                            <td className="py-4 text-right">
                              <button
                                onClick={() => handleRemoveAdmin(admin.email)}
                                className="p-2 bg-red-950/20 text-red-400 hover:text-red-300 rounded-lg border border-red-900/30 hover:border-red-500/50 transition-colors cursor-pointer"
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


              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>

      {/* ═══════════════════════════════════════════════════
          USER DETAIL DRAWER
          ═══════════════════════════════════════════════════ */}
      <AnimatePresence>
        {selectedReg && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-md z-[60] cursor-pointer"
              onClick={() => setSelectedReg(null)}
            />

            {/* Panel */}
            <motion.div
              initial={{ x: '100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="fixed right-0 top-0 bottom-0 w-[490px] max-w-full z-[70] bg-bg-card border-l border-line-soft overflow-y-auto shadow-2xl flex flex-col backdrop-blur-2xl"
            >
              {/* Header */}
              <div className="sticky top-0 z-10 backdrop-blur-xl px-8 py-6 flex items-center justify-between border-b border-line-soft bg-bg-card/80">
                <div className="text-left">
                  <span className="text-[9px] font-mono font-bold tracking-[0.2em] text-[#7C5CFF] uppercase">Credentials Profile</span>
                  <h3 className="text-sm font-mono font-bold uppercase tracking-[0.12em] text-ink mt-0.5">Artist Profile</h3>
                </div>
                <button
                  onClick={() => setSelectedReg(null)}
                  className="w-8 h-8 rounded-xl flex items-center justify-center bg-bg-soft border border-line-soft text-ink-3 hover:text-ink hover:bg-bg-soft-hover transition-all cursor-pointer"
                >
                  <XCircle className="w-4 h-4" />
                </button>
              </div>

              <div className="p-8 space-y-6 flex-1 text-left">

                {/* ── Profile Hero ── */}
                <div className="flex items-center gap-5">
                  <div className="w-20 h-20 rounded-2xl flex-shrink-0 overflow-hidden border border-line-soft shadow-lg relative" style={{
                    background: selectedReg.profile_photo_url ? undefined : 'linear-gradient(135deg, var(--brand-3), var(--brand-1))',
                  }}>
                    {selectedReg.profile_photo_url ? (
                      <img src={selectedReg.profile_photo_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white font-display font-bold text-2xl">
                        {(selectedReg.display_name || 'U')[0].toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="text-xl font-display font-bold text-ink tracking-tight truncate">
                      {selectedReg.display_name || 'Unknown'}
                    </h2>
                    <p className="text-sm font-mono mt-0.5 text-brand">
                      @{selectedReg.username}
                    </p>
                    {selectedReg.bio && (
                      <p className="text-xs text-ink-2 mt-2.5 leading-relaxed line-clamp-3 bg-bg-soft/40 p-2.5 rounded-xl border border-line-soft">{selectedReg.bio}</p>
                    )}
                  </div>
                </div>

                {/* ── Status Badges ── */}
                <div className="flex flex-wrap gap-2 pt-1">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[9px] font-mono font-bold tracking-[0.08em]" style={
                    selectedReg.is_verified
                      ? { background: 'linear-gradient(135deg, #F25A2B, #7C5CFF)', color: 'white', boxShadow: '0 4px 12px -4px rgba(242,90,43,0.35)' }
                      : { background: 'var(--bg-soft)', color: 'var(--ink-3)', border: '1px solid var(--line-soft)' }
                  }>
                    <CheckCircle2 className="w-3 h-3" />
                    {selectedReg.is_verified ? 'VERIFIED' : 'PENDING'}
                  </span>

                  {selectedReg.is_blocked && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[9px] font-mono font-bold tracking-[0.08em] bg-hot/10 text-hot border border-hot/20">
                      <XCircle className="w-3 h-3" />
                      SUSPENDED
                    </span>
                  )}

                  {selectedReg.feature_founding_card && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[9px] font-mono font-bold tracking-[0.08em] bg-brand-3/10 text-brand-3 border border-brand-3/20 shadow-[0_0_12px_rgba(124,92,255,0.15)]">
                      <Award className="w-3 h-3" />
                      FOUNDING CARD
                    </span>
                  )}

                  {selectedReg.role && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-[0.08em]" style={{
                      background: 'var(--bg-soft)',
                      color: selectedReg.role === 'artist' ? 'var(--brand-3)' : selectedReg.role === 'venue' ? 'var(--brand-2)' : selectedReg.role === 'vendor' ? 'var(--brand-1)' : 'var(--ink-3)',
                      border: '1px solid var(--line-soft)'
                    }}>
                      {selectedReg.role}
                    </span>
                  )}
                </div>

                {/* ── Quick Actions ── */}
                <div className="bg-bg-soft/30 border border-line-soft rounded-2xl p-5 space-y-4">
                  <p className="text-[10px] font-mono font-bold uppercase tracking-[0.12em] text-ink-3">Clearance Actions</p>
                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      onClick={() => handleVerifyAndLock(selectedReg)}
                      className="py-2.5 rounded-xl text-[10px] font-mono font-bold tracking-[0.06em] uppercase flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                      style={selectedReg.is_verified ? {
                        background: 'var(--bg-soft)', color: 'var(--brand-3)', border: '1px solid rgba(124,92,255,0.2)',
                      } : {
                        background: 'linear-gradient(135deg, #F25A2B, #7C5CFF)', color: 'white', border: 'none',
                        boxShadow: '0 4px 16px -4px rgba(242,90,43,0.4)',
                      }}
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      {selectedReg.is_verified ? 'Unverify' : 'Verify'}
                    </button>

                    <button
                      onClick={() => handleToggleBlock(selectedReg)}
                      className="py-2.5 rounded-xl text-[10px] font-mono font-bold tracking-[0.06em] uppercase flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                      style={selectedReg.is_blocked ? {
                        background: 'rgba(255,75,75,0.1)', color: 'var(--hot)', border: '1px solid rgba(255,75,75,0.2)',
                      } : {
                        background: 'var(--bg-soft)', color: 'var(--ink-3)', border: '1px solid var(--line-soft)',
                      }}
                    >
                      <XCircle className="w-3 h-3" />
                      {selectedReg.is_blocked ? 'Restore' : 'Suspend'}
                    </button>

                    <button
                      onClick={() => handleToggleFoundingCard(selectedReg)}
                      className="py-2.5 rounded-xl text-[10px] font-mono font-bold tracking-[0.06em] uppercase flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                      style={selectedReg.feature_founding_card ? {
                        background: 'rgba(124,92,255,0.1)', color: 'var(--brand-3)', border: '1px solid rgba(124,92,255,0.2)',
                      } : {
                        background: 'var(--bg-soft)', color: 'var(--ink-3)', border: '1px solid var(--line-soft)',
                      }}
                    >
                      <Award className="w-3 h-3" />
                      {selectedReg.feature_founding_card ? 'Unfeat.' : 'Feature'}
                    </button>

                    <button
                      onClick={() => handleToggleExcludeFromWaitlist(selectedReg)}
                      className="py-2.5 rounded-xl text-[10px] font-mono font-bold tracking-[0.06em] uppercase flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                      style={selectedReg.exclude_from_waitlist ? {
                        background: 'rgba(242,90,43,0.15)', color: 'var(--brand-1)', border: '1px solid rgba(242,90,43,0.25)',
                      } : {
                        background: 'var(--bg-soft)', color: 'var(--ink-3)', border: '1px solid var(--line-soft)',
                      }}
                    >
                      <UserMinus className="w-3 h-3" />
                      {selectedReg.exclude_from_waitlist ? 'Include Rank' : 'Exclude Rank'}
                    </button>
                  </div>
                </div>

                <div className="h-px bg-line-soft" />

                {/* ── Category & Genres ── */}
                {(selectedReg.category || (selectedReg.genres && selectedReg.genres.length > 0)) && (
                  <div>
                    <p className="text-[10px] font-mono font-bold uppercase tracking-[0.12em] text-ink-3 mb-3">Classification & Genres</p>
                    {selectedReg.category && (
                      <p className="text-sm text-ink capitalize mb-2.5 font-semibold">{selectedReg.category.replace('_', ' ')}</p>
                    )}
                    {selectedReg.genres && selectedReg.genres.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {selectedReg.genres.map(g => (
                          <span key={g} className="text-[10px] font-mono px-2.5 py-1 rounded-lg text-ink-2 bg-bg-soft/40 border border-line-soft">#{g}</span>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* ── Contact Info ── */}
                <div>
                  <p className="text-[10px] font-mono font-bold uppercase tracking-[0.12em] text-ink-3 mb-3">System Contact Details</p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 text-sm bg-bg-soft/20 p-2.5 rounded-xl border border-line-soft">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-bg-soft border border-line-soft shrink-0">
                        <Mail className="w-3.5 h-3.5 text-ink-2" />
                      </div>
                      <span className="text-ink font-mono text-xs truncate flex-1">{selectedReg.email}</span>
                    </div>
                    {selectedReg.phone && (
                      <div className="flex items-center gap-3 text-sm bg-bg-soft/20 p-2.5 rounded-xl border border-line-soft">
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-bg-soft border border-line-soft shrink-0">
                          <Smartphone className="w-3.5 h-3.5 text-ink-2" />
                        </div>
                        <span className="text-ink font-mono text-xs flex-1">{selectedReg.phone}</span>
                      </div>
                    )}
                    {selectedReg.city && (
                      <div className="flex items-center gap-3 text-sm bg-bg-soft/20 p-2.5 rounded-xl border border-line-soft">
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-bg-soft border border-line-soft shrink-0">
                          <MapPin className="w-3.5 h-3.5 text-ink-2" />
                        </div>
                        <span className="text-ink text-xs flex-1 font-medium">{selectedReg.city}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* ── Social Links ── */}
                {(selectedReg.instagram_url || selectedReg.spotify_url || selectedReg.youtube_url || selectedReg.youtube_channel_url) && (
                  <>
                    <div className="h-px bg-line-soft" />
                    <div>
                      <p className="text-[10px] font-mono font-bold uppercase tracking-[0.12em] text-ink-3 mb-3">External Portals</p>
                      <div className="grid grid-cols-2 gap-2">
                        {selectedReg.instagram_url && (
                          <a href={selectedReg.instagram_url.startsWith('http') ? selectedReg.instagram_url : `https://instagram.com/${selectedReg.instagram_url}`} target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-3 p-3 rounded-xl bg-bg-soft/40 border border-line-soft hover:bg-bg-soft hover:border-line-soft/80 transition-all group">
                            <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'linear-gradient(135deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)', }}>
                              <span className="text-white text-[9px] font-black">IG</span>
                            </div>
                            <span className="text-xs font-mono text-ink-2 truncate flex-1 group-hover:text-ink">Instagram</span>
                            <ExternalLink className="w-3.5 h-3.5 text-ink-3 group-hover:text-ink transition-colors" />
                          </a>
                        )}
                        {selectedReg.spotify_url && (
                          <a href={selectedReg.spotify_url.startsWith('http') ? selectedReg.spotify_url : `https://open.spotify.com/artist/${selectedReg.spotify_url}`} target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-3 p-3 rounded-xl bg-bg-soft/40 border border-line-soft hover:bg-bg-soft hover:border-line-soft/80 transition-all group">
                            <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-[#1DB954] shrink-0">
                              <span className="text-white text-[9px] font-black">SP</span>
                            </div>
                            <span className="text-xs font-mono text-ink-2 truncate flex-1 group-hover:text-ink">Spotify</span>
                            <ExternalLink className="w-3.5 h-3.5 text-ink-3 group-hover:text-ink transition-colors" />
                          </a>
                        )}
                        {(selectedReg.youtube_url || selectedReg.youtube_channel_url) && (
                          <a href={(selectedReg.youtube_channel_url || selectedReg.youtube_url || '').startsWith('http') ? (selectedReg.youtube_channel_url || selectedReg.youtube_url || '') : `https://youtube.com/@${selectedReg.youtube_channel_url || selectedReg.youtube_url}`} target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-3 p-3 rounded-xl bg-bg-soft/40 border border-line-soft hover:bg-bg-soft hover:border-line-soft/80 transition-all group col-span-2">
                            <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-[#FF0000] shrink-0">
                              <span className="text-white text-[9px] font-black">YT</span>
                            </div>
                            <span className="text-xs font-mono text-ink-2 truncate flex-1 group-hover:text-ink">YouTube</span>
                            <ExternalLink className="w-3.5 h-3.5 text-ink-3 group-hover:text-ink transition-colors" />
                          </a>
                        )}
                      </div>
                    </div>
                  </>
                )}

                {/* ── Gallery Photos ── */}
                {selectedReg.gallery_photos && selectedReg.gallery_photos.length > 0 && (
                  <>
                    <div className="h-px bg-line-soft" />
                    <div>
                      <p className="text-[10px] font-mono font-bold uppercase tracking-[0.12em] text-ink-3 mb-3">Gallery Nodes ({selectedReg.gallery_photos.length})</p>
                      <div className="grid grid-cols-2 gap-2">
                        {selectedReg.gallery_photos.map((photo, i) => (
                          <img key={i} src={photo} alt="" className="w-full aspect-square object-cover rounded-xl border border-line-soft" />
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* ── Custom Status ── */}
                {selectedReg.custom_status_message && (
                  <>
                    <div className="h-px bg-line-soft" />
                    <div>
                      <p className="text-[10px] font-mono font-bold uppercase tracking-[0.12em] text-ink-3 mb-3">Custom Status</p>
                      <p className="text-xs text-ink bg-bg-soft/40 border border-line-soft rounded-xl p-4 italic">
                        &ldquo;{selectedReg.custom_status_message}&rdquo;
                      </p>
                    </div>
                  </>
                )}

                <div className="h-px bg-line-soft" />

                {/* ── Position & Meta ── */}
                <div className="bg-bg-soft/30 border border-line-soft rounded-2xl p-5 space-y-4">
                  <p className="text-[10px] font-mono font-bold uppercase tracking-[0.12em] text-ink-3">Queue Management & Metrics</p>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-ink-2 font-mono">Queue Override:</span>
                    <input
                      type="number"
                      placeholder="Auto"
                      value={selectedReg.position_override ?? ''}
                      onChange={(e) => {
                        const val = e.target.value === '' ? null : parseInt(e.target.value, 10);
                        handleSavePositionOverride(selectedReg.user_id, val);
                      }}
                      className="w-16 bg-bg-soft border border-line-soft rounded-lg py-1 px-1.5 text-xs text-ink text-center font-mono focus:outline-none focus:border-brand transition-all animate-pulse"
                    />
                    <span className="text-[10px] font-mono text-ink-3">
                      {selectedReg.position_override ? `#${selectedReg.position_override}` : 'Auto-Queue'}
                    </span>
                  </div>
                  
                  <div className="space-y-2 pt-2 border-t border-line-soft text-[11px] font-mono text-ink-2">
                    <div className="flex justify-between">
                      <span className="text-ink-3">Registered At:</span>
                      <span>{new Date(selectedReg.reserved_at).toLocaleString()}</span>
                    </div>
                    {selectedReg.referred_by && (
                      <div className="flex justify-between">
                        <span className="text-ink-3">Referred By:</span>
                        <span className="text-brand">@{selectedReg.referred_by}</span>
                      </div>
                    )}
                    {selectedReg.profile_visitors_count !== undefined && selectedReg.profile_visitors_count > 0 && (
                      <div className="flex justify-between">
                        <span className="text-ink-3">Profile Views:</span>
                        <span className="text-ink">{selectedReg.profile_visitors_count}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Portfolio link */}
                <a
                  href={`/${selectedReg.username}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl text-[10px] font-mono font-bold tracking-[0.08em] uppercase transition-all cursor-pointer bg-bg-soft border border-line-soft hover:bg-bg-soft-hover text-ink shadow-md"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Inspect Live Page
                </a>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
