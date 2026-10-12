"use client";

import React from "react";
import {
  motion,
  useReducedMotion,
  useSpring,
  useTransform,
} from "motion/react";
import type { UsernameClaim } from "@/hooks/useUsernameClaim";
import type { WaitlistEntry } from "@/lib/waitlist";
import ClaimForm from "./ClaimForm";
import { EASE, Reveal } from "./primitives";
import s from "./pass.module.css";
import base from "./home.module.css";

const PERKS = [
  {
    n: "01",
    title: "Founding Artist badge",
    text: "On your booking page for good. Proof you were here first.",
  },
  {
    n: "02",
    title: "First in line for gigs",
    text: "You go live before everyone else when bookings open in your city.",
  },
  {
    n: "03",
    title: "Set up with a real person",
    text: "Our team helps you build your page and price your shows.",
  },
];

interface PassProps {
  claim: UsernameClaim;
  reservation: WaitlistEntry | null;
  onClaimSubmit: () => void;
}

export default function BackstagePass({
  claim,
  reservation,
  onClaimSubmit,
}: PassProps) {
  const reduce = useReducedMotion();
  const name = reservation?.username ?? (claim.username || "yourname");

  // The pass swings on its lanyard towards the pointer.
  const swing = useSpring(0, { stiffness: 90, damping: 9 });
  const sheen = useSpring(50, { stiffness: 80, damping: 20 });
  const sheenPos = useTransform(sheen, (v) => `${v}% 50%`);

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (reduce) return;
    const r = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    swing.set((px - 0.5) * 14);
    sheen.set(px * 100);
  };

  return (
    <section className={s.section} aria-labelledby="pass-title">
      <div className={`${base.container} ${s.grid}`}>
        <div className={s.copy}>
          <Reveal>
            <span className={base.label}>Your backstage pass</span>
          </Reveal>
          <Reveal delay={0.05}>
            <h2 id="pass-title" className={base.title}>
              Claim your name. <em>Skip the queue.</em>
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className={base.lead}>
              Grab artistant.in/yourname today. It&apos;s free, it&apos;s yours,
              and it puts you in line for the founding 140.
            </p>
          </Reveal>

          <ul className={s.perks}>
            {PERKS.map((p, i) => (
              <Reveal
                as="li"
                key={p.n}
                className={s.perk}
                delay={0.12 + i * 0.06}
              >
                <span className={s.perkNum}>{p.n}</span>
                <span>
                  <b>{p.title}</b>
                  <span>{p.text}</span>
                </span>
              </Reveal>
            ))}
          </ul>

          <Reveal delay={0.2}>
            <ClaimForm
              claim={claim}
              inputId="username-pass-input"
              reservation={reservation}
              onSubmit={onClaimSubmit}
              className={s.claim}
            />
          </Reveal>
        </div>

        <div
          className={s.stage}
          onPointerMove={onMove}
          onPointerLeave={() => swing.set(0)}
        >
          <motion.div
            className={s.hanger}
            initial={{ y: -260, rotate: -12 }}
            whileInView={{ y: 0, rotate: 0 }}
            viewport={{ once: true, margin: "0px 0px -20% 0px" }}
            transition={{
              type: "spring",
              stiffness: 70,
              damping: 9,
              mass: 1.2,
            }}
          >
            <motion.div
              className={s.swing}
              style={reduce ? undefined : { rotate: swing }}
            >
              <div className={s.strap} aria-hidden="true">
                <span>
                  ALL ACCESS · FOUNDING ARTIST · ALL ACCESS · FOUNDING ARTIST ·
                </span>
              </div>
              <div className={s.clip} aria-hidden="true" />

              <div
                className={s.pass}
                role="img"
                aria-label={`Backstage pass for @${name}, founding artist`}
              >
                <motion.div
                  className={s.sheen}
                  style={{ backgroundPosition: sheenPos }}
                  aria-hidden="true"
                />
                <div className={s.slot} aria-hidden="true" />
                <div className={s.passTop}>
                  <span>Backstage</span>
                  <span>All access</span>
                </div>
                <img src="/brand/wordmark.svg" alt="" className={s.passBrand} />
                <div className={s.passName}>@{name}</div>
                <div className={s.passRole}>Founding artist</div>
                <dl className={s.passGrid}>
                  <div>
                    <dt>City</dt>
                    <dd>Bengaluru</dd>
                  </div>
                  <div>
                    <dt>Line-up</dt>
                    <dd>1 of 140</dd>
                  </div>
                  <div>
                    <dt>Valid</dt>
                    <dd>Every stage</dd>
                  </div>
                </dl>
                <div className={s.passFoot}>
                  <span className={s.barcode} />
                  <span className={s.passUrl}>artistant.in/{name}</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
          <motion.span
            className={s.stageHint}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 1.2, duration: 0.8, ease: EASE }}
          >
            Your name updates live as you type
          </motion.span>
        </div>
      </div>
    </section>
  );
}
