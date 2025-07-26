import BlockRenderer from "@/components/blocks/BlockRenderer";
import { getPlaylistsPaginated, getPageBySlug } from "@/data/loaders";
import type { Playlist } from "@/types";
import PlaylistGrid from "@/components/PlaylistGrid";
import { Metadata } from "next";
import { generateMetadata, generateStructuredData } from "@/lib/metadata";

export const metadata: Metadata = generateMetadata({
  title: "סדרות שיעורים | פילוסופיה יהודית - שיעורי וידאו ברצף",
  description: "סדרות שיעורים מקיפות ברצף בנושאי הלכה, גמרא, תנ\"ך, פילוסופיה יהודית ועוד. למדו עם המרצים המובילים במתכונת של קורסים מובנים.",
  url: "/playlists",
  type: "website",
  keywords: "סדרות שיעורים, שיעורי וידאו, פילוסופיה יהודית, פילוסופיה דתית, הרמב\"ם, מורה נבוכים, כוזרי, קורסים יהודיים, שלום צדיק, מבוא לפילוסופיה יהודית, לימוד ברצף, יהדות רציונלית",
});

export default async function PlaylistsPage() {
  const pageRes = await getPageBySlug("playlists");
  const playlists: Playlist[] = await getPlaylistsPaginated(1, 10);
  const data = pageRes?.data;
  const blocks = data?.[0]?.blocks || [];

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://yourdomain.com';
  
  // Structured data for playlists collection
  const playlistsStructuredData = generateStructuredData({
    type: 'WebPage',
    name: 'סדרות שיעורים - פילוסופיה יהודית',
    description: 'סדרות שיעורים מקיפות ברצף בנושאי הלכה, גמרא, תנ\"ך, פילוסופיה יהודית ועוד. למדו עם המרצים המובילים במתכונת של קורסים מובנים.',
    url: `${baseUrl}/playlists`,
    additionalProperties: {
      "mainEntity": {
        "@type": "CourseInstance",
        "name": "סדרות שיעורים פילוסופיה יהודית",
        "description": "אוסף של סדרות שיעורים מובנות ומקיפות בלימודי יהדות",
        "url": `${baseUrl}/playlists`,
        "inLanguage": "he-IL",
        "provider": {
          "@type": "EducationalOrganization",
          "name": "פילוסופיה יהודית"
        },
        "about": [
          {
            "@type": "Thing",
            "name": "גמרא",
            "description": "לימוד עמוד יומי וסוגיות בגמרא"
          },
          {
            "@type": "Thing",
            "name": "הלכה למעשה", 
            "description": "הלכות יומיומיות ופסיקה מעשית"
          },
          {
            "@type": "Thing",
            "name": "תנך ופרשנות",
            "description": "לימוד תנך עם פרשנים ראשונים ואחרונים"
          }
        ]
      }
    }
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(playlistsStructuredData) }}
      />
      <div className="w-full flex flex-col items-center justify-center gap-4 overflow-hidden">
        <BlockRenderer blocks={blocks} />
        {playlists.length > 0 && (
          <div className="w-full flex flex-col items-center justify-center mt-8 sm:mt-16">
            <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-4 text-center">סדרות</h3>
            <PlaylistGrid 
              initialPlaylists={playlists} 
              baseUrl="/playlists" 
            />
          </div>
        )}
      </div>
    </>
  );
} 