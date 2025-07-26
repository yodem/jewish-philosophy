import { getGlobalSettings, getAllBlogs, getAllPlaylists, getAllWritings } from '@/data/loaders';
import { Blog, Writing, Playlist, Category, Autor } from '@/types';

export interface EnhancedSEOData {
  siteName: string;
  siteDescription: string;
  authors: Autor[];
  categories: Category[];
  contentStats: {
    totalBlogs: number;
    totalVideos: number;
    totalPlaylists: number;
    totalWritings: number;
  };
  popularTopics: string[];
  latestContent: {
    blogs: Blog[];
    writings: Writing[];
    playlists: Playlist[];
  };
}

let cachedEnhancedData: EnhancedSEOData | null = null;

export async function getEnhancedSEOData(): Promise<EnhancedSEOData> {
  if (cachedEnhancedData) {
    return cachedEnhancedData;
  }

  try {
    // Fetch all data in parallel for better performance
    const [globalRes, blogsRes, playlistsRes, writingsRes] = await Promise.all([
      getGlobalSettings().catch(() => null),
      getAllBlogs().catch(() => []),
      getAllPlaylists().catch(() => []),
      getAllWritings().catch(() => [])
    ]);

    // Extract all authors from content
    const allAuthors = new Set<Autor>();
    blogsRes.forEach((blog: Blog) => {
      if (blog.author) allAuthors.add(blog.author);
    });
    writingsRes.forEach((writing: Writing) => {
      if (writing.author) allAuthors.add(writing.author);
    });

    // Extract all categories from content
    const allCategories = new Set<Category>();
    blogsRes.forEach((blog: Blog) => {
      blog.categories?.forEach(cat => allCategories.add(cat));
    });
    writingsRes.forEach((writing: Writing) => {
      writing.categories?.forEach(cat => allCategories.add(cat));
    });

    // Calculate content statistics
    const contentStats = {
      totalBlogs: blogsRes.length,
      totalVideos: playlistsRes.reduce((total: number, playlist: Playlist) => 
        total + (playlist.videos?.length || 0), 0),
      totalPlaylists: playlistsRes.length,
      totalWritings: writingsRes.length,
    };

    // Generate popular topics from categories
    const categoryFrequency = new Map<string, number>();
    [...allCategories].forEach(cat => {
      const count = blogsRes.filter((blog: Blog) => 
        blog.categories?.some(c => c.id === cat.id)).length +
        writingsRes.filter((writing: Writing) => 
          writing.categories?.some(c => c.id === cat.id)).length;
      categoryFrequency.set(cat.name, count);
    });

    const popularTopics = Array.from(categoryFrequency.entries())
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([topic]) => topic);

    // Get latest content (last 5 of each type)
    const latestContent = {
      blogs: blogsRes.slice(0, 5),
      writings: writingsRes.slice(0, 5),
      playlists: playlistsRes.slice(0, 5)
    };

    const enhancedData: EnhancedSEOData = {
      siteName: globalRes?.data?.title || 'פילוסופיה יהודית',
      siteDescription: globalRes?.data?.description || 
        'פלטפורמה מובילה ללימוד יהודי מקוון - שיעורים, ספרים, מאמרים ושאלות ותשובות.',
      authors: Array.from(allAuthors),
      categories: Array.from(allCategories),
      contentStats,
      popularTopics,
      latestContent
    };

    cachedEnhancedData = enhancedData;
    return enhancedData;

  } catch (error) {
    console.error('Error fetching enhanced SEO data:', error);
    
    // Return minimal fallback data
    return {
      siteName: 'פילוסופיה יהודית',
      siteDescription: 'פלטפורמה מובילה ללימוד יהודי מקוון',
      authors: [],
      categories: [],
      contentStats: {
        totalBlogs: 0,
        totalVideos: 0,
        totalPlaylists: 0,
        totalWritings: 0
      },
      popularTopics: ['הלכה', 'אגדה', 'פילוסופיה יהודית'],
      latestContent: {
        blogs: [],
        writings: [],
        playlists: []
      }
    };
  }
}

export function generateRichDescription(
  baseDescription: string,
  contentType: 'blog' | 'video' | 'playlist' | 'writing' | 'responsa',
  enhancedData?: EnhancedSEOData
): string {
  if (!enhancedData) {
    return baseDescription;
  }

  const { contentStats, popularTopics } = enhancedData;
  
  const typeDescriptions = {
    blog: `חלק מ-${contentStats.totalBlogs} מאמרים איכותיים`,
    video: `חלק מ-${contentStats.totalVideos} שיעורי וידאו`,
    playlist: `אחת מ-${contentStats.totalPlaylists} סדרות השיעורים`,
    writing: `חלק מ-${contentStats.totalWritings} כתבים וספרים`,
    responsa: 'שאלות ותשובות מקצועיות מרבנים מובילים'
  };

  const topicsText = popularTopics.slice(0, 3).join(', ');
  
  return `${baseDescription} ${typeDescriptions[contentType]} בנושאים: ${topicsText}.`;
}

export function generateAuthorBasedKeywords(authorName?: string, enhancedData?: EnhancedSEOData): string[] {
  const keywords: string[] = [];
  
  if (authorName && enhancedData) {
    // Find author's other content for related keywords
    const authorBlogs = enhancedData.latestContent.blogs.filter(
      blog => blog.author?.name === authorName
    );
    const authorWritings = enhancedData.latestContent.writings.filter(
      writing => writing.author?.name === authorName
    );
    
    // Extract categories from author's content
    const authorCategories = new Set<string>();
    [...authorBlogs, ...authorWritings].forEach(content => {
      content.categories?.forEach(cat => authorCategories.add(cat.name));
    });
    
    keywords.push(`${authorName} רב`, `כתבי ${authorName}`, ...Array.from(authorCategories));
  }
  
  return keywords;
}

export function generateContentBasedSitemap(enhancedData: EnhancedSEOData) {
  const { latestContent, contentStats } = enhancedData;
  
  return {
    totalPages: contentStats.totalBlogs + contentStats.totalPlaylists + contentStats.totalWritings,
    contentDistribution: {
      blogs: Math.round((contentStats.totalBlogs / (contentStats.totalBlogs + contentStats.totalPlaylists + contentStats.totalWritings)) * 100),
      playlists: Math.round((contentStats.totalPlaylists / (contentStats.totalBlogs + contentStats.totalPlaylists + contentStats.totalWritings)) * 100),
      writings: Math.round((contentStats.totalWritings / (contentStats.totalBlogs + contentStats.totalPlaylists + contentStats.totalWritings)) * 100)
    },
    recentlyUpdated: {
      blogs: latestContent.blogs.map(blog => ({ slug: blog.slug, updated: blog.publishedAt })),
      playlists: latestContent.playlists.map(playlist => ({ slug: playlist.slug, updated: playlist.updatedAt })),
      writings: latestContent.writings.map(writing => ({ slug: writing.slug, updated: writing.publishedAt }))
    }
  };
} 