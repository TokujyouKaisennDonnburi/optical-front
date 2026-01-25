"use client";

import { motion } from "framer-motion";
import { Trash2 } from "lucide-react";
import * as React from "react";
import { Input } from "@/components/atoms/Input";
import { Text } from "@/components/atoms/Text";
import { UserAvatar } from "@/components/atoms/UserAvatar";
import { Checkbox } from "@/components/ui/Checkbox";
import { cn } from "@/utils_constants_styles/utils";

export interface TodoItemProps {
  id: string;
  userId: string;
  userName?: string;
  avatarUrl?: string | null;
  name: string;
  isDone: boolean;
  onToggle?: (id: string, name: string, isDone: boolean) => void;
  onEdit?: (id: string, newName: string) => void;
  onDelete?: (id: string) => void;
  className?: string;
}

export function TodoItem({
  id,
  userId,
  userName,
  avatarUrl,
  name,
  isDone,
  onToggle,
  onEdit,
  onDelete,
  className,
}: TodoItemProps) {
  const [isEditing, setIsEditing] = React.useState(false);
  const [editValue, setEditValue] = React.useState(name);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const longPressTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  // 名前が外部から変更された場合に同期
  React.useEffect(() => {
    if (!isEditing) {
      setEditValue(name);
    }
  }, [name, isEditing]);

  const handleToggle = React.useCallback(() => {
    onToggle?.(id, name, !isDone);
  }, [id, name, isDone, onToggle]);

  const handleDelete = React.useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onDelete?.(id);
    },
    [id, onDelete],
  );

  // 編集モードに入る
  const startEdit = React.useCallback(() => {
    if (onEdit) {
      setIsEditing(true);
    }
  }, [onEdit]);

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
      if (!onEdit) return;
      e.stopPropagation();
      longPressTimerRef.current = setTimeout(() => {
        startEdit();
      }, 300); // 300msの長押し
    },
    [onEdit, startEdit],
  );

  // 長押しキャンセル
  const handleMouseUp = React.useCallback(() => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  }, []);

  // マウスが離れた場合もキャンセル
  const handleMouseLeaveText = React.useCallback(() => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  }, []);

  // 保存処理
  const handleSave = React.useCallback(() => {
    const trimmedValue = editValue.trim();
    if (trimmedValue && trimmedValue !== name) {
      onEdit?.(id, trimmedValue);
    } else {
      // 変更がない場合は元の値に戻す
      setEditValue(name);
    }
    setIsEditing(false);
  }, [editValue, name, id, onEdit]);

  // Enterキーで保存、Escapeでキャンセル
  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleSave();
      } else if (e.key === "Escape") {
        e.preventDefault();
        setEditValue(name);
        setIsEditing(false);
      }
    },
    [handleSave, name],
  );

  // フォーカスが外れたときも保存
  const handleBlur = React.useCallback(() => {
    handleSave();
  }, [handleSave]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.15 }}
      className={cn(
        "group flex items-center gap-3 px-3 py-2.5 rounded-lg",
        "bg-muted/30 hover:bg-muted/60",
        "transition-all duration-200",
        "border border-transparent hover:border-border/50",
        !isEditing && "cursor-pointer",
        className,
      )}
      onClick={isEditing ? undefined : handleToggle}
    >
      {/* チェックボックス */}
      <Checkbox
        checked={isDone}
        onCheckedChange={() => handleToggle()}
        onClick={(e) => e.stopPropagation()}
        className={cn(
          "h-5 w-5 rounded-md border-2 transition-all duration-200",
          isDone
            ? "border-primary bg-primary data-[state=checked]:bg-primary"
            : "border-muted-foreground/40 hover:border-primary/60",
        )}
      />

      {/* タスク名（編集可能） */}
      {isEditing ? (
        <Input
          ref={inputRef}
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          onClick={(e) => e.stopPropagation()}
          className={cn(
            "flex-1 h-7 px-2 py-1 text-sm",
            "bg-background border-primary/50",
            "focus:ring-1 focus:ring-primary/30",
          )}
        />
      ) : (
        <Text
          as="span"
          size="sm"
          className={cn(
            "flex-1 truncate transition-all duration-200 select-none",
            isDone && "line-through text-muted-foreground/60",
          )}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeaveText}
        >
          {name}
        </Text>
      )}

      {/* 削除ボタン（ホバー時のみ表示） */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {onDelete && (
          <button
            type="button"
            onClick={handleDelete}
            className={cn(
              "p-1.5 rounded-md",
              "text-destructive/60 hover:text-destructive",
              "hover:bg-destructive/10",
              "transition-colors",
            )}
            title="削除"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* ユーザーアバター */}
      <UserAvatar
        userId={userId}
        name={userName}
        avatarUrl={avatarUrl}
        size="sm"
        className="shrink-0 opacity-90 group-hover:opacity-100 transition-opacity"
      />
    </motion.div>
  );
}
