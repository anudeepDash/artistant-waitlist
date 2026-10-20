import {
  ACCENT,
  C,
  F,
  SITE,
  button,
  callout,
  esc,
  footer,
  layout,
  nextSteps,
  para,
  pass,
  passNumber,
  photoHero,
  plainHero,
  row,
  spacer,
  topBar,
  type EmailContent,
  type EmailSide,
} from './kit';

/*
 * Every email Artistant sends. Each returns { subject, preheader, html, text }.
 * Copy is plain and honest: nothing here promises more than the site does.
 */

const firstName = (name: string) => (name || '').trim().split(/\s+/)[0] || 'there';

/* ───────────── Welcomes ───────────── */

export function artistWelcomeEmail({ name, username, email }: { name: string; username: string; email?: string }): EmailContent {
  const a = ACCENT.artist;
  const subject = `@${username} is yours. Welcome to the line-up.`;
  const preheader = `Your name is saved. We'll email you with the details once Artistant is live.`;
  const share = `${SITE}/?ref=${encodeURIComponent(username)}`;

  const body = `
${topBar('Founding artist')}
${photoHero({ image: 'hero-artist.jpg', kickerText: 'Your name is saved', main: 'You’re on', accentPart: 'the line-up.', accent: a })}
${row(
  para(
    `Hi ${esc(firstName(name))}, thanks for registering. <b style="color:${C.ink};">artistant.in/${esc(username)}</b> is yours now. We&rsquo;ll email you with the details once we&rsquo;re live in your city.`,
    { size: 16 },
  ),
  { top: 30 },
)}
${row(
  pass({
    top: ['Backstage', 'All access'],
    name: `@${username}`,
    role: 'Founding artist',
    fields: [
      ['City', 'Bengaluru'],
      ['Line-up', '1 of 140'],
      ['Paid', '50 · 25 · 25'],
    ],
    footer: `artistant.in/${username}`,
    accent: a,
    seed: email || username,
  }),
  { top: 26 },
)}
${row(
  nextSteps(
    'What’s next',
    [
      'Bengaluru opens first, then Mumbai and Delhi NCR.',
      'We email you when your spot opens to set up your page.',
      `Know an artist who should be here? <a href="${esc(share)}" style="color:${a};text-decoration:none;font-weight:700;">Share your link</a>.`,
    ],
    a,
  ),
  { top: 30, bottom: 34 },
)}
${footer('You claimed a name on artistant.in.')}`;

  const text = `Hi ${firstName(name)}, thanks for registering.

artistant.in/${username} is yours now. We'll email you with the details once we're live in your city.

What's next
01 Bengaluru opens first, then Mumbai and Delhi NCR.
02 We email you when your spot opens to set up your page.
03 Know an artist who should be here? ${share}

The Artistant team`;

  return { subject, preheader, html: layout({ title: subject, preheader, body }), text };
}

export function hostWelcomeEmail({ name, email, city, eventType }: { name: string; email: string; city?: string; eventType?: string }): EmailContent {
  const a = ACCENT.host;
  const subject = `You’re on the host list. Your next show, sorted.`;
  const preheader = `Thanks for registering. We'll email you with the details once booking opens.`;

  const body = `
${topBar('Host list')}
${photoHero({ image: 'hero-host.jpg', kickerText: 'You’re on the host list', main: 'Your next show,', accentPart: 'sorted.', accent: a })}
${row(
  para(
    `Hi ${esc(firstName(name))}, thanks for registering. You&rsquo;ll be among the first to book artists on Artistant${city ? ` in <b style="color:${C.ink};">${esc(city)}</b>` : ''}. We&rsquo;ll email you with the details once booking opens.`,
    { size: 16 },
  ),
  { top: 30 },
)}
${row(
  pass({
    top: ['Host pass', 'Early access'],
    name: name || 'Host',
    role: eventType || 'Booking live music',
    fields: [
      ['City', city || 'Bengaluru'],
      ['Booking fee', '4%'],
      ['Backup', '90 min'],
    ],
    footer: passNumber(email, 'HT'),
    accent: a,
    seed: email,
  }),
  { top: 26 },
)}
${row(
  nextSteps(
    'What you get',
    ['Verified artists with real prices, and no agency cut.', 'Your money held safely until the show is done.', 'Planning something? Reply with your date and budget.'],
    a,
  ),
  { top: 30, bottom: 34 },
)}
${footer('You joined the host list on artistant.in.')}`;

  const text = `Hi ${firstName(name)}, thanks for registering.

You'll be among the first to book artists on Artistant${city ? ` in ${city}` : ''}. We'll email you with the details once booking opens.

What you get
01 Verified artists with real prices, and no agency cut.
02 Your money held safely until the show is done.
03 Planning something? Reply with your date and budget.

The Artistant team`;

  return { subject, preheader, html: layout({ title: subject, preheader, body }), text };
}

export function venueWelcomeEmail({ name, email, venueName, city }: { name: string; email: string; venueName?: string; city?: string }): EmailContent {
  const a = ACCENT.venue;
  const space = venueName || 'Your space';
  const subject = `${space} is on the list. Your stage, never empty.`;
  const preheader = `Thanks for registering. We'll email you with the details once we're live.`;

  const body = `
${topBar('Venue list')}
${photoHero({ image: 'hero-venue.jpg', kickerText: 'Your space is on the list', main: 'Your stage,', accentPart: 'never empty.', accent: a })}
${row(
  para(
    `Hi ${esc(firstName(name))}, thanks for registering <b style="color:${C.ink};">${esc(space)}</b>. We&rsquo;ll email you with the details once we&rsquo;re live${city ? ` in ${esc(city)}` : ''}, and help you plan your first month of nights.`,
    { size: 16 },
  ),
  { top: 30 },
)}
${row(
  pass({
    top: ['Venue pass', 'Early access'],
    name: space,
    role: 'Live music, every night',
    fields: [
      ['City', city || 'Bengaluru'],
      ['Residencies', '4 or 8 wks'],
      ['Fees from', '5%'],
    ],
    footer: passNumber(email, 'VN'),
    accent: a,
    seed: email,
  }),
  { top: 26 },
)}
${row(
  nextSteps(
    'What you get',
    ['Weekly nights and residencies, booked in a few taps.', 'A replacement sent for you if your artist can&rsquo;t play.', 'One GST invoice a month, and fees that drop the longer you book.'],
    a,
  ),
  { top: 30, bottom: 34 },
)}
${footer('You listed a space on artistant.in.')}`;

  const text = `Hi ${firstName(name)}, thanks for registering ${space}.

We'll email you with the details once we're live${city ? ` in ${city}` : ''}, and help you plan your first month of nights.

What you get
01 Weekly nights and residencies, booked in a few taps.
02 A replacement sent for you if your artist can't play.
03 One GST invoice a month, and fees that drop the longer you book.

The Artistant team`;

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
${photoHero({ image: 'hero-launch.jpg', kickerText: l.kicker, main: l.main, accentPart: l.accentPart, accent: a, height: 380 })}
${row(
  `${para(`Hi ${esc(firstName(name))}, ${esc(l.text)}`, { size: 16 })}
${spacer(22)}
${button(l.cta, SITE, a)}`,
  { top: 30 },
)}
${row(nextSteps('Three steps', l.steps.map((st) => `<b>${esc(st.title)}.</b> <span style="color:${C.ink2};">${esc(st.text)}</span>`), a), { top: 30, bottom: 34 })}
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
  { top: 26, bottom: 36 },
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
${spacer(40)}
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
${spacer(40)}
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
