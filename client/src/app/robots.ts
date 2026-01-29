import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://religousphilosophy.com/';
  
  // Ensure baseUrl always ends with "/"
  const normalizedBaseUrl = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
  
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/_next/',
          '/private/',
          '/playlists/--*',
        ],
      },
      // Allow specific search engines
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/_next/',
          '/private/',
          '/playlists/--*',
        ],
      },
      {
        userAgent: 'Bingbot',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/_next/',
          '/private/',
          '/playlists/--*',
        ],
      },
    ],
    sitemap: `${normalizedBaseUrl}sitemap-index.xml`,
    host: normalizedBaseUrl,
  };
} 