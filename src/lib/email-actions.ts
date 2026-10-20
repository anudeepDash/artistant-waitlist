'use server';

import { headers } from 'next/headers';
import {
  sendWelcomeEmail,
  sendCustomEmail,
  sendPasswordResetEmail,
  sendHostWelcomeEmail,
  sendTeamSignupEmail,
  sendVenueWelcomeEmail,
} from './mailer';
import { verifyIdToken, verifyAdminToken, generatePasswordResetLink, auth } from './firebase/admin';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

interface SendWelcomeEmailActionParams {
  idToken: string;
  email: string;
  name: string;
  username: string;
}

/**
 * Next.js Server Action to securely trigger email dispatching from Client Components.
 * Verifies the caller's identity via Firebase ID token before sending.
 */
export async function sendWelcomeEmailAction({
  idToken,
  email,
  name,
  username,
}: SendWelcomeEmailActionParams) {
  try {
    // Verify the caller is authenticated
    const decoded = await verifyIdToken(idToken);

    // Only allow sending welcome emails to the caller's own email address,
    // unless the caller is an admin (who may verify and welcome other users)
    if (decoded.email !== email) {
      // Check if caller is admin
      try {
        await verifyAdminToken(idToken);
      } catch {
        return { success: false, message: 'You can only send welcome emails to your own address.' };
      }
    }

    if (!email) {
      return { success: false, message: 'Email address is required.' };
    }
    
    return await sendWelcomeEmail({ email, name, username });
  } catch (error: any) {
    console.error('Failed to trigger sendWelcomeEmail action:', error);
    return { success: false, message: error?.message || 'Server action error.' };
  }
}

import { EmailAttachmentItem } from './mailer';

export interface OutreachRecipient {
  email: string;
  name?: string;
  first_name?: string;
  username?: string;
  company?: string;
  city?: string;
  id?: string;
  custom_note?: string;
  position?: number | string;
}

interface SendMassEmailActionParams {
  idToken: string;
  recipients: OutreachRecipient[];
  subject: string;
  messageBody: string;
  ctaText?: string;
  ctaUrl?: string;
  senderAlias?: string;
  templateType?: 'standard' | 'welcome' | 'vip' | 'newsletter' | 'raw' | 'plain_minimal' | 'migrated_artist';
  emailHeader?: string;
  pillTag?: string;
  attachments?: EmailAttachmentItem[];
}

import { substitutePersonalizationTokens } from './outreach-helpers';

/**
 * Next.js Server Action to send a single personalized outreach email.
 */
export async function sendSingleOutreachEmailAction({
  idToken,
  recipient,
  subject,
  messageBody,
  ctaText,
  ctaUrl,
  senderAlias,
  templateType = 'standard',
  emailHeader,
  pillTag,
  attachments = [],
}: {
  idToken: string;
  recipient: OutreachRecipient;
  subject: string;
  messageBody: string;
  ctaText?: string;
  ctaUrl?: string;
  senderAlias?: string;
  templateType?: 'standard' | 'welcome' | 'vip' | 'newsletter' | 'raw' | 'plain_minimal' | 'migrated_artist';
  emailHeader?: string;
  pillTag?: string;
  attachments?: EmailAttachmentItem[];
}) {
  try {
    await verifyAdminToken(idToken);

    if (!recipient.email) {
      return { success: false, message: 'Recipient email is required.' };
    }

    const recipientName = recipient.name || recipient.username || recipient.email.split('@')[0] || 'Member';
    const recipientUsername = recipient.username || recipient.email.split('@')[0] || 'artist';

    const personalizedSubject = substitutePersonalizationTokens(subject, recipient);
    const personalizedBody = substitutePersonalizationTokens(messageBody, recipient);
    const personalizedHeader = emailHeader ? substitutePersonalizationTokens(emailHeader, recipient) : undefined;
    const personalizedCtaUrl = ctaUrl ? substitutePersonalizationTokens(ctaUrl, recipient) : undefined;

    const res = await sendCustomEmail({
      toEmail: recipient.email,
      name: recipientName,
      username: recipientUsername,
      subject: personalizedSubject,
      messageBody: personalizedBody,
      ctaText,
      ctaUrl: personalizedCtaUrl,
      senderAlias,
      templateType,
      headerTitle: personalizedHeader,
      pillTag,
      attachments,
    });

    return res;
  } catch (error: any) {
    console.error('Failed in sendSingleOutreachEmailAction:', error);
    return { success: false, message: error?.message || 'Server action error.' };
  }
}

/**
 * Next.js Server Action to broadcast a custom email campaign to waitlist users.
 * Verifies the caller is an authorized admin via Firebase ID token.
 */
export async function sendMassEmailAction({
  idToken,
  recipients,
  subject,
  messageBody,
  ctaText,
  ctaUrl,
  senderAlias,
  templateType = 'standard',
  emailHeader,
  pillTag,
  attachments = [],
}: SendMassEmailActionParams) {
  try {
    await verifyAdminToken(idToken);

    if (!recipients || recipients.length === 0) {
      return { success: false, message: 'No recipients provided.' };
    }

    const results = [];
    let successCount = 0;

    for (const recipient of recipients) {
      if (!recipient.email) continue;

      const recipientName = recipient.name || recipient.username || recipient.email.split('@')[0] || 'Member';
      const recipientUsername = recipient.username || recipient.email.split('@')[0] || 'artist';

      const personalizedSubject = substitutePersonalizationTokens(subject, recipient);
      const personalizedBody = substitutePersonalizationTokens(messageBody, recipient);
      const personalizedHeader = emailHeader ? substitutePersonalizationTokens(emailHeader, recipient) : undefined;
      const personalizedCtaUrl = ctaUrl ? substitutePersonalizationTokens(ctaUrl, recipient) : undefined;

      const res = await sendCustomEmail({
        toEmail: recipient.email,
        name: recipientName,
        username: recipientUsername,
        subject: personalizedSubject,
        messageBody: personalizedBody,
        ctaText,
        ctaUrl: personalizedCtaUrl,
        senderAlias,
        templateType,
        headerTitle: personalizedHeader,
        pillTag,
        attachments,
      });
      
      if (res.success) {
        successCount++;
      }
      
      results.push({ 
        email: recipient.email, 
        name: recipientName,
        success: res.success, 
        message: res.message 
      });
    }

    return {
      success: true,
      message: `Successfully broadcasted to ${successCount} out of ${recipients.length} recipients.`,
      details: results,
    };
  } catch (error: any) {
    console.error('Failed to trigger sendMassEmailAction server action:', error);
    return { success: false, message: error?.message || 'Server action error.' };
  }
}

/**
 * Next.js Server Action to securely trigger password reset email dispatch.
 * Generates the reset link via Firebase Admin SDK and sends it via Nodemailer with custom theme.
 */
const RESET_SENT_MESSAGE = 'If an account exists for that email, a reset link is on its way.';

export async function sendPasswordResetEmailAction(email: string) {
  try {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return { success: false, message: 'A valid email address is required.' };
    }
    email = email.trim().toLowerCase();
    // At most a few reset emails per address per 10 minutes.
    if (tooMany(`reset:${email}`, 3)) {
      return { success: true, message: RESET_SENT_MESSAGE };
    }

    // Generate Firebase password reset link
    const resetLink = await generatePasswordResetLink(email);

    // Try to find the user's name from Firebase Admin or Supabase to personalize the greeting
    let name = 'ArtisTant Member';
    try {
      const userRecord = await auth.getUserByEmail(email);
      if (userRecord.displayName) {
        name = userRecord.displayName;
      } else {
        // Fallback to searching waitlist in Supabase if exists
        const supabase = createSupabaseClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!,
          {
            auth: {
              persistSession: false,
              autoRefreshToken: false,
            },
          }
        );
        const { data } = await supabase
          .from('waitlist_users')
          .select('display_name')
          .eq('email', email)
          .maybeSingle();
        if (data && data.display_name) {
          name = data.display_name;
        }
      }
    } catch (e) {
      console.warn('Could not retrieve user displayName for reset email:', e);
    }

    return await sendPasswordResetEmail({ email, name, resetLink });
  } catch (error: any) {
    console.error('Failed to trigger sendPasswordResetEmail action:', error);
    // Same answer whether or not the account exists, so this can't be used to check who has signed up.
    if (error?.code === 'auth/user-not-found' || error?.errorInfo?.code === 'auth/email-not-found') {
      return { success: true, message: RESET_SENT_MESSAGE };
    }
    return { success: false, message: 'We couldn’t send the reset email just now. Please try again in a minute.' };
  }
}

/* ───────────── Host and venue sign-ups ───────────── */

export interface RoleSignupInput {
  role: 'organizer' | 'venue';
  name: string;
  email: string;
  phone: string;
  city: string;
  orgName?: string;
  eventFormats?: string[];
  bookingBudget?: string;
  hostNotes?: string;
  venueName?: string;
  venueType?: string;
  capacity?: string;
  soundGear?: string[];
  venueNotes?: string;
  /** Hidden field. People leave it empty; bots fill it in. */
  website?: string;
}

// Best-effort limit on repeat sends from one browser or to one address.
// It lives in server memory, so it resets on redeploys and isn't shared between instances.
const recentSignups = new Map<string, number[]>();
const WINDOW_MS = 10 * 60 * 1000;

function tooMany(key: string, max: number): boolean {
  const now = Date.now();
  const hits = (recentSignups.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  if (hits.length >= max) {
    recentSignups.set(key, hits);
    return true;
  }
  hits.push(now);
  recentSignups.set(key, hits);
  return false;
}

const clip = (v: unknown, n = 300) => (typeof v === 'string' ? v.trim().slice(0, n) : '');
const clipList = (v: unknown) => (Array.isArray(v) ? v.filter((x) => typeof x === 'string').slice(0, 12).map((x) => clip(x, 60)) : []);

/**
 * Saves a host or venue sign-up by emailing it to the team inbox, then sends the
 * person their welcome email. Until sign-ups have a database table, the team
 * inbox is the record.
 */
export async function joinRoleWaitlistAction(input: RoleSignupInput): Promise<{ success: boolean; message: string }> {
  try {
    if (input.role !== 'organizer' && input.role !== 'venue') return { success: false, message: 'Unknown sign-up type.' };
    // Quietly accept bot submissions without sending anything.
    if (clip(input.website)) return { success: true, message: 'Thanks!' };

    const name = clip(input.name, 80);
    const email = clip(input.email, 120).toLowerCase();
    if (name.length < 2) return { success: false, message: 'Please add your name.' };
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return { success: false, message: 'Please check your email address.' };

    const ip = ((await headers()).get('x-forwarded-for') ?? 'unknown').split(',')[0].trim();
    if (tooMany(`ip:${ip}`, 5) || tooMany(`email:${email}`, 2)) {
      return { success: false, message: 'You’ve already signed up. Check your inbox, or write to hello@artistant.in.' };
    }

    const city = clip(input.city, 80);
    const phone = clip(input.phone, 30);
    const isHost = input.role === 'organizer';

    const details: [string, string][] = isHost
      ? [
          ['Name', name],
          ['Email', email],
          ['Phone', phone],
          ['City', city],
          ['Organisation', clip(input.orgName, 120)],
          ['Events', clipList(input.eventFormats).join(', ')],
          ['Budget', clip(input.bookingBudget, 60)],
          ['Notes', clip(input.hostNotes, 1000)],
        ]
      : [
          ['Name', name],
          ['Email', email],
          ['Phone', phone],
          ['City', city],
          ['Venue', clip(input.venueName, 120)],
          ['Type', clip(input.venueType, 60)],
          ['Capacity', clip(input.capacity, 40)],
          ['Sound gear', clipList(input.soundGear).join(', ')],
          ['Notes', clip(input.venueNotes, 1000)],
        ];

    const team = await sendTeamSignupEmail({ kind: isHost ? 'Host' : 'Venue', details, replyTo: email });
    if (!team.success) return { success: false, message: 'We couldn’t save that just now. Please try again, or write to hello@artistant.in.' };

    const welcome = isHost
      ? await sendHostWelcomeEmail({ email, name, city, eventType: clipList(input.eventFormats)[0] })
      : await sendVenueWelcomeEmail({ email, name, venueName: clip(input.venueName, 120), city });
    if (!welcome.success) console.warn('Sign-up saved but welcome email failed:', welcome.message);

    return { success: true, message: 'You’re on the list.' };
  } catch (error: unknown) {
    console.error('joinRoleWaitlistAction failed:', error);
    return { success: false, message: 'We couldn’t save that just now. Please try again, or write to hello@artistant.in.' };
  }
}
