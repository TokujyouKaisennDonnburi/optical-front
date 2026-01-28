import { useMemo, useRef, useState } from "react";

import { Card, CardContent, CardHeader } from "@/components/atoms/Card";
import { Skeleton } from "@/components/atoms/Skeleton";
import { Text } from "@/components/atoms/Text";
import {
  DailyHeader,
  type DailyHeaderProps,
} from "@/components/molecules/DailyHeader";
import type {
  DailyTimelineEvent,
  DailyTimelineSlot,
} from "@/components/molecules/DailyTimeline";
import { DailyTimeline } from "@/components/molecules/DailyTimeline";
import { EventSection } from "@/components/molecules/EventSection/EventSection";
import { useSettings } from "@/providers/SettingsProvider";
import { cn } from "@/utils_constants_styles/utils";

export type DailyPanelItem = {
  id: string;
  title: string;
  timeRange: {
    start: string;
    end?: string;
  };
  startsAt?: string;
  endsAt?: string;
  statusVariant?: DailyTimelineEvent["statusVariant"];
  location?: string;
  locationUrl?: string;
  memo?: string;
  calendarId?: string;
  calendarColor?: string;
  members?: string[];
  calendarName?: string;
};

export type DailyPanelProps = {
  header: Pick<
    DailyHeaderProps,
    "title" | "dateLabel" | "description" | "actions"
  >;
  items: DailyPanelItem[];
  timeline?: {
    slots?: DailyTimelineSlot[];
    className?: string;
    contentClassName?: string;
  };
  isLoading?: boolean;
  emptyMessage?: string;
  className?: string;
  contentClassName?: string;
};

/* ===== 終日判定 ===== */
function isAllDay(item: DailyPanelItem) {
  if (!item.startsAt || !item.endsAt) return false;

  const start = new Date(item.startsAt);
  const end = new Date(item.endsAt);

  const isStartMidnight = start.getHours() === 0 && start.getMinutes() === 0;

  const isEndEndOfDay =
    (end.getHours() === 23 && end.getMinutes() === 59) ||
    (end.getHours() === 23 &&
      end.getMinutes() === 59 &&
      end.getSeconds() === 59);

  const sameDay =
    start.getFullYear() === end.getFullYear() &&
    start.getMonth() === end.getMonth() &&
    start.getDate() === end.getDate();

  return isStartMidnight && isEndEndOfDay && sameDay;
}

export function DailyPanel({
  header,
  items,
  timeline,
  isLoading = false,
  emptyMessage = "今日の予定はありません。お疲れ様です",
  className,
  contentClassName,
}: DailyPanelProps) {
  // ===== DATE SELECTION LOGIC =====
  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  });

  const weekDates = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      dates.push(d);
    }
    return dates;
  }, []);

  const handleSelectDate = (date: Date) => {
    const newDate = new Date(date);
    newDate.setHours(0, 0, 0, 0);
    setSelectedDate(newDate);
  };

  // Filter items for selectedDate
  const dayItems = useMemo(() => {
    const targetStart = new Date(selectedDate);
    targetStart.setHours(0, 0, 0, 0);
    const targetEnd = new Date(targetStart);
    targetEnd.setDate(targetEnd.getDate() + 1);

    return items.filter((item) => {
      const startsAt = item.startsAt ? new Date(item.startsAt) : null;
      const endsAt = item.endsAt ? new Date(item.endsAt) : null;

      // Invalid dates
      if (!startsAt || Number.isNaN(startsAt.getTime())) return false;

      // If no valid end, assume point event
      const hasValidEnd = endsAt && !Number.isNaN(endsAt.getTime());
      const rangeStart = startsAt;
      const rangeEnd = hasValidEnd ? endsAt : startsAt;

      // Check overlap
      return rangeStart < targetEnd && rangeEnd >= targetStart;
    });
  }, [items, selectedDate]);

  const [isAllDayOpen, setIsAllDayOpen] = useState(true);

  /** 終日 / 通常 振り分け */
  const fullDayItems = useMemo(() => dayItems.filter(isAllDay), [dayItems]);
  const timedItems = useMemo(
    () => dayItems.filter((i) => !isAllDay(i)),
    [dayItems],
  );

  const derivedSlots = useMemo(() => {
    if (timeline?.slots?.length) {
      return markCurrentSlot(timeline.slots);
    }
    return markCurrentSlot(buildSlotsFromItems(timedItems));
  }, [timedItems, timeline?.slots]);

  const timelineWrapRef = useRef<HTMLDivElement>(null);

  // Dynamic Header Props
  const displayDateLabel = new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
  }).format(selectedDate);

  const { weekdayLanguage } = useSettings();

  return (
    <Card
      className={cn(
        "bg-stone-50 flex h-full w-full min-h-0 flex-col overflow-hidden",
        className,
      )}
    >
      <CardHeader className="border-b border-border px-4 py-2 space-y-2">
        <DailyHeader
          title={header.title}
          dateLabel={displayDateLabel}
          description={header.description}
          actions={header.actions}
        />

        {/* WEEK STRIP */}
        <div className="flex items-center justify-between gap-0.5 overflow-x-auto no-scrollbar">
          {weekDates.map((date) => {
            const isSelected = date.getTime() === selectedDate.getTime();
            const isToday = date.toDateString() === new Date().toDateString();

            const locale = weekdayLanguage === "ja" ? "ja-JP" : "en-US";
            const dayName = new Intl.DateTimeFormat(locale, {
              weekday: "short",
            }).format(date);
            const dayNum = date.getDate();

            return (
              <button
                type="button"
                key={date.toISOString()}
                onClick={() => handleSelectDate(date)}
                className={cn(
                  "flex flex-col items-center justify-center min-w-[2rem] py-0.5 rounded-md transition-colors text-[10px]",
                  isSelected
                    ? "bg-primary text-primary-foreground font-semibold"
                    : "hover:bg-muted text-muted-foreground",
                  isToday && !isSelected && "text-foreground font-medium",
                )}
              >
                <span className="text-[9px] uppercase leading-none opacity-80">
                  {dayName}
                </span>
                <span className="text-sm leading-none mt-0.5">{dayNum}</span>
                {/* Dot for today? */}
                {isToday && (
                  <span
                    className={cn(
                      "mt-0.5 w-0.5 h-0.5 rounded-full",
                      isSelected ? "bg-primary-foreground" : "bg-primary",
                    )}
                  />
                )}
              </button>
            );
          })}
        </div>
      </CardHeader>
      <CardContent
        className={cn(
          "flex flex-1 flex-col overflow-hidden px-0 py-0",
          contentClassName,
        )}
      >
        <div className="relative flex flex-1 min-h-0">
          <div className="flex flex-1 flex-col w-full h-full px-4 py-3">
            {isLoading ? (
              <Skeleton className="h-full min-h-0 w-full" />
            ) : (
              <>
                {/* 終日イベント */}
                <EventSection
                  items={fullDayItems.map((item) => ({
                    id: item.id,
                    title: item.title,
                    calendarColor: item.calendarColor,
                    location: item.location,
                    memo: item.memo,
                  }))}
                  title="終日予定"
                  isOpen={isAllDayOpen}
                  onToggle={() => setIsAllDayOpen((v) => !v)}
                  maxHeight={100}
                />

                {/* ===== タイムライン ===== */}
                <div
                  ref={timelineWrapRef}
                  className="relative flex flex-1 min-h-0"
                >
                  <DailyTimeline
                    slots={derivedSlots}
                    items={timedItems}
                    className={cn("flex-1", timeline?.className)}
                    contentClassName={timeline?.contentClassName}
                  />

                  {!items.length && (
                    <div className="absolute inset-0 flex items-center justify-center bg-background/80">
                      <Text
                        as="span"
                        size="sm"
                        className="text-muted-foreground"
                      >
                        {emptyMessage}
                      </Text>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function buildSlotsFromItems(_items: DailyPanelItem[]): DailyTimelineSlot[] {
  return defaultSlots();
}

function defaultSlots(): DailyTimelineSlot[] {
  const result: DailyTimelineSlot[] = [];
  for (let minute = 0; minute < 24 * 60; minute += 60) {
    result.push({ time: minutesToTimeLabel(minute) });
  }
  return result;
}

function markCurrentSlot(slots: DailyTimelineSlot[]): DailyTimelineSlot[] {
  const now = new Date();
  const currentMinutes = now.getHours() * 60;
  return slots.map((slot) => ({
    ...slot,
    isCurrent: timeLabelToMinutes(slot.time) === currentMinutes,
  }));
}

function minutesToTimeLabel(totalMinutes: number) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}:${minutes.toString().padStart(2, "0")}`;
}

function timeLabelToMinutes(label?: string) {
  if (!label) return undefined;
  const parts = label.split(":");
  if (parts.length < 2) return undefined;
  const hours = Number.parseInt(parts[0] ?? "0", 10);
  const minutes = Number.parseInt(parts[1] ?? "0", 10);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) {
    return undefined;
  }
  return hours * 60 + minutes;
}
