import { OutreachRecipient } from './email-actions';

/**
 * Helper to substitute all personalization tokens in a template string.
 */
export function substitutePersonalizationTokens(
  text: string,
  recipient: OutreachRecipient
): string {
  if (!text) return '';

  const recipientName = recipient.name || recipient.username || recipient.email.split('@')[0] || 'Member';
  const firstName = recipient.first_name || recipientName.split(' ')[0] || recipientName;
  const username = recipient.username || recipient.email.split('@')[0] || 'artist';
  const company = recipient.company || 'your organization';
  const city = recipient.city || 'your area';
  const email = recipient.email || '';
  const position = recipient.position !== undefined && recipient.position !== null ? String(recipient.position) : '100+';
  const customNote = recipient.custom_note || '';

  // The old /claim page is gone; sign-up now happens on the homepage.
  const uniqueClaimUrl = 'https://artistant.in/';

  return text
    .replaceAll('{{name}}', recipientName)
    .replaceAll('{{first_name}}', firstName)
    .replaceAll('{{username}}', username)
    .replaceAll('{{company}}', company)
    .replaceAll('{{city}}', city)
    .replaceAll('{{email}}', email)
    .replaceAll('{{position}}', position)
    .replaceAll('{{claim_url}}', uniqueClaimUrl)
    .replaceAll('{{custom_note}}', customNote)
    .replaceAll('{{id}}', recipient.id || '');
}
