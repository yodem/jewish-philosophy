"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import MediaCard from "@/components/ui/MediaCard";
import Link from "next/link";
import type { Video } from "@/types";
import { cn } from "@/lib/utils";
import { getPlaylistVideosPaginated } from "@/data/loaders";

interface PlaylistVideoGridProps {
  initialVideos: Video[];
  playlistId: number;
  baseUrl: string;
  className?: string;
  playlistTitle?: string;
}

function VideoGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-card rounded-lg overflow-hidden shadow-sm border border-border">
          <div className="aspect-[4/3] bg-muted animate-pulse" />
          <div className="p-6 space-y-3">
            <div className="h-5 w-3/4 bg-muted rounded animate-pulse" />
            <div className="h-3 w-full bg-muted rounded animate-pulse" />
            <div className="h-3 w-2/3 bg-muted rounded animate-pulse" />
            <div className="h-10 w-full bg-muted rounded-lg animate-pulse mt-4" />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Video list within a playlist with infinite scroll.
 */
export default function PlaylistVideoGrid({
  initialVideos,
  playlistId,
  baseUrl,
  className,
  playlistTitle = '',
}: PlaylistVideoGridProps) {
  const [videos, setVideos] = useState<Video[]>(initialVideos);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMoreVideos, setHasMoreVideos] = useState(initialVideos.length >= 10);
  const observer = useRef<IntersectionObserver | null>(null);
  const lastVideoElementRef = useRef<HTMLDivElement | null>(null);

  const handleLoadMore = useCallback(async () => {
    if (loading || !hasMoreVideos) return;

    setLoading(true);
    try {
      const pageSize = typeof window !== 'undefined' && window.innerWidth >= 768 ? 12 : 10;
      const newVideos = await getPlaylistVideosPaginated(playlistId, page + 1, pageSize);
      if (newVideos.length === 0) {
        setHasMoreVideos(false);
      } else {
        setVideos((prev) => [...prev, ...newVideos]);
        setPage((prev) => prev + 1);
      }
    } catch {
      // Silently handle
    } finally {
      setLoading(false);
    }
  }, [loading, hasMoreVideos, playlistId, page]);

  useEffect(() => {
    if (loading) return;

    if (observer.current) observer.current.disconnect();

    const callback = (entries: IntersectionObserverEntry[]) => {
      if (entries[0].isIntersecting && hasMoreVideos && !loading) {
        handleLoadMore();
      }
    };

    observer.current = new IntersectionObserver(callback);

    if (lastVideoElementRef.current) {
      observer.current.observe(lastVideoElementRef.current);
    }

    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, [handleLoadMore, hasMoreVideos, loading]);

  if (videos.length === 0) return null;

  return (
    <div className={cn("w-full max-w-full", className)}>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">
        {videos.map((video, index) => {
          const isLastVideo = index === videos.length - 1;
          return (
            <div
              key={video.id}
              ref={isLastVideo ? lastVideoElementRef : undefined}
              className="w-full"
            >
              <Link
                href={`${baseUrl}/${video.slug}`}
                className="no-underline h-full w-full flex items-center justify-center"
              >
                <MediaCard
                  image={video.imageUrl300x400 || video.imageUrlStandard || ''}
                  title={video.title}
                  description={video.description}
                  type="video"
                  className="w-full h-full"
                />
              </Link>
            </div>
          );
        })}
      </div>

      {/* Loading skeleton */}
      {loading && <VideoGridSkeleton count={3} />}

      {/* End of results */}
      {!hasMoreVideos && videos.length > 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <p>אין עוד סרטונים בסדרה זו</p>
        </div>
      )}
    </div>
  );
}
