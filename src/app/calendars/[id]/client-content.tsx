"use client";

import { ArrowLeft, CalendarDays, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/atoms/Button";
import { Card, CardContent, CardHeader } from "@/components/atoms/Card";
import { Loading } from "@/components/atoms/Loading";
import { Text } from "@/components/atoms/Text";
import { CalendarBoardHeader } from "@/components/molecules/CalendarBoardHeader";
import { TodayScheduleHeader } from "@/components/molecules/TodayScheduleHeader";
import { AccountMenu } from "@/components/organisms/AccountMenu/AccountMenu";
import { AgentChatView } from "@/components/organisms/AgentChat";
import { SidePanelWrapper } from "@/components/organisms/AgentChat/SidePanelWrapper";
import MilestoneProgressOption from "@/components/organisms/EngineerOption/MilestoneProgressOption";
import { PullRequestReviewOption } from "@/components/organisms/EngineerOption/PullRequestReviewOption";
import { TeamReviewLoadOption } from "@/components/organisms/EngineerOption/TeamReviewLoadOption";
import { RightSidebar } from "@/components/organisms/RightSidebar";
import { SingleSearchHeader } from "@/components/organisms/SearchHeader/SingleSearchHeader";
import {
  SingleCalendarBoard,
  type SingleCalendarBoardItem,
  SingleCreateScheduleDialog,
  SingleScheduleEventPopover,
} from "@/components/organisms/SingleCalendarBoard";
import { useAuth } from "@/hooks/useAuth";
import { useSingleCalendarSchedule } from "@/hooks/useSingleCalendarSchedule";
import { getGitHubReviewOptions } from "@/lib/api-github";
import { createSchedule } from "@/lib/api-schedule";
import type {
  GitHubPullRequest,
  GitHubReviewOptionsResponse,
  TeamMemberReviewLoad,
} from "@/types/github";
import { cn } from "@/utils_constants_styles/utils";

interface CalendarDetailClientProps {
  calendarId: string;
}

export function CalendarDetailClient({
  calendarId,
}: CalendarDetailClientProps) {
  const router = useRouter();

  const { user, isLoading: authLoading } = useAuth();

  // 認証チェック
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/landing");
    }
  }, [user, authLoading, router]);

  const { calendar, items, isLoading, error, hasGitHubOptions, refresh } =
    useSingleCalendarSchedule(calendarId);

  // 検索機能
  const [searchTerm, setSearchTerm] = useState("");
  const [viewDate, setViewDate] = useState(() => startOfDay(new Date()));

  // サイドバーの選択状態
  const [selectedSidebarItem, setSelectedSidebarItem] = useState<string | null>(
    null,
  );

  const handleSidebarSelect = (id: string) => {
    // 既に選択されているものをクリックしたら閉じる
    if (selectedSidebarItem === id) {
      setSelectedSidebarItem(null);
    } else {
      setSelectedSidebarItem(id);
    }
  };

  // ナビゲーション中のローディング状態
  const [isNavigating, setIsNavigating] = useState(false);

  // GitHub レビューオプションの状態
  const [pullRequests, setPullRequests] = useState<GitHubPullRequest[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMemberReviewLoad[]>([]);
  const [allPrsUrl, setAllPrsUrl] = useState<string>("");
  const [isGitHubLoading, setIsGitHubLoading] = useState(false);

  // GitHub レビューオプションを取得
  const fetchGitHubReviewOptions = useCallback(async () => {
    setIsGitHubLoading(true);
    try {
      const data: GitHubReviewOptionsResponse = await getGitHubReviewOptions();
      setPullRequests(data.myPendingReviews);
      setTeamMembers(data.teamReviewLoads);
      setAllPrsUrl(data.allPullRequestsUrl);
    } catch (err) {
      console.error("Error fetching GitHub review options:", err);
    } finally {
      setIsGitHubLoading(false);
    }
  }, []);

  // GitHub オプションが有効で、関連するサイドバーアイテムが選択された場合のみデータを取得
  useEffect(() => {
    if (
      hasGitHubOptions &&
      (selectedSidebarItem === "pr-review" ||
        selectedSidebarItem === "team-load" ||
        selectedSidebarItem === "milestone")
    ) {
      fetchGitHubReviewOptions();
    }
  }, [selectedSidebarItem, hasGitHubOptions, fetchGitHubReviewOptions]);

  // 検索フィルタリング
  const filteredItems = useMemo(() => {
    const normalized = searchTerm.trim().toLowerCase();
    if (!normalized) return items;

    // 検索対象: タイトル、場所、メモ
    return items.filter(
      (item) =>
        item.title.toLowerCase().includes(normalized) ||
        item.location?.toLowerCase().includes(normalized) ||
        item.memo?.toLowerCase().includes(normalized),
    );
  }, [items, searchTerm]);

  const handleViewDateChange = (next: Date) => {
    setViewDate(startOfDay(next));
  };

  const handleBack = () => {
    setIsNavigating(true);
    // 0.4秒待ってからナビゲーション
    setTimeout(() => {
      router.push("/");
    }, 400);
  };

  const handleClear = () => {
    setSearchTerm("");
    const today = startOfDay(new Date());
    setViewDate(today);
  };

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
      {/* ヘッダー */}
      <header className="border-b border-border bg-card/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center gap-2.5 px-4 py-2.5 lg:px-8">
          {/* 戻るボタン */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBack}
            aria-label="戻る"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>

          {/* カレンダー名 */}
          <div className="flex items-center gap-2">
            {calendar?.color && (
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: calendar.color }}
              />
            )}
            <Text size="lg" weight="semibold">
              {calendar?.name ?? "読み込み中..."}
            </Text>
          </div>

          {/* 検索バー */}
          <div className="flex gap-2 items-center ml-4 flex-1">
            <SingleSearchHeader
              searchValue={searchTerm}
              onSearchChange={setSearchTerm}
              date={viewDate}
              onDateChange={(value) => {
                if (value) {
                  // 入力した年に移動
                  setViewDate(startOfDay(value));
                }
              }}
              onClear={handleClear}
            />

            {/* アカウントメニュー */}
            <div className="h-10 w-10">
              <AccountMenu
                user={user}
                isLoading={authLoading}
                error={null}
                onRequestEmailSave={() => {}}
              />
            </div>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <div className="flex flex-1 overflow-hidden">
        <main className="flex-1 flex justify-center min-w-0">
          <div className="w-full max-w-7xl gap-3 px-2 py-2 flex">
            {/* スケジュールボード（画面いっぱいに表示） */}
            <BoardArea
              className="min-h-0 flex-1 transition-all duration-300 ease-in-out"
              calendarId={calendarId}
              items={filteredItems}
              isLoading={isLoading}
              error={error}
              viewDate={viewDate}
              onChangeViewDate={handleViewDateChange}
              calendarName={calendar?.name}
              calendarColor={calendar?.color}
              onScheduleCreated={refresh}
            />
          </div>
        </main>

        {/* Side Panel Area - Now full height */}
        <SidePanelWrapper isOpen={!!selectedSidebarItem}>
          <Card className="flex h-full w-full min-h-0 flex-col overflow-hidden border-0 bg-background/50 backdrop-blur-sm rounded-none border-l border-border">
            {selectedSidebarItem === "agent" && (
              <>
                <CardHeader className="border-b border-border px-4 py-3 bg-muted/30">
                  <TodayScheduleHeader
                    title="OptiCal Agent"
                    actions={
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-foreground hover:bg-muted"
                        onClick={() => setSelectedSidebarItem(null)}
                        aria-label="パネルを閉じる"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    }
                  />
                </CardHeader>
                <CardContent className="flex flex-1 flex-col overflow-hidden px-0 py-0">
                  <AgentChatView />
                </CardContent>
              </>
            )}

            {selectedSidebarItem === "pr-review" && (
              <>
                <CardHeader className="border-b border-border px-4 py-3 bg-muted/30">
                  <div className="flex items-center justify-between">
                    <Text size="lg" weight="semibold">
                      PR Review
                    </Text>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setSelectedSidebarItem(null)}
                      aria-label="PR Reviewパネルを閉じる"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 overflow-auto p-4">
                  {isGitHubLoading ? (
                    <div className="flex items-center justify-center h-full">
                      <Text className="text-muted-foreground">
                        読み込み中...
                      </Text>
                    </div>
                  ) : (
                    <PullRequestReviewOption
                      pullRequests={pullRequests}
                      allPrsUrl={allPrsUrl}
                    />
                  )}
                </CardContent>
              </>
            )}

            {selectedSidebarItem === "team-load" && (
              <>
                <CardHeader className="border-b border-border px-4 py-3 bg-muted/30">
                  <div className="flex items-center justify-between">
                    <Text size="lg" weight="semibold">
                      Team Load
                    </Text>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setSelectedSidebarItem(null)}
                      aria-label="Team Loadパネルを閉じる"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 overflow-auto p-4">
                  {isGitHubLoading ? (
                    <div className="flex items-center justify-center h-full">
                      <Text className="text-muted-foreground">
                        読み込み中...
                      </Text>
                    </div>
                  ) : (
                    <TeamReviewLoadOption
                      members={teamMembers}
                      onReviewerChange={(payload) => console.log(payload)}
                    />
                  )}
                </CardContent>
              </>
            )}

            {selectedSidebarItem === "milestone" && (
              <>
                <CardHeader className="border-b border-border px-4 py-3 bg-muted/30">
                  <div className="flex items-center justify-between">
                    <Text size="lg" weight="semibold">
                      Milestone
                    </Text>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setSelectedSidebarItem(null)}
                      aria-label="Milestoneパネルを閉じる"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 overflow-auto p-4">
                  {isGitHubLoading ? (
                    <div className="flex items-center justify-center h-full">
                      <Text className="text-muted-foreground">
                        読み込み中...
                      </Text>
                    </div>
                  ) : (
                    <MilestoneProgressOption />
                  )}
                </CardContent>
              </>
            )}

            {selectedSidebarItem === "add-option" && (
              <>
                <CardHeader className="border-b border-border px-4 py-3 bg-muted/30">
                  <div className="flex items-center justify-between">
                    <Text size="lg" weight="semibold">
                      Add Option
                    </Text>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setSelectedSidebarItem(null)}
                      aria-label="Add Optionパネルを閉じる"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 overflow-auto p-4 flex items-center justify-center">
                  <Text className="text-muted-foreground">
                    Option Store coming soon...
                  </Text>
                </CardContent>
              </>
            )}
          </Card>
        </SidePanelWrapper>

        {/* Right Sidebar */}
        <RightSidebar
          selectedId={selectedSidebarItem}
          onSelect={handleSidebarSelect}
        />
      </div>

      {/* 遷移時のローディングオーバーレイ */}
      {isNavigating && (
        <Loading
          variant="overlay"
          size="lg"
          message="総合スケジュールを読み込み中..."
        />
      )}
    </div>
  );
}

function BoardArea({
  className,
  calendarId,
  items,
  isLoading,
  error,
  viewDate,
  onChangeViewDate,
  calendarName,
  calendarColor,
  onScheduleCreated,
}: {
  className?: string;
  calendarId: string;
  items: ReturnType<typeof useSingleCalendarSchedule>["items"];
  isLoading: boolean;
  error: Error | null;
  viewDate: Date;
  onChangeViewDate: (nextDate: Date) => void;
  calendarName?: string;
  calendarColor?: string;
  onScheduleCreated?: () => void;
}) {
  const [selectedItem, setSelectedItem] = useState<{
    item: SingleCalendarBoardItem;
    position: { x: number; y: number };
  } | null>(null);
  const [createDialogDate, setCreateDialogDate] = useState<Date | null>(null);

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
          calendarName: item.calendarName ?? calendarName ?? "",
          calendarColor: item.calendarColor ?? calendarColor,
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
  }, [items, viewDate, calendarName, calendarColor]);

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
    item: SingleCalendarBoardItem,
    position: { x: number; y: number },
  ) => {
    setSelectedItem({ item, position });
  };

  const handleCloseDialog = () => {
    setSelectedItem(null);
  };

  const handleCreateItem = (date: Date) => {
    setCreateDialogDate(date);
  };

  const handleCloseCreateDialog = () => {
    setCreateDialogDate(null);
  };

  const handleCreateConfirm = async (payload: {
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
    const startDate = new Date(payload.date);
    let endIso = "";
    let startIso = "";

    if (payload.isAllDay) {
      // 終日イベント: 日付のみを使用
      const allDayStart = new Date(payload.allDayStartDate);
      allDayStart.setHours(0, 0, 0, 0);
      startIso = allDayStart.toISOString();

      const allDayEnd = new Date(payload.allDayEndDate);
      allDayEnd.setHours(23, 59, 59, 999);
      endIso = allDayEnd.toISOString();
    } else {
      // 時刻イベント
      const [startHour, startMinute] = payload.startTime.split(":").map(Number);
      startDate.setHours(startHour ?? 0, startMinute ?? 0, 0, 0);
      startIso = startDate.toISOString();

      if (payload.endTime) {
        const endDate = new Date(payload.date);
        const [endHour, endMinute] = payload.endTime.split(":").map(Number);
        endDate.setHours(endHour ?? 0, endMinute ?? 0, 0, 0);
        endIso = endDate.toISOString();
      }
    }

    try {
      await createSchedule(calendarId, {
        title: payload.title,
        startTime: startIso,
        endTime: endIso,
        memo: payload.memo,
        location: payload.location,
        isAllDay: payload.isAllDay,
      });
      toast.success("予定を追加しました", {
        description: payload.title,
      });
      onScheduleCreated?.();
    } catch (err) {
      console.error("Failed to create schedule:", err);
      toast.error("予定の追加に失敗しました");
    }
  };

  return (
    <Card
      className={cn(
        "flex min-h-0 flex-1 flex-col gap-2 border p-3",
        // ライトモード: 温かみのあるストーン系
        "border-stone-300 bg-stone-100/90 text-stone-800",
        // ダークモード
        "dark:border-primary/30 dark:bg-slate-800/90 dark:text-white",
        className,
      )}
    >
      <CalendarBoardHeader
        badgeLabel={calendarName ?? "カレンダー"}
        badgeIcon={CalendarDays}
        monthLabel={monthLabel}
        onPrev={() => handleShiftMonth(-1)}
        onNext={() => handleShiftMonth(1)}
        onToday={handleResetToday}
      />
      <CardContent className="flex min-h-0 flex-1 flex-col overflow-hidden p-0">
        <SingleCalendarBoard
          calendarName={calendarName ?? "カレンダー"}
          calendarColor={calendarColor}
          items={boardItems}
          isLoading={isLoading}
          errorMessage={error ? "予定を取得できませんでした" : undefined}
          className="flex h-full min-h-0 flex-col"
          baseDate={viewDate}
          onSelectItem={handleSelectItem}
          onCreateItem={handleCreateItem}
        />
      </CardContent>
      {selectedItem ? (
        <SingleScheduleEventPopover
          item={selectedItem.item}
          isOpen
          onClose={handleCloseDialog}
          anchorPosition={selectedItem.position}
        />
      ) : null}
      {createDialogDate ? (
        <SingleCreateScheduleDialog
          date={createDialogDate}
          isOpen
          onClose={handleCloseCreateDialog}
          calendarId={calendarId}
          calendarName={calendarName}
          calendarColor={calendarColor}
          onConfirm={handleCreateConfirm}
        />
      ) : null}
    </Card>
  );
}

function startOfDay(date: Date) {
  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);
  return normalized;
}
