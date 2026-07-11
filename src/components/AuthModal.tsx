'use client';

import { useState, useEffect, useCallback, useRef, type FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '@/hooks/useAuth';
import {
  signInWithGoogle,
  signInWithEmail,
  signUpWithEmail,
} from '@/lib/auth';
import { reserveUsername, type ArtistCategory } from '@/lib/waitlist';
import { sendWelcomeEmailAction } from '@/lib/email-actions';
import { logActivityAction } from '@/lib/admin-actions';

import { auth, isFirebaseConfigured } from '@/lib/firebase/client';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import SuccessConfirmation from '@/components/SuccessConfirmation';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface AuthModalProps {
  /** Whether the modal is visible. */
  isOpen: boolean;
  /** Called to close the modal (overlay click, X button, or post-success). */
  onClose: () => void;
  /** Initial email to populate sign-up form. */
  initialEmail?: string;
  /** Initial username to pre-fill the username reservation step. */
  initialUsername?: string;
  /** Default active mode in the auth step. */
  defaultTab?: 'signup' | 'signin' | 'phone';
}

/** The sequential screens inside the modal. */
type ModalStep = 'auth' | 'profile' | 'success';

/** The sub-views on the auth screen. */
type AuthView = 'main' | 'phone_entry' | 'phone_verify' | 'google_contact';

// ---------------------------------------------------------------------------
// Data: Categories & Dynamic Genres
// ---------------------------------------------------------------------------

const CATEGORIES: { value: ArtistCategory; label: string }[] = [
  { value: 'singer',          label: 'Singer / Vocalist' },
  { value: 'dj',              label: 'DJ' },
  { value: 'band',            label: 'Band' },
  { value: 'comedian',        label: 'Comedian' },
  { value: 'dancer',          label: 'Dancer' },
  { value: 'mc_rapper',       label: 'MC / Rapper' },
  { value: 'instrumentalist', label: 'Instrumentalist' },
  { value: 'other',           label: 'Other / Variety' },
];

const CATEGORY_GENRES: Record<ArtistCategory, string[]> = {
  singer:          ['Acoustic', 'Pop', 'Bollywood', 'Classical', 'Indie', 'Folk', 'Jazz', 'R&B', 'Devotional', 'Fusion'],
  dj:              ['EDM', 'Techno', 'House', 'Deep House', 'Hip-Hop', 'Trap', 'Bollywood', 'Commercial', 'Drum & Bass', 'Afrobeats'],
  band:            ['Rock', 'Indie Rock', 'Jazz', 'Blues', 'Metal', 'Alternative', 'Fusion', 'Pop', 'Acoustic', 'Progressive'],
  comedian:        ['Stand-up', 'Improv', 'Corporate', 'Roast', 'Sketch', 'Observational', 'Musical Comedy', 'Dark Humor'],
  dancer:          ['Bollywood', 'Hip-Hop', 'Contemporary', 'Classical', 'Latin', 'Freestyle', 'Folk', 'Commercial', 'Breaking'],
  mc_rapper:       ['Hip-Hop', 'Trap', 'R&B', 'Spoken Word', 'Freestyle', 'Boom Bap', 'Conscious', 'Desi Hip-Hop'],
  instrumentalist: ['Classical', 'Jazz', 'Folk', 'Fusion', 'Acoustic', 'Carnatic', 'Hindustani', 'Blues', 'Flamenco'],
  other:           ['Corporate', 'Wedding', 'Live Events', 'Experimental', 'Variety', 'Ambient', 'World Music'],
};


// ---------------------------------------------------------------------------
// Inline Icons
// ---------------------------------------------------------------------------

function GoogleIcon() {
  return (
    <svg
      className="w-5 h-5 mr-3 shrink-0"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg
      className="w-5 h-5 mr-3 shrink-0 text-white"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      viewBox="0 0 24 24"
    >
      <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
      <line x1="12" y1="18" x2="12.01" y2="18" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Framer Motion Animation Variants
// ---------------------------------------------------------------------------

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } },
  exit: { opacity: 0, transition: { duration: 0.25 } },
} as const;

const cardVariants = {
  hidden: { scale: 0.96, opacity: 0, y: 12 },
  visible: { 
    scale: 1, 
    opacity: 1, 
    y: 0, 
    transition: { type: 'spring' as const, stiffness: 260, damping: 26 } 
  },
  exit: { 
    scale: 0.96, 
    opacity: 0, 
    y: 8, 
    transition: { duration: 0.2 } 
  },
} as const;

const stepVariants = {
  initial: { opacity: 0, x: 16 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.25, ease: 'easeOut' as const } },
  exit: { opacity: 0, x: -16, transition: { duration: 0.2, ease: 'easeIn' as const } },
} as const;

// ---------------------------------------------------------------------------
// Helper: Map Firebase Auth errors to readable messages
// ---------------------------------------------------------------------------
function friendlyError(err: any): string {
  if (err && err.code) {
    switch (err.code) {
      case 'auth/email-already-in-use':
        return 'An account already exists with this email address.';
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/weak-password':
        return 'Your password is too weak. Please use at least 6 characters.';
      case 'auth/wrong-password':
        return 'Incorrect password. Please try again.';
      case 'auth/user-not-found':
        return 'No account exists with this email. Please check spelling or sign up.';
      case 'auth/invalid-credential':
        return 'Incorrect email or password. Please verify your credentials.';
      case 'auth/too-many-requests':
        return 'Too many login attempts. This account has been temporarily locked. Please try again later.';
      case 'auth/invalid-phone-number':
        return 'Please enter a valid phone number.';
      case 'auth/missing-phone-number':
        return 'Phone number is required.';
      case 'auth/invalid-verification-code':
        return 'The OTP verification code is incorrect. Please check and try again.';
      default:
        return err.message;
    }
  }
  return 'Something went wrong. Please try again.';
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function AuthModal({ isOpen, onClose, initialEmail, initialUsername, defaultTab }: AuthModalProps) {
  const { user } = useAuth();

  // ---- internal state ----
  const [step, setStep] = useState<ModalStep>('auth');
  const [view, setView] = useState<AuthView>('main');
  
  // Email Auth State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Phone Auth State
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<any>(null);

  // Segmented OTP inputs state
  const [otpArray, setOtpArray] = useState<string[]>(Array(6).fill(''));
  const otpInputsRef = useRef<HTMLInputElement[]>([]);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [reservedUsername, setReservedUsername] = useState('');

  // Extra contact fields collected alongside auth
  const [extraPhone, setExtraPhone] = useState('');   // phone for email/Google login
  const [extraEmail, setExtraEmail] = useState('');   // email for phone login

  // Profile step state
  const [pendingUser, setPendingUser] = useState<any>(null);
  const [category, setCategory] = useState<ArtistCategory | null>(null);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [profileSubStep, setProfileSubStep] = useState<'category' | 'genre'>('category');

  const toggleGenre = (genre: string) => {
    setSelectedGenres(prev =>
      prev.includes(genre)
        ? prev.filter(g => g !== genre)
        : prev.length < 3 ? [...prev, genre] : prev
    );
  };

  const activeGenres = category ? CATEGORY_GENRES[category] : [];

  // --------------------------------------------------------------------------
  // goToProfileStep — routes after any auth method completes
  // --------------------------------------------------------------------------
  const goToProfileStep = useCallback((firebaseUser: any) => {
    // Log login activity
    logActivityAction({
      userId: firebaseUser.uid,
      email: firebaseUser.email || undefined,
      actionType: 'login',
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
    }).catch(err => console.warn('Error logging sign-in:', err));

    if (!initialUsername || initialUsername.trim() === '') {
      onClose();
      return;
    }
    setPendingUser(firebaseUser);
    setStep('profile');
  }, [initialUsername, onClose]);

  // Called after profile form is submitted
  const handleProfileSubmit = useCallback(async (e: FormEvent) => {
    e.preventDefault();
    if (!pendingUser || !category) return;
    setError(null);
    setLoading(true);
    try {
      const normalised = initialUsername!.trim().toLowerCase();
      // Resolve email + phone from Firebase user OR the extra fields the user typed
      const resolvedEmail = pendingUser.email || extraEmail || '';
      const resolvedPhone = pendingUser.phoneNumber
        ? `+91${pendingUser.phoneNumber.replace(/\D/g, '').slice(-10)}`
        : extraPhone
          ? `+91${extraPhone.replace(/\D/g, '')}`
          : undefined;
      const ref = typeof window !== 'undefined' ? localStorage.getItem('artistant_ref') || undefined : undefined;
      await reserveUsername({
        uid: pendingUser.uid,
        username: normalised,
        email: resolvedEmail,
        displayName: pendingUser.displayName ?? resolvedEmail ?? normalised,
        role: 'artist',
        category,
        genres: selectedGenres,
        ...(resolvedPhone ? { phone: resolvedPhone } : {}),
        referredBy: ref,
      });

      // Log waitlist registration activity
      logActivityAction({
        userId: pendingUser.uid,
        email: resolvedEmail,
        username: normalised,
        actionType: 'waitlist_register',
        userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
      }).catch(err => console.warn('Error logging waitlist registration:', err));

      // Trigger welcome email notification in the background
      pendingUser.getIdToken().then((idToken: string) => {
        sendWelcomeEmailAction({
          idToken,
          email: resolvedEmail,
          name: pendingUser.displayName ?? resolvedEmail ?? normalised,
          username: normalised,
        }).catch((err: unknown) => console.error("Error sending welcome email: [REDACTED_ERROR]"));
      }).catch((err: unknown) => console.error("Error getting ID token for welcome email: [REDACTED_ERROR]"));


      setReservedUsername(normalised);
      setStep('success');
    } catch (err: any) {
      const errMsg = err?.message ?? 'Reservation failed.';
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  }, [pendingUser, category, selectedGenres, initialUsername, extraEmail, extraPhone]);

  // --------------------------------------------------------------------------
  // Reset all transient state whenever the modal re-opens
  // --------------------------------------------------------------------------
  useEffect(() => {
    if (isOpen) {
      if (!user) {
        setStep('auth');
      }
      setEmail(initialEmail || '');
      setPassword('');
      setPhoneNumber('');
      setOtpCode('');
      setOtpSent(false);
      setConfirmationResult(null);
      setOtpArray(Array(6).fill(''));
      setError(null);
      setLoading(false);
      setExtraPhone('');
      setExtraEmail('');

      if (defaultTab === 'phone') {
        setView('phone_entry');
      } else {
        setView('main');
      }
      // Reset profile step state
      setCategory(null);
      setSelectedGenres([]);
      setPendingUser(null);
      setProfileSubStep('category');
      setExtraPhone('');
      setExtraEmail('');
    }
  }, [isOpen, user, initialEmail, defaultTab]);

  // --------------------------------------------------------------------------
  // If user is already authenticated when modal opens, go straight to profile
  // --------------------------------------------------------------------------
  useEffect(() => {
    if (isOpen && user) {
      goToProfileStep(user);
    }
  }, [isOpen, user, goToProfileStep]);

  // --------------------------------------------------------------------------
  // Lock body scroll while the modal is open
  // --------------------------------------------------------------------------
  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // --------------------------------------------------------------------------
  // Cleanup Recaptcha widget if mounted
  // --------------------------------------------------------------------------
  useEffect(() => {
    return () => {
      const container = document.getElementById('recaptcha-container');
      if (container) container.remove();
    };
  }, []);

  // --------------------------------------------------------------------------
  // OTP segmented inputs navigation helper
  // --------------------------------------------------------------------------
  const handleOtpCellChange = (value: string, index: number) => {
    if (value && isNaN(Number(value))) return;

    const nextOtp = [...otpArray];
    nextOtp[index] = value.slice(-1);
    setOtpArray(nextOtp);

    const mergedCode = nextOtp.join('');
    setOtpCode(mergedCode);

    if (value && index < 5) {
      otpInputsRef.current[index + 1]?.focus();
    }
  };

  const handleOtpCellKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && !otpArray[index] && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
    }
  };

  // --------------------------------------------------------------------------
  // Auth handlers
  // --------------------------------------------------------------------------

  const handleGoogleSignIn = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const result = await signInWithGoogle();
      if (result && result.user) {
        // Google always provides email; phone is almost never in Google profile
        // Show a contact collection screen if phone is missing
        if (!result.user.phoneNumber) {
          setPendingUser(result.user);
          setView('google_contact');
        } else {
          goToProfileStep(result.user);
        }
      } else {
        onClose();
      }
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setLoading(false);
    }
  }, [goToProfileStep, onClose]);

  const handleEmailSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      // Validate extra phone before submitting
      const digitsOnly = extraPhone.replace(/\D/g, '');
      if (digitsOnly.length !== 10) {
        setError('Please enter a valid 10-digit phone number.');
        return;
      }
      setError(null);
      setLoading(true);
      try {
        let result;
        try {
          result = await signUpWithEmail(email, password);
        } catch (err: any) {
          if (err.code === 'auth/email-already-in-use') {
            result = await signInWithEmail(email, password);
          } else {
            throw err;
          }
        }
        if (result && result.user) {
          goToProfileStep(result.user);
        }
      } catch (err) {
        setError(friendlyError(err));
      } finally {
        setLoading(false);
      }
    },
    [email, password, extraPhone, goToProfileStep],
  );

  const handleSendOtp = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      // Validate extra email before sending OTP
      if (!extraEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(extraEmail)) {
        setError('Please enter a valid email address.');
        return;
      }
      setError(null);
      setLoading(true);
      try {
        if (!isFirebaseConfigured) {
          throw new Error('Firebase credentials are not configured.');
        }
        if (typeof window === 'undefined') return;

        let container = document.getElementById('recaptcha-container');
        if (!container) {
          container = document.createElement('div');
          container.id = 'recaptcha-container';
          document.body.appendChild(container);
        }

        const verifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
          size: 'invisible',
        });

        const digitsOnly = phoneNumber.trim().replace(/\D/g, '');
        if (digitsOnly.length !== 10) {
          throw new Error('Please enter a valid 10-digit phone number.');
        }
        const formattedPhone = `+91${digitsOnly}`;

        const confirmation = await signInWithPhoneNumber(auth, formattedPhone, verifier);
        setConfirmationResult(confirmation);
        setOtpSent(true);
        setView('phone_verify');
        setTimeout(() => otpInputsRef.current[0]?.focus(), 150);
      } catch (err: any) {
        console.error("[REDACTED_ERROR] PII stripped from client log.");
        setError(friendlyError(err));
        const container = document.getElementById('recaptcha-container');
        if (container) container.remove();
      } finally {
        setLoading(false);
      }
    },
    [phoneNumber, extraEmail]
  );

  const handleVerifyOtp = useCallback(
    async (e: FormEvent) => {
      if (e) e.preventDefault();
      setError(null);
      setLoading(true);
      try {
        if (!confirmationResult) {
          throw new Error('Verification session has expired. Please try again.');
        }
        const result = await confirmationResult.confirm(otpCode);
        if (result && result.user) {
          goToProfileStep(result.user);
        } else {
          onClose();
        }
      } catch (err) {
        setError(friendlyError(err));
      } finally {
        setLoading(false);
      }
    },
    [confirmationResult, otpCode, goToProfileStep, onClose]
  );

  useEffect(() => {
    if (otpCode.length === 6 && view === 'phone_verify' && !loading) {
      handleVerifyOtp(null as any);
    }
  }, [otpCode, view, loading, handleVerifyOtp]);

  // --------------------------------------------------------------------------
  // Overlay click — only close when on the auth step
  // --------------------------------------------------------------------------
  const handleOverlayClick = useCallback(() => {
    if (step === 'auth') onClose();
  }, [step, onClose]);

  // --------------------------------------------------------------------------
  // Render
  // --------------------------------------------------------------------------

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="auth-overlay"
          className="modal-overlay fixed inset-0 z-[100] flex items-center justify-center bg-black/65 backdrop-blur-md"
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={handleOverlayClick}
          aria-modal="true"
          role="dialog"
        >
          {/* ── Modal Card ─────────────────────────────────── */}
          <motion.div
            key="auth-card"
            className="glass-card relative max-w-md w-full mx-4 p-5 sm:p-8 border border-white/10 rounded-3xl shadow-[0_24px_60px_-15px_rgba(0,0,0,0.7)] overflow-hidden"
            style={{ 
              background: 'rgba(14, 21, 36, 0.88)',
              boxShadow: '0 24px 60px -15px rgba(0, 0, 0, 0.7), inset 0 1px 0 rgba(255,255,255,0.1)'
            }}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e) => e.stopPropagation()} // prevent overlay close
          >
            {/* Soft decorative background glow inside card */}
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-36 h-36 bg-brand-orange/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-36 h-36 bg-brand-purple/10 rounded-full blur-3xl pointer-events-none" />

            {/* Close button (X) */}
            <button
              type="button"
              onClick={onClose}
              className="absolute top-5 right-5 w-8 h-8 rounded-full flex items-center justify-center border border-white/5 bg-white/5 text-text-muted hover:text-text-primary hover:bg-white/10 transition-all duration-300 z-50"
              aria-label="Close modal"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 0 1 1.414 0L10 8.586l4.293-4.293a1 1 0 1 1 1.414 1.414L11.414 10l4.293 4.293a1 1 0 0 1-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 0 1-1.414-1.414L8.586 10 4.293 5.707a1 1 0 0 1 0-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>

            {/* ── Step content ── */}
            <AnimatePresence mode="wait">
              {/* ============================================================ */}
              {/* STEP 1 — Auth screen                                         */}
              {/* ============================================================ */}
              {step === 'auth' && (
                <motion.div
                  key="step-auth"
                  variants={stepVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="relative z-10"
                >
                  {/* Heading depending on Auth View */}
                  {view === 'main' && (
                    <>
                      <h2 className="font-display text-2xl font-bold text-center mb-1 text-white">
                        {initialUsername ? (
                          <>Reserve <span style={{ background: 'linear-gradient(135deg, #F25A2B, #7C5CFF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>@{initialUsername.trim().toLowerCase()}</span></>
                        ) : 'Sign In or Sign Up'}
                      </h2>
                      <p className="text-xs text-center mb-6 text-text-muted">
                        {initialUsername ? 'Sign in to lock in your artist username' : 'Reserve your artist username today'}
                      </p>

                      {/* ── Google login CTA ── */}
                      <button
                        type="button"
                        onClick={handleGoogleSignIn}
                        disabled={loading}
                        className="relative flex items-center justify-center w-full py-3 px-4 mb-3 rounded-xl bg-white/5 border border-white/10 text-white font-semibold text-sm
                                   hover:bg-white/10 hover:border-white/20 active:scale-[0.99] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_4px_12px_rgba(0,0,0,0.2)]"
                      >
                        {loading ? (
                          <span className="animate-spin h-5 w-5 border-2 border-white/40 border-t-white rounded-full mr-3" />
                        ) : (
                          <GoogleIcon />
                        )}
                        Continue with Google
                      </button>

                      {/* ── Phone login CTA (Styled exactly like Google button!) ── */}
                      <button
                        type="button"
                        onClick={() => { setView('phone_entry'); setError(null); }}
                        disabled={loading}
                        className="relative flex items-center justify-center w-full py-3 px-4 mb-5 rounded-xl bg-white/5 border border-white/10 text-white font-semibold text-sm
                                   hover:bg-white/10 hover:border-white/20 active:scale-[0.99] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_4px_12px_rgba(0,0,0,0.2)]"
                      >
                        <PhoneIcon />
                        Continue with Phone
                      </button>

                      {/* ── Or divider ── */}
                      <div className="flex items-center gap-3 my-5">
                        <span className="flex-1 h-px bg-white/5" />
                        <span className="text-text-muted text-[10px] uppercase tracking-widest font-mono">
                          or
                        </span>
                        <span className="flex-1 h-px bg-white/5" />
                      </div>

                      {/* ── Email / Password form ── */}
                      <form onSubmit={handleEmailSubmit} className="space-y-3">
                        <div className="relative group">
                          <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Email address"
                            className="w-full px-4 py-3 bg-bg-secondary/20 border border-white/5 rounded-xl text-white placeholder-text-muted/50 text-sm focus:border-brand-orange/40 focus:ring-1 focus:ring-brand-orange/20 transition-all duration-300 outline-none"
                            autoComplete="email"
                          />
                          <div className="absolute inset-0 rounded-xl border border-transparent group-hover:border-white/5 pointer-events-none transition-colors duration-300" />
                        </div>

                        <div className="relative group">
                          <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Password"
                            minLength={6}
                            className="w-full px-4 py-3 bg-bg-secondary/20 border border-white/5 rounded-xl text-white placeholder-text-muted/50 text-sm focus:border-brand-orange/40 focus:ring-1 focus:ring-brand-orange/20 transition-all duration-300 outline-none"
                            autoComplete="current-password"
                          />
                          <div className="absolute inset-0 rounded-xl border border-transparent group-hover:border-white/5 pointer-events-none transition-colors duration-300" />
                        </div>

                        {/* Required phone field */}
                        <div className="relative flex items-center bg-bg-secondary/20 border border-white/5 rounded-xl focus-within:border-brand-orange/40 focus-within:ring-1 focus-within:ring-brand-orange/20 transition-all duration-300">
                          <span className="pl-4 pr-2 text-text-muted font-mono font-semibold select-none border-r border-white/5 text-sm">+91</span>
                          <input
                            type="tel"
                            required
                            maxLength={10}
                            value={extraPhone}
                            onChange={(e) => setExtraPhone(e.target.value.replace(/\D/g, ''))}
                            placeholder="Phone number"
                            className="w-full px-3 py-3 bg-transparent text-white placeholder-text-muted/30 text-sm outline-none"
                            autoComplete="tel"
                          />
                        </div>

                        <button
                          type="submit"
                          disabled={loading}
                          className="w-full py-3 rounded-xl font-semibold text-sm text-white shadow-lg
                                     transition-all hover:scale-[1.01] active:scale-[0.99] hover:opacity-95
                                     disabled:opacity-50 disabled:cursor-not-allowed"
                          style={{ background: 'linear-gradient(135deg, #F25A2B 0%, #7C5CFF 100%)' }}
                        >
                          {loading ? (
                            <span className="flex items-center justify-center gap-2">
                              <span className="animate-spin h-4 w-4 border-2 border-white/40 border-t-white rounded-full" />
                              Processing…
                            </span>
                          ) : (
                            'Continue'
                          )}
                        </button>
                      </form>


                    </>
                  )}

                  {/* ── Phone Number Entry Sub-view ── */}
                  {view === 'phone_entry' && (
                    <>
                      <h2 className="font-display text-2xl font-bold text-center mb-1 text-white">
                        Verify your phone
                      </h2>
                      <p className="text-xs text-center mb-6 text-text-muted">
                        We will send a 6-digit OTP to your number
                      </p>

                      <form onSubmit={handleSendOtp} className="space-y-3">
                        {/* Required email field */}
                        <div className="relative group">
                          <input
                            type="email"
                            required
                            value={extraEmail}
                            onChange={(e) => setExtraEmail(e.target.value)}
                            placeholder="Email address"
                            className="w-full px-4 py-3 bg-bg-secondary/20 border border-white/5 rounded-xl text-white placeholder-text-muted/30 text-sm focus:border-brand-orange/40 focus:ring-1 focus:ring-brand-orange/20 transition-all duration-300 outline-none"
                            autoComplete="email"
                          />
                          <div className="absolute inset-0 rounded-xl border border-transparent group-hover:border-white/5 pointer-events-none transition-colors duration-300" />
                        </div>

                        <div className="relative flex items-center bg-bg-secondary/20 border border-white/5 rounded-xl text-white text-sm focus-within:border-brand-orange/40 focus-within:ring-1 focus-within:ring-brand-orange/20 transition-all duration-300">
                          <span className="pl-4 pr-2 text-text-muted font-mono font-semibold select-none border-r border-white/5">+91</span>
                          <input
                            type="tel"
                            required
                            maxLength={10}
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                            placeholder="9900000000"
                            className="w-full px-3 py-3.5 bg-transparent text-white placeholder-text-muted/30 text-sm outline-none"
                            autoComplete="tel"
                          />
                        </div>
                        
                        <button
                          type="submit"
                          disabled={loading}
                          className="w-full py-3.5 rounded-xl font-semibold text-sm text-white shadow-lg
                                     transition-all hover:scale-[1.01] active:scale-[0.99] hover:opacity-95
                                     disabled:opacity-50 disabled:cursor-not-allowed"
                          style={{ background: 'linear-gradient(135deg, #F25A2B 0%, #7C5CFF 100%)' }}
                        >
                          {loading ? 'Sending OTP…' : 'Send Verification OTP'}
                        </button>
                      </form>

                      <button
                        type="button"
                        onClick={() => { setView('main'); setError(null); }}
                        className="w-full py-3 text-xs text-center text-text-muted hover:text-white transition-colors mt-2"
                      >
                        Go back to other options
                      </button>
                    </>
                  )}

                  {/* ── Google Contact Collection Sub-view ── */}
                  {view === 'google_contact' && (
                    <>
                      <h2 className="font-display text-2xl font-bold text-center mb-1 text-white">
                        One last thing
                      </h2>
                      <p className="text-xs text-center mb-6 text-text-muted">
                        Add your phone number to complete your profile
                      </p>

                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          const digits = extraPhone.replace(/\D/g, '');
                          if (digits.length !== 10) {
                            setError('Please enter a valid 10-digit phone number.');
                            return;
                          }
                          setError(null);
                          if (pendingUser) goToProfileStep(pendingUser);
                        }}
                        className="space-y-3"
                      >
                        <div className="relative flex items-center bg-bg-secondary/20 border border-white/5 rounded-xl text-white text-sm focus-within:border-brand-orange/40 focus-within:ring-1 focus-within:ring-brand-orange/20 transition-all duration-300">
                          <span className="pl-4 pr-2 text-text-muted font-mono font-semibold select-none border-r border-white/5">+91</span>
                          <input
                            type="tel"
                            required
                            maxLength={10}
                            value={extraPhone}
                            onChange={(e) => setExtraPhone(e.target.value.replace(/\D/g, ''))}
                            placeholder="Phone number"
                            className="w-full px-3 py-3.5 bg-transparent text-white placeholder-text-muted/30 text-sm outline-none"
                            autoComplete="tel"
                            autoFocus
                          />
                        </div>

                        <button
                          type="submit"
                          disabled={loading}
                          className="w-full py-3 rounded-xl font-semibold text-sm text-white shadow-lg transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
                          style={{ background: 'linear-gradient(135deg, #F25A2B 0%, #7C5CFF 100%)' }}
                        >
                          Continue
                        </button>
                      </form>
                    </>
                  )}

                  {/* ── Phone Verify OTP Sub-view ── */}
                  {view === 'phone_verify' && (
                    <>
                      <h2 className="font-display text-2xl font-bold text-center mb-1 text-white">
                        Enter verification code
                      </h2>
                      <p className="text-xs text-center mb-6 text-text-muted">
                        OTP code sent to <span className="text-white font-semibold">+91 {phoneNumber}</span>
                      </p>

                      <form onSubmit={handleVerifyOtp} className="space-y-4">
                        {/* ── Segmented OTP Input Grid ── */}
                        <div className="flex justify-between gap-2 max-w-xs mx-auto my-6">
                          {otpArray.map((val, idx) => (
                            <motion.input
                              key={idx}
                              ref={(el) => { otpInputsRef.current[idx] = el as HTMLInputElement; }}
                              type="text"
                              inputMode="numeric"
                              pattern="[0-9]*"
                              maxLength={1}
                              value={val}
                              onChange={(e) => handleOtpCellChange(e.target.value, idx)}
                              onKeyDown={(e) => handleOtpCellKeyDown(e, idx)}
                              className="w-10 h-10 sm:w-12 sm:h-12 text-center text-xl font-bold font-mono bg-bg-secondary/40 border border-white/10 rounded-xl text-white focus:border-brand-orange focus:ring-1 focus:ring-brand-orange outline-none transition-all duration-200"
                              style={{ boxShadow: val ? '0 0 10px rgba(242,90,43,0.15)' : 'none' }}
                              initial={{ scale: 0.85, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              transition={{ delay: idx * 0.05, type: 'spring', stiffness: 300, damping: 20 }}
                            />
                          ))}
                        </div>

                        <button
                          type="submit"
                          disabled={loading}
                          className="w-full py-3.5 rounded-xl font-semibold text-sm text-white shadow-lg
                                     transition-all hover:scale-[1.01] active:scale-[0.99] hover:opacity-95
                                     disabled:opacity-50 disabled:cursor-not-allowed"
                          style={{ background: 'linear-gradient(135deg, #F25A2B 0%, #7C5CFF 100%)' }}
                        >
                          {loading ? 'Verifying…' : 'Verify Code & Continue'}
                        </button>
                        
                        <button
                          type="button"
                          onClick={() => {
                            setView('phone_entry');
                            setOtpCode('');
                            setOtpArray(Array(6).fill(''));
                            setError(null);
                          }}
                          className="w-full py-2 text-xs text-center text-text-muted hover:text-white transition-colors mt-2"
                        >
                          Change phone number
                        </button>
                      </form>
                    </>
                  )}

                  {/* ── Error message ── */}
                  <AnimatePresence>
                    {error && (
                      <motion.p
                        key="auth-error"
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        className="mt-4 text-accent-red text-xs text-center bg-accent-red/10 border border-accent-red/20 rounded-lg p-2.5"
                        role="alert"
                      >
                        {error}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}

              {/* ============================================================ */}
              {/* STEP 2 — Artist Profile (2-slide)                             */}
              {/* ============================================================ */}
              {step === 'profile' && (
                <motion.div
                  key="step-profile"
                  variants={stepVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="relative z-10"
                >
                  {/* ── Progress dots ── */}
                  <div className="flex items-center justify-center gap-1.5 mb-5">
                    <div style={{
                      width: profileSubStep === 'category' ? '20px' : '6px',
                      height: '4px', borderRadius: '2px',
                      background: profileSubStep === 'category'
                        ? 'linear-gradient(90deg,#F25A2B,#7C5CFF)' : 'rgba(255,255,255,0.15)',
                      transition: 'all 0.3s ease',
                    }} />
                    <div style={{
                      width: profileSubStep === 'genre' ? '20px' : '6px',
                      height: '4px', borderRadius: '2px',
                      background: profileSubStep === 'genre'
                        ? 'linear-gradient(90deg,#F25A2B,#7C5CFF)' : 'rgba(255,255,255,0.15)',
                      transition: 'all 0.3s ease',
                    }} />
                  </div>

                  <AnimatePresence mode="wait">
                    {/* ── Slide 1: Category ── */}
                    {profileSubStep === 'category' && (
                      <motion.div
                        key="profile-category"
                        initial={{ opacity: 0, x: 24 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -24 }}
                        transition={{ duration: 0.22, ease: 'easeOut' }}
                      >
                        <div className="text-center mb-5">
                          <h2 className="font-display text-xl font-bold text-white mb-1">What do you do?</h2>
                          <p className="text-xs text-text-muted">Select the category that best describes you</p>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          {CATEGORIES.map(cat => (
                            <button
                              key={cat.value}
                              type="button"
                              onClick={() => {
                                setCategory(cat.value);
                                setSelectedGenres([]);
                                setProfileSubStep('genre');
                              }}
                              className="px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 text-left"
                              style={{
                                background: 'rgba(255,255,255,0.03)',
                                border: '1px solid rgba(255,255,255,0.07)',
                                color: 'rgba(255,255,255,0.75)',
                                letterSpacing: '0.01em',
                              }}
                              onMouseEnter={e => {
                                (e.currentTarget as HTMLButtonElement).style.background = 'rgba(242,90,43,0.08)';
                                (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(242,90,43,0.35)';
                                (e.currentTarget as HTMLButtonElement).style.color = '#F25A2B';
                              }}
                              onMouseLeave={e => {
                                (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.03)';
                                (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.07)';
                                (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.75)';
                              }}
                            >
                              {cat.label}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}

                    {/* ── Slide 2: Genres ── */}
                    {profileSubStep === 'genre' && (
                      <motion.div
                        key="profile-genre"
                        initial={{ opacity: 0, x: 24 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -24 }}
                        transition={{ duration: 0.22, ease: 'easeOut' }}
                      >
                        <div className="text-center mb-5">
                          <h2 className="font-display text-xl font-bold text-white mb-1">Your niche</h2>
                          <p className="text-xs text-text-muted">
                            Select up to 3 genres for{' '}
                            <span style={{ color: '#F25A2B', fontWeight: 600 }}>
                              {CATEGORIES.find(c => c.value === category)?.label}
                            </span>
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-2 mb-4">
                          {activeGenres.map(genre => {
                            const active = selectedGenres.includes(genre);
                            const maxed = !active && selectedGenres.length >= 3;
                            return (
                              <button
                                key={genre}
                                type="button"
                                disabled={maxed}
                                onClick={() => toggleGenre(genre)}
                                className="px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-150"
                                style={{
                                  background: active
                                    ? 'linear-gradient(135deg, rgba(242,90,43,0.18), rgba(124,92,255,0.18))'
                                    : 'rgba(255,255,255,0.04)',
                                  border: `1px solid ${
                                    active ? 'rgba(124,92,255,0.5)'
                                    : maxed ? 'rgba(255,255,255,0.04)'
                                    : 'rgba(255,255,255,0.1)'
                                  }`,
                                  color: active ? '#C4AEFF'
                                    : maxed ? 'rgba(255,255,255,0.18)'
                                    : 'rgba(255,255,255,0.65)',
                                  cursor: maxed ? 'not-allowed' : 'pointer',
                                  transform: active ? 'scale(1.02)' : 'scale(1)',
                                }}
                              >
                                {genre}
                              </button>
                            );
                          })}
                        </div>

                        {selectedGenres.length === 3 && (
                          <p className="text-[10px] mb-3 font-mono" style={{ color: 'rgba(242,90,43,0.6)' }}>
                            Max 3 selected — deselect to swap
                          </p>
                        )}

                        {/* Error */}
                        <AnimatePresence>
                          {error && (
                            <motion.p
                              initial={{ opacity: 0, y: -4 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0 }}
                              className="text-xs text-center rounded-lg p-2.5 mb-3"
                              style={{ background: 'rgba(255,90,95,0.08)', border: '1px solid rgba(255,90,95,0.2)', color: '#FF5A5F' }}
                            >
                              {error}
                            </motion.p>
                          )}
                        </AnimatePresence>

                        <div className="flex gap-2">
                          {/* Back */}
                          <button
                            type="button"
                            onClick={() => { setProfileSubStep('category'); setError(null); }}
                            className="px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200"
                            style={{
                              background: 'rgba(255,255,255,0.04)',
                              border: '1px solid rgba(255,255,255,0.08)',
                              color: 'rgba(255,255,255,0.5)',
                            }}
                          >
                            ←
                          </button>

                          {/* Reserve */}
                          <button
                            type="button"
                            disabled={loading}
                            onClick={(e) => handleProfileSubmit(e as any)}
                            className="flex-1 py-3 rounded-xl font-semibold text-sm text-white shadow-lg transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed"
                            style={{ background: 'linear-gradient(135deg, #F25A2B 0%, #7C5CFF 100%)' }}
                          >
                            {loading ? (
                              <span className="flex items-center justify-center gap-2">
                                <span className="animate-spin h-4 w-4 border-2 border-white/40 border-t-white rounded-full" />
                                Reserving…
                              </span>
                            ) : 'Reserve My Username'}
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}

              {/* ============================================================ */}
              {/* STEP 3 — Success confirmation                                */}
              {/* ============================================================ */}
              {step === 'success' && (
                <motion.div
                  key="step-success"
                  variants={stepVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="relative z-10"
                >
                  <SuccessConfirmation username={reservedUsername} onClose={onClose} />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
