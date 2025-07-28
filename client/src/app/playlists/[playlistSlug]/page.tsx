import Breadcrumbs from "@/components/Breadcrumbs";
import { getPlaylistBySlug, getPlaylistsPaginated } from "@/data/loaders";
import type { Playlist, Video } from "@/types";
import Link from "next/link";
import { notFound } from "next/navigation";
import MediaCard from "@/components/ui/MediaCard";
import PlaylistVideoGridWrapper from "@/components/PlaylistVideoGridWrapper";
import PlaylistGrid from "@/components/PlaylistGrid";
import { Metadata } from "next";
import { generateMetadata as createMetadata, generateStructuredData, getImageUrl } from "@/lib/metadata";
import PlaylistViewTracker from "@/components/PlaylistViewTracker";

// Force dynamic rendering to prevent build-time data fetching issues
export const dynamic = 'force-dynamic';

interface PlaylistPageProps {
  params: Promise<{ playlistSlug: string }>;
}

export async function generateMetadata({ params }: PlaylistPageProps): Promise<Metadata> {
  const { playlistSlug } = await params;
  const playlist = await getPlaylistBySlug(playlistSlug) as Playlist | null;
  
  if (!playlist) {
    return {
      title: "Playlist Not Found",
    };
  }

  return createMetadata({
    title: `${playlist.title} | סדרות שיעורים - פילוסופיה יהודית`,
    description: playlist.description,
    url: `/playlists/${playlistSlug}`,
    type: "website",
    image: getImageUrl(playlist.imageUrl300x400 || playlist.imageUrlStandard),
    keywords: `סדרת שיעורים, ${playlist.title}, פילוסופיה יהודית, פילוסופיה דתית, הרמב"ם, שיעורי וידאו, מבוא לפילוסופיה יהודית, שלום צדיק`,
  });
}

export default async function PlaylistDetailPage({ params }: PlaylistPageProps) {
  const { playlistSlug } = await params;
  
  const playlist = (await getPlaylistBySlug(playlistSlug)) as Playlist | null;
  if (!playlist) {
    return notFound();
  }



  // Fetch other playlists with error handling
  let otherPlaylists: Playlist[] = [];
  try {
    const allPlaylists = (await getPlaylistsPaginated(1, 10)) as Playlist[];
    otherPlaylists = allPlaylists.filter((p) => p.id !== playlist.id);
  } catch (error) {
    console.warn('Failed to fetch other playlists:', error);
    // Continue without other playlists if fetch fails
  }

  const videos: Video[] = playlist.videos || [];
  const [firstVideo, ...restVideos] = videos;

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://yourdomain.com';
  
  // Structured data for the playlist
  const playlistStructuredData = generateStructuredData({
    type: 'Course',
    name: playlist.title,
    description: playlist.description,
    url: `${baseUrl}/playlists/${playlistSlug}`,
    image: getImageUrl(playlist.imageUrl300x400 || playlist.imageUrlStandard),
    additionalProperties: {
      "@type": "Course",
      "courseCode": playlistSlug,
      "numberOfCredits": videos.length,
      "timeRequired": `PT${videos.length * 10}M`,
      "hasCourseInstance": videos.map((video) => ({
        "@type": "CourseInstance",
        "name": video.title,
        "description": video.description,
        "url": `${baseUrl}/playlists/${playlistSlug}/${video.slug}`
      }))
    }
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(playlistStructuredData) }}
      />
      <div className="w-full max-w-full overflow-hidden">
        {/* Track playlist view */}
        <PlaylistViewTracker playlistTitle={playlist.title} videoCount={videos.length} />
        
        <Breadcrumbs
          items={[
            { label: "בית", href: "/" },
            { label: "סדרות", href: "/playlists" },
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
              image={firstVideo.imageUrlStandard}
              title={firstVideo.title}
              description={firstVideo.description}
              type="video"
              className="w-full"
              isLarge={true}
            />
          </Link>
         
        </div>
      )}
      {restVideos.length > 0 && (
        <div className="flex flex-col items-center mt-4 sm:mt-8">
          <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-4 text-center">פרקים נוספים</h3>
          <PlaylistVideoGridWrapper 
            initialVideos={restVideos} 
            playlistId={playlist.id}
            baseUrl={`/playlists/${playlistSlug}`}
            playlistTitle={playlist.title}
          />
        </div>
      )}
      {otherPlaylists.length > 0 && (
        <div className="flex flex-col items-center mt-4 sm:mt-8 w-full h-full">
          <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-4 text-center">סדרות נוספות</h3>
          <PlaylistGrid 
            initialPlaylists={otherPlaylists} 
            baseUrl="/playlists"
          />
        </div>
      )}
    </div>
    </>
  );
} 