import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { siteConfig } from '@/site.config';
import { getBySlug, getRelated, getAllSlugs, getSimilarItems } from '@/lib/db';
import { breadcrumbSchema, faqSchema } from '@/lib/schema';
import { AdSlot } from '@/components/AdSlot';
import { AuthorBox } from '@/components/AuthorBox';
import { FreshnessTag } from '@/components/FreshnessTag';
import { InsightBox } from '@/components/InsightBox';
import { DataSourceBadge } from '@/components/DataSourceBadge';
import { CrossSiteLinks } from '@/components/CrossSiteLinks';
import { FAQ } from '@/components/FAQ';
import { Breadcrumb } from '@/components/Breadcrumb';

const c = siteConfig;

interface Props { params: Promise<{ slug: string }> }

export const dynamicParams = true;
export const revalidate = false;

export async function generateStaticParams() {
  return getAllSlugs().slice(0, 50).map(s => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const item = getBySlug(slug);
  if (!item) return {};
  const name = String(item[c.entity.nameColumn]);
  const cat = c.entity.categoryColumn ? String(item[c.entity.categoryColumn] || '') : '';
  return {
    title: `${name} — ${c.entity.labelSingular} Data & Insights (${new Date().getFullYear()})`,
    description: `${name}${cat ? ` (${cat})` : ''}: Explore detailed data, comparisons, and insights. Verified data from ${c.dataSource.name}.`,
    alternates: { canonical: `/${c.entity.slug}/${slug}` },
  };
}

// ── Hero color by category hash (Anti-Spam: visual uniqueness) ──
const HERO_COLORS = [
  { bg: 'bg-blue-600', text: 'text-blue-100' },
  { bg: 'bg-indigo-600', text: 'text-indigo-100' },
  { bg: 'bg-emerald-600', text: 'text-emerald-100' },
  { bg: 'bg-rose-600', text: 'text-rose-100' },
  { bg: 'bg-amber-600', text: 'text-amber-100' },
  { bg: 'bg-teal-600', text: 'text-teal-100' },
  { bg: 'bg-violet-600', text: 'text-violet-100' },
  { bg: 'bg-orange-600', text: 'text-orange-100' },
];

function getHeroColor(category: string) {
  const hash = category.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return HERO_COLORS[hash % HERO_COLORS.length];
}

// ── Per-item unique one-liner (Anti-Spam: unique content) ────
function getItemInsight(name: string, category: string): string {
  return `${name} is a notable ${c.entity.labelSingular.toLowerCase()}${category ? ` in the ${category} category` : ''}. This page provides verified data from ${c.dataSource.name} (${c.dataSource.year}), helping you compare ${name} against similar ${c.entity.label.toLowerCase()} and make data-driven decisions.`;
}

export default async function EntityDetailPage({ params }: Props) {
  const { slug } = await params;
  const item = getBySlug(slug);
  if (!item) notFound();

  const name = String(item[c.entity.nameColumn]);
  const category = c.entity.categoryColumn ? String(item[c.entity.categoryColumn] || '') : '';
  const related = category ? getRelated(category, slug, 6) : [];
  const hero = getHeroColor(category || name);

  // ── Collect numeric columns for "Similar Items" mesh ──
  const numericEntries = Object.entries(item).filter(
    ([k, v]) => typeof v === 'number' && k !== 'id' && k !== 'population'
  );
  const firstNumeric = numericEntries[0];
  const similarItems = firstNumeric
    ? getSimilarItems(firstNumeric[0], firstNumeric[1] as number, slug, 5)
    : [];

  const crumbs = [
    { name: 'Home', url: '/' },
    ...(category ? [{ name: category, url: `/search?q=${encodeURIComponent(category)}` }] : []),
    { name, url: `/${c.entity.slug}/${slug}` },
  ];

  const faqs = [
    { question: `What is ${name}?`, answer: `${name} is a ${c.entity.labelSingular.toLowerCase()}${category ? ` in the ${category} category` : ''} tracked in our database with detailed statistics and comparisons.` },
    { question: `Where does the data for ${name} come from?`, answer: `All data is sourced from ${c.dataSource.name} (${c.dataSource.year}). We verify and update our data regularly.` },
    { question: `How does ${name} compare to others?`, answer: `You can compare ${name} with similar ${c.entity.label.toLowerCase()} using our comparison tool. Check the "Similar ${c.entity.label}" section below for the closest matches.` },
  ];

  // Filter display columns (hide internal fields)
  const displayFields = Object.entries(item).filter(
    ([k]) => !['id', 'slug', 'rowid'].includes(k)
  );

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema(crumbs)) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema(faqs)) }} />

      <Breadcrumb items={crumbs.map(cr => ({ label: cr.name, href: cr.url }))} />

      {/* ── Hero (color varies by category = anti-spam) ────── */}
      <div className={`${hero.bg} rounded-xl p-6 mb-6 -mx-1`}>
        <h1 className="text-3xl font-bold text-white mb-1">{name}</h1>
        {category && <p className={`${hero.text} text-sm`}>{category}</p>}
        <p className={`${hero.text} text-sm mt-3 leading-relaxed`}>
          {getItemInsight(name, category)}
        </p>
      </div>

      <FreshnessTag source={c.dataSource.name} />

      <AdSlot id="top" />

      {/* ── Data Table ──────────────────────────────────────── */}
      <section className="mt-6 border rounded-lg overflow-hidden">
        <h2 className="text-xl font-semibold p-4 bg-slate-50 border-b">Data Overview</h2>
        <table className="w-full text-sm">
          <tbody>
            {displayFields.map(([key, value]) => (
              <tr key={key} className="border-b border-slate-100">
                <td className="p-3 text-slate-600 capitalize">{key.replace(/_/g, ' ')}</td>
                <td className="p-3 text-right font-semibold">{typeof value === 'number' ? value.toLocaleString() : String(value ?? 'N/A')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* ── Why It Matters (E-E-A-T) ─────────────────────── */}
      <InsightBox
        title={name}
        insight={`This data helps you understand how ${name} compares to others${category ? ` in the ${category} category` : ''}. Use it to make informed decisions based on verified data from ${c.dataSource.name}.`}
      />

      {/* ── Internal Mesh: Same Category ─────────────────── */}
      {related.length > 0 && (
        <section className="mt-8">
          <h2 className="text-xl font-bold mb-3">Related {c.entity.label}{category ? ` in ${category}` : ''}</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {related.map(r => (
              <a key={String(r[c.entity.slugColumn])} href={`/${c.entity.slug}/${r[c.entity.slugColumn]}/`}
                className={`block p-3 border rounded-lg hover:bg-${c.colors.primary}-50 text-sm font-medium text-${c.colors.primary}-700`}>
                {String(r[c.entity.nameColumn])}
              </a>
            ))}
          </div>
        </section>
      )}

      {/* ── Internal Mesh: Similar (cross-category!) ─────── */}
      {similarItems.length > 0 && (
        <section className="mt-8">
          <h2 className="text-xl font-bold mb-3">Similar {c.entity.label}</h2>
          <p className="text-sm text-slate-500 mb-3">{c.entity.label} with the closest data values to {name}</p>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {similarItems.map(r => (
              <a key={String(r[c.entity.slugColumn])} href={`/${c.entity.slug}/${r[c.entity.slugColumn]}/`}
                className="block p-3 border rounded-lg hover:bg-blue-50 text-sm text-center">
                <span className="font-medium text-blue-700">{String(r[c.entity.nameColumn])}</span>
                {c.entity.categoryColumn && (
                  <span className="block text-xs text-slate-400">{String(r[c.entity.categoryColumn] ?? '')}</span>
                )}
              </a>
            ))}
          </div>
        </section>
      )}

      {/* ── Compare Links ────────────────────────────────── */}
      {(similarItems.length > 0 || related.length > 0) && (
        <section className="mt-6">
          <h2 className="text-lg font-bold mb-2">Compare {name} With</h2>
          <div className="flex flex-wrap gap-2">
            {[...similarItems.slice(0, 3), ...related.slice(0, 2)].map(r => (
              <a key={String(r[c.entity.slugColumn])} href={`/compare/${slug}-vs-${r[c.entity.slugColumn]}/`}
                className={`px-4 py-2 border rounded-full text-sm hover:bg-${c.colors.primary}-50 text-${c.colors.primary}-700 font-medium`}>
                {name} vs {String(r[c.entity.nameColumn])}
              </a>
            ))}
          </div>
        </section>
      )}

      <AdSlot id="bottom" />
      <DataSourceBadge />
      <AuthorBox />
      <FAQ items={faqs} />
      <CrossSiteLinks current={c.name} />
    </>
  );
}
