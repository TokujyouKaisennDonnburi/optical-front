import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
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
import type { DailyPanelItem } from "@/components/organisms/DailyPanel";
import { cn } from "@/utils_constants_styles/utils";

export type DailyTimelineEvent = {
  id: string;
  title: string;
  start: string; // HH:mm
  end?: string; // HH:mm
  statusVariant?: "default" | "success" | "warning" | "danger";
  location?: string;
  calendarColor?: string;
  memo?: string; // Added missing property based on previous usage
};

export type DailyTimelineSlot = {
  time: string; // HH:mm
  events?: DailyTimelineEvent[];
  isCurrent?: boolean;
  suffix?: string;
};

export type DailyTimelineProps = {
  slots: DailyTimelineSlot[];
  items?: DailyPanelItem[];
  onEventClick?: (event: DailyTimelineEvent) => void;
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
  start: number; // 分単位の開始時刻
  end: number; // 分単位の終了時刻
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
  return `${d.getHours()}:${d.getMinutes().toString().padStart(2, "0")}`;
}

// HEXカラーにアルファ値を付与してRGBA文字列を作成
function withAlpha(color: string, alpha: number) {
  if (!color.startsWith("#") || color.length !== 7) return color;
  const r = parseInt(color.slice(1, 3), 16);
  const g = parseInt(color.slice(3, 5), 16);
  const b = parseInt(color.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function DailyTimeline({
  slots,
  items = [],
  onEventClick: _onEventClick,
  className,
  contentClassName,
}: DailyTimelineProps) {
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const currentSlotRef = useRef<HTMLDivElement | null>(null);
  const hasAutoScrolledRef = useRef(false);
  const [hoveredEventId, setHoveredEventId] = useState<string | null>(null); // Hover中のイベントID

  const MINUTES_IN_DAY = 24 * 60;
  const PX_PER_MIN = 1.6; // 1分あたりの高さ(px)
  const SLOT_HEIGHT_PX = 60 * PX_PER_MIN; // 1時間あたりの高さ
  const MIN_HEIGHT_PX = 30 * PX_PER_MIN; // 最小カード高さ(30分)

  const setCurrentSlotRef = useCallback((node: HTMLDivElement | null) => {
    currentSlotRef.current = node;
  }, []);

  /* ===== スクロール同期 ===== */
  // Reset auto-scroll flag when items change (e.g. date change)
  // biome-ignore lint/correctness/useExhaustiveDependencies: items 変更時に自動スクロールをリセットする必要があるため
  useEffect(() => {
    hasAutoScrolledRef.current = false;
  }, [items]);

  useLayoutEffect(() => {
    if (hasAutoScrolledRef.current) return;

    if (currentSlotRef.current && viewportRef.current) {
      const viewport = viewportRef.current;
      const slot = currentSlotRef.current;

      // Center the current slot
      const top =
        slot.offsetTop - viewport.clientHeight / 2 + slot.clientHeight / 2;

      viewport.scrollTo({ top, behavior: "smooth" });
      hasAutoScrolledRef.current = true;
    }
  }, []);

  /* ===== イベント正規化 ===== */
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
          timeRange: { start: startLabel, end: endLabel },
        },
      ];
    });
  }, [items]);

  // 表示用に高さを計算して追加
  const enrichedEvents = useMemo(() => {
    return events.map((ev) => ({
      ...ev,
      displayHeight: Math.max((ev.end - ev.start) * PX_PER_MIN, MIN_HEIGHT_PX),
    }));
  }, [events, MIN_HEIGHT_PX]); // MIN_HEIGHT_PX を依存配列に追加

  /* =====================================================
   * Google Calendar方式レイアウト
   * ・重なりをクラスタ化
   * ・クラスタ内の最大 active.length を colCount にする
   * ===================================================== */
  const layoutedEvents = useMemo(() => {
    type LayoutEvent = (typeof enrichedEvents)[number] & {
      col: number; // 列番号
      colCount: number; // クラスタ内の列数
    };

    const sorted = [...enrichedEvents].sort((a, b) => a.start - b.start);

    /* --- クラスタ分割 --- */
    const clusters: (typeof enrichedEvents)[] = [];
    let current: typeof enrichedEvents = [];
    let currentEnd = -1;

    for (const ev of sorted) {
      if (current.length === 0 || ev.start < currentEnd) {
        current.push(ev);
        currentEnd = Math.max(currentEnd, ev.end);
      } else {
        clusters.push(current);
        current = [ev];
        currentEnd = ev.end;
      }
    }
    if (current.length) clusters.push(current);

    const result: LayoutEvent[] = [];

    /* --- クラスタごとに列割当 --- */
    for (const cluster of clusters) {
      const active: { end: number; col: number }[] = [];
      const placed: LayoutEvent[] = [];
      let maxCols = 0;

      for (const ev of cluster) {
        // 現在アクティブな列を左からソート
        active.sort((a, b) => a.col - b.col);

        let col = 0;
        for (; col < active.length; col++) {
          if (active[col].end <= ev.start) break;
        }

        // 新しい列が必要な場合
        if (col === active.length) {
          active.push({ end: ev.end, col });
        } else {
          active[col].end = ev.end;
        }

        maxCols = Math.max(maxCols, active.length);
        placed.push({ ...ev, col, colCount: 0 });
      }

      // クラスタ内の全イベントに列数を設定
      for (const p of placed) {
        p.colCount = maxCols;
        result.push(p);
      }
    }

    return result;
  }, [enrichedEvents]);

  const [mountedMap, setMountedMap] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setMountedMap((prev) => {
      const next: Record<string, boolean> = { ...prev };
      items.forEach((e) => {
        if (!(e.id in next)) {
          next[e.id] = false;
        }
      });
      return next;
    });
  }, [items]);

  useLayoutEffect(() => {
    Object.keys(mountedMap).forEach((id) => {
      if (!mountedMap[id]) {
        requestAnimationFrame(() => {
          setMountedMap((prev) => ({ ...prev, [id]: true }));
        });
      }
    });
  }, [mountedMap]);

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
        {/* ===== イベント描画 ===== */}
        <div className="absolute inset-0 pointer-events-none">
          {layoutedEvents.map((ev) => {
            const leftBase = 60;
            const gap = 8;
            const baseColor = ev.calendarColor ?? "#38bdf8";
            const mounted = mountedMap[ev.id] ?? true;
            const isNew = !mountedMap[ev.id];

            // 新規イベントは右から左にスライド
            const initialX = isNew ? 20 : 0; // px

            return (
              <div
                key={ev.id}
                className="absolute pointer-events-auto transition-[opacity,transform] ease-out"
                style={{
                  top: ev.start * PX_PER_MIN,
                  height: ev.displayHeight,
                  left: `calc(${leftBase}px + ((100% - ${leftBase}px) / ${ev.colCount}) * ${ev.col})`,
                  width: `calc((100% - ${leftBase}px) / ${ev.colCount} - ${gap}px)`,
                  zIndex: hoveredEventId === ev.id ? 1000 : 10,
                  opacity: mounted ? 1 : 0,
                  transform: mounted
                    ? "translateX(0)"
                    : `translateX(${initialX}px)`,
                  transitionDuration: "700ms",
                }}
              >
                {/* ===== Hoverで詳細カード表示 ===== */}
                <button
                  type="button"
                  className="h-full w-full text-left"
                  onMouseEnter={() => setHoveredEventId(ev.id)}
                  onMouseLeave={() => setHoveredEventId(null)}
                >
                  <HoverCard openDelay={120} closeDelay={120}>
                    <HoverCardTrigger asChild>
                      {/* タイムライン上のイベントカード */}
                      <div
                        className="relative h-full w-full overflow-hidden rounded-md border"
                        style={{
                          borderColor: baseColor,
                          backgroundColor: withAlpha(baseColor, 0.15),
                        }}
                      >
                        <div
                          className="absolute left-0 top-0 h-full w-1.5"
                          style={{ backgroundColor: baseColor }}
                        />
                        <div className="h-full w-full pl-3 pr-2 py-1.5">
                          <ScheduleEventCard
                            title={ev.title}
                            subtitle={`${ev.timeRange.start} - ${ev.timeRange.end ?? ""}`}
                            calendarColor={baseColor}
                            statusVariant={ev.statusVariant}
                            variant="timeline"
                            className="w-full min-w-0"
                          />
                        </div>
                      </div>
                    </HoverCardTrigger>

                    {/* Hover時に表示する詳細カード */}
                    <HoverCardContent
                      side="left"
                      align="center"
                      className="w-72 space-y-1.5 z-[9999]"
                    >
                      <Text as="p" weight="semibold" className="leading-tight">
                        {ev.title}
                      </Text>
                      <Text as="p" size="sm" className="text-muted-foreground">
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
              </div>
            );
          })}
        </div>

        {/* ===== 時刻目盛り描画（グリッド厳密化済み） ===== */}
        {slots.map((slot) => (
          <div
            key={slot.time}
            ref={slot.isCurrent ? setCurrentSlotRef : undefined}
            className="border-b border-border bg-background"
            style={{ height: SLOT_HEIGHT_PX }}
          >
            {/* padding は内側に寄せる（外側は純粋なグリッド） */}
            <div className="h-full px-2.5 py-2 flex items-start">
              <TimeLabel
                time={slot.time}
                suffix={slot.suffix}
                isCurrent={slot.isCurrent}
                size="md"
              />
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
