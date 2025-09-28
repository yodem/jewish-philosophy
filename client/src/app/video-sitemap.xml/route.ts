import { getAllPlaylists } from '@/data/loaders';
import { Playlist, Video } from '@/types';

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://jewish-philosophy.vercel.app';
  
  try {
    const playlists = await getAllPlaylists().catch(() => []);
    
    // Helper function to get image URL
    const getImageUrl = (strapiUrl?: string) => {
      if (!strapiUrl) return '';
      if (strapiUrl.startsWith('http')) return strapiUrl;
      return `${process.env.NEXT_PUBLIC_STRAPI_BASE_URL || ''}${strapiUrl}`;
    };

    // Helper function to format URL
    const formatUrl = (path: string) => {
      const cleanPath = path.startsWith('/') ? path : `/${path}`;
      const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
      return `${cleanBaseUrl}${cleanPath}`;
    };

    // Helper function to escape XML
    const escapeXml = (str: string) => {
      return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    };

    const videoEntries = playlists.flatMap((playlist: Playlist) => 
      (playlist.videos || []).map((video: Video) => {
        const videoUrl = formatUrl(`/playlists/${playlist.slug}/${video.slug}`);
        const thumbnailUrl = getImageUrl(video.imageUrl300x400) || getImageUrl(video.imageUrlStandard);
        const title = escapeXml(video.title || '');
        const description = escapeXml((video.description || '').substring(0, 2048)); // Limit description length
        const publishDate = new Date(playlist.createdAt).toISOString();

        return `
    <url>
      <loc>${videoUrl}</loc>
      <video:video>
        <video:title>${title}</video:title>
        <video:description>${description}</video:description>
        <video:thumbnail_loc>${thumbnailUrl}</video:thumbnail_loc>
        <video:content_loc>https://www.youtube.com/watch?v=${video.videoId}</video:content_loc>
        <video:player_loc>https://www.youtube.com/embed/${video.videoId}</video:player_loc>
        <video:publication_date>${publishDate}</video:publication_date>
        <video:family_friendly>yes</video:family_friendly>
        <video:requires_subscription>no</video:requires_subscription>
        <video:live>no</video:live>
      </video:video>
      <lastmod>${publishDate}</lastmod>
      <changefreq>weekly</changefreq>
      <priority>0.8</priority>
    </url>`;
      })
    ).join('');

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" 
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
${videoEntries}
</urlset>`;

    return new Response(sitemap, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    });

  } catch (error) {
    console.error('Error generating video sitemap:', error);
    
    // Return minimal valid XML on error
    const errorSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" 
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
</urlset>`;

    return new Response(errorSitemap, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=300, s-maxage=300',
      },
    });
  }
}