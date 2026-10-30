import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  title: 'Changelog',
  socialTitle: 'What\'s new on Artistant',
  description:
    'New features, fixes and security updates on Artistant — the small things that make booking live artists and getting paid easier.',
  path: '/changelog',
});

export default function ChangelogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
