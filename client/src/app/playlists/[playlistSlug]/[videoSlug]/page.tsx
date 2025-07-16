import BackButton from "@/components/BackButton";
import HeroSection from "@/components/blocks/HeroSection";
import YoutubePlayer from "@/components/YoutubePlayer";
import { getPlaylistBySlug, getVideoBySlug } from "@/data/loaders";
import type { HeroSectionProps, Playlist, Video } from "@/types";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import Breadcrumbs from "@/components/Breadcrumbs";

async function PlaylistSidebar({
  playlist,
  currentVideoId,
  playlistSlug,
}: {
  playlist: Playlist;
  currentVideoId: number;
  playlistSlug: string;
}) {
  const videos: Video[] = playlist.videos || [];
  return (
    <aside style={{ width: '100%', maxWidth: 384, background: 'white', borderRadius: 24, padding: 24, height: 'fit-content', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', maxHeight: '80vh', overflowY: 'auto' }}>
      <h4 style={{ marginBottom: 24, fontSize: 20, fontWeight: 700, color: '#1f2937' }}>
        In this playlist
      </h4>
      <ul className="space-y-4">
        {videos.map((v) => (
          <li key={v.id}>
            <Link
              href={`/playlists/${playlistSlug}/${v.slug}`}
              className="no-underline"
            >
              <div
                className={`flex items-center gap-4 px-3 py-2 rounded-lg transition-colors duration-200 hover:bg-gray-100 ${
                  v.id === currentVideoId
                    ? "bg-blue-50 text-blue-700 font-bold"
                    : "text-gray-900"
                }`}
              >
                <Image
                  src={v.imageUrl300x400 || v.imageUrlStandard}
                  alt={v.title}
                  width={80}
                  height={45}
                  style={{ width: 80, height: 45, objectFit: 'cover', borderRadius: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}
                />
                <span style={{ fontSize: 14, fontWeight: 500 }}>{v.title}</span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  );
}

export default async function VideoDetailPage({
  params,
}: {
  params: { playlistSlug: string; videoSlug: string } | Promise<{ playlistSlug: string; videoSlug: string }>;
}) {
  let resolvedParams: { playlistSlug: string; videoSlug: string };
  if (params instanceof Promise) {
    resolvedParams = await params;
  } else {
    resolvedParams = params;
  }
  const { playlistSlug, videoSlug } = resolvedParams;
  const video = (await getVideoBySlug(videoSlug)) as Video | null;
  const playlist = (await getPlaylistBySlug(playlistSlug)) as Playlist | null;

  if (!video || !playlist) {
    return notFound();
  }

  const videoImage = video.imageUrl300x400 || video.imageUrlStandard;

  const heroData: HeroSectionProps = {
    id: video.id,
    __component: "blocks.hero-section",
    theme: "orange",
    heading: video.title,
    image: {
      id: video.id, // NOTE: This is not correct, but we don't have a separate image id.
      documentId: "",
      url: videoImage,
      alternativeText: video.title,
    },
    darken: true,
  };

  return (
    <main>
      <HeroSection data={heroData} />
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 32 }}>
        <div style={{ flex: 1 }}>
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Playlists", href: "/playlists" },
              { label: playlist.title, href: `/playlists/${playlistSlug}` },
              { label: video.title },
            ]}
          />
          <YoutubePlayer videoId={video.videoId} title={video.title} />
          <div style={{ background: 'white', borderRadius: 24, padding: 24, boxShadow: '0 4px 24px rgba(0,0,0,0.08)', marginTop: 32 }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 16, color: '#1f2937' }}>
              About this video
            </h2>
            <p style={{ color: '#374151', lineHeight: 1.6 }}>{video.description}</p>
          </div>
        </div>
        <PlaylistSidebar
          playlist={playlist}
          currentVideoId={video.id}
          playlistSlug={playlistSlug}
        />
      </div>
    </main>
  );
} 