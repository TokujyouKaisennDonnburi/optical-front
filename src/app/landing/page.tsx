
import { LandingHeader } from "@/components/organisms/LandingHeader";
import { LandingHero } from "@/components/organisms/LandingHero";

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* 固定ヘッダー */}
      <LandingHeader />

      {/* Heroセクション */}
      <LandingHero />

      {/* ダミーコンテンツ */}
      <main className="container mx-auto px-6 py-20 space-y-20">
        <section id="features" className="h-[80vh] flex items-center justify-center bg-gray-100">
          <h2 className="text-3xl font-semibold">製品紹介セクション</h2>
        </section>

        <section id="options" className="h-[80vh] flex items-center justify-center bg-gray-100">
          <h2 className="text-3xl font-semibold">Option 制セクション</h2>
        </section>

        <section id="pricing" className="h-[80vh] flex items-center justify-center bg-gray-50">
          <h2 className="text-3xl font-semibold">料金プランセクション</h2>
        </section>
      </main>
    </div>
  );
}
