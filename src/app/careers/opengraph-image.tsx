import { BRAND, OG_SIZE, poster } from '../_og/poster';

export const alt = 'Careers at Artistant — build the stage India’s artists deserve.';
export const size = OG_SIZE;
export const contentType = 'image/png';

export default function Image() {
  return poster({
    accent: BRAND.blue,
    photo: 'mixer',
    eyebrow: 'Careers',
    line1: 'Build the stage',
    line2: 'artists deserve.',
    lead: 'We’re building contracts, escrow and payouts for India’s live entertainment. Come build it with us.',
    facts: ['Engineering', 'Design', 'Growth', 'Community'],
  });
}
