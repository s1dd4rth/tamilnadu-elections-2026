import type { MetadataRoute } from "next";

const SITE_URL = "https://tn-dashboard-app.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  // Clean ISO-8601 without milliseconds — some strict sitemap parsers
  // (including older Search Console versions) reject the millisecond form.
  const now = new Date();
  const lastModified = now.toISOString().replace(/\.\d{3}Z$/, "Z");
  return [
    {
      url: `${SITE_URL}/`,
      lastModified,
      changeFrequency: "daily",
      priority: 1.0,
    },
  ];
}
