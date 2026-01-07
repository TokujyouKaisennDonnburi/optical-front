"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { TodaySchedulePanelItem } from "@/components/organisms/TodaySchedulePanel";
import { getCalendarList } from "@/lib/api-calendars";
import { getMonthSchedule } from "@/lib/api-schedule";
import type { CalendarDetail, ScheduleItem } from "@/types/schedule";

export function useGeneralCalendar(viewDate?: Date) {
  const [calendars, setCalendars] = useState<CalendarDetail[]>([]);
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  // useRefを使って初回ロードを追跡（依存配列に含めなくてよい）
  const isInitialLoadRef = useRef(true);

  const refresh = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  // viewDateから月のパラメータを生成
  const monthParam = viewDate
    ? `${viewDate.getFullYear()}-${String(viewDate.getMonth() + 1).padStart(2, "0")}`
    : undefined;

  // refreshTrigger または monthParam で再取得させる。
  // biome-ignore lint/correctness/useExhaustiveDependencies: refresh trigger to refetch
  useEffect(() => {
    let isMounted = true;

    const fetchSchedule = async () => {
      const schedules = await getMonthSchedule(monthParam);
      if (isMounted) {
        setSchedules(schedules.items);
      }
    };

    const fetchCalendars = async () => {
      const calendars = await getCalendarList();
      if (isMounted) {
        setCalendars(calendars);
      }
    };

    const fetchAll = async () => {
      // 初回ロード時のみスケルトンを表示
      if (isInitialLoadRef.current) {
        setIsLoading(true);
      }
      setError(null);

      try {
        await Promise.all([fetchSchedule(), fetchCalendars()]);
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err : new Error("Unknown error"));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
          isInitialLoadRef.current = false;
        }
      }
    };

    void fetchAll();

    return () => {
      isMounted = false;
    };
  }, [refreshTrigger, monthParam]);

  const items: TodaySchedulePanelItem[] = useMemo(() => {
    if (schedules.length === 0) return [];

    return schedules.map((item) => {
      return {
        id: item.id,
        title: item.title,
        timeRange: {
          start: formatTimeLabel(item.startAt),
          end: formatTimeLabel(item.endAt),
        },
        startsAt: item.startAt,
        endsAt: item.endAt,
        calendarId: item.calendarId,
        memo: item.memo,
        location: item.location,
        members: item.members,
        calendarName: item.calendarName,
        calendarColor: item.calendarColor,
      };
    });
  }, [schedules]);

  const dateLabel = new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
  }).format(new Date());

  return {
    items,
    calendars,
    dateLabel,
    isLoading,
    error,
    refresh,
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
