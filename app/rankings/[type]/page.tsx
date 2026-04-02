import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { siteConfig } from '@/site.config';
import { getAll, getCategories } from '@/lib/db';
import { itemListSchema } from '@/lib/schema';
import { AdSlot } from '@/components/AdSlot';
import { AuthorBox } from '@/components/AuthorBox';
import { FreshnessTag } from '@/components/FreshnessTag';
import { Breadcrumb } from '@/components/Breadcrumb';
import { CrossSiteLinks } from '@/components/CrossSiteLinks';
import Database from 'better-sqlite3';
import path from 'path';

const c = siteConfig;
const DB_PATH = path.join(process.cwd(), c.entity.dbPath);

interface Ranking {
  title: string;
  desc: string;
  column: string;
  dir: 'ASC' | 'DESC';
  label: string;
  state?: string;
}

// Base rankings
const BASE_RANKINGS: Record<string, Ranking> = {
  'safest-cities': { title: 'Safest Cities in America', desc: 'US cities ranked by highest safety score based on FBI UCR crime data.', column: 'safety_score', dir: 'DESC', label: 'Safety Score' },
  'most-dangerous-cities': { title: 'Most Dangerous Cities in America', desc: 'US cities with the highest total crime rates per 100,000 residents.', column: 'total_crime_rate', dir: 'DESC', label: 'Total Crime Rate' },
  'highest-violent-crime': { title: 'Highest Violent Crime Cities', desc: 'US cities ranked by violent crime rate (murder, rape, robbery, assault) per 100K.', column: 'violent_crime_rate', dir: 'DESC', label: 'Violent Crime / 100K' },
  'lowest-violent-crime': { title: 'Lowest Violent Crime Cities', desc: 'Safest US cities by violent crime rate per 100,000 residents.', column: 'violent_crime_rate', dir: 'ASC', label: 'Violent Crime / 100K' },
  'highest-property-crime': { title: 'Highest Property Crime Cities', desc: 'US cities with the most property crime (burglary, theft, vehicle theft) per 100K.', column: 'property_crime_rate', dir: 'DESC', label: 'Property Crime / 100K' },
  'lowest-property-crime': { title: 'Lowest Property Crime Cities', desc: 'US cities with the least property crime per 100,000 residents.', column: 'property_crime_rate', dir: 'ASC', label: 'Property Crime / 100K' },
  'highest-murder-rate': { title: 'Highest Murder Rate Cities', desc: 'US cities ranked by murder and manslaughter rate per 100K.', column: 'murder_rate', dir: 'DESC', label: 'Murder Rate' },
  'lowest-murder-rate': { title: 'Lowest Murder Rate Cities', desc: 'US cities with the lowest murder rate per 100,000.', column: 'murder_rate', dir: 'ASC', label: 'Murder Rate' },
  'highest-robbery-rate': { title: 'Highest Robbery Rate Cities', desc: 'US cities ranked by robbery rate per 100,000 residents.', column: 'robbery_rate', dir: 'DESC', label: 'Robbery Rate' },
  'highest-burglary-rate': { title: 'Highest Burglary Rate Cities', desc: 'US cities ranked by burglary rate per 100,000 residents.', column: 'burglary_rate', dir: 'DESC', label: 'Burglary Rate' },
  'highest-vehicle-theft': { title: 'Highest Vehicle Theft Cities', desc: 'US cities ranked by motor vehicle theft rate per 100K.', column: 'vehicle_theft_rate', dir: 'DESC', label: 'Vehicle Theft Rate' },
  'most-populous-cities': { title: 'Largest Cities by Population', desc: 'Biggest US cities in our crime database ranked by population.', column: 'population', dir: 'DESC', label: 'Population' },
  'all': { title: 'All Cities', desc: 'Browse all cities in our crime database.', column: 'name', dir: 'ASC', label: 'Name' },
};

// Generate state-specific rankings
function getAllRankings(): Record<string, Ranking> {
  const db = new Database(DB_PATH, { readonly: true });
  const states = db.prepare('SELECT DISTINCT state FROM cities ORDER BY state').all() as { state: string }[];
  db.close();

  const all: Record<string, Ranking> = { ...BASE_RANKINGS };

  for (const { state } of states) {
    const stateSlug = state.toLowerCase().replace(/\s+/g, '-');
    all[`safest-cities-in-${stateSlug}`] = {
      title: `Safest Cities in ${state}`,
      desc: `Cities in ${state} ranked by safety score based on FBI UCR data.`,
      column: 'safety_score', dir: 'DESC', label: 'Safety Score', state,
    };
    all[`most-dangerous-in-${stateSlug}`] = {
      title: `Most Dangerous Cities in ${state}`,
      desc: `Cities in ${state} with the highest crime rates per 100K.`,
      column: 'total_crime_rate', dir: 'DESC', label: 'Total Crime Rate', state,
    };
  }

  return all;
}

const ALL_RANKINGS = getAllRankings();

interface Props { params: Promise<{ type: string }> }
export const dynamicParams = false;
export const revalidate = false;

export function generateStaticParams() {
  return Object.keys(ALL_RANKINGS).map(type => ({ type }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { type } = await params;
  const r = ALL_RANKINGS[type];
  if (!r) return {};
  return { title: r.title, description: r.desc, alternates: { canonical: `/rankings/${type}` }, openGraph: { title: r.title, description: r.desc, url: `/rankings/${type}` } };
}

function fmtValue(col: string, val: number): string {
  if (col === 'population') return val.toLocaleString();
  if (col === 'name') return '';
  if (col === 'safety_score') return `${val}/100`;
  return val.toLocaleString('en-US', { maximumFractionDigits: 1 });
}

export default async function RankingPage({ params }: Props) {
  const { type } = await params;
  const r = ALL_RANKINGS[type];
  if (!r) notFound();

  const db = new Database(DB_PATH, { readonly: true });
  const stateFilter = r.state ? ' AND state = ?' : '';
  const stateParams = r.state ? [r.state] : [];
  const items = db.prepare(
    `SELECT * FROM cities WHERE ${r.column} IS NOT NULL${stateFilter} ORDER BY ${r.column} ${r.dir} LIMIT 50`
  ).all(...stateParams) as Record<string, unknown>[];
  db.close();

  if (items.length === 0) notFound();

  const listItems = items.map(item => ({ name: String(item.name), url: `/city/${item.slug}/` }));
  const crumbs = [{ name: 'Home', url: '/' }, { name: 'Rankings', url: '/rankings/safest-cities' }, { name: r.title, url: `/rankings/${type}` }];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema(r.title, `/rankings/${type}`, listItems)) }} />
      <Breadcrumb items={crumbs.map(cr => ({ label: cr.name, href: cr.url }))} />
      <h1 className="text-3xl font-bold mb-2">{r.title}</h1>
      <p className="text-slate-600 mb-4">{r.desc}</p>
      <FreshnessTag source={c.dataSource.name} />
      <AdSlot id="top" />
      <div className="border rounded-lg overflow-hidden mt-4">
        <div className="flex justify-between p-3 bg-slate-50 text-sm font-semibold"><span>City</span><span>{r.label}</span></div>
        {items.map((item, i) => (
          <a key={String(item.slug)} href={`/city/${item.slug}/`}
            className="flex justify-between items-center p-3 hover:bg-slate-50 border-b border-slate-100 text-sm">
            <span>
              <span className="text-slate-400 mr-2">{i + 1}.</span>
              {String(item.name)} <span className="text-slate-400">({String(item.state)})</span>
            </span>
            <span className="font-semibold text-slate-700">{fmtValue(r.column, item[r.column] as number)}</span>
          </a>
        ))}
      </div>
      <AdSlot id="bottom" />
      <AuthorBox />
      <CrossSiteLinks current={c.name} />
    </>
  );
}
