import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { Analytics } from "@vercel/analytics/next";
import { ThemeProvider } from "@/components/ThemeProvider";

/* ── SEO Metadata ── */
export const metadata: Metadata = {
  title: {
    template: "%s | Artistant",
    default: "Home | Artistant",
  },
  description:
    "India runs on live events. The infrastructure to hire it doesn't exist yet. We're building it. Join the waitlist.",
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
      "India runs on live events. The infrastructure to hire it doesn't exist yet. We're building it.",
    type: "website",
    siteName: "Artistant",
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: "ARTISTANT — India's live economy, rebuilt.",
    description:
      "India runs on live events. The infrastructure to hire it doesn't exist yet. We're building it.",
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
    <html lang="en" className="h-full antialiased">
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
