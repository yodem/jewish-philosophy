"use client";

import dynamic from "next/dynamic";
import type { Blog } from "@/types";

interface BlogPageClientProps {
  initialBlogs: Blog[];
}

// Dynamic import for BlogGrid component
const BlogGrid = dynamic(() => import("@/components/BlogGrid"), {
  loading: () => (
    <div className="w-full flex flex-col items-center mt-4 sm:mt-8">
      <div className="animate-pulse">
        <div className="h-8 w-48 bg-gray-200 rounded mb-4"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    </div>
  )
});

export default function BlogPageClient({ initialBlogs }: BlogPageClientProps) {
  if (initialBlogs.length === 0) return null;

  return (
    <div className="w-full">
      <div className="flex flex-col items-center mt-4 sm:mt-8">
        <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-4 text-center">מאמרים נוספים</h3>
        <BlogGrid
          initialBlogs={initialBlogs}
          baseUrl="/blog"
        />
      </div>
    </div>
  );
}
