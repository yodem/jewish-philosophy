import { MetadataRoute } from 'next';
import { getAllBlogs, getAllPlaylists, getAllWritings } from '@/data/loaders';
import { Blog, Playlist, Writing, Video } from '@/types';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://jewish-philosophy.vercel.app';
  
  try {
    // Helper function to ensure proper URL formatting
    const formatUrl = (path: string) => {
      const cleanPath = path.startsWith('/') ? path : `/${path}`;
      const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
      return `${cleanBaseUrl}${cleanPath}`;
    };

    // Helper function to get image URL
    const getImageUrl = (strapiUrl?: string) => {
      if (!strapiUrl) return undefined;
      if (strapiUrl.startsWith('http')) return strapiUrl;
      return `${process.env.NEXT_PUBLIC_STRAPI_BASE_URL || ''}${strapiUrl}`;
    };

    // Static pages - simplified without alternates to avoid GSC issues
    const staticPages: MetadataRoute.Sitemap = [
      {
        url: baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 1.0,
      },
      {
        url: formatUrl('/about'),
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.8,
      },
      {
        url: formatUrl('/blog'),
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 0.9,
      },
      {
        url: formatUrl('/playlists'),
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      },
      {
        url: formatUrl('/writings'),
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      },
      {
        url: formatUrl('/search'),
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.5,
      },
      {
        url: formatUrl('/responsa'),
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      },
      {
        url: formatUrl('/contact'),
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.6,
      },
      {
        url: formatUrl('/terms'),
        lastModified: new Date(),
        changeFrequency: 'yearly' as const,
        priority: 0.3,
      },
    ];

    // Get dynamic content
    const [blogs, playlists, writings] = await Promise.all([
      getAllBlogs().catch(() => []),
      getAllPlaylists().catch(() => []),
      getAllWritings().catch(() => []),
    ]);

    // Blog pages - simplified for GSC compliance
    const blogPages: MetadataRoute.Sitemap = blogs.map((blog: Blog) => ({
      url: formatUrl(`/blog/${blog.slug}`),
      lastModified: new Date(blog.publishedAt),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
      ...(blog.coverImage && {
        images: [getImageUrl(blog.coverImage.url)].filter(Boolean) as string[],
      }),
    }));

    // Playlist pages - simplified for GSC compliance
    const playlistPages: MetadataRoute.Sitemap = playlists.map((playlist: Playlist) => ({
      url: formatUrl(`/playlists/${playlist.slug}`),
      lastModified: new Date(playlist.updatedAt || playlist.createdAt),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
      images: [
        getImageUrl(playlist.imageUrl300x400),
        getImageUrl(playlist.imageUrlStandard),
      ].filter(Boolean) as string[],
    }));

    // Individual video pages - simplified without videos property to avoid GSC issues
    const videoPages: MetadataRoute.Sitemap = playlists.flatMap((playlist: Playlist) => 
      (playlist.videos || []).map((video: Video) => ({
        url: formatUrl(`/playlists/${playlist.slug}/${video.slug}`),
        lastModified: new Date(playlist.updatedAt || playlist.createdAt),
        changeFrequency: 'weekly' as const,
        priority: 0.8, // High priority for video content
        // Only include images, remove videos property for GSC compliance
        images: [
          getImageUrl(video.imageUrl300x400),
          getImageUrl(video.imageUrlStandard),
        ].filter(Boolean) as string[],
      }))
    );

    // Writing pages - simplified for GSC compliance
    const writingPages: MetadataRoute.Sitemap = writings.map((writing: Writing) => ({
      url: formatUrl(`/writings/${writing.slug}`),
      lastModified: new Date(writing.updatedAt || writing.publishedAt),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
      ...(writing.image && {
        images: [getImageUrl(writing.image.url)].filter(Boolean) as string[],
      }),
    }));

    // Get terms and responsa if they exist
    const responsaPages: MetadataRoute.Sitemap = [];
    const termsPages: MetadataRoute.Sitemap = [];

    // You can extend this to include individual responsa and terms pages
    // For now, including the main category pages covered in staticPages

    // Combine all pages
    return [
      ...staticPages, 
      ...blogPages, 
      ...playlistPages, 
      ...videoPages,
      ...writingPages,
      ...responsaPages,
      ...termsPages
    ];

  } catch (error) {
    console.error('Error generating sitemap:', error);
    // Return at least static pages if dynamic content fails
    return [
      {
        url: baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 1.0,
      },
      {
        url: `${baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl}/about`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.8,
      },
      {
        url: `${baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl}/blog`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 0.9,
      },
    ];
  }
} 