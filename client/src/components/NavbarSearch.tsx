"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { universalSearch, getAllCategories } from "@/data/loaders";
import { Category } from "@/types";
import Link from "next/link";

interface NavbarSearchProps {
  className?: string;
}

export const NavbarSearch: React.FC<NavbarSearchProps> = ({ className = "" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [contentType, setContentType] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [results, setResults] = useState<{
    blogs: any[];
    playlists: any[];
    videos: any[];
    responsas: any[];
  }>({ blogs: [], playlists: [], videos: [], responsas: [] });
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

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
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = async (searchQuery?: string) => {
    const searchTerm = searchQuery || query;
    if (!searchTerm.trim()) {
      setResults({ blogs: [], playlists: [], videos: [], responsas: [] });
      return;
    }

    setIsLoading(true);
    try {
      const searchResults = await universalSearch(searchTerm, contentType, categoryId);
      setResults(searchResults);
      setIsOpen(true);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
  };

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query.trim()) {
        handleSearch(query);
      } else {
        setResults({ blogs: [], playlists: [], videos: [], responsas: [] });
        setIsOpen(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query, contentType, categoryId]);

  const handleFilterChange = () => {
    if (query.trim()) {
      handleSearch();
    }
  };

  const hasResults = results.blogs.length > 0 || 
                    results.playlists.length > 0 || 
                    results.videos.length > 0 || 
                    results.responsas.length > 0;

  const totalResults = results.blogs.length + results.playlists.length + results.videos.length + results.responsas.length;

  const clearSearch = () => {
    setQuery("");
    setContentType("");
    setCategoryId("");
    setResults({ blogs: [], playlists: [], videos: [], responsas: [] });
    setIsOpen(false);
  };

  const navigateToSearch = () => {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (contentType) params.set("type", contentType);
    if (categoryId) params.set("category", categoryId);
    
    router.push(`/search?${params.toString()}`);
    setIsOpen(false);
  };

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      <div className="flex items-center gap-2 bg-white rounded-lg p-2 shadow-sm">
        <Input
          type="text"
          placeholder="חפש תוכן..."
          value={query}
          onChange={handleInputChange}
          className="border-0 shadow-none focus-visible:ring-0 min-w-[200px]"
        />
        
        <Select
          value={contentType}
          onChange={(e) => {
            setContentType(e.target.value);
            handleFilterChange();
          }}
          className="min-w-[100px] h-8 text-xs"
        >
          <option value="">כל התוכן</option>
          {contentTypes.map((type) => (
            <option key={type.id} value={type.value}>
              {type.name}
            </option>
          ))}
        </Select>

        <Select
          value={categoryId}
          onChange={(e) => {
            setCategoryId(e.target.value);
            handleFilterChange();
          }}
          className="min-w-[100px] h-8 text-xs"
        >
          <option value="">כל הקטגוריות</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id.toString()}>
              {category.name}
            </option>
          ))}
        </Select>

        {query && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearSearch}
            className="h-8 w-8 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {isOpen && (query || isLoading) && (
        <Card className="absolute top-full left-0 right-0 mt-2 max-h-96 overflow-y-auto shadow-lg z-50 bg-white">
          {isLoading ? (
            <div className="p-4 text-center">
              <div className="animate-pulse">מחפש...</div>
            </div>
          ) : hasResults ? (
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium">נמצאו {totalResults} תוצאות</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={navigateToSearch}
                  className="text-xs"
                >
                  צפה בכל התוצאות
                </Button>
              </div>

              {/* Quick Results Preview */}
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {results.blogs.slice(0, 2).map((blog) => (
                  <Link
                    key={blog.id}
                    href={`/blog/${blog.slug}`}
                    onClick={() => setIsOpen(false)}
                    className="block p-2 rounded hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">מאמר</Badge>
                      <span className="font-medium text-sm">{blog.title}</span>
                    </div>
                  </Link>
                ))}

                {results.playlists.slice(0, 2).map((playlist) => (
                  <Link
                    key={playlist.id}
                    href={`/playlists/${playlist.slug}`}
                    onClick={() => setIsOpen(false)}
                    className="block p-2 rounded hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">פלייליסט</Badge>
                      <span className="font-medium text-sm">{playlist.title}</span>
                    </div>
                  </Link>
                ))}

                {results.videos.slice(0, 2).map((video) => (
                  <Link
                    key={video.id}
                    href={`/playlists/${typeof video.playlist === 'object' ? video.playlist.slug : video.playlist}/${video.slug}`}
                    onClick={() => setIsOpen(false)}
                    className="block p-2 rounded hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">סרטון</Badge>
                      <span className="font-medium text-sm">{video.title}</span>
                    </div>
                  </Link>
                ))}

                {results.responsas.slice(0, 2).map((responsa) => (
                  <Link
                    key={responsa.id}
                    href={`/responsa/${responsa.slug}`}
                    onClick={() => setIsOpen(false)}
                    className="block p-2 rounded hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">שאלה ותשובה</Badge>
                      <span className="font-medium text-sm">{responsa.title}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ) : query ? (
                         <div className="p-4 text-center text-gray-500">
               לא נמצאו תוצאות עבור &quot;{query}&quot;
             </div>
          ) : null}
        </Card>
      )}
    </div>
  );
};

export default NavbarSearch;