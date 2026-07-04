"use client";

import {
  createContext,
  useEffect,
  useState,
  useMemo,
  type ReactNode,
} from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth, isFirebaseConfigured } from "@/lib/firebase/client";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface AuthContextValue {
  /** The currently authenticated Firebase user, or `null` when signed out. */
  user: User | null;
  /** `true` while the initial auth state is still being resolved. */
  loading: boolean;
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

export const AuthContext = createContext<AuthContextValue | null>(null);

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Wraps the application and keeps auth state in sync with Firebase Auth
 * while automatically mapping the Firebase JWT session token to Supabase
 * for database queries.
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!isFirebaseConfigured) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ user, loading }),
    [user, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
