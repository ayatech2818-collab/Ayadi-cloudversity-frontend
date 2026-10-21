import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Stamped at build time: the public-content cache in the browser is thrown
     away when this changes, so each deploy starts from fresh data
     (src/lib/query/QueryProvider.tsx). */
  env: {
    CACHE_BUILD_ID: String(Date.now()),
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "raihan-materials.s3.ap-southeast-1.amazonaws.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;