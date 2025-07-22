"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import MediaCard from "@/components/ui/MediaCard";
import Link from "next/link";
import type { Blog, Playlist, Video } from "@/types";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface PaginatedGridProps {
  initialItems: (Playlist | Video | Blog)[];
  type: "playlist" | "video" | "blog";
  baseUrl: string;
  className?: string;
  loadMore: (page: number) => Promise<(Playlist | Video | Blog)[]>;
  hasMore?: boolean;
}

export default function PaginatedGrid({ 
  initialItems, 
  type, 
  baseUrl, 
  className, 
  loadMore,
  hasMore = true 
}: PaginatedGridProps) {
  const [items, setItems] = useState<(Playlist | Video | Blog)[]>(initialItems);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMoreItems, setHasMoreItems] = useState(hasMore);
  const observer = useRef<IntersectionObserver | null>(null);
  const lastItemElementRef = useRef<HTMLDivElement | null>(null);

  // Load more items function
  const handleLoadMore = useCallback(async () => {
    if (loading || !hasMoreItems) return;
    
    setLoading(true);
    try {
      const newItems = await loadMore(page + 1);
      if (newItems.length === 0) {
        setHasMoreItems(false);
      } else {
        setItems(prev => [...prev, ...newItems]);
        setPage(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error loading more items:', error);
    } finally {
      setLoading(false);
    }
  }, [loading, hasMoreItems, loadMore, page]);

  // Set up intersection observer
  useEffect(() => {
    if (loading) return;
    
    if (observer.current) observer.current.disconnect();
    
    const callback = (entries: IntersectionObserverEntry[]) => {
      if (entries[0].isIntersecting && hasMoreItems && !loading) {
        handleLoadMore();
      }
    };
    
    observer.current = new IntersectionObserver(callback);
    
    if (lastItemElementRef.current) {
      observer.current.observe(lastItemElementRef.current);
    }
    
    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, [handleLoadMore, hasMoreItems, loading]);

  // Field accessors based on type
  const getImageUrl = useCallback((item: Playlist | Video | Blog): string => {
    switch (type) {
      case 'playlist':
        return (item as Playlist).imageUrl300x400 || (item as Playlist).imageUrlStandard || '';
      case 'video':
        return (item as Video).imageUrl300x400 || (item as Video).imageUrlStandard || '';
      case 'blog':
        return (item as Blog).coverImage?.url || '';
      default:
        return '';
    }
  }, [type]);

  const getDescription = useCallback((item: Playlist | Video | Blog): string | undefined => {
    switch (type) {
      case 'playlist':
        return (item as Playlist).description;
      case 'video':
        return (item as Video).description;
      case 'blog':
        return (item as Blog).author.name;
      default:
        return undefined;
    }
  }, [type]);

  const getEpisodeCount = useCallback((item: Playlist | Video | Blog): number | undefined => {
    if (type === 'playlist') {
      return (item as Playlist).videos?.length;
    }
    return undefined;
  }, [type]);

  if (items.length === 0) {
    return null;
  }

  return (
    <div className={cn("w-full max-w-full", className)}>
      {/* Mobile: Single column, Desktop: 3 columns grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        {items.map((item, index) => {
          const isLastItem = index === items.length - 1;
          return (
            <div 
              key={item.id}
              ref={isLastItem ? lastItemElementRef : undefined}
              className="w-full"
            >
              <Link href={`${baseUrl}/${item.slug}`} className="no-underline h-full w-full flex flex-1 items-center justify-center">
                <MediaCard
                  image={getImageUrl(item)}
                  title={item.title}
                  description={getDescription(item)}
                  episodeCount={getEpisodeCount(item)}
                  type={type}
                  className="w-full h-full flex-1 flex flex-col justify-center"
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
      {!hasMoreItems && items.length > 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>אין עוד תוצאות</p>
        </div>
      )}
    </div>
  );
} 