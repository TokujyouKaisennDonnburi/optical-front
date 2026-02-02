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
import { joinCalendar } from "@/lib/api-calendars";
import { ApiClientError } from "@/lib/api-client";
import { postGithubAppInstall } from "@/lib/api-github";
import { saveRefreshToken, saveToken } from "@/lib/auth";
import { clearPendingInvite, getPendingInvite } from "@/lib/calendar-invite";

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

      if (!state) {
        const errorMessage = "認証コードが見つかりません";
        setError(errorMessage);
        toast.error(errorMessage, { duration: 2000 });
        setTimeout(() => {
          router.push("/auth/login");
        }, 3000);
        return;
      }

      // 招待情報があればjoin APIを呼び出し、リダイレクト先を返す
      const handlePendingInvite = async (): Promise<string> => {
        const pendingInvite = getPendingInvite();
        if (pendingInvite) {
          clearPendingInvite();
          try {
            await joinCalendar(pendingInvite.calendarId, pendingInvite.token);
            toast.success("カレンダーに参加しました", { duration: 2000 });
            return `/calendars/${pendingInvite.calendarId}`;
          } catch (joinErr) {
            const errorMessage =
              joinErr instanceof ApiClientError
                ? joinErr.message.toLowerCase()
                : "";
            if (errorMessage.includes("already used")) {
              toast.error("この招待リンクは既に使用されています", {
                duration: 4000,
              });
            } else if (
              errorMessage.includes("expired") ||
              errorMessage.includes("invalid")
            ) {
              toast.error("この招待リンクは期限切れまたは無効です", {
                duration: 4000,
              });
            } else {
              toast.error("カレンダーへの参加に失敗しました", {
                duration: 2000,
              });
            }
            return "/";
          }
        }
        return "/";
      };

      // GitHub App インストール（既存ユーザーがGitHub組織を連携する場合）
      // codeはオプショナル（code作成者と別の人がインストールした場合は発行されない）
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
          router.push(await handlePendingInvite());
        } catch (_) {
          toast.error("認証に失敗しました", { duration: 2000 });
          router.push("/auth/login");
        }
      } else {
        // GitHub OAuth ログイン/登録（installationIdがない場合はcodeが必須）
        if (!code) {
          const errorMessage = "認証コードが見つかりません";
          setError(errorMessage);
          toast.error(errorMessage, { duration: 2000 });
          setTimeout(() => {
            router.push("/auth/login");
          }, 3000);
          return;
        }

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
            router.push(await handlePendingInvite());
          } else {
            // OAuthでログイン
            saveToken(response.accessToken);
            saveRefreshToken(response.refreshToken);
            await refreshAuth();
            toast.success("GitHubでログインしました", { duration: 2000 });
            router.push(await handlePendingInvite());
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
