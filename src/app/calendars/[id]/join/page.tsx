"use client";

/**
 * 招待参加承認ページ
 */

import { useRouter } from "next/navigation";
import { Suspense, use, useEffect, useState } from "react";
import { toast } from "sonner";
import { joinCalendar } from "@/lib/api-calendars";

/**
 * OAuth コールバックページコンポーネント
 */
function CalendarJoinPageContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = use(params);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      return;
    }
    const fetchJoin = async () => {
      try {
        await joinCalendar(id);
        router.push(`/calendars/${id}`);
        toast.success("カレンダーに参加しました", { duration: 2000 });
      } catch {
        const errorMessage = "カレンダーに参加できませんでした";
        setError(errorMessage);
        toast.error(errorMessage, { duration: 2000 });
        router.push("/");
      }
    };
    fetchJoin();
  }, [id, router.push]);

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
