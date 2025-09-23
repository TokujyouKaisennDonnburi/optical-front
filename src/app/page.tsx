"use client";

import { useMemo, useState } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/atoms/Avatar";
import { Button } from "@/components/atoms/Button";
import { Card, CardContent } from "@/components/atoms/Card";
import { Icon } from "@/components/atoms/Icon";
import { Input } from "@/components/atoms/Input";
import { CalendarBoardHeader } from "@/components/molecules/CalendarBoardHeader";
import {
  GeneralScheduleBoard,
  ScheduleEventDialog,
  type GeneralScheduleBoardItem,
} from "@/components/organisms/GeneralScheduleBoard";
import { TodaySchedulePanel } from "@/components/organisms/TodaySchedulePanel";
import { useTodaySchedule } from "@/hooks/useTodaySchedule";
import { cn } from "@/utils_constants_styles/utils";
import { CalendarDays, ChevronDown, Plus } from "lucide-react";

export default function Home() {
  const { items, dateLabel, isLoading, error } = useTodaySchedule();
  const [viewDate, setViewDate] = useState(() => startOfDay(new Date()));

  const boardHeader = useMemo(
    () => ({
      title: "今日の予定",
      dateLabel: dateLabel || "取得中...",
    }),
    [dateLabel],
  );

  const handleViewDateChange = (next: Date) => {
    setViewDate(startOfDay(next));
  };

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-muted/10">
      <HeaderBar />
      <main className="mx-auto grid w-full max-w-7xl flex-1 grid-cols-1 gap-3 overflow-hidden px-2 py-2 lg:grid-cols-[minmax(0,1fr)_320px] ">
        <BoardArea
          className="flex-1 min-h-0 lg:col-start-1"
          items={items}
          isLoading={isLoading}
          error={error}
          viewDate={viewDate}
          onChangeViewDate={handleViewDateChange}
        />
        <div className="flex h-full w-full min-h-0 lg:col-start-2">
          <TodaySchedulePanel
            header={boardHeader}
            items={items}
            isLoading={isLoading}
            emptyMessage={
              error ? "予定を取得できませんでした" : "今日の予定はありません。"
            }
          />
        </div>
      </main>
      <AvatarStrip />
    </div>
  );
}

function HeaderBar() {
  return (
    <header className="border-b border-border bg-card/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center gap-2.5 px-4 py-2.5 lg:px-8">
        <Input
          placeholder="スケジュール、参加者、場所を検索..."
          className="h-10 flex-1 min-w-[220px]"
        />
        <HeaderDropdown label="全てのカレンダー" />
        <HeaderDropdown label="全期間" />
        <Button variant="outline">クリア</Button>
        <Button className="gap-2">
          <Icon icon={Plus} size="sm" /> 予定を追加
        </Button>
        <Avatar className="h-10 w-10 border">
          <AvatarImage src="https://i.pravatar.cc/100?img=40" alt="User" />
          <AvatarFallback>YO</AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}

function HeaderDropdown({ label }: { label: string }) {
  return (
    <Button variant="secondary" className="gap-2">
      {label}
      <Icon icon={ChevronDown} size="sm" />
    </Button>
  );
}

function BoardArea({
  className,
  items,
  isLoading,
  error,
  viewDate,
  onChangeViewDate,
}: {
  className?: string;
  items: ReturnType<typeof useTodaySchedule>["items"];
  isLoading: boolean;
  error: Error | null;
  viewDate: Date;
  onChangeViewDate: (nextDate: Date) => void;
}) {
  const [selectedItem, setSelectedItem] =
    useState<GeneralScheduleBoardItem | null>(null);

  const boardItems = useMemo(() => {
    return items
      .map((item) => {
        if (!item.startsAt) {
          return null;
        }

        const originalStart = new Date(item.startsAt);
        if (Number.isNaN(originalStart.getTime())) {
          return null;
        }

        const adjustedStart = new Date(viewDate);
        adjustedStart.setDate(originalStart.getDate());
        adjustedStart.setHours(
          originalStart.getHours(),
          originalStart.getMinutes(),
          originalStart.getSeconds(),
          originalStart.getMilliseconds(),
        );

        let adjustedEnd: Date | undefined;
        if (item.endsAt) {
          const originalEnd = new Date(item.endsAt);
          if (!Number.isNaN(originalEnd.getTime())) {
            adjustedEnd = new Date(viewDate);
            adjustedEnd.setDate(originalEnd.getDate());
            adjustedEnd.setHours(
              originalEnd.getHours(),
              originalEnd.getMinutes(),
              originalEnd.getSeconds(),
              originalEnd.getMilliseconds(),
            );
          }
        }

        return {
          id: item.id,
          title: item.title,
          start: adjustedStart.toISOString(),
          end: adjustedEnd?.toISOString(),
          memo: item.memo,
          location: item.location,
          locationUrl: item.locationUrl,
          members: item.members ?? [],
          calendarName: item.calendarName ?? "",
          calendarColor: item.calendarColor,
        };
      })
      .filter((value): value is NonNullable<typeof value> => Boolean(value))
      .sort((a, b) => {
        const timeA = new Date(a.start).getTime();
        const timeB = new Date(b.start).getTime();
        if (!Number.isFinite(timeA) && !Number.isFinite(timeB)) return 0;
        if (!Number.isFinite(timeA)) return 1;
        if (!Number.isFinite(timeB)) return -1;
        return timeA - timeB;
      });
  }, [items, viewDate]);

  const monthLabel = useMemo(
    () =>
      new Intl.DateTimeFormat("ja-JP", {
        year: "numeric",
        month: "long",
      }).format(viewDate),
    [viewDate],
  );

  const handleShiftMonth = (delta: number) => {
    const next = new Date(viewDate);
    next.setDate(1);
    next.setMonth(next.getMonth() + delta);
    onChangeViewDate(next);
  };

  const handleResetToday = () => {
    onChangeViewDate(new Date());
  };

  const handleSelectItem = (item: GeneralScheduleBoardItem) => {
    setSelectedItem(item);
  };

  const handleCloseDialog = () => {
    setSelectedItem(null);
  };

  return (
    <Card
      className={cn(
        "flex min-h-0 flex-1 flex-col gap-2 border border-primary/30 bg-slate-800/90 p-3",
        className,
      )}
    >
      <CalendarBoardHeader
        badgeLabel="総合"
        badgeIcon={CalendarDays}
        monthLabel={monthLabel}
        onPrev={() => handleShiftMonth(-1)}
        onNext={() => handleShiftMonth(1)}
        onToday={handleResetToday}
      />
      <CardContent className="flex min-h-0 flex-1 flex-col overflow-hidden p-0">
        <GeneralScheduleBoard
          title="総合"
          items={boardItems}
          isLoading={isLoading}
          errorMessage={error ? "予定を取得できませんでした" : undefined}
          emptyMessage="予定がありません。"
          className="flex h-full min-h-0 flex-col"
          baseDate={viewDate}
          onSelectItem={handleSelectItem}
        />
      </CardContent>
      {selectedItem ? (
        <ScheduleEventDialog
          item={selectedItem}
          isOpen
          onClose={handleCloseDialog}
        />
      ) : null}
    </Card>
  );
}

function AvatarStrip() {
  return (
    <div className="mx-auto w-full max-w-7xl shrink-0 px-3 py-2 lg:px-6">
      <div className="flex gap-2.5 overflow-x-auto pb-1 lg:grid lg:grid-cols-5 lg:gap-2.5 lg:overflow-visible lg:pb-0">
        {Array.from({ length: 5 }).map((_, index) => (
          <Card
            key={`avatar-${index}`}
            className="flex min-w-[110px] items-center justify-center bg-slate-800/80 py-3.5 lg:min-w-0"
          >
            <Avatar className="h-16 w-16 border-4 border-primary">
              <AvatarImage
                src={`https://i.pravatar.cc/100?img=${30 + index}`}
                alt={`Member ${index + 1}`}
              />
              <AvatarFallback>{`M${index + 1}`}</AvatarFallback>
            </Avatar>
          </Card>
        ))}
      </div>
    </div>
  );
}

function startOfDay(date: Date) {
  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);
  return normalized;
}
