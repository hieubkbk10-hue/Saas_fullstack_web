import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Cache Turbopack compilation artifacts between builds
    // Reduces compile time significantly on subsequent deployments
    turbopackFileSystemCacheForBuild: true,
  },
};

export default nextConfig;
