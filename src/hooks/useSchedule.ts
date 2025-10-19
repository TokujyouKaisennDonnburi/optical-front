"use client";

import { useEffect, useMemo, useState } from "react";
import type { StatusDotVariant } from "@/components/atoms/StatusDot";

import { TodaySchedulePanelItem } from "@/components/organisms/TodaySchedulePanel";
import { startMockServiceWorker } from "@/mocks/browser";

export type ScheduleCalendar = {
  id: string;
  name: string;
  color: string;
  description?: string;
};

export type ScheduleItem = {
  id: string;
  title: string;
  memo?: string;
  location?: string;
  locationUrl?: string;
  members?: string[];
  calendarId?: string;
  calendarName?: string;
  status: "default" | "info" | "success" | "warning" | "danger";
  start: string;
  end?: string;
  calendarColor?: string;
};

export type ScheduleApiResponse = {
  // API によっては日付の返却が無いケースも想定し optional にする
  date?: string;
  items: ScheduleItem[];
  calendars?: ScheduleCalendar[];
};

export function useSchedule() {
  const [data, setData] = useState<ScheduleApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchSchedule = async () => {
      if (typeof window !== "undefined") {
        await startMockServiceWorker();
      }
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch("/api/today-schedule");
        if (!response.ok) {
          throw new Error(`Failed to fetch: ${response.status}`);
        }
        const json = (await response.json()) as ScheduleApiResponse;
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
