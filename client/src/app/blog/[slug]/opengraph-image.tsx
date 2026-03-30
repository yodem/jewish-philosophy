import { ImageResponse } from 'next/og';
import { getBlogBySlug } from '@/data/loaders';
import { generateBlogDescription, truncateForOg, wrapOgText } from '@/lib/seo-helpers';
import { getStrapiMediaEntryUrl, resolveStrapiAssetUrl } from '@/lib/strapi-media';
import { generateOGImageResponse } from '@/lib/og-image-generator';

export const runtime = 'edge';
export const contentType = 'image/png';
export const revalidate = 86400; // Cache for 24 hours
export const size = { width: 1200, height: 630 };
export const alt = 'Blog OpenGraph image';

interface OpenGraphProps {
  params: Promise<{ slug: string }>;
}

export default async function Image({ params }: OpenGraphProps) {
  const { slug } = await params;
  const blog = await getBlogBySlug(slug);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://religousphilosophy.com';
  
  // Read local logo as ArrayBuffer to avoid loopback network request on Edge
  const logoData = await fetch(new URL('../../../../public/apple-touch-icon.png', import.meta.url)).then((res) => res.arrayBuffer());
  const logoSrc = `data:image/png;base64,${Buffer.from(logoData).toString('base64')}`;

  if (!blog) {
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
        פוסט לא נמצא
      </div>
    );
  }

  const title = truncateForOg(blog.title, 72);
  const description = truncateForOg(generateBlogDescription(blog), 190);
  const lines = wrapOgText(description, 34);
  const coverPath = getStrapiMediaEntryUrl(blog.coverImage);
  const coverUrl = resolveStrapiAssetUrl(coverPath) || `${siteUrl}/opengraph-image.png`;

  return await generateOGImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        background: '#0f172a',
        color: '#f8fafc',
        direction: 'rtl',
        fontFamily: 'Rubik, Arial, sans-serif',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <img
        src={coverUrl}
        alt={title}
        width={760}
        height={630}
        style={{ objectFit: 'cover', display: 'flex' }}
      />

      <div
        style={{
          width: 440,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          padding: '30px 30px 28px',
          background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.88) 0%, rgba(15, 23, 42, 0.96) 100%)',
          borderRight: '1px solid rgba(148, 163, 184, 0.25)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: 24, color: '#fbbf24', fontWeight: 700 }}>בלוג</div>
          <img src={logoSrc} width={42} height={42} alt="logo" style={{ borderRadius: 8 }} />
        </div>

        <div style={{ marginTop: 18, fontSize: 46, lineHeight: 1.15, fontWeight: 800 }}>{title}</div>

        <div style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {lines.map((line, index) => (
            <div key={`${line}-${index}`} style={{ fontSize: 29, lineHeight: 1.3, color: '#e2e8f0' }}>
              {line}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
