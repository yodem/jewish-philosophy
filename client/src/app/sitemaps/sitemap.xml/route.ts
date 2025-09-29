import { getAllBlogs, getAllPlaylists, getAllWritings } from '@/data/loaders';
import { Blog, Playlist, Writing, Video } from '@/types';

export async function GET() {
  // Validate environment variables
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://jewish-philosophy.vercel.app/';
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

    // Helper function to escape XML
    const escapeXml = (str: string) => {
      return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    };

    // Static pages
    const staticPages = [
      {
        url: normalizedBaseUrl.slice(0, -1), // Remove trailing slash for homepage
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

    // Get dynamic content with timeout protection
    const [blogs, playlists, writings] = await Promise.allSettled([
      fetchWithTimeout(() => getAllBlogs(), 7000),
      fetchWithTimeout(() => getAllPlaylists(), 7000),
      fetchWithTimeout(() => getAllWritings(), 7000),
    ]).then(results => [
      results[0].status === 'fulfilled' ? results[0].value : [],
      results[1].status === 'fulfilled' ? results[1].value : [],
      results[2].status === 'fulfilled' ? results[2].value : [],
    ]);

    // Blog pages
    const blogPages = blogs.map((blog: Blog) => ({
      url: formatUrl(`/blog/${blog.slug}`),
      lastModified: new Date(blog.publishedAt),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
      ...(blog.coverImage && {
        images: [getImageUrl(blog.coverImage.url)].filter(Boolean) as string[],
      }),
    }));

    // Playlist pages
    const playlistPages = playlists.map((playlist: Playlist) => ({
      url: formatUrl(`/playlists/${playlist.slug}`),
      lastModified: new Date(playlist.updatedAt || playlist.createdAt),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
      images: [
        getImageUrl(playlist.imageUrl300x400),
        getImageUrl(playlist.imageUrlStandard),
      ].filter(Boolean) as string[],
    }));

    // Individual video pages
    const videoPages = playlists.flatMap((playlist: Playlist) => 
      (playlist.videos || []).map((video: Video) => ({
        url: formatUrl(`/playlists/${playlist.slug}/${video.slug}`),
        lastModified: new Date(playlist.updatedAt || playlist.createdAt),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
        images: [
          getImageUrl(video.imageUrl300x400),
          getImageUrl(video.imageUrlStandard),
        ].filter(Boolean) as string[],
      }))
    );

    // Writing pages
    const writingPages = writings.map((writing: Writing) => ({
      url: formatUrl(`/writings/${writing.slug}`),
      lastModified: new Date(writing.updatedAt || writing.publishedAt),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
      ...(writing.image && {
        images: [getImageUrl(writing.image.url)].filter(Boolean) as string[],
      }),
    }));

    // Combine all pages
    const allPages = [
      ...staticPages, 
      ...blogPages, 
      ...playlistPages, 
      ...videoPages,
      ...writingPages,
    ];

    // Generate XML sitemap
    const sitemapEntries = allPages.map((page) => {
      const imageEntries = page.images ? page.images.map((imageUrl: string) => 
        `    <image:image>\n      <image:loc>${escapeXml(imageUrl)}</image:loc>\n    </image:image>`
      ).join('\n') : '';

      return `  <url>
    <loc>${escapeXml(page.url)}</loc>
    <lastmod>${page.lastModified.toISOString()}</lastmod>
    <changefreq>${page.changeFrequency}</changefreq>
    <priority>${page.priority}</priority>${imageEntries ? '\n' + imageEntries : ''}
  </url>`;
    }).join('\n');

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" 
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${sitemapEntries}
</urlset>`;

    return new Response(sitemap, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=1800, s-maxage=3600',
        'X-Robots-Tag': 'noindex',
      },
    });

  } catch (error) {
    console.error('Error generating sitemap:', error);
    
    // Return at least static pages if dynamic content fails
    const fallbackSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${normalizedBaseUrl.slice(0, -1)}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${normalizedBaseUrl}about</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${normalizedBaseUrl}blog</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
</urlset>`;

    return new Response(fallbackSitemap, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=300, s-maxage=300',
        'X-Robots-Tag': 'noindex',
      },
    });
  }
}