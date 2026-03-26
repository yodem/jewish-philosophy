"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getAllTerms } from "@/data/loaders";
import { Term } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Breadcrumbs from "@/components/shared/Breadcrumbs";
import { Pagination } from "@/components/ui/pagination";
import { TermsGridSkeleton } from "@/components/ui/skeleton";
import TermCard from "@/components/terms/TermCard";
import { useDebouncedSearch } from "@/hooks/use-debounced-search";

export default function TermsPageClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [terms, setTerms] = useState<Term[]>([]);
  const [meta, setMeta] = useState<{ pagination: { page: number; pageSize: number; total: number; pageCount: number } }>({
    pagination: { page: 1, pageSize: 12, total: 0, pageCount: 0 }
  });
  const [isLoading, setIsLoading] = useState(true);

  const page = parseInt(searchParams.get("page") || "1", 10);
  const pageSize = 12;

  const { search, debouncedSearchTerm, setSearch } = useDebouncedSearch();

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        const result = await getAllTerms(page, pageSize, debouncedSearchTerm);
        setTerms(result.data);
        setMeta(result.meta);
      } catch (error) {
        console.error("Error fetching terms:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [page, debouncedSearchTerm]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/terms?search=${encodeURIComponent(search)}`);
  };

  const handleSearchInputChange = (value: string) => {
    setSearch(value);
    if (value === '') {
      router.replace('/terms');
    }
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams();
    if (debouncedSearchTerm) {
      params.set("search", debouncedSearchTerm);
    }
    params.set("page", newPage.toString());
    router.push(`/terms?${params.toString()}`);
  };

  return (
    <div className="w-full flex flex-col items-center overflow-hidden">
      {/* Dark gradient hero section */}
      <section className="w-full bg-gradient-to-br from-primary to-primary/80 py-16 md:py-24 px-4 text-center">
        <div className="max-w-6xl mx-auto">
          <Breadcrumbs
            items={[
              { label: "בית", href: "/" },
              { label: "מושגים" }
            ]}
            className="justify-center mb-6 text-primary-foreground/70"
          />
          <h1 className="text-4xl md:text-5xl font-bold text-primary-foreground mb-4 tracking-tight">
            מושגים בפילוסופיה דתית
          </h1>
          <p className="text-lg text-primary-foreground/70 max-w-2xl mx-auto leading-relaxed">
            מילון מושגים מקיף בפילוסופיה דתית -- מהרמב״ם ועד ההוגים המודרניים
          </p>
        </div>
      </section>

      {/* Search + Grid content */}
      <div className="w-full max-w-7xl mx-auto px-6 py-12">
        <div className="space-y-8">
          <div className="mb-8">
            <form onSubmit={handleSearch} className="flex gap-2 mb-6">
              <Input
                placeholder="חפשו מושג..."
                value={search}
                onChange={(e) => handleSearchInputChange(e.target.value)}
                className="flex-1 text-right"
                dir="rtl"
              />
              <Button type="submit">חפשו</Button>
            </form>
          </div>

          {isLoading ? (
            <TermsGridSkeleton count={12} />
          ) : terms?.length === 0 ? (
            <div className="text-center py-20">
              <h2 className="text-xl text-muted-foreground mb-4">לא נמצאו מושגים</h2>
              {search && (
                <p className="text-muted-foreground">
                  נסו חיפוש עם מילות מפתח אחרות
                </p>
              )}
            </div>
          ) : (
            <>
              {/* Terms Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8 mb-8">
                {terms?.map((term) => (
                  <TermCard key={term.id} term={term} />
                ))}
              </div>

              {/* Pagination */}
              {meta?.pagination?.pageCount > 1 && (
                <div className="flex justify-center mt-8">
                  <Pagination
                    currentPage={meta.pagination.page}
                    totalPages={meta.pagination.pageCount}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
