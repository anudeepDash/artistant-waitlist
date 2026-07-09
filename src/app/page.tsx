'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, useSpring, useMotionValue, useInView, AnimatePresence } from 'motion/react';
import ParticleBackground from '@/components/ParticleBackground';
import Footer from '@/components/Footer';
import AuthModal from '@/components/AuthModal';
import RoleWaitlistModal from '@/components/RoleWaitlistModal';
import InteractiveTeaser from '@/components/InteractiveTeaser';
import UIMockupSequence from '@/components/UIMockupSequence';
import { isUsernameAvailable, getUserReservation, type WaitlistEntry } from '@/lib/waitlist';
import { signInWithGoogle, signOut } from '@/lib/auth';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { ThemeToggle } from '@/components/ThemeToggle';

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
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
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

  const startOpacity = isMobile ? 0.46 : 0.26;
  const brightness = isMobile ? 0.65 : 0.4;
  const size = isMobile ? layout.size * 2.2 : layout.size;

  const opacity = useTransform(progress, [0, 0.9, 1], [startOpacity, startOpacity, 0]);
  const scale = useTransform(progress, [0, 1], [0.92, 1.06]);

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
        style={{ filter: `grayscale(1) contrast(1.2) brightness(${brightness})` }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-white/10"
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

  const [scrollRef, setScrollRef] = useState<React.RefObject<HTMLElement | null>>({ current: null });
  useEffect(() => {
    setScrollRef(sectionRef);
  }, []);

  const { user } = useAuth();
  const router = useRouter();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [claimMessageIdx, setClaimMessageIdx] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setClaimMessageIdx((prev) => (prev + 1) % CLAIM_MESSAGES.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!profileDropdownOpen) return;
    const handleClose = () => setProfileDropdownOpen(false);
    window.addEventListener('click', handleClose);
    return () => window.removeEventListener('click', handleClose);
  }, [profileDropdownOpen]);

  const handleSignOut = async () => {
    try {
      await signOut();
      setProfileDropdownOpen(false);
    } catch (err) {
      console.error("Error signing out:", err);
    }
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'organizer' | 'attendee' | null>(null);
  const [navScrolled, setNavScrolled] = useState(false);
  const [usernameInput, setUsernameInput] = useState('');
  const [availStatus, setAvailStatus] = useState<'idle' | 'checking' | 'available' | 'taken' | 'invalid' | 'locked'>('idle');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [userReservation, setUserReservation] = useState<WaitlistEntry | null>(null);

  // Fetch the current user's reservation when they sign in
  useEffect(() => {
    if (!user) { setUserReservation(null); return; }
    getUserReservation(user.uid).then(setUserReservation).catch(() => setUserReservation(null));
  }, [user]);

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
      return;
    }
    if (raw.length < 3) {
      setAvailStatus('invalid');
      setValidationError('Must be at least 3 characters');
      return;
    }
    if (raw.length > 20) {
      setAvailStatus('invalid');
      setValidationError('Must be 20 characters or fewer');
      return;
    }
    if (!/^[a-z]/.test(raw)) {
      setAvailStatus('invalid');
      setValidationError('Must start with a letter');
      return;
    }
    if (!/^[a-z0-9_]+$/.test(raw)) {
      setAvailStatus('invalid');
      setValidationError('Letters, numbers, and underscores only');
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
      return;
    }

    const premiumUsernames = new Set([
      'ai', 'india', 'dj', 'genre', 'genres', 'music', 'singer', 'band', 'comedian',
      'dancer', 'rapper', 'hiphop', 'rock', 'pop', 'jazz', 'techno', 'edm', 'live',
      'show', 'bangalore', 'mumbai', 'goa', 'delhi'
    ]);

    if (premiumUsernames.has(raw)) {
      setAvailStatus('locked');
      setValidationError('This premium username is locked');
      return;
    }

    setAvailStatus('checking');
    setValidationError(null);

    const timer = setTimeout(async () => {
      try {
        const free = await isUsernameAvailable(raw);
        if (free) {
          setAvailStatus('available');
        } else {
          setAvailStatus('taken');
        }
      } catch (err) {
        setAvailStatus('idle');
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

  const [showNav, setShowNav] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [activePhase, setActivePhase] = useState('core');

  useEffect(() => {
    const onScroll = () => {
      const currentScrollY = window.scrollY;
      setNavScrolled(currentScrollY > 60);
      
      if (currentScrollY <= 60) {
        setShowNav(true);
      } else {
        setShowNav(false);
      }
      setLastScrollY(currentScrollY);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [lastScrollY]);

  // Framer motion scroll Hook for Parallax Background effects
  const { scrollY, scrollYProgress } = useScroll();
  const scrollProgressY = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });
  const yBgParallax = useTransform(scrollY, [0, 1000], [0, -120]);
  const yOrbParallax = useTransform(scrollY, [0, 1000], [0, -180]);

  const sectionScroll = useScroll({
    target: scrollRef,
    offset: ["start start", "end start"],
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

  // Background Bento transforms for Problem section
  const problemBentoScale = useTransform(scrollY, [200, 1200], [0.9, 1.05]);
  const problemBentoY = useTransform(scrollY, [200, 1200], [50, -50]);



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
      <motion.nav 
        className={`nav ${navScrolled ? 'scrolled' : ''}`}
        initial={{ opacity: 0, y: -140 }}
        animate={{ y: showNav ? 0 : -140, opacity: showNav ? 1 : 0 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      >
        <a className="nav-logo" href="#top">
          <img src="/logo_wordmark.png" alt="ArtisTant" style={{ height: '180px', width: 'auto', display: 'block' }} />
        </a>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <ThemeToggle />
          {user ? (
            <div style={{ position: 'relative' }}>
              <button 
                onClick={(e) => { e.stopPropagation(); setProfileDropdownOpen(!profileDropdownOpen); }} 
                className="nav-cta" 
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <div style={{
                  width: '26px',
                  height: '26px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #F25A2B 0%, #7C5CFF 100%)',
                  color: '#FFFFFF',
                  display: 'grid',
                  placeItems: 'center',
                  fontSize: '11px',
                  fontWeight: '800',
                  fontFamily: 'var(--font-mono)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.02em',
                  flexShrink: 0,
                }}>
                  {userReservation?.username?.[0] ?? user.displayName?.[0] ?? user.email?.[0] ?? 'U'}
                </div>
                <span>{userReservation ? `@${userReservation.username}` : 'Profile'}</span>
              </button>
              
              <AnimatePresence>
                {profileDropdownOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                    onClick={(e) => e.stopPropagation()} 
                    style={{
                      position: 'absolute',
                      top: 'calc(100% + 16px)',
                      right: 0,
                      width: '280px',
                      borderRadius: '20px',
                      display: 'flex',
                      flexDirection: 'column',
                      zIndex: 100,
                      boxShadow: "0 20px 40px -10px var(--shadow-heavy)", border: "1px solid var(--glass-border)",
                      background: "var(--glass-bg)",
                      backdropFilter: 'blur(24px)',
                      overflow: 'hidden'
                    }}
                  >
                    {/* User Info Section */}
                    <div style={{ padding: '20px 20px 16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, #F25A2B 0%, #7C5CFF 100%)',
                          color: '#FFFFFF',
                          display: 'grid',
                          placeItems: 'center',
                          fontSize: '16px',
                          fontWeight: '800',
                          fontFamily: 'var(--font-mono)',
                          textTransform: 'uppercase',
                        }}>
                          {userReservation?.username?.[0] ?? user.displayName?.[0] ?? user.email?.[0] ?? 'U'}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontSize: '15px', fontWeight: '600', color: '#FFFFFF', letterSpacing: '-0.01em' }}>
                            {userReservation ? `@${userReservation.username}` : (user.displayName || 'Creator')}
                          </span>
                          <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)' }}>
                            {user?.email || user?.phoneNumber}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div style={{ height: '1px', background: "var(--line)" }} />

                    {/* Actions Section */}
                    <div style={{ padding: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <button
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          router.push(`/${userReservation?.username || 'profile'}`);
                        }}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '12px',
                          padding: '12px 16px', borderRadius: '12px',
                          background: 'transparent', border: 'none',
                          color: 'var(--ink-1)', fontSize: '14px', fontWeight: '500',
                          cursor: 'pointer', transition: 'all 0.2s',
                          textAlign: 'left', width: '100%'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--brand-1)' }}>
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                          <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                        View My Profile
                      </button>
                      
                      <button
                        onClick={handleSignOut}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '12px',
                          padding: '12px 16px', borderRadius: '12px',
                          background: 'transparent', border: 'none',
                          color: '#FF5A5F', fontSize: '14px', fontWeight: '500',
                          cursor: 'pointer', transition: 'all 0.2s',
                          textAlign: 'left', width: '100%'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 90, 95, 0.08)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                          <polyline points="16 17 21 12 16 7"></polyline>
                          <line x1="21" y1="12" x2="9" y2="12"></line>
                        </svg>
                        Sign Out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <button onClick={openModal} className="nav-cta">
              Sign In <span className="arrow">↗</span>
            </button>
          )}
        </div>
      </motion.nav>

      {/* ──────────────────────── SCROLL-DRIVEN 3D SCATTER HERO ──────────────────────── */}
      <section
        ref={sectionRef}
        id="top"
        className="relative"
        style={{
          // Reserve scroll room for the fly-away bento scatter animation to play out
          height: "220vh",
          background: "var(--bg)",
        }}
      >
        {/* Layered background — radial gradient + grid (Rendered outside sticky stage so negative translateZ elements do not stack behind it) */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-0"
          style={{
            background:
              "radial-gradient(ellipse 70% 50% at 50% 50%, rgba(124,92,255,0.08), transparent 60%), radial-gradient(ellipse 60% 40% at 20% 80%, rgba(242,90,43,0.06), transparent 55%)",
          }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-0 opacity-40"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)",
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
                disabled={true}
                className="btn-primary"
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  color: 'rgba(255, 255, 255, 0.3)',
                  fontWeight: '700',
                  border: 'none',
                  cursor: 'not-allowed',
                  opacity: 0.6
                }}
              >
                Starting Soon
              </MagneticButton>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ──────────────────────── THE PROBLEM (REAL VOICES) ──────────────────────── */}
      <section id="problem-voices" className="section" style={{ borderTop: '1px solid var(--line-soft)', paddingBottom: '40px', position: 'relative', overflow: 'hidden' }}>
        {/* Scattered Background Bento Image Gallery for Problem Section */}
        <motion.div 
          className="bento-bg-card" 
          style={{ 
            bottom: '10%', left: '-80px', width: '260px', height: '180px', transform: 'rotate(12deg)',
            scale: problemBentoScale, y: problemBentoY, opacity: 0.08
          }}
        >
          <img src="/gallery_2.png" alt="A stage setup" />
        </motion.div>
        <motion.div 
          className="bento-bg-card" 
          style={{ 
            top: '15%', right: '-80px', width: '240px', height: '200px', transform: 'rotate(-8deg)',
            scale: problemBentoScale, y: problemBentoY, opacity: 0.08
          }}
        >
          <img src="/gallery_3.png" alt="Crowd at show" />
        </motion.div>

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
              style={{ '--voice-accent': '#F25A2B' } as any}
              initial={{ opacity: 0, y: 30, rotate: -0.5 }}
              whileInView={{ opacity: 1, y: 0, rotate: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1, duration: 0.6 }}
            >
              <p className="voice-quote">
                I lost a ₹80K corporate gig because the event manager ghosted after confirming on WhatsApp. No contract, no proof, nothing.
              </p>
              <div className="voice-person">
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
              style={{ '--voice-accent': '#7C5CFF' } as any}
              initial={{ opacity: 0, y: 30, rotate: 0.5 }}
              whileInView={{ opacity: 1, y: 0, rotate: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              <p className="voice-quote">
                I spent 3 weeks chasing a club promoter for my ₹45K advance. By the time I got paid, I&apos;d already played the next 4 shows for free.
              </p>
              <div className="voice-person">
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
              style={{ '--voice-accent': '#D4567A' } as any}
              initial={{ opacity: 0, y: 30, rotate: -0.3 }}
              whileInView={{ opacity: 1, y: 0, rotate: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              <p className="voice-quote">
                I quoted an artist ₹1.5L. The agent told the client ₹4.5L. The artist had no idea. That&apos;s the industry norm.
              </p>
              <div className="voice-person">
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
                    Brokers adding opaque commission markups that inflate client pricing.
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
        <div ref={roadmapScrollRef} className="w-full overflow-x-auto snap-x snap-mandatory flex gap-6 px-6 pb-12 hide-scrollbar scroll-smooth">
          {ROADMAP_PHASES.flatMap((phase) => 
            phase.features.map((feature, fIdx) => (
              <motion.div 
                key={`${phase.phase}-${fIdx}`}
                whileHover={{ y: -10, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 100, damping: 20 }}
                className="snap-center shrink-0 w-[300px] md:w-[380px] h-[480px] rounded-[2.5rem] p-8 relative overflow-hidden bg-bg-card border border-line shadow-2xl flex flex-col justify-between group cursor-grab active:cursor-grabbing"
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
                  <p className="text-ink-2 text-sm leading-relaxed mb-6">
                    {feature.desc}
                  </p>
                  
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
                padding: '40px',
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
            gap: '12px',
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
              style={{
                background: '#0E1524',
                border: '1px solid ' + (
                  availStatus === 'available' ? '#34D399' :
                  availStatus === 'taken' ? '#FF5A5F' :
                  availStatus === 'locked' ? '#D4AF37' :
                  availStatus === 'invalid' ? '#FFC72C' :
                  availStatus === 'checking' ? '#7C5CFF' :
                  'var(--line)'
                ),
                boxShadow: availStatus === 'available' ? '0 0 15px rgba(52, 211, 153, 0.12)' :
                           availStatus === 'taken' ? '0 0 15px rgba(255, 90, 95, 0.12)' :
                           availStatus === 'locked' ? '0 0 15px rgba(212, 175, 55, 0.18)' :
                           availStatus === 'invalid' ? '0 0 15px rgba(255, 199, 44, 0.12)' :
                           'none',
                borderRadius: '24px',
                padding: '16px 50px 16px 44px',
                color: '#FFFFFF',
                fontSize: '16px',
                outline: 'none',
                width: '100%',
                fontFamily: 'var(--font-mono)',
                transition: 'all 0.25s ease'
              }}
            />
            {/* Inline validation status icons (HIDDEN AS PER REQUEST) */}
            <div style={{ position: 'absolute', right: '20px', display: 'none', alignItems: 'center', pointerEvents: 'none' }}>
              {availStatus === 'checking' && (
                <div className="status-spinner-small" />
              )}
              {availStatus === 'available' && (
                <span style={{ color: '#34D399', fontSize: '18px', fontWeight: 'bold' }}>✓</span>
              )}
              {availStatus === 'taken' && (
                <span style={{ color: '#FF5A5F', fontSize: '18px', fontWeight: 'bold' }}>✗</span>
              )}
              {availStatus === 'locked' && (
                <span style={{ color: '#D4AF37', fontSize: '18px', fontWeight: 'bold' }}>🔒</span>
              )}
              {availStatus === 'invalid' && (
                <span style={{ color: '#FFC72C', fontSize: '18px', fontWeight: 'bold' }}>⚠️</span>
              )}
            </div>
          </div>

          {/* Real-time status feedback (HIDDEN AS PER REQUEST) */}
          <div style={{ minHeight: '40px', display: 'none', justifyContent: 'center', alignItems: 'center', margin: '2px 0' }}>
            {availStatus !== 'idle' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: -4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '6px 16px',
                  borderRadius: '99px',
                  fontSize: '12px',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: '600',
                  background: availStatus === 'available' ? 'rgba(52, 211, 153, 0.06)' :
                              availStatus === 'taken' ? 'rgba(255, 90, 95, 0.06)' :
                              availStatus === 'locked' ? 'rgba(212, 175, 55, 0.06)' :
                              availStatus === 'invalid' ? 'rgba(255, 199, 44, 0.06)' :
                              'rgba(255, 255, 255, 0.03)',
                  border: '1px solid ' + (
                    availStatus === 'available' ? 'rgba(52, 211, 153, 0.18)' :
                    availStatus === 'taken' ? 'rgba(255, 90, 95, 0.18)' :
                    availStatus === 'locked' ? 'rgba(212, 175, 55, 0.18)' :
                    availStatus === 'invalid' ? 'rgba(255, 199, 44, 0.18)' :
                    'rgba(255, 255, 255, 0.08)'
                  ),
                  color: availStatus === 'available' ? '#34D399' :
                         availStatus === 'taken' ? '#FF5A5F' :
                         availStatus === 'locked' ? '#D4AF37' :
                         availStatus === 'invalid' ? '#FFC72C' :
                         'var(--ink-2)'
                }}
              >
                {availStatus === 'checking' && 'Checking availability...'}
                {availStatus === 'available' && 'Username available!'}
                {availStatus === 'taken' && 'Username already taken — try another'}
                {availStatus === 'locked' && 'This premium username is locked'}
                {availStatus === 'invalid' && validationError}
              </motion.div>
            )}
          </div>

          <MagneticButton 
            type="button"
            className="cta-btn"
            disabled={true}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              color: 'rgba(255, 255, 255, 0.3)',
              fontWeight: '700',
              border: 'none',
              marginTop: '4px',
              padding: '16px 28px',
              borderRadius: '24px',
              cursor: 'not-allowed',
              opacity: 0.6
            }}
          >
            Starting Soon
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
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', width: '100%' }}>
            
            {/* Host Option Card */}
            <motion.div 
              style={{
                background: 'rgba(10, 10, 10, 0.8)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '16px',
                padding: '40px',
                textAlign: 'left',
                cursor: 'not-allowed',
                transition: 'all 0.3s ease',
                backdropFilter: 'blur(10px)',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: '0 10px 30px -10px rgba(0,0,0,0.5)',
                display: 'flex',
                flexDirection: 'column',
                opacity: 0.6
              }}
            >
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '150px', background: 'radial-gradient(ellipse at top left, rgba(124, 92, 255, 0.15), transparent 70%)', pointerEvents: 'none' }} />
              <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                <div style={{ fontSize: '12px', color: '#7C5CFF', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px', fontWeight: 600 }}>
                  FOR HOSTS
                </div>
                <h3 style={{ fontSize: '32px', fontWeight: '800', color: '#FFFFFF', marginBottom: '20px', letterSpacing: '-0.02em', textTransform: 'uppercase', lineHeight: '1.1' }}>
                  YOU <span className="brand-text">HIRE</span> ARTISTS.
                </h3>
                <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.7)', lineHeight: '1.5', marginBottom: '32px', fontWeight: 400 }}>
                  Festivals. Cafes. Brands. Weddings. Find verified talent. Pay through escrow. Sleep at night.
                </p>
                <div style={{ marginTop: 'auto', fontSize: '12px', color: '#FFFFFF', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', opacity: 0.5 }}>
                  STARTING SOON
                </div>
              </div>
            </motion.div>

            {/* Fan Option Card */}
            <motion.div 
              style={{
                background: 'rgba(10, 10, 10, 0.8)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '16px',
                padding: '40px',
                textAlign: 'left',
                cursor: 'not-allowed',
                transition: 'all 0.3s ease',
                backdropFilter: 'blur(10px)',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: '0 10px 30px -10px rgba(0,0,0,0.5)',
                display: 'flex',
                flexDirection: 'column',
                opacity: 0.6
              }}
            >
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '150px', background: 'radial-gradient(ellipse at top right, rgba(212, 86, 122, 0.15), transparent 70%)', pointerEvents: 'none' }} />
              <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                <div style={{ fontSize: '12px', color: '#D4567A', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px', fontWeight: 600 }}>
                  FOR FANS
                </div>
                <h3 style={{ fontSize: '32px', fontWeight: '800', color: '#FFFFFF', marginBottom: '20px', letterSpacing: '-0.02em', textTransform: 'uppercase', lineHeight: '1.1' }}>
                  YOU <span className="brand-text">LOVE</span> ART.
                </h3>
                <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.7)', lineHeight: '1.5', marginBottom: '32px', fontWeight: 400 }}>
                  Request custom works, tip directly, and buy tickets. Experience live performances and exhibitions like never before.
                </p>
                <div style={{ marginTop: 'auto', fontSize: '12px', color: '#FFFFFF', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', opacity: 0.5 }}>
                  STARTING SOON
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

      {/* ──────────────────────── FOOTER ──────────────────────── */}
      <Footer />

      <AuthModal isOpen={isModalOpen} onClose={closeModal} initialUsername={usernameInput} />
      <RoleWaitlistModal isOpen={isRoleModalOpen} onClose={() => setIsRoleModalOpen(false)} role={selectedRole} />
    </main>
  );
}
