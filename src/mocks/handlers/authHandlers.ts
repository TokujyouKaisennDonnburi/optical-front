/**
 * 認証 API のモックハンドラー
 */

import { HttpResponse, http } from "msw";
import type { AuthResponse, LoginRequest, SignupRequest } from "@/types/auth";
import {
  addMockUser,
  findUserByEmail,
  findUserById,
  generateMockToken,
  setMockPassword,
  verifyPassword,
} from "../data/users";

/**
 * 認証ハンドラー
 */
export const authHandlers = [
  /**
   * POST /api/auth/signup
   * サインアップ
   */
  http.post("/api/auth/signup", async ({ request }) => {
    const body = (await request.json()) as SignupRequest;
    const { name, email, password } = body;

    // バリデーション
    if (!name || !email || !password) {
      return HttpResponse.json(
        {
          error: {
            code: 400,
            message: "名前、メールアドレス、パスワードは必須です",
          },
        },
        { status: 400 },
      );
    }

    // メールアドレスの重複チェック
    const existingUser = findUserByEmail(email);
    if (existingUser) {
      return HttpResponse.json(
        {
          error: {
            code: 400,
            message: "このメールアドレスは既に登録されています",
          },
        },
        { status: 400 },
      );
    }

    // 新しいユーザーを作成
    const newUser = {
      id: `user-${Date.now()}`,
      name,
      email,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // モックデータに追加
    addMockUser(newUser);
    setMockPassword(email, password);

    // JWT トークンを生成
    const token = generateMockToken(newUser.id);

    const response: AuthResponse = {
      accessToken: token,
      user: newUser,
    };

    // 少し遅延を追加してリアルな感じにする
    await new Promise((resolve) => setTimeout(resolve, 500));

    return HttpResponse.json(response, { status: 201 });
  }),

  /**
   * POST /api/auth/login
   * ログイン
   */
  http.post("/api/auth/login", async ({ request }) => {
    const body = (await request.json()) as LoginRequest;
    const { email, password } = body;

    // バリデーション
    if (!email || !password) {
      return HttpResponse.json(
        {
          error: {
            code: 400,
            message: "メールアドレスとパスワードは必須です",
          },
        },
        { status: 400 },
      );
    }

    // ユーザーを検索
    const user = findUserByEmail(email);

    // ユーザーが存在しない、またはパスワードが一致しない
    if (!user || !verifyPassword(email, password)) {
      return HttpResponse.json(
        {
          error: {
            code: 401,
            message: "メールアドレスまたはパスワードが正しくありません",
          },
        },
        { status: 401 },
      );
    }

    // 削除されたユーザーチェック
    if (user.deleted_at) {
      return HttpResponse.json(
        {
          error: {
            code: 403,
            message: "このアカウントは削除されています",
          },
        },
        { status: 403 },
      );
    }

    // JWT トークンを生成
    const token = generateMockToken(user.id);

    const response: AuthResponse = {
      accessToken: token,
      user,
    };

    // 少し遅延を追加
    await new Promise((resolve) => setTimeout(resolve, 500));

    return HttpResponse.json(response, { status: 200 });
  }),

  /**
   * GET /api/auth/me
   * 現在のユーザー情報を取得
   */
  http.get("/api/auth/me", ({ request }) => {
    // Authorization ヘッダーからトークンを取得
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return HttpResponse.json(
        {
          error: {
            code: 401,
            message: "認証が必要です",
          },
        },
        { status: 401 },
      );
    }

    const token = authHeader.replace("Bearer ", "");

    // トークンをデコード（簡易的な実装）
    try {
      const parts = token.split(".");
      if (parts.length !== 3) {
        throw new Error("Invalid token");
      }

      const payload = JSON.parse(atob(parts[1]));
      const userId = payload.sub;

      // トークンの有効期限チェック
      if (payload.exp && payload.exp * 1000 < Date.now()) {
        return HttpResponse.json(
          {
            error: {
              code: 401,
              message: "トークンの有効期限が切れています",
            },
          },
          { status: 401 },
        );
      }

      // ユーザーを検索
      const user = findUserById(userId);
      if (!user) {
        return HttpResponse.json(
          {
            error: {
              code: 401,
              message: "ユーザーが見つかりません",
            },
          },
          { status: 401 },
        );
      }

      // 削除されたユーザーチェック
      if (user.deleted_at) {
        return HttpResponse.json(
          {
            error: {
              code: 403,
              message: "このアカウントは削除されています",
            },
          },
          { status: 403 },
        );
      }

      return HttpResponse.json(user, { status: 200 });
    } catch {
      return HttpResponse.json(
        {
          error: {
            code: 401,
            message: "無効なトークンです",
          },
        },
        { status: 401 },
      );
    }
  }),

  /**
   * POST /api/auth/logout
   * ログアウト
   */
  http.post("/api/auth/logout", async () => {
    // モックなので特に処理は不要
    // 実際のバックエンドではトークンの無効化などを行う

    // 少し遅延を追加
    await new Promise((resolve) => setTimeout(resolve, 300));

    return HttpResponse.json(
      { message: "ログアウトしました" },
      { status: 200 },
    );
  }),

  /**
   * GET /api/auth/google
   * Google OAuth 開始（リダイレクト）
   */
  http.get("/api/auth/google", () => {
    // 実際の実装では Google の認証ページにリダイレクト
    // モックでは直接コールバックにリダイレクト
    const mockGoogleId = "google-id-1";
    const callbackUrl = `/api/auth/google/callback?code=mock-code-${mockGoogleId}`;

    return HttpResponse.json(
      { redirect: callbackUrl },
      {
        status: 302,
        headers: {
          Location: callbackUrl,
        },
      },
    );
  }),

  /**
   * GET /api/auth/google/callback
   * Google OAuth コールバック
   */
  http.get("/api/auth/google/callback", ({ request }) => {
    const url = new URL(request.url);
    const code = url.searchParams.get("code");
    const error = url.searchParams.get("error");

    // エラーハンドリング
    if (error) {
      return HttpResponse.json(
        {
          error: {
            code: 400,
            message: "Google認証がキャンセルされました",
          },
        },
        { status: 400 },
      );
    }

    if (!code) {
      return HttpResponse.json(
        {
          error: {
            code: 400,
            message: "認証コードが見つかりません",
          },
        },
        { status: 400 },
      );
    }

    // Google ID からユーザーを検索(既存ユーザー)
    const user = findUserById("user-1"); // モックなので固定

    if (!user) {
      return HttpResponse.json(
        {
          error: {
            code: 404,
            message: "ユーザーが見つかりません",
          },
        },
        { status: 404 },
      );
    }

    // JWT トークンを生成
    const token = generateMockToken(user.id);

    // フロントエンドのコールバックページにリダイレクト
    const frontendCallbackUrl = `/auth/callback?token=${token}`;

    return HttpResponse.json(
      { redirect: frontendCallbackUrl },
      {
        status: 302,
        headers: {
          Location: frontendCallbackUrl,
        },
      },
    );
  }),
];
