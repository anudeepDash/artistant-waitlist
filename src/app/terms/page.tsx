import React from 'react';
import Link from 'next/link';
import LegalShell from '@/components/home/LegalShell';
import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  title: 'Terms of service',
  description: 'The terms for using Artistant: bookings, contracts, escrow, payouts and the rules for artists, hosts and venues on the platform.',
  path: '/terms',
});

export default function TermsPage() {
  return (
    <LegalShell title="Terms of service" updated="July 2026">
        {/* Content */}
        <div>
          
          <section>
            <h2>1. Introduction</h2>
            <p>
              Welcome to Artistant ("Company", "we", "our", "us"). These Terms of Service ("Terms") govern your use of our website located at <Link href="/">artistant.in</Link> and our associated applications and services (collectively, the "Service").
            </p>
            <p>
              By accessing or using the Service, you agree to be bound by these Terms. If you disagree with any part of the terms, then you do not have permission to access the Service.
            </p>
          </section>

          <section>
            <h2>2. Accounts</h2>
            <p>
              When you create an account with us or join our waitlist, you must provide information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Service.
            </p>
            <p>
              You are responsible for safeguarding the password that you use to access the Service and for any activities or actions under your password.
            </p>
          </section>

          <section>
            <h2>3. Intellectual Property</h2>
            <p>
              The Service and its original content (excluding content provided by you or other users), features, and functionality are and will remain the exclusive property of Artistant and its licensors. The Service is protected by copyright, trademark, and other laws of both the country you reside in and foreign countries.
            </p>
          </section>

          <section>
            <h2>4. Prohibited Uses</h2>
            <p>
              You may use Service only for lawful purposes and in accordance with Terms. You agree not to use Service:
            </p>
            <ul>
              <li>In any way that violates any applicable national or international law or regulation.</li>
              <li>For the purpose of exploiting, harming, or attempting to exploit or harm minors in any way.</li>
              <li>To transmit, or procure the sending of, any advertising or promotional material, including any "junk mail", "chain letter," "spam," or any other similar solicitation.</li>
              <li>To impersonate or attempt to impersonate Artistant, a Artistant employee, another user, or any other person or entity.</li>
            </ul>
          </section>

          <section>
            <h2>5. Limitation of Liability</h2>
            <p>
              In no event shall Artistant, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from (i) your access to or use of or inability to access or use the Service; (ii) any conduct or content of any third party on the Service; and (iii) unauthorized access, use or alteration of your transmissions or content.
            </p>
          </section>

          <section>
            <h2>6. Changes</h2>
            <p>
              We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will make reasonable efforts to provide at least 30 days' notice prior to any new terms taking effect.
            </p>
          </section>

          <section>
            <h2>7. Contact Us</h2>
            <p>
              If you have any questions about these Terms, please contact us at <a href="mailto:hello@artistant.in">hello@artistant.in</a>.
            </p>
          </section>
        </div>
    </LegalShell>
  );
}
