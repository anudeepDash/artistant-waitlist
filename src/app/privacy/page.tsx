import React from 'react';
import LegalShell from '@/components/home/LegalShell';
import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  title: 'Privacy policy',
  description: 'What Artistant collects, why we need it, and how we store and protect the data of artists, hosts and venues.',
  path: '/privacy',
});

export default function PrivacyPage() {
  return (
    <LegalShell title="Privacy policy" updated="July 2026">
        {/* Content */}
        <div>
          
          <section>
            <h2>1. Information We Collect</h2>
            <p>
              At Artistant, we collect information to provide better services to our users. The types of personal information we collect include:
            </p>
            <ul>
              <li><strong>Information you provide to us:</strong> Such as your name, email address, phone number, and any other details you provide when joining our waitlist, creating an account, or communicating with us.</li>
              <li><strong>Information collected automatically:</strong> When you visit our website, we may automatically collect data such as your IP address, browser type, device information, and browsing patterns using cookies and similar technologies.</li>
            </ul>
          </section>

          <section>
            <h2>2. How We Use Your Information</h2>
            <p>
              We use the collected information for various purposes, including to:
            </p>
            <ul>
              <li>Provide, maintain, and improve our Service.</li>
              <li>Notify you about updates, new features, and the official launch of our platform.</li>
              <li>Respond to your comments, questions, and customer service requests.</li>
              <li>Monitor and analyze trends, usage, and activities in connection with our Service.</li>
              <li>Detect, prevent, and address technical issues.</li>
            </ul>
          </section>

          <section>
            <h2>3. Information Sharing and Disclosure</h2>
            <p>
              We do not sell your personal information. We may share your information in the following situations:
            </p>
            <ul>
              <li><strong>With Service Providers:</strong> We may employ third-party companies and individuals to facilitate our Service, provide the Service on our behalf, perform Service-related services, or assist us in analyzing how our Service is used.</li>
              <li><strong>For Legal Requirements:</strong> We may disclose your information if required to do so by law or in response to valid requests by public authorities (e.g., a court or a government agency).</li>
              <li><strong>Business Transfers:</strong> If Artistant is involved in a merger, acquisition, or asset sale, your personal data may be transferred.</li>
            </ul>
          </section>

          <section>
            <h2>4. Data Security</h2>
            <p>
              The security of your data is important to us, but remember that no method of transmission over the Internet, or method of electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your Personal Data, we cannot guarantee its absolute security.
            </p>
          </section>

          <section>
            <h2>5. Your Privacy Rights</h2>
            <p>
              Depending on your location, you may have rights under applicable privacy laws, such as the right to access, update, or delete the information we have on you. If you wish to exercise any of these rights, please contact us.
            </p>
          </section>

          <section>
            <h2>6. Links to Other Sites</h2>
            <p>
              Our Service may contain links to other sites that are not operated by us. If you click on a third-party link, you will be directed to that third party's site. We strongly advise you to review the Privacy Policy of every site you visit.
            </p>
          </section>

          <section>
            <h2>7. Changes to This Privacy Policy</h2>
            <p>
              We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date at the top of this Privacy Policy.
            </p>
          </section>

          <section>
            <h2>8. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us at <a href="mailto:hello@artistant.in">hello@artistant.in</a>.
            </p>
          </section>
        </div>
    </LegalShell>
  );
}
