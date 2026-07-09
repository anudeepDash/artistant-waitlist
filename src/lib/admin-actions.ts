'use server';

import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { type AdminWaitlistEntry } from './waitlist';

/**
 * Creates a server-side Supabase client.
 * If SUPABASE_SERVICE_ROLE_KEY is provided in the environment variables,
 * it returns an admin client that bypasses Row Level Security (RLS).
 * Otherwise, it falls back to the anonymous client (requiring DB RPC functions).
 */
function createAdminClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    return createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      }
    );
  }

  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRoleKey,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );
}

/**
 * Server Action to fetch all waitlist registrations.
 * Performs passcode validation on the server side.
 */
export async function adminGetRegistrationsAction(passcode: string): Promise<AdminWaitlistEntry[]> {
  if (passcode !== 'ARTISTANT_ADMIN_2026') {
    throw new Error('Invalid admin passcode');
  }

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const client = createAdminClient();

  if (serviceRoleKey) {
    // Service Role Client: query the table directly bypassing RLS
    const { data, error } = await client
      .from('waitlist_users')
      .select('*')
      .order('position_override', { nullsFirst: false, ascending: true })
      .order('reserved_at', { ascending: false });

    if (error) {
      console.error('Error fetching registrations directly:', error);
      throw error;
    }

    return (data || []) as AdminWaitlistEntry[];
  } else {
    // Fallback: call the RPC function (requires execute grant for anon/authenticated roles)
    const { data, error } = await client.rpc('admin_get_registrations', {
      p_passcode: passcode,
    });

    if (error) {
      console.error('Error calling admin_get_registrations RPC:', error);
      throw error;
    }

    return (data || []) as AdminWaitlistEntry[];
  }
}

/**
 * Server Action to update a waitlist user's registration status.
 * Performs passcode validation on the server side.
 */
export async function adminUpdateRegistrationAction(
  passcode: string,
  userId: string,
  isVerified: boolean,
  isBlocked: boolean,
  positionOverride?: number | null
): Promise<void> {
  if (passcode !== 'ARTISTANT_ADMIN_2026') {
    throw new Error('Invalid admin passcode');
  }

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const client = createAdminClient();

  if (serviceRoleKey) {
    // Service Role Client: update table directly bypassing RLS
    const { error } = await client
      .from('waitlist_users')
      .update({
        is_verified: isVerified,
        is_blocked: isBlocked,
        position_override: positionOverride !== undefined ? positionOverride : null,
      })
      .eq('user_id', userId);

    if (error) {
      console.error('Error updating registration status directly:', error);
      throw error;
    }
  } else {
    // Fallback: call the RPC function
    const { error } = await client.rpc('admin_update_registration', {
      p_passcode: passcode,
      p_user_id: userId,
      p_is_verified: isVerified,
      p_is_blocked: isBlocked,
      p_position_override: positionOverride !== undefined ? positionOverride : null,
    });

    if (error) {
      console.error('Error calling admin_update_registration RPC:', error);
      throw error;
    }
  }
}
