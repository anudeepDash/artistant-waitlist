import { BRAND, OG_SIZE, poster } from '../_og/poster';

export const alt = 'Gigs on Artistant — live performance opportunities that pay on time.';
export const size = OG_SIZE;
export const contentType = 'image/jpeg';

export default function Image() {
  return poster({
    accent: BRAND.orange,
    photo: 'dj-stage',
    eyebrow: 'Gigs',
    line1: 'Gigs that',
    line2: 'pay on time.',
    lead: 'Club slots, festival lineups, weddings and office parties. Every gig with a contract and half the fee before you travel.',
    facts: ['Contract', 'Escrow', '50% upfront'],
  });
}
