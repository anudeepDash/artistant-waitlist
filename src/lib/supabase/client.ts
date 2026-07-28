import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { auth as firebaseAuth } from "../firebase/client";

let cachedToken: string | null = null;
let cachedUid: string | null = null;
let cachedTokenExpiry = 0;

/**
 * Custom fetch wrapper that attaches the Firebase ID token as a
 * Bearer Authorization header on every Supabase request.
 * Caches the token in memory to avoid asynchronous token resolution overhead on every query.
 */
async function firebaseTokenFetch(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  const headers = new Headers(init?.headers);

  try {
    const user = firebaseAuth.currentUser;
    if (user) {
      const now = Date.now();
      // If user changed or token is missing/expiring (valid for 1h, refresh after 45m), fetch fresh token
      if (!cachedToken || cachedUid !== user.uid || now > cachedTokenExpiry) {
        cachedToken = await user.getIdToken(false);
        cachedUid = user.uid;
        cachedTokenExpiry = now + 45 * 60 * 1000;
      }
      headers.set("Authorization", `Bearer ${cachedToken}`);
    } else {
      cachedToken = null;
      cachedUid = null;
      cachedTokenExpiry = 0;
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
