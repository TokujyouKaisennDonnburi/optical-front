"use client";

import { ArrowLeft, CalendarDays } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/atoms/Button";
import { Card, CardContent } from "@/components/atoms/Card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/atoms/Dialog";
import { Loading } from "@/components/atoms/Loading";
import { Text } from "@/components/atoms/Text";
import { CalendarBoardHeader } from "@/components/molecules/CalendarBoardHeader";
import { AccountMenu } from "@/components/organisms/AccountMenu/AccountMenu";
import { PullRequestReviewOption } from "@/components/organisms/EngineerOption/PullRequestReviewOption";
import { TeamReviewLoadOption } from "@/components/organisms/EngineerOption/TeamReviewLoadOption";
import { SingleSearchHeader } from "@/components/organisms/SearchHeader/SingleSearchHeader";
import {
  SingleCalendarBoard,
  type SingleCalendarBoardItem,
  SingleScheduleEventDialog,
} from "@/components/organisms/SingleCalendarBoard";
import { useAuth } from "@/hooks/useAuth";
import { useCalendarSchedule } from "@/hooks/useCalendarSchedule";
import { getGitHubReviewOptions } from "@/lib/api-github";
import type {
  ChangeReviewerRequest,
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

  const {
    calendar,
    items,
    isLoading,
    error,
    hasGitHubOptions,
    showPrReviewOption,
    showTeamReviewLoadOption,
  } = useCalendarSchedule(calendarId);

  // 検索機能
  const [searchTerm, setSearchTerm] = useState("");
  const [viewDate, setViewDate] = useState(() => startOfDay(new Date()));

  // OptiCal ダイアログの状態
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

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

  // GitHub オプションが有効でダイアログが開かれた場合のみデータを取得
  useEffect(() => {
    if (isPreviewOpen && hasGitHubOptions) {
      fetchGitHubReviewOptions();
    }
  }, [isPreviewOpen, hasGitHubOptions, fetchGitHubReviewOptions]);

  // 検索フィルタリング
  const filteredItems = useMemo(() => {
    const normalized = searchTerm.trim().toLowerCase();
    if (!normalized) return items;

    return items.filter((item) =>
      item.title.toLowerCase().includes(normalized),
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
              onClear={handleClear}
              onOptiCalClick={() => setIsPreviewOpen(true)}
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
      <main className="mx-auto w-full max-w-7xl flex-1 gap-3 overflow-hidden px-2 py-2 flex">
        {/* スケジュールボード（画面いっぱいに表示） */}
        <BoardArea
          className="min-h-0 flex-1 w-full"
          items={filteredItems}
          isLoading={isLoading}
          error={error}
          viewDate={viewDate}
          onChangeViewDate={handleViewDateChange}
          calendarName={calendar?.name}
          calendarColor={calendar?.color}
        />
      </main>

      {/* OptiCal ダイアログ */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="w-[80vw] h-[80vh] max-w-8xl overflow-auto">
          <DialogHeader>
            <DialogTitle>OptiCal - {calendar?.name}</DialogTitle>
            <DialogDescription>
              カレンダーに設定された GitHub オプションを表示します
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-row gap-6 p-4 w-full h-full">
            {/* GitHub オプション未選択時 */}
            {!hasGitHubOptions && (
              <div className="flex items-center justify-center w-full">
                <Text className="text-muted-foreground">
                  このカレンダーには GitHub オプションが設定されていません
                </Text>
              </div>
            )}

            {/* ローディング中 */}
            {hasGitHubOptions && isGitHubLoading && (
              <div className="flex items-center justify-center w-full">
                <Text className="text-muted-foreground">読み込み中...</Text>
              </div>
            )}

            {/* GitHub オプションが有効な場合のみ表示 */}
            {hasGitHubOptions && !isGitHubLoading && (
              <>
                {/* PRレビュー待ち件数オプション */}
                {showPrReviewOption && (
                  <div className="flex-1 min-w-0 overflow-auto">
                    <PullRequestReviewOption
                      pullRequests={pullRequests}
                      allPrsUrl={allPrsUrl}
                    />
                  </div>
                )}
                {/* チームレビュー負荷オプション */}
                {showTeamReviewLoadOption && (
                  <div className="flex-1 min-w-0 overflow-auto">
                    <TeamReviewLoadOption
                      members={teamMembers}
                      onReviewerChange={(payload: ChangeReviewerRequest) =>
                        console.log(
                          "Reviewer change requested:",
                          JSON.stringify(payload, null, 2),
                        )
                      }
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

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
  items,
  isLoading,
  error,
  viewDate,
  onChangeViewDate,
  calendarName,
  calendarColor,
}: {
  className?: string;
  items: ReturnType<typeof useCalendarSchedule>["items"];
  isLoading: boolean;
  error: Error | null;
  viewDate: Date;
  onChangeViewDate: (nextDate: Date) => void;
  calendarName?: string;
  calendarColor?: string;
}) {
  const [selectedItem, setSelectedItem] =
    useState<SingleCalendarBoardItem | null>(null);

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

  const handleSelectItem = (item: SingleCalendarBoardItem) => {
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
          emptyMessage="予定がありません。"
          className="flex h-full min-h-0 flex-col"
          baseDate={viewDate}
          onSelectItem={handleSelectItem}
        />
      </CardContent>
      {selectedItem ? (
        <SingleScheduleEventDialog
          item={selectedItem}
          isOpen
          onClose={handleCloseDialog}
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
