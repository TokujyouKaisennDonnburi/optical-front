import { useMemo, useRef } from "react";
import { HolidayLabel } from "@/components/atoms/HolidayLabel/HolidayLabel";
import { Skeleton } from "@/components/atoms/Skeleton";
import { Text } from "@/components/atoms/Text";
import { CalendarGrid } from "@/components/molecules/CalendarGrid";
import {
  CalendarFullDayEventCard,
  isFullDayEventISO,
} from "@/components/molecules/FullDayEvent";
import { ScheduleEventCard } from "@/components/molecules/ScheduleEventCard";
import { useSettings } from "@/providers/SettingsProvider";
import type {
  CalendarCell,
  CalendarEvent,
  ScheduleBoardItem,
} from "@/types/schedule";
import { getHolidayName } from "@/utils/holidays";
import { cn } from "@/utils_constants_styles/utils";
import styles from "./GeneralScheduleBoard.module.css";

/** @deprecated Use ScheduleBoardItem instead */
export type GeneralScheduleBoardItem = ScheduleBoardItem;

export type GeneralScheduleBoardProps = {
  title?: string;
  items: ScheduleBoardItem[];
  isLoading?: boolean;
  emptyMessage?: string;
  errorMessage?: string;
  className?: string;
  baseDate?: Date;
  onSelectItem?: (item: ScheduleBoardItem) => void;
  onCreateItem?: (date: Date) => void;
};

export function GeneralScheduleBoard({
  title: _title = "総合スケジュール",
  items,
  isLoading = false,
  emptyMessage = "予定がありません。カレンダーを長押しして追加できます。",
  errorMessage,
  className,
  baseDate,
  onSelectItem,
  onCreateItem,
}: GeneralScheduleBoardProps) {
  // 長押し判定用の参照
  const longPressTimeoutsRef = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const longPressStartPosRef = useRef<Map<string, { x: number; y: number }>>(
    new Map(),
  );

  const { isGamingHoliday } = useSettings();

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
  const eventsByDay = useMemo(() => groupEventsByDay(items), [items]);

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
                {week.map((cell, _dayIndex) => {
                  const events = eventsByDay.get(cell.key) ?? [];
                  const isWeekend = cell.weekday === 0 || cell.weekday === 6;

                  const handleLongPressStart = (
                    e:
                      | React.MouseEvent<HTMLDivElement>
                      | React.TouchEvent<HTMLDivElement>,
                  ) => {
                    // イベントカード（button要素）をクリックした場合は長押し判定をキャンセル
                    if (e.target instanceof HTMLElement) {
                      if (e.target.closest("button[type='button']")) {
                        return;
                      }
                    }

                    const pos =
                      "touches" in e
                        ? { x: e.touches[0].clientX, y: e.touches[0].clientY }
                        : {
                            x: (e as React.MouseEvent).clientX,
                            y: (e as React.MouseEvent).clientY,
                          };

                    longPressStartPosRef.current.set(cell.key, pos);

                    const timeoutId = setTimeout(() => {
                      const startPos = longPressStartPosRef.current.get(
                        cell.key,
                      );
                      if (!startPos) return;

                      // 移動距離チェック
                      const currentPos =
                        "touches" in e
                          ? {
                              x: e.touches[0]?.clientX ?? 0,
                              y: e.touches[0]?.clientY ?? 0,
                            }
                          : {
                              x: (e as React.MouseEvent).clientX,
                              y: (e as React.MouseEvent).clientY,
                            };

                      const movedDistance = Math.hypot(
                        currentPos.x - startPos.x,
                        currentPos.y - startPos.y,
                      );

                      // 移動距離が10px以下なら長押し判定
                      if (
                        movedDistance <= 10 &&
                        onCreateItem &&
                        cell.isCurrentMonth
                      ) {
                        onCreateItem(cell.date);
                      }
                    }, 200);

                    longPressTimeoutsRef.current.set(cell.key, timeoutId);
                  };

                  const handleLongPressEnd = () => {
                    const timeoutId = longPressTimeoutsRef.current.get(
                      cell.key,
                    );
                    if (timeoutId) {
                      clearTimeout(timeoutId);
                      longPressTimeoutsRef.current.delete(cell.key);
                    }
                    longPressStartPosRef.current.delete(cell.key);
                  };

                  const handleLongPressMove = (
                    e:
                      | React.MouseEvent<HTMLDivElement>
                      | React.TouchEvent<HTMLDivElement>,
                  ) => {
                    const startPos = longPressStartPosRef.current.get(cell.key);
                    if (!startPos) return;

                    const currentPos =
                      "touches" in e
                        ? { x: e.touches[0].clientX, y: e.touches[0].clientY }
                        : {
                            x: (e as React.MouseEvent).clientX,
                            y: (e as React.MouseEvent).clientY,
                          };

                    const movedDistance = Math.hypot(
                      currentPos.x - startPos.x,
                      currentPos.y - startPos.y,
                    );

                    // 移動距離が10pxを超えたらタイマーをキャンセル（スクロール判定）
                    if (movedDistance > 10) {
                      const timeoutId = longPressTimeoutsRef.current.get(
                        cell.key,
                      );
                      if (timeoutId) {
                        clearTimeout(timeoutId);
                        longPressTimeoutsRef.current.delete(cell.key);
                      }
                    }
                  };

                  return (
                    <div
                      key={cell.key}
                      role="button"
                      tabIndex={0}
                      onMouseDown={handleLongPressStart}
                      onMouseUp={handleLongPressEnd}
                      onMouseLeave={handleLongPressEnd}
                      onMouseMove={handleLongPressMove}
                      onTouchStart={handleLongPressStart}
                      onTouchEnd={handleLongPressEnd}
                      onTouchMove={handleLongPressMove}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          handleLongPressStart(
                            e as unknown as React.MouseEvent<HTMLDivElement>,
                          );
                        }
                      }}
                      className={cn(
                        "relative flex flex-1 min-h-0 flex-col gap-0.5 overflow-hidden bg-slate-950/40 p-0.5 transition-colors cursor-pointer",
                        !cell.isCurrentMonth &&
                          "bg-slate-950/10 text-muted-foreground/70",
                        isWeekend && cell.isCurrentMonth && "bg-slate-950/55",
                      )}
                    >
                      {cell.isToday ? (
                        <span className="pointer-events-none absolute inset-0 rounded-sm bg-white/10" />
                      ) : null}
                      <div className="flex items-center justify-between text-[0.625rem]">
                        <div className="flex min-w-0 items-baseline gap-1.5 overflow-hidden">
                          <span
                            className={cn(
                              "font-medium text-white/90",
                              !cell.isCurrentMonth &&
                                "text-muted-foreground/70",
                              cell.isToday && "text-amber-300 font-semibold",
                              cell.holidayName &&
                                !cell.isToday &&
                                (isGamingHoliday
                                  ? "animate-gaming-text font-bold"
                                  : "text-green-400"),
                            )}
                          >
                            {cell.isToday ? (
                              <span>{cell.date.getDate()}</span>
                            ) : (
                              cell.date.getDate()
                            )}
                          </span>
                          {cell.holidayName && (
                            <HolidayLabel
                              name={cell.holidayName}
                              className="truncate"
                              isGaming={isGamingHoliday}
                            />
                          )}
                        </div>
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

                          // 終日イベントかどうか判定
                          const isAllDay = isFullDayEventISO(
                            event.item.start,
                            event.item.end,
                          );

                          return (
                            <button
                              key={event.id}
                              type="button"
                              onClick={handleClick}
                              className="w-full cursor-pointer rounded-sm border border-transparent text-left transition-colors hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70"
                            >
                              {isAllDay ? (
                                <CalendarFullDayEventCard
                                  title={event.title}
                                  calendarColor={event.calendarColor}
                                  className="w-full"
                                />
                              ) : (
                                <ScheduleEventCard
                                  title={event.title}
                                  calendarColor={event.calendarColor}
                                  variant="compact"
                                  className="w-full"
                                />
                              )}
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
              <OverlayMessage message={errorMessage} />
            ) : showEmptyState ? (
              <OverlayMessage message={emptyMessage} />
            ) : null}
          </>
        )}
      </div>
    </CalendarGrid>
  );
}

function deriveBaseDate(items: ScheduleBoardItem[]) {
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

  const firstWeekday = firstDayOfMonth.getDay();
  const lastWeekday = lastDayOfMonth.getDay();

  // 前月分のセル数
  const prevMonthDays = firstWeekday;
  // 当月の日数
  const currentMonthDays = lastDayOfMonth.getDate();
  // 次月分のセル数（最終週を埋めるため）
  const nextMonthDays = lastWeekday === 6 ? 0 : 6 - lastWeekday;

  // 必要な総セル数
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
      holidayName: getHolidayName(date),
    });
  }
  return cells;
}

function groupEventsByDay(items: ScheduleBoardItem[]) {
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
        calendarColor: item.calendarColor,
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

// Removed: toMondayStartWeekday (now using Sunday-start weekdays directly from getDay())

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

function OverlayMessage({ message }: { message: string }) {
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
      <Text
        as="span"
        size="sm"
        className="rounded-full bg-white/10 px-3 py-1.5 text-xs text-white"
      >
        {message}
      </Text>
    </div>
  );
}
