import { getWritingBySlug } from '@/data/loaders';
import { truncateForOg, wrapOgText } from '@/lib/seo-helpers';
import { OG_SIZE, OG_CONTENT_TYPE, createFallback, generateOGImageResponse } from '@/lib/og-image-generator';

export const runtime = 'edge';
export const alt = 'כתבים | שלום צדיק - פילוסופיה דתית';
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

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
    return generateOGImageResponse(createFallback('כתבים | שלום צדיק', '#c2410c'));
  }
  if (!writing) {
    return generateOGImageResponse(createFallback('כתבים | שלום צדיק', '#c2410c'));
  }

  if (writing.type !== 'book') {
    return new Response(null, { status: 404 });
  }

  const title = truncateForOg(writing.title, 50);
  const description = truncateForOg(writing.description || 'כתב בפילוסופיה דתית', 140);
  const descLines = wrapOgText(description, 45);
  const categories = writing.categories?.slice(0, 3).map((c: { name: string }) => c.name) || [];

  return generateOGImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#fff7ed',
        direction: 'rtl',
        fontFamily: 'system-ui, sans-serif',
        flexDirection: 'column',
        padding: 40,
        textAlign: 'center',
      }}
    >
      <div style={{ fontSize: 14, color: '#9a3412', marginBottom: 8 }}>
        כתבים &middot; שלום צדיק
      </div>
      <div
        style={{
          fontSize: 38,
          fontWeight: 'bold',
          color: '#431407',
          lineHeight: 1.2,
          marginBottom: 16,
          maxWidth: '100%',
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
      {categories.length > 0 && (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 16, justifyContent: 'center' }}>
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
  );
}
