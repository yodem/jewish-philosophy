import BlockRenderer from "@/components/blocks/BlockRenderer";
import { getPlaylistsPaginated, getPageBySlug } from "@/data/loaders";
import type { Playlist } from "@/types";
import PlaylistGrid from "@/components/PlaylistGrid";
import { Metadata } from "next";
import { generateMetadata } from "@/lib/metadata";

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

  return (
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
  );
} 