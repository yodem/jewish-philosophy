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

    // Static pages with Hebrew localization support
    const staticPages: MetadataRoute.Sitemap = [
      {
        url: baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 1,
        alternates: {
          languages: {
            'he-IL': baseUrl,
          },
        },
      },
      {
        url: formatUrl('/about'),
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.8,
        alternates: {
          languages: {
            'he-IL': formatUrl('/about'),
          },
        },
      },
      {
        url: formatUrl('/blog'),
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 0.9,
        alternates: {
          languages: {
            'he-IL': formatUrl('/blog'),
          },
        },
      },
      {
        url: formatUrl('/playlists'),
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
        alternates: {
          languages: {
            'he-IL': formatUrl('/playlists'),
          },
        },
      },
      {
        url: formatUrl('/writings'),
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
        alternates: {
          languages: {
            'he-IL': formatUrl('/writings'),
          },
        },
      },
      {
        url: formatUrl('/search'),
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.5,
        alternates: {
          languages: {
            'he-IL': formatUrl('/search'),
          },
        },
      },
      {
        url: formatUrl('/responsa'),
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
        alternates: {
          languages: {
            'he-IL': formatUrl('/responsa'),
          },
        },
      },
    ];

    // Get dynamic content
    const [blogs, playlists, writings] = await Promise.all([
      getAllBlogs().catch(() => []),
      getAllPlaylists().catch(() => []),
      getAllWritings().catch(() => []),
    ]);

    // Blog pages with image sitemaps
    const blogPages: MetadataRoute.Sitemap = blogs.map((blog: Blog) => ({
      url: formatUrl(`/blog/${blog.slug}`),
      lastModified: new Date(blog.publishedAt),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
      alternates: {
        languages: {
          'he-IL': formatUrl(`/blog/${blog.slug}`),
        },
      },
      ...(blog.coverImage && {
        images: [getImageUrl(blog.coverImage.url)].filter(Boolean) as string[],
      }),
    }));

    // Playlist pages with image sitemaps
    const playlistPages: MetadataRoute.Sitemap = playlists.map((playlist: Playlist) => ({
      url: formatUrl(`/playlists/${playlist.slug}`),
      lastModified: new Date(playlist.updatedAt || playlist.createdAt),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
      alternates: {
        languages: {
          'he-IL': formatUrl(`/playlists/${playlist.slug}`),
        },
      },
      images: [
        getImageUrl(playlist.imageUrl300x400),
        getImageUrl(playlist.imageUrlStandard),
      ].filter(Boolean) as string[],
    }));

    // Individual video pages with comprehensive video sitemaps (CRUCIAL for SEO)
    const videoPages: MetadataRoute.Sitemap = playlists.flatMap((playlist: Playlist) => 
      (playlist.videos || []).map((video: Video) => ({
        url: formatUrl(`/playlists/${playlist.slug}/${video.slug}`),
        lastModified: new Date(playlist.updatedAt || playlist.createdAt),
        changeFrequency: 'weekly' as const,
        priority: 0.8, // High priority for video content
        alternates: {
          languages: {
            'he-IL': formatUrl(`/playlists/${playlist.slug}/${video.slug}`),
          },
        },
        // Video sitemap according to Next.js docs and Google standards
        videos: [
          {
            title: video.title,
            thumbnail_loc: getImageUrl(video.imageUrl300x400) || getImageUrl(video.imageUrlStandard) || '',
            description: video.description,
            content_loc: `https://www.youtube.com/watch?v=${video.videoId}`,
            player_loc: `https://www.youtube.com/embed/${video.videoId}`,
            duration: 600, // Default duration in seconds (10 minutes)
            publication_date: new Date(playlist.createdAt).toISOString(),
            family_friendly: 'yes',
            requires_subscription: 'no',
            live: 'no',
          },
        ],
        // Also include video thumbnail as image
        images: [
          getImageUrl(video.imageUrl300x400),
          getImageUrl(video.imageUrlStandard),
        ].filter(Boolean) as string[],
      }))
    );

    // Writing pages with image sitemaps
    const writingPages: MetadataRoute.Sitemap = writings.map((writing: Writing) => ({
      url: formatUrl(`/writings/${writing.slug}`),
      lastModified: new Date(writing.updatedAt || writing.publishedAt),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
      alternates: {
        languages: {
          'he-IL': formatUrl(`/writings/${writing.slug}`),
        },
      },
      ...(writing.image && {
        images: [getImageUrl(writing.image.url)].filter(Boolean) as string[],
      }),
    }));

    // Combine all pages
    return [
      ...staticPages, 
      ...blogPages, 
      ...playlistPages, 
      ...videoPages, // Individual video pages with video sitemaps
      ...writingPages
    ];

  } catch (error) {
    console.error('Error generating sitemap:', error);
    // Return at least static pages if dynamic content fails
    return [
      {
        url: baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 1,
        alternates: {
          languages: {
            'he-IL': baseUrl,
          },
        },
      },
    ];
  }
} 