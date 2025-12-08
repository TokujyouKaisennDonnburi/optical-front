import type { NextConfig } from "next";

const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  // Cloudflare Pages対応
  experimental: {
    // Edge Runtimeでの互換性を向上
    esmExternals: true,
  },
};

export default withBundleAnalyzer(nextConfig);
