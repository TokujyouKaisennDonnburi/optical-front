"use client";

import { useEffect, useMemo, useState } from "react";

import { TodaySchedulePanelItem } from "@/components/organisms/TodaySchedulePanel";
import { startMockServiceWorker } from "@/mocks/browser";

export type TodayScheduleApiItem = {
  id: string;
  title: string;
  memo?: string;
  location?: string;
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
          setData(json);
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
      statusVariant: normalizeStatus(item.status),
      memo: item.memo,
      location: item.location,
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

function formatTimeLabel(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  const hours = date.getHours();
  const minutes = date.getMinutes();
  return `${hours}:${minutes.toString().padStart(2, "0")}`;
}

function normalizeStatus(value: TodayScheduleApiItem["status"]) {
  const statuses = new Set([
    "default",
    "info",
    "success",
    "warning",
    "danger",
  ] satisfies TodaySchedulePanelItem["statusVariant"][]);

  return statuses.has(value as TodaySchedulePanelItem["statusVariant"])
    ? (value as TodaySchedulePanelItem["statusVariant"])
    : "default";
}
