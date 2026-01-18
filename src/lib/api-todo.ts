/**
 * Todo API Client
 *
 * このファイルはモックAPIを提供します。
 * 実際のバックエンドに接続する際は、各関数内のモック実装を
 * 実際のfetch/axiosコールに置き換えてください。
 *
 * 置き換え例:
 * ```
 * export async function getTodoLists(calendarId: string): Promise<TodoList[]> {
 *   const response = await fetch(`${API_BASE_URL}/calendars/${calendarId}/todos`);
 *   if (!response.ok) throw new Error("Failed to fetch todo lists");
 *   return response.json();
 * }
 * ```
 */

import type { TodoItem, TodoList } from "@/types/todo";

// ============================================
// モックデータストレージ（メモリ内）
// 実際のAPI接続時は削除してください
// ============================================
let mockTodoLists: TodoList[] = [
  {
    id: "todo-1",
    userId: "user-1",
    calendarId: "cal-1",
    avatarUrl: null,
    name: "Infrastructure Project (Active)",
    items: [
      {
        id: "item-1",
        userId: "user-j",
        avatarUrl: null,
        name: "インフラ構築準備",
        isDone: false,
      },
      {
        id: "item-2",
        userId: "user-m",
        avatarUrl: null,
        name: "サーバー移設作業",
        isDone: false,
      },
      {
        id: "item-3",
        userId: "user-s",
        avatarUrl: null,
        name: "ドキュメント作成",
        isDone: false,
      },
    ],
  },
  {
    id: "todo-2",
    userId: "user-1",
    calendarId: "cal-1",
    avatarUrl: null,
    name: "Documentation & Other Tasks",
    items: [
      {
        id: "item-4",
        userId: "user-j",
        avatarUrl: null,
        name: "インフラ構築準備",
        isDone: false,
      },
      {
        id: "item-5",
        userId: "user-m",
        avatarUrl: null,
        name: "インフラ移設作業",
        isDone: false,
      },
    ],
  },
];

// ユニークID生成（モック用）
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

// ============================================
// API関数
// ============================================

/**
 * Todoリスト一覧を取得
 * @param calendarId カレンダーID
 */
export async function getTodoLists(_calendarId: string): Promise<TodoList[]> {
  // モック: 遅延をシミュレート
  await new Promise((resolve) => setTimeout(resolve, 300));

  // TODO: 実際のAPIに置き換え
  // const response = await fetch(`/api/calendars/${calendarId}/todos`);
  // return response.json();

  // モック実装ではカレンダーIDに関係なく全てのリストを返す
  return mockTodoLists;
}

/**
 * 新しいTodoリスト（セクション）を作成
 * @param calendarId カレンダーID
 * @param name リスト名
 */
export async function createTodoList(
  calendarId: string,
  name: string,
): Promise<TodoList> {
  await new Promise((resolve) => setTimeout(resolve, 300));

  // TODO: 実際のAPIに置き換え
  // const response = await fetch(`/api/calendars/${calendarId}/todos`, {
  //   method: "POST",
  //   headers: { "Content-Type": "application/json" },
  //   body: JSON.stringify({ name }),
  // });
  // return response.json();

  const newList: TodoList = {
    id: generateId(),
    userId: "current-user",
    calendarId,
    avatarUrl: null,
    name,
    items: [],
  };

  mockTodoLists = [...mockTodoLists, newList];
  return newList;
}

/**
 * Todoリストを削除
 * @param listId リストID
 */
export async function deleteTodoList(listId: string): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 200));

  // TODO: 実際のAPIに置き換え
  // await fetch(`/api/todos/${listId}`, { method: "DELETE" });

  mockTodoLists = mockTodoLists.filter((list) => list.id !== listId);
}

/**
 * 新しいTodoアイテムを追加
 * @param listId リストID
 * @param name タスク名
 */
export async function createTodoItem(
  listId: string,
  name: string,
): Promise<TodoItem> {
  await new Promise((resolve) => setTimeout(resolve, 200));

  // TODO: 実際のAPIに置き換え
  // const response = await fetch(`/api/todos/${listId}/items`, {
  //   method: "POST",
  //   headers: { "Content-Type": "application/json" },
  //   body: JSON.stringify({ name }),
  // });
  // return response.json();

  const newItem: TodoItem = {
    id: generateId(),
    userId: "current-user",
    avatarUrl: null,
    name,
    isDone: false,
  };

  mockTodoLists = mockTodoLists.map((list) =>
    list.id === listId ? { ...list, items: [...list.items, newItem] } : list,
  );

  return newItem;
}

/**
 * Todoアイテムの完了状態を更新
 * @param itemId アイテムID
 * @param isDone 完了状態
 */
export async function updateTodoItemStatus(
  itemId: string,
  isDone: boolean,
): Promise<TodoItem> {
  await new Promise((resolve) => setTimeout(resolve, 150));

  // TODO: 実際のAPIに置き換え
  // const response = await fetch(`/api/todos/items/${itemId}`, {
  //   method: "PATCH",
  //   headers: { "Content-Type": "application/json" },
  //   body: JSON.stringify({ isDone }),
  // });
  // return response.json();

  let updatedItem: TodoItem | null = null;

  mockTodoLists = mockTodoLists.map((list) => ({
    ...list,
    items: list.items.map((item) => {
      if (item.id === itemId) {
        updatedItem = { ...item, isDone };
        return updatedItem;
      }
      return item;
    }),
  }));

  if (!updatedItem) {
    throw new Error("Item not found");
  }

  return updatedItem;
}

/**
 * Todoアイテムを削除
 * @param itemId アイテムID
 */
export async function deleteTodoItem(itemId: string): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 150));

  // TODO: 実際のAPIに置き換え
  // await fetch(`/api/todos/items/${itemId}`, { method: "DELETE" });

  mockTodoLists = mockTodoLists.map((list) => ({
    ...list,
    items: list.items.filter((item) => item.id !== itemId),
  }));
}

/**
 * Todoアイテム名を更新
 * @param itemId アイテムID
 * @param name 新しい名前
 */
export async function updateTodoItemName(
  itemId: string,
  name: string,
): Promise<TodoItem> {
  await new Promise((resolve) => setTimeout(resolve, 150));

  // TODO: 実際のAPIに置き換え
  // const response = await fetch(`/api/todos/items/${itemId}`, {
  //   method: "PATCH",
  //   headers: { "Content-Type": "application/json" },
  //   body: JSON.stringify({ name }),
  // });
  // return response.json();

  let updatedItem: TodoItem | null = null;

  mockTodoLists = mockTodoLists.map((list) => ({
    ...list,
    items: list.items.map((item) => {
      if (item.id === itemId) {
        updatedItem = { ...item, name };
        return updatedItem;
      }
      return item;
    }),
  }));

  if (!updatedItem) {
    throw new Error("Item not found");
  }

  return updatedItem;
}
