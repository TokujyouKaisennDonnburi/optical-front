import Link from "next/link";

export const LandingFooterV2 = () => {
  return (
    <footer className="py-20 border-t border-border bg-gradient-to-b from-background to-secondary/20">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center mb-16">
          <div className="mb-8 md:mb-0 text-center md:text-left">
            <h3 className="text-3xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-500">
              OptiCal
            </h3>
            <p className="text-muted-foreground">
              カレンダー管理の未来を、あなたの手に。
            </p>
          </div>
          <div className="flex gap-8 font-medium">
            <Link
              href="#"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              Twitter
            </Link>
            <Link
              href="#"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              GitHub
            </Link>
            <Link
              href="#"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              Discord
            </Link>
          </div>
        </div>

        <div className="border-t border-border/50 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-muted-foreground">
          <p>&copy; 2024 OptiCal. All rights reserved.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <Link href="#" className="hover:text-foreground transition-colors">
              プライバシーポリシー
            </Link>
            <Link href="#" className="hover:text-foreground transition-colors">
              利用規約
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
