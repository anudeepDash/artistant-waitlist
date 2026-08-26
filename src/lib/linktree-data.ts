export interface LinktreeItem {
  id: string;
  title: string;
  description: string;
  url: string;
  category: 'ecosystem' | 'artists' | 'venues' | 'community';
  iconName: string; // e.g. 'UserCheck', 'Ticket', 'Music', 'Layers', 'Calendar', 'Briefcase', 'Award', 'Sparkles', 'MessageSquare', 'Instagram', 'Youtube', 'Linkedin'
  badge?: string;
  badgeColor?: string;
  isExternal?: boolean;
  featured?: boolean;
  clicksCount?: number;
}

export const DEFAULT_LINKTREE_ITEMS: LinktreeItem[] = [
  {
    id: 'claim-handle',
    title: 'Claim Your Artist or Venue Handle',
    description: 'Reserve your official @username & unlock early access to gig escrow payouts.',
    url: '/claim',
    category: 'ecosystem',
    iconName: 'UserCheck',
    badge: 'MUST JOIN',
    badgeColor: 'from-[#F25A2B] to-[#FF7A00]',
    featured: true,
    clicksCount: 1420
  },
  {
    id: 'jasmine-tour',
    title: 'Jasmine Sandlas Live Bengaluru Tour',
    description: 'Official ticketing & VIP backstage pass portal powered by Artistant.',
    url: '/jasmine-sandlas-bengaluru',
    category: 'ecosystem',
    iconName: 'Ticket',
    badge: 'LIVE EVENT',
    badgeColor: 'from-[#FF007A] to-[#D4567A]',
    featured: true,
    clicksCount: 2890
  },
  {
    id: 'artist-directory',
    title: 'Explore Artists & Performers Directory',
    description: 'Discover verified live musicians, DJs, bands & acoustic acts across India.',
    url: '/directory',
    category: 'artists',
    iconName: 'Music',
    badge: 'DIRECTORY',
    badgeColor: 'from-[#7C5CFF] to-[#6B7CDB]',
    clicksCount: 950
  },
  {
    id: 'gigs-portal',
    title: 'Live Gig & Performance Opportunities',
    description: 'Browse active venue calls, festival lineup requests & paid performance contracts.',
    url: '/gigs',
    category: 'artists',
    iconName: 'Layers',
    badge: 'ACTIVE GIGS',
    badgeColor: 'from-[#10B981] to-[#059669]',
    clicksCount: 1120
  },
  {
    id: 'event-calendar',
    title: 'Event Calendar & Concert Shows',
    description: 'Track upcoming live music performances, tour dates & festival schedules.',
    url: '/events',
    category: 'venues',
    iconName: 'Calendar',
    badge: 'CALENDAR',
    badgeColor: 'from-[#F59E0B] to-[#D97706]',
    clicksCount: 680
  },
  {
    id: 'team-cards',
    title: 'Founders & Executive Business Cards',
    description: 'Digital contact cards, calendar booking & direct sync with Artistant founders.',
    url: '/card',
    category: 'ecosystem',
    iconName: 'Briefcase',
    badge: 'TEAM & FOUNDERS',
    badgeColor: 'from-[#8B5CF6] to-[#7C3AED]',
    featured: true,
    clicksCount: 840
  },
  {
    id: 'careers',
    title: 'Join Our Team — Open Positions',
    description: 'We are hiring core engineers, artist operations leads & venue partnership heads.',
    url: '/careers',
    category: 'ecosystem',
    iconName: 'Award',
    badge: 'HIRING',
    badgeColor: 'from-[#EC4899] to-[#DB2777]',
    clicksCount: 430
  },
  {
    id: 'whats-new',
    title: 'Product Roadmap & Changelog',
    description: 'See latest updates, smart contract features & platform enhancements.',
    url: '/changelog',
    category: 'ecosystem',
    iconName: 'Sparkles',
    badge: 'UPDATES',
    badgeColor: 'from-[#3B82F6] to-[#2563EB]',
    clicksCount: 510
  },
  {
    id: 'whatsapp-vip',
    title: 'Official VIP Community (WhatsApp)',
    description: 'Direct access to artist opportunities, venue meetups & private networking.',
    url: 'https://instagram.com/artistant.in',
    category: 'community',
    iconName: 'MessageSquare',
    badge: 'COMMUNITY',
    badgeColor: 'from-[#22C55E] to-[#16A34A]',
    isExternal: true,
    clicksCount: 1670
  },
  {
    id: 'instagram',
    title: 'Follow @artistant.in on Instagram',
    description: 'Daily highlights of live acts, behind-the-scenes & featured performances.',
    url: 'https://instagram.com/artistant.in',
    category: 'community',
    iconName: 'Instagram',
    isExternal: true,
    clicksCount: 3100
  },
  {
    id: 'youtube',
    title: 'Artistant Live YouTube Channel',
    description: 'High-definition live session recordings, interviews & performance videos.',
    url: 'https://youtube.com/@artistant',
    category: 'community',
    iconName: 'Youtube',
    isExternal: true,
    clicksCount: 1980
  },
  {
    id: 'linkedin',
    title: 'Artistant Company Page on LinkedIn',
    description: 'Corporate announcements, partnerships, investor syncs & team news.',
    url: 'https://www.linkedin.com/company/artistantco/',
    category: 'community',
    iconName: 'Linkedin',
    isExternal: true,
    clicksCount: 890
  }
];

const STORAGE_KEY = 'artistant_linktree_items_v1';

export function getLinktreeItems(): LinktreeItem[] {
  if (typeof window === 'undefined') return DEFAULT_LINKTREE_ITEMS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_LINKTREE_ITEMS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_LINKTREE_ITEMS;
  } catch (err) {
    return DEFAULT_LINKTREE_ITEMS;
  }
}

export function saveLinktreeItems(items: LinktreeItem[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    window.dispatchEvent(new Event('artistant-links-updated'));
  } catch (err) {
    console.error('Error saving linktree items:', err);
  }
}
