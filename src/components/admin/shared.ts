import type { AdminWaitlistEntry } from '@/lib/waitlist';

export function parseUserAgent(ua: string | null): string {
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

export const ADMIN_TABS = [
  { id: "overview", label: "Executive Overview", icon: "BarChart3", accent: '#00F2FE', headerTitle: "Executive Overview & Analytics" },
  { id: "registrations", label: "Waitlist Directory", icon: "Users", accent: 'var(--brand-1)', headerTitle: "Waitlist Directory" },
  { id: "links_cards", label: "Links & Founder Cards", icon: "QrCode", accent: '#F25A2B', headerTitle: "Links & Founder Business Cards Studio" },
  { id: "emails", label: "Broadcast Studio", icon: "Mail", accent: '#7C5CFF', headerTitle: "Email Broadcast Studio" },
  { id: "requests", label: "Booking Requests", icon: "CalendarIcon", accent: '#F25A2B', headerTitle: "Client Booking Requests Ops" },
  { id: "leaderboards", label: "Leaderboards", icon: "Trophy", accent: 'var(--brand-2)', headerTitle: "Leaderboard Rankings" },
  { id: "members", label: "Visitor Activity", icon: "Eye", accent: 'var(--brand-3)', headerTitle: "Visitor Activity Logs" },
  { id: "admins", label: "Manage Admins", icon: "Shield", accent: 'var(--brand-4)', headerTitle: "System Administrators" },
  { id: "careers", label: "Careers", icon: "Briefcase", accent: '#F25A2B', headerTitle: "Careers Management" },
  { id: "settings", label: "Site Settings", icon: "Settings", accent: '#00F2FE', headerTitle: "Platform Configuration" },
] as const;

export type AdminTabId = typeof ADMIN_TABS[number]['id'];

export const ROLE_COLORS: Record<string, string> = {
  founder: '#FFB800',
  artist: 'var(--brand-3)',
  venue: 'var(--brand-2)',
  vendor: 'var(--brand-1)',
};

export function evaluateAutoVerify(reg: AdminWaitlistEntry): { eligible: boolean; reasons: string[] } {
  if (reg.is_verified || reg.is_blocked) return { eligible: false, reasons: [] };
  const reasons: string[] = [];
  if (reg.username.length >= 3 && reg.display_name && reg.display_name.trim().length >= 3) {
    reasons.push("Profile completed");
  } else {
    return { eligible: false, reasons: [] };
  }
  if (reg.email.includes("@") && reg.email.includes(".")) {
    reasons.push("Validated email format");
  } else {
    return { eligible: false, reasons: [] };
  }
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
}
