'use server';

import { createClient } from '@supabase/supabase-js';
import { verifyIdToken } from './firebase/admin';

function createAdminClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRoleKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}

export async function incrementProfileVisitorsAction(username: string) {
  const client = createAdminClient();
  
  const { data, error } = await client
    .from('waitlist_users')
    .select('profile_visitors_count')
    .eq('username', username)
    .single();
    
  if (error || !data) return false;
  
  const newCount = (data.profile_visitors_count || 0) + 1;
  
  await client
    .from('waitlist_users')
    .update({ profile_visitors_count: newCount })
    .eq('username', username);
    
  return true;
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
  fileExtension: string,
): Promise<string> {
  const decodedToken = await verifyIdToken(idToken);
  const uid = decodedToken.uid;
  const client = createAdminClient();

  // Decode the base64 data URL into a buffer
  const base64Data = base64DataUrl.split(',')[1];
  if (!base64Data) {
    throw new Error('Invalid image data');
  }
  const buffer = Buffer.from(base64Data, 'base64');

  // Determine content type
  const mimeMatch = base64DataUrl.match(/^data:(image\/\w+);/);
  const contentType = mimeMatch ? mimeMatch[1] : 'image/jpeg';

  const fileName = `${uid}_${Date.now()}.${fileExtension || 'jpg'}`;

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

export async function getPublicProfileDataAction(username: string): Promise<{
  reservation: any;
  points: number;
  waitlistPos: number;
  cohortVal: string;
} | null> {
  const client = createAdminClient();
  
  // 1. Fetch waitlist entry
  const { data: reservation, error } = await client
    .from('waitlist_users')
    .select('*')
    .eq('username', username.trim().toLowerCase())
    .maybeSingle();
    
  if (error || !reservation) {
    return null;
  }
  
  // 2. Fetch referral count (verified)
  const { count: referralCount } = await client
    .from('waitlist_users')
    .select('id', { count: 'exact', head: true })
    .eq('referred_by', username.trim().toLowerCase())
    .eq('is_verified', true);
    
  const verifiedRefs = referralCount || 0;
  const calculatedPoints = 100 + verifiedRefs * 50 + (reservation.story_shared === true ? 80 : 0);
  
  // 3. Fetch waitlist position
  let pos = reservation.position_override;
  if (pos === undefined || pos === null) {
    const { count } = await client
      .from('waitlist_users')
      .select('id', { count: 'exact', head: true })
      .lte('reserved_at', reservation.reserved_at);
    pos = count;
  }
  
  const waitlistPos = pos || 120;
  const cohortVal = waitlistPos ? Math.ceil(waitlistPos / 100).toString().padStart(3, '0') : '003';
  
  return {
    reservation,
    points: calculatedPoints,
    waitlistPos,
    cohortVal
  };
}

export async function getWaitlistEntryByUsernameAction(username: string) {
  const client = createAdminClient();
  const { data, error } = await client
    .from('waitlist_users')
    .select('*')
    .eq('username', username.trim().toLowerCase())
    .maybeSingle();
  if (error || !data) return null;
  return data;
}

export async function uploadGalleryPhotoAction(
  idToken: string,
  base64DataUrl: string,
  fileExtension: string
): Promise<string[]> {
  const decodedToken = await verifyIdToken(idToken);
  const uid = decodedToken.uid;
  const client = createAdminClient();

  // Decode the base64 data URL into a buffer
  const base64Data = base64DataUrl.split(',')[1];
  if (!base64Data) {
    throw new Error('Invalid image data');
  }
  const buffer = Buffer.from(base64Data, 'base64');

  // Determine content type
  const mimeMatch = base64DataUrl.match(/^data:(image\/\w+);/);
  const contentType = mimeMatch ? mimeMatch[1] : 'image/jpeg';

  const fileName = `gallery_${uid}_${Date.now()}.${fileExtension || 'jpg'}`;

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

