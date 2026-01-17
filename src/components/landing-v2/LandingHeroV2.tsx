"use client";

import { motion } from "framer-motion";
import { ArrowRight, Play } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { DemoVideoModal } from "./DemoVideoModal";

export const LandingHeroV2 = () => {
  const [isDemoOpen, setIsDemoOpen] = useState(false);

  return (
    <div className="relative overflow-hidden min-h-[110vh] flex items-center justify-center bg-background text-foreground font-sans section-hero">
      {/* Dynamic Background Elements - Organic Gradients */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 45, 0],
            opacity: [0.3, 0.5, 0.3],
            x: [0, 50, 0],
            y: [0, -50, 0],
          }}
          transition={{
            duration: 20,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
          className="absolute -top-[10%] -right-[10%] w-[50rem] h-[50rem] rounded-full bg-gradient-to-br from-primary/30 to-purple-500/30 blur-[120px]"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            rotate: [0, -30, 0],
            opacity: [0.2, 0.4, 0.2],
            x: [0, -30, 0],
            y: [0, 30, 0],
          }}
          transition={{
            duration: 25,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
            delay: 2,
          }}
          className="absolute top-[20%] -left-[10%] w-[37.5rem] h-[37.5rem] rounded-full bg-gradient-to-tr from-blue-500/30 to-cyan-500/30 blur-[100px]"
        />
      </div>

      <div className="container relative z-10 px-6 mx-auto text-center perspective-1000">
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="text-6xl md:text-7xl font-black tracking-tight mb-8 leading-tight selection:bg-primary/30"
        >
          すべての人の「最適」解
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="max-w-2xl mx-auto text-xl md:text-2xl text-muted-foreground mb-12 leading-relaxed font-light tracking-wide"
        >
          スケジュール管理を、もっと美しく、もっと知的に。
          <br className="hidden md:block" />
          OptiCalは、どんな人でも使える体験を提供します。
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-6"
        >
          <Link href="/auth/signup">
            <Button
              size="lg"
              className="h-16 px-10 text-lg rounded-full shadow-xl shadow-primary/20 hover:shadow-primary/40 hover:scale-105 transition-all duration-300 font-bold bg-primary text-primary-foreground border-0"
            >
              無料で始める <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
          <Button
            variant="outline"
            size="lg"
            onClick={() => setIsDemoOpen(true)}
            className="h-16 px-10 text-lg rounded-full backdrop-blur-md bg-white/10 border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105"
          >
            <Play className="mr-2 w-5 h-5 fill-current" /> CMを見る
          </Button>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-muted-foreground/50"
      >
        <span className="text-xs uppercase tracking-[0.2em]">Scroll</span>
        <div className="w-px h-12 bg-gradient-to-b from-muted-foreground/50 to-transparent"></div>
      </motion.div>

      <DemoVideoModal
        isOpen={isDemoOpen}
        onClose={() => setIsDemoOpen(false)}
      />
    </div>
  );
};
