"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Spinner } from "@/components/ui/spinner";

interface InitialLoadingProps {
  message?: string;
}

export function InitialLoading({ message }: InitialLoadingProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex min-h-screen w-full flex-col items-center justify-center bg-muted/10 backdrop-blur-sm"
    >
      <div className="flex flex-col items-center justify-center space-y-6">
        <motion.div
          animate={{
            scale: [1, 1.05, 1],
            opacity: [0.8, 1, 0.8],
          }}
          transition={{
            duration: 2,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
          className="relative flex items-center justify-center p-4"
        >
          {/* 光彩エフェクト */}
          <div className="absolute inset-0 bg-primary/20 blur-[40px] rounded-full" />

          <Image
            src="/optical.png"
            alt="OptiCal"
            width={80}
            height={80}
            className="relative z-10 drop-shadow-lg"
            priority
          />
        </motion.div>

        <div className="flex flex-col items-center gap-3">
          <Spinner className="size-6 text-primary" />
          {message && (
            <motion.p
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-sm font-medium text-muted-foreground animate-pulse"
            >
              {message}
            </motion.p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
