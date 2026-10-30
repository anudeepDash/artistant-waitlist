import { BRAND, OG_SIZE, poster } from '../_og/poster';

export const alt = 'Artistant privacy policy.';
export const size = OG_SIZE;
export const contentType = 'image/png';

export default function Image() {
  return poster({
    accent: BRAND.blue,
    photo: 'tabla',
    eyebrow: 'Privacy policy',
    line1: 'Your data,',
    line2: 'kept safe.',
    lead: 'What Artistant collects, why we need it, and how we store and protect it.',
    facts: ['Privacy policy'],
  });
}
