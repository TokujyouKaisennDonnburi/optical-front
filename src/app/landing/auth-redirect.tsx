"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";

/**
 * 認証済みユーザーを自動的にホームページにリダイレクトする
 * UIを持たず、副作用のみを実行する
 */
export function AuthRedirect() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      router.push("/");
    }
  }, [user, isLoading, router]);

  // UIを持たない（リダイレクトロジックのみ）
  return null;
}
