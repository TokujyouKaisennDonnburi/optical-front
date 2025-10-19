"use client";

import {
  CalendarDays,
  Clock3,
  MapPin,
  NotebookPen,
  UserCircle2,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import { Button } from "@/components/atoms/Button";
import { Icon } from "@/components/atoms/Icon";
import { Text } from "@/components/atoms/Text";

import type { GeneralScheduleBoardItem } from "./GeneralScheduleBoard";

export type ScheduleEventDialogProps = {
  item: GeneralScheduleBoardItem;
  isOpen: boolean;
  onClose: () => void;
};

export function ScheduleEventDialog({
  item,
  isOpen,
  onClose,
}: ScheduleEventDialogProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => {
      window.removeEventListener("keydown", handleKey);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  if (!mounted || !isOpen) {
    return null;
  }

  const startDate = safeDate(item.start);
  const endDate = item.end ? safeDate(item.end) : null;
  const headerColor = item.calendarColor ?? "#1e293b";
  const dateLabel = formatEventDateLabel(startDate, endDate);
  const timeLabel = formatEventTimeLabel(startDate, endDate);
  const members = item.members ?? [];
  const calendarName = item.calendarName?.trim().length
    ? item.calendarName
    : "登録カレンダー";

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-4 py-6 backdrop-blur">
      <div className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-white/10 bg-slate-900/95 text-white shadow-2xl">
        <div
          className="relative flex flex-col gap-2.5 px-5 py-4 text-white"
          style={{ backgroundColor: headerColor }}
        >
          <Text
            as="h2"
            weight="semibold"
            className="pr-12 text-lg leading-tight"
          >
            {item.title}
          </Text>
          <div className="flex items-center gap-2 text-sm text-white/85">
            <Icon icon={CalendarDays} size="sm" className="text-white/70" />
            <span>{dateLabel}</span>
          </div>
          {timeLabel ? (
            <div className="flex items-center gap-2 text-sm text-white/80">
              <Icon icon={Clock3} size="sm" className="text-white/65" />
              <span>{timeLabel}</span>
            </div>
          ) : null}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="absolute right-3 top-3 h-8 w-8 rounded-full border border-white/20 bg-black/20 text-white transition-colors hover:bg-black/40"
          >
            <Icon icon={X} size="sm" />
          </Button>
        </div>

        <div className="space-y-4 px-5 py-4 text-sm text-white/90">
          {item.memo ? (
            <div className="flex items-start gap-2 text-white/85">
              <Icon
                icon={NotebookPen}
                size="sm"
                className="mt-0.5 text-white/60"
              />
              <Text
                as="p"
                size="sm"
                className="whitespace-pre-wrap leading-relaxed text-white/85"
              >
                {item.memo}
              </Text>
            </div>
          ) : null}

          {item.location ? (
            <div className="flex items-start gap-2 text-white/85">
              <Icon icon={MapPin} size="sm" className="mt-0.5 text-white/60" />
              <div className="flex flex-col gap-1">
                <Text
                  as="span"
                  size="sm"
                  className="leading-relaxed text-white/85"
                >
                  {item.location}
                </Text>
                {item.locationUrl ? (
                  <a
                    href={item.locationUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-sky-300 underline hover:text-sky-200"
                  >
                    {item.locationUrl}
                  </a>
                ) : null}
              </div>
            </div>
          ) : null}

          {members.length ? (
            <div className="flex items-start gap-2 text-white/85">
              <Icon
                icon={UserCircle2}
                size="sm"
                className="mt-0.5 text-white/60"
              />
              <div className="flex flex-wrap gap-1 text-xs text-white/85">
                {renderMembers(members)}
              </div>
            </div>
          ) : null}

          <div className="flex items-start gap-2 text-white/85">
            <Icon
              icon={CalendarDays}
              size="sm"
              className="mt-0.5 text-white/60"
            />
            <span className="text-xs uppercase tracking-wide text-white/70">
              {calendarName || "メインカレンダー"}
            </span>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}

function safeDate(value: string | Date) {
  const next = new Date(value);
  return Number.isNaN(next.getTime()) ? new Date() : next;
}

function formatEventDateLabel(start: Date, end: Date | null) {
  const formatter = new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
  });

  if (!end || sameDay(start, end)) {
    return formatter.format(start);
  }

  return `${formatter.format(start)} 〜 ${formatter.format(end)}`;
}

function formatEventTimeLabel(start: Date, end: Date | null) {
  const formatter = new Intl.DateTimeFormat("ja-JP", {
    hour: "numeric",
    minute: "2-digit",
  });

  if (!start) return "";

  if (!end || sameDay(start, end)) {
    return end
      ? `${formatter.format(start)} 〜 ${formatter.format(end)}`
      : `${formatter.format(start)} 開始`;
  }

  return `${formatter.format(start)} 〜 ${formatter.format(end)}`;
}

function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function renderMembers(members: string[]) {
  const maxVisible = 3;
  if (members.length <= maxVisible) {
    return members.map((member) => (
      <span
        key={member}
        className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-white/90"
      >
        {member}
      </span>
    ));
  }

  const visible = members.slice(0, maxVisible);
  const remaining = members.length - maxVisible;
  return [
    ...visible.map((member) => (
      <span
        key={member}
        className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-white/90"
      >
        {member}
      </span>
    )),
    <span
      key="more"
      className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-white/80"
    >
      +{remaining}
    </span>,
  ];
}
