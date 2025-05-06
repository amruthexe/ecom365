import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false, // Disable React strict mode (optional, helps identify hydration causes)
  images: {
    domains: ["ik.imagekit.io"],
  },
};

export default nextConfig;
