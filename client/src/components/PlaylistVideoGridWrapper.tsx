"use client";

import { getPlaylistVideosPaginated } from "@/data/loaders";
import PlaylistVideoGrid from "@/components/PlaylistVideoGrid";
import type { Video } from "@/types";

interface PlaylistVideoGridWrapperProps {
  initialVideos: Video[];
  playlistId: number;
  baseUrl: string;
  className?: string;
}

export default function PlaylistVideoGridWrapper({ 
  initialVideos, 
  playlistId,
  baseUrl, 
  className 
}: PlaylistVideoGridWrapperProps) {
  const loadMore = async (playlistId: number, page: number) => {
    // Load 10 videos per page on mobile, 12 on desktop
    const pageSize = typeof window !== 'undefined' && window.innerWidth >= 768 ? 12 : 10;
    const newVideos = await getPlaylistVideosPaginated(playlistId, page, pageSize);
    return newVideos;
  };

  return (
    <PlaylistVideoGrid 
      initialVideos={initialVideos} 
      playlistId={playlistId}
      baseUrl={baseUrl}
      loadMore={loadMore}
      className={className}
    />
  );
} 