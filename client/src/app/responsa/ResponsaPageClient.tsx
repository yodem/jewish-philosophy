"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getAllResponsas } from "@/data/loaders";
import { Responsa } from "@/types";
import { LimitedCategoryList } from "@/components/shared/LimitedCategoryList";
import Breadcrumbs from "@/components/shared/Breadcrumbs";
import { Pagination } from "@/components/ui/pagination";
import QuestionFormWrapper from "@/components/forms/QuestionFormWrapper";
import ErrorBoundary from "@/components/shared/ErrorBoundary";
import { useDebouncedSearch } from "@/hooks/use-debounced-search";

export default function ResponsaPageClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [responsas, setResponsas] = useState<Responsa[]>([]);
  const [meta, setMeta] = useState<{ pagination: { page: number; pageSize: number; total: number; pageCount: number } }>({
    pagination: { page: 1, pageSize: 10, total: 0, pageCount: 0 }
  });
  const [isLoading, setIsLoading] = useState(true);
  const [sortFilter, setSortFilter] = useState<'recent' | 'popular'>('recent');

  const page = parseInt(searchParams.get("page") || "1", 10);
  const pageSize = 10;

  const { search, debouncedSearchTerm, setSearch } = useDebouncedSearch();

  const handleSortFilter = (filter: 'recent' | 'popular') => {
    setSortFilter(filter);
    router.push('/responsa');
  };

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        const result = await getAllResponsas(page, pageSize, debouncedSearchTerm, sortFilter);
        setResponsas(result.data ?? []);
        if (result.meta) setMeta(result.meta);
      } catch (error) {
        console.error("Error fetching responsas:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [page, debouncedSearchTerm, sortFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/responsa?search=${encodeURIComponent(search)}`);
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    router.push(`/responsa?${params.toString()}`);
  };

  return (
    <ErrorBoundary>
      <div className="flex flex-col">
        {/* Page Header */}
        <section className="bg-muted/50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 md:pt-12 pb-8">
            <Breadcrumbs items={[
              { label: "בית", href: "/" },
              { label: "שו״ת" }
            ]} />

            <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6 mt-4">
              <div>
                <h1 className="text-4xl font-bold text-foreground mb-2">שאלות ותשובות</h1>
                <p className="text-muted-foreground">מאגר השו&quot;ת המרכזי למחשבת ישראל ופילוסופיה יהודית</p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <div className="bg-card rounded-xl shadow-sm border border-border p-1 flex">
                  <button
                    className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
                      sortFilter === 'recent' ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:bg-muted'
                    }`}
                    onClick={() => handleSortFilter('recent')}
                  >
                    חדש
                  </button>
                  <button
                    className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
                      sortFilter === 'popular' ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:bg-muted'
                    }`}
                    onClick={() => handleSortFilter('popular')}
                  >
                    פופולרי
                  </button>
                </div>
              </div>
            </div>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="relative">
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground/70"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
              </div>
              <input
                className="w-full bg-card border border-border shadow-md rounded-2xl py-4 pr-12 pl-4 focus:ring-2 focus:ring-ring text-lg outline-none text-foreground"
                placeholder="חיפוש בשאלות ותשובות..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                type="text"
              />
            </form>
          </div>
        </section>

        {/* Content Card */}
        <section className="max-w-6xl mx-auto px-4 pb-8 w-full">
          <div className="bg-card rounded-3xl shadow-lg overflow-hidden border border-border">
            {/* Table Header (Desktop) */}
            <div className="hidden md:grid grid-cols-12 gap-4 px-8 py-5 bg-muted border-b border-border text-muted-foreground font-bold text-sm">
              <div className="col-span-6">השאלה</div>
              <div className="col-span-3">קטגוריות</div>
              <div className="col-span-1 text-center">תגובות</div>
              <div className="col-span-1 text-center">צפיות</div>
              <div className="col-span-1 text-left">תאריך</div>
            </div>

            {/* List of Questions */}
            <div className="divide-y divide-border">
              {isLoading ? (
                <>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="grid grid-cols-1 md:grid-cols-12 gap-4 px-6 md:px-8 py-6 animate-pulse">
                      <div className="col-span-1 md:col-span-6"><div className="h-5 bg-muted rounded w-3/4" /></div>
                      <div className="col-span-1 md:col-span-3 flex gap-2"><div className="h-5 bg-muted rounded w-16" /><div className="h-5 bg-muted rounded w-12" /></div>
                      <div className="col-span-1 md:col-span-1 flex justify-center"><div className="h-5 bg-muted rounded w-8" /></div>
                      <div className="col-span-1 md:col-span-1 flex justify-center"><div className="h-5 bg-muted rounded w-8" /></div>
                      <div className="col-span-1 md:col-span-1 flex justify-end"><div className="h-5 bg-muted rounded w-16" /></div>
                    </div>
                  ))}
                </>
              ) : responsas.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground/70">
                  לא נמצאו שאלות
                </div>
              ) : (
                responsas.map((responsa) => (
                  <div
                    key={responsa.id}
                    className="px-4 md:px-8 py-4 md:py-6 hover:bg-accent/10 transition-colors cursor-pointer group"
                    onClick={() => router.push(`/responsa/${responsa.slug}`)}
                  >
                    {/* Desktop: grid layout */}
                    <div className="hidden md:grid grid-cols-12 gap-4 items-center">
                      <div className="col-span-6">
                        <h3 className="text-lg font-bold text-foreground group-hover:text-accent transition-colors">
                          {responsa.title}
                        </h3>
                      </div>
                      <div className="col-span-3 flex flex-wrap gap-2 items-center">
                        <LimitedCategoryList categories={responsa.categories} isSelectable={false} />
                      </div>
                      <div className="col-span-1 flex flex-col items-center gap-1 text-muted-foreground/70">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z"/></svg>
                        <span className="text-sm font-medium">{responsa.comments?.length || 0}</span>
                      </div>
                      <div className="col-span-1 flex flex-col items-center gap-1 text-muted-foreground/70">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                        <span className="text-sm font-medium">{(responsa.views || 0).toLocaleString('he-IL')}</span>
                      </div>
                      <div className="col-span-1 flex items-center justify-end text-muted-foreground/70 text-sm">
                        {responsa.publishedAt && (
                          <span>{new Date(responsa.publishedAt).toLocaleDateString('he-IL')}</span>
                        )}
                      </div>
                    </div>

                    {/* Mobile: compact card layout */}
                    <div className="md:hidden">
                      <h3 className="text-base font-bold text-foreground group-hover:text-accent transition-colors">
                        {responsa.title}
                      </h3>
                      {responsa.categories && responsa.categories.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          <LimitedCategoryList categories={responsa.categories} isSelectable={false} />
                        </div>
                      )}
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z"/></svg>
                          {responsa.comments?.length || 0}
                        </span>
                        {responsa.views != null && (
                          <span className="inline-flex items-center gap-1">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                            {(responsa.views || 0).toLocaleString('he-IL')}
                          </span>
                        )}
                        {responsa.publishedAt && (
                          <span>{new Date(responsa.publishedAt).toLocaleDateString('he-IL')}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Pagination */}
            {meta.pagination.pageCount > 1 && (
              <div className="bg-muted px-8 py-6 flex items-center justify-between border-t border-border">
                <Pagination
                  currentPage={meta.pagination.page}
                  totalPages={meta.pagination.pageCount}
                  onPageChange={handlePageChange}
                />
                <div className="hidden sm:block text-sm text-muted-foreground font-medium">
                  מציג {((meta.pagination.page - 1) * meta.pagination.pageSize) + 1}-{Math.min(meta.pagination.page * meta.pagination.pageSize, meta.pagination.total)} מתוך {meta.pagination.total.toLocaleString('he-IL')} שאלות
                </div>
              </div>
            )}
          </div>

          {/* Dark CTA Section */}
          <div className="mt-12 bg-navbar rounded-3xl p-8 relative overflow-hidden shadow-lg">
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="text-center md:text-right">
                <h2 className="text-2xl font-bold text-white mb-2">לא מצאת תשובה לשאלתך?</h2>
                <p className="text-white/70">צוות המחקר שלנו ישמח לסייע בכל סוגיה פילוסופית או הגותית.</p>
              </div>
              <QuestionFormWrapper />
            </div>
          </div>
        </section>
      </div>
    </ErrorBoundary>
  );
}
