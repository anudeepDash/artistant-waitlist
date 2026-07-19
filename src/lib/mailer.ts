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

interface CustomEmailParams {
  toEmail: string;
  name: string;
  username?: string;
  subject: string;
  messageBody: string;
  ctaText?: string;
  ctaUrl?: string;
  senderAlias?: string;
}

/**
 * Sends a custom broadcast email using the Artistant master HTML template.
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
}: CustomEmailParams): Promise<{ success: boolean; message: string }> {
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

    // Process and substitute placeholders in the HTML
    let compiledHtml = htmlContent;
    compiledHtml = compiledHtml.replaceAll('{{name}}', escapeHtml(name || 'ArtisTant Member'));
    compiledHtml = compiledHtml.replaceAll('{{username}}', escapeHtml(username || 'artist'));
    compiledHtml = compiledHtml.replaceAll('{{message}}', messageBody);
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
    console.log(`Custom email successfully sent to [REDACTED_EMAIL]. Message ID: ${info.messageId}`);
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

    let compiledHtml = htmlContent;
    compiledHtml = compiledHtml.replaceAll('{{name}}', escapeHtml(name || 'ArtisTant Member'));
    compiledHtml = compiledHtml.replaceAll('{{message}}', messageBody);
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

