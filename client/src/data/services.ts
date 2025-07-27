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
  contentType?: 'all' | 'blog' | 'video' | 'playlist' | 'responsa' | 'writing';
  category?: string;
  page?: number;
  pageSize?: number;
  sort?: string[]; // e.g., ['publishedAt:desc', 'title:asc']
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
  playlistSlug?: string; // For videos that belong to playlists
  writingType?: 'book' | 'article'; // For writings
  author?: { name: string }; // For writings and blogs
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

interface SearchQuery {
  sort: string[];
  pagination: {
    page: number;
    pageSize: number;
  };
  filters?: {
    title?: {
      $containsi?: string;
      $notContainsi?: string;
    };
    categories?: {
      slug: {
        $eq: string;
      };
    };
    $and?: Array<{
      title?: {
        $containsi?: string;
        $notContainsi?: string;
      };
      categories?: {
        slug: {
          $eq: string;
        };
      };
    }>;
  };
  populate?: Record<string, unknown> | string;
}

interface SearchResultItem {
  id: number;
  title: string;
  description?: string;
  content?: string;
  slug: string;
  publishedAt?: string;
  categories?: Category[];
  coverImage?: CoverImage;
  imageUrl300x400?: string;
  imageUrlStandard?: string;
  playlist?: {
    slug: string;
  };
  type?: 'book' | 'article'; // For writings
  author?: { name: string }; // For writings and blogs
}

const buildSearchQuery = (contentType: string, filters: SearchFilters) => {
  // Use publishedAt if available, fallback to createdAt
  // Try both publishedAt and published_at as field names
  const defaultSort = filters.sort || ['publishedAt:desc'];
  
  const baseQuery: SearchQuery = {
    sort: defaultSort,
    pagination: {
      page: filters.page || 1,
      pageSize: filters.pageSize || 10
    }
  };

  // Always exclude "Private video" for video content
  const excludePrivateVideo = contentType === 'video' || contentType === 'playlist';
  
  // Add search filters if query exists
  if (filters.query) {
    if (excludePrivateVideo) {
      baseQuery.filters = {
        $and: [
          {
            title: {
              $containsi: filters.query
            }
          },
          {
            title: {
              $notContainsi: 'Private video'
            }
          }
        ]
      };
    } else {
      baseQuery.filters = {
        title: {
          $containsi: filters.query
        }
      };
    }
  } else if (excludePrivateVideo) {
    // If no search query but we need to exclude private videos
    baseQuery.filters = {
      title: {
        $notContainsi: 'Private video'
      }
    };
  }

  // Add category filter for blogs, responsa, and writings
  if (filters.category && filters.category !== 'all' && (contentType === 'blog' || contentType === 'responsa' || contentType === 'writing')) {
    if (baseQuery.filters && baseQuery.filters.$and) {
      // If we already have $and filters, add category to the array
      baseQuery.filters.$and.push({
        categories: {
          slug: {
            $eq: filters.category
          }
        }
      });
    } else {
      baseQuery.filters = {
        ...baseQuery.filters,
        categories: {
          slug: {
            $eq: filters.category
          }
        }
      };
    }
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
    case 'writing':
      baseQuery.populate = {
        categories: true,
        author: true
      };
      break;
    case 'video':
    case 'playlist':
      baseQuery.populate = '*';
      break;
  }

  return qs.stringify(baseQuery);
};

const mapToSearchResult = (item: SearchResultItem, type: 'blog' | 'video' | 'playlist' | 'responsa' | 'writing'): SearchResult => {
  return {
    id: item.id,
    title: item.title,
    description: item.description || 'פרטים בפנים...',
    slug: item.slug,
    type,
    publishedAt: item.publishedAt,
    categories: item.categories,
    coverImage: item.coverImage,
    imageUrl300x400: item.imageUrl300x400,
    imageUrlStandard: item.imageUrlStandard,
    playlistSlug: type === 'video' ? item.playlist?.slug : undefined,
    writingType: type === 'writing' ? item.type : undefined,
    author: item.author,
  };
};

export async function searchContent(filters: SearchFilters): Promise<SearchResponse> {
  const { contentType = 'all', page = 1, pageSize = 10 } = filters;
  
  if (contentType !== 'all') {
    // Search specific content type
    let endpoint;
    if (contentType === 'responsa') {
      endpoint = 'responsas';
    } else if (contentType === 'writing') {
      endpoint = 'writings';
    } else {
      endpoint = `${contentType}s`;
    }
    
    const query = buildSearchQuery(contentType, filters);
    const url = new URL(`/api/${endpoint}`, BASE_URL);
    url.search = query;
    
    const response = await fetchAPI(url.href, { method: "GET" });
    
    return {
      data: response.data.map((item: SearchResultItem) => mapToSearchResult(item, contentType as 'blog' | 'video' | 'playlist' | 'responsa' | 'writing')),
      meta: response.meta
    };
  }

  // Search all content types
  const contentTypes = ['blog', 'video', 'playlist', 'responsa', 'writing'];
  const allResults: SearchResult[] = [];

  // For "all" search, we'll search each content type and combine results
  // This is a simplified approach - in production you might want a unified search endpoint
  for (const type of contentTypes) {
    try {
      let endpoint;
      if (type === 'responsa') {
        endpoint = 'responsas';
      } else if (type === 'writing') {
        endpoint = 'writings';
      } else {
        endpoint = `${type}s`;
      }
      
      const query = buildSearchQuery(type, { ...filters, pageSize: Math.ceil(pageSize / contentTypes.length) });
      const url = new URL(`/api/${endpoint}`, BASE_URL);
      url.search = query;
      
      const response = await fetchAPI(url.href, { method: "GET" });
      
      if (response.data && Array.isArray(response.data)) {
        const mappedResults = response.data.map((item: SearchResultItem) => mapToSearchResult(item, type as 'blog' | 'video' | 'playlist' | 'responsa' | 'writing'));
        allResults.push(...mappedResults);
      }
    } catch (error) {
      console.error(`Error searching ${type}:`, error);
    }
  }

  // Sort combined results based on the provided sort criteria
  if (filters.sort && filters.sort.length > 0) {
    allResults.sort((a, b) => {
      for (const sortField of filters.sort!) {
        const [field, direction] = sortField.split(':');
        const aValue = a[field as keyof SearchResult];
        const bValue = b[field as keyof SearchResult];
        
        if (!aValue && !bValue) continue;
        if (!aValue) return direction === 'desc' ? 1 : -1;
        if (!bValue) return direction === 'desc' ? -1 : 1;
        
        let comparison = 0;
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          // Handle date strings
          const aDate = new Date(aValue);
          const bDate = new Date(bValue);
          if (!isNaN(aDate.getTime()) && !isNaN(bDate.getTime())) {
            comparison = aDate.getTime() - bDate.getTime();
          } else {
            comparison = aValue.localeCompare(bValue);
          }
        }
        
        if (comparison !== 0) {
          return direction === 'desc' ? -comparison : comparison;
        }
      }
      return 0;
    });
  } else {
    // Default sort by publishedAt desc
    allResults.sort((a, b) => {
      if (!a.publishedAt && !b.publishedAt) return 0;
      if (!a.publishedAt) return 1;
      if (!b.publishedAt) return -1;
      return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
    });
  }

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

// Infinite scrolling helper function
export async function loadMoreContent(
  filters: SearchFilters, 
  existingResults: SearchResult[] = []
): Promise<{ newResults: SearchResult[]; hasMore: boolean; total: number }> {
  const nextPage = Math.floor(existingResults.length / (filters.pageSize || 10)) + 1;
  
  const newFilters = {
    ...filters,
    page: nextPage
  };
  
  const response = await searchContent(newFilters);
  
  // Filter out any duplicates that might exist in existingResults
  const existingIds = new Set(existingResults.map(result => `${result.type}-${result.id}`));
  const newResults = response.data.filter(result => !existingIds.has(`${result.type}-${result.id}`));
  
  // Check if we have more results
  const hasMore = newResults.length > 0 && response.meta.pagination.page < response.meta.pagination.pageCount;
  
  return {
    newResults: newResults,
    hasMore: hasMore,
    total: response.meta.pagination.total
  };
}