import type { ReactNode } from "react";

import { cn } from "@/utils_constants_styles/utils";

const WEEKDAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;

export type CalendarGridProps = {
  children: ReactNode;
  className?: string;
};

export function CalendarGrid({ children, className }: CalendarGridProps) {
  return (
    <div
      className={cn(
        "flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-white/10 bg-slate-950/70 shadow-inner",
        className,
      )}
    >
      <div className="grid grid-cols-7 border-b border-white/10 bg-white/5 text-[12px] uppercase tracking-wide text-muted-foreground">
        {WEEKDAYS.map((label, index) => (
          <div
            key={`weekday-${label}`}
            className={cn("px-2 py-0.5", index >= 5 && "text-rose-200/80")}
          >
            {label}
          </div>
        ))}
      </div>
      <div className="relative flex min-h-0 flex-1 flex-col">{children}</div>
    </div>
  );
}
