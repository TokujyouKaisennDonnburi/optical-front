"use client";

/**
 * ログインページ
 */

import { Calendar } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { GitHubLoginButton } from "@/components/atoms/GitHubLoginButton";
import { GoogleLoginButton } from "@/components/atoms/GoogleLoginButton";
import { Loading } from "@/components/atoms/Loading";
import { LoginForm } from "@/components/molecules/LoginForm";
import { useAuth } from "@/hooks/useAuth";

/**
 * ログインページコンポーネント
 */
export default function LoginPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  // 既に認証済みの場合はカレンダーページにリダイレクト
  useEffect(() => {
    if (!isLoading && user) {
      router.push("/");
    }
  }, [user, isLoading, router]);

  // ローディング中
  if (isLoading) {
    return <Loading variant="fullscreen" size="lg" message="読み込み中..." />;
  }

  // 未認証の場合のみログインフォームを表示
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 px-4 py-12">
        <div className="w-full max-w-md space-y-8">
          {/* ヘッダー */}
          <div className="text-center space-y-4">
            <Link
              href="/landing"
              className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
            >
              <Calendar className="w-8 h-8 text-white" />
            </Link>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
              OptiCal
            </h1>
            <p className="text-base text-gray-600">
              アカウントにログインしてください
            </p>
          </div>

          {/* ログインフォーム */}
          <LoginForm />

          {/* 区切り線 */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-gradient-to-br from-blue-50 via-white to-purple-50 text-gray-500">
                または
              </span>
            </div>
          </div>

          {/* Google ログイン */}
          <GoogleLoginButton />

          {/* GitHub ログイン */}
          <GitHubLoginButton />

          {/* フッター */}
          <p className="text-center text-sm text-gray-600">
            アカウントをお持ちでない方は
            <Link
              href="/auth/signup"
              className="ml-1 font-medium text-blue-600 hover:text-blue-700 hover:underline transition-colors"
            >
              新規登録
            </Link>
          </p>
        </div>
      </div>
    );
  }

  return null;
}
