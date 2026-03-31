import { siteConfig } from '@/site.config';

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  publishedAt: string;
  updatedAt?: string;
  category: string;
  readingTime: number;
  content: string;
}

const c = siteConfig;

const posts: BlogPost[] = [
  {
    slug: 'how-to-use-data',
    title: `How to Use ${c.name} Data for Research`,
    description: `A guide to using ${c.name} for data-driven decisions.`,
    publishedAt: '2026-03-01',
    category: 'Guide',
    readingTime: 4,
    content: `<h2>Getting Started</h2><p>${c.name} provides free, verified data from ${c.dataSource.name}. Here is how to make the most of it.</p><h2>Search & Compare</h2><p>Use the search bar to find any ${c.entity.labelSingular.toLowerCase()}. Compare two items side by side using our comparison tool at <a href="/compare/">/compare</a>.</p><h2>Understanding the Data</h2><p>All data comes from ${c.dataSource.name} (${c.dataSource.year}). We update regularly to ensure accuracy. Check the "Last updated" tag on each page for freshness.</p><h2>Data Sources</h2><p>Visit our <a href="/methodology/">Methodology</a> page for detailed information about our data collection and verification process.</p>`,
  },
  {
    slug: 'methodology-explained',
    title: `Our Data Methodology — How ${c.name} Works`,
    description: `Transparency about how we collect, process, and present data.`,
    publishedAt: '2026-02-15',
    category: 'Transparency',
    readingTime: 3,
    content: `<h2>Data Collection</h2><p>We source data from ${c.dataSource.name}, a trusted public data provider. Raw data is downloaded, cleaned, and normalized for consistency.</p><h2>Processing</h2><p>Our automated pipeline removes outliers, fills gaps using statistical methods, and cross-references multiple sources where available.</p><h2>Quality Assurance</h2><p>Every data point is verified before publication. We display a "Live Data" freshness indicator on each page so you always know when data was last verified.</p>`,
  },
];

export function getAllPosts(): BlogPost[] {
  return [...posts].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

export function getPostBySlug(slug: string): BlogPost | undefined {
  return posts.find(p => p.slug === slug);
}

export function getAllCategories(): string[] {
  return [...new Set(posts.map(p => p.category))];
}
