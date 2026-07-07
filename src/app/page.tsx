'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, useSpring, useMotionValue, useInView } from 'motion/react';
import AuthModal from '@/components/AuthModal';
import RoleWaitlistModal from '@/components/RoleWaitlistModal';
import { isUsernameAvailable, getUserReservation, type WaitlistEntry } from '@/lib/waitlist';
import { signInWithGoogle, signOut } from '@/lib/auth';
import { useAuth } from '@/hooks/useAuth';

/* ── Sleek SVG Icons for features ── */
const ICONS = [
  // 1. Connection / Engine (nodes linking)
  <svg key="1" className="w-5 h-5 text-white stroke-current" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M16 3h5v5M8 21H3v-5M12 12m-3 0a3 3 0 1 0 6 0 3 3 0 1 0 -6 0M21 3L14.5 9.5M3 21l6.5-6.5"/></svg>,
  // 2. Shield (Escrow)
  <svg key="2" className="w-5 h-5 text-white stroke-current" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10zM9 11l2 2 4-4"/></svg>,
  // 3. Concierge (Bell/Support)
  <svg key="3" className="w-5 h-5 text-white stroke-current" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
  // 4. Exclusives (Crown/Star)
  <svg key="4" className="w-5 h-5 text-white stroke-current" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>,
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

const ROADMAP_PHASES = [
  {
    phase: '01',
    label: 'Core Booking Engine',
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
    label: 'Trust & Safety Layer',
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
    label: 'Ecosystem & Growth',
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
            mixBlendMode: 'screen',
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
  const x = useTransform(progress, [0, 1], [layout.startX, layout.endX]);
  const y = useTransform(progress, [0, 1], [layout.startY, layout.endY]);
  const z = useTransform(progress, [0, 1], [layout.startZ, layout.endZ]);
  const rotateZ = useTransform(
    progress,
    [0, 1],
    [layout.startRotZ, layout.endRotZ]
  );
  const opacity = useTransform(progress, [0, 0.9, 1], [0.26, 0.26, 0]);
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
        width: `${layout.size}vw`,
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
        style={{ filter: "grayscale(1) contrast(1.2) brightness(0.4)" }}
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

  const [scrollRef, setScrollRef] = useState<React.RefObject<HTMLElement | null>>({ current: null });
  useEffect(() => {
    setScrollRef(sectionRef);
  }, []);

  const { user } = useAuth();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

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
  const [availStatus, setAvailStatus] = useState<'idle' | 'checking' | 'available' | 'taken' | 'invalid'>('idle');
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

  const [showNav, setShowNav] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [activePhase, setActivePhase] = useState('core');

  useEffect(() => {
    const onScroll = () => {
      const currentScrollY = window.scrollY;
      setNavScrolled(currentScrollY > 60);
      
      if (currentScrollY <= 60) {
        setShowNav(true);
      } else if (currentScrollY > lastScrollY) {
        // Scrolling down -> Hide navbar
        setShowNav(false);
      } else {
        // Scrolling up -> Show navbar
        setShowNav(true);
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
    if (availStatus === 'taken') return; // blocked — inline error already shown
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
          <img src="/logo_wordmark.png" alt="ArtisTant" style={{ height: '120px', width: 'auto', display: 'block' }} />
        </a>
        {user ? (
          <div style={{ position: 'relative' }}>
            <button 
              onClick={(e) => { e.stopPropagation(); setProfileDropdownOpen(!profileDropdownOpen); }} 
              className="nav-cta" 
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <div style={{
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #F25A2B 0%, #7C5CFF 100%)',
                color: '#FFFFFF',
                display: 'grid',
                placeItems: 'center',
                fontSize: '10px',
                fontWeight: 'bold',
                textTransform: 'uppercase'
              }}>
                {user.email?.[0] || 'U'}
              </div>
              <span>Profile</span>
            </button>
            
            {profileDropdownOpen && (
              <div 
                className="glass-card" 
                onClick={(e) => e.stopPropagation()} 
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 12px)',
                  right: 0,
                  width: '220px',
                  padding: '16px',
                  borderRadius: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  zIndex: 100,
                  boxShadow: '0 12px 30px -10px rgba(0,0,0,0.5)',
                  border: '1px solid var(--line-soft)',
                  background: 'rgba(14, 21, 36, 0.95)',
                  backdropFilter: 'blur(20px)'
                }}
              >
                <div style={{ fontSize: '12px', color: 'var(--ink-2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: '500' }}>
                  {user.email}
                </div>
                <hr style={{ border: 'none', borderTop: '1px solid var(--line-soft)', margin: '0' }} />
                <button
                  onClick={handleSignOut}
                  style={{
                    background: 'rgba(255, 90, 95, 0.08)',
                    color: '#FF5A5F',
                    border: '1px solid rgba(255, 90, 95, 0.15)',
                    borderRadius: '8px',
                    padding: '8px',
                    fontSize: '12px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    textAlign: 'center',
                    transition: 'all 0.2s',
                    width: '100%'
                  }}
                  className="hover-opacity"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        ) : (
          <button onClick={openModal} className="nav-cta">
            Sign In <span className="arrow">↗</span>
          </button>
        )}
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
        {/* Sticky inner stage — locks the headline + photos in the viewport */}
        <div
          className="sticky top-0 flex h-screen w-full items-center justify-center overflow-hidden"
          style={{
            perspective: "1600px",
            transformStyle: "preserve-3d",
            padding: "160px var(--gutter) 80px",
          }}
        >
          {/* Layered background — radial gradient + grid */}
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

            {/* Headline (Loads instantly alongside the section, matching the design spacing and typography) */}
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
                onClick={(e) => { e.preventDefault(); }} 
                className="btn-primary"
                disabled
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  color: 'rgba(255, 255, 255, 0.3)',
                  fontWeight: '700',
                  border: 'none',
                  cursor: 'not-allowed'
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
                background: '#1A1A1A',
                borderColor: '#2A2A2A',
                color: '#7C7C7C'
              }}
            >
              <h3 className="comparison-title" style={{ color: '#8A8A8A', fontSize: 32 }}>
                The Messy Way
              </h3>
              <ul className="comparison-list">
                <li className="comparison-item" style={{ opacity: 0.7 }}>
                  <span className="comparison-icon" style={{ color: '#555555' }}>●</span>
                  <div>
                    <strong style={{ color: '#8A8A8A' }}>Unreliable Instagram DMs</strong>
                    Business requests buried in social notifications and fan messages.
                  </div>
                </li>
                <li className="comparison-item" style={{ opacity: 0.7 }}>
                  <span className="comparison-icon" style={{ color: '#555555' }}>●</span>
                  <div>
                    <strong style={{ color: '#8A8A8A' }}>WhatsApp Price Bargaining</strong>
                    Endless message haggling, manual invoicing, and chasing bank transfers.
                  </div>
                </li>
                <li className="comparison-item" style={{ opacity: 0.7 }}>
                  <span className="comparison-icon" style={{ color: '#555555' }}>●</span>
                  <div>
                    <strong style={{ color: '#8A8A8A' }}>3x Middleman Agent Markups</strong>
                    Brokers adding opaque commission markups that inflate client pricing.
                  </div>
                </li>
                <li className="comparison-item" style={{ opacity: 0.7 }}>
                  <span className="comparison-icon" style={{ color: '#555555' }}>●</span>
                  <div>
                    <strong style={{ color: '#8A8A8A' }}>No Payment Security</strong>
                    Chasing advances, last-minute event cancellations, or ghosting post-show.
                  </div>
                </li>
              </ul>
            </motion.div>

            {/* The Artistant Way (High Contrast Brand UI) */}
            <motion.div 
              className="comparison-card artistant"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              variants={slideR}
              style={{
                background: '#0E1524',
                border: '1px solid rgba(242, 90, 43, 0.25)',
                color: '#FFFFFF'
              }}
            >
              <h3 className="comparison-title" style={{ 
                fontSize: 32,
                color: '#FFFFFF'
              }}>
                The <span className="logo-typo"><span className="artis">Artis</span><span className="tant">Tant</span></span> Way
              </h3>
              <ul className="comparison-list">
                <li className="comparison-item">
                  <span className="comparison-icon" style={{ color: '#F25A2B' }}>●</span>
                  <div>
                    <strong style={{ color: '#FFFFFF' }}>Your Custom @username Link</strong>
                    A clean, premium public bio linking videos, audio tracks, and technical specifications.
                  </div>
                </li>
                <li className="comparison-item">
                  <span className="comparison-icon" style={{ color: '#F25A2B' }}>●</span>
                  <div>
                    <strong style={{ color: '#FFFFFF' }}>Transparent Standard Rates</strong>
                    Live performance calendar showing set prices upfront to cut negotiations.
                  </div>
                </li>
                <li className="comparison-item">
                  <span className="comparison-icon" style={{ color: '#F25A2B' }}>●</span>
                  <div>
                    <strong style={{ color: '#FFFFFF' }}>Direct 1-on-1 Booking</strong>
                    No agents, no markup filters. Clients book you directly with 100% earnings.
                  </div>
                </li>
                <li className="comparison-item">
                  <span className="comparison-icon" style={{ color: '#F25A2B' }}>●</span>
                  <div>
                    <strong style={{ color: '#FFFFFF' }}>Gigsafe Escrow Protection</strong>
                    Funds are secured in Gigsafe escrow before show starts, auto-releasing post-performance.
                  </div>
                </li>
              </ul>
            </motion.div>
          </div>
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
        <div className="category-marquee-row row-left">
          {[...Array(2)].map((_, dupeIdx) => (
            ['Singers & Vocalists', 'DJs & Producers', 'Bands & Ensembles', 'Comedians & MCs', 'Instrumentalists', 'Magicians & Illusionists', 'Dancers & Choreographers'].map((cat, idx) => (
              <span key={`r1-${dupeIdx}-${idx}`} className="marquee-pill" style={{ '--pill-accent': ['#F25A2B','#D4567A','#7C5CFF','#6B7CDB','#FF5A5F','#F25A2B','#D4567A'][idx] } as any}>
                {cat}
              </span>
            ))
          ))}
        </div>

        {/* Row 2 — scrolls right */}
        <div className="category-marquee-row row-right" style={{ marginTop: '16px' }}>
          {[...Array(2)].map((_, dupeIdx) => (
            ['Acrobats & Aerialists', 'Fire Spinners & Flow Artists', 'Spoken Word Poets', 'Beatboxers', 'Tribute & Cover Acts', 'Live Visual Artists'].map((cat, idx) => (
              <span key={`r2-${dupeIdx}-${idx}`} className="marquee-pill" style={{ '--pill-accent': ['#7C5CFF','#6B7CDB','#FF5A5F','#F25A2B','#D4567A','#7C5CFF'][idx] } as any}>
                {cat}
              </span>
            ))
          ))}
        </div>
      </section>

      {/* ──────────────────────── PLATFORM EVOLUTION TIMELINE ──────────────────────── */}
      <section 
        id="standard" 
        className="section"
        style={{
          padding: '100px var(--gutter)',
          background: '#05070A',
          borderTop: '1px solid var(--line-soft)',
          borderBottom: '1px solid var(--line-soft)'
        }}
      >
        <div className="section-inner" style={{ width: '100%', maxWidth: '1200px', margin: '0 auto' }}>
          <motion.div 
            className="section-label"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fUp}
            style={{ marginBottom: 16 }}
          >
            Capabilities &amp; Evolution
          </motion.div>

          <motion.h2 
            className="section-heading"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fUp}
            style={{ marginBottom: '20px' }}
          >
            Platform <AnimatedTitle text="evolution." className="brand-text" />
          </motion.h2>

          <motion.p
            className="section-desc"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fUp}
            style={{ marginBottom: 0 }}
          >
            From core booking to a full creative economy — here&apos;s the roadmap.
          </motion.p>

          {/* Vertical Timeline */}
          <div className="roadmap-timeline">
            {ROADMAP_PHASES.map((phase, pIdx) => (
              <motion.div 
                key={pIdx} 
                className="timeline-phase"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.6, delay: pIdx * 0.15 }}
              >
                <div className="timeline-dot" style={{ color: phase.accentColor, borderColor: phase.accentColor }} />
                
                <div className="timeline-phase-header">
                  <h3 className="timeline-phase-title">{phase.label}</h3>
                  <span className="timeline-phase-tag" style={{ color: phase.accentColor }}>{phase.timeline}</span>
                </div>

                <div className="timeline-features">
                  {phase.features.map((feature, fIdx) => (
                    <motion.div 
                      key={fIdx}
                      className="timeline-feature-card"
                      initial={{ opacity: 0, y: 15 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: fIdx * 0.06 }}
                    >
                      <h4 className="timeline-feature-title">{feature.title}</h4>
                      <p className="timeline-feature-desc">{feature.desc}</p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
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
          Gearing Up
        </motion.div>
        
        {/* Requested waitlist headline */}
        <motion.h2 
          className="cta-heading"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ type: 'spring', stiffness: 80, damping: 15 }}
          style={{ maxWidth: '28ch', margin: '0 auto 16px auto' }}
        >
          Username reservations are <AnimatedTitle text="starting soon." className="brand-text" />
        </motion.h2>
        
        {/* Requested waitlist username reservation form */}
          {/* Show reserved card for signed-in users who already have a reservation */}
          {userReservation ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 22 }}
              style={{
                maxWidth: '460px',
                margin: '32px auto 0 auto',
                position: 'relative',
                zIndex: 10,
                background: 'rgba(14, 21, 36, 0.7)',
                border: '1px solid rgba(52, 211, 153, 0.25)',
                borderRadius: '24px',
                padding: '32px 28px',
                boxShadow: '0 0 40px rgba(52, 211, 153, 0.06), inset 0 1px 0 rgba(255,255,255,0.06)',
                backdropFilter: 'blur(12px)',
                textAlign: 'center',
              }}
            >
              {/* Animated tick */}
              <div style={{
                width: '56px', height: '56px', borderRadius: '50%', margin: '0 auto 20px auto',
                background: 'linear-gradient(135deg, #F25A2B, #D4567A, #7C5CFF)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 8px 24px rgba(242, 90, 43, 0.3)',
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <motion.polyline
                    points="20 6 9 17 4 12"
                    stroke="white"
                    strokeWidth={3}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  />
                </svg>
              </div>

              <p style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: '#34D399', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 600, marginBottom: '12px' }}>
                Username Reserved
              </p>

              <div style={{
                display: 'inline-block',
                background: 'linear-gradient(135deg, #F25A2B, #7C5CFF)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontSize: '28px',
                fontWeight: 800,
                fontFamily: 'var(--font-display)',
                marginBottom: '8px',
              }}>
                @{userReservation.username}
              </div>

              <p style={{ fontSize: '13px', color: 'var(--ink-2)', marginBottom: '20px', lineHeight: 1.6 }}>
                You're on the early access list. We'll notify you when it's time to set up your profile.
              </p>

              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                padding: '6px 16px', borderRadius: '99px',
                background: 'rgba(242, 90, 43, 0.08)',
                border: '1px solid rgba(242, 90, 43, 0.25)',
              }}>
                <span style={{ color: '#F25A2B', fontSize: '14px' }}>★</span>
                <span style={{ color: '#F25A2B', fontSize: '11px', fontFamily: 'var(--font-mono)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Early Access Member</span>
              </div>
            </motion.div>
          ) : (
        <motion.form 
          onSubmit={handleWaitlistSubmit}
          style={{
            maxWidth: '460px',
            margin: '32px auto 0 auto',
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
                  availStatus === 'invalid' ? '#FFC72C' :
                  availStatus === 'checking' ? '#7C5CFF' :
                  'var(--line)'
                ),
                boxShadow: availStatus === 'available' ? '0 0 15px rgba(52, 211, 153, 0.12)' :
                           availStatus === 'taken' ? '0 0 15px rgba(255, 90, 95, 0.12)' :
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
            {/* Inline validation status icons */}
            <div style={{ position: 'absolute', right: '20px', display: 'flex', alignItems: 'center', pointerEvents: 'none' }}>
              {availStatus === 'checking' && (
                <div className="status-spinner-small" />
              )}
              {availStatus === 'available' && (
                <span style={{ color: '#34D399', fontSize: '18px', fontWeight: 'bold' }}>✓</span>
              )}
              {availStatus === 'taken' && (
                <span style={{ color: '#FF5A5F', fontSize: '18px', fontWeight: 'bold' }}>✗</span>
              )}
              {availStatus === 'invalid' && (
                <span style={{ color: '#FFC72C', fontSize: '18px', fontWeight: 'bold' }}>⚠️</span>
              )}
            </div>
          </div>

          {/* Real-time status feedback */}
          <div style={{ minHeight: '40px', display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '2px 0' }}>
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
                              availStatus === 'invalid' ? 'rgba(255, 199, 44, 0.06)' :
                              'rgba(255, 255, 255, 0.03)',
                  border: '1px solid ' + (
                    availStatus === 'available' ? 'rgba(52, 211, 153, 0.18)' :
                    availStatus === 'taken' ? 'rgba(255, 90, 95, 0.18)' :
                    availStatus === 'invalid' ? 'rgba(255, 199, 44, 0.18)' :
                    'rgba(255, 255, 255, 0.08)'
                  ),
                  color: availStatus === 'available' ? '#34D399' :
                         availStatus === 'taken' ? '#FF5A5F' :
                         availStatus === 'invalid' ? '#FFC72C' :
                         'var(--ink-2)'
                }}
              >
                {availStatus === 'checking' && 'Checking availability...'}
                {availStatus === 'available' && 'Username available!'}
                {availStatus === 'taken' && 'Username already taken — try another'}
                {availStatus === 'invalid' && validationError}
              </motion.div>
            )}
          </div>

          <MagneticButton 
            type="submit"
            className="cta-btn"
            disabled
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
        
        {/* Sleek Segmented Role Waitlists */}
        <div style={{ marginTop: '48px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', zIndex: 10, position: 'relative' }}>
          <span style={{ fontSize: '11px', color: 'var(--ink-3)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Not an Artist?
          </span>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center', maxWidth: '500px', width: '100%', padding: '0 20px' }}>
            {/* Host Option Card */}
            <motion.div 
              onClick={() => { setSelectedRole('organizer'); setIsRoleModalOpen(true); }}
              whileHover={{ scale: 1.02, borderColor: 'rgba(124, 92, 255, 0.4)', background: 'rgba(124, 92, 255, 0.03)' }}
              whileTap={{ scale: 0.98 }}
              style={{
                flex: '1 1 200px',
                background: 'rgba(14, 21, 36, 0.4)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                borderRadius: '20px',
                padding: '20px',
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'border-color 0.3s ease, background 0.3s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '10px',
                  background: 'rgba(124, 92, 255, 0.1)',
                  color: '#7C5CFF',
                  display: 'grid',
                  placeItems: 'center'
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                  </svg>
                </div>
                <span style={{ fontSize: '15px', fontWeight: '700', color: '#FFFFFF' }}>Gearing Up</span>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--ink-2)', lineHeight: '1.4', margin: 0 }}>
                Book performers &amp; organize events.
              </p>
            </motion.div>

            {/* Attendee Option Card */}
            <motion.div 
              onClick={() => { setSelectedRole('attendee'); setIsRoleModalOpen(true); }}
              whileHover={{ scale: 1.02, borderColor: 'rgba(212, 86, 122, 0.4)', background: 'rgba(212, 86, 122, 0.03)' }}
              whileTap={{ scale: 0.98 }}
              style={{
                flex: '1 1 200px',
                background: 'rgba(14, 21, 36, 0.4)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                borderRadius: '20px',
                padding: '20px',
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'border-color 0.3s ease, background 0.3s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '10px',
                  background: 'rgba(212, 86, 122, 0.1)',
                  color: '#D4567A',
                  display: 'grid',
                  placeItems: 'center'
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 18V5l12-2v13" />
                    <circle cx="6" cy="18" r="3" />
                    <circle cx="18" cy="16" r="3" />
                  </svg>
                </div>
                <span style={{ fontSize: '15px', fontWeight: '700', color: '#FFFFFF' }}>Gearing Up</span>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--ink-2)', lineHeight: '1.4', margin: 0 }}>
                Request songs, tip directly, and buy tickets.
              </p>
            </motion.div>
          </div>
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
      <footer className="footer-premium">
        <div className="footer-inner">
          <div className="footer-brand-side">
            <a className="footer-logo-link" href="#top">
              <img src="/logo_wordmark.png" alt="ArtisTant" className="footer-logo-img" />
            </a>
            <p className="footer-tagline" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px' }}>
              <span>Step into The Bookability Engine™.</span>
              <span style={{
                fontSize: '9px',
                fontFamily: 'var(--font-mono)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                padding: '3px 8px',
                borderRadius: '6px',
                background: 'rgba(242, 90, 43, 0.12)',
                border: '1px solid rgba(242, 90, 43, 0.25)',
                color: 'var(--brand-1)',
                fontWeight: '600',
                display: 'inline-block'
              }}>
                Launching Soon
              </span>
            </p>
            <p className="footer-location">
              Built in Bengaluru.
            </p>
          </div>

          <div className="footer-links-side">
            <div className="footer-link-group">
              <span className="footer-group-title">Contact</span>
              <a href="mailto:hello@artistant.in" className="footer-interactive-link">
                hello@artistant.in
              </a>
            </div>
            
            <div className="footer-link-group">
              <span className="footer-group-title">Social</span>
              <div className="footer-social-row">
                <a href="https://instagram.com/artistant.in" target="_blank" rel="noopener noreferrer" className="footer-interactive-link">
                  artistant.in
                </a>
              </div>
            </div>

            <div className="footer-link-group">
              <span className="footer-group-title">Navigate</span>
              <div className="footer-social-row">
                <a href="#problem-voices" className="footer-interactive-link">Voices</a>
                <span className="footer-sep">·</span>
                <a href="#standard" className="footer-interactive-link">Roadmap</a>
                <span className="footer-sep">·</span>
                <a href="#join" className="footer-interactive-link">Reserve</a>
              </div>
            </div>
          </div>
        </div>

        <div className="footer-bottom-base">
          <span>© 2026 Artistant Pvt. Ltd. All rights reserved.</span>
          <span className="footer-motto">the ultimate creative linkup. <span className="motto-dot">●</span></span>
        </div>
      </footer>

      <AuthModal isOpen={isModalOpen} onClose={closeModal} initialUsername={usernameInput} />
      <RoleWaitlistModal isOpen={isRoleModalOpen} onClose={() => setIsRoleModalOpen(false)} role={selectedRole} />
    </main>
  );
}
