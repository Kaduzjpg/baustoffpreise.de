import type { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_BASE_URL || 'https://example.com';
  const api = process.env.NEXT_PUBLIC_API_BASE || '';
  const now = new Date().toISOString();

  const entries: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${base}/produkte`, lastModified: now, changeFrequency: 'daily', priority: 0.8 },
    { url: `${base}/kategorien`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 }
  ];

  try {
    const [productsRes, catsRes] = await Promise.all([
      fetch(`${api}/api/products/list`, { cache: 'force-cache' }),
      fetch(`${api}/api/products/categories`, { cache: 'force-cache' })
    ]);
    if (productsRes.ok) {
      const products = (await productsRes.json()) as { slug: string; updatedAt?: string }[];
      for (const p of products) {
        entries.push({
          url: `${base}/produkte/${p.slug}`,
          lastModified: p.updatedAt || now,
          changeFrequency: 'weekly',
          priority: 0.7
        });
      }
    }
    if (catsRes.ok) {
      const cats = (await catsRes.json()) as { slug: string; updatedAt?: string }[];
      for (const c of cats) {
        entries.push({
          url: `${base}/kategorien/${c.slug}`,
          lastModified: c.updatedAt || now,
          changeFrequency: 'weekly',
          priority: 0.6
        });
      }
    }
  } catch {}

  return entries;
}


