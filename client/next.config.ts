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
  /* config options here */
  images: {
    remotePatterns: [
      strapiRemotePattern,
      // Add specific pattern for Strapi Cloud media URLs
      {
        protocol: "https",
        hostname: "*.media.strapiapp.com",
        pathname: "/**",
      },
      // Generic HTTPS pattern as fallback
      {
        protocol: "https",
        hostname: "**",
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
            value: 'public, max-age=3600, stale-while-revalidate=86400',
          },
        ],
      },
      {
        source: '/sitemap(.*).xml',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/xml; charset=utf-8',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, stale-while-revalidate=86400',
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
    ];
  },
};

export default nextConfig;
