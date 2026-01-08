import { forwardRef } from "react";

import { StatusDot, type StatusDotVariant } from "@/components/atoms/StatusDot";
import { Text } from "@/components/atoms/Text";
import { cn } from "@/utils_constants_styles/utils";

type ScheduleEventCardVariant = "compact" | "timeline" | "span";

export type ScheduleEventCardProps = {
  title: string;
  subtitle?: string;
  calendarColor?: string;
  statusVariant?: StatusDotVariant;
  variant?: ScheduleEventCardVariant;
  className?: string;
  indicatorClassName?: string;
  titleClassName?: string;
  subtitleClassName?: string;
  isStart?: boolean;
  isEnd?: boolean;
  isMiddle?: boolean;
} & React.HTMLAttributes<HTMLDivElement>;

export const ScheduleEventCard = forwardRef<
  HTMLDivElement,
  ScheduleEventCardProps
>(
  (
    {
      title,
      subtitle,
      calendarColor,
      statusVariant,
      variant = "compact",
      className,
      indicatorClassName,
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

    return (
      <div
        ref={ref}
        className={cn(
          "flex w-full min-w-0 items-center gap-0.5",
          isCompact &&
            "border border-stone-300 dark:border-white/10 bg-stone-200/80 dark:bg-white/[0.08] px-1 py-px text-[0.5625rem] leading-tight text-stone-800 dark:text-white shadow-sm",
          isSpan &&
            "border-y border-stone-300 dark:border-white/10 bg-stone-200/80 dark:bg-white/[0.08] px-1 py-px text-[0.5625rem] leading-tight text-stone-800 dark:text-white shadow-sm",
          !isCompact && !isSpan && "text-sm text-foreground",
          roundedClass,
          className,
        )}
        {...props}
      >
        {isCompact || isSpan ? (
          (isStart || !isSpan) && (
            <span
              className={cn(
                "inline-flex h-1 w-1 shrink-0 rounded-full",
                indicatorClassName,
              )}
              style={{ backgroundColor: calendarColor ?? "#38bdf8" }}
            />
          )
        ) : (
          <StatusDot
            variant={calendarColor ? "default" : statusVariant}
            style={
              calendarColor ? { backgroundColor: calendarColor } : undefined
            }
            className={cn("h-2.5 w-2.5 shrink-0", indicatorClassName)}
          />
        )}

        <div className="flex min-w-0 flex-col">
          <Text
            as="span"
            weight={isCompact || isSpan ? "bold" : "medium"}
            className={cn(
              "block truncate",
              isCompact || isSpan
                ? "text-[10px] leading-[1.2] text-stone-800 dark:text-white"
                : "text-foreground",
              titleClassName,
            )}
          >
            {title}
          </Text>
          {subtitle ? (
            <Text
              as="span"
              className={cn(
                "block truncate text-[9px] leading-tight",
                isCompact || isSpan
                  ? "font-medium text-stone-600 dark:text-white/90"
                  : "text-muted-foreground",
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

ScheduleEventCard.displayName = "ScheduleEventCard";
