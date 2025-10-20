"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getAllResponsas } from "@/data/loaders";
import { Responsa } from "@/types";
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
import QuestionFormWrapper from "@/components/QuestionFormWrapper";
import { TableRowSkeleton } from "@/components/ui/skeleton";
import ErrorBoundary from "@/components/ErrorBoundary";
import { useDebouncedSearch } from "@/hooks/use-debounced-search";

export default function ResponsaPageClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [responsas, setResponsas] = useState<Responsa[]>([]);
  const [meta, setMeta] = useState<{ pagination: { page: number; pageSize: number; total: number; pageCount: number } }>({
    pagination: { page: 1, pageSize: 10, total: 0, pageCount: 0 }
  });
  const [isLoading, setIsLoading] = useState(true);

  const page = parseInt(searchParams.get("page") || "1", 10);
  const pageSize = 10;
  
  // Use the debounced search hook
  const { search, debouncedSearchTerm, setSearch } = useDebouncedSearch();

  // Fetch data when debounced search or page changes
  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        const result = await getAllResponsas(page, pageSize, debouncedSearchTerm);
        setResponsas(result.data);
        setMeta(result.meta);
      } catch (error) {
        console.error("Error fetching responsas:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [page, debouncedSearchTerm]);

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
      <div className="container mx-auto py-8">
        <Breadcrumbs items={[
          { label: "בית", href: "/" },
          { label: "שו״ת" }
        ]} />

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">שאלות ותשובות</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            חפשו בארכיון השאלות והתשובות או הוסיפו שאלה משלכם.
          </p>
        
        <form onSubmit={handleSearch} className="flex gap-2 mb-6">
          <Input
            placeholder="חפשו שאלה..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1"
          />
          <Button type="submit">חפשו</Button>
        </form>
      </div>

      <div className="rounded-md border overflow-hidden">
        <div className="overflow-x-auto">
          <Table className="min-w-full">
          <TableHeader>
            <TableRow>
              <TableHead>כותרת</TableHead>
              <TableHead>קטגוריות</TableHead>
              <TableHead>מספר תגובות</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <>
                <TableRowSkeleton columns={3} />
                <TableRowSkeleton columns={3} />
                <TableRowSkeleton columns={3} />
                <TableRowSkeleton columns={3} />
                <TableRowSkeleton columns={3} />
              </>
            ) : responsas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-10">
                  לא נמצאו שאלות
                </TableCell>
              </TableRow>
            ) : (
              responsas.map((responsa) => (
                <TableRow 
                  key={responsa.id} 
                  className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                  onClick={() => router.push(`/responsa/${responsa.slug}`)}
                >
                  <TableCell className="font-medium break-words max-w-xs">{responsa.title}</TableCell>
                  <TableCell>
                    <LimitedCategoryList categories={responsa.categories} isSelectable={false} />
                  </TableCell>
                  <TableCell>{responsa.comments?.length || 0}</TableCell>
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
      
        <div className="mt-12">
          <div className="max-w-3xl mx-auto">
            <QuestionFormWrapper />
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}

