"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { StatusDotVariant } from "@/components/atoms/StatusDot";
import type { TodaySchedulePanelItem } from "@/components/organisms/TodaySchedulePanel";
import { getCalendarDetail } from "@/lib/api-calendars";
import { getTodaySchedule } from "@/lib/api-schedule";
import type { CalendarDetail, ScheduleItem } from "@/types/schedule";

/**
 * 単体カレンダーのスケジュールとオプションを取得するフック
 */
export function useCalendarSchedule(calendarId: string) {
  const [calendar, setCalendar] = useState<CalendarDetail | null>(null);
  const [scheduleItems, setScheduleItems] = useState<ScheduleItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(() => {
    setIsLoading(true);
    setError(null);
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
  useEffect(() => {
    let isMounted = true;

    const fetchSchedule = async () => {
      if (!calendarId) return;

      setIsLoading(true);
      setError(null);

      try {
        const json = await getTodaySchedule();

        if (isMounted) {
          // このカレンダーのスケジュールのみをフィルタリング
          const filteredItems = (json.items ?? []).filter(
            (item: ScheduleItem) => item.calendarId === calendarId,
          );

          // カレンダー情報をアイテムに付加
          const calendarInfo = (json.calendars ?? []).find(
            (c: CalendarDetail) => c.id === calendarId,
          );

          const normalizedItems = filteredItems.map((item: ScheduleItem) => ({
            ...item,
            calendarName: item.calendarName ?? calendarInfo?.name,
            calendarColor: item.calendarColor ?? calendarInfo?.color,
          }));

          setScheduleItems(normalizedItems);
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
  }, [calendarId]);

  // TodaySchedulePanelItem 形式に変換
  const items: TodaySchedulePanelItem[] = useMemo(() => {
    return scheduleItems.map((item) => ({
      id: item.id,
      title: item.title,
      timeRange: {
        start: formatTimeLabel(item.start),
        end: item.end ? formatTimeLabel(item.end) : undefined,
      },
      startsAt: item.start,
      endsAt: item.end,
      calendarId: item.calendarId,
      statusVariant: normalizeStatus(item.status),
      memo: item.memo,
      location: item.location,
      locationUrl: item.locationUrl,
      members: item.members,
      calendarName: item.calendarName,
      calendarColor: item.calendarColor,
    }));
  }, [scheduleItems]);

  const dateLabel = useMemo(() => {
    const date = new Date();
    return new Intl.DateTimeFormat("ja-JP", {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "short",
    }).format(date);
  }, []);

  // GitHub オプションの有無を判定
  const hasGitHubOptions = useMemo(() => {
    if (!calendar?.customOptions) return false;
    return (
      calendar.customOptions.includes("pull_request_review_wait_count") ||
      calendar.customOptions.includes("team_review_load")
    );
  }, [calendar]);

  const showPrReviewOption = useMemo(() => {
    return (
      calendar?.customOptions?.includes("pull_request_review_wait_count") ??
      false
    );
  }, [calendar]);

  const showTeamReviewLoadOption = useMemo(() => {
    return calendar?.customOptions?.includes("team_review_load") ?? false;
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

function normalizeStatus(value: ScheduleItem["status"]): StatusDotVariant {
  const statuses = new Set([
    "default",
    "info",
    "success",
    "warning",
    "danger",
  ] as const satisfies readonly StatusDotVariant[]);

  return statuses.has(value as StatusDotVariant) ? value : "default";
}
