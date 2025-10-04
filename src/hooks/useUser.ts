"use client";

import { useEffect, useState } from "react";
import { startMockServiceWorker } from "@/mocks/browser";

// ユーザー情報の型定義
export type User = {
  id: string;
  name: string;
  email: string;
  password: string;
  iconUrl?: string; // ユーザーアイコン画像
};

export function useUser() {
  const [user, setUser] = useState<User | null>(null);  // ユーザー情報の状態
  const [isLoading, setIsLoading] = useState(true); // ローディング状態
  const [error, setError] = useState<Error | null>(null); // エラー状態

  useEffect(() => {
    let isMounted = true; // 画面にこのコンポーネントがまだ表示されているかを確認するフラグ

    const fetchUser = async () => {
      if (typeof window !== "undefined") {
        await startMockServiceWorker();
      }
      setIsLoading(true);
      setError(null);

      try {
        // モックAPIからユーザー情報を取得
        const response = await fetch("/api/user");

        // レスポンスのチェック
        if (!response.ok) {
          throw new Error(`Failed to fetch: ${response.status}`);
        }
        
        const json = (await response.json()) as User;

        // コンポーネントがまだ画面にある場合のみ、状態を更新
        if (isMounted) {
          setUser(json);
        }
      } catch (err) {
        // エラー処理
        if (isMounted) {
          setError(err instanceof Error ? err : new Error("不明のエラー"));
        }
      } finally {
        // ローディング終了
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void fetchUser();
    
    // コンポーネントが画面から消えたときに実行される(アンマウント処理)
    return () => {
      // 非同期処理が終わったあとに不要な setState を防ぐ
      isMounted = false;
    };
  }, []);

  return {
    user,
    isLoading,
    error,
  };
}
