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

/**
 * Checks if a user email is an authorized administrator.
 * Matches against the hardcoded super-admin fallback or the admin_users database table.
 */
export async function checkIsAdminAction(email: string): Promise<boolean> {
  if (!email) return false;
  const normalised = email.trim().toLowerCase();
  
  if (normalised === 'anudeepdash2004@gmail.com') {
    return true;
  }

  const client = createAdminClient();
  try {
    const { data, error } = await client
      .from('admin_users')
      .select('email')
      .eq('email', normalised)
      .maybeSingle();

    if (error) {
      console.warn('Error reading admin_users table (tables may not be migrated yet):', error.message);
      return false;
    }
    return !!data;
  } catch (err) {
    console.error('Exception verifying admin status:', err);
    return false;
  }
}

/**
 * Server Action to fetch all activity logs.
 */
export async function adminGetActivityLogsAction(passcode: string): Promise<any[]> {
  if (passcode !== 'ARTISTANT_ADMIN_2026') {
    throw new Error('Invalid admin passcode');
  }

  const client = createAdminClient();
  const { data, error } = await client
    .from('activity_logs')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching activity logs:', error);
    throw error;
  }
  return data || [];
}

/**
 * Server Action to fetch all authorized admin members.
 */
export async function adminGetAdminsAction(passcode: string): Promise<any[]> {
  if (passcode !== 'ARTISTANT_ADMIN_2026') {
    throw new Error('Invalid admin passcode');
  }

  const client = createAdminClient();
  const { data, error } = await client
    .from('admin_users')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching admin list:', error);
    throw error;
  }
  return data || [];
}

/**
 * Server Action to add a new admin email.
 */
export async function adminAddAdminAction(
  passcode: string,
  email: string,
  addedBy: string
): Promise<void> {
  if (passcode !== 'ARTISTANT_ADMIN_2026') {
    throw new Error('Invalid admin passcode');
  }
  if (!email) {
    throw new Error('Email is required');
  }

  const client = createAdminClient();
  const { error } = await client
    .from('admin_users')
    .insert({
      email: email.trim().toLowerCase(),
      added_by: addedBy.trim()
    });

  if (error) {
    console.error('Error adding admin member:', error);
    throw error;
  }
}

/**
 * Server Action to remove an admin email.
 */
export async function adminRemoveAdminAction(passcode: string, email: string): Promise<void> {
  if (passcode !== 'ARTISTANT_ADMIN_2026') {
    throw new Error('Invalid admin passcode');
  }
  if (!email) {
    throw new Error('Email is required');
  }
  if (email.trim().toLowerCase() === 'anudeepdash2004@gmail.com') {
    throw new Error('Super-admin cannot be deleted.');
  }

  const client = createAdminClient();
  const { error } = await client
    .from('admin_users')
    .delete()
    .eq('email', email.trim().toLowerCase());

  if (error) {
    console.error('Error removing admin member:', error);
    throw error;
  }
}

/**
 * Server Action to log visitor and member activities.
 * Can be called anonymously by visitors or signed-in members.
 */
export async function logActivityAction(input: {
  userId?: string;
  email?: string;
  username?: string;
  actionType: string;
  userAgent?: string;
  referrer?: string;
}): Promise<void> {
  const allowedTypes = ['visit', 'login', 'waitlist_register'];
  if (!allowedTypes.includes(input.actionType)) {
    throw new Error('Invalid activity type');
  }

  const client = createAdminClient();
  const { error } = await client
    .from('activity_logs')
    .insert({
      user_id: input.userId || null,
      email: input.email || null,
      username: input.username || null,
      action_type: input.actionType,
      user_agent: input.userAgent || null,
      referrer: input.referrer || null
    });

  if (error) {
    console.warn('Error recording activity log (table may not be migrated yet):', error.message);
  }
}

export interface PublicLeaderboardEntry {
  username: string;
  display_name: string | null;
  role: string | null;
  is_verified: boolean;
  points: number;
  referrals_count: number;
  story_shared: boolean;
}

/**
 * Server Action to fetch waitlist leaderboard and current user's waitlist placement stats.
 */
export async function getWaitlistDashboardDataAction(userId: string): Promise<{
  leaderboard: PublicLeaderboardEntry[];
  currentUserStats: {
    points: number;
    verifiedReferrals: number;
    unverifiedReferrals: number;
    rank: number;
    cohort: string;
    storyShared: boolean;
  } | null;
  foundingArtists: PublicLeaderboardEntry[];
  totalArtistsCount: number;
  foundingLimit: number;
}> {
  const client = createAdminClient();
  
  // 1. Fetch all registrations (with story_shared if available)
  const { data, error } = await client
    .from('waitlist_users')
    .select('user_id, username, display_name, role, is_verified, referred_by, reserved_at, story_shared')
    .eq('is_blocked', false);
    
  let users = data || [];
  
  if (error) {
    // If story_shared column doesn't exist yet, retry without it
    const isColumnError = 
      error.code === 'PGRST204' || 
      error.code === 'PGRST200' || 
      error.code === '42703' || 
      (error.message && (
        error.message.includes('story_shared') || 
        error.message.includes('column') || 
        error.message.includes('does not exist')
      ));
    if (isColumnError) {
      const { data: fallbackData, error: fallbackError } = await client
        .from('waitlist_users')
        .select('user_id, username, display_name, role, is_verified, referred_by, reserved_at')
        .eq('is_blocked', false);
      if (fallbackError) throw fallbackError;
      users = (fallbackData || []).map(u => ({ ...u, story_shared: false }));
    } else {
      throw error;
    }
  }

  // 2. Count verified and unverified referrals
  const verifiedReferralsMap: Record<string, number> = {};
  const unverifiedReferralsMap: Record<string, number> = {};
  
  users.forEach(u => {
    if (u.referred_by) {
      const ref = u.referred_by.toLowerCase().trim();
      if (u.is_verified) {
        verifiedReferralsMap[ref] = (verifiedReferralsMap[ref] || 0) + 1;
      } else {
        unverifiedReferralsMap[ref] = (unverifiedReferralsMap[ref] || 0) + 1;
      }
    }
  });

  // 3. Compute points and map to leaderboard entries
  const mapped = users.map(u => {
    const usernameKey = u.username.toLowerCase().trim();
    const verifiedRefs = verifiedReferralsMap[usernameKey] || 0;
    const storyShared = u.story_shared === true; // Handle null/undefined values
    const points = 100 + (verifiedRefs * 50) + (storyShared ? 80 : 0);
    
    return {
      user_id: u.user_id,
      username: u.username,
      display_name: u.display_name,
      role: u.role,
      is_verified: u.is_verified,
      points,
      referrals_count: verifiedRefs,
      story_shared: storyShared,
      reserved_at: u.reserved_at
    };
  });

  // 4. Sort entries by points desc, then by reserved_at asc
  const sorted = [...mapped].sort((a, b) => {
    if (b.points !== a.points) {
      return b.points - a.points;
    }
    return new Date(a.reserved_at).getTime() - new Date(b.reserved_at).getTime();
  });

  // 5. Find current user stats
  let currentUserStats = null;
  const userIdx = sorted.findIndex(item => item.user_id === userId);
  if (userIdx !== -1) {
    const userEntry = sorted[userIdx];
    const rank = userIdx + 1;
    let cohort = '003';
    if (rank <= 100) {
      cohort = '001';
    } else if (rank <= 300) {
      cohort = '002';
    }
    
    const usernameKey = userEntry.username.toLowerCase().trim();
    
    currentUserStats = {
      points: userEntry.points,
      verifiedReferrals: verifiedReferralsMap[usernameKey] || 0,
      unverifiedReferrals: unverifiedReferralsMap[usernameKey] || 0,
      rank,
      cohort,
      storyShared: userEntry.story_shared === true
    };
  }

  // 6. Founding Artists are those who have (is_verified = true OR points >= 500) AND role = 'artist'
  const foundingArtists = sorted
    .filter(u => u.role === 'artist' && (u.is_verified || u.points >= 500))
    .map(u => ({
      username: u.username,
      display_name: u.display_name,
      role: u.role,
      is_verified: true, // They qualified
      points: u.points,
      referrals_count: u.referrals_count,
      story_shared: u.story_shared === true
    }));

  const totalArtistsCount = foundingArtists.length;
  const foundingLimit = totalArtistsCount >= 50 ? 100 : 50;

  // Clean leaderboard for public consumption
  const publicLeaderboard = sorted.slice(0, 50).map(u => ({
    username: u.username,
    display_name: u.display_name,
    role: u.role,
    is_verified: u.is_verified || u.points >= 500,
    points: u.points,
    referrals_count: u.referrals_count,
    story_shared: u.story_shared === true
  }));

  return {
    leaderboard: publicLeaderboard,
    currentUserStats,
    foundingArtists,
    totalArtistsCount,
    foundingLimit
  };
}

/**
 * Server Action to mark the story sharing task as completed in the database.
 */
export async function markStorySharedAction(userId: string): Promise<void> {
  const client = createAdminClient();
  const { error } = await client
    .from('waitlist_users')
    .update({ story_shared: true })
    .eq('user_id', userId);

  if (error) {
    console.error('Error updating story_shared column in database:', error.message);
    throw error;
  }
}

/**
 * Server Action to check if a username is available.
 * Bypasses RLS by using the service role client on the server.
 */
export async function checkUsernameAvailableAction(username: string): Promise<boolean> {
  const client = createAdminClient();
  const normalised = username.trim().toLowerCase();
  const serviceKeyExists = !!process.env.SUPABASE_SERVICE_ROLE_KEY;

  try {
    const fs = await import('fs');
    const path = await import('path');
    const logPath = path.join(process.cwd(), 'server_debug.log');
    fs.appendFileSync(logPath, `[${new Date().toISOString()}] START check: username=${username}, normalised=${normalised}, serviceKeyExists=${serviceKeyExists}\n`);
  } catch (e) {}

  // Directly check the waitlist_users table
  const { count, error } = await client
    .from('waitlist_users')
    .select('id', { count: 'exact', head: true })
    .eq('username', normalised);

  let result = count === 0;
  let logErrorMsg = error ? error.message : 'none';

  if (error) {
    console.error('Error checking username availability directly, falling back:', error);
    // Fallback to the RPC function in case table structure or permissions have issues
    const { data, error: rpcError } = await client.rpc('check_username_available', {
      p_username: normalised,
    });
    if (rpcError) {
      console.error('Fallback RPC check also failed:', rpcError);
      result = true; // Fallback to available so we do not block registrations
      logErrorMsg = `DirectError: ${error.message}, RpcError: ${rpcError.message}`;
    } else {
      result = data === true;
      logErrorMsg = `DirectError: ${error.message}, RpcSuccess: returned ${data}`;
    }
  }

  try {
    const fs = await import('fs');
    const path = await import('path');
    const logPath = path.join(process.cwd(), 'server_debug.log');
    fs.appendFileSync(logPath, `[${new Date().toISOString()}] END check: username=${username}, count=${count}, error=${logErrorMsg}, returned=${result}\n`);
  } catch (e) {}

  return result;
}


