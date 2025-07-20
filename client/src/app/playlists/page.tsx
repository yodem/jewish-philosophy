import BlockRenderer from "@/components/blocks/BlockRenderer";
import { getAllPlaylists, getPageBySlug } from "@/data/loaders";
import type { Playlist } from "@/types";
import GenericCarousel from "@/components/ui/GenericCarousel";

export default async function PlaylistsPage() {
  const pageRes = await getPageBySlug("playlists");
  const playlists: Playlist[] = await getAllPlaylists();
  const data = pageRes?.data;
  const blocks = data?.[0]?.blocks || [];

  return (
    <div className="w-full flex flex-col items-center justify-center gap-4 overflow-hidden">
      <BlockRenderer blocks={blocks} />
      {playlists.length > 0 && (
        <div className="w-full flex flex-col items-center justify-center mt-8 sm:mt-16">
          <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-4 text-center">סדרות</h3>
          <GenericCarousel 
            items={playlists} 
            type="playlist" 
            baseUrl="/playlists" 
          />
        </div>
      )}
    </div>
  );
} 