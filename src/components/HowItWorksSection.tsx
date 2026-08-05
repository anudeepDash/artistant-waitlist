'use client';

import React from 'react';
import { motion } from 'motion/react';

interface HowItWorksSectionProps {
  AnimatedTitle: React.ComponentType<{ text: string; className?: string }>;
  fUp: any;
  staggerContainer: any;
  scaleIn: any;
}

export default function HowItWorksSection({ AnimatedTitle, fUp, staggerContainer, scaleIn }: HowItWorksSectionProps) {
  return (
    <section id="how-it-works" className="section" style={{ borderTop: '1px solid var(--line-soft)', position: 'relative', overflow: 'hidden' }}>
      {/* Ambient background glow matching site standard */}
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
          3 Simple Steps
        </motion.div>

        <motion.h2
          className="section-heading"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fUp}
          style={{ textAlign: 'center', margin: '0 auto 20px auto', maxWidth: '850px' }}
        >
          How <AnimatedTitle text="ArtisTant Works" className="brand-text" />
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
          No messy WhatsApp chats, no delayed payments, and no high agency commissions. Here is how ArtisTant powers your live performance business in 3 simple steps.
        </motion.p>

        {/* Three Value Pillars matching What is Artistant Grid */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          variants={staggerContainer}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-[1100px] mx-auto mobile-swipe-carousel"
        >
          {/* Step 1 — Identity */}
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
                STEP 01 — IDENTITY
              </div>
              <h3 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--ink)', marginBottom: '16px', letterSpacing: '-0.02em', textTransform: 'uppercase', lineHeight: '1.1' }}>
                RESERVE YOUR <span style={{ color: '#F25A2B' }}>HANDLE</span>.
              </h3>
              <p className="what-is-card-desc" style={{ fontSize: '14px', color: 'var(--ink-2)', lineHeight: '1.5', marginBottom: '20px' }}>
                Secure your unique performance handle before another artist locks it. Lock in 100 base Founding Points instantly.
              </p>
              <ul className="what-is-card-points">
                <li className="what-is-card-point">
                  <span className="what-is-card-point-bullet" style={{ background: '#F25A2B' }} />
                  <span style={{ fontSize: '13.5px', color: 'var(--ink-2)' }}><strong style={{ color: 'var(--ink)' }}>Digital Real Estate:</strong> Own your permanent link (artistant.in/yourname).</span>
                </li>
                <li className="what-is-card-point">
                  <span className="what-is-card-point-bullet" style={{ background: '#F25A2B' }} />
                  <span style={{ fontSize: '13.5px', color: 'var(--ink-2)' }}><strong style={{ color: 'var(--ink)' }}>Founding Points:</strong> Unlock 100 PTS towards Cohort 001 priority access.</span>
                </li>
                <li className="what-is-card-point">
                  <span className="what-is-card-point-bullet" style={{ background: '#F25A2B' }} />
                  <span style={{ fontSize: '13.5px', color: 'var(--ink-2)' }}><strong style={{ color: 'var(--ink)' }}>Zero Cost:</strong> Free registration with instant handle lock.</span>
                </li>
              </ul>
            </div>
          </motion.div>

          {/* Step 2 — Portfolio */}
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
                STEP 02 — PORTFOLIO
              </div>
              <h3 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--ink)', marginBottom: '16px', letterSpacing: '-0.02em', textTransform: 'uppercase', lineHeight: '1.1' }}>
                BUILD YOUR <span style={{ color: '#7C5CFF' }}>BOOKING HUB</span>.
              </h3>
              <p className="what-is-card-desc" style={{ fontSize: '14px', color: 'var(--ink-2)', lineHeight: '1.5', marginBottom: '20px' }}>
                Consolidate press kits, audio previews, YouTube showreels, tech riders, and live calendar availability into one link.
              </p>
              <ul className="what-is-card-points">
                <li className="what-is-card-point">
                  <span className="what-is-card-point-bullet" style={{ background: '#7C5CFF' }} />
                  <span style={{ fontSize: '13.5px', color: 'var(--ink-2)' }}><strong style={{ color: 'var(--ink)' }}>Media Showreels:</strong> Showcase HD performance videos & Spotify releases.</span>
                </li>
                <li className="what-is-card-point">
                  <span className="what-is-card-point-bullet" style={{ background: '#7C5CFF' }} />
                  <span style={{ fontSize: '13.5px', color: 'var(--ink-2)' }}><strong style={{ color: 'var(--ink)' }}>Live Availability:</strong> Real-time calendar sync eliminates back-and-forth checks.</span>
                </li>
                <li className="what-is-card-point">
                  <span className="what-is-card-point-bullet" style={{ background: '#7C5CFF' }} />
                  <span style={{ fontSize: '13.5px', color: 'var(--ink-2)' }}><strong style={{ color: 'var(--ink)' }}>Custom Themes:</strong> Personalize cover banner and portfolio theme layout.</span>
                </li>
              </ul>
            </div>
          </motion.div>

          {/* Step 3 — Earnings */}
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
                STEP 03 — EARNINGS
              </div>
              <h3 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--ink)', marginBottom: '16px', letterSpacing: '-0.02em', textTransform: 'uppercase', lineHeight: '1.1' }}>
                DIRECT GIGS & <span style={{ color: '#D4567A' }}>0% FEE</span>.
              </h3>
              <p className="what-is-card-desc" style={{ fontSize: '14px', color: 'var(--ink-2)', lineHeight: '1.5', marginBottom: '20px' }}>
                Event organizers send formal gig offers directly. Sign automated contracts and get paid post-show with zero broker cuts.
              </p>
              <ul className="what-is-card-points">
                <li className="what-is-card-point">
                  <span className="what-is-card-point-bullet" style={{ background: '#D4567A' }} />
                  <span style={{ fontSize: '13.5px', color: 'var(--ink-2)' }}><strong style={{ color: 'var(--ink)' }}>Direct Inquiries:</strong> Receive offers straight from venue managers & event planners.</span>
                </li>
                <li className="what-is-card-point">
                  <span className="what-is-card-point-bullet" style={{ background: '#D4567A' }} />
                  <span style={{ fontSize: '13.5px', color: 'var(--ink-2)' }}><strong style={{ color: 'var(--ink)' }}>GigSafe Escrow:</strong> Automated T+1 post-show payouts with zero payment delay games.</span>
                </li>
                <li className="what-is-card-point">
                  <span className="what-is-card-point-bullet" style={{ background: '#D4567A' }} />
                  <span style={{ fontSize: '13.5px', color: 'var(--ink-2)' }}><strong style={{ color: 'var(--ink)' }}>100% Retained:</strong> Keep 100% of your performance fees without platform cuts.</span>
                </li>
              </ul>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
