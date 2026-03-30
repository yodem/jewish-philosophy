import { ImageResponse } from 'next/og';
import { getResponsaBySlug } from '@/data/loaders';
import { extractQuestionFromResponsa, truncateForOg, wrapOgText } from '@/lib/seo-helpers';
import { generateOGImageResponse } from '@/lib/og-image-generator';

export const contentType = 'image/png';
export const revalidate = 86400; // Cache for 24 hours
export const size = { width: 1200, height: 630 };
export const alt = 'Responsa OpenGraph image';

interface OpenGraphProps {
  params: Promise<{ slug: string }>;
}

export default async function Image({ params }: OpenGraphProps) {
  const { slug } = await params;
  const responsa = await getResponsaBySlug(slug);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://religousphilosophy.com';
  
  // Read local logo as ArrayBuffer to avoid loopback network request on Edge
  const logoData = await fetch(new URL('../../../../public/apple-touch-icon.png', import.meta.url)).then((res) => res.arrayBuffer());
  const logoSrc = `data:image/png;base64,${Buffer.from(logoData).toString('base64')}`;

  if (!responsa) {
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
        שאלה לא נמצאה
      </div>
    );
  }

  const title = truncateForOg(responsa.title, 82);
  const excerpt = truncateForOg(extractQuestionFromResponsa(responsa.content, 240), 220);
  const lines = wrapOgText(excerpt, 44);

  return await generateOGImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: 'linear-gradient(120deg, #0f172a 0%, #1e293b 55%, #334155 100%)',
        color: '#f8fafc',
        direction: 'rtl',
        padding: '46px 54px',
        position: 'relative',
        fontFamily: 'Rubik, Arial, sans-serif',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontSize: 28, color: '#fbbf24', fontWeight: 700 }}>שאלות ותשובות</div>
        <img src={logoSrc} width={50} height={50} alt="logo" style={{ borderRadius: 10 }} />
      </div>

      <div style={{ marginTop: 28, fontSize: 62, lineHeight: 1.15, fontWeight: 800, maxWidth: '100%' }}>
        {title}
      </div>

      <div style={{ marginTop: 28, display: 'flex', flexDirection: 'column', gap: 10, maxWidth: '92%' }}>
        {lines.map((line, index) => (
          <div key={`${line}-${index}`} style={{ fontSize: 34, lineHeight: 1.35, color: '#e2e8f0' }}>
            {line}
          </div>
        ))}
      </div>
    </div>
  );
}
