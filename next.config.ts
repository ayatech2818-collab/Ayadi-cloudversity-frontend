import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Course photos in the Featured Courses section are hosted on Unsplash.
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
