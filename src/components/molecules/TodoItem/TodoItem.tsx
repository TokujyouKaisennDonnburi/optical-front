"use client";

import { motion } from "framer-motion";
import * as React from "react";
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
  onToggle?: (id: string, isDone: boolean) => void;
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
  className,
}: TodoItemProps) {
  const handleToggle = React.useCallback(() => {
    onToggle?.(id, !isDone);
  }, [id, isDone, onToggle]);

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
        "transition-all duration-200 cursor-pointer",
        "border border-transparent hover:border-border/50",
        className,
      )}
      onClick={handleToggle}
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

      {/* タスク名 */}
      <Text
        as="span"
        size="sm"
        className={cn(
          "flex-1 truncate transition-all duration-200",
          isDone && "line-through text-muted-foreground/60",
        )}
      >
        {name}
      </Text>

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
