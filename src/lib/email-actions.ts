'use server';

import { sendWelcomeEmail, sendCustomEmail, sendPasswordResetEmail } from './mailer';
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

interface SendMassEmailActionParams {
  idToken: string;
  recipients: { email: string; name: string; username?: string; id?: string }[];
  subject: string;
  messageBody: string;
  ctaText?: string;
  ctaUrl?: string;
  senderAlias?: string;
  templateType?: 'standard' | 'welcome' | 'vip' | 'newsletter' | 'raw' | 'migrated_artist';
  emailHeader?: string;
  pillTag?: string;
  attachments?: EmailAttachmentItem[];
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

      const recipientName = recipient.name || recipient.username || 'Artist';
      const recipientUsername = recipient.username || 'artist';

      // Make CTA URL & claim_url dynamic and unique per artist recipient
      const queryParts: string[] = [];
      if (recipient.id) queryParts.push(`id=${encodeURIComponent(recipient.id)}`);
      if (recipient.username) queryParts.push(`username=${encodeURIComponent(recipient.username)}`);
      if (recipient.email) queryParts.push(`email=${encodeURIComponent(recipient.email)}`);

      const uniqueClaimUrl = `https://artistant.in/claim${queryParts.length > 0 ? `?${queryParts.join('&')}` : ''}`;
      let finalCtaUrl = ctaUrl || uniqueClaimUrl;

      if (ctaUrl && (ctaUrl.includes('{{username}}') || ctaUrl.includes('{{id}}') || ctaUrl.includes('{{name}}'))) {
        finalCtaUrl = ctaUrl
          .replaceAll('{{name}}', recipientName)
          .replaceAll('{{username}}', recipientUsername)
          .replaceAll('{{id}}', recipient.id || '');
      } else if (ctaUrl && (ctaUrl.includes('/claim') || templateType === 'migrated_artist')) {
        finalCtaUrl = uniqueClaimUrl;
      }

      // Replace {{name}}, {{username}}, {{claim_url}} in body text dynamically
      const personalizedBody = (messageBody || '')
        .replaceAll('{{name}}', recipientName)
        .replaceAll('{{username}}', recipientUsername)
        .replaceAll('{{claim_url}}', uniqueClaimUrl);

      // Replace {{name}}, {{username}} in subject line dynamically
      const personalizedSubject = (subject || '')
        .replaceAll('{{name}}', recipientName)
        .replaceAll('{{username}}', recipientUsername);

      const personalizedHeader = emailHeader
        ? emailHeader.replaceAll('{{name}}', recipientName).replaceAll('{{username}}', recipientUsername)
        : undefined;

      const res = await sendCustomEmail({
        toEmail: recipient.email,
        name: recipientName,
        username: recipientUsername,
        subject: personalizedSubject,
        messageBody: personalizedBody,
        ctaText,
        ctaUrl: finalCtaUrl,
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
export async function sendPasswordResetEmailAction(email: string) {
  try {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return { success: false, message: 'A valid email address is required.' };
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
    if (error.code === 'auth/user-not-found') {
      return { success: false, message: 'There is no user record corresponding to this identifier. The user may have been deleted.' };
    }
    return { success: false, message: error?.message || 'Server action error.' };
  }
}
