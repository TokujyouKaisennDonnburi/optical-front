"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { TodaySchedulePanelItem } from "@/components/organisms/TodaySchedulePanel";
import { getCalendarList } from "@/lib/api-calendars";
import { getMonthSchedule } from "@/lib/api-schedule";
import type { CalendarDetail, ScheduleItem } from "@/types/schedule";

export function useSchedule() {
  const [date, setDate] = useState<string | null>(null);
  const [calendars, setCalendars] = useState<CalendarDetail[]>([]);
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const refresh = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  // refreshTrigger で再取得させる。依存配列を維持するため lint を無視。
  // biome-ignore lint/correctness/useExhaustiveDependencies: refresh trigger to refetch
  useEffect(() => {
    let isMounted = true;

    const fetchSchedule = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const schedules = await getMonthSchedule();
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
        }
      }
    };

    const fetchCalendars = async () => {
      setIsLoading(true);
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
        }
      }
    };

    void fetchSchedule();
    void fetchCalendars();

    return () => {
      isMounted = false;
    };
  }, [refreshTrigger]);

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
    console.log("time is NaN");
    return value;
  }
  const hours = date.getHours();
  const minutes = date.getMinutes();
  console.log("time is NOT NaN");
  return `${hours}:${minutes.toString().padStart(2, "0")}`;
}
