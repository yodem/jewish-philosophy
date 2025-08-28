"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getAllTerms } from "@/data/loaders";
import { Term, Block } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Breadcrumbs from "@/components/Breadcrumbs";
import { Pagination } from "@/components/ui/pagination";
import { TermsGridSkeleton } from "@/components/ui/skeleton";
import BlockRenderer from "@/components/blocks/BlockRenderer";
import TermCard from "@/components/TermCard";

interface TermsPageClientProps {
  blocks?: Block[];
}

export default function TermsPageClient({ blocks = [] }: TermsPageClientProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [terms, setTerms] = useState<Term[]>([]);
  const [meta, setMeta] = useState<{ pagination: { page: number; pageSize: number; total: number; pageCount: number } }>({
    pagination: { page: 1, pageSize: 12, total: 0, pageCount: 0 }
  });
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchParams.get("search") || "");

  const page = parseInt(searchParams.get("page") || "1", 10);
  const pageSize = 12;
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Debounced search effect
  useEffect(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(() => {
      setDebouncedSearchTerm(search);
    }, 300); // 300ms debounce delay

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [search]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  // Fetch data when debounced search or page changes
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
    // Update URL immediately on form submission
    router.push(`/terms?search=${encodeURIComponent(search)}`);
  };

  const handleSearchInputChange = (value: string) => {
    setSearch(value);
    // If search is cleared, update URL immediately
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
    <div className="container mx-auto py-8 px-4">
      <Breadcrumbs items={[
        { label: 'בית', href: '/' },
        { label: 'מושגים' }
      ]} />
      <BlockRenderer blocks={blocks} />
      <div className="space-y-8">
        <div className="mb-8">
          <form onSubmit={handleSearch} className="flex gap-2 mb-6">
          <Input
            placeholder="חפש מושג..."
            value={search}
            onChange={(e) => handleSearchInputChange(e.target.value)}
            className="flex-1 text-right"
            dir="rtl"
          />
          <Button type="submit">חפש</Button>
        </form>
      </div>

      {isLoading ? (
        <TermsGridSkeleton count={12} />
      ) : terms?.length === 0 ? (
        <div className="text-center py-20">
          <h2 className="text-xl text-gray-500 mb-4">לא נמצאו מושגים</h2>
          {search && (
            <p className="text-gray-400">
              נסה חיפוש עם מילות מפתח אחרות
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
  );
}
