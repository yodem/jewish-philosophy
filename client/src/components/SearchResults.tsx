"use client";

import React from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import MediaCard from "@/components/ui/MediaCard";
import { Blog, Responsa } from "@/types";
import CategoryBadge from "./CategoryBadge";

interface SearchResultsProps {
  results: {
    blogs: Blog[];
    playlists: Array<{
      id: number;
      title: string;
      description: string;
      slug: string;
      imageUrl300x400?: string;
      imageUrlStandard?: string;
    }>;
    videos: Array<{
      id: number;
      title: string;
      description: string;
      slug: string;
      imageUrl300x400?: string;
      imageUrlStandard?: string;
      playlist: any;
    }>;
    responsas: Responsa[];
  };
  isLoading?: boolean;
  query?: string;
}

export const SearchResults: React.FC<SearchResultsProps> = ({
  results,
  isLoading = false,
  query = ""
}) => {
  const hasResults = results.blogs.length > 0 || 
                    results.playlists.length > 0 || 
                    results.videos.length > 0 || 
                    results.responsas.length > 0;

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-4 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </Card>
        ))}
      </div>
    );
  }

  if (!hasResults && query) {
    return (
             <Card className="p-6 text-center">
         <p className="text-gray-500">לא נמצאו תוצאות עבור &quot;{query}&quot;</p>
       </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Blogs */}
      {results.blogs.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Badge variant="secondary">מאמרים</Badge>
            <span className="text-sm text-gray-500">({results.blogs.length})</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {results.blogs.map((blog) => (
              <Link key={blog.id} href={`/blog/${blog.slug}`}>
                <MediaCard
                  image={blog.coverImage?.url || ''}
                  title={blog.title}
                  description={blog.author.name}
                  type="blog"
                  className="h-full hover:shadow-lg transition-shadow"
                />
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Playlists */}
      {results.playlists.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Badge variant="secondary">פלייליסטים</Badge>
            <span className="text-sm text-gray-500">({results.playlists.length})</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {results.playlists.map((playlist) => (
              <Link key={playlist.id} href={`/playlists/${playlist.slug}`}>
                <MediaCard
                  image={playlist.imageUrl300x400 || playlist.imageUrlStandard || ''}
                  title={playlist.title}
                  description={playlist.description}
                  type="playlist"
                  className="h-full hover:shadow-lg transition-shadow"
                />
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Videos */}
      {results.videos.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Badge variant="secondary">סרטונים</Badge>
            <span className="text-sm text-gray-500">({results.videos.length})</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {results.videos.map((video) => (
              <Link key={video.id} href={`/playlists/${typeof video.playlist === 'object' ? video.playlist.slug : video.playlist}/${video.slug}`}>
                <MediaCard
                  image={video.imageUrl300x400 || video.imageUrlStandard || ''}
                  title={video.title}
                  description={video.description}
                  type="video"
                  className="h-full hover:shadow-lg transition-shadow"
                />
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Responsas */}
      {results.responsas.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Badge variant="secondary">שאלות ותשובות</Badge>
            <span className="text-sm text-gray-500">({results.responsas.length})</span>
          </h3>
          <div className="space-y-3">
            {results.responsas.map((responsa) => (
              <Link key={responsa.id} href={`/responsa/${responsa.slug}`}>
                <Card className="p-4 hover:shadow-lg transition-shadow cursor-pointer">
                  <h4 className="font-medium mb-2">{responsa.title}</h4>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {responsa.categories?.map((category) => (
                      <CategoryBadge key={category.id} category={category} />
                    ))}
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2">{responsa.content}</p>
                  <div className="text-xs text-gray-500 mt-2">
                    {responsa.comments?.length || 0} תגובות
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchResults;