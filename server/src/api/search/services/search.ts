/**
 * search service
 */

// Type definitions for search functionality
interface SearchQuery {
  query: string;
  contentTypes?: string;
  categories?: string;
}

interface SearchResult {
  id: number;
  documentId: string;
  title: string;
  description?: string;
  contentType: string;
  date?: string;
  slug: string;
  playlistSlug?: string | null;
  relevanceScore: number;
}

// Content type specific search configurations
const CONTENT_TYPE_CONFIG = {
  blog: {
    searchableFields: ['title', 'content', 'description'],
    populate: {
      coverImage: true,
      author: { fields: ['name'] },
      categories: { fields: ['id', 'name', 'slug'] }
    }
  },
  video: {
    searchableFields: ['title', 'description', 'videoId'],
    populate: {
      playlist: { fields: ['slug'] },
      categories: { fields: ['id', 'name', 'slug'] }
    }
  },
  playlist: {
    searchableFields: ['title', 'description', 'youtubeId'],
    populate: {
      videos: { fields: ['id'] }
    }
  },
  responsa: {
    searchableFields: ['title', 'content', 'questioneer'],
    populate: {
      categories: { fields: ['id', 'name', 'slug'] },
      comments: { fields: ['id'] },
      threads: { fields: ['id'] }
    }
  },
  writing: {
    searchableFields: ['title', 'description'],
    populate: {
      author: { fields: ['name'] },
      categories: { fields: ['id', 'name', 'slug'] },
      blogs: { fields: ['id'] },
      responsas: { fields: ['id'] }
    }
  },
  term: {
    searchableFields: ['title', 'description'],
    populate: {
      author: { fields: ['name'] },
      categories: { fields: ['id', 'name', 'slug'] }
    }
  },
  author: {
    searchableFields: ['name', 'email'],
    populate: {}
  },
  category: {
    searchableFields: ['name', 'description'],
    populate: {}
  }
} as const;

export default () => ({
  performSearch: async ({ query, contentTypes, categories }: SearchQuery): Promise<SearchResult[]> => {
    try {
      // Default content types to search if not specified
      const defaultContentTypes = ['blog', 'video', 'playlist', 'responsa', 'writing', 'term'];
      let typesToSearch: string[];

      if (!contentTypes) {
        typesToSearch = defaultContentTypes;
      } else if (contentTypes === 'all') {
        typesToSearch = defaultContentTypes;
      } else {
        typesToSearch = contentTypes.split(',');
      }

      const searchResults: SearchResult[] = [];

      // Search through each content type
      for (const contentType of typesToSearch) {
        try {
          const results = await strapi.service('api::search.search').searchContentType({
            contentType,
            query,
            categories
          });
          searchResults.push(...results);
        } catch (error) {
          // Log error but continue with other content types
          console.error(`Error searching content type ${contentType}:`, error);
        }
      }

      // Sort by relevance score first, then by date
      return searchResults
        .sort((a, b) => {
          // First, sort by relevance score (higher is better)
          const scoreDiff = b.relevanceScore - a.relevanceScore;
          if (scoreDiff !== 0) {
            return scoreDiff;
          }
          // Then sort by date (newest first)
          const dateA = new Date(a.date || 0).getTime();
          const dateB = new Date(b.date || 0).getTime();
          return dateB - dateA;
        })
        .slice(0, 20);

    } catch (error) {
      throw new Error(`Error performing search: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  searchContentType: async ({ contentType, query, categories }: SearchQuery & { contentType: string }): Promise<SearchResult[]> => {
    try {
      const config = CONTENT_TYPE_CONFIG[contentType as keyof typeof CONTENT_TYPE_CONFIG];
      if (!config) {
        console.warn(`No search configuration found for content type: ${contentType}`);
        return [];
      }

      // Build search filters for the specific content type
      const searchFilters = buildSearchFilters(contentType, query, categories);

      // Use Strapi's Document Service API for searching
      const results = await strapi.documents(`api::${contentType}.${contentType}` as any).findMany({
        filters: searchFilters,
        limit: 20, // Get up to 20 results per content type
        status: 'published',
        sort: ['publishedAt:desc'],
        populate: config.populate as any
      });

      return results.map((result: any) => ({
        id: result.id,
        documentId: result.documentId,
        title: result.title || result.name || '', // Handle different field names
        description: result.description || result.content?.substring(0, 200) || '', // Truncate content if needed
        contentType,
        date: result.publishedAt || result.createdAt,
        slug: result.slug || result.id.toString(),
        playlistSlug: result.playlist?.slug || null, // Include playlist slug for video URLs
        relevanceScore: calculateRelevanceScore(result, query, [...config.searchableFields])
      }));

    } catch (error) {
      console.error(`Error searching content type ${contentType}:`, error);
      return [];
    }
  }
});

// Helper function to build search filters
function buildSearchFilters(contentType: string, query: string, categories?: string) {
  const filters: any[] = [];

  // Add text search across searchable fields
  if (query) {
    const textFilters = [];
    const config = CONTENT_TYPE_CONFIG[contentType as keyof typeof CONTENT_TYPE_CONFIG];

    if (config) {
      for (const field of config.searchableFields) {
        textFilters.push({ [field]: { $containsi: query } });
      }
    }

    if (textFilters.length > 0) {
      filters.push(textFilters.length === 1 ? textFilters[0] : { $or: textFilters });
    }
  }

  // Add category filter if specified
  if (categories) {
    filters.push({
      categories: {
        slug: { $in: categories.split(',') }
      }
    });
  }

  return filters.length === 1 ? filters[0] : { $and: filters };
}

// Helper function to calculate relevance score
function calculateRelevanceScore(result: any, query: string, searchableFields: string[]): number {
  if (!query) return 1;

  const queryLower = query.toLowerCase();
  let score = 0;

  for (const field of searchableFields) {
    const value = result[field];
    if (value && typeof value === 'string') {
      const valueLower = value.toLowerCase();

      // Exact match in title gets highest score
      if (field === 'title' && valueLower === queryLower) {
        score += 100;
      }
      // Title contains query gets high score
      else if (field === 'title' && valueLower.includes(queryLower)) {
        score += 50;
      }
      // Description contains query gets medium score
      else if (field === 'description' && valueLower.includes(queryLower)) {
        score += 30;
      }
      // Content contains query gets lower score
      else if (valueLower.includes(queryLower)) {
        score += 10;
      }
      // Starts with query gets bonus points
      else if (valueLower.startsWith(queryLower)) {
        score += 5;
      }
    }
  }

  return score;
}
