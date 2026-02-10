import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    turbopackFileSystemCacheForBuild: true,
  },
  images: {
    remotePatterns: [
      {
        hostname: '*.convex.cloud',
        protocol: 'https',
      },
      {
        hostname: 'images.unsplash.com',
        protocol: 'https',
      },
      {
        hostname: 'picsum.photos',
        protocol: 'https',
      },
      {
        hostname: 'api.dicebear.com',
        protocol: 'https',
      },
    ],
  },
};

export default nextConfig;
