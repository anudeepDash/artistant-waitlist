import { cert, getApps, initializeApp, type App } from 'firebase-admin/app';
import { getAuth, type DecodedIdToken } from 'firebase-admin/auth';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// ---------------------------------------------------------------------------
// Firebase Admin SDK — Singleton Initialization
// ---------------------------------------------------------------------------

const projectId =
  process.env.FIREBASE_ADMIN_PROJECT_ID ??
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

function getOrInitApp(): App {
  const existingApps = getApps();
  if (existingApps.length > 0) {
    return existingApps[0];
  }

  // When a private key is provided (local dev / CI), use explicit credentials.
  // Otherwise fall back to Application Default Credentials (Google Cloud / Vercel OIDC).
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;

  if (privateKey) {
    return initializeApp({
      credential: cert({
        projectId,
        clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
        // Environment variables collapse literal "\n" — restore them.
        privateKey: privateKey.replace(/\\n/g, '\n'),
      }),
    });
  }

  return initializeApp({ projectId });
}

const app = getOrInitApp();
const auth = getAuth(app);

// ---------------------------------------------------------------------------
// Token verification helpers
// ---------------------------------------------------------------------------

/**
 * Verify a Firebase ID token and return the decoded claims.
 */
export async function verifyIdToken(idToken: string): Promise<DecodedIdToken> {
  return auth.verifyIdToken(idToken);
}

/**
 * Verify that the caller is an admin user.
 *
 * A user is considered an admin if their email:
 *  1. Matches the hardcoded super-admin address, OR
 *  2. Exists in the `admin_users` Supabase table.
 *
 * @returns The decoded token when the caller is authorized.
 * @throws  {Error} With message `'Unauthorized'` otherwise.
 */
export async function verifyAdminToken(
  idToken: string,
): Promise<DecodedIdToken> {
  const decoded = await verifyIdToken(idToken);
  const email = decoded.email;

  if (!email) {
    throw new Error('Unauthorized');
  }

  // Fast-path: super-admin
  const SUPER_ADMIN = process.env.SUPER_ADMIN_EMAIL;
  if (SUPER_ADMIN && email === SUPER_ADMIN.trim().toLowerCase()) {
    return decoded;
  }

  // Check the admin_users table via Supabase (service-role client)
  const supabase = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    },
  );

  const { data, error } = await supabase
    .from('admin_users')
    .select('email')
    .eq('email', email)
    .maybeSingle();

  if (error || !data) {
    throw new Error('Unauthorized');
  }

  return decoded;
}

// ---------------------------------------------------------------------------
// Utility helpers
// ---------------------------------------------------------------------------

/**
 * Escape special characters for safe HTML insertion.
 */
export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
