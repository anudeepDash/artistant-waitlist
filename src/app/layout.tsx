import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { Analytics } from "@vercel/analytics/next";
import { ThemeProvider } from "@/components/ThemeProvider";

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

/* ── SEO Metadata ── */
export const metadata: Metadata = {
  title: {
    template: "%s | Artistant",
    default: "Home | Artistant",
  },
  description:
    "The live event ecosystem is broken. We built the contract, escrow, and payment infrastructure India's independent artists actually deserve.",
  keywords: [
    "ArtisTant",
    "live entertainment",
    "artist booking",
    "music platform",
    "India music economy",
    "event booking",
    "Bangalore artists",
  ],
  openGraph: {
    title: "ARTISTANT — India's live economy, rebuilt.",
    description:
      "The live event ecosystem is broken. We built the contract, escrow, and payment infrastructure India's independent artists actually deserve.",
    type: "website",
    siteName: "Artistant",
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: "ARTISTANT — India's live economy, rebuilt.",
    description:
      "The live event ecosystem is broken. We built the contract, escrow, and payment infrastructure India's independent artists actually deserve.",
  },
  robots: "index, follow",
};

export const viewport: Viewport = {
  themeColor: "#0B1120",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`h-full antialiased ${inter.variable} ${spaceGrotesk.variable} ${geistMono.variable}`} suppressHydrationWarning>
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
