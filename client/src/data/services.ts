import { fetchAPI } from "@/utils/fetchApi";
import { BASE_URL } from "../../consts";
import qs from "qs";
import { Blog, Responsa, Video, Playlist, Category } from "@/types";

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
  contentType?: 'all' | 'blog' | 'video' | 'playlist' | 'responsa';
  category?: string;
  page?: number;
  pageSize?: number;
}

export interface SearchResult {
  id: number;
  title: string;
  description?: string;
  slug: string;
  type: 'blog' | 'video' | 'playlist' | 'responsa';
  publishedAt?: string;
  categories?: Category[];
  coverImage?: any;
  imageUrl300x400?: string;
  imageUrlStandard?: string;
  playlistSlug?: string; // For videos that belong to playlists
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

const buildSearchQuery = (contentType: string, filters: SearchFilters) => {
  const baseQuery: any = {
    sort: ['publishedAt:desc'],
    pagination: {
      page: filters.page || 1,
      pageSize: filters.pageSize || 10
    }
  };

  // Add search filters if query exists
  if (filters.query) {
    baseQuery.filters = {
      title: {
        $containsi: filters.query
      }
    };
  }

  // Add category filter for blogs and responsa
  if (filters.category && filters.category !== 'all' && (contentType === 'blog' || contentType === 'responsa')) {
    baseQuery.filters = {
      ...baseQuery.filters,
      categories: {
        slug: {
          $eq: filters.category
        }
      }
    };
  }

  // Add populate based on content type
  switch (contentType) {
    case 'blog':
      baseQuery.populate = {
        categories: true,
        coverImage: true,
        author: true
      };
      break;
    case 'responsa':
      baseQuery.populate = {
        categories: true,
        comments: true
      };
      break;
    case 'video':
    case 'playlist':
      baseQuery.populate = '*';
      break;
  }

  return qs.stringify(baseQuery);
};

const mapToSearchResult = (item: any, type: 'blog' | 'video' | 'playlist' | 'responsa'): SearchResult => {
  return {
    id: item.id,
    title: item.title,
    description: item.description || item.content?.substring(0, 150) + '...',
    slug: item.slug,
    type,
    publishedAt: item.publishedAt,
    categories: item.categories,
    coverImage: item.coverImage,
    imageUrl300x400: item.imageUrl300x400,
    imageUrlStandard: item.imageUrlStandard,
    playlistSlug: type === 'video' ? item.playlist?.slug : undefined,
  };
};

export async function searchContent(filters: SearchFilters): Promise<SearchResponse> {
  const { contentType = 'all', page = 1, pageSize = 10 } = filters;
  
  if (contentType !== 'all') {
    // Search specific content type
    const endpoint = contentType === 'responsa' ? 'responsas' : `${contentType}s`;
    const query = buildSearchQuery(contentType, filters);
    const url = new URL(`/api/${endpoint}`, BASE_URL);
    url.search = query;
    
    const response = await fetchAPI(url.href, { method: "GET" });
    
    return {
      data: response.data.map((item: any) => mapToSearchResult(item, contentType as any)),
      meta: response.meta
    };
  }

  // Search all content types
  const contentTypes = ['blog', 'video', 'playlist', 'responsa'];
  const allResults: SearchResult[] = [];
  let totalCount = 0;

  // For "all" search, we'll search each content type and combine results
  // This is a simplified approach - in production you might want a unified search endpoint
  for (const type of contentTypes) {
    try {
      const endpoint = type === 'responsa' ? 'responsas' : `${type}s`;
      const query = buildSearchQuery(type, { ...filters, pageSize: Math.ceil(pageSize / contentTypes.length) });
      const url = new URL(`/api/${endpoint}`, BASE_URL);
      url.search = query;
      
      const response = await fetchAPI(url.href, { method: "GET" });
      
      if (response.data && Array.isArray(response.data)) {
        const mappedResults = response.data.map((item: any) => mapToSearchResult(item, type as any));
        allResults.push(...mappedResults);
        totalCount += response.meta?.pagination?.total || 0;
      }
    } catch (error) {
      console.error(`Error searching ${type}:`, error);
    }
  }

  // Sort combined results by publishedAt
  allResults.sort((a, b) => {
    if (!a.publishedAt && !b.publishedAt) return 0;
    if (!a.publishedAt) return 1;
    if (!b.publishedAt) return -1;
    return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
  });

  // Apply pagination to combined results
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedResults = allResults.slice(startIndex, endIndex);

  return {
    data: paginatedResults,
    meta: {
      pagination: {
        page,
        pageSize,
        pageCount: Math.ceil(allResults.length / pageSize),
        total: allResults.length
      }
    }
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
  return response.data || [];
}
  