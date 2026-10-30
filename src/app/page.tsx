"use client";

import React, { useCallback, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import {
  MotionConfig,
  motion,
  useMotionValueEvent,
  useScroll,
  useSpring,
  AnimatePresence,
} from "motion/react";
import { useAuth } from "@/hooks/useAuth";
import { useUsernameClaim } from "@/hooks/useUsernameClaim";
import { getUserReservation, type WaitlistEntry } from "@/lib/waitlist";
import { checkIsAdminAction, logActivityAction } from "@/lib/admin-actions";
import { signOut } from "@/lib/auth";
import HomeNav from "@/components/home/HomeNav";
import Hero from "@/components/home/Hero";
import ChaosToPaid from "@/components/home/ChaosToPaid";
import Setlist from "@/components/home/Setlist";
import EveryStage from "@/components/home/EveryStage";
import Lineup from "@/components/home/Lineup";
import BackstagePass from "@/components/home/BackstagePass";
import Rider from "@/components/home/Rider";
import OtherSide from "@/components/home/OtherSide";
import Faq from "@/components/home/Faq";
import Encore from "@/components/home/Encore";
import HomeFooter from "@/components/home/HomeFooter";
import {
  GIG_TYPES,
  SIDE_CTA,
  SIDE_ROLE,
  type Side,
} from "@/components/home/sides";
import s from "@/components/home/home.module.css";

const AuthModal = dynamic(() => import("@/components/AuthModal"), {
  ssr: false,
});
const RoleWaitlistModal = dynamic(
  () => import("@/components/RoleWaitlistModal"),
  { ssr: false },
);

export default function Home() {
  const { user } = useAuth();
  const claim = useUsernameClaim();

  // Tagged with the owner's uid so a stale result never shows after sign-out or an account switch.
  const [fetched, setFetched] = useState<{
    uid: string;
    entry: WaitlistEntry | null;
  } | null>(null);
  const reservation = user && fetched?.uid === user.uid ? fetched.entry : null;
  // Same uid tagging as above, for the admin check.
  const [adminFor, setAdminFor] = useState<string | null>(null);
  const isAdmin = !!user && adminFor === user.uid;
  const [authOpen, setAuthOpen] = useState(false);
  const [role, setRole] = useState<"organizer" | "venue" | null>(null);
  // Which side of the stage the visitor picked. The whole page follows it.
  const [side, setSide] = useState<Side>("artist");

  const changeSide = useCallback((next: Side) => {
    setSide(next);
    // Picked from further down the page: take them back up to the new hero.
    if (window.scrollY > window.innerHeight * 0.6)
      window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const refreshReservation = useCallback(() => {
    if (!user) return;
    getUserReservation(user.uid, user.email, user.phoneNumber)
      .then((entry) => setFetched({ uid: user.uid, entry }))
      .catch(() => setFetched({ uid: user.uid, entry: null }));
  }, [user]);

  useEffect(() => {
    refreshReservation();
  }, [refreshReservation]);

  // Admins get a link to the admin portal in the account menu.
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    user
      .getIdToken()
      .then((token) => checkIsAdminAction(token))
      .then((ok) => {
        if (!cancelled && ok) setAdminFor(user.uid);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [user]);

  const handleSignOut = useCallback(async () => {
    try {
      await signOut();
    } catch (e) {
      console.warn("Sign out failed", e);
    }
    // Re-lock the Coming Soon gate an admin may have unlocked in this browser.
    try {
      localStorage.removeItem("artistant_admin_bypass_active");
    } catch {}
    setAdminFor(null);
  }, []);

  // Remember who referred this visitor so sign-up can credit them.
  useEffect(() => {
    const ref = new URLSearchParams(window.location.search).get("ref");
    if (ref) localStorage.setItem("artistant_ref", ref.trim().toLowerCase());
  }, []);

  // Log one visit per browser session.
  useEffect(() => {
    if (sessionStorage.getItem("artistant_visit_logged")) return;
    (async () => {
      try {
        await logActivityAction({
          actionType: "visit",
          ...(user ? { idToken: await user.getIdToken() } : {}),
        });
        sessionStorage.setItem("artistant_visit_logged", "true");
      } catch (e) {
        console.warn("Failed to log visit activity", e);
      }
    })();
  }, [user]);

  const goToClaim = useCallback(() => {
    const input = document.getElementById("username-pass-input");
    input?.scrollIntoView({ behavior: "smooth", block: "center" });
    setTimeout(() => input?.focus({ preventScroll: true }), 700);
  }, []);

  const handleClaimSubmit = () => {
    if (claim.status === "locked") {
      const subject = encodeURIComponent(
        `Premium username request: @${claim.username}`,
      );
      const body = encodeURIComponent(
        `Hi Artistant team,\n\nI'd like to request the premium username @${claim.username}.\n\n` +
          `- Full name / act name:\n- Links (Instagram / Spotify / YouTube):\n\nThanks!`,
      );
      window.location.href = `mailto:hello@artistant.in?subject=${subject}&body=${body}`;
      return;
    }
    if (claim.status === "available") setAuthOpen(true);
  };

  // The main action for the current side.
  const sideCta = () =>
    side === "artist" ? goToClaim() : setRole(SIDE_ROLE[side]);
  // The name shown on the pass, poster and rider: the saved one, or whatever is being typed.
  const shownName = reservation?.username ?? claim.username;

  return (
    <MotionConfig reducedMotion="user">
      <div className={`${s.page} ${sideClass(side)}`}>
        <ScrollProgress />
        <HomeNav
          side={side}
          onSide={changeSide}
          user={user}
          reservation={reservation}
          onSignIn={() => setAuthOpen(true)}
          onSignOut={handleSignOut}
          isAdmin={isAdmin}
          onCta={sideCta}
        />

        <main>
          <Hero
            side={side}
            onSide={changeSide}
            claim={claim}
            reservation={reservation}
            onClaimSubmit={handleClaimSubmit}
            onRole={setRole}
          />

          {/* Everything below the hero is rebuilt for the side the visitor picked. */}
          <motion.div
            key={side}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <GigTypes side={side} />
            <ChaosToPaid side={side} />
            <Setlist side={side} username={shownName} />
            {side !== "venue" && <EveryStage side={side} />}
            {side === "artist" && (
              <>
                <Lineup username={shownName} onClaim={goToClaim} />
                <BackstagePass
                  claim={claim}
                  reservation={reservation}
                  onClaimSubmit={handleClaimSubmit}
                />
              </>
            )}
            <Rider side={side} username={shownName} />
            <OtherSide side={side} onSide={changeSide} onRole={setRole} />
            <Faq side={side} />
            <Encore
              side={side}
              claim={claim}
              reservation={reservation}
              onClaimSubmit={handleClaimSubmit}
              onRole={setRole}
            />
          </motion.div>
        </main>

        <HomeFooter />
        {(side !== "artist" || !reservation) && (
          <MobileCta label={SIDE_CTA[side]} onClick={sideCta} />
        )}
      </div>

      <AuthModal
        isOpen={authOpen}
        onClose={() => {
          setAuthOpen(false);
          refreshReservation();
        }}
        initialUsername={claim.username}
      />
      <RoleWaitlistModal
        isOpen={role !== null}
        onClose={() => setRole(null)}
        role={role}
      />
    </MotionConfig>
  );
}

function sideClass(side: Side) {
  return { artist: s.roleArtist, host: s.roleHost, venue: s.roleVenue }[side];
}

/** A slow, endless roll of the kinds of gig this side books or plays. */
function GigTypes({ side }: { side: Side }) {
  const types = GIG_TYPES[side];
  const items = [...types, ...types];
  return (
    <div className={s.marquee} aria-label={types.join(", ")}>
      <div className={s.marqueeRow} aria-hidden="true">
        {items.map((t, i) => (
          <span key={i} className={s.marqueeItem}>
            {t}
            <span className={s.marqueeStar} />
          </span>
        ))}
      </div>
    </div>
  );
}

function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 30,
    restDelta: 0.001,
  });
  return (
    <motion.div className={s.progress} style={{ scaleX }} aria-hidden="true" />
  );
}

/** Floating "claim" button on phones, hidden over the hero and the sign-up section. */
function MobileCta({ label, onClick }: { label: string; onClick: () => void }) {
  const { scrollY } = useScroll();
  const [visible, setVisible] = useState(false);

  useMotionValueEvent(scrollY, "change", (y) => {
    const join = document.getElementById("join")?.getBoundingClientRect();
    const joinOnScreen = join
      ? join.top < window.innerHeight && join.bottom > 0
      : false;
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
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <button type="button" className={s.btnGrad} onClick={onClick}>
            {label}
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
