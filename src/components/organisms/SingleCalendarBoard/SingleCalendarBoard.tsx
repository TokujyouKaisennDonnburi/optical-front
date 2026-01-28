import { useCallback, useMemo, useRef } from "react";
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
import styles from "./SingleCalendarBoard.module.css";

/** 長押し判定時の移動距離閾値（px）。この値以下の移動距離なら長押しとして判定する */
const LONG_PRESS_MOVE_THRESHOLD = 10;

/** 長押し判定までの時間（ms） */
const LONG_PRESS_TIMEOUT_MS = 200;

/** @deprecated Use ScheduleBoardItem instead */
export type SingleCalendarBoardItem = ScheduleBoardItem;

export type SingleCalendarBoardProps = {
  /** カレンダー名 */
  calendarName?: string;
  /** カレンダーカラー */
  calendarColor?: string;
  /** スケジュールアイテム */
  items: ScheduleBoardItem[];
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
  /** アイテム選択時のコールバック。positionにはクリックした位置が含まれる */
  onSelectItem?: (
    item: ScheduleBoardItem,
    position: { x: number; y: number },
  ) => void;
  /** 新規予定作成時のコールバック (日付セルクリック時) */
  onCreateItem?: (date: Date) => void;
  /** 日付選択時のコールバック */
  onDateSelect?: (date: Date) => void;
  /** 選択中の日付 */
  selectedDates?: string[];
};

/**
 * data-cell-key 属性からセルキーを取得するユーティリティ
 */
function getCellKeyFromEvent(
  e: React.MouseEvent | React.TouchEvent | React.KeyboardEvent,
): string | null {
  const target = e.target as HTMLElement;
  const cellElement = target.closest("[data-cell-key]");
  return cellElement?.getAttribute("data-cell-key") ?? null;
}

/**
 * イベントから座標を取得するユーティリティ
 */
function getPositionFromEvent(
  e: React.MouseEvent | React.TouchEvent | React.KeyboardEvent,
): { x: number; y: number } {
  if ("touches" in e && e.touches.length > 0) {
    return { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }
  if ("clientX" in e) {
    return { x: e.clientX, y: e.clientY };
  }
  // キーボードイベントの場合はダミー座標
  return { x: 0, y: 0 };
}

/**
 * 単体カレンダー用のスケジュールボードコンポーネント
 *
 * GeneralCalendarBoard と異なり、単一のカレンダーに特化した表示を行います。
 * カレンダーカラーを統一して表示し、よりシンプルなUIを提供します。
 */
export function SingleCalendarBoard({
  calendarName: _calendarName = "カレンダー",
  calendarColor,
  items,
  isLoading = false,
  emptyMessage = "予定がありません。カレンダーを長押しして追加できます。",
  errorMessage,
  className,
  baseDate,
  onSelectItem,
  onCreateItem,
  onDateSelect,
  selectedDates = [],
}: SingleCalendarBoardProps) {
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

  // キーからセル情報を効率的に取得するためのMap
  const calendarCellMap = useMemo(() => {
    const map = new Map<string, CalendarCell>();
    for (const cell of calendarCells) {
      map.set(cell.key, cell);
    }
    return map;
  }, [calendarCells]);

  const calendarWeeks = useMemo(
    () => chunkIntoWeeks(calendarCells),
    [calendarCells],
  );
  const eventsByDay = useMemo(
    () => groupEventsByDay(items, calendarColor),
    [items, calendarColor],
  );

  // イベント委譲: 長押し開始ハンドラー（親要素で単一のハンドラーを管理）
  const handleLongPressStart = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      // イベントカード（button要素）をクリックした場合は長押し判定をキャンセル
      if (e.target instanceof HTMLElement) {
        if (e.target.closest("button[type='button']")) {
          return;
        }
      }

      const cellKey = getCellKeyFromEvent(e);
      if (!cellKey) return;

      const cell = calendarCellMap.get(cellKey);
      if (!cell) return;

      if (onDateSelect) {
        if (cell.isCurrentMonth) {
          onDateSelect(cell.date);
        }
        return;
      }

      const pos = getPositionFromEvent(e);
      longPressStartPosRef.current.set(cellKey, pos);

      const timeoutId = setTimeout(() => {
        const startPos = longPressStartPosRef.current.get(cellKey);
        if (!startPos) return;

        // 移動距離が閾値以下なら長押し判定
        // 当月以外の日付もクリック可能にする（UX改善）
        if (onCreateItem) {
          onCreateItem(cell.date);
        }
      }, LONG_PRESS_TIMEOUT_MS);

      longPressTimeoutsRef.current.set(cellKey, timeoutId);
    },
    [calendarCellMap, onCreateItem, onDateSelect],
  );

  // イベント委譲: 長押し終了ハンドラー
  const handleLongPressEnd = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      const cellKey = getCellKeyFromEvent(e);
      if (!cellKey) return;

      const timeoutId = longPressTimeoutsRef.current.get(cellKey);
      if (timeoutId) {
        clearTimeout(timeoutId);
        longPressTimeoutsRef.current.delete(cellKey);
      }
      longPressStartPosRef.current.delete(cellKey);
    },
    [],
  );

  // イベント委譲: 長押し中の移動ハンドラー
  const handleLongPressMove = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      const cellKey = getCellKeyFromEvent(e);
      if (!cellKey) return;

      const startPos = longPressStartPosRef.current.get(cellKey);
      if (!startPos) return;

      const currentPos = getPositionFromEvent(e);
      const movedDistance = Math.hypot(
        currentPos.x - startPos.x,
        currentPos.y - startPos.y,
      );

      // 移動距離が閾値を超えたらタイマーをキャンセル（スクロール判定）
      if (movedDistance > LONG_PRESS_MOVE_THRESHOLD) {
        const timeoutId = longPressTimeoutsRef.current.get(cellKey);
        if (timeoutId) {
          clearTimeout(timeoutId);
          longPressTimeoutsRef.current.delete(cellKey);
        }
      }
    },
    [],
  );

  // イベント委譲: キーボードハンドラー
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        const cellKey = getCellKeyFromEvent(e);
        if (!cellKey) return;

        const cell = calendarCellMap.get(cellKey);
        if (!cell) return;

        e.preventDefault();
        if (onDateSelect) {
          if (cell.isCurrentMonth) {
            onDateSelect(cell.date);
          }
          return;
        }

        if (onCreateItem && cell.isCurrentMonth) {
          onCreateItem(cell.date);
        }
      }
    },
    [calendarCellMap, onCreateItem, onDateSelect],
  );

  const showEmptyState = !isLoading && !errorMessage && !items.length;

  return (
    <CalendarGrid className={className}>
      {/* イベント委譲: 親要素で全セルのイベントを管理 */}
      {/* biome-ignore lint/a11y/noStaticElementInteractions: イベント委譲のためのコンテナ。各セル(role="button")がキーボード操作とフォーカスを担当 */}
      <div
        className="relative flex min-h-0 flex-1 flex-col pb-2.5"
        onMouseDown={handleLongPressStart}
        onMouseUp={handleLongPressEnd}
        onMouseLeave={handleLongPressEnd}
        onMouseMove={handleLongPressMove}
        onTouchStart={handleLongPressStart}
        onTouchEnd={handleLongPressEnd}
        onTouchMove={handleLongPressMove}
        onKeyDown={handleKeyDown}
      >
        {isLoading ? (
          <CalendarSkeleton weeksCount={calendarWeeks.length || 5} />
        ) : (
          <>
            {calendarWeeks.map((week, weekIndex) => (
              <div
                key={`week-${week[0]?.key ?? weekIndex}`}
                className="grid min-h-0 flex-1 grid-cols-7 border-b border-stone-200 dark:border-white/5 last:border-b-0"
              >
                {week.map((cell) => {
                  const events = eventsByDay.get(cell.key) ?? [];
                  const isWeekend = cell.weekday === 0 || cell.weekday === 6;
                  const isSelected = selectedDates.includes(cell.key);

                  return (
                    <div
                      key={cell.key}
                      data-cell-key={cell.key}
                      role={
                        (onCreateItem || onDateSelect) && cell.isCurrentMonth
                          ? "button"
                          : undefined
                      }
                      tabIndex={
                        (onCreateItem || onDateSelect) && cell.isCurrentMonth
                          ? 0
                          : undefined
                      }
                      className={cn(
                        "relative flex flex-1 min-h-0 flex-col gap-0.5 overflow-hidden p-0.5 transition-colors",
                        // ライトモード: 温かみのあるストーン系
                        "bg-stone-50 dark:bg-slate-950/40",
                        "border-r border-stone-200 dark:border-white/5 last:border-r-0",
                        !cell.isCurrentMonth &&
                          "bg-stone-100/60 dark:bg-slate-950/10 text-muted-foreground/70",
                        isWeekend &&
                          cell.isCurrentMonth &&
                          "bg-stone-100/80 dark:bg-slate-950/55",
                        // クリック可能な場合のみポインターカーソルを表示
                        (onCreateItem || onDateSelect) &&
                          cell.isCurrentMonth &&
                          "cursor-pointer hover:bg-stone-200/70 dark:hover:bg-slate-900/60",
                        isSelected && "bg-emerald-100/70 dark:bg-emerald-500/15",
                        isSelected &&
                          "hover:bg-emerald-200/80 dark:hover:bg-emerald-500/25",
                      )}
                    >
                      {cell.isToday ? (
                        <span className="pointer-events-none absolute inset-0 rounded-sm bg-amber-200/50 dark:bg-white/10" />
                      ) : null}
                      <div className="flex items-center justify-between text-[0.625rem]">
                        <div className="flex min-w-0 items-baseline gap-1.5 overflow-hidden">
                          <span
                            className={cn(
                              "font-medium text-stone-800 dark:text-white/90",
                              !cell.isCurrentMonth &&
                                "text-stone-400 dark:text-muted-foreground/70",
                              cell.isToday &&
                                "text-amber-700 dark:text-amber-300 font-semibold",
                              cell.holidayName &&
                                !cell.isToday &&
                                (isGamingHoliday
                                  ? "animate-gaming-text font-bold"
                                  : "text-rose-600 dark:text-green-400"),
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
                          <span className="text-[0.625rem] font-medium text-stone-500 dark:text-white/80">{`${events.length} 件`}</span>
                        ) : null}
                      </div>

                      <div
                        className={cn(
                          "relative z-10 mt-0.5 flex min-h-0 w-full flex-1 flex-col gap-px overflow-y-auto pr-px",
                          styles.eventsScroll,
                        )}
                      >
                        {events.map((event) => {
                          const handleClick = (e: React.MouseEvent) => {
                            if (onSelectItem) {
                              onSelectItem(event.item, {
                                x: e.clientX,
                                y: e.clientY,
                              });
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
                              className="w-full cursor-pointer rounded-sm border border-transparent text-left transition-colors hover:bg-stone-200/60 dark:hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70"
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
      holidayName: getHolidayName(date),
    });
  }
  return cells;
}

function groupEventsByDay(items: ScheduleBoardItem[], defaultColor?: string) {
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
          className="flex min-h-0 flex-col gap-2 border-b border-stone-200 dark:border-white/5 bg-stone-50 dark:bg-slate-950/40 p-2"
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
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
      <Text
        as="span"
        size="sm"
        className="rounded-full px-3 py-1.5 text-xs text-stone-600 dark:text-white bg-stone-200/80 dark:bg-white/10"
        style={
          color
            ? {
                backgroundColor: undefined,
                background: `linear-gradient(to right, ${color}20, ${color}30)`,
              }
            : undefined
        }
      >
        {message}
      </Text>
    </div>
  );
}
