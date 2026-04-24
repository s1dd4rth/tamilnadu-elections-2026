import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import turnoutData from "@/data/turnout.json";
import "./globals.css";

const SITE_URL = "https://tn-dashboard-app.vercel.app";
const TITLE = `Tamil Nadu 2026 Election · ${turnoutData.state.vtr2026}% Turnout Dashboard`;
const OG_TITLE = `${turnoutData.state.vtr2026}% — Tamil Nadu's 2026 turnout, mapped constituency by constituency`;
const DESCRIPTION = `Tamil Nadu polled ${turnoutData.state.vtr2026}% on 23 April 2026 — the highest assembly-election turnout in modern memory. An editorial data atlas of the roll, the ballot, and the vote: interactive district heat maps, 2021-to-2026 comparisons, candidate affidavit analysis, and the counter-intuitive findings hiding in the numbers.`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    "Tamil Nadu 2026 election",
    "TN assembly election 2026",
    "voter turnout 2026",
    "TN VTR 2026",
    "Tamil Nadu election dashboard",
    "SIR Final Roll 2026",
    "constituency turnout Tamil Nadu",
    "TN election data visualization",
  ],
  authors: [{ name: "Siddarth Kengadaran" }],
  creator: "Siddarth Kengadaran",
  publisher: "Siddarth Kengadaran",
  openGraph: {
    title: OG_TITLE,
    description: DESCRIPTION,
    url: SITE_URL,
    siteName: "TN Election 2026 Dashboard",
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: `${SITE_URL}/opengraph-image`,
        width: 1200,
        height: 628,
        alt: "Tamil Nadu 2026 Election Dashboard — turnout and electoral atlas",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: OG_TITLE,
    description: DESCRIPTION,
    creator: "@s1dd4rth",
    images: [`${SITE_URL}/opengraph-image`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: SITE_URL,
  },
  category: "news",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "NewsArticle",
  headline: `Tamil Nadu 2026 Assembly Election — Turnout and Electoral Atlas`,
  description: DESCRIPTION,
  author: {
    "@type": "Person",
    name: "Siddarth Kengadaran",
  },
  publisher: {
    "@type": "Organization",
    name: "TN Election 2026 Dashboard",
    url: SITE_URL,
  },
  datePublished: "2026-04-19",
  dateModified: new Date().toISOString().split("T")[0],
  image: `${SITE_URL}/opengraph-image`,
  mainEntityOfPage: {
    "@type": "WebPage",
    "@id": SITE_URL,
  },
  about: [
    { "@type": "Thing", name: "Tamil Nadu Legislative Assembly election, 2026" },
    { "@type": "Thing", name: "Voter turnout" },
    { "@type": "Thing", name: "Electoral roll" },
  ],
  keywords: "Tamil Nadu 2026 election, voter turnout, TN VTR, SIR Final Roll, assembly election dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,700;0,9..144,900;1,9..144,400;1,9..144,700;1,9..144,900&family=IBM+Plex+Mono:wght@400;600;700&display=swap"
          rel="stylesheet"
        />
        <meta name="theme-color" content="#faf4e8" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        <a href="#main-content" className="skip-to-content">Skip to content</a>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
