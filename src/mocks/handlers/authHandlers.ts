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
   * POST /register
   * サインアップ
   */
  http.post("http://localhost:8000/register", async ({ request }) => {
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
      refreshToken: token,
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
  http.post("http://localhost:8000/login", async ({ request }) => {
    console.log("[MSW] POST /login handler called");
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
      refreshToken: token,
      user,
    };

    // 少し遅延を追加
    await new Promise((resolve) => setTimeout(resolve, 500));

    return HttpResponse.json(response, { status: 200 });
  }),

  /**
   * GET /users/@me
   * 現在のユーザー情報を取得
   */
  http.get("http://localhost:8000/users/@me", ({ request }) => {
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
   * POST /logout
   * ログアウト
   */
  http.post("http://localhost:8000/logout", async () => {
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
   * POST /github/oauth/create
   * GitHub OAuth 開始（URL取得）
   */
  http.post("http://localhost:8000/github/oauth/create", async () => {
    // 少し遅延を追加
    await new Promise((resolve) => setTimeout(resolve, 300));

    // モック用のGitHub認証URL
    const mockState = `mock-state-${Date.now()}`;
    const mockUrl = `https://github.com/login/oauth/authorize?client_id=mock&state=${mockState}`;

    return HttpResponse.json({ url: mockUrl }, { status: 200 });
  }),

  /**
   * POST /github/oauth/link
   * GitHub OAuth コールバック処理
   */
  http.post("http://localhost:8000/github/oauth/link", async ({ request }) => {
    const body = (await request.json()) as { code: string; state: string };
    const { code, state } = body;

    // バリデーション
    if (!code || !state) {
      return HttpResponse.json(
        {
          error: {
            code: 400,
            message: "code と state は必須です",
          },
        },
        { status: 400 },
      );
    }

    // モックユーザーを取得
    const user = findUserById("user-1");

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

    // 少し遅延を追加
    await new Promise((resolve) => setTimeout(resolve, 500));

    return HttpResponse.json(
      {
        accessToken: token,
        refreshToken: token,
        user,
      },
      { status: 200 },
    );
  }),
];
