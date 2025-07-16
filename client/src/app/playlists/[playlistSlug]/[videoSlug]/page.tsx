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
    <aside className="w-full md:w-96 bg-white rounded-2xl p-6 h-fit shadow-lg max-h-[80vh] overflow-y-auto">
      <h4 className="mb-6 text-xl font-bold text-gray-800">
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
                  className="w-20 h-[45px] object-cover rounded-md shadow-sm"
                />
                <span className="text-sm font-medium">{v.title}</span>
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
      <div className="container mx-auto p-4 flex flex-col md:flex-row gap-8">
        <div className="flex-1">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Playlists", href: "/playlists" },
              { label: playlist.title, href: `/playlists/${playlistSlug}` },
              { label: video.title },
            ]}
          />
          <YoutubePlayer videoId={video.videoId} title={video.title} />
          <div className="bg-white rounded-2xl p-6 shadow-lg mt-8">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">
              About this video
            </h2>
            <p className="text-gray-700 leading-relaxed">{video.description}</p>
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