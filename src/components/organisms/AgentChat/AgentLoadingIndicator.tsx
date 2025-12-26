/**
 * AIエージェントの処理中ステータスを表示するローディングインジケーター
 */

import { Bot, Brain, Calendar, Loader2, Sparkles } from "lucide-react";
import type { ProcessingStage } from "@/lib/api-agent-sse";
import { cn } from "@/utils_constants_styles/utils";

export type AgentLoadingIndicatorProps = {
  /** 現在の処理ステージ */
  stage: ProcessingStage;
  /** 表示するメッセージ */
  message: string;
  /** 追加のclassName */
  className?: string;
};

/**
 * ステージに応じたアイコンを取得
 */
function getStageIcon(stage: ProcessingStage) {
  switch (stage) {
    case "connecting":
      return Loader2;
    case "analyzing":
      return Brain;
    case "fetching":
      return Calendar;
    case "generating":
      return Sparkles;
    default:
      return Bot;
  }
}

/**
 * ステージに応じたアニメーションクラスを取得
 */
function getAnimationClass(stage: ProcessingStage): string {
  switch (stage) {
    case "connecting":
      return "animate-spin";
    case "analyzing":
      return "animate-pulse";
    case "fetching":
      return "animate-bounce";
    case "generating":
      return "animate-pulse";
    default:
      return "";
  }
}

export function AgentLoadingIndicator({
  stage,
  message,
  className,
}: AgentLoadingIndicatorProps) {
  const Icon = getStageIcon(stage);
  const animationClass = getAnimationClass(stage);

  return (
    <div className={cn("flex w-full gap-3 mb-4 justify-start", className)}>
      {/* Agent Avatar */}
      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
        <Bot size={16} className="text-primary" />
      </div>

      {/* Loading Content */}
      <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-muted/50 border border-border/50">
        {/* Animated Icon */}
        <div
          className={cn(
            "w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center",
          )}
        >
          <Icon size={14} className={cn("text-primary", animationClass)} />
        </div>

        {/* Status Message */}
        <div className="flex flex-col gap-1">
          <span className="text-sm text-foreground">{message}</span>

          {/* Animated Dots */}
          <div className="flex gap-1">
            <span
              className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-bounce"
              style={{ animationDelay: "0ms" }}
            />
            <span
              className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-bounce"
              style={{ animationDelay: "150ms" }}
            />
            <span
              className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-bounce"
              style={{ animationDelay: "300ms" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
