import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';

// Load environment variables
const EMAIL_HOST = process.env.EMAIL_HOST || 'smtp.gmail.com';
const EMAIL_PORT = parseInt(process.env.EMAIL_PORT || '587', 10);
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;

/**
 * Creates and returns a Nodemailer transporter.
 */
function getTransporter() {
  if (!EMAIL_USER || !EMAIL_PASS) {
    console.warn(
      '⚠️ Mailer Warning: EMAIL_USER or EMAIL_PASS is not configured in environment variables. Email sending will be simulated.'
    );
    return null;
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
      rejectUnauthorized: false, // Prevents certificate issues in local environments
    },
  });
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
    const ctaText = 'Go to Command Center';
    const ctaUrl = 'https://artistant.in';
    const emailSubject = `You're in! Your ArtisTant username @${username} is secured. 🚀`;

    // The premium hype body copy
    const bodyText = `It's official. You've secured your username <strong>@${username}</strong> on ArtisTant! You are now part of an exclusive group of artists, clients, and industry leaders getting first-dibs on the future of live entertainment booking and coordination.<br><br>You automatically received <strong>100 base points</strong> for claiming your handle early.<br><br>Here's what happens next:<br><br>1. <strong>Secure Cohort 1 Access</strong>: You need <strong>250 Points</strong> to secure your spot in Cohort 1. Share your unique referral link to earn more points and move up the waitlist: <br><a href="https://artistant.in/?ref=${username}" style="color: #F25A2B; font-weight: bold; word-break: break-all;">https://artistant.in/?ref=${username}</a><br><br>2. <strong>App Features & Bookability Score™</strong>: We are preparing your early dashboard. Soon you'll be able to build your professional profile, calculate your custom bookability rating, set up secure escrow payments, and manage your live performance bookings all in one unified ecosystem.<br><br>3. <strong>Share the Hype</strong>: Show the community you're locked in. Tag us on Instagram <strong>@artistant.in</strong> or LinkedIn and let your network know your official handle.<br><br>4. <strong>Early Access Keys</strong>: Watch your inbox for your unique access credentials to the command center.<br><br>We're building the ultimate creative link-up. Stay tuned, because the stage is being set.`;

    // Process and substitute placeholders in the HTML
    const watermarkStyle = "background-image: url('https://artistant.in/logo_a_watermark.png'); background-image: url('https://raw.githubusercontent.com/anudeepDash/artistant-waitlist/main/public/logo_a_watermark.png'), url('https://artistant.in/logo_a_watermark.png'); background-repeat: no-repeat; background-position: center center; background-size: 280px 280px;";
    
    let compiledHtml = htmlContent;
    compiledHtml = compiledHtml.replace('{{watermark_style}}', watermarkStyle);
    compiledHtml = compiledHtml.replaceAll('{{name}}', name);
    compiledHtml = compiledHtml.replaceAll('{{username}}', username);
    compiledHtml = compiledHtml.replaceAll('{{message}}', bodyText);
    compiledHtml = compiledHtml.replaceAll('{{cta_text}}', ctaText);
    compiledHtml = compiledHtml.replaceAll('{{cta_url}}', ctaUrl);

    // If SMTP credentials aren't set, simulate a successful delivery for development purposes
    if (!transporter) {
      console.log(`[SIMULATED EMAIL] To: ${email}`);
      console.log(`[SIMULATED EMAIL] Subject: ${emailSubject}`);
      console.log(`[SIMULATED EMAIL] Body Placeholder Compiled successfully.`);
      return { success: true, message: 'Email sent successfully (simulated).' };
    }

    // Configure mail options
    const mailOptions = {
      from: `"ArtisTant" <${EMAIL_USER}>`,
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
    const watermarkStyle = "background-image: url('https://raw.githubusercontent.com/anudeepDash/artistant-waitlist/main/public/logo_a_watermark.png'), url('https://artistant.in/logo_a_watermark.png'); background-repeat: no-repeat; background-position: center center; background-size: 280px 280px;";
    
    let compiledHtml = htmlContent;
    compiledHtml = compiledHtml.replace('{{watermark_style}}', watermarkStyle);
    compiledHtml = compiledHtml.replaceAll('{{name}}', name || 'ArtisTant Member');
    compiledHtml = compiledHtml.replaceAll('{{message}}', messageBody);
    compiledHtml = compiledHtml.replaceAll('{{cta_text}}', ctaText);
    compiledHtml = compiledHtml.replaceAll('{{cta_url}}', ctaUrl);

    // If SMTP credentials aren't set, simulate a successful delivery for development purposes
    if (!transporter) {
      console.log(`[SIMULATED EMAIL] To: ${toEmail}`);
      console.log(`[SIMULATED EMAIL] Subject: ${subject}`);
      console.log(`[SIMULATED EMAIL] Custom Message Compiled successfully.`);
      return { success: true, message: 'Email sent successfully (simulated).' };
    }

    // Configure mail options
    const mailOptions = {
      from: `"ArtisTant" <${EMAIL_USER}>`,
      to: toEmail,
      subject: subject,
      html: compiledHtml,
    };

    // Send the email
    const info = await transporter.sendMail(mailOptions);
    console.log(`Custom email successfully sent to ${toEmail}. Message ID: ${info.messageId}`);
    return { success: true, message: `Email sent. Message ID: ${info.messageId}` };

  } catch (error: any) {
    console.error('Error in sendCustomEmail service:', error);
    return { success: false, message: error.message || 'Unknown error occurred while sending custom email.' };
  }
}
