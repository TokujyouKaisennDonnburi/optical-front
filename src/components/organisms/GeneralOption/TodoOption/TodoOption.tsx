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
    </>
  );
}

export default TodoOption;
