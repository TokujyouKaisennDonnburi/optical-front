"use client";

import { motion } from "framer-motion";
import { Check, Plus, Share2, UserRoundPlus } from "lucide-react";

const steps = [
  {
    icon: UserRoundPlus,
    title: "1. アカウント作成",
    description: "GoogleまたはGitHubアカウントでサインアップ。",
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: Share2,
    title: "2. カレンダーの共有",
    description:
      "招待したい人のメールアドレスを入力して、招待メールを送るだけ。",
    color: "from-purple-500 to-pink-500",
  },
  {
    icon: Plus,
    title: "3. カレンダーのオプション",
    description: "シンプルに欲しい機能だけを。",
    color: "from-orange-500 to-red-500",
  },
  {
    icon: Check,
    title: "4. さっそく使いましょう",
    description: "そのカレンダーはあなただけのカレンダーです。",
    color: "from-green-500 to-emerald-500",
  },
];

export const LandingUsageV2 = () => {
  return (
    <section
      id="usage"
      className="py-32 relative overflow-hidden bg-background"
    >
      {/* Connecting Line */}
      <div className="absolute left-1/2 top-0 bottom-0 w-[0.125rem] bg-gradient-to-b from-transparent via-border to-transparent hidden md:block" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block mb-4 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary text-sm font-medium tracking-wide"
          >
            HOW IT WORKS
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold tracking-tight mb-6"
          >
            たったの4ステップで、
            <br />
            <span className="text-primary">スケジュール管理を完了。</span>
          </motion.h2>
        </div>

        <div className="relative space-y-24">
          {steps.map((step, index) => {
            const isEven = index % 2 === 0;
            return (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, x: isEven ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className={`flex flex-col md:flex-row items-center gap-12 ${
                  isEven ? "md:flex-row" : "md:flex-row-reverse"
                }`}
              >
                {/* Text Side */}
                <div
                  className={`flex-1 text-center ${isEven ? "md:text-right" : "md:text-left"}`}
                >
                  <h3 className="text-3xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                    {step.title}
                  </h3>
                  <p className="text-xl text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </div>

                {/* Icon/Visual Side */}
                <div className="relative flex-shrink-0 z-10 group">
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${step.color} blur-[40px] opacity-20 group-hover:opacity-40 transition-opacity duration-500 rounded-full`}
                  />
                  <div className="w-24 h-24 rounded-3xl bg-background border border-border flex items-center justify-center shadow-2xl relative z-10 group-hover:scale-110 transition-transform duration-500 ease-out">
                    <step.icon className={`w-10 h-10 text-primary`} />
                  </div>
                </div>

                {/* Empty Spacer for layout balance */}
                <div className="flex-1 hidden md:block" />
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
