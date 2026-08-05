import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { Analytics } from "@vercel/analytics/next";
import { ThemeProvider } from "@/components/ThemeProvider";
import JsonLd from "@/components/JsonLd";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://artistant.in";

/* ── SEO Metadata ── */
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    template: "%s | Artistant",
    default: "ARTISTANT — India's Live Entertainment Economy, Rebuilt",
  },
  description:
    "The live event ecosystem is broken. We built the contract, escrow, and payment infrastructure India's independent artists actually deserve.",
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
    title: "ARTISTANT — India's live economy, rebuilt.",
    description:
      "The live event ecosystem is broken. We built the contract, escrow, and payment infrastructure India's independent artists actually deserve.",
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
    title: "ARTISTANT — India's live economy, rebuilt.",
    description:
      "The live event ecosystem is broken. We built the contract, escrow, and payment infrastructure India's independent artists actually deserve.",
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
        "https://x.com/artistant_in",
        "https://youtube.com/@artistant"
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
    <html lang="en" className={`h-full antialiased ${inter.variable} ${spaceGrotesk.variable} ${geistMono.variable}`} suppressHydrationWarning>
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

