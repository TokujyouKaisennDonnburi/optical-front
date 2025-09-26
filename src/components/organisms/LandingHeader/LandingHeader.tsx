import { Button } from "@/components/atoms/Button";

export const LandingHeader = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
      <div className="container mx-auto flex items-center justify-between px-6 py-4">
        {/* Logo */}
        <div className="text-xl font-bold">サービスロゴ</div>

        {/* Navigation */}
        <nav className="hidden md:flex space-x-6 text-sm font-medium">
          <a href="#features" className="hover:text-primary">
            製品紹介
          </a>
          <a href="#pricing" className="hover:text-primary">
            料金プラン
          </a>
          <a href="#options" className="hover:text-primary">
            Option制
          </a>
        </nav>

        {/* Actions */}
        <div className="flex items-center space-x-4">
          <a href="/login" className="text-sm hover:underline">
            ログイン
          </a>
          <Button>無料で始める</Button>
        </div>
      </div>
    </header>
  );
};
