import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk, Geist, Geist_Mono, Permanent_Marker, Bricolage_Grotesque } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { Analytics } from "@vercel/analytics/next";
import { ThemeProvider } from "@/components/ThemeProvider";
import JsonLd from "@/components/JsonLd";
import ComingSoonGuard from "@/components/ComingSoonGuard";

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

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://artistant.in";

/* ── SEO Metadata ── */
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    template: "%s | Artistant",
    default: "Artistant — The safe way to book live artists in India",
  },
  description:
    "The safe way to book live artists in India. A proper contract, money held safely, and artists paid in steps — half before they travel, the rest after the show. Join the waitlist.",
  keywords: [
    "ArtisTant",
    "Artistant",
    "live entertainment",
    "artist booking India",
    "music platform India",
    "event booking Bangalore",
    "independent musicians",
    "gig contracts",
    "escrow payments",
    "book live band Bangalore",
    "wedding sangeet artists",
    "corporate event artists",
    "Bookability Score",
  ],
  authors: [{ name: "Artistant", url: siteUrl }],
  creator: "Artistant",
  publisher: "Artistant",
  alternates: {
    canonical: "/",
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
  openGraph: {
    title: "Artistant — Every gig booked. Every artist paid.",
    description:
      "The safe way to book live artists in India. A proper contract, money held safely, and artists paid in steps — half before they travel, the rest after the show. Join the waitlist.",
    url: siteUrl,
    type: "website",
    siteName: "Artistant",
    locale: "en_IN",
    images: [
      {
        url: "/brand_palette.png",
        width: 1200,
        height: 630,
        alt: "Artistant - India's Live Entertainment Infrastructure",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Artistant — Every gig booked. Every artist paid.",
    description:
      "The safe way to book live artists in India. A proper contract, money held safely, and artists paid in steps — half before they travel, the rest after the show. Join the waitlist.",
    site: "@artistant_in",
    creator: "@artistant_in",
    images: ["/brand_palette.png"],
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
  themeColor: "#0B1120",
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
            <ComingSoonGuard>
              {children}
            </ComingSoonGuard>
          </AuthProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}

