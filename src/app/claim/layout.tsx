import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Claim Your Artist Profile',
  description:
    'Claim your founding artist handle on Artistant. Access direct booking requests, escrow protected payouts, and contract management.',
  alternates: {
    canonical: '/claim',
  },
  openGraph: {
    title: 'Claim Your Artist Profile | Artistant',
    description:
      'Claim your founding artist handle on Artistant. Access direct booking requests, escrow protected payouts, and contract management.',
    url: 'https://artistant.in/claim',
    type: 'website',
    siteName: 'Artistant',
    locale: 'en_IN',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Claim Your Artist Profile | Artistant',
    description:
      'Claim your founding artist handle on Artistant. Access direct booking requests, escrow protected payouts, and contract management.',
  },
};

export default function ClaimLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
