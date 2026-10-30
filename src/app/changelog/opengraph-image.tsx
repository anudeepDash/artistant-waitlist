import { BRAND, OG_SIZE, poster } from '../_og/poster';

export const alt = 'Artistant changelog — what’s new on Artistant.';
export const size = OG_SIZE;
export const contentType = 'image/jpeg';

export default function Image() {
  return poster({
    accent: BRAND.violet,
    photo: 'garba',
    eyebrow: 'Changelog',
    line1: 'What’s new',
    line2: 'on Artistant.',
    lead: 'New features, fixes and the small things that make booking and getting paid easier.',
    facts: ['Features', 'Fixes', 'Security'],
  });
}
