'use server';

import { sendWelcomeEmail, sendCustomEmail } from './mailer';

interface SendWelcomeEmailActionParams {
  email: string;
  name: string;
  username: string;
}

/**
 * Next.js Server Action to securely trigger email dispatching from Client Components.
 */
export async function sendWelcomeEmailAction({
  email,
  name,
  username,
}: SendWelcomeEmailActionParams) {
  try {
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
  passcode: string;
  recipients: { email: string; name: string }[];
  subject: string;
  messageBody: string;
  ctaText?: string;
  ctaUrl?: string;
}

/**
 * Next.js Server Action to broadcast a custom email campaign to waitlist users.
 */
export async function sendMassEmailAction({
  passcode,
  recipients,
  subject,
  messageBody,
  ctaText,
  ctaUrl,
}: SendMassEmailActionParams) {
  try {
    if (passcode !== 'ARTISTANT_ADMIN_2026') {
      return { success: false, message: 'Invalid admin passcode.' };
    }
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
