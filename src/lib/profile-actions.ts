'use server';

import { createClient } from '@supabase/supabase-js';
import { verifyIdToken, getBuiltInAdminEmails } from './firebase/admin';
import { sendContactInfoUpdatedEmail } from './mailer';
import { cookies, headers } from 'next/headers';
import crypto from 'crypto';
import { type WaitlistEntry, ensureValidDisplayName } from './waitlist-shared';
import {
  cleanStringArray,
  cleanText,
  isValidEmail,
  sanitizeFilterValue,
  sanitizeUrl,
  validateUsername,
} from './validation';

const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const MAX_VIDEO_BYTES = 100 * 1024 * 1024;

const IMAGE_TYPES = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
} as const;

const VIDEO_TYPES = {
  'video/mp4': 'mp4',
  'video/webm': 'webm',
  'video/quicktime': 'mov',
} as const;

type UploadTypeMap = Record<string, string>;

function parseBase64Upload(
  dataUrl: string,
  allowedTypes: UploadTypeMap,
  maxBytes: number,
) {
  const parts = dataUrl.split(',');
  if (parts.length !== 2) {
    throw new Error('Unsupported upload format (no data)');
  }
  
  const header = parts[0];
  const base64Data = parts[1];
  
  const contentTypeMatch = /^data:([^;,]+);base64$/.exec(header);
  if (!contentTypeMatch) {
    throw new Error('Unsupported upload format (invalid header)');
  }
  
  const contentType = contentTypeMatch[1];
  if (!(contentType in allowedTypes)) {
    throw new Error('Unsupported file type');
  }

  const buffer = Buffer.from(base64Data, 'base64');
  if (!buffer.length || buffer.length > maxBytes) {
    throw new Error(`Upload must be smaller than ${Math.floor(maxBytes / 1024 / 1024)}MB`);
  }

  return { buffer, contentType, extension: allowedTypes[contentType] };
}

import { getAdminSupabaseClient } from './supabase/admin';
import { checkRateLimit } from './rate-limit';

function createAdminClient() {
  return getAdminSupabaseClient();
}

// Buckets confirmed to exist in this server instance, so uploads skip the listBuckets round-trip.
const ensuredBuckets = new Set<string>();

async function ensurePublicBucket(client: ReturnType<typeof createAdminClient>, bucket: string) {
  if (ensuredBuckets.has(bucket)) return;
  const { data: buckets } = await client.storage.listBuckets();
  if (!buckets?.some(b => b.name === bucket)) {
    await client.storage.createBucket(bucket, { public: true });
  }
  ensuredBuckets.add(bucket);
}

/** Storage object name inside a public bucket URL, or null if the URL is not from that bucket. */
function storageObjectName(publicUrl: string, bucket: string): string | null {
  const marker = `/storage/v1/object/public/${bucket}/`;
  const idx = publicUrl.indexOf(marker);
  if (idx === -1) return null;
  const name = decodeURIComponent(publicUrl.slice(idx + marker.length).split('?')[0]);
  return name && !name.includes('/') ? name : null;
}

export async function incrementProfileVisitorsAction(username: string) {
  const normalisedUsername = username.trim().toLowerCase();
  if (!/^[a-z0-9_.]{3,30}$/.test(normalisedUsername)) return false;

  const requestHeaders = await headers();
  const cookieStore = await cookies();
  let visitorId = cookieStore.get('artistant_visitor_id')?.value;
  if (!visitorId) {
    visitorId = crypto.randomUUID();
    cookieStore.set('artistant_visitor_id', visitorId, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 365,
      path: '/',
    });
  }

  const forwardedFor = requestHeaders.get('x-forwarded-for')?.split(',')[0]?.trim() || '';
  const visitorKey = crypto
    .createHash('sha256')
    .update(`${process.env.VISITOR_HASH_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || 'artistant'}:${forwardedFor}:${visitorId}`)
    .digest('hex');
  const client = createAdminClient();
  const { error } = await client.rpc('increment_profile_visitors', {
    p_username: normalisedUsername,
    p_viewer_key: visitorKey,
  });

  return !error;
}

export async function updateCustomStatusMessageAction(idToken: string, message: string) {
  const decodedToken = await verifyIdToken(idToken);
  const client = createAdminClient();
  
  const { error } = await client
    .from('waitlist_users')
    .update({ custom_status_message: cleanText(message, 160) })
    .eq('user_id', decodedToken.uid);
    
  if (error) {
    console.error("Error updating message:", error);
    throw new Error('Failed to update message');
  }
  
  return true;
}

/**
 * Upload a profile photo via the admin client (bypasses storage RLS).
 * Accepts a base64 data URL, decodes it, uploads to Supabase Storage,
 * and updates the waitlist_users record.
 * Returns the public URL of the uploaded photo.
 */
export async function uploadProfilePhotoAction(
  idToken: string,
  base64DataUrl: string,
  _fileExtension: string,
): Promise<string> {
  const decodedToken = await verifyIdToken(idToken);
  const uid = decodedToken.uid;
  const client = createAdminClient();

  const { buffer, contentType, extension } = parseBase64Upload(base64DataUrl, IMAGE_TYPES, MAX_IMAGE_BYTES);
  const fileName = `${uid}_${Date.now()}.${extension}`;

  await ensurePublicBucket(client, 'profiles');

  // Upload to storage (upsert to handle re-uploads)
  const { error: uploadError } = await client.storage
    .from('profiles')
    .upload(fileName, buffer, {
      contentType,
      upsert: true,
    });

  if (uploadError) {
    console.error('Storage upload error:', uploadError);
    throw new Error(`Failed to upload photo: ${uploadError.message}`);
  }

  // Get the public URL
  const { data: publicUrlData } = client.storage
    .from('profiles')
    .getPublicUrl(fileName);
  
  const publicUrl = publicUrlData.publicUrl;

  // Update the user's record with the photo URL
  const { error: updateError } = await client
    .from('waitlist_users')
    .update({ profile_photo_url: publicUrl })
    .eq('user_id', uid);

  if (updateError) {
    console.error('DB update error:', updateError);
    throw new Error('Photo uploaded but failed to save URL');
  }

  return publicUrl;
}

/**
 * Update the profile photo URL directly in the database.
 * Used as a fallback when storage upload was attempted client-side.
 */
export async function updateProfilePhotoUrlAction(
  idToken: string,
  photoUrl: string,
): Promise<boolean> {
  const decodedToken = await verifyIdToken(idToken);
  const client = createAdminClient();
  const safeUrl = sanitizeUrl(photoUrl);
  if (!safeUrl || !safeUrl.startsWith('https://')) {
    throw new Error('Invalid photo URL');
  }

  const { error } = await client
    .from('waitlist_users')
    .update({ profile_photo_url: safeUrl })
    .eq('user_id', decodedToken.uid);

  if (error) {
    console.error("Error updating profile photo URL:", error);
    throw new Error('Failed to update profile photo');
  }

  return true;
}

export async function uploadCoverPhotoAction(
  idToken: string,
  base64DataUrl: string,
): Promise<string> {
  const decodedToken = await verifyIdToken(idToken);
  const uid = decodedToken.uid;
  const client = createAdminClient();

  const { buffer, contentType, extension } = parseBase64Upload(base64DataUrl, IMAGE_TYPES, MAX_IMAGE_BYTES);
  const fileName = `cover_${uid}_${Date.now()}.${extension}`;

  await ensurePublicBucket(client, 'covers');

  const { error: uploadError } = await client.storage
    .from('covers')
    .upload(fileName, buffer, {
      contentType,
      upsert: true,
    });

  if (uploadError) {
    console.error('Cover upload error:', uploadError);
    throw new Error(`Failed to upload cover: ${uploadError.message}`);
  }

  const { data: publicUrlData } = client.storage
    .from('covers')
    .getPublicUrl(fileName);
  
  const publicUrl = publicUrlData.publicUrl;

  const { error: updateError } = await client
    .from('waitlist_users')
    .update({ cover_photo_url: publicUrl })
    .eq('user_id', uid);

  if (updateError) {
    console.error('DB update error:', updateError);
    throw new Error('Cover photo uploaded but failed to save URL');
  }

  return publicUrl;
}

export async function updatePortfolioThemeAction(
  idToken: string,
  theme: 'dark' | 'minimal' | 'creative' | 'bold',
): Promise<boolean> {
  const decodedToken = await verifyIdToken(idToken);
  if (!['dark', 'minimal', 'creative', 'bold'].includes(theme)) {
    throw new Error('Invalid portfolio theme');
  }
  const client = createAdminClient();

  const { error } = await client
    .from('waitlist_users')
    .update({ portfolio_theme: theme })
    .eq('user_id', decodedToken.uid);

  if (error) {
    console.error('Error updating portfolio theme:', error);
    throw new Error('Failed to update portfolio theme');
  }

  return true;
}

export async function updateSectionOrderAction(
  idToken: string,
  sectionOrder: string[]
): Promise<boolean> {
  const decodedToken = await verifyIdToken(idToken);
  const client = createAdminClient();

  const { error } = await client
    .from('waitlist_users')
    .update({ section_order: cleanStringArray(sectionOrder, 20, 40) })
    .eq('user_id', decodedToken.uid);

  if (error) {
    console.error("Error updating section order:", error);
    throw new Error('Failed to update section order');
  }

  return true;
}

export async function updateContactSettingsAction(
  idToken: string,
  settings: {
    email?: string;
    phone?: string;
    contact_email_enabled?: boolean;
    contact_phone_enabled?: boolean;
  }
): Promise<boolean> {
  const decodedToken = await verifyIdToken(idToken);
  const client = createAdminClient();

  if (settings.email !== undefined && settings.email !== '' && !isValidEmail(settings.email)) {
    throw new Error('Please enter a valid email address.');
  }
  if (settings.phone !== undefined && settings.phone !== '' && !/^\+?[0-9 ()-]{7,20}$/.test(settings.phone)) {
    throw new Error('Please enter a valid phone number.');
  }

  // Fetch current user email/phone for notification
  let existing: {
    email: string;
    phone: string | null;
    display_name: string | null;
    username: string;
  } | null = null;
  try {
    const { data } = await client
      .from('waitlist_users')
      .select('email, phone, display_name, username')
      .eq('user_id', decodedToken.uid)
      .maybeSingle();
    existing = data;
  } catch (e) {
    console.error('Error fetching user info for contact settings alert:', e);
  }

  const { error } = await client
    .from('waitlist_users')
    .update({
      ...(settings.email !== undefined ? { email: settings.email.trim().toLowerCase() } : {}),
      ...(settings.phone !== undefined ? { phone: settings.phone.trim() } : {}),
      ...(settings.contact_email_enabled !== undefined ? { contact_email_enabled: settings.contact_email_enabled } : {}),
      ...(settings.contact_phone_enabled !== undefined ? { contact_phone_enabled: settings.contact_phone_enabled } : {}),
    })
    .eq('user_id', decodedToken.uid);

  if (error) {
    console.error("Error updating contact settings:", error);
    throw new Error('Failed to update contact settings');
  }

  // Trigger security alert email on contact details change
  if (existing) {
    const updatedFields: string[] = [];
    if (settings.email !== undefined && settings.email !== existing.email) {
      updatedFields.push('Contact Email');
    }
    if (settings.phone !== undefined && settings.phone !== existing.phone) {
      updatedFields.push('Contact Phone Number');
    }

    if (updatedFields.length > 0) {
      const name = existing.display_name || existing.username;
      // Alert the previous address too, so a hijacked session can't silently redirect contact details.
      const targets = new Set([existing.email, settings.email].filter((e): e is string => !!e && isValidEmail(e)));
      for (const targetEmail of targets) {
        sendContactInfoUpdatedEmail(targetEmail, name, updatedFields).catch(err => {
          console.error('Failed to send contact settings update alert email:', err);
        });
      }
    }
  }

  return true;
}

export async function updateProfileDetailsAction(
  idToken: string,
  details: {
    display_name?: string;
    category?: string;
    genres?: string[];
    city?: string;
    bio?: string;
    instagram_url?: string;
    spotify_url?: string;
    youtube_url?: string;
    youtube_channel_url?: string;
  }
): Promise<boolean> {
  const decodedToken = await verifyIdToken(idToken);
  const client = createAdminClient();

  // If display_name is passed, sanitize it and protect existing real names from email overwrite
  let sanitizedDisplayName: string | undefined = details.display_name;
  if (sanitizedDisplayName !== undefined) {
    if (sanitizedDisplayName.includes('@') || sanitizedDisplayName.trim() === '') {
      const { data: existingUser } = await client
        .from('waitlist_users')
        .select('display_name, username, email')
        .eq('user_id', decodedToken.uid)
        .maybeSingle();

      if (existingUser && existingUser.display_name && !existingUser.display_name.includes('@')) {
        sanitizedDisplayName = existingUser.display_name;
      } else {
        sanitizedDisplayName = ensureValidDisplayName(null, existingUser?.username, existingUser?.email || decodedToken.email);
      }
    } else {
      sanitizedDisplayName = sanitizedDisplayName.trim();
    }
  }

  if (sanitizedDisplayName !== undefined) {
    sanitizedDisplayName = sanitizedDisplayName.slice(0, 80);
  }

  const corePayload = {
    ...(sanitizedDisplayName !== undefined ? { display_name: sanitizedDisplayName } : {}),
    ...(details.category !== undefined ? { category: cleanText(details.category, 40) } : {}),
    ...(details.genres !== undefined ? { genres: cleanStringArray(details.genres, 5, 40) } : {}),
    ...(details.city !== undefined ? { city: cleanText(details.city, 80) } : {}),
    ...(details.bio !== undefined ? { bio: cleanText(details.bio, 1000) } : {}),
    ...(details.instagram_url !== undefined ? { instagram_url: sanitizeUrl(details.instagram_url) } : {}),
    ...(details.spotify_url !== undefined ? { spotify_url: sanitizeUrl(details.spotify_url) } : {}),
    ...(details.youtube_url !== undefined ? { youtube_url: sanitizeUrl(details.youtube_url) } : {}),
    is_verified: true,
  };

  const fullPayload = {
    ...corePayload,
    ...(details.youtube_channel_url !== undefined ? { youtube_channel_url: sanitizeUrl(details.youtube_channel_url) } : {}),
    feature_founding_card: true
  };

  let { error } = await client
    .from('waitlist_users')
    .update(fullPayload)
    .eq('user_id', decodedToken.uid);

  if (error) {
    const isColumnError =
      error.code === 'PGRST204' ||
      error.code === 'PGRST200' ||
      error.code === '42703' ||
      (error.message && (
        error.message.includes('column') ||
        error.message.includes('does not exist') ||
        error.message.includes('feature_founding_card') ||
        error.message.includes('youtube_channel_url')
      ));

    if (isColumnError) {
      console.warn('Optional column missing in waitlist_users table, falling back to core fields.');
      const fallbackPayload = corePayload;

      const fallbackRes = await client
        .from('waitlist_users')
        .update(fallbackPayload)
        .eq('user_id', decodedToken.uid);

      if (fallbackRes.error) {
        console.error("Error updating profile details (fallback):", fallbackRes.error);
        throw new Error(`Failed to update profile details: ${fallbackRes.error.message}`);
      }
    } else {
      console.error("Error updating profile details:", error);
      throw new Error(`Failed to update profile details: ${error.message}`);
    }
  }

  return true;
}

export async function updateFeatureFoundingCardAction(
  idToken: string,
  feature: boolean
): Promise<boolean> {
  const decodedToken = await verifyIdToken(idToken);
  const client = createAdminClient();

  const { error } = await client
    .from('waitlist_users')
    .update({ feature_founding_card: feature })
    .eq('user_id', decodedToken.uid);

  if (error) {
    console.error("Error updating feature founding card setting:", error);
    throw new Error('Failed to update feature founding card setting');
  }

  return true;
}

export type PublicProfileReservation = Pick<WaitlistEntry,
  | 'username'
  | 'display_name'
  | 'role'
  | 'category'
  | 'genres'
  | 'city'
  | 'event_types'
  | 'spotify_url'
  | 'instagram_url'
  | 'youtube_url'
  | 'youtube_channel_url'
  | 'bio'
  | 'profile_photo_url'
  | 'cover_photo_url'
  | 'portfolio_theme'
  | 'gallery_photos'
  | 'profile_visitors_count'
  | 'custom_status_message'
  | 'section_order'
  | 'contact_email_enabled'
  | 'contact_phone_enabled'
  | 'feature_founding_card'
> & Partial<Pick<WaitlistEntry, 'email' | 'phone'>>;

export type PublicProfileData = {
  reservation: PublicProfileReservation;
  points: number;
  waitlistPos: number;
  cohortVal: string;
};

export async function getPublicProfileDataAction(username: string): Promise<PublicProfileData | null> {
  try {
    const normalisedUsername = username.trim().toLowerCase();
    if (!/^[a-z0-9_.]{3,30}$/.test(normalisedUsername)) return null;
    const client = createAdminClient();
    
    // 1. Fetch waitlist entry
    const { data: reservation, error } = await client
      .from('waitlist_users')
      .select('*')
      .eq('username', normalisedUsername)
      .eq('is_blocked', false)
      .maybeSingle();
      
    if (error || !reservation) {
      return null;
    }
    
    // 2. Referral count and admin list are independent — fetch them in parallel
    const adminEmailsSet = getBuiltInAdminEmails();
    const [{ count: referralCount }, { data: adminRows }] = await Promise.all([
      client
        .from('waitlist_users')
        .select('id', { count: 'exact', head: true })
        .eq('referred_by', normalisedUsername),
      client.from('admin_users').select('email'),
    ]);
    adminRows?.forEach(a => {
      if (a.email) adminEmailsSet.add(a.email.trim().toLowerCase());
    });

    const totalRefs = referralCount || 0;
    const calculatedPoints = 100 + totalRefs * 50 + (reservation.story_shared === true ? 80 : 0);

    const isExcluded = reservation.exclude_from_waitlist === true ||
      (reservation.email && adminEmailsSet.has(reservation.email.trim().toLowerCase()));

    // 3. Fetch waitlist position
    let waitlistPos = 0;
    let cohortVal = '003';

    if (isExcluded) {
      waitlistPos = 0;
      cohortVal = 'TEAM';
    } else if (reservation.position_override !== undefined && reservation.position_override !== null) {
      waitlistPos = reservation.position_override;
      cohortVal = waitlistPos <= 100 ? '001' : waitlistPos <= 300 ? '002' : '003';
    } else {
      const { count } = await client
        .from('waitlist_users')
        .select('id', { count: 'exact', head: true })
        .eq('is_blocked', false)
        .or('exclude_from_waitlist.is.null,exclude_from_waitlist.eq.false')
        .lte('reserved_at', reservation.reserved_at);
      waitlistPos = count || 120;
      cohortVal = waitlistPos ? Math.ceil(waitlistPos / 100).toString().padStart(3, '0') : '003';
    }
    
    return {
      reservation: {
        username: reservation.username,
        display_name: ensureValidDisplayName(reservation.display_name, reservation.username, reservation.email),
        role: reservation.role,
        category: reservation.category,
        genres: reservation.genres,
        city: reservation.city,
        event_types: reservation.event_types,
        spotify_url: reservation.spotify_url,
        instagram_url: reservation.instagram_url,
        youtube_url: reservation.youtube_url,
        bio: reservation.bio,
        profile_photo_url: reservation.profile_photo_url,
        cover_photo_url: reservation.cover_photo_url || null,
        portfolio_theme: reservation.portfolio_theme || 'dark',
        gallery_photos: reservation.gallery_photos,
        profile_visitors_count: reservation.profile_visitors_count,
        custom_status_message: reservation.custom_status_message,
        section_order: reservation.section_order,
        contact_email_enabled: reservation.contact_email_enabled,
        contact_phone_enabled: reservation.contact_phone_enabled,
        feature_founding_card: reservation.feature_founding_card,
        ...(reservation.contact_email_enabled && reservation.email ? { email: reservation.email } : {}),
        ...(reservation.contact_phone_enabled && reservation.phone ? { phone: reservation.phone } : {}),
        youtube_channel_url: reservation.youtube_channel_url || null,
      },
      points: calculatedPoints,
      waitlistPos,
      cohortVal
    };
  } catch (err) {
    console.error("Unhandled error in getPublicProfileDataAction:", err);
    return null;
  }
}

export async function uploadGalleryPhotoAction(
  idToken: string,
  base64DataUrl: string,
  _fileExtension: string
): Promise<string[]> {
  const decodedToken = await verifyIdToken(idToken);
  const uid = decodedToken.uid;
  const client = createAdminClient();

  const { buffer, contentType, extension } = parseBase64Upload(base64DataUrl, IMAGE_TYPES, MAX_IMAGE_BYTES);
  const fileName = `gallery_${uid}_${Date.now()}.${extension}`;

  await ensurePublicBucket(client, 'profiles');

  // Upload to storage (upsert to handle re-uploads)
  const { error: uploadError } = await client.storage
    .from('profiles')
    .upload(fileName, buffer, {
      contentType,
      upsert: true,
    });

  if (uploadError) {
    console.error('Storage upload error:', uploadError);
    throw new Error(`Failed to upload gallery photo: ${uploadError.message}`);
  }

  // Get the public URL
  const { data: publicUrlData } = client.storage
    .from('profiles')
    .getPublicUrl(fileName);
  
  const publicUrl = publicUrlData.publicUrl;

  // Retrieve current user data
  const { data: userData, error: fetchError } = await client
    .from('waitlist_users')
    .select('gallery_photos')
    .eq('user_id', uid)
    .single();

  if (fetchError) {
    console.error('Database fetch error:', fetchError);
    throw new Error('Failed to retrieve user profile');
  }

  const currentPhotos = userData?.gallery_photos || [];
  const updatedPhotos = [...currentPhotos, publicUrl];

  // Update the user's record with the new gallery photos array
  const { error: updateError } = await client
    .from('waitlist_users')
    .update({ gallery_photos: updatedPhotos })
    .eq('user_id', uid);

  if (updateError) {
    console.error('DB update error:', updateError);
    throw new Error('Failed to save gallery photo URL to database');
  }

  return updatedPhotos;
}

export async function deleteGalleryPhotoAction(
  idToken: string,
  photoUrl: string
): Promise<string[]> {
  const decodedToken = await verifyIdToken(idToken);
  const uid = decodedToken.uid;
  const client = createAdminClient();

  // Retrieve current user data
  const { data: userData, error: fetchError } = await client
    .from('waitlist_users')
    .select('gallery_photos')
    .eq('user_id', uid)
    .single();

  if (fetchError) {
    console.error('Database fetch error:', fetchError);
    throw new Error('Failed to retrieve user profile');
  }

  const currentPhotos: string[] = userData?.gallery_photos || [];
  if (!currentPhotos.includes(photoUrl)) {
    return currentPhotos;
  }
  const updatedPhotos = currentPhotos.filter(url => url !== photoUrl);

  // Update the user's record with the filtered array
  const { error: updateError } = await client
    .from('waitlist_users')
    .update({ gallery_photos: updatedPhotos })
    .eq('user_id', uid);

  if (updateError) {
    console.error('DB update error:', updateError);
    throw new Error('Failed to update gallery list in database');
  }

  // Delete the file only if it is one this user uploaded (gallery_<uid>_*)
  try {
    const fileName = storageObjectName(photoUrl, 'profiles');
    if (fileName && fileName.startsWith(`gallery_${uid}_`)) {
      await client.storage.from('profiles').remove([fileName]);
    }
  } catch (err) {
    console.warn('Failed to clean up image from storage bucket:', err);
  }

  return updatedPhotos;
}

/**
 * Step 1 of a showreel upload: returns a short-lived signed URL the browser uploads the
 * video to directly. Videos are far larger than the request-body limit for server
 * actions on Vercel (~4.5MB), so they must not be posted through an action.
 */
export async function createShowreelUploadAction(
  idToken: string,
  contentType: string,
  sizeBytes: number
): Promise<{ path: string; signedUrl: string }> {
  const decodedToken = await verifyIdToken(idToken);
  const extension = VIDEO_TYPES[contentType as keyof typeof VIDEO_TYPES];
  if (!extension) {
    throw new Error('Unsupported video type. Please upload an MP4, MOV or WebM file.');
  }
  if (!Number.isFinite(sizeBytes) || sizeBytes <= 0 || sizeBytes > MAX_VIDEO_BYTES) {
    throw new Error(`Videos must be smaller than ${Math.floor(MAX_VIDEO_BYTES / 1024 / 1024)}MB.`);
  }

  const client = createAdminClient();
  await ensurePublicBucket(client, 'profiles');
  const path = `video_${decodedToken.uid}_${Date.now()}.${extension}`;
  const { data, error } = await client.storage.from('profiles').createSignedUploadUrl(path);
  if (error || !data) {
    console.error('Error creating signed upload URL:', error);
    throw new Error('Could not start the upload. Please try again.');
  }
  return { path, signedUrl: data.signedUrl };
}

/** Step 2 of a showreel upload: verifies the uploaded file and saves it on the profile. */
export async function finalizeShowreelUploadAction(idToken: string, path: string): Promise<string> {
  const decodedToken = await verifyIdToken(idToken);
  const uid = decodedToken.uid;
  if (!new RegExp(`^video_${uid.replace(/[^a-zA-Z0-9_-]/g, '')}_\\d+\\.(mp4|webm|mov)$`).test(path)) {
    throw new Error('Invalid upload.');
  }

  const client = createAdminClient();
  const { data: files } = await client.storage.from('profiles').list('', { search: path, limit: 1 });
  if (!files?.some(f => f.name === path)) {
    throw new Error('Upload not found. Please try again.');
  }

  const publicUrl = client.storage.from('profiles').getPublicUrl(path).data.publicUrl;

  // Remove the previous self-hosted showreel so storage doesn't fill with orphans
  const { data: userData } = await client.from('waitlist_users').select('youtube_url').eq('user_id', uid).maybeSingle();
  const previous = userData?.youtube_url ? storageObjectName(userData.youtube_url, 'profiles') : null;

  const { error } = await client.from('waitlist_users').update({ youtube_url: publicUrl }).eq('user_id', uid);
  if (error) {
    console.error('DB update error:', error);
    throw new Error('Video uploaded but failed to save URL');
  }
  if (previous && previous !== path && previous.startsWith(`video_${uid}_`)) {
    await client.storage.from('profiles').remove([previous]).catch(() => undefined);
  }
  return publicUrl;
}

export async function deleteShowreelVideoAction(
  idToken: string
): Promise<boolean> {
  const decodedToken = await verifyIdToken(idToken);
  const uid = decodedToken.uid;
  const client = createAdminClient();

  // Retrieve current video URL
  const { data: userData, error: fetchError } = await client
    .from('waitlist_users')
    .select('youtube_url')
    .eq('user_id', uid)
    .single();

  if (fetchError || !userData) {
    throw new Error('Failed to retrieve user profile');
  }

  const currentUrl = userData.youtube_url;
  if (currentUrl) {
    // If it's a self-hosted uploaded video, delete it from storage
    if (currentUrl.includes('/profiles/video_')) {
      const fileName = storageObjectName(currentUrl, 'profiles');
      if (fileName && fileName.startsWith(`video_${uid}_`)) {
        await client.storage
          .from('profiles')
          .remove([fileName]);
      }
    }
  }

  // Clear youtube_url in DB
  const { error: updateError } = await client
    .from('waitlist_users')
    .update({ youtube_url: null })
    .eq('user_id', uid);

  if (updateError) {
    throw new Error('Failed to remove showreel video');
  }

  return true;
}

export async function changeUsernameAction(
  idToken: string,
  newUsername: string
): Promise<boolean> {
  const decodedToken = await verifyIdToken(idToken);
  const uid = decodedToken.uid;

  const normalised = newUsername.trim().toLowerCase();

  const usernameError = validateUsername(normalised);
  if (usernameError) {
    throw new Error(usernameError);
  }

  const client = createAdminClient();

  // Check if username is already taken by someone else
  const { data: takenData, error: checkError } = await client
    .from('waitlist_users')
    .select('user_id')
    .eq('username', normalised)
    .maybeSingle();

  if (checkError) {
    console.error('Error checking username unique constraint:', checkError);
    throw new Error('Database check failed');
  }

  if (takenData && takenData.user_id !== uid) {
    throw new Error(`Username "${normalised}" is already taken.`);
  }

  // Perform update
  const { error: updateError } = await client
    .from('waitlist_users')
    .update({ username: normalised })
    .eq('user_id', uid);

  if (updateError) {
    console.error('Error changing username:', updateError);
    throw new Error('Failed to update username');
  }

  return true;
}

/**
 * Links a pre-imported (unclaimed) profile to the signed-in account.
 * Only profiles that are not yet linked to a login can be claimed, and the caller must
 * prove ownership via a verified email or phone number matching the profile.
 */
export async function linkImportedProfile(
  idToken: string,
  waitlistId: string
): Promise<boolean> {
  const decodedToken = await verifyIdToken(idToken);
  const client = createAdminClient();

  const { data: existing, error: fetchError } = await client
    .from('waitlist_users')
    .select('user_id, display_name, username, email, phone')
    .eq('id', waitlistId)
    .maybeSingle();

  if (fetchError || !existing) {
    throw new Error('We could not find that profile.');
  }

  // Already linked to this account — nothing to do.
  if (existing.user_id === decodedToken.uid) {
    return true;
  }

  const isUnclaimed = !existing.user_id || existing.user_id.startsWith('imported_');
  if (!isUnclaimed) {
    throw new Error('This profile has already been claimed by another account.');
  }

  const tokenEmail = decodedToken.email_verified ? decodedToken.email?.trim().toLowerCase() : undefined;
  const rowEmail = existing.email?.trim().toLowerCase();
  const tokenPhone = decodedToken.phone_number?.replace(/\D/g, '').slice(-10);
  const rowPhone = existing.phone?.replace(/\D/g, '').slice(-10);
  const ownsProfile =
    (!!tokenEmail && tokenEmail === rowEmail) ||
    (!!tokenPhone && tokenPhone.length === 10 && tokenPhone === rowPhone);

  if (!ownsProfile) {
    throw new Error('Please sign in with the email address (or phone number) this invite was sent to.');
  }

  const updatePayload: { user_id: string; display_name?: string } = {
    user_id: decodedToken.uid,
  };
  if (!existing.display_name || existing.display_name.includes('@')) {
    updatePayload.display_name = ensureValidDisplayName(null, existing.username, existing.email || decodedToken.email);
  }

  const { error } = await client
    .from('waitlist_users')
    .update(updatePayload)
    .eq('id', waitlistId)
    .or('user_id.is.null,user_id.like.imported_%');

  if (error) {
    console.error("Error linking profile:", error);
    throw new Error('Failed to link profile');
  }
  return true;
}

export interface SubmitBookingRequestParams {
  artistUsername: string;
  artistDisplayName: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  eventDate: string;
  city: string;
  eventType: string;
  budget?: string;
  notes?: string;
}

export async function submitBookingRequestAction(params: SubmitBookingRequestParams): Promise<{ success: boolean; message: string }> {
  try {
    if (!params.artistUsername || !params.clientName || !params.clientEmail || !params.clientPhone || !params.eventDate || !params.city) {
      return { success: false, message: 'Please fill out all required fields.' };
    }
    if (!(await checkRateLimit('booking-request', 5, 10 * 60 * 1000))) {
      return { success: false, message: 'Too many requests. Please wait a few minutes and try again.' };
    }
    if (!isValidEmail(params.clientEmail)) {
      return { success: false, message: 'Please enter a valid email address.' };
    }
    if (!/^[a-z0-9_.]{3,30}$/.test(params.artistUsername.trim().toLowerCase())) {
      return { success: false, message: 'Invalid artist profile.' };
    }
    params = {
      ...params,
      artistDisplayName: cleanText(params.artistDisplayName, 80) || params.artistUsername,
      clientName: cleanText(params.clientName, 120) || '',
      clientPhone: cleanText(params.clientPhone, 30) || '',
      eventDate: cleanText(params.eventDate, 40) || '',
      city: cleanText(params.city, 80) || '',
      eventType: cleanText(params.eventType, 60) || 'other',
      budget: cleanText(params.budget, 60) || undefined,
      notes: cleanText(params.notes, 2000) || undefined,
    };

    const client = createAdminClient();
    
    // Attempt DB insertion
    const { error: dbError } = await client.from('booking_requests').insert({
      artist_username: params.artistUsername.toLowerCase().trim(),
      artist_display_name: params.artistDisplayName,
      client_name: params.clientName.trim(),
      client_email: params.clientEmail.trim(),
      client_phone: params.clientPhone.trim(),
      event_date: params.eventDate,
      city: params.city.trim(),
      event_type: params.eventType,
      budget: params.budget ? params.budget.trim() : null,
      notes: params.notes ? params.notes.trim() : null,
      status: 'pending',
    });

    if (dbError) {
      console.error('Booking request DB insert error:', dbError.message);
      return {
        success: false,
        message: 'We could not submit your booking request right now. Please try again in a moment.'
      };
    }

    // Trigger email notification to Artistant Concierge
    const { sendBookingRequestNotificationEmail } = await import('./mailer');
    await sendBookingRequestNotificationEmail(params).catch(err => {
      console.error('Email dispatch error on booking request:', err);
    });

    return {
      success: true,
      message: 'Booking request submitted successfully! Artistant concierge will reach out to you within 24 hours.'
    };
  } catch (err: any) {
    console.error('Error submitting booking request:', err);
    return { success: false, message: 'Failed to submit booking request. Please try again.' };
  }
}

export async function getPublicCreatorsDirectoryAction(params?: {
  category?: string;
  city?: string;
  search?: string;
  verifiedOnly?: boolean;
}) {
  try {
    const client = createAdminClient();
    let query = client
      .from('waitlist_users')
      .select('username, display_name, role, category, genres, city, profile_photo_url, cover_photo_url, spotify_url, is_verified, feature_founding_card, reserved_at')
      .eq('is_blocked', false)
      .not('username', 'is', null);

    if (params?.category && params.category !== 'all') {
      query = query.eq('category', params.category.slice(0, 40));
    }

    if (params?.city && params.city !== 'all') {
      query = query.ilike('city', `%${sanitizeFilterValue(params.city, 60)}%`);
    }

    if (params?.verifiedOnly) {
      query = query.eq('is_verified', true);
    }

    if (params?.search && params.search.trim() !== '') {
      const s = sanitizeFilterValue(params.search, 60);
      if (s) {
        query = query.or(`username.ilike.%${s}%,display_name.ilike.%${s}%`);
      }
    }

    query = query.order('is_verified', { ascending: false }).order('reserved_at', { ascending: true }).limit(60);

    const { data, error } = await query;
    if (error) {
      console.error('Error fetching creator directory:', error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error('Unhandled error in getPublicCreatorsDirectoryAction:', err);
    return [];
  }
}

