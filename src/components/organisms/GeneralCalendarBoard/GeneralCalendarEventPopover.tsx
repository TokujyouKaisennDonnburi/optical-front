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

import type { GeneralCalendarBoardItem } from "./GeneralCalendarBoard";

/**
 * 複数カレンダー用のスケジュール詳細ポップオーバー
 * 機能: 詳細表示、タイトル/日付/時刻/メモ/場所のインライン編集、終日切替、自動保存、削除
 * 本番環境: onDelete → DELETE /api/calendars/{calendarId}/events/{eventId}, onUpdate → PUT /api/calendars/{calendarId}/events/{eventId}
 */
export type GeneralCalendarEventPopoverProps = {
  item: GeneralCalendarBoardItem;
  isOpen: boolean;
  onClose: () => void;
  /** クリックした要素の位置情報 */
  anchorPosition: { x: number; y: number };
  /** 削除ボタンクリック時のコールバック */
  onDelete?: () => void;
  /** 更新時のコールバック */
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

export function GeneralCalendarEventPopover({
  item,
  isOpen,
  onClose,
  anchorPosition,
  onDelete,
  onUpdate,
}: GeneralCalendarEventPopoverProps) {
  // ==================== State管理 ====================
  // マウント状態（クライアントサイドレンダリング制御）
  const [mounted, setMounted] = useState(false);
  // ダイアログの表示位置（クリック位置から自動計算）
  const [dialogPosition, setDialogPosition] = useState<{
    top: number;
    left: number;
    showOnRight: boolean;
    vertical: "up" | "down";
  } | null>(null);
  // メモ/場所の編集状態と値
  const [editingMemo, setEditingMemo] = useState(false);
  const [editingLocation, setEditingLocation] = useState(false);
  const [memoValue, setMemoValue] = useState(item.memo ?? "");
  const [locationValue, setLocationValue] = useState(item.location ?? "");
  // 変更検知フラグ（自動保存のトリガー判定）
  const [isMemoDirty, setIsMemoDirty] = useState(false);
  const [isLocationDirty, setIsLocationDirty] = useState(false);
  // 保存中フラグ（二重送信防止とUI表示用）
  const [isSaving, setIsSaving] = useState(false);

  // 編集可能な項目のstate
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingDate, setEditingDate] = useState(false);
  const [editingTime, setEditingTime] = useState(false);
  // フォーム入力値（編集中の一時的な値）
  const [titleValue, setTitleValue] = useState(item.title);
  const [startDateValue, setStartDateValue] = useState<Date>(
    safeDate(item.start),
  );
  const [endDateValue, setEndDateValue] = useState<Date | null>(
    item.end ? safeDate(item.end) : null,
  );
  const [startTimeValue, setStartTimeValue] = useState("09:00");
  const [endTimeValue, setEndTimeValue] = useState("10:00");
  // 変更検知フラグ（自動保存のトリガー判定）
  const [isTitleDirty, setIsTitleDirty] = useState(false);
  const [isDateTimeDirty, setIsDateTimeDirty] = useState(false);
  // バリデーションエラー保持
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

  const [isAllDayValue, setIsAllDayValue] = useState(false);
  // タイトルがスクロール可能かどうか
  const [isTitleScrollable, setIsTitleScrollable] = useState(false);

  // 時刻編集開始時の元の値（バリデーションエラー時に復元）
  const [originalTime, setOriginalTime] = useState<{
    start: string;
    end: string;
  } | null>(null);

  // 終日切り替え時の時刻バックアップ
  const [backupTime, setBackupTime] = useState<{
    start: string;
    end: string;
  } | null>(null);

  const dialogRef = useRef<HTMLDivElement>(null);
  // タイトルコンテナのref（スクロール状態監視用）
  const titleContainerRef = useRef<HTMLDivElement>(null);

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
      const parts = timeStr.split(":").map(Number);
      const hours = parts[0] ?? 0;
      const minutes = parts[1] ?? 0;
      const result = new Date(date);
      result.setHours(hours, minutes, 0, 0);
      return result;
    },
    [],
  );

  /**
   * 日時バリデーション
   * 終日: 終了日が開始日以降 / 時間指定: 終了時刻が開始より後
   */
  const validateDateTime = useCallback((): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (isAllDayValue) {
      // 終日の日付順チェック
      const endDate = endDateValue || startDateValue;
      if (endDate.getTime() < startDateValue.getTime()) {
        newErrors.allDayDate = "終了日は開始日以降である必要があります";
      }
    } else {
      // 時刻イベントの時刻チェック
      if (!startTimeValue) {
        newErrors.startTime = "開始時刻を入力してください";
      }

      const isBothValidTime = startTimeValue && endTimeValue;
      if (isBothValidTime) {
        const start = combineDateAndTime(startDateValue, startTimeValue);
        const end = combineDateAndTime(startDateValue, endTimeValue);
        if (start.getTime() >= end.getTime()) {
          newErrors.time = "終了時刻は開始時刻より後である必要があります";
        }
      } else if (!endTimeValue) {
        newErrors.endTime = "終了時刻を入力してください";
      }
    }

    setDateTimeErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [
    startTimeValue,
    endTimeValue,
    startDateValue,
    isAllDayValue,
    endDateValue,
    combineDateAndTime,
  ]);

  // 日付フォーマット関数
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

  // ==================== 初期化処理 ====================
  // item変更時にフォーム値と状態をリセット
  useEffect(() => {
    const initialStart = safeDate(item.start);
    const initialEnd = item.end ? safeDate(item.end) : null;

    setMemoValue(item.memo ?? "");
    setLocationValue(item.location ?? "");
    setTitleValue(item.title);

    const isAllDay = isAllDayFromRange(initialStart, initialEnd);
    setIsAllDayValue(isAllDay);

    setStartDateValue(initialStart);
    setEndDateValue(isAllDay ? initialEnd : null);
    setStartTimeValue(formatTime(initialStart));
    setEndTimeValue(initialEnd ? formatTime(initialEnd) : "");

    setEditingMemo(false);
    setEditingLocation(false);
    setEditingTitle(false);
    setEditingDate(false);
    setEditingTime(false);

    setIsMemoDirty(false);
    setIsLocationDirty(false);
    setIsTitleDirty(false);
    setIsDateTimeDirty(false);

    setBackupTime(null);
  }, [item, formatTime, isAllDayFromRange]);

  // 終日設定変更時の日付調整
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

  // ポップオーバー表示時に最新データでフォームをリセット
  useEffect(() => {
    if (isOpen) {
      setMemoValue(item.memo ?? "");
      setLocationValue(item.location ?? "");
      setTitleValue(item.title);
      setStartDateValue(safeDate(item.start));
      setEndDateValue(item.end ? safeDate(item.end) : null);
      setEditingMemo(false);
      setEditingLocation(false);
      setEditingTitle(false);
      setEditingDate(false);
      setEditingTime(false);
      setIsMemoDirty(false);
      setIsLocationDirty(false);
      setIsTitleDirty(false);
      setIsDateTimeDirty(false);
    }
  }, [isOpen, item.memo, item.location, item.title, item.start, item.end]);

  /**
   * 自動保存処理
   * ダーティフラグが立っている項目のみ更新対象にする
   *
   * 本番環境: 親コンポーネントで onUpdate から PUT /api/calendars/{calendarId}/events/{eventId} を呼び出す
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
          let end: Date;
          if (endTimeValue) {
            end = combineDateAndTime(startDateValue, endTimeValue);
          } else {
            end = new Date(start);
            end.setHours(end.getHours() + 1); // デフォルトで1時間後
          }
          updates.startTime = start.toISOString();
          updates.endTime = end.toISOString();
        }
      }

      await onUpdate?.(updates);
      setIsMemoDirty(false);
      setIsLocationDirty(false);
      setIsTitleDirty(false);
      setIsDateTimeDirty(false);
    } catch (error) {
      console.error("Save error:", error);
      throw error;
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
    combineDateAndTime,
    validateDateTime,
  ]);

  const handleStopEditingTitle = useCallback(() => {
    setEditingTitle(false);
  }, []);

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

  // ==================== ダイアログ位置計算 ====================
  // クリック位置を基準に左右どちらかに配置し、画面外にはみ出さないよう調整
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

    // 垂直方向の判定（初期段階では DIALOG_HEIGHT を使用）
    const spaceBelow = viewportHeight - (anchorPosition.y + MARGIN);
    const spaceAbove = anchorPosition.y - MARGIN;
    const showBelow =
      spaceBelow >= DIALOG_HEIGHT + MARGIN || spaceBelow >= spaceAbove;

    let top: number;
    let vertical: "up" | "down";

    if (showBelow) {
      // 下側に表示
      vertical = "down";
      top = anchorPosition.y + MARGIN;
      // 下端からはみ出す場合は上げる
      if (top + DIALOG_HEIGHT + MARGIN > viewportHeight) {
        top = Math.max(MARGIN, viewportHeight - DIALOG_HEIGHT - MARGIN);
      }
    } else {
      // 上側に表示
      vertical = "up";
      top = anchorPosition.y - DIALOG_HEIGHT - MARGIN;
      // 上端からはみ出す場合は下げる
      if (top < MARGIN) {
        top = Math.max(MARGIN, anchorPosition.y - DIALOG_HEIGHT - MARGIN);
        // 画面内に収まるようにクランプ
        if (top + DIALOG_HEIGHT + MARGIN > viewportHeight) {
          top = Math.max(MARGIN, viewportHeight - DIALOG_HEIGHT - MARGIN);
        }
      }
    }

    return { top, left, showOnRight, vertical };
  }, [anchorPosition]);

  const updatePositionWithCurrentHeight = useCallback(() => {
    if (!dialogRef.current) return;

    const dialogHeight = dialogRef.current.offsetHeight;
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;
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

    // 実際のダイアログ高さを使用した垂直方向の判定
    const spaceBelow = viewportHeight - (anchorPosition.y + MARGIN);
    const spaceAbove = anchorPosition.y - MARGIN;
    const showBelow =
      spaceBelow >= dialogHeight + MARGIN || spaceBelow >= spaceAbove;

    let top: number;
    let vertical: "up" | "down";

    if (showBelow) {
      // 下側に表示
      vertical = "down";
      top = anchorPosition.y + MARGIN;
      // 下端からはみ出す場合は上げる
      if (top + dialogHeight + MARGIN > viewportHeight) {
        top = Math.max(MARGIN, viewportHeight - dialogHeight - MARGIN);
      }
    } else {
      // 上側に表示
      vertical = "up";
      top = anchorPosition.y - dialogHeight - MARGIN;
      // 上端からはみ出す場合は下げる
      if (top < MARGIN) {
        top = Math.max(MARGIN, anchorPosition.y - dialogHeight - MARGIN);
        // 画面内に収まるようにクランプ
        if (top + dialogHeight + MARGIN > viewportHeight) {
          top = Math.max(MARGIN, viewportHeight - dialogHeight - MARGIN);
        }
      }
    }

    setDialogPosition({ top, left, showOnRight, vertical });
  }, [anchorPosition]);

  useEffect(() => {
    if (isOpen) {
      setDialogPosition(calculatePosition());

      // ダイアログの実際の高さを測定して位置を再調整
      const timer = setTimeout(() => {
        updatePositionWithCurrentHeight();
      }, 0);

      return () => clearTimeout(timer);
    }
  }, [isOpen, calculatePosition, updatePositionWithCurrentHeight]);

  /**
   * ポップオーバーを閉じる
   * 1. 時刻編集中なら編集終了
   * 2. 削除中でなければ未保存の変更を自動保存
   * 3. 親の onClose を呼び出す
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

  useEffect(() => {
    if (!isOpen) return;

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        handleClose();
      }
    };

    // ウィンドウリサイズ時にダイアログ位置を再計算
    const handleResize = () => {
      updatePositionWithCurrentHeight();
    };

    window.addEventListener("keydown", handleKey);
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("keydown", handleKey);
      window.removeEventListener("resize", handleResize);
    };
  }, [isOpen, handleClose, updatePositionWithCurrentHeight]);

  // タイトル改行後のダイアログ高さ変化を監視して位置を再計算
  useEffect(() => {
    if (!isOpen || !dialogRef.current) return;

    const recalculatePosition = () => {
      updatePositionWithCurrentHeight();
    };

    const resizeObserver = new ResizeObserver(recalculatePosition);
    resizeObserver.observe(dialogRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, [isOpen, updatePositionWithCurrentHeight]);

  // 編集状態の変更時に位置を再計算（requestAnimationFrameでバッチ処理）
  useEffect(() => {
    if (!isOpen) return;

    let rafId: number;
    rafId = requestAnimationFrame(() => {
      updatePositionWithCurrentHeight();
    });

    return () => cancelAnimationFrame(rafId);
  }, [isOpen, updatePositionWithCurrentHeight]);

  // タイトルコンテナのスクロール可能状態を監視
  useEffect(() => {
    const checkTitleScrollable = () => {
      if (titleContainerRef.current) {
        const isScrollable =
          titleContainerRef.current.scrollHeight >
          titleContainerRef.current.clientHeight;
        setIsTitleScrollable(isScrollable);
      }
    };

    // 初期チェック
    checkTitleScrollable();

    // 内容変更時に再チェック
    const observer = new MutationObserver(checkTitleScrollable);
    if (titleContainerRef.current) {
      observer.observe(titleContainerRef.current, {
        childList: true,
        subtree: true,
        characterData: true,
      });
    }

    // ResizeObserverで要素サイズ変化を監視
    const resizeObserver = new ResizeObserver(checkTitleScrollable);
    if (titleContainerRef.current) {
      resizeObserver.observe(titleContainerRef.current);
    }

    return () => {
      observer.disconnect();
      resizeObserver.disconnect();
    };
  }, []);

  // ==================== レンダリング ====================
  // マウント前・非表示・位置未計算の場合は描画しない
  if (!mounted || !isOpen || !dialogPosition) {
    return null;
  }

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
    : "登録カレンダー";

  // スライドアニメーションの方向（左右・上下）
  const horizontalDirection = dialogPosition.showOnRight
    ? "animate-slide-in-right"
    : "animate-slide-in-left";
  const verticalDirection =
    dialogPosition.vertical === "down"
      ? "animate-slide-in-down"
      : "animate-slide-in-up";
  const slideDirection = `${horizontalDirection} ${verticalDirection}`;

  return createPortal(
    // biome-ignore lint/a11y/noStaticElementInteractions: Backdrop overlay for closing dialog on click
    <div
      className="fixed inset-0 z-50"
      onClick={(e) => {
        if ((e.target as HTMLElement).dataset.overlay !== "true") return;
        handleClose();
      }}
      data-overlay="true"
      onKeyDown={(e) => {
        if (e.key === "Escape") handleClose();
      }}
      role="presentation"
    >
      <div
        ref={dialogRef}
        className={`absolute flex max-h-[55vh] w-[380px] max-w-[calc(100vw-32px)] flex-col overflow-hidden rounded-2xl border border-border bg-popover text-popover-foreground shadow-2xl backdrop-blur-sm ${slideDirection}`}
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
          className="relative flex flex-shrink-0 flex-col gap-2.5 px-5 py-4 text-foreground"
          style={{ backgroundColor: headerColor }}
          onClick={() => {
            // ヘッダーのクリックで全ての編集モードをキャンセル
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
          <div
            ref={titleContainerRef}
            className={`max-h-[3.5rem] overflow-y-auto pr-24 ${
              isTitleScrollable
                ? "[&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/30 [&::-webkit-scrollbar-thumb]:rounded"
                : "[&::-webkit-scrollbar]:hidden"
            }`}
          >
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
                className="text-lg leading-tight text-white mix-blend-plus-lighter cursor-pointer hover:text-white/90 whitespace-pre-wrap break-words"
                onClick={(e) => {
                  e.stopPropagation();
                  setEditingDate(false);
                  setEditingTime(false);
                  setEditingMemo(false);
                  setEditingLocation(false);

                  setEditingTitle(true);
                }}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    setEditingTitle(true);
                  }
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
                className="flex flex-col gap-1 appearance-none border-none bg-transparent p-0 text-left cursor-auto"
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    e.stopPropagation();
                    setEditingDate(false);
                  }
                }}
                role="group"
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
                          if (
                            next instanceof Date &&
                            !Number.isNaN(next.getTime())
                          ) {
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
                          if (
                            next instanceof Date &&
                            !Number.isNaN(next.getTime())
                          ) {
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
                  // ===== 通常予定の場合（開始日のみ編集可） =====
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
                        if (
                          next instanceof Date &&
                          !Number.isNaN(next.getTime())
                        ) {
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
                        setEndDateValue(null);

                        if (backupTime) {
                          // 元が通常イベントだった場合 → 復元
                          setStartTimeValue(backupTime.start);
                          setEndTimeValue(backupTime.end);
                        } else if (originalTime) {
                          // 初期値がある場合はそれを復元
                          setStartTimeValue(originalTime.start);
                          setEndTimeValue(originalTime.end);
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
          {/* 削除ボタン（本番環境: onDelete で DELETE /api/calendars/{id}/events/{eventId} を呼び出す） */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={async (e) => {
              e.stopPropagation();
              if (!onDelete) return;

              setIsDeleting(true);
              try {
                await onDelete(); // 非同期対応
                onClose(); // 削除完了後に閉じる
              } catch (err) {
                console.error(err);
              } finally {
                setIsDeleting(false);
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
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  e.stopPropagation();
                }
              }}
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

        {/* biome-ignore lint/a11y/noStaticElementInteractions: Details card click to cancel editing mode */}
        <div
          className="flex-1 space-y-4 overflow-y-auto px-5 py-4 text-sm text-foreground"
          onClick={() => {
            // 詳細カードのクリックで全ての編集モードをキャンセル
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
        >
          <div className="flex items-start gap-2">
            <Icon
              icon={NotebookPen}
              size="sm"
              className="mt-0.5 flex-shrink-0 text-muted-foreground/70"
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
                  placeholder="メモを追加…"
                  className="min-h-[80px] resize-none text-sm"
                  autoFocus
                />
              </div>
            ) : (
              <Text
                as="p"
                size="sm"
                className={`cursor-pointer whitespace-pre-wrap break-words leading-relaxed transition-colors hover:text-foreground/80 ${
                  (isMemoDirty ? memoValue : item.memo)?.trim()
                    ? "text-foreground"
                    : "text-muted-foreground italic"
                }`}
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
                {(isMemoDirty ? memoValue : item.memo)?.trim() || "メモを追加…"}
              </Text>
            )}
          </div>

          <div className="flex items-start gap-2">
            <Icon
              icon={MapPin}
              size="sm"
              className="mt-0.5 flex-shrink-0 text-muted-foreground/70"
            />
            {editingLocation ? (
              <button
                type="button"
                className="flex flex-1 flex-col gap-2 appearance-none border-none bg-transparent p-0 text-left cursor-auto"
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    e.stopPropagation();
                    setEditingLocation(false);
                  }
                }}
              >
                <Input
                  value={locationValue}
                  onChange={(e) => {
                    setLocationValue(e.target.value);
                    setIsLocationDirty(true);
                  }}
                  placeholder="場所を追加…"
                  className="text-sm"
                  autoFocus
                />
              </button>
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
                  className={`leading-relaxed whitespace-pre-wrap break-words transition-colors hover:text-foreground/80 ${
                    (isLocationDirty ? locationValue : item.location)?.trim()
                      ? "text-foreground"
                      : "text-muted-foreground italic"
                  }`}
                >
                  {(isLocationDirty ? locationValue : item.location)?.trim() ||
                    "場所を追加…"}
                </Text>
                {(isLocationDirty ? locationValue : item.location)?.trim() &&
                item.locationUrl ? (
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
              {calendarName || "メインカレンダー"}
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
 * 安全なDate変換（無効な日付は現在日時にフォールバック）
 */
function safeDate(value: string | Date) {
  const next = new Date(value);
  return Number.isNaN(next.getTime()) ? new Date() : next;
}

/**
 * イベント日付ラベルのフォーマット
 * 同日: 開始日のみ表示 / 複数日: 範囲表示
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
 * 2つの日付が同じ日か判定
 */
function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/**
 * 参加メンバーのレンダリング（3人超は"+N"で省略）
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
 * 時刻を5分単位に切り上げ（終日→通常切替時の初期値に利用）
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
 */
function formatTimeHM(date: Date) {
  const h = String(date.getHours()).padStart(2, "0");
  const m = String(date.getMinutes()).padStart(2, "0");
  return `${h}:${m}`;
}
