import { ImageResponse } from 'next/og';
import { getPlaylistBySlug } from '@/data/loaders';
import { getImageUrl } from '@/lib/metadata';
import { getFaviconDataUrl } from '@/lib/og-favicon';
import { truncateForOg, wrapOgText } from '@/lib/seo-helpers';
import type { Playlist } from '@/types';

export const runtime = 'edge';
export const alt = 'סדרת שיעורים | שלום צדיק - פילוסופיה דתית';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

function Fallback() {
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#059669', color: 'white', fontSize: 32 }}>
      סדרות | שלום צדיק
    </div>
  );
}

export default async function Image({
  params,
}: {
  params: Promise<{ playlistSlug: string }>;
}) {
  const { playlistSlug } = await params;
  let playlist: Playlist | null = null;
  try {
    playlist = (await getPlaylistBySlug(playlistSlug)) as Playlist | null;
  } catch {
    return new ImageResponse(<Fallback />, { ...size });
  }
  if (!playlist) {
    return new ImageResponse(<Fallback />, { ...size });
  }

  const hasThumb = playlist.imageUrl300x400 || playlist.imageUrlStandard;
  const thumbUrl = hasThumb ? getImageUrl(playlist.imageUrl300x400 || playlist.imageUrlStandard) : null;
  const faviconUrl = thumbUrl ? null : (await getFaviconDataUrl()) || null;
  const title = truncateForOg(playlist.title, 50);
  const description = truncateForOg(playlist.description || 'סדרת שיעורים בפילוסופיה דתית', 120);
  const descLines = wrapOgText(description, 45);
  const videoCount = playlist.videos?.length ?? 0;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          background: '#ecfdf5',
          direction: 'rtl',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        {thumbUrl ? (
          <div style={{ display: 'flex', width: 520, flexShrink: 0 }}>
            <img
              src={thumbUrl}
              alt=""
              width={520}
              height={630}
              style={{ objectFit: 'cover' }}
            />
          </div>
        ) : (
          <div
            style={{
              width: 520,
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#d1fae5',
            }}
          >
            {faviconUrl && (
              <img
                src={faviconUrl}
                alt=""
                width={180}
                height={180}
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
            <div style={{ fontSize: 14, color: '#047857', marginBottom: 8 }}>
              סדרת שיעורים {videoCount > 0 ? `· ${videoCount} שיעורים` : ''} · שלום צדיק
            </div>
            <div
              style={{
                fontSize: 36,
                fontWeight: 'bold',
                color: '#064e3b',
                lineHeight: 1.2,
                marginBottom: 20,
              }}
            >
              {title}
            </div>
            {descLines.map((line, i) => (
              <div
                key={i}
                style={{
                  fontSize: 20,
                  color: '#065f46',
                  lineHeight: 1.4,
                  marginBottom: 4,
                }}
              >
                {line}
              </div>
            ))}
          </div>
          <div style={{ fontSize: 16, color: '#047857' }}>
            פילוסופיה דתית
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
