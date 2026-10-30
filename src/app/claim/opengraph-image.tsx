import { BRAND, OG_SIZE, poster } from '../_og/poster';

export const alt = 'Claim your name on Artistant — your own booking page for live gigs.';
export const size = OG_SIZE;
export const contentType = 'image/png';

export default function Image() {
  return poster({
    accent: BRAND.orange,
    photo: 'sitar',
    eyebrow: 'Founding artists',
    line1: 'Claim your name',
    line2: 'before it’s gone.',
    lead: 'Your own booking page at artistant.in/yourname, with direct requests, contracts and payouts built in.',
    facts: ['Free to join', 'Direct bookings', 'Paid in steps'],
  });
}
