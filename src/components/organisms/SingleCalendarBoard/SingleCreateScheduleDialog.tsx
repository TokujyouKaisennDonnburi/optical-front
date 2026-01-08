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
  const [title, setTitle] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");
  const [memo, setMemo] = useState("");
  const [location, setLocation] = useState("");
  const [isAllDay, setIsAllDay] = useState(false);
  const [allDayStartDate, setAllDayStartDate] = useState<Date>(date);
  const [allDayEndDate, setAllDayEndDate] = useState<Date>(date);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (isOpen) {
      setTitle("");
      setStartTime("09:00");
      setEndTime("10:00");
      setMemo("");
      setLocation("");
      setIsAllDay(false);
      setAllDayStartDate(date);
      setAllDayEndDate(date);
      setErrors({});
    }
  }, [isOpen, date]);

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
          "linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(147, 51, 234, 0.2))",
      };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-4 py-6 backdrop-blur">
      <div className="relative w-full max-w-sm overflow-hidden rounded-2xl border border-white/10 bg-slate-900/95 text-white shadow-2xl">
        <div
          className="relative flex flex-col gap-2.5 px-5 py-4 text-white"
          style={headerStyle}
        >
          <Text
            as="h2"
            weight="semibold"
            className="pr-12 text-lg leading-tight"
          >
            新規予定を作成
          </Text>
          <div className="flex items-center gap-2 text-sm text-white/85">
            <Icon icon={Calendar} size="sm" className="text-white/70" />
            <span>{dateLabel}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-white/70">
            <span
              className="inline-block h-2 w-2 rounded-full"
              style={{ backgroundColor: calendarColor ?? "#6366f1" }}
            />
            <span>{calendarName}</span>
          </div>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={onClose}
            className="absolute right-3 top-3 h-8 w-8 rounded-full border border-white/20 bg-black/20 text-white transition-colors hover:bg-white hover:text-black"
          >
            <Icon icon={X} size="sm" />
          </Button>
        </div>

        <div className="space-y-4 px-5 py-4">
          {Object.keys(errors).length > 0 && (
            <div className="rounded-md bg-red-500/10 border border-red-500/30 p-3">
              <ul className="space-y-1 text-sm text-red-300">
                {Object.entries(errors).map(([key, error]) => (
                  <li key={key}>• {error}</li>
                ))}
              </ul>
            </div>
          )}
          <div className="space-y-1.5">
            <Text as="label" size="sm" className="block text-white/90">
              タイトル
            </Text>
            <Input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="予定のタイトル"
              className="h-10 border-white/15 bg-white/5 text-white placeholder:text-white/40 focus-visible:border-blue-400 focus-visible:ring-blue-400/40"
            />
          </div>

          <div className="flex items-center gap-2 text-sm text-white/85">
            <Switch
              checked={isAllDay}
              onCheckedChange={setIsAllDay}
              className="bg-white/20 data-[state=checked]:bg-blue-500"
            />
            <span>終日</span>
          </div>

          {!isAllDay ? (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Text as="label" size="sm" className="block text-white/90">
                  開始時刻
                </Text>
                <Input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="h-10 border-white/15 bg-white/5 text-white focus-visible:border-blue-400 focus-visible:ring-blue-400/40"
                  style={{ colorScheme: "dark" }}
                />
              </div>
              <div className="space-y-1.5">
                <Text as="label" size="sm" className="block text-white/90">
                  終了時刻
                </Text>
                <Input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="h-10 border-white/15 bg-white/5 text-white focus-visible:border-blue-400 focus-visible:ring-blue-400/40"
                  style={{ colorScheme: "dark" }}
                />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Text as="label" size="sm" className="block text-white/90">
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
                  className="h-10 border-white/15 bg-white/5 text-white focus-visible:border-blue-400 focus-visible:ring-blue-400/40"
                  style={{ colorScheme: "dark" }}
                />
              </div>
              <div className="space-y-1.5">
                <Text as="label" size="sm" className="block text-white/90">
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
                  className="h-10 border-white/15 bg-white/5 text-white focus-visible:border-blue-400 focus-visible:ring-blue-400/40"
                  style={{ colorScheme: "dark" }}
                />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <Text as="label" size="sm" className="block text-white/90">
              メモ (任意)
            </Text>
            <textarea
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="メモを入力"
              rows={3}
              className="w-full rounded-md border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none placeholder:text-white/40 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/40"
            />
          </div>

          <div className="space-y-1.5">
            <Text as="label" size="sm" className="block text-white/90">
              場所 (任意)
            </Text>
            <Input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="会議室やURLなど"
              className="h-10 border-white/15 bg-white/5 text-white placeholder:text-white/40 focus-visible:border-blue-400 focus-visible:ring-blue-400/40"
            />
          </div>
        </div>

        <div className="flex gap-2 border-t border-white/10 bg-slate-950/50 px-5 py-3">
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
            className="flex-1"
            style={{
              backgroundColor: calendarColor ?? "#3b82f6",
            }}
          >
            作成する
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
