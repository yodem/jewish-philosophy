import { ImageResponse } from 'next/og';
import { getResponsaBySlug } from '@/data/loaders';
import { getFaviconDataUrl } from '@/lib/og-favicon';
import { extractQuestionFromResponsa, truncateForOg, wrapOgText } from '@/lib/seo-helpers';

export const runtime = 'edge';
export const alt = 'שו״ת | שלום צדיק - פילוסופיה דתית';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

function Fallback() {
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#5b21b6', color: 'white', fontSize: 32 }}>
      שו״ת | שלום צדיק
    </div>
  );
}

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  let responsa: Awaited<ReturnType<typeof getResponsaBySlug>> = null;
  try {
    responsa = await getResponsaBySlug(slug);
  } catch {
    return new ImageResponse(<Fallback />, { ...size });
  }
  if (!responsa) {
    return new ImageResponse(<Fallback />, { ...size });
  }

  const faviconUrl = await getFaviconDataUrl();
  const title = truncateForOg(responsa.title, 55);
  const questionPreview = extractQuestionFromResponsa(responsa.content, 280);
  const questionLines = wrapOgText(questionPreview, 48);

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          background: '#f5f3ff',
          padding: 48,
          direction: 'rtl',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, gap: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <div
              style={{
                width: 100,
                height: 100,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#e9e5ff',
                borderRadius: 16,
                flexShrink: 0,
              }}
            >
              {faviconUrl && (
                <img
                  src={faviconUrl}
                  alt=""
                  width={70}
                  height={70}
                  style={{ objectFit: 'contain' }}
                />
              )}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 16, color: '#6d28d9', marginBottom: 8 }}>
                שאלות ותשובות · שלום צדיק
              </div>
              <div style={{ fontSize: 32, fontWeight: 'bold', color: '#1e1b4b', lineHeight: 1.2 }}>
                {title}
              </div>
            </div>
          </div>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              background: 'white',
              padding: 32,
              borderRadius: 12,
              border: '2px solid #e9e5ff',
            }}
          >
            <div style={{ fontSize: 16, color: '#6d28d9', marginBottom: 12, fontWeight: 'bold' }}>
              השאלה:
            </div>
            {questionLines.map((line, i) => (
              <div
                key={i}
                style={{ fontSize: 20, color: '#4c1d95', lineHeight: 1.5, marginBottom: 4 }}
              >
                {line}
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
