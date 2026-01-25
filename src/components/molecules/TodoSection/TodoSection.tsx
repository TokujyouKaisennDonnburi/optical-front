"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Plus, Trash2 } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";
import { Text } from "@/components/atoms/Text";
import { TodoItem } from "@/components/molecules/TodoItem";
import type { TodoItem as TodoItemType } from "@/types/todo";
import { cn } from "@/utils_constants_styles/utils";

export interface TodoSectionProps {
  id: string;
  title: string;
  items: TodoItemType[];
  isExpanded?: boolean;
  onToggleExpand?: (id: string) => void;
  onToggleItem?: (itemId: string, itemName: string, isDone: boolean) => void;
  onAddTask?: (sectionId: string) => void;
  onEditItem?: (itemId: string, newName: string) => void;
  onDeleteItem?: (itemId: string) => void;
  onEditSection?: (id: string, newName: string) => void;
  onDeleteSection?: (id: string) => void;
  className?: string;
}

export function TodoSection({
  id,
  title,
  items,
  isExpanded = true,
  onToggleExpand,
  onToggleItem,
  onAddTask,
  onEditItem,
  onDeleteItem,
  onEditSection,
  onDeleteSection,
  className,
}: TodoSectionProps) {
  const completedCount = items.filter((item) => item.isDone).length;
  const totalCount = items.length;

  // インライン編集の状態
  const [isEditing, setIsEditing] = React.useState(false);
  const [editValue, setEditValue] = React.useState(title);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const longPressTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  // タイトルが外部から変更された場合に同期
  React.useEffect(() => {
    if (!isEditing) {
      setEditValue(title);
    }
  }, [title, isEditing]);

  // 編集モードに入る
  const startEdit = React.useCallback(() => {
    if (onEditSection) {
      setIsEditing(true);
    }
  }, [onEditSection]);

  // 編集モードに入ったらフォーカスを当てる
  React.useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  // 長押し開始
  const handleMouseDown = React.useCallback(
    (e: React.MouseEvent) => {
      if (!onEditSection) return;
      e.stopPropagation();
      longPressTimerRef.current = setTimeout(() => {
        startEdit();
      }, 300); // 300msの長押し
    },
    [onEditSection, startEdit],
  );

  // 長押しキャンセル
  const handleMouseUp = React.useCallback(() => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  }, []);

  // マウスが離れた場合もキャンセル
  const handleMouseLeave = React.useCallback(() => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  }, []);

  // 保存処理
  const handleSave = React.useCallback(() => {
    const trimmedValue = editValue.trim();
    if (trimmedValue && trimmedValue !== title) {
      onEditSection?.(id, trimmedValue);
    } else {
      setEditValue(title);
    }
    setIsEditing(false);
  }, [editValue, title, id, onEditSection]);

  // Enterキーで保存、Escapeでキャンセル
  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleSave();
      } else if (e.key === "Escape") {
        e.preventDefault();
        setEditValue(title);
        setIsEditing(false);
      }
    },
    [handleSave, title],
  );

  // フォーカスが外れたときも保存
  const handleBlur = React.useCallback(() => {
    handleSave();
  }, [handleSave]);

  return (
    <div
      className={cn(
        "rounded-xl overflow-hidden",
        "bg-gradient-to-br from-card/80 to-card/40",
        "border border-border/60 shadow-sm",
        "transition-all duration-200",
        className,
      )}
    >
      {/* ヘッダー */}
      <div
        className={cn(
          "group flex items-center gap-2 px-4 py-3",
          "bg-muted/30 hover:bg-muted/50",
          "transition-colors duration-200",
        )}
        onMouseLeave={handleMouseLeave}
        role="group"
      >
        {isEditing ? (
          // 編集モード
          <div className="flex-1 flex items-center gap-2">
            <Input
              ref={inputRef}
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={handleBlur}
              onClick={(e) => e.stopPropagation()}
              className={cn(
                "flex-1 h-8 px-2 py-1 text-sm font-semibold",
                "bg-background border-primary/50",
                "focus:ring-1 focus:ring-primary/30",
              )}
            />
          </div>
        ) : (
          // 通常表示
          <div
            role="button"
            tabIndex={0}
            className="flex-1 flex items-center gap-2 cursor-pointer min-w-0"
            onClick={() => onToggleExpand?.(id)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onToggleExpand?.(id);
              }
            }}
          >
            <Text
              as="span"
              weight="semibold"
              size="sm"
              className="flex-1 text-left select-none truncate"
              onMouseDown={handleMouseDown}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseLeave}
            >
              {title}
            </Text>

            {/* 削除ボタン（ホバー時のみ表示、カウントの左） */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {onDeleteSection && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteSection(id);
                  }}
                  className={cn(
                    "p-1.5 rounded-md",
                    "text-destructive/60 hover:text-destructive",
                    "hover:bg-destructive/10",
                    "transition-colors",
                  )}
                  title="セクションを削除"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* 進捗表示 */}
            {totalCount > 0 && (
              <Text
                as="span"
                size="sm"
                className="text-muted-foreground text-xs mr-2 shrink-0"
              >
                {completedCount}/{totalCount}
              </Text>
            )}

            {/* 展開/折りたたみアイコン */}
            <motion.div
              animate={{ rotate: isExpanded ? 0 : -90 }}
              transition={{ duration: 0.2 }}
              className="shrink-0"
            >
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </motion.div>
          </div>
        )}
      </div>

      {/* コンテンツ */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-3 py-2 space-y-1.5">
              <AnimatePresence mode="popLayout">
                {items.map((item) => (
                  <TodoItem
                    key={item.id}
                    id={item.id}
                    userId={item.userId}
                    userName={item.userName}
                    avatarUrl={item.avatarUrl}
                    name={item.name}
                    isDone={item.isDone}
                    onToggle={onToggleItem}
                    onEdit={onEditItem}
                    onDelete={onDeleteItem}
                  />
                ))}
              </AnimatePresence>

              {/* タスク追加ボタン */}
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "w-full justify-start gap-2 text-muted-foreground",
                  "hover:text-foreground hover:bg-muted/40",
                  "transition-colors duration-200",
                )}
                onClick={() => onAddTask?.(id)}
              >
                <Plus className="h-4 w-4" />
                <span>タスクを追加</span>
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
