import { ImageResponse } from 'next/og';
import { getBlogBySlug } from '@/data/loaders';
import { getImageUrl } from '@/lib/metadata';
import { getFaviconDataUrl } from '@/lib/og-favicon';
import { generateBlogDescription, truncateForOg, wrapOgText } from '@/lib/seo-helpers';
import type { Category } from '@/types';

export const runtime = 'edge';
export const alt = 'בלוג | שלום צדיק - פילוסופיה דתית';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

function Fallback() {
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#1e40af', color: 'white', fontSize: 32 }}>
      בלוג | שלום צדיק
    </div>
  );
}

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  let blog: Awaited<ReturnType<typeof getBlogBySlug>> = null;
  try {
    blog = await getBlogBySlug(slug);
  } catch {
    return new ImageResponse(<Fallback />, { ...size });
  }
  if (!blog) {
    return new ImageResponse(<Fallback />, { ...size });
  }

  const title = truncateForOg(blog.title, 50);
  const description = truncateForOg(
    blog.description || generateBlogDescription(blog),
    120
  );
  const coverUrl = blog.coverImage?.url ? getImageUrl(blog.coverImage.url) : null;
  const categories = blog.categories?.slice(0, 3).map((c: Category) => c.name) || [];
  const descLines = wrapOgText(description, 42);
  const faviconUrl = coverUrl ? null : (await getFaviconDataUrl()) || null;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          background: '#f8fafc',
          direction: 'rtl',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        {coverUrl ? (
          <div style={{ display: 'flex', width: 420, flexShrink: 0 }}>
            <img
              src={coverUrl}
              alt=""
              width={420}
              height={630}
              style={{ objectFit: 'cover' }}
            />
          </div>
        ) : (
          <div
            style={{
              width: 420,
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#e2e8f0',
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
            <div style={{ fontSize: 14, color: '#64748b', marginBottom: 8 }}>
              בלוג · שלום צדיק
            </div>
            <div
              style={{
                fontSize: 36,
                fontWeight: 'bold',
                color: '#0f172a',
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
                  color: '#475569',
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
                    background: '#e2e8f0',
                    color: '#475569',
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
