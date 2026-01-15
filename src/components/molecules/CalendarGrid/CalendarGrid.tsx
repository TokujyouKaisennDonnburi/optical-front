"use client";

import type { ReactNode } from "react";

import { useSettings } from "@/providers/SettingsProvider";
import { cn } from "@/utils_constants_styles/utils";

const WEEKDAYS_EN = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const;
const WEEKDAYS_JA = ["日", "月", "火", "水", "木", "金", "土"] as const;

export type CalendarGridProps = {
  children: ReactNode;
  className?: string;
};

export function CalendarGrid({ children, className }: CalendarGridProps) {
  const { weekdayLanguage } = useSettings();
  const weekdays = weekdayLanguage === "ja" ? WEEKDAYS_JA : WEEKDAYS_EN;

  return (
    <div
      className={cn(
        "flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border shadow-inner",
        // ライトモード: 温かみのあるストーン系
        "border-stone-200 bg-stone-50",
        // ダークモード: 従来のスレート系
        "dark:border-white/10 dark:bg-slate-950/70",
        className,
      )}
    >
      <div
        className={cn(
          "grid grid-cols-7 border-b text-xs uppercase tracking-wide",
          // ライトモード
          "border-stone-200 bg-stone-100/80 text-stone-600",
          // ダークモード
          "dark:border-white/10 dark:bg-white/5 dark:text-muted-foreground",
        )}
      >
        {weekdays.map((label, index) => (
          <div
            key={`weekday-${label}`}
            className={cn(
              "px-2 py-1 font-medium",
              // 週末の色分け
              (index === 0 || index === 6) &&
                "text-rose-500 dark:text-rose-200/80",
            )}
          >
            {label}
          </div>
        ))}
      </div>
      <div className="relative flex min-h-0 flex-1 flex-col">{children}</div>
    </div>
  );
}
