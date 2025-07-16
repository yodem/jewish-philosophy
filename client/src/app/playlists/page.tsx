import PlaylistsCarousel from "@/components/PlaylistsCarousel";
import BlockRenderer from "@/components/blocks/BlockRenderer";
import { getAllPlaylists, getPageBySlug } from "@/data/loaders";

export default async function PlaylistsPage() {
  const pageRes = await getPageBySlug("playlists");
  const playlists = await getAllPlaylists();
  const data = pageRes?.data
  const blocks = data?.[0]?.blocks || [];

  return (
    <div className="container mx-auto px-4 py-8">

      <BlockRenderer blocks={blocks} />
      <PlaylistsCarousel playlists={playlists} />
    </div>
  )
} 