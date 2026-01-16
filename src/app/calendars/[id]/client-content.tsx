"use client";

import { ArrowLeft, CalendarDays, X } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/atoms/Button";
import { Card, CardContent, CardHeader } from "@/components/atoms/Card";
import { Loading } from "@/components/atoms/Loading";
import { Text } from "@/components/atoms/Text";
import { CalendarBoardHeader } from "@/components/molecules/CalendarBoardHeader";
import { CalendarSwitcher } from "@/components/molecules/CalendarSwitcher";
import { TodayScheduleHeader } from "@/components/molecules/TodayScheduleHeader";
import { AccountMenu } from "@/components/organisms/AccountMenu/AccountMenu";
import { AgentChatView } from "@/components/organisms/AgentChat";
import { SidePanelWrapper } from "@/components/organisms/AgentChat/SidePanelWrapper";
import MilestoneProgressOption from "@/components/organisms/EngineerOption/MilestoneProgressOption";
import { PullRequestReviewOption } from "@/components/organisms/EngineerOption/PullRequestReviewOption";
import { TeamReviewLoadOption } from "@/components/organisms/EngineerOption/TeamReviewLoadOption";
import { GitHubConnectView } from "@/components/organisms/GitHubConnectView";
import { RightSidebar } from "@/components/organisms/RightSidebar";
import { SingleSearchHeader } from "@/components/organisms/SearchHeader/SingleSearchHeader";
import {
  SingleCalendarBoard,
  type SingleCalendarBoardItem,
  SingleCreateScheduleDialog,
  SingleScheduleEventPopover,
} from "@/components/organisms/SingleCalendarBoard";
import { useAuth } from "@/hooks/useAuth";
import { useGeneralCalendar } from "@/hooks/useGeneralCalendar";
import { useSingleCalendarSchedule } from "@/hooks/useSingleCalendarSchedule";
import {
  connectGitHubAccount,
  getGitHubAccountLinked,
  getGitHubOrganizationLinked,
  getGitHubReviewOptions,
  startGitHubAppInstall,
} from "@/lib/api-github";
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

  // 検索機能とビュー日付（フックより前に定義）
  const [searchTerm, setSearchTerm] = useState("");
  const [viewDate, setViewDate] = useState(() => startOfDay(new Date()));

  const { calendar, items, isLoading, error, hasGitHubOptions, refresh } =
    useSingleCalendarSchedule(calendarId, viewDate);

  // 全カレンダー一覧を取得（カレンダー切り替え用）
  const { calendars: allCalendars, isLoading: calendarsLoading } =
    useGeneralCalendar();

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

  // GitHub 連携ステータス
  const [isAccountConnected, setIsAccountConnected] = useState<boolean | null>(
    null,
  );
  const [isOrganizationLinked, setIsOrganizationLinked] = useState<
    boolean | null
  >(null);
  const [isConnectionCheckLoading, setIsConnectionCheckLoading] =
    useState(false);

  // GitHub接続状態を確認（2段階）
  const checkGitHubConnectionStatus = useCallback(async () => {
    setIsConnectionCheckLoading(true);
    try {
      // Step 1: アカウント連携確認
      const accountStatus = await getGitHubAccountLinked();
      setIsAccountConnected(accountStatus.linked);

      if (!accountStatus.linked) {
        // アカウント未連携なら終了
        setIsOrganizationLinked(null);
        return;
      }

      // Step 2: 組織連携確認
      const orgStatus = await getGitHubOrganizationLinked(calendarId);
      setIsOrganizationLinked(orgStatus.linked);
    } catch (err) {
      console.error("Error checking GitHub connection status:", err);
      toast.error("GitHubの接続状態を確認できませんでした", { duration: 3000 });
      setIsAccountConnected(false);
      setIsOrganizationLinked(false);
    } finally {
      setIsConnectionCheckLoading(false);
    }
  }, [calendarId]);

  // アカウント連携ハンドラー
  const handleConnectAccount = useCallback(async () => {
    try {
      const { oauthUrl } = await connectGitHubAccount();
      // 本来はoauthUrlへリダイレクト、今回はモックなのでトースト表示
      toast.success("GitHubアカウント連携を開始します（モック）", {
        description: oauthUrl,
      });
      // モック: 連携成功をシミュレート
      setIsAccountConnected(true);
      // 次に組織連携チェック
      const orgStatus = await getGitHubOrganizationLinked(calendarId);
      setIsOrganizationLinked(orgStatus.linked);
    } catch (err) {
      console.error("Error connecting GitHub account:", err);
      toast.error("連携に失敗しました");
    }
  }, [calendarId]);

  // 組織連携ハンドラー（GitHub App インストールフロー）
  const handleLinkOrganization = useCallback(async () => {
    try {
      const { installUrl } = await startGitHubAppInstall(calendarId);
      // GitHub App インストールページへリダイレクト
      window.location.href = installUrl;
    } catch (err) {
      console.error("Error starting GitHub App install:", err);
      toast.error("連携の開始に失敗しました");
    }
  }, [calendarId]);

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
      toast.error("GitHubデータの取得に失敗しました", { duration: 3000 });
    } finally {
      setIsGitHubLoading(false);
    }
  }, []);

  // GitHub オプションが有効で、関連するサイドバーアイテムが選択された場合
  useEffect(() => {
    if (
      hasGitHubOptions &&
      (selectedSidebarItem === "pr-review" ||
        selectedSidebarItem === "team-load" ||
        selectedSidebarItem === "milestone")
    ) {
      // まず接続状態を確認
      if (isAccountConnected === null) {
        checkGitHubConnectionStatus();
      } else if (isAccountConnected && isOrganizationLinked) {
        // 両方連携済みならデータ取得
        fetchGitHubReviewOptions();
      }
    }
  }, [
    selectedSidebarItem,
    hasGitHubOptions,
    isAccountConnected,
    isOrganizationLinked,
    checkGitHubConnectionStatus,
    fetchGitHubReviewOptions,
  ]);

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
          {/* 戻るボタン - 最左 */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBack}
            aria-label="戻る"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>

          {/* OptiCal ロゴ */}
          <div className="flex items-center shrink-0">
            <Image src="/optical.png" alt="OptiCal" width={36} height={36} />
          </div>

          {/* カレンダー切り替え */}
          <CalendarSwitcher
            currentCalendarId={calendarId}
            currentCalendarName={calendar?.name}
            currentCalendarColor={calendar?.color}
            calendars={allCalendars.map((c) => ({
              id: c.id,
              name: c.name,
              color: c.color,
            }))}
            onSelect={(id) => router.push(`/calendars/${id}`)}
            isLoading={calendarsLoading}
          />

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
                  {isConnectionCheckLoading || isGitHubLoading ? (
                    <div className="flex items-center justify-center h-full">
                      <Text className="text-muted-foreground">
                        読み込み中...
                      </Text>
                    </div>
                  ) : !isAccountConnected ? (
                    <GitHubConnectView
                      step="account"
                      onConnect={handleConnectAccount}
                    />
                  ) : !isOrganizationLinked ? (
                    <GitHubConnectView
                      step="organization"
                      onConnect={handleLinkOrganization}
                    />
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
                  {isConnectionCheckLoading || isGitHubLoading ? (
                    <div className="flex items-center justify-center h-full">
                      <Text className="text-muted-foreground">
                        読み込み中...
                      </Text>
                    </div>
                  ) : !isAccountConnected ? (
                    <GitHubConnectView
                      step="account"
                      onConnect={handleConnectAccount}
                    />
                  ) : !isOrganizationLinked ? (
                    <GitHubConnectView
                      step="organization"
                      onConnect={handleLinkOrganization}
                    />
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
                  {isConnectionCheckLoading || isGitHubLoading ? (
                    <div className="flex items-center justify-center h-full">
                      <Text className="text-muted-foreground">
                        読み込み中...
                      </Text>
                    </div>
                  ) : !isAccountConnected ? (
                    <GitHubConnectView
                      step="account"
                      onConnect={handleConnectAccount}
                    />
                  ) : !isOrganizationLinked ? (
                    <GitHubConnectView
                      step="organization"
                      onConnect={handleLinkOrganization}
                    />
                  ) : (
                    <MilestoneProgressOption calendarId={calendarId} />
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
          installedOptions={calendar?.options}
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
        duration: 2000,
      });
      onScheduleCreated?.();
    } catch (err) {
      console.error("Failed to create schedule:", err);
      toast.error("予定の追加に失敗しました", { duration: 2000 });
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
