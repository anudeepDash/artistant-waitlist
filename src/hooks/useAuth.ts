"use client";

import { useContext } from "react";
import { AuthContext, type AuthContextValue } from "@/context/AuthContext";

/**
 * Returns the current Firebase auth state from {@link AuthContext}.
 *
 * Must be used inside an `<AuthProvider>`. Throws at runtime if the provider
 * is missing so the mistake is surfaced immediately during development.
 *
 * @example
 * ```tsx
 * const { user, loading } = useAuth();
 * if (loading) return <Spinner />;
 * if (!user) return <SignInPage />;
 * ```
 */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (context === null) {
    throw new Error(
      "useAuth() was called outside of <AuthProvider>. " +
        "Wrap your component tree with <AuthProvider> in a parent layout.",
    );
  }

  return context;
}
