import { forwardRef } from "react";
import { Text } from "@/components/atoms/Text";
import { cn, getContrastTextColor } from "@/utils_constants_styles/utils";

/**
 * カレンダー（月・週）グリッド用の終日判定
 *
 * - timeRange が「00:00 〜 23:59」の場合に
 *   「単日終日イベント」とみなす
 * - 日を跨ぐ（複数日）イベントはここでは考慮しない
 *
 * ※ 日跨ぎイベントについては、
 *    variant を利用した UI 表現・分割ロジックを
 *    別 issue で実装する想定
 */
export function isFullDayEvent(timeRange?: {
  start: string;
  end?: string;
}): boolean {
  if (!timeRange?.start || !timeRange?.end) {
    return false;
  }

  const startIsMidnight =
    timeRange.start === "0:00" || timeRange.start === "00:00";
  const endIsLastMinute = timeRange.end === "23:59";

  return startIsMidnight && endIsLastMinute;
}

/**
 * タイムライン用 終日イベントの表示バリエーション
 *
 * - single:
 *   単日の終日イベント
 *
 * - start:
 *   日跨ぎ終日イベントの開始日
 *
 * - middle:
 *   日跨ぎ終日イベントの中間日
 *
 * - end:
 *   日跨ぎ終日イベントの終了日
 *
 * ※ 現時点では "single" のみ使用しており、
 *    start / middle / end は将来対応用
 */
export type TimelineFullDayVariant = "single" | "start" | "middle" | "end";

export type TimelineFullDayEventCardProps = {
  title: string;
  subtitle?: string;
  calendarColor?: string;
  variant?: TimelineFullDayVariant;
  className?: string;
  titleClassName?: string;
  subtitleClassName?: string;
} & React.HTMLAttributes<HTMLDivElement>;

export const TimelineFullDayEventCard = forwardRef<
  HTMLDivElement,
  TimelineFullDayEventCardProps
>(
  (
    {
      title,
      subtitle = "終日",
      calendarColor,
      variant = "single",
      className,
      titleClassName,
      subtitleClassName,
      ...props
    },
    ref,
  ) => {
    const textColor = getContrastTextColor(calendarColor);

    return (
      <div
        ref={ref}
        className={cn(
          "flex w-full min-w-0 items-center gap-2 rounded-sm border border-white/20 px-2 py-1 text-sm shadow-sm transition-colors hover:brightness-110",
          className,
        )}
        style={{ backgroundColor: calendarColor, color: textColor }}
        data-variant={variant}
        {...props}
      >
        <span className="inline-flex h-2.5 w-2.5 shrink-0" />

        <div className="flex min-w-0 flex-col flex-1">
          <div className="min-w-0 overflow-hidden">
            <Text
              as="span"
              weight="medium"
              className={cn("block truncate leading-normal", titleClassName)}
              style={{ color: textColor }}
            >
              {title}
            </Text>
          </div>

          {subtitle && (
            <div className="min-w-0 overflow-hidden">
              <Text
                as="span"
                size="sm"
                className={cn(
                  "block truncate text-[0.5rem] leading-tight opacity-90",
                  subtitleClassName,
                )}
                style={{ color: textColor }}
              >
                {subtitle}
              </Text>
            </div>
          )}
        </div>
      </div>
    );
  },
);

TimelineFullDayEventCard.displayName = "TimelineFullDayEventCard";
