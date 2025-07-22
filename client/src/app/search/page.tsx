import React, { Suspense } from 'react';
import { Metadata } from 'next';
import { SearchFilters } from '@/data/services';
import SearchResults from '@/components/SearchResults';
import BlockRenderer from '@/components/blocks/BlockRenderer';
import { getPageBySlug } from '@/data/loaders';

export const metadata: Metadata = {
  title: 'חיפוש תוכן',
  description: 'חפש בכל התוכן באתר - בלוגים, סרטונים, רשימות נגינה ושו"ת',
};

interface SearchPageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  // Fetch search page content
  const pageRes = await getPageBySlug("search");
  const data = pageRes?.data;
  const blocks = data?.[0]?.blocks || [];

  // Parse search parameters
  const filters: SearchFilters = {
    query: typeof searchParams.q === 'string' ? searchParams.q : undefined,
    contentType: typeof searchParams.type === 'string' ? 
      searchParams.type as SearchFilters['contentType'] : 'all',
    category: typeof searchParams.category === 'string' ? searchParams.category : undefined,
    page: typeof searchParams.page === 'string' ? parseInt(searchParams.page) : 1,
    pageSize: 10,
  };

  return (
    <div className='flex flex-col '>
        <BlockRenderer blocks={blocks} />
    <div className="w-full max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">תוצאות חיפוש</h1>
        {filters.query && (
          <p className="text-lg text-gray-600">
            תוצאות עבור: <span className="font-semibold">&ldquo;{filters.query}&rdquo;</span>
          </p>
        )}
      </div>

      <Suspense fallback={<SearchResultsSkeleton />}>
        <SearchResults filters={filters} />
      </Suspense>
    </div>
    </div>
  
);
}

function SearchResultsSkeleton() {
  return (
    <div className="space-y-6">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="bg-white rounded-lg shadow-md border p-6 animate-pulse">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            </div>
            <div className="h-20 w-20 bg-gray-200 rounded"></div>
          </div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
          <div className="flex gap-2 mt-4">
            <div className="h-6 bg-gray-200 rounded w-16"></div>
            <div className="h-6 bg-gray-200 rounded w-20"></div>
          </div>
        </div>
      ))}
    </div>
  );
} 