import type {
  CreateTodoItemRequest,
  CreateTodoListRequest,
  TodoItem,
  TodoList,
  UpdateTodoListRequest,
} from "@/types/todo";
import { apiGet, apiPatch, apiPost } from "./api-client";

/**
 * Todoリスト一覧を取得
 * @param calendarId カレンダーID
 */
export async function getTodoLists(calendarId: string): Promise<TodoList[]> {
  return apiGet<TodoList[]>(`/calendars/${calendarId}/todos`);
}

/**
 * 新しいTodoリスト（セクション）を作成
 * @param calendarId カレンダーID
 * @param name リスト名
 */
export async function createTodoList(
  calendarId: string,
  payload: CreateTodoListRequest,
): Promise<TodoList> {
  return apiPost<TodoList>(`/calendars/${calendarId}/todos`, payload);
}

/**
 * Todoリストを削除
 * @param listId リストID
 */
export async function deleteTodoList(listId: string): Promise<void> {
  await fetch(`/api/todos/${listId}`, { method: "DELETE" });
}

/**
 * 新しいTodoアイテムを追加
 * @param listId リストID
 * @param name タスク名
 */
export async function createTodoItem(
  listId: string,
  payload: CreateTodoItemRequest,
): Promise<TodoItem> {
  return apiPost(`/calendars/${listId}/todos/${listId}/items`, payload);
}

/**
 * Todoアイテムの状態を更新
 * @param itemId アイテムID
 * @param isDone 完了状態
 */
export async function updateTodoItem(
  listId: string,
  itemId: string,
  payload: UpdateTodoListRequest,
): Promise<TodoItem> {
  return apiPatch(
    `/calendars/${listId}/todos/${listId}/items/${itemId}`,
    payload,
  );
}

/**
 * Todoアイテムを削除
 * @param itemId アイテムID
 */
export async function deleteTodoItem(itemId: string): Promise<void> {
  await fetch(`/api/todos/items/${itemId}`, { method: "DELETE" });
}
