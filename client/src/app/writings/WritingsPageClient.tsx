"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getWritingsPaginated, getPageBySlug } from "@/data/loaders";
import { Writing, Block } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { LimitedCategoryList } from "@/components/LimitedCategoryList";
import Breadcrumbs from "@/components/Breadcrumbs";
import { Pagination } from "@/components/ui/pagination";
import BlockRenderer from "@/components/blocks/BlockRenderer";
import ErrorBoundary from "@/components/ErrorBoundary";
import { useDebouncedSearch } from "@/hooks/use-debounced-search";

export default function WritingsPageClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [writings, setWritings] = useState<Writing[]>([]);
  const [meta, setMeta] = useState<{ pagination: { page: number; pageSize: number; total: number; pageCount: number } }>({
    pagination: { page: 1, pageSize: 12, total: 0, pageCount: 0 }
  });
  const [isLoading, setIsLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<'all' | 'book' | 'article'>(
    (searchParams.get("type") as 'all' | 'book' | 'article') || 'all'
  );
  const [sortFilter, setSortFilter] = useState<'priority' | 'popular'>('priority');
  const [blocks, setBlocks] = useState<Block[]>([]);

  const page = parseInt(searchParams.get("page") || "1", 10);
  const pageSize = 12;
  
  // Use the debounced search hook (it automatically reads from URL search parameter)
  const { search, debouncedSearchTerm, setSearch } = useDebouncedSearch();

  useEffect(() => {
    async function fetchPageData() {
      try {
        const pageRes = await getPageBySlug("writings");
        const pageData = pageRes?.data;
        setBlocks(pageData?.[0]?.blocks || []);
      } catch (error) {
        console.error("Error fetching page data:", error);
      }
    }
    fetchPageData();
  }, []);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        // Server-side filtering and sorting with proper pagination
        const result = await getWritingsPaginated(
          page, 
          pageSize, 
          typeFilter, 
          debouncedSearchTerm || undefined,
          sortFilter
        );

        setWritings(result.data);
        setMeta(result.meta);
      } catch (error) {
        console.error("Error fetching writings:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [page, debouncedSearchTerm, typeFilter, sortFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (typeFilter !== 'all') params.set("type", typeFilter);
    params.set("page", "1"); // Reset to first page when searching
    router.push(`/writings?${params.toString()}`);
  };

  const handleTypeFilter = (type: 'all' | 'book' | 'article') => {
    setTypeFilter(type);
    const params = new URLSearchParams(searchParams.toString());
    if (type === 'all') {
      params.delete("type");
    } else {
      params.set("type", type);
    }
    params.set("page", "1"); // Reset to first page
    router.push(`/writings?${params.toString()}`);
  };

  // Handle sort filter change
  const handleSortFilter = (filter: 'priority' | 'popular') => {
    setSortFilter(filter);
    // Reset to page 1 when changing filter
    router.push('/writings');
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    router.push(`/writings?${params.toString()}`);
  };

  return (
    <ErrorBoundary>
      <div className="container mx-auto py-8 px-4">
        <Breadcrumbs items={[
          { label: "בית", href: "/" },
          { label: "כתבים" }
        ]} />

        <BlockRenderer blocks={blocks} />

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">כתבים</h1>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          חפשו בארכיון הכתבים - ספרים ומאמרים.
        </p>
        
        <div className="flex flex-col gap-4 mb-6">
          <form onSubmit={handleSearch} className="flex gap-2">
            <Input
              placeholder="חפשו כתב..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1"
            />
            <Button type="submit">חפשו</Button>
          </form>
          
          <div className="flex flex-col gap-4">
            <div className="flex gap-2">
              <Button 
                variant={typeFilter === 'all' ? 'default' : 'outline'}
                onClick={() => handleTypeFilter('all')}
              >
                הכל
              </Button>
              <Button 
                variant={typeFilter === 'book' ? 'default' : 'outline'}
                onClick={() => handleTypeFilter('book')}
              >
                ספרים
              </Button>
              <Button 
                variant={typeFilter === 'article' ? 'default' : 'outline'}
                onClick={() => handleTypeFilter('article')}
              >
                מאמרים
              </Button>
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant={sortFilter === 'priority' ? 'default' : 'outline'}
                onClick={() => handleSortFilter('priority')}
              >
                עדיפות
              </Button>
              <Button 
                variant={sortFilter === 'popular' ? 'default' : 'outline'}
                onClick={() => handleSortFilter('popular')}
              >
                פופולריות
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-md border overflow-hidden">
        <div className="overflow-x-auto">
          <Table className="min-w-full">
          <TableHeader>
            <TableRow>
              <TableHead>כותרת</TableHead>
              <TableHead>סוג</TableHead>
              <TableHead>מחבר</TableHead>
              <TableHead>קטגוריות</TableHead>
              <TableHead>מספר צפיות</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10">
                  טוענים...
                </TableCell>
              </TableRow>
            ) : writings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10">
                  לא נמצאו כתבים
                </TableCell>
              </TableRow>
            ) : (
              writings.map((writing) => (
                <TableRow 
                  key={writing.id} 
                  className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                  onClick={() => router.push(`/writings/${writing.slug}`)}
                >
                  <TableCell className="font-medium break-words max-w-xs">{writing.title}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      writing.type === 'book' 
                        ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' 
                        : 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200'
                    }`}>
                      {writing.type === 'book' ? 'ספר' : 'מאמר'}
                    </span>
                  </TableCell>
                  <TableCell className="break-words">{writing.author.name}</TableCell>
                  <TableCell>
                    <LimitedCategoryList categories={writing.categories} />
                  </TableCell>
                  <TableCell>{writing.views || 0}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
          </Table>
        </div>
      </div>

      {meta.pagination.pageCount > 1 && (
        <div className="flex justify-center mt-6">
          <Pagination
            currentPage={meta.pagination.page}
            totalPages={meta.pagination.pageCount}
            onPageChange={handlePageChange}
          />
        </div>
      )}
      </div>
    </ErrorBoundary>
  );
}

