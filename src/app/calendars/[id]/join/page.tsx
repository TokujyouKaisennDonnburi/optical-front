"use client";

/**
 * 招待参加承認ページ
 * - ログイン済み: join APIを呼び出してカレンダーに参加
 * - 未ログイン: 招待情報をCookieに保存してログインページにリダイレクト
 */

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, use, useEffect, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { joinCalendar } from "@/lib/api-calendars";
import { ApiClientError } from "@/lib/api-client";
import { savePendingInvite } from "@/lib/calendar-invite";

/**
 * カレンダー参加ページコンポーネント
 */
function CalendarJoinPageContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoading: isAuthLoading } = useAuth();
  const { id } = use(params);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id || isAuthLoading) {
      return;
    }

    const token = searchParams.get("token");

    if (!token) {
      const errorMessage = "招待トークンが見つかりません";
      setError(errorMessage);
      toast.error(errorMessage, { duration: 2000 });
      router.push("/");
      return;
    }

    // 未ログインの場合: Cookieに保存してログインページへ
    if (!user) {
      savePendingInvite(id, token);
      toast.info("カレンダーに参加するにはログインが必要です", {
        duration: 3000,
      });
      router.push("/auth/login");
      return;
    }

    // ログイン済みの場合: join APIを呼び出す
    const fetchJoin = async () => {
      try {
        await joinCalendar(id, token);
        router.push(`/calendars/${id}`);
        toast.success("カレンダーに参加しました", { duration: 2000 });
      } catch (err) {
        const apiErrorMessage =
          err instanceof ApiClientError ? err.message.toLowerCase() : "";
        let errorMessage: string;
        if (apiErrorMessage.includes("already used")) {
          errorMessage = "この招待リンクは既に使用されています";
          toast.error(errorMessage, { duration: 4000 });
        } else if (
          apiErrorMessage.includes("expired") ||
          apiErrorMessage.includes("invalid")
        ) {
          errorMessage = "この招待リンクは期限切れまたは無効です";
          toast.error(errorMessage, { duration: 4000 });
        } else {
          errorMessage = "カレンダーへの参加に失敗しました";
          toast.error(errorMessage, { duration: 2000 });
        }
        setError(errorMessage);
        router.push("/");
      }
    };
    fetchJoin();
  }, [id, searchParams, router, user, isAuthLoading]);

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
              参加に失敗しました
            </h2>
            <p className="text-gray-600">{error}</p>
            <p className="text-sm text-gray-500">
              ホームページにリダイレクトします...
            </p>
          </>
        ) : (
          <>
            <svg
              className="animate-spin h-16 w-16 mx-auto text-blue-600"
              viewBox="0 0 24 24"
              role="status"
              aria-label="参加処理中"
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
            <h2 className="text-2xl font-bold text-gray-900">参加処理中...</h2>
            <p className="text-gray-600">
              カレンダーへの参加を処理しています。しばらくお待ちください。
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
export default function CalendarJoinPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
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
      <CalendarJoinPageContent params={params} />
    </Suspense>
  );
}
