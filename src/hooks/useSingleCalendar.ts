"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { DailyPanelItem } from "@/components/organisms/DailyPanel";
import { getCalendarDetail } from "@/lib/api-calendars";
import { getMonthSchedule } from "@/lib/api-schedule";
import type { CalendarDetail, ScheduleItem } from "@/types/schedule";

/**
 * 単体カレンダーのスケジュールとオプションを取得するフック
 */
export function useSingleCalendar(calendarId: string, viewDate?: Date) {
  const [calendar, setCalendar] = useState<CalendarDetail | null>(null);
  const [scheduleItems, setScheduleItems] = useState<ScheduleItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const refresh = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  // viewDateから月のパラメータを生成
  const getMonthParam = useCallback(
    (date: Date) =>
      `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`,
    [],
  );

  const currentMonthParam = viewDate ? getMonthParam(viewDate) : undefined;

  // 前後の月のパラメータも計算（グリッドの前月・来月表示分のため）
  const prevMonthParam = useMemo(() => {
    if (!viewDate) return undefined;
    const prev = new Date(viewDate);
    prev.setMonth(prev.getMonth() - 1);
    return getMonthParam(prev);
  }, [viewDate, getMonthParam]);

  const nextMonthParam = useMemo(() => {
    if (!viewDate) return undefined;
    const next = new Date(viewDate);
    next.setMonth(next.getMonth() + 1);
    return getMonthParam(next);
  }, [viewDate, getMonthParam]);

  // カレンダー詳細と options を取得
  useEffect(() => {
    let isMounted = true;

    const fetchCalendarDetail = async () => {
      if (!calendarId) return;

      try {
        const json = await getCalendarDetail(calendarId);
        if (isMounted) {
          setCalendar(json.calendar as CalendarDetail);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err : new Error("Unknown error"));
        }
      }
    };

    void fetchCalendarDetail();

    return () => {
      isMounted = false;
    };
  }, [calendarId]);

  // スケジュールを取得してカレンダーIDでフィルタリング
  // 3ヶ月分（先月・当月・来月）取得して結合する
  // リフレッシュトリガーを依存配列に含めるために使用
  // biome-ignore lint/correctness/useExhaustiveDependencies: refreshTrigger is used to force re-fetch
  useEffect(() => {
    let isMounted = true;

    const fetchSchedule = async () => {
      if (!calendarId) return;

      setIsLoading(true);
      setError(null);

      try {
        const params = [prevMonthParam, currentMonthParam, nextMonthParam];
        // undefinedが含まれている場合は単体呼び出し（初期状態など）を想定するが、
        // viewDateがある場合は全て存在するはず。
        // API呼び出しを並列化
        const results = await Promise.all(
          params.map((param) => getMonthSchedule(param)),
        );

        if (isMounted) {
          // 全ての結果からアイテムを結合し、重複を除去しつつカレンダーIDでフィルタリング
          const allItems: ScheduleItem[] = [];
          const addedIds = new Set<string>();

          for (const res of results) {
            const items = res.items ?? [];
            for (const item of items) {
              if (item.calendarId === calendarId && !addedIds.has(item.id)) {
                allItems.push(item);
                addedIds.add(item.id);
              }
            }
          }

          setScheduleItems(allItems);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err : new Error("Unknown error"));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void fetchSchedule();

    return () => {
      isMounted = false;
    };
  }, [
    calendarId,
    refreshTrigger,
    currentMonthParam,
    prevMonthParam,
    nextMonthParam,
  ]);

  // 直近の予定パネル用（DailyPanelItem）形式に変換
  const items: DailyPanelItem[] = useMemo(() => {
    return scheduleItems.map((item) => ({
      id: item.id,
      title: item.title,
      timeRange: {
        start: formatTimeLabel(item.startAt),
        end: item.endAt ? formatTimeLabel(item.endAt) : undefined,
      },
      startsAt: item.startAt,
      endsAt: item.endAt,
      calendarId: item.calendarId,
      memo: item.memo,
      location: item.location,
      members: item.members,
      calendarName: item.calendarName,
      calendarColor: item.calendarColor,
    }));
  }, [scheduleItems]);

  // 今日の日付ラベル（フック呼び出し時に現在の日付を取得）
  const dateLabel = new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
  }).format(new Date());

  // GitHub オプションの有無を判定
  const hasGitHubOptions = useMemo(() => {
    if (!calendar?.options) return false;
    return (
      calendar.options.includes("pull_request_review_wait_count") ||
      calendar.options.includes("team_review_load") ||
      calendar.options.includes("milestone_progress")
    );
  }, [calendar]);

  const showPrReviewOption = useMemo(() => {
    return (
      calendar?.options?.includes("pull_request_review_wait_count") ?? false
    );
  }, [calendar]);

  const showTeamReviewLoadOption = useMemo(() => {
    return calendar?.options?.includes("team_review_load") ?? false;
  }, [calendar]);

  const showMilestoneProgressOption = useMemo(() => {
    return calendar?.options?.includes("milestone_progress") ?? false;
  }, [calendar]);

  return {
    calendar,
    items,
    dateLabel,
    isLoading,
    error,
    refresh,
    hasGitHubOptions,
    showPrReviewOption,
    showTeamReviewLoadOption,
    showMilestoneProgressOption,
  };
}

function formatTimeLabel(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  const hours = date.getHours();
  const minutes = date.getMinutes();
  return `${hours}:${minutes.toString().padStart(2, "0")}`;
}
