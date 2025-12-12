import { forwardRef } from "react";
import { Text } from "@/components/atoms/Text";
import { cn } from "@/utils_constants_styles/utils";

// 終日判定ロジック(TodayScheduleTimelineで使用)
export function isAllDayEvent(timeRange?: {
  start: string;
  end?: string;
}): boolean {
  if (!timeRange?.start || !timeRange?.end) {
    return false;
  }

  const startStr = timeRange.start;
  const endStr = timeRange.end;

  // 時刻のみの場合の判定
  const startIsMidnight = startStr === "0:00" || startStr === "00:00";
  const endIsLastMinute = endStr === "23:59";

  return startIsMidnight && endIsLastMinute;
}

// ISO文字列での終日判定ロジック
export function isAllDayEventISO(startIso: string, endIso?: string): boolean {
  if (!endIso) {
    return false;
  }

  const start = new Date(startIso);
  const end = new Date(endIso);

  const isStartMidnight =
    start.getHours() === 0 &&
    start.getMinutes() === 0 &&
    start.getSeconds() === 0;
  const isEndLastMinute = end.getHours() === 23 && end.getMinutes() === 59;

  return isStartMidnight && isEndLastMinute;
}

type AllDayVariant = "compact" | "timeline" | "span";

export type AllDayEventCardProps = {
  title: string;
  subtitle?: string;
  calendarColor?: string;
  variant?: AllDayVariant;
  className?: string;
  titleClassName?: string;
  subtitleClassName?: string;
  isStart?: boolean;
  isEnd?: boolean;
  isMiddle?: boolean;
} & React.HTMLAttributes<HTMLDivElement>;

export const AllDayEventCard = forwardRef<HTMLDivElement, AllDayEventCardProps>(
  (
    {
      title,
      subtitle,
      calendarColor,
      variant = "compact",
      className,
      titleClassName,
      subtitleClassName,
      isStart = true,
      isEnd = true,
      isMiddle = false,
      ...props
    },
    ref,
  ) => {
    const isCompact = variant === "compact";
    const isSpan = variant === "span";

    // スパン表示の場合の角丸調整
    const roundedClass = isSpan
      ? cn(
          isStart && isEnd && "rounded-sm",
          isStart && !isEnd && "rounded-l-sm",
          !isStart && isEnd && "rounded-r-sm",
          !isStart && !isEnd && "rounded-none",
        )
      : "rounded-sm";

    /* 左のスペース（透明） */
    const indicatorSpaceClass = isCompact || isSpan ? "h-1 w-1" : "h-2.5 w-2.5";

    return (
      <div
        ref={ref}
        className={cn(
          "flex w-full min-w-0 items-center gap-0.5",
          isCompact &&
            "border border-white/20 px-1 py-[1px] text-[9px] leading-tight shadow-sm",
          isSpan &&
            "border-y border-white/20 px-1 py-[1px] text-[9px] leading-tight shadow-sm",
          variant === "timeline" &&
            "px-2 py-1 text-sm border border-white/20 shadow-sm",
          roundedClass,
          className,
          "transition-colors hover:brightness-110",
        )}
        style={{
          backgroundColor: calendarColor,
          color: "#f5f5f5",
        }}
        {...props}
      >
        {/* 左側に透明スペース */}
        <span className={cn("inline-flex shrink-0", indicatorSpaceClass)} />

        <div className="flex min-w-0 flex-col">
          <Text
            as="span"
            weight={isCompact || isSpan ? "normal" : "medium"}
            className={cn(
              "block truncate",
              isCompact || isSpan
                ? "text-[9px] leading-[1.2] text-white"
                : "text-white",
              titleClassName,
            )}
          >
            {title}
          </Text>

          {subtitle ? (
            <Text
              as="span"
              size="sm"
              className={cn(
                "block truncate text-[8px] leading-tight",
                isCompact || isSpan ? "text-white/70" : "text-white/90",
                subtitleClassName,
              )}
            >
              {subtitle}
            </Text>
          ) : null}
        </div>
      </div>
    );
  },
);

AllDayEventCard.displayName = "AllDayEventCard";
