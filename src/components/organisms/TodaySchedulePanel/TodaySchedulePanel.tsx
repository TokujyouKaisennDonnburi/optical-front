import { useMemo, useRef, useState } from "react";

import { Card, CardContent, CardHeader } from "@/components/atoms/Card";
import { Skeleton } from "@/components/atoms/Skeleton";
import { Text } from "@/components/atoms/Text";
import { EventSection } from "@/components/molecules/EventSection/EventSection";
import {
  TodayScheduleHeader,
  type TodayScheduleHeaderProps,
} from "@/components/molecules/TodayScheduleHeader";
import type {
  TodayScheduleTimelineEvent,
  TodayScheduleTimelineSlot,
} from "@/components/molecules/TodayScheduleTimeline";
import { TodayScheduleTimeline } from "@/components/molecules/TodayScheduleTimeline";
import { cn } from "@/utils_constants_styles/utils";

export type TodaySchedulePanelItem = {
  id: string;
  title: string;
  timeRange: {
    start: string;
    end?: string;
  };
  startsAt?: string;
  endsAt?: string;
  statusVariant?: TodayScheduleTimelineEvent["statusVariant"];
  location?: string;
  locationUrl?: string;
  memo?: string;
  calendarId?: string;
  calendarColor?: string;
  members?: string[];
  calendarName?: string;
};

export type TodaySchedulePanelProps = {
  header: Pick<
    TodayScheduleHeaderProps,
    "title" | "dateLabel" | "description" | "actions"
  >;
  items: TodaySchedulePanelItem[];
  timeline?: {
    slots?: TodayScheduleTimelineSlot[];
    className?: string;
    contentClassName?: string;
  };
  isLoading?: boolean;
  emptyMessage?: string;
  className?: string;
  contentClassName?: string;
};

/* ===== 終日判定 ===== */
function isAllDay(item: TodaySchedulePanelItem) {
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

export function TodaySchedulePanel({
  header,
  items,
  timeline,
  isLoading = false,
  emptyMessage = "今日の予定はありません。お疲れ様です",
  className,
  contentClassName,
}: TodaySchedulePanelProps) {
  const [isAllDayOpen, setIsAllDayOpen] = useState(true);

  /** 終日 / 通常 振り分け */
  const fullDayItems = useMemo(() => items.filter(isAllDay), [items]);
  const timedItems = useMemo(() => items.filter((i) => !isAllDay(i)), [items]);

  const derivedSlots = useMemo(() => {
    if (timeline?.slots?.length) {
      return markCurrentSlot(timeline.slots);
    }
    return markCurrentSlot(buildSlotsFromItems(timedItems));
  }, [timedItems, timeline?.slots]);

  const timelineWrapRef = useRef<HTMLDivElement>(null);

  return (
    <Card
      className={cn(
        "bg-stone-50 flex h-full w-full min-h-0 flex-col overflow-hidden",
        className,
      )}
    >
      <CardHeader className="border-b border-border px-4 py-3">
        <TodayScheduleHeader
          title={header.title}
          dateLabel={header.dateLabel}
          description={header.description}
          actions={header.actions}
        />
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
                  <TodayScheduleTimeline
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

function buildSlotsFromItems(
  _items: TodaySchedulePanelItem[],
): TodayScheduleTimelineSlot[] {
  return defaultSlots();
}

function defaultSlots(): TodayScheduleTimelineSlot[] {
  const result: TodayScheduleTimelineSlot[] = [];
  for (let minute = 0; minute < 24 * 60; minute += 60) {
    result.push({ time: minutesToTimeLabel(minute) });
  }
  return result;
}

function markCurrentSlot(
  slots: TodayScheduleTimelineSlot[],
): TodayScheduleTimelineSlot[] {
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
