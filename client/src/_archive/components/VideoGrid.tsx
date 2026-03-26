"use client";

import { getVideosPaginated } from "@/data/loaders";
import PaginatedGrid from "@/components/ui/PaginatedGrid";
import type { Video } from "@/types";

interface VideoGridProps {
  initialVideos: Video[];
  baseUrl: string;
  className?: string;
}

export default function VideoGrid({ initialVideos, baseUrl, className }: VideoGridProps) {
  const loadMore = async (page: number) => {
    const newVideos = await getVideosPaginated(page, 10);
    return newVideos;
  };

  return (
    <PaginatedGrid 
      initialItems={initialVideos} 
      type="video" 
      baseUrl={baseUrl}
      loadMore={loadMore}
      hasMore={initialVideos.length >= 10} // If we got 10 items, there might be more
      className={className}
    />
  );
} 