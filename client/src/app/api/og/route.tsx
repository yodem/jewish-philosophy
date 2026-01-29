import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'פילוסופיה דתית - פלטפורמה ללימוד פילוסופיה דתית מקוונת עם שלום צדיק';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
          padding: 48,
          direction: 'rtl',
        }}
      >
        <div
          style={{
            fontSize: 64,
            fontWeight: 'bold',
            color: 'white',
            textAlign: 'center',
            lineHeight: 1.2,
          }}
        >
          שלום צדיק
        </div>
        <div
          style={{
            fontSize: 36,
            color: 'rgba(255,255,255,0.95)',
            textAlign: 'center',
            marginTop: 16,
          }}
        >
          פילוסופיה דתית
        </div>
        <div
          style={{
            fontSize: 24,
            color: 'rgba(255,255,255,0.85)',
            textAlign: 'center',
            marginTop: 12,
          }}
        >
          פלטפורמה ללימוד פילוסופיה דתית
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
