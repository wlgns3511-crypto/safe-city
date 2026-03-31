export interface SiteConfig {
  // Basic
  name: string;
  domain: string;
  description: string;
  tagline?: string;

  // Theme
  colors: { primary: string; accent: string };
  lang: string;
  locale: string;
  targetLangs?: string[];

  // Data Entity
  entity: {
    slug: string;
    label: string;
    labelSingular: string;
    dbPath: string;
    tableName: string;
    slugColumn: string;
    nameColumn: string;
    categoryColumn: string | null;
    compareFields?: string[];
  };

  // Monetization
  gaId: string;
  adsenseId: string;

  // Network
  sameAs: string[];

  // Data Source
  dataSource: {
    name: string;
    url: string;
    year: number;
  };
}

export interface Entity {
  slug: string;
  name: string;
  category: string | null;
  [key: string]: unknown;
}
