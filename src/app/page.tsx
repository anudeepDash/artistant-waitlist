'use client';

import React, { useCallback, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { MotionConfig, motion, useMotionValueEvent, useScroll, useSpring, AnimatePresence } from 'motion/react';
import { useAuth } from '@/hooks/useAuth';
import { useUsernameClaim } from '@/hooks/useUsernameClaim';
import { getUserReservation, type WaitlistEntry } from '@/lib/waitlist';
import { logActivityAction } from '@/lib/admin-actions';
import HomeNav from '@/components/home/HomeNav';
import Hero from '@/components/home/Hero';
import Marquee from '@/components/home/Marquee';
import Problem from '@/components/home/Problem';
import PaymentFlow from '@/components/home/PaymentFlow';
import TwoWaysToPay from '@/components/home/TwoWaysToPay';
import Features from '@/components/home/Features';
import Backstage from '@/components/home/Backstage';
import Audiences, { type AudienceAction } from '@/components/home/Audiences';
import Launch from '@/components/home/Launch';
import Join from '@/components/home/Join';
import Faq from '@/components/home/Faq';
import HomeFooter from '@/components/home/HomeFooter';
import s from '@/components/home/home.module.css';

const AuthModal = dynamic(() => import('@/components/AuthModal'), { ssr: false });
const RoleWaitlistModal = dynamic(() => import('@/components/RoleWaitlistModal'), { ssr: false });

export default function Home() {
  const { user } = useAuth();
  const router = useRouter();
  const claim = useUsernameClaim();

  // Tagged with the owner's uid so a stale result never shows after sign-out or an account switch.
  const [fetched, setFetched] = useState<{ uid: string; entry: WaitlistEntry | null } | null>(null);
  const reservation = user && fetched?.uid === user.uid ? fetched.entry : null;
  const [authOpen, setAuthOpen] = useState(false);
  const [role, setRole] = useState<'organizer' | 'venue' | null>(null);

  const refreshReservation = useCallback(() => {
    if (!user) return;
    getUserReservation(user.uid, user.email, user.phoneNumber)
      .then((entry) => setFetched({ uid: user.uid, entry }))
      .catch(() => setFetched({ uid: user.uid, entry: null }));
  }, [user]);

  useEffect(() => {
    refreshReservation();
  }, [refreshReservation]);

  // Remember who referred this visitor so sign-up can credit them.
  useEffect(() => {
    const ref = new URLSearchParams(window.location.search).get('ref');
    if (ref) localStorage.setItem('artistant_ref', ref.trim().toLowerCase());
  }, []);

  // Log one visit per browser session.
  useEffect(() => {
    if (sessionStorage.getItem('artistant_visit_logged')) return;
    (async () => {
      try {
        await logActivityAction({
          actionType: 'visit',
          ...(user ? { idToken: await user.getIdToken() } : {}),
        });
        sessionStorage.setItem('artistant_visit_logged', 'true');
      } catch (e) {
        console.warn('Failed to log visit activity', e);
      }
    })();
  }, [user]);

  const goToClaim = useCallback(() => {
    document.getElementById('join')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setTimeout(() => document.getElementById('username-join-input')?.focus({ preventScroll: true }), 700);
  }, []);

  const handleClaimSubmit = () => {
    if (claim.status === 'locked') {
      const subject = encodeURIComponent(`Premium username request: @${claim.username}`);
      const body = encodeURIComponent(
        `Hi Artistant team,\n\nI'd like to request the premium username @${claim.username}.\n\n` +
          `- Full name / act name:\n- Links (Instagram / Spotify / YouTube):\n\nThanks!`,
      );
      window.location.href = `mailto:hello@artistant.in?subject=${subject}&body=${body}`;
      return;
    }
    if (claim.status === 'available') setAuthOpen(true);
  };

  const handleAudienceAction = (action: AudienceAction) => {
    if (action === 'claim') goToClaim();
    else setRole(action);
  };

  const openDashboard = () => router.push('/dashboard');

  return (
    <MotionConfig reducedMotion="user">
      <div className={s.page}>
        <ScrollProgress />
        <HomeNav
          user={user}
          reservation={reservation}
          onSignIn={() => setAuthOpen(true)}
          onClaim={goToClaim}
          onDashboard={openDashboard}
        />

        <main>
          <Hero
            claim={claim}
            reservation={reservation}
            onClaimSubmit={handleClaimSubmit}
            onDashboard={openDashboard}
            onBooker={() => setRole('organizer')}
          />
          <Marquee />
          <Problem />
          <PaymentFlow />
          <TwoWaysToPay />
          <Features />
          <Backstage />
          <Audiences onAction={handleAudienceAction} />
          <Launch />
          <Join
            claim={claim}
            reservation={reservation}
            onClaimSubmit={handleClaimSubmit}
            onDashboard={openDashboard}
            onRole={setRole}
          />
          <Faq />
        </main>

        <HomeFooter />
        {!reservation && <MobileCta onClick={goToClaim} />}
      </div>

      <AuthModal
        isOpen={authOpen}
        onClose={() => {
          setAuthOpen(false);
          refreshReservation();
        }}
        initialUsername={claim.username}
      />
      <RoleWaitlistModal isOpen={role !== null} onClose={() => setRole(null)} role={role} />
    </MotionConfig>
  );
}

function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 30, restDelta: 0.001 });
  return <motion.div className={s.progress} style={{ scaleX }} aria-hidden="true" />;
}

/** Floating "claim" button on phones, hidden over the hero and the sign-up section. */
function MobileCta({ onClick }: { onClick: () => void }) {
  const { scrollY } = useScroll();
  const [visible, setVisible] = useState(false);

  useMotionValueEvent(scrollY, 'change', (y) => {
    const join = document.getElementById('join')?.getBoundingClientRect();
    const joinOnScreen = join ? join.top < window.innerHeight && join.bottom > 0 : false;
    setVisible(y > window.innerHeight * 0.9 && !joinOnScreen);
  });

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className={s.mobileCta}
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          <button type="button" className={s.btnGrad} onClick={onClick}>
            Claim your name — it’s free
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
