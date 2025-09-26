import { Button } from "@/components/atoms/Button";

export const LandingHero = () => {
  return (
    <section className="h-[80vh] flex flex-col items-center justify-center text-center bg-gray-50 px-6">
      <h1 className="text-5xl font-bold mb-4">
        最適化されたスケジュール管理</h1>
      <p className="text-lg text-gray-700 mb-8">
        あなたのスタイルに合わせてカスタムされた<br />
        スケジュール管理を始めませんか
      </p>
      <Button size="lg">無料で始める</Button>
    </section>
  );
};
