import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Gigs & Live Opportunities',
  description:
    'Explore verified live performance gigs, club slots, festival lineups, and corporate opportunities for independent artists across India.',
  keywords: [
    'artist gigs India',
    'live music opportunities',
    'DJ slots Bengaluru',
    'band bookings',
    'performing gigs',
  ],
  alternates: {
    canonical: '/gigs',
  },
  openGraph: {
    title: 'Gigs & Live Opportunities | Artistant',
    description:
      'Explore verified live performance gigs, club slots, festival lineups, and corporate opportunities for independent artists across India.',
    url: 'https://artistant.in/gigs',
    type: 'website',
    siteName: 'Artistant',
    locale: 'en_IN',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Gigs & Live Opportunities | Artistant',
    description:
      'Explore verified live performance gigs, club slots, festival lineups, and corporate opportunities for independent artists across India.',
  },
};

export default function GigsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
