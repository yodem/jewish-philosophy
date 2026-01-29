import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET(request: Request) {
  const origin = new URL(request.url).origin;
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || origin;
  const siteBase = baseUrl.replace(/\/$/, '');
  let logoSrc: string | null = null;

  try {
    const res = await fetch(`${siteBase}/favicon.ico`);
    if (res.ok) {
      const buf = await res.arrayBuffer();
      const bytes = new Uint8Array(buf);
      let binary = '';
      for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      const b64 = btoa(binary);
      const contentType = res.headers.get('content-type') || 'image/x-icon';
      logoSrc = `data:${contentType};base64,${b64}`;
    }
  } catch {
    // ignore
  }

  const siteTitle = 'שלום צדיק - פילוסופיה דתית';

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 32,
          background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
          direction: 'rtl',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        {logoSrc && (
          <img
            src={logoSrc}
            alt=""
            width={120}
            height={120}
            style={{ objectFit: 'contain' }}
          />
        )}
        <div style={{ fontSize: 42, fontWeight: 'bold', color: 'white' }}>
          {siteTitle}
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
