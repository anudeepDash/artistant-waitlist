import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { auth as firebaseAuth } from "../firebase/client";

/**
 * Custom fetch wrapper that attaches the Firebase ID token as a
 * Bearer Authorization header on every Supabase request.
 * This avoids calling supabase.auth.setSession() (which requires GoTrue)
 * and instead passes the JWT directly at the HTTP level.
 */
async function firebaseTokenFetch(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  const headers = new Headers(init?.headers);

  try {
    const user = firebaseAuth.currentUser;
    if (user) {
      const token = await user.getIdToken();
      headers.set("Authorization", `Bearer ${token}`);
    }
  } catch (e) {
    // Non-blocking — fail silently and let Supabase use anon access
    console.warn("Could not attach Firebase token to Supabase request:", e);
  }

  return fetch(input, { ...init, headers });
}

let supabaseInstance: ReturnType<typeof createSupabaseClient> | null = null;

export function createClient() {
  if (typeof window === "undefined") {
    // SSR / build — no Firebase auth available, return a plain client
    return createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );
  }

  if (!supabaseInstance) {
    supabaseInstance = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: { fetch: firebaseTokenFetch },
        auth: {
          // Disable GoTrue's own session management — we handle auth via Firebase
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false,
        },
      },
    );
  }

  return supabaseInstance;
}
