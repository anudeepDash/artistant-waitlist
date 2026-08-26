export interface TeamMember {
  username: string;
  name: string;
  role: string;
  tagline: string;
  bio: string;
  email: string;
  phone: string;
  location: string;
  avatarUrl: string;
  badge: string;
  department: string;
  company: string;
  website: string;
  calendlyUrl?: string;
  socials: {
    linkedin?: string;
    twitter?: string;
    github?: string;
    instagram?: string;
    whatsapp?: string;
  };
  highlights: string[];
  featuredLink?: {
    title: string;
    url: string;
    description: string;
  };
}

export const TEAM_MEMBERS: Record<string, TeamMember> = {
  anudeep: {
    username: 'anudeep',
    name: 'Anudeep',
    role: 'Founder & CEO',
    tagline: 'Building the contract, escrow & payment infrastructure for live entertainment.',
    bio: 'Founder at Artistant. Passionate about empowering independent artists, venues, and organizers across India through transparent smart contracts, instant payouts, and zero-friction gig booking.',
    email: 'anudeep@artistant.in',
    phone: '+91 98765 43210',
    location: 'Bengaluru, Karnataka, India',
    avatarUrl: '/logo_a_highres.png',
    badge: 'FOUNDER',
    department: 'Executive Office',
    company: 'Artistant',
    website: 'https://artistant.in',
    calendlyUrl: 'https://artistant.in/links',
    socials: {
      linkedin: 'https://www.linkedin.com/company/artistantco/',
      twitter: 'https://x.com/artistant_in',
      instagram: 'https://instagram.com/artistant.in',
      whatsapp: 'https://wa.me/919876543210',
    },
    highlights: [
      'Engineered The Bookability Engine™ for Indian Live Industry',
      'Pioneered instant milestone-based gig escrow payouts',
      'Expanding Artistant ecosystem to 10,000+ artists & 500+ venues'
    ],
    featuredLink: {
      title: 'Artistant Executive Pitch Deck',
      url: 'https://artistant.in',
      description: 'Explore our platform architecture, market vision, and growth roadmap.'
    }
  },
  founder: {
    username: 'founder',
    name: 'Founder',
    role: 'Co-Founder & Chief Product Officer',
    tagline: 'Designing seamless digital infrastructure for creators & live show runners.',
    bio: 'Leading product design, artist experience, and community growth at Artistant. Rebuilding how live shows are contracted and executed in India.',
    email: 'founder@artistant.in',
    phone: '+91 98765 43211',
    location: 'Bengaluru, India',
    avatarUrl: '/logo_a_highres.png',
    badge: 'CO-FOUNDER',
    department: 'Product & Growth',
    company: 'Artistant',
    website: 'https://artistant.in',
    calendlyUrl: 'https://artistant.in/links',
    socials: {
      linkedin: 'https://www.linkedin.com/company/artistantco/',
      twitter: 'https://x.com/artistant_in',
      instagram: 'https://instagram.com/artistant.in',
    },
    highlights: [
      'Leading Product Experience & Design System',
      'Architecting artist verification & venue onboarding',
      'Scaling live performance tech nationwide'
    ],
    featuredLink: {
      title: 'Artistant Product Roadmap',
      url: 'https://artistant.in/changelog',
      description: 'See latest feature rollouts, API updates, and product releases.'
    }
  },
  'tech-lead': {
    username: 'tech-lead',
    name: 'Chief Technology Officer',
    role: 'CTO & Head of Engineering',
    tagline: 'High-throughput contract automation, real-time audio, and secure payment rails.',
    bio: 'Architecting distributed systems, instant payouts, and anti-fraud escrow engines for Artistant. Focused on bulletproof reliability and ultra-fast user experiences.',
    email: 'engineering@artistant.in',
    phone: '+91 98765 43212',
    location: 'Bengaluru, India',
    avatarUrl: '/logo_a_highres.png',
    badge: 'CORE TEAM',
    department: 'Engineering',
    company: 'Artistant',
    website: 'https://artistant.in',
    socials: {
      github: 'https://github.com',
      linkedin: 'https://www.linkedin.com/company/artistantco/',
      twitter: 'https://x.com/artistant_in',
    },
    highlights: [
      'Sub-second payment settlement architecture',
      'End-to-end encrypted gig contract engine',
      '99.99% system availability & auditability'
    ]
  },
  'creative-director': {
    username: 'creative-director',
    name: 'Head of Creative & Artist Ops',
    role: 'Creative Director',
    tagline: 'Curating world-class live experiences and showcasing India\'s finest talent.',
    bio: 'Overseeing artist relations, festival partnerships, creative branding, and live sound operations for Artistant.',
    email: 'artists@artistant.in',
    phone: '+91 98765 43213',
    location: 'Mumbai / Bengaluru',
    avatarUrl: '/logo_a_highres.png',
    badge: 'CORE TEAM',
    department: 'Creative & Artist Operations',
    company: 'Artistant',
    website: 'https://artistant.in',
    socials: {
      instagram: 'https://instagram.com/artistant.in',
      linkedin: 'https://www.linkedin.com/company/artistantco/',
    },
    highlights: [
      'Curating 100+ high-profile live artist showcases',
      'Partnering with top music festivals & iconic venues',
      'Artist community building & roster management'
    ]
  }
};

const TEAM_STORAGE_KEY = 'artistant_team_members_v1';

export function getAllTeamMembersMap(): Record<string, TeamMember> {
  if (typeof window === 'undefined') return TEAM_MEMBERS;
  try {
    const raw = localStorage.getItem(TEAM_STORAGE_KEY);
    if (!raw) return TEAM_MEMBERS;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? { ...TEAM_MEMBERS, ...parsed } : TEAM_MEMBERS;
  } catch (err) {
    return TEAM_MEMBERS;
  }
}

export function saveTeamMembersMap(map: Record<string, TeamMember>) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(TEAM_STORAGE_KEY, JSON.stringify(map));
    window.dispatchEvent(new Event('artistant-team-updated'));
  } catch (err) {
    console.error('Error saving team members map:', err);
  }
}

export function getTeamMember(username: string): TeamMember {
  const normalized = username.toLowerCase().trim();
  const currentMap = getAllTeamMembersMap();

  if (currentMap[normalized]) {
    return currentMap[normalized];
  }

  // Dynamic fallback for any team member or user
  const formattedName = normalized
    .split(/[-_]/)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

  return {
    username: normalized,
    name: formattedName || 'Artistant Team Member',
    role: 'Team Member & Specialist',
    tagline: 'Building the future of live entertainment infrastructure at Artistant.',
    bio: `Core team member at Artistant working on transforming India's live event ecosystem for artists, venues, and organizers.`,
    email: `${normalized}@artistant.in`,
    phone: '+91 98765 43210',
    location: 'Bengaluru, India',
    avatarUrl: '/logo_a_highres.png',
    badge: 'TEAM MEMBER',
    department: 'Artistant Ecosystem',
    company: 'Artistant',
    website: 'https://artistant.in',
    socials: {
      linkedin: 'https://www.linkedin.com/company/artistantco/',
      twitter: 'https://x.com/artistant_in',
      instagram: 'https://instagram.com/artistant.in',
    },
    highlights: [
      'Verified Artistant Ecosystem Specialist',
      'Connecting live performers with venues and organizers'
    ]
  };
}

export function generateVCardString(member: TeamMember): string {
  const nameParts = member.name.split(' ');
  const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : '';
  const firstName = nameParts[0] || member.name;

  return [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `N:${lastName};${firstName};;;`,
    `FN:${member.name}`,
    `ORG:${member.company}`,
    `TITLE:${member.role}`,
    `EMAIL;TYPE=INTERNET,WORK:${member.email}`,
    `TEL;TYPE=CELL,VOICE:${member.phone}`,
    `URL;TYPE=WORK:${member.website}`,
    `NOTE:${member.tagline} | ${member.bio.replace(/\n/g, ' ')}`,
    member.socials.linkedin ? `X-SOCIALPROFILE;TYPE=linkedin:${member.socials.linkedin}` : '',
    member.socials.twitter ? `X-SOCIALPROFILE;TYPE=twitter:${member.socials.twitter}` : '',
    member.socials.instagram ? `X-SOCIALPROFILE;TYPE=instagram:${member.socials.instagram}` : '',
    'END:VCARD'
  ].filter(Boolean).join('\r\n');
}

export function downloadVCard(member: TeamMember) {
  const vCardData = generateVCardString(member);
  const blob = new Blob([vCardData], { type: 'text/vcard;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${member.username}_artistant.vcf`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
