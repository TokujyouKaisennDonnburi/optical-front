"use client";

/**
 * サインアップフォームコンポーネント
 */

import { type FormEvent, useState } from "react";
import { Button } from "@/components/atoms/Button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/atoms/Card";
import { Input } from "@/components/atoms/Input";
import { Label } from "@/components/atoms/Label";
import { useAuth } from "@/hooks/useAuth";

/**
 * サインアップフォーム
 */
export function SignupForm() {
  const { signup, isLoading } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
  }>({});

  /**
   * フォームのバリデーション
   */
  const validate = (): boolean => {
    const newErrors: { name?: string; email?: string; password?: string } = {};

    // 名前の検証
    if (!name) {
      newErrors.name = "名前は必須です";
    }

    // メールアドレスの検証
    if (!email) {
      newErrors.email = "メールアドレスは必須です";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "有効なメールアドレスを入力してください";
    }

    // パスワードの検証
    if (!password) {
      newErrors.password = "パスワードは必須です";
    } else if (password.length < 8) {
      newErrors.password = "パスワードは8文字以上である必要があります";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * フォーム送信ハンドラー
   */
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // バリデーション
    if (!validate()) {
      return;
    }

    try {
      await signup({ name, email, password });
    } catch {
      // エラーは AuthProvider で処理される
    }
  };

  return (
    <Card className="w-full border-0 shadow-xl bg-white/90 backdrop-blur-md">
      <CardHeader className="space-y-1 pb-4">
        <CardTitle className="text-2xl font-bold text-center text-gray-900">
          サインアップ
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* 名前 */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium text-gray-700">
              名前
            </Label>
            <Input
              id="name"
              type="text"
              placeholder="山田太郎"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isLoading}
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? "name-error" : undefined}
              className="h-11 bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500 text-gray-900 placeholder:text-gray-400"
            />
            {errors.name && (
              <p
                id="name-error"
                className="text-sm text-red-600 flex items-center gap-1"
              >
                <span className="text-xs">⚠</span>
                {errors.name}
              </p>
            )}
          </div>

          {/* メールアドレス */}
          <div className="space-y-2">
            <Label
              htmlFor="email"
              className="text-sm font-medium text-gray-700"
            >
              メールアドレス
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="example@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? "email-error" : undefined}
              className="h-11 bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500 text-gray-900 placeholder:text-gray-400"
            />
            {errors.email && (
              <p
                id="email-error"
                className="text-sm text-red-600 flex items-center gap-1"
              >
                <span className="text-xs">⚠</span>
                {errors.email}
              </p>
            )}
          </div>

          {/* パスワード */}
          <div className="space-y-2">
            <Label
              htmlFor="password"
              className="text-sm font-medium text-gray-700"
            >
              パスワード
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? "password-error" : undefined}
              className="h-11 bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500 text-gray-900 placeholder:text-gray-400"
            />
            {errors.password && (
              <p
                id="password-error"
                className="text-sm text-red-600 flex items-center gap-1"
              >
                <span className="text-xs">⚠</span>
                {errors.password}
              </p>
            )}
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <span>ℹ️</span>
              8文字以上のパスワードを入力してください
            </p>
          </div>

          {/* サインアップボタン */}
          <Button
            type="submit"
            className="w-full h-11 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-md hover:shadow-lg transition-all duration-200 text-white"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                作成中...
              </span>
            ) : (
              "アカウントを作成"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
