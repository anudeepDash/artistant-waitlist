import nodemailer from 'nodemailer';
import {
  artistWelcomeEmail,
  broadcastEmail,
  hostWelcomeEmail,
  launchEmail,
  noticeEmail,
  passwordResetEmail,
  teamSignupEmail,
  venueWelcomeEmail,
} from './emails/templates';
import { C, F, esc, type EmailContent, type EmailSide } from './emails/kit';

// Load environment variables
const EMAIL_HOST = process.env.EMAIL_HOST || 'smtp.gmail.com';
const EMAIL_PORT = parseInt(process.env.EMAIL_PORT || '587', 10);
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;

/**
 * Escapes HTML special characters to prevent XSS in email templates.
 */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Strips HTML tags for a clean plain text fallback email body
 */
function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim();
}

/**
 * Creates and returns a Nodemailer transporter.
 */
function getTransporter() {
  if (!EMAIL_USER || !EMAIL_PASS) {
    throw new Error(
      'Mailer Error: EMAIL_USER or EMAIL_PASS is not configured in environment variables.'
    );
  }

  return nodemailer.createTransport({
    host: EMAIL_HOST,
    port: EMAIL_PORT,
    secure: EMAIL_PORT === 465, // True for 465, false for other ports (like 587)
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: true,
    },
  });
}

export function getSenderHeader(aliasKey?: string): string {
  const defaultUser = EMAIL_USER || 'hello@artistant.in';
  if (!defaultUser.includes('@')) {
    return `"ArtisTant" <${defaultUser}>`;
  }
  const domain = defaultUser.split('@')[1];
  const isGmail = domain === 'gmail.com' || domain.startsWith('googlemail.');

  let displayName = 'ArtisTant';
  let localPart = 'hello';

  switch (aliasKey) {
    case 'official':
    case 'info':
      displayName = 'ArtisTant Official';
      localPart = 'info';
      break;
    case 'support':
      displayName = 'ArtisTant Support';
      localPart = 'support';
      break;
    case 'founder':
      displayName = 'ArtisTant Founder';
      localPart = 'founder';
      break;
    case 'welcome':
      displayName = 'ArtisTant Welcome';
      localPart = 'welcome';
      break;
    case 'security':
      displayName = 'ArtisTant Security';
      localPart = 'security';
      break;
    case 'hello':
    default:
      displayName = 'ArtisTant';
      localPart = 'hello';
      break;
  }

  if (isGmail) {
    return `"${displayName}" <${defaultUser}>`;
  }
  return `"${displayName}" <${localPart}@${domain}>`;
}

interface WelcomeEmailParams {
  email: string;
  name: string;
  username: string;
}

/** Sends one rendered Artistant email. */
async function deliver(to: string, mail: EmailContent, senderAlias: string, label: string): Promise<{ success: boolean; message: string }> {
  try {
    const transporter = getTransporter();
    const info = await transporter.sendMail({
      from: getSenderHeader(senderAlias),
      to,
      subject: mail.subject,
      text: mail.text,
      html: mail.html,
    });
    console.log(`${label} email sent to ${to}. Message ID: ${info.messageId}`);
    return { success: true, message: `Email sent. Message ID: ${info.messageId}` };
  } catch (error: unknown) {
    console.error(`Error sending ${label} email:`, error);
    return { success: false, message: error instanceof Error ? error.message : `Unknown error while sending ${label} email.` };
  }
}

/** Sends the "you're on the line-up" email to an artist who just claimed a name. */
export async function sendWelcomeEmail({ email, name, username }: WelcomeEmailParams): Promise<{ success: boolean; message: string }> {
  return deliver(email, artistWelcomeEmail({ name, username, email }), 'welcome', 'Welcome');
}

/** Confirmation for someone who joined the host list. */
export async function sendHostWelcomeEmail(p: { email: string; name: string; city?: string; eventType?: string }) {
  return deliver(p.email, hostWelcomeEmail(p), 'welcome', 'Host welcome');
}

/** Confirmation for a venue that joined the list. */
export async function sendVenueWelcomeEmail(p: { email: string; name: string; venueName?: string; city?: string }) {
  return deliver(p.email, venueWelcomeEmail(p), 'welcome', 'Venue welcome');
}

/** Tells the team inbox about a new host or venue sign-up. */
export async function sendTeamSignupEmail(p: { kind: 'Host' | 'Venue'; details: [string, string][]; replyTo?: string }) {
  const to = EMAIL_USER || 'hello@artistant.in';
  const mail = teamSignupEmail(p);
  try {
    const transporter = getTransporter();
    const info = await transporter.sendMail({
      from: getSenderHeader('official'),
      to,
      replyTo: p.replyTo,
      subject: mail.subject,
      text: mail.text,
      html: mail.html,
    });
    return { success: true, message: `Email sent. Message ID: ${info.messageId}` };
  } catch (error: unknown) {
    console.error('Error sending team sign-up email:', error);
    return { success: false, message: error instanceof Error ? error.message : 'Unknown error while sending team email.' };
  }
}

/** "We're live" email for a side of the stage. Not sent automatically; for launch day. */
export async function sendLaunchEmail(p: { email: string; name: string; side: EmailSide }) {
  return deliver(p.email, launchEmail({ side: p.side, name: p.name }), 'official', 'Launch');
}

export interface EmailAttachmentItem {
  id?: string;
  title: string;
  fileType: string;
  size?: string;
  url: string;
  description?: string;
}

/**
 * Renders an inline visual attachment card for email HTML body.
 */
export function renderAttachmentHtml(attachments?: EmailAttachmentItem[]): string {
  if (!attachments || attachments.length === 0) return '';
  const items = attachments
    .map((att) => {
      const ext = (att.fileType || 'FILE').toUpperCase();
      const meta = [ext, att.size].filter(Boolean).map((x) => esc(x)).join(' &middot; ');
      return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${C.card2}" style="background-color:${C.card2};border:1px solid ${C.line};border-radius:14px;margin-top:10px;"><tr>
<td width="52" valign="middle" style="padding:14px 0 14px 14px;"><div style="width:40px;height:40px;line-height:40px;border-radius:10px;background-color:${C.bg};text-align:center;font-family:${F.mono};font-size:10px;font-weight:600;color:${C.orange};">${esc(ext.slice(0, 4))}</div></td>
<td valign="middle" style="padding:14px 12px;">
<div style="font-family:${F.sans};font-size:14px;font-weight:700;color:${C.ink};">${esc(att.title)}</div>
<div style="margin-top:3px;font-family:${F.mono};font-size:11px;color:${C.ink3};">${meta}</div>
${att.description ? `<div style="margin-top:4px;font-family:${F.sans};font-size:12px;color:${C.ink2};">${esc(att.description)}</div>` : ''}
</td>
<td width="84" valign="middle" align="right" style="padding:14px 14px 14px 0;"><a href="${esc(att.url)}" target="_blank" style="display:inline-block;padding:9px 14px;border-radius:99px;background-color:${C.ink};font-family:${F.sans};font-size:12px;font-weight:700;color:${C.dayInk};text-decoration:none;">Open &rarr;</a></td>
</tr></table>`;
    })
    .join('');
  return `<div style="margin-top:26px;font-family:${F.mono};font-size:10px;letter-spacing:2.5px;text-transform:uppercase;color:${C.ink3};">Attached (${attachments.length})</div>${items}`;
}

interface CustomEmailParams {
  toEmail: string;
  name: string;
  username?: string;
  subject: string;
  messageBody: string;
  ctaText?: string;
  ctaUrl?: string;
  senderAlias?: string;
  templateType?: 'standard' | 'welcome' | 'vip' | 'newsletter' | 'raw' | 'plain_minimal' | 'migrated_artist';
  headerTitle?: string;
  pillTag?: string;
  attachments?: EmailAttachmentItem[];
}

/**
 * Sends a custom broadcast email supporting multiple templates, custom pill tags,
 * direct raw mode, visual attachments, and custom CTA destinations.
 */
export async function sendCustomEmail({
  toEmail,
  name,
  subject,
  messageBody,
  ctaText = 'Visit ArtisTant',
  ctaUrl = 'https://artistant.in',
  senderAlias,
  templateType = 'standard',
  headerTitle,
  pillTag,
  attachments = [],
}: CustomEmailParams): Promise<{ success: boolean; message: string }> {
  try {
    const transporter = getTransporter();
    const formattedMessage = messageBody.replace(/\n/g, '<br />');
    const attachmentHtml = renderAttachmentHtml(attachments);

    const compiledHtml = broadcastEmail({
      style: templateType,
      name: name || '',
      subject,
      headerTitle,
      pillTag,
      messageHtml: formattedMessage,
      extraHtml: attachmentHtml,
      ctaText,
      ctaUrl,
    });

    // Prepare Nodemailer attachment array if URLs exist
    const mailerAttachments = attachments
      .filter((att) => att.url)
      .map((att) => ({
        filename: att.title || 'Attachment',
        path: att.url,
      }));

    // Configure mail options
    const mailOptions = {
      from: getSenderHeader(senderAlias),
      to: toEmail,
      subject: subject,
      text: stripHtml(messageBody),
      html: compiledHtml,
      ...(mailerAttachments.length > 0 ? { attachments: mailerAttachments } : {}),
    };

    // Send the email
    const info = await transporter.sendMail(mailOptions);
    console.log(`Custom email successfully sent to ${toEmail}. Message ID: ${info.messageId}`);
    return { success: true, message: `Email sent. Message ID: ${info.messageId}` };

  } catch (error: unknown) {
    console.error('Error in sendCustomEmail service:', error);
    return { success: false, message: error instanceof Error ? error.message : 'Unknown error occurred while sending custom email.' };
  }
}

interface PasswordResetEmailParams {
  email: string;
  name: string;
  resetLink: string;
}

/**
 * Sends a password reset email using the Artistant normal HTML template.
 */
export async function sendPasswordResetEmail({
  email,
  name,
  resetLink,
}: PasswordResetEmailParams): Promise<{ success: boolean; message: string }> {
  return deliver(email, passwordResetEmail({ name, resetLink }), 'security', 'Password reset');
}

interface NormalEmailParams {
  toEmail: string;
  name: string;
  subject: string;
  messageBody: string;
  ctaText?: string;
  ctaUrl?: string;
  senderAlias?: string;
  /** Small label above the headline. */
  kickerText?: string;
  /** Headline; `accentPart` is drawn on a second line in orange. */
  headline?: string;
  accentPart?: string;
}

/**
 * Sends a notice in the Artistant style (account updates, team access and so on).
 */
export async function sendNormalEmail({
  toEmail,
  name,
  subject,
  messageBody,
  ctaText = 'Visit ArtisTant',
  ctaUrl = 'https://artistant.in',
  senderAlias = 'hello',
  kickerText = 'From Artistant',
  headline,
  accentPart,
}: NormalEmailParams): Promise<{ success: boolean; message: string }> {
  const plainSubject = subject.replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, '').trim();
  const mail = noticeEmail({
    name,
    subject,
    kickerText,
    main: headline || plainSubject,
    accentPart,
    bodyHtml: messageBody.replace(/\n/g, '<br />'),
    ctaText,
    ctaUrl,
  });
  return deliver(toEmail, mail, senderAlias, 'Notice');
}

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://artistant.in').replace(/\/$/, '');

export async function sendAdminAccessGrantedEmail(email: string, name: string): Promise<{ success: boolean; message: string }> {
  return sendNormalEmail({
    toEmail: email,
    name,
    subject: 'You’re on the Artistant team',
    kickerText: 'Team access',
    headline: 'Welcome to',
    accentPart: 'the crew.',
    messageBody: 'You now have admin access on Artistant. You can review sign-ups, verify artists and manage the waitlist from the admin console.',
    ctaText: 'Open the admin console',
    ctaUrl: `${SITE_URL}/admin`,
    senderAlias: 'security',
  });
}

export async function sendAdminAccessRevokedEmail(email: string, name: string): Promise<{ success: boolean; message: string }> {
  return sendNormalEmail({
    toEmail: email,
    name,
    subject: 'Your Artistant admin access has ended',
    kickerText: 'Team access',
    headline: 'Admin access',
    accentPart: 'has ended.',
    messageBody: 'Your admin access on Artistant has been removed, so the admin console is no longer available to you.<br><br>Think this is a mistake? Just reply to this email.',
    senderAlias: 'security',
  });
}

export async function sendProfileVerifiedEmail(email: string, name: string, username: string): Promise<{ success: boolean; message: string }> {
  return sendNormalEmail({
    toEmail: email,
    name,
    subject: 'You’re verified on Artistant',
    kickerText: 'Profile verified',
    headline: 'You’re',
    accentPart: 'verified.',
    messageBody: `Our team has checked your profile. Your page at <b style="color:${C.ink};">artistant.in/${esc(username)}</b> now shows a verified badge, so clients know you&rsquo;re the real deal.<br><br>We&rsquo;ll email you with the details once Artistant is live.`,
    ctaText: 'See my page',
    ctaUrl: `${SITE_URL}/${encodeURIComponent(username)}`,
    senderAlias: 'official',
  });
}

export async function sendProfileVerificationRevokedEmail(email: string, name: string): Promise<{ success: boolean; message: string }> {
  return sendNormalEmail({
    toEmail: email,
    name,
    subject: 'An update on your Artistant verification',
    kickerText: 'Verification',
    headline: 'Your verified badge',
    accentPart: 'is paused.',
    messageBody: 'We&rsquo;ve removed the verified badge from your profile for now. Your name and your place on the waitlist are still yours.<br><br>Want to know why, or send us more details? Just reply to this email.',
    ctaText: 'Talk to us',
    ctaUrl: 'mailto:support@artistant.in',
    senderAlias: 'support',
  });
}

export async function sendProfileBlockedEmail(email: string, name: string): Promise<{ success: boolean; message: string }> {
  return sendNormalEmail({
    toEmail: email,
    name,
    subject: 'Your Artistant account has been suspended',
    kickerText: 'Account',
    headline: 'Your account',
    accentPart: 'is suspended.',
    messageBody: 'Your Artistant account has been suspended for breaking our community guidelines. Your public page is hidden and you can&rsquo;t sign in for now.<br><br>If you think we got this wrong, reply to this email and a real person will look at it.',
    ctaText: 'Contact support',
    ctaUrl: 'mailto:support@artistant.in',
    senderAlias: 'security',
  });
}

export async function sendPositionUpdatedEmail(email: string, name: string, newPosition: number): Promise<{ success: boolean; message: string }> {
  return sendNormalEmail({
    toEmail: email,
    name,
    subject: `You’ve moved up to #${newPosition} on the Artistant waitlist`,
    kickerText: 'Waitlist',
    headline: 'You’ve moved up to',
    accentPart: `#${newPosition}.`,
    messageBody: 'Good news: your place on the Artistant waitlist just moved up, so you&rsquo;re closer to getting in when we open.<br><br>We&rsquo;ll email you with the details once we&rsquo;re live.',
    senderAlias: 'official',
  });
}

export async function sendFoundingCardFeaturedEmail(email: string, name: string, username: string): Promise<{ success: boolean; message: string }> {
  return sendNormalEmail({
    toEmail: email,
    name,
    subject: 'You’re featured on Artistant',
    kickerText: 'Featured',
    headline: 'You’re in',
    accentPart: 'the spotlight.',
    messageBody: 'We picked your profile as one of our featured founding artists. It&rsquo;s now shown to our community and the first bookers.<br><br>Thanks for being here early.',
    ctaText: 'See my page',
    ctaUrl: `${SITE_URL}/${encodeURIComponent(username)}`,
    senderAlias: 'welcome',
  });
}

export async function sendContactInfoUpdatedEmail(email: string, name: string, updatedFields: string[]): Promise<{ success: boolean; message: string }> {
  return sendNormalEmail({
    toEmail: email,
    name,
    subject: 'Your Artistant contact details were changed',
    kickerText: 'Security',
    headline: 'Your details',
    accentPart: 'were updated.',
    messageBody: `Your ${esc(updatedFields.join(', '))} on Artistant just changed.<br><br>If that was you, you&rsquo;re all set. If it wasn&rsquo;t, reply to this email straight away and we&rsquo;ll help you secure your account.`,
    ctaText: 'This wasn’t me',
    ctaUrl: 'mailto:security@artistant.in',
    senderAlias: 'security',
  });
}

export interface BookingRequestNotificationParams {
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

export async function sendBookingRequestNotificationEmail(params: BookingRequestNotificationParams): Promise<{ success: boolean; message: string }> {
  const adminEmail = EMAIL_USER || 'hello@artistant.in';
  const subject = `New Booking Request for ${params.artistDisplayName} (@${params.artistUsername})`;
  const messageBody = `
    A new event booking inquiry has been submitted for <strong>${escapeHtml(params.artistDisplayName)}</strong> (@${escapeHtml(params.artistUsername)}).<br><br>
    <strong>Client Details:</strong><br>
    • <strong>Name:</strong> ${escapeHtml(params.clientName)}<br>
    • <strong>Email:</strong> ${escapeHtml(params.clientEmail)}<br>
    • <strong>Phone:</strong> ${escapeHtml(params.clientPhone)}<br><br>
    <strong>Event Details:</strong><br>
    • <strong>Date:</strong> ${escapeHtml(params.eventDate)}<br>
    • <strong>City / Location:</strong> ${escapeHtml(params.city)}<br>
    • <strong>Event Type:</strong> ${escapeHtml(params.eventType)}<br>
    • <strong>Budget:</strong> ${params.budget ? escapeHtml(params.budget) : 'Not specified'}<br>
    ${params.notes ? `• <strong>Notes:</strong> ${escapeHtml(params.notes)}<br>` : ''}
  `;

  return sendNormalEmail({
    toEmail: adminEmail,
    name: 'team',
    subject,
    kickerText: 'Booking request',
    headline: `${params.artistDisplayName}`,
    accentPart: 'has a booking request.',
    messageBody,
    ctaText: 'Open the admin console',
    ctaUrl: `${SITE_URL}/admin`,
    senderAlias: 'official',
  });
}


