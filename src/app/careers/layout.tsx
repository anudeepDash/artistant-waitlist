import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Careers',
  description:
    'Join Artistant — we\'re building the infrastructure India\'s independent artists deserve. Explore open roles in engineering, design, growth, and community.',
  alternates: {
    canonical: '/careers',
  },
  openGraph: {
    title: 'Careers at Artistant — Build the Future of Live Entertainment',
    description:
      'Join the team reshaping how artists get booked, get paid, and get discovered across India\'s live entertainment economy.',
    url: 'https://artistant.in/careers',
    type: 'website',
    siteName: 'Artistant',
    locale: 'en_IN',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Careers at Artistant — Build the Future of Live Entertainment',
    description:
      'Join the team reshaping how artists get booked, get paid, and get discovered across India\'s live entertainment economy.',
  },
};

export default function CareersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

