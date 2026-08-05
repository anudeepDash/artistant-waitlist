import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Live Events & Concerts',
  description:
    'Discover upcoming live concerts, music festivals, open mics, and creator events powered by Artistant across India.',
  keywords: [
    'live events India',
    'concerts Bengaluru',
    'music festivals',
    'Artistant events',
    'live shows',
  ],
  alternates: {
    canonical: '/events',
  },
  openGraph: {
    title: 'Live Events & Concerts | Artistant',
    description:
      'Discover upcoming live concerts, music festivals, open mics, and creator events powered by Artistant across India.',
    url: 'https://artistant.in/events',
    type: 'website',
    siteName: 'Artistant',
    locale: 'en_IN',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Live Events & Concerts | Artistant',
    description:
      'Discover upcoming live concerts, music festivals, open mics, and creator events powered by Artistant across India.',
  },
};

export default function EventsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
