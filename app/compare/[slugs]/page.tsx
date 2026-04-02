import { notFound, redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { siteConfig } from '@/site.config';
import { getComparisonPair, getAllSlugs } from '@/lib/db';
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

export const dynamicParams = false;
export const revalidate = false;

export async function generateStaticParams() {
  const slugs = getAllSlugs().map(s => s.slug).sort();
  const params: { slugs: string }[] = [];
  // Top 50 cities → C(50,2) = 1,225 pairs
  const top = slugs.slice(0, 50);
  for (let i = 0; i < top.length; i++) {
    for (let j = i + 1; j < top.length; j++) {
      params.push({ slugs: `${top[i]}-vs-${top[j]}` });
    }
  }
  return params;
}

function parseSlugs(slugs: string): [string, string] | null {
  const idx = slugs.indexOf('-vs-');
  if (idx === -1) return null;
  return [slugs.substring(0, idx), slugs.substring(idx + 4)];
}

function fmt(n: number) { return n.toLocaleString('en-US', { maximumFractionDigits: 1 }); }
function fmtInt(n: number) { return n.toLocaleString('en-US'); }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slugs } = await params;
  const parsed = parseSlugs(slugs);
  if (!parsed) return {};
  const pair = getComparisonPair(parsed[0], parsed[1]);
  if (!pair) return {};
  const nameA = String(pair.a.name), nameB = String(pair.b.name);
  const title = `${nameA} vs ${nameB} — Crime Rate & Safety Comparison (${new Date().getFullYear()})`;
  const description = `Compare crime rates: ${nameA} (safety ${pair.a.safety_score}/100) vs ${nameB} (safety ${pair.b.safety_score}/100). Violent crime, property crime, and safety scores side by side.`;
  return { title, description, alternates: { canonical: `/compare/${slugs}` }, openGraph: { title, description, url: `/compare/${slugs}` } };
}

export default async function ComparePage({ params }: Props) {
  const { slugs } = await params;
  const parsed = parseSlugs(slugs);
  if (!parsed) notFound();

  // Canonical redirect
  const canonical = [parsed[0], parsed[1]].sort().join('-vs-');
  if (canonical !== slugs) redirect(`/compare/${canonical}/`);

  const pair = getComparisonPair(parsed[0], parsed[1]);
  if (!pair) notFound();

  const { a, b } = pair;
  const nameA = String(a.name), nameB = String(b.name);
  const stateA = String(a.state), stateB = String(b.state);
  const scoreA = a.safety_score as number, scoreB = b.safety_score as number;
  const safer = scoreA > scoreB ? nameA : nameB;

  const crumbs = [
    { name: 'Home', url: '/' },
    { name: 'Compare', url: '/compare/' },
    { name: `${nameA} vs ${nameB}`, url: `/compare/${slugs}` },
  ];

  const faqs = [
    { question: `Is ${nameA} or ${nameB} safer?`, answer: `${safer} is safer with a safety score of ${Math.max(scoreA, scoreB)}/100 vs ${Math.min(scoreA, scoreB)}/100.` },
    { question: `Which city has more violent crime?`, answer: `${nameA} has a violent crime rate of ${fmt(a.violent_crime_rate as number)}/100K vs ${fmt(b.violent_crime_rate as number)}/100K in ${nameB}.` },
  ];

  const metrics = [
    { label: 'Safety Score', key: 'safety_score', fmt: (v: number) => `${v}/100`, highlight: true },
    { label: 'Violent Crime Rate', key: 'violent_crime_rate', fmt, invert: true },
    { label: 'Property Crime Rate', key: 'property_crime_rate', fmt, invert: true },
    { label: 'Total Crime Rate', key: 'total_crime_rate', fmt, invert: true },
    { label: 'Murder Rate', key: 'murder_rate', fmt, invert: true },
    { label: 'Robbery Rate', key: 'robbery_rate', fmt, invert: true },
    { label: 'Assault Rate', key: 'assault_rate', fmt, invert: true },
    { label: 'Burglary Rate', key: 'burglary_rate', fmt, invert: true },
    { label: 'Larceny Rate', key: 'larceny_rate', fmt, invert: true },
    { label: 'Vehicle Theft Rate', key: 'vehicle_theft_rate', fmt, invert: true },
    { label: 'Population', key: 'population', fmt: fmtInt },
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema(crumbs)) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema(faqs)) }} />

      <Breadcrumb items={crumbs.map(cr => ({ label: cr.name, href: cr.url }))} />

      <h1 className="text-3xl font-bold mb-2">{nameA} vs {nameB}</h1>
      <p className="text-slate-500 mb-2">Crime Rate & Safety Comparison</p>
      <FreshnessTag source={c.dataSource.name} />

      <InsightBox title={`${nameA} vs ${nameB}`}
        insight={`${safer} is the safer city with a safety score of ${Math.max(scoreA, scoreB)}/100. ${nameA} has a violent crime rate of ${fmt(a.violent_crime_rate as number)}/100K compared to ${fmt(b.violent_crime_rate as number)}/100K in ${nameB}.`}
      />

      <AdSlot id="top" />

      <div className="border rounded-lg overflow-hidden mt-6">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50">
              <th className="p-3 text-left font-semibold">Metric</th>
              <th className="p-3 text-right font-semibold text-slate-700">{nameA}<br /><span className="font-normal text-xs text-slate-400">{stateA}</span></th>
              <th className="p-3 text-right font-semibold text-amber-700">{nameB}<br /><span className="font-normal text-xs text-slate-400">{stateB}</span></th>
            </tr>
          </thead>
          <tbody>
            {metrics.map(m => {
              const valA = a[m.key] as number;
              const valB = b[m.key] as number;
              // For crime rates, lower is better (invert). For safety score, higher is better.
              const aWins = m.invert ? valA < valB : valA > valB;
              const bWins = m.invert ? valB < valA : valB > valA;
              return (
                <tr key={m.key} className="border-t">
                  <td className="p-3 text-slate-600">{m.label}</td>
                  <td className={`p-3 text-right font-semibold ${aWins ? 'text-green-600' : ''}`}>{m.fmt(valA)}</td>
                  <td className={`p-3 text-right font-semibold ${bWins ? 'text-green-600' : ''}`}>{m.fmt(valB)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-6">
        <a href={`/city/${parsed[0]}/`} className="p-4 border rounded-lg hover:bg-slate-50 text-center font-bold text-slate-700">{nameA} details &rarr;</a>
        <a href={`/city/${parsed[1]}/`} className="p-4 border rounded-lg hover:bg-amber-50 text-center font-bold text-amber-700">{nameB} details &rarr;</a>
      </div>

      <AdSlot id="bottom" />
      <AuthorBox />
      <FAQ items={faqs} />
      <CrossSiteLinks current={c.name} />
    </>
  );
}
