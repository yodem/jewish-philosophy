import React, { Suspense } from 'react';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { SearchFilters } from '@/data/services';
import SearchResults from '@/components/SearchResults';
import BlockRenderer from '@/components/blocks/BlockRenderer';
import { getPageBySlug } from '@/data/loaders';
import { Block } from '@/types';
import { generateMetadata } from '@/lib/metadata';
import Breadcrumbs from '@/components/Breadcrumbs';

// Force dynamic rendering to prevent build-time data fetching issues
export const dynamic = 'force-dynamic';

export const metadata: Metadata = generateMetadata({
  title: 'חיפוש | שלום צדיק - פילוסופיה יהודית',
  description: 'פלטפורמה מקוונת ללימוד פילוסופיה יהודית',
  url: '/search',
  type: 'website',
  keywords: 'חיפוש פילוסופיה יהודית, מנוע חיפוש יהודי, חיפוש הרמב"ם, חיפוש מושגים פילוסופיים, חיפוש מאמרים, פילוסופיה דתית, מבוא לפילוסופיה יהודית, מורה נבוכים, כוזרי, שלום צדיק',
});

interface SearchPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  // Fetch search page content with error handling
  let blocks: Block[] = [];
  try {
    const pageRes = await getPageBySlug("search");
    const data = pageRes?.data;
    blocks = data?.[0]?.blocks || [];
  } catch (error) {
    console.warn('Failed to fetch search page content:', error);
    // Continue with empty blocks if data fetching fails
  }

  // Parse search parameters
  const resolvedSearchParams = await searchParams;
  
  // Parse sort parameter
  let sort: string[] = ['publishedAt:desc']; // default sort
  if (typeof resolvedSearchParams.sort === 'string') {
    sort = resolvedSearchParams.sort.split(',').filter(Boolean);
  }
  
  // Get content type - default to 'all' if not provided
  const contentType = typeof resolvedSearchParams.type === 'string' ?
    resolvedSearchParams.type as SearchFilters['contentType'] : 'all';

  // Validate content type - allow 'all' as a valid option
  if (!contentType || !['video', 'playlist', 'blog', 'responsa', 'writing', 'all'].includes(contentType)) {
    // Redirect to default content type ('all') if invalid
    const params = new URLSearchParams();
    if (typeof resolvedSearchParams.q === 'string') {
      params.set('q', resolvedSearchParams.q);
    }
    params.set('type', 'all');
    if (typeof resolvedSearchParams.category === 'string') {
      params.set('category', resolvedSearchParams.category);
    }
    if (typeof resolvedSearchParams.sort === 'string') {
      params.set('sort', resolvedSearchParams.sort);
    }
    redirect(`/search?${params.toString()}`);
  }

  const filters: SearchFilters = {
    query: typeof resolvedSearchParams.q === 'string' ? resolvedSearchParams.q : undefined,
    contentType: contentType,
    category: typeof resolvedSearchParams.category === 'string' ? resolvedSearchParams.category : 'all',
    page: 1, // Always start from page 1
    pageSize: 10,
    sort: sort,
  };

  return (
    <div className='flex flex-col w-full'>
        <BlockRenderer blocks={blocks} />
        <div className="container mx-auto px-4">
          <Breadcrumbs
            items={[
              { label: "בית", href: "/" },
              { label: "חיפוש" }
            ]}
          />
        </div>
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