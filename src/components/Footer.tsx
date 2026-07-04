'use client';

import { motion } from 'motion/react';

/**
 * Footer — Site footer with ArtisTant branding and links.
 * Dark, minimal design consistent with the premium aesthetic.
 */
export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = [
    {
      title: 'Platform',
      links: [
        { label: 'For Artists', href: '#features' },
        { label: 'For Clients', href: '#features' },
        { label: 'Bookability Score™', href: '#features' },
        { label: 'Escrow & Protection', href: '#features' },
      ],
    },
    {
      title: 'Company',
      links: [
        { label: 'About', href: '#' },
        { label: 'Blog', href: '#' },
        { label: 'Careers', href: '#' },
        { label: 'Contact', href: '#' },
      ],
    },
    {
      title: 'Legal',
      links: [
        { label: 'Privacy Policy', href: '#' },
        { label: 'Terms of Service', href: '#' },
        { label: 'Escrow Terms', href: '#' },
      ],
    },
  ];

  return (
    <footer className="relative border-t border-white/5 bg-bg-primary">
      {/* Gradient line at top */}
      <div className="section-divider" />

      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand column */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h3 className="gradient-text font-display text-2xl font-bold">
                ArtisTant
              </h3>
              <p className="mt-3 max-w-sm text-sm leading-relaxed text-text-secondary">
                The ultimate creative link-up. Connecting artists, clients,
                venues, and vendors in one seamless live entertainment ecosystem.
              </p>

              {/* Coming Soon badge */}
              <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-brand-orange/20 bg-brand-orange/5 px-4 py-2">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-orange opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-orange" />
                </span>
                <span className="text-xs font-semibold tracking-wider text-brand-orange">
                  LAUNCHING SOON
                </span>
              </div>

              {/* Social links */}
              <div className="mt-6 flex gap-4">
                {['Instagram', 'Twitter', 'LinkedIn'].map((social) => (
                  <a
                    key={social}
                    href="#"
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-text-muted transition-all hover:border-brand-orange/30 hover:text-text-primary"
                    aria-label={social}
                  >
                    {social === 'Instagram' && (
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                      </svg>
                    )}
                    {social === 'Twitter' && (
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                      </svg>
                    )}
                    {social === 'LinkedIn' && (
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                      </svg>
                    )}
                  </a>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Link columns */}
          {footerLinks.map((group, idx) => (
            <motion.div
              key={group.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 * (idx + 1) }}
            >
              <h4 className="text-sm font-semibold tracking-wider text-text-primary">
                {group.title}
              </h4>
              <ul className="mt-4 space-y-3">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-text-muted transition-colors hover:text-brand-orange"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-white/5 pt-8 md:flex-row">
          <p className="text-xs text-text-muted">
            © {currentYear} ArtisTant. All rights reserved.
          </p>
          <p className="text-xs text-text-muted">
            Made with 🎵 for the live entertainment community
          </p>
        </div>
      </div>
    </footer>
  );
}
