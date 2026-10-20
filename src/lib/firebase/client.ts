import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, initializeRecaptchaConfig, type Auth } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "artistant-15c32.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "artistant-15c32",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "artistant-15c32.appspot.com",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "",
};

// Check if credentials are set (not empty, undefined, or default mock placeholder)
export const isFirebaseConfigured = !!(
  firebaseConfig.apiKey && 
  firebaseConfig.apiKey.trim() !== "" && 
  firebaseConfig.apiKey !== "fallback-key"
);

let auth: Auth;

if (isFirebaseConfigured) {
  const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  auth = getAuth(app);
  // Enable bypassing reCAPTCHA check in local development for test phone numbers
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    (auth as any).appVerificationDisabledForTesting = true;
  }
} else {
  // Safe mock fallback for build compile-time and local environment setups without keys
  auth = {} as Auth;
}

let recaptchaConfigPromise: Promise<void> | null = null;

/**
 * Loads the reCAPTCHA Enterprise config used by Identity Platform sign-in flows.
 * Called lazily when a sign-in starts instead of on every page view (it costs a network request).
 */
export function ensureRecaptchaConfig(): Promise<void> {
  if (!isFirebaseConfigured || typeof window === 'undefined') return Promise.resolve();
  if (!recaptchaConfigPromise) {
    recaptchaConfigPromise = initializeRecaptchaConfig(auth).catch((err) => {
      console.warn("reCAPTCHA config init skipped:", err?.message);
      (window as any).__recaptchaConfigError = err?.message || String(err);
    });
  }
  return recaptchaConfigPromise;
}

export { auth };
