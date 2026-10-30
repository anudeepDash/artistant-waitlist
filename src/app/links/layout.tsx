import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  title: 'Links',
  socialTitle: 'All Artistant links in one place',
  description:
    'Claim your artist name, join as a host or venue, and follow Artistant on Instagram, LinkedIn and YouTube — all in one place.',
  path: '/links',
});

export default function LinksLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
