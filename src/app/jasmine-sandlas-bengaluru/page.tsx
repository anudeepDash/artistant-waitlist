import CreatorApplicationForm from './CreatorApplicationForm';
import JsonLd from '@/components/JsonLd';
import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  title: 'Jasmine Sandlas Bengaluru — Creator call',
  socialTitle: 'Jasmine Sandlas, live in Bengaluru — Creator call | Artistant',
  description: 'Apply to create campaign content for Jasmine Sandlas live in Bengaluru, and collaborate with the Artistant team on the show.',
  path: '/jasmine-sandlas-bengaluru',
});

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
