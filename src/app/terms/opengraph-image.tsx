import { BRAND, OG_SIZE, poster } from '../_og/poster';

export const alt = 'Artistant terms of service.';
export const size = OG_SIZE;
export const contentType = 'image/jpeg';

export default function Image() {
  return poster({
    accent: BRAND.blue,
    photo: 'band-stage',
    eyebrow: 'Terms of service',
    line1: 'The rules',
    line2: 'of the stage.',
    lead: 'The terms for using Artistant: bookings, contracts, escrow, payouts and the platform.',
    facts: ['Terms of service'],
  });
}
