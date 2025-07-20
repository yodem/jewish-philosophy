import BackButton from "@/components/BackButton";
import HeroSection from "@/components/blocks/HeroSection";
import Breadcrumbs from "@/components/Breadcrumbs";
import { getPlaylistBySlug, getAllPlaylists } from "@/data/loaders";
import type { Playlist, Video } from "@/types";
import Link from "next/link";
import { notFound } from "next/navigation";
import MediaCard from "@/components/ui/MediaCard";
import GenericCarousel from "@/components/ui/GenericCarousel";

export default async function PlaylistDetailPage({ params }: { params: { playlistSlug: string } | Promise<{ playlistSlug: string }> }) {
  let resolvedParams: { playlistSlug: string };
  if (params instanceof Promise) {
    resolvedParams = await params;
  } else {
    resolvedParams = params;
  }
  const { playlistSlug } = resolvedParams;
  
  const playlist = (await getPlaylistBySlug(playlistSlug)) as Playlist | null;
  if (!playlist) {
    return notFound();
  }

  const allPlaylists = (await getAllPlaylists()) as Playlist[];
  const otherPlaylists = allPlaylists.filter((p) => p.id !== playlist.id);

  const videos: Video[] = playlist.videos || [];
  const [firstVideo, ...restVideos] = videos;

  return (
    <div className="w-full max-w-full overflow-hidden">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Playlists", href: "/playlists" },
          { label: playlist.title },
        ]}
      />
      <div className="flex flex-col items-center mb-6 sm:mb-8 px-2 sm:px-4">
        <h2 className="text-2xl sm:text-3xl font-bold mb-2 text-center">{playlist.title}</h2>
        <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 max-w-3xl text-center">
          {playlist.description}
        </p>
      </div>
      {firstVideo && (
        <div className="mb-8 sm:mb-12 flex flex-col items-center px-2">
          <Link href={`/playlists/${playlistSlug}/${firstVideo.slug}`} className="block w-full max-w-md sm:max-w-3xl">
            <MediaCard
              image={firstVideo.imageUrl300x400 || firstVideo.imageUrlStandard}
              title={firstVideo.title}
              type="video"
              className="w-full"
              isLarge={true}
            />
          </Link>
          <div className="mt-4 text-center max-w-full sm:max-w-2xl text-gray-700 px-2">
            {firstVideo.description}
          </div>
        </div>
      )}
      {restVideos.length > 0 && (
        <div className="flex flex-col items-center mt-4 sm:mt-8">
          <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-4 text-center">פרקים נוספים</h3>
          <GenericCarousel 
            items={restVideos} 
            type="video" 
            baseUrl={`/playlists/${playlistSlug}`}
          />
        </div>
      )}
      {otherPlaylists.length > 0 && (
        <div className="flex flex-col items-center mt-4 sm:mt-8">
          <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-4 text-center">סדרות נוספות</h3>
          <GenericCarousel 
            items={otherPlaylists} 
            type="playlist" 
            baseUrl="/playlists"
          />
        </div>
      )}
    </div>
  );
} 