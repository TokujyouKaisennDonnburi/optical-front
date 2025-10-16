"use client";

import { useMemo, useState } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/atoms/Avatar";
import { Card, CardContent } from "@/components/atoms/Card";
import { CalendarBoardHeader } from "@/components/molecules/CalendarBoardHeader";
import {
  GeneralScheduleBoard,
  ScheduleEventDialog,
  type GeneralScheduleBoardItem,
} from "@/components/organisms/GeneralScheduleBoard";
import { SearchHeader } from "@/components/organisms/SearchHeader/SearchHeader";
import { TodaySchedulePanel } from "@/components/organisms/TodaySchedulePanel";
import { useTodaySchedule } from "@/hooks/useTodaySchedule";
import { cn } from "@/utils_constants_styles/utils";
import { CalendarDays } from "lucide-react";
import { AccountMenu } from "@/components/organisms/AccountMenu/AccountMenu";
import { useUser } from "@/hooks/useUser";
import { ConfirmModal } from "@/components/molecules/ConfirmModal/ConfirmModal";
import * as React from "react";

export default function Home() {
  const { items, calendars, dateLabel, isLoading, error } = useTodaySchedule();
  const [viewDate, setViewDate] = useState(() => startOfDay(new Date()));
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCalendars, setSelectedCalendars] = useState<string[]>([]);

  const filteredItems = useMemo(() => {
    const normalized = searchTerm.trim().toLowerCase();
    const calendarFilter = new Set(selectedCalendars);

    return items.filter((item) => {
      const matchesSearch =
        !normalized || item.title.toLowerCase().includes(normalized);

      if (!matchesSearch) {
        return false;
      }

      if (!calendarFilter.size) {
        return true;
      }

      const calendarName = item.calendarName ?? "";
      return calendarFilter.has(calendarName);
    });
  }, [items, searchTerm, selectedCalendars]);

  const todayItems = useMemo(() => {
    const todayStart = startOfDay(new Date());
    const todayEnd = new Date(todayStart);
    todayEnd.setDate(todayEnd.getDate() + 1);

    return filteredItems.filter((item) => {
      const startsAt = item.startsAt ? new Date(item.startsAt) : null;
      const endsAt = item.endsAt ? new Date(item.endsAt) : null;

      if (!startsAt || Number.isNaN(startsAt.getTime())) {
        return false;
      }

      const hasValidEnd = endsAt && !Number.isNaN(endsAt.getTime());
      const rangeStart = startsAt;
      const rangeEnd = hasValidEnd ? endsAt : startsAt;

      return rangeStart < todayEnd && rangeEnd >= todayStart;
    });
  }, [filteredItems]);

  const calendarOptions = useMemo(() => {
    return Array.from(new Set(calendars.map((calendar) => calendar.name)));
  }, [calendars]);

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

  // ユーザー情報の取得
  const { user, isLoading: userLoading, error: userError } = useUser();

  // モーダル制御用の state
  const [isConfirmOpen, setIsConfirmOpen] = React.useState(false);
  const [pendingEmail, setPendingEmail] = React.useState<string | null>(null);

  // メール保存リクエストを受け取るハンドラ
  const handleRequestEmailSave = (newEmail: string) => {
    setPendingEmail(newEmail);
    setIsConfirmOpen(true);
  };

  // モーダルの「保存」ボタン押下時のハンドラ
  const handleConfirm = () => {
    // ここで実際の保存処理を実装
    console.log("保存:", pendingEmail);

    setIsConfirmOpen(false);
    setPendingEmail(null);
  };

  // モーダルの「キャンセル」ボタン押下時のハンドラ
  const handleCancel = () => {
    setIsConfirmOpen(false);
    setPendingEmail(null);
  };

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-muted/10">
      <header className="border-b border-border bg-card/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center gap-2.5 px-4 py-2.5 lg:px-8">
          <SearchHeader
            searchValue={searchTerm}
            onSearchChange={(value) => setSearchTerm(value)}
            calendarOptions={calendarOptions}
            selectedCalendars={selectedCalendars}
            onCalendarChange={setSelectedCalendars}
          />
          <Avatar className="ml-auto h-10 w-10 border">
            <AvatarImage src="https://i.pravatar.cc/100?img=40" alt="User" />
            <AvatarFallback>YO</AvatarFallback>
          </Avatar>

          {/* アカウントボタンの表示 */}
          {/*
          <div className="ml-auto h-10 w-10">
            <AccountMenu
              user={user}
              isLoading={userLoading}
              error={userError}
              onRequestEmailSave={handleRequestEmailSave}
            />
          </div>
          */}
        </div>
      </header>
      <main className="mx-auto grid w-full max-w-7xl flex-1 grid-cols-1 gap-3 overflow-hidden px-2 py-2 lg:grid-cols-[minmax(0,1fr)_clamp(24rem,32vw,32rem)] ">
        <BoardArea
          className="flex-1 min-h-0 lg:col-start-1"
          items={filteredItems}
          isLoading={isLoading}
          error={error}
          viewDate={viewDate}
          onChangeViewDate={handleViewDateChange}
        />
        <div className="flex h-full w-full min-h-0 lg:col-start-2 lg:w-full lg:max-w-[32rem]">
          <TodaySchedulePanel
            header={boardHeader}
            items={todayItems}
            isLoading={isLoading}
            emptyMessage={
              error ? "予定を取得できませんでした" : "今日の予定はありません。"
            }
          />
        </div>
      </main>
      <AvatarStrip />

      {/* メールアドレス変更確認モーダル */}
      <ConfirmModal
        isOpen={isConfirmOpen}
        message={`メールアドレスを「${pendingEmail}」に変更しますか？`}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </div>
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
