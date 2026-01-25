/** Todoアイテム型（単一タスク） */
export type TodoItem = {
  id: string;
  userId: string;
  userName?: string;
  avatarUrl: string | null;
  name: string;
  isDone: boolean;
};

/** Todoリスト型（APIレスポンス） */
export type TodoList = {
  id: string;
  userId: string;
  calendarId: string;
  avatarUrl: string | null;
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

export type CreateTodoListRequest = {
  name: string;
};

export type CreateTodoItemRequest = {
  name: string;
};

export type UpdateTodoListRequest = {
  name: string;
  isDone: boolean;
};

export type UpdateTodoListNameRequest = {
  name: string;
};

export type UpdateTodoItemRequest = {
  name?: string;
  isDone?: boolean;
};
