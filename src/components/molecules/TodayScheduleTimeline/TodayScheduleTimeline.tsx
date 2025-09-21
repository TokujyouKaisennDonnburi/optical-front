import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/atoms/HoverCard";
import { ScrollArea, ScrollBar } from "@/components/atoms/ScrollArea";
import { Separator } from "@/components/atoms/Separator";
import { StatusDot, type StatusDotVariant } from "@/components/atoms/StatusDot";
import { Text } from "@/components/atoms/Text";
import { TimeLabel } from "@/components/atoms/TimeLabel";
import { cn } from "@/utils_constants_styles/utils";

export type TodayScheduleTimelineEvent = {
  id: string;
  title: string;
  memo?: string;
  location?: string;
  calendarColor?: string;
  statusVariant?: StatusDotVariant;
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
  events?: TodayScheduleTimelineEvent[];
};

export type TodayScheduleTimelineProps = {
  slots: TodayScheduleTimelineSlot[];
  className?: string;
  contentClassName?: string;
};

export function TodayScheduleTimeline({
  slots,
  className,
  contentClassName,
}: TodayScheduleTimelineProps) {
  return (
    <ScrollArea
      className={cn(
        "flex-1 rounded-md border border-border bg-muted/20",
        className
      )}
    >
      <div className={cn("flex flex-col", contentClassName)}>
        {slots.map((slot, index) => (
          <div key={`${slot.time}-${index}`} className="px-2.5 py-2">
            <TimeLabel
              time={slot.time}
              suffix={slot.suffix}
              description={slot.description}
              isCurrent={slot.isCurrent}
            />
            {slot.events?.length ? (
              <div className="mt-2 space-y-1.5">
                {slot.events.map((event) => (
                  <HoverCard key={event.id} openDelay={120} closeDelay={120}>
                    <HoverCardTrigger asChild>
                      <button
                        type="button"
                        className="flex w-full items-center gap-2.5 rounded-md border border-border bg-background px-3 py-1.5 text-left text-sm shadow-sm transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <StatusDot
                          variant={
                            event.calendarColor
                              ? "default"
                              : event.statusVariant
                          }
                          style={
                            event.calendarColor
                              ? { backgroundColor: event.calendarColor }
                              : undefined
                          }
                          className="mt-0.5 shrink-0"
                        />
                        <div className="flex flex-1 flex-col">
                          <Text
                            as="span"
                            weight="medium"
                            className="text-foreground"
                          >
                            {event.title}
                          </Text>
                          {event.timeRange ? (
                            <Text
                              as="span"
                              size="sm"
                              className="text-muted-foreground"
                            >
                              {event.timeRange.end
                                ? `${event.timeRange.start} - ${event.timeRange.end}`
                                : `${event.timeRange.start} 開始`}
                            </Text>
                          ) : null}
                        </div>
                      </button>
                    </HoverCardTrigger>
                    <HoverCardContent
                      side="left"
                      align="center"
                      className="w-72 space-y-1.5"
                    >
                      <Text as="p" weight="semibold" className="leading-tight">
                        {event.title}
                      </Text>
                      {event.timeRange ? (
                        <Text
                          as="p"
                          size="sm"
                          className="text-muted-foreground"
                        >
                          時間:{" "}
                          {event.timeRange.end
                            ? `${event.timeRange.start} 〜 ${event.timeRange.end}`
                            : `${event.timeRange.start} 開始`}
                        </Text>
                      ) : null}
                      {event.location ? (
                        <Text
                          as="p"
                          size="sm"
                          className="text-muted-foreground"
                        >
                          場所: {event.location}
                        </Text>
                      ) : null}
                      {event.memo ? (
                        <Text
                          as="p"
                          size="sm"
                          className="whitespace-pre-wrap text-muted-foreground"
                        >
                          メモ: {event.memo}
                        </Text>
                      ) : null}
                    </HoverCardContent>
                  </HoverCard>
                ))}
              </div>
            ) : null}
            {index < slots.length - 1 ? <Separator className="mt-2" /> : null}
          </div>
        ))}
      </div>
      <ScrollBar orientation="vertical" />
    </ScrollArea>
  );
}
