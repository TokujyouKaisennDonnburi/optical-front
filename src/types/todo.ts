/** Todoアイテム型（単一タスク） */
export type TodoItem = {
  id: string;
  userId: string;
  avatarUrl: string | null;
  name: string;
  isDone: boolean;
};

/** Todoリスト型（APIレスポンス） */
export type TodoList = {
  id: string;
  userId: string;
  calendarId: string;
  avatarUrl: string;
  name: string;
  items: TodoItem[];
};

/** フロントエンド用のTodoセクション型 */
export type TodoSection = {
  id: string;
  name: string;
  avatarUrl?: string;
  isExpanded?: boolean;
  items: TodoItem[];
};
