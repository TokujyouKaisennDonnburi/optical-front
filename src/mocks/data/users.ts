/**
 * モックユーザーデータ
 * 開発環境でテストに使用するユーザー情報
 */

import type { User } from "@/types/auth";

/**
 * テスト用ユーザーデータ
 */
export const mockUsers: User[] = [
  {
    id: "user-1",
    name: "John Doe",
    email: "john@example.com",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "user-2",
    name: "Jane Smith",
    email: "jane@example.com",
    created_at: "2024-01-02T00:00:00Z",
    updated_at: "2024-01-02T00:00:00Z",
  },
  {
    id: "user-3",
    name: "Admin User",
    email: "admin@example.com",
    created_at: "2024-01-03T00:00:00Z",
    updated_at: "2024-01-03T00:00:00Z",
  },
  {
    id: "user-deleted",
    name: "Deleted User",
    email: "deleted@example.com",
    created_at: "2024-01-04T00:00:00Z",
    updated_at: "2024-01-04T00:00:00Z",
    deleted_at: "2024-02-01T00:00:00Z",
  },
];

/**
 * モックパスワード（平文）
 * 本番環境では絶対に使用しないこと
 */
export const mockPasswords: Record<string, string> = {
  "john@example.com": "password123",
  "jane@example.com": "password456",
  "admin@example.com": "adminpass",
  "deleted@example.com": "password123",
};

/**
 * Google アカウント ID のマッピング
 */
export const mockGoogleIds: Record<string, string> = {
  "google-id-1": "user-1",
  "google-id-2": "user-2",
};

/**
 * JWT トークンの生成（モック用）
 *
 * @param userId - ユーザー ID
 * @returns モック JWT トークン
 */
export function generateMockToken(userId: string): string {
  // 実際の JWT トークンに似せた形式（3 つのパートをドットで区切る）
  // 本番環境では適切な JWT ライブラリを使用すること
  const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));

  // 1時間後に期限切れ
  const expirationTime = Math.floor(Date.now() / 1000) + 3600;

  const payload = btoa(
    JSON.stringify({
      sub: userId,
      exp: expirationTime,
      iat: Math.floor(Date.now() / 1000),
    }),
  );

  const signature = btoa(`mock-signature-${userId}`);

  return `${header}.${payload}.${signature}`;
}

/**
 * メールアドレスからユーザーを検索
 */
export function findUserByEmail(email: string): User | undefined {
  return mockUsers.find((user) => user.email === email);
}

/**
 * ユーザー ID からユーザーを検索
 */
export function findUserById(id: string): User | undefined {
  return mockUsers.find((user) => user.id === id);
}

/**
 * 新しいユーザーを追加(モック用)
 */
export function addMockUser(user: User): void {
  mockUsers.push(user);
}

/**
 * ユーザーのパスワードを設定（モック用）
 */
export function setMockPassword(email: string, password: string): void {
  mockPasswords[email] = password;
}

/**
 * パスワードを検証（モック用）
 */
export function verifyPassword(email: string, password: string): boolean {
  return mockPasswords[email] === password;
}
