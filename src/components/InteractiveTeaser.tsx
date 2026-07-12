'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTheme } from 'next-themes';

type Scenario = {
  id: string;
  chaosTitle: string;
  cureTitle: string;
  chaos: { align: 'left' | 'right'; text: string; }[];
  cureNode: (isDark: boolean) => React.ReactNode;
  cureMockup?: string;
  mockupPos?: string;
};

const SCENARIOS: Scenario[] = [
  {
    id: 'escrow',
    chaosTitle: 'THE WHATSAPP GUESSING GAME',
    cureTitle: 'ARTISTANT GIGSAFE ESCROW™',
    chaos: [
      { align: 'right', text: 'Hey, the gig was 3 weeks ago... any update on payment?' },
      { align: 'left', text: 'Waiting on the client to release funds bro. Will let you know.' },
      { align: 'right', text: 'I need it today, my rent is due! Come on man 😩' }
    ],
    cureNode: (isDark: boolean) => (
      <div style={{ width: '100%', height: '100%', background: isDark ? '#09090B' : '#ffffff', display: 'flex', flexDirection: 'column', padding: '14px 16px', fontSize: '12px', overflow: 'hidden', position: 'relative', zIndex: 10 }}>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', flex: 1 }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: '#F25A2B', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
            </div>
            <div style={{ flex: 1, color: isDark ? '#9CA3AF' : '#52525B', lineHeight: '1.3' }}>
              Client pays into Gigsafe<br/>escrow
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', color: isDark ? '#fff' : '#121212', fontWeight: 'bold' }}>
              ₹2,50,000
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: '#F25A2B', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
            </div>
            <div style={{ flex: 1, color: isDark ? '#9CA3AF' : '#52525B' }}>
              Show happens
            </div>
            <div style={{ color: isDark ? '#6B7280' : '#a1a1aa' }}>
              held
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '18px', height: '18px', borderRadius: '50%', border: isDark ? '1px solid #4B5563' : '1px solid #e4e4e7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: isDark ? '#9CA3AF' : '#71717a', fontSize: '9px', flexShrink: 0 }}>
              3
            </div>
            <div style={{ flex: 1, color: '#F25A2B', fontWeight: 'bold' }}>
              Artist paid · T+1
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', color: '#F25A2B', fontWeight: 'bold' }}>
              ₹2,25,000
            </div>
          </div>
        </div>

        <div style={{ border: isDark ? '1px solid rgba(242, 90, 43, 0.2)' : '1px solid rgba(242, 90, 43, 0.15)', background: isDark ? 'rgba(242, 90, 43, 0.05)' : 'rgba(242, 90, 43, 0.02)', borderRadius: '8px', padding: '10px', display: 'flex', gap: '8px', alignItems: 'flex-start', marginTop: 'auto' }}>
          <div style={{ color: '#3B82F6', marginTop: '1px' }}>
            <svg width="12" height="14" viewBox="0 0 24 24" fill="#3B82F6"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="url(#blue-grad)"></path><defs><linearGradient id="blue-grad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#60A5FA" /><stop offset="100%" stopColor="#2563EB" /></linearGradient></defs></svg>
          </div>
          <div style={{ fontSize: '11px', lineHeight: '1.4' }}>
            <span style={{ color: '#F25A2B', fontWeight: 'bold' }}>Protection on by default. </span>
            <span style={{ color: isDark ? '#9CA3AF' : '#52525B' }}>Free replacement if the artist cancels.</span>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'booking',
    chaosTitle: 'THE DM SCRAMBLE',
    cureTitle: 'ARTISTANT DIRECT BOOKING (CHAT REDACTION)',
    chaos: [
      { align: 'left', text: 'Hey, love your work! How much do you charge for a 2hr set?' },
      { align: 'right', text: 'Usually 50k. What is the venue?' },
      { align: 'left', text: 'Can you send your tech rider to this email?' }
    ],
    cureNode: (isDark: boolean) => (
      <div style={{ width: '100%', height: '100%', background: isDark ? '#0F0F0F' : '#ffffff', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', overflow: 'hidden', position: 'relative', zIndex: 10 }}>
        
        {/* Top Message */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <span style={{ color: isDark ? '#666' : '#a1a1aa', fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '0.05em' }}>DJ MANIK · 14:02</span>
          <div style={{ background: isDark ? '#1C1C1C' : '#f4f4f5', padding: '10px 14px', borderRadius: '12px 12px 12px 2px', fontSize: '11px', color: isDark ? '#ccc' : '#18181b', lineHeight: '1.5', alignSelf: 'flex-start', maxWidth: '90%' }}>
            Locked. Easiest to just WhatsApp me on <span style={{ display: 'inline-block', background: '#E5FF00', width: '60px', height: '12px', verticalAlign: 'middle', margin: '0 2px' }}></span> or ig @late.set.
          </div>
        </div>

        {/* Bottom Message */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-end' }}>
          <span style={{ color: isDark ? '#666' : '#a1a1aa', fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '0.05em' }}>YOU · 14:03</span>
          <div style={{ background: isDark ? '#202306' : '#fcfde2', padding: '10px 14px', borderRadius: '12px 12px 2px 12px', fontSize: '11px', color: isDark ? '#E0E7A1' : '#717A22', lineHeight: '1.5', alignSelf: 'flex-end', maxWidth: '90%', border: isDark ? '1px solid rgba(229, 255, 0, 0.1)' : '1px solid rgba(229, 255, 0, 0.3)' }}>
            Let's keep it here so the booking's covered — mailing <span style={{ display: 'inline-block', background: '#E5FF00', width: '80px', height: '12px', verticalAlign: 'middle', margin: '0 2px' }}></span>?
          </div>
        </div>

        {/* Footer Note */}
        <div style={{ marginTop: 'auto', border: isDark ? '1px dashed rgba(255,255,255,0.15)' : '1px dashed rgba(0,0,0,0.1)', borderRadius: '6px', padding: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: '4px', height: '4px', background: '#E5FF00', borderRadius: '50%' }}></div>
          <span style={{ color: isDark ? '#888' : '#71717a', fontFamily: 'var(--font-mono)', fontSize: '8px', letterSpacing: '0.05em' }}>2 phones · 1 handle · 1 email · redacted at the db trigger</span>
        </div>
      </div>
    )
  },
  {
    id: 'tech',
    chaosTitle: 'THE VENUE SURPRISE',
    cureTitle: 'SMART TECH RIDERS',
    chaos: [
      { align: 'right', text: 'Wait, what do you mean you don\'t have Pioneer CDJ-3000s?!' },
      { align: 'left', text: 'We only have old controllers. I didn\'t see your email.' },
      { align: 'right', text: 'I literally can\'t play my set on these. This is a disaster.' }
    ],
    cureNode: (isDark: boolean) => (
      <div style={{ width: '100%', height: '100%', background: isDark ? '#09090B' : '#ffffff', display: 'flex', flexDirection: 'column', padding: '20px 24px', overflow: 'hidden', position: 'relative', zIndex: 10, fontFamily: 'var(--font-sans)' }}>
        
        {/* Header */}
        <div style={{ marginBottom: '16px' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', color: isDark ? '#fff' : '#121212', margin: 0, fontWeight: '500', letterSpacing: '0.02em' }}>
            Tech rider
          </h3>
          <p style={{ color: isDark ? '#9CA3AF' : '#52525B', fontSize: '11px', margin: '4px 0 0 0' }}>
            What you'll need from the venue. Pick all that apply.
          </p>
        </div>

        {/* Pills */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          
          {/* Active Pill 1 */}
          <div style={{ background: 'linear-gradient(135deg, #F25A2B, #D4567A)', color: '#fff', padding: '6px 12px', borderRadius: '100px', fontSize: '11px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 4px 12px rgba(242, 90, 43, 0.25)' }}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
            4 vocal mics
          </div>

          {/* Unselected Pill 1 */}
          <div style={{ background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)', color: isDark ? '#D1D5DB' : '#3f3f46', border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.08)', padding: '5px 11px', borderRadius: '100px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
            <span style={{ color: isDark ? '#6B7280' : '#a1a1aa' }}>+</span> 2 wedge monitors
          </div>

          {/* Active Pill 2 */}
          <div style={{ background: 'linear-gradient(135deg, #F25A2B, #D4567A)', color: '#fff', padding: '6px 12px', borderRadius: '100px', fontSize: '11px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 4px 12px rgba(242, 90, 43, 0.25)' }}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
            1 DI box
          </div>

          {/* Unselected Pill 2 */}
          <div style={{ background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)', color: isDark ? '#D1D5DB' : '#3f3f46', border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.08)', padding: '5px 11px', borderRadius: '100px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
            <span style={{ color: isDark ? '#6B7280' : '#a1a1aa' }}>+</span> Drum kit (5pc)
          </div>

          {/* Unselected Pill 3 */}
          <div style={{ background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)', color: isDark ? '#D1D5DB' : '#3f3f46', border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.08)', padding: '5px 11px', borderRadius: '100px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
            <span style={{ color: isDark ? '#6B7280' : '#a1a1aa' }}>+</span> Mixing console (8ch+)
          </div>

          {/* Unselected Pill 4 */}
          <div style={{ background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)', color: isDark ? '#D1D5DB' : '#3f3f46', border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.08)', padding: '5px 11px', borderRadius: '100px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
            <span style={{ color: isDark ? '#6B7280' : '#a1a1aa' }}>+</span> Stage lights × 4
          </div>

          {/* Unselected Pill 5 */}
          <div style={{ background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)', color: isDark ? '#D1D5DB' : '#3f3f46', border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.08)', padding: '5px 11px', borderRadius: '100px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
            <span style={{ color: isDark ? '#6B7280' : '#a1a1aa' }}>+</span> Power: 16A × 2
          </div>

        </div>
      </div>
    )
  },
  {
    id: 'score',
    chaosTitle: 'THE FOLLOWER TRAP',
    cureTitle: 'THE BOOKABILITY SCORE™',
    chaos: [
      { align: 'right', text: 'Why did we lose that corporate gig? We were perfect for it.' },
      { align: 'left', text: 'They went with someone who has 100k Instagram followers.' },
      { align: 'right', text: 'But they cancel half their shows! We are always professional.' }
    ],
    cureNode: (isDark: boolean) => (
      <div style={{ width: '100%', height: '100%', background: isDark ? '#09090B' : '#ffffff', color: isDark ? '#fff' : '#121212', display: 'flex', flexDirection: 'column', padding: '16px', fontSize: '11px', overflow: 'hidden', position: 'relative', zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
          <div style={{ position: 'relative', width: '40px', height: '40px', borderRadius: '50%', border: isDark ? '3px solid #333' : '3px solid #e4e4e7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg style={{ position: 'absolute', top: '-3px', left: '-3px', width: '40px', height: '40px', transform: 'rotate(-90deg)' }} viewBox="0 0 40 40">
              <circle cx="20" cy="20" r="18.5" fill="none" stroke={isDark ? '#34D399' : '#059669'} strokeWidth="3" strokeDasharray="116" strokeDashoffset="20" strokeLinecap="round" />
            </svg>
            <span style={{ fontWeight: 'bold', fontSize: '14px' }}>82</span>
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: '500' }}>Bookability Score</div>
            <div style={{ color: isDark ? '#34D399' : '#059669', fontSize: '9px', fontWeight: 'bold', letterSpacing: '0.05em' }}>TRUSTED</div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {[
            { label: 'Gigs played', val: '37', sub: 'on Artistant' },
            { label: 'Shows up', val: '96%', sub: 'of confirmed shows' },
            { label: 'Reviews', val: '5.0', sub: 'across 1 review' },
            { label: 'Replies', val: '~4h', sub: 'typical response' },
            { label: 'Cancellations', val: '4%', sub: 'of bookings, last 12 months' },
          ].map((row, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: i === 4 ? 'none' : (isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.05)'), paddingBottom: i === 4 ? 0 : '6px' }}>
              <span style={{ color: isDark ? '#ddd' : '#3f3f46' }}>{row.label}</span>
              <span style={{ textAlign: 'right' }}>
                <span style={{ fontWeight: 'bold', color: isDark ? '#fff' : '#121212', marginRight: '4px' }}>{row.val}</span>
                <span style={{ color: isDark ? '#666' : '#a1a1aa' }}>{row.sub}</span>
              </span>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 'auto', color: isDark ? '#555' : '#71717a', fontSize: '8px', lineHeight: '1.4' }}>
          Computed from completed bookings, verified reviews, and chat response times on Artistant.
        </div>
      </div>
    )
  }
];

export default function InteractiveTeaser() {
  const [scenarioIdx, setScenarioIdx] = useState(0);
  const [phase, setPhase] = useState<'chaos' | 'cure'>('chaos');
  const [mounted, setMounted] = useState(false);
  const [isMobileState, setIsMobileState] = useState(false);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
    const handleResize = () => {
      setIsMobileState(window.innerWidth < 640);
    };
    handleResize();
    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isDark = mounted ? resolvedTheme === 'dark' : false;
  const isMobile = mounted ? isMobileState : false;

  useEffect(() => {
    let phaseTimeout: NodeJS.Timeout;
    
    const runCycle = () => {
      setPhase('chaos');
      phaseTimeout = setTimeout(() => {
        setPhase('cure');
        phaseTimeout = setTimeout(() => {
          setScenarioIdx((prev) => (prev + 1) % SCENARIOS.length);
          runCycle();
        }, 5000);
      }, 5000);
    };

    runCycle();
    return () => clearTimeout(phaseTimeout);
  }, []);

  const scenario = SCENARIOS[scenarioIdx];

  return (
    <div style={{
      width: '100%',
      maxWidth: '600px',
      margin: '0',
      height: isMobile ? '340px' : '380px',
      borderRadius: '24px',
      overflow: 'hidden',
      position: 'relative',
      background: "var(--bg-card)",
      border: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.05)',
      boxShadow: isDark ? '0 20px 40px rgba(0,0,0,0.6)' : '0 20px 40px rgba(0,0,0,0.05)',
      zIndex: 10
    }}>
      <AnimatePresence mode="wait">
        {phase === 'chaos' ? (
          <motion.div
            key={`chaos-${scenario.id}`}
            initial={{ opacity: 0, filter: 'blur(10px)' }}
            animate={{ opacity: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, filter: 'blur(10px)' }}
            transition={{ duration: 0.6 }}
            style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, padding: isMobile ? '20px 16px' : '32px 24px', display: 'flex', flexDirection: 'column', gap: isMobile ? '10px' : '16px', background: isDark ? 'linear-gradient(to bottom, #1a0f0f, #050505)' : '#efeae2' }}
          >
            <div style={{ position: 'absolute', inset: 0, background: isDark ? 'radial-gradient(circle at center, rgba(255,90,95,0.08) 0%, transparent 70%)' : 'radial-gradient(circle at center, rgba(255,90,95,0.03) 0%, transparent 70%)', pointerEvents: 'none' }} />
            
            {scenario.chaos.map((msg, i) => (
              <motion.div 
                key={i}
                initial={{ y: 20, opacity: 0 }} 
                animate={{ y: 0, opacity: 1 }} 
                transition={{ delay: 0.2 + (i * 1.2) }} 
                style={{ 
                  alignSelf: msg.align === 'right' ? 'flex-end' : 'flex-start', 
                  background: msg.align === 'right' ? (isDark ? '#005c4b' : '#d9fdd3') : (isDark ? '#202C33' : '#ffffff'), 
                  padding: isMobile ? '10px 14px' : '14px 18px', 
                  borderRadius: msg.align === 'right' ? '18px 18px 0 18px' : '18px 18px 18px 0', 
                  color: isDark ? '#fff' : '#111b21', 
                  fontSize: isMobile ? '13px' : '14px', 
                  lineHeight: '1.4',
                  maxWidth: '85%', 
                  boxShadow: isDark ? '0 4px 12px rgba(0,0,0,0.3)' : '0 4px 12px rgba(0,0,0,0.03)' 
                }}
              >
                {msg.text}
              </motion.div>
            ))}

            <motion.div
              animate={{ opacity: [0.3, 0.8, 0.3] }}
              transition={{ repeat: Infinity, duration: 2 }}
              style={{ position: 'absolute', bottom: '24px', left: 0, right: 0, textAlign: 'center', color: isDark ? '#FF5A5F' : '#dc2626', fontFamily: 'var(--font-mono)', fontSize: '13px', fontWeight: 'bold', letterSpacing: '0.15em' }}
            >
              {scenario.chaosTitle}
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key={`cure-${scenario.id}`}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, padding: isMobile ? '16px' : '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: isDark ? 'linear-gradient(to bottom, #0A1118, #050505)' : 'linear-gradient(to bottom, #f4f4f5, #ffffff)' }}
          >
            <div style={{ position: 'absolute', inset: 0, background: isDark ? 'radial-gradient(circle at center, rgba(124, 92, 255, 0.1) 0%, transparent 60%)' : 'radial-gradient(circle at center, rgba(124, 92, 255, 0.05) 0%, transparent 60%)', pointerEvents: 'none' }} />
            
            {/* Real Mockup Snippet */}
            <div style={{ 
              width: '100%', 
              maxWidth: '460px', 
              height: isMobile ? '150px' : '180px',
              borderRadius: '20px', 
              boxShadow: isDark ? '0 24px 50px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05), 0 0 0 1px rgba(124, 92, 255, 0.15)' : '0 24px 50px rgba(0,0,0,0.05), 0 0 0 1px rgba(124, 92, 255, 0.08)', 
              position: 'relative', 
              zIndex: 5,
              overflow: 'hidden',
              ...(scenario.cureMockup ? {
                backgroundImage: `url(${scenario.cureMockup})`,
                backgroundSize: 'cover',
                backgroundPosition: scenario.mockupPos,
                backgroundRepeat: 'no-repeat'
              } : { background: "var(--bg-card)" })
            }}>
              {scenario.cureNode && scenario.cureNode(isDark)}

              {/* Scanline overlay for premium feel */}
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(255,255,255,0.02) 50%, rgba(255,255,255,0) 100%)', backgroundSize: '100% 4px', pointerEvents: 'none', zIndex: 20 }} />
              
              {/* Inner subtle shadow for depth */}
              <div style={{ position: 'absolute', inset: 0, boxShadow: isDark ? 'inset 0 0 20px rgba(0,0,0,0.5)' : 'none', pointerEvents: 'none', zIndex: 20 }} />

              {/* Gradient fade at top and bottom to prevent abrupt cutoffs */}
              {scenario.cureMockup && (
                <div style={{ position: 'absolute', inset: 0, background: isDark ? 'linear-gradient(to bottom, #0A1118 0%, transparent 20%, transparent 80%, #050505 100%)' : 'linear-gradient(to bottom, #f4f4f5 0%, transparent 20%, transparent 80%, #ffffff 100%)', pointerEvents: 'none', zIndex: 21 }} />
              )}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.5 }}
              style={{ marginTop: '28px', textAlign: 'center', color: isDark ? '#7C5CFF' : '#5850ec', fontFamily: 'var(--font-mono)', fontSize: '13px', fontWeight: 'bold', letterSpacing: '0.15em', textShadow: isDark ? '0 0 10px rgba(124, 92, 255, 0.5)' : 'none' }}
            >
              {scenario.cureTitle}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
