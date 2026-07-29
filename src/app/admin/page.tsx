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
  adminRemoveAdminAction,
  adminGetBookingRequestsAction,
  adminUpdateBookingRequestStatusAction,
  adminDeleteBookingRequestAction,
  type BookingRequestEntry
} from "@/lib/admin-actions";
import { 
  sendWelcomeEmailAction, 
  sendMassEmailAction 
} from "@/lib/email-actions";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "next-themes";
import { signInWithGoogle, signInWithEmail, signOut as firebaseSignOut } from "@/lib/auth";
import { motion, AnimatePresence } from "motion/react";
import { ToastNotification } from "@/components/ToastNotification";
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
  UserCheck,
  UserMinus,
  ExternalLink,
  Shield,
  Zap,
  Sun,
  Moon,
  Paperclip,
  Sparkles,
  Tag,
  Layers3,
  FileUp,
  LayoutDashboard,
  Filter,
  Check,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Link2,
  Heading1,
  Heading2,
  AlignLeft,
  AlignCenter,
  Type,
  Code,
  Minus,
  Quote,
  Undo2,
  Redo2,
  Crown,
  Ticket,
  Laptop,
  Radio,
  Palette,
  AtSign,
} from "lucide-react";
import type { EmailAttachmentItem } from "@/lib/mailer";

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

  // Booking Requests State
  const [bookingRequests, setBookingRequests] = useState<BookingRequestEntry[]>([]);
  const [requestSearchQuery, setRequestSearchQuery] = useState("");
  const [requestStatusFilter, setRequestStatusFilter] = useState<string>("all");
  const [kanbanView, setKanbanView] = useState<"kanban" | "table">("kanban");
  const [selectedBookingDetail, setSelectedBookingDetail] = useState<BookingRequestEntry | null>(null);
  
  // Command Palette & Global Search State
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [commandSearch, setCommandSearch] = useState("");
  
  // Tabs: overview | registrations | emails | requests | leaderboards | members | admins
  const [activeTab, setActiveTab] = useState<"overview" | "registrations" | "emails" | "requests" | "leaderboards" | "members" | "admins">("overview");
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
  // Email Broadcast Engine State & Multi-Template Studio
  // ---------------------------------------------------------------------------
  const [emailTemplateType, setEmailTemplateType] = useState<"standard" | "welcome" | "vip" | "newsletter" | "raw" | "migrated_artist">("standard");
  const [emailSubject, setEmailSubject] = useState("Exclusive early access keys for ArtisTant 🚀");
  const [emailPillTag, setEmailPillTag] = useState("⚡ WAITLIST ACTIVE");
  const [emailHeader, setEmailHeader] = useState("Your ArtisTant waitlist handle is secured.");
  const [emailBody, setEmailBody] = useState(
    "We are opening the first stage of beta onboarding. Build your verified profile, set up your Bookability Score rating, and secure your event bookings early.\n\nClick the link below to verify your device credentials."
  );
  const [emailCtaText, setEmailCtaText] = useState("Claim Access Keys");
  const [emailCtaUrl, setEmailCtaUrl] = useState("https://artistant.in");
  const [emailCtaTheme, setEmailCtaTheme] = useState<"purple" | "flame" | "emerald" | "dark" | "ghost">("purple");
  const [emailClientTheme, setEmailClientTheme] = useState<"dark" | "light">("dark");
  const [emailAlias, setEmailAlias] = useState("official");
  const [emailAudienceMode, setEmailAudienceMode] = useState<"all" | "filtered" | "selected" | "migrated_artists">("all");
  const [showAudienceDropdown, setShowAudienceDropdown] = useState(false);
  const [showAliasDropdown, setShowAliasDropdown] = useState(false);
  const [showRecipientDrawer, setShowRecipientDrawer] = useState(false);
  const [testEmailSending, setTestEmailSending] = useState(false);

  // Attachments State
  const [emailAttachments, setEmailAttachments] = useState<EmailAttachmentItem[]>([
    {
      id: "att-1",
      title: "ArtisTant_Founding_Artist_Guide.pdf",
      fileType: "PDF",
      size: "1.8 MB",
      url: "https://artistant.in/docs/Founding_Artist_Guide.pdf",
      description: "Official guide on points, perks, and verified badge setup."
    }
  ]);
  const [newAttTitle, setNewAttTitle] = useState("");
  const [newAttType, setNewAttType] = useState("PDF");
  const [newAttSize, setNewAttSize] = useState("");
  const [newAttUrl, setNewAttUrl] = useState("");
  const [newAttDesc, setNewAttDesc] = useState("");
  const [showAddAttachmentModal, setShowAddAttachmentModal] = useState(false);

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

  // Command Palette Keyboard Listener (Cmd + K or Ctrl + K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setShowCommandPalette(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Batch Operations Handlers
  const handleBatchVerify = async () => {
    if (selectedUserIds.length === 0) return;
    setIsLoading(true);
    try {
      const idToken = await getIdToken();
      for (const userId of selectedUserIds) {
        const reg = registrations.find(r => r.id === userId || r.user_id === userId);
        if (reg) {
          await adminUpdateRegistrationAction(
            idToken,
            reg.user_id || reg.id,
            true,
            reg.is_blocked,
            reg.position_override,
            reg.feature_founding_card ?? false,
            reg.exclude_from_waitlist ?? false
          );
        }
      }
      showToast(`Successfully verified ${selectedUserIds.length} user(s)!`);
      await verifyAndLoad(true);
      setSelectedUserIds([]);
    } catch (err: any) {
      showToast(`Batch verify failed: ${err.message || 'Error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBatchFeature = async () => {
    if (selectedUserIds.length === 0) return;
    setIsLoading(true);
    try {
      const idToken = await getIdToken();
      for (const userId of selectedUserIds) {
        const reg = registrations.find(r => r.id === userId || r.user_id === userId);
        if (reg) {
          await adminUpdateRegistrationAction(
            idToken,
            reg.user_id || reg.id,
            reg.is_verified,
            reg.is_blocked,
            reg.position_override,
            true,
            reg.exclude_from_waitlist ?? false
          );
        }
      }
      showToast(`Featured ${selectedUserIds.length} founding card(s)!`);
      await verifyAndLoad(true);
      setSelectedUserIds([]);
    } catch (err: any) {
      showToast(`Batch feature failed: ${err.message || 'Error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBatchExclude = async () => {
    if (selectedUserIds.length === 0) return;
    setIsLoading(true);
    try {
      const idToken = await getIdToken();
      for (const userId of selectedUserIds) {
        const reg = registrations.find(r => r.id === userId || r.user_id === userId);
        if (reg) {
          await adminUpdateRegistrationAction(
            idToken,
            reg.user_id || reg.id,
            reg.is_verified,
            reg.is_blocked,
            reg.position_override,
            reg.feature_founding_card ?? false,
            true
          );
        }
      }
      showToast(`Excluded ${selectedUserIds.length} user(s) from waitlist ranking!`);
      await verifyAndLoad(true);
      setSelectedUserIds([]);
    } catch (err: any) {
      showToast(`Batch exclude failed: ${err.message || 'Error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBatchEmailHandoff = () => {
    if (selectedUserIds.length === 0) return;
    setEmailAudienceMode("selected");
    setActiveTab("emails");
    showToast(`Broadcast Studio loaded with ${selectedUserIds.length} target user(s)!`);
  };

  const handleBatchExportCSV = () => {
    const targets = selectedUserIds.length > 0 
      ? registrations.filter(r => selectedUserIds.includes(r.id) || selectedUserIds.includes(r.user_id))
      : registrations;

    if (targets.length === 0) {
      showToast("No registrations available to export.");
      return;
    }

    const headers = ["Username", "Display Name", "Email", "Phone", "Role", "Category", "City", "Verified", "Blocked", "Reserved At"];
    const rows = targets.map(r => [
      `"${r.username || ''}"`,
      `"${r.display_name || ''}"`,
      `"${r.email || ''}"`,
      `"${r.phone || ''}"`,
      `"${r.role || ''}"`,
      `"${r.category || ''}"`,
      `"${r.city || ''}"`,
      r.is_verified ? "Yes" : "No",
      r.is_blocked ? "Yes" : "No",
      `"${r.reserved_at || ''}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `artistant_waitlist_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Exported ${targets.length} registrations to CSV!`);
  };



  // ---------------------------------------------------------------------------
  // API Fetch & Authentication
  // ---------------------------------------------------------------------------
  const verifyAndLoad = async (isSilent = false) => {
    if (!isSilent) setIsLoading(true);
    setAuthError("");
    setDbError(null);
    try {
      const idToken = await getIdToken();
      const [regs, logs, admins, bRequests] = await Promise.all([
        adminGetRegistrationsAction(idToken),
        adminGetActivityLogsAction(idToken),
        adminGetAdminsAction(idToken),
        adminGetBookingRequestsAction(idToken).catch(err => {
          console.warn("Error fetching booking requests:", err);
          return [];
        })
      ]);
      setRegistrations(regs);
      setActivityLogs(logs);
      setAdminUsers(admins);
      setBookingRequests(bRequests || []);
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

        const sandboxRequests = localStorage.getItem("artistant_sandbox_booking_requests");
        setBookingRequests(sandboxRequests ? JSON.parse(sandboxRequests) : []);
        
        setIsLiveMode(false);
        setIsUnlocked(true);
      }
    } finally {
      if (!isSilent) setIsLoading(false);
    }
  };

  const handleUpdateBookingStatus = async (requestId: string, newStatus: 'pending' | 'contacted' | 'confirmed' | 'archived') => {
    const prev = [...bookingRequests];
    const updated = bookingRequests.map(r => r.id === requestId ? { ...r, status: newStatus } : r);
    setBookingRequests(updated);
    try {
      if (isLiveMode) {
        const idToken = await getIdToken();
        await adminUpdateBookingRequestStatusAction(idToken, requestId, newStatus);
        showToast(`Updated request status to ${newStatus.toUpperCase()}`);
      } else {
        localStorage.setItem("artistant_sandbox_booking_requests", JSON.stringify(updated));
        showToast(`Sandbox: Updated status to ${newStatus.toUpperCase()}`);
      }
    } catch (err: any) {
      setBookingRequests(prev);
      showToast(`Failed to update status: ${err.message || 'Error'}`);
    }
  };

  const handleDeleteBookingRequest = async (requestId: string) => {
    if (!window.confirm("Are you sure you want to delete this booking request?")) return;
    const prev = [...bookingRequests];
    const updated = bookingRequests.filter(r => r.id !== requestId);
    setBookingRequests(updated);
    try {
      if (isLiveMode) {
        const idToken = await getIdToken();
        await adminDeleteBookingRequestAction(idToken, requestId);
        showToast("Booking request deleted.");
      } else {
        localStorage.setItem("artistant_sandbox_booking_requests", JSON.stringify(updated));
        showToast("Sandbox: Request deleted.");
      }
    } catch (err: any) {
      setBookingRequests(prev);
      showToast(`Failed to delete request: ${err.message || 'Error'}`);
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
  const isTargetMatch = (r: AdminWaitlistEntry | null, reg: { user_id?: string | null; id?: string | null }) => {
    if (!r || !reg) return false;
    if (r.id && reg.id && r.id === reg.id) return true;
    if (r.user_id && reg.user_id && r.user_id === reg.user_id) return true;
    return false;
  };

  const handleVerifyAndLock = async (reg: AdminWaitlistEntry) => {
    const nextState = !reg.is_verified;
    const targetId = reg.user_id || reg.id;
    const prevRegistrations = [...registrations];
    const prevSelected = selectedReg;

    const updated = registrations.map(r => {
      if (isTargetMatch(r, reg)) return { ...r, is_verified: nextState };
      return r;
    });
    setRegistrations(updated);
    if (selectedReg && isTargetMatch(selectedReg, reg)) {
      setSelectedReg(prev => prev ? { ...prev, is_verified: nextState } : null);
    }

    try {
      if (isLiveMode) {
        const idToken = await getIdToken();
        const res = await adminUpdateRegistrationAction(
          idToken, 
          targetId, 
          nextState, 
          reg.is_blocked, 
          reg.position_override, 
          reg.feature_founding_card ?? false,
          reg.exclude_from_waitlist ?? false
        );
        if (res && !res.success) {
          setRegistrations(prevRegistrations);
          setSelectedReg(prevSelected);
          showToast(`Error updating database: ${res.message || 'Action failed'}`);
          return;
        }
        if (nextState) {
          showToast(`User Verified. Verification Email Dispatched to @${reg.username}!`);
        } else {
          showToast(`Verification revoked for @${reg.username}`);
        }
      } else {
        localStorage.setItem("artistant_sandbox_registrations", JSON.stringify(updated));
        showToast(`Sandbox: @${reg.username} verification updated!`);
      }
    } catch (err: any) {
      console.error("Error updating database for verify action:", err);
      setRegistrations(prevRegistrations);
      setSelectedReg(prevSelected);
      showToast(`Error updating database: ${err.message || 'Action failed'}`);
    }
  };

  const handleToggleBlock = async (reg: AdminWaitlistEntry) => {
    const nextState = !reg.is_blocked;
    const targetId = reg.user_id || reg.id;
    const prevRegistrations = [...registrations];
    const prevSelected = selectedReg;

    const updated = registrations.map(r => {
      if (isTargetMatch(r, reg)) return { ...r, is_blocked: nextState };
      return r;
    });
    setRegistrations(updated);
    if (selectedReg && isTargetMatch(selectedReg, reg)) {
      setSelectedReg(prev => prev ? { ...prev, is_blocked: nextState } : null);
    }

    try {
      if (isLiveMode) {
        const idToken = await getIdToken();
        const res = await adminUpdateRegistrationAction(
          idToken, 
          targetId, 
          reg.is_verified, 
          nextState, 
          reg.position_override, 
          reg.feature_founding_card ?? false,
          reg.exclude_from_waitlist ?? false
        );
        if (res && !res.success) {
          setRegistrations(prevRegistrations);
          setSelectedReg(prevSelected);
          showToast(`Error saving block status: ${res.message || 'Action failed'}`);
          return;
        }
        showToast(`User @${reg.username} block status toggled!`);
      } else {
        localStorage.setItem("artistant_sandbox_registrations", JSON.stringify(updated));
        showToast(`Sandbox: @${reg.username} block state updated!`);
      }
    } catch (err: any) {
      console.error("Error updating database for block action:", err);
      setRegistrations(prevRegistrations);
      setSelectedReg(prevSelected);
      showToast(`Error saving block status: ${err.message || 'Action failed'}`);
    }
  };

  const handleToggleFoundingCard = async (reg: AdminWaitlistEntry) => {
    const nextState = !reg.feature_founding_card;
    const targetId = reg.user_id || reg.id;
    const prevRegistrations = [...registrations];
    const prevSelected = selectedReg;

    const updated = registrations.map(r => {
      if (isTargetMatch(r, reg)) return { ...r, feature_founding_card: nextState };
      return r;
    });
    setRegistrations(updated);
    if (selectedReg && isTargetMatch(selectedReg, reg)) {
      setSelectedReg(prev => prev ? { ...prev, feature_founding_card: nextState } : null);
    }

    try {
      if (isLiveMode) {
        const idToken = await getIdToken();
        const res = await adminUpdateRegistrationAction(
          idToken, 
          targetId, 
          reg.is_verified, 
          reg.is_blocked, 
          reg.position_override, 
          nextState,
          reg.exclude_from_waitlist ?? false
        );
        if (res && !res.success) {
          setRegistrations(prevRegistrations);
          setSelectedReg(prevSelected);
          showToast(`Error saving founding card status: ${res.message || 'Action failed'}`);
          return;
        }
        showToast(nextState ? `Featured @${reg.username} as Founding Card!` : `Unfeatured @${reg.username} as Founding Card.`);
      } else {
        localStorage.setItem("artistant_sandbox_registrations", JSON.stringify(updated));
        showToast(`Sandbox: @${reg.username} founding card toggled!`);
      }
    } catch (err: any) {
      console.error("Error updating database for founding card action:", err);
      setRegistrations(prevRegistrations);
      setSelectedReg(prevSelected);
      showToast(`Error saving founding card status: ${err.message || 'Action failed'}`);
    }
  };

  const handleToggleExcludeFromWaitlist = async (reg: AdminWaitlistEntry) => {
    const nextState = !reg.exclude_from_waitlist;
    const targetId = reg.user_id || reg.id;
    const prevRegistrations = [...registrations];
    const prevSelected = selectedReg;

    const updated = registrations.map(r => {
      if (isTargetMatch(r, reg)) return { ...r, exclude_from_waitlist: nextState };
      return r;
    });
    setRegistrations(updated);
    if (selectedReg && isTargetMatch(selectedReg, reg)) {
      setSelectedReg(prev => prev ? { ...prev, exclude_from_waitlist: nextState } : null);
    }

    try {
      if (isLiveMode) {
        const idToken = await getIdToken();
        const res = await adminUpdateRegistrationAction(
          idToken, 
          targetId, 
          reg.is_verified, 
          reg.is_blocked, 
          reg.position_override, 
          reg.feature_founding_card ?? false,
          nextState
        );
        if (res && !res.success) {
          setRegistrations(prevRegistrations);
          setSelectedReg(prevSelected);
          showToast(`Error saving waitlist exclusion status: ${res.message || 'Action failed'}`);
          return;
        }
        showToast(nextState ? `Excluded @${reg.username} from waitlist rank.` : `Restored waitlist rank for @${reg.username}.`);
      } else {
        localStorage.setItem("artistant_sandbox_registrations", JSON.stringify(updated));
        showToast(`Sandbox: @${reg.username} rank exclusion toggled!`);
      }
    } catch (err: any) {
      console.error("Error updating database for exclude action:", err);
      setRegistrations(prevRegistrations);
      setSelectedReg(prevSelected);
      showToast(`Error saving waitlist exclusion status: ${err.message || 'Action failed'}`);
    }
  };

  const sortRegistrations = (entries: AdminWaitlistEntry[]): AdminWaitlistEntry[] => {
    return [...entries].sort((a, b) => {
      const posA = a.position_override !== null && a.position_override !== undefined ? a.position_override : Infinity;
      const posB = b.position_override !== null && b.position_override !== undefined ? b.position_override : Infinity;
      if (posA !== posB) {
        return posA - posB;
      }
      return new Date(b.reserved_at).getTime() - new Date(a.reserved_at).getTime();
    });
  };

  const handleSavePositionOverride = async (reg: AdminWaitlistEntry, val: number | null) => {
    const prevRegistrations = [...registrations];
    const prevSelected = selectedReg;
    const targetId = reg.user_id || reg.id;

    const updated = registrations.map(r => {
      if (isTargetMatch(r, reg)) return { ...r, position_override: val };
      return r;
    });

    const sortedUpdated = sortRegistrations(updated);
    setRegistrations(sortedUpdated);
    if (selectedReg && isTargetMatch(selectedReg, reg)) {
      setSelectedReg(prev => prev ? { ...prev, position_override: val } : null);
    }

    try {
      if (isLiveMode) {
        const idToken = await getIdToken();
        const res = await adminUpdateRegistrationAction(
          idToken, 
          targetId, 
          reg.is_verified, 
          reg.is_blocked, 
          val, 
          reg.feature_founding_card ?? false,
          reg.exclude_from_waitlist ?? false
        );
        if (res && !res.success) {
          setRegistrations(prevRegistrations);
          setSelectedReg(prevSelected);
          showToast(`Failed to save priority override: ${res.message || 'Action failed'}`);
          return;
        }
        showToast(`Priority Override set to position ${val ?? "Auto"}!`);
      } else {
        localStorage.setItem("artistant_sandbox_registrations", JSON.stringify(sortedUpdated));
        showToast(`Sandbox: Override saved.`);
      }
    } catch (err: any) {
      console.error("Error saving priority override:", err);
      setRegistrations(prevRegistrations);
      setSelectedReg(prevSelected);
      showToast(`Failed to save priority override: ${err.message || 'Action failed'}`);
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
  const getSelectedRecipientsList = () => {
    if (emailAudienceMode === "migrated_artists") {
      return registrations.filter(r => (r.user_id?.startsWith('imported_') || (r as any).is_migrated) && !r.is_blocked);
    }
    if (emailAudienceMode === "selected" && selectedUserIds.length > 0) {
      return registrations.filter(r => selectedUserIds.includes(r.id));
    }
    if (emailAudienceMode === "filtered") {
      return filteredRegistrations;
    }
    if (roleFilter === "all" && statusFilter === "all" && !searchQuery) {
      return registrations;
    }
    return filteredRegistrations;
  };

  const loadTemplatePreset = (type: "standard" | "welcome" | "vip" | "newsletter" | "raw" | "migrated_artist") => {
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
        setEmailCtaUrl("https://artistant.in/claim");
        setEmailAlias("welcome");
        showToast("Loaded Migrated Artist Onboarding Template (69 Artists Target)!");
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
        showToast("Loaded Welcome / Onboarding Pass Template!");
        break;
      case "vip":
        setEmailPillTag("👑 VIP EXCLUSIVE PASS");
        setEmailSubject("VIP Founder Access Pass Granted 🌟");
        setEmailHeader("You have been selected for Early VIP Rollout");
        setEmailBody(
          "As a top-tier Founding Artist on ArtisTant, you have been unlocked for VIP Priority Concierge. Enjoy zero platform commissions on your first 5 bookings and direct concierge assistance.\n\nClaim your VIP Pass key below before public access opens."
        );
        setEmailCtaText("Claim VIP Access Pass");
        setEmailCtaUrl("https://artistant.in/claim");
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
        showToast("Loaded Newsletter & Release Notes Template!");
        break;
      case "raw":
        setEmailPillTag("DIRECT MAIL");
        setEmailSubject("Quick Note from ArtisTant Team");
        setEmailHeader("Direct Notification");
        setEmailBody(
          "Hello {{name}},\n\nThis is a direct message regarding your account status and upcoming events on ArtisTant.\n\nPlease reply directly to this email or reach out via support if you need any assistance."
        );
        setEmailCtaText("Visit Account");
        setEmailCtaUrl("https://artistant.in");
        setEmailAlias("official");
        showToast("Loaded No-Template (Direct Canvas) Mode!");
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
        showToast("Loaded Standard Broadcast Template!");
        break;
    }
  };

  const handleAddAttachment = () => {
    if (!newAttTitle.trim() || !newAttUrl.trim()) {
      showToast("Please provide an attachment title and download URL.");
      return;
    }
    const item: EmailAttachmentItem = {
      id: `att-${Date.now()}`,
      title: newAttTitle.trim(),
      fileType: newAttType || "FILE",
      size: newAttSize.trim() || "1.2 MB",
      url: newAttUrl.trim(),
      description: newAttDesc.trim() || undefined,
    };
    setEmailAttachments(prev => [...prev, item]);
    setNewAttTitle("");
    setNewAttSize("");
    setNewAttUrl("");
    setNewAttDesc("");
    setShowAddAttachmentModal(false);
    showToast("Attachment added successfully!");
  };

  const handleRemoveAttachment = (id?: string) => {
    setEmailAttachments(prev => prev.filter(att => att.id !== id));
    showToast("Attachment removed.");
  };

  const loadMigrationCampaignPreset = () => {
    const migrated = registrations.filter(r => r.user_id?.startsWith('imported_') && r.role === 'artist');
    if (migrated.length === 0) {
      showToast("No pending migrated artists found (all profiles claimed or none imported).");
      return;
    }

    setSelectedUserIds(migrated.map(r => r.id));
    setEmailAudienceMode("selected");
    setEmailTemplateType("welcome");
    setEmailPillTag("⚡ ONBOARDING PASS");
    setEmailSubject("You're First in Line: Claim Your ArtisTant Username! 🚀");
    setEmailHeader("Founding Artist Exclusive Onboarding");
    setEmailBody(
      "As one of our founding artists on the previous waitlist, we wanted to ensure you get VIP treatment.\n\n" +
      "You are officially first in line for our new exclusive waitlist! We've automatically migrated your profile. Now it's time to secure your unique @username before the platform opens to the public.\n\n" +
      "Click the button below to head to the platform, authenticate, and officially claim your handle!"
    );
    setEmailCtaText("Claim My Username");
    setEmailCtaUrl("https://artistant.in/claim");
    setEmailAlias("official");
    setActiveTab("emails");
    showToast(`Preset Loaded! Selected ${migrated.length} migrated artist(s) & opened Email Studio.`);
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

    if (!window.confirm(`Initiate mass email broadcast using template [${emailTemplateType.toUpperCase()}] to ${targets.length} waitlisted users?`)) {
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
    log(`Selected Template: "${emailTemplateType.toUpperCase()}" (Pill Tag: "${emailPillTag}")`);
    log(`Attached Resources: ${emailAttachments.length} file(s)`);
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
        templateType: emailTemplateType,
        emailHeader: emailHeader,
        pillTag: emailPillTag,
        attachments: emailAttachments,
      });

      if (res.success) {
        log(`Broadcast Complete. Verification results:`);
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
    setEmailLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] Dispatching test email preview to admin (${user.email})...`]);

    try {
      const idToken = await getIdToken();
      const res = await sendMassEmailAction({
        idToken,
        recipients: [{
          email: user.email,
          name: user.displayName || "Admin",
          username: "admin",
          id: user.uid
        }],
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
        setEmailLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ✅ Test email successfully delivered to ${user.email}!`]);
        showToast(`Test email dispatched to ${user.email}`);
      } else {
        setEmailLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ❌ Test email failed: ${res.message}`]);
        showToast(`Test email error: ${res.message}`);
      }
    } catch (err: any) {
      setEmailLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ❌ Test email exception: ${err?.message || err}`]);
      showToast("Failed to send test email.");
    } finally {
      setTestEmailSending(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Leaderboards Calculation
  // ---------------------------------------------------------------------------
  const leaderboards = useMemo(() => {
    const adminEmailsSet = new Set<string>();
    adminUsers.forEach(a => {
      if (a.email) adminEmailsSet.add(a.email.toLowerCase().trim());
    });
    adminEmailsSet.add('anudeepdash2004@gmail.com');

    // Filter out users who are excluded from waitlist rank OR are admins
    const eligibleRegistrations = registrations.filter(r => {
      const email = r.email ? r.email.toLowerCase().trim() : '';
      return !r.exclude_from_waitlist && !adminEmailsSet.has(email);
    });

    const referralCounts: Record<string, number> = {};
    registrations.forEach(r => {
      if (r.referred_by) {
        const ref = r.referred_by.toLowerCase().trim();
        referralCounts[ref] = (referralCounts[ref] || 0) + 1;
      }
    });

    const enriched = eligibleRegistrations.map(reg => {
      const refs = referralCounts[reg.username.toLowerCase().trim()] || 0;
      const points = 100 + (refs * 50); // 100 base + 50 per referral
      return { ...reg, refs, points };
    });

    return enriched.sort((a, b) => {
      const posA = a.position_override !== null && a.position_override !== undefined ? a.position_override : Infinity;
      const posB = b.position_override !== null && b.position_override !== undefined ? b.position_override : Infinity;
      if (posA !== posB) {
        return posA - posB;
      }
      return b.points - a.points;
    });
  }, [registrations, adminUsers]);

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

      {/* Redesigned Notification Toast */}
      <ToastNotification 
        message={successToast}
        onClose={() => setSuccessToast(null)}
        position="top-right"
      />

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
        {/* ─── Apple Liquid Glass Sidebar Navigation Panel ─── */}
        <motion.aside 
          initial={{ x: -300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className={`fixed md:relative top-0 bottom-0 left-0 w-[290px] flex flex-col flex-shrink-0 z-40 transition-transform duration-300 md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} md:my-5 md:ml-5 md:rounded-[2.4rem] border-r md:border border-white/20 dark:border-white/10 bg-white/[0.04] dark:bg-[#0A0B12]/75 backdrop-blur-3xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.3),0_25px_60px_rgba(0,0,0,0.5)] overflow-hidden`}
        >
          {/* Top Liquid Specular Light Highlight */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent pointer-events-none" />

          {/* Brand Logo & Console Tag */}
          <div className="px-8 pt-8 pb-5">
            <a href="/" target="_blank" className="inline-block group">
              <img
                src="/logo_wordmark_flat.png"
                alt="ArtisTant"
                className="h-[21px] w-auto object-contain dark:invert-0 invert block"
              />
              <p className="text-[9.5px] font-mono font-bold tracking-[0.26em] uppercase text-[#F25A2B] mt-1 whitespace-nowrap">
                Command center
              </p>
            </a>
          </div>

          <div className="h-px mx-6 bg-gradient-to-r from-transparent via-white/20 dark:via-white/10 to-transparent" />

          {/* Navigation Links Menu */}
          <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1.5 relative text-left">
            <p className="text-[9px] font-mono font-bold tracking-[0.18em] uppercase px-4 pb-2 text-ink-3 dark:text-slate-400">
              Management Suite
            </p>
            
            <div className="space-y-1.5 relative">
              {([
                { id: "overview", label: "Executive Overview", icon: BarChart3, accent: '#00F2FE', count: null },
                { id: "registrations", label: "Waitlist Directory", icon: Users, accent: 'var(--brand-1)', count: null },
                { id: "emails", label: "Broadcast Studio", icon: Mail, accent: '#7C5CFF', count: null },
                { id: "requests", label: "Booking Requests", icon: CalendarIcon, accent: '#F25A2B', count: bookingRequests.filter(r => r.status === 'pending').length },
                { id: "leaderboards", label: "Leaderboards", icon: Trophy, accent: 'var(--brand-2)', count: null },
                { id: "members", label: "Visitor Activity", icon: Eye, accent: 'var(--brand-3)', count: null },
                { id: "admins", label: "Manage Admins", icon: Settings, accent: 'var(--brand-4)', count: null },
              ] as const).map(item => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl transition-all duration-300 text-xs font-semibold relative group overflow-hidden cursor-pointer backdrop-blur-xl ${
                      isActive
                        ? "bg-white/15 dark:bg-white/[0.08] text-ink dark:text-white border border-white/20 dark:border-white/15 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4),0_8px_20px_rgba(0,0,0,0.25)] font-bold scale-[1.01]"
                        : "text-ink-2 dark:text-slate-400 border border-transparent hover:border-white/10 hover:bg-white/10 dark:hover:bg-white/[0.04] hover:text-ink dark:hover:text-white"
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeSidebarTab"
                        className="absolute inset-0 rounded-2xl bg-gradient-to-r from-white/10 to-transparent pointer-events-none"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                    
                    <div className="flex items-center gap-3.5 z-10">
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-300 border backdrop-blur-md shadow-sm"
                        style={{
                          backgroundColor: isActive ? `${item.accent}25` : 'rgba(255,255,255,0.05)',
                          borderColor: isActive ? `${item.accent}50` : 'rgba(255,255,255,0.1)',
                          color: isActive ? item.accent : 'var(--ink-3)'
                        }}
                      >
                        <item.icon className="w-4 h-4 transition-transform group-hover:scale-110 duration-300" style={{ color: isActive ? item.accent : undefined }} />
                      </div>
                      <span className={`font-semibold transition-colors duration-200 ${isActive ? "text-ink dark:text-white font-bold" : "text-ink-2 dark:text-slate-400 group-hover:text-ink dark:group-hover:text-white"}`}>
                        {item.label}
                      </span>
                    </div>

                    {item.count !== null && item.count > 0 && (
                      <span className="z-10 px-2.5 py-0.5 rounded-full text-[9px] font-mono font-extrabold bg-[#F25A2B] text-white shadow-[0_0_10px_rgba(242,90,43,0.4)]">
                        {item.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </nav>

          {/* Console Profile & System Health readout (Apple Liquid Glass Card) */}
          <div className="p-4 border-t border-white/15 dark:border-white/10">
            <div className="bg-white/10 dark:bg-white/[0.04] border border-white/20 dark:border-white/10 rounded-3xl p-4 backdrop-blur-2xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-mono font-bold text-sm shrink-0 bg-gradient-to-br from-[#7C5CFF] to-[#D4567A] shadow-[0_4px_12px_rgba(124,92,255,0.3)] border border-white/20 relative overflow-hidden">
                  {user?.photoURL ? (
                    <img src={user.photoURL} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span>{userDisplayName ? userDisplayName[0].toUpperCase() : "A"}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-xs font-bold text-ink dark:text-white truncate" title={userDisplayName}>{userDisplayName}</p>
                  <p className="text-[9px] font-mono tracking-[0.1em] uppercase mt-0.5 text-ink-3 dark:text-slate-400 font-bold">{userRole || "Administrator"}</p>
                </div>
                <button onClick={handleLogout} className="text-ink-3 dark:text-slate-400 hover:text-red-400 transition-colors p-2 cursor-pointer rounded-xl hover:bg-white/15 dark:hover:bg-white/10" title="Sign Out">
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="mt-3 pt-3 border-t border-white/15 dark:border-white/10 flex items-center justify-between text-[10px] font-mono">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.6)] animate-pulse" />
                  <span className="text-ink-2 dark:text-slate-300 font-bold uppercase tracking-wider">Database Connection</span>
                </div>
                <span className="text-emerald-500 dark:text-emerald-400 font-bold uppercase">Active</span>
              </div>
            </div>
          </div>
        </motion.aside>

        {/* ─── Main Content Canvas ─── */}
        <main className="flex-1 overflow-y-auto relative scroll-smooth flex flex-col h-screen">
          {/* Apple Liquid Glass Floating Navbar Capsule */}
          <header className="sticky top-0 z-[45] px-4 md:px-8 pt-4 pb-2">
            <div className="mx-auto w-full max-w-[1400px] navbar-liquid-glass rounded-3xl md:rounded-full px-5 py-3 md:px-7 md:py-3.5 flex items-center justify-between shadow-2xl transition-all duration-300">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setSidebarOpen(true)}
                  className="md:hidden p-2.5 rounded-2xl border border-white/20 dark:border-white/10 bg-white/10 dark:bg-white/5 text-ink-2 dark:text-slate-300 hover:text-ink dark:hover:text-white cursor-pointer hover:bg-white/20 dark:hover:bg-white/10 transition-all backdrop-blur-xl"
                  aria-label="Open sidebar"
                >
                  <Menu className="w-4 h-4" />
                </button>
                
                <div className="flex flex-col text-left">
                  <span className="text-[9px] font-mono font-bold tracking-[0.25em] text-[#7C5CFF] uppercase">Admin Console</span>
                  <h2 className="text-base md:text-lg font-display font-bold tracking-tight text-ink dark:text-white uppercase mt-0.5" style={{ fontFamily: '"Space Grotesk", sans-serif' }}>
                    {activeTab === "overview" && "Executive Overview & Analytics"}
                    {activeTab === "registrations" && "Waitlist Directory"}
                    {activeTab === "emails" && "Email Broadcast Studio"}
                    {activeTab === "requests" && "Client Booking Requests Ops"}
                    {activeTab === "leaderboards" && "Leaderboard Rankings"}
                    {activeTab === "members" && "Visitor Activity Logs"}
                    {activeTab === "admins" && "System Administrators"}
                  </h2>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowCommandPalette(true)}
                  className="flex items-center gap-2.5 px-4 py-2 rounded-full border border-white/20 dark:border-white/10 bg-white/10 dark:bg-white/5 hover:bg-white/20 dark:hover:bg-white/10 text-ink-2 dark:text-slate-300 hover:text-ink dark:hover:text-white text-xs font-mono transition-all duration-300 cursor-pointer shadow-sm backdrop-blur-xl"
                  title="Quick Search & Command Palette (Cmd+K)"
                >
                  <Search className="w-3.5 h-3.5 text-[#7C5CFF]" />
                  <span className="hidden sm:inline">Search...</span>
                  <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 rounded-lg bg-white/15 dark:bg-white/10 border border-white/20 dark:border-white/15 text-[10px] text-ink-3 dark:text-slate-300 font-mono font-bold shadow-inner">
                    ⌘K
                  </kbd>
                </button>

                {mounted && (
                  <button
                    onClick={() => setTheme(resolvedTheme === "light" ? "dark" : "light")}
                    className="p-2.5 rounded-full border border-white/20 dark:border-white/10 bg-white/10 dark:bg-white/5 hover:bg-white/20 dark:hover:bg-white/10 text-ink-2 dark:text-slate-300 hover:text-ink dark:hover:text-white cursor-pointer transition-all duration-300 backdrop-blur-xl"
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
                  className="flex items-center gap-2 px-5 py-2 rounded-full border border-white/20 dark:border-white/15 bg-gradient-to-r from-[#7C5CFF] to-[#6342E8] hover:opacity-95 text-white text-xs font-mono font-bold uppercase tracking-wider transition-all duration-300 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4),0_8px_20px_rgba(124,92,255,0.3)] backdrop-blur-xl"
                >
                  Launch Portal <ArrowUpRight className="w-3.5 h-3.5" />
                </a>
              </div>
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
                    TAB 0: EXECUTIVE OVERVIEW & ANALYTICS
                    =================================================================== */}
                {activeTab === "overview" && (
                  <div className="space-y-8 animate-in fade-in duration-200 text-left">
                    {/* Real-time KPI Ribbon */}
                    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6">
                      <GlowingAdminCard idx={0} className="bg-bg-card border border-line-soft rounded-3xl p-6 md:p-7 backdrop-blur-xl relative overflow-hidden">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono font-bold tracking-[0.15em] uppercase text-ink-3">Total Waitlist</span>
                          <span className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"><Users className="w-4 h-4" /></span>
                        </div>
                        <div className="mt-3">
                          <span className="text-3xl font-display font-black tracking-tight text-ink">{totalCount}</span>
                          <p className="text-[10px] font-mono text-emerald-400 mt-1 flex items-center gap-1 font-bold">
                            <Zap className="w-3 h-3" /> Live Network Total
                          </p>
                        </div>
                      </GlowingAdminCard>

                      <GlowingAdminCard idx={1} className="bg-bg-card border border-line-soft rounded-3xl p-6 md:p-7 backdrop-blur-xl relative overflow-hidden">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono font-bold tracking-[0.15em] uppercase text-ink-3">Verified Creators</span>
                          <span className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20"><Award className="w-4 h-4" /></span>
                        </div>
                        <div className="mt-3">
                          <span className="text-3xl font-display font-black tracking-tight text-ink">{verifiedCount}</span>
                          <p className="text-[10px] font-mono text-purple-400 mt-1 font-bold">
                            {totalCount > 0 ? `${Math.round((verifiedCount / totalCount) * 100)}% verified ratio` : '0%'}
                          </p>
                        </div>
                      </GlowingAdminCard>

                      <GlowingAdminCard idx={2} className="bg-bg-card border border-line-soft rounded-3xl p-6 md:p-7 backdrop-blur-xl relative overflow-hidden">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono font-bold tracking-[0.15em] uppercase text-ink-3">Booking Inquiries</span>
                          <span className="p-2 rounded-xl bg-[#F25A2B]/10 text-[#F25A2B] border border-[#F25A2B]/20"><CalendarIcon className="w-4 h-4" /></span>
                        </div>
                        <div className="mt-3">
                          <span className="text-3xl font-display font-black tracking-tight text-ink">{bookingRequests.length}</span>
                          <p className="text-[10px] font-mono text-[#F25A2B] mt-1 font-bold">
                            {bookingRequests.filter(r => r.status === 'pending').length} pending action
                          </p>
                        </div>
                      </GlowingAdminCard>

                      <GlowingAdminCard idx={3} className="bg-bg-card border border-line-soft rounded-3xl p-6 md:p-7 backdrop-blur-xl relative overflow-hidden">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono font-bold tracking-[0.15em] uppercase text-ink-3">Broadcast Reach</span>
                          <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"><Mail className="w-4 h-4" /></span>
                        </div>
                        <div className="mt-3">
                          <span className="text-3xl font-display font-black tracking-tight text-ink">{totalCount}</span>
                          <p className="text-[10px] font-mono text-emerald-400 mt-1 font-bold">
                            100% deliverable target
                          </p>
                        </div>
                      </GlowingAdminCard>

                      <GlowingAdminCard idx={4} className="bg-bg-card border border-line-soft rounded-3xl p-6 md:p-7 backdrop-blur-xl relative overflow-hidden col-span-2 lg:col-span-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono font-bold tracking-[0.15em] uppercase text-ink-3">Traffic Activity</span>
                          <span className="p-2 rounded-xl bg-pink-500/10 text-pink-400 border border-pink-500/20"><Activity className="w-4 h-4" /></span>
                        </div>
                        <div className="mt-3">
                          <span className="text-3xl font-display font-black tracking-tight text-ink">{activityLogs.length}</span>
                          <p className="text-[10px] font-mono text-pink-400 mt-1 font-bold">
                            Real-time event logs
                          </p>
                        </div>
                      </GlowingAdminCard>
                    </div>

                    {/* Operations Launchpad (3 Equal Full-Width Cards) */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
                      <button
                        onClick={() => setActiveTab("emails")}
                        className="p-5 rounded-2xl bg-gradient-to-br from-[#7C5CFF]/10 to-[#7C5CFF]/5 border border-[#7C5CFF]/20 hover:border-[#7C5CFF]/40 text-left transition-all group cursor-pointer shadow-sm"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="w-9 h-9 rounded-xl bg-[#7C5CFF] text-white flex items-center justify-center shadow-md">
                            <Mail className="w-4 h-4" />
                          </div>
                          <ChevronRight className="w-4 h-4 text-[#7C5CFF] group-hover:translate-x-1 transition-transform" />
                        </div>
                        <h4 className="font-bold text-sm text-ink">Broadcast Studio</h4>
                        <p className="text-[11px] text-ink-3 mt-1">Dispatch rich HTML emails to waitlist members.</p>
                      </button>

                      <button
                        onClick={() => setActiveTab("requests")}
                        className="p-5 rounded-2xl bg-gradient-to-br from-[#F25A2B]/10 to-[#F25A2B]/5 border border-[#F25A2B]/20 hover:border-[#F25A2B]/40 text-left transition-all group cursor-pointer shadow-sm"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="w-9 h-9 rounded-xl bg-[#F25A2B] text-white flex items-center justify-center shadow-md">
                            <CalendarIcon className="w-4 h-4" />
                          </div>
                          <ChevronRight className="w-4 h-4 text-[#F25A2B] group-hover:translate-x-1 transition-transform" />
                        </div>
                        <h4 className="font-bold text-sm text-ink">Booking Requests Ops</h4>
                        <p className="text-[11px] text-ink-3 mt-1">Manage client gig inquiries in Kanban view.</p>
                      </button>

                      <button
                        onClick={() => setActiveTab("registrations")}
                        className="p-5 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-cyan-500/5 border border-cyan-500/20 hover:border-cyan-500/40 text-left transition-all group cursor-pointer shadow-sm"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="w-9 h-9 rounded-xl bg-cyan-500 text-white flex items-center justify-center shadow-md">
                            <Users className="w-4 h-4" />
                          </div>
                          <ChevronRight className="w-4 h-4 text-cyan-500 group-hover:translate-x-1 transition-transform" />
                        </div>
                        <h4 className="font-bold text-sm text-ink">Directory & Bulk Ops</h4>
                        <p className="text-[11px] text-ink-3 mt-1">Batch verify, override position, or export data.</p>
                      </button>
                    </div>

                    {/* Ecosystem & Role Analytics */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      <div className="lg:col-span-2 bg-bg-card border border-line-soft rounded-3xl p-6 md:p-8 backdrop-blur-xl space-y-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-base font-bold text-ink">Ecosystem Role Breakdown</h3>
                            <p className="text-xs text-ink-3 mt-0.5">Distribution of waitlist members by self-identified role</p>
                          </div>
                          <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold bg-bg-soft text-ink-2 border border-line-soft">
                            {totalCount} Total Members
                          </span>
                        </div>

                        <div className="space-y-4">
                          {[
                            { label: "Performing Artists", count: registrations.filter(r => r.role === 'artist').length, color: "#7C5CFF", pct: totalCount > 0 ? Math.round((registrations.filter(r => r.role === 'artist').length / totalCount) * 100) : 0 },
                            { label: "Venues & Clubs", count: registrations.filter(r => r.role === 'venue').length, color: "#F25A2B", pct: totalCount > 0 ? Math.round((registrations.filter(r => r.role === 'venue').length / totalCount) * 100) : 0 },
                            { label: "Vendors & Tech Providers", count: registrations.filter(r => r.role === 'vendor').length, color: "#00F2FE", pct: totalCount > 0 ? Math.round((registrations.filter(r => r.role === 'vendor').length / totalCount) * 100) : 0 },
                            { label: "Fans & Event Enthusiasts", count: registrations.filter(r => r.role === 'fan').length, color: "#E1306C", pct: totalCount > 0 ? Math.round((registrations.filter(r => r.role === 'fan').length / totalCount) * 100) : 0 },
                          ].map(item => (
                            <div key={item.label} className="space-y-1.5">
                              <div className="flex items-center justify-between text-xs font-mono">
                                <span className="text-ink font-bold flex items-center gap-2">
                                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: item.color }} />
                                  {item.label}
                                </span>
                                <span className="text-ink-2 font-bold">{item.count} ({item.pct}%)</span>
                              </div>
                              <div className="w-full h-2.5 rounded-full bg-bg-soft overflow-hidden p-0.5 border border-line-soft">
                                <div 
                                  className="h-full rounded-full transition-all duration-700" 
                                  style={{ width: `${Math.max(item.pct, 4)}%`, background: item.color }} 
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="bg-bg-card border border-line-soft rounded-3xl p-6 md:p-8 backdrop-blur-xl space-y-5">
                        <div>
                          <h3 className="text-base font-bold text-ink">System Diagnostics</h3>
                          <p className="text-xs text-ink-3 mt-0.5">Live platform state</p>
                        </div>

                        <div className="space-y-3 font-mono text-xs">
                          <div className="p-3.5 rounded-2xl bg-bg-soft/50 border border-line-soft flex items-center justify-between">
                            <span className="text-ink-3">Database Mode</span>
                            <span className={`font-bold ${isLiveMode ? 'text-emerald-400' : 'text-amber-400'}`}>
                              {isLiveMode ? 'Supabase Live' : 'Sandbox Fallback'}
                            </span>
                          </div>

                          <div className="p-3.5 rounded-2xl bg-bg-soft/50 border border-line-soft flex items-center justify-between">
                            <span className="text-ink-3">Auto-Sync Polling</span>
                            <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Every 10s
                            </span>
                          </div>

                          <div className="p-3.5 rounded-2xl bg-bg-soft/50 border border-line-soft flex items-center justify-between">
                            <span className="text-ink-3">Admin Session</span>
                            <span className="text-purple-400 font-bold truncate max-w-[120px]">
                              {user?.email || "Authorized"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

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
                                    {/* Broadcast launcher button -> Switches to Email Studio tab */}
                        <button
                          onClick={() => {
                            if (selectedUserIds.length > 0) {
                              setEmailAudienceMode("selected");
                            } else {
                              setEmailAudienceMode("filtered");
                            }
                            setActiveTab("emails");
                          }}
                          className="w-full sm:w-auto py-2.5 px-4.5 rounded-xl border text-[11px] font-mono font-bold uppercase tracking-[0.06em] flex items-center justify-center gap-2 cursor-pointer transition-all duration-300"
                          style={{
                            background: 'rgba(124, 92, 255, 0.1)',
                            color: '#7C5CFF',
                            borderColor: 'rgba(124, 92, 255, 0.3)',
                          }}
                        >
                          <Mail className="w-3.5 h-3.5" />
                          Email Studio
                          {selectedUserIds.length > 0 && (
                            <span className="bg-[#7C5CFF] text-white px-1.5 py-0.5 rounded-full text-[8px] font-mono leading-none">
                              {selectedUserIds.length}
                            </span>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Data View */}
                    {viewMode === "table" ? (
                      <div className="bg-bg-card border border-line-soft rounded-3xl overflow-hidden backdrop-blur-md shadow-2xl">
                        <div className="overflow-x-auto">
                          <table className="w-full table-fixed border-collapse text-left text-sm min-w-[700px]">
                            <thead>
                              <tr className="border-b border-line-soft text-ink-3 text-[9px] font-mono font-bold uppercase tracking-[0.18em]">
                                <th className="px-3 py-4 w-10 text-center">
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
                                <th className="px-4 py-4 w-[28%]">Member Name & Handle</th>
                                <th className="px-3 py-4 w-[14%]">Role</th>
                                <th className="px-4 py-4 w-[30%]">Contact Details</th>
                                <th className="px-3 py-4 w-[13%]">Queue Rank</th>
                                <th className="px-3 py-4 w-[15%] text-right">Status & Actions</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-line-soft/30">
                              {filteredRegistrations.length === 0 ? (
                                <tr>
                                  <td colSpan={6} className="px-4 py-14 text-center text-ink-3 font-mono text-xs">
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
                                      <td className="px-3 py-3.5 w-10 text-center" onClick={(e) => e.stopPropagation()}>
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
                                      <td className="px-4 py-3.5">
                                        <div className="flex items-center gap-2.5 min-w-0">
                                          <div className="w-8 h-8 rounded-xl overflow-hidden flex items-center justify-center font-display font-bold text-xs text-white shrink-0 bg-bg-soft">
                                            {reg.profile_photo_url ? (
                                              <img src={reg.profile_photo_url} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#7C5CFF] to-[#D4567A]">
                                                {initials}
                                              </div>
                                            )}
                                          </div>
                                          <div className="min-w-0 flex-1">
                                            <div className="font-bold text-ink flex items-center gap-1.5 text-xs truncate">
                                              <span className="truncate">{reg.display_name || "Unspecified Node"}</span>
                                              {reg.is_verified && (
                                                <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[7px] font-mono font-bold tracking-[0.08em] bg-gradient-to-r from-[#F25A2B] to-[#7C5CFF] text-white shrink-0">
                                                  VERIFIED
                                                </span>
                                              )}
                                              {heuristics.eligible && (
                                                 <span 
                                                   className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[7px] font-mono font-bold tracking-[0.08em] bg-bg-soft text-[#22C55E] border border-[#22C55E]/20 shrink-0"
                                                   title={`Auto-verify candidate: ${heuristics.reasons.join(", ")}`}
                                                 >
                                                   SUGGESTED
                                                 </span>
                                               )}
                                            </div>
                                            <div className="text-[10px] font-mono mt-0.5 text-brand truncate">
                                              @{reg.username}
                                            </div>
                                          </div>
                                        </div>
                                      </td>
                                      <td className="px-3 py-3.5">
                                        <div className="truncate">
                                          <span className="inline-block px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-[0.08em]" style={{
                                            background: 'var(--bg-soft)',
                                            color: reg.role === 'artist' ? 'var(--brand-3)' : reg.role === 'venue' ? 'var(--brand-2)' : reg.role === 'vendor' ? 'var(--brand-1)' : 'var(--ink-3)',
                                            border: `1px solid color-mix(in srgb, ${reg.role === 'artist' ? 'var(--brand-3)' : reg.role === 'venue' ? 'var(--brand-2)' : reg.role === 'vendor' ? 'var(--brand-1)' : 'var(--ink-3)'} 15%, transparent)`,
                                          }}>
                                            {reg.role || "fan"}
                                          </span>
                                          {reg.category && (
                                            <span className="block text-[10px] text-ink-3 mt-0.5 capitalize font-mono truncate">
                                              {reg.category.replace("_", " ")}
                                            </span>
                                          )}
                                        </div>
                                      </td>
                                      <td className="px-4 py-3.5 font-mono text-[11px] text-ink-2 space-y-0.5 text-left min-w-0">
                                        <div className="text-ink truncate" title={reg.email}>{reg.email}</div>
                                        {reg.phone && <div className="text-ink-3 truncate">{reg.phone}</div>}
                                      </td>
                                      <td className="px-3 py-3.5">
                                        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                                          <input
                                            type="number"
                                            placeholder="Auto"
                                            defaultValue={reg.position_override ?? ""}
                                            key={`table-${reg.id}-${reg.position_override ?? "auto"}`}
                                            onBlur={(e) => {
                                              const raw = e.target.value.trim();
                                              const val = raw === "" ? null : parseInt(raw, 10);
                                              const parsedVal = isNaN(val as number) ? null : val;
                                              if (parsedVal !== (reg.position_override ?? null)) {
                                                handleSavePositionOverride(reg, parsedVal);
                                              }
                                            }}
                                            onKeyDown={(e) => {
                                              if (e.key === "Enter") {
                                                (e.target as HTMLInputElement).blur();
                                              }
                                            }}
                                            className="w-12 bg-bg-soft border border-line-soft rounded-lg py-1 px-1 text-xs text-ink text-center font-mono focus:outline-none focus:border-brand transition-all"
                                          />
                                          <span className="text-[9px] font-mono text-ink-3 shrink-0">
                                            {reg.position_override ? `#${reg.position_override}` : "Queue"}
                                          </span>
                                        </div>
                                      </td>
                                      <td className="px-3 py-3.5 text-right">
                                        <div className="inline-flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                                          <button
                                            onClick={() => handleVerifyAndLock(reg)}
                                            className="py-1 px-2.5 rounded-full text-[8px] font-mono font-bold tracking-[0.06em] uppercase transition-all cursor-pointer"
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
                                            {reg.is_verified ? "Verified" : "Verify"}
                                          </button>
                                          <button
                                            onClick={() => handleToggleBlock(reg)}
                                            className="py-1 px-2 rounded-full text-[8px] font-mono font-bold tracking-[0.06em] uppercase transition-all cursor-pointer"
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
                                        </div>
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
                                    {reg.is_verified ? "Verified" : "Verify"}
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
              TAB: EMAIL BROADCAST STUDIO (APPLE LIQUID GLASS REDESIGN)
             =================================================================== */}
        {activeTab === "emails" && (
          <div className="space-y-6 animate-in fade-in duration-300 text-left">

            {/* ── 2. Liquid Glass Dispatch Command Bar ("To", "From", "Send") ── */}
            <div className="bg-bg-card border border-line-soft p-5 sm:p-6 rounded-[2.5rem] backdrop-blur-2xl shadow-2xl space-y-4 text-left z-30 relative">
              <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
                
                {/* Left: Addressing Controls ("TO" and "FROM") */}
                <div className="flex flex-wrap items-center gap-3 flex-1">
                  
                  {/* TO: Target Audience */}
                  <div className="relative flex-1 sm:flex-initial">
                    <div className="text-[9px] font-mono font-bold uppercase tracking-wider text-ink-3 mb-1 pl-1">
                      Recipient Target (To):
                    </div>
                    <button
                      type="button"
                      onClick={() => { setShowAudienceDropdown(!showAudienceDropdown); setShowAliasDropdown(false); }}
                      className="w-full sm:w-auto flex items-center justify-between gap-2.5 bg-bg-soft/50 hover:bg-bg-soft border border-line-soft rounded-full px-4 py-2 text-xs text-ink transition-all cursor-pointer shadow-sm group"
                    >
                      <Users className="w-3.5 h-3.5 text-[#7C5CFF] shrink-0" />
                      <span className="text-xs font-bold text-ink truncate max-w-[170px]">
                        {emailAudienceMode === "migrated_artists"
                          ? `Migrated Artists`
                          : emailAudienceMode === "all"
                          ? `All Members`
                          : emailAudienceMode === "filtered"
                          ? `Filtered Directory`
                          : `Selected Users`}
                      </span>
                      <span className="text-[10px] font-mono font-bold bg-[#7C5CFF]/15 text-[#7C5CFF] px-2 py-0.5 rounded-full border border-[#7C5CFF]/20">
                        {getSelectedRecipientsList().filter(r => !r.is_blocked).length}
                      </span>
                      <ChevronDown className={`w-3.5 h-3.5 text-ink-3 group-hover:text-ink transition-transform duration-200 shrink-0 ${showAudienceDropdown ? "rotate-180 text-ink" : ""}`} />
                    </button>

                    {showAudienceDropdown && (
                      <div className="absolute top-full left-0 mt-2 z-[100] min-w-[240px] bg-bg-card border border-line-soft rounded-2xl p-2 shadow-2xl space-y-1 backdrop-blur-2xl animate-in fade-in zoom-in-95 duration-150 text-left">
                        <button
                          type="button"
                          onClick={() => { setEmailAudienceMode("migrated_artists"); setShowAudienceDropdown(false); }}
                          className={`w-full text-left px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                            emailAudienceMode === "migrated_artists" ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20" : "text-ink hover:bg-bg-soft"
                          }`}
                        >
                          <span className="flex items-center gap-2">🚀 Migrated Artists</span>
                          <span className="font-mono text-[10px] opacity-75">({registrations.filter(r => (r.user_id?.startsWith('imported_') || (r as any).is_migrated) && !r.is_blocked).length})</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => { setEmailAudienceMode("all"); setShowAudienceDropdown(false); }}
                          className={`w-full text-left px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                            emailAudienceMode === "all" ? "bg-[#7C5CFF]/15 text-[#7C5CFF] border border-[#7C5CFF]/20" : "text-ink hover:bg-bg-soft"
                          }`}
                        >
                          <span>All Members</span>
                          <span className="font-mono text-[10px] opacity-75">({registrations.filter(r => !r.is_blocked).length})</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => { setEmailAudienceMode("filtered"); setShowAudienceDropdown(false); }}
                          className={`w-full text-left px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                            emailAudienceMode === "filtered" ? "bg-[#7C5CFF]/15 text-[#7C5CFF] border border-[#7C5CFF]/20" : "text-ink hover:bg-bg-soft"
                          }`}
                        >
                          <span>Filtered Directory</span>
                          <span className="font-mono text-[10px] opacity-75">({filteredRegistrations.filter(r => !r.is_blocked).length})</span>
                        </button>
                        {selectedUserIds.length > 0 && (
                          <button
                            type="button"
                            onClick={() => { setEmailAudienceMode("selected"); setShowAudienceDropdown(false); }}
                            className={`w-full text-left px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                              emailAudienceMode === "selected" ? "bg-[#7C5CFF]/15 text-[#7C5CFF] border border-[#7C5CFF]/20" : "text-ink hover:bg-bg-soft"
                            }`}
                          >
                            <span>Selected Users</span>
                            <span className="font-mono text-[10px] opacity-75">({selectedUserIds.length})</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* FROM: Sender Alias */}
                  <div className="relative flex-1 sm:flex-initial">
                    <div className="text-[9px] font-mono font-bold uppercase tracking-wider text-ink-3 mb-1 pl-1">
                      Sender Address (From):
                    </div>
                    <button
                      type="button"
                      onClick={() => { setShowAliasDropdown(!showAliasDropdown); setShowAudienceDropdown(false); }}
                      className="w-full sm:w-auto flex items-center justify-between gap-2.5 bg-bg-soft/50 hover:bg-bg-soft border border-line-soft rounded-full px-4 py-2 text-xs text-ink transition-all cursor-pointer shadow-sm group"
                    >
                      <Mail className="w-3.5 h-3.5 text-[#F25A2B] shrink-0" />
                      <span className="text-xs font-bold text-ink truncate">
                        {emailAlias === "official" ? "info@artistant.in" :
                         emailAlias === "support" ? "support@artistant.in" :
                         emailAlias === "founder" ? "founder@artistant.in" :
                         emailAlias === "welcome" ? "welcome@artistant.in" : "security@artistant.in"}
                      </span>
                      <ChevronDown className={`w-3.5 h-3.5 text-ink-3 group-hover:text-ink transition-transform duration-200 shrink-0 ${showAliasDropdown ? "rotate-180 text-ink" : ""}`} />
                    </button>

                    {showAliasDropdown && (
                      <div className="absolute top-full left-0 mt-2 z-[100] min-w-[240px] bg-bg-card border border-line-soft rounded-2xl p-2 shadow-2xl space-y-1 backdrop-blur-2xl animate-in fade-in zoom-in-95 duration-150 text-left">
                        {[
                          { key: "official", label: "info@artistant.in", tag: "Official" },
                          { key: "support", label: "support@artistant.in", tag: "Support" },
                          { key: "founder", label: "founder@artistant.in", tag: "Founder" },
                          { key: "welcome", label: "welcome@artistant.in", tag: "Onboarding" },
                          { key: "security", label: "security@artistant.in", tag: "Security" },
                        ].map((item) => (
                          <button
                            key={item.key}
                            type="button"
                            onClick={() => { setEmailAlias(item.key); setShowAliasDropdown(false); }}
                            className={`w-full text-left px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                              emailAlias === item.key ? "bg-[#F25A2B]/15 text-[#F25A2B] border border-[#F25A2B]/20" : "text-ink hover:bg-bg-soft"
                            }`}
                          >
                            <span>{item.label}</span>
                            <span className="font-mono text-[9px] opacity-75">({item.tag})</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* INSPECT RECIPIENTS BUTTON */}
                  <div>
                    <div className="text-[9px] font-mono font-bold uppercase tracking-wider text-ink-3 mb-1 pl-1">
                      Recipient List:
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowRecipientDrawer(!showRecipientDrawer)}
                      className={`px-4 py-2 rounded-full border text-xs font-mono font-bold flex items-center gap-2 cursor-pointer transition-all ${
                        showRecipientDrawer ? "bg-[#7C5CFF]/15 border-[#7C5CFF]/40 text-[#7C5CFF]" : "bg-bg-soft/50 hover:bg-bg-soft border-line-soft text-ink-2"
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Inspect List</span>
                      <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${showRecipientDrawer ? "rotate-180 text-ink" : ""}`} />
                    </button>
                  </div>
                </div>

                {/* Right: Dispatch Actions ("Send Broadcast" & "Test Email") */}
                <div className="flex items-center gap-3 pt-2 lg:pt-0 border-t lg:border-t-0 border-line-soft">
                  <button
                    onClick={handleSendTestEmail}
                    disabled={testEmailSending || emailSending}
                    className="py-2.5 px-5 rounded-full text-xs font-mono font-bold flex items-center justify-center gap-2 text-ink bg-bg-soft/70 hover:bg-bg-card border border-line-soft disabled:opacity-50 transition-all cursor-pointer shadow-sm active:scale-95"
                    title={`Send test preview email to ${user?.email || 'admin'}`}
                  >
                    {testEmailSending ? <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#7C5CFF]" /> : <Send className="w-3.5 h-3.5 text-ink-3" />}
                    {testEmailSending ? "Sending..." : "Test Email"}
                  </button>

                  <button
                    onClick={handleSendEmailBroadcast}
                    disabled={emailSending}
                    className="py-2.5 px-7 rounded-full text-xs font-bold flex items-center justify-center gap-2 text-white bg-gradient-to-r from-[#F25A2B] via-[#D4567A] to-[#7C5CFF] hover:opacity-95 disabled:opacity-50 transition-all cursor-pointer shadow-lg shadow-[#7C5CFF]/25 active:scale-95 border border-white/10 uppercase tracking-wider font-mono"
                  >
                    {emailSending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    {emailSending ? "Dispatching..." : `Send Broadcast (${getSelectedRecipientsList().filter(r => !r.is_blocked).length})`}
                  </button>
                </div>
              </div>

              {/* Collapsible Recipient Drawer */}
              {showRecipientDrawer && (
                <div className="bg-bg-card/90 border border-line-soft rounded-2xl p-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200 relative z-30 shadow-xl backdrop-blur-xl text-left">
                  <div className="flex items-center justify-between border-b border-line-soft pb-2.5">
                    <div className="flex items-center gap-2 text-xs font-mono font-bold text-ink">
                      <Users className="w-4 h-4 text-[#7C5CFF]" />
                      <span>Target Audience ({getSelectedRecipientsList().filter(r => !r.is_blocked).length} Active Recipients)</span>
                    </div>
                    <button
                      onClick={() => setShowRecipientDrawer(false)}
                      className="text-[10px] font-mono font-bold text-ink-3 hover:text-ink cursor-pointer px-3 py-1 rounded-full bg-bg-soft border border-line-soft"
                    >
                      Close [✕]
                    </button>
                  </div>

                  <div className="max-h-44 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pr-1">
                    {getSelectedRecipientsList().filter(r => !r.is_blocked).map((reg) => (
                      <div key={reg.id || reg.user_id} className="flex items-center gap-2.5 bg-bg-soft/50 border border-line-soft rounded-xl p-2 text-xs hover:border-[#7C5CFF]/30 transition-colors">
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

            {/* ── 3. Campaign Template Presets Selector Grid ── */}
            <div className="bg-bg-card border border-line-soft p-4 sm:p-5 rounded-[2rem] backdrop-blur-2xl shadow-xl space-y-3 text-left">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-ink-3 uppercase tracking-wider flex items-center gap-2">
                  <Layers3 className="w-4 h-4 text-[#7C5CFF]" />
                  Campaign Template Presets
                </span>
                <span className="text-[10px] font-mono text-ink-3 uppercase">
                  Active: <strong className="text-[#7C5CFF]">{emailTemplateType.replace('_', ' ').toUpperCase()}</strong>
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
                {[
                  { id: "migrated_artist", title: "Artist Onboarding", tag: "🚀", icon: UserCheck, accent: "#10B981" },
                  { id: "standard", title: "Announcement", tag: "📢", icon: Megaphone, accent: "#F25A2B" },
                  { id: "welcome", title: "Stage Pass", tag: "⚡", icon: Ticket, accent: "#7C5CFF" },
                  { id: "vip", title: "VIP Pass", tag: "👑", icon: Crown, accent: "#FFB800" },
                  { id: "newsletter", title: "Product Digest", tag: "📰", icon: Layers3, accent: "#00E5FF" },
                  { id: "raw", title: "Plain Markdown", tag: "📝", icon: FileText, accent: "#94A3B8" }
                ].map((preset) => {
                  const isActive = emailTemplateType === preset.id;
                  const IconComp = preset.icon;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => loadTemplatePreset(preset.id as any)}
                      className={`px-3.5 py-2.5 rounded-xl border text-xs font-mono font-bold transition-all cursor-pointer flex items-center justify-between gap-2 ${
                        isActive
                          ? "bg-gradient-to-r from-[#7C5CFF]/15 to-[#F25A2B]/10 border-[#7C5CFF] text-ink shadow-sm ring-1 ring-[#7C5CFF]/30"
                          : "bg-bg-soft/40 border-line-soft text-ink-3 hover:text-ink hover:bg-bg-soft"
                      }`}
                    >
                      <span className="font-sans font-bold text-xs truncate text-ink">{preset.title}</span>
                      <IconComp className="w-4 h-4 shrink-0" style={{ color: isActive ? '#7C5CFF' : preset.accent }} />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ── 4. Split 2-Column Studio Workspace ── */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">

              {/* ══ LEFT (7 Cols): Liquid Glass Document Composer ══ */}
              <GlowingAdminCard idx={0} className="xl:col-span-7 bg-bg-card border border-line-soft rounded-[2rem] p-6 sm:p-7 shadow-2xl space-y-5 text-left backdrop-blur-2xl">
                
                {/* Section Header */}
                <div className="flex items-center justify-between border-b border-line-soft/80 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#7C5CFF] animate-pulse" />
                    <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-ink">
                      Document Composer
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono text-ink-3 uppercase tracking-wider bg-bg-soft/60 px-2.5 py-1 rounded-lg border border-line-soft">
                    {emailTemplateType === "raw" ? "Plain Markdown" : `${emailTemplateType} template`}
                  </span>
                </div>

                {/* Subject Line & Pill Tag Header Row */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-start">
                  <div className={emailTemplateType !== "raw" ? "sm:col-span-8" : "sm:col-span-12"}>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-[10px] font-mono font-bold text-ink-3 uppercase tracking-wider block">
                        Email Subject Line
                      </label>
                      <span className="text-[9.5px] font-mono font-semibold text-ink-3/80 bg-bg-soft/60 px-2 py-0.5 rounded-md border border-line-soft">
                        {emailSubject.length} / 100
                      </span>
                    </div>
                    <input
                      type="text"
                      value={emailSubject}
                      onChange={(e) => setEmailSubject(e.target.value)}
                      className="w-full h-10 bg-bg-soft/40 border border-line-soft focus:border-[#7C5CFF] focus:ring-4 focus:ring-[#7C5CFF]/15 text-xs font-bold text-ink placeholder:text-ink-3/40 rounded-xl px-4 transition-all outline-none shadow-sm"
                      placeholder="Subject line for your email..."
                    />
                  </div>

                  {emailTemplateType !== "raw" && (
                    <div className="sm:col-span-4">
                      <div className="flex items-center justify-between mb-2 h-[19px]">
                        <label className="text-[10px] font-mono font-bold text-ink-3 uppercase tracking-wider block">
                          Pill Tag
                        </label>
                      </div>
                      <input
                        type="text"
                        value={emailPillTag}
                        onChange={(e) => setEmailPillTag(e.target.value)}
                        className="w-full h-10 bg-bg-soft/40 border border-line-soft focus:border-[#7C5CFF] focus:ring-4 focus:ring-[#7C5CFF]/15 text-xs text-ink font-mono font-bold rounded-xl px-4 transition-all outline-none shadow-sm uppercase"
                        placeholder="⚡ TAG"
                      />
                    </div>
                  )}
                </div>

                {/* Inner Subtitle / Heading (Full Width) */}
                {emailTemplateType !== "raw" && (
                  <div className="pt-1">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-[10px] font-mono font-bold text-ink-3 uppercase tracking-wider block">
                        Inner Heading / Subtitle
                      </label>
                    </div>
                    <input
                      type="text"
                      value={emailHeader}
                      onChange={(e) => setEmailHeader(e.target.value)}
                      className="w-full h-10 bg-bg-soft/40 border border-line-soft focus:border-[#7C5CFF] focus:ring-4 focus:ring-[#7C5CFF]/15 text-xs text-ink font-semibold rounded-xl px-4 transition-all outline-none shadow-sm"
                      placeholder="Email inner heading or subtitle..."
                    />
                  </div>
                )}

                {/* Formatting & Variable Toolbar attached to Textarea */}
                <div className="pt-2">
                  <div className="border border-line-soft rounded-2xl overflow-hidden bg-bg-soft/30 focus-within:border-[#7C5CFF] transition-all shadow-inner">
                  {/* Row 1: Rich Text Formatting Toolbar */}
                  <div className="flex items-center justify-between border-b border-line-soft px-3.5 py-2 bg-bg-soft/60 gap-2 flex-wrap">
                    <div className="flex items-center gap-1 flex-wrap">
                      {[
                        { icon: Bold, title: "Bold", insert: "**text**" },
                        { icon: Italic, title: "Italic", insert: "*text*" },
                        { icon: Underline, title: "Underline", insert: "__text__" },
                      ].map((btn) => (
                        <button
                          key={btn.title}
                          type="button"
                          title={btn.title}
                          onClick={() => setEmailBody(prev => prev + ` ${btn.insert}`)}
                          className="p-1.5 rounded-lg text-ink-3 hover:text-ink hover:bg-bg-soft transition-colors cursor-pointer"
                        >
                          <btn.icon className="w-3.5 h-3.5" />
                        </button>
                      ))}

                      <div className="w-px h-4 bg-line-soft mx-1" />

                      {[
                        { icon: Heading1, title: "Heading 1", insert: "\n# Heading 1\n" },
                        { icon: Heading2, title: "Heading 2", insert: "\n## Heading 2\n" },
                        { icon: List, title: "Bullet List", insert: "\n• Item 1\n• Item 2\n" },
                      ].map((btn) => (
                        <button
                          key={btn.title}
                          type="button"
                          title={btn.title}
                          onClick={() => setEmailBody(prev => prev + btn.insert)}
                          className="p-1.5 rounded-lg text-ink-3 hover:text-ink hover:bg-bg-soft transition-colors cursor-pointer"
                        >
                          <btn.icon className="w-3.5 h-3.5" />
                        </button>
                      ))}

                      <div className="w-px h-4 bg-line-soft mx-1" />

                      <button
                        type="button"
                        title="Link"
                        onClick={() => setEmailBody(prev => prev + " [link](https://artistant.in)")}
                        className="p-1.5 rounded-lg text-ink-3 hover:text-ink hover:bg-bg-soft transition-colors cursor-pointer"
                      >
                        <Link2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        title="Quote"
                        onClick={() => setEmailBody(prev => prev + "\n> Quote\n")}
                        className="p-1.5 rounded-lg text-ink-3 hover:text-ink hover:bg-bg-soft transition-colors cursor-pointer"
                      >
                        <Quote className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <span className="text-[9px] font-mono text-ink-3/70 uppercase">Markdown Editor</span>
                  </div>

                  {/* Row 2: Dynamic Variable Pills */}
                  <div className="flex items-center gap-2 border-b border-line-soft/60 px-3.5 py-1.5 bg-bg-soft/40 overflow-x-auto scrollbar-none">
                    <span className="text-[9px] font-mono font-bold uppercase text-ink-3 shrink-0">Insert Var:</span>
                    <div className="flex items-center gap-1.5">
                      {[
                        { label: "{{name}}", value: "{{name}}" },
                        { label: "{{username}}", value: "{{username}}" },
                        { label: "{{claim_url}}", value: "{{claim_url}}" },
                      ].map((v) => (
                        <button
                          key={v.label}
                          type="button"
                          onClick={() => setEmailBody(prev => prev + ` ${v.value}`)}
                          className="text-[9.5px] font-mono text-[#7C5CFF] bg-[#7C5CFF]/10 hover:bg-[#7C5CFF]/20 border border-[#7C5CFF]/25 px-2 py-0.5 rounded-md cursor-pointer transition-all font-bold hover:scale-105 active:scale-95 shrink-0"
                        >
                          {v.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Textarea Canvas */}
                  <textarea
                    value={emailBody}
                    onChange={(e) => setEmailBody(e.target.value)}
                    rows={11}
                    className="w-full bg-transparent p-4 text-xs text-ink focus:outline-none resize-none leading-relaxed font-normal"
                    placeholder="Type your broadcast email content here..."
                  />
                </div>
              </div>

                {/* CTA Builder & Attachments */}
                <div className="pt-4 border-t border-line-soft space-y-4">
                  
                  {/* CTA Builder Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-[10px] font-mono font-bold text-ink-3 uppercase tracking-wider mb-2">
                        CTA Button Label
                      </label>
                      <input
                        type="text"
                        value={emailCtaText}
                        onChange={(e) => setEmailCtaText(e.target.value)}
                        className="w-full bg-bg-soft/40 border border-line-soft rounded-2xl px-4 py-2.5 text-xs text-ink font-bold focus:outline-none focus:border-[#7C5CFF] focus:ring-2 focus:ring-[#7C5CFF]/15 transition-all shadow-sm"
                        placeholder="CLAIM ACCESS KEYS"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono font-bold text-ink-3 uppercase tracking-wider mb-2">
                        CTA Destination URL
                      </label>
                      <input
                        type="text"
                        value={emailCtaUrl}
                        onChange={(e) => setEmailCtaUrl(e.target.value)}
                        className="w-full bg-bg-soft/40 border border-line-soft rounded-2xl px-4 py-2.5 text-xs text-ink font-mono focus:outline-none focus:border-[#7C5CFF] focus:ring-2 focus:ring-[#7C5CFF]/15 transition-all shadow-sm"
                        placeholder="https://artistant.in"
                      />
                    </div>
                  </div>

                  {/* CTA Theme Selector Pills - Equal 5-Column Grid */}
                  <div className="space-y-2">
                    <label className="block text-[10px] font-mono font-bold text-ink-3 uppercase tracking-wider">
                      CTA Accent Color Theme:
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                      {[
                        { id: "purple", label: "Electric Purple", bg: "bg-[#7C5CFF]" },
                        { id: "flame", label: "Neon Flame", bg: "bg-[#F25A2B]" },
                        { id: "emerald", label: "Emerald Slate", bg: "bg-[#10B981]" },
                        { id: "dark", label: "Midnight Dark", bg: "bg-[#0F172A]" },
                        { id: "ghost", label: "Ghost Glass", bg: "bg-slate-400" },
                      ].map((themeItem) => (
                        <button
                          key={themeItem.id}
                          type="button"
                          onClick={() => setEmailCtaTheme(themeItem.id as any)}
                          className={`flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-xl border text-[10px] font-mono font-bold transition-all cursor-pointer w-full text-center ${
                            emailCtaTheme === themeItem.id
                              ? "bg-[#7C5CFF]/15 text-ink border-[#7C5CFF] shadow-sm ring-1 ring-[#7C5CFF]/30"
                              : "bg-bg-soft/30 text-ink-3 border-line-soft hover:text-ink hover:bg-bg-soft"
                          }`}
                        >
                          <span className={`w-2 h-2 rounded-full shrink-0 ${themeItem.bg}`} />
                          <span className="truncate">{themeItem.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Attachment Hub Header */}
                  <div className="flex items-center justify-between pt-3 border-t border-line-soft">
                    <span className="text-[10px] font-mono font-bold text-ink-3 uppercase tracking-wider flex items-center gap-1.5">
                      <Paperclip className="w-3.5 h-3.5 text-[#7C5CFF]" />
                      Attached Resources ({emailAttachments.length})
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowAddAttachmentModal(true)}
                      className="text-[10px] font-mono font-bold text-[#7C5CFF] hover:underline cursor-pointer flex items-center gap-1 bg-[#7C5CFF]/10 px-3 py-1 rounded-xl border border-[#7C5CFF]/20"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Resource
                    </button>
                  </div>

                  {/* Active Attachments List */}
                  {emailAttachments.length > 0 && (
                    <div className="space-y-2">
                      {emailAttachments.map((att) => (
                        <div key={att.id || att.title} className="flex items-center justify-between gap-2 p-2.5 bg-bg-soft/50 border border-line-soft rounded-2xl text-xs text-left">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="px-2 py-0.5 bg-[#7C5CFF]/15 text-[#7C5CFF] border border-[#7C5CFF]/20 rounded-lg font-mono text-[9px] font-bold">
                              {att.fileType || "FILE"}
                            </span>
                            <div className="min-w-0">
                              <p className="font-bold text-ink truncate text-xs">{att.title}</p>
                              <p className="text-[9.5px] text-ink-3 truncate font-mono">{att.url}</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveAttachment(att.id)}
                            className="p-1.5 rounded-lg text-ink-3 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer shrink-0"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </GlowingAdminCard>

              {/* ════ RIGHT (5 Cols): Apple Mail Mockup Live Email Preview ════ */}
              <GlowingAdminCard idx={1} className="xl:col-span-5 xl:sticky xl:top-6 space-y-0 text-left bg-bg-card border border-line-soft rounded-[2rem] p-0 shadow-2xl backdrop-blur-2xl overflow-hidden">
                
                {/* macOS Window Titlebar Header */}
                <div className="bg-bg-soft/70 border-b border-line-soft px-5 py-3 flex items-center justify-between backdrop-blur-xl">
                  {/* Traffic Light Dots */}
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-[#FF5F56] border border-black/10 inline-block" />
                    <span className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-black/10 inline-block" />
                    <span className="w-3 h-3 rounded-full bg-[#27C93F] border border-black/10 inline-block" />
                    <span className="text-[11px] font-mono font-bold text-ink-3 uppercase tracking-wider ml-2 flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5 text-[#7C5CFF]" />
                      Live Email Canvas
                    </span>
                  </div>

                  {/* Dark/Light Client Switcher Pills */}
                  <div className="flex rounded-xl p-0.5 bg-bg-card border border-line-soft shadow-inner">
                    <button
                      type="button"
                      onClick={() => setEmailClientTheme("dark")}
                      className={`px-2.5 py-1 rounded-lg text-[9.5px] font-mono font-bold transition-all cursor-pointer flex items-center gap-1 uppercase ${
                        emailClientTheme === "dark" ? "bg-gradient-to-r from-[#F25A2B] to-[#7C5CFF] text-white shadow-sm" : "text-ink-3 hover:text-ink"
                      }`}
                    >
                      <Moon className="w-3 h-3" /> Dark
                    </button>
                    <button
                      type="button"
                      onClick={() => setEmailClientTheme("light")}
                      className={`px-2.5 py-1 rounded-lg text-[9.5px] font-mono font-bold transition-all cursor-pointer flex items-center gap-1 uppercase ${
                        emailClientTheme === "light" ? "bg-gradient-to-r from-[#F25A2B] to-[#7C5CFF] text-white shadow-sm" : "text-ink-3 hover:text-ink"
                      }`}
                    >
                      <Sun className="w-3 h-3" /> Light
                    </button>
                  </div>
                </div>

                {/* Email Client Scrollable Container */}
                <div className="p-4 sm:p-5 max-h-[720px] overflow-y-auto space-y-4">
                  {/* Apple Mail Card Outer Container */}
                  <div
                    className={`rounded-2xl border transition-all duration-300 shadow-2xl overflow-hidden ${
                      emailClientTheme === "dark" 
                        ? "bg-[#0D0E15] border-white/10 text-slate-200" 
                        : "bg-[#F8FAFC] border-slate-200 text-slate-900 shadow-md"
                    }`}
                  >
                    {/* Email Body Card */}
                    <div className="text-left">
                      {/* Edge-to-Edge Brand Header Banner */}
                      {emailTemplateType === "raw" ? (
                        <div className={`px-6 py-4 border-b ${emailClientTheme === "dark" ? "border-white/10" : "border-slate-200"}`}>
                          <img 
                            src="/logo_wordmark_flat.png" 
                            alt="Artistant" 
                            className="h-5 w-auto object-contain" 
                          />
                        </div>
                      ) : (
                        <div className="w-full">
                          <div className={`px-6 py-4 flex items-center justify-between ${emailClientTheme === "dark" ? "bg-[#0A0B10]" : "bg-white"}`}>
                            <img 
                              src="/logo_wordmark_flat.png" 
                              alt="Artistant" 
                              className="h-5.5 w-auto object-contain" 
                            />
                            <span className="text-[8.5px] font-mono font-bold text-slate-400 uppercase tracking-[0.2em]">
                              OFFICIAL DISPATCH
                            </span>
                          </div>
                          <div className="h-0.5 w-full bg-gradient-to-r from-[#F25A2B] via-[#D4567A] to-[#7C5CFF]" />
                        </div>
                      )}

                      {/* Content Area */}
                      <div className={`p-6 space-y-5 ${emailClientTheme === "dark" ? "bg-[#0D0E15]" : "bg-white"}`}>
                        {/* Translucent Pill Tag */}
                        {emailTemplateType !== "raw" && emailPillTag && (
                          <span className={`inline-block text-[9.5px] font-mono font-bold px-3.5 py-1.5 rounded-full uppercase tracking-wider border shadow-sm ${
                            emailClientTheme === "dark"
                              ? "bg-[#F25A2B]/15 text-[#F25A2B] border-[#F25A2B]/30"
                              : "bg-[#FFF0EB] text-[#F25A2B] border-[#FFD4C7]"
                          }`}>
                            {emailPillTag}
                          </span>
                        )}

                        {/* Inner Header Title */}
                        {emailTemplateType !== "raw" && emailHeader && (
                          <h1 className={`font-display font-bold text-xl leading-tight tracking-tight ${
                            emailClientTheme === "dark" ? "text-white" : "text-slate-900"
                          }`}>
                            {emailHeader}
                          </h1>
                        )}

                        <p className={`font-semibold text-xs ${
                          emailClientTheme === "dark" ? "text-slate-300" : "text-slate-800"
                        }`}>
                          Hey Alex River,
                        </p>

                        {/* Formatted Paragraphs */}
                        <div
                          className={`text-xs leading-relaxed space-y-3 font-normal ${
                            emailClientTheme === "dark" ? "text-slate-300" : "text-slate-600"
                          }`}
                          dangerouslySetInnerHTML={{
                            __html: emailBody
                              .replaceAll('{{name}}', 'Alex River')
                              .replaceAll('{{username}}', 'alexriver')
                              .replaceAll('{{claim_url}}', emailCtaUrl || 'https://artistant.in')
                              .replace(/\n\n/g, "</p><p>")
                              .replace(/\n/g, "<br/>")
                          }}
                        />

                        {/* Graphic VIP / Stage Pass */}
                        {(emailTemplateType === "welcome" || emailTemplateType === "vip") && (
                          <div className="bg-[#0F172A] rounded-2xl overflow-hidden border border-slate-700/80 shadow-xl my-4 text-left">
                            <div className="h-1 bg-gradient-to-r from-[#F25A2B] via-[#FFB800] to-[#7C5CFF]" />
                            <div className="p-4 flex items-center justify-between">
                              <div>
                                <div className="text-[8px] font-mono font-extrabold text-[#7C5CFF] uppercase tracking-widest">ARTISTANT VIP PASS</div>
                                <div className="text-xs font-extrabold text-white mt-0.5">Founding Artist Handle Reserved</div>
                              </div>
                              <span className="text-[8.5px] font-mono font-bold text-emerald-400 bg-emerald-500/15 px-3 py-1 rounded-full border border-emerald-500/30">
                                ✓ VERIFIED 100 PTS
                              </span>
                            </div>
                            <div className="px-4 py-2.5 bg-[#0B1120] flex items-center justify-between border-t border-dashed border-slate-700/80">
                              <div className="text-[8.5px] text-slate-400 font-mono">HANDLE: @alexriver</div>
                              <div className="text-[8.5px] text-[#F25A2B] font-mono font-extrabold">ART-2026-VIP</div>
                            </div>
                          </div>
                        )}

                        {/* Attached Resources */}
                        {emailAttachments.length > 0 && (
                          <div className="space-y-2.5 pt-2">
                            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#7C5CFF] flex items-center gap-1.5">
                              <Paperclip className="w-3.5 h-3.5" /> Attached Resources ({emailAttachments.length})
                            </span>
                            {emailAttachments.map((att) => (
                              <div key={att.id || att.title} className={`flex items-center justify-between gap-3 p-3.5 rounded-2xl border transition-all ${
                                emailClientTheme === "dark" 
                                  ? "bg-[#7C5CFF]/10 border-[#7C5CFF]/20 text-slate-200" 
                                  : "bg-slate-50 border-slate-200 text-slate-900"
                              }`}>
                                <div className="flex items-center gap-3 min-w-0">
                                  <div className="w-8 h-8 rounded-xl bg-[#7C5CFF]/15 text-[#7C5CFF] font-mono font-bold text-xs flex items-center justify-center shrink-0 uppercase border border-[#7C5CFF]/25">
                                    {(att.fileType || "FILE").substring(0, 3)}
                                  </div>
                                  <div className="min-w-0">
                                    <div className="text-xs font-bold truncate">{att.title}</div>
                                    <div className="text-[9.5px] text-slate-400 font-mono">{att.size || "1.2 MB"}</div>
                                  </div>
                                </div>
                                <span className="text-[9.5px] font-bold text-[#7C5CFF] bg-[#7C5CFF]/10 px-3 py-1 rounded-xl border border-[#7C5CFF]/25 shrink-0 hover:bg-[#7C5CFF]/20 transition-colors">
                                  Open &rarr;
                                </span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* CTA Button Render */}
                        {emailCtaText && (
                          <div className="pt-4 text-center">
                            <a
                              href={emailCtaUrl}
                              onClick={(e) => e.preventDefault()}
                              className={`inline-block px-8 py-3.5 font-bold text-xs rounded-full uppercase tracking-wider shadow-lg transition-all cursor-pointer ${
                                emailCtaTheme === "flame"
                                  ? "bg-gradient-to-r from-[#F25A2B] to-[#D4567A] text-white shadow-[#F25A2B]/25"
                                  : emailCtaTheme === "emerald"
                                  ? "bg-gradient-to-r from-[#10B981] to-[#059669] text-white shadow-[#10B981]/25"
                                  : emailCtaTheme === "dark"
                                  ? "bg-[#0F172A] text-white border border-slate-700 shadow-md"
                                  : emailCtaTheme === "ghost"
                                  ? "bg-slate-200 text-slate-900 border border-slate-300 shadow-sm"
                                  : "bg-gradient-to-r from-[#F25A2B] via-[#D4567A] to-[#7C5CFF] text-white shadow-[#7C5CFF]/25"
                              }`}
                              style={{ textDecoration: "none" }}
                            >
                              {emailCtaText}
                            </a>
                            {(emailTemplateType === "migrated_artist" || emailCtaUrl.includes("/claim")) && (
                              <p className="text-[9.5px] font-mono text-emerald-500 font-semibold pt-2">
                                ⚡ Unique Redirect: <span className="underline">https://artistant.in/claim?username=artist_handle</span>
                              </p>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Email Footer */}
                      <div className={`px-6 py-4 border-t text-center space-y-1 ${
                        emailClientTheme === "dark" ? "bg-[#08090E] border-white/10" : "bg-slate-50 border-slate-200"
                      }`}>
                        <p className="text-[9.5px] text-slate-400 leading-normal font-sans">
                          Sent via Artistant Broadcast Engine • Official Waitlist Communication
                        </p>
                        <p className="text-[9px] text-slate-500 font-mono">
                          Artistant Inc., Bengaluru, KA • <span className="underline cursor-pointer">Unsubscribe</span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </GlowingAdminCard>
            </div>

            {/* Execution Terminal Log */}
            {showLogTerminal && (
              <div className="bg-bg-card border border-line-soft rounded-[2rem] overflow-hidden shadow-2xl backdrop-blur-2xl mt-6 text-left">
                <div className="bg-bg-soft/70 px-5 py-3 border-b border-line-soft flex justify-between items-center">
                  <span className="text-xs font-mono font-bold text-ink flex items-center gap-2 uppercase tracking-wider">
                    <span className={`w-2.5 h-2.5 rounded-full ${emailSending || testEmailSending ? "bg-amber-400 animate-ping" : "bg-emerald-400"}`} />
                    Execution Broadcast Terminal Log
                  </span>
                  <button
                    onClick={() => setShowLogTerminal(false)}
                    className="text-ink-3 hover:text-ink text-xs font-mono cursor-pointer px-2.5 py-1 rounded-xl bg-bg-card border border-line-soft"
                  >
                    Close Log
                  </button>
                </div>
                <div className="p-5 bg-bg-soft/30 font-mono text-xs text-emerald-400 space-y-1.5 max-h-56 overflow-y-auto leading-relaxed">
                  {emailLogs.length === 0 ? (
                    <p className="text-ink-3">Preparing broadcast dispatch sequence...</p>
                  ) : (
                    emailLogs.map((l, i) => <div key={i}>{l}</div>)
                  )}
                </div>
              </div>
            )}

            {/* Modal for Adding New Attachment */}
            <AnimatePresence>
              {showAddAttachmentModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-bg-card border border-line-soft p-6 rounded-3xl max-w-md w-full shadow-2xl space-y-4 text-left"
                  >
                    <div className="flex justify-between items-center border-b border-line-soft pb-3">
                      <h3 className="font-mono text-xs font-bold text-ink uppercase tracking-wider flex items-center gap-2">
                        <Paperclip className="w-4 h-4 text-[#7C5CFF]" />
                        Add Resource Attachment
                      </h3>
                      <button
                        type="button"
                        onClick={() => setShowAddAttachmentModal(false)}
                        className="text-ink-3 hover:text-ink text-xs font-mono"
                      >
                        ✕
                      </button>
                    </div>

                    <div>
                      <label className="block text-[9.5px] font-mono font-bold uppercase text-ink-3 tracking-wider mb-1.5">
                        Attachment Title *
                      </label>
                      <input
                        type="text"
                        value={newAttTitle}
                        onChange={(e) => setNewAttTitle(e.target.value)}
                        placeholder="e.g. ArtisTant_PressKit_2026.pdf"
                        className="w-full bg-bg-soft/40 border border-line-soft rounded-xl px-3.5 py-2.5 text-xs text-ink focus:outline-none focus:border-[#7C5CFF]"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[9.5px] font-mono font-bold uppercase text-ink-3 tracking-wider mb-1.5">
                          File Type
                        </label>
                        <select
                          value={newAttType}
                          onChange={(e) => setNewAttType(e.target.value)}
                          className="w-full bg-bg-soft/40 border border-line-soft rounded-xl px-3 py-2.5 text-xs text-ink focus:outline-none focus:border-[#7C5CFF]"
                        >
                          <option value="PDF">PDF Document</option>
                          <option value="ZIP">ZIP Archive</option>
                          <option value="MP3">Audio (MP3/WAV)</option>
                          <option value="PNG">Image (PNG/JPG)</option>
                          <option value="DOCX">Word Document</option>
                          <option value="FILE">Other Resource</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[9.5px] font-mono font-bold uppercase text-ink-3 tracking-wider mb-1.5">
                          File Size (Optional)
                        </label>
                        <input
                          type="text"
                          value={newAttSize}
                          onChange={(e) => setNewAttSize(e.target.value)}
                          placeholder="e.g. 2.4 MB"
                          className="w-full bg-bg-soft/40 border border-line-soft rounded-xl px-3.5 py-2.5 text-xs text-ink focus:outline-none focus:border-[#7C5CFF]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[9.5px] font-mono font-bold uppercase text-ink-3 tracking-wider mb-1.5">
                        Resource Download / Access URL *
                      </label>
                      <input
                        type="text"
                        value={newAttUrl}
                        onChange={(e) => setNewAttUrl(e.target.value)}
                        placeholder="https://artistant.in/downloads/presskit.pdf"
                        className="w-full bg-bg-soft/40 border border-line-soft rounded-xl px-3.5 py-2.5 text-xs text-ink focus:outline-none focus:border-[#7C5CFF] font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[9.5px] font-mono font-bold uppercase text-ink-3 tracking-wider mb-1.5">
                        Description / Note (Optional)
                      </label>
                      <input
                        type="text"
                        value={newAttDesc}
                        onChange={(e) => setNewAttDesc(e.target.value)}
                        placeholder="e.g. High-resolution press kit & brand guidelines"
                        className="w-full bg-bg-soft/40 border border-line-soft rounded-xl px-3.5 py-2.5 text-xs text-ink focus:outline-none focus:border-[#7C5CFF]"
                      />
                    </div>

                    <div className="pt-2 flex justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => setShowAddAttachmentModal(false)}
                        className="px-4 py-2 text-xs font-mono text-ink-3 hover:text-ink cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleAddAttachment}
                        className="px-5 py-2.5 text-xs font-mono font-bold text-white bg-[#7C5CFF] hover:bg-[#6C4CEF] rounded-xl cursor-pointer shadow-md"
                      >
                        Add Resource
                      </button>
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>

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
            TAB: CLIENT BOOKING REQUESTS
            =================================================================== */}
        {activeTab === "requests" && (
          <div className="space-y-8 animate-in fade-in duration-200">
            
            {/* Metric cards */}
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {[
                { label: "Total Booking Requests", value: bookingRequests.length, color: 'text-ink', glow: 'rgba(124,92,255,0.08)' },
                { label: "Pending Review", value: bookingRequests.filter(r => r.status === 'pending').length, color: 'text-[#F25A2B]', glow: 'rgba(242,90,43,0.08)' },
                { label: "Contacted", value: bookingRequests.filter(r => r.status === 'contacted').length, color: 'text-[#7C5CFF]', glow: 'rgba(124,92,255,0.08)' },
                { label: "Confirmed / Locked", value: bookingRequests.filter(r => r.status === 'confirmed').length, color: 'text-emerald-500 dark:text-emerald-400', glow: 'rgba(16,185,129,0.08)' },
              ].map((card, i) => (
                <GlowingAdminCard
                  key={card.label}
                  idx={i}
                  className="bg-bg-card border border-line-soft rounded-3xl p-6 relative overflow-hidden backdrop-blur-xl shadow-lg text-left"
                  style={{ boxShadow: `0 10px 30px -10px ${card.glow}` }}
                >
                  <p className="text-[10px] font-mono font-bold text-ink-3 uppercase tracking-wider">{card.label}</p>
                  <h3 className={`text-3xl font-display font-extrabold mt-2 ${card.color}`}>
                    {card.value}
                  </h3>
                </GlowingAdminCard>
              ))}
            </div>

            {/* Filter & List Container */}
            <div className="bg-bg-card border border-line-soft rounded-3xl p-6 md:p-8 space-y-6 backdrop-blur-md shadow-2xl">
              <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                <div className="text-left">
                  <h3 className="text-lg font-display font-bold text-ink uppercase tracking-tight">Client Booking Requests</h3>
                  <p className="text-xs text-ink-2 mt-1">Inquiries submitted by event organizers, venues, and private hosts</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                  {/* Search */}
                  <div className="relative flex-1 sm:w-64">
                    <Search className="w-4 h-4 text-ink-3 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search client, artist, city..."
                      value={requestSearchQuery}
                      onChange={(e) => setRequestSearchQuery(e.target.value)}
                      className="w-full bg-bg-soft/40 border border-line-soft text-ink rounded-xl pl-10 pr-4 py-2.5 text-xs font-mono focus:border-[#7C5CFF] focus:ring-4 focus:ring-[#7C5CFF]/15 transition-all outline-none"
                    />
                  </div>

                  {/* Status Filter */}
                  <select
                    value={requestStatusFilter}
                    onChange={(e) => setRequestStatusFilter(e.target.value)}
                    className="bg-bg-soft/40 border border-line-soft text-ink rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-[#7C5CFF] transition-all cursor-pointer font-mono font-bold uppercase tracking-wider"
                  >
                    <option value="all">All Statuses</option>
                    <option value="pending">Pending Only</option>
                    <option value="contacted">Contacted Only</option>
                    <option value="confirmed">Confirmed Only</option>
                    <option value="archived">Archived Only</option>
                  </select>
                </div>
              </div>

              {/* Booking Requests Grid List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {bookingRequests
                  .filter(req => {
                    const q = requestSearchQuery.toLowerCase();
                    const matchesSearch = !q || (
                      req.client_name.toLowerCase().includes(q) ||
                      req.client_email.toLowerCase().includes(q) ||
                      req.artist_username.toLowerCase().includes(q) ||
                      (req.artist_display_name && req.artist_display_name.toLowerCase().includes(q)) ||
                      req.city.toLowerCase().includes(q)
                    );
                    const matchesStatus = requestStatusFilter === "all" || req.status === requestStatusFilter;
                    return matchesSearch && matchesStatus;
                  })
                  .map((req) => (
                    <div 
                      key={req.id} 
                      className={`p-5 rounded-2xl border transition-all text-left space-y-4 shadow-md backdrop-blur-md ${
                        req.status === 'pending'
                          ? 'bg-bg-card border-[#F25A2B]/40 hover:border-[#F25A2B]'
                          : req.status === 'confirmed'
                          ? 'bg-bg-card border-emerald-500/40 hover:border-emerald-500'
                          : req.status === 'contacted'
                          ? 'bg-bg-card border-[#7C5CFF]/40 hover:border-[#7C5CFF]'
                          : 'bg-bg-card border-line-soft opacity-70'
                      }`}
                    >
                      {/* Header row */}
                      <div className="flex items-start justify-between gap-3 border-b border-line-soft/50 pb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-mono text-[#F25A2B] font-bold uppercase tracking-wider">BOOKING INQUIRY FOR</span>
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider bg-bg-soft border border-line-soft text-ink-2">
                              {req.event_type}
                            </span>
                          </div>
                          <h4 className="text-base font-bold text-ink">
                            {req.artist_display_name || req.artist_username}{' '}
                            <span className="text-xs font-mono text-ink-3">(@{req.artist_username})</span>
                          </h4>
                        </div>

                        {/* Status Select Badge */}
                        <select
                          value={req.status}
                          onChange={(e) => handleUpdateBookingStatus(req.id, e.target.value as any)}
                          className={`text-[10px] font-mono font-extrabold uppercase px-3 py-1 rounded-full border cursor-pointer focus:outline-none ${
                            req.status === 'pending' ? 'bg-[#F25A2B]/15 text-[#F25A2B] border-[#F25A2B]/30' :
                            req.status === 'contacted' ? 'bg-[#7C5CFF]/15 text-[#7C5CFF] border-[#7C5CFF]/30' :
                            req.status === 'confirmed' ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30' :
                            'bg-bg-soft text-ink-3 border-line-soft'
                          }`}
                        >
                          <option value="pending" className="bg-[#0f0f15] text-white">● PENDING</option>
                          <option value="contacted" className="bg-[#0f0f15] text-white">● CONTACTED</option>
                          <option value="confirmed" className="bg-[#0f0f15] text-white">● CONFIRMED</option>
                          <option value="archived" className="bg-[#0f0f15] text-white">● ARCHIVED</option>
                        </select>
                      </div>

                      {/* Client Details Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                        <div>
                          <p className="text-[10px] font-mono text-ink-3 uppercase font-semibold">Client Name</p>
                          <p className="font-bold text-ink">{req.client_name}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-mono text-ink-3 uppercase font-semibold">Event Date</p>
                          <p className="font-bold text-[#7C5CFF] flex items-center gap-1">
                            <CalendarIcon className="w-3.5 h-3.5" /> {req.event_date}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] font-mono text-ink-3 uppercase font-semibold">City / Location</p>
                          <p className="font-semibold text-ink flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-[#F25A2B]" /> {req.city}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] font-mono text-ink-3 uppercase font-semibold">Budget</p>
                          <p className="font-semibold text-ink">{req.budget || "Not Specified"}</p>
                        </div>
                      </div>

                      {/* Contact Channels */}
                      <div className="p-3 rounded-xl bg-bg-soft/40 border border-line-soft/60 space-y-1.5 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono text-ink-3 uppercase font-bold">Client Contact</span>
                          <span className="text-[9px] font-mono text-ink-3">{new Date(req.created_at).toLocaleString()}</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <a 
                            href={`mailto:${req.client_email}?subject=${encodeURIComponent(`Artistant Booking Concierge - Inquiry for ${req.artist_display_name || req.artist_username}`)}`}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-bg-card border border-line-soft text-ink text-xs font-semibold hover:border-[#7C5CFF] transition-all"
                          >
                            <Mail className="w-3.5 h-3.5 text-[#7C5CFF]" /> {req.client_email}
                          </a>
                          <a 
                            href={`https://wa.me/${req.client_phone.replace(/[^0-9]/g, '')}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold hover:bg-emerald-500/20 transition-all"
                          >
                            <Smartphone className="w-3.5 h-3.5 text-emerald-500" /> WhatsApp
                          </a>
                          <a 
                            href={`tel:${req.client_phone}`}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-bg-card border border-line-soft text-ink-2 text-xs font-semibold hover:text-ink transition-all"
                          >
                            {req.client_phone}
                          </a>
                        </div>
                      </div>

                      {/* Notes if present */}
                      {req.notes && (
                        <div className="p-3 rounded-xl bg-bg-card border border-line-soft text-xs text-ink-2 italic text-left">
                          &quot;{req.notes}&quot;
                        </div>
                      )}

                      {/* Action Bar */}
                      <div className="flex items-center justify-between pt-1">
                        <div className="flex items-center gap-2">
                          <a
                            href={`mailto:${req.client_email}?subject=${encodeURIComponent(`Artistant Booking Inquiry: ${req.artist_display_name || req.artist_username}`)}&body=${encodeURIComponent(`Hi ${req.client_name},\n\nThank you for reaching out to Artistant Concierge regarding booking ${req.artist_display_name || req.artist_username} for your event on ${req.event_date} in ${req.city}.\n\nWe are confirming schedule availability and rider details with the artist...\n\nBest regards,\nArtistant Concierge Team`)}`}
                            className="px-3.5 py-1.5 rounded-xl font-mono text-xs font-bold bg-[#7C5CFF] text-white hover:bg-[#6A49FF] transition-all flex items-center gap-1.5 shadow-sm"
                          >
                            <Send className="w-3 h-3" /> Email Client
                          </a>
                          <a
                            href={`https://wa.me/${req.client_phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hi ${req.client_name}, this is Artistant Concierge regarding your booking request for ${req.artist_display_name || req.artist_username} on ${req.event_date}.`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3.5 py-1.5 rounded-xl font-mono text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-500 transition-all flex items-center gap-1.5 shadow-sm"
                          >
                            <Smartphone className="w-3 h-3" /> WhatsApp
                          </a>
                        </div>

                        <button
                          onClick={() => handleDeleteBookingRequest(req.id)}
                          className="p-2 rounded-xl text-ink-3 hover:text-red-400 hover:bg-red-500/10 transition-all cursor-pointer"
                          title="Delete Request"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}

                {bookingRequests.length === 0 && (
                  <div className="col-span-2 p-12 text-center text-ink-3 font-mono text-xs border border-dashed border-line-soft rounded-2xl">
                    No booking requests received yet.
                  </div>
                )}
              </div>
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
                <table className="w-full table-fixed border-collapse min-w-[650px]">
                  <thead>
                    <tr className="border-b border-line-soft text-[9px] font-mono text-ink-3 uppercase tracking-widest text-left">
                      <th className="pb-3.5 font-bold w-[22%]">Time</th>
                      <th className="pb-3.5 font-bold w-[16%]">Event Node</th>
                      <th className="pb-3.5 font-bold w-[24%]">User Identity</th>
                      <th className="pb-3.5 font-bold w-[22%]">Browser / OS</th>
                      <th className="pb-3.5 font-bold w-[16%]">Referrer</th>
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
                  <h3 className="text-lg font-display font-bold text-ink uppercase tracking-tight">Add Admin Access</h3>
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
          USER DETAIL MODAL POPUP
          ═══════════════════════════════════════════════════ */}
      <AnimatePresence>
        {selectedReg && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-md cursor-pointer z-[100]"
              onClick={() => setSelectedReg(null)}
            />

            {/* Modal Dialog Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: 'spring', stiffness: 350, damping: 28 }}
              className="relative w-full max-w-2xl max-h-[90vh] bg-bg-card border border-line-soft rounded-[2.5rem] shadow-2xl flex flex-col z-[110] overflow-hidden backdrop-blur-2xl text-left my-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Top Bar */}
              <div className="px-7 pt-6 pb-2 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-brand animate-pulse" />
                  <span className="text-[10px] font-mono font-bold uppercase tracking-[0.14em] text-ink-3">
                    Waitlist Node Detail
                  </span>
                </div>

                <button
                  onClick={() => setSelectedReg(null)}
                  className="w-9 h-9 rounded-2xl flex items-center justify-center bg-bg-soft border border-line-soft text-ink-3 hover:text-ink hover:bg-bg-soft-hover transition-all cursor-pointer active:scale-95"
                  title="Close"
                >
                  <XCircle className="w-4.5 h-4.5" />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="p-7 pt-2 space-y-6 overflow-y-auto flex-1 custom-scrollbar">

                {/* HERO PROFILE SECTION */}
                <div className="bg-bg-soft/30 border border-line-soft rounded-[2rem] p-6 space-y-5">
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
                    {/* Big DP Avatar */}
                    <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-3xl overflow-hidden bg-bg-soft border-2 border-line-soft shadow-xl shrink-0 group">
                      {selectedReg.profile_photo_url ? (
                        <img src={selectedReg.profile_photo_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#F25A2B] to-[#7C5CFF] text-white font-display font-black text-3xl shadow-inner">
                          {(selectedReg.display_name || selectedReg.username || 'U')[0].toUpperCase()}
                        </div>
                      )}
                    </div>

                    {/* Profile Info */}
                    <div className="min-w-0 flex-1 space-y-2">
                      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                        <h2 className="text-2xl sm:text-3xl font-display font-black text-ink uppercase tracking-tight leading-none flex items-center gap-2">
                          <span>{selectedReg.display_name || selectedReg.username}</span>
                          {selectedReg.is_verified && (
                            <CheckCircle2 className="w-6 h-6 text-[#7C5CFF] shrink-0" />
                          )}
                        </h2>
                      </div>

                      <p className="text-sm font-mono text-brand font-semibold">
                        @{selectedReg.username}
                      </p>

                      {/* Status Badges */}
                      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-mono font-bold tracking-[0.08em]" style={
                          selectedReg.is_verified
                            ? { background: 'linear-gradient(135deg, #F25A2B, #7C5CFF)', color: 'white' }
                            : { background: 'var(--bg-soft)', color: 'var(--ink-3)', border: '1px solid var(--line-soft)' }
                        }>
                          <CheckCircle2 className="w-3 h-3" />
                          {selectedReg.is_verified ? 'VERIFIED' : 'PENDING'}
                        </span>

                        {selectedReg.feature_founding_card && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-mono font-bold tracking-[0.08em] bg-[#7C5CFF]/10 text-[#7C5CFF] border border-[#7C5CFF]/20">
                            <Award className="w-3 h-3" />
                            FOUNDING CARD
                          </span>
                        )}

                        {selectedReg.exclude_from_waitlist && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-mono font-bold tracking-[0.08em] bg-amber-500/10 text-amber-500 border border-amber-500/20">
                            <UserMinus className="w-3 h-3" />
                            EXCLUDED FROM RANK
                          </span>
                        )}

                        {selectedReg.is_blocked && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-mono font-bold tracking-[0.08em] bg-hot/10 text-hot border border-hot/20">
                            <XCircle className="w-3 h-3" />
                            SUSPENDED
                          </span>
                        )}

                        {selectedReg.role && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-mono font-bold uppercase tracking-[0.08em] bg-bg-soft border border-line-soft text-ink-2">
                            {selectedReg.role}
                          </span>
                        )}
                      </div>

                      {/* View Live Link */}
                      <div className="pt-2 flex justify-center sm:justify-start">
                        <a
                          href={`/${selectedReg.username}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 rounded-2xl text-xs font-mono font-bold uppercase flex items-center gap-2 bg-bg-soft border border-line-soft hover:bg-bg-soft-hover text-ink transition-all cursor-pointer shadow-sm active:scale-95"
                        >
                          <ExternalLink className="w-4 h-4 text-brand" />
                          <span>View Live Profile</span>
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Bio Card */}
                  {selectedReg.bio && (
                    <div className="bg-bg-card/70 border border-line-soft rounded-2xl p-4 text-xs text-ink-2 leading-relaxed">
                      <span className="text-[9px] font-mono font-bold text-ink-3 uppercase tracking-widest block mb-1">Biography</span>
                      {selectedReg.bio}
                    </div>
                  )}
                </div>

                {/* Quick Management Controls */}
                <div className="bg-bg-soft/20 border border-line-soft rounded-[1.75rem] p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-mono font-bold uppercase tracking-[0.12em] text-ink-3">Quick Management Controls</p>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {/* Verify Button */}
                    <button
                      onClick={() => handleVerifyAndLock(selectedReg)}
                      className="py-3 px-3 rounded-2xl text-[10px] font-mono font-bold tracking-[0.06em] uppercase flex items-center justify-center gap-1.5 transition-all duration-200 cursor-pointer active:scale-95"
                      style={selectedReg.is_verified ? {
                        background: 'var(--bg-soft)', color: 'var(--brand-3)', border: '1px solid rgba(124,92,255,0.3)',
                      } : {
                        background: 'linear-gradient(135deg, #F25A2B, #7C5CFF)', color: 'white', border: 'none',
                        boxShadow: '0 4px 14px -3px rgba(242,90,43,0.4)',
                      }}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                      <span>{selectedReg.is_verified ? 'Unverify' : 'Verify'}</span>
                    </button>

                    {/* Suspend Button */}
                    <button
                      onClick={() => handleToggleBlock(selectedReg)}
                      className="py-3 px-3 rounded-2xl text-[10px] font-mono font-bold tracking-[0.06em] uppercase flex items-center justify-center gap-1.5 transition-all duration-200 cursor-pointer active:scale-95"
                      style={selectedReg.is_blocked ? {
                        background: 'rgba(255,75,75,0.12)', color: 'var(--hot)', border: '1px solid rgba(255,75,75,0.3)',
                      } : {
                        background: 'var(--bg-soft)', color: 'var(--ink-3)', border: '1px solid var(--line-soft)',
                      }}
                    >
                      <XCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{selectedReg.is_blocked ? 'Restore' : 'Suspend'}</span>
                    </button>

                    {/* Feature Founding Card Button */}
                    <button
                      onClick={() => handleToggleFoundingCard(selectedReg)}
                      className="py-3 px-3 rounded-2xl text-[10px] font-mono font-bold tracking-[0.06em] uppercase flex items-center justify-center gap-1.5 transition-all duration-200 cursor-pointer active:scale-95"
                      style={selectedReg.feature_founding_card ? {
                        background: 'rgba(124,92,255,0.12)', color: 'var(--brand-3)', border: '1px solid rgba(124,92,255,0.3)',
                      } : {
                        background: 'var(--bg-soft)', color: 'var(--ink-3)', border: '1px solid var(--line-soft)',
                      }}
                    >
                      <Award className="w-3.5 h-3.5 shrink-0" />
                      <span>{selectedReg.feature_founding_card ? 'Unfeature' : 'Feature Card'}</span>
                    </button>

                    {/* Exclude Rank Button */}
                    <button
                      onClick={() => handleToggleExcludeFromWaitlist(selectedReg)}
                      className="py-3 px-3 rounded-2xl text-[10px] font-mono font-bold tracking-[0.06em] uppercase flex items-center justify-center gap-1.5 transition-all duration-200 cursor-pointer active:scale-95"
                      style={selectedReg.exclude_from_waitlist ? {
                        background: 'rgba(242,90,43,0.12)', color: 'var(--brand-1)', border: '1px solid rgba(242,90,43,0.3)',
                      } : {
                        background: 'var(--bg-soft)', color: 'var(--ink-3)', border: '1px solid var(--line-soft)',
                      }}
                    >
                      <UserMinus className="w-3.5 h-3.5 shrink-0" />
                      <span>{selectedReg.exclude_from_waitlist ? 'Include Rank' : 'Exclude Rank'}</span>
                    </button>
                  </div>
                </div>

                {/* Details Bento Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Contact Info Bento Box */}
                  <div className="bg-bg-soft/30 border border-line-soft rounded-[1.75rem] p-5 space-y-3">
                    <p className="text-[10px] font-mono font-bold uppercase tracking-[0.12em] text-ink-3">Contact Information</p>
                    <div className="space-y-2.5 text-xs font-mono">
                      <div className="flex items-center gap-2.5 text-ink">
                        <Mail className="w-3.5 h-3.5 text-ink-3 shrink-0" />
                        <span className="truncate select-all">{selectedReg.email}</span>
                      </div>
                      {selectedReg.phone && (
                        <div className="flex items-center gap-2.5 text-ink">
                          <Smartphone className="w-3.5 h-3.5 text-ink-3 shrink-0" />
                          <span className="select-all">{selectedReg.phone}</span>
                        </div>
                      )}
                      {selectedReg.city && (
                        <div className="flex items-center gap-2.5 text-ink">
                          <MapPin className="w-3.5 h-3.5 text-ink-3 shrink-0" />
                          <span>{selectedReg.city}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Queue Management Bento Box */}
                  <div className="bg-bg-soft/30 border border-line-soft rounded-[1.75rem] p-5 space-y-3">
                    <p className="text-[10px] font-mono font-bold uppercase tracking-[0.12em] text-ink-3">Queue Management</p>
                    <div className="flex items-center gap-3 pt-0.5">
                      <span className="text-xs text-ink-2 font-mono">Queue Override:</span>
                      <input
                        type="number"
                        placeholder="Auto"
                        defaultValue={selectedReg.position_override ?? ''}
                        key={`modal-${selectedReg.id}-${selectedReg.position_override ?? 'auto'}`}
                        onBlur={(e) => {
                          const raw = e.target.value.trim();
                          const val = raw === '' ? null : parseInt(raw, 10);
                          const parsedVal = isNaN(val as number) ? null : val;
                          if (parsedVal !== (selectedReg.position_override ?? null)) {
                            handleSavePositionOverride(selectedReg, parsedVal);
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            (e.target as HTMLInputElement).blur();
                          }
                        }}
                        className="w-16 bg-bg-soft border border-line-soft rounded-xl py-1 px-2 text-xs text-ink text-center font-mono font-bold focus:outline-none focus:border-brand transition-all"
                      />
                      <span className="text-[10px] font-mono text-ink-3">
                        {selectedReg.position_override ? `#${selectedReg.position_override}` : 'Auto-Queue'}
                      </span>
                    </div>
                    <div className="text-[10px] font-mono text-ink-3 pt-2.5 border-t border-line-soft flex justify-between items-center">
                      <span>Registered:</span>
                      <span className="text-ink-2 font-bold">{new Date(selectedReg.reserved_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                {/* Classification & Genres */}
                {(selectedReg.category || (selectedReg.genres && selectedReg.genres.length > 0)) && (
                  <div className="bg-bg-soft/20 border border-line-soft rounded-[1.75rem] p-5 space-y-2.5">
                    <p className="text-[10px] font-mono font-bold uppercase tracking-[0.12em] text-ink-3">Classification & Genres</p>
                    <div className="flex flex-wrap items-center gap-2">
                      {selectedReg.category && (
                        <span className="text-xs text-ink font-semibold capitalize bg-bg-soft border border-line-soft px-3.5 py-1.5 rounded-xl">
                          {selectedReg.category.replace('_', ' ')}
                        </span>
                      )}
                      {selectedReg.genres && selectedReg.genres.map(g => (
                        <span key={g} className="text-xs font-mono px-3 py-1.5 rounded-xl text-ink-2 bg-bg-soft/40 border border-line-soft">
                          #{g}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* External Portals */}
                {(selectedReg.instagram_url || selectedReg.spotify_url || selectedReg.youtube_url || selectedReg.youtube_channel_url) && (
                  <div className="bg-bg-soft/20 border border-line-soft rounded-[1.75rem] p-5 space-y-3">
                    <p className="text-[10px] font-mono font-bold uppercase tracking-[0.12em] text-ink-3">External Portals</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {selectedReg.instagram_url && (
                        <a href={selectedReg.instagram_url.startsWith('http') ? selectedReg.instagram_url : `https://instagram.com/${selectedReg.instagram_url}`} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-3 p-3 rounded-2xl bg-bg-soft/40 border border-line-soft hover:bg-bg-soft transition-all group">
                          <div className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0 shadow-sm" style={{ background: 'linear-gradient(135deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)' }}>
                            <span className="text-white text-[9px] font-black">IG</span>
                          </div>
                          <span className="text-xs font-mono text-ink-2 truncate flex-1 group-hover:text-ink">Instagram</span>
                          <ExternalLink className="w-3.5 h-3.5 text-ink-3" />
                        </a>
                      )}
                      {selectedReg.spotify_url && (
                        <a href={selectedReg.spotify_url.startsWith('http') ? selectedReg.spotify_url : `https://open.spotify.com/artist/${selectedReg.spotify_url}`} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-3 p-3 rounded-2xl bg-bg-soft/40 border border-line-soft hover:bg-bg-soft transition-all group">
                          <div className="w-7 h-7 rounded-xl flex items-center justify-center bg-[#1DB954] shadow-sm">
                            <span className="text-white text-[9px] font-black">SP</span>
                          </div>
                          <span className="text-xs font-mono text-ink-2 truncate flex-1 group-hover:text-ink">Spotify</span>
                          <ExternalLink className="w-3.5 h-3.5 text-ink-3" />
                        </a>
                      )}
                      {(selectedReg.youtube_url || selectedReg.youtube_channel_url) && (
                        <a href={(selectedReg.youtube_channel_url || selectedReg.youtube_url || '').startsWith('http') ? (selectedReg.youtube_channel_url || selectedReg.youtube_url || '') : `https://youtube.com/@${selectedReg.youtube_channel_url || selectedReg.youtube_url}`} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-3 p-3 rounded-2xl bg-bg-soft/40 border border-line-soft hover:bg-bg-soft transition-all group sm:col-span-2">
                          <div className="w-7 h-7 rounded-xl flex items-center justify-center bg-[#FF0000] shrink-0 shadow-sm">
                            <span className="text-white text-[9px] font-black">YT</span>
                          </div>
                          <span className="text-xs font-mono text-ink-2 truncate flex-1 group-hover:text-ink">YouTube</span>
                          <ExternalLink className="w-3.5 h-3.5 text-ink-3" />
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Command Palette Search Modal */}
      <AnimatePresence>
        {showCommandPalette && (
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              className="w-full max-w-xl bg-bg-card border border-line-soft rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh] text-left"
            >
              <div className="p-4 border-b border-line-soft flex items-center gap-3 bg-bg-soft/30">
                <Search className="w-4 h-4 text-[#7C5CFF] shrink-0" />
                <input
                  type="text"
                  autoFocus
                  placeholder="Search creators, booking requests, or jump to tab..."
                  value={commandSearch}
                  onChange={(e) => setCommandSearch(e.target.value)}
                  className="w-full bg-transparent text-sm font-sans text-ink focus:outline-none placeholder:text-ink-3"
                />
                <button 
                  onClick={() => setShowCommandPalette(false)}
                  className="text-[10px] font-mono font-bold text-ink-3 hover:text-ink px-2 py-1 rounded-lg bg-bg-soft border border-line-soft cursor-pointer"
                >
                  ESC
                </button>
              </div>

              <div className="overflow-y-auto p-4 space-y-4 max-h-[60vh]">
                {/* Quick Navigation Shortcuts */}
                <div>
                  <span className="text-[9px] font-mono font-bold text-ink-3 uppercase tracking-wider block mb-2">Management Tabs</span>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: "overview", label: "Executive Overview", icon: BarChart3 },
                      { id: "registrations", label: "Waitlist Directory", icon: Users },
                      { id: "emails", label: "Broadcast Studio", icon: Mail },
                      { id: "requests", label: "Booking Requests", icon: CalendarIcon },
                      { id: "members", label: "Visitor Activity", icon: Eye },
                    ].map(tab => (
                      <button
                        key={tab.id}
                        onClick={() => {
                          setActiveTab(tab.id as any);
                          setShowCommandPalette(false);
                          setCommandSearch("");
                        }}
                        className="flex items-center gap-2.5 p-2.5 rounded-xl bg-bg-soft/40 hover:bg-bg-soft border border-line-soft text-xs text-ink font-semibold transition-all cursor-pointer"
                      >
                        <tab.icon className="w-3.5 h-3.5 text-[#7C5CFF]" />
                        <span>{tab.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* User Results */}
                {commandSearch.trim() !== "" && (
                  <div>
                    <span className="text-[9px] font-mono font-bold text-ink-3 uppercase tracking-wider block mb-2">
                      Matching Creators ({registrations.filter(r => (r.display_name || '').toLowerCase().includes(commandSearch.toLowerCase()) || r.username.toLowerCase().includes(commandSearch.toLowerCase()) || r.email.toLowerCase().includes(commandSearch.toLowerCase())).length})
                    </span>
                    <div className="space-y-1.5">
                      {registrations
                        .filter(r => (r.display_name || '').toLowerCase().includes(commandSearch.toLowerCase()) || r.username.toLowerCase().includes(commandSearch.toLowerCase()) || r.email.toLowerCase().includes(commandSearch.toLowerCase()))
                        .slice(0, 5)
                        .map(reg => (
                          <div
                            key={reg.id}
                            onClick={() => {
                              setSelectedReg(reg);
                              setActiveTab("registrations");
                              setShowCommandPalette(false);
                              setCommandSearch("");
                            }}
                            className="p-3 rounded-xl bg-bg-soft/40 hover:bg-bg-soft border border-line-soft flex items-center justify-between cursor-pointer transition-all"
                          >
                            <div>
                              <p className="font-bold text-xs text-ink">{reg.display_name || reg.username}</p>
                              <p className="text-[10px] font-mono text-ink-3">@{reg.username} • {reg.email}</p>
                            </div>
                            <span className="text-[10px] font-mono text-[#7C5CFF] font-bold">View Profile &rarr;</span>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
