"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import type { TodaySchedulePanelItem } from "@/components/organisms/TodaySchedulePanel";
import {
  deleteCalendar as apiDeleteCalendar,
  updateCalendar as apiUpdateCalendar,
  getCalendarList,
} from "@/lib/api-calendars";
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

  const deleteCalendar = useCallback(
    async (calendarId: string) => {
      try {
        await apiDeleteCalendar(calendarId);
        toast.success("カレンダーを削除しました");
        refresh();
      } catch (err) {
        console.error("Failed to delete calendar:", err);
        toast.error("カレンダーの削除に失敗しました");
      }
    },
    [refresh],
  );
  const updateCalendar = useCallback(
    async (
      calendarId: string,
      payload: { name?: string; color?: string; imageUrl?: string | null },
    ) => {
      try {
        await apiUpdateCalendar(calendarId, payload);
        toast.success("カレンダーを更新しました");
        refresh();
      } catch (err) {
        console.error("Failed to update calendar:", err);
        toast.error("カレンダーの更新に失敗しました");
      }
    },
    [refresh],
  );

  // viewDateから月のパラメータを生成
  const getMonthParam = useCallback((date: Date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
      2,
      "0",
    )}`;
  }, []);

  const currentMonthParam = viewDate ? getMonthParam(viewDate) : undefined;

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

  // refreshTrigger または monthParam で再取得させる。
  // biome-ignore lint/correctness/useExhaustiveDependencies: refresh trigger to refetch
  useEffect(() => {
    let isMounted = true;

    const fetchSchedule = async () => {
      // 3ヶ月分取得（viewDateがない場合は undefined のみの配列になる）
      const params = [prevMonthParam, currentMonthParam, nextMonthParam];

      // パラメータが全てundefinedの場合は1回だけ呼ぶ（デフォルト動作）
      const targetParams = params.every((p) => p === undefined)
        ? [undefined]
        : params;

      const results = await Promise.all(
        targetParams.map((param) => getMonthSchedule(param)),
      );

      if (isMounted) {
        // 結果を結合し、重複を除去
        const allItems: ScheduleItem[] = [];
        const addedIds = new Set<string>();

        for (const res of results) {
          const items = res.items ?? [];
          for (const item of items) {
            if (!addedIds.has(item.id)) {
              allItems.push(item);
              addedIds.add(item.id);
            }
          }
        }
        setSchedules(allItems);
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
  }, [refreshTrigger, currentMonthParam, prevMonthParam, nextMonthParam]);

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
    deleteCalendar,
    updateCalendar,
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
