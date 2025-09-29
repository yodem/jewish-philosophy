import type { MetadataRoute } from 'next';
import { getAllPlaylists } from '@/data/loaders';
import { Playlist, Video } from '@/types';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://jewish-philosophy.vercel.app/';
  
  // Ensure baseUrl always ends with "/"
  const normalizedBaseUrl = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
  
  try {
    // Add timeout protection for Strapi API calls
    const fetchWithTimeout = async <T>(fetchFn: () => Promise<T>, timeoutMs = 8000): Promise<T> => {
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Fetch timeout')), timeoutMs);
      });
      
      return Promise.race([fetchFn(), timeoutPromise]);
    };

    const playlists = await fetchWithTimeout(() => getAllPlaylists(), 7000).catch((error) => {
      console.error('Failed to fetch playlists for video sitemap:', error);
      return [];
    });
    
    // Helper function to get image URL
    const getImageUrl = (strapiUrl?: string) => {
      if (!strapiUrl) return undefined;
      if (strapiUrl.startsWith('http')) return strapiUrl;
      return `${process.env.NEXT_PUBLIC_STRAPI_BASE_URL || 'http://localhost:1337'}${strapiUrl}`;
    };

    // Helper function to format URL
    const formatUrl = (path: string) => {
      const cleanPath = path.startsWith('/') ? path.slice(1) : path; // Remove leading slash if present
      return `${normalizedBaseUrl}${cleanPath}`;
    };

    // Generate video sitemap entries using the videos property as per Next.js documentation
    const videoSitemap: MetadataRoute.Sitemap = playlists.flatMap((playlist: Playlist) => 
      (playlist.videos || []).map((video: Video) => ({
        url: formatUrl(`/playlists/${playlist.slug}/${video.slug}`),
        lastModified: new Date(playlist.updatedAt || playlist.createdAt),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
        // Use videos property for proper video sitemap as per Next.js docs
        videos: [
          {
            title: video.title || '',
            description: (video.description || '').substring(0, 2048),
            thumbnail_loc: getImageUrl(video.imageUrl300x400) || getImageUrl(video.imageUrlStandard) || '',
            content_loc: `https://www.youtube.com/watch?v=${video.videoId}`,
            player_loc: `https://www.youtube.com/embed/${video.videoId}`,
            publication_date: new Date(playlist.createdAt).toISOString(),
            family_friendly: 'yes',
            requires_subscription: 'no',
            live: 'no',
          }
        ]
      }))
    );

    return videoSitemap;

  } catch (error) {
    console.error('Error generating video sitemap:', error);
    
    // Return empty array on error
    return [];
  }
}
