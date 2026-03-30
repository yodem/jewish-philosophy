import { ImageResponse } from 'next/og';
import { getWritingBySlug } from '@/data/loaders';
import { extractTextFromMarkdown, truncateForOg, wrapOgText } from '@/lib/seo-helpers';
import { getImageUrl } from '@/lib/metadata';
import { generateOGImageResponse } from '@/lib/og-image-generator';

export const contentType = 'image/png';
export const revalidate = 86400; // Cache for 24 hours
export const size = { width: 1200, height: 630 };
export const alt = 'Writing OpenGraph image';

interface OpenGraphProps {
  params: Promise<{ slug: string }>;
}

export default async function Image({ params }: OpenGraphProps) {
  const { slug } = await params;
  const writing = await getWritingBySlug(slug);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://religousphilosophy.com';
  
  // Read local logo as ArrayBuffer to avoid loopback network request on Edge
  const logoData = await fetch(new URL('../../../../public/apple-touch-icon.png', import.meta.url)).then((res) => res.arrayBuffer());
  const logoSrc = `data:image/png;base64,${Buffer.from(logoData).toString('base64')}`;

  if (!writing) {
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
        כתב לא נמצא
      </div>
    );
  }

  const imageUrl = getImageUrl(writing.image?.url) || `${siteUrl}/opengraph-image.png`;
  const title = truncateForOg(writing.title, 74);
  const snippet = truncateForOg(extractTextFromMarkdown(writing.description || '', 210), 190);
  const lines = wrapOgText(snippet, 38);
  const typeLabel = writing.type === 'book' ? 'ספר' : 'מאמר';

  return await generateOGImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        background: 'linear-gradient(120deg, #0f172a 0%, #1e293b 100%)',
        color: '#f8fafc',
        direction: 'rtl',
        fontFamily: 'Rubik, Arial, sans-serif',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <img
        src={imageUrl}
        alt={title}
        width={500}
        height={630}
        style={{ objectFit: 'cover', display: 'flex', opacity: 0.95 }}
      />

      <div
        style={{
          width: 700,
          height: '100%',
          padding: '36px 42px',
          display: 'flex',
          flexDirection: 'column',
          background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.74) 0%, rgba(15, 23, 42, 0.92) 100%)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: 24, color: '#fbbf24', fontWeight: 700 }}>{`כתבים | ${typeLabel}`}</div>
          <img src={logoSrc} width={44} height={44} alt="logo" style={{ borderRadius: 8 }} />
        </div>

        <div style={{ marginTop: 20, fontSize: 52, lineHeight: 1.12, fontWeight: 800 }}>{title}</div>

        <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {lines.map((line, index) => (
            <div key={`${line}-${index}`} style={{ fontSize: 31, lineHeight: 1.28, color: '#e2e8f0' }}>
              {line}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
