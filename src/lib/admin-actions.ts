'use server';

import crypto from 'crypto';
import { headers } from 'next/headers';

import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { type AdminWaitlistEntry, ensureValidDisplayName } from './waitlist';
import { verifyAdminToken, verifyIdToken } from './firebase/admin';
import {
  sendAdminAccessGrantedEmail,
  sendAdminAccessRevokedEmail,
  sendProfileVerifiedEmail,
  sendProfileVerificationRevokedEmail,
  sendProfileBlockedEmail,
  sendPositionUpdatedEmail,
  sendFoundingCardFeaturedEmail
} from './mailer';

import { getAdminSupabaseClient } from './supabase/admin';

function createAdminClient() {
  return getAdminSupabaseClient();
}

function sortAdminRegistrations(entries: AdminWaitlistEntry[]): AdminWaitlistEntry[] {
  const cleaned = entries.map(e => ({
    ...e,
    display_name: ensureValidDisplayName(e.display_name, e.username, e.email)
  }));
  return cleaned.sort((a, b) => {
    const posA = a.position_override !== null && a.position_override !== undefined ? a.position_override : Infinity;
    const posB = b.position_override !== null && b.position_override !== undefined ? b.position_override : Infinity;
    if (posA !== posB) {
      return posA - posB;
    }
    return new Date(b.reserved_at).getTime() - new Date(a.reserved_at).getTime();
  });
}

/**
 * Server Action to fetch all waitlist registrations.
 * Verifies the caller is an authorized admin via Firebase ID token.
 */
export async function adminGetRegistrationsAction(idToken: string): Promise<AdminWaitlistEntry[]> {
  await verifyAdminToken(idToken);

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const client = createAdminClient();

  if (serviceRoleKey) {
    // Service Role Client: query the table directly bypassing RLS
    let { data, error } = await client
      .from('waitlist_users')
      .select('*')
      .order('position_override', { nullsFirst: false, ascending: true })
      .order('reserved_at', { ascending: false });

    if (error) {
      console.warn('Could not order registrations by position_override, falling back:', error.message);
      const fallbackRes = await client
        .from('waitlist_users')
        .select('*')
        .order('reserved_at', { ascending: false });
      if (!fallbackRes.error) {
        data = fallbackRes.data;
        error = null;
      }
    }

    if (error) {
      console.error('Error fetching registrations directly: [REDACTED_ERROR]');
      const ref = crypto.randomUUID(); console.error('Error Ref:', ref, error); throw new Error('An internal error occurred. Ref: ' + ref);
    }

    return sortAdminRegistrations((data || []) as AdminWaitlistEntry[]);
  } else {
    // Fallback: call the RPC function (requires execute grant for anon/authenticated roles)
    const { data, error } = await client.rpc('admin_get_registrations', {
      p_passcode: process.env.ADMIN_PASSCODE || '',
    });

    if (error) {
      console.error('Error calling admin_get_registrations RPC: [REDACTED_ERROR]');
      const ref = crypto.randomUUID(); console.error('Error Ref:', ref, error); throw new Error('An internal error occurred. Ref: ' + ref);
    }

    return sortAdminRegistrations((data || []) as AdminWaitlistEntry[]);
  }
}

/**
 * Server Action to update a waitlist user's registration status.
 * Verifies the caller is an authorized admin via Firebase ID token.
 */
export async function adminUpdateRegistrationAction(
  idToken: string,
  userId: string,
  isVerified: boolean,
  isBlocked: boolean,
  positionOverride?: number | null,
  featureFoundingCard?: boolean,
  excludeFromWaitlist?: boolean
): Promise<{ success: boolean; message?: string }> {
  try {
    await verifyAdminToken(idToken);

    const client = createAdminClient();
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId);

    // 1. Fetch current status of this user registration for email alert triggers
    let existing: any = null;
    try {
      let res = await client
        .from('waitlist_users')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (!res.data && isUUID) {
        res = await client
          .from('waitlist_users')
          .select('*')
          .eq('id', userId)
          .maybeSingle();
      }

      if (!res.data) {
        res = await client
          .from('waitlist_users')
          .select('*')
          .eq('username', userId.toLowerCase())
          .maybeSingle();
      }

      if (!res.data) {
        res = await client
          .from('waitlist_users')
          .select('*')
          .eq('email', userId.toLowerCase())
          .maybeSingle();
      }

      existing = res.data;
    } catch (e) {
      console.warn('Could not fetch existing registration info for email alerts:', e);
    }

    let updateSuccess = false;
    let lastError: string | null = null;

    const isColumnErr = (err: any) =>
      err &&
      (err.code === 'PGRST204' ||
        err.code === 'PGRST200' ||
        err.code === '42703' ||
        (err.message &&
          (err.message.includes('column') ||
            err.message.includes('does not exist') ||
            err.message.includes('exclude_from_waitlist') ||
            err.message.includes('feature_founding_card') ||
            err.message.includes('position_override'))));

    const attemptUpdate = async (payload: Record<string, any>) => {
      const tryUpdateField = async (field: 'user_id' | 'id' | 'username' | 'email', value: string) => {
        try {
          const r = await client
            .from('waitlist_users')
            .update(payload)
            .eq(field, value)
            .select('id');
          return r;
        } catch (e: any) {
          return { data: null, error: e };
        }
      };

      // 1. Match by user_id
      let res = await tryUpdateField('user_id', userId);
      if (res.data && res.data.length > 0) return res;

      // 2. Match by id (UUID column - only if userId is valid UUID format)
      if (isUUID) {
        const idRes = await tryUpdateField('id', userId);
        if (idRes.data && idRes.data.length > 0) return idRes;
        if (idRes.error && idRes.error.code !== '22P02') res = idRes;
      }

      // 3. Match by username
      const userRes = await tryUpdateField('username', userId.toLowerCase());
      if (userRes.data && userRes.data.length > 0) return userRes;
      if (userRes.error && userRes.error.code !== '22P02') res = userRes;

      // 4. Match by email
      const emailRes = await tryUpdateField('email', userId.toLowerCase());
      if (emailRes.data && emailRes.data.length > 0) return emailRes;
      if (emailRes.error && emailRes.error.code !== '22P02') res = emailRes;

      return res;
    };

    const updatePayload: Record<string, any> = {
      is_verified: isVerified,
      is_blocked: isBlocked,
    };
    if (positionOverride !== undefined) {
      updatePayload.position_override = positionOverride;
    }
    if (featureFoundingCard !== undefined) {
      updatePayload.feature_founding_card = featureFoundingCard;
    }
    if (excludeFromWaitlist !== undefined) {
      updatePayload.exclude_from_waitlist = excludeFromWaitlist;
    }

    let res = await attemptUpdate(updatePayload);

    if (res.error && isColumnErr(res.error)) {
      console.warn('Missing column in waitlist_users during update, falling back to core fields:', res.error.message);

      // Fallback 1: strip exclude_from_waitlist
      delete updatePayload.exclude_from_waitlist;
      res = await attemptUpdate(updatePayload);

      // Fallback 2: strip feature_founding_card
      if (res.error && isColumnErr(res.error)) {
        delete updatePayload.feature_founding_card;
        res = await attemptUpdate(updatePayload);
      }

      // Fallback 3: strip position_override
      if (res.error && isColumnErr(res.error)) {
        delete updatePayload.position_override;
        res = await attemptUpdate(updatePayload);
      }

      // Fallback 4: core fields only
      if (res.error && isColumnErr(res.error)) {
        res = await attemptUpdate({
          is_verified: isVerified,
          is_blocked: isBlocked,
        });
      }
    }

    if (!res.error && res.data && res.data.length > 0) {
      updateSuccess = true;
    } else if (res.error) {
      lastError = res.error.message;
      console.error('Error updating registration status directly:', res.error);
    }

    // Fallback: If direct update did not succeed, call RPC functions
    if (!updateSuccess) {
      let rpcRes = await client.rpc('admin_update_registration', {
        p_passcode: process.env.ADMIN_PASSCODE || '',
        p_user_id: userId,
        p_is_verified: isVerified,
        p_is_blocked: isBlocked,
        p_position_override: positionOverride !== undefined ? positionOverride : null,
        p_feature_founding_card: featureFoundingCard !== undefined ? featureFoundingCard : false,
        p_exclude_from_waitlist: excludeFromWaitlist !== undefined ? excludeFromWaitlist : false,
      });

      if (rpcRes.error) {
        rpcRes = await client.rpc('admin_update_registration', {
          p_passcode: process.env.ADMIN_PASSCODE || '',
          p_user_id: userId,
          p_is_verified: isVerified,
          p_is_blocked: isBlocked,
          p_position_override: positionOverride !== undefined ? positionOverride : null,
        });
      }

      if (rpcRes.error) {
        rpcRes = await client.rpc('admin_update_registration', {
          p_passcode: process.env.ADMIN_PASSCODE || '',
          p_user_id: userId,
          p_is_verified: isVerified,
          p_is_blocked: isBlocked,
        });
      }

      if (!rpcRes.error) {
        updateSuccess = true;
      } else if (!lastError) {
        lastError = rpcRes.error.message;
      }
    }

    if (!updateSuccess) {
      return { success: false, message: lastError || `No matching user found in waitlist database (${userId}).` };
    }

    // Send email alerts based on status transitions
    if (existing) {
      const email = existing.email;
      const name = existing.display_name || existing.username;
      const username = existing.username;

      // 1. Verification status change
      if (isVerified && !existing.is_verified) {
        sendProfileVerifiedEmail(email, name, username).catch(err => {
          console.error('Failed to send verification approved email:', err);
        });
      } else if (!isVerified && existing.is_verified) {
        sendProfileVerificationRevokedEmail(email, name).catch(err => {
          console.error('Failed to send verification revoked email:', err);
        });
      }

      // 2. Block status change
      if (isBlocked && !existing.is_blocked) {
        sendProfileBlockedEmail(email, name).catch(err => {
          console.error('Failed to send profile blocked email:', err);
        });
      }

      // 3. Founding card status change
      if (featureFoundingCard !== undefined && featureFoundingCard && !existing.feature_founding_card) {
        sendFoundingCardFeaturedEmail(email, name, username).catch(err => {
          console.error('Failed to send founding card featured email:', err);
        });
      }

      // 4. Position override change
      if (positionOverride !== undefined && positionOverride !== null && positionOverride !== existing.position_override) {
        sendPositionUpdatedEmail(email, name, positionOverride).catch(err => {
          console.error('Failed to send position updated email:', err);
        });
      }
    }

    return { success: true };
  } catch (err: any) {
    console.error('Unhandled exception in adminUpdateRegistrationAction:', err);
    return { success: false, message: err?.message || 'An error occurred while updating registration.' };
  }
}

/**
 * Checks if a user email is an authorized administrator.
 * Matches against the hardcoded super-admin fallback or the admin_users database table.
 * Verifies the caller's identity via Firebase ID token to prevent unauthorized checks.
 */
export async function checkIsAdminAction(idToken: string): Promise<boolean> {
  if (!idToken) return false;
  
  let email = '';
  try {
    const decoded = await verifyIdToken(idToken);
    email = decoded.email || '';
  } catch (e) {
    console.error('Exception verifying ID token in admin check: [REDACTED_ERROR]');
    return false;
  }
  
  if (!email) return false;
  const normalised = email.trim().toLowerCase();
  
  const superAdminEmail = process.env.SUPER_ADMIN_EMAIL;
  if (superAdminEmail && normalised === superAdminEmail.trim().toLowerCase()) {
    return true;
  }

  // Developer email bypass
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
    console.error('Exception verifying admin status: [REDACTED_ERROR]');
    return false;
  }
}

/**
 * Server Action to fetch all activity logs.
 * Verifies the caller is an authorized admin via Firebase ID token.
 */
export async function adminGetActivityLogsAction(idToken: string): Promise<any[]> {
  await verifyAdminToken(idToken);

  const client = createAdminClient();
  const { data, error } = await client
    .from('activity_logs')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.warn('Error fetching activity logs (table may not be migrated yet):', error.message);
    return [];
  }
  return data || [];
}

/**
 * Server Action to fetch all authorized admin members.
 * Verifies the caller is an authorized admin via Firebase ID token.
 */
export async function adminGetAdminsAction(idToken: string): Promise<any[]> {
  await verifyAdminToken(idToken);

  const client = createAdminClient();
  const { data, error } = await client
    .from('admin_users')
    .select('*')
    .order('created_at', { ascending: false });

  const list = data || [];
  const developerEmail = 'anudeepdash2004@gmail.com';
  const hasDeveloper = list.some((a: any) => a.email && a.email.toLowerCase() === developerEmail);
  
  if (!hasDeveloper) {
    list.push({
      id: 'adm-developer-virtual',
      email: developerEmail,
      added_by: 'system',
      created_at: new Date('2026-07-01T00:00:00.000Z').toISOString()
    });
  }

  return list;
}

/**
 * Server Action to add a new admin email.
 * Verifies the caller is an authorized admin via Firebase ID token.
 */
export async function adminAddAdminAction(
  idToken: string,
  email: string,
  addedBy: string
): Promise<void> {
  await verifyAdminToken(idToken);
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
    console.error('Error adding admin member: [REDACTED_ERROR]');
    const ref = crypto.randomUUID(); console.error('Error Ref:', ref, error); throw new Error('An internal error occurred. Ref: ' + ref);
  }

  // Retrieve user's display name if available to personalize the email
  let name = 'ArtisTant Team Member';
  try {
    const { data } = await client
      .from('waitlist_users')
      .select('display_name')
      .eq('email', email.trim().toLowerCase())
      .maybeSingle();
    if (data && data.display_name) {
      name = data.display_name;
    }
  } catch (e) {
    console.warn('Could not fetch name for admin access granted email:', e);
  }

  // Send access granted email
  sendAdminAccessGrantedEmail(email.trim().toLowerCase(), name).catch(err => {
    console.error('Failed to send admin access granted email:', err);
  });
}

/**
 * Server Action to remove an admin email.
 * Verifies the caller is an authorized admin via Firebase ID token.
 */
export async function adminRemoveAdminAction(idToken: string, email: string): Promise<void> {
  await verifyAdminToken(idToken);
  if (!email) {
    throw new Error('Email is required');
  }
  if (email.trim().toLowerCase() === 'anudeepdash2004@gmail.com') {
    throw new Error('Super-admin cannot be deleted.');
  }

  const client = createAdminClient();

  // Retrieve user's display name if available before deleting, to personalize the email
  let name = 'ArtisTant Team Member';
  try {
    const { data } = await client
      .from('waitlist_users')
      .select('display_name')
      .eq('email', email.trim().toLowerCase())
      .maybeSingle();
    if (data && data.display_name) {
      name = data.display_name;
    }
  } catch (e) {
    console.warn('Could not fetch name for admin access revoked email:', e);
  }

  const { error } = await client
    .from('admin_users')
    .delete()
    .eq('email', email.trim().toLowerCase());

  if (error) {
    console.error('Error removing admin member: [REDACTED_ERROR]');
    const ref = crypto.randomUUID(); console.error('Error Ref:', ref, error); throw new Error('An internal error occurred. Ref: ' + ref);
  }

  // Send access revoked email
  sendAdminAccessRevokedEmail(email.trim().toLowerCase(), name).catch(err => {
    console.error('Failed to send admin access revoked email:', err);
  });
}

/**
 * Server Action to log visitor and member activities.
 * Can be called anonymously by visitors or signed-in members.
 *
 * Note: For production hardening, consider adding server-side rate limiting
 * (e.g., via Vercel Edge Config or a Redis counter) to prevent abuse.
 */
export async function logActivityAction(input: {
  actionType: string;
  idToken?: string;
}): Promise<void> {
  const allowedTypes = ['visit', 'login', 'waitlist_register'];
  if (!allowedTypes.includes(input.actionType)) {
    throw new Error('Invalid activity type');
  }

  // Login and registration entries must be tied to a verified Firebase user.
  if (input.actionType !== 'visit' && !input.idToken) {
    throw new Error('Authentication is required for this activity type');
  }

  let userId: string | null = null;
  let email: string | null = null;
  let username: string | null = null;
  if (input.idToken) {
    const decoded = await verifyIdToken(input.idToken);
    userId = decoded.uid;
    email = decoded.email || null;

    const { data } = await createAdminClient()
      .from('waitlist_users')
      .select('username')
      .eq('user_id', userId)
      .maybeSingle();
    username = data?.username || null;
  }

  const requestHeaders = await headers();

  const client = createAdminClient();
  const { error } = await client
    .from('activity_logs')
    .insert({
      user_id: userId,
      email,
      username,
      action_type: input.actionType,
      user_agent: requestHeaders.get('user-agent'),
      referrer: requestHeaders.get('referer'),
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
 * Now verifies caller identity via Firebase ID token to prevent IDOR.
 */
export async function getWaitlistDashboardDataAction(idToken: string): Promise<{
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
  // Verify the caller's identity and extract their real user ID
  const decoded = await verifyIdToken(idToken);
  const userId = decoded.uid;

  const client = createAdminClient();

  // 1a. Fetch admin emails from admin_users table + defaults
  const adminEmailsSet = new Set<string>();
  if (process.env.SUPER_ADMIN_EMAIL) {
    adminEmailsSet.add(process.env.SUPER_ADMIN_EMAIL.trim().toLowerCase());
  }
  adminEmailsSet.add('anudeepdash2004@gmail.com');

  try {
    const { data: adminRows } = await client.from('admin_users').select('email');
    if (adminRows) {
      adminRows.forEach(a => {
        if (a.email) adminEmailsSet.add(a.email.trim().toLowerCase());
      });
    }
  } catch (e) {
    console.warn('Could not fetch admin_users table:', e);
  }
  
  // 1b. Fetch all registrations (with story_shared, exclude_from_waitlist, position_override, email)
  const { data, error } = await client
    .from('waitlist_users')
    .select('user_id, username, email, display_name, role, is_verified, referred_by, reserved_at, story_shared, exclude_from_waitlist, position_override')
    .eq('is_blocked', false);
    
  let users = data || [];
  
  if (error) {
    // If exclude_from_waitlist/story_shared/position_override columns don't exist yet, retry without them
    const isExcludeColumnError = 
      error.code === 'PGRST204' || 
      error.code === 'PGRST200' || 
      error.code === '42703' || 
      (error.message && (
        error.message.includes('exclude_from_waitlist') ||
        error.message.includes('story_shared') || 
        error.message.includes('position_override') ||
        error.message.includes('column') || 
        error.message.includes('does not exist')
      ));
    if (isExcludeColumnError) {
      const { data: fallbackData, error: fallbackError } = await client
        .from('waitlist_users')
        .select('user_id, username, email, display_name, role, is_verified, referred_by, reserved_at')
        .eq('is_blocked', false);
      if (fallbackError) throw fallbackError;
      users = (fallbackData || []).map(u => ({ ...u, story_shared: false, exclude_from_waitlist: false, position_override: null }));
    } else {
      const ref = crypto.randomUUID(); console.error('Error Ref:', ref, error); throw new Error('An internal error occurred. Ref: ' + ref);
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

  // 3. Compute points and map to entries with admin / exclusion check
  const mapped = users.map(u => {
    const usernameKey = u.username.toLowerCase().trim();
    const verifiedRefs = verifiedReferralsMap[usernameKey] || 0;
    const storyShared = u.story_shared === true; // Handle null/undefined values
    const points = 100 + (verifiedRefs * 50) + (storyShared ? 80 : 0);
    const userEmail = u.email ? u.email.trim().toLowerCase() : '';
    const isExcluded = u.exclude_from_waitlist === true || (userEmail !== '' && adminEmailsSet.has(userEmail));
    
    return {
      user_id: u.user_id,
      username: u.username,
      email: u.email,
      display_name: u.display_name,
      role: u.role,
      is_verified: u.is_verified,
      points,
      referrals_count: verifiedRefs,
      story_shared: storyShared,
      reserved_at: u.reserved_at,
      position_override: u.position_override !== undefined && u.position_override !== null ? u.position_override : null,
      exclude_from_waitlist: isExcluded
    };
  });

  // 4. Filter out excluded users (admins and rank-excluded) for rank calculations & leaderboards
  const eligibleUsers = mapped.filter(u => !u.exclude_from_waitlist);

  // 5. Sort eligible users: position_override ASC (if set), then points DESC, then reserved_at ASC
  const sortedEligible = [...eligibleUsers].sort((a, b) => {
    const posA = a.position_override !== null ? a.position_override : Infinity;
    const posB = b.position_override !== null ? b.position_override : Infinity;
    if (posA !== posB) {
      return posA - posB;
    }
    if (b.points !== a.points) {
      return b.points - a.points;
    }
    return new Date(a.reserved_at).getTime() - new Date(b.reserved_at).getTime();
  });

  // 6. Find current user stats (using verified userId from token)
  let currentUserStats = null;
  const userEntry = mapped.find(item => item.user_id === userId);
  if (userEntry) {
    const isExcluded = userEntry.exclude_from_waitlist === true;
    
    let rank = 0;
    let cohort = 'TEAM';
    
    if (!isExcluded) {
      if (userEntry.position_override !== null) {
        rank = userEntry.position_override;
      } else {
        const rankedIdx = sortedEligible.findIndex(item => item.user_id === userId);
        rank = rankedIdx !== -1 ? rankedIdx + 1 : 0;
      }
      cohort = rank <= 100 ? '001' : rank <= 300 ? '002' : '003';
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

  // 7. Founding Artists are non-excluded artists with points >= 500
  const foundingArtists = sortedEligible
    .filter(u => u.role === 'artist' && u.points >= 500)
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

  // Clean leaderboard for public consumption (non-excluded users only)
  const publicLeaderboard = sortedEligible
    .slice(0, 50)
    .map(u => ({
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
 * Verifies the caller's identity via Firebase ID token to prevent IDOR.
 */
export async function markStorySharedAction(idToken: string): Promise<void> {
  // Verify the caller's identity — only they can mark their own story as shared
  const decoded = await verifyIdToken(idToken);
  const userId = decoded.uid;

  const client = createAdminClient();
  const { error } = await client
    .from('waitlist_users')
    .update({ story_shared: true })
    .eq('user_id', userId);

  if (error) {
    console.error('Error updating story_shared column in database: [REDACTED_ERROR]');
    const ref = crypto.randomUUID(); console.error('Error Ref:', ref, error); throw new Error('An internal error occurred. Ref: ' + ref);
  }
}

/**
 * Server Action to check if a username is available.
 * Bypasses RLS by using the service role client on the server.
 */
export type CheckUsernameResult = {
  success: boolean;
  available: boolean;
  error?: string;
};

export async function checkUsernameAvailableAction(username: string): Promise<CheckUsernameResult> {
  try {
    const normalised = username.trim().toLowerCase();

    const usernameRegex = /^[a-zA-Z0-9_.]{3,30}$/;
    if (!usernameRegex.test(normalised)) {
      return { success: true, available: false, error: 'Invalid username format' };
    }

    const client = createAdminClient();

    // Directly check the waitlist_users table
    const { data, error } = await client
      .from('waitlist_users')
      .select('id')
      .eq('username', normalised)
      .limit(1);

    if (error) {
      console.error('Error checking username availability directly, falling back:', error);
      // Fallback to the RPC function in case table structure or permissions have issues
      const { data: rpcData, error: rpcError } = await client.rpc('check_username_available', {
        p_username: normalised,
      });
      if (rpcError) {
        console.error('Fallback RPC check also failed:', rpcError);
        return { success: false, available: false, error: 'Could not verify username availability due to database error.' };
      }
      return { success: true, available: rpcData === true };
    }

    return { success: true, available: !data || data.length === 0 };
  } catch (err: any) {
    console.error('Unhandled error in checkUsernameAvailableAction:', err);
    return { success: false, available: false, error: err?.message || 'Internal server error checking availability.' };
  }
}

/**
 * Server Action to check multiple usernames for availability at once.
 * Bypasses RLS by using the service role client on the server.
 */
export async function checkMultipleUsernamesAvailableAction(usernames: string[]): Promise<Record<string, boolean>> {
  const result: Record<string, boolean> = {};
  for (const u of usernames) {
    result[u] = false;
  }

  try {
    const client = createAdminClient();
    const normalisedUsernames = usernames
      .map(u => u.trim().toLowerCase())
      .filter(u => /^[a-zA-Z0-9_.]{3,30}$/.test(u));

    if (normalisedUsernames.length === 0) {
      return result;
    }

    const { data, error } = await client
      .from('waitlist_users')
      .select('username')
      .in('username', normalisedUsernames);

    if (error) {
      console.error('Error checking bulk usernames availability:', error);
      return result;
    }

    const takenSet = new Set(data?.map(row => row.username) || []);
    
    for (const username of usernames) {
      const norm = username.trim().toLowerCase();
      if (/^[a-zA-Z0-9_.]{3,30}$/.test(norm)) {
        result[username] = !takenSet.has(norm);
      }
    }
  } catch (err) {
    console.error('Unhandled error in checkMultipleUsernamesAvailableAction:', err);
  }

  return result;
}

export interface BookingRequestEntry {
  id: string;
  artist_username: string;
  artist_display_name: string | null;
  client_name: string;
  client_email: string;
  client_phone: string;
  event_date: string;
  city: string;
  event_type: string;
  budget: string | null;
  notes: string | null;
  status: 'pending' | 'contacted' | 'confirmed' | 'archived';
  created_at: string;
}

/**
 * Server Action to fetch all client booking requests for admins.
 */
export async function adminGetBookingRequestsAction(idToken: string): Promise<BookingRequestEntry[]> {
  await verifyAdminToken(idToken);
  const client = createAdminClient();

  const { data, error } = await client
    .from('booking_requests')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching booking requests:', error);
    throw new Error('Failed to fetch booking requests');
  }

  return (data || []) as BookingRequestEntry[];
}

/**
 * Server Action to update the status of a booking request.
 */
export async function adminUpdateBookingRequestStatusAction(
  idToken: string,
  requestId: string,
  status: 'pending' | 'contacted' | 'confirmed' | 'archived'
): Promise<boolean> {
  await verifyAdminToken(idToken);
  const client = createAdminClient();

  const { error } = await client
    .from('booking_requests')
    .update({ status })
    .eq('id', requestId);

  if (error) {
    console.error('Error updating booking request status:', error);
    throw new Error('Failed to update booking request status');
  }

  return true;
}

/**
 * Server Action to delete a booking request.
 */
export async function adminDeleteBookingRequestAction(
  idToken: string,
  requestId: string
): Promise<boolean> {
  await verifyAdminToken(idToken);
  const client = createAdminClient();

  const { error } = await client
    .from('booking_requests')
    .delete()
    .eq('id', requestId);

  if (error) {
    console.error('Error deleting booking request:', error);
    throw new Error('Failed to delete booking request');
  }

  return true;
}

