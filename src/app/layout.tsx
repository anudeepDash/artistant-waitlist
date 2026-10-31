import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk, Geist, Geist_Mono, Permanent_Marker, Bricolage_Grotesque } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { Analytics } from "@vercel/analytics/next";
import { ThemeProvider } from "@/components/ThemeProvider";
import JsonLd from "@/components/JsonLd";
import { SITE_NAME, SITE_URL, TWITTER_HANDLE } from "@/lib/seo";

// Fonts the homepage doesn't use aren't preloaded; they still load on pages that use them.
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  preload: false,
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
  preload: false,
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
});

// Homepage type: a characterful variable grotesk for headlines, Geist for text.
const display = Bricolage_Grotesque({
  subsets: ["latin"],
  axes: ["wdth"],
  variable: "--font-bricolage",
  display: "swap",
});

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
  display: "swap",
});

const marker = Permanent_Marker({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-marker",
  display: "swap",
  preload: false,
});

const siteUrl = SITE_URL;
const description =
  "The safe way to book live artists in India. A proper contract, money held safely, and artists paid in steps — half before they travel, the rest after the show.";

/* ── SEO Metadata ──
 * Share images come from opengraph-image.tsx files next to each page (see app/_og). */
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    template: "%s | Artistant",
    default: "Artistant — Book live artists in India, safely",
  },
  description,
  applicationName: "Artistant",
  keywords: [
    "Artistant",
    "book live artists India",
    "artist booking platform",
    "book live band Bangalore",
    "book singer for wedding",
    "sangeet performers",
    "corporate event artists",
    "DJ booking India",
    "gig contracts",
    "escrow for artists",
    "independent musicians India",
  ],
  authors: [{ name: "Artistant", url: siteUrl }],
  creator: "Artistant",
  publisher: "Artistant",
  category: "entertainment",
  alternates: {
    canonical: "/",
  },
  formatDetection: {
    telephone: false,
    email: false,
    address: false,
  },
  icons: {
    icon: [
      { url: "/icon.png", type: "image/png" },
      { url: "/favicon.ico" },
    ],
    apple: [
      { url: "/icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/site.webmanifest",
  appleWebApp: {
    title: "Artistant",
    statusBarStyle: "black-translucent",
  },
  openGraph: {
    title: "Artistant — Get paid. Not ghosted.",
    description,
    url: "/",
    type: "website",
    siteName: SITE_NAME,
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: "Artistant — Get paid. Not ghosted.",
    description,
    site: TWITTER_HANDLE,
    creator: TWITTER_HANDLE,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  colorScheme: "dark",
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${siteUrl}/#organization`,
      "name": "Artistant",
      "url": siteUrl,
      "logo": `${siteUrl}/logo_a_highres.png`,
      "sameAs": [
        "https://instagram.com/artistant.in",
        "https://x.com/artistant_in"
      ],
      "description": "Contract, escrow, and payment infrastructure for India's independent artists and creators."
    },
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      "url": siteUrl,
      "name": "Artistant",
      "publisher": { "@id": `${siteUrl}/#organization` },
      "potentialAction": {
        "@type": "SearchAction",
        "target": `${siteUrl}/directory?search={search_term_string}`,
        "query-input": "required name=search_term_string"
      }
    }
  ]
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`h-full antialiased ${inter.variable} ${spaceGrotesk.variable} ${geistMono.variable} ${marker.variable} ${display.variable} ${geist.variable}`} suppressHydrationWarning>
      <head>
        <JsonLd data={websiteSchema} />
      </head>
      <body className="min-h-screen antialiased bg-bg text-ink transition-colors duration-300">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}

