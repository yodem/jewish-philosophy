import { ImageResponse } from 'next/og';
import { getVideoBySlug, getPlaylistBySlug } from '@/data/loaders';
import { getImageUrl } from '@/lib/metadata';
import { getFaviconDataUrl } from '@/lib/og-favicon';
import { truncateForOg, wrapOgText } from '@/lib/seo-helpers';
import type { Video, Playlist } from '@/types';

export const runtime = 'edge';
export const alt = 'שיעור וידאו | שלום צדיק - פילוסופיה דתית';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

function Fallback() {
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#dc2626', color: 'white', fontSize: 32 }}>
      שיעור וידאו | שלום צדיק
    </div>
  );
}

export default async function Image({
  params,
}: {
  params: Promise<{ playlistSlug: string; videoSlug: string }>;
}) {
  const { playlistSlug, videoSlug } = await params;
  let video: Video | null = null;
  let playlist: Playlist | null = null;
  try {
    video = (await getVideoBySlug(videoSlug)) as Video | null;
    playlist = (await getPlaylistBySlug(playlistSlug)) as Playlist | null;
  } catch {
    return new ImageResponse(<Fallback />, { ...size });
  }
  if (!video || !playlist) {
    return new ImageResponse(<Fallback />, { ...size });
  }

  const hasThumb = video.imageUrl300x400 || video.imageUrlStandard;
  const thumbUrl = hasThumb ? getImageUrl(video.imageUrl300x400 || video.imageUrlStandard) : null;
  const faviconUrl = thumbUrl ? null : (await getFaviconDataUrl()) || null;
  const videoTitle = truncateForOg(video.title, 55);
  const playlistTitle = truncateForOg(playlist.title, 40);
  const description = video.description ? truncateForOg(video.description, 100) : '';
  const descLines = description ? wrapOgText(description, 35) : [];

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          background: '#0f172a',
          direction: 'rtl',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        {thumbUrl ? (
          <div style={{ display: 'flex', width: 630, flexShrink: 0, position: 'relative' }}>
            <img
              src={thumbUrl}
              alt=""
              width={630}
              height={630}
              style={{ objectFit: 'cover' }}
            />
            <div
              style={{
                position: 'absolute',
                bottom: 16,
                right: 16,
                background: 'rgba(0,0,0,0.75)',
                color: 'white',
                padding: '6px 12px',
                borderRadius: 6,
                fontSize: 18,
                fontWeight: 'bold',
              }}
            >
              ▶ שיעור וידאו
            </div>
          </div>
        ) : (
          <div
            style={{
              width: 630,
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#1e293b',
            }}
          >
            {faviconUrl && (
              <img
                src={faviconUrl}
                alt=""
                width={200}
                height={200}
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
            justifyContent: 'center',
          }}
        >
          <div style={{ fontSize: 16, color: '#94a3b8', marginBottom: 12 }}>
            {playlistTitle}
          </div>
          <div
            style={{
              fontSize: 36,
              fontWeight: 'bold',
              color: 'white',
              lineHeight: 1.2,
              marginBottom: descLines.length > 0 ? 16 : 0,
            }}
          >
            {videoTitle}
          </div>
          {descLines.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {descLines.map((line, i) => (
                <div key={i} style={{ fontSize: 18, color: '#cbd5e1', lineHeight: 1.4 }}>
                  {line}
                </div>
              ))}
            </div>
          )}
          <div style={{ fontSize: 18, color: '#94a3b8', marginTop: 16 }}>
            פילוסופיה דתית · שלום צדיק
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
