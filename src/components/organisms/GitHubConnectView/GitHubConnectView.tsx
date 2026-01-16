"use client";

import { Building2, Github, Loader2 } from "lucide-react";
import { Button } from "@/components/atoms/Button";
import { Text } from "@/components/atoms/Text";
import { cn } from "@/utils_constants_styles/utils";

export type GitHubConnectStep = "account" | "organization";

export type GitHubConnectViewProps = {
  /** 表示するステップ */
  step: GitHubConnectStep;
  /** 連携ボタン押下時のコールバック */
  onConnect: () => void;
  /** ローディング中か */
  isLoading?: boolean;
  /** カスタムクラス名 */
  className?: string;
};

const STEP_CONFIG = {
  account: {
    icon: Github,
    title: "GitHub連携が必要です",
    description: "この機能を使用するには、GitHubアカウントとの連携が必要です。",
    buttonText: "GitHubアカウントを連携する",
  },
  organization: {
    icon: Building2,
    title: "組織の紐付けが必要です",
    description:
      "PRやマイルストーンを表示するため、対象の組織を選択してください。",
    buttonText: "組織を選択する",
  },
} as const;

/**
 * GitHub連携が必要な場合に表示するビュー
 *
 * - Step 1 (account): GitHubアカウント連携
 * - Step 2 (organization): 組織連携
 */
export function GitHubConnectView({
  step,
  onConnect,
  isLoading = false,
  className,
}: GitHubConnectViewProps) {
  const config = STEP_CONFIG[step];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-8 text-center",
        className,
      )}
    >
      {/* アイコン */}
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-muted/50">
        <Icon className="h-10 w-10 text-muted-foreground" />
      </div>

      {/* タイトル */}
      <Text as="h3" size="lg" weight="bold" className="mb-2">
        {config.title}
      </Text>

      {/* 説明文 */}
      <Text size="sm" className="mb-6 max-w-xs text-muted-foreground">
        {config.description}
      </Text>

      {/* 連携ボタン */}
      <Button
        onClick={onConnect}
        disabled={isLoading}
        className="min-w-[200px]"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            連携中...
          </>
        ) : (
          <>
            <Icon className="mr-2 h-4 w-4" />
            {config.buttonText}
          </>
        )}
      </Button>
    </div>
  );
}
