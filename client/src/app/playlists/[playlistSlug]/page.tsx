import BackButton from "@/components/BackButton";
import HeroSection from "@/components/blocks/HeroSection";
import VideoCard from "@/components/blocks/VideoCard";
import Breadcrumbs from "@/components/Breadcrumbs";
import VideosCarousel from "@/components/VideosCarousel";
import PlaylistsCarousel from "@/components/PlaylistsCarousel";
import { getPlaylistBySlug, getAllPlaylists } from "@/data/loaders";
import type { HeroSectionProps, Playlist, Video } from "@/types";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function PlaylistDetailPage({ params }: { params: { playlistSlug: string } | Promise<{ playlistSlug: string }> }) {
  let resolvedParams: { playlistSlug: string };
  if (params instanceof Promise) {
    resolvedParams = await params;
  } else {
    resolvedParams = params;
  }
  const { playlistSlug } = resolvedParams;
  
  const playlist = (await getPlaylistBySlug(playlistSlug)) as Playlist | null;
  console.log(playlist);
  
  if (!playlist) {
    return notFound();
  }

  const allPlaylists = (await getAllPlaylists()) as Playlist[];
  const otherPlaylists = allPlaylists.filter((p) => p.id !== playlist.id);

  const videos: Video[] = playlist.videos || [];
  const [firstVideo, ...restVideos] = videos;


  return (
    <div>
      <div className="container mx-auto px-4 py-8">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Playlists", href: "/playlists" },
            { label: playlist.title },
          ]}
        />
        <div className="flex flex-col items-center mb-8">
          <h2 className="text-3xl font-bold mb-2">{playlist.title}</h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl text-center">
            {playlist.description}
          </p>
        </div>
        {firstVideo && (
          <div className="mb-12 flex flex-col items-center">
            <Link href={`/playlists/${playlistSlug}/${firstVideo.slug}`} className="block w-full max-w-3xl">
              <VideoCard
                image={firstVideo.imageUrl300x400 || firstVideo.imageUrlStandard}
                title={firstVideo.title}
                cta="Watch Video"
                className="w-full h-full text-center text-xl"
              />
            </Link>
            <div className="mt-4 text-center max-w-2xl text-gray-700">
              {firstVideo.description}
            </div>
          </div>
        )}
        {restVideos.length > 0 && (
          <div className="mb-16">
            <h3 className="text-xl font-semibold mb-4 text-center">More Episodes</h3>
            <VideosCarousel videos={restVideos} playlistSlug={playlistSlug} />
          </div>
        )}
        {otherPlaylists.length > 0 && (
          <div className="mt-16">
            <h3 className="text-xl font-semibold mb-4 text-center">Other Playlists</h3>
            <PlaylistsCarousel playlists={otherPlaylists} />
          </div>
        )}
      </div>
    </div>
  );
} 