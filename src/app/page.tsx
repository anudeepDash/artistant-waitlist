'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, useSpring, useMotionValue, useInView, AnimatePresence } from 'motion/react';
import ParticleBackground from '@/components/ParticleBackground';
import Footer from '@/components/Footer';
import AuthModal from '@/components/AuthModal';
import RoleWaitlistModal from '@/components/RoleWaitlistModal';
import InteractiveTeaser from '@/components/InteractiveTeaser';
import UIMockupSequence from '@/components/UIMockupSequence';
import Navbar from '@/components/Navbar';
import FeatureDetailsModal from '@/components/FeatureDetailsModal';
import { getUserReservation, type WaitlistEntry } from '@/lib/waitlist';
import { signInWithGoogle, signOut } from '@/lib/auth';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { logActivityAction, checkUsernameAvailableAction, checkMultipleUsernamesAvailableAction } from '@/lib/admin-actions';

const isUsernameAvailable = checkUsernameAvailableAction;


/* ── Sleek SVG Icons for features ── */
const ICONS = [
  // 1. Connection / Engine (nodes linking)
  <svg key="1" className="w-5 h-5 text-ink stroke-current" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M16 3h5v5M8 21H3v-5M12 12m-3 0a3 3 0 1 0 6 0 3 3 0 1 0 -6 0M21 3L14.5 9.5M3 21l6.5-6.5"/></svg>,
  // 2. Shield (Escrow)
  <svg key="2" className="w-5 h-5 text-ink stroke-current" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10zM9 11l2 2 4-4"/></svg>,
  // 3. Concierge (Bell/Support)
  <svg key="3" className="w-5 h-5 text-ink stroke-current" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
  // 4. Exclusives (Crown/Star)
  <svg key="4" className="w-5 h-5 text-ink stroke-current" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>,
];

const ECOSYSTEM_FEATURES = [
  {
    title: 'The Bookability Score™',
    subtitle: 'AVAILABLE AT LAUNCH',
    desc: 'A 0-100 reliability rating based on hard data. We track response times, profile completeness, and verified client reviews.'
  },
  {
    title: 'GigSafe Escrow',
    subtitle: 'COMING SOON',
    desc: 'Zero ghosting. Secure payments where clients pay upfront and funds are automatically released to the performer post-gig.'
  },
  {
    title: 'Artistant Backstage™',
    subtitle: 'EST. LAUNCHING SOON',
    desc: 'Your internal industry network. Book backing acts, source last-minute talent, and manage crew logistics.'
  },
  {
    title: 'Replacement Guarantee',
    subtitle: 'EST. LAUNCHING SOON',
    desc: 'Total certainty for organizers. If a performer cancels, we automatically source a verified, equivalent replacement.'
  }
];

const CLAIM_MESSAGES = [
  "Your username is your brand's digital real estate. If you are @kaavya on Instagram, you cannot let someone else lock @kaavya on the network routing India's live performance bookings. Claim it to protect your business.",
  "68% of independent artists deal with 30+ day payment delays. Artistant is building the infrastructure to end the WhatsApp guessing game. Lock your custom booking handle today. Get paid T+1 post-show tomorrow.",
  "Stop sending scattered links and PDFs. Your @username becomes your professional booking identity, housing media showreels, riders, and contact parameters in one centralized hub."
];

const ROADMAP_PHASES = [
  {
    phase: '01',
    label: 'Ready for Beta',
    timeline: 'Available at Launch',
    accentColor: 'var(--brand-1)',
    features: [
      {
        title: 'Your Free Portfolio Website',
        desc: 'The custom @username link. It serves as a professional booking identity, housing media showreels, riders, and contact parameters in one centralized hub.',
        timeline: 'Launch Active',
        whatIsIt: 'A professional, custom-crafted digital portfolio hosted under your own custom @username link (e.g. artistant.in/username) that serves as your single source of truth.',
        benefit: 'Eliminates the chaos of scattered PDFs, Google Drive folders, and unoptimized social profiles. Send one clean, fast, and gorgeous link that immediately builds trust and lets clients book you.',
        about: 'Fully responsive, optimized for both desktop and mobile layouts. It dynamically aggregates your press kits, media showreels, tech riders, and social proofs, giving clients a seamless booking experience.',
        icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
          </svg>
        )
      },
      {
        title: 'Live Calendar & Availability',
        desc: 'Automated calendar management. Clients see open dates instantly, entirely eliminating the back-and-forth availability checks.',
        timeline: 'Launch Active',
        whatIsIt: 'A real-time, read-only view of your booking calendar synced directly with your primary calendar.',
        benefit: 'Ends the frustrating "Are you free on Friday?" WhatsApp back-and-forth. Organizers can check your real-time availability instantly and request holds on open dates.',
        about: 'Privacy-first architecture. It hides booking details, show names, or personal meetings, displaying only "Busy" or "Available" slots. Integrates seamlessly with timezone conversion for international clients.',
        icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
        )
      },
      {
        title: 'Direct 1-on-1 Booking Engine',
        desc: '100% direct client-to-artist workflow. No agents, no massive broker cuts, and no communication filters.',
        timeline: 'Launch Active',
        whatIsIt: 'A streamlined, frictionless booking workflow that allows event organizers to send formal gig offers directly to your inbox.',
        benefit: 'Zero agency middlemen, zero hidden fees, and zero communication delays. You negotiate and finalize deals directly, retaining 100% of your performance fees.',
        about: 'Comes with standardized contract templates, automatically generated booking sheets, and integrated chat features that log agreed terms to ensure both parties stay aligned.',
        icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
        )
      }
    ]
  },
  {
    phase: '02',
    label: 'Coming Soon',
    timeline: 'Planned — Launching Soon',
    accentColor: 'var(--brand-2)',
    features: [
      {
        title: 'Verified Live Reviews',
        desc: 'Automated, Gigsafe escrow-verified review prompts sent to organizers post-gig to build defensible, data-backed reputations.',
        timeline: 'Launching Soon',
        whatIsIt: 'A reviews system that only allows verified event organizers who completed a booking through the platform to leave feedback.',
        benefit: 'Creates a bulletproof, authentic, data-backed reputation that cannot be falsified, protecting your credibility and setting you apart from unverified artists.',
        about: 'Post-gig review prompts are triggered automatically. Feedback scores contribute directly to your Bookability Score™, improving your search visibility and overall booking rate.',
        icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
        )
      },
      {
        title: 'Replacement Guarantee',
        desc: 'If a performer cancels due to an emergency, the platform sources and secures a verified, equivalent replacement for the organizer.',
        timeline: 'Launching Soon',
        whatIsIt: 'An automated safety net for organizers. In the rare event of a cancellation, our platform immediately alerts equivalent, verified acts.',
        benefit: 'Gives corporate clients and major organizers complete peace of mind, making booking independent acts through Artistant far less risky than traditional methods.',
        about: 'Uses intelligent matchmaking to recommend performers with similar genres, price ranges, and technical riders, ensuring event continuity without extra overhead.',
        icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10zM9 11l2 2 4-4"/>
          </svg>
        )
      },
      {
        title: 'Smart Tech Riders',
        desc: 'Matches performer technical requirements against venue inventory to eliminate day-of-show hardware surprises.',
        timeline: 'Launching Soon',
        whatIsIt: 'An interactive specifications builder that maps your technical rider requirements directly against the venue\'s inventory list.',
        benefit: 'No day-of-show hardware surprises. Sound engineers and artists align instantly on gear compatibility long before the soundcheck begins.',
        about: 'Includes built-in validation checks. If a venue lacks a specific console or monitor brand, it automatically alerts both the venue manager and your technical crew to arrange rentals.',
        icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
          </svg>
        )
      },
      {
        title: 'NewBi Concierge',
        desc: 'White-glove booking management for VIP and large-scale corporate event organizers requiring end-to-end execution.',
        timeline: 'Launching Soon',
        whatIsIt: 'A premium, white-glove event production and booking support service for high-budget corporate gigs and VIP organizers.',
        benefit: 'Ensures seamless execution of complex, multi-artist events by pairing organizers with dedicated Artistant production specialists.',
        about: 'Covers contract compliance, on-ground logistics supervision, stage management support, and priority vendor coordination for flagship events.',
        icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
        )
      }
    ]
  },
  {
    phase: '03',
    label: 'Planned',
    timeline: 'Exploring — 2027+',
    accentColor: 'var(--brand-3)',
    features: [
      {
        title: 'Artistant Backstage™',
        desc: 'An internal industry network for performers to book backing acts, source last-minute talent, and manage crew logistics.',
        timeline: 'Exploring',
        whatIsIt: 'A private, peer-to-peer professional networking space built exclusively for verified performers on the platform.',
        benefit: 'Allows you to easily hire session musicians, back-up dancers, or last-minute tour crew, and exchange peer recommendations within a trusted circle.',
        about: 'Includes dynamic sub-boards by region and role, enabling swift crew communication and collaboration without cluttering public socials.',
        icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
        )
      },
      {
        title: 'Artistant Exclusives',
        desc: 'Curated premium gigs accessible exclusively to top-tier, high-performing artists on the platform.',
        timeline: 'Exploring',
        whatIsIt: 'A curated selection of high-profile corporate gigs, brand campaigns, and festival lineups open only to qualified artists.',
        benefit: 'Unlocks high-paying, verified opportunities directly from top agencies and brands without requiring personal connections or pitch presentations.',
        about: 'Monitors platform metrics (e.g. response times, client feedback, past successful transactions) to automatically grant eligible performers access to private audition boards.',
        icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
          </svg>
        )
      },
      {
        title: 'The Vendor & Venue Ecosystem',
        desc: 'An integrated network connecting performers with trusted local sound vendors, lighting crews, and partner venues.',
        timeline: 'Exploring',
        whatIsIt: 'A vetted directory of premier rental partners, sound/light equipment vendors, and live-friendly venues across India.',
        benefit: 'Drastically simplifies the logistics of touring and local gig production by letting you book verified equipment and venues side-by-side with talent.',
        about: 'Partners are continuously rated for punctuality, equipment maintenance, and technician expertise, reducing technical errors on stage.',
        icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
        )
      },
      {
        title: 'Direct Fan Ticketing',
        desc: 'Allowing performers to ticket and manage their own live shows directly through the Artistant infrastructure.',
        timeline: 'Exploring',
        whatIsIt: 'A zero-commission, white-label ticketing system that lets you sell tickets directly to your fan base from your Artistant profile.',
        benefit: 'Reclaims control over your audience data and ticket revenue, bypassing massive markups from commercial ticketing platforms.',
        about: 'Supports instant UPI payouts, customizable RSVP forms, guest list management, and digital ticket verification at the venue doors.',
        icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
        )
      },
      {
        title: 'Brand Collab Hub',
        desc: 'A portal for sponsorship integration, allowing brands to discover and fund independent tours and live IPs.',
        timeline: 'Exploring',
        whatIsIt: 'A dedicated matching portal connecting indie performers with brands seeking influencer integrations, tour sponsorships, and custom IPs.',
        benefit: 'Creates stable secondary revenue streams by facilitating direct, transparent partnerships with brands aligned with your values.',
        about: 'Offers standardized deliverables tracking, proof-of-performance uploads, and escrowed milestone payments for corporate campaigns.',
        icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
          </svg>
        )
      },
      {
        title: 'Audience Favorites & Live Requests',
        desc: "Real-time digital requests and tip jars routed straight to the performer's dashboard during live performances.",
        timeline: 'Exploring',
        whatIsIt: 'An interactive, real-time requests dashboard that audience members can access via a QR code at your live gigs.',
        benefit: 'Boosts crowd engagement and opens up direct tipping channels, letting fans request songs, dedicate shoutouts, and support you financially in real-time.',
        about: 'Features a modern web interface that filters requests, handles instant UPI/card transactions, and alerts the performer\'s monitor/tablet on stage.',
        icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="1" x2="12" y2="23"></line>
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
          </svg>
        )
      }
    ]
  }
];


/* ── Motion Variants ── */
const fUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const } },
};

const slideL = {
  hidden: { opacity: 0, x: -60 },
  visible: { opacity: 1, x: 0, transition: { type: 'spring' as const, stiffness: 80, damping: 15 } },
};

const slideR = {
  hidden: { opacity: 0, x: 60 },
  visible: { opacity: 1, x: 0, transition: { type: 'spring' as const, stiffness: 80, damping: 15 } },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.94 },
  visible: { opacity: 1, scale: 1, transition: { type: 'spring' as const, stiffness: 100, damping: 14 } },
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

/* ── Interactive Magnetic CTA Wrapper ── */
function MagneticButton({ children, onClick, className, style, ...props }: any) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
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

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (reduceMotion) return;
    const { clientX, clientY, currentTarget } = e;
    const rect = currentTarget.getBoundingClientRect();
    const x = (clientX - (rect.left + rect.width / 2)) * 0.35;
    const y = (clientY - (rect.top + rect.height / 2)) * 0.35;
    setPosition({ x, y });
  };

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 });
  };

  return (
    <motion.button
      onClick={onClick}
      className={className}
      style={{ ...style, position: 'relative' }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={reduceMotion ? { x: 0, y: 0 } : position}
      transition={{ type: 'spring', stiffness: 150, damping: 15 }}
      whileHover={reduceMotion ? {} : { scale: 1.03 }}
      whileTap={reduceMotion ? {} : { scale: 0.97 }}
      {...props}
    >
      {children}
    </motion.button>
  );
}

/* ── Glowing Feature Card (Cursor Tracking) ── */
function GlowingFeatureCard({ children, onClick, idx }: any) {
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
      className="feature-card"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); } }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(!reduceMotion)}
      onMouseLeave={() => setIsHovered(false)}
      variants={scaleIn}
      whileHover={reduceMotion ? {} : { y: -8, scale: 1.02 }}
      whileTap={reduceMotion ? {} : { scale: 0.98 }}
      style={{ position: 'relative', overflow: 'hidden' }}
    >
      {isHovered && !reduceMotion && (
        <div
          className="card-cursor-glow"
          style={{
            position: 'absolute',
            top: coords.y - 120,
            left: coords.x - 120,
            width: '240px',
            height: '240px',
            background: idx % 2 === 0
              ? 'radial-gradient(circle, rgba(0, 240, 255, 0.15) 0%, rgba(90, 50, 250, 0.05) 50%, transparent 100%)' // Cyan focused
              : 'radial-gradient(circle, rgba(90, 50, 250, 0.18) 0%, rgba(0, 240, 255, 0.04) 50%, transparent 100%)', // Indigo focused
            borderRadius: '50%',
            pointerEvents: 'none',
            mixBlendMode: "var(--glow-blend, screen)" as any,
            filter: 'blur(20px)',
            zIndex: 0,
          }}
        />
      )}
      <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
        {children}
      </div>
    </motion.div>
  );
}

export function AnimatedTitle({ text, className = "", style = {} }: { text: string; className?: string; style?: React.CSSProperties }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });
  const [displayText, setDisplayText] = useState('');

  useEffect(() => {
    if (!isInView) return;
    let frame = 0;
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#%';
    const finalLength = text.length;
    
    const interval = setInterval(() => {
      setDisplayText(
        text
          .split('')
          .map((char, index) => {
            if (index < frame / 3) {
              return text[index];
            }
            if (char === ' ') return ' ';
            return chars[Math.floor(Math.random() * chars.length)];
          })
          .join('')
      );
      
      frame++;
      if (frame / 3 >= finalLength) {
        setDisplayText(text);
        clearInterval(interval);
      }
    }, 25);

    return () => clearInterval(interval);
  }, [isInView, text]);

  return (
    <span ref={ref} className={className} style={style}>
      {displayText || text}
    </span>
  );
}

function ScatterPhoto({
  src,
  alt,
  progress,
  layout,
  priority,
}: {
  src: string;
  alt: string;
  progress: ReturnType<typeof useScroll>["scrollYProgress"];
  layout: {
    startX: string;
    startY: string;
    endX: string;
    endY: string;
    startZ: number;
    endZ: number;
    startRotZ: number;
    endRotZ: number;
    size: number;
  };
  priority?: boolean;
}) {
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile, { passive: true });
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const x = useTransform(progress, [0, 1], [layout.startX, layout.endX]);
  const y = useTransform(progress, [0, 1], [layout.startY, layout.endY]);
  const z = useTransform(progress, [0, 1], [layout.startZ, layout.endZ]);
  const rotateZ = useTransform(
    progress,
    [0, 1],
    [layout.startRotZ, layout.endRotZ]
  );

  const isLight = mounted && resolvedTheme === 'light';
  const startOpacity = isLight ? (isMobile ? 0.75 : 0.6) : (isMobile ? 0.46 : 0.26);
  const brightness = isLight ? (isMobile ? 0.95 : 0.8) : (isMobile ? 0.65 : 0.4);
  const size = isMobile ? layout.size * 2.2 : layout.size;

  const opacity = useTransform(progress, [0, 0.9, 1], [startOpacity, startOpacity, 0]);
  const scale = useTransform(progress, [0, 1], [0.92, 1.06]);

  const filter = isLight
    ? `grayscale(0.4) contrast(1.15) brightness(${brightness})`
    : `grayscale(1) contrast(1.2) brightness(${brightness})`;

  return (
    <motion.div
      className="scatter-photo absolute left-1/2 top-1/2 overflow-hidden rounded-2xl shadow-[0_30px_80px_-20px_rgba(0,0,0,0.7)]"
      style={{
        x,
        y,
        z,
        rotateZ,
        opacity,
        scale,
        width: `${size}vw`,
        aspectRatio: "3 / 4",
        translateX: "-50%",
        translateY: "-50%",
      }}
    >
      <img
        src={src}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        className="h-full w-full object-cover"
        style={{ filter }}
      />
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 rounded-2xl ring-1 ${isLight ? 'ring-black/10' : 'ring-white/10'}`}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 rounded-b-2xl"
        style={{
          background:
            "linear-gradient(to top, rgba(0,0,0,0.55), transparent)",
        }}
      />
    </motion.div>
  );
}

function SwipeHint() {
  return (
    <div className="mobile-swipe-hint">
      <span>Swipe</span>
      <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12h14M12 5l7 7-7 7" />
      </svg>
    </div>
  );
}

/* ── FAQ Accordion Item ── */
function FAQItem({ question, answer, index }: { question: string; answer: string; index: number }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div
      variants={fUp}
      className="faq-item"
      style={{ '--faq-index': index } as React.CSSProperties}
    >
      <button
        className="faq-question"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <span className="faq-question-text">{question}</span>
        <motion.span
          className="faq-chevron"
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            className="faq-answer-wrapper"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="faq-answer">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

const wordRevealVariants = {
  hidden: { y: '105%', rotate: 1.5 },
  visible: {
    y: 0,
    rotate: 0,
    transition: {
      duration: 0.6,
      ease: [0.16, 1, 0.3, 1] as const, // Liquid slide-up ease
    }
  }
};

const staggerHeadlineWords = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.04, // Smooth sequential word stagger delay
    }
  }
};

const getCandidateUsernames = (raw: string): string[] => {
  const cleanInput = raw.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
  if (cleanInput.length === 0) return [];

  const reservedUsernames = new Set([
    'admin', 'administrator', 'support', 'official', 'artistant', 'artist', 'tant',
    'mod', 'moderator', 'help', 'api', 'auth', 'login', 'logout', 'signin', 'signup',
    'register', 'user', 'username', 'null', 'undefined', 'root', 'system', 'security',
    'events', 'event', 'booking', 'bookings', 'gig', 'gigs', 'host', 'venue', 'fan',
    'developer', 'dev', 'webmaster', 'privacy', 'terms', 'about', 'contact', 'blog',
    'news', 'careers', 'jobs', 'faq', 'payment', 'billing', 'checkout', 'test',
    'demo', 'example'
  ]);

  const premiumUsernames = new Set([
    'ai', 'india', 'dj', 'genre', 'genres', 'music', 'singer', 'band', 'comedian',
    'dancer', 'rapper', 'hiphop', 'rock', 'pop', 'jazz', 'techno', 'edm', 'live',
    'show', 'bangalore', 'mumbai', 'goa', 'delhi'
  ]);

  const suffixes = ['_live', '_official', '_music', '_art', '_sound', '_hq', '_show'];
  const prefixes = ['the_', 'iam_', 'real_'];
  
  const candidates: string[] = [];
  
  const isValidCandidate = (name: string) => {
    return (
      name.length >= 3 &&
      name.length <= 20 &&
      /^[a-z]/.test(name) &&
      /^[a-z0-9_]+$/.test(name) &&
      !reservedUsernames.has(name) &&
      !premiumUsernames.has(name)
    );
  };

  if (!/^[a-z]/.test(cleanInput)) {
    for (const pref of prefixes) {
      const candidate = `${pref}${cleanInput}`;
      if (isValidCandidate(candidate)) {
        candidates.push(candidate);
      }
    }
  }

  for (const pref of prefixes) {
    const candidate = `${pref}${cleanInput}`;
    if (isValidCandidate(candidate)) {
      candidates.push(candidate);
    }
  }
  
  for (const suff of suffixes) {
    const candidate = `${cleanInput}${suff}`;
    if (isValidCandidate(candidate)) {
      candidates.push(candidate);
    }
  }
  
  const currentYear = new Date().getFullYear();
  const yearCandidate = `${cleanInput}_${currentYear}`;
  if (isValidCandidate(yearCandidate)) {
    candidates.push(yearCandidate);
  }
  
  const numCandidate = `${cleanInput}99`;
  if (isValidCandidate(numCandidate)) {
    candidates.push(numCandidate);
  }

  return Array.from(new Set(candidates)).filter(c => c !== cleanInput);
};

export default function Home() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const frequenciesRef = useRef<HTMLElement | null>(null);
  const roadmapScrollRef = useRef<HTMLDivElement>(null);

  const scrollRoadmap = (direction: 'left' | 'right') => {
    if (roadmapScrollRef.current) {
      const scrollAmount = window.innerWidth < 768 ? 320 : 400; // rough width of card + gap
      roadmapScrollRef.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
    }
  };

  const { user } = useAuth();
  const router = useRouter();
  const [claimMessageIdx, setClaimMessageIdx] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setClaimMessageIdx((prev) => (prev + 1) % CLAIM_MESSAGES.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (err) {
      console.error("Error signing out: [REDACTED_ERROR]");
    }
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'organizer' | 'attendee' | 'venue' | null>(null);
  const [usernameInput, setUsernameInput] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [availStatus, setAvailStatus] = useState<'idle' | 'checking' | 'available' | 'taken' | 'invalid' | 'locked'>('idle');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [userReservation, setUserReservation] = useState<WaitlistEntry | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  
  // Roadmap feature detail popup state
  const [selectedFeature, setSelectedFeature] = useState<{
    title: string;
    desc: string;
    timeline: string;
    icon: React.ReactNode;
    whatIsIt?: string;
    benefit?: string;
    about?: string;
  } | null>(null);
  const [selectedPhase, setSelectedPhase] = useState<{
    phase: string;
    label: string;
    timeline: string;
    accentColor: string;
  } | null>(null);
  const [isFeatureModalOpen, setIsFeatureModalOpen] = useState(false);

  const handleSuggestionClick = (name: string) => {
    setUsernameInput(name);
    const input = document.getElementById('username-waitlist-input');
    if (input) {
      setTimeout(() => (input as HTMLInputElement).focus(), 50);
    }
  };

  // Fetch the current user's reservation when they sign in
  useEffect(() => {
    if (!user) { setUserReservation(null); return; }
    getUserReservation(user.uid).then(setUserReservation).catch(() => setUserReservation(null));
  }, [user]);

  // Log visitor activity
  useEffect(() => {
    const hasLoggedVisit = sessionStorage.getItem("artistant_visit_logged");
    if (!hasLoggedVisit) {
      const logVisit = async () => {
        try {
          await logActivityAction({
            actionType: "visit",
            ...(user ? { idToken: await user.getIdToken() } : {}),
          });
          sessionStorage.setItem("artistant_visit_logged", "true");
        } catch (e) {
          console.warn("Failed to log visit activity", e);
        }
      };
      logVisit();
    }
  }, [user, userReservation]);


  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mediaQueryMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const checkMotion = () => {
      setReduceMotion(mediaQueryMotion.matches || window.innerWidth < 768);
      setIsMobile(window.innerWidth < 768);
    };
    checkMotion();
    window.addEventListener('resize', checkMotion, { passive: true });
    mediaQueryMotion.addEventListener('change', checkMotion);
    return () => {
      window.removeEventListener('resize', checkMotion);
      mediaQueryMotion.removeEventListener('change', checkMotion);
    };
  }, []);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const scrollToWaitlist = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    const target = document.getElementById('join');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
      const input = document.getElementById('username-waitlist-input');
      if (input) {
        setTimeout(() => (input as HTMLInputElement).focus(), 800);
      }
    }
  };

  useEffect(() => {
    const raw = usernameInput.trim().toLowerCase();
    
    if (raw.length === 0) {
      setAvailStatus('idle');
      setValidationError(null);
      setSuggestions([]);
      setSuggestionsLoading(false);
      return;
    }
    
    if (raw.length < 3) {
      setAvailStatus('invalid');
      setValidationError('Must be at least 3 characters');
      if (raw.length >= 2) {
        setSuggestionsLoading(true);
        const timer = setTimeout(async () => {
          try {
            const candidates = getCandidateUsernames(raw);
            const availabilityMap = await checkMultipleUsernamesAvailableAction(candidates);
            const available = candidates.filter(c => availabilityMap[c]).slice(0, 4);
            setSuggestions(available);
          } catch {
            setSuggestions([]);
          } finally {
            setSuggestionsLoading(false);
          }
        }, 500);
        return () => clearTimeout(timer);
      } else {
        setSuggestions([]);
        setSuggestionsLoading(false);
      }
      return;
    }
    if (raw.length > 20) {
      setAvailStatus('invalid');
      setValidationError('Must be 20 characters or fewer');
      setSuggestions([]);
      setSuggestionsLoading(false);
      return;
    }
    if (!/^[a-z]/.test(raw)) {
      setAvailStatus('invalid');
      setValidationError('Must start with a letter');
      setSuggestionsLoading(true);
      const timer = setTimeout(async () => {
        try {
          const candidates = getCandidateUsernames(raw);
          const availabilityMap = await checkMultipleUsernamesAvailableAction(candidates);
          const available = candidates.filter(c => availabilityMap[c]).slice(0, 4);
          setSuggestions(available);
        } catch {
          setSuggestions([]);
        } finally {
          setSuggestionsLoading(false);
        }
      }, 500);
      return () => clearTimeout(timer);
    }
    if (!/^[a-z0-9_]+$/.test(raw)) {
      setAvailStatus('invalid');
      setValidationError('Letters, numbers, and underscores only');
      setSuggestions([]);
      setSuggestionsLoading(false);
      return;
    }

    const reservedUsernames = new Set([
      'admin', 'administrator', 'support', 'official', 'artistant', 'artist', 'tant',
      'mod', 'moderator', 'help', 'api', 'auth', 'login', 'logout', 'signin', 'signup',
      'register', 'user', 'username', 'null', 'undefined', 'root', 'system', 'security',
      'events', 'event', 'booking', 'bookings', 'gig', 'gigs', 'host', 'venue', 'fan',
      'developer', 'dev', 'webmaster', 'privacy', 'terms', 'about', 'contact', 'blog',
      'news', 'careers', 'jobs', 'faq', 'payment', 'billing', 'checkout', 'test',
      'demo', 'example'
    ]);

    if (reservedUsernames.has(raw)) {
      setAvailStatus('invalid');
      setValidationError('This username is reserved');
      setSuggestionsLoading(true);
      const timer = setTimeout(async () => {
        try {
          const candidates = getCandidateUsernames(raw);
          const availabilityMap = await checkMultipleUsernamesAvailableAction(candidates);
          const available = candidates.filter(c => availabilityMap[c]).slice(0, 4);
          setSuggestions(available);
        } catch {
          setSuggestions([]);
        } finally {
          setSuggestionsLoading(false);
        }
      }, 500);
      return () => clearTimeout(timer);
    }

    const premiumUsernames = new Set([
      'ai', 'india', 'dj', 'genre', 'genres', 'music', 'singer', 'band', 'comedian',
      'dancer', 'rapper', 'hiphop', 'rock', 'pop', 'jazz', 'techno', 'edm', 'live',
      'show', 'bangalore', 'mumbai', 'goa', 'delhi'
    ]);

    if (premiumUsernames.has(raw)) {
      setAvailStatus('locked');
      setValidationError('This premium username is locked');
      setSuggestionsLoading(true);
      const timer = setTimeout(async () => {
        try {
          const candidates = getCandidateUsernames(raw);
          const availabilityMap = await checkMultipleUsernamesAvailableAction(candidates);
          const available = candidates.filter(c => availabilityMap[c]).slice(0, 4);
          setSuggestions(available);
        } catch {
          setSuggestions([]);
        } finally {
          setSuggestionsLoading(false);
        }
      }, 500);
      return () => clearTimeout(timer);
    }

    setAvailStatus('checking');
    setValidationError(null);
    setSuggestionsLoading(true);

    const timer = setTimeout(async () => {
      try {
        const res = await isUsernameAvailable(raw);
        if (res.success && res.available) {
          setAvailStatus('available');
          setSuggestions([]);
          setSuggestionsLoading(false);
        } else if (res.success && !res.available) {
          setAvailStatus('taken');
          const candidates = getCandidateUsernames(raw);
          const availabilityMap = await checkMultipleUsernamesAvailableAction(candidates);
          const available = candidates.filter(c => availabilityMap[c]).slice(0, 4);
          setSuggestions(available);
          setSuggestionsLoading(false);
        } else {
          setAvailStatus('invalid');
          setValidationError(res.error || 'Error checking availability');
          setSuggestionsLoading(false);
        }
      } catch (err: any) {
        setAvailStatus('invalid');
        setValidationError(err?.message || 'Error checking availability');
        setSuggestionsLoading(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [usernameInput]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const ref = params.get('ref');
      if (ref) {
        localStorage.setItem('artistant_ref', ref.trim().toLowerCase());
      }
    }
  }, []);

  const [activePhase, setActivePhase] = useState('core');

  // Framer motion scroll Hook for Parallax Background effects
  const { scrollY, scrollYProgress } = useScroll();
  const scrollProgressY = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });
  const yBgParallax = useTransform(scrollY, [0, 1000], [0, -120]);
  const yOrbParallax = useTransform(scrollY, [0, 1000], [0, -180]);

  const sectionScroll = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });
  const smoothSectionProgress = useSpring(sectionScroll.scrollYProgress, {
    stiffness: 85,
    damping: 28,
    restDelta: 0.001
  });

  // Zero-Gravity Mouse Motion Tracker (Antigravity style interactive physics)
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 70, damping: 25 });
  const springY = useSpring(mouseY, { stiffness: 70, damping: 25 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) - 0.5;
      const y = (e.clientY / window.innerHeight) - 0.5;
      mouseX.set(x);
      mouseY.set(y);
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  // Background Bento Zoom Out transforms for Hero
  const heroBentoScale = useTransform(scrollY, [0, 600], [1, 1.45]); // zoom in/up to fly towards/off screen
  const heroBentoOpacity = useTransform(scrollY, [0, 450], [0.5, 0]);

  // Mouse drifting coordinates
  const c1X = useTransform(springX, [-0.5, 0.5], [-50, 50]);
  const c1Y = useTransform(springY, [-0.5, 0.5], [-50, 50]);
  const c2X = useTransform(springX, [-0.5, 0.5], [40, -40]);
  const c2Y = useTransform(springY, [-0.5, 0.5], [40, -40]);
  const c3X = useTransform(springX, [-0.5, 0.5], [-60, 60]);
  const c3Y = useTransform(springY, [-0.5, 0.5], [-60, 60]);
  const c4X = useTransform(springX, [-0.5, 0.5], [50, -50]);
  const c4Y = useTransform(springY, [-0.5, 0.5], [50, -50]);
  const c5X = useTransform(springX, [-0.5, 0.5], [-30, 30]);
  const c5Y = useTransform(springY, [-0.5, 0.5], [-30, 30]);
  const c6X = useTransform(springX, [-0.5, 0.5], [45, -45]);
  const c6Y = useTransform(springY, [-0.5, 0.5], [45, -45]);

  // Dynamic Scatter vectors on scroll (flying away)
  const c1ScrollX = useTransform(scrollY, [0, 600], [0, -350]);
  const c1ScrollY = useTransform(scrollY, [0, 600], [0, -300]);
  const c1CombinedX = useTransform([c1X, c1ScrollX], ([mX, sX]) => (mX as number) + (sX as number));
  const c1CombinedY = useTransform([c1Y, c1ScrollY], ([mY, sY]) => (mY as number) + (sY as number));

  const c2ScrollY = useTransform(scrollY, [0, 600], [0, -450]);
  const c2CombinedY = useTransform([c2Y, c2ScrollY], ([mY, sY]) => (mY as number) + (sY as number));

  const c3ScrollX = useTransform(scrollY, [0, 600], [0, 350]);
  const c3ScrollY = useTransform(scrollY, [0, 600], [0, -300]);
  const c3CombinedX = useTransform([c3X, c3ScrollX], ([mX, sX]) => (mX as number) + (sX as number));
  const c3CombinedY = useTransform([c3Y, c3ScrollY], ([mY, sY]) => (mY as number) + (sY as number));

  const c4ScrollX = useTransform(scrollY, [0, 600], [0, -350]);
  const c4ScrollY = useTransform(scrollY, [0, 600], [0, 300]);
  const c4CombinedX = useTransform([c4X, c4ScrollX], ([mX, sX]) => (mX as number) + (sX as number));
  const c4CombinedY = useTransform([c4Y, c4ScrollY], ([mY, sY]) => (mY as number) + (sY as number));

  const c5ScrollY = useTransform(scrollY, [0, 600], [0, 450]);
  const c5CombinedY = useTransform([c5Y, c5ScrollY], ([mY, sY]) => (mY as number) + (sY as number));

  const c6ScrollX = useTransform(scrollY, [0, 600], [0, 350]);
  const c6ScrollY = useTransform(scrollY, [0, 600], [0, 300]);
  const c6CombinedX = useTransform([c6X, c6ScrollX], ([mX, sX]) => (mX as number) + (sX as number));
  const c6CombinedY = useTransform([c6Y, c6ScrollY], ([mY, sY]) => (mY as number) + (sY as number));





  // Tracking active section nodes along the progress line
  const [activeNode, setActiveNode] = useState(1);
  useEffect(() => {
    const handleScrollNodes = () => {
      const h = window.innerHeight;
      const y = window.scrollY;
      if (y < h * 0.8) setActiveNode(1);
      else if (y < h * 1.8) setActiveNode(2);
      else if (y < h * 2.8) setActiveNode(3);
      else if (y < h * 3.8) setActiveNode(4);
      else setActiveNode(5);
    };
    window.addEventListener('scroll', handleScrollNodes, { passive: true });
    return () => window.removeEventListener('scroll', handleScrollNodes);
  }, []);

  const handleWaitlistSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (availStatus === 'taken') return;
    if (availStatus === 'locked') {
      const subject = encodeURIComponent(`Premium Username Request: @${usernameInput}`);
      const body = encodeURIComponent(
        `Hi Artistant Team,\n\n` +
        `I would like to request verification and allocation of the premium username: @${usernameInput}.\n\n` +
        `Here is my profile information:\n` +
        `- Full Name / Brand:\n` +
        `- Link to social profiles (Instagram/Spotify/YouTube):\n\n` +
        `Thanks!`
      );
      window.location.href = `mailto:hello@artistant.in?subject=${subject}&body=${body}`;
      return;
    }
    if (availStatus === 'available') {
      openModal();
    }
  };

  return (
    <main style={{ background: 'var(--bg)', color: 'var(--ink)' }}>



      {/* ──────────────────────── NAV ──────────────────────── */}
      <Navbar
        user={user}
        userReservation={userReservation}
        onSignInClick={openModal}
        onSignOut={handleSignOut}
        onProfileClick={() => router.push('/dashboard')}
      />

      {/* ──────────────────────── SCROLL-DRIVEN 3D SCATTER HERO ──────────────────────── */}
      <section
        ref={sectionRef}
        id="top"
        className="relative"
        style={{
          // Reserve scroll room for the fly-away bento scatter animation to play out
          height: "140vh",
          background: "var(--bg)",
        }}
      >
        {/* Layered background — radial gradient + grid (Rendered outside sticky stage so negative translateZ elements do not stack behind it) */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-0"
          style={{
            background:
              "radial-gradient(ellipse 70% 50% at 50% 50%, var(--hero-glow-1), transparent 60%), radial-gradient(ellipse 60% 40% at 20% 80%, var(--hero-glow-2), transparent 55%)",
          }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-0 opacity-40"
          style={{
            backgroundImage:
              "linear-gradient(var(--grid-line) 1px, transparent 1px), linear-gradient(90deg, var(--grid-line) 1px, transparent 1px)",
            backgroundSize: "80px 80px",
            maskImage: "radial-gradient(ellipse 80% 70% at 50% 40%, black 30%, transparent 80%)",
            WebkitMaskImage: "radial-gradient(ellipse 80% 70% at 50% 40%, black 30%, transparent 80%)",
          }}
        />

        {/* Sticky inner stage — locks the headline + photos in the viewport */}
        <div
          className="sticky top-0 flex h-screen w-full items-center justify-center overflow-hidden"
          style={{
            perspective: "1600px",
            transformStyle: "preserve-3d",
            padding: "160px var(--gutter) 80px",
            zIndex: 1,
          }}
        >

          {/* 3D Scattered photos drifting past the camera */}
          <ScatterPhoto src="/gallery_1.png" alt="Crowd silhouettes holding hands in heart shape" progress={smoothSectionProgress} layout={{ startX: "-32vw", startY: "-22vh", endX: "-55vw", endY: "-40vh", startZ: -220, endZ: 320, startRotZ: -8, endRotZ: -24, size: 17 }} />
          <ScatterPhoto src="/gallery_2.png" alt="Vintage microphone on stage" progress={smoothSectionProgress} layout={{ startX: "30vw", startY: "-26vh", endX: "55vw", endY: "-44vh", startZ: -140, endZ: 380, startRotZ: 6, endRotZ: 18, size: 15 }} />
          <ScatterPhoto src="/gallery_3.png" alt="Singer performing live under spotlight" progress={smoothSectionProgress} layout={{ startX: "-38vw", startY: "18vh", endX: "-58vw", endY: "44vh", startZ: -90, endZ: 360, startRotZ: 5, endRotZ: 22, size: 13 }} />
          <ScatterPhoto src="/gallery_4.png" alt="Stadium concert crowd under confetti" progress={smoothSectionProgress} layout={{ startX: "34vw", startY: "22vh", endX: "60vw", endY: "44vh", startZ: -200, endZ: 400, startRotZ: -7, endRotZ: -20, size: 16 }} />
          <ScatterPhoto src="/gallery_5.png" alt="Close-up of a DJ mixer deck" progress={smoothSectionProgress} layout={{ startX: "0vw", startY: "-30vh", endX: "12vw", endY: "-58vh", startZ: -300, endZ: 280, startRotZ: 3, endRotZ: 14, size: 12 }} />
          <ScatterPhoto src="/gallery_6.png" alt="Concert stage band performance" progress={smoothSectionProgress} layout={{ startX: "0vw", startY: "30vh", endX: "-12vw", endY: "56vh", startZ: -260, endZ: 300, startRotZ: -4, endRotZ: -18, size: 14 }} />

          {/* Orbs */}
          <motion.div className="orb orb-1" aria-hidden="true" style={{ y: yOrbParallax }} />
          <motion.div className="orb orb-2" aria-hidden="true" style={{ y: yOrbParallax }} />

          {/* Content Stage */}
          <div className="hero-inner" style={{ transformStyle: "preserve-3d" }}>

            {/* Eyebrow */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              style={{ position: 'relative', zIndex: 10, marginBottom: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px' }}
            >
              <span style={{ flex: 1, maxWidth: '48px', height: '1px', background: 'linear-gradient(90deg, transparent, rgba(242,90,43,0.4))' }} />
              <span style={{
                fontSize: '10px',
                fontFamily: 'var(--font-mono)',
                fontWeight: '600',
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: 'var(--ink-2)',
              }}>
                India&apos;s Live Economy,{' '}
                <span style={{
                  background: 'linear-gradient(90deg, #F25A2B, #7C5CFF)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  display: 'inline-block',
                }}>Rebuilt</span>
              </span>
              <span style={{ flex: 1, maxWidth: '48px', height: '1px', background: 'linear-gradient(90deg, rgba(124,92,255,0.4), transparent)' }} />
            </motion.div>

            {/* Headline */}
            <motion.h1 
              className="hero-headline"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              style={{ position: 'relative', zIndex: 10 }}
            >
              <span className="hero-line block">
                India runs on <span className="hero-italic" style={{ color: 'var(--brand-1)' }}>live events.</span>
              </span>
              <span className="hero-line hero-outline block">
                Booking it
              </span>
              <span className="hero-line block">
                <span className="strike" style={{ color: 'var(--ink-2)' }}>shouldn&apos;t</span> <span className="hero-italic" style={{ color: 'var(--brand-1)' }}>just</span>
              </span>
              <span className="hero-line hero-outline block">
                run on WhatsApp.
              </span>
            </motion.h1>

            {/* Subhead */}
            <motion.p 
              className="hero-sub"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
              style={{ position: 'relative', zIndex: 10 }}
            >
              Step into The Bookability Engine™. Secure your custom portfolio, share standard rates, and lock in bookings instantly.
            </motion.p>

            {/* CTAs */}
            <motion.div 
              className="hero-ctas"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
            >
              <MagneticButton 
                onClick={scrollToWaitlist} 
                className="btn-primary"
                style={{
                  background: 'linear-gradient(135deg, #F25A2B 0%, #7C5CFF 100%)',
                  color: '#FFFFFF',
                  fontWeight: '700',
                  border: 'none',
                  cursor: 'pointer',
                  opacity: 1
                }}
              >
                Reserve Username
              </MagneticButton>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ──────────────────────── WHAT IS ARTISTANT? ──────────────────────── */}
      <section id="what-is-artistant" className="section" style={{ borderTop: '1px solid var(--line-soft)', position: 'relative', overflow: 'hidden' }}>
        {/* Ambient background glow */}
        <div aria-hidden="true" style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '800px',
          height: '800px',
          background: 'radial-gradient(circle, rgba(242,90,43,0.08) 0%, rgba(124,92,255,0.06) 40%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div className="section-inner">
          <motion.div
            className="section-label"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fUp}
            style={{ justifyContent: 'center', marginBottom: 16 }}
          >
            Introducing ArtisTant
          </motion.div>

          <motion.h2
            className="section-heading"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fUp}
            style={{ textAlign: 'center', margin: '0 auto 20px auto', maxWidth: '850px' }}
          >
            What is <AnimatedTitle text="ArtisTant?" className="brand-text" />
          </motion.h2>

          <motion.p
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fUp}
            style={{
              textAlign: 'center',
              color: 'var(--ink-2)',
              fontSize: 'clamp(16px, 1.5vw, 19px)',
              lineHeight: 1.6,
              maxWidth: '720px',
              margin: '0 auto 56px auto',
            }}
          >
            ArtisTant is India&apos;s first dedicated booking infrastructure for the live performance industry.
            We&apos;re replacing the broken, informal booking culture — scattered WhatsApp chats, unreliable agents, delayed payments —
            with a professional, technology-driven platform that empowers artists, organizers, and venues alike.
          </motion.p>

          {/* Three Value Pillars */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
            variants={staggerContainer}
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '24px',
              maxWidth: '1100px',
              margin: '0 auto',
            }}
          >
            {/* Pillar 1 — For Artists */}
            <motion.div 
              variants={scaleIn} 
              className="what-is-card"
              whileHover={{ scale: 1.02, borderColor: 'rgba(242, 90, 43, 0.4)' }}
              whileTap={{ scale: 0.98 }}
              style={{ cursor: 'pointer' }}
            >
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '150px', background: 'var(--what-is-card-glow-1)', pointerEvents: 'none' }} />
              <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', height: '100%' }}>
                <div style={{ fontSize: '12px', color: '#F25A2B', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px', fontWeight: 600 }}>
                  FOR PERFORMERS
                </div>
                <h3 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--ink)', marginBottom: '16px', letterSpacing: '-0.02em', textTransform: 'uppercase', lineHeight: '1.1' }}>
                  SHOWCASE & GET <span style={{ color: '#F25A2B' }}>BOOKED</span>.
                </h3>
                <p className="what-is-card-desc" style={{ fontSize: '14px', color: 'var(--ink-2)', lineHeight: '1.5', marginBottom: '20px' }}>
                  Everything you need to run your live performance business professionally, without commissions.
                </p>
                <ul className="what-is-card-points">
                  <li className="what-is-card-point">
                    <span className="what-is-card-point-bullet" style={{ background: '#F25A2B' }} />
                    <span style={{ fontSize: '13.5px', color: 'var(--ink-2)' }}><strong style={{ color: 'var(--ink)' }}>Digital Booking Profile:</strong> Houses press kits, media showreels, and technical riders in a clean layout.</span>
                  </li>
                  <li className="what-is-card-point">
                    <span className="what-is-card-point-bullet" style={{ background: '#F25A2B' }} />
                    <span style={{ fontSize: '13.5px', color: 'var(--ink-2)' }}><strong style={{ color: 'var(--ink)' }}>Direct Bookings:</strong> Receive formal gig offers directly from venue managers and organizers, eliminating middlemen.</span>
                  </li>
                  <li className="what-is-card-point">
                    <span className="what-is-card-point-bullet" style={{ background: '#F25A2B' }} />
                    <span style={{ fontSize: '13.5px', color: 'var(--ink-2)' }}><strong style={{ color: 'var(--ink)' }}>Zero Commission:</strong> Set your own transparent rates and keep 100% of your performance earnings.</span>
                  </li>
                </ul>
              </div>
            </motion.div>

            {/* Pillar 2 — For Organizers */}
            <motion.div 
              variants={scaleIn} 
              className="what-is-card"
              whileHover={{ scale: 1.02, borderColor: 'rgba(124, 92, 255, 0.4)' }}
              whileTap={{ scale: 0.98 }}
              style={{ cursor: 'pointer' }}
            >
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '150px', background: 'var(--what-is-card-glow-2)', pointerEvents: 'none' }} />
              <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', height: '100%' }}>
                <div style={{ fontSize: '12px', color: '#7C5CFF', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px', fontWeight: 600 }}>
                  FOR ORGANIZERS
                </div>
                <h3 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--ink)', marginBottom: '16px', letterSpacing: '-0.02em', textTransform: 'uppercase', lineHeight: '1.1' }}>
                  DISCOVER & HIRE <span style={{ color: '#7C5CFF' }}>TALENT</span>.
                </h3>
                <p className="what-is-card-desc" style={{ fontSize: '14px', color: 'var(--ink-2)', lineHeight: '1.5', marginBottom: '20px' }}>
                  A streamlined discovery and workflow engine to source and hire live talent with confidence.
                </p>
                <ul className="what-is-card-points">
                  <li className="what-is-card-point">
                    <span className="what-is-card-point-bullet" style={{ background: '#7C5CFF' }} />
                    <span style={{ fontSize: '13.5px', color: 'var(--ink-2)' }}><strong style={{ color: 'var(--ink)' }}>Real-Time Availability:</strong> View up-to-date artist availability instantly, avoiding coordinate checks.</span>
                  </li>
                  <li className="what-is-card-point">
                    <span className="what-is-card-point-bullet" style={{ background: '#7C5CFF' }} />
                    <span style={{ fontSize: '13.5px', color: 'var(--ink-2)' }}><strong style={{ color: 'var(--ink)' }}>Verified Directory:</strong> Discover verified local performers, review portfolios, and compare pricing.</span>
                  </li>
                  <li className="what-is-card-point">
                    <span className="what-is-card-point-bullet" style={{ background: '#7C5CFF' }} />
                    <span style={{ fontSize: '13.5px', color: 'var(--ink-2)' }}><strong style={{ color: 'var(--ink)' }}>Structured Contracts:</strong> Send standardized gig agreements that log terms and keep matches secure.</span>
                  </li>
                </ul>
              </div>
            </motion.div>

            {/* Pillar 3 — The Infrastructure */}
            <motion.div 
              variants={scaleIn} 
              className="what-is-card"
              whileHover={{ scale: 1.02, borderColor: 'rgba(212, 86, 122, 0.4)' }}
              whileTap={{ scale: 0.98 }}
              style={{ cursor: 'pointer' }}
            >
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '150px', background: 'var(--what-is-card-glow-3)', pointerEvents: 'none' }} />
              <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', height: '100%' }}>
                <div style={{ fontSize: '12px', color: '#D4567A', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px', fontWeight: 600 }}>
                  TRUST LAYER
                </div>
                <h3 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--ink)', marginBottom: '16px', letterSpacing: '-0.02em', textTransform: 'uppercase', lineHeight: '1.1' }}>
                  SECURED GIGS & <span style={{ color: '#D4567A' }}>PAYMENTS</span>.
                </h3>
                <p className="what-is-card-desc" style={{ fontSize: '14px', color: 'var(--ink-2)', lineHeight: '1.5', marginBottom: '20px' }}>
                  Modern payment and scheduling protections that keep the performance industry secure.
                </p>
                <ul className="what-is-card-points">
                  <li className="what-is-card-point">
                    <span className="what-is-card-point-bullet" style={{ background: '#D4567A' }} />
                    <span style={{ fontSize: '13.5px', color: 'var(--ink-2)' }}><strong style={{ color: 'var(--ink)' }}>GigSafe Escrow:</strong> Pay upfront with automated release (T+1 post-show), assuring payments and refunds.</span>
                  </li>
                  <li className="what-is-card-point">
                    <span className="what-is-card-point-bullet" style={{ background: '#D4567A' }} />
                    <span style={{ fontSize: '13.5px', color: 'var(--ink-2)' }}><strong style={{ color: 'var(--ink)' }}>Bookability Score™:</strong> Data-backed ratings scoring artists based on response times and gig success.</span>
                  </li>
                  <li className="what-is-card-point">
                    <span className="what-is-card-point-bullet" style={{ background: '#D4567A' }} />
                    <span style={{ fontSize: '13.5px', color: 'var(--ink-2)' }}><strong style={{ color: 'var(--ink)' }}>Replacement Guarantee:</strong> Peace of mind with automated matching to equivalent performers.</span>
                  </li>
                </ul>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ──────────────────────── THE PROBLEM (REAL VOICES) ──────────────────────── */}
      <section id="problem-voices" className="section" style={{ borderTop: '1px solid var(--line-soft)', paddingBottom: '40px', position: 'relative', overflow: 'hidden' }}>


        <div className="section-inner">
          <motion.div 
            className="section-label"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fUp}
          >
            Real Talk — The Problem
          </motion.div>

          <motion.h2 
            className="section-heading"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fUp}
            style={{ maxWidth: '30ch' }}
          >
            India runs on live events, but booking runs on <AnimatedTitle text="chaos." className="brand-text" />
          </motion.h2>

          <div className="voices-grid" style={{ marginTop: 48 }}>
            {/* Voice 01 */}
            <motion.div 
              className="voice-card"
              whileHover={{ scale: 1.02, borderColor: 'rgba(242, 90, 43, 0.4)' }}
              whileTap={{ scale: 0.98 }}
              style={{ cursor: 'pointer' }}
              initial={{ opacity: 0, y: 30, rotate: -0.5 }}
              whileInView={{ opacity: 1, y: 0, rotate: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1, duration: 0.6 }}
            >
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '150px', background: 'var(--what-is-card-glow-1)', pointerEvents: 'none', zIndex: 1 }} />
              <p className="voice-quote" style={{ position: 'relative', zIndex: 2 }}>
                I lost a ₹80K corporate gig because the event manager ghosted after confirming on WhatsApp. No contract, no proof, nothing.
              </p>
              <div className="voice-person" style={{ position: 'relative', zIndex: 2 }}>
                <div className="voice-avatar" style={{ background: 'linear-gradient(135deg, #F25A2B, #D4567A)' }}>P</div>
                <div className="voice-info">
                  <span className="voice-name">Priya Menon</span>
                  <span className="voice-role">Singer-songwriter · Bengaluru</span>
                </div>
              </div>
            </motion.div>

            {/* Voice 02 */}
            <motion.div 
              className="voice-card"
              whileHover={{ scale: 1.02, borderColor: 'rgba(124, 92, 255, 0.4)' }}
              whileTap={{ scale: 0.98 }}
              style={{ cursor: 'pointer' }}
              initial={{ opacity: 0, y: 30, rotate: 0.5 }}
              whileInView={{ opacity: 1, y: 0, rotate: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '150px', background: 'var(--what-is-card-glow-2)', pointerEvents: 'none', zIndex: 1 }} />
              <p className="voice-quote" style={{ position: 'relative', zIndex: 2 }}>
                I spent 3 weeks chasing a club promoter for my ₹45K advance. By the time I got paid, I&apos;d already played the next 4 shows for free.
              </p>
              <div className="voice-person" style={{ position: 'relative', zIndex: 2 }}>
                <div className="voice-avatar" style={{ background: 'linear-gradient(135deg, #7C5CFF, #6B7CDB)' }}>R</div>
                <div className="voice-info">
                  <span className="voice-name">Rohan Kapoor</span>
                  <span className="voice-role">DJ & Producer · Mumbai</span>
                </div>
              </div>
            </motion.div>

            {/* Voice 03 */}
            <motion.div 
              className="voice-card"
              whileHover={{ scale: 1.02, borderColor: 'rgba(212, 86, 122, 0.4)' }}
              whileTap={{ scale: 0.98 }}
              style={{ cursor: 'pointer' }}
              initial={{ opacity: 0, y: 30, rotate: -0.3 }}
              whileInView={{ opacity: 1, y: 0, rotate: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '150px', background: 'var(--what-is-card-glow-3)', pointerEvents: 'none', zIndex: 1 }} />
              <p className="voice-quote" style={{ position: 'relative', zIndex: 2 }}>
                I quoted an artist ₹1.5L. The agent told the client ₹4.5L. The artist had no idea. That&apos;s the industry norm.
              </p>
              <div className="voice-person" style={{ position: 'relative', zIndex: 2 }}>
                <div className="voice-avatar" style={{ background: 'linear-gradient(135deg, #D4567A, #F25A2B)' }}>A</div>
                <div className="voice-info">
                  <span className="voice-name">Arjun Desai</span>
                  <span className="voice-role">Event Planner · Goa</span>
                </div>
              </div>
            </motion.div>
          </div>
          <SwipeHint />
        </div>
      </section>

      {/* ──────────────────────── DUAL COMPARISON ──────────────────────── */}
      <section id="comparison" className="section" style={{ borderTop: '1px solid var(--line-soft)' }}>
        <div className="section-inner">
          <motion.div 
            className="section-label"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fUp}
          >
            The Comparison
          </motion.div>

          <motion.h2 
            className="section-heading"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fUp}
          >
            How bookings <AnimatedTitle text="evolve." className="brand-text" />
          </motion.h2>

          <div className="comparison-grid" style={{ marginTop: 48 }}>
            {/* The Messy Way (Grayscale/Muted UI) */}
            <motion.div 
              className="comparison-card messy"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              variants={slideL}
              style={{
                background: "var(--bg-card)",
                borderColor: "var(--line)",
                color: "var(--ink-2)"
              }}
            >
              <h3 className="comparison-title" style={{ color: "var(--ink-2)", fontSize: 32 }}>
                The Messy Way
              </h3>
              <ul className="comparison-list">
                <li className="comparison-item" style={{ opacity: 0.7 }}>
                  <span className="comparison-icon" style={{ color: '#555555' }}>●</span>
                  <div>
                    <strong style={{ color: "var(--ink-2)" }}>Unreliable Instagram DMs</strong>
                    Business requests buried in social notifications and fan messages.
                  </div>
                </li>
                <li className="comparison-item" style={{ opacity: 0.7 }}>
                  <span className="comparison-icon" style={{ color: '#555555' }}>●</span>
                  <div>
                    <strong style={{ color: "var(--ink-2)" }}>WhatsApp Price Bargaining</strong>
                    Endless message haggling, manual invoicing, and chasing bank transfers.
                  </div>
                </li>
                <li className="comparison-item" style={{ opacity: 0.7 }}>
                  <span className="comparison-icon" style={{ color: '#555555' }}>●</span>
                  <div>
                    <strong style={{ color: "var(--ink-2)" }}>3x Middleman Agent Markups</strong>
                    Brokers adding opaque platform fee markups that inflate client pricing.
                  </div>
                </li>
                <li className="comparison-item" style={{ opacity: 0.7 }}>
                  <span className="comparison-icon" style={{ color: '#555555' }}>●</span>
                  <div>
                    <strong style={{ color: "var(--ink-2)" }}>No Payment Security</strong>
                    Chasing advances, last-minute event cancellations, or ghosting post-show.
                  </div>
                </li>
              </ul>
            </motion.div>

            {/* The Artistant Way (High Contrast Brand UI) */}
            <UIMockupSequence />
          </div>
          <SwipeHint />
        </div>
      </section>

      {/* ──────────────────────── THE ECOSYSTEM (FEATURES) ──────────────────────── */}
      <section id="ecosystem" className="section" style={{ borderTop: '1px solid var(--line-soft)', position: 'relative', overflow: 'hidden' }}>
        <div className="section-inner">
          <motion.div 
            className="section-label"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fUp}
          >
            The Ecosystem
          </motion.div>

          <motion.h2 
            className="section-heading"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fUp}
          >
            Three main <AnimatedTitle text="pillars." className="brand-text" />
          </motion.h2>

          <motion.p 
            className="section-desc"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fUp}
          >
            Building the core trust and logistics infrastructure for India&apos;s independent music economy.
          </motion.p>

          <div className="pillar-grid">
            <motion.div 
              className="pillar-card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1, duration: 0.6 }}
            >
              <span className="pillar-label">Pillar 01</span>
              <h3 className="pillar-title">THE BOOKABILITY SCORE™</h3>
              <p className="pillar-desc">
                A 0–100 rating for every artist, built from real outcomes on the platform — show-up rate, dispute rate, reply speed, repeat bookings. A credit score for reliability, not vibes.
              </p>
              
              <div className="pillar-visual-box">
                <div className="score-radial-container">
                  <svg viewBox="0 0 100 100" className="score-svg">
                    <circle cx="50" cy="50" r="40" className="score-track" />
                    <circle 
                      cx="50" 
                      cy="50" 
                      r="40" 
                      className="score-progress" 
                      style={{ 
                        strokeDasharray: '251.2', 
                        strokeDashoffset: '15.07' // 94% progress
                      }} 
                    />
                  </svg>
                  <div className="score-text-center">
                    <span className="score-num">94</span>
                    <span className="score-label">ELITE</span>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div 
              className="pillar-card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              <span className="pillar-label">Pillar 02</span>
              <h3 className="pillar-title">GIGSAFE ESCROW.</h3>
              <p className="pillar-desc">
                Client pays upfront. Money sits in secure Gigsafe escrow. Released to artist in T+1 after the show ends.
              </p>
              
              <div className="pillar-visual-box" style={{ padding: '20px' }}>
                <div className="escrow-list">
                  <div className="escrow-item done">
                    <span className="checkmark">✓</span>
                    <span className="escrow-text">Client pays into Gigsafe escrow</span>
                    <span className="escrow-val">₹2,50,000</span>
                  </div>
                  <div className="escrow-item done">
                    <span className="checkmark">✓</span>
                    <span className="escrow-text">Show happens</span>
                    <span className="escrow-val" style={{ color: '#8F95A0' }}>held</span>
                  </div>
                  <div className="escrow-item active-line">
                    <span className="num">3</span>
                    <span className="escrow-text">Artist paid · T+1</span>
                    <span className="escrow-val">₹2,25,000</span>
                  </div>
                  <div className="escrow-note">
                    <span className="note-shield">🛡️</span>
                    <p className="note-text">
                      <strong>Protection on by default.</strong> Free replacement if the artist cancels.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div 
              className="pillar-card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              <span className="pillar-label">Pillar 03</span>
              <h3 className="pillar-title">PRICES, IN PUBLIC.</h3>
              <p className="pillar-desc">
                No &quot;DM for price.&quot; Every artist publishes packaged pricing. Calendars are live. Bookings happen in minutes, not weeks.
              </p>
              
              <div className="pillar-visual-box" style={{ padding: '20px' }}>
                <div className="prices-list">
                  <div className="price-item">
                    <div className="avatar avatar-1" />
                    <div className="item-info">
                      <span className="artist-name">Kaavya & The Tape</span>
                      <span className="artist-meta">Indie · 60min</span>
                    </div>
                    <span className="artist-price">₹22K</span>
                  </div>
                  <div className="price-item">
                    <div className="avatar avatar-2" />
                    <div className="item-info">
                      <span className="artist-name">DJ Devraj</span>
                      <span className="artist-meta">House · 2hr</span>
                    </div>
                    <span className="artist-price">₹35K</span>
                  </div>
                  <div className="price-item">
                    <div className="avatar avatar-3" />
                    <div className="item-info">
                      <span className="artist-name">Ishaan Pandit</span>
                      <span className="artist-meta">Comedy · 45min</span>
                    </div>
                    <span className="artist-price">₹45K</span>
                  </div>
                  <div className="price-item">
                    <div className="avatar avatar-4" />
                    <div className="item-info">
                      <span className="artist-name">Nandini Trio</span>
                      <span className="artist-meta">Acoustic · 60min</span>
                    </div>
                    <span className="artist-price">₹14K</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
          <SwipeHint />
        </div>
      </section>

      {/* ──────────────────────── BUILT FOR EVERY FREQUENCY (CATEGORIES) ──────────────────────── */}
      <section 
        ref={frequenciesRef}
        id="frequencies" 
        className="category-marquee-section"
      >
        <div style={{ textAlign: 'center', marginBottom: '48px', padding: '0 var(--gutter)' }}>
          <motion.div 
            className="section-label"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fUp}
            style={{ justifyContent: 'center', marginBottom: 16 }}
          >
            Target Frequencies
          </motion.div>

          <motion.h2 
            className="section-heading"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fUp}
            style={{ margin: '0 auto 16px auto', maxWidth: '30ch' }}
          >
            Built for <AnimatedTitle text="every frequency." className="brand-text" />
          </motion.h2>
          
          <motion.p
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fUp}
            style={{ color: 'var(--ink-2)', fontSize: '18px', maxWidth: '45ch', margin: '0 auto' }}
          >
            The Bookability Engine adapts to your exact setup.
          </motion.p>
        </div>

        {/* Row 1 — scrolls left */}
        <ul className="category-marquee-row row-left">
          {['Singers & Vocalists', 'DJs & Producers', 'Bands & Ensembles', 'Comedians & MCs', 'Instrumentalists', 'Magicians & Illusionists', 'Dancers & Choreographers'].map((cat, idx) => (
            <li key={`r1-real-${idx}`} className="marquee-pill" style={{ '--pill-accent': ['#F25A2B','#D4567A','#7C5CFF','#6B7CDB','#FF5A5F','#F25A2B','#D4567A'][idx] } as any}>
              {cat}
            </li>
          ))}
          {['Singers & Vocalists', 'DJs & Producers', 'Bands & Ensembles', 'Comedians & MCs', 'Instrumentalists', 'Magicians & Illusionists', 'Dancers & Choreographers'].map((cat, idx) => (
            <li key={`r1-dupe-${idx}`} aria-hidden="true" className="marquee-pill" style={{ '--pill-accent': ['#F25A2B','#D4567A','#7C5CFF','#6B7CDB','#FF5A5F','#F25A2B','#D4567A'][idx] } as any}>
              {cat}
            </li>
          ))}
        </ul>

        {/* Row 2 — scrolls right */}
        <ul className="category-marquee-row row-right" style={{ marginTop: '16px' }}>
          {['Acrobats & Aerialists', 'Fire Spinners & Flow Artists', 'Spoken Word Poets', 'Beatboxers', 'Tribute & Cover Acts', 'Live Visual Artists'].map((cat, idx) => (
            <li key={`r2-real-${idx}`} className="marquee-pill" style={{ '--pill-accent': ['#7C5CFF','#6B7CDB','#FF5A5F','#F25A2B','#D4567A','#7C5CFF'][idx] } as any}>
              {cat}
            </li>
          ))}
          {['Acrobats & Aerialists', 'Fire Spinners & Flow Artists', 'Spoken Word Poets', 'Beatboxers', 'Tribute & Cover Acts', 'Live Visual Artists'].map((cat, idx) => (
            <li key={`r2-dupe-${idx}`} aria-hidden="true" className="marquee-pill" style={{ '--pill-accent': ['#7C5CFF','#6B7CDB','#FF5A5F','#F25A2B','#D4567A','#7C5CFF'][idx] } as any}>
              {cat}
            </li>
          ))}
        </ul>
      </section>

      {/* ──────────────────────── PLATFORM EVOLUTION TIMELINE (DISTRICT STYLE) ──────────────────────── */}
      <section 
        id="standard" 
        className="w-full relative z-10 py-24 md:py-32 bg-bg overflow-hidden border-y border-line-soft"
      >
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#F25A2B]/10 blur-[100px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#7C5CFF]/10 blur-[100px] rounded-full pointer-events-none" />

        <div style={{ textAlign: 'center', marginBottom: '48px', padding: '0 var(--gutter)' }}>
          <motion.div 
            className="section-label"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fUp}
            style={{ justifyContent: 'center', marginBottom: 16 }}
          >
            Roadmap
          </motion.div>

          <motion.h2 
            className="section-heading"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fUp}
            style={{ margin: '0 auto 16px auto', maxWidth: '30ch' }}
          >
            Platform <AnimatedTitle text="evolution." className="brand-text" />
          </motion.h2>
          
          <motion.p
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fUp}
            style={{ color: 'var(--ink-2)', fontSize: '18px', maxWidth: '45ch', margin: '0 auto' }}
          >
            Swipe through the definitive infrastructure we're building for the live economy.
          </motion.p>
        </div>

        {/* CSS for hiding scrollbar */}
        <style dangerouslySetInnerHTML={{__html: `
          .hide-scrollbar::-webkit-scrollbar { display: none; }
          .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        `}} />

        {/* Horizontal Carousel */}
        <div ref={roadmapScrollRef} className="w-full overflow-x-auto overflow-y-hidden snap-x snap-mandatory flex gap-6 px-6 pt-6 pb-12 -mt-6 hide-scrollbar scroll-smooth">
          {ROADMAP_PHASES.flatMap((phase) => 
            phase.features.map((feature, fIdx) => (
              <motion.div 
                key={`${phase.phase}-${fIdx}`}
                whileHover={{ y: -12, scale: 1.02 }}
                onClick={() => {
                  setSelectedFeature(feature);
                  setSelectedPhase({
                    phase: phase.phase,
                    label: phase.label,
                    timeline: phase.timeline,
                    accentColor: phase.accentColor
                  });
                  setIsFeatureModalOpen(true);
                }}
                transition={{ type: "spring", stiffness: 100, damping: 20 }}
                className="snap-center shrink-0 w-[300px] md:w-[380px] h-[480px] rounded-[2.5rem] p-8 relative overflow-hidden bg-bg-card border border-line shadow-2xl flex flex-col justify-between group cursor-pointer hover:border-white/20 hover:shadow-2xl transition-all duration-300"
              >
                {/* Dynamic Card Backgrounds based on phase */}
                <div className="absolute inset-0 opacity-20 group-hover:opacity-40 transition-opacity duration-500" style={{
                  background: `radial-gradient(circle at top right, ${phase.accentColor}, transparent 70%)`
                }} />
                
                {/* Glass Glare */}
                <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0 pointer-events-none" />

                <div className="relative z-10 flex flex-col items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center border border-line backdrop-blur-md bg-black/5 dark:bg-black/40 shadow-inner" style={{ color: phase.accentColor }}>
                    {feature.icon}
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="font-mono text-[10px] uppercase tracking-widest font-bold" style={{ color: phase.accentColor }}>
                      Phase {phase.phase} • {phase.label}
                    </span>
                    <h3 className="font-display font-black text-2xl text-ink leading-tight">
                      {feature.title}
                    </h3>
                  </div>
                </div>

                <div className="relative z-10">
                  <p className="text-ink-2 text-sm leading-relaxed mb-6 group-hover:text-ink transition-colors duration-300">
                    {feature.desc}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    {/* Status Pill */}
                    <div className="inline-flex items-center gap-2 bg-black/5 dark:bg-black/50 border border-line px-4 py-2 rounded-full backdrop-blur-md">
                      {phase.phase === '01' ? (
                        <>
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          <span className="font-mono text-[9px] uppercase tracking-widest text-emerald-400 font-bold">Ready for Beta</span>
                        </>
                      ) : phase.phase === '02' ? (
                        <>
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                          <span className="font-mono text-[9px] uppercase tracking-widest text-amber-400 font-bold">Coming Soon</span>
                        </>
                      ) : (
                        <>
                          <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                          <span className="font-mono text-[9px] uppercase tracking-widest text-purple-400 font-bold">Planned</span>
                        </>
                      )}
                    </div>
                    {/* Learn More link */}
                    <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-ink-2 group-hover:text-white transition-colors duration-300 flex items-center gap-1.5">
                      Learn More <svg className="w-3.5 h-3.5 transform group-hover:translate-x-1.5 transition-transform duration-300" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/></svg>
                    </span>
                  </div>
                </div>
              </motion.div>
            ))
          )}
          {/* Spacer to allow scrolling past the last card nicely */}
          <div className="shrink-0 w-6 md:w-12" />
        </div>

        <div className="hidden md:flex justify-center items-center gap-4 mt-4">
          <button onClick={() => scrollRoadmap('left')} className="p-3 rounded-full border border-line text-ink hover:text-[#F25A2B] hover:bg-ink/5 transition-all bg-bg-card">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
          </button>
          <button onClick={() => scrollRoadmap('right')} className="p-3 rounded-full border border-line text-ink hover:text-[#F25A2B] hover:bg-ink/5 transition-all bg-bg-card">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
          </button>
        </div>
        <div className="md:hidden mt-4">
          <SwipeHint />
        </div>
      </section>


      {/* ──────────────────────── FOOTER & WAITLIST ──────────────────────── */}
      <section id="join" className="cta-section" style={{ borderTop: '1px solid var(--line-soft)', position: 'relative' }}>
        <div className="cta-glow" aria-hidden="true" />
        <motion.div 
          className="section-label"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fUp}
          style={{ justifyContent: 'center', marginBottom: 32 }}
        >
          Waitlist Capture
        </motion.div>
        
        <motion.h2 
          className="section-heading"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fUp}
          style={{ textAlign: 'center', margin: '0 auto 24px', maxWidth: '850px' }}
        >
          Claim your <AnimatedTitle text="@username" className="brand-text" /> before someone else does.
        </motion.h2>

        <div style={{ display: 'flex', justifyContent: 'center', margin: '0 auto 48px auto', minHeight: '120px', width: '100%', padding: '0 20px' }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={claimMessageIdx}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -20 }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '24px 24px 24px 4px',
                padding: '24px',
                maxWidth: '700px',
                width: '100%',
                boxShadow: '0 10px 40px -10px rgba(0,0,0,0.3)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px', gap: '8px' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(0, 240, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--brand-1)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                  </svg>
                </div>
                <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--brand-1)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Why it matters</span>
              </div>
              <p style={{
                color: 'var(--ink-1)',
                fontSize: '16px',
                lineHeight: '1.6',
                margin: 0,
                opacity: 0.9
              }}>
                {CLAIM_MESSAGES[claimMessageIdx]}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>
        
        {/* Side-by-side container for Waitlist Form and Teaser */}
        <div style={{
          display: 'flex',
          flexDirection: 'row',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '32px',
          width: '100%',
          maxWidth: '1200px',
          margin: '48px auto',
          position: 'relative',
          zIndex: 10,
          padding: '0 20px'
        }}>
          <div style={{ flex: '1 1 400px', display: 'flex', justifyContent: 'center' }}>
            <div style={{ width: '100%', maxWidth: '460px' }}>
              {/* Requested waitlist username reservation form */}
          {/* Show reserved card for signed-in users who already have a reservation */}
          {userReservation ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              whileHover={{ scale: 1.02, borderColor: 'rgba(52, 211, 153, 0.4)' }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 200, damping: 22 }}
              style={{
                maxWidth: '460px',
                width: '100%',
                margin: '0 auto',
                background: 'rgba(10, 10, 10, 0.8)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '32px',
                padding: isMobile ? '24px 20px' : '40px',
                textAlign: 'left',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: '0 10px 40px -10px rgba(0,0,0,0.5)',
                backdropFilter: 'blur(10px)',
                zIndex: 10,
              }}
            >
              {/* Radial gradient background like cohort/hire cards */}
              <div style={{ position: 'absolute', top: 0, right: 0, width: '250px', height: '250px', background: 'radial-gradient(circle at top right, rgba(52, 211, 153, 0.15), transparent 70%)', pointerEvents: 'none' }} />
              {/* Glass Glare */}
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top right, rgba(255,255,255,0), rgba(255,255,255,0.05), rgba(255,255,255,0))', pointerEvents: 'none' }} />

              <div style={{ position: 'relative', zIndex: 2 }}>
                {/* Icon Container like cohort cards */}
                <div style={{
                  width: '56px', height: '56px', borderRadius: '16px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  background: 'rgba(0, 0, 0, 0.4)',
                  boxShadow: 'inset 0 2px 4px rgba(255, 255, 255, 0.05)',
                  color: '#34D399',
                  marginBottom: '24px',
                  backdropFilter: 'blur(10px)'
                }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <motion.polyline 
                      points="20 6 9 17 4 12" 
                      stroke="currentColor" 
                      strokeWidth="3" 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ delay: 0.2, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    />
                  </svg>
                </div>

                <div style={{ fontSize: '11px', color: '#34D399', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '12px', fontWeight: 700 }}>
                  EARLY ACCESS CONFIRMED
                </div>

                <h3 style={{ fontSize: '36px', fontWeight: '900', color: '#FFFFFF', marginBottom: '24px', letterSpacing: '-0.02em', fontFamily: 'var(--font-display)', lineHeight: '1.1' }}>
                  @{userReservation.username}
                </h3>
                
                <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.7)', lineHeight: '1.6', marginBottom: '40px', fontWeight: 400 }}>
                  Your username is locked. We will notify you when it's time to set up your profile dashboard.
                </p>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => router.push(`/${userReservation.username}`)}
                  style={{
                    background: 'linear-gradient(135deg, #F25A2B 0%, #D4567A 50%, #7C5CFF 100%)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '99px',
                    padding: '16px 24px',
                    fontSize: '14px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    width: '100%',
                    boxShadow: '0 8px 24px rgba(242, 90, 43, 0.25)',
                    transition: 'box-shadow 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    fontFamily: 'var(--font-mono)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}
                >
                  GO TO DASHBOARD <span style={{ fontSize: '16px' }}>→</span>
                </motion.button>
              </div>
            </motion.div>
          ) : (
        <motion.form 
          onSubmit={handleWaitlistSubmit}
          style={{
            maxWidth: '460px',
            margin: '0 auto',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            zIndex: 10
          }}
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.15, duration: 0.6 }}
        >
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <span style={{
              position: 'absolute',
              left: '20px',
              fontFamily: 'var(--font-mono)',
              fontSize: '18px',
              color: 'var(--brand-1)',
              fontWeight: '700',
              pointerEvents: 'none',
              zIndex: 5
            }}>@</span>
            <input 
              id="username-waitlist-input"
              type="text" 
              placeholder="yourname" 
              required 
              value={usernameInput}
              onChange={(e) => setUsernameInput(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="none"
              spellCheck="false"
              data-lpignore="true"
              data-1p-ignore="true"
              style={{
                background: 'rgba(255, 255, 255, 0.02)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border: '1px solid ' + (
                  availStatus === 'available' ? 'rgba(52, 211, 153, 0.4)' :
                  availStatus === 'taken' ? 'rgba(255, 90, 95, 0.4)' :
                  availStatus === 'locked' ? 'rgba(212, 175, 55, 0.4)' :
                  availStatus === 'invalid' ? 'rgba(255, 199, 44, 0.4)' :
                  availStatus === 'checking' ? 'rgba(124, 92, 255, 0.4)' :
                  isFocused ? 'rgba(124, 92, 255, 0.4)' :
                  'rgba(255, 255, 255, 0.08)'
                ),
                boxShadow: availStatus === 'available' ? '0 0 20px rgba(52, 211, 153, 0.15), inset 0 2px 4px rgba(255, 255, 255, 0.02)' :
                           availStatus === 'taken' ? '0 0 20px rgba(255, 90, 95, 0.15), inset 0 2px 4px rgba(255, 255, 255, 0.02)' :
                           availStatus === 'locked' ? '0 0 20px rgba(212, 175, 55, 0.18), inset 0 2px 4px rgba(255, 255, 255, 0.02)' :
                           availStatus === 'invalid' ? '0 0 20px rgba(255, 199, 44, 0.15), inset 0 2px 4px rgba(255, 255, 255, 0.02)' :
                           availStatus === 'checking' ? '0 0 20px rgba(124, 92, 255, 0.15), inset 0 2px 4px rgba(255, 255, 255, 0.02)' :
                           isFocused ? '0 0 20px rgba(124, 92, 255, 0.15), inset 0 2px 4px rgba(255, 255, 255, 0.02)' :
                           'inset 0 2px 4px rgba(255, 255, 255, 0.02)',
                borderRadius: '24px',
                padding: isMobile ? '14px 44px 14px 38px' : '16px 50px 16px 44px',
                color: '#FFFFFF',
                fontSize: '16px',
                outline: 'none',
                width: '100%',
                fontFamily: 'var(--font-mono)',
                transition: 'all 0.25s ease'
              }}
            />
            {/* Inline validation status icons */}
            <div style={{ position: 'absolute', right: '20px', display: 'flex', alignItems: 'center', height: '100%', pointerEvents: 'none' }}>
              <AnimatePresence mode="wait">
                {availStatus === 'checking' && (
                  <motion.div
                    key="checking"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.15 }}
                  >
                    <motion.svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      strokeWidth="3"
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    >
                      <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.08)" />
                      <path d="M12 2a10 10 0 0 1 10 10" stroke="#7C5CFF" strokeLinecap="round" />
                    </motion.svg>
                  </motion.div>
                )}
                {availStatus === 'available' && (
                  <motion.div
                    key="available"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ type: "spring", stiffness: 350, damping: 20 }}
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#34D399"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <motion.path
                        d="M20 6L9 17L4 12"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 0.35, ease: "easeOut" }}
                      />
                    </svg>
                  </motion.div>
                )}
                {availStatus === 'taken' && (
                  <motion.div
                    key="taken"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ type: "spring", stiffness: 350, damping: 20 }}
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#FF5A5F"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <motion.path
                        d="M18 6L6 18"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 0.25, ease: "easeOut" }}
                      />
                      <motion.path
                        d="M6 6l12 12"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 0.25, delay: 0.08, ease: "easeOut" }}
                      />
                    </svg>
                  </motion.div>
                )}
                {availStatus === 'locked' && (
                  <motion.div
                    key="locked"
                    initial={{ opacity: 0, scale: 0.8, y: 2 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8, y: 2 }}
                    transition={{ type: "spring", stiffness: 350, damping: 20 }}
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#D4AF37"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="5" y="11" width="14" height="10" rx="2" ry="2" />
                      <motion.path 
                        d="M12 2a4 4 0 0 0-4 4v5h8V6a4 4 0 0 0-4-4z" 
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 0.35, ease: "easeOut" }}
                      />
                    </svg>
                  </motion.div>
                )}
                {availStatus === 'invalid' && (
                  <motion.div
                    key="invalid"
                    initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    exit={{ opacity: 0, scale: 0.8, rotate: -10 }}
                    transition={{ type: "spring", stiffness: 350, damping: 20 }}
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#FFC72C"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                      <line x1="12" y1="9" x2="12" y2="13" />
                      <line x1="12" y1="17" x2="12.01" y2="17" />
                    </svg>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Real-time status feedback */}
          <AnimatePresence initial={false}>
            {availStatus !== 'idle' && (
              <motion.div
                initial={{ height: 0, opacity: 0, marginTop: 0 }}
                animate={{ 
                  height: 'auto', 
                  opacity: 1, 
                  marginTop: 12,
                  transition: {
                    height: { type: 'spring', stiffness: 350, damping: 30 },
                    opacity: { duration: 0.2 }
                  }
                }}
                exit={{ 
                  height: 0, 
                  opacity: 0, 
                  marginTop: 0,
                  transition: {
                    height: { type: 'spring', stiffness: 350, damping: 30 },
                    opacity: { duration: 0.15 }
                  }
                }}
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  overflow: 'hidden'
                }}
              >
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 16px',
                    borderRadius: '99px',
                    fontSize: '13px',
                    fontFamily: 'var(--font-body)',
                    fontWeight: '500',
                    background: availStatus === 'available' ? 'rgba(52, 211, 153, 0.03)' :
                                availStatus === 'taken' ? 'rgba(255, 90, 95, 0.03)' :
                                availStatus === 'locked' ? 'rgba(212, 175, 55, 0.03)' :
                                availStatus === 'invalid' ? 'rgba(255, 199, 44, 0.03)' :
                                'rgba(124, 92, 255, 0.03)',
                    border: '1px solid ' + (
                      availStatus === 'available' ? 'rgba(52, 211, 153, 0.12)' :
                      availStatus === 'taken' ? 'rgba(255, 90, 95, 0.12)' :
                      availStatus === 'locked' ? 'rgba(212, 175, 55, 0.12)' :
                      availStatus === 'invalid' ? 'rgba(255, 199, 44, 0.12)' :
                      'rgba(124, 92, 255, 0.12)'
                    ),
                    color: availStatus === 'available' ? '#34D399' :
                           availStatus === 'taken' ? '#FF5A5F' :
                           availStatus === 'locked' ? '#D4AF37' :
                           availStatus === 'invalid' ? '#FFC72C' :
                           '#7C5CFF',
                    backdropFilter: 'blur(8px)',
                    WebkitBackdropFilter: 'blur(8px)',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                  }}
                >
                  {availStatus === 'checking' && (
                    <motion.div
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: "spring", stiffness: 300, damping: 18 }}
                    >
                      <motion.svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3.5"
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
                      >
                        <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.15)" />
                        <path d="M12 2a10 10 0 0 1 10 10" stroke="#7C5CFF" strokeLinecap="round" />
                      </motion.svg>
                    </motion.div>
                  )}
                  {availStatus === 'available' && (
                    <motion.div
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: "spring", stiffness: 300, damping: 18 }}
                    >
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#34D399"
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M20 6L9 17L4 12" />
                      </svg>
                    </motion.div>
                  )}
                  {availStatus === 'taken' && (
                    <motion.div
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: "spring", stiffness: 300, damping: 18 }}
                    >
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#FF5A5F"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="12" />
                        <line x1="12" y1="16" x2="12.01" y2="16" />
                      </svg>
                    </motion.div>
                  )}
                  {availStatus === 'locked' && (
                    <motion.div
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: "spring", stiffness: 300, damping: 18 }}
                    >
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#D4AF37"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <rect x="5" y="11" width="14" height="10" rx="2" ry="2" />
                        <path d="M12 2a4 4 0 0 0-4 4v5h8V6a4 4 0 0 0-4-4z" />
                      </svg>
                    </motion.div>
                  )}
                  {availStatus === 'invalid' && (
                    <motion.div
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: "spring", stiffness: 300, damping: 18 }}
                    >
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#FFC72C"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                        <line x1="12" y1="9" x2="12" y2="13" />
                        <line x1="12" y1="17" x2="12.01" y2="17" />
                      </svg>
                    </motion.div>
                  )}
                  <span>
                    {availStatus === 'checking' && 'Checking availability...'}
                    {availStatus === 'available' && 'Username available!'}
                    {availStatus === 'taken' && 'Username already taken — try another'}
                    {availStatus === 'locked' && 'This premium username is locked'}
                    {availStatus === 'invalid' && validationError}
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Username Suggestions Engine */}
          <AnimatePresence>
            {(suggestionsLoading || suggestions.length > 0) && (
              <motion.div
                initial={{ opacity: 0, y: -10, height: 0, marginTop: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto', marginTop: 16 }}
                exit={{ opacity: 0, y: -10, height: 0, marginTop: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  alignItems: 'center',
                  overflow: 'hidden',
                  width: '100%',
                }}
              >
                {suggestionsLoading ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 0' }}>
                    <div className="status-spinner-small" style={{ borderLeftColor: 'transparent' }} />
                    <span style={{ fontSize: '11px', color: 'var(--ink-3)', fontFamily: 'var(--font-mono)', letterSpacing: '0.05em' }}>
                      Finding available options...
                    </span>
                  </div>
                ) : (
                  <>
                    <span style={{ fontSize: '11px', color: 'var(--ink-3)', fontFamily: 'var(--font-mono)', fontWeight: '600', letterSpacing: '0.05em' }}>
                      SUGGESTED AVAILABLE USERNAMES
                    </span>
                    <div style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '8px',
                      justifyContent: 'center',
                      width: '100%',
                      padding: '4px 0'
                    }}>
                      {suggestions.map((suggestion) => (
                        <motion.button
                          key={suggestion}
                          type="button"
                          onClick={() => handleSuggestionClick(suggestion)}
                          whileHover={{ scale: 1.05, borderColor: 'var(--brand-1)', background: 'rgba(242, 90, 43, 0.08)' }}
                          whileTap={{ scale: 0.95 }}
                          style={{
                            padding: '6px 14px',
                            background: 'rgba(255, 255, 255, 0.02)',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                            borderRadius: '99px',
                            color: 'var(--brand-1)',
                            fontSize: '13px',
                            fontFamily: 'var(--font-mono)',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'color 0.2s, border-color 0.2s, background-color 0.2s',
                          }}
                        >
                          @{suggestion}
                        </motion.button>
                      ))}
                    </div>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <MagneticButton 
            type="submit"
            className="cta-btn"
            disabled={availStatus !== 'available' && availStatus !== 'locked'}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              color: availStatus === 'available' || availStatus === 'locked'
                ? '#ffffff'
                : 'rgba(255, 255, 255, 0.3)',
              fontWeight: '700',
              border: 'none',
              marginTop: '12px',
              padding: '16px 28px',
              borderRadius: '24px',
              cursor: availStatus === 'available' || availStatus === 'locked' ? 'pointer' : 'not-allowed',
              opacity: availStatus === 'available' || availStatus === 'locked' ? 1 : 0.6,
              boxShadow: availStatus === 'available'
                ? '0 8px 24px rgba(242, 90, 43, 0.25)'
                : availStatus === 'locked'
                  ? '0 8px 24px rgba(212, 175, 55, 0.25)'
                  : 'none',
              transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <motion.div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(135deg, #F25A2B 0%, #D4567A 50%, #7C5CFF 100%)',
                zIndex: 1,
                pointerEvents: 'none',
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: availStatus === 'available' ? 1 : 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            />
            <motion.div
              style={{
                position: 'absolute',
                inset: 0,
                background: '#D4AF37',
                zIndex: 1,
                pointerEvents: 'none',
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: availStatus === 'locked' ? 1 : 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            />
            <span style={{ position: 'relative', zIndex: 2 }}>
              {availStatus === 'locked' ? 'REQUEST PREMIUM NAME' : 'CLAIM USERNAME'}
            </span>
          </MagneticButton>
        </motion.form>
          )}
            </div>
          </div>

          <div style={{ flex: '1 1 400px', display: 'flex', justifyContent: 'center' }}>
            <InteractiveTeaser />
          </div>
        </div>
        
        {/* Sleek Segmented Role Waitlists */}
        <div style={{ marginTop: '48px', margin: '48px auto 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px', zIndex: 10, position: 'relative', width: '100%', maxWidth: '1200px', padding: '0 20px' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', width: '100%', maxWidth: '800px', marginBottom: '8px' }}>
            <div style={{ height: '1px', flex: 1, background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.1))' }} />
            <h2 className="font-display" style={{ fontSize: '18px', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.2em', fontWeight: 600 }}>Starting Soon</h2>
            <div style={{ height: '1px', flex: 1, background: 'linear-gradient(to left, transparent, rgba(255,255,255,0.1))' }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(auto-fit, minmax(260px, 1fr))' : 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', width: '100%' }}>
            
            {/* Host Option Card */}
            <motion.div 
              onClick={() => { setSelectedRole('organizer'); setIsRoleModalOpen(true); }}
              whileHover={{ scale: 1.02, borderColor: 'rgba(124, 92, 255, 0.4)' }}
              whileTap={{ scale: 0.98 }}
              style={{
                background: 'var(--what-is-card-bg)',
                border: '1px solid var(--what-is-card-border)',
                borderRadius: '16px',
                padding: isMobile ? '24px 20px' : '40px',
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                backdropFilter: 'blur(15px)',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: '0 10px 30px -10px var(--what-is-card-shadow)',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '150px', background: 'radial-gradient(ellipse at top left, rgba(124, 92, 255, var(--what-is-card-glow-opacity)), transparent 70%)', pointerEvents: 'none' }} />
              <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                <div style={{ fontSize: '12px', color: '#7C5CFF', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px', fontWeight: 600 }}>
                  FOR HOSTS
                </div>
                <h3 style={{ fontSize: isMobile ? '24px' : '32px', fontWeight: '800', color: 'var(--ink)', marginBottom: '20px', letterSpacing: '-0.02em', textTransform: 'uppercase', lineHeight: '1.1' }}>
                  YOU <span className="brand-text">HIRE</span> ARTISTS.
                </h3>
                <p style={{ fontSize: '15px', color: 'var(--ink-2)', lineHeight: '1.5', marginBottom: '32px', fontWeight: 400 }}>
                  Festivals. Cafes. Brands. Weddings. Find verified talent. Pay through escrow. Sleep at night.
                </p>
                <div style={{ marginTop: 'auto', fontSize: '12px', color: 'var(--ink)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  REGISTER INTEREST <span>→</span>
                </div>
              </div>
            </motion.div>

            {/* Venue Option Card */}
            <motion.div 
              onClick={() => { setSelectedRole('venue'); setIsRoleModalOpen(true); }}
              whileHover={{ scale: 1.02, borderColor: 'rgba(242, 90, 43, 0.4)' }}
              whileTap={{ scale: 0.98 }}
              style={{
                background: 'var(--what-is-card-bg)',
                border: '1px solid var(--what-is-card-border)',
                borderRadius: '16px',
                padding: isMobile ? '24px 20px' : '40px',
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                backdropFilter: 'blur(15px)',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: '0 10px 30px -10px var(--what-is-card-shadow)',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '150px', background: 'radial-gradient(ellipse at top right, rgba(242, 90, 43, var(--what-is-card-glow-opacity)), transparent 70%)', pointerEvents: 'none' }} />
              <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                <div style={{ fontSize: '12px', color: '#F25A2B', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px', fontWeight: 600 }}>
                  FOR VENUES
                </div>
                <h3 style={{ fontSize: isMobile ? '24px' : '32px', fontWeight: '800', color: 'var(--ink)', marginBottom: '20px', letterSpacing: '-0.02em', textTransform: 'uppercase', lineHeight: '1.1' }}>
                  YOU <span className="brand-text">HAVE</span> SPACE.
                </h3>
                <p style={{ fontSize: '15px', color: 'var(--ink-2)', lineHeight: '1.5', marginBottom: '32px', fontWeight: 400 }}>
                  Turn your venue into a creative hub. Host verified artists, manage bookings, and create unforgettable experiences.
                </p>
                <div style={{ marginTop: 'auto', fontSize: '12px', color: 'var(--ink)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  REGISTER INTEREST <span>→</span>
                </div>
              </div>
            </motion.div>

          </div>
          <p style={{ fontSize: '12px', color: 'var(--ink-3)', textAlign: 'center', marginTop: '12px', maxWidth: '600px', lineHeight: '1.5' }}>
            * By joining the waitlist, you will be placed on our email list to notify you about all these features and our upcoming launch.
          </p>
        </div>

        <motion.div 
          className="cta-meta"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 0.3 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 0.8 }}
          style={{ marginTop: '32px' }}
        >
          Direct Artist Booking · Gigsafe Escrow · Launching Soon
        </motion.div>
      </section>

      {/* ──────────────────────── FAQ ──────────────────────── */}
      <section id="faq" className="section" style={{ borderTop: '1px solid var(--line-soft)', position: 'relative', overflow: 'hidden' }}>
        {/* Ambient glow */}
        <div aria-hidden="true" style={{
          position: 'absolute',
          top: '0',
          right: '0',
          width: '600px',
          height: '600px',
          background: 'radial-gradient(circle, rgba(124,92,255,0.06) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div aria-hidden="true" style={{
          position: 'absolute',
          bottom: '0',
          left: '0',
          width: '500px',
          height: '500px',
          background: 'radial-gradient(circle, rgba(242,90,43,0.05) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div className="section-inner">
          <motion.div
            className="section-label"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fUp}
            style={{ justifyContent: 'center', marginBottom: 16 }}
          >
            Frequently Asked Questions
          </motion.div>

          <motion.h2
            className="section-heading"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fUp}
            style={{ textAlign: 'center', margin: '0 auto 20px auto', maxWidth: '850px' }}
          >
            Got <AnimatedTitle text="questions?" className="brand-text" />
          </motion.h2>

          <motion.p
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fUp}
            style={{
              textAlign: 'center',
              color: 'var(--ink-2)',
              fontSize: 'clamp(15px, 1.3vw, 18px)',
              maxWidth: '560px',
              margin: '0 auto 48px auto',
              lineHeight: 1.5,
            }}
          >
            Everything you need to know about ArtisTant and how the platform works.
          </motion.p>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            variants={staggerContainer}
            className="faq-list"
          >
            {[
              {
                q: 'What exactly is ArtisTant?',
                a: 'ArtisTant is India\'s first dedicated booking infrastructure for the live performance industry. It\'s a platform where artists get professional portfolios, organizers discover verified talent, and every booking is backed by technology — eliminating the messy WhatsApp-and-agent culture that currently runs the industry.',
              },
              {
                q: 'Is ArtisTant free for artists?',
                a: 'Yes! Claiming your @username and building your portfolio on ArtisTant is completely free. We believe every performer deserves a professional digital presence without paying upfront. Premium features and advanced tools will be offered as optional upgrades in the future.',
              },
              {
                q: 'How is this different from Instagram or a personal website?',
                a: 'Instagram wasn\'t built for booking — your DMs get buried, there\'s no rate transparency, and no payment security. ArtisTant is purpose-built for the booking workflow: live availability calendars, standardized rate cards, verified reviews, and structured booking requests all in one place. Think of it as your professional booking identity, not just another social profile.',
              },
              {
                q: 'What is The Bookability Score™?',
                a: 'It\'s a 0-100 reliability rating unique to each artist, calculated from hard data: response times, profile completeness, verified client reviews, and booking history. It gives organizers confidence when choosing performers and rewards reliable artists with higher visibility.',
              },
              {
                q: 'What is GigSafe Escrow?',
                a: 'GigSafe Escrow is our upcoming secure payment system. Clients pay upfront into a protected escrow, and funds are automatically released to the performer after the gig is completed. This eliminates ghosting, delayed payments, and the stress of chasing advances.',
              },
              {
                q: 'I\'m an event organizer. How does ArtisTant help me?',
                a: 'ArtisTant lets you discover verified performers, check real-time availability, compare transparent rates, send structured booking offers, and access verified post-gig reviews — all without relying on unreliable agent networks or endless WhatsApp negotiations.',
              },
              {
                q: 'What does claiming a @username do?',
                a: 'Claiming your @username reserves your unique booking handle on the platform (e.g., artistant.in/yourname). It becomes your professional digital real estate — your portfolio, calendar, rates, and contact hub all live under this single, shareable link. Once someone else claims it, it\'s gone.',
              },
              {
                q: 'When is ArtisTant launching?',
                a: 'We\'re currently in our waitlist phase, building and refining the platform with early community feedback. Artists who claim their username now will get early access when we launch, priority onboarding, and a Founding Member badge on their profiles.',
              },
              {
                q: 'Which types of performers can join?',
                a: 'ArtisTant is built for every live performance category — singers, DJs, bands, comedians, instrumentalists, magicians, dancers, spoken word poets, acrobats, live visual artists, and more. If you perform live, there\'s a place for you here.',
              },
              {
                q: 'Is my data safe on ArtisTant?',
                a: 'Absolutely. We take data privacy seriously. Your personal information is encrypted, never sold to third parties, and you have full control over what appears on your public portfolio. Our privacy-first calendar, for example, shows only "Busy" or "Available" — never your actual event details.',
              },
            ].map((faqItem, idx) => (
              <FAQItem key={idx} question={faqItem.q} answer={faqItem.a} index={idx} />
            ))}
          </motion.div>
        </div>
      </section>

      {/* ──────────────────────── FOOTER ──────────────────────── */}
      <Footer />

      <AuthModal isOpen={isModalOpen} onClose={closeModal} initialUsername={usernameInput} />
      <RoleWaitlistModal isOpen={isRoleModalOpen} onClose={() => setIsRoleModalOpen(false)} role={selectedRole} />
      <FeatureDetailsModal 
        isOpen={isFeatureModalOpen} 
        onClose={() => setIsFeatureModalOpen(false)} 
        feature={selectedFeature} 
        phase={selectedPhase}
        onReserveClick={() => {
          setIsFeatureModalOpen(false);
          scrollToWaitlist();
        }}
      />
    </main>
  );
}
