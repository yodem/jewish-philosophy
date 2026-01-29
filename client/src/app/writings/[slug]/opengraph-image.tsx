import { ImageResponse } from 'next/og';
import { getWritingBySlug } from '@/data/loaders';
import { getImageUrl } from '@/lib/metadata';
import { getFaviconDataUrl } from '@/lib/og-favicon';
import { truncateForOg, wrapOgText } from '@/lib/seo-helpers';

export const runtime = 'edge';
export const alt = 'כתבים | שלום צדיק - פילוסופיה דתית';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

function Fallback() {
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#c2410c', color: 'white', fontSize: 32 }}>
      כתבים | שלום צדיק
    </div>
  );
}

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  let writing: Awaited<ReturnType<typeof getWritingBySlug>> = null;
  try {
    writing = await getWritingBySlug(slug);
  } catch {
    return new ImageResponse(<Fallback />, { ...size });
  }
  if (!writing) {
    return new ImageResponse(<Fallback />, { ...size });
  }

  const title = truncateForOg(writing.title, 50);
  const description = truncateForOg(writing.description || 'כתב בפילוסופיה דתית', 140);
  const imageUrl = writing.image?.url ? getImageUrl(writing.image.url) : null;
  const descLines = wrapOgText(description, 45);
  const categories = writing.categories?.slice(0, 3).map((c: { name: string }) => c.name) || [];
  const faviconUrl = imageUrl ? null : (await getFaviconDataUrl()) || null;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          background: '#fff7ed',
          direction: 'rtl',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        {imageUrl ? (
          <div style={{ display: 'flex', width: 380, flexShrink: 0 }}>
            <img
              src={imageUrl}
              alt=""
              width={380}
              height={630}
              style={{ objectFit: 'cover' }}
            />
          </div>
        ) : (
          <div
            style={{
              width: 380,
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#ffedd5',
            }}
          >
            {faviconUrl && (
              <img
                src={faviconUrl}
                alt=""
                width={160}
                height={160}
                style={{ objectFit: 'contain' }}
              />
            )}
          </div>
        )}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            padding: 40,
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ fontSize: 14, color: '#9a3412', marginBottom: 8 }}>
              כתבים · שלום צדיק
            </div>
            <div
              style={{
                fontSize: 34,
                fontWeight: 'bold',
                color: '#431407',
                lineHeight: 1.2,
                marginBottom: 16,
              }}
            >
              {title}
            </div>
            {descLines.map((line, i) => (
              <div
                key={i}
                style={{
                  fontSize: 20,
                  color: '#7c2d12',
                  lineHeight: 1.4,
                  marginBottom: 4,
                }}
              >
                {line}
              </div>
            ))}
          </div>
          {categories.length > 0 && (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {categories.map((name: string) => (
                <span
                  key={name}
                  style={{
                    fontSize: 14,
                    padding: '6px 12px',
                    background: '#fed7aa',
                    color: '#9a3412',
                    borderRadius: 6,
                  }}
                >
                  {name}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    ),
    { ...size }
  );
}
