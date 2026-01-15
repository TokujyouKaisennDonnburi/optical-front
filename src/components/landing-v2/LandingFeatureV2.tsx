"use client";

import { motion, useMotionTemplate, useMotionValue } from "framer-motion";
import {
  BarChart3,
  CalendarCheck,
  CheckSquare,
  GitPullRequest,
  Lightbulb,
  Sparkles,
  Target,
} from "lucide-react";
import type { MouseEvent } from "react";

const featureCategories = [
  {
    title: "標準機能",
    description: "最初から使える、あなたの生活を支える基盤機能。",
    features: [
      {
        icon: Sparkles,
        title: "AIエージェント (予定作成)",
        description:
          "バイトやゴミ出しなどのルーチンワークを学習し、あなたの代わりに予定を自動で作成します。",
        className: "col-span-1 md:col-span-1 lg:col-span-1",
      },
      {
        icon: Lightbulb,
        title: "AIエージェント (機能提案)",
        description:
          "あなたの使い方を分析し、最適なカレンダー機能や設定をAIが能動的に提案します。",
        className: "col-span-1 md:col-span-1 lg:col-span-1",
      },
    ],
  },
  {
    title: "一般オプション",
    description: "必要に応じて追加できる、便利な拡張機能。",
    features: [
      {
        icon: CalendarCheck,
        title: "スケジューラー機能",
        description:
          "メンバー間で候補日を調整し、確定した予定を自動追加。面倒な日程調整をスムーズに。",
        className: "col-span-1 md:col-span-1 lg:col-span-1",
      },
      {
        icon: CheckSquare,
        title: "ToDo機能",
        description:
          "個人のタスクもチームの課題も一元管理。カレンダーと連動し、期限切れを防ぎます。",
        className: "col-span-1 md:col-span-1 lg:col-span-1",
      },
    ],
  },
  {
    title: "エンジニアオプション",
    description: "開発者のための、GitHub連携による高度な生産性向上ツール。",
    features: [
      {
        icon: BarChart3,
        title: "レビュー負荷の可視化",
        description:
          "チームメンバーのレビュー抱え込み状況をグラフで可視化。アサインの偏りを防ぎ、健全な開発体制を維持します。",
        className: "col-span-1 md:col-span-1 lg:col-span-1",
      },
      {
        icon: GitPullRequest,
        title: "レビュー待ちPR通知",
        description:
          "あなたがレビューすべきPull Requestをカレンダー上に表示。タスク漏れを防ぎ、スムーズな開発フローを実現します。",
        className: "col-span-1 md:col-span-1 lg:col-span-1",
      },
      {
        icon: Target,
        title: "マイルストーン達成率",
        description:
          "現在のマイルストーンの進捗状況をリアルタイムで可視化。目標達成に向けたペース配分をサポートします。",
        className: "col-span-1 md:col-span-2 lg:col-span-2",
      },
    ],
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
    <div
      aria-hidden="true"
      className={`group relative border border-black/10 dark:border-white/40 group-hover:border-primary/50 transition-colors duration-300 overflow-hidden rounded-[2rem] bg-background/50 backdrop-blur-md ${className}`}
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
      <div className="absolute top-0 right-0 w-[31.25rem] h-[31.25rem] bg-blue-400/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[31.25rem] h-[31.25rem] bg-purple-400/5 rounded-full blur-[100px] pointer-events-none" />

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
            シンプル使いから高度な機能まで、
            <br />
            自身に合わせてカスタマイズ。
          </motion.p>
        </div>

        <div className="space-y-24">
          {featureCategories.map((category, _categoryIndex) => (
            <div key={category.title}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="mb-10 text-center md:text-left"
              >
                <h3 className="text-2xl font-bold mb-3 flex items-center justify-center md:justify-start gap-3">
                  <span className="w-1.5 h-8 bg-primary rounded-full hidden md:block" />
                  {category.title}
                </h3>
                <p className="text-muted-foreground">{category.description}</p>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                {category.features.map((feature, featureIndex) => (
                  <SpotlightCard
                    key={feature.title}
                    className={feature.className}
                  >
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{
                        duration: 0.5,
                        delay: featureIndex * 0.1,
                      }}
                      className="p-8 h-full flex flex-col items-start gap-4 relative z-10"
                    >
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-2 group-hover:scale-110 transition-transform duration-300">
                        <feature.icon className="w-6 h-6" />
                      </div>

                      <div>
                        <h3 className="text-xl font-bold mb-2 tracking-tight group-hover:text-primary transition-colors">
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
          ))}
        </div>
      </div>
    </section>
  );
};
