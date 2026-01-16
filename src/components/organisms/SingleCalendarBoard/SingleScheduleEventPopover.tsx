"use client";

import {
  CalendarDays,
  Clock3,
  MapPin,
  NotebookPen,
  UserCircle2,
  X,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { Button } from "@/components/atoms/Button";
import { Icon } from "@/components/atoms/Icon";
import { Text } from "@/components/atoms/Text";

import type { SingleCalendarBoardItem } from "./SingleCalendarBoard";

export type SingleScheduleEventPopoverProps = {
  item: SingleCalendarBoardItem;
  isOpen: boolean;
  onClose: () => void;
  /** クリックした要素の位置情報 */
  anchorPosition: { x: number; y: number };
};

/** ダイアログのサイズ（位置計算用） */
const DIALOG_WIDTH = 380;
const DIALOG_HEIGHT = 320;
const MARGIN = 16;

/**
 * 単体カレンダー用のスケジュール詳細ポップオーバー
 */
export function SingleScheduleEventPopover({
  item,
  isOpen,
  onClose,
  anchorPosition,
}: SingleScheduleEventPopoverProps) {
  const [mounted, setMounted] = useState(false);
  const [dialogPosition, setDialogPosition] = useState<{
    top: number;
    left: number;
    showOnRight: boolean;
  } | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // ダイアログの位置を計算（必ず左右どちらかに配置）
  const calculatePosition = useCallback(() => {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // 画面の中心より左にクリックした場合は右側に、右にクリックした場合は左側に表示
    const showOnRight = anchorPosition.x < viewportWidth / 2;

    let left: number;
    if (showOnRight) {
      // 右側に表示
      left = anchorPosition.x + MARGIN;
      // 右端からはみ出す場合は調整
      if (left + DIALOG_WIDTH + MARGIN > viewportWidth) {
        left = viewportWidth - DIALOG_WIDTH - MARGIN;
      }
    } else {
      // 左側に表示
      left = anchorPosition.x - DIALOG_WIDTH - MARGIN;
      // 左端からはみ出す場合は調整
      if (left < MARGIN) {
        left = MARGIN;
      }
    }

    // 縦位置はクリック位置を中心に
    let top = anchorPosition.y - DIALOG_HEIGHT / 2;

    // 上端からはみ出す場合
    if (top < MARGIN) {
      top = MARGIN;
    }

    // 下端からはみ出す場合
    if (top + DIALOG_HEIGHT + MARGIN > viewportHeight) {
      top = viewportHeight - DIALOG_HEIGHT - MARGIN;
    }

    return { top, left, showOnRight };
  }, [anchorPosition]);

  useEffect(() => {
    if (isOpen) {
      setDialogPosition(calculatePosition());
    }
  }, [isOpen, calculatePosition]);

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

  if (!mounted || !isOpen || !dialogPosition) {
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
    : "カレンダー";

  // スライドアニメーションの方向（右から来るか左から来るか）
  const slideDirection = dialogPosition.showOnRight
    ? "animate-slide-in-right"
    : "animate-slide-in-left";

  return createPortal(
    // biome-ignore lint/a11y/noStaticElementInteractions: Backdrop overlay for closing dialog on click
    <div
      className="fixed inset-0 z-50"
      onClick={onClose}
      onKeyDown={(e) => {
        if (e.key === "Escape") onClose();
      }}
      role="presentation"
    >
      <div
        ref={dialogRef}
        className={`absolute w-[380px] max-w-[calc(100vw-32px)] overflow-hidden rounded-2xl border border-white/10 bg-slate-900/98 text-white shadow-2xl backdrop-blur-sm ${slideDirection}`}
        style={{
          top: dialogPosition.top,
          left: dialogPosition.left,
        }}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
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
            aria-label="閉じる"
            className="absolute right-3 top-3 h-8 w-8 rounded-full border border-white/20 bg-black/20 text-white transition-colors hover:bg-black/40"
          >
            <Icon icon={X} size="sm" />
          </Button>
        </div>

        <div className="max-h-[300px] space-y-4 overflow-y-auto px-5 py-4 text-sm text-white/90">
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
              {calendarName}
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

  // 終日判定 (00:00開始かつ23:59終了) - 日をまたぐ場合も含む
  if (end) {
    const isStartMidnight = start.getHours() === 0 && start.getMinutes() === 0;
    const isEndDayEnd = end.getHours() === 23 && end.getMinutes() === 59;
    if (isStartMidnight && isEndDayEnd) {
      return "終日";
    }
  }

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
