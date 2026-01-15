import { ChevronDown, ChevronUp } from "lucide-react";
import { useRef } from "react";
import { Badge } from "@/components/atoms/Badge";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/atoms/HoverCard";
import { Text } from "@/components/atoms/Text";
import { cn } from "@/utils_constants_styles/utils";
import { TimelineFullDayEventCard } from "../FullDayEvent/TimelineFullDayEventCard";

export type EventItem = {
  id: string;
  title: string;
  calendarColor?: string;
  memo?: string;
  location?: string;
};

export type EventSectionProps = {
  items: EventItem[];
  isOpen: boolean;
  onToggle: () => void;
  maxHeight?: number;
  className?: string;
};

export function EventSection({
  items,
  isOpen,
  onToggle,
  maxHeight = 240,
  className,
}: EventSectionProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  if (items.length === 0) return null;

  return (
    <div
      className={cn(
        "mb-3 rounded-md border border-border bg-muted/30 overflow-hidden",
        className,
      )}
    >
      {/* ===== ヘッダー ===== */}
      <button
        type="button"
        onClick={onToggle}
        className="relative flex w-full items-center justify-between px-3 py-2"
      >
        <Text size="sm" weight="semibold">
          終日イベント
        </Text>

        <div className="relative flex items-center">
          {/* 件数バッジ */}
          <Badge className="absolute -top-2 -right-3 h-4 min-w-[16px] flex items-center justify-center px-1 text-[10px] font-semibold">
            {items.length}
          </Badge>

          {isOpen ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </button>

      {/* ===== 中身 ===== */}
      {isOpen && (
        <div className="border-t border-border px-3 py-2">
          <div
            ref={scrollRef}
            className="space-y-2 overflow-y-auto"
            style={{ maxHeight }}
          >
            {items.map((item) => (
              <HoverCard key={item.id} openDelay={120} closeDelay={120}>
                <HoverCardTrigger asChild>
                  <button type="button" className="w-full text-left">
                    <TimelineFullDayEventCard
                      title={item.title}
                      calendarColor={item.calendarColor}
                      className="w-full min-w-0"
                    />
                  </button>
                </HoverCardTrigger>

                {/* ===== ここが TodayScheduleTimeline と完全同一構造 ===== */}
                <HoverCardContent
                  side="left"
                  align="center"
                  className="w-72 space-y-1.5"
                >
                  <Text as="p" weight="semibold" className="leading-tight">
                    {item.title}
                  </Text>

                  <Text as="p" size="sm" className="text-muted-foreground">
                    時間: 終日
                  </Text>

                  {item.location ? (
                    <Text as="p" size="sm" className="text-muted-foreground">
                      場所: {item.location}
                    </Text>
                  ) : null}

                  {item.memo ? (
                    <Text
                      as="p"
                      size="sm"
                      className="whitespace-pre-wrap text-muted-foreground"
                    >
                      メモ: {item.memo}
                    </Text>
                  ) : null}
                </HoverCardContent>
              </HoverCard>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
