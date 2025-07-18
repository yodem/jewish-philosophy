import BackButton from "@/components/BackButton";
import HeroSection from "@/components/blocks/HeroSection";
import Breadcrumbs from "@/components/Breadcrumbs";
import { getPlaylistBySlug, getAllPlaylists } from "@/data/loaders";
import type { Playlist, Video } from "@/types";
import Link from "next/link";
import { notFound } from "next/navigation";
import MediaCard from "@/components/ui/MediaCard";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

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
    <>
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Playlists", href: "/playlists" },
          { label: playlist.title },
        ]}
      />
      <div className="flex flex-col items-center mb-8 px-2 overflow-x-hidden">
        <h2 className="text-3xl font-bold mb-2 text-center">{playlist.title}</h2>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl text-center">
          {playlist.description}
        </p>
      </div>
      {firstVideo && (
        <div className="mb-12 flex flex-col items-center px-2">
          <Link href={`/playlists/${playlistSlug}/${firstVideo.slug}`} className="block w-full max-w-3xl">
            <MediaCard
              image={firstVideo.imageUrl300x400 || firstVideo.imageUrlStandard}
              title={firstVideo.title}
              type="video"
              className="w-full h-full text-center text-xl"
              isLarge={true}
            />
          </Link>
          <div className="mt-4 text-center max-w-2xl text-gray-700">
            {firstVideo.description}
          </div>
        </div>
      )}
      {restVideos.length > 0 && (
        <div className="container mx-auto px-2 my-8 flex flex-col items-center justify-center w-full overflow-x-hidden">
          <h3 className="text-xl font-semibold mb-4 text-center">פרקים נוספים</h3>
          <div className="w-full max-w-full overflow-x-auto md:max-w-3xl xl:max-w-6xl">
            <Carousel opts={{ align: 'start', loop: true }} className="w-full">
              <CarouselPrevious />
              <CarouselContent className="md:-ml-4">
                {restVideos.map((video) => (
                  <CarouselItem key={video.id} className="w-full basis-full pl-2 md:pl-4 md:basis-1/2 xl:basis-1/3">
                    <Link href={`/playlists/${playlistSlug}/${video.slug}`} className="block w-full h-full">
                      <MediaCard
                        image={video.imageUrl300x400 || video.imageUrlStandard}
                        title={video.title}
                        type="video"
                        className="h-full"
                        isLarge={false}
                      />
                    </Link>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselNext />
            </Carousel>
          </div>
        </div>
      )}
      {otherPlaylists.length > 0 && (
        <div className="mt-16 flex flex-col items-center justify-center px-2">
          <h3 className="text-xl font-semibold mb-4 text-center">סדרות נוספות</h3>
          <div className="w-full max-w-full overflow-x-auto md:max-w-3xl xl:max-w-6xl">
            <Carousel opts={{ align: 'start', loop: true }} className="w-full">
              <CarouselPrevious />
              <CarouselContent className="md:-ml-4">
                {otherPlaylists.map((playlist) => (
                  <CarouselItem key={playlist.id} className="w-full basis-full pl-2 md:pl-4 md:basis-1/2 xl:basis-1/3">
                    <Link href={`/playlists/${playlist.slug}`} className="no-underline h-full">
                      <MediaCard
                        image={playlist.imageUrl300x400 || playlist.imageUrlStandard}
                        title={playlist.title}
                        description={playlist.description}
                        episodeCount={playlist.videos?.length}
                        type="playlist"
                        className="h-full"
                      />
                    </Link>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselNext />
            </Carousel>
          </div>
        </div>
      )}
    </>
  );
} 