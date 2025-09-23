import { forwardRef } from "react";

import { StatusDot, type StatusDotVariant } from "@/components/atoms/StatusDot";
import { Text } from "@/components/atoms/Text";
import { cn } from "@/utils_constants_styles/utils";

type ScheduleEventCardVariant = "compact" | "timeline";

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
      ...props
    },
    ref,
  ) => {
    const isCompact = variant === "compact";

    return (
      <div
        ref={ref}
        className={cn(
          "flex w-full min-w-0 items-center gap-0.5",
          isCompact
            ? "rounded-sm border border-white/10 bg-white/[0.08] px-1.5 py-0.5 text-[10px] leading-tight text-white shadow-sm"
            : "text-sm text-foreground",
          className,
        )}
        {...props}
      >
        {isCompact ? (
          <span
            className={cn(
              "inline-flex h-1.5 w-1.5 shrink-0 rounded-full",
              indicatorClassName,
            )}
            style={{ backgroundColor: calendarColor ?? "#38bdf8" }}
          />
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
            weight={isCompact ? "normal" : "medium"}
            className={cn(
              "truncate",
              isCompact
                ? "text-[10px] leading-tight text-white"
                : "text-foreground",
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
                "truncate text-xs",
                isCompact ? "text-white/70" : "text-muted-foreground",
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
