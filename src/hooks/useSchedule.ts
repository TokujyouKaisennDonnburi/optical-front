"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { TodaySchedulePanelItem } from "@/components/organisms/TodaySchedulePanel";
import { getCalendarList } from "@/lib/api-calendars";
import { getMonthSchedule } from "@/lib/api-schedule";
import type { CalendarDetail, ScheduleItem } from "@/types/schedule";

export function useSchedule(viewDate?: Date) {
  const [date, setDate] = useState<string | null>(null);
  const [calendars, setCalendars] = useState<CalendarDetail[]>([]);
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

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
      // 初回ロード時のみスケルトンを表示
      if (isInitialLoad) {
        setIsLoading(true);
      }
      setError(null);
      try {
        const schedules = await getMonthSchedule(monthParam);
        if (isMounted) {
          setDate(schedules.date);
          setSchedules(schedules.items);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err : new Error("Unknown error"));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
          setIsInitialLoad(false);
        }
      }
    };

    const fetchCalendars = async () => {
      // 初回ロード時のみスケルトンを表示
      if (isInitialLoad) {
        setIsLoading(true);
      }
      setError(null);
      try {
        const calendars = await getCalendarList();
        if (isMounted) {
          setCalendars(calendars);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err : new Error("Unknown error"));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
          setIsInitialLoad(false);
        }
      }
    };

    void fetchSchedule();
    void fetchCalendars();

    return () => {
      isMounted = false;
    };
  }, [refreshTrigger, monthParam, isInitialLoad]);

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

  const dateLabel = useMemo(() => {
    const normalizedDate = date ? new Date(date) : new Date();
    return new Intl.DateTimeFormat("ja-JP", {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "short",
    }).format(normalizedDate);
  }, [date]);

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
