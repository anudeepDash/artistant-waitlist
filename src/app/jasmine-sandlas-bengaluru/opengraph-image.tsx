import { BRAND, OG_SIZE, poster } from '../_og/poster';

export const alt = 'Jasmine Sandlas live in Bengaluru — creator call on Artistant.';
export const size = OG_SIZE;
export const contentType = 'image/jpeg';

export default function Image() {
  return poster({
    accent: BRAND.pink,
    photo: 'crowd-bengaluru',
    eyebrow: 'Creator call · Bengaluru',
    line1: 'Jasmine Sandlas,',
    line2: 'live in Bengaluru.',
    lead: 'Apply to create campaign content for the show and collaborate with the Artistant team.',
    facts: ['Creators', 'Campaign content'],
    size: 100,
  });
}
