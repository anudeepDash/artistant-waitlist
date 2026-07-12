import { auth, isFirebaseConfigured } from "./firebase/client";
import { 
  GoogleAuthProvider, 
  signInWithPopup, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut
} from "firebase/auth";
import { sendPasswordResetEmailAction } from "./email-actions";

const CONFIG_ERROR = "Firebase authentication is not configured in your .env.local file. Please set NEXT_PUBLIC_FIREBASE_API_KEY.";

let activeGoogleSignInPromise: Promise<any> | null = null;

/**
 * Initiates Google OAuth sign-in via Firebase.
 */
export async function signInWithGoogle() {
  if (!isFirebaseConfigured) {
    throw new Error(CONFIG_ERROR);
  }
  if (activeGoogleSignInPromise) {
    return activeGoogleSignInPromise;
  }
  const provider = new GoogleAuthProvider();
  // Prompt user to select account always
  provider.setCustomParameters({ prompt: 'select_account' });
  
  activeGoogleSignInPromise = signInWithPopup(auth, provider);
  try {
    const result = await activeGoogleSignInPromise;
    return result;
  } finally {
    activeGoogleSignInPromise = null;
  }
}

/**
 * Signs up a user with email and password via Firebase.
 */
export async function signUpWithEmail(email: string, password: string) {
  if (!isFirebaseConfigured) {
    throw new Error(CONFIG_ERROR);
  }
  const result = await createUserWithEmailAndPassword(auth, email, password);
  return result;
}

/**
 * Signs in a user with email and password via Firebase.
 */
export async function signInWithEmail(email: string, password: string) {
  if (!isFirebaseConfigured) {
    throw new Error(CONFIG_ERROR);
  }
  const result = await signInWithEmailAndPassword(auth, email, password);
  return result;
}

/**
 * Signs the current user out of Firebase.
 */
export async function signOut() {
  if (!isFirebaseConfigured) {
    return;
  }
  await firebaseSignOut(auth);
}

/**
 * Sends a custom themed password reset email to the given email address.
 */
export async function resetPassword(email: string) {
  if (!isFirebaseConfigured) {
    throw new Error(CONFIG_ERROR);
  }
  const res = await sendPasswordResetEmailAction(email);
  if (!res.success) {
    throw new Error(res.message);
  }
}
