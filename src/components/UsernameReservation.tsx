'use client';

import { useState, useEffect, useCallback, type FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '@/hooks/useAuth';
import { isUsernameAvailable, reserveUsername } from '@/lib/waitlist';
import { sendWelcomeEmailAction } from '@/lib/email-actions';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface UsernameReservationProps {
  /** Called with the reserved username after a successful reservation. */
  onSuccess: (username: string) => void;
  /** Optional initial username to pre-fill the input field. */
  initialUsername?: string;
}

/**
 * Represents every possible state of the availability check so we can
 * drive both the UI indicator and button-disabled logic from one value.
 */
type AvailabilityStatus =
  | 'idle'       // User hasn't typed anything yet
  | 'invalid'    // Input fails client-side validation
  | 'checking'   // Firestore lookup in-flight
  | 'available'  // Username is free
  | 'taken'      // Username already reserved by someone else
  | 'error';     // Unexpected Firestore / network error

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

/** 3-20 chars, starts with a letter, alphanumeric + underscores only. */
const USERNAME_REGEX = /^[a-z][a-z0-9_]{2,19}$/;

/**
 * Returns a human-readable validation message, or `null` when the input is
 * valid. Runs entirely on the client before any Firestore call.
 */
function validateUsername(raw: string): string | null {
  if (raw.length === 0) return null; // Treat empty as "idle", not invalid
  if (raw.length < 3) return 'Must be at least 3 characters';
  if (raw.length > 20) return 'Must be 20 characters or fewer';
  if (!/^[a-z]/.test(raw)) return 'Must start with a letter';
  if (/\s/.test(raw)) return 'Spaces are not allowed';
  if (!/^[a-z0-9_]+$/.test(raw)) return 'Only letters, numbers, and underscores';
  if (!USERNAME_REGEX.test(raw)) return 'Invalid username format';
  return null;
}

// ---------------------------------------------------------------------------
// Motion variants
// ---------------------------------------------------------------------------

/** Fade-in for the entire component on mount. */
const wrapperVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
  },
};

/** Slide-and-fade used for switching status indicators. */
const statusVariants = {
  initial: { opacity: 0, x: -8 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.25 } },
  exit: { opacity: 0, x: 8, transition: { duration: 0.15 } },
};

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

/** Tiny animated spinner used for "Checking…" and "Reserving…" states. */
function Spinner({ className = '' }: { className?: string }) {
  return (
    <svg
      className={`animate-spin h-5 w-5 ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

/**
 * **UsernameReservation** — the core artist-only username claim form.
 */
export default function UsernameReservation({
  onSuccess,
  initialUsername,
}: UsernameReservationProps) {
  // ── Auth state ────────────────────────────────────────────────────────
  const { user } = useAuth();

  // ── Local state ───────────────────────────────────────────────────────
  const [username, setUsername] = useState(initialUsername || '');
  const [status, setStatus] = useState<AvailabilityStatus>('idle');
  const [validationMsg, setValidationMsg] = useState<string | null>(null);
  const [reserving, setReserving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // ── Debounced availability check ──────────────────────────────────────
  useEffect(() => {
    // Reset on every keystroke
    setErrorMsg(null);

    // Normalise (lowercase, trimmed)
    const normalised = username.trim().toLowerCase();

    // Nothing typed → idle
    if (normalised.length === 0) {
      setStatus('idle');
      setValidationMsg(null);
      return;
    }

    // Client-side validation first
    const msg = validateUsername(normalised);
    if (msg) {
      setStatus('invalid');
      setValidationMsg(msg);
      return;
    }

    // Passed validation — start debounce for Firestore look-up
    setStatus('checking');
    setValidationMsg(null);

    const timer = setTimeout(async () => {
      try {
        const available = await isUsernameAvailable(normalised);
        // Guard: user may have kept typing while we were awaiting
        setStatus(available ? 'available' : 'taken');
      } catch {
        setStatus('error');
        setErrorMsg('Could not check availability. Please try again.');
      }
    }, 500);

    // Cleanup: cancel the pending timer when the user types again
    return () => clearTimeout(timer);
  }, [username]);

  // ── Input handler ─────────────────────────────────────────────────────
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      // Force lowercase, strip spaces in real-time
      const raw = e.target.value.toLowerCase().replace(/\s/g, '');
      setUsername(raw);
    },
    [],
  );

  // ── Reserve handler ───────────────────────────────────────────────────
  const handleReserve = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();

      if (!user) {
        setErrorMsg('You must be signed in to reserve a username.');
        return;
      }

      const normalised = username.trim().toLowerCase();
      if (!USERNAME_REGEX.test(normalised) || status !== 'available') return;

      setReserving(true);
      setErrorMsg(null);

      try {
        const ref = typeof window !== 'undefined' ? localStorage.getItem('artistant_ref') || undefined : undefined;
        await reserveUsername({
          uid: user.uid,
          username: normalised,
          email: user.email ?? '',
          displayName: user.displayName ?? user.email ?? normalised,
          role: 'artist', // Waitlist is artists-only
          referredBy: ref,
        });

        // Trigger welcome email notification in the background
        sendWelcomeEmailAction({
          email: user.email ?? '',
          name: user.displayName ?? user.email ?? normalised,
          username: normalised,
        }).catch(err => console.error("Error sending welcome email:", err));

        onSuccess(normalised);
      } catch (err: unknown) {
        // Surface the actual error message
        const message = err && typeof err === 'object' && 'message' in err
          ? String((err as { message: string }).message)
          : err instanceof Error ? err.message : 'Something went wrong.';

        if (message.toLowerCase().includes('already taken')) {
          setStatus('taken');
          setErrorMsg('That username was just claimed! Try another.');
        } else if (message.toLowerCase().includes('already reserved')) {
          setErrorMsg('You already have a reserved username.');
        } else {
          setErrorMsg(message);
        }
      } finally {
        setReserving(false);
      }
    },
    [user, username, status, onSuccess],
  );

  // ── Derived helpers ───────────────────────────────────────────────────
  const isButtonDisabled =
    status !== 'available' || reserving || username.length === 0;

  // ── Render ────────────────────────────────────────────────────────────
  return (
    <motion.form
      onSubmit={handleReserve}
      variants={wrapperVariants}
      initial="hidden"
      animate="visible"
      className="w-full max-w-md mx-auto space-y-5"
    >
      {/* ── Username input with '@' prefix ── */}
      <div>
        <div className="relative flex items-center">
          {/* Static '@' prefix */}
          <span className="absolute left-4 text-xl font-display text-text-muted select-none pointer-events-none">
            @
          </span>

          <input
            type="text"
            value={username}
            onChange={handleChange}
            placeholder="your_artist_name"
            maxLength={20}
            autoComplete="off"
            spellCheck={false}
            aria-label="Choose your artist username"
            className="input-field w-full text-xl pl-10 pr-4 py-3 font-display tracking-wide"
          />
        </div>

        {/* ── Status indicator (animated swap) ── */}
        <div className="mt-2 h-6 flex items-center" aria-live="polite">
          <AnimatePresence mode="wait">
            {/* Checking availability */}
            {status === 'checking' && (
              <motion.span
                key="checking"
                variants={statusVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="flex items-center gap-1.5 text-sm text-text-muted"
              >
                <Spinner className="text-text-muted" />
                Checking…
              </motion.span>
            )}

            {/* Username is available */}
            {status === 'available' && (
              <motion.span
                key="available"
                variants={statusVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="flex items-center gap-1.5 text-sm font-medium"
                style={{ color: 'var(--good)' }}
              >
                <span className="text-base">✓</span>
                Username available!
              </motion.span>
            )}

            {/* Username is taken */}
            {status === 'taken' && (
              <motion.span
                key="taken"
                variants={statusVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="flex items-center gap-1.5 text-sm font-medium"
                style={{ color: 'var(--hot)' }}
              >
                <span className="text-base">✗</span>
                Username taken
              </motion.span>
            )}

            {/* Client-side validation failure */}
            {status === 'invalid' && validationMsg && (
              <motion.span
                key="invalid"
                variants={statusVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="flex items-center gap-1.5 text-sm"
                style={{ color: 'var(--warm)' }}
              >
                <span className="text-base">⚠</span>
                {validationMsg}
              </motion.span>
            )}

            {/* Firestore / network error */}
            {status === 'error' && errorMsg && (
              <motion.span
                key="error"
                variants={statusVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="flex items-center gap-1.5 text-sm"
                style={{ color: 'var(--hot)' }}
              >
                <span className="text-base">⚠</span>
                {errorMsg}
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── Reserve button ── */}
      <motion.button
        type="submit"
        disabled={isButtonDisabled}
        whileHover={isButtonDisabled ? {} : { scale: 1.03 }}
        whileTap={isButtonDisabled ? {} : { scale: 0.97 }}
        className={`
          rounded-full w-full py-3
          text-white font-semibold text-lg font-display
          transition-opacity duration-200
          flex items-center justify-center gap-2
          ${isButtonDisabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
        `}
        style={{ background: 'linear-gradient(135deg, #F25A2B, #D4567A, #7C5CFF)' }}
      >
        {reserving ? (
          <>
            <Spinner className="text-white" />
            Reserving…
          </>
        ) : (
          <>Reserve @{username || '...'}</>
        )}
      </motion.button>

      {/* ── Submission-level error banner ── */}
      <AnimatePresence>
        {errorMsg && status !== 'error' && (
          <motion.p
            key="submit-error"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="text-sm text-center"
            style={{ color: 'var(--hot)' }}
            role="alert"
          >
            {errorMsg}
          </motion.p>
        )}
      </AnimatePresence>
    </motion.form>
  );
}
