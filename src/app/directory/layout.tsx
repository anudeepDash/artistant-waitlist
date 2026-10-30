import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  title: 'Book singers, DJs, bands & comedians',
  socialTitle: 'Book the act, not the agency | Artistant',
  description:
    'Find and book singers, DJs, bands, comedians and dancers across Bengaluru, Mumbai, Delhi and India. Clear prices, a real contract and safe payment.',
  path: '/directory',
  keywords: [
    'artist directory India',
    'book singers Bengaluru',
    'book DJs Mumbai',
    'book live band',
    'wedding performers',
    'event entertainment India',
  ],
});

export default function DirectoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
