import React from 'react';
import Link from 'next/link';
import Footer from '@/components/Footer';

export const metadata = {
  title: 'Privacy Policy | ArtisTant',
  description: 'Privacy Policy for ArtisTant',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#121212] text-gray-300 font-sans selection:bg-[#F25A2B]/30 selection:text-white">
      {/* Background Glows */}
      <div className="fixed top-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-[#F25A2B]/5 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="fixed bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] bg-[#7C5CFF]/5 rounded-full blur-[120px] pointer-events-none -z-10" />
      
      <main className="max-w-4xl mx-auto px-6 py-24 md:py-32 relative z-10">
        
        {/* Header */}
        <div className="mb-16">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors mb-8 group">
            <svg className="w-4 h-4 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </Link>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">Privacy Policy</h1>
          <p className="text-gray-400 font-mono text-sm tracking-widest uppercase">Last Updated: July 2026</p>
        </div>

        {/* Content */}
        <div className="space-y-12">
          
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-white font-display">1. Information We Collect</h2>
            <p className="leading-relaxed">
              At ArtisTant, we collect information to provide better services to our users. The types of personal information we collect include:
            </p>
            <ul className="list-disc pl-6 space-y-2 leading-relaxed text-gray-400">
              <li><strong>Information you provide to us:</strong> Such as your name, email address, phone number, and any other details you provide when joining our waitlist, creating an account, or communicating with us.</li>
              <li><strong>Information collected automatically:</strong> When you visit our website, we may automatically collect data such as your IP address, browser type, device information, and browsing patterns using cookies and similar technologies.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-white font-display">2. How We Use Your Information</h2>
            <p className="leading-relaxed">
              We use the collected information for various purposes, including to:
            </p>
            <ul className="list-disc pl-6 space-y-2 leading-relaxed text-gray-400">
              <li>Provide, maintain, and improve our Service.</li>
              <li>Notify you about updates, new features, and the official launch of our platform.</li>
              <li>Respond to your comments, questions, and customer service requests.</li>
              <li>Monitor and analyze trends, usage, and activities in connection with our Service.</li>
              <li>Detect, prevent, and address technical issues.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-white font-display">3. Information Sharing and Disclosure</h2>
            <p className="leading-relaxed">
              We do not sell your personal information. We may share your information in the following situations:
            </p>
            <ul className="list-disc pl-6 space-y-2 leading-relaxed text-gray-400">
              <li><strong>With Service Providers:</strong> We may employ third-party companies and individuals to facilitate our Service, provide the Service on our behalf, perform Service-related services, or assist us in analyzing how our Service is used.</li>
              <li><strong>For Legal Requirements:</strong> We may disclose your information if required to do so by law or in response to valid requests by public authorities (e.g., a court or a government agency).</li>
              <li><strong>Business Transfers:</strong> If ArtisTant is involved in a merger, acquisition, or asset sale, your personal data may be transferred.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-white font-display">4. Data Security</h2>
            <p className="leading-relaxed">
              The security of your data is important to us, but remember that no method of transmission over the Internet, or method of electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your Personal Data, we cannot guarantee its absolute security.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-white font-display">5. Your Privacy Rights</h2>
            <p className="leading-relaxed">
              Depending on your location, you may have rights under applicable privacy laws, such as the right to access, update, or delete the information we have on you. If you wish to exercise any of these rights, please contact us.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-white font-display">6. Links to Other Sites</h2>
            <p className="leading-relaxed">
              Our Service may contain links to other sites that are not operated by us. If you click on a third-party link, you will be directed to that third party's site. We strongly advise you to review the Privacy Policy of every site you visit.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-white font-display">7. Changes to This Privacy Policy</h2>
            <p className="leading-relaxed">
              We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date at the top of this Privacy Policy.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-white font-display">8. Contact Us</h2>
            <p className="leading-relaxed">
              If you have any questions about this Privacy Policy, please contact us at <a href="mailto:hello@artistant.in" className="text-[#F25A2B] hover:underline">hello@artistant.in</a>.
            </p>
          </section>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
