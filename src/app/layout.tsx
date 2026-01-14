import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/atoms/Toast";

export const runtime = "edge";

import "./globals.css";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { MockInitializer } from "@/components/providers/MockInitializer";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { SettingsProvider } from "@/providers/SettingsProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// SEO最適化されたメタデータ
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://opti-cal.org";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  // 基本メタデータ
  title: {
    default: "OptiCal - オプション制のカレンダー",
    template: "%s | OptiCal",
  },
  description:
    "OptiCalは、オプション機能の自由設計  により、シンプルな個人利用からエンジニアチーム向けの高度な運用まで幅広いユースケースに対応できるカレンダーアプリです。",
  keywords: [
    "カレンダー",
    "スケジュール管理",
    "予定管理",
    "オプション制",
    "AIカレンダー",
    "スマートカレンダー",
    "OptiCal",
  ],
  authors: [{ name: "OptiCal Team" }],
  creator: "OptiCal Team",
  publisher: "OptiCal",

  icons: {
    icon: "/favicon.png",
    apple: "/apple-touch-icon.png",
  },

  // 検索エンジン設定
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  // Open Graph (Facebook, LINE等のSNS共有用)
  openGraph: {
    type: "website",
    locale: "ja_JP",
    siteName: "OptiCal",
    title: "OptiCal - オプション制のカレンダー",
    description:
      "オプション機能の自由設計により、シンプルな個人利用からエンジニアチーム向けの高度な運用まで対応できるカレンダーアプリ。",
    images: [
      {
        url: "/images/og-image.png",
        width: 1200,
        height: 630,
        alt: "OptiCal - スマートカレンダー",
      },
    ],
  },

  // Twitter Card
  twitter: {
    card: "summary_large_image",
    title: "OptiCal - オプション制のカレンダー",
    description:
      "オプション機能の自由設計により、シンプルな個人利用からエンジニアチーム向けの高度な運用まで対応できるカレンダーアプリ。",
    images: ["/images/og-image.png"],
  },

  // その他
  category: "productivity",
};

// Viewport設定（Next.js 14+では別途exportが推奨）
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8f9fc" },
    { media: "(prefers-color-scheme: dark)", color: "#1a1a2e" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <MockInitializer />
        <ThemeProvider>
          <AuthProvider>
            <SettingsProvider>
              {children}
              <Toaster position="bottom-right" richColors />
            </SettingsProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
