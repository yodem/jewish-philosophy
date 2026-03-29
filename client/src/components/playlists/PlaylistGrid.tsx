"use client";

import { getPlaylistsPaginated } from "@/data/loaders";
import PaginatedGrid from "@/components/ui/PaginatedGrid";
import type { Playlist } from "@/types";

interface PlaylistGridProps {
  initialPlaylists: Playlist[];
  baseUrl: string;
  className?: string;
}

/**
 * Paginated playlist grid with infinite scroll using PaginatedGrid.
 */
export default function PlaylistGrid({ initialPlaylists, baseUrl, className }: PlaylistGridProps) {
  const loadMore = async (page: number) => {
    const newPlaylists = await getPlaylistsPaginated(page, 10);
    return newPlaylists;
  };

  return (
    <PaginatedGrid
      initialItems={initialPlaylists}
      type="playlist"
      baseUrl={baseUrl}
      loadMore={loadMore}
      hasMore={initialPlaylists.length >= 10}
      className={className}
    />
  );
}
