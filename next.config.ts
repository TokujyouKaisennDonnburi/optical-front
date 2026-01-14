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
      {
        protocol: "http",
        hostname: "localhost",
      },
      {
        // モック用画像ホスト
        protocol: "https",
        hostname: "picsum.photos",
      },
      {
        // Cloudflare R2（カレンダー画像、アバター画像）
        protocol: "https",
        hostname: "pub-f6ed18ab1ffc407eb708446791aa0984.r2.dev",
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
