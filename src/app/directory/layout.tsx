import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Artist & Creator Directory',
  description:
    'Discover and book top independent singers, DJs, bands, comedians, dancers, and instrumentalists across Bengaluru, Mumbai, Delhi, and India.',
  keywords: [
    'artist directory India',
    'book singers Bengaluru',
    'book DJs Mumbai',
    'independent artists',
    'live performers',
    'event entertainment India',
  ],
  alternates: {
    canonical: '/directory',
  },
  openGraph: {
    title: 'Artist & Creator Directory | Artistant',
    description:
      'Discover and book top independent singers, DJs, bands, comedians, dancers, and instrumentalists across India.',
    url: 'https://artistant.in/directory',
    type: 'website',
    siteName: 'Artistant',
    locale: 'en_IN',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Artist & Creator Directory | Artistant',
    description:
      'Discover and book top independent singers, DJs, bands, comedians, dancers, and instrumentalists across India.',
  },
};

export default function DirectoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
