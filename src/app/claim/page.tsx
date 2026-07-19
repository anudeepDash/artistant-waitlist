'use client';

import { useState, useEffect, useRef, useCallback, Fragment, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, Sparkles, Check, X, AlertCircle, Upload, Camera, 
  Music, MapPin, ArrowRight, CheckCircle2,
  ExternalLink, LogOut, ArrowLeft, ShieldAlert
} from 'lucide-react';

const InstagramIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

const YoutubeIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path>
    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon>
  </svg>
);

import { useAuth } from '@/hooks/useAuth';
import { getReservationById, getUserReservation, isUsernameAvailable, type WaitlistEntry, type ArtistCategory } from '@/lib/waitlist';
import { changeUsernameAction, updateProfileDetailsAction, uploadProfilePhotoAction, linkImportedProfile } from '@/lib/profile-actions';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AuthModal from '@/components/AuthModal';
import ImageCropperModal from '@/components/ImageCropperModal';

const CATEGORIES: { value: ArtistCategory; label: string }[] = [
  { value: 'singer', label: 'Singer / Vocalist' },
  { value: 'dj', label: 'DJ / Producer' },
  { value: 'band', label: 'Music Band' },
  { value: 'comedian', label: 'Comedian' },
  { value: 'dancer', label: 'Dancer / Choreographer' },
  { value: 'mc_rapper', label: 'MC / Rapper' },
  { value: 'instrumentalist', label: 'Instrumentalist' },
  { value: 'other', label: 'Other Creator' }
];

function ClaimOnboardingContent() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const claimId = searchParams.get('id');

  // Stepper state: 1 = Claim Username, 2 = Sign In Prompt, 3 = Profile Details Review
  const [wizardStep, setWizardStep] = useState<1 | 2 | 3>(1);

  // Reservation details
  const [reservation, setReservation] = useState<WaitlistEntry | null>(null);
  const [checkingReservation, setCheckingReservation] = useState(true);

  // Form states
  const [username, setUsername] = useState('');
  const [originalUsername, setOriginalUsername] = useState('');
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [usernameError, setUsernameError] = useState<string | null>(null);

  const [displayName, setDisplayName] = useState('');
  const [category, setCategory] = useState<ArtistCategory | ''>('');
  const [genres, setGenres] = useState('');
  const [city, setCity] = useState('');
  const [bio, setBio] = useState('');
  const [spotifyUrl, setSpotifyUrl] = useState('');
  const [instagramUrl, setInstagramUrl] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [youtubeChannelUrl, setYoutubeChannelUrl] = useState('');

  // Photo uploads
  const [profilePhotoPreview, setProfilePhotoPreview] = useState<string | null>(null);
  const [profilePhotoFile, setProfilePhotoFile] = useState<File | null>(null);
  const [cropperOpen, setCropperOpen] = useState(false);
  const [cropperImageSrc, setCropperImageSrc] = useState<string>('');
  const [pendingFileExt, setPendingFileExt] = useState('jpg');

  // Page level states
  const [isSubmitLoading, setIsSubmitLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Check username availability as user types
  useEffect(() => {
    if (!username || username === originalUsername) {
      setUsernameAvailable(null);
      setCheckingUsername(false);
      setUsernameError(null);
      return;
    }

    const usernameRegex = /^[a-zA-Z0-9_.]{3,30}$/;
    if (!usernameRegex.test(username)) {
      setUsernameAvailable(false);
      setUsernameError('3-30 letters, numbers, underscores or dots only');
      return;
    }

    setCheckingUsername(true);
    setUsernameError(null);

    const debounce = setTimeout(async () => {
      try {
        const available = await isUsernameAvailable(username);
        setUsernameAvailable(available);
        if (!available) {
          setUsernameError('This username is already taken');
        }
      } catch (err) {
        console.error(err);
      } finally {
        setCheckingUsername(false);
      }
    }, 450);

    return () => clearTimeout(debounce);
  }, [username, originalUsername]);

  // Load user reservation by ID or fallback to user matching
  const fetchReservation = useCallback(async () => {
    setCheckingReservation(true);
    try {
      if (claimId) {
        const res = await getReservationById(claimId);
        if (res) {
          setReservation(res);
          setUsername(res.username || '');
          setOriginalUsername(res.username || '');
          setDisplayName(res.display_name || '');
          setCategory(res.category || '');
          setGenres(res.genres?.join(', ') || '');
          setCity(res.city || '');
          setBio(res.bio || '');
          setSpotifyUrl(res.spotify_url || '');
          setInstagramUrl(res.instagram_url || '');
          setYoutubeUrl(res.youtube_url || '');
          setYoutubeChannelUrl(res.youtube_channel_url || '');
          setProfilePhotoPreview(res.profile_photo_url || null);
          setCheckingReservation(false);
          return;
        }
      }

      // Fallback: if user is logged in, try to fetch by user details
      if (user) {
        const res = await getUserReservation(user.uid, user.email, user.phoneNumber);
        if (res) {
          setReservation(res);
          setUsername(res.username || '');
          setOriginalUsername(res.username || '');
          setDisplayName(res.display_name || '');
          setCategory(res.category || '');
          setGenres(res.genres?.join(', ') || '');
          setCity(res.city || '');
          setBio(res.bio || '');
          setSpotifyUrl(res.spotify_url || '');
          setInstagramUrl(res.instagram_url || '');
          setYoutubeUrl(res.youtube_url || '');
          setYoutubeChannelUrl(res.youtube_channel_url || '');
          setProfilePhotoPreview(res.profile_photo_url || null);
          setWizardStep(3); // Go straight to step 3 if already logged in and linked
        } else {
          setReservation(null);
        }
      } else {
        setReservation(null);
      }
    } catch (e) {
      console.error('Error fetching waitlist entry:', e);
    } finally {
      setCheckingReservation(false);
    }
  }, [user, claimId]);

  useEffect(() => {
    if (!authLoading) {
      fetchReservation();
    }
  }, [user, authLoading, fetchReservation]);

  // Handle Account linking when signing in during step 2
  useEffect(() => {
    if (user && reservation && wizardStep === 2) {
      const linkProfileAndAdvance = async () => {
        try {
          const idToken = await user.getIdToken();
          await linkImportedProfile(idToken, reservation.id);
          setOriginalUsername(username); // Set username claimed
          setWizardStep(3); // Advance to details review step
        } catch (e: any) {
          console.error(e);
          setFormError(e?.message || 'Failed to secure profile to this account. Please try again.');
        }
      };
      linkProfileAndAdvance();
    }
  }, [user, reservation, wizardStep, username]);

  const handleStep1Next = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || usernameError || checkingUsername) return;

    if (user) {
      // If already logged in, automatically link and go to step 3
      const autoLink = async () => {
        if (!reservation) return;
        try {
          const idToken = await user.getIdToken();
          await linkImportedProfile(idToken, reservation.id);
          setOriginalUsername(username);
          setWizardStep(3);
        } catch (e: any) {
          setFormError(e?.message || 'Failed to secure profile.');
        }
      };
      autoLink();
    } else {
      // Prompt user to sign in
      setWizardStep(2);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setFormError(null);
    setIsSubmitLoading(true);

    try {
      const idToken = await user.getIdToken();

      // 1. Check & change username if it changed
      if (username.trim().toLowerCase() !== originalUsername.trim().toLowerCase()) {
        if (usernameAvailable === false) {
          throw new Error('Please pick a unique, available username.');
        }
        await changeUsernameAction(idToken, username);
      }

      // 2. Upload profile photo if a new one was selected
      let uploadedPhotoUrl = profilePhotoPreview;
      if (profilePhotoFile && profilePhotoPreview && profilePhotoPreview.startsWith('data:')) {
        uploadedPhotoUrl = await uploadProfilePhotoAction(idToken, profilePhotoPreview, pendingFileExt);
      }

      // 3. Update details
      const parsedGenres = genres
        .split(',')
        .map(g => g.trim())
        .filter(g => g.length > 0);

      await updateProfileDetailsAction(idToken, {
        display_name: displayName,
        category: category || undefined,
        genres: parsedGenres,
        city: city,
        bio: bio,
        instagram_url: instagramUrl || undefined,
        spotify_url: spotifyUrl || undefined,
        youtube_url: youtubeUrl || undefined,
        youtube_channel_url: youtubeChannelUrl || undefined
      });

      setFormSuccess(true);
      setTimeout(() => {
        router.push('/dashboard');
      }, 2500);

    } catch (err: any) {
      console.error(err);
      setFormError(err?.message || 'Failed to update profile details. Please try again.');
    } finally {
      setIsSubmitLoading(false);
    }
  };

  return (
    <Fragment>
      <div className="min-h-screen bg-black text-white relative overflow-hidden flex flex-col font-sans">
        
        {/* Glow Accents */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] aspect-square rounded-full bg-[#F25A2B]/10 blur-[120px] pointer-events-none z-0" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] aspect-square rounded-full bg-[#7C5CFF]/10 blur-[120px] pointer-events-none z-0" />

        <Navbar 
          user={user} 
          userReservation={reservation} 
          onSignInClick={() => setIsAuthModalOpen(true)} 
          onSignOut={async () => {
            const { signOut } = await import('firebase/auth');
            const { auth: clientAuth } = await import('@/lib/firebase/client');
            await signOut(clientAuth);
            setReservation(null);
            setWizardStep(1);
            router.push('/');
          }}
          onProfileClick={() => router.push('/dashboard')}
        />

        <main className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 z-10 mt-16 md:mt-20">
          <div className="w-full max-w-2xl">
            
            {/* Header Description */}
            <div className="text-center mb-8 space-y-3">
              <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold tracking-widest uppercase bg-[#7C5CFF]/10 text-[#7C5CFF] border border-[#7C5CFF]/20">
                Founding Artist Onboarding
              </span>
              <h1 className="text-3xl md:text-5xl font-black uppercase font-display tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
                Claim Your Profile
              </h1>
              <p className="text-sm text-zinc-400 max-w-sm mx-auto">
                {wizardStep === 1 && "Start by securing your custom stage username handle."}
                {wizardStep === 2 && "Sign in with any account to verify and secure your waitlist reservation."}
                {wizardStep === 3 && "Review and finish building your professional live portfolio website."}
              </p>
            </div>

            {/* Stepper Progress Bar */}
            {reservation && !formSuccess && (
              <div className="flex justify-between items-center max-w-xs mx-auto mb-10 relative">
                <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[1px] bg-white/5 z-0" />
                <div 
                  className="absolute left-0 top-1/2 -translate-y-1/2 h-[1px] bg-[#7C5CFF] z-0 transition-all duration-500" 
                  style={{ width: `${(wizardStep - 1) * 50}%` }}
                />
                
                {[1, 2, 3].map((step) => {
                  const isActive = wizardStep >= step;
                  const isCurrent = wizardStep === step;
                  return (
                    <div 
                      key={step} 
                      className={`relative z-10 w-7 h-7 rounded-full flex items-center justify-center font-mono text-[10px] font-bold border transition-all duration-500 ${
                        isActive 
                          ? 'bg-[#07090E] border-[#7C5CFF] text-[#7C5CFF] shadow-[0_0_12px_rgba(124,92,255,0.25)]' 
                          : 'bg-[#07090E] border-white/5 text-zinc-600'
                      }`}
                    >
                      {isCurrent ? <span className="animate-pulse">●</span> : step}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Stepper Content */}
            <AnimatePresence mode="wait">
              {authLoading || checkingReservation ? (
                <motion.div 
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center py-20 space-y-4"
                >
                  <div className="relative w-12 h-12 flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full border-2 border-white/5 border-t-[#7C5CFF] animate-spin" />
                    <Sparkles className="w-4 h-4 text-[#7C5CFF] animate-pulse" />
                  </div>
                  <span className="text-xs font-mono text-zinc-400 tracking-wider">Resolving claim token...</span>
                </motion.div>
              ) : !reservation ? (
                <motion.div
                  key="no_reservation"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="rounded-3xl border border-rose-500/10 bg-rose-500/[0.01] backdrop-blur-md p-8 md:p-12 text-center space-y-6 shadow-2xl"
                >
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-rose-500/10 flex items-center justify-center border border-rose-500/20">
                    <ShieldAlert className="w-8 h-8 text-rose-500" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-white">Invalid or Expired Link</h3>
                    <p className="text-sm text-zinc-400 max-w-sm mx-auto">
                      We couldn't resolve your waitlist profile using this link. Please check your onboarding email or sign in directly.
                    </p>
                  </div>
                  <div className="flex justify-center gap-3">
                    <button
                      onClick={() => router.push('/')}
                      className="px-6 py-3.5 rounded-xl font-mono text-xs font-bold uppercase tracking-wider bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all"
                    >
                      Go to Home
                    </button>
                    <button
                      onClick={() => setIsAuthModalOpen(true)}
                      className="px-6 py-3.5 rounded-xl font-mono text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-[#F25A2B] to-[#7C5CFF] text-white hover:shadow-lg transition-all"
                    >
                      Sign In Directly
                    </button>
                  </div>
                </motion.div>
              ) : formSuccess ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="rounded-3xl border border-emerald-500/10 bg-emerald-500/[0.01] backdrop-blur-md p-10 text-center space-y-6 shadow-2xl"
                >
                  <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 text-emerald-400">
                    <CheckCircle2 className="w-8 h-8 animate-bounce" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold text-white">Profile Claimed!</h3>
                    <p className="text-sm text-emerald-400/80 font-mono">@{username}</p>
                    <p className="text-sm text-zinc-400 max-w-sm mx-auto pt-2">
                      Your unique artist handle and portfolio are secured. Launching your dashboard...
                    </p>
                  </div>
                  <div className="inline-flex items-center gap-1.5 text-[10px] font-mono text-zinc-500 uppercase tracking-widest animate-pulse">
                    Redirecting to Dashboard
                  </div>
                </motion.div>
              ) : wizardStep === 1 ? (
                /* Step 1: Claim Username Handle */
                <motion.form
                  key="step1_username"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  onSubmit={handleStep1Next}
                  className="space-y-6"
                >
                  <div className="p-8 rounded-3xl border border-white/5 bg-white/[0.02] backdrop-blur-md space-y-5 shadow-2xl text-left">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-[#7C5CFF]" />
                      <h3 className="text-sm font-bold uppercase tracking-wider font-mono text-[#7C5CFF]">Stage Handle</h3>
                    </div>
                    
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400">
                        Choose Your Unique @username
                      </label>
                      <div className="relative flex items-center">
                        <span className="absolute left-4 text-xs font-mono text-zinc-500">artistant.in/</span>
                        <input
                          type="text"
                          required
                          value={username}
                          onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_.]/g, ''))}
                          placeholder="yourname"
                          className="w-full bg-white/[0.02] border border-white/[0.08] focus:border-[#7C5CFF] rounded-2xl pl-[84px] pr-10 py-3.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-[#7C5CFF]/15 transition-all font-mono"
                        />
                        <div className="absolute right-4 flex items-center">
                          {checkingUsername && (
                            <div className="w-4 h-4 rounded-full border border-white/10 border-t-[#7C5CFF] animate-spin" />
                          )}
                          {!checkingUsername && usernameAvailable === true && (
                            <Check className="w-4 h-4 text-emerald-400" />
                          )}
                          {!checkingUsername && usernameAvailable === false && (
                            <X className="w-4 h-4 text-rose-500" />
                          )}
                        </div>
                      </div>
                      
                      {usernameError ? (
                        <p className="text-[10px] font-mono text-rose-400">{usernameError}</p>
                      ) : (
                        <p className="text-[10px] font-mono text-zinc-500">
                          {username === originalUsername 
                            ? 'Keep your current reserved stage handle or claim a new one.' 
                            : 'This is the public URL link clients will use to book you.'}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="text-center">
                    <button
                      type="submit"
                      disabled={checkingUsername || (username !== originalUsername && usernameAvailable === false)}
                      className="w-full py-4 rounded-2xl font-mono font-bold text-xs tracking-wider uppercase text-white bg-gradient-to-r from-[#F25A2B] to-[#7C5CFF] hover:shadow-[0_0_24px_rgba(124,92,255,0.3)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                    >
                      Confirm Username & Secure Account
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.form>
              ) : wizardStep === 2 ? (
                /* Step 2: Sign-in / Authenticate Prompt */
                <motion.div
                  key="step2_auth"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="rounded-3xl border border-white/5 bg-white/[0.02] backdrop-blur-md p-8 md:p-12 text-center space-y-6 shadow-2xl"
                >
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-[#F25A2B]/10 to-[#7C5CFF]/10 flex items-center justify-center border border-[#7C5CFF]/20">
                    <User className="w-8 h-8 text-[#7C5CFF]" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-white">Secure Your Account</h3>
                    <p className="text-sm text-zinc-400 max-w-sm mx-auto">
                      To complete claiming <strong className="text-[#7C5CFF]">@{username}</strong>, secure your account by signing in or signing up.
                    </p>
                    <p className="text-xs text-zinc-500 max-w-xs mx-auto pt-1 font-mono">
                      (You can use **any** Google, Email, or Phone credentials. Your waitlist profile will automatically migrate to your logged-in session.)
                    </p>
                  </div>

                  {formError && (
                    <div className="flex gap-3 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs text-left items-start">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{formError}</span>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          const { signInWithGoogle } = await import('@/lib/auth');
                          await signInWithGoogle();
                        } catch (e: any) {
                          console.error(e);
                          setFormError(e?.message || 'Google authentication failed.');
                        }
                      }}
                      className="px-6 py-3.5 rounded-xl font-mono text-xs font-bold uppercase tracking-wider bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
                        <path d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.187 4.114-3.58 0-6.49-2.91-6.49-6.49s2.91-6.49 6.49-6.49c1.696 0 3.238.653 4.4 1.716l3.14-3.14C19.29 1.76 15.94 0 12.24 0 5.48 0 0 5.48 0 12.24s5.48 12.24 12.24 12.24c6.88 0 12.24-5.48 12.24-12.24 0-.84-.08-1.63-.24-2.39H12.24z"/>
                      </svg>
                      Continue with Google
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsAuthModalOpen(true)}
                      className="px-6 py-3.5 rounded-xl font-mono text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-[#F25A2B] to-[#7C5CFF] text-white hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      Use Email or Phone
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => setWizardStep(1)}
                    className="text-[10px] font-mono text-zinc-500 hover:text-zinc-300 uppercase tracking-widest block mx-auto pt-2 cursor-pointer"
                  >
                    ← Back to stage handle
                  </button>
                </motion.div>
              ) : (
                /* Step 3: Complete & Edit Profile Details */
                <motion.form
                  key="step3_profile"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  onSubmit={handleSubmit}
                  className="space-y-6"
                >
                  {formError && (
                    <div className="flex gap-3 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs items-start">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{formError}</span>
                    </div>
                  )}

                  {/* Basic Profile Setup */}
                  <div className="p-6 rounded-3xl border border-white/5 bg-white/[0.02] backdrop-blur-md space-y-6 text-left">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-[#F25A2B]" />
                      <h3 className="text-sm font-bold uppercase tracking-wider font-mono text-[#F25A2B]">Profile Details</h3>
                    </div>

                    {/* Profile Photo upload */}
                    <div className="flex items-center gap-4 border-b border-white/5 pb-6">
                      <div className="relative group">
                        <div className="w-20 h-20 rounded-2xl overflow-hidden border border-white/10 bg-white/[0.01] flex items-center justify-center">
                          {profilePhotoPreview ? (
                            <img src={profilePhotoPreview} alt="Crop preview" className="w-full h-full object-cover" />
                          ) : (
                            <User className="w-8 h-8 text-zinc-600" />
                          )}
                        </div>
                        <label className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                          <Camera className="w-4 h-4 text-white" />
                          <input 
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              setProfilePhotoFile(file);
                              const reader = new FileReader();
                              reader.onload = (ev) => {
                                setCropperImageSrc(ev.target?.result as string);
                                setPendingFileExt(file.name.split('.').pop() || 'jpg');
                                setCropperOpen(true);
                                e.target.value = '';
                              };
                              reader.readAsDataURL(file);
                            }} 
                          />
                        </label>
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white">Profile Photo</h4>
                        <p className="text-[10px] text-zinc-400 mt-0.5">Recommended crop: 3:2 layout profile ratio.</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Display Name */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400">Display Name</label>
                        <input
                          type="text"
                          required
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                          placeholder="e.g. Jasmine Sandlas"
                          className="bg-white/[0.02] border border-white/[0.08] focus:border-[#F25A2B] rounded-2xl px-4 py-3.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-[#F25A2B]/15 transition-all"
                        />
                      </div>

                      {/* Category Selection */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400">Artist Type</label>
                        <select
                          required
                          value={category}
                          onChange={(e) => setCategory(e.target.value as ArtistCategory)}
                          className="bg-[#121214] border border-white/[0.08] focus:border-[#F25A2B] rounded-2xl px-4 py-3.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-[#F25A2B]/15 transition-all"
                        >
                          <option value="" disabled>Select category...</option>
                          {CATEGORIES.map((c) => (
                            <option key={c.value} value={c.value}>{c.label}</option>
                          ))}
                        </select>
                      </div>

                      {/* Genres tags */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400">Genres (Comma separated)</label>
                        <input
                          type="text"
                          value={genres}
                          onChange={(e) => setGenres(e.target.value)}
                          placeholder="e.g. Pop, Bollywood, Folk"
                          className="bg-white/[0.02] border border-white/[0.08] focus:border-[#F25A2B] rounded-2xl px-4 py-3.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-[#F25A2B]/15 transition-all"
                        />
                      </div>

                      {/* Location City */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400">Base Location City</label>
                        <div className="relative flex items-center">
                          <MapPin className="absolute left-4 w-3.5 h-3.5 text-zinc-500" />
                          <input
                            type="text"
                            required
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            placeholder="e.g. Mumbai, India"
                            className="w-full bg-white/[0.02] border border-white/[0.08] focus:border-[#F25A2B] rounded-2xl pl-10 pr-4 py-3.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-[#F25A2B]/15 transition-all"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Bio */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400">Short Bio</label>
                      <textarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder="Tell clients about your performance styles, shows, and experience..."
                        rows={4}
                        className="bg-white/[0.02] border border-white/[0.08] focus:border-[#F25A2B] rounded-2xl px-4 py-3.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-[#F25A2B]/15 transition-all resize-none"
                      />
                    </div>
                  </div>

                  {/* Socials & Gigs */}
                  <div className="p-6 rounded-3xl border border-white/5 bg-white/[0.02] backdrop-blur-md space-y-6 text-left">
                    <div className="flex items-center gap-2">
                      <Music className="w-4 h-4 text-purple-400" />
                      <h3 className="text-sm font-bold uppercase tracking-wider font-mono text-purple-400">Music & Video Links</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Spotify */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400">Spotify Artist Link</label>
                        <div className="relative flex items-center">
                          <Music className="absolute left-4 w-3.5 h-3.5 text-zinc-500" />
                          <input
                            type="url"
                            value={spotifyUrl}
                            onChange={(e) => setSpotifyUrl(e.target.value)}
                            placeholder="https://open.spotify.com/artist/..."
                            className="w-full bg-white/[0.02] border border-white/[0.08] focus:border-purple-400 rounded-2xl pl-10 pr-4 py-3.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-[#7C5CFF]/15 transition-all"
                          />
                        </div>
                      </div>

                      {/* Instagram */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400">Instagram Handle / URL</label>
                        <div className="relative flex items-center">
                          <InstagramIcon className="absolute left-4 w-3.5 h-3.5 text-zinc-500" />
                          <input
                            type="text"
                            value={instagramUrl}
                            onChange={(e) => setInstagramUrl(e.target.value)}
                            placeholder="https://instagram.com/..."
                            className="w-full bg-white/[0.02] border border-white/[0.08] focus:border-purple-400 rounded-2xl pl-10 pr-4 py-3.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-[#7C5CFF]/15 transition-all"
                          />
                        </div>
                      </div>

                      {/* Youtube Video Showreel */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400">YouTube Showreel Video URL</label>
                        <div className="relative flex items-center">
                          <YoutubeIcon className="absolute left-4 w-3.5 h-3.5 text-zinc-500" />
                          <input
                            type="url"
                            value={youtubeUrl}
                            onChange={(e) => setYoutubeUrl(e.target.value)}
                            placeholder="https://youtube.com/watch?v=..."
                            className="w-full bg-white/[0.02] border border-white/[0.08] focus:border-purple-400 rounded-2xl pl-10 pr-4 py-3.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-[#7C5CFF]/15 transition-all"
                          />
                        </div>
                      </div>

                      {/* Youtube Channel URL */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400">YouTube Channel URL</label>
                        <div className="relative flex items-center">
                          <YoutubeIcon className="absolute left-4 w-3.5 h-3.5 text-zinc-500" />
                          <input
                            type="url"
                            value={youtubeChannelUrl}
                            onChange={(e) => setYoutubeChannelUrl(e.target.value)}
                            placeholder="https://youtube.com/@..."
                            className="w-full bg-white/[0.02] border border-white/[0.08] focus:border-purple-400 rounded-2xl pl-10 pr-4 py-3.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-[#7C5CFF]/15 transition-all"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Submission Row */}
                  <div className="pt-4 text-center">
                    <button
                      type="submit"
                      disabled={isSubmitLoading || checkingUsername || (username !== originalUsername && usernameAvailable === false)}
                      className="w-full py-4 rounded-2xl font-mono font-bold text-xs tracking-wider uppercase text-white bg-gradient-to-r from-[#F25A2B] to-[#7C5CFF] hover:shadow-[0_0_24px_rgba(124,92,255,0.3)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {isSubmitLoading ? (
                        <>
                          <div className="w-4 h-4 rounded-full border border-white/20 border-t-white animate-spin" />
                          Saving Portfolio Details...
                        </>
                      ) : (
                        <>
                          Claim Stage Handle & Save Profile
                          <ArrowRight className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>

          </div>
        </main>

        <Footer />
      </div>

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        initialUsername={username} 
      />

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

export default function ClaimOnboardingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center text-zinc-500 font-mono text-xs">Loading onboarding...</div>}>
      <ClaimOnboardingContent />
    </Suspense>
  );
}
