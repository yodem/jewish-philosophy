'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import BlogCard from './BlogCard';
import type { Blog } from '@/types';
import { cn } from '@/lib/utils';
import { getBlogsPaginated } from '@/data/loaders';

interface BlogPaginatedGridProps {
  initialBlogs: Blog[];
  className?: string;
}

function BlogGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-card rounded-lg overflow-hidden shadow-sm border border-border"
        >
          <div className="h-48 bg-muted animate-pulse" />
          <div className="p-6 space-y-3">
            <div className="flex gap-2">
              <div className="h-4 w-12 bg-muted rounded animate-pulse" />
              <div className="h-4 w-16 bg-muted rounded animate-pulse" />
            </div>
            <div className="h-6 w-3/4 bg-muted rounded animate-pulse" />
            <div className="h-3 w-1/3 bg-muted rounded animate-pulse" />
            <div className="h-4 w-full bg-muted rounded animate-pulse" />
            <div className="h-4 w-2/3 bg-muted rounded animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Blog grid with 3-column layout and infinite scroll.
 */
export default function BlogPaginatedGrid({
  initialBlogs,
  className,
}: BlogPaginatedGridProps) {
  const [blogs, setBlogs] = useState<Blog[]>(initialBlogs);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(initialBlogs.length >= 9);
  const observer = useRef<IntersectionObserver | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const handleLoadMore = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    try {
      const newBlogs = await getBlogsPaginated(page + 1, 10);
      if (newBlogs.length === 0) {
        setHasMore(false);
      } else {
        setBlogs((prev) => [...prev, ...newBlogs]);
        setPage((prev) => prev + 1);
      }
    } catch {
      // Silently handle - user can scroll again to retry
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, page]);

  useEffect(() => {
    if (loading) return;

    if (observer.current) observer.current.disconnect();

    const callback = (entries: IntersectionObserverEntry[]) => {
      if (entries[0].isIntersecting && hasMore && !loading) {
        handleLoadMore();
      }
    };

    observer.current = new IntersectionObserver(callback);

    if (sentinelRef.current) {
      observer.current.observe(sentinelRef.current);
    }

    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, [handleLoadMore, hasMore, loading]);

  if (blogs.length === 0) return null;

  return (
    <div className={cn('w-full', className)}>
      {/* 3-column grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
        {blogs.map((blog) => (
          <BlogCard key={blog.id} blog={blog} />
        ))}
      </div>

      {/* Loading skeleton */}
      {loading && <BlogGridSkeleton count={3} />}

      {/* Intersection observer sentinel */}
      {hasMore && <div ref={sentinelRef} className="h-4" />}

      {/* End of results */}
      {!hasMore && blogs.length > 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <p>אין עוד מאמרים</p>
        </div>
      )}
    </div>
  );
}
