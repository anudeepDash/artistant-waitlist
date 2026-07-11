import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';

// Load Service Account
import serviceAccount from './service-account.json' with { type: "json" };

// Supabase and Email Credentials (from .env.local)
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://gpuedwozcbzlkhdkcebm.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const EMAIL_HOST = process.env.EMAIL_HOST || 'smtp.gmail.com';
const EMAIL_PORT = process.env.EMAIL_PORT ? parseInt(process.env.EMAIL_PORT, 10) : 587;
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const transporter = nodemailer.createTransport({
  host: EMAIL_HOST,
  port: EMAIL_PORT,
  secure: false, // TLS
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
  tls: { rejectUnauthorized: false }
});

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

function sanitizeUsername(name) {
  if (!name) return 'artist' + Math.floor(Math.random() * 10000);
  return name.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
}

async function main() {
  console.log('Fetching artists from Firestore...');
  const artistsSnapshot = await db.collection('artists').get();
  const artists = artistsSnapshot.docs.map(doc => doc.data());
  console.log(`Found ${artists.length} artists.`);

  // Load Email Template
  const templatePath = path.join(process.cwd(), 'src/templates/artistant-mail-template.html');
  let htmlContent = fs.readFileSync(templatePath, 'utf8');
  
  const watermarkStyle = "background-image: url('https://raw.githubusercontent.com/anudeepDash/artistant-waitlist/main/public/logo_a_watermark.png'), url('https://artistant.in/logo_a_watermark.png'); background-repeat: no-repeat; background-position: center center; background-size: 280px 280px;";

  let successCount = 0;

  for (const artist of artists) {
    if (!artist.email) continue;
    
    let baseUsername = sanitizeUsername(artist.displayName || artist.name);
    // We are no longer automatically inserting them into Supabase.
    // They will pick their own usernames when they visit the platform.
    console.log(`Preparing email for ${artist.email}...`);

    // Prepare Email
    const bodyText = `As one of our founding artists on the previous waitlist, we wanted to ensure you get VIP treatment.<br><br>You are officially <strong>first in line</strong> for our new exclusive waitlist! We've automatically migrated your profile. Now it's time to secure your unique <strong>@username</strong> before the platform opens to the public.<br><br>Here are the three main pillars of the ArtisTant ecosystem you'll soon experience:<br><br>1. <strong>The Bookability Score™</strong>: A 0–100 rating built from real outcomes on the platform. A credit score for reliability, not vibes.<br><br>2. <strong>GigSafe Escrow</strong>: Clients pay upfront into secure escrow. Money is released to you automatically T+1 after the show ends.<br><br>3. <strong>Prices, In Public</strong>: No "DM for price." Publish packaged pricing, keep your calendar live, and let bookings happen in minutes.<br><br>Plus, you'll get access to these core features:<br><br>• <strong>Your Free Portfolio Website</strong>: Your professional booking identity, housing showreels, riders, and contact parameters.<br>• <strong>Live Calendar & Availability</strong>: Automated calendar management. Clients see open dates instantly.<br>• <strong>Direct 1-on-1 Booking Engine</strong>: 100% direct client-to-artist workflow. No agents, no broker cuts.<br><br>Click the button below to head to the platform, authenticate, and officially claim your handle!`;

    let compiledHtml = htmlContent;
    compiledHtml = compiledHtml.replace('{{watermark_style}}', watermarkStyle);
    compiledHtml = compiledHtml.replaceAll('{{name}}', artist.name || artist.displayName || 'Artist');
    compiledHtml = compiledHtml.replaceAll('{{message}}', bodyText);
    compiledHtml = compiledHtml.replaceAll('{{cta_text}}', 'Claim My Username');
    compiledHtml = compiledHtml.replaceAll('{{cta_url}}', 'https://artistant.in');

    const mailOptions = {
      from: `"ArtisTant" <${EMAIL_USER}>`,
      to: artist.email,
      subject: `You're First in Line: Claim Your ArtisTant Username! 🚀`,
      html: compiledHtml,
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log(`Email sent to ${artist.email}`);
      successCount++;
    } catch (e) {
      console.error(`Error sending email to ${artist.email}:`, e);
    }
    
    // Slight delay to prevent rate limits
    await delay(1000);
  }

  console.log(`Migration complete! Successfully migrated and emailed ${successCount} artists.`);
}

main().catch(console.error);
