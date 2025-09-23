"use client";

import { useEffect, useMemo, useState } from "react";
import type { StatusDotVariant } from "@/components/atoms/StatusDot";

import { TodaySchedulePanelItem } from "@/components/organisms/TodaySchedulePanel";
import { startMockServiceWorker } from "@/mocks/browser";

export type TodayScheduleApiItem = {
  id: string;
  title: string;
  memo?: string;
  location?: string;
  locationUrl?: string;
  members?: string[];
  calendarName?: string;
  status: "default" | "info" | "success" | "warning" | "danger";
  start: string;
  end?: string;
  calendarColor?: string;
};

export type TodayScheduleApiResponse = {
  date: string;
  items: TodayScheduleApiItem[];
};

export function useTodaySchedule() {
  const [data, setData] = useState<TodayScheduleApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchTodaySchedule = async () => {
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
        const json = (await response.json()) as TodayScheduleApiResponse;
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

    void fetchTodaySchedule();

    return () => {
      isMounted = false;
    };
  }, []);

  const items: TodaySchedulePanelItem[] = useMemo(() => {
    if (!data) return [];

    return data.items.map((item) => ({
      id: item.id,
      title: item.title,
      timeRange: {
        start: formatTimeLabel(item.start),
        end: item.end ? formatTimeLabel(item.end) : undefined,
      },
      startsAt: item.start,
      endsAt: item.end,
      statusVariant: normalizeStatus(item.status),
      memo: item.memo,
      location: item.location,
      locationUrl: item.locationUrl,
      members: item.members,
      calendarName: item.calendarName,
      calendarColor: item.calendarColor,
    }));
  }, [data]);

  const dateLabel = useMemo(() => {
    if (!data) return "";
    const date = new Date(data.date);
    return new Intl.DateTimeFormat("ja-JP", {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "short",
    }).format(date);
  }, [data]);

  return {
    items,
    dateLabel,
    isLoading,
    error,
  };
}

function normalizeScheduleResponse(
  response: TodayScheduleApiResponse,
): TodayScheduleApiResponse {
  const today = new Date();
  const alignedItems = response.items.map((item) => ({
    ...item,
    start: alignDateTime(item.start, today),
    end: item.end ? alignDateTime(item.end, today) : undefined,
  }));

  return {
    date: today.toISOString(),
    items: alignedItems,
  };
}

function alignDateTime(isoString: string, baseDate: Date): string {
  const original = new Date(isoString);
  if (Number.isNaN(original.getTime())) {
    return isoString;
  }

  const aligned = new Date(baseDate);
  aligned.setDate(original.getDate());
  aligned.setHours(
    original.getHours(),
    original.getMinutes(),
    original.getSeconds(),
    original.getMilliseconds(),
  );

  return aligned.toISOString();
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

function normalizeStatus(
  value: TodayScheduleApiItem["status"],
): StatusDotVariant {
  const statuses = new Set([
    "default",
    "info",
    "success",
    "warning",
    "danger",
  ] satisfies StatusDotVariant[]);

  return statuses.has(value as StatusDotVariant) ? value : "default";
}
