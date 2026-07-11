'use client';

import { useState, useEffect, useCallback, type FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface RoleWaitlistModalProps {
  isOpen: boolean;
  onClose: () => void;
  role: 'organizer' | 'attendee' | null;
}

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

const cardVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { type: 'spring' as const, damping: 25, stiffness: 300 },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: { duration: 0.15 },
  },
};

const stepVariants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.25 } },
  exit: { opacity: 0, x: -20, transition: { duration: 0.15 } },
};

export default function RoleWaitlistModal({ isOpen, onClose, role }: RoleWaitlistModalProps) {
  const [email, setEmail] = useState('');
  const [extraInfo, setExtraInfo] = useState('');
  const [city, setCity] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setEmail('');
      setExtraInfo('');
      setCity('');
      setIsSubmitted(false);
      setLoading(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleSubmit = useCallback((e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setIsSubmitted(true);
    }, 1000);
  }, []);

  if (!role) return null;

  const isOrg = role === 'organizer';

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="role-overlay"
          className="modal-overlay fixed inset-0 z-[100] flex items-center justify-center"
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={onClose}
          aria-modal="true"
          role="dialog"
          style={{ background: 'rgba(5, 7, 10, 0.85)', backdropFilter: 'blur(8px)' }}
        >
          <motion.div
            key="role-card"
            className="glass-card relative max-w-md w-full mx-4 p-5 sm:p-8"
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'rgba(14, 21, 36, 0.95)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '24px',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)'
            }}
          >
            {/* Close button */}
            <button
              type="button"
              onClick={onClose}
              className="absolute top-5 right-5 text-gray-400 hover:text-white transition-colors"
              aria-label="Close modal"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 0 1 1.414 0L10 8.586l4.293-4.293a1 1 0 1 1 1.414 1.414L11.414 10l4.293 4.293a1 1 0 0 1-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 0 1-1.414-1.414L8.586 10 4.293 5.707a1 1 0 0 1 0-1.414z" clipRule="evenodd" />
              </svg>
            </button>

            <AnimatePresence mode="wait">
              {!isSubmitted ? (
                <motion.div
                  key="form-step"
                  variants={stepVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                >
                  <h2 className="font-display text-2xl font-bold text-center mb-1 text-white">
                    Join as <span className="brand-text" style={{ color: isOrg ? 'var(--brand-2)' : 'var(--brand-3)' }}>
                      {isOrg ? 'Event Host' : 'Show Attendee'}
                    </span>
                  </h2>
                  <p className="text-sm text-center mb-6" style={{ color: 'var(--ink-2)' }}>
                    {isOrg 
                      ? 'Promote events and book premier performers seamlessly' 
                      : 'Request live songs, tip directly, and buy tickets straight from the artist'}
                  </p>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-mono uppercase tracking-wider mb-2" style={{ color: 'var(--ink-2)' }}>Email Address</label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="yourname@domain.com"
                        className="input-field w-full px-4 py-3 text-sm rounded-xl text-white bg-black/30 border border-white/10 focus:border-white/20 outline-none transition-all"
                        style={{ fontFamily: 'var(--font-mono)' }}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono uppercase tracking-wider mb-2" style={{ color: 'var(--ink-2)' }}>
                        {isOrg ? 'Company / Venue Name' : 'Favorite Genres'}
                      </label>
                      <input
                        type="text"
                        value={extraInfo}
                        onChange={(e) => setExtraInfo(e.target.value)}
                        placeholder={isOrg ? 'e.g. Social, BLR' : 'e.g. Techno, Indie Rock, Hip-hop'}
                        className="input-field w-full px-4 py-3 text-sm rounded-xl text-white bg-black/30 border border-white/10 focus:border-white/20 outline-none transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono uppercase tracking-wider mb-2" style={{ color: 'var(--ink-2)' }}>City Location</label>
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="e.g. Bengaluru"
                        className="input-field w-full px-4 py-3 text-sm rounded-xl text-white bg-black/30 border border-white/10 focus:border-white/20 outline-none transition-all"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3.5 rounded-xl font-semibold text-sm text-white transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{
                        background: isOrg 
                          ? 'linear-gradient(135deg, #7C5CFF, #D4567A)' 
                          : 'linear-gradient(135deg, #D4567A, #F25A2B)',
                        boxShadow: isOrg 
                          ? '0 8px 24px rgba(124, 92, 255, 0.2)' 
                          : '0 8px 24px rgba(212, 86, 122, 0.2)'
                      }}
                    >
                      {loading ? (
                        <span className="flex items-center justify-center gap-2">
                          <span className="animate-spin h-4 w-4 border-2 border-white/40 border-t-white rounded-full" />
                          Adding to list…
                        </span>
                      ) : (
                        'Get Early Access Pass'
                      )}
                    </button>
                  </form>
                </motion.div>
              ) : (
                <motion.div
                  key="success-step"
                  variants={stepVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="text-center py-4"
                >
                  <div 
                    className="w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center text-2xl font-bold"
                    style={{
                      background: 'rgba(52, 211, 153, 0.1)',
                      color: '#34D399',
                      border: '1px solid rgba(52, 211, 153, 0.2)'
                    }}
                  >
                    ✓
                  </div>
                  <h3 className="font-display text-2xl font-bold text-white mb-2">You&apos;re on the list!</h3>
                  <p className="text-sm mb-6 px-4" style={{ color: 'var(--ink-2)' }}>
                    {isOrg 
                      ? "We've added your details to our priority organizer beta queue. Keep an eye on your email for onboarding details." 
                      : "We've registered your ticket pass. We'll alert you first when live request tipping and direct ticketing go live in your city."}
                  </p>
                  
                  <div className="bg-black/20 p-4 rounded-xl mb-6 text-left">
                    <div className="flex justify-between items-center text-xs font-mono mb-1 text-gray-400">
                      <span>Status</span>
                      <span className="text-green-400 font-semibold">CONFIRMED</span>
                    </div>
                    <div className="flex justify-between items-center text-xs font-mono text-gray-400">
                      <span>Waitlist Email</span>
                      <span className="text-white">{email}</span>
                    </div>
                  </div>

                  <button
                    onClick={onClose}
                    className="w-full py-3 rounded-xl font-semibold text-sm text-white bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                  >
                    Return to Home
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
