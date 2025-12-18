import { apiGet, apiPost, apiRequest } from "@/lib/api-client";
import type {
  AuthResponse,
  LoginRequest,
  SignupRequest,
  TokenRefreshRequest,
  TokenRefreshResponse,
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

export async function postRefreshToken(credentials: TokenRefreshRequest) {
  return apiRequest<TokenRefreshResponse>(
    "/refresh",
    {
      useAuth: false,
      method: "POST",
      body: JSON.stringify(credentials),
    },
    true,
  );
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
  return apiPost("/logout");
}

/**
 * GitHub認証URLを取得
 * @returns GitHub認証用のURL
 */
export async function getGitHubAuthState() {
  return apiPost<GitHubStateResponse>("/github/oauth/create", undefined, {
    useAuth: false,
  });
}

/**
 * GitHubコールバック処理（ログイン/登録）
 * @param payload code と state
 * @returns アクセストークンとリフレッシュトークン
 */
export async function postGitHubCallback(payload: GitHubCallbackRequest) {
  return apiPost<AuthResponse>("/github/oauth/link", payload, {
    useAuth: false,
  });
}
