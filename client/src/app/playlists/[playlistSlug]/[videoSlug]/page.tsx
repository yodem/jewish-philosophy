import YoutubePlayer from "@/components/YoutubePlayer";
import { getPlaylistBySlug, getVideoBySlug } from "@/data/loaders";
import type { Playlist, Video } from "@/types";
import { notFound } from "next/navigation";
import Breadcrumbs from "@/components/Breadcrumbs";
import { Card } from "@/components/ui/card";
import PlaylistVideoGridWrapper from "@/components/PlaylistVideoGridWrapper";
import QuestionFormWrapper from "@/components/QuestionFormWrapper";
import { Metadata } from "next";
import { generateMetadata as createMetadata, generateStructuredData, getImageUrl } from "@/lib/metadata";

// Force dynamic rendering to prevent build-time data fetching issues
export const dynamic = 'force-dynamic';

interface VideoPageProps {
  params: Promise<{ playlistSlug: string; videoSlug: string }>;
}

export async function generateMetadata({ params }: VideoPageProps): Promise<Metadata> {
  const { playlistSlug, videoSlug } = await params;
  const video = await getVideoBySlug(videoSlug) as Video | null;
  const playlist = await getPlaylistBySlug(playlistSlug) as Playlist | null;
  
  if (!video || !playlist) {
    return {
      title: "Video Not Found",
    };
  }

  return createMetadata({
    title: `${video.title} | ${playlist.title} - פילוסופיה יהודית`,
    description: video.description,
    url: `/playlists/${playlistSlug}/${videoSlug}`,
    type: "website",
    image: getImageUrl(video.imageUrl300x400 || video.imageUrlStandard),
    keywords: `שיעור וידאו, ${video.title}, ${playlist.title}, פילוסופיה יהודית, פילוסופיה דתית, הרמב"ם, מבוא לפילוסופיה יהודית, שלום צדיק`,
  });
}

export default async function VideoDetailPage({ params }: VideoPageProps) {
  const { playlistSlug, videoSlug } = await params;
  const video = (await getVideoBySlug(videoSlug)) as Video | null;
  const playlist = (await getPlaylistBySlug(playlistSlug)) as Playlist | null;

  if (!video || !playlist) {
    return notFound();
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://yourdomain.com';
  
  // Structured data for the video
  const videoStructuredData = generateStructuredData({
    type: 'Video',
    name: video.title,
    description: video.description,
    url: `${baseUrl}/playlists/${playlistSlug}/${videoSlug}`,
    image: getImageUrl(video.imageUrl300x400 || video.imageUrlStandard),
    additionalProperties: {
      "@type": "VideoObject",
      "embedUrl": `https://www.youtube.com/embed/${video.videoId}`,
      "uploadDate": new Date().toISOString(),
      "duration": "PT10M",
      "thumbnailUrl": video.imageUrl300x400 || video.imageUrlStandard,
      "contentUrl": `https://www.youtube.com/watch?v=${video.videoId}`,
      "partOfSeries": {
        "@type": "VideoSeries",
        "name": playlist.title,
        "description": playlist.description,
        "url": `${baseUrl}/playlists/${playlistSlug}`
      }
    }
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(videoStructuredData) }}
      />
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
            <h3 className="text-xl font-semibold mb-4 text-center">
              פרקים בסדרה
            </h3>
            <PlaylistVideoGridWrapper 
              initialVideos={playlist.videos} 
              playlistId={playlist.id}
              baseUrl={`/playlists/${playlistSlug}`}
            />
          </div>
        )}
      </Card>
    </div>
    </>
  );
} 