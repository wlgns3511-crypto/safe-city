import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { siteConfig } from '@/site.config';
import { getComparisonPair } from '@/lib/db';
import { breadcrumbSchema, faqSchema } from '@/lib/schema';
import { AdSlot } from '@/components/AdSlot';
import { AuthorBox } from '@/components/AuthorBox';
import { FreshnessTag } from '@/components/FreshnessTag';
import { InsightBox } from '@/components/InsightBox';
import { FAQ } from '@/components/FAQ';
import { Breadcrumb } from '@/components/Breadcrumb';
import { CrossSiteLinks } from '@/components/CrossSiteLinks';

const c = siteConfig;

interface Props { params: Promise<{ slugs: string }> }

export const dynamicParams = true;
export const revalidate = false;

function parseSlugs(slugs: string): [string, string] | null {
  const parts = slugs.split('-vs-');
  if (parts.length !== 2) return null;
  return [parts[0], parts[1]];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slugs } = await params;
  const parsed = parseSlugs(slugs);
  if (!parsed) return {};
  const pair = getComparisonPair(parsed[0], parsed[1]);
  if (!pair) return {};
  const nameA = String(pair.a[c.entity.nameColumn]);
  const nameB = String(pair.b[c.entity.nameColumn]);
  return {
    title: `${nameA} vs ${nameB} — ${c.entity.labelSingular} Comparison`,
    description: `Compare ${nameA} and ${nameB} side by side. Detailed data comparison from ${c.dataSource.name}.`,
    alternates: { canonical: `/compare/${slugs}` },
  };
}

export default async function ComparePage({ params }: Props) {
  const { slugs } = await params;
  const parsed = parseSlugs(slugs);
  if (!parsed) notFound();
  const pair = getComparisonPair(parsed[0], parsed[1]);
  if (!pair) notFound();

  const { a, b } = pair;
  const nameA = String(a[c.entity.nameColumn]);
  const nameB = String(b[c.entity.nameColumn]);

  const crumbs = [
    { name: 'Home', url: '/' },
    { name: 'Compare', url: '/compare/' },
    { name: `${nameA} vs ${nameB}`, url: `/compare/${slugs}` },
  ];

  const faqs = [
    { question: `How does ${nameA} compare to ${nameB}?`, answer: `See the detailed comparison table below for a full side-by-side analysis.` },
    { question: `Where does this data come from?`, answer: `All data is sourced from ${c.dataSource.name} (${c.dataSource.year}).` },
  ];

  // Get all comparable fields (numeric ones)
  const allKeys = [...new Set([...Object.keys(a), ...Object.keys(b)])].filter(
    k => !['id', 'slug', 'rowid'].includes(k)
  );

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema(crumbs)) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema(faqs)) }} />

      <Breadcrumb items={crumbs.map(cr => ({ label: cr.name, href: cr.url }))} />

      <h1 className="text-3xl font-bold mb-2">{nameA} vs {nameB}</h1>
      <p className="text-slate-500 mb-2">{c.entity.labelSingular} Comparison</p>
      <FreshnessTag source={c.dataSource.name} />

      <InsightBox title={`${nameA} vs ${nameB}`}
        insight={`Compare key metrics between ${nameA} and ${nameB}. Data sourced from ${c.dataSource.name} (${c.dataSource.year}).`}
      />

      <AdSlot id="top" />

      <div className="border rounded-lg overflow-hidden mt-6">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50">
              <th className="p-3 text-left font-semibold">Metric</th>
              <th className={`p-3 text-right font-semibold text-${c.colors.primary}-700`}>{nameA}</th>
              <th className={`p-3 text-right font-semibold text-${c.colors.accent}-700`}>{nameB}</th>
            </tr>
          </thead>
          <tbody>
            {allKeys.map(key => {
              const valA = a[key];
              const valB = b[key];
              const fmtA = typeof valA === 'number' ? valA.toLocaleString() : String(valA ?? 'N/A');
              const fmtB = typeof valB === 'number' ? valB.toLocaleString() : String(valB ?? 'N/A');
              return (
                <tr key={key} className="border-t">
                  <td className="p-3 text-slate-600 capitalize">{key.replace(/_/g, ' ')}</td>
                  <td className="p-3 text-right font-semibold">{fmtA}</td>
                  <td className="p-3 text-right font-semibold">{fmtB}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-6">
        <a href={`/${c.entity.slug}/${parsed[0]}/`} className={`p-4 border rounded-lg hover:bg-${c.colors.primary}-50 text-center font-bold text-${c.colors.primary}-700`}>
          {nameA} &rarr;
        </a>
        <a href={`/${c.entity.slug}/${parsed[1]}/`} className={`p-4 border rounded-lg hover:bg-${c.colors.accent}-50 text-center font-bold text-${c.colors.accent}-700`}>
          {nameB} &rarr;
        </a>
      </div>

      <AdSlot id="bottom" />
      <AuthorBox />
      <FAQ items={faqs} />
      <CrossSiteLinks current={c.name} />
    </>
  );
}
