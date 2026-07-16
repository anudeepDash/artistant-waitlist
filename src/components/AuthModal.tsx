'use client';

import { useState, useEffect, useCallback, useRef, type FormEvent, Fragment } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import {
  signInWithGoogle,
  signInWithEmail,
  signUpWithEmail,
  resetPassword,
} from '@/lib/auth';
import { reserveUsername, getUserReservation, type ArtistCategory } from '@/lib/waitlist';
import { sendWelcomeEmailAction } from '@/lib/email-actions';
import { logActivityAction } from '@/lib/admin-actions';
import { uploadProfilePhotoAction } from '@/lib/profile-actions';
import { compressImage } from '@/lib/image-utils';

import { auth, isFirebaseConfigured } from '@/lib/firebase/client';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import SuccessConfirmation from '@/components/SuccessConfirmation';
import ImageCropperModal from '@/components/ImageCropperModal';

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
type AuthView = 'main' | 'phone_entry' | 'phone_verify' | 'collect_phone' | 'collect_email' | 'forgot_password';

/** The sub-steps in the profile wizard */
type ProfileSubStep = 'category' | 'genre' | 'location' | 'links' | 'bio' | 'profile_pic' | 'preview';

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

const CITIES = ['Bangalore', 'Mumbai', 'Delhi NCR', 'Goa', 'Hyderabad', 'Pune', 'Kolkata', 'Chennai', 'Kochi', 'Jaipur', 'Chandigarh', 'Ahmedabad', 'Indore', 'Lucknow', 'Guwahati'];
const EVENT_TYPES = ['College fest', 'Cafe / pub', 'Wedding', 'Corporate', 'Private party', 'Club night'];


// ---------------------------------------------------------------------------
// Inline Icons
// ---------------------------------------------------------------------------

function GoogleIcon() {
  return (
    <svg className="w-5 h-5 mr-3 shrink-0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg className="w-5 h-5 mr-3 shrink-0 text-white" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
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
  visible: { opacity: 1, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] } },
} as const;

const cardVariants = {
  hidden: { scale: 0.95, opacity: 0, y: 20 },
  visible: { 
    scale: 1, 
    opacity: 1, 
    y: 0, 
    transition: { type: 'spring' as const, stiffness: 300, damping: 30, mass: 1 } 
  },
  exit: { 
    scale: 0.95, 
    opacity: 0, 
    y: 10, 
    transition: { duration: 0.25, ease: 'easeIn' } 
  },
} as const;

const stepVariants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, x: -20, transition: { duration: 0.25, ease: [0.22, 1, 0.36, 1] } },
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
      case 'auth/popup-closed-by-user':
        return 'The sign-in popup was closed before completing the sign-in. Please try again.';
      case 'auth/popup-blocked':
        return 'The sign-in popup was blocked by your browser. Please enable popups for this site and try again.';
      case 'auth/cancelled-popup-request':
        return 'Sign-in was cancelled due to another request. Please try again.';
      default:
        return err.message;
    }
  }
  return 'Something went wrong. Please try again.';
}

// Custom SVG Icons for Socials
const InstagramIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const SpotifyIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.587 14.424c-.18.295-.573.398-.87.204-2.365-1.446-5.352-1.772-8.84-1.026-.34.074-.68-.142-.752-.482-.072-.34.142-.68.482-.752 3.825-.82 7.126-.445 9.775 1.176.293.18.397.575.205.88zM17.81 13.7c-.226.367-.716.485-1.08.26-2.73-1.674-6.903-2.18-9.87-1.272-.416.126-.84-.112-.968-.527-.127-.417.11-.843.528-.966 3.42-1.042 8.026-.47 11.21 1.482.365.225.485.716.262 1.082zm.12-2.915C14.48 8.74 8.41 8.52 4.908 9.58c-.496.15-1.015-.13-1.165-.625-.15-.494.13-1.015.626-1.165 4.02-1.216 10.744-.972 14.73 1.393.447.265.597.842.33 1.29-.265.447-.842.597-1.29.33z" />
  </svg>
);

const YouTubeIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M21.582 6.186a2.506 2.506 0 0 0-1.762-1.766C18.265 4 12 4 12 4s-6.265 0-7.82.42a2.506 2.506 0 0 0-1.762 1.766C2 7.74 2 12 2 12s0 4.26.418 5.814a2.506 2.506 0 0 0 1.762 1.766C5.735 20 12 20 12 20s6.265 0 7.82-.42a2.506 2.506 0 0 0 1.762-1.766C22 16.26 22 12 22 12s0-4.26-.418-5.814zM10 15.464V8.536L16 12l-6 3.464z" />
  </svg>
);

const getInstagramHandle = (url: string) => {
  if (!url) return '';
  let clean = url.trim().split('?')[0].replace(/\/$/, '');
  if (clean.includes('instagram.com/')) {
    return clean.split('instagram.com/').pop() || '';
  }
  return clean;
};

const getSpotifyHandle = (url: string) => {
  if (!url) return '';
  let clean = url.trim().split('?')[0].replace(/\/$/, '');
  if (clean.includes('spotify.com/artist/')) {
    return clean.split('spotify.com/artist/').pop() || '';
  }
  return clean;
};

const getYoutubeHandle = (url: string) => {
  if (!url) return '';
  let clean = url.trim().split('?')[0].replace(/\/$/, '');
  if (clean.includes('youtube.com/@')) {
    return clean.split('youtube.com/@').pop() || '';
  }
  if (clean.includes('youtube.com/')) {
    const match = clean.match(/youtube\.com\/(?:c\/|user\/|channel\/)?@?([^/]+)/);
    if (match && match[1]) return match[1];
    return clean.split('youtube.com/').pop() || '';
  }
  return clean.startsWith('@') ? clean.slice(1) : clean;
};

const makeInstagramUrl = (input: string) => {
  const handle = getInstagramHandle(input);
  return handle ? `https://instagram.com/${handle}` : '';
};

const makeSpotifyUrl = (input: string) => {
  const handle = getSpotifyHandle(input);
  return handle ? `https://open.spotify.com/artist/${handle}` : '';
};

const makeYoutubeUrl = (input: string) => {
  const handle = getYoutubeHandle(input);
  return handle ? `https://youtube.com/@${handle}` : '';
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------


export default function AuthModal({ isOpen, onClose, initialEmail, initialUsername, defaultTab }: AuthModalProps) {
  const { user } = useAuth();
  const router = useRouter();

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

  // Forgot Password State
  const [resetEmailSent, setResetEmailSent] = useState(false);

  // Segmented OTP inputs state
  const [otpArray, setOtpArray] = useState<string[]>(Array(6).fill(''));
  const otpInputsRef = useRef<HTMLInputElement[]>([]);
  const isActionPending = useRef(false);

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
  const [profileSubStep, setProfileSubStep] = useState<ProfileSubStep>('category');
  
  // Artist Wizard fields
  const [city, setCity] = useState('');
  const [customCity, setCustomCity] = useState('');
  const [isOtherCity, setIsOtherCity] = useState(false);
  const [eventTypes, setEventTypes] = useState<string[]>([]);
  const [spotifyUrl, setSpotifyUrl] = useState('');
  const [instagramUrl, setInstagramUrl] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [bio, setBio] = useState('');
  const [profilePhotoFile, setProfilePhotoFile] = useState<File | null>(null);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState<string | null>(null);
  const [cropperOpen, setCropperOpen] = useState(false);
  const [cropperImageSrc, setCropperImageSrc] = useState('');

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
    firebaseUser.getIdToken()
      .then((idToken: string) => logActivityAction({ actionType: 'login', idToken }))
      .catch((err: unknown) => console.warn('Error logging sign-in:', err));

    setLoading(true);
    getUserReservation(firebaseUser.uid)
      .then((existingReservation) => {
        if (existingReservation) {
          // If the user already has a reservation, redirect directly to dashboard and close
          onClose();
          router.push('/dashboard');
        } else {
          // No existing reservation, proceed with onboarding/profiling
          if (!initialUsername || initialUsername.trim() === '') {
            onClose();
            return;
          }
          setPendingUser(firebaseUser);
          setStep('profile');
        }
      })
      .catch((err) => {
        console.error('Error checking user reservation on login:', err);
        // Fallback: proceed with onboarding
        if (!initialUsername || initialUsername.trim() === '') {
          onClose();
          return;
        }
        setPendingUser(firebaseUser);
        setStep('profile');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [initialUsername, onClose, router]);

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

      // First reserve the username (without photo — photo is uploaded separately)
      await reserveUsername({
        uid: pendingUser.uid,
        username: normalised,
        email: resolvedEmail,
        displayName: pendingUser.displayName ?? resolvedEmail ?? normalised,
        role: 'artist',
        category,
        genres: selectedGenres,
        city,
        eventTypes,
        spotifyUrl,
        instagramUrl,
        youtubeUrl,
        bio,
        ...(resolvedPhone ? { phone: resolvedPhone } : {}),
        referredBy: ref,
      });

      // Upload profile photo via server action (bypasses storage RLS)
      if (profilePhotoFile && profilePhotoPreview) {
        try {
          const idToken = await pendingUser.getIdToken();
          const fileExt = profilePhotoFile.name.split('.').pop() || 'jpg';
          await uploadProfilePhotoAction(idToken, profilePhotoPreview, fileExt);
        } catch (photoErr) {
          console.error('Profile photo upload failed:', photoErr);
          // Non-blocking — profile is still created, photo can be added later
        }
      }

      // Log waitlist registration activity
      pendingUser.getIdToken()
        .then((idToken: string) => logActivityAction({ actionType: 'waitlist_register', idToken }))
        .catch((err: unknown) => console.warn('Error logging waitlist registration:', err));

      // Trigger welcome email notification in the background
      pendingUser.getIdToken().then((idToken: string) => {
        sendWelcomeEmailAction({
          idToken,
          email: resolvedEmail,
          name: pendingUser.displayName ?? resolvedEmail ?? normalised,
          username: normalised,
        }).catch((err: unknown) => console.error("Error sending welcome email:", err));
      }).catch((err: unknown) => console.error("Error getting ID token for welcome email:", err));


      setReservedUsername(normalised);
      setStep('success');
    } catch (err: any) {
      const errMsg = err?.message ?? 'Reservation failed.';
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  }, [
    pendingUser,
    category,
    selectedGenres,
    initialUsername,
    extraEmail,
    extraPhone,
    city,
    eventTypes,
    spotifyUrl,
    instagramUrl,
    youtubeUrl,
    bio,
    profilePhotoFile,
    profilePhotoPreview
  ]);

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
      setResetEmailSent(false);
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
      
      // Reset Wizard state
      setCity('');
      setCustomCity('');
      setIsOtherCity(false);
      setEventTypes([]);
      setSpotifyUrl('');
      setInstagramUrl('');
      setYoutubeUrl('');
      setBio('');
      setProfilePhotoFile(null);
      setProfilePhotoPreview(null);
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
    if (isActionPending.current) return;
    isActionPending.current = true;
    setError(null);
    setLoading(true);
    try {
      const result = await signInWithGoogle();
      if (result && result.user) {
        if (!result.user.phoneNumber) {
          setPendingUser(result.user);
          setView('collect_phone');
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
      isActionPending.current = false;
    }
  }, [goToProfileStep, onClose]);

  const handleEmailSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      if (isActionPending.current) return;
      isActionPending.current = true;
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
          if (!result.user.phoneNumber) {
            setPendingUser(result.user);
            setView('collect_phone');
          } else {
            goToProfileStep(result.user);
          }
        }
      } catch (err) {
        setError(friendlyError(err));
      } finally {
        setLoading(false);
        isActionPending.current = false;
      }
    },
    [email, password, goToProfileStep],
  );

  const handleSendOtp = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      if (isActionPending.current) return;
      isActionPending.current = true;
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
        console.error("Error sending OTP");
        setError(friendlyError(err));
        const container = document.getElementById('recaptcha-container');
        if (container) container.remove();
      } finally {
        setLoading(false);
        isActionPending.current = false;
      }
    },
    [phoneNumber]
  );

  const handleVerifyOtp = useCallback(
    async (e: FormEvent) => {
      if (e) e.preventDefault();
      if (isActionPending.current) return;
      isActionPending.current = true;
      setError(null);
      setLoading(true);
      try {
        if (!confirmationResult) {
          throw new Error('Verification session has expired. Please try again.');
        }
        const result = await confirmationResult.confirm(otpCode);
        if (result && result.user) {
          if (!result.user.email) {
            setPendingUser(result.user);
            setView('collect_email');
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
        isActionPending.current = false;
      }
    },
    [confirmationResult, otpCode, goToProfileStep, onClose]
  );

  const handleResetPassword = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      if (isActionPending.current) return;
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setError('Please enter a valid email address.');
        return;
      }
      isActionPending.current = true;
      setError(null);
      setLoading(true);
      try {
        await resetPassword(email);
        setResetEmailSent(true);
      } catch (err) {
        setError(friendlyError(err));
      } finally {
        setLoading(false);
        isActionPending.current = false;
      }
    },
    [email]
  );

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
    <Fragment>
      <AnimatePresence>
      {isOpen && (
        <motion.div
          key="auth-overlay"
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md"
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
            className="relative w-full max-w-sm md:max-w-4xl mx-4 rounded-3xl md:rounded-[2rem] shadow-[0_32px_80px_-20px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col md:flex-row border border-white/5 bg-[#121218]"
            style={{ 
              background: 'rgba(18, 18, 24, 0.98)',
              backdropFilter: 'blur(24px)',
            }}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e) => e.stopPropagation()} // prevent overlay close
          >
            {/* ── Left Column (Brand / Visual) ── */}
            <div className="hidden md:flex flex-col justify-between w-1/2 p-10 relative overflow-hidden bg-black/50">
              {/* Decorative gradients */}
              <div className="absolute top-0 left-0 w-full h-full opacity-40 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-brand-orange/40 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-0 right-0 w-full h-full opacity-40 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-brand-purple/40 via-transparent to-transparent pointer-events-none" />
              
              {/* Big Watermark Logo */}
              <img 
                src="/logo_a.png" 
                alt="" 
                className="absolute -bottom-[10%] -left-[10%] h-[100%] w-auto max-w-none opacity-40 pointer-events-none z-0"
              />

              {/* Bottom Gradient Overlay for Text Visibility */}
              <div 
                className="absolute bottom-0 left-0 w-full h-[45%] pointer-events-none z-0"
                style={{ background: 'linear-gradient(to top, rgba(0,0,0,1) 0px, rgba(0,0,0,1) 3px, rgba(0,0,0,0.8) 20%, transparent 100%)' }}
              />
              
              <div className="relative z-10 mt-auto">
                <h3 className="font-display text-4xl font-bold text-white leading-[1.15] mb-4 drop-shadow-md">
                  Your creative journey starts here.
                </h3>
                <p className="text-white/60 text-sm leading-relaxed max-w-[85%] font-medium">
                  {initialUsername 
                    ? "Sign in to lock in your unique artist username before the platform launches."
                    : "Join the exclusive waitlist and secure your spot among the world's best emerging artists."}
                </p>
              </div>
            </div>

            {/* ── Right Column (Form) ── */}
            <div className="w-full md:w-1/2 p-6 sm:p-10 relative flex flex-col justify-center min-h-[500px]">
              
              {/* Close button (X) */}
              <button
                type="button"
                onClick={onClose}
                className="absolute top-4 right-4 sm:top-6 sm:right-6 w-8 h-8 rounded-full flex items-center justify-center border border-white/5 bg-white/5 text-white/40 hover:text-white hover:bg-white/10 transition-all duration-300 z-50"
                aria-label="Close modal"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 0 1 1.414 0L10 8.586l4.293-4.293a1 1 0 1 1 1.414 1.414L11.414 10l4.293 4.293a1 1 0 0 1-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 0 1-1.414-1.414L8.586 10 4.293 5.707a1 1 0 0 1 0-1.414z" clipRule="evenodd" />
                </svg>
              </button>

              {/* Mobile Branding (only visible on small screens) */}
              <div className="md:hidden flex flex-col items-center mb-6">
                 {/* Small logo removed */}
              </div>

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
                    className="relative z-10 w-full max-w-sm mx-auto"
                  >
                    {/* Header logic */}
                    {['main', 'phone_entry'].includes(view) && (
                      <div className="text-center mb-8">
                        <h2 className="font-display text-3xl font-bold text-white mb-2">
                          {initialUsername ? (
                            <>Reserve <span style={{ background: 'linear-gradient(135deg, #F25A2B, #7C5CFF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>@{initialUsername.trim().toLowerCase()}</span></>
                          ) : 'Welcome'}
                        </h2>
                        <p className="text-white/50 text-sm font-medium">
                          {initialUsername ? 'Sign in to complete your reservation' : 'Sign in or create an account'}
                        </p>
                      </div>
                    )}

                    {/* ── View: Main (Email/Password) ── */}
                    {view === 'main' && (
                      <>
                        <button
                          type="button"
                          onClick={handleGoogleSignIn}
                          disabled={loading}
                          className="relative flex items-center justify-center w-full py-3.5 px-4 mb-3 rounded-2xl bg-white/5 border border-white/5 text-white font-semibold text-sm
                                     hover:bg-white/10 hover:border-white/10 active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {loading ? (
                            <span className="animate-spin h-5 w-5 border-2 border-white/40 border-t-white rounded-full mr-3" />
                          ) : (
                            <GoogleIcon />
                          )}
                          Continue with Google
                        </button>

                        <button
                          type="button"
                          onClick={() => { setView('phone_entry'); setError(null); }}
                          disabled={loading}
                          className="relative flex items-center justify-center w-full py-3.5 px-4 mb-6 rounded-2xl bg-white/5 border border-white/5 text-white font-semibold text-sm
                                     hover:bg-white/10 hover:border-white/10 active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <PhoneIcon />
                          Continue with Phone
                        </button>

                        <div className="flex items-center gap-4 my-6">
                          <span className="flex-1 h-px bg-gradient-to-r from-transparent to-white/10" />
                          <span className="text-white/30 text-xs font-semibold uppercase tracking-wider">
                            or email
                          </span>
                          <span className="flex-1 h-px bg-gradient-to-l from-transparent to-white/10" />
                        </div>

                        <form onSubmit={handleEmailSubmit} className="space-y-4">
                          <div className="relative group">
                            <input
                              type="email"
                              required
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              placeholder="Email address"
                              className="w-full px-5 py-4 bg-black/40 border border-white/5 rounded-2xl text-white placeholder-white/30 text-sm focus:border-brand-purple/50 focus:ring-1 focus:ring-brand-purple/50 transition-all duration-300 outline-none shadow-inner"
                              autoComplete="email"
                            />
                          </div>

                          <div className="relative group">
                            <input
                              type="password"
                              required
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              placeholder="Password"
                              minLength={6}
                              className="w-full px-5 py-4 bg-black/40 border border-white/5 rounded-2xl text-white placeholder-white/30 text-sm focus:border-brand-purple/50 focus:ring-1 focus:ring-brand-purple/50 transition-all duration-300 outline-none shadow-inner"
                              autoComplete="current-password"
                            />
                          </div>
                          
                          <div className="flex justify-end pt-1 pb-2">
                            <button
                              type="button"
                              onClick={() => { setView('forgot_password'); setError(null); }}
                              className="text-xs font-medium text-brand-purple hover:text-brand-orange transition-colors"
                            >
                              Forgot Password?
                            </button>
                          </div>

                          <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 rounded-2xl font-bold text-sm text-white shadow-[0_4px_14px_0_rgba(124,92,255,0.39)]
                                       transition-all hover:scale-[1.02] hover:shadow-[0_6px_20px_rgba(124,92,255,0.23)] active:scale-[0.98] 
                                       disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                            style={{ background: 'linear-gradient(135deg, #F25A2B 0%, #7C5CFF 100%)' }}
                          >
                            {loading ? (
                              <span className="flex items-center justify-center gap-2">
                                <span className="animate-spin h-4 w-4 border-2 border-white/40 border-t-white rounded-full" />
                                Processing…
                              </span>
                            ) : (
                              'Sign In'
                            )}
                          </button>
                        </form>
                      </>
                    )}

                    {/* ── View: Forgot Password ── */}
                    {view === 'forgot_password' && (
                      <div className="text-center">
                        <div className="mb-8">
                          <h2 className="font-display text-3xl font-bold text-white mb-2">Reset Password</h2>
                          <p className="text-white/50 text-sm font-medium">
                            Enter your email to receive a reset link.
                          </p>
                        </div>

                        {resetEmailSent ? (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-green-500/10 border border-green-500/20 rounded-2xl p-6 mb-6"
                          >
                            <svg className="w-12 h-12 text-green-400 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <h3 className="text-white font-bold mb-1">Check your inbox</h3>
                            <p className="text-white/60 text-xs">We've sent a password reset link to <br/><span className="text-white font-medium">{email}</span></p>
                          </motion.div>
                        ) : (
                          <form onSubmit={handleResetPassword} className="space-y-4 mb-6">
                            <div className="relative group">
                              <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Email address"
                                className="w-full px-5 py-4 bg-black/40 border border-white/5 rounded-2xl text-white placeholder-white/30 text-sm focus:border-brand-purple/50 focus:ring-1 focus:ring-brand-purple/50 transition-all duration-300 outline-none shadow-inner"
                                autoComplete="email"
                                autoFocus
                              />
                            </div>
                            <button
                              type="submit"
                              disabled={loading}
                              className="w-full py-4 rounded-2xl font-bold text-sm text-white shadow-[0_4px_14px_0_rgba(124,92,255,0.39)]
                                         transition-all hover:scale-[1.02] hover:shadow-[0_6px_20px_rgba(124,92,255,0.23)] active:scale-[0.98] 
                                         disabled:opacity-50 disabled:cursor-not-allowed"
                              style={{ background: 'linear-gradient(135deg, #F25A2B 0%, #7C5CFF 100%)' }}
                            >
                              {loading ? 'Sending link…' : 'Send Reset Link'}
                            </button>
                          </form>
                        )}
                        
                        <button
                          type="button"
                          onClick={() => { setView('main'); setResetEmailSent(false); setError(null); }}
                          className="text-sm font-medium text-white/50 hover:text-white transition-colors"
                        >
                          ← Back to Login
                        </button>
                      </div>
                    )}

                    {/* ── View: Phone Number Entry ── */}
                    {view === 'phone_entry' && (
                      <>
                        <form onSubmit={handleSendOtp} className="space-y-4">
                          <div className="relative flex items-center bg-black/40 border border-white/5 rounded-2xl text-white focus-within:border-brand-purple/50 focus-within:ring-1 focus-within:ring-brand-purple/50 transition-all duration-300 shadow-inner overflow-hidden">
                            <span className="pl-5 pr-3 text-white/40 font-mono font-semibold select-none border-r border-white/5 text-sm">+91</span>
                            <input
                              type="tel"
                              required
                              maxLength={10}
                              value={phoneNumber}
                              onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                              placeholder="Phone number"
                              className="w-full px-4 py-4 bg-transparent text-white placeholder-white/30 text-sm outline-none"
                              autoComplete="tel"
                              autoFocus
                            />
                          </div>
                          
                          <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 rounded-2xl font-bold text-sm text-white shadow-[0_4px_14px_0_rgba(124,92,255,0.39)]
                                       transition-all hover:scale-[1.02] hover:shadow-[0_6px_20px_rgba(124,92,255,0.23)] active:scale-[0.98] 
                                       disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{ background: 'linear-gradient(135deg, #F25A2B 0%, #7C5CFF 100%)' }}
                          >
                            {loading ? 'Sending OTP…' : 'Send Code'}
                          </button>
                        </form>

                        <div className="mt-8 text-center">
                          <button
                            type="button"
                            onClick={() => { setView('main'); setError(null); }}
                            className="text-sm font-medium text-white/50 hover:text-white transition-colors"
                          >
                            Use Email or Google instead
                          </button>
                        </div>
                      </>
                    )}

                    {/* ── View: Phone Verify OTP ── */}
                    {view === 'phone_verify' && (
                      <div className="text-center">
                        <div className="mb-8">
                          <h2 className="font-display text-3xl font-bold text-white mb-2">Verify Code</h2>
                          <p className="text-white/50 text-sm font-medium">
                            Sent to <span className="text-white">+91 {phoneNumber}</span>
                          </p>
                        </div>

                        <form onSubmit={handleVerifyOtp} className="space-y-8">
                          {/* ── Segmented OTP Input Grid ── */}
                          <div className="flex justify-between gap-2 max-w-[280px] mx-auto">
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
                                className="w-10 h-12 sm:w-11 sm:h-14 text-center text-xl font-bold font-mono bg-black/40 border border-white/10 rounded-xl text-white focus:border-brand-purple focus:ring-1 focus:ring-brand-purple outline-none transition-all duration-200"
                                style={{ boxShadow: val ? '0 0 15px rgba(124,92,255,0.2)' : 'none' }}
                                initial={{ scale: 0.85, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: idx * 0.05, type: 'spring', stiffness: 300, damping: 20 }}
                              />
                            ))}
                          </div>

                          <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 rounded-2xl font-bold text-sm text-white shadow-[0_4px_14px_0_rgba(124,92,255,0.39)]
                                       transition-all hover:scale-[1.02] hover:shadow-[0_6px_20px_rgba(124,92,255,0.23)] active:scale-[0.98] 
                                       disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{ background: 'linear-gradient(135deg, #F25A2B 0%, #7C5CFF 100%)' }}
                          >
                            {loading ? 'Verifying…' : 'Verify & Continue'}
                          </button>
                        </form>
                        
                        <div className="mt-6">
                          <button
                            type="button"
                            onClick={() => {
                              setView('phone_entry');
                              setOtpCode('');
                              setOtpArray(Array(6).fill(''));
                              setError(null);
                            }}
                            className="text-sm font-medium text-white/50 hover:text-white transition-colors"
                          >
                            Change phone number
                          </button>
                        </div>
                      </div>
                    )}

                    {/* ── View: Collect Phone ── */}
                    {view === 'collect_phone' && (
                      <div className="text-center">
                        <div className="mb-8">
                          <h2 className="font-display text-3xl font-bold text-white mb-2">Almost there</h2>
                          <p className="text-white/50 text-sm font-medium">
                            Add your phone number to secure your account.
                          </p>
                        </div>

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
                          className="space-y-4"
                        >
                          <div className="relative flex items-center bg-black/40 border border-white/5 rounded-2xl text-white focus-within:border-brand-purple/50 focus-within:ring-1 focus-within:ring-brand-purple/50 transition-all duration-300 shadow-inner overflow-hidden">
                            <span className="pl-5 pr-3 text-white/40 font-mono font-semibold select-none border-r border-white/5 text-sm">+91</span>
                            <input
                              type="tel"
                              required
                              maxLength={10}
                              value={extraPhone}
                              onChange={(e) => setExtraPhone(e.target.value.replace(/\D/g, ''))}
                              placeholder="Phone number"
                              className="w-full px-4 py-4 bg-transparent text-white placeholder-white/30 text-sm outline-none"
                              autoComplete="tel"
                              autoFocus
                            />
                          </div>

                          <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 rounded-2xl font-bold text-sm text-white shadow-[0_4px_14px_0_rgba(124,92,255,0.39)]
                                       transition-all hover:scale-[1.02] hover:shadow-[0_6px_20px_rgba(124,92,255,0.23)] active:scale-[0.98] 
                                       disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{ background: 'linear-gradient(135deg, #F25A2B 0%, #7C5CFF 100%)' }}
                          >
                            Continue
                          </button>
                        </form>
                      </div>
                    )}

                    {/* ── View: Collect Email ── */}
                    {view === 'collect_email' && (
                      <div className="text-center">
                        <div className="mb-8">
                          <h2 className="font-display text-3xl font-bold text-white mb-2">Almost there</h2>
                          <p className="text-white/50 text-sm font-medium">
                            Add your email address to secure your account.
                          </p>
                        </div>

                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            if (!extraEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(extraEmail)) {
                              setError('Please enter a valid email address.');
                              return;
                            }
                            setError(null);
                            if (pendingUser) goToProfileStep(pendingUser);
                          }}
                          className="space-y-4"
                        >
                          <div className="relative group">
                            <input
                              type="email"
                              required
                              value={extraEmail}
                              onChange={(e) => setExtraEmail(e.target.value)}
                              placeholder="Email address"
                              className="w-full px-5 py-4 bg-black/40 border border-white/5 rounded-2xl text-white placeholder-white/30 text-sm focus:border-brand-purple/50 focus:ring-1 focus:ring-brand-purple/50 transition-all duration-300 outline-none shadow-inner"
                              autoComplete="email"
                              autoFocus
                            />
                          </div>

                          <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 rounded-2xl font-bold text-sm text-white shadow-[0_4px_14px_0_rgba(124,92,255,0.39)]
                                       transition-all hover:scale-[1.02] hover:shadow-[0_6px_20px_rgba(124,92,255,0.23)] active:scale-[0.98] 
                                       disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{ background: 'linear-gradient(135deg, #F25A2B 0%, #7C5CFF 100%)' }}
                          >
                            Continue
                          </button>
                        </form>
                      </div>
                    )}

                    {/* ── Error message ── */}
                    <AnimatePresence>
                      {error && (
                        <motion.div
                          key="auth-error"
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          className="mt-6 bg-red-500/10 border border-red-500/20 rounded-2xl p-3 flex items-center gap-3"
                          role="alert"
                        >
                          <svg className="w-5 h-5 text-red-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <p className="text-red-400 text-xs font-medium text-left leading-tight">
                            {error}
                          </p>
                        </motion.div>
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
                    className="relative z-10 w-full max-w-sm mx-auto"
                  >
                    {/* ── Progress dots ── */}
                    <div className="flex items-center justify-center gap-1.5 mb-8">
                      {['category', 'genre', 'location', 'links', 'bio', 'profile_pic', 'preview'].map((stepName) => (
                        <div key={stepName} className="h-1.5 rounded-full transition-all duration-300" style={{
                          width: profileSubStep === stepName ? '20px' : '6px',
                          background: profileSubStep === stepName ? 'linear-gradient(90deg,#F25A2B,#7C5CFF)' : 'rgba(255,255,255,0.15)',
                        }} />
                      ))}
                    </div>

                    <AnimatePresence mode="wait">
                      {/* ── Slide 1: Category ── */}
                      {profileSubStep === 'category' && (
                        <motion.div
                          key="profile-category"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ duration: 0.3, ease: 'easeOut' }}
                        >
                          <div className="text-center mb-6">
                            <h2 className="font-display text-3xl font-bold text-white mb-2">What do you do?</h2>
                            <p className="text-white/50 text-sm font-medium">Select your primary creative focus</p>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            {CATEGORIES.map(cat => (
                              <button
                                key={cat.value}
                                type="button"
                                onClick={() => {
                                  setCategory(cat.value);
                                  setSelectedGenres([]);
                                  setProfileSubStep('genre');
                                }}
                                className="px-4 py-4 rounded-2xl text-sm font-semibold transition-all duration-200 text-left bg-white/5 border border-white/5 text-white/70 hover:bg-brand-orange/10 hover:border-brand-orange/30 hover:text-brand-orange hover:-translate-y-0.5"
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
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ duration: 0.3, ease: 'easeOut' }}
                        >
                          <div className="text-center mb-6">
                            <h2 className="font-display text-3xl font-bold text-white mb-2">Your niche</h2>
                            <p className="text-white/50 text-sm font-medium">
                              Select up to 3 genres for{' '}
                              <span className="text-brand-orange font-bold">
                                {CATEGORIES.find(c => c.value === category)?.label}
                              </span>
                            </p>
                          </div>

                          <div className="flex flex-wrap justify-center gap-2.5 mb-8">
                            {activeGenres.map(genre => {
                              const active = selectedGenres.includes(genre);
                              const maxed = !active && selectedGenres.length >= 3;
                              return (
                                <button
                                  key={genre}
                                  type="button"
                                  disabled={maxed}
                                  onClick={() => toggleGenre(genre)}
                                  className="px-4 py-2 rounded-full text-xs font-bold transition-all duration-200"
                                  style={{
                                    background: active ? 'linear-gradient(135deg, rgba(242,90,43,0.15), rgba(124,92,255,0.15))' : 'rgba(255,255,255,0.05)',
                                    border: `1px solid ${active ? 'rgba(124,92,255,0.4)' : maxed ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.08)'}`,
                                    color: active ? '#C4AEFF' : maxed ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.7)',
                                    cursor: maxed ? 'not-allowed' : 'pointer',
                                    transform: active ? 'scale(1.05)' : 'scale(1)',
                                  }}
                                >
                                  {genre}
                                </button>
                              );
                            })}
                          </div>

                          {/* Error */}
                          <AnimatePresence>
                            {error && (
                              <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="mb-4 bg-red-500/10 border border-red-500/20 rounded-xl p-3"
                              >
                                <p className="text-red-400 text-xs text-center font-medium">{error}</p>
                              </motion.div>
                            )}
                          </AnimatePresence>

                          <div className="flex gap-3">
                            <button
                              type="button"
                              onClick={() => { setProfileSubStep('category'); setError(null); }}
                              className="px-5 py-4 rounded-2xl text-sm font-bold bg-white/5 border border-white/5 text-white/50 hover:bg-white/10 hover:text-white transition-all duration-200"
                            >
                              ← Back
                            </button>

                            <button
                              type="button"
                              disabled={selectedGenres.length === 0}
                              onClick={() => { setProfileSubStep('location'); setError(null); }}
                              className="flex-1 py-4 rounded-2xl font-bold text-sm text-white shadow-[0_4px_14px_0_rgba(124,92,255,0.39)]
                                         transition-all hover:scale-[1.02] hover:shadow-[0_6px_20px_rgba(124,92,255,0.23)] active:scale-[0.98] 
                                         disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                              style={{ background: 'linear-gradient(135deg, #F25A2B 0%, #7C5CFF 100%)' }}
                            >
                              Continue →
                            </button>
                          </div>
                        </motion.div>
                      )}

                      {/* ── Slide 3: Location ── */}
                      {profileSubStep === 'location' && (
                        <motion.div
                          key="profile-location"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ duration: 0.3, ease: 'easeOut' }}
                        >
                          <div className="text-center mb-6">
                            <h2 className="font-display text-3xl font-bold text-white mb-2">Where you play</h2>
                            <p className="text-white/50 text-sm font-medium">Helps us route the right gigs your way.</p>
                          </div>

                          <div className="mb-6">
                            <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-3">Base City</label>
                            <div className="flex flex-wrap gap-2">
                              {CITIES.map(c => {
                                const active = !isOtherCity && city === c;
                                return (
                                  <button
                                    key={c}
                                    type="button"
                                    onClick={() => {
                                      setIsOtherCity(false);
                                      setCity(c);
                                    }}
                                    className="px-4 py-2 rounded-full text-xs font-bold transition-all duration-200"
                                    style={{
                                      background: active ? 'linear-gradient(135deg, rgba(242,90,43,0.15), rgba(124,92,255,0.15))' : 'rgba(255,255,255,0.05)',
                                      border: `1px solid ${active ? 'rgba(124,92,255,0.4)' : 'rgba(255,255,255,0.08)'}`,
                                      color: active ? '#C4AEFF' : 'rgba(255,255,255,0.7)',
                                      cursor: 'pointer',
                                      transform: active ? 'scale(1.05)' : 'scale(1)',
                                    }}
                                  >
                                    {c}
                                  </button>
                                );
                              })}
                              <button
                                type="button"
                                onClick={() => {
                                  setIsOtherCity(true);
                                  setCity(customCity);
                                }}
                                className="px-4 py-2 rounded-full text-xs font-bold transition-all duration-200"
                                style={{
                                  background: isOtherCity ? 'linear-gradient(135deg, rgba(242,90,43,0.15), rgba(124,92,255,0.15))' : 'rgba(255,255,255,0.05)',
                                  border: `1px solid ${isOtherCity ? 'rgba(124,92,255,0.4)' : 'rgba(255,255,255,0.08)'}`,
                                  color: isOtherCity ? '#C4AEFF' : 'rgba(255,255,255,0.7)',
                                  cursor: 'pointer',
                                  transform: isOtherCity ? 'scale(1.05)' : 'scale(1)',
                                }}
                              >
                                Other
                              </button>
                            </div>

                            <AnimatePresence>
                              {isOtherCity && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0, marginTop: 0 }}
                                  animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
                                  exit={{ opacity: 0, height: 0, marginTop: 0 }}
                                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                                  style={{ overflow: 'hidden' }}
                                >
                                  <label className="block text-[10px] font-mono uppercase tracking-wider text-white/50 mb-1.5">
                                    Specify City
                                  </label>
                                  <input
                                    type="text"
                                    required
                                    placeholder="Enter your city name"
                                    value={customCity}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      setCustomCity(val);
                                      setCity(val);
                                    }}
                                    className="w-full px-4 py-3 text-sm rounded-xl text-white bg-black/40 border border-white/10 focus:border-[#7C5CFF] outline-none transition-all duration-200"
                                  />
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>

                          <div className="mb-8">
                            <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-3">Event Types You're Up For</label>
                            <div className="flex flex-wrap gap-2">
                              {EVENT_TYPES.map(type => {
                                const active = eventTypes.includes(type);
                                return (
                                  <button
                                    key={type}
                                    type="button"
                                    onClick={() => {
                                      if (active) setEventTypes(eventTypes.filter(t => t !== type));
                                      else setEventTypes([...eventTypes, type]);
                                    }}
                                    className="px-4 py-2 rounded-full text-xs font-bold transition-all duration-200"
                                    style={{
                                      background: active ? 'linear-gradient(135deg, rgba(242,90,43,0.15), rgba(124,92,255,0.15))' : 'rgba(255,255,255,0.05)',
                                      border: `1px solid ${active ? 'rgba(124,92,255,0.4)' : 'rgba(255,255,255,0.08)'}`,
                                      color: active ? '#C4AEFF' : 'rgba(255,255,255,0.7)',
                                      cursor: 'pointer',
                                      transform: active ? 'scale(1.05)' : 'scale(1)',
                                    }}
                                  >
                                    {type}
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          <div className="flex gap-3">
                            <button
                              type="button"
                              onClick={() => { setProfileSubStep('genre'); setError(null); }}
                              className="px-5 py-4 rounded-2xl text-sm font-bold bg-white/5 border border-white/5 text-white/50 hover:bg-white/10 hover:text-white transition-all duration-200"
                            >
                              ← Back
                            </button>

                            <button
                              type="button"
                              disabled={!city}
                              onClick={() => { setProfileSubStep('links'); setError(null); }}
                              className="flex-1 py-4 rounded-2xl font-bold text-sm text-white shadow-[0_4px_14px_0_rgba(124,92,255,0.39)]
                                         transition-all hover:scale-[1.02] hover:shadow-[0_6px_20px_rgba(124,92,255,0.23)] active:scale-[0.98] 
                                         disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                              style={{ background: 'linear-gradient(135deg, #F25A2B 0%, #7C5CFF 100%)' }}
                            >
                              Continue →
                            </button>
                          </div>
                        </motion.div>
                      )}

                      {/* ── Slide 4: Links ── */}
                      {profileSubStep === 'links' && (
                        <motion.div
                          key="profile-links"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ duration: 0.3, ease: 'easeOut' }}
                        >
                          <div className="text-center mb-6">
                            <h2 className="font-display text-3xl font-bold text-white mb-2">Plug in your sound</h2>
                            <p className="text-white/50 text-sm font-medium">Paste any of these — they show up on your profile.</p>
                          </div>

                          <div className="space-y-4 mb-8">
                            <div>
                              <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Instagram <span className="text-[#F25A2B]">*</span></label>
                              <div className="w-full flex items-center bg-black/40 border border-white/5 rounded-xl px-4 py-3 focus-within:border-[#7C5CFF] focus-within:ring-1 focus-within:ring-[#7C5CFF] transition-all">
                                <InstagramIcon className="w-5 h-5 text-[#E1306C] shrink-0 mr-3" />
                                <span className="text-white/30 text-sm select-none font-mono mr-0.5 shrink-0">instagram.com/</span>
                                <input
                                  type="text"
                                  value={getInstagramHandle(instagramUrl)}
                                  onChange={e => setInstagramUrl(makeInstagramUrl(e.target.value))}
                                  placeholder="username"
                                  className="flex-1 bg-transparent border-none p-0 text-white placeholder-white/20 text-sm focus:ring-0 focus:outline-none"
                                />
                              </div>
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Spotify</label>
                              <div className="w-full flex items-center bg-black/40 border border-white/5 rounded-xl px-4 py-3 focus-within:border-[#7C5CFF] focus-within:ring-1 focus-within:ring-[#7C5CFF] transition-all">
                                <SpotifyIcon className="w-5 h-5 text-[#1DB954] shrink-0 mr-3" />
                                <span className="text-white/30 text-sm select-none font-mono mr-0.5 shrink-0">open.spotify.com/artist/</span>
                                <input
                                  type="text"
                                  value={getSpotifyHandle(spotifyUrl)}
                                  onChange={e => setSpotifyUrl(makeSpotifyUrl(e.target.value))}
                                  placeholder="artist_id"
                                  className="flex-1 bg-transparent border-none p-0 text-white placeholder-white/20 text-sm focus:ring-0 focus:outline-none"
                                />
                              </div>
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-2">YouTube</label>
                              <div className="w-full flex items-center bg-black/40 border border-white/5 rounded-xl px-4 py-3 focus-within:border-[#7C5CFF] focus-within:ring-1 focus-within:ring-[#7C5CFF] transition-all">
                                <YouTubeIcon className="w-5 h-5 text-[#FF0000] shrink-0 mr-3" />
                                <span className="text-white/30 text-sm select-none font-mono mr-0.5 shrink-0">youtube.com/@</span>
                                <input
                                  type="text"
                                  value={getYoutubeHandle(youtubeUrl)}
                                  onChange={e => setYoutubeUrl(makeYoutubeUrl(e.target.value))}
                                  placeholder="channel"
                                  className="flex-1 bg-transparent border-none p-0 text-white placeholder-white/20 text-sm focus:ring-0 focus:outline-none"
                                />
                              </div>
                            </div>
                          </div>

                          <div className="flex gap-3">
                            <button
                              type="button"
                              onClick={() => { setProfileSubStep('location'); setError(null); }}
                              className="px-5 py-4 rounded-2xl text-sm font-bold bg-white/5 border border-white/5 text-white/50 hover:bg-white/10 hover:text-white transition-all duration-200"
                            >
                              ← Back
                            </button>

                            <button
                              type="button"
                              disabled={!instagramUrl.trim()}
                              onClick={() => { setProfileSubStep('bio'); setError(null); }}
                              className="flex-1 py-4 rounded-2xl font-bold text-sm text-white shadow-[0_4px_14px_0_rgba(124,92,255,0.39)]
                                         transition-all hover:scale-[1.02] hover:shadow-[0_6px_20px_rgba(124,92,255,0.23)] active:scale-[0.98]
                                         disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                              style={{ background: 'linear-gradient(135deg, #F25A2B 0%, #7C5CFF 100%)' }}
                            >
                              Continue →
                            </button>
                          </div>
                        </motion.div>
                      )}

                      {/* ── Slide 5: Bio ── */}
                      {profileSubStep === 'bio' && (
                        <motion.div
                          key="profile-bio"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ duration: 0.3, ease: 'easeOut' }}
                        >
                          <div className="text-center mb-6">
                            <h2 className="font-display text-3xl font-bold text-white mb-2">Your story, briefly</h2>
                            <p className="text-white/50 text-sm font-medium">A line or two about your sound and your live energy.</p>
                          </div>

                          <div className="mb-8">
                            <textarea
                              value={bio}
                              onChange={e => setBio(e.target.value)}
                              placeholder="e.g. Indie-folk trio out of Bangalore. Mellow weddings, smoky pub sets, the occasional NH7 stage."
                              maxLength={200}
                              rows={5}
                              className="w-full px-5 py-4 bg-black/40 border border-white/5 rounded-2xl text-white placeholder-white/30 text-sm focus:border-[#7C5CFF] focus:ring-1 focus:ring-[#7C5CFF] transition-all duration-300 outline-none resize-none shadow-inner"
                            />
                            <div className="text-right text-xs text-white/40 mt-2">{bio.length} / 200</div>
                          </div>

                          <div className="flex gap-3">
                            <button
                              type="button"
                              onClick={() => { setProfileSubStep('links'); setError(null); }}
                              className="px-5 py-4 rounded-2xl text-sm font-bold bg-white/5 border border-white/5 text-white/50 hover:bg-white/10 hover:text-white transition-all duration-200"
                            >
                              ← Back
                            </button>

                            <button
                              type="button"
                              onClick={() => { setProfileSubStep('profile_pic'); setError(null); }}
                              className="flex-1 py-4 rounded-2xl font-bold text-sm text-white shadow-[0_4px_14px_0_rgba(124,92,255,0.39)]
                                         transition-all hover:scale-[1.02] hover:shadow-[0_6px_20px_rgba(124,92,255,0.23)] active:scale-[0.98]"
                              style={{ background: 'linear-gradient(135deg, #F25A2B 0%, #7C5CFF 100%)' }}
                            >
                              {bio ? 'Continue →' : 'Skip for now →'}
                            </button>
                          </div>
                        </motion.div>
                      )}

                      {/* ── Slide 6: Profile Pic ── */}
                      {profileSubStep === 'profile_pic' && (
                        <motion.div
                          key="profile-pic"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ duration: 0.3, ease: 'easeOut' }}
                        >
                          <div className="text-center mb-6">
                            <h2 className="font-display text-3xl font-bold text-white mb-2">Add a profile picture</h2>
                            <p className="text-white/50 text-sm font-medium">Upload a profile picture to complete your identity.</p>
                          </div>

                          <div className="flex flex-col items-center mb-8">
                            <label className="relative flex flex-col items-center justify-center w-32 h-32 bg-black/40 border-2 border-dashed border-white/20 rounded-full cursor-pointer hover:border-[#7C5CFF]/50 transition-colors overflow-hidden">
                              {profilePhotoPreview ? (
                                <img src={profilePhotoPreview} alt="Profile preview" className="w-full h-full object-cover" />
                              ) : (
                                <>
                                  <svg className="w-8 h-8 text-white/40 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                                  <span className="text-xs text-white/40 font-medium">Upload</span>
                                </>
                              )}
                              <input 
                                type="file" 
                                className="hidden" 
                                accept="image/*"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    setProfilePhotoFile(file);
                                    const reader = new FileReader();
                                    reader.onload = (ev) => {
                                      setCropperImageSrc(ev.target?.result as string);
                                      setCropperOpen(true);
                                    };
                                    reader.readAsDataURL(file);
                                  }
                                }}
                              />
                            </label>
                          </div>

                          <div className="flex gap-3">
                            <button
                              type="button"
                              onClick={() => { setProfileSubStep('bio'); setError(null); }}
                              className="px-5 py-4 rounded-2xl text-sm font-bold bg-white/5 border border-white/5 text-white/50 hover:bg-white/10 hover:text-white transition-all duration-200"
                            >
                              ← Back
                            </button>

                            <button
                              type="button"
                              disabled={!profilePhotoFile}
                              onClick={() => { setProfileSubStep('preview'); setError(null); }}
                              className="flex-1 py-4 rounded-2xl font-bold text-sm text-white shadow-[0_4px_14px_0_rgba(124,92,255,0.39)]
                                         transition-all hover:scale-[1.02] hover:shadow-[0_6px_20px_rgba(124,92,255,0.23)] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                              style={{ background: 'linear-gradient(135deg, #F25A2B 0%, #7C5CFF 100%)' }}
                            >
                              Continue →
                            </button>
                          </div>
                        </motion.div>
                      )}

                      {/* ── Slide 7: Preview ── */}
                      {profileSubStep === 'preview' && (
                        <motion.div
                          key="profile-preview"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ duration: 0.3, ease: 'easeOut' }}
                        >
                          <div className="text-center mb-6">
                            <h2 className="font-display text-3xl font-bold text-white mb-2">Looking good</h2>
                            <p className="text-white/50 text-sm font-medium">This is what clients will see on your profile.</p>
                          </div>

                          <div className="mb-8 p-[2px] rounded-[2rem] relative group" style={{ background: 'linear-gradient(135deg, rgba(124,92,255,0.4) 0%, rgba(242,90,43,0.2) 100%)' }}>
                            <div className="w-full aspect-[4/5] rounded-[1.9rem] overflow-hidden relative bg-[#0A0A0E]">
                              {profilePhotoPreview ? (
                                <img src={profilePhotoPreview} alt="Profile Preview" className="w-full h-full object-cover opacity-90 transition-transform duration-700 group-hover:scale-105" />
                              ) : (
                                <div className="w-full h-full bg-gradient-to-br from-[#7C5CFF]/10 to-[#D4567A]/10 flex items-center justify-center">
                                  <span className="text-4xl font-display font-black text-white/20">NO PHOTO</span>
                                </div>
                              )}
                              <div className="absolute inset-0 bg-gradient-to-t from-[#050508] via-[#050508]/40 to-transparent" />
                              <div className="absolute bottom-6 left-6 right-6">
                                <span className="inline-block px-3 py-1.5 bg-[#7C5CFF]/20 border border-[#7C5CFF]/30 backdrop-blur-md rounded-full text-[10px] font-bold text-[#7C5CFF] tracking-widest uppercase mb-3 shadow-[0_4px_12px_rgba(124,92,255,0.2)]">
                                  {category}
                                </span>
                                <h3 className="text-white text-3xl font-display font-black tracking-tight mb-1">{pendingUser?.displayName || 'Artist'}</h3>
                                <p className="text-white/70 text-xs font-medium font-mono">{selectedGenres.join(' • ')} {city ? `• ${city}` : ''}</p>
                              </div>
                            </div>
                            <div className="absolute top-6 right-6 px-3 py-1 bg-black/40 backdrop-blur-xl border border-white/10 rounded-full flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-[#7C5CFF] animate-pulse" />
                              <span className="text-[10px] font-mono font-bold text-white/80">@{initialUsername?.toLowerCase()}</span>
                            </div>
                          </div>

                          <div className="flex gap-3">
                            <button
                              type="button"
                              onClick={() => { setProfileSubStep('profile_pic'); setError(null); }}
                              className="px-5 py-4 rounded-2xl text-sm font-bold bg-white/5 border border-white/5 text-white/50 hover:bg-white/10 hover:text-white transition-all duration-200"
                            >
                              ← Back
                            </button>

                            <button
                              type="button"
                              disabled={loading}
                              onClick={(e) => handleProfileSubmit(e as any)}
                              className="flex-1 py-4 rounded-2xl font-bold text-sm text-white shadow-[0_4px_14px_0_rgba(124,92,255,0.39)]
                                         transition-all hover:scale-[1.02] hover:shadow-[0_6px_20px_rgba(124,92,255,0.23)] active:scale-[0.98] 
                                         disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                              style={{ background: 'linear-gradient(135deg, #F25A2B 0%, #7C5CFF 100%)' }}
                            >
                              {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                  <span className="animate-spin h-4 w-4 border-2 border-black/40 border-t-black rounded-full" />
                                  Publishing…
                                </span>
                              ) : 'Looks good, publish →'}
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
                    className="relative z-10 w-full"
                  >
                    <SuccessConfirmation username={reservedUsername} onClose={onClose} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>

    <ImageCropperModal
      isOpen={cropperOpen}
      imageSrc={cropperImageSrc}
      aspectRatio={300/220}
      targetWidth={900}
      targetHeight={660}
      onCrop={(croppedBase64) => {
        setProfilePhotoPreview(croppedBase64);
        setCropperOpen(false);
      }}
      onClose={() => {
        setCropperOpen(false);
      }}
    />
    </Fragment>
  );
}
