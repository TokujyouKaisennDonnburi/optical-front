import { CalendarDays } from "lucide-react";
import { useMemo, useState } from "react";

import { Card, CardContent } from "@/components/atoms/Card";
import { toast } from "@/components/atoms/Toast";
import { CalendarBoardHeader } from "@/components/molecules/CalendarBoardHeader";
import {
  GeneralCalendarBoard,
  type GeneralCalendarBoardItem,
  GeneralCalendarEventPopover,
  GeneralCreateCalendarDialog,
} from "@/components/organisms/GeneralCalendarBoard";
import type { useGeneralCalendar } from "@/hooks/useGeneralCalendar";
import { createSchedule } from "@/lib/api-schedule";
import { cn } from "@/utils_constants_styles/utils";

type HomeBoardAreaProps = {
  className?: string;
  items: ReturnType<typeof useGeneralCalendar>["items"];
  calendars: ReturnType<typeof useGeneralCalendar>["calendars"];
  isLoading: boolean;
  error: Error | null;
  viewDate: Date;
  onChangeViewDate: (nextDate: Date) => void;
  onRefresh: () => void;
};

export function HomeBoardArea({
  className,
  items,
  calendars,
  isLoading,
  error,
  viewDate,
  onChangeViewDate,
  onRefresh,
}: HomeBoardAreaProps) {
  const [selectedItem, setSelectedItem] = useState<{
    item: GeneralCalendarBoardItem;
    position: { x: number; y: number };
  } | null>(null);
  const [createDate, setCreateDate] = useState<Date | null>(null);

  const boardItems = useMemo(() => {
    const viewYear = viewDate.getFullYear();
    const viewMonth = viewDate.getMonth();

    // カレンダーグリッドに表示される日付範囲を計算
    const firstDayOfMonth = new Date(viewYear, viewMonth, 1);
    const lastDayOfMonth = new Date(viewYear, viewMonth + 1, 0);
    const firstWeekday = firstDayOfMonth.getDay();
    const lastWeekday = lastDayOfMonth.getDay();

    // グリッドの開始日（前月の日付を含む）
    const gridStart = new Date(firstDayOfMonth);
    gridStart.setDate(gridStart.getDate() - firstWeekday);
    gridStart.setHours(0, 0, 0, 0);

    // グリッドの終了日（翌月の日付を含む）
    const gridEnd = new Date(lastDayOfMonth);
    if (lastWeekday !== 6) {
      gridEnd.setDate(gridEnd.getDate() + (6 - lastWeekday));
    }
    gridEnd.setHours(23, 59, 59, 999);

    return items
      .map((item) => {
        if (!item.startsAt) {
          return null;
        }

        const originalStart = new Date(item.startsAt);
        if (Number.isNaN(originalStart.getTime())) {
          return null;
        }

        // グリッドに表示される日付範囲内かチェック
        if (originalStart < gridStart || originalStart > gridEnd) {
          return null;
        }

        let normalizedEnd: string | undefined;
        if (item.endsAt) {
          const originalEnd = new Date(item.endsAt);
          if (!Number.isNaN(originalEnd.getTime())) {
            normalizedEnd = originalEnd.toISOString();
          }
        }

        return {
          id: item.id,
          title: item.title,
          start: originalStart.toISOString(),
          end: normalizedEnd,
          memo: item.memo,
          location: item.location,
          locationUrl: item.locationUrl,
          members: item.members ?? [],
          calendarName: item.calendarName,
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

  const handleSelectItem = (
    item: GeneralCalendarBoardItem,
    position: { x: number; y: number },
  ) => {
    setSelectedItem({ item, position });
  };

  const handleCloseDialog = () => {
    setSelectedItem(null);
  };

  const handleCreateItem = (date: Date) => {
    if (calendars.length === 0) {
      toast.info("まずはカレンダーを作成しましょう", {
        description: "予定を追加するにはカレンダーが必要です",
        duration: 2000,
      });
      return;
    }
    setCreateDate(date);
  };

  const handleCloseCreateDialog = () => {
    setCreateDate(null);
  };

  const handleConfirmCreate = async ({
    date,
    title,
    startTime,
    endTime,
    memo,
    location,
    calendarId,
    isAllDay,
    allDayStartDate,
    allDayEndDate,
  }: {
    date: Date;
    title: string;
    startTime: string;
    endTime: string;
    memo: string;
    location: string;
    calendarId: string;
    isAllDay: boolean;
    allDayStartDate: Date;
    allDayEndDate: Date;
  }) => {
    const startDate = new Date(date);
    let endIso = "";
    let startIso = "";

    if (isAllDay) {
      const startDay = new Date(allDayStartDate);
      startDay.setHours(0, 0, 0, 0);
      startIso = startDay.toISOString();

      const endDate = new Date(allDayEndDate);
      endDate.setHours(23, 59, 59, 999);
      endIso = endDate.toISOString();
    } else {
      const [startHour, startMin] = startTime.split(":").map(Number);
      startDate.setHours(startHour ?? 0, startMin ?? 0, 0, 0);
      startIso = startDate.toISOString();

      if (endTime) {
        const endDate = new Date(date);
        const [endHour, endMin] = endTime.split(":").map(Number);
        endDate.setHours(endHour ?? 0, endMin ?? 0, 0, 0);
        endIso = endDate.toISOString();
      }
    }

    try {
      await createSchedule(calendarId, {
        title,
        startTime: startIso,
        endTime: endIso,
        memo,
        location,
        isAllDay,
      });
      toast.success("予定を追加しました", {
        description: title || "新規予定",
        duration: 2000,
      });
      onRefresh();
    } catch (err) {
      toast.error("予定の作成に失敗しました", { duration: 2000 });
      console.error("Failed to create schedule", err);
    } finally {
      handleCloseCreateDialog();
    }
  };

  return (
    <Card
      className={cn(
        "flex min-h-0 flex-1 flex-col gap-2 border p-3",
        // ライトモード: 白ベース
        "border-stone-200 bg-white text-stone-800 shadow-sm",
        // ダークモード
        "dark:border-primary/30 dark:bg-slate-800/90 dark:text-white",
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
        <GeneralCalendarBoard
          title="総合"
          items={boardItems}
          isLoading={isLoading}
          errorMessage={
            error
              ? "予定を取得できませんでした"
              : !isLoading && calendars.length === 0
                ? "カレンダーがありません。下の＋ボタンからカレンダーを作成しましょう。"
                : undefined
          }
          className="flex h-full min-h-0 flex-col"
          baseDate={viewDate}
          onSelectItem={handleSelectItem}
          onCreateItem={handleCreateItem}
        />
      </CardContent>
      {selectedItem ? (
        <GeneralCalendarEventPopover
          item={selectedItem.item}
          isOpen
          onClose={handleCloseDialog}
          anchorPosition={selectedItem.position}
        />
      ) : null}
      {createDate ? (
        <GeneralCreateCalendarDialog
          date={createDate}
          isOpen
          onClose={handleCloseCreateDialog}
          calendars={calendars.map((c) => ({
            id: c.id,
            name: c.name,
            color: c.color,
          }))}
          onConfirm={handleConfirmCreate}
        />
      ) : null}
    </Card>
  );
}
