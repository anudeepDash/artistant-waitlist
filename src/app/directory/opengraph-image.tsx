import { BRAND, OG_SIZE, poster } from '../_og/poster';

export const alt = 'Artistant directory — book singers, DJs, bands and comedians across India.';
export const size = OG_SIZE;
export const contentType = 'image/png';

export default function Image() {
  return poster({
    accent: BRAND.violet,
    photo: 'band-stage',
    eyebrow: 'Artist directory',
    line1: 'Book the act,',
    line2: 'not the agency.',
    lead: 'Singers, DJs, bands, comedians and dancers across India. Clear prices, a real contract, and your money held safely.',
    facts: ['Verified artists', 'Clear prices', 'Escrow'],
  });
}
