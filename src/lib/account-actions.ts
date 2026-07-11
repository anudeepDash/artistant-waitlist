'use server';

import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { verifyIdToken } from './firebase/admin';

/**
 * Server Action to permanently delete all personal data for a user.
 * Verifies the caller's identity via Firebase ID token to prevent IDOR.
 */
export async function deleteAccountDataAction(idToken: string): Promise<void> {
  // Verify the caller's identity — only they can delete their own data
  const decoded = await verifyIdToken(idToken);
  const userId = decoded.uid;

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    console.warn('SUPABASE_SERVICE_ROLE_KEY missing. Cannot perform secure deletion.');
    throw new Error('Server configuration error. Cannot process deletion at this time.');
  }

  const client = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRoleKey,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );

  // 1. Delete the user's primary waitlist profile
  const { error: waitlistError } = await client
    .from('waitlist_users')
    .delete()
    .eq('user_id', userId);

  if (waitlistError) {
    console.error('Error deleting user profile: [REDACTED_ERROR]');
    throw new Error('Failed to delete primary profile data.');
  }

  // 2. Delete any tracked activity logs
  const { error: logsError } = await client
    .from('activity_logs')
    .delete()
    .eq('user_id', userId);

  if (logsError) {
    console.error('Error deleting user activity logs: [REDACTED_ERROR]');
    // We don't strictly throw here to ensure the flow continues,
    // but the primary profile is already deleted.
  }
}
