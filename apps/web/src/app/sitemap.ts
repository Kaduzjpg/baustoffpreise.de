import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_BASE_URL || 'https://example.com';
  const now = new Date().toISOString();
  return [
    { url: `${base}/`, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${base}/produkte`, lastModified: now, changeFrequency: 'daily', priority: 0.8 },
    { url: `${base}/kategorien`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 }
  ];
}


