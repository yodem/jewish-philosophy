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
import { CategoryBadge } from "@/components/CategoryBadge";
import Breadcrumbs from "@/components/Breadcrumbs";
import { Pagination } from "@/components/ui/pagination";
import BlockRenderer from "@/components/blocks/BlockRenderer";
import ErrorBoundary from "@/components/ErrorBoundary";

export default function WritingsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [writings, setWritings] = useState<Writing[]>([]);
  const [meta, setMeta] = useState<{ pagination: { page: number; pageSize: number; total: number; pageCount: number } }>({
    pagination: { page: 1, pageSize: 12, total: 0, pageCount: 0 }
  });
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [typeFilter, setTypeFilter] = useState<'all' | 'book' | 'article'>(
    (searchParams.get("type") as 'all' | 'book' | 'article') || 'all'
  );
  const [blocks, setBlocks] = useState<Block[]>([]);

  const page = parseInt(searchParams.get("page") || "1", 10);
  const pageSize = 12;

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
        // TODO: Update this when we implement search and filtering in the backend
        const result = await getWritingsPaginated(page, pageSize);
        let filteredWritings = result;
        
        // Client-side filtering for now
        if (typeFilter !== 'all') {
          filteredWritings = result.filter(writing => writing.type === typeFilter);
        }
        
        if (search) {
          filteredWritings = filteredWritings.filter(writing => 
            writing.title.toLowerCase().includes(search.toLowerCase()) ||
            writing.description.toLowerCase().includes(search.toLowerCase())
          );
        }

        setWritings(filteredWritings);
        // For now, we'll use simple pagination calculation
        const total = filteredWritings.length;
        const pageCount = Math.ceil(total / pageSize);
        setMeta({
          pagination: { page, pageSize, total, pageCount }
        });
      } catch (error) {
        console.error("Error fetching writings:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [page, search, typeFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (typeFilter !== 'all') params.set("type", typeFilter);
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
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>כותרת</TableHead>
              <TableHead>סוג</TableHead>
              <TableHead>מחבר</TableHead>
              <TableHead>קטגוריות</TableHead>
              <TableHead>תאריך פרסום</TableHead>
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
                  <TableCell className="font-medium">{writing.title}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      writing.type === 'book' 
                        ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' 
                        : 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200'
                    }`}>
                      {writing.type === 'book' ? 'ספר' : 'מאמר'}
                    </span>
                  </TableCell>
                  <TableCell>{writing.author.name}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {writing.categories?.map((category) => (
                        <CategoryBadge key={category.id} category={category} />
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    {new Date(writing.publishedAt).toLocaleDateString('he-IL')}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
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