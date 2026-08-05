import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Changelog & Product Updates',
  description:
    'Stay updated with the latest features, improvements, contract tools, and security updates built for Artistant.',
  alternates: {
    canonical: '/changelog',
  },
  openGraph: {
    title: 'Changelog & Product Updates | Artistant',
    description:
      'Stay updated with the latest features, improvements, contract tools, and security updates built for Artistant.',
    url: 'https://artistant.in/changelog',
    type: 'website',
    siteName: 'Artistant',
    locale: 'en_IN',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Changelog & Product Updates | Artistant',
    description:
      'Stay updated with the latest features, improvements, contract tools, and security updates built for Artistant.',
  },
};

export default function ChangelogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
