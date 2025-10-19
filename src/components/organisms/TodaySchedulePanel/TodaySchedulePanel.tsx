import { useMemo } from "react";

import { Card, CardContent, CardHeader } from "@/components/atoms/Card";
import { Skeleton } from "@/components/atoms/Skeleton";
import { Text } from "@/components/atoms/Text";
import {
  TodayScheduleHeader,
  TodayScheduleHeaderProps,
} from "@/components/molecules/TodayScheduleHeader";
import {
  TodayScheduleTimeline,
  TodayScheduleTimelineSlot,
  TodayScheduleTimelineEvent,
} from "@/components/molecules/TodayScheduleTimeline";
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

export function TodaySchedulePanel({
  header,
  items,
  timeline,
  isLoading = false,
  emptyMessage = "今日の予定はありません。",
  className,
  contentClassName,
}: TodaySchedulePanelProps) {
  const derivedSlots = useMemo(() => {
    if (timeline?.slots?.length) {
      return markCurrentSlot(timeline.slots);
    }
    return markCurrentSlot(buildSlotsFromItems(items));
  }, [items, timeline?.slots]);

  return (
    <Card className={cn("flex h-full w-full min-h-0 flex-col", className)}>
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
          "flex flex-1 flex-col overflow-hidden px-4 py-3",
          contentClassName,
        )}
      >
        <div className="relative flex flex-1 min-h-0">
          {isLoading ? (
            <Skeleton className="h-full min-h-0 w-full" />
          ) : (
            <>
              <TodayScheduleTimeline
                slots={derivedSlots}
                className={cn("flex-1", timeline?.className)}
                contentClassName={timeline?.contentClassName}
              />
              {!items.length ? (
                <div className="absolute inset-0 flex items-center justify-center bg-background/80">
                  <Text as="span" size="sm" className="text-muted-foreground">
                    {emptyMessage}
                  </Text>
                </div>
              ) : null}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function buildSlotsFromItems(
  items: TodaySchedulePanelItem[],
): TodayScheduleTimelineSlot[] {
  if (!items.length) {
    return defaultSlots();
  }

  let minStart = Number.POSITIVE_INFINITY;
  let maxEnd = Number.NEGATIVE_INFINITY;
  const slots = new Map<number, TodayScheduleTimelineSlot>();

  for (const item of items) {
    const startMinutes = timeLabelToMinutes(item.timeRange.start);
    if (startMinutes === undefined) {
      continue;
    }
    minStart = Math.min(minStart, startMinutes);

    const endMinutes = timeLabelToMinutes(
      item.timeRange.end ?? item.timeRange.start,
    );
    maxEnd = Math.max(maxEnd, endMinutes ?? startMinutes);

    const existing = slots.get(startMinutes);
    const events = existing?.events ? [...existing.events] : [];
    events.push({
      id: item.id,
      title: item.title,
      memo: item.memo,
      location: item.location,
      calendarColor: item.calendarColor,
      statusVariant: item.statusVariant,
      timeRange: item.timeRange,
    });

    slots.set(startMinutes, {
      time: minutesToTimeLabel(startMinutes),
      events,
    });
  }

  if (!Number.isFinite(minStart) || !Number.isFinite(maxEnd)) {
    return defaultSlots();
  }

  const startHour = 0;
  const endHour = 24 * 60;

  for (let minute = startHour; minute < endHour; minute += 60) {
    if (!slots.has(minute)) {
      slots.set(minute, {
        time: minutesToTimeLabel(minute),
        events: [],
      });
    }
  }

  return Array.from(slots.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([, slot]) => {
      const events = slot.events ? [...slot.events] : [];
      events.sort((a, b) => {
        const aMinutes = timeLabelToMinutes(a.timeRange?.start ?? "") ?? 0;
        const bMinutes = timeLabelToMinutes(b.timeRange?.start ?? "") ?? 0;
        return aMinutes - bMinutes;
      });
      return {
        ...slot,
        events,
        description: events.length
          ? events.map((event) => event.title).join(" / ")
          : slot.description,
      };
    });
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
  return slots.map((slot) =>
    slot.isCurrent !== undefined
      ? slot
      : {
          ...slot,
          isCurrent: timeLabelToMinutes(slot.time) === currentMinutes,
        },
  );
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
