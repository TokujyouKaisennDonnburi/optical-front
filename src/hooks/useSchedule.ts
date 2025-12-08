"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { StatusDotVariant } from "@/components/atoms/StatusDot";
import type { TodaySchedulePanelItem } from "@/components/organisms/TodaySchedulePanel";
import { getTodaySchedule } from "@/lib/api-schedule";
import type { ScheduleApiResponse, ScheduleItem } from "@/types/schedule";

export function useSchedule() {
  const [data, setData] = useState<ScheduleApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [_refreshTrigger, setRefreshTrigger] = useState(0);

  const refresh = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  useEffect(() => {
    let isMounted = true;

    const fetchSchedule = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const json = await getTodaySchedule();
        if (isMounted) {
          const normalized = normalizeScheduleResponse(json);
          setData(normalized);
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
  }, []);

  const calendars = useMemo(() => data?.calendars ?? [], [data?.calendars]);

  const calendarIndex = useMemo(() => {
    return new Map(calendars.map((calendar) => [calendar.id, calendar]));
  }, [calendars]);

  const items: TodaySchedulePanelItem[] = useMemo(() => {
    if (!data) return [];

    return data.items.map((item) => {
      const calendar = item.calendarId
        ? calendarIndex.get(item.calendarId)
        : undefined;

      return {
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
        calendarName: item.calendarName ?? calendar?.name,
        calendarColor: item.calendarColor ?? calendar?.color,
      };
    });
  }, [calendarIndex, data]);

  const dateLabel = useMemo(() => {
    if (!data) return "";
    const date = data.date ? new Date(data.date) : new Date();
    return new Intl.DateTimeFormat("ja-JP", {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "short",
    }).format(date);
  }, [data]);

  return {
    items,
    calendars,
    dateLabel,
    isLoading,
    error,
    refresh,
  };
}

function normalizeScheduleResponse(
  response: ScheduleApiResponse,
): ScheduleApiResponse {
  const calendarIndex = new Map(
    (response.calendars ?? []).map((calendar) => [calendar.id, calendar]),
  );

  const normalizedItems = response.items.map((item) => ({
    ...item,
    calendarName:
      item.calendarName ?? calendarIndex.get(item.calendarId ?? "")?.name,
    calendarColor:
      item.calendarColor ?? calendarIndex.get(item.calendarId ?? "")?.color,
  }));

  return {
    date: response.date,
    items: normalizedItems,
    calendars: response.calendars ?? [],
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
  ] satisfies StatusDotVariant[]);

  return statuses.has(value as StatusDotVariant) ? value : "default";
}
