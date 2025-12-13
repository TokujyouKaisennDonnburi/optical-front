import { apiGet, apiPost } from "@/lib/api-client";
import type {
  AuthResponse,
  LoginRequest,
  SignupRequest,
  User,
} from "@/types/auth";

export const AUTH_GOOGLE_LOGIN_URL = "/api/auth/google";

/**
 * GitHub認証URL取得のレスポンス型
 */
interface GitHubStateResponse {
  url: string;
}

/**
 * GitHub認証コールバックのリクエスト型
 */
interface GitHubCallbackRequest {
  code: string;
  state: string;
}

export async function fetchCurrentUser() {
  return apiGet<User>("/users/@me");
}

export async function login(credentials: LoginRequest) {
  return apiPost<AuthResponse>("/login", credentials, {
    useAuth: false,
  });
}

export async function signup(payload: SignupRequest) {
  return apiPost<AuthResponse>("/register", payload, {
    useAuth: false,
  });
}

export async function logout() {
  return apiPost("/api/auth/logout");
}

/**
 * GitHub認証URLを取得
 * @returns GitHub認証用のURL
 */
export async function getGitHubAuthState() {
  return apiPost<GitHubStateResponse>("/auth/github/state", undefined, {
    useAuth: false,
  });
}

/**
 * GitHubコールバック処理（ログイン/登録）
 * @param payload code と state
 * @returns アクセストークンとリフレッシュトークン
 */
export async function postGitHubCallback(payload: GitHubCallbackRequest) {
  return apiPost<AuthResponse>("/auth/github/callback", payload, {
    useAuth: false,
  });
}
