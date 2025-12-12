"use client";

import { motion, useMotionTemplate, useMotionValue } from "framer-motion";
import {
  Calendar,
  Cloud,
  Shield,
  Smartphone,
  Sparkles,
  Users,
  Zap,
} from "lucide-react";
import type { MouseEvent } from "react";

const features = [
  {
    icon: Calendar,
    title: "スマートスケジューリング",
    description:
      "AIがあなたの時間を最適化し、最も生産的なスケジュールを自動提案します。",
    className: "col-span-1 md:col-span-2 lg:col-span-2",
  },
  {
    icon: Users,
    title: "チーム同期機能",
    description: "リアルタイムでチーム全員の予定を把握。",
    className: "col-span-1 md:col-span-1 lg:col-span-1",
  },
  {
    icon: Zap,
    title: "超高速アクション",
    description: "キーボードショートカットで瞬時に操作。",
    className: "col-span-1 md:col-span-1 lg:col-span-1",
  },
  {
    icon: Shield,
    title: "エンタープライズ級セキュリティ",
    description: "銀行レベルの暗号化で、あなたのデータを守ります。",
    className: "col-span-1 md:col-span-2 lg:col-span-2",
  },
  {
    icon: Cloud,
    title: "クラウド同期",
    description: "あらゆるデバイスから、いつでもアクセス。",
    className: "col-span-1 md:col-span-1 lg:col-span-1",
  },
  {
    icon: Smartphone,
    title: "モバイル完全対応",
    description: "外出先でもスムーズな操作感。",
    className: "col-span-1 md:col-span-1 lg:col-span-1",
  },
  {
    icon: Sparkles,
    title: "自動調整",
    description: "ダブルブッキングを自動で回避。",
    className:
      "col-span-1 md:col-span-1 lg:col-span-1 bg-primary/5 dark:bg-primary/10 border-primary/20",
  },
];

function SpotlightCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({ currentTarget, clientX, clientY }: MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: Mouse tracking for spotlight visual effect only
    <div
      className={`group relative border border-white/10 overflow-hidden rounded-[2rem] bg-background/50 backdrop-blur-md ${className}`}
      onMouseMove={handleMouseMove}
    >
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-[2rem] opacity-0 transition duration-300 group-hover:opacity-100"
        style={{
          background: useMotionTemplate`
            radial-gradient(
              650px circle at ${mouseX}px ${mouseY}px,
              rgba(var(--primary-rgb, 120, 120, 255), 0.15),
              transparent 80%
            )
          `,
        }}
      />
      <div className="relative h-full">{children}</div>
    </div>
  );
}

export const LandingFeatureV2 = () => {
  return (
    <section
      className="py-32 bg-secondary/10 relative overflow-hidden"
      id="features"
    >
      {/* Decorative background blobs */}
      <div className="absolute top-0 right-0 w-[31.25rem] h-[31.25rem] bg-blue-400/5 rounded-full blur-[6.25rem] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[31.25rem] h-[31.25rem] bg-purple-400/5 rounded-full blur-[6.25rem] pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-24">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-5xl font-bold tracking-tight mb-8"
          >
            必要な機能を、
            <br className="md:hidden" />
            <span className="text-primary italic">すべてここに。</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl text-muted-foreground max-w-2xl mx-auto"
          >
            デザインとパフォーマンスを愛するあなたのための、
            <br />
            究極のツールキット。
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <SpotlightCard key={feature.title} className={feature.className}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="p-8 h-full flex flex-col justify-between"
              >
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-110 duration-500 pointer-events-none">
                  <feature.icon className="w-24 h-24" />
                </div>

                <div className="mb-8 relative z-10">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-white to-gray-100 dark:from-gray-800 dark:to-gray-900 shadow-inner flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-300 ring-1 ring-black/5">
                    <feature.icon className="w-7 h-7" />
                  </div>
                </div>
                <div className="relative z-10">
                  <h3 className="text-xl font-bold mb-3 tracking-snug group-hover:text-primary transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            </SpotlightCard>
          ))}
        </div>
      </div>
    </section>
  );
};
