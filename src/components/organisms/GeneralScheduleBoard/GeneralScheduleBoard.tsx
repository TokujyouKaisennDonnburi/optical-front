import { useMemo } from "react";

import { Skeleton } from "@/components/atoms/Skeleton";
import { Text } from "@/components/atoms/Text";
import { CalendarGrid } from "@/components/molecules/CalendarGrid";
import { ScheduleEventCard } from "@/components/molecules/ScheduleEventCard";
import { cn } from "@/utils_constants_styles/utils";
import styles from "./GeneralScheduleBoard.module.css";

export type GeneralScheduleBoardItem = {
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

export type GeneralScheduleBoardProps = {
  title?: string;
  items: GeneralScheduleBoardItem[];
  isLoading?: boolean;
  emptyMessage?: string;
  errorMessage?: string;
  className?: string;
  baseDate?: Date;
  onSelectItem?: (item: GeneralScheduleBoardItem) => void;
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
  startLabel: string;
  endLabel?: string;
  date: Date;
  item: GeneralScheduleBoardItem;
};

export function GeneralScheduleBoard({
  title: _title = "総合スケジュール",
  items,
  isLoading = false,
  emptyMessage = "予定がありません。",
  errorMessage,
  className,
  baseDate,
  onSelectItem,
}: GeneralScheduleBoardProps) {
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
          <CalendarSkeleton />
        ) : (
          <>
            {calendarWeeks.map((week, weekIndex) => (
              <div
                key={`week-${week[0]?.key ?? weekIndex}`}
                className="grid min-h-0 flex-1 grid-cols-7 border-b border-white/5 last:border-b-0"
              >
                {week.map((cell, dayIndex) => {
                  const events = eventsByDay.get(cell.key) ?? [];
                  const isWeekend = cell.weekday >= 5;

                  return (
                    <div
                      key={cell.key}
                      className={cn(
                        "relative flex flex-1 min-h-0 flex-col gap-0.5 overflow-hidden border-r border-white/5 bg-slate-950/40 p-0.5 transition-colors",
                        !cell.isCurrentMonth &&
                          "bg-slate-950/10 text-muted-foreground/70",
                        isWeekend && cell.isCurrentMonth && "bg-slate-950/55",
                        dayIndex === week.length - 1 && "border-r-0",
                      )}
                    >
                      {cell.isToday ? (
                        <span className="pointer-events-none absolute inset-0 rounded-sm bg-white/10" />
                      ) : null}
                      <div className="flex items-center justify-between text-[10px]">
                        <span
                          className={cn(
                            "font-medium text-white/90",
                            !cell.isCurrentMonth && "text-muted-foreground/70",
                            cell.isToday && "text-amber-300 font-semibold",
                          )}
                        >
                          {cell.isToday ? (
                            <span>{cell.date.getDate()}</span>
                          ) : (
                            cell.date.getDate()
                          )}
                        </span>
                        {events.length ? (
                          <span className="text-[10px] text-white/60">{`${events.length} 件`}</span>
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
                            <ScheduleEventCard
                              key={event.id}
                              title={event.title}
                              calendarColor={event.calendarColor}
                              variant="compact"
                              role="button"
                              tabIndex={0}
                              onClick={handleClick}
                              onKeyDown={(keyboardEvent) => {
                                if (
                                  keyboardEvent.key === "Enter" ||
                                  keyboardEvent.key === " "
                                ) {
                                  keyboardEvent.preventDefault();
                                  handleClick();
                                }
                              }}
                              className="cursor-pointer transition-colors hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70"
                            />
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

function deriveBaseDate(items: GeneralScheduleBoardItem[]) {
  const firstValid = items
    .map((item) => parseDate(item.start))
    .find((date) => date !== null);
  return normalizeDate(firstValid ?? new Date());
}

function buildCalendarCells(baseDate: Date): CalendarCell[] {
  const year = baseDate.getFullYear();
  const month = baseDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const firstWeekday = toMondayStartWeekday(firstDayOfMonth.getDay());
  const firstDate = new Date(firstDayOfMonth);
  firstDate.setDate(firstDate.getDate() - firstWeekday);

  const cells: CalendarCell[] = [];
  for (let index = 0; index < 42; index++) {
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

function groupEventsByDay(items: GeneralScheduleBoardItem[]) {
  const map = new Map<string, CalendarEvent[]>();

  const sorted = [...items].sort((a, b) => {
    const dateA = parseDate(a.start)?.getTime() ?? 0;
    const dateB = parseDate(b.start)?.getTime() ?? 0;
    return dateA - dateB;
  });

  for (const item of sorted) {
    const date = parseDate(item.start);
    if (!date) continue;
    const key = formatDateKey(date);
    const bucket = map.get(key) ?? [];
    const endDate = item.end ? parseDate(item.end) : null;
    bucket.push({
      id: item.id,
      title: item.title,
      memo: item.memo,
      location: item.location,
      locationUrl: item.locationUrl,
      members: item.members,
      calendarName: item.calendarName,
      calendarColor: item.calendarColor,
      startLabel: formatTimeLabel(date),
      endLabel: endDate ? formatTimeLabel(endDate) : undefined,
      date,
      item,
    });
    map.set(key, bucket);
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

function CalendarSkeleton() {
  return (
    <div className="absolute inset-0 grid grid-cols-7 grid-rows-6">
      {Array.from({ length: 42 }).map((_, index) => (
        <div
          // eslint-disable-next-line react/no-array-index-key
          key={index}
          className="flex min-h-0 flex-col gap-2 border-r border-b border-white/5 bg-slate-950/40 p-2"
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
    <div className="absolute inset-0 flex items-center justify-center">
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
