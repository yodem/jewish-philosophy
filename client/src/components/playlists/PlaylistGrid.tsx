"use client";

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
    const response = await fetch(`/api/playlists-paginated?page=${page}&pageSize=10`);
    if (!response.ok) throw new Error("Failed to fetch playlists");
    return response.json();
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
