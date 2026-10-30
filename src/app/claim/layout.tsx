import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  title: 'Claim your artist name',
  socialTitle: 'Claim your name on Artistant — before it’s gone',
  description:
    'Get your own booking page at artistant.in/yourname. Direct booking requests, a proper contract for every gig, and half your fee before you travel.',
  path: '/claim',
});

export default function ClaimLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
