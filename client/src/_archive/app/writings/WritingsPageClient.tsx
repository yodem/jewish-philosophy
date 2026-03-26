"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getWritingsPaginated, getPageBySlug } from "@/data/loaders";
import { Writing, Block } from "@/types";
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
      <div className="flex flex-col">
        {/* Hero Section — Stitch writings design */}
        <section className="bg-muted/50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-12 pb-8">
            <Breadcrumbs items={[
              { label: "בית", href: "/" },
              { label: "כתבים" }
            ]} />

            <BlockRenderer blocks={blocks} />

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mt-4">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-primary mb-2">ספריית כתבים</h1>
                <p className="text-muted-foreground text-lg max-w-2xl">
                  מאגר טקסטים הגותיים, ספרים ומאמרים של הרב שלום צדיק בנושאי פילוסופיה יהודית, מוסר ואתיקה.
                </p>
              </div>
              {meta.pagination.total > 0 && (
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground bg-card/50 p-2 rounded-lg border border-border shadow-sm shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
                  <span>{meta.pagination.total.toLocaleString('he-IL')} פריטים רשומים</span>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Library Container */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-20 w-full">
          <div className="bg-card rounded-xl shadow-lg border border-border overflow-hidden">
            {/* Filter & Search Toolbar */}
            <div className="p-6 border-b border-border bg-muted/50 flex flex-col lg:flex-row gap-6 items-center justify-between">
              {/* Tabs */}
              <div className="flex items-center p-1 bg-muted rounded-lg w-full lg:w-auto">
                <button
                  className={`flex-1 lg:flex-none px-6 py-2 rounded-md text-sm font-bold transition-all ${
                    typeFilter === 'all' ? 'bg-card shadow text-primary' : 'text-muted-foreground hover:text-primary'
                  }`}
                  onClick={() => handleTypeFilter('all')}
                >
                  הכל
                </button>
                <button
                  className={`flex-1 lg:flex-none px-6 py-2 rounded-md text-sm font-medium transition-all ${
                    typeFilter === 'book' ? 'bg-card shadow text-primary' : 'text-muted-foreground hover:text-primary'
                  }`}
                  onClick={() => handleTypeFilter('book')}
                >
                  ספרים
                </button>
                <button
                  className={`flex-1 lg:flex-none px-6 py-2 rounded-md text-sm font-medium transition-all ${
                    typeFilter === 'article' ? 'bg-card shadow text-primary' : 'text-muted-foreground hover:text-primary'
                  }`}
                  onClick={() => handleTypeFilter('article')}
                >
                  מאמרים
                </button>
              </div>

              {/* Search and Sort */}
              <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
                <form onSubmit={handleSearch} className="relative flex-grow min-w-[300px]">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                  <input
                    className="w-full pr-10 pl-4 py-2 border border-input rounded-lg focus:ring-2 focus:ring-ring/20 focus:border-primary outline-none text-sm bg-background text-foreground"
                    placeholder="חיפוש לפי כותרת או מחבר..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    type="text"
                  />
                </form>
                <div className="flex items-center gap-2">
                  <label className="text-xs font-bold text-muted-foreground whitespace-nowrap">מיין לפי:</label>
                  <select
                    className="border-input border rounded-lg py-2 pl-8 pr-4 text-sm text-foreground bg-background focus:ring-ring/20"
                    value={sortFilter}
                    onChange={(e) => handleSortFilter(e.target.value as 'priority' | 'popular')}
                  >
                    <option value="priority">עדיפות</option>
                    <option value="popular">הכי פופולרי</option>
                  </select>
                </div>
              </div>
            </div>

        <div className="overflow-x-auto">
          <Table className="min-w-full text-right">
          <TableHeader>
            <TableRow className="bg-muted text-muted-foreground text-xs font-bold uppercase tracking-wider border-b border-border">
              <TableHead className="px-6 py-4">כותרת הכתב</TableHead>
              <TableHead className="px-6 py-4">מחבר</TableHead>
              <TableHead className="px-6 py-4">קטגוריות</TableHead>
              <TableHead className="px-6 py-4 text-center">צפיות</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-border">
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-10 text-muted-foreground">
                  טוענים...
                </TableCell>
              </TableRow>
            ) : writings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-10 text-muted-foreground">
                  לא נמצאו כתבים
                </TableCell>
              </TableRow>
            ) : (
              writings.map((writing) => (
                <TableRow
                  key={writing.id}
                  className="cursor-pointer hover:bg-accent/10 transition-colors group"
                  onClick={() => router.push(`/writings/${writing.slug}`)}
                >
                  <TableCell className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded flex items-center justify-center shrink-0 ${
                        writing.type === 'book'
                          ? 'bg-blue-100 text-primary'
                          : 'bg-teal-100 text-teal-700'
                      }`}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          {writing.type === 'book' ? (
                            <><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></>
                          ) : (
                            <><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/><line x1="10" x2="8" y1="9" y2="9"/></>
                          )}
                        </svg>
                      </div>
                      <div>
                        <div className="font-bold text-foreground group-hover:text-primary transition-colors">{writing.title}</div>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold mt-1 ${
                          writing.type === 'book'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-teal-100 text-teal-700'
                        }`}>
                          {writing.type === 'book' ? 'ספר' : 'מאמר'}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-5 text-sm text-muted-foreground">{writing.author.name}</TableCell>
                  <TableCell className="px-6 py-5">
                    <LimitedCategoryList categories={writing.categories} />
                  </TableCell>
                  <TableCell className="px-6 py-5 text-center text-sm font-medium text-muted-foreground">{(writing.views || 0).toLocaleString('he-IL')}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
          </Table>
        </div>

            {/* Pagination */}
            {meta.pagination.pageCount > 1 && (
              <div className="p-6 border-t border-border bg-card flex flex-col sm:flex-row items-center justify-between gap-4">
                <span className="text-xs text-muted-foreground font-medium">
                  מציג {((meta.pagination.page - 1) * meta.pagination.pageSize) + 1}-{Math.min(meta.pagination.page * meta.pagination.pageSize, meta.pagination.total)} מתוך {meta.pagination.total.toLocaleString('he-IL')} פריטים
                </span>
                <Pagination
                  currentPage={meta.pagination.page}
                  totalPages={meta.pagination.pageCount}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </div>
        </section>
      </div>
    </ErrorBoundary>
  );
}

