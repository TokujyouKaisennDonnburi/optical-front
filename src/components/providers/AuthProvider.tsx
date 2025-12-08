"use client";

/**
 * 認証プロバイダー
 * アプリケーション全体で認証状態を管理する
 */

import { useRouter } from "next/navigation";
import {
  createContext,
  type ReactNode,
  useCallback,
  useEffect,
  useState,
} from "react";
import { toast } from "sonner";
import {
  AUTH_GOOGLE_LOGIN_URL,
  fetchCurrentUser,
  login as requestLogin,
  logout as requestLogout,
  signup as requestSignup,
} from "@/lib/api-auth";
import { ApiClientError } from "@/lib/api-client";
import { isAuthenticated, removeToken, saveToken } from "@/lib/auth";
import type { LoginRequest, SignupRequest, User } from "@/types/auth";

/**
 * 認証コンテキストの型
 */
interface AuthContextType {
  /** 現在のユーザー情報 */
  user: User | null;
  /** ローディング状態 */
  isLoading: boolean;
  /** エラー */
  error: Error | null;
  /** ログイン */
  login: (credentials: LoginRequest) => Promise<void>;
  /** サインアップ */
  signup: (data: SignupRequest) => Promise<void>;
  /** Google ログイン（リダイレクト） */
  loginWithGoogle: () => void;
  /** ログアウト */
  logout: () => Promise<void>;
  /** 認証状態を再読み込み */
  refreshAuth: () => Promise<void>;
}

/**
 * 認証コンテキスト
 */
export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);

/**
 * 認証プロバイダーのプロパティ
 */
interface AuthProviderProps {
  children: ReactNode;
}

/**
 * 認証プロバイダーコンポーネント
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const router = useRouter();

  /**
   * ユーザー情報を取得する
   */
  const fetchUser = useCallback(async (): Promise<User | null> => {
    try {
      const userData = await fetchCurrentUser();
      return userData;
    } catch (err) {
      if (err instanceof ApiClientError && err.code === 401) {
        // トークンが無効な場合は削除
        removeToken();
      }
      return null;
    }
  }, []);

  /**
   * 認証状態を初期化する
   */
  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true);
      setError(null);

      // トークンが存在し、有効な場合のみユーザー情報を取得
      if (isAuthenticated()) {
        const userData = await fetchUser();
        setUser(userData);
      } else {
        // トークンが無効または存在しない場合
        removeToken();
        setUser(null);
      }

      setIsLoading(false);
    };

    void initAuth();
  }, [fetchUser]);

  /**
   * ログイン処理
   */
  const login = useCallback(
    async (credentials: LoginRequest) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await requestLogin(credentials);

        // トークンとユーザー情報を保存
        saveToken(response.accessToken);
        setUser(response.user);

        toast.success("ログインしました");
        router.push("/");
      } catch (err) {
        const error =
          err instanceof Error ? err : new Error("ログインに失敗しました");
        setError(error);
        toast.error(error.message);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [router],
  );

  /**
   * サインアップ処理
   */
  const signup = useCallback(
    async (data: SignupRequest) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await requestSignup(data);

        // トークンとユーザー情報を保存
        saveToken(response.accessToken);
        setUser(response.user);

        toast.success("アカウントを作成しました");
        router.push("/");
      } catch (err) {
        const error =
          err instanceof Error ? err : new Error("サインアップに失敗しました");
        setError(error);
        toast.error(error.message);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [router],
  );

  /**
   * Google ログイン（リダイレクト）
   */
  const loginWithGoogle = useCallback(() => {
    // Google OAuth エンドポイントにリダイレクト
    window.location.href = AUTH_GOOGLE_LOGIN_URL;
  }, []);

  /**
   * ログアウト処理
   */
  const logout = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // サーバー側のログアウト処理(オプション)
      await requestLogout();
    } catch (err) {
      // ログアウトエラーは無視（トークンは削除する）
      console.warn("[AuthProvider] Logout API error (ignored):", {
        error: err,
        message: err instanceof Error ? err.message : "Unknown error",
      });
    } finally {
      // ローカルの認証状態をクリア
      removeToken();
      setUser(null);
      setIsLoading(false);

      toast.success("ログアウトしました");
      router.push("/landing");
    }
  }, [router]);

  /**
   * 認証状態を再読み込み
   */
  const refreshAuth = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    if (isAuthenticated()) {
      const userData = await fetchUser();
      setUser(userData);
    } else {
      removeToken();
      setUser(null);
    }

    setIsLoading(false);
  }, [fetchUser]);

  const value: AuthContextType = {
    user,
    isLoading,
    error,
    login,
    signup,
    loginWithGoogle,
    logout,
    refreshAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
