import type { MetadataRoute } from 'next';
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const api = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
  try {
    const res = await fetch(`${api}/public/articles?limit=500`, { next: { revalidate: 60 } });
    const data = await res.json();
    return (data.articles || []).map((a:any) => ({
      url: `${base}/story/${a.slug}`, lastModified: a.updatedAt || a.publishedAt || new Date(),
      changeFrequency: 'hourly', priority: 0.8
    }));
  } catch { return [{ url: base, priority: 1, changeFrequency: 'hourly' }]; }
}
