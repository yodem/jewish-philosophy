"use client";

import { useState, useEffect } from "react";
import { getAllBlogs, getPageBySlug, searchBlogs, getAllCategories } from "@/data/loaders";
import { Blog, Category } from "@/types";
import Link from "next/link";
import MediaCard from "@/components/ui/MediaCard";
import GenericCarousel from "@/components/ui/GenericCarousel";
import Breadcrumbs from "@/components/Breadcrumbs";
import BlockRenderer from "@/components/blocks/BlockRenderer";
// import QuestionFormWrapper from "@/components/QuestionFormWrapper";
import SearchCard from "@/components/SearchCard";

export default function BlogListPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [filteredBlogs, setFilteredBlogs] = useState<Blog[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [blocks, setBlocks] = useState<Array<{ id: number; __component?: string; [key: string]: any }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [pageRes, blogsData, categoriesData] = await Promise.all([
          getPageBySlug("blog"),
          getAllBlogs(),
          getAllCategories()
        ]);
        
        const data = pageRes?.data;
        setBlocks(data?.[0]?.blocks || []);
        setBlogs(blogsData);
        setFilteredBlogs(blogsData);
        setCategories(categoriesData);
      } catch (error) {
        console.error("Error loading blog data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const handleSearch = async (query: string, filters: Record<string, string>) => {
    setIsSearching(true);
    try {
      if (!query.trim() && !filters.category) {
        setFilteredBlogs(blogs);
      } else {
        const results = await searchBlogs(query, filters.category);
        setFilteredBlogs(results);
      }
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsSearching(false);
    }
  };

  if (isLoading) {
    return <div className="container mx-auto py-8 px-4 text-center">טוען...</div>;
  }

  const [firstBlog, ...restBlogs] = filteredBlogs;

  return (
    <div className="container mx-auto py-8 px-4">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Blog" },
        ]}
      />
      <BlockRenderer blocks={blocks as any} />
      
      <SearchCard
        onSearch={handleSearch}
        placeholder="חפש מאמרים..."
        title="חפש מאמרים"
        filters={{
          categories: categories.map(cat => ({
            id: cat.id.toString(),
            name: cat.name,
            value: cat.id.toString()
          }))
        }}
      />
      {firstBlog && (
        <div className="mb-8 sm:mb-12 flex flex-col items-center px-2 border-b border-gray-200 pb-8 w-full">
          <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-4 text-center">מאמר אחרון</h3>
          <Link href={`/blog/${firstBlog.slug}`} className="block w-full max-w-md sm:max-w-3xl">
            <MediaCard
              image={firstBlog.coverImage?.url || ''}
              title={firstBlog.title}
              description={firstBlog.author.name}
              type="blog"
              className="w-full"
              isLarge={true}
            />
          </Link>
          <div className="w-full flex flex-col items-center justify-center gap-4 overflow-hidden">
            <h3 className="text-lg sm:text-xl font-semibold mt-2 sm:mt-4 text-center">תיאור</h3>
            <div className=" text-center max-w-full sm:max-w-2xl text-gray-700 px-2">
              {firstBlog.description}
            </div>
          </div>

        </div>
      )}
      
      {isSearching && (
        <div className="text-center py-8">
          <div className="animate-pulse">מחפש מאמרים...</div>
        </div>
      )}
      
      <div className="w-full">
      {restBlogs.length > 0 && (
        <div className="flex flex-col items-center mt-4 sm:mt-8">
          <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-4 text-center">מאמרים נוספים</h3>
          <GenericCarousel 
            items={restBlogs} 
            type="blog" 
            baseUrl="/blog"
          />
        </div>
      )}
      {filteredBlogs.length === 0 && !isLoading && !isSearching && (
        <div className="text-center py-8 text-gray-500">
          לא נמצאו מאמרים
        </div>
      )}
      </div>
      
    </div>
  );
} 