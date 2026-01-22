"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Sparkles, X } from "lucide-react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import React, {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Button } from "@/components/atoms/Button";
import { Card, CardContent, CardHeader } from "@/components/atoms/Card";
import { ConfirmModal } from "@/components/molecules/ConfirmModal/ConfirmModal";
import { InitialLoading } from "@/components/molecules/InitialLoading/InitialLoading";
import { TodayScheduleHeader } from "@/components/molecules/TodayScheduleHeader";
import { AccountMenu } from "@/components/organisms/AccountMenu/AccountMenu";
import { AgentChatView } from "@/components/organisms/AgentChat";
import { HomeBoardArea } from "@/components/organisms/HomeBoardArea";
import { GeneralSearchHeader } from "@/components/organisms/SearchHeader/GeneralSearchHeader";
import { SelectCalendarStrip } from "@/components/organisms/SelectCalendarStrip";
import { TodaySchedulePanel } from "@/components/organisms/TodaySchedulePanel";
import { useAuth } from "@/hooks/useAuth";
import { useGeneralCalendar } from "@/hooks/useGeneralCalendar";

function HomeContent() {
  const { user, isLoading: authLoading, isLoggingOut } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  // 認証チェック: 未認証の場合はランディングページにリダイレクト
  useEffect(() => {
    if (!authLoading && !user) {
      console.log(authLoading);
      console.log(user);
      router.push("/landing");
    }
  }, [user, authLoading, router]);

  const [viewDate, setViewDate] = useState(() => startOfDay(new Date()));

  // カレンダーグリッド用のスケジュール（viewDateに基づく）
  const { items, calendars, isLoading, error, refresh, deleteCalendar } =
    useGeneralCalendar(viewDate);
  // 今日の予定パネル用のスケジュール（常に今日の月）
  const {
    items: todayMonthItems,
    dateLabel,
    isLoading: isTodayLoading,
    refresh: refreshToday,
  } = useGeneralCalendar();

  // 両方のスケジュールを更新するための統合refresh関数
  const handleRefreshAll = useCallback(() => {
    refresh();
    refreshToday();
  }, [refresh, refreshToday]);

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

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCalendars, setSelectedCalendars] = useState<string[]>([]);
  const [isAgentOpen, setIsAgentOpen] = useState(false);

  const filteredItems = useMemo(() => {
    const normalized = searchTerm.trim().toLowerCase();
    const calendarFilter = new Set(selectedCalendars);

    return items.filter((item) => {
      // 検索対象: タイトル、場所、メモ
      const matchesSearch =
        !normalized ||
        item.title.toLowerCase().includes(normalized) ||
        item.location?.toLowerCase().includes(normalized) ||
        item.memo?.toLowerCase().includes(normalized);

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

    // 今日用のスケジュールからフィルタリング（カレンダーグリッドの月移動に影響されない）
    return todayMonthItems.filter((item) => {
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
  }, [todayMonthItems]);

  const calendarOptions = useMemo(() => {
    return calendars.map((calendar) => ({
      label: calendar.name,
      value: calendar.id,
      color: calendar.color,
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

  // メール保存モーダル制御
  const [isEmailConfirmOpen, setIsEmailConfirmOpen] = React.useState(false);
  const [pendingEmail, setPendingEmail] = React.useState<string | null>(null);
  const [confirmSaveTrigger, setConfirmSaveTrigger] = useState(0);

  // カレンダー削除モーダル制御
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [deletingCalendarId, setDeletingCalendarId] = useState<string | null>(
    null,
  );

  // メール保存リクエストを受け取るハンドラ
  const handleRequestEmailSave = (newEmail: string) => {
    setPendingEmail(newEmail);
    setIsEmailConfirmOpen(true);
  };

  const handleConfirmEmailSave = () => {
    console.log("保存:", pendingEmail);
    setConfirmSaveTrigger((prev) => prev + 1);
    setIsEmailConfirmOpen(false);
    setPendingEmail(null);
  };

  const handleCancelEmailSave = () => {
    setIsEmailConfirmOpen(false);
    setPendingEmail(null);
  };

  const handleDeleteCalendar = (calendarId: string) => {
    setDeletingCalendarId(calendarId);
    setIsDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (deletingCalendarId) {
      await deleteCalendar(deletingCalendarId);
      setDeletingCalendarId(null);
    }
    setIsDeleteConfirmOpen(false);
  };

  const handleCancelDelete = () => {
    setDeletingCalendarId(null);
    setIsDeleteConfirmOpen(false);
  };

  // 認証中またはリダイレクト中はローディング表示
  if (authLoading || !user) {
    // ログアウト中の場合
    if (isLoggingOut) {
      return <InitialLoading message="ログアウト中..." />;
    }

    // その他のローディング/リダイレクト待機中
    return <InitialLoading />;
  }

  const deletingCalendarName =
    calendars.find((c) => c.id === deletingCalendarId)?.name ?? "";

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-muted/10">
      <header className="border-b border-border bg-card/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center gap-2.5 px-4 py-2.5 lg:px-8">
          {/* OptiCal ロゴ - 常に最左 */}
          <div className="flex items-center shrink-0">
            <Image src="/optical.png" alt="OptiCal" width={36} height={36} />
          </div>
          <GeneralSearchHeader
            searchValue={searchTerm}
            onSearchChange={(value) => setSearchTerm(value)}
            calendarOptions={calendarOptions}
            selectedCalendars={selectedCalendars}
            onCalendarChange={setSelectedCalendars}
            date={viewDate}
            onDateChange={(value) => {
              if (value) {
                // 入力した年に移動
                setViewDate(startOfDay(value));
              }
            }}
            onClear={() => {
              // クリア時に今日の年月に戻す！
              setViewDate(startOfDay(new Date()));
            }}
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
      <div className="flex flex-1 overflow-hidden">
        <main className="flex-1 flex justify-center min-w-0">
          <div className="mx-auto grid w-full max-w-7xl flex-1 grid-cols-1 gap-3 overflow-hidden px-2 py-2 lg:grid-cols-[minmax(0,1fr)_clamp(24rem,32vw,32rem)]">
            <HomeBoardArea
              className="flex-1 min-h-0 lg:col-start-1"
              items={filteredItems}
              calendars={calendars}
              isLoading={isLoading}
              error={error}
              viewDate={viewDate}
              onChangeViewDate={handleViewDateChange}
              onRefresh={handleRefreshAll}
            />
            <div className="flex h-full w-full min-h-0 lg:col-start-2 lg:w-full lg:max-w-[32rem]">
              <div className="relative h-full w-full overflow-hidden">
                <AnimatePresence mode="wait" initial={false}>
                  {isAgentOpen ? (
                    <motion.div
                      key="agent"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.2 }}
                      className="absolute inset-0 h-full w-full"
                    >
                      <Card className="flex h-full w-full min-h-0 flex-col overflow-hidden shadow-xl">
                        <CardHeader className="border-b border-border px-4 py-3 bg-muted/30">
                          <TodayScheduleHeader
                            title="OptiCal Agent"
                            actions={
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-muted-foreground hover:text-foreground hover:bg-muted"
                                onClick={() => setIsAgentOpen(false)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            }
                          />
                        </CardHeader>
                        <CardContent className="flex flex-1 flex-col overflow-hidden px-0 py-0">
                          <AgentChatView
                            calendars={calendars.map((c) => ({
                              id: c.id,
                              name: c.name,
                              color: c.color,
                            }))}
                          />
                        </CardContent>
                      </Card>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="schedule"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.2 }}
                      className="absolute inset-0 h-full w-full"
                    >
                      <TodaySchedulePanel
                        header={{
                          ...boardHeader,
                          actions: (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-muted-foreground hover:text-foreground hover:bg-muted"
                              onClick={() => setIsAgentOpen(true)}
                              title="AI Agent"
                            >
                              <Sparkles className="h-4 w-4" />
                            </Button>
                          ),
                        }}
                        items={todayItems}
                        isLoading={isTodayLoading}
                        emptyMessage={
                          error
                            ? "予定を取得できませんでした"
                            : "今日の予定はありません。"
                        }
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </main>
      </div>
      {/* カレンダー選択ストリップ - next/link使用で自動プリフェッチ */}
      <SelectCalendarStrip
        calendars={calendars}
        onAddCalendar={() => {
          router.push("/calendars/new");
        }}
        onDeleteCalendar={handleDeleteCalendar}
      />

      {/* メールアドレス変更確認モーダル */}
      <ConfirmModal
        isOpen={isEmailConfirmOpen}
        message={`メールアドレスを「${pendingEmail}」に変更しますか？`}
        onConfirm={handleConfirmEmailSave}
        onCancel={handleCancelEmailSave}
      />

      {/* カレンダー削除確認モーダル */}
      <ConfirmModal
        isOpen={isDeleteConfirmOpen}
        title="カレンダーの削除"
        message={`カレンダー「${deletingCalendarName}」を本当に削除しますか？`}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        saveButtonText="削除"
        variant="destructive"
        confirmationText={deletingCalendarName}
      />
    </div>
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
