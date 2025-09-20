import { fetchAPI } from "@/utils/fetchApi";
import { BASE_URL } from "../../consts";
import qs from "qs";
import { Category, SearchFilters, SearchResponse } from "@/types";

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


// Re-export types from types.ts for backwards compatibility
export type { SearchResult, SearchResponse, SearchFilters, SearchQuery } from "@/types";


// New unified search function using the custom search API
export async function searchContent(filters: SearchFilters): Promise<SearchResponse> {
  const url = new URL("/api/search", BASE_URL);

  // Build query parameters
  const params = new URLSearchParams();

  if (filters.query?.trim()) {
    params.set('query', filters.query.trim());
  }

  // Map single content type to comma-separated list for the API
  if (filters.contentType && filters.contentType !== 'all') {
    params.set('contentTypes', filters.contentType);
  }
  // For "all" content type, send it as a parameter so backend knows to search all types
  if (filters.contentType === 'all') {
    params.set('contentTypes', 'all');
  }

  if (filters.category && filters.category !== 'all') {
    params.set('categories', filters.category);
  }

  // Don't send limit and offset parameters since we simplified the API
  url.search = params.toString();

  try {
    const response = await fetchAPI(url.href, { method: "GET" });

    // Transform the response to match the expected format
    return {
      data: response?.data || [],
      meta: {
        query: filters.query || '',
        contentTypes: filters.contentType,
        categories: filters.category,
        limit: 20,
        offset: 0,
        total: response?.data?.length || 0,
        timestamp: new Date().toISOString()
      }
    };
  } catch (error) {
    console.error('Search API error:', error);
    return {
      data: [],
      meta: {
        query: filters.query || '',
        contentTypes: filters.contentType,
        categories: filters.category,
        limit: 20,
        offset: 0,
        total: 0,
        timestamp: new Date().toISOString()
      }
    };
  }
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
