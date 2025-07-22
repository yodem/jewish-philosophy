"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { universalSearch, getAllCategories } from "@/data/loaders";
import { Category, Blog, Responsa } from "@/types";
import SearchCard from "@/components/SearchCard";
import SearchResults from "@/components/SearchResults";
import Breadcrumbs from "@/components/Breadcrumbs";

function SearchPageContent() {
  const searchParams = useSearchParams();
  const [results, setResults] = useState<{
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
  }>({ blogs: [], playlists: [], videos: [], responsas: [] });
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentQuery, setCurrentQuery] = useState("");

  const contentTypes = [
    { id: "blog", name: "מאמרים", value: "blog" },
    { id: "playlist", name: "פלייליסטים", value: "playlist" },
    { id: "video", name: "סרטונים", value: "video" },
    { id: "responsa", name: "שאלות ותשובות", value: "responsa" }
  ];

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const cats = await getAllCategories();
        setCategories(cats);
      } catch (error) {
        console.error("Error loading categories:", error);
      }
    };
    loadCategories();
  }, []);

  useEffect(() => {
    const initialQuery = searchParams.get("q") || "";
    const initialContentType = searchParams.get("type") || "";
    const initialCategory = searchParams.get("category") || "";

    if (initialQuery) {
      setCurrentQuery(initialQuery);
      handleSearch(initialQuery, {
        contentType: initialContentType,
        category: initialCategory
      });
    }
  }, [searchParams]);

  const handleSearch = async (query: string, filters: Record<string, string>) => {
    setCurrentQuery(query);
    
    if (!query.trim()) {
      setResults({ blogs: [], playlists: [], videos: [], responsas: [] });
      return;
    }

    setIsLoading(true);
    try {
      const searchResults = await universalSearch(
        query,
        filters.contentType,
        filters.category
      );
      setResults(searchResults);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "חיפוש" },
        ]}
      />

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">חיפוש תוכן</h1>
        <p className="text-gray-600 mb-6">
          חפשו בכל התוכן שלנו - מאמרים, פלייליסטים, סרטונים ושאלות ותשובות
        </p>
      </div>

      <SearchCard
        onSearch={handleSearch}
        placeholder="חפש בכל התוכן..."
        title="חיפוש מתקדם"
        filters={{
          categories: categories.map(cat => ({
            id: cat.id.toString(),
            name: cat.name,
            value: cat.id.toString()
          })),
          contentTypes: contentTypes
        }}
      />

      <div className="mt-8">
        <SearchResults
          results={results}
          isLoading={isLoading}
          query={currentQuery}
        />
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto py-8 px-4">
        <div className="text-center">טוען...</div>
      </div>
    }>
      <SearchPageContent />
    </Suspense>
  );
}