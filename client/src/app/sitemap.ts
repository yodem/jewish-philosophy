import type { MetadataRoute } from 'next';
import { getAllBlogs, getAllPlaylists, getAllWritings, getAllResponsas } from '@/data/loaders';
import { Blog, Playlist, Writing, Video, Responsa } from '@/types';

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
        changeFrequency: 'weekly',
        priority: 0.7,
      },
      {
        url: formatUrl('/contact'),
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

    // Get dynamic content with timeout protection
    const [blogs, playlists, writings, responsas] = await Promise.allSettled([
      fetchWithTimeout(() => getAllBlogs(), 7000),
      fetchWithTimeout(() => getAllPlaylists(), 7000),
      fetchWithTimeout(() => getAllWritings(), 7000),
      fetchWithTimeout(() => getAllResponsas(1, 100), 7000),
    ]).then(results => [
      results[0].status === 'fulfilled' ? results[0].value : [],
      results[1].status === 'fulfilled' ? results[1].value : [],
      results[2].status === 'fulfilled' ? results[2].value : [],
      results[3].status === 'fulfilled' ? results[3].value.data : [],
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

    // Responsa pages
    const responsaPages: MetadataRoute.Sitemap = responsas.map((responsa: Responsa) => ({
      url: formatUrl(`/responsa/${responsa.slug}`),
      lastModified: new Date(responsa.updatedAt || responsa.publishedAt),
      changeFrequency: 'monthly',
      priority: 0.7,
    }));

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

    // Combine all pages
    return [
      ...staticPages,
      ...blogPages,
      ...playlistPages,
      ...videoPages,
      ...responsaPages,
      ...writingPages,
    ];

  } catch (error) {
    console.error('Error generating sitemap:', error);
    // Return at least static pages if dynamic content fails
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
    ];
  }
}
