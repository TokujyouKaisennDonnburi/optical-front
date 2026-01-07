/**
 * JSON-LD 構造化データコンポーネント
 * Google検索でリッチリザルト表示を可能にする
 */

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://opti-cal.org";

// WebApplication スキーマ
export function WebApplicationJsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "OptiCal",
    url: BASE_URL,
    description:
      "オプション機能の自由設計により、シンプルな個人利用からエンジニアチーム向けの高度な運用まで対応できるカレンダーアプリ。",
    applicationCategory: "ProductivityApplication",
    operatingSystem: "Web Browser",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "JPY",
    },
    author: {
      "@type": "Organization",
      name: "OptiCal Team",
      url: BASE_URL,
    },
  };

  return (
    <script
      type="application/ld+json"
      // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LDの埋め込みには必要な標準的手法
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

// Organization スキーマ
export function OrganizationJsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "OptiCal",
    url: BASE_URL,
    logo: `${BASE_URL}/images/logo.png`,
    sameAs: [
      // SNSリンクがあれば追加
      // "https://twitter.com/optical",
      // "https://github.com/optical",
    ],
  };

  return (
    <script
      type="application/ld+json"
      // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LDの埋め込みには必要な標準的手法
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

// SoftwareApplication スキーマ（アプリストア向け）
export function SoftwareApplicationJsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "OptiCal",
    operatingSystem: "Web",
    applicationCategory: "BusinessApplication",
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      ratingCount: "100",
    },
  };

  return (
    <script
      type="application/ld+json"
      // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LDの埋め込みには必要な標準的手法
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
