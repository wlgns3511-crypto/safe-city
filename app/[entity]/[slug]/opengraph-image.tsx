import { ImageResponse } from 'next/og';
import { siteConfig } from '@/site.config';
import { getBySlug } from '@/lib/db';

export const runtime = 'edge';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const colorMap: Record<string, string> = {
  blue: '#2563eb', red: '#dc2626', green: '#16a34a', purple: '#9333ea',
  indigo: '#4f46e5', teal: '#0d9488', orange: '#ea580c', amber: '#d97706',
  emerald: '#059669', rose: '#e11d48', violet: '#7c3aed', cyan: '#0891b2', slate: '#475569',
};

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = getBySlug(slug);
  const name = item ? String(item[siteConfig.entity.nameColumn]) : slug;
  const bg = colorMap[siteConfig.colors.primary] || '#2563eb';

  return new ImageResponse(
    (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', backgroundColor: bg, color: 'white', fontFamily: 'sans-serif' }}>
        <div style={{ fontSize: 28, opacity: 0.7, marginBottom: 8 }}>{siteConfig.name}</div>
        <div style={{ fontSize: 64, fontWeight: 800, textAlign: 'center', maxWidth: '80%' }}>{name}</div>
        <div style={{ fontSize: 24, opacity: 0.8, marginTop: 12 }}>{siteConfig.entity.labelSingular} Data & Insights</div>
      </div>
    ),
    { ...size }
  );
}
