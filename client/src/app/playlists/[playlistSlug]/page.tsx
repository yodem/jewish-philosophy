import React from 'react';
import VideoCard from '../../../components/blocks/VideoCard';
import Link from 'next/link';

async function getPlaylistBySlug(slug: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337'}/api/playlists?filters[slug][$eq]=${slug}&populate=videos`);
  const data = await res.json();
  return data.data?.[0] || null;
}

export default async function PlaylistDetailPage({ params }: { params: { playlistSlug: string } }) {
  const playlist = await getPlaylistBySlug(params.playlistSlug);
  if (!playlist) return <div>Playlist not found</div>;
  const videos = playlist.videos || [];
  return (
    <div className="py-8 px-2">
      <h2 className="text-2xl font-bold mb-6">{playlist.title}</h2>
      <div className="flex flex-wrap gap-6">
        {videos.map((video: any) => (
          <Link key={video.id} href={`/playlists/${params.playlistSlug}/${video.slug}`} className="no-underline">
            <VideoCard
              image={video.imageUrl300x400 || video.imageUrlStandard}
              title={video.title}
              cta="Watch Video"
            />
          </Link>
        ))}
      </div>
    </div>
  );
} 