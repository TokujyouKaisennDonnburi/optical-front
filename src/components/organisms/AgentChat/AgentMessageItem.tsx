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

export function AgentMessageItem({ message, user }: AgentMessageItemProps) {
  const isAgent = message.role === "agent";

  // Initials generation
  const initials = user?.name ? user.name.slice(0, 2).toUpperCase() : "U";

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
