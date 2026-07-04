import { auth, isFirebaseConfigured } from "./firebase/client";
import { 
  GoogleAuthProvider, 
  signInWithPopup, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut 
} from "firebase/auth";

const CONFIG_ERROR = "Firebase authentication is not configured in your .env.local file. Please set NEXT_PUBLIC_FIREBASE_API_KEY.";

/**
 * Initiates Google OAuth sign-in via Firebase.
 */
export async function signInWithGoogle() {
  if (!isFirebaseConfigured) {
    throw new Error(CONFIG_ERROR);
  }
  const provider = new GoogleAuthProvider();
  // Prompt user to select account always
  provider.setCustomParameters({ prompt: 'select_account' });
  const result = await signInWithPopup(auth, provider);
  return result;
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
