"use client";

import { Plus, Settings, X } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/atoms/Button";
import { Card, CardContent, CardHeader } from "@/components/atoms/Card";
import { ScrollArea } from "@/components/atoms/ScrollArea";
import { Text } from "@/components/atoms/Text";
import { AddSectionDialog } from "@/components/molecules/AddSectionDialog";
import { AddTaskDialog } from "@/components/molecules/AddTaskDialog";
import { TodoSection } from "@/components/molecules/TodoSection";
import type { TodoList } from "@/types/todo";
import { cn } from "@/utils_constants_styles/utils";

export interface TodoPanelProps {
  /** Todoリスト一覧 */
  todoLists: TodoList[];
  /** ローディング状態 */
  isLoading?: boolean;
  /** 展開されているセクションのID一覧 */
  expandedSections?: Set<string>;
  /** パネルを閉じるハンドラ */
  onClose?: () => void;
  /** セクションの展開/折りたたみをトグル */
  onToggleSection?: (sectionId: string) => void;
  /** Todoアイテムの完了状態を変更 */
  onToggleItem?: (listId: string, itemId: string, isDone: boolean) => void;
  /** タスクを追加 */
  onAddTask?: (listId: string, name: string) => Promise<void>;
  /** セクションを追加 */
  onAddSection?: (name: string) => Promise<void>;
  /** 設定を開く */
  onSettings?: () => void;
  className?: string;
}

export function TodoPanel({
  todoLists,
  isLoading = false,
  expandedSections = new Set(),
  onClose,
  onToggleSection,
  onToggleItem,
  onAddTask,
  onAddSection,
  onSettings,
  className,
}: TodoPanelProps) {
  // ダイアログ状態
  const [addTaskDialog, setAddTaskDialog] = React.useState<{
    isOpen: boolean;
    listId: string;
    listName: string;
  }>({ isOpen: false, listId: "", listName: "" });

  const [isAddSectionOpen, setIsAddSectionOpen] = React.useState(false);

  // タスク追加ダイアログを開く
  const handleOpenAddTask = React.useCallback(
    (listId: string) => {
      const list = todoLists.find((l) => l.id === listId);
      setAddTaskDialog({
        isOpen: true,
        listId,
        listName: list?.name || "",
      });
    },
    [todoLists],
  );

  // タスク追加を実行
  const handleAddTask = React.useCallback(
    async (taskName: string) => {
      if (onAddTask && addTaskDialog.listId) {
        await onAddTask(addTaskDialog.listId, taskName);
      }
    },
    [onAddTask, addTaskDialog.listId],
  );

  // セクション追加を実行
  const handleAddSection = React.useCallback(
    async (sectionName: string) => {
      if (onAddSection) {
        await onAddSection(sectionName);
      }
    },
    [onAddSection],
  );

  // アイテムトグルハンドラを生成
  const createToggleHandler = React.useCallback(
    (listId: string) => (itemId: string, isDone: boolean) => {
      onToggleItem?.(listId, itemId, isDone);
    },
    [onToggleItem],
  );

  return (
    <>
      <Card
        className={cn(
          "flex h-full w-full min-h-0 flex-col overflow-hidden",
          "shadow-xl border-border/60",
          className,
        )}
      >
        {/* ヘッダー */}
        <CardHeader className="flex flex-row items-center justify-between gap-2 border-b border-border px-4 py-3 bg-muted/20">
          <Text as="h2" weight="semibold" size="lg">
            To-do
          </Text>

          <div className="flex items-center gap-1">
            {/* 設定ボタン */}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              onClick={onSettings}
            >
              <Settings className="h-4 w-4" />
            </Button>

            {/* 閉じるボタン */}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        {/* コンテンツ */}
        <CardContent className="flex-1 overflow-hidden px-0 py-0">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <Text as="span" size="sm" className="text-muted-foreground">
                読み込み中...
              </Text>
            </div>
          ) : todoLists.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 p-6">
              <Text
                as="span"
                size="sm"
                className="text-muted-foreground text-center"
              >
                Todoリストがありません
              </Text>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsAddSectionOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                リストを作成
              </Button>
            </div>
          ) : (
            <ScrollArea className="h-full">
              <div className="flex flex-col gap-3 p-4">
                {todoLists.map((list) => (
                  <TodoSection
                    key={list.id}
                    id={list.id}
                    title={list.name}
                    items={list.items}
                    isExpanded={expandedSections.has(list.id)}
                    onToggleExpand={onToggleSection}
                    onToggleItem={createToggleHandler(list.id)}
                    onAddTask={handleOpenAddTask}
                  />
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>

        {/* フッター - 追加ボタン */}
        <div className="border-t border-border p-3 bg-muted/10">
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "w-full justify-center gap-2",
              "text-muted-foreground hover:text-foreground",
              "hover:bg-muted/50 transition-colors",
            )}
            onClick={() => setIsAddSectionOpen(true)}
          >
            <Plus className="h-5 w-5" />
          </Button>
        </div>
      </Card>

      {/* タスク追加ダイアログ */}
      <AddTaskDialog
        isOpen={addTaskDialog.isOpen}
        sectionName={addTaskDialog.listName}
        onClose={() =>
          setAddTaskDialog({ isOpen: false, listId: "", listName: "" })
        }
        onSubmit={handleAddTask}
      />

      {/* セクション追加ダイアログ */}
      <AddSectionDialog
        isOpen={isAddSectionOpen}
        onClose={() => setIsAddSectionOpen(false)}
        onSubmit={handleAddSection}
      />
    </>
  );
}
