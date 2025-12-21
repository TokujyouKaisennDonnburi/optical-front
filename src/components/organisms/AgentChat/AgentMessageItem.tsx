import { Bot } from "lucide-react";
import Image from "next/image";
import { cn } from "@/utils_constants_styles/utils";
import {
  OptionProposalCard,
  type OptionProposalProps,
} from "./OptionProposalCard";

export type MessageType = "text" | "option-proposal";

export type AgentMessage = {
  id: string;
  role: "user" | "agent";
  type: MessageType;
  content?: string;
  data?: OptionProposalProps[];
};

export type AgentMessageItemProps = {
  message: AgentMessage;
  user?: {
    name: string;
    avatarUrl?: string | null;
  } | null;
};

/**
 * ユーザー名からイニシャル（2文字）を生成する。
 * スペース区切りで単語を分割し、各単語の先頭コードポイントを取得。
 * 絵文字やサロゲートペアにも対応。
 */
function getInitials(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) {
    return "U";
  }

  // スペース区切りで単語に分割し、各単語の先頭コードポイントを取得
  const words = trimmed.split(/\s+/).filter(Boolean);
  const chars: string[] = [];

  for (let i = 0; i < words.length && chars.length < 2; i++) {
    const word = words[i];
    const codePoints = Array.from(word);
    if (codePoints.length > 0) {
      chars.push(codePoints[0]);
    }
  }

  if (chars.length === 2) {
    return (chars[0] + chars[1]).toUpperCase();
  }
  if (chars.length === 1) {
    // 1文字名などの場合でも2文字のイニシャルを返す
    return (chars[0] + chars[0]).toUpperCase();
  }

  // 単語単位で取得できなかった場合は、全体から最大2コードポイントを使用
  const fallback = Array.from(trimmed).slice(0, 2).join("");
  return fallback.toUpperCase() || "U";
}

export function AgentMessageItem({ message, user }: AgentMessageItemProps) {
  const isAgent = message.role === "agent";

  // Initials generation
  const initials = user?.name ? getInitials(user.name) : "U";

  return (
    <div
      className={cn(
        "flex w-full gap-3 mb-4",
        isAgent ? "justify-start" : "justify-end",
      )}
    >
      {isAgent && (
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
          <Bot size={16} className="text-primary" />
        </div>
      )}

      <div
        className={cn(
          "flex flex-col max-w-[85%]",
          isAgent ? "items-start" : "items-end",
        )}
      >
        {message.type === "text" && (
          <div
            className={cn(
              "px-3 py-2 rounded-lg text-sm whitespace-pre-wrap",
              isAgent
                ? "bg-muted text-foreground"
                : "bg-primary text-primary-foreground",
            )}
          >
            {message.content}
          </div>
        )}

        {message.type === "option-proposal" && message.data && (
          <div className="flex flex-col gap-2">
            {message.content && (
              <div className="px-3 py-2 rounded-lg text-sm bg-muted text-foreground mb-1">
                {message.content}
              </div>
            )}
            {message.data.map((proposal) => (
              <OptionProposalCard
                key={proposal.id}
                id={proposal.id}
                name={proposal.name}
                description={proposal.description}
              />
            ))}
          </div>
        )}
      </div>

      {!isAgent && (
        <div className="shrink-0">
          {user?.avatarUrl ? (
            <Image
              src={user.avatarUrl}
              alt={user.name}
              width={32}
              height={32}
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-xs font-medium text-secondary-foreground">
              {initials}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
