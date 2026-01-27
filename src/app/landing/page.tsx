import { LandingFeatureV2 } from "@/components/landing-v2/LandingFeatureV2";
import { LandingFooterV2 } from "@/components/landing-v2/LandingFooterV2";
import { LandingHeaderV2 } from "@/components/landing-v2/LandingHeaderV2";
import { LandingHeroV2 } from "@/components/landing-v2/LandingHeroV2";
import { LandingUsageV2 } from "@/components/landing-v2/LandingUsageV2";
import { AuthRedirect } from "./auth-redirect";

/**
 * ランディングページ（Server Component）
 * 静的コンテンツはサーバーでレンダリングし、認証リダイレクトのみクライアントで実行
 */
export default function LandingPage() {
  return (
    <>
      {/* 認証済みユーザーをホームにリダイレクト（Client Component） */}
      <AuthRedirect />

      {/* 静的マーケティングコンテンツ（サーバーでレンダリング） */}
      <div
        className="light min-h-screen bg-background text-foreground selection:bg-primary/20"
        data-theme="light"
      >
        <LandingHeaderV2 />
        <main>
          <LandingHeroV2 />
          <section id="features">
            <LandingFeatureV2 />
          </section>
          <LandingUsageV2 />
        </main>
        <LandingFooterV2 />
      </div>
    </>
  );
}
