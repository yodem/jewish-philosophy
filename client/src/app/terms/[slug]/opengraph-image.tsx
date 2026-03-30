import { ImageResponse } from 'next/og';
import { getTermBySlug } from '@/data/loaders';
import { truncateForOg, wrapOgText } from '@/lib/seo-helpers';
import { generateOGImageResponse } from '@/lib/og-image-generator';

export const runtime = 'edge';
export const contentType = 'image/png';
export const revalidate = 86400; // Cache for 24 hours
export const size = { width: 1200, height: 630 };
export const alt = 'Term OpenGraph image';

interface OpenGraphProps {
  params: Promise<{ slug: string }>;
}

export default async function Image({ params }: OpenGraphProps) {
  const { slug } = await params;
  const term = await getTermBySlug(slug);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://religousphilosophy.com';
  
  // Read local logo as ArrayBuffer to avoid loopback network request on Edge
  const logoData = await fetch(new URL('../../../../public/apple-touch-icon.png', import.meta.url)).then((res) => res.arrayBuffer());
  const logoSrc = `data:image/png;base64,${Buffer.from(logoData).toString('base64')}`;

  if (!term) {
    return await generateOGImageResponse(
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(120deg, #0f172a 0%, #1e293b 100%)',
          color: '#f8fafc',
          fontSize: 58,
          fontWeight: 700,
        }}
      >
        מושג לא נמצא
      </div>
    );
  }

  const title = truncateForOg(term.title, 80);
  const description = truncateForOg(term.description || '', 220);
  const lines = wrapOgText(description, 43);

  return await generateOGImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: 'linear-gradient(125deg, #082f49 0%, #0f172a 45%, #1e293b 100%)',
        color: '#f8fafc',
        direction: 'rtl',
        padding: '46px 54px',
        fontFamily: 'Rubik, Arial, sans-serif',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontSize: 26, color: '#93c5fd', fontWeight: 700 }}>מושגים</div>
        <img src={logoSrc} width={48} height={48} alt="logo" style={{ borderRadius: 10 }} />
      </div>

      <div style={{ marginTop: 30, fontSize: 64, lineHeight: 1.1, fontWeight: 800 }}>{title}</div>

      <div style={{ marginTop: 26, display: 'flex', flexDirection: 'column', gap: 9, maxWidth: '92%' }}>
        {lines.map((line, index) => (
          <div key={`${line}-${index}`} style={{ fontSize: 33, lineHeight: 1.34, color: '#e2e8f0' }}>
            {line}
          </div>
        ))}
      </div>
    </div>
  );
}
