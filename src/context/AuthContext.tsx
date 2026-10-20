"use client";

import {
  createContext,
  useEffect,
  useState,
  useMemo,
  type ReactNode,
} from "react";
import type { User } from "firebase/auth";

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
    // Firebase is large, so it loads after the page has painted instead of
    // blocking the first render on every page.
    let unsubscribe: (() => void) | undefined;
    let cancelled = false;

    const start = async () => {
      const [{ onAuthStateChanged }, { auth, isFirebaseConfigured }] = await Promise.all([
        import("firebase/auth"),
        import("@/lib/firebase/client"),
      ]);
      if (cancelled) return;
      if (!isFirebaseConfigured) {
        setLoading(false);
        return;
      }
      unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
        setUser(firebaseUser);
        setLoading(false);
      });
    };

    const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number; cancelIdleCallback?: (id: number) => void };
    const idle = w.requestIdleCallback ? w.requestIdleCallback(() => void start(), { timeout: 1500 }) : window.setTimeout(() => void start(), 200);

    return () => {
      cancelled = true;
      if (w.cancelIdleCallback) w.cancelIdleCallback(idle);
      else window.clearTimeout(idle);
      unsubscribe?.();
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ user, loading }),
    [user, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
