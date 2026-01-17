"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import {
  createTodoItem,
  createTodoList,
  deleteTodoItem,
  deleteTodoList,
  getTodoLists,
  updateTodoItemStatus,
} from "@/lib/api-todo";
import type { TodoList } from "@/types/todo";

interface UseTodoOptions {
  calendarId: string;
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
}

/**
 * Todoデータを管理するカスタムフック
 *
 * @example
 * ```tsx
 * const { todoLists, isLoading, toggleItem, addTask, addSection } = useTodo({
 *   calendarId: "calendar-123",
 * });
 * ```
 */
export function useTodo({ calendarId }: UseTodoOptions): UseTodoReturn {
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
    async (listId: string, itemId: string, isDone: boolean) => {
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
        await updateTodoItemStatus(itemId, isDone);
      } catch (_err) {
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
    [],
  );

  // 新しいタスクを追加
  const addTask = useCallback(async (listId: string, name: string) => {
    if (!name.trim()) {
      toast.error("タスク名を入力してください");
      return;
    }

    try {
      const newItem = await createTodoItem(listId, name.trim());
      setTodoLists((prev) =>
        prev.map((list) =>
          list.id === listId
            ? { ...list, items: [...list.items, newItem] }
            : list,
        ),
      );
      toast.success("タスクを追加しました");
    } catch (_err) {
      toast.error("タスクの追加に失敗しました");
    }
  }, []);

  // 新しいセクションを追加
  const addSection = useCallback(
    async (name: string) => {
      if (!name.trim()) {
        toast.error("セクション名を入力してください");
        return;
      }

      try {
        const newList = await createTodoList(calendarId, name.trim());
        setTodoLists((prev) => [...prev, newList]);
        setExpandedSections((prev) => new Set([...prev, newList.id]));
        toast.success("セクションを追加しました");
      } catch (_err) {
        toast.error("セクションの追加に失敗しました");
      }
    },
    [calendarId],
  );

  // タスクを削除
  const removeTask = useCallback(async (listId: string, itemId: string) => {
    try {
      await deleteTodoItem(itemId);
      setTodoLists((prev) =>
        prev.map((list) =>
          list.id === listId
            ? {
                ...list,
                items: list.items.filter((item) => item.id !== itemId),
              }
            : list,
        ),
      );
      toast.success("タスクを削除しました");
    } catch (_err) {
      toast.error("削除に失敗しました");
    }
  }, []);

  // セクションを削除
  const removeSection = useCallback(async (listId: string) => {
    try {
      await deleteTodoList(listId);
      setTodoLists((prev) => prev.filter((list) => list.id !== listId));
      toast.success("セクションを削除しました");
    } catch (_err) {
      toast.error("削除に失敗しました");
    }
  }, []);

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
  };
}
