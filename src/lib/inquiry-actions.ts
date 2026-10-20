'use server';

import { getAdminSupabaseClient } from './supabase/admin';
import { checkRateLimit } from './rate-limit';
import { sendNormalEmail } from './mailer';
import { cleanText, isValidEmail } from './validation';

/**
 * Stores lead/contact forms that previously only pretended to submit
 * (campaign creator applications, "book a call", gig proposals) and notifies the team.
 */

export type InquirySource = 'creator_application' | 'book_call' | 'gig_proposal';

const SOURCE_LABELS: Record<InquirySource, string> = {
  creator_application: 'Creator campaign application',
  book_call: 'Book-a-call request',
  gig_proposal: 'Gig proposal',
};

export interface InquiryInput {
  source: InquirySource;
  /** Campaign / page / team member the inquiry is about, e.g. "jasmine-sandlas-bengaluru". */
  context?: string;
  name: string;
  email?: string;
  phone?: string;
  message?: string;
  details?: Record<string, string>;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export async function submitInquiryAction(input: InquiryInput): Promise<{ success: boolean; message: string }> {
  try {
    if (!(input.source in SOURCE_LABELS)) {
      return { success: false, message: 'Invalid form submission.' };
    }
    if (!(await checkRateLimit(`inquiry-${input.source}`, 5, 10 * 60 * 1000))) {
      return { success: false, message: 'Too many submissions. Please wait a few minutes and try again.' };
    }

    const name = cleanText(input.name, 120);
    const email = isValidEmail(input.email) ? input.email.trim().toLowerCase() : null;
    const phone = cleanText(input.phone, 30);
    if (!name || (!email && !phone)) {
      return { success: false, message: 'Please share your name and an email address or phone number.' };
    }

    const details: Record<string, string> = {};
    for (const [key, value] of Object.entries(input.details || {}).slice(0, 20)) {
      const cleanKey = key.replace(/[^a-zA-Z0-9_]/g, '').slice(0, 40);
      const cleanValue = cleanText(value, 500);
      if (cleanKey && cleanValue) details[cleanKey] = cleanValue;
    }

    const record = {
      source: input.source,
      context: cleanText(input.context, 120),
      name,
      email,
      phone,
      message: cleanText(input.message, 3000),
      details,
    };

    const { error } = await getAdminSupabaseClient().from('site_inquiries').insert(record);
    if (error) console.error('Error saving inquiry (run supabase_migration_security_hardening.sql):', error.message);

    const rows = [
      ['Name', name],
      ['Email', email],
      ['Phone', phone],
      ['Context', record.context],
      ...Object.entries(details),
      ['Message', record.message],
    ].filter((row): row is [string, string] => !!row[1]);

    const emailRes = await sendNormalEmail({
      toEmail: process.env.EMAIL_USER || 'hello@artistant.in',
      name: 'ArtisTant Team',
      subject: `${SOURCE_LABELS[input.source]}: ${name}`,
      messageBody: `<strong>New ${escapeHtml(SOURCE_LABELS[input.source])}</strong><br><br>${rows
        .map(([k, v]) => `• <strong>${escapeHtml(k)}:</strong> ${escapeHtml(v)}`)
        .join('<br>')}`,
      ctaText: 'Open Admin',
      ctaUrl: 'https://artistant.in/admin',
      senderAlias: 'official',
    }).catch((err) => ({ success: false, message: String(err) }));

    // Succeed if the submission reached us through either channel.
    if (error && !emailRes.success) {
      return { success: false, message: 'We could not submit your details right now. Please try again in a moment.' };
    }
    return { success: true, message: 'Thanks! We have received your details.' };
  } catch (err) {
    console.error('Error submitting inquiry:', err);
    return { success: false, message: 'We could not submit your details right now. Please try again in a moment.' };
  }
}
