import YoutubePlayer from "@/components/YoutubePlayer";
import { getPlaylistBySlug, getVideoBySlug } from "@/data/loaders";
import type { Playlist, Video } from "@/types";
import { notFound } from "next/navigation";
import Breadcrumbs from "@/components/Breadcrumbs";
import { Card } from "@/components/ui/card";
import PlaylistVideoGridWrapper from "@/components/PlaylistVideoGridWrapper";
import QuestionFormWrapper from "@/components/QuestionFormWrapper";
import SocialShare from "@/components/SocialShare";
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
      title: "שיעור וידאו לא נמצא - פילוסופיה יהודית | לימוד פילוסופיה יהודית מקוונת",
      description: "השיעור המבוקש לא נמצא. חזרו לעמוד הראשי לגישה לכל השיעורים בפילוסופיה יהודית, הרמב\"ם, הלכה ואגדה.",
    };
  }

  // Create rich, keyword-heavy title and description
  const enhancedTitle = `${video.title} | ${playlist.title} - שיעורי וידאו בפילוסופיה יהודית | הרמב"ם, הלכה ואגדה מקוונת עם שלום צדיק`;
  const enhancedDescription = `${video.description} | שיעור מקוון מסדרת ${playlist.title} - לימוד פילוסופיה יהודית, הרמב"ם, הלכה ואגדה. שיעורים איכותיים עם שלום צדיק. פילוסופיה דתית, מוסר יהודי, ביקורת החילון, יהדות רציונלית.`.slice(0, 160);

  return createMetadata({
    title: enhancedTitle,
    description: enhancedDescription,
    url: `/playlists/${playlistSlug}/${videoSlug}`,
    type: "article",
    image: getImageUrl(video.imageUrl300x400 || video.imageUrlStandard),
    keywords: `שיעור וידאו, ${video.title}, ${playlist.title}, פילוסופיה יהודית, פילוסופיה דתית, הרמב"ם, מבוא לפילוסופיה יהודית, שלום צדיק, הלכה, אגדה, מוסר יהודי, יהדות רציונלית, ביקורת החילון, דרך האמצע, טעמי המצוות, השגחה, בחירה חופשית, ידיעת האל, לימוד מקוון, שיעורים יהודיים, פלטפורמה יהודית`,
    publishedTime: new Date().toISOString(),
    authors: ["שלום צדיק"],
    tags: ["פילוסופיה יהודית", "שיעורי וידאו", "הרמב״ם", "הלכה", "אגדה"]
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
  
  // Enhanced structured data for the video with more comprehensive SEO
  const videoStructuredData = generateStructuredData({
    type: 'Video',
    name: video.title,
    description: video.description,
    url: `${baseUrl}/playlists/${playlistSlug}/${videoSlug}`,
    image: getImageUrl(video.imageUrl300x400 || video.imageUrlStandard),
    datePublished: new Date().toISOString(),
    author: { name: "שלום צדיק" },
    publisher: { name: "פילוסופיה יהודית", logo: `${baseUrl}/logo.png` },
    keywords: `פילוסופיה יהודית, ${video.title}, ${playlist.title}, הרמב"ם, שיעורי וידאו`,
    additionalProperties: {
      "@type": "VideoObject",
      "embedUrl": `https://www.youtube.com/embed/${video.videoId}`,
      "uploadDate": new Date().toISOString(),
      "duration": "PT10M",
      "thumbnailUrl": video.imageUrl300x400 || video.imageUrlStandard,
      "contentUrl": `https://www.youtube.com/watch?v=${video.videoId}`,
      "interactionStatistic": {
        "@type": "InteractionCounter",
        "interactionType": { "@type": "WatchAction" },
        "userInteractionCount": 0
      },
      "partOfSeries": {
        "@type": "VideoSeries",
        "name": playlist.title,
        "description": playlist.description,
        "url": `${baseUrl}/playlists/${playlistSlug}`
      },
      "educationalAlignment": {
        "@type": "AlignmentObject",
        "alignmentType": "teaches",
        "educationalFramework": "פילוסופיה יהודית",
        "targetName": "לימוד פילוסופיה יהודית ודת"
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
          
          {/* Enhanced breadcrumbs for better navigation and SEO */}
          <Breadcrumbs
            items={[
              { label: "בית", href: "/" },
              { label: "סדרות שיעורים", href: "/playlists" },
              { label: playlist.title, href: `/playlists/${playlistSlug}` },
              { label: video.title },
            ]}
          />

          {/* Main heading - H1 for primary SEO */}
          <header className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 leading-tight">
              {video.title}
            </h1>
            <h2 className="text-lg sm:text-xl text-gray-600 font-medium">
              שיעור מסדרת: {playlist.title}
            </h2>
          </header>

          {/* Video player */}
          <YoutubePlayer videoId={video.videoId} title={video.title} />
          
          {/* Video description section with proper heading hierarchy */}
          <article className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-md mt-6 sm:mt-8">
            <h3 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-4 text-gray-800">
              תיאור השיעור
            </h3>
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-700 leading-relaxed text-justify mb-4">{video.description}</p>
              
              {/* Additional SEO content */}
              <div className="bg-blue-50 p-4 rounded-lg mt-4">
                <h4 className="text-lg font-semibold text-blue-900 mb-2">
                  על מה מדובר בשיעור הזה?
                </h4>
                <p className="text-blue-800 text-sm leading-relaxed">
                  שיעור זה עוסק ב{video.title} במסגרת סדרת השיעורים &ldquo;{playlist.title}&rdquo;. 
                  השיעור מועבר על ידי שלום צדיק ומתמקד בנושאים מרכזיים בפילוסופיה יהודית, 
                  כולל לימוד הרמב&quot;ם, הלכה, אגדה ומחשבה יהודית. השיעור מיועד לכל המעוניינים 
                  בהעמקת הידע היהודי והפילוסופי.
                </p>
              </div>
            </div>
          </article>

          {/* Social sharing section */}
          <section className="mt-6">
            <SocialShare 
              url={`${baseUrl}/playlists/${playlistSlug}/${videoSlug}`}
              title={video.title}
              description={video.description}
            />
          </section>

          {/* Question form section */}
          <section className="mt-10 border-t pt-8">
            <h3 className="text-xl font-semibold mb-4 text-center text-gray-800">
              יש לכם שאלות על השיעור?
            </h3>
            <p className="text-gray-600 text-center mb-6">
              שלחו לנו את השאלות שלכם ונענה בהקדם. אנחנו כאן כדי לעזור לכם להעמיק בלימוד.
            </p>
            <QuestionFormWrapper />
          </section>

          {/* Related videos section */}
          {playlist.videos && playlist.videos.length > 0 && (
            <section className="mt-8 w-full">
              <h3 className="text-xl font-semibold mb-4 text-center text-gray-800">
                שיעורים נוספים בסדרה: {playlist.title}
              </h3>
              <p className="text-gray-600 text-center mb-6">
                המשיכו ללמוד עם שיעורים נוספים מאותה סדרה
              </p>
              <PlaylistVideoGridWrapper 
                initialVideos={playlist.videos} 
                playlistId={playlist.id}
                baseUrl={`/playlists/${playlistSlug}`}
              />
            </section>
          )}
        </Card>
      </div>
    </>
  );
} 