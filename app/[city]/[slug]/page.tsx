import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { siteConfig } from '@/site.config';
import { getBySlug, getRelated, getAllSlugs, getSimilarItems } from '@/lib/db';
import { breadcrumbSchema, faqSchema } from '@/lib/schema';
import { AdSlot } from '@/components/AdSlot';
import { AuthorBox } from '@/components/AuthorBox';
import { FreshnessTag } from '@/components/FreshnessTag';
import { InsightBox } from '@/components/InsightBox';
import { CrossSiteLinks } from '@/components/CrossSiteLinks';
import { FAQ } from '@/components/FAQ';
import { Breadcrumb } from '@/components/Breadcrumb';

const c = siteConfig;

interface Props { params: Promise<{ slug: string }> }

export const dynamicParams = true;
export const revalidate = false;

export async function generateStaticParams() {
  return getAllSlugs().map(s => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const city = getBySlug(slug);
  if (!city) return {};
  const name = String(city.name);
  const state = String(city.state);
  const score = city.safety_score as number;
  const title = `${name}, ${state} Crime Rates & Safety Score (${new Date().getFullYear()})`;
  const description = `${name}, ${state}: Safety score ${score}/100. Violent crime rate ${(city.violent_crime_rate as number).toFixed(0)}, property crime rate ${(city.property_crime_rate as number).toFixed(0)} per 100K. FBI UCR data.`;
  return { title, description, alternates: { canonical: `/city/${slug}` }, openGraph: { title, description, url: `/city/${slug}` } };
}

// Safety score color
function scoreColor(score: number) {
  if (score >= 70) return { bg: 'bg-green-600', text: 'text-green-100', badge: 'text-green-700 bg-green-50', label: 'Very Safe' };
  if (score >= 50) return { bg: 'bg-emerald-600', text: 'text-emerald-100', badge: 'text-emerald-700 bg-emerald-50', label: 'Moderately Safe' };
  if (score >= 30) return { bg: 'bg-amber-600', text: 'text-amber-100', badge: 'text-amber-700 bg-amber-50', label: 'Below Average' };
  return { bg: 'bg-red-600', text: 'text-red-100', badge: 'text-red-700 bg-red-50', label: 'High Crime' };
}

function fmt(n: number) { return n.toLocaleString('en-US', { maximumFractionDigits: 1 }); }
function fmtInt(n: number) { return n.toLocaleString('en-US'); }

function getCityInsight(name: string, state: string, score: number, violent: number, property: number, pop: number): string {
  const safetyLevel = score >= 70 ? 'one of the safer cities in the US'
    : score >= 50 ? 'a city with moderate safety levels'
    : score >= 30 ? 'a city with above-average crime rates'
    : 'one of the higher-crime cities in the US';

  const violentDesc = violent > 800 ? 'significantly above the national average'
    : violent > 400 ? 'above the national average'
    : violent > 200 ? 'near the national average'
    : 'well below the national average';

  return `${name}, ${state} is ${safetyLevel}, with a safety score of ${score}/100. The violent crime rate of ${fmt(violent)} per 100K is ${violentDesc} (US avg: ~380). With a population of ${fmtInt(pop)}, ${name} reported ${fmtInt(Math.round(violent * pop / 100000))} violent crimes and ${fmtInt(Math.round(property * pop / 100000))} property crimes in 2023.`;
}

export default async function CityPage({ params }: Props) {
  const { slug } = await params;
  const city = getBySlug(slug);
  if (!city) notFound();

  const name = String(city.name);
  const state = String(city.state);
  const score = city.safety_score as number;
  const violent = city.violent_crime_rate as number;
  const property = city.property_crime_rate as number;
  const total = city.total_crime_rate as number;
  const pop = city.population as number;
  const sc = scoreColor(score);

  const related = getRelated(state, slug, 6);
  const similarSafety = getSimilarItems('safety_score', score, slug, 5);

  const crumbs = [
    { name: 'Home', url: '/' },
    { name: state, url: `/search?q=${encodeURIComponent(state)}` },
    { name, url: `/city/${slug}` },
  ];

  const faqs = [
    { question: `Is ${name}, ${state} safe?`, answer: `${name} has a safety score of ${score}/100. ${score >= 50 ? 'It is considered relatively safe.' : 'It has higher-than-average crime rates.'} The violent crime rate is ${fmt(violent)} per 100,000 residents.` },
    { question: `What is the crime rate in ${name}?`, answer: `The total crime rate in ${name} is ${fmt(total)} per 100K. This includes a violent crime rate of ${fmt(violent)} and a property crime rate of ${fmt(property)} per 100K residents.` },
    { question: `What types of crime are most common in ${name}?`, answer: `Property crimes (${fmtInt(city.property_crimes as number)} incidents) are more common than violent crimes (${fmtInt(city.violent_crimes as number)} incidents). Larceny/theft is typically the most frequent crime type.` },
    { question: `How does ${name} compare to other cities in ${state}?`, answer: `Check the "Other Cities in ${state}" section below, or use our comparison tool to compare ${name} with any other city in our database.` },
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema(crumbs)) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema(faqs)) }} />

      <Breadcrumb items={crumbs.map(cr => ({ label: cr.name, href: cr.url }))} />

      {/* Hero */}
      <div className={`${sc.bg} rounded-xl p-6 mb-6 -mx-1`}>
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-3xl font-bold text-white">{name}, {state}</h1>
          <span className={`px-3 py-1 rounded-full text-sm font-bold ${sc.badge}`}>{score}/100</span>
        </div>
        <p className={`${sc.text} text-sm font-medium`}>{sc.label} &middot; Population: {fmtInt(pop)}</p>
        <p className={`${sc.text} text-sm mt-3 leading-relaxed`}>
          {getCityInsight(name, state, score, violent, property, pop)}
        </p>
      </div>

      <FreshnessTag source={c.dataSource.name} />

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className={`${sc.badge} rounded-lg p-4 text-center`}>
          <div className="text-2xl font-bold">{score}</div>
          <div className="text-xs mt-1 opacity-70">Safety Score</div>
        </div>
        <div className="bg-red-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-red-700">{fmt(violent)}</div>
          <div className="text-xs text-slate-500 mt-1">Violent Crime / 100K</div>
        </div>
        <div className="bg-amber-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-amber-700">{fmt(property)}</div>
          <div className="text-xs text-slate-500 mt-1">Property Crime / 100K</div>
        </div>
        <div className="bg-slate-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-slate-700">{fmt(total)}</div>
          <div className="text-xs text-slate-500 mt-1">Total Crime / 100K</div>
        </div>
      </div>

      <AdSlot id="top" />

      {/* Violent Crime Breakdown */}
      <section className="mt-8 border rounded-lg overflow-hidden">
        <h2 className="text-xl font-semibold p-4 bg-red-50 border-b text-red-800">Violent Crime</h2>
        <table className="w-full text-sm">
          <tbody>
            <tr className="border-b"><td className="p-3 text-slate-600">Murder & Manslaughter</td><td className="p-3 text-right font-semibold">{fmt(city.murder_rate as number)} <span className="text-xs text-slate-400">per 100K</span></td></tr>
            <tr className="border-b"><td className="p-3 text-slate-600">Rape</td><td className="p-3 text-right font-semibold">{fmt(city.rape_rate as number)} <span className="text-xs text-slate-400">per 100K</span></td></tr>
            <tr className="border-b"><td className="p-3 text-slate-600">Robbery</td><td className="p-3 text-right font-semibold">{fmt(city.robbery_rate as number)} <span className="text-xs text-slate-400">per 100K</span></td></tr>
            <tr><td className="p-3 text-slate-600">Aggravated Assault</td><td className="p-3 text-right font-semibold">{fmt(city.assault_rate as number)} <span className="text-xs text-slate-400">per 100K</span></td></tr>
          </tbody>
        </table>
      </section>

      {/* Property Crime Breakdown */}
      <section className="mt-6 border rounded-lg overflow-hidden">
        <h2 className="text-xl font-semibold p-4 bg-amber-50 border-b text-amber-800">Property Crime</h2>
        <table className="w-full text-sm">
          <tbody>
            <tr className="border-b"><td className="p-3 text-slate-600">Burglary</td><td className="p-3 text-right font-semibold">{fmt(city.burglary_rate as number)} <span className="text-xs text-slate-400">per 100K</span></td></tr>
            <tr className="border-b"><td className="p-3 text-slate-600">Larceny / Theft</td><td className="p-3 text-right font-semibold">{fmt(city.larceny_rate as number)} <span className="text-xs text-slate-400">per 100K</span></td></tr>
            <tr><td className="p-3 text-slate-600">Motor Vehicle Theft</td><td className="p-3 text-right font-semibold">{fmt(city.vehicle_theft_rate as number)} <span className="text-xs text-slate-400">per 100K</span></td></tr>
          </tbody>
        </table>
      </section>

      {/* Incident Totals */}
      <section className="mt-6 border rounded-lg overflow-hidden">
        <h2 className="text-xl font-semibold p-4 bg-slate-50 border-b">Incident Totals ({String(city.year)})</h2>
        <table className="w-full text-sm">
          <tbody>
            <tr className="border-b"><td className="p-3 text-slate-600">Violent Crimes</td><td className="p-3 text-right font-semibold">{fmtInt(city.violent_crimes as number)}</td></tr>
            <tr className="border-b"><td className="p-3 text-slate-600">Property Crimes</td><td className="p-3 text-right font-semibold">{fmtInt(city.property_crimes as number)}</td></tr>
            <tr><td className="p-3 text-slate-600">Total Crimes</td><td className="p-3 text-right font-semibold">{fmtInt(city.total_crimes as number)}</td></tr>
          </tbody>
        </table>
      </section>

      <InsightBox
        title={name}
        insight={`With a safety score of ${score}/100, ${name} ${score >= 50 ? 'is safer than the average US city' : 'has higher crime rates than the national average'}. ${violent > 400 ? 'Violent crime is a notable concern — ' : ''}Property crime accounts for ${((property / total) * 100).toFixed(0)}% of all reported crimes.`}
      />

      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 my-6 text-sm">
        <p className="text-slate-600">
          <strong>Related:</strong> Planning a move? Check <a href="https://costbycity.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">cost of living</a> and <a href="https://guidebycity.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">city guides</a> for this area.
        </p>
      </div>

      {/* Same State */}
      {related.length > 0 && (
        <section className="mt-8">
          <h2 className="text-xl font-bold mb-3">Other Cities in {state}</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {related.map(r => (
              <a key={String(r.slug)} href={`/city/${r.slug}/`}
                className="block p-3 border rounded-lg hover:bg-slate-50 text-sm">
                <span className="font-medium text-slate-700">{String(r.name)}</span>
                <span className="block text-xs text-slate-400 mt-1">Safety: {String(r.safety_score)}/100</span>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* Similar Safety Score */}
      <section className="mt-8">
        <h2 className="text-xl font-bold mb-3">Cities with Similar Safety Scores</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          {similarSafety.map(r => (
            <a key={String(r.slug)} href={`/city/${r.slug}/`}
              className="block p-3 border rounded-lg hover:bg-blue-50 text-sm text-center">
              <span className="font-medium text-blue-700">{String(r.name)}</span>
              <span className="block text-xs text-slate-400">{String(r.state)}</span>
              <span className="block text-slate-600 mt-1 font-semibold">{String(r.safety_score)}/100</span>
            </a>
          ))}
        </div>
      </section>

      {/* Compare Links */}
      <section className="mt-6">
        <h2 className="text-lg font-bold mb-2">Compare {name} With</h2>
        <div className="flex flex-wrap gap-2">
          {[...similarSafety.slice(0, 3), ...related.slice(0, 2)].map(r => (
            <a key={String(r.slug)} href={`/compare/${[slug, String(r.slug)].sort().join('-vs-')}/`}
              className="px-4 py-2 border rounded-full text-sm hover:bg-slate-50 text-slate-700 font-medium">
              {name} vs {String(r.name)}
            </a>
          ))}
        </div>
      </section>

      <AdSlot id="bottom" />
      <AuthorBox />
      <FAQ items={faqs} />
      <CrossSiteLinks current={c.name} />
    </>
  );
}
