import type { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://opti-cal.org";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/_next/static/", // レンダリングに必要な静的資産を許可
        ],
        disallow: [
          "/api/", // APIエンドポイントは除外
          "/calendar/", // ログイン後のカレンダーページは除外
          "/schedule/", // スケジュール管理ページは除外
          "/_next/image", // 画像最適化APIは除外
          "/_next/data/", // ISR/SSGデータは除外
        ],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
