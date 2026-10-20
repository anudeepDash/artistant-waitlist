import {
  ACCENT,
  C,
  F,
  SITE,
  button,
  callout,
  esc,
  facts,
  footer,
  kicker,
  layout,
  lineupPoster,
  ticker,
  para,
  pass,
  passNumber,
  photoHero,
  plainHero,
  row,
  setlist,
  signoff,
  spacer,
  splitBar,
  topBar,
  type EmailContent,
  type EmailSide,
} from './kit';

/*
 * Every email Artistant sends. Each returns { subject, preheader, html, text }.
 * Copy is plain and honest: nothing here promises more than the site does.
 */

const firstName = (name: string) => (name || '').trim().split(/\s+/)[0] || 'there';

const ARTIST_SPLIT = [
  { pct: 50, big: '50%', label: 'when the contract is signed', color: C.orange },
  { pct: 25, big: '25%', label: 'at soundcheck', color: C.pink },
  { pct: 25, big: '25%', label: 'after the show', color: C.violet },
];

/* ───────────── Artist: name claimed ───────────── */

export function artistWelcomeEmail({ name, username, email }: { name: string; username: string; email?: string }): EmailContent {
  const a = ACCENT.artist;
  const hi = esc(firstName(name));
  const handle = esc(username);
  const subject = `@${username} is yours. Welcome to the line-up.`;
  const preheader = `Your name is saved. We'll email you with the details once Artistant is live.`;
  const share = `${SITE}/?ref=${encodeURIComponent(username)}`;

  const body = `
${topBar('Founding artist · Bengaluru')}
${photoHero({ image: 'hero-artist.jpg', kickerText: 'Your name is saved', main: 'You’re on', accentPart: 'the line-up.', accent: a })}
${ticker(['Sangeets', 'Club nights', 'Baithaks', 'College fests', 'Café gigs', 'Garba nights'], a)}
${row(
  `${para(`Hi ${hi},`, { color: C.ink, size: 17 })}
${para(
  `Thanks for registering. <b style="color:${C.ink};">artistant.in/${handle}</b> is yours now, and nobody else can take it. We&rsquo;ll email you with the details once Artistant is live in your city.`,
  { top: 12 },
)}`,
  { top: 34 },
)}
${row(
  pass({
    top: ['Backstage', 'All access'],
    name: `@${username}`,
    role: 'Founding artist',
    fields: [
      ['City', 'Bengaluru'],
      ['Line-up', '1 of 140'],
      ['Valid', 'Every stage'],
    ],
    footer: `artistant.in/${username}`,
    accent: a,
    seed: email || username,
  }),
  { top: 34 },
)}
${row(lineupPoster({ name: `@${username}`, accent: a }), { top: 40 })}
${row(
  setlist(
    'What happens next',
    [
      { title: 'Your name is held', text: `artistant.in/${handle} stays yours while we get ready. You don&rsquo;t need to do anything.` },
      { title: 'We open city by city', text: 'Bengaluru first, then Mumbai and Delhi NCR. Only 140 artists to start, so everyone actually gets gigs.' },
      { title: 'You hear from us first', text: 'When your spot opens we&rsquo;ll email you to set up your booking page, prices and open dates.' },
    ],
    a,
  ),
  { top: 44 },
)}
${row(splitBar('How you’ll get paid on every booking', ARTIST_SPLIT), { top: 30 })}
${row(
  callout(
    `${kicker('Bring your band', C.pink)}
${para(`Know an artist who belongs on the line-up? Send them your link and they&rsquo;ll be first in line too.`, { top: 10, size: 15 })}
${spacer(16)}
<a href="${esc(share)}" target="_blank" style="font-family:${F.mono};font-size:14px;font-weight:600;color:${C.ink};text-decoration:none;word-break:break-all;">${esc(share.replace(/^https?:\/\//, ''))}</a>`,
    C.pink,
  ),
  { top: 30 },
)}
${row(signoff('See you on stage.', a), { top: 40, bottom: 44 })}
${footer('You’re getting this because you claimed a name on artistant.in.')}`;

  const text = `Hi ${firstName(name)},

Thanks for registering. artistant.in/${username} is yours now, and nobody else can take it.
We'll email you with the details once Artistant is live in your city.

WHAT HAPPENS NEXT
01 Your name is held. You don't need to do anything.
02 We open city by city: Bengaluru first, then Mumbai and Delhi NCR. Only 140 artists to start.
03 When your spot opens, we'll email you to set up your booking page, prices and open dates.

HOW YOU'LL GET PAID
50% when the contract is signed, 25% at soundcheck, 25% after the show.

Know an artist who belongs on the line-up? Share: ${share}

See you on stage.
The Artistant team, Bengaluru
${SITE}`;

  return { subject, preheader, html: layout({ title: subject, preheader, body }), text };
}

/* ───────────── Host and venue: joined the list ───────────── */

export function hostWelcomeEmail({ name, email, city, eventType }: { name: string; email: string; city?: string; eventType?: string }): EmailContent {
  const a = ACCENT.host;
  const hi = esc(firstName(name));
  const subject = `You’re on the host list. Your next show, sorted.`;
  const preheader = `Thanks for registering. We'll email you with the details once booking opens in your city.`;

  const body = `
${topBar('Host list · Early access')}
${photoHero({ image: 'hero-host.jpg', kickerText: 'You’re on the host list', main: 'Your next show,', accentPart: 'sorted.', accent: a })}
${ticker(['Weddings', 'Sangeets', 'Birthdays', 'Office parties', 'House concerts', 'Fests'], a)}
${row(
  `${para(`Hi ${hi},`, { color: C.ink, size: 17 })}
${para(
  `Thanks for registering. You&rsquo;re on the list to book artists through Artistant${city ? ` in <b style="color:${C.ink};">${esc(city)}</b>` : ''}. We&rsquo;ll email you with the details as soon as booking opens.`,
  { top: 12 },
)}`,
  { top: 34 },
)}
${row(
  pass({
    top: ['Host pass', 'Early access'],
    name: name || 'Host',
    role: eventType || 'Booking live music',
    fields: [
      ['City', city || 'Bengaluru'],
      ['Booking fee', '4%'],
      ['Rebook', '2%'],
    ],
    footer: passNumber(email, 'HT'),
    accent: a,
    seed: email,
  }),
  { top: 34 },
)}
${row(
  facts(
    [
      { big: 'Verified', label: 'Every artist checked by our team' },
      { big: '0%', label: 'Agency commission. There isn’t one.' },
      { big: '90 min', label: 'To find a backup if an artist drops out' },
    ],
    a,
  ),
  { top: 34 },
)}
${row(
  setlist(
    'How booking will work',
    [
      { title: 'Find the right act', text: 'Search by city, date, budget and style, with real videos, open dates and prices.' },
      { title: 'See the real price', text: 'The artist&rsquo;s fee plus a 4% booking fee, shown before you pay. Book them again for 2%.' },
      { title: 'Pay into a safe account', text: 'Not someone&rsquo;s personal number. The artist is paid in steps, and the last part only after the show.' },
    ],
    a,
  ),
  { top: 40 },
)}
${row(
  callout(
    `${kicker('Planning something already?', a)}
${para(`Reply with your date, city and budget. Our team will help you find the right artist when we open.`, { top: 10, size: 15 })}`,
    a,
  ),
  { top: 30 },
)}
${row(signoff('Let’s make it a night to remember.', a), { top: 40, bottom: 44 })}
${footer('You’re getting this because you joined the host list on artistant.in.')}`;

  const text = `Hi ${firstName(name)},

Thanks for registering. You're on the list to book artists through Artistant${city ? ` in ${city}` : ''}.
We'll email you with the details as soon as booking opens.

HOW BOOKING WILL WORK
01 Find the right act: search by city, date, budget and style.
02 See the real price: the artist's fee plus a 4% booking fee. Book them again for 2%.
03 Pay into a safe account. The artist is paid in steps, the last part only after the show.

Planning something already? Reply with your date, city and budget.

The Artistant team, Bengaluru
${SITE}`;

  return { subject, preheader, html: layout({ title: subject, preheader, body }), text };
}

export function venueWelcomeEmail({ name, email, venueName, city }: { name: string; email: string; venueName?: string; city?: string }): EmailContent {
  const a = ACCENT.venue;
  const hi = esc(firstName(name));
  const space = venueName || 'Your space';
  const subject = `${space} is on the list. Your stage, never empty.`;
  const preheader = `Thanks for registering. We'll help you plan your first month of nights when we open.`;
  const ladder = [
    { pct: 40, big: '10%', label: 'gigs 1 and 2 with an act', color: C.blue },
    { pct: 30, big: '7%', label: 'gigs 3 to 5', color: C.violet },
    { pct: 30, big: '5%', label: 'gig 6 on, or monthly', color: C.pink },
  ];

  const body = `
${topBar('Venue list · Early access')}
${photoHero({ image: 'hero-venue.jpg', kickerText: 'Your space is on the list', main: 'Your stage,', accentPart: 'never empty.', accent: a })}
${ticker(['Jazz Thursdays', 'Acoustic brunches', 'Weekend DJs', 'Live band Fridays', 'Open mics'], a)}
${row(
  `${para(`Hi ${hi},`, { color: C.ink, size: 17 })}
${para(
  `Thanks for registering <b style="color:${C.ink};">${esc(space)}</b>. When we open${city ? ` in ${esc(city)}` : ''}, we&rsquo;ll help you plan your first month of nights. We&rsquo;ll email you with the details once we&rsquo;re live.`,
  { top: 12 },
)}`,
  { top: 34 },
)}
${row(
  pass({
    top: ['Venue pass', 'Early access'],
    name: space,
    role: 'Live music, every night',
    fields: [
      ['City', city || 'Bengaluru'],
      ['Runs', '4 or 8 weeks'],
      ['Billing', 'Monthly'],
    ],
    footer: passNumber(email, 'VN'),
    accent: a,
    seed: email,
  }),
  { top: 34 },
)}
${row(
  setlist(
    'What you’ll get',
    [
      { title: 'Every night, planned', text: 'Post a night, get quotes from artists who suit your room, and book in a few taps.' },
      { title: 'Residencies made simple', text: 'Book the same act for 4 or 8 weeks. Only the next 14 days of budget is held, and artists are paid weekly.' },
      { title: 'A backup, sent for you', text: 'If your resident can&rsquo;t play, we send a verified replacement with a similar sound.' },
    ],
    a,
  ),
  { top: 44 },
)}
${row(splitBar('Fees drop the longer you book the same act', ladder), { top: 30 })}
${row(signoff('Let’s keep the lights on.', a), { top: 40, bottom: 44 })}
${footer('You’re getting this because you listed a space on artistant.in.')}`;

  const text = `Hi ${firstName(name)},

Thanks for registering ${space}. When we open${city ? ` in ${city}` : ''}, we'll help you plan your first month of nights.
We'll email you with the details once we're live.

WHAT YOU'LL GET
01 Every night, planned: post a night and get quotes from artists who suit your room.
02 Residencies: book the same act for 4 or 8 weeks. Only the next 14 days of budget is held.
03 A backup, sent for you, if your resident can't play.

FEES DROP THE LONGER YOU BOOK THE SAME ACT
10% for gigs 1 and 2, 7% for gigs 3 to 5, 5% from gig 6 or on a monthly contract.

The Artistant team, Bengaluru
${SITE}`;

  return { subject, preheader, html: layout({ title: subject, preheader, body }), text };
}

/* ───────────── Launch: "we're live" (for when a city opens) ───────────── */

const LAUNCH: Record<EmailSide, { subject: string; kicker: string; main: string; accentPart: string; text: string; cta: string; steps: { title: string; text: string }[] }> = {
  artist: {
    subject: 'The doors are open. Your stage is ready.',
    kicker: 'Live in Bengaluru',
    main: 'Doors are',
    accentPart: 'open.',
    text: 'Artistant is live in Bengaluru, and your spot on the founding line-up is ready. Set up your booking page and you can start taking bookings this week.',
    cta: 'Set up my booking page',
    steps: [
      { title: 'Add your act', text: 'Videos, prices, open dates and your tech rider. It takes about 4 minutes.' },
      { title: 'Share your link', text: 'Put artistant.in/yourname in your bio. Clients book you straight from it.' },
      { title: 'Get paid in steps', text: 'Half when the contract is signed, a quarter at soundcheck, the rest after the show.' },
    ],
  },
  host: {
    subject: 'Booking is open. Find your artist.',
    kicker: 'Live in Bengaluru',
    main: 'Booking is',
    accentPart: 'open.',
    text: 'You can now book verified artists in Bengaluru, with real prices, a proper contract and your money held safely until the show is done.',
    cta: 'Find an artist',
    steps: [
      { title: 'Search', text: 'By date, budget and style.' },
      { title: 'Book', text: 'See the full price before you pay, including the 4% booking fee.' },
      { title: 'Relax', text: 'If an artist drops out, we find a backup within 90 minutes.' },
    ],
  },
  venue: {
    subject: 'We’re live. Let’s plan your nights.',
    kicker: 'Live in Bengaluru',
    main: 'Let’s fill',
    accentPart: 'your calendar.',
    text: 'Artistant is live for venues in Bengaluru. Post your nights, start a residency and get one GST invoice at the end of the month.',
    cta: 'Plan my first month',
    steps: [
      { title: 'Post your nights', text: 'Weekly slots or one-off shows.' },
      { title: 'Start a residency', text: '4 or 8 weeks with the same act, paid weekly.' },
      { title: 'One invoice', text: 'Everything on one monthly GST bill.' },
    ],
  },
};

export function launchEmail({ side, name }: { side: EmailSide; name: string }): EmailContent {
  const l = LAUNCH[side];
  const a = ACCENT[side];
  const preheader = l.text;
  const body = `
${topBar('Opening night')}
${photoHero({ image: 'hero-launch.jpg', kickerText: l.kicker, main: l.main, accentPart: l.accentPart, accent: a, height: 460 })}
${ticker(['Bengaluru', 'Opening night', 'Bengaluru', 'Opening night'], a)}
${row(
  `${para(`Hi ${esc(firstName(name))},`, { color: C.ink, size: 17 })}
${para(l.text, { top: 12 })}
${spacer(28)}
${button(l.cta, SITE, a)}`,
  { top: 34 },
)}
${row(setlist('Three steps', l.steps, a), { top: 44 })}
${side === 'artist' ? row(splitBar('How you get paid', ARTIST_SPLIT), { top: 30 }) : ''}
${row(signoff('The stage is yours.', a), { top: 40, bottom: 44 })}
${footer('You’re getting this because you joined the Artistant waitlist.')}`;

  const text = `Hi ${firstName(name)},

${l.text}

${l.steps.map((s, i) => `${String(i + 1).padStart(2, '0')} ${s.title}: ${s.text}`).join('\n')}

${l.cta}: ${SITE}

The Artistant team, Bengaluru`;

  return { subject: l.subject, preheader, html: layout({ title: l.subject, preheader, body }), text };
}

/* ───────────── Account and notices ───────────── */

export function passwordResetEmail({ name, resetLink }: { name: string; resetLink: string }): EmailContent {
  const subject = 'Reset your Artistant password';
  const preheader = 'Use the button inside to choose a new password. The link works for 1 hour.';
  const a = C.orange;
  const body = `
${topBar('Security')}
${plainHero({ kickerText: 'Password reset', main: 'Let’s get you', accentPart: 'back in.', accent: a })}
${row(
  `${para(`Hi ${esc(firstName(name))},`, { color: C.ink, size: 17, top: 10 })}
${para('We got a request to reset the password for your Artistant account. Tap the button to choose a new one.', { top: 12 })}
${spacer(28)}
${button('Choose a new password', resetLink, a)}
${spacer(22)}
${para(`The link works for 1 hour. Button not working? Paste this into your browser:<br><a href="${esc(resetLink)}" style="color:${C.ink2};word-break:break-all;">${esc(resetLink)}</a>`, { size: 13 })}`,
  { top: 18 },
)}
${row(
  callout(para(`Didn&rsquo;t ask for this? You can ignore this email. Your password stays the same.`, { size: 14, color: C.ink2 }), C.line),
  { top: 30, bottom: 44 },
)}
${footer('You’re getting this because someone asked to reset the password on your Artistant account.')}`;
  const text = `Hi ${firstName(name)},

We got a request to reset the password for your Artistant account.
Choose a new password here (works for 1 hour): ${resetLink}

Didn't ask for this? Ignore this email. Your password stays the same.

The Artistant team`;
  return { subject, preheader, html: layout({ title: subject, preheader, body }), text };
}

/**
 * A general-purpose notice in the Artistant style: account updates, team access,
 * verification and the like. `bodyHtml` must already be safe HTML.
 */
export function noticeEmail({
  name,
  subject,
  kickerText,
  main,
  accentPart = '',
  bodyHtml,
  ctaText,
  ctaUrl,
  reason = 'You’re getting this because you have an Artistant account.',
  accent = C.orange,
}: {
  name: string;
  subject: string;
  kickerText: string;
  main: string;
  accentPart?: string;
  bodyHtml: string;
  ctaText?: string;
  ctaUrl?: string;
  reason?: string;
  accent?: string;
}): EmailContent {
  const preheader = bodyHtml.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 120);
  const body = `
${topBar(kickerText)}
${plainHero({ kickerText, main, accentPart, accent })}
${row(
  `${para(`Hi ${esc(firstName(name))},`, { color: C.ink, size: 17, top: 10 })}
<div style="margin-top:12px;font-family:${F.sans};font-size:16px;line-height:26px;color:${C.ink2};">${bodyHtml}</div>
${ctaText && ctaUrl ? `${spacer(28)}${button(ctaText, ctaUrl, accent)}` : ''}`,
  { top: 18 },
)}
${row(signoff('Thanks for being here.', accent), { top: 40, bottom: 44 })}
${footer(reason)}`;
  const text = `Hi ${firstName(name)},

${bodyHtml.replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').trim()}
${ctaText && ctaUrl ? `\n${ctaText}: ${ctaUrl}\n` : ''}
The Artistant team`;
  return { subject, preheader, html: layout({ title: subject, preheader, body }), text };
}

/* ───────────── Broadcasts from the admin studio ───────────── */

export type BroadcastStyle = 'standard' | 'welcome' | 'vip' | 'newsletter' | 'raw' | 'plain_minimal' | 'migrated_artist';

/**
 * Broadcast layout for the admin email studio. `messageHtml` is the admin's message
 * (already converted to HTML); `extraHtml` is anything to show under it, like attachments.
 */
export function broadcastEmail({
  style,
  name,
  subject,
  headerTitle,
  pillTag,
  messageHtml,
  extraHtml = '',
  ctaText,
  ctaUrl,
}: {
  style: BroadcastStyle;
  name: string;
  subject: string;
  headerTitle?: string;
  pillTag?: string;
  messageHtml: string;
  extraHtml?: string;
  ctaText?: string;
  ctaUrl?: string;
}): string {
  const preheader = messageHtml.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 120);
  const cta = ctaText && ctaUrl ? `${spacer(28)}${button(ctaText, ctaUrl, C.orange)}` : '';

  // A simple letter, for personal one-to-one notes.
  if (style === 'raw' || style === 'plain_minimal') {
    const body = `
${topBar('A note from Artistant')}
${row(
  `${headerTitle ? `<div style="font-family:${F.display};font-weight:800;font-size:30px;line-height:34px;letter-spacing:-1px;color:${C.ink};">${esc(headerTitle)}</div>${spacer(18)}` : ''}
<div style="font-family:${F.sans};font-size:16px;line-height:27px;color:${C.ink};">${messageHtml}</div>
${extraHtml}
${cta}`,
  { top: 40, bottom: 44 },
)}
${footer('You’re getting this from the Artistant team.')}`;
    return layout({ title: subject, preheader, body });
  }

  const hero =
    style === 'standard'
      ? plainHero({ kickerText: pillTag || 'From Artistant', main: headerTitle || subject, accentPart: '', accent: C.orange })
      : photoHero({
          image: style === 'newsletter' ? 'hero-launch.jpg' : style === 'vip' ? 'hero-notice.jpg' : 'hero-artist.jpg',
          kickerText: pillTag || (style === 'newsletter' ? 'What’s new' : 'For you'),
          main: headerTitle || subject,
          accentPart: '',
          accent: C.orange,
        });

  const body = `
${topBar(pillTag || 'Artistant')}
${hero}
${row(
  `${para(`Hi ${esc(firstName(name))},`, { color: C.ink, size: 17 })}
<div style="margin-top:12px;font-family:${F.sans};font-size:16px;line-height:26px;color:${C.ink2};">${messageHtml}</div>
${extraHtml}
${cta}`,
  { top: 34 },
)}
${row(signoff('See you on stage.', C.orange), { top: 40, bottom: 44 })}
${footer('You’re getting this because you joined the Artistant waitlist.')}`;
  return layout({ title: subject, preheader, body });
}

/* ───────────── Internal: for the team inbox ───────────── */

export function teamSignupEmail({ kind, details }: { kind: 'Host' | 'Venue'; details: [string, string][] }): EmailContent {
  const name = details.find(([k]) => k === 'Name')?.[1] || 'Someone';
  const subject = `New ${kind.toLowerCase()} sign-up: ${name}`;
  const preheader = `${name} just joined the ${kind.toLowerCase()} list.`;
  const a = kind === 'Host' ? ACCENT.host : ACCENT.venue;
  const rows = details
    .filter(([, v]) => v)
    .map(
      ([k, v]) => `<tr>
<td width="150" valign="top" style="padding:12px 0;border-top:1px solid ${C.line};font-family:${F.mono};font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:${C.ink3};">${esc(k)}</td>
<td valign="top" style="padding:12px 0;border-top:1px solid ${C.line};font-family:${F.sans};font-size:15px;line-height:22px;color:${C.ink};">${esc(v)}</td>
</tr>`,
    )
    .join('');
  const body = `
${topBar('Team inbox')}
${plainHero({ kickerText: `New ${kind.toLowerCase()} sign-up`, main: name, accentPart: `joined the ${kind.toLowerCase()} list.`, accent: a })}
${row(`<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${rows}</table>`, { top: 26, bottom: 44 })}
${footer('Sent to the Artistant team when someone joins from the website.')}`;
  const text = `New ${kind.toLowerCase()} sign-up\n\n${details.filter(([, v]) => v).map(([k, v]) => `${k}: ${v}`).join('\n')}`;
  return { subject, preheader, html: layout({ title: subject, preheader, body }), text };
}
