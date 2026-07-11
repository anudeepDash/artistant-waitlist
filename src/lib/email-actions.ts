'use server';

import { sendWelcomeEmail, sendCustomEmail } from './mailer';
import { verifyIdToken, verifyAdminToken } from './firebase/admin';

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
