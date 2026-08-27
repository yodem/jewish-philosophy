"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import MediaCard from "@/components/ui/MediaCard";
import Link from "next/link";
import type { Blog, Playlist, Video } from "@/types";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { GridSkeleton } from "@/components/ui/skeleton";
import { getStrapiMediaEntryUrl } from "@/lib/strapi-media";

interface PaginatedGridProps {
  initialItems: (Playlist | Video | Blog)[];
  type: "playlist" | "video" | "blog";
  baseUrl: string;
  className?: string;
  loadMore: (page: number) => Promise<(Playlist | Video | Blog)[]>;
  hasMore?: boolean;
  showInitialSkeleton?: boolean;
}

function itemKey(item: Playlist | Video | Blog): string {
  if ("documentId" in item && item.documentId) return String(item.documentId);
  if ("slug" in item && item.slug) return String(item.slug);
  return String(item.id);
}

/** Prefer the entry with more related videos when the same playlist appears twice (stale cache / draft+published). */
function mergeUnique(
  existing: (Playlist | Video | Blog)[],
  incoming: (Playlist | Video | Blog)[],
  type: PaginatedGridProps["type"]
): (Playlist | Video | Blog)[] {
  const map = new Map<string, Playlist | Video | Blog>();
  for (const item of [...existing, ...incoming]) {
    const key = itemKey(item);
    const prev = map.get(key);
    if (!prev) {
      map.set(key, item);
      continue;
    }
    if (type === "playlist") {
      const prevCount = (prev as Playlist).videos?.length ?? 0;
      const nextCount = (item as Playlist).videos?.length ?? 0;
      if (nextCount >= prevCount) map.set(key, item);
    }
  }
  return Array.from(map.values());
}

export default function PaginatedGrid({
  initialItems,
  type,
  baseUrl,
  className,
  loadMore,
  hasMore = true,
  showInitialSkeleton = false,
}: PaginatedGridProps) {
  const [items, setItems] = useState<(Playlist | Video | Blog)[]>(() => {
    const merged = mergeUnique([], initialItems, type);
    return type === "playlist"
      ? merged.filter((p) => ((p as Playlist).videos?.length ?? 0) > 0)
      : merged;
  });
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMoreItems, setHasMoreItems] = useState(hasMore);
  const [initialLoading, setInitialLoading] = useState(showInitialSkeleton);
  const observer = useRef<IntersectionObserver | null>(null);
  const lastItemElementRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (showInitialSkeleton && initialItems.length > 0) {
      const timer = setTimeout(() => setInitialLoading(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [showInitialSkeleton, initialItems]);

  const handleLoadMore = useCallback(async () => {
    if (loading || !hasMoreItems) return;

    setLoading(true);
    try {
      const newItems = await loadMore(page + 1);
      if (newItems.length === 0) {
        setHasMoreItems(false);
      } else {
        setItems((prev) => {
          const merged = mergeUnique(prev, newItems, type);
          return type === "playlist"
            ? merged.filter((p) => ((p as Playlist).videos?.length ?? 0) > 0)
            : merged;
        });
        setPage((prev) => prev + 1);
      }
    } catch (error) {
      console.error("Error loading more items:", error);
    } finally {
      setLoading(false);
    }
  }, [loading, hasMoreItems, loadMore, page, type]);

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

  const getImageUrl = useCallback(
    (item: Playlist | Video | Blog): string => {
      switch (type) {
        case "playlist": {
          const playlist = item as Playlist;
          return (
            playlist.imageUrl300x400 ||
            playlist.imageUrlStandard ||
            playlist.videos?.[0]?.imageUrl300x400 ||
            playlist.videos?.[0]?.imageUrlStandard ||
            ""
          );
        }
        case "video":
          return (
            (item as Video).imageUrl300x400 ||
            (item as Video).imageUrlStandard ||
            ""
          );
        case "blog":
          return getStrapiMediaEntryUrl((item as Blog).coverImage);
        default:
          return "";
      }
    },
    [type]
  );

  const getDescription = useCallback(
    (item: Playlist | Video | Blog): string | undefined => {
      switch (type) {
        case "playlist":
          return "";
        case "video":
          return (item as Video).description;
        case "blog":
          return (item as Blog).author.name;
        default:
          return undefined;
      }
    },
    [type]
  );

  const getEpisodeCount = useCallback(
    (item: Playlist | Video | Blog): number | undefined => {
      if (type === "playlist") {
        return (item as Playlist).videos?.length;
      }
      return undefined;
    },
    [type]
  );

  if (initialLoading) {
    return (
      <div className={cn("w-full max-w-full", className)}>
        <GridSkeleton count={6} />
      </div>
    );
  }

  if (items.length === 0) {
    return null;
  }

  return (
    <div className={cn("w-full max-w-full", className)}>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">
        {items.map((item, index) => {
          const isLastItem = index === items.length - 1;
          return (
            <div
              key={itemKey(item)}
              ref={isLastItem ? lastItemElementRef : undefined}
              className="w-full"
            >
              <Link
                href={`${baseUrl}/${item.slug}`}
                className="no-underline h-full w-full flex flex-1 items-center justify-center"
              >
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

      {loading && (
        <div className="flex justify-center items-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {!hasMoreItems && items.length > 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <p>אין עוד תוצאות</p>
        </div>
      )}
    </div>
  );
}
