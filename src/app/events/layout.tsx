import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  title: 'Live events & concerts',
  socialTitle: 'Live music near you | Artistant',
  description:
    'Upcoming concerts, open mics, festivals and creator nights across India, with artists booked through Artistant.',
  path: '/events',
  keywords: [
    'live events India',
    'concerts Bengaluru',
    'open mics',
    'music festivals India',
    'live shows',
  ],
});

export default function EventsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
