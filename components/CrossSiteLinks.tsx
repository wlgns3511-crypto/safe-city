import { siteConfig } from '@/site.config';

// Auto-generate site list from sameAs config
function getSites() {
  return siteConfig.sameAs
    .filter(url => !url.includes(siteConfig.domain))
    .map(url => {
      const domain = new URL(url).hostname;
      const name = domain
        .replace('.com', '')
        .replace(/(peek|wize|data|by)/gi, (m) => m.charAt(0).toUpperCase() + m.slice(1))
        .replace(/^./, c => c.toUpperCase());
      return { name, url };
    });
}

export function CrossSiteLinks({ current }: { current: string }) {
  const sites = getSites().filter(s => s.name !== current).slice(0, 12);

  return (
    <div className="mt-10 pt-6 border-t border-slate-100">
      <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-3">Explore the DataPeek Network</p>
      <div className="flex flex-wrap gap-x-4 gap-y-1.5">
        {sites.map((s) => (
          <a key={s.url} href={s.url} className="text-xs text-slate-500 hover:text-blue-600 transition-colors" target="_blank" rel="noopener noreferrer">
            {s.name}
          </a>
        ))}
      </div>
    </div>
  );
}
