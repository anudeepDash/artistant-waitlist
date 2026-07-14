'use server';

import { createClient } from '@supabase/supabase-js';
import { verifyIdToken } from './firebase/admin';
import { cookies, headers } from 'next/headers';
import crypto from 'crypto';
import { type WaitlistEntry } from './waitlist';

const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const MAX_VIDEO_BYTES = 15 * 1024 * 1024;

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

function createAdminClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRoleKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
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
    .update({ custom_status_message: message })
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

  // Ensure the 'profiles' bucket exists (service role can create buckets)
  const { data: buckets } = await client.storage.listBuckets();
  const bucketExists = buckets?.some(b => b.name === 'profiles');
  if (!bucketExists) {
    await client.storage.createBucket('profiles', { public: true });
  }

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

  const { error } = await client
    .from('waitlist_users')
    .update({ profile_photo_url: photoUrl })
    .eq('user_id', decodedToken.uid);

  if (error) {
    console.error("Error updating profile photo URL:", error);
    throw new Error('Failed to update profile photo');
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
    .update({ section_order: sectionOrder })
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

  const { error } = await client
    .from('waitlist_users')
    .update({
      ...(settings.email !== undefined ? { email: settings.email } : {}),
      ...(settings.phone !== undefined ? { phone: settings.phone } : {}),
      ...(settings.contact_email_enabled !== undefined ? { contact_email_enabled: settings.contact_email_enabled } : {}),
      ...(settings.contact_phone_enabled !== undefined ? { contact_phone_enabled: settings.contact_phone_enabled } : {}),
    })
    .eq('user_id', decodedToken.uid);

  if (error) {
    console.error("Error updating contact settings:", error);
    throw new Error('Failed to update contact settings');
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

  const { error } = await client
    .from('waitlist_users')
    .update({
      ...(details.display_name !== undefined ? { display_name: details.display_name } : {}),
      ...(details.category !== undefined ? { category: details.category } : {}),
      ...(details.genres !== undefined ? { genres: details.genres } : {}),
      ...(details.city !== undefined ? { city: details.city } : {}),
      ...(details.bio !== undefined ? { bio: details.bio } : {}),
      ...(details.instagram_url !== undefined ? { instagram_url: details.instagram_url } : {}),
      ...(details.spotify_url !== undefined ? { spotify_url: details.spotify_url } : {}),
      ...(details.youtube_url !== undefined ? { youtube_url: details.youtube_url } : {}),
      ...(details.youtube_channel_url !== undefined ? { youtube_channel_url: details.youtube_channel_url } : {}),
    })
    .eq('user_id', decodedToken.uid);

  if (error) {
    console.error("Error updating profile details:", error);
    throw new Error('Failed to update profile details');
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
  
  // 2. Fetch referral count (verified)
  const { count: referralCount } = await client
    .from('waitlist_users')
    .select('id', { count: 'exact', head: true })
    .eq('referred_by', normalisedUsername)
    .eq('is_verified', true);
    
  const verifiedRefs = referralCount || 0;
  const calculatedPoints = 100 + verifiedRefs * 50 + (reservation.story_shared === true ? 80 : 0);
  
  // 3. Fetch waitlist position
  let pos = reservation.position_override;
  if (pos === undefined || pos === null) {
    const { count } = await client
      .from('waitlist_users')
      .select('id', { count: 'exact', head: true })
      .eq('is_blocked', false)
      .lte('reserved_at', reservation.reserved_at);
    pos = count;
  }
  
  const waitlistPos = pos || 120;
  const cohortVal = waitlistPos ? Math.ceil(waitlistPos / 100).toString().padStart(3, '0') : '003';
  
  return {
    reservation: {
      username: reservation.username,
      display_name: reservation.display_name,
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

  // Ensure the 'profiles' bucket exists (service role can create buckets)
  const { data: buckets } = await client.storage.listBuckets();
  const bucketExists = buckets?.some(b => b.name === 'profiles');
  if (!bucketExists) {
    await client.storage.createBucket('profiles', { public: true });
  }

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

  // Attempt to delete from Supabase storage
  try {
    const fileName = photoUrl.split('/').pop();
    if (fileName) {
      await client.storage.from('profiles').remove([fileName]);
    }
  } catch (err) {
    console.warn('Failed to clean up image from storage bucket:', err);
  }

  return updatedPhotos;
}

export async function uploadShowreelVideoAction(
  idToken: string,
  base64DataUrl: string,
  _fileExtension: string
): Promise<string> {
  const decodedToken = await verifyIdToken(idToken);
  const uid = decodedToken.uid;
  const client = createAdminClient();

  const { buffer, contentType, extension } = parseBase64Upload(base64DataUrl, VIDEO_TYPES, MAX_VIDEO_BYTES);
  const fileName = `video_${uid}_${Date.now()}.${extension}`;

  // Ensure the 'profiles' bucket exists
  const { data: buckets } = await client.storage.listBuckets();
  const bucketExists = buckets?.some(b => b.name === 'profiles');
  if (!bucketExists) {
    await client.storage.createBucket('profiles', { public: true });
  }

  // Upload to storage (upsert to handle re-uploads)
  const { error: uploadError } = await client.storage
    .from('profiles')
    .upload(fileName, buffer, {
      contentType,
      upsert: true,
    });

  if (uploadError) {
    console.error('Storage upload error:', uploadError);
    throw new Error(`Failed to upload video: ${uploadError.message}`);
  }

  // Get the public URL
  const { data: publicUrlData } = client.storage
    .from('profiles')
    .getPublicUrl(fileName);
  
  const publicUrl = publicUrlData.publicUrl;

  // Update user profile youtube_url with this new public URL
  const { error: updateError } = await client
    .from('waitlist_users')
    .update({ youtube_url: publicUrl })
    .eq('user_id', uid);

  if (updateError) {
    console.error('DB update error:', updateError);
    throw new Error('Video uploaded but failed to save URL');
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
      const fileName = currentUrl.split('/').pop();
      if (fileName) {
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
