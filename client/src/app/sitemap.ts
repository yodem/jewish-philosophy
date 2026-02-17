import type { MetadataRoute } from 'next';
import {
  getAllBlogsForSitemap,
  getAllPlaylistsForSitemap,
  getAllWritingsForSitemap,
  getAllResponsasForSitemap,
  getAllTermsForSitemap,
} from '@/data/loaders';
import { Blog, Playlist, Writing, Video, Responsa, Term } from '@/types';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Validate environment variables
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://religousphilosophy.com/';
  const strapiBaseUrl = process.env.NEXT_PUBLIC_STRAPI_BASE_URL;
  
  // Ensure baseUrl always ends with "/"
  const normalizedBaseUrl = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
  
  if (!strapiBaseUrl) {
    console.warn('NEXT_PUBLIC_STRAPI_BASE_URL not set, using fallback for sitemap generation');
  }
  
  try {
    // Helper function to ensure proper URL formatting
    const formatUrl = (path: string) => {
      const cleanPath = path.startsWith('/') ? path.slice(1) : path; // Remove leading slash if present
      return `${normalizedBaseUrl}${cleanPath}`;
    };

    // Helper function to get image URL
    const getImageUrl = (strapiUrl?: string) => {
      if (!strapiUrl) return undefined;
      if (strapiUrl.startsWith('http')) return strapiUrl;
      return `${strapiBaseUrl || 'http://localhost:1337'}${strapiUrl}`;
    };

    // Helper function to fetch data with timeout
    const fetchWithTimeout = async <T>(fetchFn: () => Promise<T>, timeoutMs = 8000): Promise<T> => {
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Fetch timeout')), timeoutMs);
      });
      
      return Promise.race([fetchFn(), timeoutPromise]);
    };

    // Static pages
    const staticPages: MetadataRoute.Sitemap = [
      {
        url: normalizedBaseUrl.slice(0, -1), // Remove trailing slash for homepage
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1.0,
      },
      {
        url: formatUrl('/about'),
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.8,
      },
      {
        url: formatUrl('/blog'),
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.9,
      },
      {
        url: formatUrl('/playlists'),
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
      },
      {
        url: formatUrl('/writings'),
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
      },
      {
        url: formatUrl('/search'),
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.5,
      },
      {
        url: formatUrl('/responsa'),
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.9,
      },
      {
        url: formatUrl('/contact'), // Contact page (צור קשר)
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.6,
      },
      {
        url: formatUrl('/terms'),
        lastModified: new Date(),
        changeFrequency: 'yearly',
        priority: 0.3,
      },
    ];

    // Get dynamic content with timeout protection (uses paginated fetch-all for sitemap)
    const [blogs, playlists, writings, responsas, terms] = await Promise.allSettled([
      fetchWithTimeout(() => getAllBlogsForSitemap(), 15000),
      fetchWithTimeout(() => getAllPlaylistsForSitemap(), 15000),
      fetchWithTimeout(() => getAllWritingsForSitemap(), 15000),
      fetchWithTimeout(() => getAllResponsasForSitemap(), 15000),
      fetchWithTimeout(() => getAllTermsForSitemap(), 15000),
    ]).then(results => [
      results[0].status === 'fulfilled' ? results[0].value : [],
      results[1].status === 'fulfilled' ? results[1].value : [],
      results[2].status === 'fulfilled' ? results[2].value : [],
      results[3].status === 'fulfilled' ? results[3].value : [],
      results[4].status === 'fulfilled' ? results[4].value : [],
    ]);

    // Blog pages
    const blogPages: MetadataRoute.Sitemap = blogs.map((blog: Blog) => ({
      url: formatUrl(`/blog/${blog.slug}`),
      lastModified: new Date(blog.publishedAt),
      changeFrequency: 'weekly',
      priority: 0.7,
      ...(blog.coverImage && {
        images: [getImageUrl(blog.coverImage.url)].filter(Boolean) as string[],
      }),
    }));

    // Playlist pages - filter out playlists with -- prefix
    const playlistPages: MetadataRoute.Sitemap = playlists
      .filter((playlist: Playlist) => !playlist.slug.startsWith('--'))
      .map((playlist: Playlist) => ({
        url: formatUrl(`/playlists/${playlist.slug}`),
        lastModified: new Date(playlist.updatedAt || playlist.createdAt),
        changeFrequency: 'weekly',
        priority: 0.6,
        images: [
          getImageUrl(playlist.imageUrl300x400),
          getImageUrl(playlist.imageUrlStandard),
        ].filter(Boolean) as string[],
      }));

    // Individual video pages - filter playlists with -- prefix
    const videoPages: MetadataRoute.Sitemap = playlists
      .filter((playlist: Playlist) => !playlist.slug.startsWith('--'))
      .flatMap((playlist: Playlist) =>
        (playlist.videos || []).map((video: Video) => ({
          url: formatUrl(`/playlists/${playlist.slug}/${video.slug}`),
          lastModified: new Date(playlist.updatedAt || playlist.createdAt),
          changeFrequency: 'weekly',
          priority: 0.8,
          images: [
            getImageUrl(video.imageUrl300x400),
            getImageUrl(video.imageUrlStandard),
          ].filter(Boolean) as string[],
        }))
      );

    // Responsa pages (highest priority - include lastModified from comments for fresh indexing)
    const responsaPages: MetadataRoute.Sitemap = responsas.map((responsa: Responsa) => {
      const dates = [
        responsa.updatedAt,
        responsa.publishedAt,
        ...(responsa.comments || []).map((c: { updatedAt?: string }) => c.updatedAt),
        ...(responsa.comments || []).flatMap((c: { threads?: { updatedAt?: string }[] }) =>
          (c.threads || []).map((t) => t.updatedAt)
        ),
      ].filter(Boolean) as string[];
      const lastModified = dates.length
        ? new Date(dates.sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0])
        : new Date(responsa.updatedAt || responsa.publishedAt);
      return {
        url: formatUrl(`/responsa/${responsa.slug}`),
        lastModified,
        changeFrequency: 'daily' as const,
        priority: 0.9,
      };
    });

    // Writing pages
    const writingPages: MetadataRoute.Sitemap = writings.map((writing: Writing) => ({
      url: formatUrl(`/writings/${writing.slug}`),
      lastModified: new Date(writing.updatedAt || writing.publishedAt),
      changeFrequency: 'monthly',
      priority: 0.6,
      ...(writing.image && {
        images: [getImageUrl(writing.image.url)].filter(Boolean) as string[],
      }),
    }));

    // Term pages (glossary entries)
    const termPages: MetadataRoute.Sitemap = terms.map((term: Term) => ({
      url: formatUrl(`/terms/${term.slug}`),
      lastModified: new Date(term.updatedAt || term.createdAt),
      changeFrequency: 'monthly',
      priority: 0.5,
    }));

    // Combine all pages
    return [
      ...staticPages,
      ...blogPages,
      ...playlistPages,
      ...videoPages,
      ...responsaPages,
      ...writingPages,
      ...termPages,
    ];

  } catch (error) {
    console.error('Error generating sitemap:', error);
    // Return at least static pages if dynamic content fails (including contact)
    return [
      {
        url: normalizedBaseUrl.slice(0, -1), // Remove trailing slash for homepage
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1.0,
      },
      {
        url: `${normalizedBaseUrl}about`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.8,
      },
      {
        url: `${normalizedBaseUrl}blog`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.9,
      },
      {
        url: `${normalizedBaseUrl}contact`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.6,
      },
    ];
  }
}
