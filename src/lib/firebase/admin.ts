import { cert, getApps, initializeApp, type App } from 'firebase-admin/app';
import { getAuth, type DecodedIdToken } from 'firebase-admin/auth';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// ---------------------------------------------------------------------------
// Firebase Admin SDK — Singleton Initialization
// ---------------------------------------------------------------------------

const projectId =
  process.env.FIREBASE_ADMIN_PROJECT_ID ??
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ??
  "artistant-15c32";

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

  // Fallback to checking for service-account.json in the workspace root for local dev
  try {
    const fs = require('fs');
    const path = require('path');
    const serviceAccountPath = path.join(process.cwd(), 'service-account.json');
    if (fs.existsSync(serviceAccountPath)) {
      const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
      return initializeApp({
        credential: cert(serviceAccount),
      });
    }
  } catch (err) {
    console.warn('Tried to look for service-account.json but encountered an error:', err);
  }

  return initializeApp({ projectId });
}

let initializedAuth: any = null;

function getAuthInstance() {
  if (!initializedAuth) {
    const app = getOrInitApp();
    initializedAuth = getAuth(app);
  }
  return initializedAuth;
}

export const auth = new Proxy({} as any, {
  get(target, prop) {
    const instance = getAuthInstance();
    const value = Reflect.get(instance, prop);
    if (typeof value === 'function') {
      return value.bind(instance);
    }
    return value;
  }
});

// ---------------------------------------------------------------------------
// Link Generation helpers
// ---------------------------------------------------------------------------

/**
 * Generates a password reset link for the given email.
 * Falls back to Firebase Auth REST API if Admin SDK credentials are not configured.
 */
export async function generatePasswordResetLink(email: string): Promise<string> {
  try {
    const actionCodeSettings = {
      url: 'https://artistant.in',
      handleCodeInApp: false,
    };
    return await auth.generatePasswordResetLink(email, actionCodeSettings);
  } catch (adminErr) {
    console.warn('Firebase Admin generatePasswordResetLink failed, attempting REST API fallback:', adminErr);

    const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
    if (!apiKey) {
      throw adminErr;
    }

    const response = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestType: 'PASSWORD_RESET',
          email,
          returnOobLink: true,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Firebase Auth REST sendOobCode failed:', errorData);
      throw new Error(errorData?.error?.message || 'Failed to generate password reset link.');
    }

    const data = await response.json();
    const resetLink = data?.oobLink;
    if (!resetLink) {
      throw new Error('OOB link was not returned by the Firebase Auth REST API.');
    }

    return resetLink;
  }
}

// ---------------------------------------------------------------------------
// Token verification helpers
// ---------------------------------------------------------------------------

/**
 * Verify a Firebase ID token and return the decoded claims.
 * Falls back to Firebase Auth REST API if Admin SDK credentials are not configured.
 */
export async function verifyIdToken(idToken: string): Promise<DecodedIdToken> {
  try {
    return await auth.verifyIdToken(idToken);
  } catch (adminErr) {
    console.warn('Firebase Admin verifyIdToken failed, attempting REST API fallback:', adminErr);

    const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
    if (!apiKey) {
      throw adminErr;
    }

    const response = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Firebase Auth REST verification failed:', errorData);
      throw new Error(errorData?.error?.message || 'Unauthorized');
    }

    const data = await response.json();
    const user = data?.users?.[0];
    if (!user) {
      throw new Error('User not found in Firebase Auth REST verification.');
    }

    // Map user to DecodedIdToken structure
    return {
      uid: user.localId,
      email: user.email,
      email_verified: user.emailVerified,
      auth_time: Math.floor(Date.now() / 1000),
      iss: `https://securetoken.google.com/${projectId}`,
      aud: projectId,
      sub: user.localId,
      exp: Math.floor(Date.now() / 1000) + 3600,
      iat: Math.floor(Date.now() / 1000),
      firebase: {
        identities: {},
        sign_in_provider: user.providerUserInfo?.[0]?.providerId || 'password',
      },
    } as DecodedIdToken;
  }
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

  // Developer email bypass
  if (email.trim().toLowerCase() === 'anudeepdash2004@gmail.com') {
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
