import type { NextConfig } from "next";

// Get Strapi URL from environment variable or fallback to localhost
// Use NEXT_PUBLIC_ prefix to match consts.ts
const strapiUrl = process.env.NEXT_PUBLIC_STRAPI_BASE_URL || "http://localhost:1337";
const strapiUrlObject = new URL(strapiUrl);

// Build remote patterns dynamically based on the Strapi URL
const strapiRemotePattern = {
  protocol: strapiUrlObject.protocol.slice(0, -1) as "http" | "https", // Remove the trailing ':'
  hostname: strapiUrlObject.hostname,
  ...(strapiUrlObject.port && { port: strapiUrlObject.port }),
  pathname: "/**",
};

const nextConfig: NextConfig = {
  cacheComponents: true,
  images: {
    unoptimized: true,
    formats: ['image/avif', 'image/webp'],
    // StrapiImage defaults to 85; callers also use 75 and 100
    qualities: [75, 85, 100],
    remotePatterns: [
      strapiRemotePattern,
      // Add specific pattern for Strapi Cloud media URLs
      {
        protocol: "https",
        hostname: "*.media.strapiapp.com",
        pathname: "/**",
      },
      // YouTube thumbnails (used in playlist/video pages)
      {
        protocol: "https",
        hostname: "i.ytimg.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "img.youtube.com",
        pathname: "/**",
      },
    ],
  },
  // Ensure proper headers for XML files
  async headers() {
    return [
      {
        source: '/sitemap.xml',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/xml; charset=utf-8',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=1800, s-maxage=3600',
          },
          {
            key: 'X-Robots-Tag',
            value: 'noindex',
          },
        ],
      },
      {
        source: '/video/sitemap.xml',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/xml; charset=utf-8',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=1800, s-maxage=3600',
          },
          {
            key: 'X-Robots-Tag',
            value: 'noindex',
          },
        ],
      },
      {
        source: '/sitemap-index.xml',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/xml; charset=utf-8',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=1800, s-maxage=3600',
          },
          {
            key: 'X-Robots-Tag',
            value: 'noindex',
          },
        ],
      },
      {
        source: '/robots.txt',
        headers: [
          {
            key: 'Content-Type',
            value: 'text/plain; charset=utf-8',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600',
          },
        ],
      },
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
