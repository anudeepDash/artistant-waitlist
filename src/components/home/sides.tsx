import React from 'react';

/*
 * Everything that changes when a visitor picks a side of the stage.
 * The page reads from here so artists, hosts and venues each get their own story.
 */

export type Side = 'artist' | 'host' | 'venue';
export type Role = 'organizer' | 'venue';

export const SIDE_ORDER: Side[] = ['artist', 'host', 'venue'];

export const SIDE_LABEL: Record<Side, string> = {
  artist: 'Artists',
  host: 'Hosts',
  venue: 'Venues',
};

/** The modal each non-artist side signs up through. */
export const SIDE_ROLE: Record<Exclude<Side, 'artist'>, Role> = {
  host: 'organizer',
  venue: 'venue',
};

export const SIDE_CTA: Record<Side, string> = {
  artist: 'Claim your name',
  host: 'Join as a host',
  venue: 'List your space',
};

export const NAV_LINKS: Record<Side, { href: string; label: string }[]> = {
  artist: [
    { href: '#how', label: 'How it works' },
    { href: '#features', label: 'What you get' },
    { href: '#founding', label: 'The first 140' },
    { href: '#fees', label: 'Fees' },
    { href: '#faq', label: 'FAQ' },
  ],
  host: [
    { href: '#how', label: 'How it works' },
    { href: '#features', label: 'What you get' },
    { href: '#fees', label: 'Prices' },
    { href: '#faq', label: 'FAQ' },
  ],
  venue: [
    { href: '#how', label: 'How it works' },
    { href: '#features', label: 'What you get' },
    { href: '#fees', label: 'Fees' },
    { href: '#faq', label: 'FAQ' },
  ],
};

export const GIG_TYPES: Record<Side, string[]> = {
  artist: ['Sangeets', 'College fests', 'Club nights', 'Café gigs', 'Garba nights', 'Baithaks', 'House concerts', 'Office parties'],
  host: ['Weddings', 'Sangeets', 'Birthdays', 'College fests', 'Office parties', 'House concerts', 'Brand launches', 'Garba nights'],
  venue: ['Jazz Thursdays', 'Acoustic brunches', 'Weekend DJ sets', 'Live band Fridays', 'Comedy nights', 'Open mics', 'Sufi evenings'],
};

/* ───────────── Problem → fix story ───────────── */

export type Note = { at: number; app: string; text: React.ReactNode };

export const CHAOS: Record<
  Side,
  {
    chats: { text: string; mine?: boolean }[];
    before: { title: React.ReactNode; text: string };
    after: { title: React.ReactNode; text: string };
    notes: Note[];
    stat: { big: string; text: string };
  }
> = {
  artist: {
    chats: [
      { text: 'bro payment next week pakka 🙏', mine: true },
      { text: 'can you do it for exposure? crowd bahut bada hai' },
      { text: 'advance? event ke baad dekhte hain' },
      { text: 'sorry yaar, event cancel ho gaya. aaj.', mine: true },
      { text: 'rate thoda kam karo na, regular client hain' },
      { text: 'sound system? venue pe kuch toh hoga' },
    ],
    before: {
      title: (
        <>
          “Bro, payment <em>kab?</em>”
        </>
      ),
      text: 'Late payments, cancellations on the day and clients who vanish after the show. Most artists still chase their own money on WhatsApp.',
    },
    after: {
      title: <>“Paid. <em>On time.</em>”</>,
      text: 'The client pays your full fee into a safe account before the show. It reaches you in three steps, and you never have to ask for it.',
    },
    notes: [
      { at: 0.5, app: 'Payment', text: <><b>₹90,000 received</b>, half your fee for a wedding sangeet in Jaipur. Book those flights ✈️</> },
      { at: 0.6, app: 'Contract', text: <><b>Contract signed</b> by you and the client. Date locked.</> },
      { at: 0.7, app: 'Check-in', text: <><b>You&apos;re checked in.</b> ₹45,000 released at soundcheck.</> },
      { at: 0.8, app: 'Show day', text: <><b>Show done 🎉</b> Final ₹45,000 on its way.</> },
    ],
    stat: { big: '68%', text: 'of artists wait more than 30 days to get paid. On Artistant, half lands before you pack.' },
  },
  host: {
    chats: [
      { text: 'agency fee 30% extra lagega sir' },
      { text: 'artist ka phone switch off hai 😬', mine: true },
      { text: 'full advance pehle, warna date nahi milegi' },
      { text: 'sorry, us din double booking ho gayi', mine: true },
      { text: 'sound aur lights ka alag charge hoga' },
      { text: 'GST bill? woh toh nahi milega' },
    ],
    before: {
      title: (
        <>
          “Artist aa raha hai <em>na?</em>”
        </>
      ),
      text: 'Middlemen, surprise charges and artists who go quiet on the day. Booking a show for your big night still runs on hope.',
    },
    after: {
      title: <>“Booked. <em>Sorted.</em>”</>,
      text: 'Pick a verified artist, see the full price and sign a real contract. Your money stays safe until the show is done.',
    },
    notes: [
      { at: 0.5, app: 'Payment', text: <><b>₹43,680 held safely</b> for your sangeet band. It&apos;s only fully released after the show.</> },
      { at: 0.6, app: 'Contract', text: <><b>Contract signed</b> by you and the band. Date locked.</> },
      { at: 0.7, app: 'Check-in', text: <><b>Your band has arrived.</b> Soundcheck started at 6:10 PM.</> },
      { at: 0.8, app: 'Show day', text: <><b>Show done 🎉</b> Rate the band, and book them again for a 2% fee.</> },
    ],
    stat: { big: '3–5x', text: 'markups on the same act when it’s booked through layers of middlemen. On Artistant you see the real fee.' },
  },
  venue: {
    chats: [
      { text: 'bhai Friday ka DJ cancel, koi aur hai?', mine: true },
      { text: 'resident band ne bina bataye chhod diya' },
      { text: 'invoice WhatsApp pe bheja hai, check karo' },
      { text: 'artist bol raha speakers chhote hain', mine: true },
      { text: 'payment aaj hi cash mein chahiye' },
      { text: 'next week ka abhi tak kuch confirm nahi' },
    ],
    before: {
      title: (
        <>
          “Friday ka DJ <em>kahan hai?</em>”
        </>
      ),
      text: 'Last-minute cancellations, empty stages, artists who don’t suit the room and a pile of bills sitting on WhatsApp.',
    },
    after: {
      title: <>“Every night. <em>Covered.</em>”</>,
      text: 'Plan your nights, book residencies and get a replacement when someone drops out. One invoice at the end of the month.',
    },
    notes: [
      { at: 0.5, app: 'Booking', text: <><b>Thursday is booked.</b> Jazz trio, week 3 of 8.</> },
      { at: 0.6, app: 'Backup', text: <><b>Your Friday DJ is unwell.</b> A matched replacement is confirmed.</> },
      { at: 0.7, app: 'Check-in', text: <><b>Saturday&apos;s band has arrived.</b> Soundcheck at 7 PM.</> },
      { at: 0.8, app: 'Billing', text: <><b>October invoice ready.</b> 9 shows, one GST bill.</> },
    ],
    stat: { big: '5%', text: 'is the whole platform fee on long runs, once you book the same act six times or more.' },
  },
};

/* ───────────── What you get ───────────── */

export type ScreenKey =
  | 'paid'
  | 'profile'
  | 'backup'
  | 'score'
  | 'discover'
  | 'quote'
  | 'hostpay'
  | 'hostbackup'
  | 'venue'
  | 'residency'
  | 'sub'
  | 'invoice';

export type Track = {
  id: string;
  tag: string;
  stat: string;
  title: React.ReactNode;
  text: string;
  points: string[];
  screen: ScreenKey;
};

export const SETLIST: Record<Side, { title: React.ReactNode; lead: string; tracks: Track[] }> = {
  artist: {
    title: (
      <>
        The business side, <em>handled.</em>
      </>
    ),
    lead: 'Four things every working artist needs, and almost nobody has. All in one app, all free to set up.',
    tracks: [
      {
        id: 'paid',
        tag: 'Get paid',
        stat: '50 · 25 · 25',
        title: <>Half before you <em>travel.</em></>,
        text: 'The client pays your full fee into a safe account before the show. You get 50% when the contract is signed, 25% when you check in at soundcheck, and the last 25% two hours after the show.',
        points: ['Cash gig? Still covered with a 4-digit code', 'GST invoices made for you', 'Nobody to chase. Ever.'],
        screen: 'paid',
      },
      {
        id: 'booked',
        tag: 'Get booked',
        stat: 'artistant.in/you',
        title: <>One link. <em>Every gig.</em></>,
        text: 'Your booking page has your videos, open dates, prices and tech rider in one place. Clients find you, check your dates and book you straight from it.',
        points: ['Only active artists are listed, so you don’t get lost', 'Your tech rider is checked against the venue’s gear', 'Big event? Our team helps you close it'],
        screen: 'profile',
      },
      {
        id: 'backup',
        tag: 'Get backup',
        stat: '90 min',
        title: <>Bandmate down? <em>Covered.</em></>,
        text: 'Send an SOS and trusted session players nearby get pinged. If you can’t make a show, we find a replacement with a similar score and sound within 90 minutes.',
        points: ['Find sound engineers who know your mixer', 'Rent gear on tour instead of shipping it', 'Honest venue notes from other artists'],
        screen: 'backup',
      },
      {
        id: 'rated',
        tag: 'Get rated',
        stat: 'Score / 100',
        title: <>Respect, earned <em>on stage.</em></>,
        text: 'Your Bookability Score is built only from real shows: turning up on time, getting booked again, rarely cancelling and replying fast. No fake reviews. No buying stars.',
        points: ['New → Rising → Trusted → Elite', 'Higher score, bigger gigs', 'Same client books you again? Your fee drops to 1%'],
        screen: 'score',
      },
    ],
  },
  host: {
    title: (
      <>
        Book an artist, <em>minus the stress.</em>
      </>
    ),
    lead: 'From finding the right act to the last song of the night. Everything a wedding, party or fest needs, in one app.',
    tracks: [
      {
        id: 'find',
        tag: 'Find',
        stat: 'Verified only',
        title: <>The right act, <em>in minutes.</em></>,
        text: 'Search by city, date, budget and style. Every artist is checked by our team and comes with real videos, open dates and prices.',
        points: ['Only verified, active artists', 'Filter by budget, date and style', 'Watch real performance videos'],
        screen: 'discover',
      },
      {
        id: 'price',
        tag: 'Price',
        stat: '4% booking fee',
        title: <>The real price. <em>No agency cut.</em></>,
        text: 'You see the artist’s fee and our booking fee before you pay. No middlemen adding three to five times on top.',
        points: ['4% booking fee, shown up front', 'Book the same artist again for 2%', 'A GST invoice with every booking'],
        screen: 'quote',
      },
      {
        id: 'safe',
        tag: 'Pay safely',
        stat: 'Safe account',
        title: <>Your money, <em>held safely.</em></>,
        text: 'You pay into a safe account, not into someone’s personal number. The artist is paid in steps, and the last part only after the show.',
        points: ['A proper contract, signed by both sides', 'Paying part in cash? Confirm it with a 4-digit code', 'An alert when the artist arrives'],
        screen: 'hostpay',
      },
      {
        id: 'backup',
        tag: 'Backup',
        stat: '90 min',
        title: <>Artist drops out? <em>We step in.</em></>,
        text: 'If your artist can’t make it, we find a replacement with a similar score and sound within 90 minutes. The show goes on.',
        points: ['Matched on score, style and budget', 'Sorted before you have to start calling around', 'Our team helps with big events'],
        screen: 'hostbackup',
      },
    ],
  },
  venue: {
    title: (
      <>
        Live music, <em>every night.</em>
      </>
    ),
    lead: 'For cafés, bars, clubs and hotels that want great artists on stage without the weekly scramble.',
    tracks: [
      {
        id: 'plan',
        tag: 'Plan',
        stat: 'Your week',
        title: <>Every night, <em>planned.</em></>,
        text: 'See your week at a glance. Post a night, get quotes from artists who suit your room, and book in a few taps.',
        points: ['Weekly nights and one-off shows', 'Quotes from artists who fit your crowd', 'Tech riders checked against your sound gear'],
        screen: 'venue',
      },
      {
        id: 'residency',
        tag: 'Residencies',
        stat: '4 or 8 weeks',
        title: <>Residencies, <em>made simple.</em></>,
        text: 'Book the same act for 4 or 8 weeks. You don’t lock up two months of budget: money for the next 14 days is held safely and the artist is paid every week.',
        points: ['Jazz Thursdays, acoustic brunches, weekend DJs', 'Artists paid weekly after their shows', 'Or rotate a shortlist of artists across your nights'],
        screen: 'residency',
      },
      {
        id: 'sub',
        tag: 'Backup',
        stat: 'Sent for you',
        title: <>Resident sick? <em>Stage stays lit.</em></>,
        text: 'If your resident can’t play, we send a verified replacement with the same score tier and a similar sound. You don’t have to do a thing.',
        points: ['Same score tier, similar sound', 'Sent automatically', 'Your regulars won’t notice a gap'],
        screen: 'sub',
      },
      {
        id: 'invoice',
        tag: 'Billing',
        stat: 'Monthly',
        title: <>One invoice. <em>Every month.</em></>,
        text: 'All your shows on one GST invoice at the end of the month, instead of a bill for every gig. And fees drop the longer you book the same act.',
        points: ['One monthly GST invoice', 'Fees go 10% → 7% → 5% as you keep booking', 'No cash runs or loose receipts'],
        screen: 'invoice',
      },
    ],
  },
};

/* ───────────── Fees ───────────── */

export const RIDER: Record<
  Side,
  {
    label: string;
    title: React.ReactNode;
    lead: string;
    docMeta: string;
    clauses: { what: string; note: string; fee: string }[];
    scheduleLabel: string;
    schedule: { big: string; when: string }[];
    signer: string;
    fine: string;
  }
> = {
  artist: {
    label: 'Fees',
    title: (
      <>
        Free to join. <em>Fees that shrink.</em>
      </>
    ),
    lead: 'Artists send venues a rider. Here’s ours for you: what we charge, when you get paid, and nothing hidden in the small print.',
    docMeta: 'Artist rider · v1',
    clauses: [
      { what: 'Claiming your name and your booking page', note: 'Free, for good.', fee: '₹0' },
      { what: 'First booking with a new client', note: 'The client pays their own 4% on top.', fee: '6%' },
      { what: 'The same client books you again', note: 'So going around the app never makes sense.', fee: '1%' },
      { what: 'Clients you bring yourself', note: 'With Artistant PRO. Payment gateway charges only.', fee: '0%' },
    ],
    scheduleLabel: 'How your fee reaches you',
    schedule: [
      { big: '50%', when: 'when the contract is signed' },
      { big: '25%', when: 'when you check in at soundcheck' },
      { big: '25%', when: 'two hours after the show' },
    ],
    signer: 'The artist',
    fine: 'Usual payment gateway charges apply. That’s it.',
  },
  host: {
    label: 'Prices',
    title: (
      <>
        Clear prices. <em>No agency cut.</em>
      </>
    ),
    lead: 'No hidden commission and no surprise charges on the night. Here’s exactly what you pay, and where your money goes.',
    docMeta: 'Host terms · v1',
    clauses: [
      { what: 'Browsing artists and asking for quotes', note: 'Free, as much as you like.', fee: '₹0' },
      { what: 'Booking a new artist', note: 'On top of the artist’s own fee, shown before you pay.', fee: '4%' },
      { what: 'Booking the same artist again', note: 'Good artists are worth keeping.', fee: '2%' },
      { what: 'Agency or middleman commission', note: 'There isn’t one.', fee: '0%' },
    ],
    scheduleLabel: 'How the artist is paid from your booking',
    schedule: [
      { big: '50%', when: 'when the contract is signed' },
      { big: '25%', when: 'when they check in at soundcheck' },
      { big: '25%', when: 'two hours after the show' },
    ],
    signer: 'The host',
    fine: 'Usual payment gateway charges apply.',
  },
  venue: {
    label: 'Fees',
    title: (
      <>
        Book more. <em>Pay less.</em>
      </>
    ),
    lead: 'The platform fee drops the longer you book the same act, so staying on Artistant is always the cheaper way to run your nights.',
    docMeta: 'Venue terms · v1',
    clauses: [
      { what: 'Listing your space and posting nights', note: 'Free.', fee: '₹0' },
      { what: 'Gigs 1 and 2 with an act', note: 'Platform fee, shared between you and the artist.', fee: '10%' },
      { what: 'Gigs 3 to 5 with the same act', note: 'Already cheaper than doing it by hand.', fee: '7%' },
      { what: 'Gig 6 onwards, or a monthly contract', note: 'Less than the cost of the paperwork.', fee: '5%' },
    ],
    scheduleLabel: 'How residency payments run',
    schedule: [
      { big: '14 days', when: 'of budget held ahead, on a rolling basis' },
      { big: 'Weekly', when: 'artists paid after their shows' },
      { big: 'Monthly', when: 'one GST invoice for everything' },
    ],
    signer: 'The venue',
    fine: 'Usual payment gateway charges apply.',
  },
};

/* ───────────── FAQ ───────────── */

export const FAQS: Record<Side, { q: string; a: string }[]> = {
  artist: [
    {
      q: 'What is Artistant?',
      a: 'An app for booking live artists in India. Clients find you, sign a proper contract and pay your full fee into a safe account before the show. You get half before you travel, a quarter at soundcheck and the rest after the show. No chasing, no ghosting, no middlemen.',
    },
    {
      q: 'Is it really free for artists?',
      a: 'Yes. Claiming your name and setting up your booking page costs nothing. We only take a small fee when you get booked through Artistant: 6% the first time with a new client, and just 1% when they book you again.',
    },
    {
      q: 'How do I get paid before the gig?',
      a: 'The moment the contract is signed, 50% of your fee is released to you, enough for flights, hotel and paying your band. Another 25% lands when you check in at soundcheck, and the last 25% two hours after the show.',
    },
    {
      q: 'My client wants to pay in cash. Is that okay?',
      a: 'Yes. For weddings and private events, the client pays 30–40% online to lock the date and hands you the rest in cash at soundcheck. You share a 4-digit code once you have it, and your contract and protection switch on.',
    },
    {
      q: 'What if I fall sick or can’t make it?',
      a: 'Life happens. We line up a replacement with a similar score and sound within 90 minutes so the show goes on. If just one bandmate is out, send an SOS on Backstage and trusted session players nearby get pinged.',
    },
    {
      q: 'What’s a Bookability Score?',
      a: 'A score out of 100 built only from real Artistant bookings: showing up on time, getting booked again, rarely cancelling and replying fast. It grows with every good show, and higher scores get the bigger gigs.',
    },
    {
      q: 'My city or category isn’t open yet. What now?',
      a: 'Claim your name anyway. We open city by city and category by category so every listed artist actually gets work. Bengaluru is first, then Mumbai and Delhi NCR. You’ll be first in line when yours opens.',
    },
    {
      q: 'I manage a few artists. Is there something for me?',
      a: 'Yes, Artistant PRO. One calendar for your whole roster, a booking page on your own domain, 0% Artistant fee on clients you bring yourself, and automatic payouts to band and crew.',
    },
  ],
  host: [
    {
      q: 'What is Artistant for hosts?',
      a: 'A safe way to book live artists for your wedding, party, fest or office event. You see real prices, sign a proper contract, and your money is held safely until the show is done.',
    },
    {
      q: 'How much does it cost?',
      a: 'Browsing artists and asking for quotes is free. When you book, you pay the artist’s fee plus a 4% booking fee, shown before you pay. Book the same artist again and the fee drops to 2%.',
    },
    {
      q: 'When does the artist get paid?',
      a: 'You pay the full amount into a safe account when you book. The artist gets half when the contract is signed, a quarter when they check in at soundcheck, and the rest two hours after the show.',
    },
    {
      q: 'What if the artist cancels?',
      a: 'We find you a replacement with a similar score and sound within 90 minutes. If that isn’t possible, your money is handled under our cancellation policy, and it never sits in someone’s personal account.',
    },
    {
      q: 'Can I pay part of it in cash?',
      a: 'Yes. For weddings and private events you can pay 30–40% online to lock the date and hand the rest over in cash at soundcheck. The artist confirms it with a 4-digit code.',
    },
    {
      q: 'Will I get a GST invoice?',
      a: 'Yes. Every booking comes with a proper contract and a GST invoice.',
    },
    {
      q: 'Are the artists checked?',
      a: 'Every artist is checked by our team before they’re listed, and their Bookability Score comes only from real shows on Artistant: turning up on time, getting booked again and rarely cancelling.',
    },
    {
      q: 'Which cities can I book in?',
      a: 'Bengaluru first, then Mumbai and Delhi NCR. Join now and we’ll tell you as soon as booking opens in your city.',
    },
  ],
  venue: [
    {
      q: 'What is Artistant for venues?',
      a: 'One place to plan and pay for live music at your café, bar, club or hotel: weekly nights, residencies and one-off shows, with artists who actually turn up.',
    },
    {
      q: 'What’s a residency?',
      a: 'A 4- or 8-week run with the same artist or band, like Jazz Thursdays or a weekend DJ. You agree the dates and price once, and we handle the bookings, payments and backups.',
    },
    {
      q: 'Do I have to pay for two months upfront?',
      a: 'No. Money for the next 14 days is held safely on a rolling basis, and the artist is paid every week after their shows. Your budget isn’t locked up.',
    },
    {
      q: 'What does it cost?',
      a: 'The platform fee drops the longer you book the same act: 10% for the first two gigs, 7% for gigs three to five, and 5% from the sixth gig or on a monthly contract. The fee is shared between you and the artist.',
    },
    {
      q: 'What if my resident artist is sick?',
      a: 'We send a verified replacement with the same score tier and a similar sound, so your stage is never dark. You don’t have to do anything.',
    },
    {
      q: 'How does billing work?',
      a: 'You get one GST invoice each month for all your shows, instead of a separate bill for every gig.',
    },
    {
      q: 'Can I rotate different artists?',
      a: 'Yes. Pick a shortlist of artists you like and we’ll schedule them across your nights.',
    },
    {
      q: 'Can artists check my sound setup?',
      a: 'Yes. List your gear once and every artist’s tech rider is checked against it before they’re booked, so nobody turns up to find the speakers are too small.',
    },
  ],
};

/* ───────────── Closing ───────────── */

export const ENCORE: Record<Side, { line1: string; line2: string; lead: string; note: string; photo: string }> = {
  artist: {
    line1: 'The stage is',
    line2: 'yours.',
    lead: 'Claim your name in 30 seconds. We’ll email you the moment your spot opens.',
    note: 'Free for artists · No card needed · Bengaluru first, then Mumbai and Delhi NCR',
    photo: '/photos/fire-stage.webp',
  },
  host: {
    line1: 'Your next show,',
    line2: 'sorted.',
    lead: 'Join as a host and we’ll let you know the moment booking opens in your city.',
    note: 'Free to join · No card needed · Bengaluru first, then Mumbai and Delhi NCR',
    photo: '/photos/sangeet-dance.webp',
  },
  venue: {
    line1: 'Your stage,',
    line2: 'never empty.',
    lead: 'List your space and we’ll help you plan your first month of nights when we open in your city.',
    note: 'Free to list · No card needed · Bengaluru first, then Mumbai and Delhi NCR',
    photo: '/photos/band-stage.webp',
  },
};
