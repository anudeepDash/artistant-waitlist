import React from 'react';
import Link from 'next/link';
import Footer from '@/components/Footer';

export const metadata = {
  title: 'Terms of Service | ArtisTant',
  description: 'Terms and Conditions for using ArtisTant services.',
};

export default function TermsPage() {
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
          <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">Terms of Service</h1>
          <p className="text-gray-400 font-mono text-sm tracking-widest uppercase">Last Updated: July 2026</p>
        </div>

        {/* Content */}
        <div className="space-y-12">
          
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-white font-display">1. Introduction</h2>
            <p className="leading-relaxed">
              Welcome to ArtisTant ("Company", "we", "our", "us"). These Terms of Service ("Terms") govern your use of our website located at <Link href="/" className="text-[#F25A2B] hover:underline">artistant.in</Link> and our associated applications and services (collectively, the "Service").
            </p>
            <p className="leading-relaxed">
              By accessing or using the Service, you agree to be bound by these Terms. If you disagree with any part of the terms, then you do not have permission to access the Service.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-white font-display">2. Accounts</h2>
            <p className="leading-relaxed">
              When you create an account with us or join our waitlist, you must provide information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Service.
            </p>
            <p className="leading-relaxed">
              You are responsible for safeguarding the password that you use to access the Service and for any activities or actions under your password.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-white font-display">3. Intellectual Property</h2>
            <p className="leading-relaxed">
              The Service and its original content (excluding content provided by you or other users), features, and functionality are and will remain the exclusive property of ArtisTant and its licensors. The Service is protected by copyright, trademark, and other laws of both the country you reside in and foreign countries.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-white font-display">4. Prohibited Uses</h2>
            <p className="leading-relaxed">
              You may use Service only for lawful purposes and in accordance with Terms. You agree not to use Service:
            </p>
            <ul className="list-disc pl-6 space-y-2 leading-relaxed text-gray-400">
              <li>In any way that violates any applicable national or international law or regulation.</li>
              <li>For the purpose of exploiting, harming, or attempting to exploit or harm minors in any way.</li>
              <li>To transmit, or procure the sending of, any advertising or promotional material, including any "junk mail", "chain letter," "spam," or any other similar solicitation.</li>
              <li>To impersonate or attempt to impersonate ArtisTant, a ArtisTant employee, another user, or any other person or entity.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-white font-display">5. Limitation of Liability</h2>
            <p className="leading-relaxed">
              In no event shall ArtisTant, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from (i) your access to or use of or inability to access or use the Service; (ii) any conduct or content of any third party on the Service; and (iii) unauthorized access, use or alteration of your transmissions or content.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-white font-display">6. Changes</h2>
            <p className="leading-relaxed">
              We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will make reasonable efforts to provide at least 30 days' notice prior to any new terms taking effect.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-white font-display">7. Contact Us</h2>
            <p className="leading-relaxed">
              If you have any questions about these Terms, please contact us at <a href="mailto:hello@artistant.in" className="text-[#F25A2B] hover:underline">hello@artistant.in</a>.
            </p>
          </section>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
