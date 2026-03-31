import type { MetadataRoute } from 'next';
import { siteConfig } from '@/site.config';
import { getAllSlugs, getCategories } from '@/lib/db';

const BASE = `https://${siteConfig.domain}`;
const c = siteConfig;

export default function sitemap(): MetadataRoute.Sitemap {
  const slugs = getAllSlugs();
  const categories = getCategories();

  const entries: MetadataRoute.Sitemap = [];

  // Static pages
  const staticPages = ['/', '/compare/', '/search/', '/blog/', '/about/', '/methodology/', '/privacy/', '/terms/', '/contact/', '/disclaimer/', '/rankings/all/'];
  for (const page of staticPages) {
    entries.push({ url: `${BASE}${page}`, lastModified: new Date(), priority: page === '/' ? 1.0 : 0.5 });
  }

  // Entity detail pages (highest priority)
  for (const s of slugs) {
    entries.push({ url: `${BASE}/${c.entity.slug}/${s.slug}/`, lastModified: new Date(), priority: 0.8 });
  }

  // Category pages
  for (const cat of categories) {
    entries.push({ url: `${BASE}/search?q=${encodeURIComponent(cat.category)}`, lastModified: new Date(), priority: 0.6 });
  }

  // Multi-language: top items × target languages (if configured)
  if (c.targetLangs && c.targetLangs.length > 0) {
    const topSlugs = slugs.slice(0, 30);
    for (const lang of c.targetLangs) {
      for (const s of topSlugs) {
        entries.push({ url: `${BASE}/${lang}/${c.entity.slug}/${s.slug}/`, lastModified: new Date(), priority: 0.7 });
      }
    }
  }

  return entries;
}
