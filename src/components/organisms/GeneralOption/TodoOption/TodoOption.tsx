"use client";

import { ListTodo } from "lucide-react";
import * as React from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/atoms/Card";
import { ScrollArea } from "@/components/atoms/ScrollArea";
import { Skeleton } from "@/components/atoms/Skeleton";
import { Text } from "@/components/atoms/Text";
import { AddSectionDialog } from "@/components/molecules/AddSectionDialog";
import { AddTaskDialog } from "@/components/molecules/AddTaskDialog";
import { ConfirmDialog } from "@/components/molecules/ConfirmDialog";
import { TodoSection } from "@/components/molecules/TodoSection";
import { useAuth } from "@/hooks/useAuth";
import { useTodo } from "@/hooks/useTodo";

type Props = {
  calendarId: string;
};

/**
 * Todoオプションコンポーネント
 *
 * カレンダーに紐づくTodoリストを表示・管理するオプション。
 * EngineerOptionのMilestoneProgressOptionと同様の構成で、
 * カレンダー詳細画面のオプションとして使用される。
 */
export function TodoOption({ calendarId }: Props) {
  const { user } = useAuth();
  const {
    todoLists,
    isLoading,
    error,
    expandedSections,
    toggleSection,
    toggleItem,
    addTask,
    addSection,
    removeTask,
    removeSection,
    editTask,
    editSection,
  } = useTodo({
    calendarId,
    currentUserAvatarUrl: user?.avatarUrl,
    currentUserName: user?.name,
  });

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
      if (addTaskDialog.listId) {
        await addTask(addTaskDialog.listId, taskName);
      }
    },
    [addTask, addTaskDialog.listId],
  );

  // アイテムトグルハンドラを生成
  const createToggleHandler = React.useCallback(
    (listId: string) => (itemId: string, itemName: string, isDone: boolean) => {
      toggleItem(listId, itemId, itemName, isDone);
    },
    [toggleItem],
  );

  // タスク編集を直接実行（インライン編集対応）
  const createEditItemHandler = React.useCallback(
    (listId: string) => async (itemId: string, newName: string) => {
      await editTask(listId, itemId, newName);
    },
    [editTask],
  );

  // タスク削除確認ダイアログを開く
  const createDeleteItemHandler = React.useCallback(
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
      await editSection(sectionId, newName);
    },
    [editSection],
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
      await removeTask(deleteDialog.listId, deleteDialog.id);
    } else {
      await removeSection(deleteDialog.id);
    }
  }, [deleteDialog, removeTask, removeSection]);

  return (
    <>
      <Card>
        <CardHeader className="space-y-1 pb-3">
          <div className="flex items-center gap-2">
            <ListTodo className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-base">ToDoリスト</CardTitle>
          </div>
          <CardDescription>タスクを管理しましょう</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            // ローディング中のスケルトン表示
            <div className="space-y-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : error ? (
            <Text as="p" size="sm" className="text-destructive">
              Todoの取得に失敗しました
            </Text>
          ) : todoLists.length === 0 ? (
            <div className="text-center py-4">
              <Text as="p" size="sm" className="text-muted-foreground mb-3">
                セクションがありません
              </Text>
              <button
                type="button"
                className="text-sm text-primary hover:underline"
                onClick={() => setIsAddSectionOpen(true)}
              >
                + セクションを作成
              </button>
            </div>
          ) : (
            <ScrollArea className="max-h-[400px]">
              <div className="flex flex-col gap-3">
                {todoLists.map((list) => (
                  <TodoSection
                    key={list.id}
                    id={list.id}
                    title={list.name}
                    items={list.items}
                    isExpanded={expandedSections.has(list.id)}
                    onToggleExpand={toggleSection}
                    onToggleItem={createToggleHandler(list.id)}
                    onAddTask={handleOpenAddTask}
                    onEditItem={createEditItemHandler(list.id)}
                    onDeleteItem={createDeleteItemHandler(list.id)}
                    onEditSection={handleEditSection}
                    onDeleteSection={handleDeleteSection}
                  />
                ))}
              </div>
            </ScrollArea>
          )}

          {/* セクション追加ボタン（リストがある場合のみ表示） */}
          {!isLoading && !error && todoLists.length > 0 && (
            <button
              type="button"
              className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors py-2 border-t border-border"
              onClick={() => setIsAddSectionOpen(true)}
            >
              + セクションを追加
            </button>
          )}
        </CardContent>
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
        onSubmit={addSection}
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

export default TodoOption;
