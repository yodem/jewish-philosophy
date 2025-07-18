import BackButton from "@/components/BackButton";
import HeroSection from "@/components/blocks/HeroSection";
import YoutubePlayer from "@/components/YoutubePlayer";
import { getPlaylistBySlug, getVideoBySlug } from "@/data/loaders";
import type { HeroSectionProps, Playlist, Video } from "@/types";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import Breadcrumbs from "@/components/Breadcrumbs";
import { Card } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import MediaCard from "@/components/ui/MediaCard";


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
  return (
      <div className="container mx-auto px-2 my-8 flex flex-col items-center justify-center w-full overflow-x-hidden">
        <Card className="flex-1 bg-white rounded-2xl p-4 md:p-6 shadow-lg border-0">
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
              תיאור
            </h2>
            <p className="text-gray-700 leading-relaxed">{video.description}</p>
          </div>
          <Carousel opts={{ align: 'start', loop: true }} className="w-full max-w-full overflow-x-auto md:max-w-3xl xl:max-w-6xl">
              <CarouselPrevious />
              <CarouselContent className="md:-ml-4">
                {playlist.videos.map((video) => (
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
        </Card>
      </div>
  );
} 