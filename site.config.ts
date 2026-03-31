import type { SiteConfig } from './lib/types';

const DATAPEEK_SITES = [
  'https://vocabwize.com', 'https://vocablibre.com', 'https://wortwize.com',
  'https://kalimawize.com', 'https://dicionariowize.com', 'https://kotobapeek.com',
  'https://salarybycity.com', 'https://netpaypeek.com', 'https://wagepeek.com',
  'https://costbycity.com', 'https://fairrentwize.com', 'https://propertytaxpeek.com',
  'https://degreewize.com', 'https://nameblooms.com', 'https://myschoolpeek.com',
  'https://medcheckwize.com', 'https://medcostpeek.com', 'https://eldercarepeek.com',
  'https://ingredipeek.com', 'https://caloriewize.com', 'https://powerbillpeek.com',
  'https://sunpowerpeek.com', 'https://shipcalcwize.com', 'https://tariffpeek.com',
  'https://visapeek.com', 'https://zippeek.com', 'https://calcpeek.com',
  'https://datapeekfacts.com', 'https://guidebycity.com',
];

export const siteConfig: SiteConfig = {
  // ── Basic Info ──────────────────────────────────────────
  name: 'SafeCityPeek',
  domain: 'safecitypeek.com',
  description: 'Compare crime rates, safety scores, and incident data for 400+ US cities. Violent crime, property crime, and per capita rates powered by FBI UCR data.',

  // ── Theme ───────────────────────────────────────────────
  colors: { primary: 'slate', accent: 'amber' },
  lang: 'en',
  locale: 'en-US',

  // ── Data Entity ─────────────────────────────────────────
  entity: {
    slug: 'city',
    label: 'Cities',
    labelSingular: 'City',
    dbPath: './data/main.db',
    tableName: 'cities',
    slugColumn: 'slug',
    nameColumn: 'name',
    categoryColumn: 'state',
  },

  // ── Monetization ────────────────────────────────────────
  gaId: 'G-569DEDYVP8',
  adsenseId: 'ca-pub-5724806562146685',

  // ── Network ─────────────────────────────────────────────
  sameAs: DATAPEEK_SITES,

  // ── Data Source ─────────────────────────────────────────
  dataSource: {
    name: 'FBI Uniform Crime Reporting (UCR) Program',
    url: 'https://cde.ucr.cjis.gov/',
    year: 2023,
  },
};
