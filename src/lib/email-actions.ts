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

interface SendMassEmailActionParams {
  idToken: string;
  recipients: { email: string; name: string }[];
  subject: string;
  messageBody: string;
  ctaText?: string;
  ctaUrl?: string;
  senderAlias?: string;
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
      const res = await sendCustomEmail({
        toEmail: recipient.email,
        name: recipient.name,
        subject,
        messageBody,
        ctaText,
        ctaUrl,
        senderAlias,
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
