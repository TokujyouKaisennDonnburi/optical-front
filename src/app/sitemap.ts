import type { MetadataRoute } from "next";

// サイトのベースURLを設定（デプロイ時に環境変数で上書き可能）
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://opti-cal.org";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${BASE_URL}/login`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/signup`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    // 必要に応じて他のページを追加
  ];
}
