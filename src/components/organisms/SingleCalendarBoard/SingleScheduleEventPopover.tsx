"use client";

import {
  CalendarDays,
  Clock3,
  Loader2,
  MapPin,
  NotebookPen,
  Trash,
  UserCircle2,
  X,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { toast } from "sonner";
import { Button } from "@/components/atoms/Button";
import { Icon } from "@/components/atoms/Icon";
import { Input } from "@/components/atoms/Input";
import { Label } from "@/components/atoms/Label";
import { Switch } from "@/components/atoms/Switch";
import { Text } from "@/components/atoms/Text";
import { Textarea } from "@/components/atoms/Textarea";

import type { SingleCalendarBoardItem } from "./SingleCalendarBoard";

/**
 * 単体カレンダー用のスケジュール詳細ポップオーバー
 *
 * 本番環境への切り替え:
 * - onDelete: DELETE /api/calendars/{calendarId}/events/{eventId}
 * - onUpdate: PUT /api/calendars/{calendarId}/events/{eventId}
 * - 現在はモック版として動作
 */
export type SingleScheduleEventPopoverProps = {
  item: SingleCalendarBoardItem;
  isOpen: boolean;
  onClose: () => void;
  /** クリックした要素の位置情報 */
  anchorPosition: { x: number; y: number };
  /**
   * 削除ボタンクリック時のコールバック
   * 本番環境: 親コンポーネントでAPI呼び出し（DELETE /calendars/{id}/events/{eventId}）を実装
   */
  onDelete?: () => void;
  /**
   * 更新時のコールバック
   * 本番環境: 親コンポーネントでAPI呼び出し（PUT /calendars/{id}/events/{eventId}）を実装
   * 各フィールドの部分更新に対応
   */
  onUpdate?: (updates: {
    title?: string;
    startTime?: string;
    endTime?: string;
    isAllDay?: boolean;
    memo?: string;
    location?: string;
  }) => Promise<void>;
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
  onDelete,
  onUpdate,
}: SingleScheduleEventPopoverProps) {
  // ==================== State管理 ====================
  // マウント状態（クライアントサイドレンダリング制御）
  const [mounted, setMounted] = useState(false);
  // ダイアログの表示位置（クリック位置から自動計算）
  const [dialogPosition, setDialogPosition] = useState<{
    top: number;
    left: number;
    showOnRight: boolean;
  } | null>(null);

  // 各フィールドの編集状態管理
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingDate, setEditingDate] = useState(false);
  const [editingTime, setEditingTime] = useState(false);
  const [editingMemo, setEditingMemo] = useState(false);
  const [editingLocation, setEditingLocation] = useState(false);

  // フォーム入力値（編集中の一時的な値を保持）
  const [titleValue, setTitleValue] = useState(item.title);
  const [startDateValue, setStartDateValue] = useState<Date>(
    safeDate(item.start),
  );
  const [endDateValue, setEndDateValue] = useState<Date | null>(
    item.end ? safeDate(item.end) : null,
  );
  const [startTimeValue, setStartTimeValue] = useState("09:00");
  const [endTimeValue, setEndTimeValue] = useState("10:00");
  const [memoValue, setMemoValue] = useState(item.memo ?? "");
  const [locationValue, setLocationValue] = useState(item.location ?? "");
  const [isAllDayValue, setIsAllDayValue] = useState(false);

  // 変更検知フラグ（自動保存のトリガー判定に使用）
  const [isTitleDirty, setIsTitleDirty] = useState(false);
  const [isDateTimeDirty, setIsDateTimeDirty] = useState(false);
  const [isMemoDirty, setIsMemoDirty] = useState(false);
  const [isLocationDirty, setIsLocationDirty] = useState(false);
  // 保存中フラグ（二重送信防止とUI表示用）
  const [isSaving, setIsSaving] = useState(false);
  // バリデーションエラーメッセージ
  const [dateTimeErrors, setDateTimeErrors] = useState<{
    [key: string]: string;
  }>({});

  // 時刻編集エリアのref（フォーカス管理用）
  const timeEditRef = useRef<HTMLDivElement>(null);
  // 時刻入力フィールド用の ref
  const startTimeRef = useRef<HTMLInputElement | null>(null);
  const endTimeRef = useRef<HTMLInputElement | null>(null);
  // 日付入力フィールド用の ref
  const startDateRef = useRef<HTMLInputElement | null>(null);
  const endDateRef = useRef<HTMLInputElement | null>(null);

  // 削除中フラグ（削除時は自動保存をスキップ）
  const [isDeleting, setIsDeleting] = useState(false);

  // 時刻編集開始時の元の値（バリデーションエラー時に復元用）
  const [originalTime, setOriginalTime] = useState<{
    start: string;
    end: string;
  } | null>(null);

  // 終日切り替え時の時刻バックアップ
  const [backupTime, setBackupTime] = useState<{
    start: string;
    end: string;
  } | null>(null);

  // ダイアログ要素のref
  const dialogRef = useRef<HTMLDivElement>(null);

  // ==================== ユーティリティ関数 ====================
  // 開始・終了日時から終日イベントかどうかを判定
  const isAllDayFromRange = useCallback((start: Date, end: Date | null) => {
    if (!end) return false;
    return (
      start.getHours() === 0 &&
      start.getMinutes() === 0 &&
      start.getSeconds() === 0 &&
      end.getHours() === 23 &&
      end.getMinutes() === 59 &&
      end.getSeconds() === 59
    );
  }, []);

  // Date型を時刻文字列（HH:mm）にフォーマット
  const formatTime = useCallback((date: Date) => {
    const h = String(date.getHours()).padStart(2, "0");
    const m = String(date.getMinutes()).padStart(2, "0");
    return `${h}:${m}`;
  }, []);

  // 日付と時刻文字列を結合してDate型を生成
  const combineDateAndTime = useCallback(
    (date: Date, timeStr: string): Date => {
      if (!timeStr) {
        return new Date(date);
      }
      const parts = timeStr.split(":");
      if (parts.length !== 2) {
        return new Date(date);
      }
      const [hStr, mStr] = parts;
      const h = Number(hStr);
      const m = Number(mStr);
      if (
        !Number.isFinite(h) ||
        !Number.isFinite(m) ||
        h < 0 ||
        h > 23 ||
        m < 0 ||
        m > 59
      ) {
        return new Date(date);
      }
      const result = new Date(date);
      result.setHours(h, m, 0, 0);
      return result;
    },
    [],
  );

  /**
   * 日時バリデーション
   * 終日イベント: 終了日が開始日以降であることをチェック
   * 時間指定イベント: 終了日時が開始日時より後であることをチェック
   */
  const validateDateTime = useCallback((): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (isAllDayValue) {
      const endDate = endDateValue || startDateValue;
      if (endDate.getTime() < startDateValue.getTime()) {
        newErrors.allDayDate = "終了日は開始日以降である必要があります";
      }
    } else {
      if (!startTimeValue) {
        newErrors.startTime = "開始時刻を入力してください";
      }
      if (!endTimeValue) {
        newErrors.endTime = "終了時刻を入力してください";
      }

      if (startTimeValue && endTimeValue) {
        const start = combineDateAndTime(startDateValue, startTimeValue);
        const end = combineDateAndTime(startDateValue, endTimeValue);
        if (end.getTime() <= start.getTime()) {
          newErrors.endTime = "終了日時は開始日時より後である必要があります";
        }
      }
    }

    setDateTimeErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [
    isAllDayValue,
    endDateValue,
    startDateValue,
    startTimeValue,
    endTimeValue,
    combineDateAndTime,
  ]);

  // ==================== 初期化処理 ====================
  // itemプロップが変更されたときにフォーム値と状態をリセット
  useEffect(() => {
    const initialStart = safeDate(item.start);
    const initialEnd = item.end ? safeDate(item.end) : null;

    setTitleValue(item.title);
    setMemoValue(item.memo ?? "");
    setLocationValue(item.location ?? "");
    setStartDateValue(initialStart);
    setEndDateValue(initialEnd);
    setStartTimeValue(formatTime(initialStart));
    setEndTimeValue(initialEnd ? formatTime(initialEnd) : "10:00");
    setIsAllDayValue(isAllDayFromRange(initialStart, initialEnd));

    setEditingTitle(false);
    setEditingDate(false);
    setEditingTime(false);
    setEditingMemo(false);
    setEditingLocation(false);

    setIsTitleDirty(false);
    setIsDateTimeDirty(false);
    setIsMemoDirty(false);
    setIsLocationDirty(false);
    setDateTimeErrors({});

    setBackupTime(null);
  }, [item, formatTime, isAllDayFromRange]);

  /**
   * 終日設定変更時の日付自動調整
   * 終日ON: 終了日を設定（未設定の場合は開始日と同じ）
   * 終日OFF: 終了日をクリア（時刻で管理するため）
   */
  useEffect(() => {
    if (!editingDate) return; // 編集中のみ調整

    if (!isAllDayValue) {
      // 終日をオフにした場合、日付を固定
      setEndDateValue(null);
    } else {
      // 終日をオンにした場合、終了日を設定
      if (!endDateValue) {
        setEndDateValue(startDateValue);
      }
    }
  }, [isAllDayValue, editingDate, startDateValue, endDateValue]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const formatDateInput = (target: Date) => {
    const y = target.getFullYear();
    const m = String(target.getMonth() + 1).padStart(2, "0");
    const d = String(target.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  const parseDateInput = (value: string) => {
    const parts = value.split("-");
    if (parts.length !== 3) {
      return new Date(NaN);
    }
    const [yStr, mStr, dStr] = parts;
    const y = Number(yStr);
    const m = Number(mStr);
    const d = Number(dStr);
    if (!Number.isInteger(y) || !Number.isInteger(m) || !Number.isInteger(d)) {
      return new Date(NaN);
    }
    if (m < 1 || m > 12 || d < 1 || d > 31) {
      return new Date(NaN);
    }
    return new Date(y, m - 1, d);
  };

  /**
   * 自動保存処理
   * ポップオーバーを閉じる際や編集完了時に呼び出される
   * ダーティフラグが立っているフィールドのみを更新対象とする
   *
   * 本番環境への切り替え手順:
   * 1. 親コンポーネントでonUpdateプロップに実際のAPI呼び出しを実装
   * 2. API: PUT /api/calendars/{calendarId}/events/{eventId}
   * 3. リクエストボディ: { title?, startTime?, endTime?, isAllDay?, memo?, location? }
   * 4. レスポンスでイベントデータを更新し、親コンポーネントで状態を同期
   */
  const handleAutoSave = useCallback(async () => {
    if (!isMemoDirty && !isLocationDirty && !isTitleDirty && !isDateTimeDirty) {
      return;
    }

    setIsSaving(true);
    try {
      const updates: {
        memo?: string;
        location?: string;
        title?: string;
        startTime?: string;
        endTime?: string;
        isAllDay?: boolean;
      } = {};

      if (isMemoDirty) {
        updates.memo = memoValue;
      }
      if (isLocationDirty) {
        updates.location = locationValue;
      }
      if (isTitleDirty) {
        updates.title = titleValue;
      }
      if (isDateTimeDirty) {
        if (!validateDateTime()) {
          toast.error("日時の入力内容にエラーがあります");
          return;
        }

        if (isAllDayValue) {
          const start = new Date(startDateValue);
          start.setHours(0, 0, 0, 0);
          const end = new Date(endDateValue ?? startDateValue);
          end.setHours(23, 59, 59, 999);
          updates.startTime = start.toISOString();
          updates.endTime = end.toISOString();
        } else {
          const start = combineDateAndTime(startDateValue, startTimeValue);
          const end = endTimeValue
            ? combineDateAndTime(startDateValue, endTimeValue)
            : null;
          updates.startTime = start.toISOString();
          updates.endTime = end?.toISOString();
        }
      }

      await onUpdate?.(updates);
      toast.success("変更が保存されました");
      setIsMemoDirty(false);
      setIsLocationDirty(false);
      setIsTitleDirty(false);
      setIsDateTimeDirty(false);
    } catch (error) {
      toast.error("保存に失敗しました");
      console.error("Save error:", error);
    } finally {
      setIsSaving(false);
    }
  }, [
    isMemoDirty,
    isLocationDirty,
    isTitleDirty,
    isDateTimeDirty,
    memoValue,
    locationValue,
    titleValue,
    startDateValue,
    endDateValue,
    startTimeValue,
    endTimeValue,
    isAllDayValue,
    onUpdate,
    validateDateTime,
    combineDateAndTime,
  ]);

  // ダイアログ位置計算
  const calculatePosition = useCallback(() => {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    const showOnRight = anchorPosition.x < viewportWidth / 2;

    let left: number;
    if (showOnRight) {
      left = anchorPosition.x + MARGIN;
      if (left + DIALOG_WIDTH + MARGIN > viewportWidth) {
        left = viewportWidth - DIALOG_WIDTH - MARGIN;
      }
    } else {
      left = anchorPosition.x - DIALOG_WIDTH - MARGIN;
      if (left < MARGIN) {
        left = MARGIN;
      }
    }

    let top = anchorPosition.y - DIALOG_HEIGHT / 2;
    if (top < MARGIN) {
      top = MARGIN;
    }
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

  // ==================== イベントハンドラー ====================
  // タイトル編集終了
  const handleStopEditingTitle = useCallback(() => {
    setEditingTitle(false);
  }, []);

  /**
   * 時刻編集終了
   * バリデーションエラーがある場合は元の値に戻す
   */
  const handleStopEditingTime = useCallback(() => {
    if (!validateDateTime()) {
      if (originalTime) {
        setStartTimeValue(originalTime.start);
        setEndTimeValue(originalTime.end);
      }
      setDateTimeErrors({});
      setIsDateTimeDirty(false);
    }

    setEditingTime(false);
  }, [originalTime, validateDateTime]);

  /**
   * ポップオーバーを閉じる処理
   * 1. 時刻編集中の場合は編集を終了
   * 2. 削除中でない場合、未保存の変更があれば自動保存
   * 3. 親コンポーネントのonCloseを呼び出し
   */
  const handleClose = useCallback(async () => {
    if (editingTime) {
      handleStopEditingTime();
    }

    if (!isDeleting) {
      if (isMemoDirty || isLocationDirty || isTitleDirty || isDateTimeDirty) {
        await handleAutoSave();
      }
    }

    onClose();
  }, [
    isDeleting,
    isMemoDirty,
    isLocationDirty,
    isTitleDirty,
    isDateTimeDirty,
    handleAutoSave,
    onClose,
    editingTime,
    handleStopEditingTime,
  ]);

  // Escキーでポップオーバーを閉じる（アクセシビリティ対応）
  useEffect(() => {
    if (!isOpen) return;

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        handleClose();
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => {
      window.removeEventListener("keydown", handleKey);
    };
  }, [isOpen, handleClose]);

  // ==================== レンダリング ====================
  // クライアントサイドマウント前、非表示時、位置未計算時は何も表示しない
  if (!mounted || !isOpen || !dialogPosition) {
    return null;
  }

  // 表示データの準備
  const headerColor = item.calendarColor ?? "#1e293b";
  const dateLabel = formatEventDateLabel(startDateValue, endDateValue);
  const timeLabel = isAllDayValue
    ? "終日"
    : startTimeValue && endTimeValue
      ? `${startTimeValue} 〜 ${endTimeValue}`
      : "";
  const members = item.members ?? [];
  const calendarName = item.calendarName?.trim().length
    ? item.calendarName
    : "カレンダー";

  // スライドアニメーションの方向（右から来るか左から来るか）
  const slideDirection = dialogPosition.showOnRight
    ? "animate-slide-in-right"
    : "animate-slide-in-left";

  return createPortal(
    // biome-ignore lint/a11y/noStaticElementInteractions: Backdrop overlay for closing dialog
    <div
      className="fixed inset-0 z-50"
      onClick={handleClose}
      onKeyDown={(e) => {
        if (e.key === "Escape") handleClose();
      }}
      role="presentation"
    >
      <div
        ref={dialogRef}
        className={`absolute w-[380px] max-w-[calc(100vw-32px)] overflow-hidden rounded-2xl border border-border bg-popover text-popover-foreground shadow-2xl backdrop-blur-sm ${slideDirection}`}
        style={{
          top: dialogPosition.top,
          left: dialogPosition.left,
        }}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* biome-ignore lint/a11y/noStaticElementInteractions: Header click to cancel editing mode */}
        <div
          className="relative flex flex-col gap-2.5 px-5 py-4 text-foreground"
          style={{ backgroundColor: headerColor }}
          onClick={() => {
            setEditingTitle(false);
            setEditingDate(false);
            setEditingTime(false);
            setEditingMemo(false);
            setEditingLocation(false);
          }}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              setEditingTitle(false);
              setEditingDate(false);
              setEditingTime(false);
              setEditingMemo(false);
              setEditingLocation(false);
            }
          }}
        >
          <div className="pr-24">
            {editingTitle ? (
              <Input
                value={titleValue}
                onChange={(e) => {
                  setTitleValue(e.target.value);
                  setIsTitleDirty(true);
                }}
                onBlur={handleStopEditingTitle}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleStopEditingTitle();
                  }
                }}
                onClick={(e) => e.stopPropagation()}
                className="h-8 text-xs bg-transparent text-white border-white/50 focus:border-white/70 focus:bg-white/10"
                placeholder="タイトルを入力"
                autoFocus
              />
            ) : (
              <Text
                as="h2"
                weight="semibold"
                className="pr-24 text-lg leading-tight text-white mix-blend-plus-lighter cursor-pointer hover:text-white/90"
                onClick={(e) => {
                  e.stopPropagation();
                  setEditingDate(false);
                  setEditingTime(false);
                  setEditingMemo(false);
                  setEditingLocation(false);
                  setEditingTitle(true);
                }}
              >
                {isTitleDirty ? titleValue : item.title}
              </Text>
            )}
          </div>
          <div className="flex items-center gap-2 text-sm text-white/90 mix-blend-plus-lighter">
            <Icon icon={CalendarDays} size="sm" className="text-white/80" />
            {editingDate ? (
              <div
                className="flex flex-col gap-1"
                onClick={(e) => e.stopPropagation()}
                role="group"
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    e.stopPropagation();
                    setEditingDate(false);
                  }
                }}
              >
                {Object.keys(dateTimeErrors).length > 0 && (
                  <div className="rounded-md bg-destructive/15 border border-destructive/30 p-2">
                    <ul className="space-y-1 text-xs text-destructive font-medium">
                      {Object.entries(dateTimeErrors).map(([key, error]) => (
                        <li key={key}>• {error}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {isAllDayValue ? (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Text
                        as="label"
                        size="sm"
                        className="block text-white/80"
                      >
                        開始日
                      </Text>
                      <Input
                        ref={startDateRef}
                        type="date"
                        value={formatDateInput(startDateValue)}
                        onChange={(e) => {
                          const next = parseDateInput(e.target.value);
                          if (!Number.isNaN(next.getTime())) {
                            setStartDateValue(next);
                            setIsDateTimeDirty(true);
                            if (
                              endDateValue &&
                              endDateValue.getTime() < next.getTime()
                            ) {
                              setEndDateValue(next);
                            }
                          }
                        }}
                        onClick={(e) => {
                          e.currentTarget.showPicker();
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.currentTarget.showPicker();
                          }
                        }}
                        className="h-8 text-xs bg-transparent text-white border-white/50 focus:border-white/70 focus:bg-gray-900/70"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Text
                        as="label"
                        size="sm"
                        className="block text-white/80"
                      >
                        終了日
                      </Text>
                      <Input
                        ref={endDateRef}
                        type="date"
                        value={formatDateInput(endDateValue || startDateValue)}
                        onChange={(e) => {
                          const next = parseDateInput(e.target.value);
                          if (!Number.isNaN(next.getTime())) {
                            if (next.getTime() < startDateValue.getTime()) {
                              setEndDateValue(startDateValue);
                            } else {
                              setEndDateValue(next);
                            }
                            setIsDateTimeDirty(true);
                          }
                        }}
                        onClick={(e) => {
                          e.currentTarget.showPicker();
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.currentTarget.showPicker();
                          }
                        }}
                        className="h-8 text-xs bg-transparent text-white border-white/50 focus:border-white/70 focus:bg-white/10"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <Text as="label" size="sm" className="block text-white/80">
                      日付
                    </Text>
                    <Input
                      ref={startDateRef}
                      type="date"
                      value={formatDateInput(startDateValue)}
                      onChange={(e) => {
                        const next = parseDateInput(e.target.value);
                        if (!Number.isNaN(next.getTime())) {
                          setStartDateValue(next);
                          setIsDateTimeDirty(true);
                        }
                      }}
                      onClick={(e) => {
                        e.currentTarget.showPicker();
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.currentTarget.showPicker();
                        }
                      }}
                      className="h-8 text-xs bg-transparent text-white border-white/50 focus:border-white/70 focus:bg-white/10"
                    />
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Switch
                    className="data-[state=unchecked]:bg-white/35 data-[state=unchecked]:hover:bg-white/45 data-[state=checked]:bg-white/10 data-[state=checked]:hover:bg-white/20"
                    checked={isAllDayValue}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        // ===== 通常 → 終日 =====
                        // 今の時刻をバックアップ
                        if (startTimeValue && endTimeValue) {
                          setBackupTime({
                            start: startTimeValue,
                            end: endTimeValue,
                          });
                        }
                        setIsAllDayValue(true);
                        // 終日用の日付設定
                        if (!endDateValue) {
                          setEndDateValue(startDateValue);
                        }
                      } else {
                        // ===== 終日 → 通常 =====
                        setIsAllDayValue(false);
                        // バックアップした時刻を復元
                        if (backupTime) {
                          setStartTimeValue(backupTime.start);
                          setEndTimeValue(backupTime.end);
                          setBackupTime(null);
                        } else {
                          // 元が終日イベントだった場合 → 今の時刻から作る
                          const now = roundUpTo5Minutes(new Date());
                          const end = new Date(now);
                          end.setHours(end.getHours() + 1);

                          setStartTimeValue(formatTimeHM(now));
                          setEndTimeValue(formatTimeHM(end));
                        }
                      }
                      setIsDateTimeDirty(true);
                    }}
                  />
                  <Label className="text-xs text-white/80">終日</Label>
                </div>
              </div>
            ) : (
              <button
                type="button"
                className="cursor-pointer hover:text-white"
                onClick={(e) => {
                  e.stopPropagation();
                  setEditingTitle(false);
                  setEditingTime(false);
                  setEditingMemo(false);
                  setEditingLocation(false);
                  setEditingDate(true);
                }}
              >
                {dateLabel}
              </button>
            )}
          </div>
          {!isAllDayValue && (
            <div
              className="flex items-center gap-2 text-sm text-white/85 mix-blend-plus-lighter"
              ref={timeEditRef}
            >
              <Icon icon={Clock3} size="sm" className="text-white/75" />
              {editingTime ? (
                <div
                  className="flex gap-2"
                  onClick={(e) => e.stopPropagation()}
                  onKeyDown={(e) => e.stopPropagation()}
                  role="group"
                >
                  <Input
                    ref={startTimeRef}
                    type="time"
                    value={startTimeValue}
                    onChange={(e) => {
                      setStartTimeValue(e.target.value);
                      setIsDateTimeDirty(true);
                    }}
                    onBlur={(e) => {
                      const nextFocused = e.relatedTarget as Node | null;
                      if (timeEditRef.current?.contains(nextFocused)) {
                        return;
                      }
                      handleStopEditingTime();
                    }}
                    className="h-8 flex-1 text-xs bg-transparent text-white border-white/50 focus:border-white/70 focus:bg-white/10"
                    onClick={(e) => {
                      e.currentTarget.showPicker();
                    }}
                  />
                  <span className="text-white/60">-</span>
                  <Input
                    ref={endTimeRef}
                    type="time"
                    value={endTimeValue}
                    onChange={(e) => {
                      setEndTimeValue(e.target.value);
                      setIsDateTimeDirty(true);
                    }}
                    onBlur={(e) => {
                      const nextFocused = e.relatedTarget as Node | null;
                      if (timeEditRef.current?.contains(nextFocused)) {
                        return;
                      }
                      handleStopEditingTime();
                    }}
                    className="h-8 flex-1 text-xs bg-transparent text-white border-white/50 focus:border-white/70 focus:bg-white/10"
                    onClick={(e) => {
                      e.currentTarget.showPicker();
                    }}
                  />
                </div>
              ) : (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingTime(true);
                    setEditingTitle(false);
                    setEditingDate(false);
                    setEditingMemo(false);
                    setEditingLocation(false);
                    setOriginalTime({
                      start: startTimeValue,
                      end: endTimeValue,
                    });
                    setTimeout(() => startTimeRef.current?.focus(), 0);
                  }}
                  className="cursor-pointer hover:text-white"
                >
                  {timeLabel}
                </button>
              )}
            </div>
          )}
          {/* 削除ボタン（本番環境: onDeleteで DELETE /api/calendars/{id}/events/{eventId} を呼び出し） */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={async (e) => {
              e.stopPropagation();
              setIsDeleting(true);
              try {
                await onDelete?.();
              } catch {
                // エラーはポップオーバーで処理済み
              } finally {
                onClose();
              }
            }}
            aria-label="削除"
            className="absolute right-12 top-3 h-8 w-8 rounded-full text-white/80 hover:bg-white/20 hover:text-red-600 dark:hover:text-red-400"
          >
            <Icon icon={Trash} size="sm" />
          </Button>
          {isSaving && (
            <div
              className="absolute right-3 top-3 flex items-center gap-1 text-white/80"
              role="status"
            >
              <Icon icon={Loader2} size="sm" className="animate-spin" />
              <span className="text-xs">保存中...</span>
            </div>
          )}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              handleClose();
            }}
            aria-label="閉じる"
            className="absolute right-3 top-3 h-8 w-8 rounded-full text-white/80 hover:bg-white/20 hover:text-white"
          >
            <Icon icon={X} size="sm" />
          </Button>
        </div>
        {/* biome-ignore lint/a11y/noStaticElementInteractions: Details card for displaying event information */}
        <div
          className="max-h-[300px] space-y-4 overflow-y-auto px-5 py-4 text-sm text-foreground"
          onClick={() => {
            setEditingTitle(false);
            setEditingDate(false);
            setEditingTime(false);
            setEditingMemo(false);
            setEditingLocation(false);
          }}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              e.stopPropagation();
            }
          }}
          role="presentation"
          tabIndex={-1}
        >
          {item.memo ? (
            <div className="flex items-start gap-2 text-muted-foreground">
              <Icon
                icon={NotebookPen}
                size="sm"
                className="mt-0.5 text-muted-foreground/70"
              />
              {editingMemo ? (
                <div
                  className="flex flex-1 flex-col gap-2"
                  onClick={(e) => e.stopPropagation()}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") {
                      e.stopPropagation();
                      setEditingMemo(false);
                    }
                  }}
                  role="group"
                >
                  <Textarea
                    value={memoValue}
                    onChange={(e) => {
                      setMemoValue(e.target.value);
                      setIsMemoDirty(true);
                    }}
                    placeholder="メモを入力"
                    className="min-h-[80px] resize-none text-sm"
                    autoFocus
                  />
                </div>
              ) : (
                <Text
                  as="p"
                  size="sm"
                  className="cursor-pointer whitespace-pre-wrap leading-relaxed text-foreground transition-colors hover:text-foreground/80"
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingTitle(false);
                    setEditingDate(false);
                    setEditingTime(false);
                    setEditingLocation(false);
                    setEditingMemo(true);
                  }}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      setEditingMemo(true);
                    }
                  }}
                >
                  {isMemoDirty ? memoValue : item.memo}
                </Text>
              )}
            </div>
          ) : null}

          {item.location ? (
            <div className="flex items-start gap-2 text-muted-foreground">
              <Icon
                icon={MapPin}
                size="sm"
                className="mt-0.5 text-muted-foreground/70"
              />
              {editingLocation ? (
                // biome-ignore lint/a11y/noStaticElementInteractions: Location editing container with keyboard support
                <div
                  className="flex flex-1 flex-col gap-2"
                  onClick={(e) => e.stopPropagation()}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") {
                      e.stopPropagation();
                      setEditingLocation(false);
                    }
                  }}
                  tabIndex={-1}
                >
                  <Input
                    value={locationValue}
                    onChange={(e) => {
                      setLocationValue(e.target.value);
                      setIsLocationDirty(true);
                    }}
                    placeholder="場所を入力"
                    className="text-sm"
                    autoFocus
                  />
                </div>
              ) : (
                <div
                  className="flex flex-1 cursor-pointer flex-col gap-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingTitle(false);
                    setEditingDate(false);
                    setEditingTime(false);
                    setEditingMemo(false);
                    setEditingLocation(true);
                  }}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      setEditingLocation(true);
                    }
                  }}
                >
                  <Text
                    as="span"
                    size="sm"
                    className="leading-relaxed text-foreground transition-colors hover:text-foreground/80"
                  >
                    {isLocationDirty ? locationValue : item.location}
                  </Text>
                  {item.locationUrl ? (
                    <a
                      href={item.locationUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-primary underline hover:text-primary/80"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {item.locationUrl}
                    </a>
                  ) : null}
                </div>
              )}
            </div>
          ) : null}

          {members.length ? (
            <div className="flex items-start gap-2 text-muted-foreground">
              <Icon
                icon={UserCircle2}
                size="sm"
                className="mt-0.5 text-muted-foreground/70"
              />
              <div className="flex flex-wrap gap-1 text-xs text-foreground">
                {renderMembers(members)}
              </div>
            </div>
          ) : null}

          <div className="flex items-center gap-2 text-muted-foreground">
            <Icon
              icon={CalendarDays}
              size="sm"
              className="text-muted-foreground/70"
            />
            <span className="text-xs uppercase tracking-wide text-muted-foreground">
              {calendarName}
            </span>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}

// ==================== ヘルパー関数 ====================
/**
 * 安全なDate変換
 * 無効な日付の場合は現在日時を返す
 */
function safeDate(value: string | Date) {
  const next = new Date(value);
  return Number.isNaN(next.getTime()) ? new Date() : next;
}

/**
 * イベント日付ラベルのフォーマット
 * 同日の場合は開始日のみ、複数日にまたがる場合は範囲表示
 */
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

/**
 * 2つの日付が同じ日かどうかを判定
 */
function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/**
 * 参加メンバーのレンダリング
 * 3人まで表示し、それ以上は"+N"で省略表示
 */
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
        className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground"
      >
        {member}
      </span>
    )),
    <span
      key="more"
      className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground"
    >
      +{remaining}
    </span>,
  ];
}

/**
 * 時刻を5分単位に切り上げ
 * （未使用の可能性あり - 必要に応じて削除可能）
 */
function roundUpTo5Minutes(date: Date) {
  const d = new Date(date);
  const m = d.getMinutes();
  const rounded = Math.ceil(m / 5) * 5;
  d.setMinutes(rounded, 0, 0);
  return d;
}

/**
 * Date型を時刻文字列（HH:mm）にフォーマット
 * （未使用の可能性あり - 必要に応じて削除可能）
 */
function formatTimeHM(date: Date) {
  const h = String(date.getHours()).padStart(2, "0");
  const m = String(date.getMinutes()).padStart(2, "0");
  return `${h}:${m}`;
}
