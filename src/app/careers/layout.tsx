import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  title: 'Careers',
  socialTitle: 'Careers at Artistant — Build the stage artists deserve',
  description:
    'Join Artistant. We\'re building contracts, escrow and payouts for India\'s live entertainment. Open roles in engineering, design, growth and community.',
  path: '/careers',
});

export default function CareersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
