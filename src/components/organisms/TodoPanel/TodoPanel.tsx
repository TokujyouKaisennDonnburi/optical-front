"use client";

import { Plus, X } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/atoms/Button";
import { Card, CardContent, CardHeader } from "@/components/atoms/Card";
import { ScrollArea } from "@/components/atoms/ScrollArea";
import { Text } from "@/components/atoms/Text";
import { AddSectionDialog } from "@/components/molecules/AddSectionDialog";
import { AddTaskDialog } from "@/components/molecules/AddTaskDialog";
import { ConfirmDialog } from "@/components/molecules/ConfirmDialog";
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
  onToggleItem?: (
    listId: string,
    itemId: string,
    itemName: string,
    isDone: boolean,
  ) => void;
  /** タスクを追加 */
  onAddTask?: (listId: string, name: string) => Promise<void>;
  /** セクションを追加 */
  onAddSection?: (name: string) => Promise<void>;
  /** タスクを編集 */
  onEditTask?: (
    listId: string,
    itemId: string,
    newName: string,
  ) => Promise<void>;
  /** タスクを削除 */
  onRemoveTask?: (listId: string, itemId: string) => Promise<void>;
  /** セクションを編集 */
  onEditSection?: (sectionId: string, newName: string) => Promise<void>;
  /** セクションを削除 */
  onRemoveSection?: (sectionId: string) => Promise<void>;

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
  onEditTask,
  onRemoveTask,
  onEditSection,
  onRemoveSection,
  className,
}: TodoPanelProps) {
  // ダイアログ状態
  const [addTaskDialog, setAddTaskDialog] = React.useState<{
    isOpen: boolean;
    listId: string;
    listName: string;
  }>({ isOpen: false, listId: "", listName: "" });

  const [isAddSectionOpen, setIsAddSectionOpen] = React.useState(false);

  // 削除確認ダイアログ状態
  const [deleteDialog, setDeleteDialog] = React.useState<{
    isOpen: boolean;
    type: "task" | "section";
    id: string;
    listId: string;
    name: string;
  }>({ isOpen: false, type: "task", id: "", listId: "", name: "" });

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
  const handleToggleItem = React.useCallback(
    (listId: string) => (itemId: string, name: string, isDone: boolean) => {
      onToggleItem?.(listId, itemId, name, isDone);
    },
    [onToggleItem],
  );

  // タスク編集を直接実行（インライン編集対応）
  const handleEditItem = React.useCallback(
    (listId: string) => async (itemId: string, newName: string) => {
      await onEditTask?.(listId, itemId, newName);
    },
    [onEditTask],
  );

  // タスク削除確認ダイアログを開く
  const handleDeleteItem = React.useCallback(
    (listId: string) => (itemId: string) => {
      const list = todoLists.find((l) => l.id === listId);
      const item = list?.items.find((i) => i.id === itemId);
      setDeleteDialog({
        isOpen: true,
        type: "task",
        id: itemId,
        listId,
        name: item?.name || "",
      });
    },
    [todoLists],
  );

  // セクション編集を直接実行（インライン編集対応）
  const handleEditSection = React.useCallback(
    async (sectionId: string, newName: string) => {
      await onEditSection?.(sectionId, newName);
    },
    [onEditSection],
  );

  // セクション削除確認ダイアログを開く
  const handleDeleteSection = React.useCallback(
    (sectionId: string) => {
      const list = todoLists.find((l) => l.id === sectionId);
      setDeleteDialog({
        isOpen: true,
        type: "section",
        id: sectionId,
        listId: sectionId,
        name: list?.name || "",
      });
    },
    [todoLists],
  );

  // 削除を実行
  const handleDelete = React.useCallback(async () => {
    if (deleteDialog.type === "task") {
      await onRemoveTask?.(deleteDialog.listId, deleteDialog.id);
    } else {
      await onRemoveSection?.(deleteDialog.id);
    }
  }, [deleteDialog, onRemoveTask, onRemoveSection]);

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
        <CardHeader className="flex flex-row items-center justify-between gap-2 border-b border-border px-4 py-3 bg-muted/20 rounded-t-lg">
          <Text as="h2" weight="semibold" size="lg">
            ToDo
          </Text>

          <div className="flex items-center gap-1">
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
                セクションがありません
              </Text>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsAddSectionOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                セクションを作成
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
                    onToggleItem={handleToggleItem(list.id)}
                    onAddTask={handleOpenAddTask}
                    onEditItem={handleEditItem(list.id)}
                    onDeleteItem={handleDeleteItem(list.id)}
                    onEditSection={handleEditSection}
                    onDeleteSection={handleDeleteSection}
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

      {/* 削除確認ダイアログ */}
      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        title={
          deleteDialog.type === "task" ? "タスクを削除" : "セクションを削除"
        }
        description={
          deleteDialog.type === "task"
            ? `「${deleteDialog.name}」を削除してもよろしいですか？`
            : `「${deleteDialog.name}」とその中のすべてのタスクを削除してもよろしいですか？`
        }
        confirmLabel="削除"
        variant="destructive"
        onClose={() =>
          setDeleteDialog({
            isOpen: false,
            type: "task",
            id: "",
            listId: "",
            name: "",
          })
        }
        onConfirm={handleDelete}
      />
    </>
  );
}
