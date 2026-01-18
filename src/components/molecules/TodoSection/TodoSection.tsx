"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Plus } from "lucide-react";

import { Button } from "@/components/atoms/Button";
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
  className,
}: TodoSectionProps) {
  const completedCount = items.filter((item) => item.isDone).length;
  const totalCount = items.length;

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
      <button
        type="button"
        className={cn(
          "w-full flex items-center gap-2 px-4 py-3",
          "bg-muted/30 hover:bg-muted/50",
          "transition-colors duration-200",
        )}
        onClick={() => onToggleExpand?.(id)}
      >
        <Text
          as="span"
          weight="semibold"
          size="sm"
          className="flex-1 text-left"
        >
          {title}
        </Text>

        {/* 進捗表示 */}
        {totalCount > 0 && (
          <Text
            as="span"
            size="sm"
            className="text-muted-foreground text-xs mr-2"
          >
            {completedCount}/{totalCount}
          </Text>
        )}

        {/* 展開/折りたたみアイコン */}
        <motion.div
          animate={{ rotate: isExpanded ? 0 : -90 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </motion.div>
      </button>

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
                    avatarUrl={item.avatarUrl}
                    name={item.name}
                    isDone={item.isDone}
                    onToggle={onToggleItem}
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
