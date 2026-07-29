import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';

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

/**
 * Sends a premium themed welcome email to a user who just claimed their username.
 */
export async function sendWelcomeEmail({ email, name, username }: WelcomeEmailParams): Promise<{ success: boolean; message: string }> {
  try {
    const transporter = getTransporter();
    
    // Read the master HTML email template
    const templatePath = path.join(process.cwd(), 'src/templates/artistant-mail-template.html');
    let htmlContent = '';
    
    try {
      htmlContent = fs.readFileSync(templatePath, 'utf8');
    } catch (readError: any) {
      console.error('Error reading email template file:', readError);
      return { success: false, message: `Failed to load email template: ${readError.message}` };
    }

    // Set up default parameters for the dynamic template
    const ctaText = 'Open Your Dashboard';
    const ctaUrl = `https://artistant.in/dashboard`;
    const emailSubject = `Your ArtisTant username @${username} is secured! 🚀`;

    // The premium hype body copy
    const bodyText = `It's official. You've successfully claimed your premium username <strong>@${username}</strong> on ArtisTant!<br><br>Your professional <strong>portfolio page</strong> is now live at <a href="https://artistant.in/${username}" style="color: #7C5CFF; font-weight: bold; text-decoration: none;">artistant.in/${username}</a>. This is your single source of truth—a gorgeous, fast-loading booking hub designed to showcase your bio, target location, category/genres, media showreels, and social proof (linked via Spotify, YouTube, and Instagram).<br><br>Promoters and clients can visit your portfolio to view your profile photo, listen to your previews, inspect your details, and request direct bookings. You can customize, update, or complete all these details at any time by logging into your <a href="https://artistant.in/dashboard" style="color: #F25A2B; font-weight: bold; text-decoration: none;">ArtisTant Dashboard</a>.<br><br>By securing your handle early, you have received <strong>100 base points</strong> on your Founding Card. Here is how you can level up:<br><ul><li><strong>Cohort 1 Priority Access (250 PTS)</strong>: Earn 250 points to guarantee priority rollout access and waive your first gig's platform fee.</li><li><strong>Founding Artist Badge & Lifetime 0% Fee (500 PTS)</strong>: Reach 500 points to lock in a permanent verified "Founding Artist" badge. The first 50 artists to reach this status receive a lifetime <strong>0% platform fee guarantee</strong>!</li></ul><br>To climb the leaderboard and unlock rewards, share your referral link: <a href="https://artistant.in/?ref=${username}" style="color: #F25A2B; font-weight: bold;">https://artistant.in/?ref=${username}</a> or generate your Founding Card image on social media directly from your dashboard.`;

    // Process and substitute placeholders in the HTML
    let compiledHtml = htmlContent;
    compiledHtml = compiledHtml.replaceAll('{{name}}', escapeHtml(name));
    compiledHtml = compiledHtml.replaceAll('{{username}}', escapeHtml(username));
    compiledHtml = compiledHtml.replaceAll('{{message}}', bodyText);
    compiledHtml = compiledHtml.replaceAll('{{cta_text}}', ctaText);
    compiledHtml = compiledHtml.replaceAll('{{cta_url}}', ctaUrl);

    // Configure mail options
    const mailOptions = {
      from: getSenderHeader('welcome'),
      to: email,
      subject: emailSubject,
      text: stripHtml(bodyText), // plain text alternative
      html: compiledHtml,
    };

    // Send the email
    const info = await transporter.sendMail(mailOptions);
    console.log(`Email successfully sent to ${email}. Message ID: ${info.messageId}`);
    return { success: true, message: `Email sent. Message ID: ${info.messageId}` };

  } catch (error: any) {
    console.error('Error in sendWelcomeEmail service:', error);
    return { success: false, message: error.message || 'Unknown error occurred while sending email.' };
  }
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

  const attachmentItemsHtml = attachments.map((att) => {
    const extUpper = (att.fileType || 'FILE').toUpperCase();
    const sizeText = att.size ? ` • ${escapeHtml(att.size)}` : '';
    const descText = att.description
      ? `<p style="margin: 4px 0 0 0; font-size: 11px; color: #64748B; font-family: -apple-system, sans-serif;">${escapeHtml(att.description)}</p>`
      : '';

    let badgeBg = '#EFF6FF';
    let badgeColor = '#2563EB';
    if (extUpper.includes('PDF')) {
      badgeBg = '#FEF2F2';
      badgeColor = '#EF4444';
    } else if (extUpper.includes('ZIP') || extUpper.includes('RAR')) {
      badgeBg = '#FFE4E6';
      badgeColor = '#E11D48';
    } else if (extUpper.includes('MP3') || extUpper.includes('WAV') || extUpper.includes('AUDIO')) {
      badgeBg = '#F0FDFA';
      badgeColor = '#0D9488';
    } else if (extUpper.includes('PNG') || extUpper.includes('JPG') || extUpper.includes('IMG')) {
      badgeBg = '#F0FDF4';
      badgeColor = '#16A34A';
    }

    return `
      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; margin-bottom: 10px; table-layout: fixed;">
        <tr>
          <td style="padding: 14px 16px;">
            <table border="0" cellpadding="0" cellspacing="0" width="100%">
              <tr>
                <td width="42" valign="middle" style="padding-right: 12px;">
                  <div style="background-color: ${badgeBg}; color: ${badgeColor}; width: 40px; height: 40px; border-radius: 10px; text-align: center; line-height: 40px; font-weight: 800; font-size: 10px; font-family: monospace; letter-spacing: 0.5px;">
                    ${escapeHtml(extUpper)}
                  </div>
                </td>
                <td valign="middle">
                  <div style="font-size: 13px; font-weight: 700; color: #0F172A; font-family: -apple-system, sans-serif; line-height: 1.3;">
                    ${escapeHtml(att.title)}
                  </div>
                  <div style="font-size: 10px; font-weight: 600; color: #64748B; font-family: -apple-system, sans-serif; margin-top: 2px;">
                    <span style="display: inline-block; background-color: #E2E8F0; color: #334155; padding: 2px 6px; border-radius: 4px; font-size: 9px; font-weight: 700; font-family: monospace;">${escapeHtml(extUpper)}</span>
                    ${sizeText}
                  </div>
                  ${descText}
                </td>
                <td width="95" valign="middle" align="right" style="padding-left: 8px;">
                  <a href="${escapeHtml(att.url)}" target="_blank" style="display: inline-block; background-color: #0F172A; color: #ffffff; font-size: 10px; font-weight: 700; font-family: -apple-system, sans-serif; text-decoration: none; padding: 8px 12px; border-radius: 8px; text-align: center;">
                    Open &rarr;
                  </a>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    `;
  }).join('');

  return `
    <div style="margin: 25px 0; padding: 18px; background-color: #FFFFFF; border: 1px dashed #CBD5E1; border-radius: 16px;">
      <div style="font-size: 10px; font-weight: 800; color: #7C5CFF; text-transform: uppercase; letter-spacing: 1.5px; font-family: -apple-system, sans-serif; margin-bottom: 12px;">
        📎 Attached Resources (${attachments.length})
      </div>
      ${attachmentItemsHtml}
    </div>
  `;
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
  templateType?: 'standard' | 'welcome' | 'vip' | 'newsletter' | 'raw' | 'migrated_artist';
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
  username,
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
    const recipientName = escapeHtml(name || 'ArtisTant Member');
    const recipientHandle = escapeHtml(username || 'artist');
    const formattedMessage = messageBody.replace(/\n/g, '<br />');
    const attachmentHtml = renderAttachmentHtml(attachments);

    let compiledHtml = '';

    if (templateType === 'raw') {
      // Direct Minimal Email (No Template)
      const ctaHtml = ctaText && ctaUrl ? `
        <div style="margin-top: 25px; text-align: left;">
          <a href="${escapeHtml(ctaUrl)}" target="_blank" style="display: inline-block; background-color: #7C5CFF; color: #ffffff; font-size: 13px; font-weight: 700; font-family: -apple-system, sans-serif; text-decoration: none; padding: 12px 24px; border-radius: 10px;">
            ${escapeHtml(ctaText)}
          </a>
        </div>
      ` : '';

      compiledHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(subject)}</title>
</head>
<body style="margin: 0; padding: 20px; background-color: #F8FAFC; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #0F172A;">
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #E2E8F0; border-radius: 16px; padding: 32px;">
    <tr>
      <td>
        <div style="margin-bottom: 24px; border-bottom: 1px solid #F1F5F9; padding-bottom: 16px;">
          <a href="https://artistant.in" target="_blank" style="text-decoration: none;">
            <img src="https://artistant.in/logo_wordmark_flat.png" alt="ArtisTant" width="120" style="display: block; width: 120px; height: auto;">
          </a>
        </div>
        ${headerTitle ? `<h2 style="margin: 0 0 16px 0; font-size: 22px; font-weight: 800; color: #0F172A;">${escapeHtml(headerTitle)}</h2>` : ''}
        <div style="font-size: 14px; line-height: 1.6; color: #334155;">
          ${formattedMessage}
        </div>
        ${attachmentHtml}
        ${ctaHtml}
        <div style="margin-top: 35px; border-top: 1px solid #F1F5F9; padding-top: 16px; font-size: 11px; color: #94A3B8;">
          Sent directly from ArtisTant Official. &copy; ${new Date().getFullYear()} ArtisTant Inc.
        </div>
      </td>
    </tr>
  </table>
</body>
</html>
      `.trim();
    } else {
      // Read the master HTML email template
      const templatePath = path.join(process.cwd(), 'src/templates/artistant-mail-template.html');
      let htmlContent = '';
      
      try {
        htmlContent = fs.readFileSync(templatePath, 'utf8');
      } catch (readError: any) {
        console.error('Error reading email template file:', readError);
        return { success: false, message: `Failed to load email template: ${readError.message}` };
      }

      compiledHtml = htmlContent;
      compiledHtml = compiledHtml.replaceAll('{{name}}', recipientName);
      compiledHtml = compiledHtml.replaceAll('{{username}}', recipientHandle);
      compiledHtml = compiledHtml.replaceAll('{{cta_text}}', escapeHtml(ctaText));
      compiledHtml = compiledHtml.replaceAll('{{cta_url}}', escapeHtml(ctaUrl));

      if (pillTag) {
        compiledHtml = compiledHtml.replace(
          '⚡ WAITLIST ACTIVE',
          escapeHtml(pillTag)
        );
      }

      if (headerTitle) {
        const customHeadingHtml = `Welcome to the stage. <br><span style="color: #F25A2B;">${escapeHtml(headerTitle)}</span>`;
        compiledHtml = compiledHtml.replace(
          'Welcome to the stage. <br><span style="color: #F25A2B;">@{{username}}</span> is officially stashed.',
          customHeadingHtml
        );
      }

      // Omit ticket stub if standard or newsletter template
      if (templateType !== 'welcome' && templateType !== 'vip' && templateType !== 'migrated_artist') {
        compiledHtml = compiledHtml.replace(
          /<table border="0" cellpadding="0" cellspacing="0" width="100%" class="ticket-table"[\s\S]*?<\/table>/gi,
          ''
        );
      }

      // Inject attachments right after message content
      const messageBodyWithAttachment = formattedMessage + attachmentHtml;
      compiledHtml = compiledHtml.replaceAll('{{message}}', messageBodyWithAttachment);
    }

    // Prepare Nodemailer attachment array if URLs exist
    const mailerAttachments = attachments
      .filter((att) => att.url)
      .map((att) => ({
        filename: att.title || 'Attachment',
        path: att.url,
      }));

    // Configure mail options
    const mailOptions: any = {
      from: getSenderHeader(senderAlias),
      to: toEmail,
      subject: subject,
      text: stripHtml(messageBody),
      html: compiledHtml,
    };

    if (mailerAttachments.length > 0) {
      mailOptions.attachments = mailerAttachments;
    }

    // Send the email
    const info = await transporter.sendMail(mailOptions);
    console.log(`Custom email successfully sent to ${toEmail}. Message ID: ${info.messageId}`);
    return { success: true, message: `Email sent. Message ID: ${info.messageId}` };

  } catch (error: any) {
    console.error('Error in sendCustomEmail service:', error);
    return { success: false, message: error.message || 'Unknown error occurred while sending custom email.' };
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
  try {
    const transporter = getTransporter();
    
    // Read the normal HTML email template
    const templatePath = path.join(process.cwd(), 'src/templates/artistant-normal-mail-template.html');
    let htmlContent = '';
    
    try {
      htmlContent = fs.readFileSync(templatePath, 'utf8');
    } catch (readError: any) {
      console.error('Error reading normal email template file:', readError);
      return { success: false, message: `Failed to load normal email template: ${readError.message}` };
    }

    const emailSubject = 'Reset your ArtisTant password 🔒';
    const bodyText = `We received a request to reset the password for your ArtisTant account.<br><br>Click the button below to choose a new password. If you did not make this request, you can safely ignore this email; your password will remain secure.<br><br>This link is valid for 1 hour.`;

    let compiledHtml = htmlContent;
    compiledHtml = compiledHtml.replaceAll('{{name}}', escapeHtml(name || 'ArtisTant Member'));
    compiledHtml = compiledHtml.replaceAll('{{message}}', bodyText);
    compiledHtml = compiledHtml.replaceAll('{{cta_text}}', 'Reset Password');
    compiledHtml = compiledHtml.replaceAll('{{cta_url}}', resetLink);

    // Configure mail options
    const mailOptions = {
      from: getSenderHeader('security'),
      to: email,
      subject: emailSubject,
      text: stripHtml(bodyText), // plain text alternative
      html: compiledHtml,
    };

    // Send the email
    const info = await transporter.sendMail(mailOptions);
    console.log(`Password reset email successfully sent to ${email}. Message ID: ${info.messageId}`);
    return { success: true, message: `Password reset email sent. Message ID: ${info.messageId}` };

  } catch (error: any) {
    console.error('Error in sendPasswordResetEmail service:', error);
    return { success: false, message: error.message || 'Unknown error occurred while sending password reset email.' };
  }
}

interface NormalEmailParams {
  toEmail: string;
  name: string;
  subject: string;
  messageBody: string;
  ctaText?: string;
  ctaUrl?: string;
  senderAlias?: string;
}

/**
 * Sends a generic styled email using the Artistant normal HTML template.
 */
export async function sendNormalEmail({
  toEmail,
  name,
  subject,
  messageBody,
  ctaText = 'Visit ArtisTant',
  ctaUrl = 'https://artistant.in',
  senderAlias = 'hello',
}: NormalEmailParams): Promise<{ success: boolean; message: string }> {
  try {
    const transporter = getTransporter();
    
    // Read the normal HTML email template
    const templatePath = path.join(process.cwd(), 'src/templates/artistant-normal-mail-template.html');
    let htmlContent = '';
    
    try {
      htmlContent = fs.readFileSync(templatePath, 'utf8');
    } catch (readError: unknown) {
      console.error('Error reading normal email template file:', readError);
      return { success: false, message: `Failed to load normal email template: ${readError instanceof Error ? readError.message : String(readError)}` };
    }

    const formattedMessage = messageBody.replace(/\n/g, '<br />');
    let compiledHtml = htmlContent;
    compiledHtml = compiledHtml.replaceAll('{{name}}', escapeHtml(name || 'ArtisTant Member'));
    compiledHtml = compiledHtml.replaceAll('{{message}}', formattedMessage);
    compiledHtml = compiledHtml.replaceAll('{{cta_text}}', ctaText);
    compiledHtml = compiledHtml.replaceAll('{{cta_url}}', ctaUrl);

    // Configure mail options
    const mailOptions = {
      from: getSenderHeader(senderAlias),
      to: toEmail,
      subject: subject,
      text: stripHtml(messageBody), // plain text alternative
      html: compiledHtml,
    };

    // Send the email
    const info = await transporter.sendMail(mailOptions);
    console.log(`Normal email successfully sent to ${toEmail}. Message ID: ${info.messageId}`);
    return { success: true, message: `Email sent. Message ID: ${info.messageId}` };

  } catch (error: unknown) {
    console.error('Error in sendNormalEmail service:', error);
    return { success: false, message: error instanceof Error ? error.message : 'Unknown error occurred while sending email.' };
  }
}

export async function sendAdminAccessGrantedEmail(email: string, name: string): Promise<{ success: boolean; message: string }> {
  const subject = 'Welcome to the ArtisTant Admin Team! 🔑';
  const messageBody = `You have been officially granted Administrator access on ArtisTant. You can now access the Admin Console to manage registrations, verify members, update waitlist standings, and run auto-verify operations.<br><br>Please log in to your account and navigate to the admin section.`;
  const ctaText = 'Open Admin Console';
  const ctaUrl = 'https://artistant.in/admin';
  return sendNormalEmail({
    toEmail: email,
    name,
    subject,
    messageBody,
    ctaText,
    ctaUrl,
    senderAlias: 'security'
  });
}

export async function sendAdminAccessRevokedEmail(email: string, name: string): Promise<{ success: boolean; message: string }> {
  const subject = 'ArtisTant Admin Access Revoked';
  const messageBody = `Your administrator access on ArtisTant has been revoked. You will no longer be able to access the Admin Console or perform administrative operations.<br><br>If you believe this is an error, please reach out to the system administrator or reply to this email.`;
  const ctaText = 'Visit ArtisTant';
  const ctaUrl = 'https://artistant.in';
  return sendNormalEmail({
    toEmail: email,
    name,
    subject,
    messageBody,
    ctaText,
    ctaUrl,
    senderAlias: 'security'
  });
}

export async function sendProfileVerifiedEmail(email: string, name: string, username: string): Promise<{ success: boolean; message: string }> {
  const subject = 'Your ArtisTant Profile is verified! 🎉';
  const messageBody = `Congratulations! Your ArtisTant profile has been reviewed and verified by our team.<br><br>As a verified member, your professional portfolio page at <strong>artistant.in/${username}</strong> is now live with a verified badge. Promoters and clients can visit your profile to view your credentials and make booking inquiries.<br><br>Log in to your dashboard to customize your profile, update your status, upload showreel media, and manage booking settings.`;
  const ctaText = 'Go to Dashboard';
  const ctaUrl = 'https://artistant.in/dashboard';
  return sendNormalEmail({
    toEmail: email,
    name,
    subject,
    messageBody,
    ctaText,
    ctaUrl,
    senderAlias: 'official'
  });
}

export async function sendProfileVerificationRevokedEmail(email: string, name: string): Promise<{ success: boolean; message: string }> {
  const subject = 'Update on your ArtisTant verification status';
  const messageBody = `Your profile verification status on ArtisTant has been updated. The verification badge has been removed.<br><br>You still retain your claimed username and waitlist placement, but your public verified status is currently inactive.<br><br>If you have questions or want to update your application details, please contact our support team.`;
  const ctaText = 'Go to Dashboard';
  const ctaUrl = 'https://artistant.in/dashboard';
  return sendNormalEmail({
    toEmail: email,
    name,
    subject,
    messageBody,
    ctaText,
    ctaUrl,
    senderAlias: 'support'
  });
}

export async function sendProfileBlockedEmail(email: string, name: string): Promise<{ success: boolean; message: string }> {
  const subject = 'Your ArtisTant account has been suspended';
  const messageBody = `Your profile on ArtisTant has been suspended due to violations of our community guidelines or other administrative actions.<br><br>Your public portfolio page is no longer visible, and you will not be able to log in or access your dashboard.<br><br>If you believe this decision was made in error and want to appeal, please contact support.`;
  const ctaText = 'Contact Support';
  const ctaUrl = 'mailto:support@artistant.in';
  return sendNormalEmail({
    toEmail: email,
    name,
    subject,
    messageBody,
    ctaText,
    ctaUrl,
    senderAlias: 'security'
  });
}

export async function sendPositionUpdatedEmail(email: string, name: string, newPosition: number): Promise<{ success: boolean; message: string }> {
  const subject = 'Your ArtisTant waitlist position has been updated! 📈';
  const messageBody = `Great news! Your queue position on the ArtisTant waitlist has been updated. You have been moved up in the line!<br><br>Your new waitlist placement is now <strong>#${newPosition}</strong>. This moves you closer to priority beta access.<br><br>You can boost your ranking further and earn more points by inviting other creators using your referral link.`;
  const ctaText = 'View Leaderboard';
  const ctaUrl = 'https://artistant.in/dashboard';
  return sendNormalEmail({
    toEmail: email,
    name,
    subject,
    messageBody,
    ctaText,
    ctaUrl,
    senderAlias: 'official'
  });
}

export async function sendFoundingCardFeaturedEmail(email: string, name: string, username: string): Promise<{ success: boolean; message: string }> {
  const subject = "You've been featured on ArtisTant! 🌟";
  const messageBody = `We're thrilled to let you know that your profile has been selected and featured as a <strong>Founding Card</strong> on ArtisTant!<br><br>This highlights your profile to our community and early promoters. You can now view your custom card layout, generate card mockups, and share your status on Instagram and Twitter/X.<br><br>Thank you for being a founding member of ArtisTant.`;
  const ctaText = 'View Featured Card';
  const ctaUrl = `https://artistant.in/${username}`;
  return sendNormalEmail({
    toEmail: email,
    name,
    subject,
    messageBody,
    ctaText,
    ctaUrl,
    senderAlias: 'welcome'
  });
}

export async function sendContactInfoUpdatedEmail(email: string, name: string, updatedFields: string[]): Promise<{ success: boolean; message: string }> {
  const fieldsStr = updatedFields.join(', ');
  const subject = 'ArtisTant Security Notification: Contact Info Updated 🔒';
  const messageBody = `This is a quick notification to confirm that your contact settings (${fieldsStr}) on ArtisTant were recently updated.<br><br>If you made these changes, no further action is required. If you did not make these changes, please secure your account immediately and contact support.`;
  const ctaText = 'Review Security Settings';
  const ctaUrl = 'https://artistant.in/dashboard';
  return sendNormalEmail({
    toEmail: email,
    name,
    subject,
    messageBody,
    ctaText,
    ctaUrl,
    senderAlias: 'security'
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
    <strong>New Booking Request Received!</strong><br><br>
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
    name: 'ArtisTant Concierge',
    subject,
    messageBody,
    ctaText: 'Review Admin Dashboard',
    ctaUrl: 'https://artistant.in/admin',
    senderAlias: 'official'
  });
}


