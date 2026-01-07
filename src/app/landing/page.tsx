"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { LandingFeatureV2 } from "@/components/landing-v2/LandingFeatureV2";
import { LandingFooterV2 } from "@/components/landing-v2/LandingFooterV2";
import { LandingHeaderV2 } from "@/components/landing-v2/LandingHeaderV2";
import { LandingHeroV2 } from "@/components/landing-v2/LandingHeroV2";
import { LandingUsageV2 } from "@/components/landing-v2/LandingUsageV2";
import { useAuth } from "@/hooks/useAuth";

const LandingPage = () => {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  // 既に認証済みの場合はカレンダーページにリダイレクト
  useEffect(() => {
    if (!isLoading && user) {
      router.push("/");
    }
  }, [user, isLoading, router]);

  // ローディング中
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  // 未認証の場合のみランディングページを表示
  if (!user) {
    return (
      <div className="min-h-screen bg-background text-foreground selection:bg-primary/20">
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
    );
  }
  return null;
};

export default LandingPage;
