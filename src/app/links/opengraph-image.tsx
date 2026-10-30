import { BRAND, OG_SIZE, poster } from '../_og/poster';

export const alt = 'All Artistant links in one place.';
export const size = OG_SIZE;
export const contentType = 'image/png';

export default function Image() {
  return poster({
    accent: BRAND.pink,
    photo: 'sangeet-dance',
    eyebrow: 'Links',
    line1: 'All our links,',
    line2: 'in one place.',
    lead: 'Claim your name, join as a host or venue, and follow Artistant everywhere.',
    facts: ['Instagram', 'LinkedIn', 'YouTube'],
  });
}
