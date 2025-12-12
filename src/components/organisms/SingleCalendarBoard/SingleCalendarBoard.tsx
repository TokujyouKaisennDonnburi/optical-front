import { useMemo } from "react";

import { Skeleton } from "@/components/atoms/Skeleton";
import { Text } from "@/components/atoms/Text";
import { CalendarGrid } from "@/components/molecules/CalendarGrid";
import { ScheduleEventCard } from "@/components/molecules/ScheduleEventCard";
import { cn } from "@/utils_constants_styles/utils";
import styles from "./SingleCalendarBoard.module.css";

export type SingleCalendarBoardItem = {
  id: string;
  title: string;
  start: string; // ISO datetime string
  end?: string;
  memo?: string;
  location?: string;
  locationUrl?: string;
  members?: string[];
  calendarName?: string;
  calendarColor?: string;
};

export type SingleCalendarBoardProps = {
  /** カレンダー名 */
  calendarName?: string;
  /** カレンダーカラー */
  calendarColor?: string;
  /** スケジュールアイテム */
  items: SingleCalendarBoardItem[];
  /** ローディング状態 */
  isLoading?: boolean;
  /** 空の場合のメッセージ */
  emptyMessage?: string;
  /** エラーメッセージ */
  errorMessage?: string;
  /** クラス名 */
  className?: string;
  /** 表示基準日 */
  baseDate?: Date;
  /** アイテム選択時のコールバック */
  onSelectItem?: (item: SingleCalendarBoardItem) => void;
  /** 新規予定作成時のコールバック (日付セルクリック時) */
  onCreateItem?: (date: Date) => void;
};

type CalendarCell = {
  date: Date;
  key: string;
  isCurrentMonth: boolean;
  isToday: boolean;
  weekday: number; // 0 = Monday, 6 = Sunday
};

type CalendarEvent = {
  id: string;
  title: string;
  memo?: string;
  location?: string;
  locationUrl?: string;
  members?: string[];
  calendarName?: string;
  calendarColor?: string;
  startLabel?: string;
  endLabel?: string;
  date: Date;
  item: SingleCalendarBoardItem;
  sortKey: number;
};

/**
 * 単体カレンダー用のスケジュールボードコンポーネント
 *
 * GeneralScheduleBoard と異なり、単一のカレンダーに特化した表示を行います。
 * カレンダーカラーを統一して表示し、よりシンプルなUIを提供します。
 */
export function SingleCalendarBoard({
  calendarName: _calendarName = "カレンダー",
  calendarColor,
  items,
  isLoading = false,
  emptyMessage = "予定がありません。",
  errorMessage,
  className,
  baseDate,
  onSelectItem,
  onCreateItem,
}: SingleCalendarBoardProps) {
  const effectiveBaseDate = useMemo(() => {
    if (baseDate) {
      return normalizeDate(baseDate);
    }
    return deriveBaseDate(items);
  }, [baseDate, items]);

  const calendarCells = useMemo(
    () => buildCalendarCells(effectiveBaseDate),
    [effectiveBaseDate],
  );
  const calendarWeeks = useMemo(
    () => chunkIntoWeeks(calendarCells),
    [calendarCells],
  );
  const eventsByDay = useMemo(
    () => groupEventsByDay(items, calendarColor),
    [items, calendarColor],
  );

  const showEmptyState = !isLoading && !errorMessage && !items.length;

  return (
    <CalendarGrid className={className}>
      <div className="relative flex min-h-0 flex-1 flex-col pb-2.5">
        {isLoading ? (
          <CalendarSkeleton weeksCount={calendarWeeks.length || 5} />
        ) : (
          <>
            {calendarWeeks.map((week, weekIndex) => (
              <div
                key={`week-${week[0]?.key ?? weekIndex}`}
                className="grid min-h-0 flex-1 grid-cols-7 border-b border-white/5 last:border-b-0"
              >
                {week.map((cell) => {
                  const events = eventsByDay.get(cell.key) ?? [];
                  const isWeekend = cell.weekday >= 5;

                  const handleCellDoubleClick = () => {
                    if (onCreateItem && cell.isCurrentMonth) {
                      onCreateItem(cell.date);
                    }
                  };

                  return (
                    // biome-ignore lint/a11y/noStaticElementInteractions: カレンダーセルはダブルクリックで予定作成が可能
                    <div
                      key={cell.key}
                      role={
                        onCreateItem && cell.isCurrentMonth
                          ? "button"
                          : undefined
                      }
                      tabIndex={
                        onCreateItem && cell.isCurrentMonth ? 0 : undefined
                      }
                      className={cn(
                        "relative flex flex-1 min-h-0 flex-col gap-0.5 overflow-hidden bg-slate-950/40 p-0.5 transition-colors",
                        !cell.isCurrentMonth &&
                          "bg-slate-950/10 text-muted-foreground/70",
                        isWeekend && cell.isCurrentMonth && "bg-slate-950/55",
                        onCreateItem &&
                          cell.isCurrentMonth &&
                          "cursor-pointer hover:bg-slate-800/50",
                      )}
                      onDoubleClick={handleCellDoubleClick}
                    >
                      {cell.isToday ? (
                        <span
                          className="pointer-events-none absolute inset-0 rounded-sm"
                          style={{
                            backgroundColor: calendarColor
                              ? `${calendarColor}20`
                              : "rgba(255,255,255,0.1)",
                          }}
                        />
                      ) : null}
                      <div className="flex items-center justify-between text-[0.625rem]">
                        <span
                          className={cn(
                            "font-medium text-white/90",
                            !cell.isCurrentMonth && "text-muted-foreground/70",
                            cell.isToday && "font-semibold",
                          )}
                          style={{
                            color: cell.isToday ? calendarColor : undefined,
                          }}
                        >
                          {cell.date.getDate()}
                        </span>
                        {events.length ? (
                          <span className="text-[0.625rem] text-white/60">{`${events.length} 件`}</span>
                        ) : null}
                      </div>

                      <div
                        className={cn(
                          "mt-0.5 flex min-h-0 w-full flex-1 flex-col gap-px overflow-y-auto pr-px",
                          styles.eventsScroll,
                        )}
                      >
                        {events.map((event) => {
                          const handleClick = () => {
                            if (onSelectItem) {
                              onSelectItem(event.item);
                            }
                          };

                          return (
                            <button
                              key={event.id}
                              type="button"
                              onClick={handleClick}
                              className="w-full cursor-pointer rounded-sm border border-transparent text-left transition-colors hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70"
                            >
                              <ScheduleEventCard
                                title={event.title}
                                calendarColor={event.calendarColor}
                                variant="compact"
                                className="w-full"
                              />
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
            {errorMessage ? (
              <OverlayMessage message={errorMessage} color={calendarColor} />
            ) : showEmptyState ? (
              <OverlayMessage message={emptyMessage} color={calendarColor} />
            ) : null}
          </>
        )}
      </div>
    </CalendarGrid>
  );
}

function deriveBaseDate(items: SingleCalendarBoardItem[]) {
  const firstValid = items
    .map((item) => parseDate(item.start))
    .find((date) => date !== null);
  return normalizeDate(firstValid ?? new Date());
}

function buildCalendarCells(baseDate: Date): CalendarCell[] {
  const year = baseDate.getFullYear();
  const month = baseDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);

  const firstWeekday = toMondayStartWeekday(firstDayOfMonth.getDay());
  const lastWeekday = toMondayStartWeekday(lastDayOfMonth.getDay());

  const prevMonthDays = firstWeekday;
  const currentMonthDays = lastDayOfMonth.getDate();
  const nextMonthDays = lastWeekday === 6 ? 0 : 6 - lastWeekday;

  const totalCells = prevMonthDays + currentMonthDays + nextMonthDays;

  const firstDate = new Date(firstDayOfMonth);
  firstDate.setDate(firstDate.getDate() - firstWeekday);

  const cells: CalendarCell[] = [];
  for (let index = 0; index < totalCells; index++) {
    const date = new Date(firstDate);
    date.setDate(firstDate.getDate() + index);
    const key = formatDateKey(date);
    const weekday = index % 7;

    cells.push({
      date,
      key,
      weekday,
      isCurrentMonth: date.getMonth() === month,
      isToday: isSameDay(date, new Date()),
    });
  }
  return cells;
}

function groupEventsByDay(
  items: SingleCalendarBoardItem[],
  defaultColor?: string,
) {
  const map = new Map<string, CalendarEvent[]>();

  const sorted = [...items].sort((a, b) => {
    const dateA = parseDate(a.start)?.getTime() ?? 0;
    const dateB = parseDate(b.start)?.getTime() ?? 0;
    return dateA - dateB;
  });

  for (const item of sorted) {
    const startDateTime = parseDate(item.start);
    if (!startDateTime) continue;
    const endDateTimeRaw = item.end ? parseDate(item.end) : null;
    const endDateTime =
      endDateTimeRaw && endDateTimeRaw.getTime() >= startDateTime.getTime()
        ? endDateTimeRaw
        : null;

    const rangeStart = normalizeDate(startDateTime);
    const rangeEnd = normalizeDate(endDateTime ?? startDateTime);

    for (
      let current = new Date(rangeStart);
      current.getTime() <= rangeEnd.getTime();
      current.setDate(current.getDate() + 1)
    ) {
      const currentDate = new Date(current);
      const key = formatDateKey(currentDate);
      const bucket = map.get(key) ?? [];

      const isStartDay = isSameDay(currentDate, startDateTime);
      const isEndDay = endDateTime
        ? isSameDay(currentDate, endDateTime)
        : isStartDay;

      bucket.push({
        id: item.id,
        title: item.title,
        memo: item.memo,
        location: item.location,
        locationUrl: item.locationUrl,
        members: item.members,
        calendarName: item.calendarName,
        // 単体カレンダーでは統一されたカラーを使用
        calendarColor: item.calendarColor ?? defaultColor,
        startLabel: isStartDay ? formatTimeLabel(startDateTime) : undefined,
        endLabel:
          endDateTime && isEndDay ? formatTimeLabel(endDateTime) : undefined,
        date: currentDate,
        item,
        sortKey: startDateTime.getTime(),
      });
      map.set(key, bucket);
    }
  }

  for (const [key, events] of map.entries()) {
    events.sort((a, b) =>
      a.sortKey === b.sortKey
        ? a.id.localeCompare(b.id)
        : a.sortKey - b.sortKey,
    );
    map.set(key, events);
  }

  return map;
}

function chunkIntoWeeks(cells: CalendarCell[]): CalendarCell[][] {
  const weeks: CalendarCell[][] = [];
  for (let index = 0; index < cells.length; index += 7) {
    weeks.push(cells.slice(index, index + 7));
  }
  return weeks;
}

function parseDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function normalizeDate(value: Date) {
  const normalized = new Date(value);
  normalized.setHours(0, 0, 0, 0);
  return normalized;
}

function toMondayStartWeekday(weekday: number) {
  return (weekday + 6) % 7;
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function formatDateKey(date: Date) {
  return [
    date.getFullYear(),
    (date.getMonth() + 1).toString().padStart(2, "0"),
    date.getDate().toString().padStart(2, "0"),
  ].join("-");
}

function formatTimeLabel(date: Date) {
  return new Intl.DateTimeFormat("ja-JP", {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function CalendarSkeleton({ weeksCount = 5 }: { weeksCount?: number }) {
  const skeletonCellKeys = Array.from(
    { length: weeksCount * 7 },
    (_, index) => `skeleton-cell-${index}`,
  );

  return (
    <div
      className="absolute inset-0 grid grid-cols-7"
      style={{ gridTemplateRows: `repeat(${weeksCount}, minmax(0, 1fr))` }}
    >
      {skeletonCellKeys.map((cellKey) => (
        <div
          key={cellKey}
          className="flex min-h-0 flex-col gap-2 border-b border-white/5 bg-slate-950/40 p-2"
        >
          <Skeleton className="h-3.5 w-7" />
          <Skeleton className="h-2.5 w-16" />
          <Skeleton className="h-2.5 w-20" />
        </div>
      ))}
    </div>
  );
}

function OverlayMessage({
  message,
  color,
}: {
  message: string;
  color?: string;
}) {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <Text
        as="span"
        size="sm"
        className="rounded-full px-3 py-1.5 text-xs text-white"
        style={{
          backgroundColor: color ? `${color}30` : "rgba(255,255,255,0.1)",
        }}
      >
        {message}
      </Text>
    </div>
  );
}
