import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/atoms/HoverCard";
import { ScrollArea } from "@/components/atoms/ScrollArea";
import type { StatusDotVariant } from "@/components/atoms/StatusDot";
import { Text } from "@/components/atoms/Text";
import { TimeLabel } from "@/components/atoms/TimeLabel";
import { ScheduleEventCard } from "@/components/molecules/ScheduleEventCard";
import { cn } from "@/utils_constants_styles/utils";

export type TodayScheduleTimelineEvent = {
  id: string;
  title: string;
  memo?: string;
  location?: string;
  calendarColor?: string;
  statusVariant?: StatusDotVariant;
  startsAt?: string;
  endsAt?: string;
  timeRange?: {
    start: string;
    end?: string;
  };
};

export type TodayScheduleTimelineSlot = {
  time: string;
  suffix?: string;
  description?: string;
  isCurrent?: boolean;
};

export type TodayScheduleTimelineProps = {
  slots: TodayScheduleTimelineSlot[];
  items: TodayScheduleTimelineEvent[];
  className?: string;
  contentClassName?: string;
};

type NormalizedEvent = {
  id: string;
  title: string;
  memo?: string;
  location?: string;
  calendarColor?: string;
  statusVariant?: StatusDotVariant;
  start: number;
  end: number;
  timeRange: {
    start: string;
    end?: string;
  };
};

function timeToMinutes(label: string) {
  const [h, m] = label.split(":").map(Number);
  return h * 60 + m;
}

function extractTimeLabel(iso?: string) {
  if (!iso) return undefined;
  const d = new Date(iso);
  const h = d.getHours();
  const m = d.getMinutes();
  return `${h}:${m.toString().padStart(2, "0")}`;
}

export function TodayScheduleTimeline({
  slots,
  items,
  className,
  contentClassName,
}: TodayScheduleTimelineProps) {
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const currentSlotRef = useRef<HTMLDivElement | null>(null);
  const hasAutoScrolledRef = useRef(false);

  /* ===== ホバー中のイベントID（z-index制御用） ===== */
  const [hoveredEventId, setHoveredEventId] = useState<string | null>(null);

  const STACK_SHIFT = 24; // 横方向のずらし量（重なり回避）
  const MINUTES_IN_DAY = 24 * 60;
  const PX_PER_MIN = 1.6; // 1分あたりの高さ(px)

  const MIN_DISPLAY_MINUTES = 30; // 最低表示時間（分）
  const MIN_HEIGHT_PX = MIN_DISPLAY_MINUTES * PX_PER_MIN;
  const SLOT_HEIGHT_PX = 60 * PX_PER_MIN;

  const setCurrentSlotRef = useCallback((node: HTMLDivElement | null) => {
    currentSlotRef.current = node;
  }, []);

  useEffect(() => {
    if (hasAutoScrolledRef.current) return;
    const viewport = viewportRef.current;
    const currentSlot = currentSlotRef.current;
    if (!viewport || !currentSlot) return;

    const frame = requestAnimationFrame(() => {
      const target =
        currentSlot.offsetTop -
        viewport.clientHeight / 2 +
        currentSlot.offsetHeight / 2;

      viewport.scrollTo({ top: Math.max(target, 0), behavior: "auto" });
      hasAutoScrolledRef.current = true;
    });

    return () => cancelAnimationFrame(frame);
  }, []);

  const events = useMemo<NormalizedEvent[]>(() => {
    return items.flatMap((e) => {
      const startLabel = e.timeRange?.start ?? extractTimeLabel(e.startsAt);
      const endLabel = e.timeRange?.end ?? extractTimeLabel(e.endsAt);

      if (!startLabel) return [];

      const start = timeToMinutes(startLabel);
      const end = endLabel ? timeToMinutes(endLabel) : start + 30;

      return [
        {
          id: e.id,
          title: e.title,
          memo: e.memo,
          location: e.location,
          calendarColor: e.calendarColor,
          statusVariant: e.statusVariant,
          start,
          end,
          timeRange: {
            start: startLabel,
            end: endLabel,
          },
        },
      ];
    });
  }, [items]);

  const enrichedEvents = useMemo(() => {
    return events.map((ev) => {
      const realHeight = (ev.end - ev.start) * PX_PER_MIN;
      const displayHeight = Math.max(realHeight, MIN_HEIGHT_PX);

      return {
        ...ev,
        realHeight,
        displayHeight,
        groupKey: `${ev.start}-${displayHeight}`, // 同じ開始位置・同じ高さのものを横並びグループ化するキー
      };
    });
  }, [events, MIN_HEIGHT_PX]);

  /* =========================
     開始位置＆高さが同じイベントをグループ化
  ========================= */
  const groups = useMemo(() => {
    const map = new Map<string, typeof enrichedEvents>();

    for (const ev of enrichedEvents) {
      const arr = map.get(ev.groupKey) ?? [];
      arr.push(ev);
      map.set(ev.groupKey, arr);
    }

    return map;
  }, [enrichedEvents]);

  /* =========================
     縦積みレイアウト（重なる時間帯は横にずらして表示する）
  ========================= */
  const layoutedGroups = useMemo(() => {
    const groupEntries = Array.from(groups.values()).sort(
      (a, b) => a[0].start - b[0].start,
    );

    const active: number[] = [];
    const result: Array<{
      group: typeof enrichedEvents;
      stackIndex: number;
    }> = [];

    for (const group of groupEntries) {
      const start = group[0].start;
      const end = group[0].end;

      for (let i = active.length - 1; i >= 0; i--) {
        if (active[i] <= start) {
          active.splice(i, 1);
        }
      }

      // 現在のレーン数 = ずらし量
      const stackIndex = active.length;
      active.push(end);

      result.push({ group, stackIndex });
    }

    return result;
  }, [groups]);

  return (
    <ScrollArea
      className={cn(
        "flex-1 min-w-0 rounded-md border border-border bg-muted/20",
        className,
      )}
      viewportRef={viewportRef}
    >
      <div
        className={cn("relative w-full", contentClassName)}
        style={{ height: MINUTES_IN_DAY * PX_PER_MIN }}
      >
        {/* ===== イベント ===== */}
        <div className="absolute inset-0 pointer-events-none">
          {layoutedGroups.map(({ group, stackIndex }) => {
            const base = group[0];
            const top = base.start * PX_PER_MIN;
            const height = base.displayHeight;
            const leftBase = 56 + stackIndex * STACK_SHIFT;

            // グループ内のどれかが hover されていたら最前面へ
            const isGroupHovered = group.some((ev) => ev.id === hoveredEventId);

            return (
              <div
                key={base.id}
                className="absolute pointer-events-auto overflow-x-auto"
                style={{
                  top,
                  height,
                  left: leftBase,
                  right: 8,
                  zIndex: isGroupHovered ? 1000 : 10 + stackIndex, // hover中のグループは最前面へ
                  scrollbarWidth: "none", // スクロールバー非表示（Firefox）
                  msOverflowStyle: "none", // スクロールバー非表示（IE, Edge
                }}
              >
                <div className="flex h-full gap-2 w-max pr-2 hide-scrollbar">
                  {group.map((ev) => {
                    const isHovered = hoveredEventId === ev.id;

                    return (
                      <button
                        type="button"
                        key={ev.id}
                        className="h-full flex-shrink-0 w-[220px] text-left"
                        style={{
                          zIndex: isHovered ? 10000 : undefined,
                        }}
                        onMouseEnter={() => setHoveredEventId(ev.id)}
                        onMouseLeave={() => setHoveredEventId(null)}
                      >
                        <HoverCard openDelay={120} closeDelay={120}>
                          <HoverCardTrigger asChild>
                            <div
                              className="h-full w-full overflow-hidden rounded-md border shadow-sm px-2 py-1.5 bg-card text-card-foreground"
                              style={{
                                borderColor: ev.calendarColor ?? "#38bdf8",
                              }}
                            >
                              <ScheduleEventCard
                                title={ev.title}
                                subtitle={`${ev.timeRange.start} - ${
                                  ev.timeRange.end ?? ""
                                }`}
                                calendarColor={ev.calendarColor}
                                statusVariant={ev.statusVariant}
                                variant="timeline"
                                className="w-full min-w-0 overflow-hidden [&_*]:truncate"
                              />
                            </div>
                          </HoverCardTrigger>

                          <HoverCardContent
                            side="left"
                            align="center"
                            className="w-72 space-y-1.5"
                          >
                            <Text
                              as="p"
                              weight="semibold"
                              className="leading-tight"
                            >
                              {ev.title}
                            </Text>

                            <Text
                              as="p"
                              size="sm"
                              className="text-muted-foreground"
                            >
                              時間:{" "}
                              {ev.timeRange.end
                                ? `${ev.timeRange.start} 〜 ${ev.timeRange.end}`
                                : `${ev.timeRange.start} 開始`}
                            </Text>

                            {ev.location && (
                              <Text
                                as="p"
                                size="sm"
                                className="text-muted-foreground"
                              >
                                場所: {ev.location}
                              </Text>
                            )}

                            {ev.memo && (
                              <Text
                                as="p"
                                size="sm"
                                className="whitespace-pre-wrap text-muted-foreground"
                              >
                                メモ: {ev.memo}
                              </Text>
                            )}
                          </HoverCardContent>
                        </HoverCard>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* ===== 時刻目盛り ===== */}
        {slots.map((slot) => (
          <div
            key={slot.time}
            ref={slot.isCurrent ? setCurrentSlotRef : undefined}
            className="relative border-b border-border px-2.5 py-2 bg-background"
            style={{ height: SLOT_HEIGHT_PX }}
          >
            <TimeLabel
              time={slot.time}
              suffix={slot.suffix}
              isCurrent={slot.isCurrent}
              size="md"
            />
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
