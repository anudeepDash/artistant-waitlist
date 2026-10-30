import { BRAND, OG_SIZE, poster } from '../_og/poster';

export const alt = 'Live events and concerts on Artistant across India.';
export const size = OG_SIZE;
export const contentType = 'image/png';

export default function Image() {
  return poster({
    accent: BRAND.pink,
    photo: 'fire-stage',
    eyebrow: 'Live events',
    line1: 'Live music,',
    line2: 'near you.',
    lead: 'Concerts, open mics, festivals and creator nights across India, booked through Artistant.',
    facts: ['Concerts', 'Open mics', 'Festivals'],
  });
}
