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
import PlaylistVideoGridWrapper from "@/components/PlaylistVideoGridWrapper";
import QuestionFormWrapper from "@/components/QuestionFormWrapper";


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
    <div className="container mx-auto px-2 my-4 sm:my-8 flex flex-col items-center justify-center w-full">
      <Card className="flex-1 bg-white rounded-xl sm:rounded-2xl p-3 sm:p-6 shadow-lg border-0 w-full overflow-hidden">
        <Breadcrumbs
          items={[
            { label: "בית", href: "/" },
            { label: "סדרות", href: "/playlists" },
            { label: playlist.title, href: `/playlists/${playlistSlug}` },
            { label: video.title },
          ]}
        />
        <YoutubePlayer videoId={video.videoId} title={video.title} />
        <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-md mt-6 sm:mt-8">
          <h2 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-4 text-gray-800">
            תיאור
          </h2>
          <p className="text-gray-700 leading-relaxed text-justify">{video.description}</p>
        </div>
        <div className="mt-10 border-t pt-8">
          <QuestionFormWrapper />
        </div>
        {playlist.videos && playlist.videos.length > 0 && (
          <div className="mt-8 w-full">
            <h3 className="text-xl font-semibold mb-4 text-center">פרקים בסדרה</h3>
            <PlaylistVideoGridWrapper 
              initialVideos={playlist.videos} 
              playlistId={playlist.id}
              baseUrl={`/playlists/${playlistSlug}`}
            />
          </div>
        )}
      </Card>
    </div>
  );
} 