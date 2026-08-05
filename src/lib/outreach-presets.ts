import { OutreachTemplatePreset } from './outreach-types';

export const OUTREACH_TEMPLATE_PRESETS: OutreachTemplatePreset[] = [
  {
    id: 'vip-artist-invite',
    title: 'VIP Artist Onboarding Invitation',
    category: 'VIP Invitation',
    description: 'High-converting invitation for featuring top creators, musicians, and artists on ArtisTant.',
    subject: 'Exclusive Invitation: Claim your official @{{username}} portfolio on ArtisTant 🌟',
    headerTitle: 'Claim Your Official Creator Hub',
    pillTag: 'VIP CREATOR INVITATION',
    templateType: 'vip',
    senderAlias: 'founder',
    ctaText: 'Claim Your Profile Handle',
    ctaUrl: '{{claim_url}}',
    bodyHtml: `<p>Hi <strong>{{name}}</strong>,</p>

<p>We've been keeping a close eye on your work in {{city}} and would love to invite you to join <strong>ArtisTant</strong> as a Founding Artist!</p>

<p>ArtisTant is the modern portfolio & direct booking hub built exclusively for performing artists and creators. Your personalized handle <strong>@{{username}}</strong> has been reserved for you.</p>

<p><strong>What you get as a Founding Artist:</strong></p>
<ul>
  <li><strong>Unified Portfolio Page:</strong> Showcase your Spotify top tracks, YouTube showreels, Instagram feed, and bio in one sleek hub at <a href="{{claim_url}}" style="color: #7C5CFF; font-weight: bold;">artistant.in/{{username}}</a>.</li>
  <li><strong>Direct Booking Inquiries:</strong> Receive verified gig requests directly without third-party middleman fees.</li>
  <li><strong>100 Bonus Leaderboard Points:</strong> Gain priority positioning on our early access rollout.</li>
</ul>

<p>Click below to verify your email and complete your artist hub in less than 2 minutes:</p>`,
  },
  {
    id: 'venue-promoter-pitch',
    title: 'Venue & Event Manager Pitch',
    category: 'Venue & Event Pitch',
    description: 'Professional outreach email to event organizers, festival bookers, and venue talent managers.',
    subject: 'Direct Booking Inquiry & Talent Collaboration for {{company}}',
    headerTitle: 'Direct Talent Booking Partnership',
    pillTag: 'EVENT PROMOTER OUTREACH',
    templateType: 'standard',
    senderAlias: 'official',
    ctaText: 'Explore ArtisTant Roster',
    ctaUrl: 'https://artistant.in',
    bodyHtml: `<p>Hi <strong>{{first_name}}</strong>,</p>

<p>I hope you're having a great week at <strong>{{company}}</strong>!</p>

<p>I'm reaching out from <strong>ArtisTant</strong>—the premier talent discovery and booking network for verified live performers, DJs, musicians, and visual artists.</p>

<p>We represent top curated talent across {{city}} and major cultural hubs. We'd love to partner with {{company}} to streamline your upcoming event programming, talent booking, and show management.</p>

<p><strong>Why top venues and event organizers use ArtisTant:</strong></p>
<ul>
  <li><strong>Verified Media Portfolios:</strong> Access direct showreels, audio previews, rider requirements, and social proof in seconds.</li>
  <li><strong>Zero Commission Markup:</strong> Direct contact with artists and transparent booking management.</li>
  <li><strong>Dedicated Concierge Support:</strong> We assist with contracts, rider management, and scheduling.</li>
</ul>

<p>Are you open for a quick 5-minute chat or coffee this week to discuss your upcoming lineup needs?</p>`,
  },
  {
    id: 'founder-direct-1on1',
    title: 'Founder 1-on-1 Personal Outreach',
    category: 'Founder 1-on-1',
    description: 'Minimalist, raw plain-text email that feels like a personal 1-on-1 email from the founder. Maximum deliverability & open rates.',
    subject: 'Quick question regarding your artist portfolio, {{first_name}}',
    headerTitle: '',
    pillTag: '',
    templateType: 'raw',
    senderAlias: 'founder',
    ctaText: 'Check Your Profile',
    ctaUrl: 'https://artistant.in',
    bodyHtml: `Hi {{first_name}},

I saw your profile and work with {{company}} in {{city}} and was really impressed.

I'm building ArtisTant—a new platform designed to help independent artists show off their best showreels, get discovered by promoters, and receive booking inquiries without paying insane agency cuts.

We're onboarding our next cohort of priority creators this week, and I wanted to personally reach out to see if you'd be interested in testing it out.

You can claim your username and check out how your portfolio page looks here:
{{claim_url}}

Would love to get your thoughts on it. If you have any feedback or ideas, feel free to reply directly to this email!

Best regards,
Anudeep
Founder, ArtisTant`,
  },
  {
    id: 'waitlist-update-hype',
    title: 'Waitlist Queue Update & Leaderboard Boost',
    category: 'Product Update',
    description: 'Engaging email sent to waitlist subscribers updating them on their queue position and referral link.',
    subject: 'Your ArtisTant queue status update: You are moving up! 🚀',
    headerTitle: 'Waitlist Progress Update',
    pillTag: 'STATUS UPDATE',
    templateType: 'welcome',
    senderAlias: 'official',
    ctaText: 'View Your Position',
    ctaUrl: 'https://artistant.in/dashboard',
    bodyHtml: `<p>Hi <strong>{{name}}</strong>,</p>

<p>Great news! The ArtisTant early access queue is moving fast, and your spot is getting closer to the front!</p>

<p>Your current waitlist standing is <strong>#{{position}}</strong>.</p>

<p><strong>Want to jump ahead in line?</strong><br />
Share your unique referral link with fellow artists and creators. Every artist who signs up using your link boosts your rank by 10 positions and awards you 50 bonus card points!</p>

<p>Your unique referral link:<br />
<code style="background-color: #F1F5F9; padding: 6px 12px; border-radius: 6px; font-weight: bold; color: #7C5CFF;">https://artistant.in/?ref={{username}}</code></p>`,
  },
  {
    id: 'product-feature-announcement',
    title: 'New Feature & Showreel Upgrade Announcement',
    category: 'Product Update',
    description: 'Product newsletter informing contacts about new features like Spotify integrations, founding cards, and booking widgets.',
    subject: 'New on ArtisTant: Dynamic Showreels & Verified Booking Widgets ✨',
    headerTitle: 'Exciting Platform Updates',
    pillTag: 'NEW FEATURES LIVE',
    templateType: 'newsletter',
    senderAlias: 'official',
    ctaText: 'Explore New Features',
    ctaUrl: 'https://artistant.in/dashboard',
    bodyHtml: `<p>Hi <strong>{{name}}</strong>,</p>

<p>We're thrilled to announce a major upgrade to ArtisTant creator portfolios!</p>

<p><strong>Here is what is new:</strong></p>
<ul>
  <li>🎵 <strong>Spotify Live Preview Cards:</strong> Embedded player for your top tracks and latest releases.</li>
  <li>📺 <strong>YouTube & Vimeo Showreel Gallery:</strong> Seamless high-res video showreel showcase.</li>
  <li>⚡ <strong>Direct Client Booking Requests:</strong> Instant booking inquiry form with automated email alerts.</li>
  <li>🎴 <strong>Founding Artist Digital Cards:</strong> Custom downloadable social media cards for Instagram and X.</li>
</ul>

<p>Log in to your dashboard now to turn on these features and update your portfolio:</p>`,
  },
];
