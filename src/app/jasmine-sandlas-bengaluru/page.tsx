import type { Metadata } from 'next';
import CreatorApplicationForm from './CreatorApplicationForm';
import JsonLd from '@/components/JsonLd';

export const metadata: Metadata = {
  title: 'Jasmine Sandlas Bengaluru | Creator Call',
  description: 'Apply to create campaign content and collaborate for Jasmine Sandlas live event in Bengaluru.',
  alternates: {
    canonical: '/jasmine-sandlas-bengaluru',
  },
  openGraph: {
    title: 'Jasmine Sandlas Bengaluru — Creator & Content Call',
    description: 'Apply to create campaign content and collaborate for Jasmine Sandlas live event in Bengaluru.',
    url: 'https://artistant.in/jasmine-sandlas-bengaluru',
    type: 'website',
    siteName: 'Artistant',
    locale: 'en_IN',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Jasmine Sandlas Bengaluru — Creator Call',
    description: 'Apply to create campaign content for Jasmine Sandlas live show in Bengaluru.',
  },
};

const eventSchema = {
  '@context': 'https://schema.org',
  '@type': 'Event',
  'name': 'Jasmine Sandlas Live in Bengaluru - Creator Call',
  'description': 'Exclusive creator and artist content opportunity for Jasmine Sandlas live show in Bengaluru.',
  'location': {
    '@type': 'Place',
    'name': 'Bengaluru',
    'address': {
      '@type': 'PostalAddress',
      'addressLocality': 'Bengaluru',
      'addressCountry': 'IN'
    }
  },
  'performer': {
    '@type': 'Person',
    'name': 'Jasmine Sandlas'
  },
  'organizer': {
    '@type': 'Organization',
    'name': 'Artistant',
    'url': 'https://artistant.in'
  }
};

export default function JasmineSandlasBengaluruPage() {
  return (
    <>
      <JsonLd data={eventSchema} />
      <CreatorApplicationForm />
    </>
  );
}
