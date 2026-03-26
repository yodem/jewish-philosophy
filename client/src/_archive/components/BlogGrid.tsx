"use client";

import { getBlogsPaginated } from "@/data/loaders";
import PaginatedGrid from "@/components/ui/PaginatedGrid";
import type { Blog } from "@/types";

interface BlogGridProps {
  initialBlogs: Blog[];
  baseUrl: string;
  className?: string;
}

export default function BlogGrid({ initialBlogs, baseUrl, className }: BlogGridProps) {
  const loadMore = async (page: number) => {
    const newBlogs = await getBlogsPaginated(page, 10);
    return newBlogs;
  };

  return (
    <PaginatedGrid 
      initialItems={initialBlogs} 
      type="blog" 
      baseUrl={baseUrl}
      loadMore={loadMore}
      hasMore={initialBlogs.length >= 9} // If we got 9 more items (10 - 1 featured), there might be more
      className={className}
    />
  );
} 