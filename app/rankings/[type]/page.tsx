import type { Metadata } from 'next';
import { siteConfig } from '@/site.config';
import { getAll } from '@/lib/db';
import { itemListSchema } from '@/lib/schema';
import { AdSlot } from '@/components/AdSlot';
import { AuthorBox } from '@/components/AuthorBox';
import { FreshnessTag } from '@/components/FreshnessTag';
import { Breadcrumb } from '@/components/Breadcrumb';
import { CrossSiteLinks } from '@/components/CrossSiteLinks';

const c = siteConfig;

// Define rankings in your site — customize this per project
const RANKINGS: Record<string, { title: string; desc: string; column: string; dir: 'ASC' | 'DESC' }> = {
  'all': { title: `All ${c.entity.label}`, desc: `Browse all ${c.entity.label.toLowerCase()} in our database.`, column: c.entity.nameColumn, dir: 'ASC' },
};

interface Props { params: Promise<{ type: string }> }
export const dynamicParams = true;
export const revalidate = false;

export function generateStaticParams() {
  return Object.keys(RANKINGS).map(type => ({ type }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { type } = await params;
  const r = RANKINGS[type];
  if (!r) return {};
  return { title: r.title, description: r.desc, alternates: { canonical: `/rankings/${type}` } };
}

export default async function RankingPage({ params }: Props) {
  const { type } = await params;
  const r = RANKINGS[type] || RANKINGS['all'];
  const items = getAll(50);
  const listItems = items.map(item => ({ name: String(item[c.entity.nameColumn]), url: `/${c.entity.slug}/${item[c.entity.slugColumn]}/` }));
  const crumbs = [{ name: 'Home', url: '/' }, { name: 'Rankings', url: '/rankings/' }, { name: r.title, url: `/rankings/${type}` }];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema(r.title, `/rankings/${type}`, listItems)) }} />
      <Breadcrumb items={crumbs.map(cr => ({ label: cr.name, href: cr.url }))} />
      <h1 className="text-3xl font-bold mb-2">{r.title}</h1>
      <p className="text-slate-600 mb-4">{r.desc}</p>
      <FreshnessTag source={c.dataSource.name} />
      <AdSlot id="top" />
      <div className="border rounded-lg overflow-hidden mt-4">
        {items.map((item, i) => (
          <a key={String(item[c.entity.slugColumn])} href={`/${c.entity.slug}/${item[c.entity.slugColumn]}/`}
            className={`flex justify-between items-center p-3 hover:bg-${c.colors.primary}-50 border-b border-slate-100 text-sm`}>
            <span><span className="text-slate-400 mr-2">{i + 1}.</span>{String(item[c.entity.nameColumn])}</span>
          </a>
        ))}
      </div>
      <AdSlot id="bottom" />
      <AuthorBox />
      <CrossSiteLinks current={c.name} />
    </>
  );
}
