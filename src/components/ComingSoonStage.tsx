'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import {
  motion,
  AnimatePresence,
  MotionConfig,
  useMotionValue,
  useSpring,
  useTransform,
} from 'motion/react';
import {
  ArrowRight,
  ArrowUpRight,
  Bell,
  Check,
  Eye,
  Gamepad2,
  Loader2,
  Lock,
  MessageSquarePlus,
  ShieldCheck,
  Smartphone,
  X,
} from 'lucide-react';
import { checkUsernameAvailableAction } from '@/lib/admin-actions';

// ── Copy ──

const ROLES = ['singers', 'DJs', 'rappers', 'comics', 'poets', 'bands', 'dancers', 'producers'];

const MARQUEE_WORDS = [
  'Singers', 'DJs', 'Rappers', 'Stand-up comics', 'Poets', 'Bands',
  'Dancers', 'Producers', 'Beatboxers', 'Session players', 'Hosts', 'Magicians',
];

const BACKDROPS = ['/gallery_2.png', '/gallery_1.png', '/gallery_3.png'];

const OLD_WAY = [
  '20–40% of your fee gone to a middleman',
  '“Bhai, payment next week, pakka.”',
  'Gig details buried in WhatsApp groups',
  'Your portfolio is 14 Instagram links',
  'No contract. No recourse. No respect.',
];

const NEW_WAY = [
  'Keep 100% of the fee you quote',
  'Money locked in escrow before showtime',
  'Dates, riders and contracts in one place',
  'One stage-ready profile that books you',
  'Ratings that follow you to every gig',
];

const PILLARS = [
  {
    n: '01',
    title: 'Get seen',
    img: '/gallery_1.png',
    body: 'A stage-ready profile with your music, videos, press kit and reviews. One link that does the talking for you.',
  },
  {
    n: '02',
    title: 'Get booked',
    img: '/gallery_3.png',
    body: 'Venues, cafés, colleges and wedding planners find you and book you directly. No middlemen in your DMs.',
  },
  {
    n: '03',
    title: 'Get paid',
    img: '/gallery_5.png',
    body: 'Your fee is locked in escrow before you play and released after your set. Every rupee, on time.',
  },
];

const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

const EASE = [0.16, 1, 0.3, 1] as const;

const HANDLE_REGEX = /^[a-z0-9_.]{3,30}$/;

type HandleStatus = 'idle' | 'checking' | 'available' | 'taken' | 'invalid' | 'error';

export interface ComingSoonStageProps {
  greeting: string;
  tagline: string;
  idleMsg: string | null;
  showHint: boolean;
  onLogoClick: () => void;
  onDotClick: (e: React.MouseEvent) => void;
  onHeadlinePressStart: () => void;
  onHeadlinePressEnd: () => void;
  onOpenFeedback: () => void;
  onOpenGame: () => void;
  onOpenAdmin: () => void;
}

export default function ComingSoonStage({
  greeting,
  tagline,
  idleMsg,
  showHint,
  onLogoClick,
  onDotClick,
  onHeadlinePressStart,
  onHeadlinePressEnd,
  onOpenFeedback,
  onOpenGame,
  onOpenAdmin,
}: ComingSoonStageProps) {
  const [slide, setSlide] = useState(0);
  const [roleIdx, setRoleIdx] = useState(0);
  const [handle, setHandle] = useState('');
  const [handleStatus, setHandleStatus] = useState<HandleStatus>('idle');
  const [checkedHandle, setCheckedHandle] = useState('');
  const checkSeq = useRef(0);

  // ── Backdrop slideshow + rotating role word ──
  useEffect(() => {
    const s = setInterval(() => setSlide(p => (p + 1) % BACKDROPS.length), 6000);
    const r = setInterval(() => setRoleIdx(p => (p + 1) % ROLES.length), 2200);
    return () => { clearInterval(s); clearInterval(r); };
  }, []);

  // ── Pointer parallax for the artist pass ──
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const sx = useSpring(px, { stiffness: 80, damping: 18 });
  const sy = useSpring(py, { stiffness: 80, damping: 18 });
  const rotY = useTransform(sx, [-0.5, 0.5], [-10, 10]);
  const rotX = useTransform(sy, [-0.5, 0.5], [8, -8]);
  const chipX = useTransform(sx, [-0.5, 0.5], [-14, 14]);
  const chipY = useTransform(sy, [-0.5, 0.5], [-10, 10]);

  const handlePointerMove = (e: React.PointerEvent<HTMLElement>) => {
    if (e.pointerType !== 'mouse') return;
    const rect = e.currentTarget.getBoundingClientRect();
    px.set((e.clientX - rect.left) / rect.width - 0.5);
    py.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  // ── Stage-name checker ──
  const onHandleChange = (value: string) => {
    setHandle(value.toLowerCase().replace(/[^a-z0-9_.]/g, '').slice(0, 30));
    if (handleStatus !== 'checking') setHandleStatus('idle');
  };

  const onHandleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!HANDLE_REGEX.test(handle)) {
      setHandleStatus('invalid');
      return;
    }
    const seq = ++checkSeq.current;
    setHandleStatus('checking');
    setCheckedHandle(handle);
    try {
      const res = await Promise.race([
        checkUsernameAvailableAction(handle),
        new Promise<never>((_, reject) => setTimeout(() => reject(new Error('timeout')), 8000)),
      ]);
      if (seq !== checkSeq.current) return;
      if (!res.success) setHandleStatus('error');
      else setHandleStatus(res.available ? 'available' : 'taken');
    } catch {
      if (seq === checkSeq.current) setHandleStatus('error');
    }
  };

  const displayHandle = handle || 'yourname';

  return (
    <MotionConfig reducedMotion="user">
      {/* ═════════════════════ HERO ═════════════════════ */}
      <section
        onPointerMove={handlePointerMove}
        className="relative w-full min-h-[100dvh] flex flex-col overflow-hidden"
      >
        {/* Backdrop: live-show photos, slow Ken Burns crossfade */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden>
          <AnimatePresence initial={false}>
            <motion.div
              key={slide}
              className="absolute inset-0"
              initial={{ opacity: 0, scale: 1.12 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ opacity: { duration: 1.6 }, scale: { duration: 8, ease: 'linear' } }}
            >
              <Image
                src={BACKDROPS[slide]}
                alt=""
                fill
                sizes="100vw"
                preload={slide === 0}
                className="object-cover"
              />
            </motion.div>
          </AnimatePresence>
          {/* Darken + brand light leaks */}
          <div className="absolute inset-0 bg-[#07060B]/70" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#07060B] via-[#07060B]/70 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#07060B] via-transparent to-[#07060B]/60" />
          <div className="absolute -top-40 -left-40 w-[42rem] h-[42rem] rounded-full bg-[#F25A2B]/25 blur-[140px]" />
          <div className="absolute top-1/3 -right-40 w-[38rem] h-[38rem] rounded-full bg-[#6D73F0]/25 blur-[140px]" />
          <div className="absolute inset-0 opacity-[0.12] mix-blend-overlay" style={{ backgroundImage: GRAIN }} />
        </div>

        {/* Top bar */}
        <header className="relative z-10 w-full max-w-7xl mx-auto flex items-center justify-between px-5 sm:px-8 pt-5 sm:pt-7">
          <button
            type="button"
            onClick={onLogoClick}
            className="focus:outline-none cursor-default"
            title="ArtisTant"
          >
            <img src="/logo_wordmark_flat.png" alt="ArtisTant" className="h-5 sm:h-7 w-auto object-contain" />
          </button>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline text-[11px] font-mono text-zinc-500">{greeting}</span>
            <span className="flex items-center gap-2 rounded-full border border-white/15 bg-black/30 backdrop-blur-md px-3 py-1.5 text-[10px] sm:text-[11px] font-mono uppercase tracking-[0.18em] text-zinc-200">
              <span className="relative flex w-2 h-2">
                <span className="absolute inset-0 rounded-full bg-[#FF3B3B] animate-ping opacity-75" />
                <span className="relative w-2 h-2 rounded-full bg-[#FF3B3B]" />
              </span>
              Soundcheck in progress
            </span>
          </div>
        </header>

        {/* Stage */}
        <div className="relative z-10 flex-1 w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] items-center gap-12 lg:gap-8 px-5 sm:px-8 pt-10 pb-16 lg:py-10">
          {/* Left: the pitch */}
          <div className="min-w-0 flex flex-col items-start text-left">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: EASE }}
              className="mb-6 sm:mb-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] backdrop-blur-md pl-1.5 pr-4 py-1.5"
            >
              <span className="rounded-full bg-gradient-to-r from-[#F25A2B] to-[#D85B91] px-2.5 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider text-white">
                Let us cook
              </span>
              <span className="text-[12px] sm:text-[13px] text-zinc-300">
                India&apos;s home for independent artists
              </span>
            </motion.div>

            {/* Headline — long-press for a secret; the dot is clickable */}
            <h1
              className="font-display font-bold uppercase text-white leading-[0.86] tracking-[-0.045em] text-[clamp(2.6rem,13vw,7.6rem)] lg:text-[min(6.7vw,7.25rem)] cursor-default select-none"
              onMouseDown={onHeadlinePressStart}
              onMouseUp={onHeadlinePressEnd}
              onMouseLeave={onHeadlinePressEnd}
              onTouchStart={onHeadlinePressStart}
              onTouchEnd={onHeadlinePressEnd}
            >
              <motion.span
                className="block"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: EASE }}
              >
                Stop playing
              </motion.span>
              <motion.span
                className="relative block whitespace-nowrap"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.12, ease: EASE }}
              >
                for{' '}
                <span className="relative inline-block text-white/40">
                  exposure
                  <motion.span
                    aria-hidden
                    className="absolute left-[-3%] right-[-3%] top-[52%] h-[0.11em] rounded-full bg-[#F25A2B] origin-left -rotate-[4deg] shadow-[0_0_24px_rgba(242,90,43,0.8)]"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.5, delay: 1.0, ease: 'easeOut' }}
                  />
                  <motion.span
                    className="absolute -bottom-[0.42em] right-[-0.2em] rotate-[-7deg] whitespace-nowrap rounded-lg sm:rounded-xl bg-gradient-to-r from-[#F25A2B] via-[#D85B91] to-[#8E72E8] px-[0.4em] py-[0.14em] text-[0.24em] font-bold tracking-[-0.02em] text-white shadow-[0_12px_40px_-8px_rgba(216,91,145,0.8)]"
                    initial={{ opacity: 0, scale: 0.3, rotate: -30 }}
                    animate={{ opacity: 1, scale: 1, rotate: -7 }}
                    transition={{ type: 'spring', stiffness: 380, damping: 14, delay: 1.45 }}
                  >
                    Play for pay
                  </motion.span>
                </span>
                <span
                  className="text-[#F25A2B] cursor-pointer inline-block transition-transform duration-200 hover:scale-150 active:scale-75 animate-pulse"
                  onClick={onDotClick}
                  role="button"
                  tabIndex={0}
                  aria-label="Secret"
                >
                  .
                </span>
              </motion.span>
            </h1>

            {/* Built for <role> */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.35 }}
              className="mt-7 sm:mt-9 flex items-baseline gap-2 font-display text-xl sm:text-3xl font-semibold tracking-tight text-zinc-200"
            >
              Built for
              <span className="relative inline-flex h-[1.25em] min-w-[7ch] overflow-hidden">
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.span
                    key={roleIdx}
                    initial={{ y: '100%', opacity: 0 }}
                    animate={{ y: '0%', opacity: 1 }}
                    exit={{ y: '-100%', opacity: 0 }}
                    transition={{ duration: 0.45, ease: EASE }}
                    className="bg-gradient-to-r from-[#F66B4B] via-[#D85B91] to-[#8E72E8] bg-clip-text text-transparent"
                  >
                    {ROLES[roleIdx]}.
                  </motion.span>
                </AnimatePresence>
              </span>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.45, ease: EASE }}
              className="mt-4 max-w-xl text-[15px] sm:text-lg leading-relaxed text-zinc-400"
            >
              Get discovered, get booked direct, and get paid before you walk on stage.
              Escrow-backed gigs, a profile that sells your sound, and{' '}
              <span className="text-white font-medium">zero broker cuts</span>.
            </motion.p>

            {/* Stage-name checker */}
            <motion.form
              onSubmit={onHandleSubmit}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.55, ease: EASE }}
              className="mt-8 w-full max-w-xl"
            >
              <label htmlFor="stage-name" className="block mb-2.5 text-[11px] font-mono uppercase tracking-[0.2em] text-zinc-500">
                Is your stage name still free?
              </label>
              <div className="group relative rounded-2xl p-[1.5px] bg-gradient-to-r from-[#F25A2B]/70 via-[#D85B91]/60 to-[#6D73F0]/70 shadow-[0_20px_60px_-20px_rgba(242,90,43,0.55)]">
                <div className="flex items-center gap-1 rounded-[14px] bg-[#0C0A12]/95 backdrop-blur-xl p-1.5">
                  <span className="pl-3 sm:pl-4 font-mono text-[13px] sm:text-[15px] text-zinc-500 shrink-0">
                    artistant.in/
                  </span>
                  <input
                    id="stage-name"
                    value={handle}
                    onChange={e => onHandleChange(e.target.value)}
                    placeholder="yourname"
                    autoComplete="off"
                    autoCapitalize="none"
                    spellCheck={false}
                    className="min-w-0 flex-1 bg-transparent py-2.5 font-mono text-[13px] sm:text-[15px] text-white placeholder:text-zinc-600 outline-none"
                  />
                  <button
                    type="submit"
                    disabled={handleStatus === 'checking'}
                    className="shrink-0 inline-flex items-center gap-1.5 rounded-xl bg-white px-3.5 sm:px-5 py-2.5 text-[13px] sm:text-sm font-semibold text-black transition-all hover:bg-[#F25A2B] hover:text-white active:scale-95 disabled:opacity-70 cursor-pointer"
                  >
                    {handleStatus === 'checking'
                      ? <Loader2 className="w-4 h-4 animate-spin" />
                      : <>Check<span className="hidden sm:inline"> it</span><ArrowRight className="w-4 h-4" /></>}
                  </button>
                </div>
              </div>
              <div className="mt-3 min-h-[1.5rem] text-[13px]" aria-live="polite">
                <AnimatePresence mode="wait">
                  <motion.p
                    key={handleStatus}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="flex items-center gap-2"
                  >
                    {handleStatus === 'idle' && (
                      <span className="text-zinc-500">Your name, in lights. Claiming opens the day we launch.</span>
                    )}
                    {handleStatus === 'checking' && (
                      <span className="text-zinc-400">Checking the guest list…</span>
                    )}
                    {handleStatus === 'available' && (
                      <>
                        <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span className="text-emerald-300">
                          <span className="font-mono">artistant.in/{checkedHandle}</span> is free. Be first in line at launch.
                        </span>
                      </>
                    )}
                    {handleStatus === 'taken' && (
                      <>
                        <X className="w-4 h-4 text-[#FF6B6B] shrink-0" />
                        <span className="text-[#FF9B9B]">Someone&apos;s already on stage as @{checkedHandle}. Try a remix.</span>
                      </>
                    )}
                    {handleStatus === 'invalid' && (
                      <span className="text-amber-300">3–30 characters: letters, numbers, dots and underscores.</span>
                    )}
                    {handleStatus === 'error' && (
                      <span className="text-zinc-400">Couldn&apos;t reach the guest list. Try again in a sec.</span>
                    )}
                  </motion.p>
                </AnimatePresence>
              </div>
            </motion.form>
          </div>

          {/* Right: the artist pass */}
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 1, delay: 0.3, ease: EASE }}
            className="relative min-w-0 mx-auto w-full max-w-[300px] sm:max-w-[380px] [perspective:1200px]"
          >
            <motion.div style={{ rotateX: rotX, rotateY: rotY }} className="relative [transform-style:preserve-3d]">
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                className="relative aspect-[4/5] rounded-[28px] overflow-hidden border border-white/15 bg-[#120F1A] shadow-[0_40px_120px_-30px_rgba(216,91,145,0.55),0_0_0_1px_rgba(255,255,255,0.04)]"
              >
                <Image
                  src="/gallery_4.png"
                  alt="Artist performing on stage"
                  fill
                  sizes="(max-width: 1024px) 340px, 380px"
                  className="object-cover object-[60%_center] scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#07060B] via-[#07060B]/30 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-br from-[#F25A2B]/20 via-transparent to-[#6D73F0]/25 mix-blend-color" />
                {/* Holographic sheen */}
                <motion.div
                  aria-hidden
                  className="absolute inset-y-0 -inset-x-1/2 bg-[linear-gradient(105deg,transparent_40%,rgba(255,255,255,0.14)_50%,transparent_60%)]"
                  animate={{ x: ['-60%', '60%'] }}
                  transition={{ duration: 3.5, repeat: Infinity, repeatDelay: 2.5, ease: 'easeInOut' }}
                />

                {/* Pass header */}
                <div className="absolute top-0 inset-x-0 flex items-center justify-between p-4">
                  <span className="rounded-full bg-black/40 backdrop-blur-md border border-white/15 px-2.5 py-1 text-[9px] font-mono uppercase tracking-[0.2em] text-white">
                    Artist pass
                  </span>
                  <span className="flex items-center gap-1.5 rounded-full bg-[#FF3B3B]/90 px-2.5 py-1 text-[9px] font-mono font-bold uppercase tracking-[0.15em] text-white">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                    Booked
                  </span>
                </div>

                {/* Pass body */}
                <div className="absolute bottom-0 inset-x-0 p-4 sm:p-5 pb-5">
                  <div className="flex items-end gap-[3px] h-6 mb-3" aria-hidden>
                    {Array.from({ length: 22 }).map((_, i) => (
                      <motion.span
                        key={i}
                        className="w-[3px] rounded-full bg-gradient-to-t from-[#F25A2B] to-[#D85B91]"
                        animate={{ height: ['20%', `${35 + ((i * 37) % 65)}%`, '20%'] }}
                        transition={{ duration: 0.9 + (i % 5) * 0.18, repeat: Infinity, ease: 'easeInOut', delay: i * 0.04 }}
                      />
                    ))}
                  </div>
                  <p className="font-display text-[26px] sm:text-3xl font-bold leading-none tracking-tight text-white truncate">
                    @{displayHandle}
                  </p>
                  <p className="mt-1.5 text-[12px] text-zinc-300">Singer-songwriter · Indie · Bengaluru</p>

                  <div className="mt-4 grid grid-cols-3 divide-x divide-white/10 rounded-2xl border border-white/10 bg-black/40 backdrop-blur-md">
                    {[
                      { k: 'Your fee', v: '₹40,000' },
                      { k: 'Broker', v: '₹0' },
                      { k: 'Paid', v: 'Upfront' },
                    ].map(s => (
                      <div key={s.k} className="px-2.5 sm:px-3 py-2.5 min-w-0">
                        <p className="text-[9px] font-mono uppercase tracking-wider text-zinc-400 whitespace-nowrap">{s.k}</p>
                        <p className="mt-0.5 font-display text-sm sm:text-[15px] font-bold text-white">{s.v}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* Floating notifications */}
              <motion.div
                style={{ x: chipX, y: chipY }}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.2, duration: 0.7, ease: EASE }}
                className="absolute -left-5 sm:-left-16 top-[13%] w-[210px] sm:w-[240px]"
              >
                <div className="flex items-start gap-3 rounded-2xl border border-white/15 bg-[#14111C]/85 backdrop-blur-xl p-3 shadow-2xl">
                  <span className="w-8 h-8 shrink-0 rounded-xl bg-[#F25A2B] flex items-center justify-center">
                    <Bell className="w-4 h-4 text-white" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[12px] font-semibold text-white">New booking request</p>
                    <p className="text-[11px] text-zinc-400 truncate">Rooftop set · Sat, 9 PM · Indiranagar</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                style={{ x: chipX, y: chipY }}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.6, duration: 0.7, ease: EASE }}
                className="absolute -right-5 sm:-right-14 top-[33%] w-[170px] sm:w-[190px]"
              >
                <div className="flex items-center gap-3 rounded-2xl border border-white/15 bg-[#14111C]/85 backdrop-blur-xl p-3 shadow-2xl">
                  <span className="w-8 h-8 shrink-0 rounded-xl bg-[#6D73F0] flex items-center justify-center">
                    <Eye className="w-4 h-4 text-white" />
                  </span>
                  <div>
                    <p className="font-display text-[15px] font-bold leading-none text-white">+128</p>
                    <p className="text-[11px] text-zinc-400 mt-0.5">profile views this week</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                style={{ x: chipX, y: chipY }}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 2.0, duration: 0.7, ease: EASE }}
                className="absolute -right-4 sm:-right-10 -bottom-7 w-[240px] sm:w-[250px]"
              >
                <div className="flex items-start gap-3 rounded-2xl border border-emerald-400/30 bg-[#0E1A16]/90 backdrop-blur-xl p-3 shadow-2xl">
                  <span className="w-8 h-8 shrink-0 rounded-xl bg-emerald-500 flex items-center justify-center">
                    <ShieldCheck className="w-4 h-4 text-white" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[12px] font-semibold text-white">₹40,000 secured in escrow</p>
                    <p className="text-[11px] text-emerald-300/80">Released to you after your set</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll cue */}
        <div className="relative z-10 hidden sm:flex justify-center pb-6" aria-hidden>
          <div className="flex flex-col items-center gap-2 text-[10px] font-mono uppercase tracking-[0.25em] text-zinc-500">
            Scroll for the setlist
            <span className="w-px h-8 bg-gradient-to-b from-zinc-500 to-transparent animate-[scrollPulse_2s_ease-in-out_infinite]" />
          </div>
        </div>
      </section>

      {/* ═════════════════════ MARQUEE ═════════════════════ */}
      <section className="relative py-10 sm:py-14 overflow-hidden" aria-label="Who it's for">
        <div className="absolute inset-x-[-5%] top-1/2 -translate-y-1/2 rotate-[2deg] bg-[#14111C] border-y border-white/10 py-3">
          <Marquee words={MARQUEE_WORDS} reverse className="text-white/20" />
        </div>
        <div className="relative w-[110%] -ml-[5%] -rotate-[2deg] bg-gradient-to-r from-[#F25A2B] via-[#D85B91] to-[#6D73F0] py-3 sm:py-4 shadow-[0_20px_60px_-15px_rgba(216,91,145,0.6)]">
          <Marquee words={MARQUEE_WORDS} className="text-white" />
        </div>
      </section>

      {/* ═════════════════════ OLD WAY vs NEW WAY ═════════════════════ */}
      <section className="relative w-full max-w-7xl mx-auto px-5 sm:px-8 py-16 sm:py-24">
        <Reveal>
          <p className="text-[11px] font-mono uppercase tracking-[0.25em] text-[#F66B4B] mb-4">The problem</p>
          <h2 className="font-display font-bold text-white tracking-[-0.035em] leading-[0.95] text-[clamp(2.2rem,6vw,4.75rem)] max-w-4xl">
            Talent was never the problem.{' '}
            <span className="text-zinc-500">The system around it was.</span>
          </h2>
        </Reveal>

        <div className="mt-10 sm:mt-14 grid md:grid-cols-2 gap-4 sm:gap-5">
          <Reveal delay={0.05}>
            <div className="h-full rounded-3xl border border-white/10 bg-white/[0.02] p-6 sm:p-8">
              <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-zinc-500">How gigs work today</p>
              <ul className="mt-6 space-y-4">
                {OLD_WAY.map(item => (
                  <li key={item} className="flex items-start gap-3 text-[15px] sm:text-base text-zinc-500">
                    <span className="mt-0.5 w-5 h-5 shrink-0 rounded-full border border-white/10 flex items-center justify-center">
                      <X className="w-3 h-3 text-zinc-600" />
                    </span>
                    <span className="line-through decoration-[#F25A2B]/60 decoration-2">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          <Reveal delay={0.12}>
            <div className="relative h-full rounded-3xl p-[1.5px] bg-gradient-to-br from-[#F25A2B] via-[#D85B91] to-[#6D73F0]">
              <div className="relative h-full rounded-[22px] bg-[#0E0B14] p-6 sm:p-8 overflow-hidden">
                <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-[#D85B91]/20 blur-[90px]" aria-hidden />
                <p className="relative text-[11px] font-mono uppercase tracking-[0.2em] text-white">How gigs work on Artistant</p>
                <ul className="relative mt-6 space-y-4">
                  {NEW_WAY.map(item => (
                    <li key={item} className="flex items-start gap-3 text-[15px] sm:text-base text-white">
                      <span className="mt-0.5 w-5 h-5 shrink-0 rounded-full bg-gradient-to-br from-[#F25A2B] to-[#D85B91] flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" strokeWidth={3} />
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═════════════════════ SEEN / BOOKED / PAID ═════════════════════ */}
      <section className="relative w-full max-w-7xl mx-auto px-5 sm:px-8 pb-16 sm:pb-24">
        <Reveal>
          <h2 className="font-display font-bold text-white tracking-[-0.035em] leading-[0.95] text-[clamp(2.2rem,6vw,4.75rem)]">
            Your career,{' '}
            <span className="bg-gradient-to-r from-[#F66B4B] via-[#D85B91] to-[#8E72E8] bg-clip-text text-transparent">
              amplified.
            </span>
          </h2>
        </Reveal>

        <div className="mt-10 sm:mt-14 grid md:grid-cols-3 gap-4 sm:gap-5">
          {PILLARS.map((p, i) => (
            <Reveal key={p.n} delay={i * 0.08}>
              <div className="group relative h-[360px] sm:h-[440px] rounded-3xl overflow-hidden border border-white/10">
                <Image
                  src={p.img}
                  alt=""
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#07060B] via-[#07060B]/60 to-[#07060B]/10" />
                <div className="absolute inset-0 p-6 sm:p-7 flex flex-col justify-between">
                  <span className="font-mono text-[12px] text-white/60">{p.n}</span>
                  <div>
                    <h3 className="font-display text-4xl sm:text-5xl font-bold uppercase tracking-[-0.04em] text-white">
                      {p.title}
                      <span className="text-[#F25A2B]">.</span>
                    </h3>
                    <p className="mt-3 text-[14px] sm:text-[15px] leading-relaxed text-zinc-300">{p.body}</p>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ═════════════════════ WHILE YOU WAIT ═════════════════════ */}
      <section className="relative w-full max-w-7xl mx-auto px-5 sm:px-8 pb-16 sm:pb-20">
        <Reveal>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <h2 className="font-display font-bold text-white tracking-[-0.03em] text-3xl sm:text-4xl">
              While the kitchen heats up
            </h2>
            <p className="text-[13px] font-mono text-zinc-500 italic">{tagline}</p>
          </div>
        </Reveal>

        <div className="mt-8 grid sm:grid-cols-3 gap-3 sm:gap-4">
          <Reveal delay={0.04}>
            <WaitCard
              onClick={onOpenFeedback}
              icon={<MessageSquarePlus className="w-5 h-5" />}
              accent="from-[#F25A2B] to-[#F66B4B]"
              title="Shape the platform"
              body="Got burned by a broker or a ghosting promoter? Tell us. We're building for you."
              tag="Feedback"
            />
          </Reveal>
          <Reveal delay={0.1}>
            <WaitCard
              onClick={onOpenGame}
              icon={<Gamepad2 className="w-5 h-5" />}
              accent="from-[#D85B91] to-[#8E72E8]"
              title="Play Stack"
              body="A one-tap block stacker. Beat your high score while we finish the soundcheck."
              tag="Playable"
              live
            />
          </Reveal>
          <Reveal delay={0.16}>
            <WaitCard
              icon={<Smartphone className="w-5 h-5" />}
              accent="from-[#8E72E8] to-[#6D73F0]"
              title="Artistant in your pocket"
              body="Bookings, escrow and your artist network on iOS and Android."
              tag="Soon"
            />
          </Reveal>
        </div>
      </section>

      {/* ═════════════════════ FOOTER ═════════════════════ */}
      <footer className="relative w-full overflow-hidden border-t border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 pt-12 pb-6">
          <p
            aria-hidden
            className="font-display font-bold uppercase leading-[0.8] tracking-[-0.05em] text-[clamp(2.5rem,13vw,11.75rem)] text-transparent [-webkit-text-stroke:1px_rgba(255,255,255,0.14)] select-none whitespace-nowrap"
          >
            Let us cook
          </p>
          <div className="mt-8 flex items-center justify-between gap-4 text-[11px] font-mono text-zinc-600">
            <span>the ultimate creative link-up.</span>
            <span className="hidden sm:inline text-zinc-700">try typing something</span>
            <button
              type="button"
              onClick={onOpenAdmin}
              className="opacity-20 hover:opacity-100 transition-opacity p-2 text-zinc-500 hover:text-zinc-300 cursor-pointer"
              title="Admin (⌘K)"
            >
              <Lock className="w-3 h-3" />
            </button>
          </div>
        </div>
      </footer>

      {/* Whispers: idle message + delayed hint */}
      <div className="fixed left-4 bottom-4 z-[10002] pointer-events-none max-w-[80vw]">
        <AnimatePresence>
          {(idleMsg || showHint) && (
            <motion.p
              key={idleMsg ?? 'hint'}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
              className="rounded-full border border-white/10 bg-black/60 backdrop-blur-md px-3.5 py-1.5 text-[11px] font-mono text-zinc-400"
            >
              {idleMsg ?? 'psst — this page has secrets. poke around.'}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </MotionConfig>
  );
}

// ── Pieces ──

function Marquee({ words, reverse, className = '' }: { words: string[]; reverse?: boolean; className?: string }) {
  const row = (
    <div className="flex shrink-0 items-center">
      {words.map(w => (
        <span key={w} className="flex items-center">
          <span className="px-5 sm:px-7 font-display text-2xl sm:text-4xl font-bold uppercase tracking-[-0.03em] whitespace-nowrap">
            {w}
          </span>
          <span className="text-xl sm:text-3xl">✦</span>
        </span>
      ))}
    </div>
  );
  return (
    <div className={`flex w-max motion-reduce:animate-none ${reverse ? 'animate-[marqueeRight_40s_linear_infinite]' : 'animate-[marqueeLeft_32s_linear_infinite]'} ${className}`}>
      {row}
      {row}
    </div>
  );
}

function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.8, delay, ease: EASE }}
      className="h-full"
    >
      {children}
    </motion.div>
  );
}

function WaitCard({
  onClick,
  icon,
  accent,
  title,
  body,
  tag,
  live,
}: {
  onClick?: () => void;
  icon: React.ReactNode;
  accent: string;
  title: string;
  body: string;
  tag: string;
  live?: boolean;
}) {
  const interactive = Boolean(onClick);
  const Tag = interactive ? 'button' : 'div';
  return (
    <Tag
      {...(interactive ? { type: 'button' as const, onClick } : {})}
      className={`group relative h-full w-full text-left rounded-3xl border border-white/10 bg-white/[0.03] p-5 sm:p-6 transition-all duration-300 ${
        interactive ? 'cursor-pointer hover:bg-white/[0.06] hover:border-white/20 hover:-translate-y-1 active:scale-[0.99]' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <span className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${accent} flex items-center justify-center text-white shadow-lg`}>
          {icon}
        </span>
        {interactive ? (
          <span className="w-9 h-9 rounded-full border border-white/10 flex items-center justify-center text-zinc-500 group-hover:text-white group-hover:bg-white/10 group-hover:rotate-45 transition-all duration-300">
            <ArrowUpRight className="w-4 h-4" />
          </span>
        ) : null}
      </div>
      <div className="mt-6 flex items-center gap-2">
        <h3 className="font-display text-lg font-semibold tracking-tight text-white">{title}</h3>
        <span className={`flex items-center gap-1 rounded-full border px-2 py-0.5 text-[9px] font-mono uppercase tracking-widest ${
          live ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400' : 'border-white/10 bg-white/[0.04] text-zinc-400'
        }`}>
          {live && <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />}
          {tag}
        </span>
      </div>
      <p className="mt-2 text-[13px] leading-relaxed text-zinc-400">{body}</p>
    </Tag>
  );
}
