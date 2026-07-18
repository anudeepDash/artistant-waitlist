import type { Metadata } from 'next';
import CreatorApplicationForm from './CreatorApplicationForm';

export const metadata: Metadata = {
  title: 'Jasmine Sandlas Bengaluru | Creator Call',
  description: 'Apply to create campaign content for Jasmine Sandlas in Bengaluru.',
};

export default function JasmineSandlasBengaluruPage() {
  return <CreatorApplicationForm />;
}
