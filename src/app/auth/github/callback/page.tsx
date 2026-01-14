"use client";

/**
 * OAuth コールバックページ
 * GitHub 認証後にリダイレクトされるページ
 */

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { postGitHubCallback } from "@/lib/api-auth";
import { postGithubAppInstall } from "@/lib/api-github";
import { saveRefreshToken, saveToken } from "@/lib/auth";

/**
 * OAuth コールバックページコンポーネント
 */
function CallbackPageContent() {
  const router = useRouter();
  const { refreshAuth } = useAuth();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get("code");
      const state = searchParams.get("state");
      const installationId = searchParams.get("installation_id");

      if (!code) {
        const errorMessage = "認証コードが見つかりません";
        setError(errorMessage);
        toast.error(errorMessage, { duration: 2000 });
        setTimeout(() => {
          router.push("/auth/login");
        }, 3000);
        return;
      }

      if (!state) {
        const errorMessage = "stateが見つかりません";
        setError(errorMessage);
        toast.error(errorMessage, { duration: 2000 });
        setTimeout(() => {
          router.push("/auth/login");
        }, 3000);
        return;
      }

      // GitHub App インストール（既存ユーザーがGitHub組織を連携する場合）
      if (installationId) {
        try {
          await postGithubAppInstall({
            code: code,
            state: state,
            installationId: installationId,
          });
          toast.success("カレンダーにGitHub組織を紐づけました", {
            duration: 2000,
          });
          router.push("/");
        } catch (_) {
          toast.error("認証に失敗しました", { duration: 2000 });
          router.push("/auth/login");
        }
      } else {
        // GitHub OAuth ログイン/登録
        try {
          const response = await postGitHubCallback({
            code: code,
            state: state,
          });
          if (
            response.accessToken.length === 0 ||
            response.refreshToken.length === 0
          ) {
            // 既存ユーザーに紐づけ
            toast.success("GitHubアカウントを紐づけました", { duration: 2000 });
            router.push("/");
          } else {
            // OAuthでログイン
            saveToken(response.accessToken);
            saveRefreshToken(response.refreshToken);
            await refreshAuth();
            toast.success("GitHubでログインしました", { duration: 2000 });
            router.push("/");
          }
        } catch (_) {
          toast.error("認証に失敗しました", { duration: 2000 });
          router.push("/auth/login");
        }
      }
    };

    void handleCallback();
  }, [searchParams, router, refreshAuth]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center space-y-4">
        {error ? (
          <>
            <div className="text-red-600">
              <svg
                className="w-16 h-16 mx-auto"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                role="img"
                aria-label="Error icon"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              認証に失敗しました
            </h2>
            <p className="text-gray-600">{error}</p>
            <p className="text-sm text-gray-500">
              ログインページにリダイレクトします...
            </p>
          </>
        ) : (
          <>
            <svg
              className="animate-spin h-16 w-16 mx-auto text-blue-600"
              viewBox="0 0 24 24"
              role="status"
              aria-label="認証中"
            >
              <title>Loading</title>
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              />
            </svg>
            <h2 className="text-2xl font-bold text-gray-900">認証中...</h2>
            <p className="text-gray-600">
              Githubアカウント認証を処理しています。しばらくお待ちください。
            </p>
          </>
        )}
      </div>
    </div>
  );
}

/**
 * Suspenseでラップしたエクスポート
 */
export default function CallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center space-y-4">
            <svg
              className="animate-spin h-16 w-16 mx-auto text-blue-600"
              viewBox="0 0 24 24"
              role="status"
              aria-label="読み込み中"
            >
              <title>Loading</title>
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              />
            </svg>
            <h2 className="text-2xl font-bold text-gray-900">読み込み中...</h2>
          </div>
        </div>
      }
    >
      <CallbackPageContent />
    </Suspense>
  );
}
