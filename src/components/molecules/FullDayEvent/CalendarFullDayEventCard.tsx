import { forwardRef } from "react";
import { Text } from "@/components/atoms/Text";
import { cn } from "@/utils_constants_styles/utils";

/**
 * タイムライン（時間軸）用の終日判定
 *
 * - ISO文字列で「00:00:00 〜 23:59」を満たす場合に
 *   「単日終日イベント」とみなす
 * - 日を跨ぐ（複数日）イベントはここでは考慮しない
 *
 * ※ 日跨ぎイベントについては UI 表現や分割ロジックが変わるため、
 *    別 issue で variant を利用した実装を行う想定
 */
export function isFullDayEventISO(startIso: string, endIso?: string): boolean {
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

/**
 * 終日イベントの表示バリエーション
 *
 * - single:
 *   単日の終日イベント
 *   （開始日・終了日が同一日の場合）
 *
 * - start:
 *   日跨ぎ終日イベントの開始日
 *   （この日からイベントが始まり、翌日以降も続く）
 *
 * - middle:
 *   日跨ぎ終日イベントの中間日
 *   （前日から継続しており、翌日にも続く）
 *
 * - end:
 *   日跨ぎ終日イベントの終了日
 *   （前日から継続し、この日で終了）
 */
export type CalendarFullDayVariant = "single" | "start" | "middle" | "end";

export type CalendarFullDayEventCardProps = {
  title: string;
  subtitle?: string;
  calendarColor?: string;
  variant?: CalendarFullDayVariant;
  className?: string;
  titleClassName?: string;
  subtitleClassName?: string;
} & React.HTMLAttributes<HTMLDivElement>;

export const CalendarFullDayEventCard = forwardRef<
  HTMLDivElement,
  CalendarFullDayEventCardProps
>(
  (
    {
      title,
      subtitle,
      calendarColor,
      variant = "single",
      className,
      titleClassName,
      subtitleClassName,
      ...props
    },
    ref,
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex w-full min-w-0 items-center gap-0.5 rounded-sm border px-1 py-[1px] text-[9px] leading-tight shadow-sm transition-colors hover:brightness-110",
          "border-stone-400 dark:border-white/20",
          className,
        )}
        style={{ backgroundColor: calendarColor }}
        data-variant={variant}
        {...props}
      >
        <span className="inline-flex h-1 w-1 shrink-0" />

        <div className="flex min-w-0 flex-col">
          <Text
            as="span"
            className={cn(
              "block truncate text-[10px] font-bold leading-[1.2]",
              "text-stone-800 dark:text-white",
              titleClassName,
            )}
          >
            {title}
          </Text>

          {subtitle && (
            <Text
              as="span"
              className={cn(
                "block truncate text-[9px] font-medium leading-tight",
                "text-stone-600 dark:text-white/90",
                subtitleClassName,
              )}
            >
              {subtitle}
            </Text>
          )}
        </div>
      </div>
    );
  },
);

CalendarFullDayEventCard.displayName = "CalendarFullDayEventCard";
