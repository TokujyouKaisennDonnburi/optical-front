"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { TodaySchedulePanelItem } from "@/components/organisms/TodaySchedulePanel";
import { getCalendarDetail } from "@/lib/api-calendars";
import { getMonthSchedule } from "@/lib/api-schedule";
import type { CalendarDetail, ScheduleItem } from "@/types/schedule";

// 今日の日付ラベル（フック外で定義 - 毎回同じ値のためメモ化不要）
const TODAY_DATE_LABEL = new Intl.DateTimeFormat("ja-JP", {
  year: "numeric",
  month: "long",
  day: "numeric",
  weekday: "short",
}).format(new Date());

/**
 * 単体カレンダーのスケジュールとオプションを取得するフック
 */
export function useCalendarSchedule(calendarId: string) {
  const [calendar, setCalendar] = useState<CalendarDetail | null>(null);
  const [scheduleItems, setScheduleItems] = useState<ScheduleItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const refresh = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  // カレンダー詳細と customOptions を取得
  useEffect(() => {
    let isMounted = true;

    const fetchCalendarDetail = async () => {
      if (!calendarId) return;

      try {
        const json = await getCalendarDetail(calendarId);
        if (isMounted) {
          setCalendar(json.calendar);
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
  // biome-ignore lint/correctness/useExhaustiveDependencies: refreshTriggerの変更で再取得をトリガーする
  useEffect(() => {
    let isMounted = true;

    const fetchSchedule = async () => {
      if (!calendarId) return;

      setIsLoading(true);
      setError(null);

      try {
        const json = await getMonthSchedule();

        if (isMounted) {
          // このカレンダーのスケジュールのみをフィルタリング
          const filteredItems = (json.items ?? []).filter(
            (item: ScheduleItem) => item.calendarId === calendarId,
          );

          setScheduleItems(filteredItems);
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
  }, [calendarId, refreshTrigger]);

  // TodaySchedulePanelItem 形式に変換
  const items: TodaySchedulePanelItem[] = useMemo(() => {
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

  // 今日の日付ラベル（定数として定義済み）
  const dateLabel = TODAY_DATE_LABEL;

  // GitHub オプションの有無を判定（単純なincludes()なのでメモ化不要）
  const hasGitHubOptions =
    calendar?.customOptions?.includes("pull_request_review_wait_count") ||
    calendar?.customOptions?.includes("team_review_load") ||
    false;

  const showPrReviewOption =
    calendar?.customOptions?.includes("pull_request_review_wait_count") ??
    false;

  const showTeamReviewLoadOption =
    calendar?.customOptions?.includes("team_review_load") ?? false;

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
