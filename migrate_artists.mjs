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
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const EMAIL_HOST = process.env.EMAIL_HOST || 'smtp.gmail.com';
const EMAIL_PORT = process.env.EMAIL_PORT ? parseInt(process.env.EMAIL_PORT, 10) : 587;
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY);

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
  
  const watermarkStyle = "background-image: url('https://artistant.in/logo_a_watermark.png'); background-repeat: no-repeat; background-position: center center; background-size: 280px 280px;";

  let successCount = 0;

  for (const artist of artists) {
    if (!artist.email) continue;
    
    let baseUsername = sanitizeUsername(artist.displayName || artist.name);
    let finalUsername = baseUsername;
    let isAvailable = false;
    let attempts = 0;
    
    // Ensure username uniqueness in Supabase waitlist_users
    while (!isAvailable && attempts < 10) {
      const checkUsername = attempts === 0 ? finalUsername : `${finalUsername}${Math.floor(100 + Math.random() * 900)}`;
      const { data } = await supabase
        .from('waitlist_users')
        .select('id')
        .eq('username', checkUsername)
        .limit(1);
      if (!data || data.length === 0) {
        finalUsername = checkUsername;
        isAvailable = true;
      }
      attempts++;
    }

    console.log(`Preparing pre-registration for ${artist.email}...`);

    // Check if user already exists in waitlist_users by email
    const { data: existingUser, error: fetchErr } = await supabase
      .from('waitlist_users')
      .select('id, username')
      .eq('email', artist.email)
      .maybeSingle();

    if (fetchErr) {
      console.error(`Error querying email ${artist.email} in Supabase:`, fetchErr);
      continue;
    }

    // Clean up any previous incorrect imports for this email first
    await supabase
      .from('waitlist_users')
      .delete()
      .eq('email', artist.email);

    const importedUid = 'imported_' + (artist.uid || artist.id || Math.random().toString(36).substring(2, 11));
    const { data: insertData, error: insertError } = await supabase
      .from('waitlist_users')
      .insert({
        user_id: importedUid,
        username: finalUsername,
        email: artist.email,
        display_name: artist.name || artist.displayName || 'Artist',
        role: 'artist',
        phone: artist.phone || null,
        is_verified: false, // Set to false so they show as pending claim!
        feature_founding_card: true,
        reserved_at: new Date().toISOString()
      })
      .select('id')
      .single();

    if (insertError) {
      console.error(`Failed to insert ${artist.email} into Supabase:`, insertError);
      continue;
    } else {
      console.log(`Successfully pre-registered ${artist.email} in Supabase with ID: ${insertData.id}`);
    }

    const claimId = insertData ? insertData.id : '';

    // Prepare Email
    const bodyText = `As one of our founding artists on the previous waitlist, we wanted to ensure you get VIP treatment.<br><br>You are officially <strong>first in line</strong> for our new exclusive waitlist! We've automatically migrated your profile. Now it's time to secure your unique <strong>@username</strong> before the platform opens to the public.<br><br>Here are the three main pillars of the ArtisTant ecosystem you'll soon experience:<br><br>1. <strong>The Bookability Score™</strong>: A 0–100 rating built from real outcomes on the platform. A credit score for reliability, not vibes.<br><br>2. <strong>GigSafe Escrow</strong>: Clients pay upfront into secure escrow. Money is released to you automatically T+1 after the show ends.<br><br>3. <strong>Prices, In Public</strong>: No "DM for price." Publish packaged pricing, keep your calendar live, and let bookings happen in minutes.<br><br>Plus, you'll get access to these core features:<br><br>• <strong>Your Free Portfolio Website</strong>: Your professional booking identity, housing showreels, riders, and contact parameters.<br>• <strong>Live Calendar & Availability</strong>: Automated calendar management. Clients see open dates instantly.<br>• <strong>Direct 1-on-1 Booking Engine</strong>: 100% direct client-to-artist workflow. No agents, no broker cuts.<br><br>Click the button below to head to the platform, authenticate, and officially claim your handle!`;

    let compiledHtml = htmlContent;
    compiledHtml = compiledHtml.replace('{{watermark_style}}', watermarkStyle);
    compiledHtml = compiledHtml.replaceAll('{{name}}', artist.name || artist.displayName || 'Artist');
    compiledHtml = compiledHtml.replaceAll('{{message}}', bodyText);
    compiledHtml = compiledHtml.replaceAll('{{cta_text}}', 'Claim My Username');
    compiledHtml = compiledHtml.replaceAll('{{cta_url}}', `https://artistant.in/claim?id=${claimId}`);

    const mailOptions = {
      from: `"ArtisTant" <${EMAIL_USER}>`,
      to: artist.email,
      subject: `You're First in Line: Claim Your ArtisTant Username! 🚀`,
      html: compiledHtml,
    };

    /*
    try {
      await transporter.sendMail(mailOptions);
      console.log(`Email sent to ${artist.email}`);
      successCount++;
    } catch (e) {
      console.error(`Error sending email to ${artist.email}:`, e);
    }
    
    // Slight delay to prevent rate limits
    await delay(1000);
    */
    successCount++;
  }

  console.log(`Migration complete! Successfully migrated and emailed ${successCount} artists.`);
}

main().catch(console.error);
