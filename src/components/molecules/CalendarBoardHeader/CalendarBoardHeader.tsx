import { ChevronLeft, ChevronRight, type LucideIcon } from "lucide-react";

import { Badge } from "@/components/atoms/Badge";
import { Button } from "@/components/atoms/Button";
import { Icon } from "@/components/atoms/Icon";
import { cn } from "@/utils_constants_styles/utils";

export type CalendarBoardHeaderProps = {
  badgeLabel: string;
  monthLabel: string;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  badgeIcon?: LucideIcon;
  className?: string;
};

export function CalendarBoardHeader({
  badgeLabel,
  monthLabel,
  onPrev,
  onNext,
  onToday,
  badgeIcon,
  className,
}: CalendarBoardHeaderProps) {
  return (
    <div className={cn("flex items-center justify-between", className)}>
      <Badge variant="secondary" className="gap-1 px-2.5 py-0.5 text-xs">
        {badgeIcon ? <Icon icon={badgeIcon} size="sm" /> : null}
        {badgeLabel}
      </Badge>
      <div
        className={cn(
          "flex items-center gap-1.5 text-sm",
          // ライトモード
          "text-stone-700",
          // ダークモード
          "dark:text-white/80",
        )}
      >
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "h-8 w-8 rounded-md border transition",
            // ライトモード: 温かみのあるストーン系
            "border-stone-300 bg-stone-100 text-stone-600 hover:bg-stone-200 hover:text-stone-800",
            // ダークモード
            "dark:border-white/10 dark:bg-white/10 dark:text-white/80 dark:hover:bg-white/20 dark:hover:text-white",
          )}
          onClick={onPrev}
          aria-label="前の月"
        >
          <Icon icon={ChevronLeft} size="sm" />
        </Button>
        <span className="min-w-[5.75rem] text-center font-medium">
          {monthLabel}
        </span>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "h-8 w-8 rounded-md border transition",
            // ライトモード
            "border-stone-300 bg-stone-100 text-stone-600 hover:bg-stone-200 hover:text-stone-800",
            // ダークモード
            "dark:border-white/10 dark:bg-white/10 dark:text-white/80 dark:hover:bg-white/20 dark:hover:text-white",
          )}
          onClick={onNext}
          aria-label="次の月"
        >
          <Icon icon={ChevronRight} size="sm" />
        </Button>
        <Button
          variant="ghost"
          className={cn(
            "ml-1 rounded-md border px-2 py-1 text-xs transition",
            // ライトモード
            "border-stone-300 bg-transparent text-stone-600 hover:bg-stone-100 hover:text-stone-800",
            // ダークモード
            "dark:border-white/10 dark:bg-transparent dark:text-white/70 dark:hover:bg-white/10 dark:hover:text-white",
          )}
          onClick={onToday}
        >
          今日
        </Button>
      </div>
    </div>
  );
}
