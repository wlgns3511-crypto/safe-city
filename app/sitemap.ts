import type { MetadataRoute } from 'next';
import { siteConfig } from '@/site.config';
import { getAllSlugs, getCategories } from '@/lib/db';
import Database from 'better-sqlite3';
import path from 'path';

const BASE = `https://${siteConfig.domain}`;
const c = siteConfig;

export default function sitemap(): MetadataRoute.Sitemap {
  const slugs = getAllSlugs();
  const categories = getCategories();
  const now = new Date();

  // Get state list for state-specific rankings
  const db = new Database(path.join(process.cwd(), c.entity.dbPath), { readonly: true });
  const states = db.prepare('SELECT DISTINCT state FROM cities ORDER BY state').all() as { state: string }[];
  db.close();

  const entries: MetadataRoute.Sitemap = [];

  // Static pages
  const staticPages = ['/', '/compare/', '/search/', '/blog/', '/about/', '/methodology/', '/privacy/', '/terms/', '/contact/', '/disclaimer/'];
  for (const page of staticPages) {
    entries.push({ url: `${BASE}${page}`, lastModified: now, priority: page === '/' ? 1.0 : 0.5 });
  }

  // All 361 city detail pages
  for (const s of slugs) {
    entries.push({ url: `${BASE}/city/${s.slug}/`, lastModified: now, priority: 0.8 });
  }

  // Category (state) search pages
  for (const cat of categories) {
    entries.push({ url: `${BASE}/search?q=${encodeURIComponent(cat.category)}`, lastModified: now, priority: 0.6 });
  }

  // Base rankings (13)
  const baseRankings = [
    'safest-cities', 'most-dangerous-cities', 'highest-violent-crime', 'lowest-violent-crime',
    'highest-property-crime', 'lowest-property-crime', 'highest-murder-rate', 'lowest-murder-rate',
    'highest-robbery-rate', 'highest-burglary-rate', 'highest-vehicle-theft', 'most-populous-cities', 'all',
  ];
  for (const r of baseRankings) {
    entries.push({ url: `${BASE}/rankings/${r}/`, lastModified: now, priority: 0.7 });
  }

  // State-specific rankings (51 states × 2 = 102)
  for (const { state } of states) {
    const stateSlug = state.toLowerCase().replace(/\s+/g, '-');
    entries.push({ url: `${BASE}/rankings/safest-cities-in-${stateSlug}/`, lastModified: now, priority: 0.6 });
    entries.push({ url: `${BASE}/rankings/most-dangerous-in-${stateSlug}/`, lastModified: now, priority: 0.6 });
  }

  // ALL city comparisons — C(361, 2) = 64,980 pairs
  const sortedSlugs = slugs.map(s => s.slug).sort();
  for (let i = 0; i < sortedSlugs.length; i++) {
    for (let j = i + 1; j < sortedSlugs.length; j++) {
      entries.push({ url: `${BASE}/compare/${sortedSlugs[i]}-vs-${sortedSlugs[j]}/`, lastModified: now, priority: 0.5 });
    }
  }

  return entries;
}
