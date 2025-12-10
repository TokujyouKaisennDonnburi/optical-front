"use client";

import { CalendarDays } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import React, { Suspense, useEffect, useMemo, useState } from "react";

import { Card, CardContent } from "@/components/atoms/Card";
import { Loading } from "@/components/atoms/Loading";
import { toast } from "@/components/atoms/Toast";
import { CalendarBoardHeader } from "@/components/molecules/CalendarBoardHeader";
import { ConfirmModal } from "@/components/molecules/ConfirmModal/ConfirmModal";
import { AccountMenu } from "@/components/organisms/AccountMenu/AccountMenu";
import {
  CreateScheduleDialog,
  GeneralScheduleBoard,
  type GeneralScheduleBoardItem,
  ScheduleEventDialog,
} from "@/components/organisms/GeneralScheduleBoard";
import { GeneralSearchHeader } from "@/components/organisms/SearchHeader/GeneralSearchHeader";
import { SelectCalendarStrip } from "@/components/organisms/SelectCalendarStrip";
import { TodaySchedulePanel } from "@/components/organisms/TodaySchedulePanel";
import { useAuth } from "@/hooks/useAuth";
import { useSchedule } from "@/hooks/useSchedule";
import { createSchedule } from "@/lib/api-schedule";
import { cn } from "@/utils_constants_styles/utils";

function HomeContent() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  // 認証チェック: 未認証の場合はランディングページにリダイレクト
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/landing");
    }
  }, [user, authLoading, router]);

  const { items, calendars, dateLabel, isLoading, error, refresh } =
    useSchedule();

  // URLパラメータでrefresh=trueが指定されている場合、データを再取得
  useEffect(() => {
    const shouldRefresh = searchParams.get("refresh") === "true";
    if (shouldRefresh) {
      refresh();
      // URLパラメータをクリア
      router.replace("/");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    searchParams,
    refresh, // URLパラメータをクリア
    router.replace,
  ]);

  const [viewDate, setViewDate] = useState(() => startOfDay(new Date()));
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCalendars, setSelectedCalendars] = useState<string[]>([]);
  const [isNavigating, setIsNavigating] = useState(false);

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

      const calendarId = item.calendarId ?? "";
      return calendarFilter.has(calendarId);
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
    return calendars.map((calendar) => ({
      label: calendar.name,
      value: calendar.id,
    }));
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

  // モーダル制御用の state
  const [isConfirmOpen, setIsConfirmOpen] = React.useState(false);
  const [pendingEmail, setPendingEmail] = React.useState<string | null>(null);
  const [confirmSaveTrigger, setConfirmSaveTrigger] = useState(0);

  // メール保存リクエストを受け取るハンドラ
  const handleRequestEmailSave = (newEmail: string) => {
    setPendingEmail(newEmail);
    setIsConfirmOpen(true);
  };

  // モーダルの「保存」ボタン押下時のハンドラ
  const handleConfirm = () => {
    // ここで実際の保存処理を実装
    console.log("保存:", pendingEmail);

    setConfirmSaveTrigger((prev) => prev + 1);
    setIsConfirmOpen(false);
    setPendingEmail(null);
  };

  // モーダルの「キャンセル」ボタン押下時のハンドラ
  const handleCancel = () => {
    setIsConfirmOpen(false);
    setPendingEmail(null);
  };

  // 年数の抽出
  const years = useMemo(() => {
    return Array.from(
      new Set(
        items
          .map((item) => {
            if (!item.startsAt) return null;
            const date = new Date(item.startsAt);
            if (Number.isNaN(date.getTime())) return null;
            return date.getFullYear();
          })
          .filter((year): year is number => year !== null),
      ),
    ).sort((a, b) => b - a);
  }, [items]);

  // 認証中またはリダイレクト中はローディング表示
  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-muted/10">
      <header className="border-b border-border bg-card/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center gap-2.5 px-4 py-2.5 lg:px-8">
          <GeneralSearchHeader
            searchValue={searchTerm}
            onSearchChange={(value) => setSearchTerm(value)}
            calendarOptions={calendarOptions}
            selectedCalendars={selectedCalendars}
            onCalendarChange={setSelectedCalendars}
            yearOptions={years}
          />

          {/* アカウントボタンの表示 */}
          <div className="ml-auto h-10 w-10">
            <AccountMenu
              user={user}
              isLoading={authLoading}
              error={null}
              onRequestEmailSave={handleRequestEmailSave}
              confirmSaveTrigger={confirmSaveTrigger}
            />
          </div>
        </div>
      </header>
      <main className="mx-auto grid w-full max-w-7xl flex-1 grid-cols-1 gap-3 overflow-hidden px-2 py-2 lg:grid-cols-[minmax(0,1fr)_clamp(24rem,32vw,32rem)] ">
        <BoardArea
          className="flex-1 min-h-0 lg:col-start-1"
          items={filteredItems}
          calendars={calendars}
          isLoading={isLoading}
          error={error}
          viewDate={viewDate}
          onChangeViewDate={handleViewDateChange}
          onRefresh={refresh}
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
      <SelectCalendarStrip
        calendars={calendars}
        onSelectCalendar={(cal) => {
          setIsNavigating(true);
          // 0.5秒待ってからナビゲーション
          setTimeout(() => {
            router.push(`/calendars/${cal.id}`);
          }, 500);
        }}
        onAddCalendar={() => {
          router.push("/calendars/new");
        }}
      />

      {/* 遷移時のローディングオーバーレイ */}
      {isNavigating && (
        <Loading
          variant="overlay"
          size="lg"
          message="カレンダーを読み込み中..."
        />
      )}

      {/* メールアドレス変更確認モーダル */}
      <ConfirmModal
        isOpen={isConfirmOpen}
        message={`メールアドレスを「${pendingEmail}」に変更しますか？`}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />

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
  calendars,
  isLoading,
  error,
  viewDate,
  onChangeViewDate,
  onRefresh,
}: {
  className?: string;
  items: ReturnType<typeof useSchedule>["items"];
  calendars: ReturnType<typeof useSchedule>["calendars"];
  isLoading: boolean;
  error: Error | null;
  viewDate: Date;
  onChangeViewDate: (nextDate: Date) => void;
  onRefresh: () => void;
}) {
  const [selectedItem, setSelectedItem] =
    useState<GeneralScheduleBoardItem | null>(null);
  const [createDate, setCreateDate] = useState<Date | null>(null);

  const boardItems = useMemo(() => {
    const viewYear = viewDate.getFullYear();
    const viewMonth = viewDate.getMonth();

    return items
      .map((item) => {
        if (!item.startsAt) {
          return null;
        }

        const originalStart = new Date(item.startsAt);
        if (Number.isNaN(originalStart.getTime())) {
          return null;
        }

        if (
          originalStart.getFullYear() !== viewYear ||
          originalStart.getMonth() !== viewMonth
        ) {
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

  const handleSelectItem = (item: GeneralScheduleBoardItem) => {
    setSelectedItem(item);
  };

  const handleCloseDialog = () => {
    setSelectedItem(null);
  };

  const handleCreateItem = (date: Date) => {
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
      });
      onRefresh();
    } catch (err) {
      toast.error("予定の作成に失敗しました");
      console.error("Failed to create schedule", err);
    } finally {
      handleCloseCreateDialog();
    }
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
          onCreateItem={handleCreateItem}
        />
      </CardContent>
      {selectedItem ? (
        <ScheduleEventDialog
          item={selectedItem}
          isOpen
          onClose={handleCloseDialog}
        />
      ) : null}
      {createDate ? (
        <CreateScheduleDialog
          date={createDate}
          isOpen
          onClose={handleCloseCreateDialog}
          calendars={calendars.map((c) => ({ id: c.id, name: c.name }))}
          onConfirm={handleConfirmCreate}
        />
      ) : null}
    </Card>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HomeContent />
    </Suspense>
  );
}

function startOfDay(date: Date) {
  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);
  return normalized;
}
