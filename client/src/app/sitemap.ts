import { MetadataRoute } from 'next';
import { getAllBlogs, getAllPlaylists, getAllWritings } from '@/data/loaders';
import { Blog, Playlist, Writing } from '@/types';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://beit-midrash-digital.com';
  
  try {
    // Static pages
    const staticPages = [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 1,
      },
      {
        url: `${baseUrl}/about`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.8,
      },
      {
        url: `${baseUrl}/blog`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 0.9,
      },
      {
        url: `${baseUrl}/playlists`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      },
      {
        url: `${baseUrl}/writings`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      },
      {
        url: `${baseUrl}/search`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.5,
      },
    ];

    // Get dynamic content
    const [blogs, playlists, writings] = await Promise.all([
      getAllBlogs().catch(() => []),
      getAllPlaylists().catch(() => []),
      getAllWritings().catch(() => []),
    ]);

    // Blog pages
    const blogPages = blogs.map((blog: Blog) => ({
      url: `${baseUrl}/blog/${blog.slug}`,
      lastModified: new Date(blog.publishedAt),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));

    // Playlist pages
    const playlistPages = playlists.map((playlist: Playlist) => ({
      url: `${baseUrl}/playlists/${playlist.slug}`,
      lastModified: new Date(playlist.updatedAt || playlist.createdAt),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }));

    // Writing pages
    const writingPages = writings.map((writing: Writing) => ({
      url: `${baseUrl}/writings/${writing.slug}`,
      lastModified: new Date(writing.updatedAt || writing.publishedAt),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    }));

    return [...staticPages, ...blogPages, ...playlistPages, ...writingPages];
  } catch (error) {
    console.error('Error generating sitemap:', error);
    // Return at least static pages if dynamic content fails
    return [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 1,
      },
    ];
  }
} 