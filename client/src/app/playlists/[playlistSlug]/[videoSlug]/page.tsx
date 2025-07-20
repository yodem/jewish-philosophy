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
import GenericCarousel from "@/components/ui/GenericCarousel";


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
      <div className="container mx-auto px-2 my-8 flex flex-col items-center justify-center w-full">
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
          <GenericCarousel 
            items={playlist.videos} 
            type="video" 
            baseUrl={`/playlists/${playlistSlug}`}
          />
        </Card>
      </div>
  );
} 