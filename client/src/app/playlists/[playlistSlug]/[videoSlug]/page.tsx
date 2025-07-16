import React from 'react';
import Link from 'next/link';

async function getPlaylistAndVideos(playlistSlug: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337'}/api/playlists?filters[slug][$eq]=${playlistSlug}&populate=videos`);
  const data = await res.json();
  return data.data?.[0] || null;
}

async function getVideoBySlug(videoSlug: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337'}/api/videos?filters[slug][$eq]=${videoSlug}`);
  const data = await res.json();
  return data.data?.[0] || null;
}

export default async function VideoDetailPage({ params }: { params: { playlistSlug: string, videoSlug: string } }) {
  const playlist = await getPlaylistAndVideos(params.playlistSlug);
  const video = await getVideoBySlug(params.videoSlug);
  if (!playlist || !video) return <div>Video or playlist not found</div>;
  const videos = playlist.videos || [];
  const currentVideoId = video.videoId;
  return (
    <div className="flex flex-col md:flex-row gap-12 bg-gray-50 min-h-screen py-10 px-4">
      <div className="flex-1 max-w-3xl">
        <h2 className="text-2xl font-bold mb-6">{video.title}</h2>
        <div className="mb-8 bg-black rounded-2xl overflow-hidden shadow-lg">
          <iframe
            width="100%"
            height="450"
            src={`https://www.youtube.com/embed/${currentVideoId}`}
            title={video.title}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full min-w-[320px] min-h-[320px] h-[450px] bg-black"
          />
        </div>
        <p className="text-gray-700 text-lg leading-relaxed bg-white rounded-xl p-6 shadow-md">{video.description}</p>
      </div>
      <aside className="w-full md:w-80 bg-white rounded-2xl p-6 h-fit shadow-lg">
        <h4 className="mb-6 text-xl text-blue-700 font-bold">Playlist Videos</h4>
        <ul className="space-y-4">
          {videos.map((v: any) => (
            <li key={v.id}>
              <Link href={`/playlists/${params.playlistSlug}/${v.slug}`} className="no-underline">
                <div
                  className={`flex items-center gap-4 px-3 py-2 rounded-lg transition-colors ${v.id === video.id ? 'bg-blue-50 text-blue-700 font-bold shadow' : 'hover:bg-gray-100 text-gray-900'}`}
                >
                  <img
                    src={v.imageUrl300x400 || v.imageUrlStandard || '/public/file.svg'}
                    alt={v.title}
                    className="w-16 h-10 object-cover rounded-md shadow-sm"
                  />
                  <span className="text-base truncate max-w-[140px]">{v.title}</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </aside>
    </div>
  );
} 