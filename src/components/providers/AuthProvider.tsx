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
  fetchCurrentUser,
  getGitHubAuthState,
  login as requestLogin,
  logout as requestLogout,
  signup as requestSignup,
} from "@/lib/api-auth";
import { joinCalendar } from "@/lib/api-calendars";
import { ApiClientError } from "@/lib/api-client";
import { postGoogleOauth } from "@/lib/api-google";
import {
  isAuthenticated,
  removeRefreshToken,
  removeToken,
  saveRefreshToken,
  saveToken,
} from "@/lib/auth";
import { clearPendingInvite, getPendingInvite } from "@/lib/calendar-invite";
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
  /** ログアウト中かどうか */
  isLoggingOut: boolean;
  /** ログイン */
  login: (credentials: LoginRequest) => Promise<void>;
  /** サインアップ */
  signup: (data: SignupRequest) => Promise<void>;
  /** Google ログイン（リダイレクト） */
  loginWithGoogle: () => void;
  /** GitHub ログイン（リダイレクト） */
  loginWithGitHub: () => Promise<void>;
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
  const [isLoggingOut, setIsLoggingOut] = useState(false);
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
        saveRefreshToken(response.refreshToken);
        setUser(response.user);

        toast.success("ログインしました", { duration: 2000 });

        // 招待情報があればjoin APIを呼び出し、なければホームへ
        console.log("[AuthProvider] Checking for pending invite...");
        const pendingInvite = getPendingInvite();
        console.log("[AuthProvider] pendingInvite:", pendingInvite);
        if (pendingInvite) {
          clearPendingInvite();
          try {
            console.log("[AuthProvider] Calling joinCalendar...");
            await joinCalendar(pendingInvite.calendarId, pendingInvite.token);
            toast.success("カレンダーに参加しました", { duration: 2000 });
            router.push(`/calendars/${pendingInvite.calendarId}`);
          } catch (joinErr) {
            console.error("[AuthProvider] joinCalendar error:", joinErr);
            toast.error("カレンダーへの参加に失敗しました", { duration: 2000 });
            router.push("/");
          }
        } else {
          console.log("[AuthProvider] No pending invite, redirecting to /");
          router.push("/");
        }
      } catch (err) {
        // デバッグ: エラー内容を確認（本番環境では出力しない）
        if (process.env.NODE_ENV !== "production") {
          console.error("[Login Error]", {
            isApiClientError: err instanceof ApiClientError,
            code: err instanceof ApiClientError ? err.code : "N/A",
            message: err instanceof Error ? err.message : String(err),
          });
        }

        if (err instanceof ApiClientError) {
          const lowerMessage = err.message.toLowerCase();

          // OAuth登録済みアカウントの検出
          if (
            err.code === 403 ||
            lowerMessage.includes("google") ||
            lowerMessage.includes("github") ||
            lowerMessage.includes("oauth")
          ) {
            // Google登録の場合
            if (lowerMessage.includes("google")) {
              const oauthError = new Error(
                "このメールアドレスはGoogleアカウントで登録されています",
              );
              setError(oauthError);
              toast.error(
                "このメールアドレスはGoogleアカウントで登録されています",
                {
                  description: "Googleでログインボタンをご利用ください",
                  duration: 5000,
                },
              );
              throw oauthError;
            }

            // GitHub登録の場合
            if (lowerMessage.includes("github")) {
              const oauthError = new Error(
                "このメールアドレスはGitHubアカウントで登録されています",
              );
              setError(oauthError);
              toast.error(
                "このメールアドレスはGitHubアカウントで登録されています",
                {
                  description: "GitHubでログインボタンをご利用ください",
                  duration: 5000,
                },
              );
              throw oauthError;
            }

            // 一般的なOAuthエラー
            const oauthError = new Error(
              "このメールアドレスは外部アカウントで登録されています",
            );
            setError(oauthError);
            toast.error(
              "このメールアドレスは外部アカウントで登録されています",
              {
                description: "Google または GitHub でログインしてください",
                duration: 5000,
              },
            );
            throw oauthError;
          }

          // 認証エラー（401）の場合は専用メッセージ
          if (err.code === 401) {
            const authError = new Error(
              "メールアドレスまたはパスワードが間違っています",
            );
            setError(authError);
            toast.error("メールアドレスまたはパスワードが間違っています", {
              description: "入力内容をご確認ください",
              duration: 4000,
            });
            throw authError;
          }
        }

        // その他のエラー
        const error =
          err instanceof Error ? err : new Error("ログインに失敗しました");
        setError(error);
        toast.error(error.message, { duration: 2000 });
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

        toast.success("アカウントを作成しました", { duration: 2000 });

        // 招待情報があればjoin APIを呼び出し、なければホームへ
        const pendingInvite = getPendingInvite();
        if (pendingInvite) {
          clearPendingInvite();
          try {
            await joinCalendar(pendingInvite.calendarId, pendingInvite.token);
            toast.success("カレンダーに参加しました", { duration: 2000 });
            router.push(`/calendars/${pendingInvite.calendarId}`);
          } catch {
            toast.error("カレンダーへの参加に失敗しました", { duration: 2000 });
            router.push("/");
          }
        } else {
          router.push("/");
        }
      } catch (err) {
        // デバッグ: エラー内容を確認（本番環境では出力しない）
        if (process.env.NODE_ENV !== "production") {
          console.error("[Signup Error]", {
            isApiClientError: err instanceof ApiClientError,
            code: err instanceof ApiClientError ? err.code : "N/A",
            message: err instanceof Error ? err.message : String(err),
          });
        }

        // メールアドレス重複エラーの検出
        if (err instanceof ApiClientError) {
          const lowerMessage = err.message.toLowerCase();
          // HTTP 409 Conflict, PostgreSQL constraint error, または特定のエラーメッセージで判定
          if (
            err.code === 409 ||
            lowerMessage.includes("already exists") ||
            lowerMessage.includes("duplicate key") ||
            lowerMessage.includes("unique constraint") ||
            lowerMessage.includes("users_email_key") ||
            lowerMessage.includes("既に登録されています")
          ) {
            const duplicateError = new Error(
              "このメールアドレスは既に登録されています",
            );
            setError(duplicateError);
            toast.error("このメールアドレスは既に登録されています", {
              description:
                "別のメールアドレスを使用するか、ログインしてください",
              duration: 4000,
            });
            throw duplicateError;
          }
        }

        // その他のエラー
        const error =
          err instanceof Error ? err : new Error("サインアップに失敗しました");
        setError(error);
        toast.error(error.message, { duration: 2000 });
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
  const loginWithGoogle = useCallback(async () => {
    try {
      // バックエンドからGoogle認証URLを取得
      const response = await postGoogleOauth();
      // GitHub OAuth ページにリダイレクト
      window.location.href = response.url;
    } catch (err) {
      console.error("Google認証URLの取得に失敗しました:", err);
      toast.error("Google認証の開始に失敗しました", { duration: 2000 });
      // エラーを再スローして呼び出し側でキャッチできるようにする
      throw err;
    }
  }, []);

  /**
   * GitHub ログイン（リダイレクト）
   */
  const loginWithGitHub = useCallback(async () => {
    try {
      // バックエンドからGitHub認証URLを取得
      const response = await getGitHubAuthState();
      // GitHub OAuth ページにリダイレクト
      window.location.href = response.url;
    } catch (err) {
      console.error("GitHub認証URLの取得に失敗しました:", err);
      toast.error("GitHub認証の開始に失敗しました", { duration: 2000 });
      // エラーを再スローして呼び出し側でキャッチできるようにする
      throw err;
    }
  }, []);

  /**
   * ログアウト処理
   */
  const logout = useCallback(async () => {
    setIsLoading(true);
    setIsLoggingOut(true);
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
      removeRefreshToken();
      setUser(null);
      setIsLoading(false);
      setIsLoggingOut(false);

      toast.success("ログアウトしました", { duration: 2000 });
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
    isLoggingOut,
    error,
    login,
    signup,
    loginWithGoogle,
    loginWithGitHub,
    logout,
    refreshAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
