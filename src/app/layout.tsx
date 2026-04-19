import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TN Election 2026 Dashboard | CEO Tamil Nadu Final Roll",
  description: "Comprehensive data visualization of Tamil Nadu 2026 Assembly Election candidates, constituencies, and voter demographics based on the SIR 2026 Final Electoral Roll.",
  openGraph: {
    title: "TN Election 2026 Dashboard",
    description: "Deep dive into Tamil Nadu's 2026 electoral landscape with interactive maps and demographic insights.",
    url: "https://tn-election-2026.vercel.app", // Fallback, will be replaced by actual URL if available
    siteName: "TN Election Dashboard",
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "TN Election 2026 Dashboard",
    description: "Interactive data visualization of the Tamil Nadu 2026 Assembly Election.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,700;0,9..144,900;1,9..144,400;1,9..144,700;1,9..144,900&family=IBM+Plex+Mono:wght@400;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
