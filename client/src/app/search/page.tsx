import React, { Suspense } from 'react';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { SearchFilters } from '@/data/services';
import SearchResults from '@/components/content/SearchResults';
import BlockRenderer from '@/components/home/BlockRenderer';
import { getPageBySlug } from '@/data/loaders';
import { Block } from '@/types';
import { generateMetadata } from '@/lib/metadata';
import Breadcrumbs from '@/components/shared/Breadcrumbs';
import { Skeleton } from '@/components/ui/skeleton';

export const metadata: Metadata = generateMetadata({
  title: 'חיפוש | שלום צדיק - פילוסופיה דתית',
  description: 'פלטפורמה מקוונת ללימוד פילוסופיה דתית',
  url: '/search',
  type: 'website',
  keywords: 'חיפוש פילוסופיה דתית, מנוע חיפוש יהודי, חיפוש הרמב"ם, חיפוש מושגים פילוסופיים, חיפוש מאמרים, פילוסופיה דתית, מבוא לפילוסופיה דתית, מורה נבוכים, כוזרי, שלום צדיק',
});

interface SearchPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  let blocks: Block[] = [];
  try {
    const pageRes = await getPageBySlug("search");
    const data = pageRes?.data;
    blocks = data?.[0]?.blocks || [];
  } catch (error) {
    console.warn('Failed to fetch search page content:', error);
  }

  const resolvedSearchParams = await searchParams;

  let sort: string[] = ['publishedAt:desc'];
  if (typeof resolvedSearchParams.sort === 'string') {
    sort = resolvedSearchParams.sort.split(',').filter(Boolean);
  }

  const contentType = typeof resolvedSearchParams.type === 'string' ?
    resolvedSearchParams.type as SearchFilters['contentType'] : 'all';

  if (!contentType || !['video', 'playlist', 'blog', 'responsa', 'writing', 'all'].includes(contentType)) {
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
    page: 1,
    pageSize: 10,
    sort: sort,
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 md:py-12 w-full">
      <BlockRenderer blocks={blocks} />
      <div className="mx-auto">
        <Breadcrumbs
          items={[
            { label: "בית", href: "/" },
            { label: "חיפוש" }
          ]}
        />
      </div>
      <div className="w-full max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-4">תוצאות חיפוש</h1>
          {filters.query && (
            <p className="text-lg text-muted-foreground">
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
        <div key={i} className="bg-card rounded-lg shadow-md border border-border p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1 space-y-2">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/4" />
            </div>
            <Skeleton className="h-20 w-20 rounded" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
          <div className="flex gap-2 mt-4">
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}
