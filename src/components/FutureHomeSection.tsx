'use client';

import React from 'react';
import { motion } from 'motion/react';

interface FutureHomeSectionProps {
  AnimatedTitle: React.ComponentType<{ text: string; className?: string }>;
  fUp: any;
  staggerContainer: any;
  scaleIn: any;
  onClaimClick?: () => void;
}

export default function FutureHomeSection({ AnimatedTitle, fUp, staggerContainer, scaleIn, onClaimClick }: FutureHomeSectionProps) {
  return (
    <section id="future-home" className="section" style={{ borderTop: '1px solid var(--line-soft)', position: 'relative', overflow: 'hidden' }}>
      {/* Ambient background glow */}
      <div aria-hidden="true" style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '800px',
        height: '800px',
        background: 'radial-gradient(circle, rgba(124,92,255,0.08) 0%, rgba(242,90,43,0.06) 40%, transparent 70%)',
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
          THE CREATOR REVOLUTION
        </motion.div>

        <motion.h2
          className="section-heading"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fUp}
          style={{ textAlign: 'center', margin: '0 auto 20px auto', maxWidth: '850px' }}
        >
          The Future Home of <AnimatedTitle text="Independent Artists" className="brand-text" />
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
          Where creative identity meets complete financial freedom. ArtisTant is the digital sanctuary built specifically for performers, DJs, musicians, and live artists taking full control of their business.
        </motion.p>

        {/* 4 Pillars Grid matching site card design (2x2 symmetrical layout) */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          variants={staggerContainer}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-[1100px] mx-auto mb-12 mobile-swipe-carousel"
        >
          {/* Pillar 1 — Digital Identity */}
          <motion.div 
            variants={scaleIn} 
            className="what-is-card group relative rounded-3xl border border-[#F25A2B]/30 bg-[#0C0D14]/95 p-7 sm:p-8 flex flex-col justify-between overflow-hidden shadow-2xl transition-all duration-300"
            whileHover={{ scale: 1.02, borderColor: '#F25A2B' }}
            whileTap={{ scale: 0.98 }}
            style={{ cursor: 'pointer' }}
          >
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '160px', background: 'radial-gradient(ellipse at top, rgba(242,90,43,0.18) 0%, transparent 70%)', pointerEvents: 'none' }} />

            <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', height: '100%' }}>
              <div style={{ fontSize: '12px', color: '#F25A2B', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '16px', fontWeight: 600 }}>
                DIGITAL IDENTITY
              </div>
              <h3 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--ink)', marginBottom: '16px', letterSpacing: '-0.02em', textTransform: 'uppercase', lineHeight: '1.1' }}>
                YOUR CREATIVE <span style={{ color: '#F25A2B' }}>SANCTUARY</span>.
              </h3>
              <p className="what-is-card-desc" style={{ fontSize: '14px', color: 'var(--ink-2)', lineHeight: '1.5', marginBottom: '24px' }}>
                One permanent custom link (@username) housing high-definition showreels, audio previews, technical riders, and press kits under one roof.
              </p>

              <ul className="what-is-card-points" style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#F25A2B', marginTop: '6px', flexShrink: 0 }} />
                  <span style={{ fontSize: '13.5px', color: 'var(--ink-2)', lineHeight: '1.5' }}>
                    <strong style={{ color: 'var(--ink)' }}>Centralized Hub:</strong> No scattered PDFs or Drive links.
                  </span>
                </li>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#F25A2B', marginTop: '6px', flexShrink: 0 }} />
                  <span style={{ fontSize: '13.5px', color: 'var(--ink-2)', lineHeight: '1.5' }}>
                    <strong style={{ color: 'var(--ink)' }}>Embedded Media:</strong> Spotify audio previews & YouTube showreels.
                  </span>
                </li>
              </ul>
            </div>
          </motion.div>

          {/* Pillar 2 — Direct Deals */}
          <motion.div 
            variants={scaleIn} 
            className="what-is-card group relative rounded-3xl border border-[#7C5CFF]/30 bg-[#0C0D14]/95 p-7 sm:p-8 flex flex-col justify-between overflow-hidden shadow-2xl transition-all duration-300"
            whileHover={{ scale: 1.02, borderColor: '#7C5CFF' }}
            whileTap={{ scale: 0.98 }}
            style={{ cursor: 'pointer' }}
          >
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '160px', background: 'radial-gradient(ellipse at top, rgba(124,92,255,0.18) 0%, transparent 70%)', pointerEvents: 'none' }} />

            <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', height: '100%' }}>
              <div style={{ fontSize: '12px', color: '#7C5CFF', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '16px', fontWeight: 600 }}>
                DIRECT WORKFLOW
              </div>
              <h3 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--ink)', marginBottom: '16px', letterSpacing: '-0.02em', textTransform: 'uppercase', lineHeight: '1.1' }}>
                AUTONOMOUS <span style={{ color: '#7C5CFF' }}>BOOKINGS</span>.
              </h3>
              <p className="what-is-card-desc" style={{ fontSize: '14px', color: 'var(--ink-2)', lineHeight: '1.5', marginBottom: '24px' }}>
                Bypass agents, broker cuts, and communication filters. Organizers send structured gig offers directly to your inbox.
              </p>

              <ul className="what-is-card-points" style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#7C5CFF', marginTop: '6px', flexShrink: 0 }} />
                  <span style={{ fontSize: '13.5px', color: 'var(--ink-2)', lineHeight: '1.5' }}>
                    <strong style={{ color: 'var(--ink)' }}>Direct Inquiries:</strong> 1-on-1 promoter-to-artist negotiations.
                  </span>
                </li>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#7C5CFF', marginTop: '6px', flexShrink: 0 }} />
                  <span style={{ fontSize: '13.5px', color: 'var(--ink-2)', lineHeight: '1.5' }}>
                    <strong style={{ color: 'var(--ink)' }}>Live Calendar:</strong> Real-time availability checks without messaging.
                  </span>
                </li>
              </ul>
            </div>
          </motion.div>

          {/* Pillar 3 — GigSafe Escrow */}
          <motion.div 
            variants={scaleIn} 
            className="what-is-card group relative rounded-3xl border border-[#D4567A]/30 bg-[#0C0D14]/95 p-7 sm:p-8 flex flex-col justify-between overflow-hidden shadow-2xl transition-all duration-300"
            whileHover={{ scale: 1.02, borderColor: '#D4567A' }}
            whileTap={{ scale: 0.98 }}
            style={{ cursor: 'pointer' }}
          >
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '160px', background: 'radial-gradient(ellipse at top, rgba(212,86,122,0.18) 0%, transparent 70%)', pointerEvents: 'none' }} />

            <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', height: '100%' }}>
              <div style={{ fontSize: '12px', color: '#D4567A', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '16px', fontWeight: 600 }}>
                PAYMENT VAULT
              </div>
              <h3 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--ink)', marginBottom: '16px', letterSpacing: '-0.02em', textTransform: 'uppercase', lineHeight: '1.1' }}>
                GIGSAFE <span style={{ color: '#D4567A' }}>ESCROW</span>.
              </h3>
              <p className="what-is-card-desc" style={{ fontSize: '14px', color: 'var(--ink-2)', lineHeight: '1.5', marginBottom: '24px' }}>
                Performance fees are locked safely in escrow before showtime and auto-released post-gig (T+1). Zero payment delays.
              </p>

              <ul className="what-is-card-points" style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#D4567A', marginTop: '6px', flexShrink: 0 }} />
                  <span style={{ fontSize: '13.5px', color: 'var(--ink-2)', lineHeight: '1.5' }}>
                    <strong style={{ color: 'var(--ink)' }}>T+1 Payouts:</strong> Automated release post-show.
                  </span>
                </li>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#D4567A', marginTop: '6px', flexShrink: 0 }} />
                  <span style={{ fontSize: '13.5px', color: 'var(--ink-2)', lineHeight: '1.5' }}>
                    <strong style={{ color: 'var(--ink)' }}>0% Fee:</strong> Lifetime 0% platform fee for Founding Artists.
                  </span>
                </li>
              </ul>
            </div>
          </motion.div>

          {/* Pillar 4 — Reputation */}
          <motion.div 
            variants={scaleIn} 
            className="what-is-card group relative rounded-3xl border border-[#10B981]/30 bg-[#0C0D14]/95 p-7 sm:p-8 flex flex-col justify-between overflow-hidden shadow-2xl transition-all duration-300"
            whileHover={{ scale: 1.02, borderColor: '#10B981' }}
            whileTap={{ scale: 0.98 }}
            style={{ cursor: 'pointer' }}
          >
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '160px', background: 'radial-gradient(ellipse at top, rgba(16,185,129,0.18) 0%, transparent 70%)', pointerEvents: 'none' }} />

            <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', height: '100%' }}>
              <div style={{ fontSize: '12px', color: '#10B981', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '16px', fontWeight: 600 }}>
                REPUTATION
              </div>
              <h3 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--ink)', marginBottom: '16px', letterSpacing: '-0.02em', textTransform: 'uppercase', lineHeight: '1.1' }}>
                BOOKABILITY <span style={{ color: '#10B981' }}>SCORE™</span>.
              </h3>
              <p className="what-is-card-desc" style={{ fontSize: '14px', color: 'var(--ink-2)', lineHeight: '1.5', marginBottom: '24px' }}>
                Build an immutable, verified track record with Bookability Score™. Showcase organizer reviews backed by real transactions.
              </p>

              <ul className="what-is-card-points" style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981', marginTop: '6px', flexShrink: 0 }} />
                  <span style={{ fontSize: '13.5px', color: 'var(--ink-2)', lineHeight: '1.5' }}>
                    <strong style={{ color: 'var(--ink)' }}>Verified Reviews:</strong> Only escrow-verified promoters can review.
                  </span>
                </li>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981', marginTop: '6px', flexShrink: 0 }} />
                  <span style={{ fontSize: '13.5px', color: 'var(--ink-2)', lineHeight: '1.5' }}>
                    <strong style={{ color: 'var(--ink)' }}>Rank Boost:</strong> High scores increase search placement.
                  </span>
                </li>
              </ul>
            </div>
          </motion.div>
        </motion.div>

        {/* CTA Button matching primary site buttons */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <button
            onClick={onClaimClick}
            className="btn-primary"
            style={{
              padding: '16px 36px',
              fontSize: '14px',
              fontWeight: '700',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              borderRadius: '9999px',
              cursor: 'pointer',
            }}
          >
            Claim Your Place in the Future Home
          </button>
        </div>
      </div>
    </section>
  );
}
