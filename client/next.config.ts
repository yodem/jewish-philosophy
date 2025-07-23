import type { NextConfig } from "next";

// Get Strapi URL from environment variable or fallback to localhost
const strapiUrl = process.env.STRAPI_BASE_URL || "http://localhost:1337";
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
      {
        protocol: "https",
        hostname: "i.ytimg.com",
        pathname: "/**",
      },
      // Add pattern for Strapi cloud media URLs
      {
        protocol: "https",
        hostname: "*.media.strapiapp.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
