import { fetchAPI } from "@/utils/fetchApi";
import { BASE_URL } from "../../consts";
import qs from "qs";
import { Category } from "@/types";

export async function subscribeService(email: string) {
    const url = new URL("/api/newsletter-signups", BASE_URL);
  
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          data: {
            email,
          },
        }),
      });
  
      return response.json();
    } catch (error) {
      console.error("Subscribe Service Error:", error);
    }
  }
  
  export interface EventsSubscribeProps {
    firstName: string;
    lastName: string;
    email: string;
    telephone: string;
    event: {
      connect: [string];
    };
  }

export interface SearchFilters {
  query?: string;
  contentType: 'blog' | 'video' | 'playlist' | 'responsa' | 'writing';
  category?: string;
  page?: number;
  pageSize?: number;
  sort?: string[];
}

interface CoverImage {
  url: string;
  alternativeText?: string;
  width?: number;
  height?: number;
}

export interface SearchResult {
  id: number;
  title: string;
  description?: string;
  slug: string;
  type: 'blog' | 'video' | 'playlist' | 'responsa' | 'writing';
  publishedAt?: string;
  categories?: Category[];
  coverImage?: CoverImage;
  imageUrl300x400?: string;
  imageUrlStandard?: string;
  playlistSlug?: string;
  writingType?: 'book' | 'article';
  author?: { name: string };
}

export interface SearchResponse {
  data: SearchResult[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

interface SearchResultItem {
  id: number;
  title: string;
  description?: string;
  slug: string;
  publishedAt?: string;
  categories?: Category[];
  coverImage?: CoverImage;
  imageUrl300x400?: string;
  imageUrlStandard?: string;
  playlist?: { slug: string };
  type?: 'book' | 'article';
  author?: { name: string };
}

const getEndpoint = (contentType: string): string => {
  const endpoints = {
    responsa: 'responsas',
    writing: 'writings',
    blog: 'blogs',
    video: 'videos',
    playlist: 'playlists'
  };
  return endpoints[contentType as keyof typeof endpoints] || `${contentType}s`;
};

const getPopulate = (contentType: string) => {
  const populateMap = {
    blog: { categories: true, coverImage: true, author: true },
    responsa: { categories: true, comments: true },
    writing: { categories: true, author: true },
    video: '*',
    playlist: '*'
  };
  return populateMap[contentType as keyof typeof populateMap] || '*';
};

interface SearchQuery {
  sort: string[];
  pagination: {
    page: number;
    pageSize: number;
  };
  populate: string | { categories: boolean; comments: boolean; } | { categories: boolean; author: boolean; };
  filters?: Record<string, unknown> | { $and: Record<string, unknown>[] };
}

const buildSearchQuery = (filters: SearchFilters) => {
  const query: SearchQuery = {
    sort: filters.sort || ['publishedAt:desc'],
    pagination: {
      page: filters.page || 1,
      pageSize: filters.pageSize || 10
    },
    populate: getPopulate(filters.contentType)
  };

  const filtersArray = [];

  // Add search query
  if (filters.query) {
    filtersArray.push({ title: { $containsi: filters.query } });
  }

  // Add category filter
  if (filters.category && filters.category !== 'all') {
    filtersArray.push({ categories: { slug: { $eq: filters.category } } });
  }

  // Exclude private videos for video/playlist content
  if (filters.contentType === 'video' || filters.contentType === 'playlist') {
    filtersArray.push({ title: { $notContainsi: 'Private video' } });
  }

  if (filtersArray.length > 0) {
    query.filters = filtersArray.length === 1 ? filtersArray[0] : { $and: filtersArray };
  }

  return qs.stringify(query);
};

const mapToSearchResult = (item: SearchResultItem, type: string): SearchResult => ({
  id: item.id,
  title: item.title,
  description: item.description || 'פרטים בפנים...',
  slug: item.slug,
  type: type as SearchResult['type'],
  publishedAt: item.publishedAt,
  categories: item.categories,
  coverImage: item.coverImage,
  imageUrl300x400: item.imageUrl300x400,
  imageUrlStandard: item.imageUrlStandard,
  playlistSlug: type === 'video' ? item.playlist?.slug : undefined,
  writingType: type === 'writing' ? item.type : undefined,
  author: item.author,
});

export async function searchContent(filters: SearchFilters): Promise<SearchResponse> {
  const endpoint = getEndpoint(filters.contentType);
  const query = buildSearchQuery(filters);
  const url = new URL(`/api/${endpoint}`, BASE_URL);
  url.search = query;
  
  const response = await fetchAPI(url.href, { method: "GET" });
  
  return {
    data: response?.data?.map((item: SearchResultItem) => mapToSearchResult(item, filters.contentType)) || [],
    meta: response?.meta || { pagination: { page: 1, pageSize: 10, pageCount: 1, total: 0 } }
  };
}

export async function getAllCategories(): Promise<Category[]> {
  const query = qs.stringify({
    sort: ['name:asc'],
    fields: ['name', 'slug', 'description']
  });
  
  const url = new URL('/api/categories', BASE_URL);
  url.search = query;
  
  const response = await fetchAPI(url.href, { method: "GET" });
  return response?.data || [];
}

export async function loadMoreContent(
  filters: SearchFilters, 
  existingResults: SearchResult[] = []
): Promise<{ newResults: SearchResult[]; hasMore: boolean; total: number }> {
  const nextPage = Math.floor(existingResults.length / (filters.pageSize || 10)) + 1;
  const response = await searchContent({ ...filters, page: nextPage });
  
  const existingIds = new Set(existingResults.map(result => `${result.type}-${result.id}`));
  const newResults = response?.data.filter(result => !existingIds.has(`${result.type}-${result.id}`));
  
  return {
    newResults,
    hasMore: newResults.length > 0 && response?.meta?.pagination?.page < response?.meta?.pagination?.pageCount,
    total: response?.meta?.pagination?.total || 0
  };
}