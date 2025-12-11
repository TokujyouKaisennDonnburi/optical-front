"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export const LandingHeaderV2 = () => {
  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: "circOut" }}
      className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none"
    >
      <div className="bg-white/70 dark:bg-black/70 backdrop-blur-xl border border-white/20 shadow-lg rounded-full px-8 py-4 flex items-center justify-between gap-12 pointer-events-auto max-w-3xl w-full ring-1 ring-black/5">
        <Link
          href="/"
          className="font-bold text-xl tracking-tight flex items-center gap-2"
        >
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          OptiCal
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
          <Link
            href="#features"
            className="hover:text-primary transition-colors"
          >
            機能
          </Link>
          <Link href="#usage" className="hover:text-primary transition-colors">
            使い方
          </Link>
          <Link href="#about" className="hover:text-primary transition-colors">
            私たちについて
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <Link
            href="/auth/login"
            className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors"
          >
            ログイン
          </Link>
          <Link href="/auth/signup">
            <Button
              size="sm"
              className="rounded-full px-6 font-bold shadow-lg shadow-primary/20"
            >
              無料で登録
            </Button>
          </Link>
        </div>
      </div>
    </motion.header>
  );
};
