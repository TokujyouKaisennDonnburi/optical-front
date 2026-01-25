import type {
  CreateTodoItemRequest,
  CreateTodoListRequest,
  TodoItem,
  TodoList,
  UpdateTodoItemRequest,
  UpdateTodoListNameRequest,
} from "@/types/todo";
import { apiDelete, apiGet, apiPatch, apiPost } from "./api-client";

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
 * @param payload リスト作成リクエスト
 */
export async function createTodoList(
  calendarId: string,
  payload: CreateTodoListRequest,
): Promise<TodoList> {
  return apiPost<TodoList>(`/calendars/${calendarId}/todos`, payload);
}

/**
 * Todoリストを更新（セクション名変更など）
 * @param calendarId カレンダーID
 * @param listId リストID
 * @param payload 更新内容
 */
export async function updateTodoList(
  calendarId: string,
  listId: string,
  payload: UpdateTodoListNameRequest,
): Promise<TodoList> {
  return apiPatch<TodoList>(
    `/calendars/${calendarId}/todos/${listId}`,
    payload,
  );
}

/**
 * Todoリストを削除
 * @param calendarId カレンダーID
 * @param listId リストID
 */
export async function deleteTodoList(
  calendarId: string,
  listId: string,
): Promise<void> {
  await apiDelete(`/calendars/${calendarId}/todos/${listId}`);
}

/**
 * 新しいTodoアイテムを追加
 * @param calendarId カレンダーID
 * @param listId リストID
 * @param payload アイテム作成リクエスト
 */
export async function createTodoItem(
  calendarId: string,
  listId: string,
  payload: CreateTodoItemRequest,
): Promise<TodoItem> {
  return apiPost<TodoItem>(
    `/calendars/${calendarId}/todos/${listId}/items`,
    payload,
  );
}

/**
 * Todoアイテムの状態を更新
 * @param calendarId カレンダーID
 * @param listId リストID
 * @param itemId アイテムID
 * @param payload 更新内容
 */
export async function updateTodoItem(
  calendarId: string,
  listId: string,
  itemId: string,
  payload: UpdateTodoItemRequest,
): Promise<TodoItem> {
  return apiPatch<TodoItem>(
    `/calendars/${calendarId}/todos/${listId}/items/${itemId}`,
    payload,
  );
}

/**
 * Todoアイテムを削除
 * @param calendarId カレンダーID
 * @param listId リストID
 * @param itemId アイテムID
 */
export async function deleteTodoItem(
  calendarId: string,
  listId: string,
  itemId: string,
): Promise<void> {
  await apiDelete(`/calendars/${calendarId}/todos/${listId}/items/${itemId}`);
}
