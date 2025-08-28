"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import MediaCard from "@/components/ui/MediaCard";
import Link from "next/link";
import type { Video } from "@/types";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { trackVideoFromPlaylist } from "@/lib/analytics";

interface PlaylistVideoGridProps {
  initialVideos: Video[];
  playlistId: number;
  baseUrl: string;
  className?: string;
  loadMore: (playlistId: number, page: number) => Promise<Video[]>;
  playlistTitle?: string;
}

export default function PlaylistVideoGrid({ 
  initialVideos, 
  playlistId,
  baseUrl, 
  className,
  loadMore,
  playlistTitle = 'Unknown Playlist'
}: PlaylistVideoGridProps) {
  const [videos, setVideos] = useState<Video[]>(initialVideos);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMoreVideos, setHasMoreVideos] = useState(initialVideos.length >= 10);
  const observer = useRef<IntersectionObserver | null>(null);
  const lastVideoElementRef = useRef<HTMLDivElement | null>(null);

  // Load more videos function
  const handleLoadMore = useCallback(async () => {
    if (loading || !hasMoreVideos) return;
    
    setLoading(true);
    try {
      const newVideos = await loadMore(playlistId, page + 1);
      if (newVideos.length === 0) {
        setHasMoreVideos(false);
      } else {
        setVideos(prev => [...prev, ...newVideos]);
        setPage(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error loading more videos:', error);
    } finally {
      setLoading(false);
    }
  }, [loading, hasMoreVideos, loadMore, playlistId, page]);

  // Set up intersection observer
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

  if (videos.length === 0) {
    return null;
  }

  return (
    <div className={cn("w-full max-w-full", className)}>
      {/* Mobile: Single column, Desktop: 3 columns grid */}
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
                onClick={() => trackVideoFromPlaylist(video.title, playlistTitle, index + 1)}
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

      {/* Loading indicator */}
      {loading && (
        <div className="flex justify-center items-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      )}

      {/* End of results indicator */}
      {!hasMoreVideos && videos.length > 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>אין עוד סרטונים בסדרה זו</p>
        </div>
      )}
    </div>
  );
} 