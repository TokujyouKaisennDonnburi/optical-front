"use client";

import { Calendar, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";

import { Button } from "@/components/atoms/Button";
import { Icon } from "@/components/atoms/Icon";
import { Input } from "@/components/atoms/Input";
import { Switch } from "@/components/atoms/Switch";
import { Text } from "@/components/atoms/Text";

export type SingleCreateScheduleDialogProps = {
  date: Date;
  isOpen: boolean;
  onClose: () => void;
  calendarId: string;
  calendarName?: string;
  calendarColor?: string;
  onConfirm: (payload: {
    date: Date;
    title: string;
    startTime: string;
    endTime: string;
    memo: string;
    location: string;
    calendarId: string;
    isAllDay: boolean;
    allDayStartDate: Date;
    allDayEndDate: Date;
  }) => void;
  initialTitle?: string;
  initialStartTime?: string;
  initialEndTime?: string;
};

/**
 * 単体カレンダー用の新規予定作成ダイアログ
 *
 * GeneralCalendarBoard の CreateScheduleDialog と異なり、
 * カレンダーは固定（選択不可）で、よりシンプルなUIを提供します。
 */
export function SingleCreateScheduleDialog({
  date,
  isOpen,
  onClose,
  calendarId,
  calendarName = "カレンダー",
  calendarColor,
  onConfirm,
  initialTitle,
  initialStartTime,
  initialEndTime,
}: SingleCreateScheduleDialogProps) {
  const formatDateInput = (target: Date) => {
    const y = target.getFullYear();
    const m = String(target.getMonth() + 1).padStart(2, "0");
    const d = String(target.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  const parseDateInput = (value: string) => {
    const [y, m, d] = value.split("-").map(Number);
    return new Date(y, (m ?? 1) - 1, d ?? 1);
  };

  const [mounted, setMounted] = useState(false);
  const [title, setTitle] = useState(initialTitle || "");
  const [startTime, setStartTime] = useState(initialStartTime || "09:00");
  const [endTime, setEndTime] = useState(initialEndTime || "10:00");
  const [memo, setMemo] = useState("");
  const [location, setLocation] = useState("");
  const [isAllDay, setIsAllDay] = useState(false);
  const [allDayStartDate, setAllDayStartDate] = useState<Date>(date);
  const [allDayEndDate, setAllDayEndDate] = useState<Date>(date);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (isOpen) {
      setTitle(initialTitle || "");
      setStartTime(initialStartTime || "09:00");
      setEndTime(initialEndTime || "10:00");
      setMemo("");
      setLocation("");
      setIsAllDay(false);
      setAllDayStartDate(date);
      setAllDayEndDate(date);
      setErrors({});
    }
  }, [isOpen, date, initialTitle, initialStartTime, initialEndTime]);

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

  const dateLabel = useMemo(() => {
    const formatter = new Intl.DateTimeFormat("ja-JP", {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "short",
    });
    return formatter.format(date);
  }, [date]);

  if (!mounted || !isOpen) {
    return null;
  }

  const handleConfirm = () => {
    const newErrors: { [key: string]: string } = {};

    // タイトル必須チェック
    if (!title.trim()) {
      newErrors.title = "タイトルを入力してください";
    }

    if (isAllDay) {
      // 終日の日付順チェック
      if (allDayEndDate.getTime() < allDayStartDate.getTime()) {
        newErrors.allDayDate = "終了日は開始日以降である必要があります";
      }
    } else {
      // 時刻イベントの時刻チェック
      if (!startTime) {
        newErrors.startTime = "開始時刻を入力してください";
      }
      if (endTime) {
        const [sh, sm] = startTime.split(":").map(Number);
        const [eh, em] = endTime.split(":").map(Number);
        const startMinutes = (sh ?? 0) * 60 + (sm ?? 0);
        const endMinutes = (eh ?? 0) * 60 + (em ?? 0);
        if (endMinutes <= startMinutes) {
          newErrors.endTime = "終了時刻は開始時刻より後である必要があります";
        }
      }
    }

    // エラーがある場合は表示して戻る
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onConfirm({
      date,
      title: title.trim(),
      startTime,
      endTime,
      memo,
      location,
      calendarId,
      isAllDay,
      allDayStartDate,
      allDayEndDate,
    });
    onClose();
  };

  // ヘッダーの背景色
  const headerStyle = calendarColor
    ? {
        background: `linear-gradient(135deg, ${calendarColor}40, ${calendarColor}20)`,
      }
    : {
        background:
          "linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(147, 51, 234, 0.1))",
      };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 px-4 py-6 backdrop-blur-sm">
      <div className="relative w-full max-w-sm overflow-hidden rounded-2xl border border-border bg-popover text-popover-foreground shadow-2xl">
        <div
          className="relative flex flex-col gap-2.5 px-5 py-4 text-foreground"
          style={headerStyle}
        >
          <Text
            as="h2"
            weight="semibold"
            className="pr-12 text-lg leading-tight"
          >
            新規予定を作成
          </Text>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Icon icon={Calendar} size="sm" className="text-muted-foreground" />
            <span>{dateLabel}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span
              className="inline-block h-2 w-2 rounded-full"
              style={{ backgroundColor: calendarColor ?? "#6366f1" }}
            />
            <span>{calendarName}</span>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="absolute right-3 top-3 h-8 w-8 rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <Icon icon={X} size="sm" />
          </Button>
        </div>

        <div className="space-y-4 px-5 py-4">
          {Object.keys(errors).length > 0 && (
            <div className="rounded-md bg-destructive/10 border border-destructive/20 p-3">
              <ul className="space-y-1 text-sm text-destructive font-medium">
                {Object.entries(errors).map(([key, error]) => (
                  <li key={key}>• {error}</li>
                ))}
              </ul>
            </div>
          )}
          <div className="space-y-1.5">
            <Text as="label" size="sm" className="block text-muted-foreground">
              タイトル
            </Text>
            <Input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="予定のタイトル"
              className="h-10 border-input bg-background/50 text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring"
              autoFocus
            />
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Switch
              checked={isAllDay}
              onCheckedChange={setIsAllDay}
              className="data-[state=unchecked]:bg-input data-[state=checked]:bg-primary"
            />
            <span>終日</span>
          </div>

          {!isAllDay ? (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Text
                  as="label"
                  size="sm"
                  className="block text-muted-foreground"
                >
                  開始時刻
                </Text>
                <Input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="h-10 border-input bg-background/50 text-foreground focus-visible:border-ring focus-visible:ring-ring"
                />
              </div>
              <div className="space-y-1.5">
                <Text
                  as="label"
                  size="sm"
                  className="block text-muted-foreground"
                >
                  終了時刻
                </Text>
                <Input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="h-10 border-input bg-background/50 text-foreground focus-visible:border-ring focus-visible:ring-ring"
                />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Text
                  as="label"
                  size="sm"
                  className="block text-muted-foreground"
                >
                  開始日
                </Text>
                <Input
                  type="date"
                  value={formatDateInput(allDayStartDate)}
                  onChange={(e) => {
                    const next = parseDateInput(e.target.value);
                    if (!Number.isNaN(next.getTime())) {
                      setAllDayStartDate(next);
                      if (allDayEndDate.getTime() < next.getTime()) {
                        setAllDayEndDate(next);
                      }
                    }
                  }}
                  className="h-10 border-input bg-background/50 text-foreground focus-visible:border-ring focus-visible:ring-ring"
                />
              </div>
              <div className="space-y-1.5">
                <Text
                  as="label"
                  size="sm"
                  className="block text-muted-foreground"
                >
                  終了日
                </Text>
                <Input
                  type="date"
                  value={formatDateInput(allDayEndDate)}
                  onChange={(e) => {
                    const next = parseDateInput(e.target.value);
                    if (!Number.isNaN(next.getTime())) {
                      if (next.getTime() < allDayStartDate.getTime()) {
                        setAllDayEndDate(allDayStartDate);
                      } else {
                        setAllDayEndDate(next);
                      }
                    }
                  }}
                  className="h-10 border-input bg-background/50 text-foreground focus-visible:border-ring focus-visible:ring-ring"
                />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <Text as="label" size="sm" className="block text-muted-foreground">
              メモ (任意)
            </Text>
            <textarea
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="メモを入力"
              rows={3}
              className="w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="space-y-1.5">
            <Text as="label" size="sm" className="block text-muted-foreground">
              場所 (任意)
            </Text>
            <Input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="会議室やURLなど"
              className="h-10 border-input bg-background/50 text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring"
            />
          </div>
        </div>

        <div className="flex gap-2 border-t border-border bg-muted/20 px-5 py-3">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            className="flex-1"
          >
            キャンセル
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            作成する
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
