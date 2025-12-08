/**
 * 認証関連の型定義
 */

/**
 * ユーザー情報
 * データベースのusersテーブルに対応
 */
export interface User {
  /** ユーザーID */
  id: string;
  /** ユーザー名 */
  name: string;
  /** メールアドレス */
  email: string;
  /** 作成日時 */
  created_at: string;
  /** 更新日時 */
  updated_at: string;
  /** 削除日時 (null = 削除されていない) */
  deleted_at?: string | null;
}

/**
 * ログインリクエスト
 */
export interface LoginRequest {
  /** メールアドレス */
  email: string;
  /** パスワード */
  password: string;
}

/**
 * サインアップリクエスト
 */
export interface SignupRequest {
  /** ユーザー名 */
  name: string;
  /** メールアドレス */
  email: string;
  /** パスワード */
  password: string;
}

/**
 * 認証レスポンス
 */
export interface AuthResponse {
  /** JWT トークン */
  accessToken: string;
  /** ユーザー情報 */
  user: User;
}

/**
 * Google OAuth コールバック
 */
export interface GoogleAuthCallback {
  /** JWT トークン */
  token: string;
  /** ユーザー情報 */
  user: User;
}

/**
 * API エラーレスポンス
 */
export interface ApiError {
  error: {
    /** HTTP ステータスコード */
    code: number;
    /** エラーメッセージ */
    message: string;
  };
}

/**
 * Google アカウント情報
 * データベースのgoogle_idsテーブルに対応
 */
export interface GoogleAccount {
  /** Google アカウント ID */
  id: string;
  /** ユーザーID */
  user_id: string;
  /** Google アカウントのユニーク ID */
  google_id: string;
  /** 作成日時 */
  created_at: string;
  /** 更新日時 */
  updated_at: string;
}
