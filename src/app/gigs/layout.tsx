import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  title: 'Gigs for live artists',
  socialTitle: 'Gigs that pay on time | Artistant',
  description:
    'Club slots, festival lineups, weddings and corporate gigs for independent artists in India. Every gig with a contract and half the fee before you travel.',
  path: '/gigs',
  keywords: [
    'artist gigs India',
    'live music gigs',
    'DJ gigs Bengaluru',
    'band gigs',
    'paid gigs for singers',
  ],
});

export default function GigsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
