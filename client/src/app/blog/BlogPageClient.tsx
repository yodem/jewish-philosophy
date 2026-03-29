"use client";

import dynamic from "next/dynamic";
import type { Blog } from "@/types";

interface BlogPageClientProps {
  initialBlogs: Blog[];
}

const BlogPaginatedGrid = dynamic(
  () => import("@/components/blog/BlogPaginatedGrid"),
  {
    loading: () => (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="bg-card rounded-xl overflow-hidden shadow-md border border-border"
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
            </div>
          </div>
        ))}
      </div>
    ),
  }
);

export default function BlogPageClient({ initialBlogs }: BlogPageClientProps) {
  if (initialBlogs.length === 0) return null;

  return <BlogPaginatedGrid initialBlogs={initialBlogs} />;
}
