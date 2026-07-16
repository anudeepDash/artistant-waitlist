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
    compiledHtml = compiledHtml.replaceAll('{{message}}', messageBody);
    compiledHtml = compiledHtml.replaceAll('{{cta_text}}', ctaText);
    compiledHtml = compiledHtml.replaceAll('{{cta_url}}', ctaUrl);

    // Configure mail options
    const mailOptions = {
      from: getSenderHeader(senderAlias),
      to: toEmail,
      subject: subject,
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
