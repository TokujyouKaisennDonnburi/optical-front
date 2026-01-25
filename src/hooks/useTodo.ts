"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import {
  createTodoItem,
  createTodoList,
  deleteTodoItem,
  deleteTodoList,
  getTodoLists,
  updateTodoItem,
  updateTodoList,
} from "@/lib/api-todo";
import type { TodoList } from "@/types/todo";

interface UseTodoOptions {
  calendarId: string;
  /** 現在のユーザーのアバターURL（新規作成時に使用） */
  currentUserAvatarUrl?: string | null;
  /** 現在のユーザーの名前（新規作成時に使用） */
  currentUserName?: string | null;
}

interface UseTodoReturn {
  /** Todoリスト一覧 */
  todoLists: TodoList[];
  /** ローディング状態 */
  isLoading: boolean;
  /** エラー状態 */
  error: Error | null;
  /** 展開されているセクションのID一覧 */
  expandedSections: Set<string>;
  /** データを再取得 */
  refresh: () => Promise<void>;
  /** セクションの展開/折りたたみをトグル */
  toggleSection: (sectionId: string) => void;
  /** Todoアイテムの完了状態をトグル */
  toggleItem: (
    listId: string,
    itemId: string,
    itemName: string,
    isDone: boolean,
  ) => Promise<void>;
  /** 新しいタスクを追加 */
  addTask: (listId: string, name: string) => Promise<void>;
  /** 新しいセクションを追加 */
  addSection: (name: string) => Promise<void>;
  /** タスクを削除 */
  removeTask: (listId: string, itemId: string) => Promise<void>;
  /** セクションを削除 */
  removeSection: (listId: string) => Promise<void>;
  /** タスク名を編集 */
  editTask: (listId: string, itemId: string, newName: string) => Promise<void>;
  /** セクション名を編集 */
  editSection: (listId: string, newName: string) => Promise<void>;
}

/**
 * Todoデータを管理するカスタムフック
 *
 * @example
 * ```tsx
 * const { todoLists, isLoading, toggleItem, addTask, addSection, editTask, editSection } = useTodo({
 *   calendarId: "calendar-123",
 * });
 * ```
 */
export function useTodo({
  calendarId,
  currentUserAvatarUrl,
  currentUserName,
}: UseTodoOptions): UseTodoReturn {
  const [todoLists, setTodoLists] = useState<TodoList[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(),
  );

  // 初期データ取得
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getTodoLists(calendarId);
      setTodoLists(data);
      // 初回は全セクションを展開
      setExpandedSections(new Set(data.map((list) => list.id)));
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error("Failed to fetch todos");
      setError(error);
      toast.error("Todoの取得に失敗しました");
    } finally {
      setIsLoading(false);
    }
  }, [calendarId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // セクションの展開/折りたたみ
  const toggleSection = useCallback((sectionId: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(sectionId)) {
        next.delete(sectionId);
      } else {
        next.add(sectionId);
      }
      return next;
    });
  }, []);

  // Todoアイテムの完了状態をトグル（楽観的更新）
  const toggleItem = useCallback(
    async (
      listId: string,
      itemId: string,
      itemName: string,
      isDone: boolean,
    ) => {
      // 楽観的更新：即座にUIに反映
      setTodoLists((prev) =>
        prev.map((list) =>
          list.id === listId
            ? {
                ...list,
                items: list.items.map((item) =>
                  item.id === itemId ? { ...item, isDone } : item,
                ),
              }
            : list,
        ),
      );

      try {
        await updateTodoItem(calendarId, listId, itemId, {
          name: itemName,
          isDone: isDone,
        });
      } catch (err) {
        console.error("Todo item status update failed:", err);
        // 失敗したら元に戻す
        setTodoLists((prev) =>
          prev.map((list) =>
            list.id === listId
              ? {
                  ...list,
                  items: list.items.map((item) =>
                    item.id === itemId ? { ...item, isDone: !isDone } : item,
                  ),
                }
              : list,
          ),
        );
        toast.error("更新に失敗しました");
      }
    },
    [calendarId],
  );

  // 新しいタスクを追加
  const addTask = useCallback(
    async (listId: string, name: string) => {
      if (!name.trim()) {
        toast.error("タスク名を入力してください");
        return;
      }

      try {
        const newItem = await createTodoItem(calendarId, listId, {
          name: name.trim(),
        });
        // APIがavatarUrlを返さない場合、現在のユーザーのアバターと名前を使用
        const itemWithUserInfo = {
          ...newItem,
          avatarUrl: newItem.avatarUrl ?? currentUserAvatarUrl ?? null,
          userName: newItem.userName ?? currentUserName ?? undefined,
        };
        setTodoLists((prev) =>
          prev.map((list) =>
            list.id === listId
              ? { ...list, items: [...list.items, itemWithUserInfo] }
              : list,
          ),
        );
        toast.success("タスクを追加しました");
      } catch (err) {
        console.error("Failed to add task:", err);
        toast.error("タスクの追加に失敗しました");
      }
    },
    [calendarId, currentUserAvatarUrl, currentUserName],
  );

  // 新しいセクションを追加
  const addSection = useCallback(
    async (name: string) => {
      if (!name.trim()) {
        toast.error("セクション名を入力してください");
        return;
      }

      try {
        const newList = await createTodoList(calendarId, {
          name: name.trim(),
        });
        // APIがavatarUrlを返さない場合、現在のユーザーのアバターを使用
        const listWithAvatar = {
          ...newList,
          avatarUrl: newList.avatarUrl ?? currentUserAvatarUrl ?? null,
        };
        setTodoLists((prev) => [...prev, listWithAvatar]);
        setExpandedSections((prev) => new Set([...prev, listWithAvatar.id]));
        toast.success("セクションを追加しました");
      } catch (err) {
        console.error("Failed to add section:", err);
        toast.error("セクションの追加に失敗しました");
      }
    },
    [calendarId, currentUserAvatarUrl],
  );

  // タスクを削除
  const removeTask = useCallback(
    async (listId: string, itemId: string) => {
      // 楽観的更新：即座にUIから削除
      let previousLists: TodoList[] = [];
      setTodoLists((prev) => {
        previousLists = prev;
        return prev.map((list) =>
          list.id === listId
            ? {
                ...list,
                items: list.items.filter((item) => item.id !== itemId),
              }
            : list,
        );
      });

      try {
        await deleteTodoItem(calendarId, listId, itemId);
        toast.success("タスクを削除しました");
      } catch (err) {
        console.error("Failed to delete task:", err);
        // 失敗したら元に戻す
        setTodoLists(previousLists);
        toast.error("削除に失敗しました");
      }
    },
    [calendarId],
  );

  // セクションを削除
  const removeSection = useCallback(
    async (listId: string) => {
      // 楽観的更新：即座にUIから削除
      let previousLists: TodoList[] = [];
      setTodoLists((prev) => {
        previousLists = prev;
        return prev.filter((list) => list.id !== listId);
      });

      try {
        await deleteTodoList(calendarId, listId);
        toast.success("セクションを削除しました");
      } catch (err) {
        console.error("Failed to delete section:", err);
        // 失敗したら元に戻す
        setTodoLists(previousLists);
        toast.error("削除に失敗しました");
      }
    },
    [calendarId],
  );

  // タスク名を編集
  const editTask = useCallback(
    async (listId: string, itemId: string, newName: string) => {
      if (!newName.trim()) {
        toast.error("タスク名を入力してください");
        return;
      }

      // 楽観的更新：即座にUIに反映
      let previousLists: TodoList[] = [];
      setTodoLists((prev) => {
        previousLists = prev;
        return prev.map((list) =>
          list.id === listId
            ? {
                ...list,
                items: list.items.map((item) =>
                  item.id === itemId ? { ...item, name: newName.trim() } : item,
                ),
              }
            : list,
        );
      });

      try {
        await updateTodoItem(calendarId, listId, itemId, {
          name: newName.trim(),
        });
        toast.success("タスク名を更新しました");
      } catch (err) {
        console.error("Failed to edit task:", err);
        // 失敗したら元に戻す
        setTodoLists(previousLists);
        toast.error("更新に失敗しました");
      }
    },
    [calendarId],
  );

  // セクション名を編集
  const editSection = useCallback(
    async (listId: string, newName: string) => {
      if (!newName.trim()) {
        toast.error("セクション名を入力してください");
        return;
      }

      // 楽観的更新：即座にUIに反映
      let previousLists: TodoList[] = [];
      setTodoLists((prev) => {
        previousLists = prev;
        return prev.map((list) =>
          list.id === listId ? { ...list, name: newName.trim() } : list,
        );
      });

      try {
        await updateTodoList(calendarId, listId, {
          name: newName.trim(),
        });
        toast.success("セクション名を更新しました");
      } catch (err) {
        console.error("Failed to edit section:", err);
        // 失敗したら元に戻す
        setTodoLists(previousLists);
        toast.error("更新に失敗しました");
      }
    },
    [calendarId],
  );

  return {
    todoLists,
    isLoading,
    error,
    expandedSections,
    refresh: fetchData,
    toggleSection,
    toggleItem,
    addTask,
    addSection,
    removeTask,
    removeSection,
    editTask,
    editSection,
  };
}
