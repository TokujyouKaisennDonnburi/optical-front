import { Bot, Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";
import { Text } from "@/components/atoms/Text";
import { useAuth } from "@/hooks/useAuth";
import { sendChatMessage } from "@/lib/api-agent";
import { cn } from "@/utils_constants_styles/utils";
import { type AgentMessage, AgentMessageItem } from "./AgentMessageItem";

export type AgentChatViewProps = {
  className?: string;
};

export function AgentChatView({ className }: AgentChatViewProps) {
  const { user } = useAuth();
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMessage: AgentMessage = {
      id: Date.now().toString(),
      role: "user",
      type: "text",
      content: text,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");

    try {
      const data = await sendChatMessage(text);

      const agentMessage: AgentMessage = {
        id: data.id,
        role: "agent",
        type: data.type,
        content: data.content,
        data: data.data,
      };

      setMessages((prev) => [...prev, agentMessage]);
    } catch (error) {
      console.error("Chat error:", error);
      // Optional: Add error message to chat
      const errorMessage: AgentMessage = {
        id: Date.now().toString(),
        role: "agent",
        type: "text",
        content: "すみません、エラーが発生しました。もう一度お試しください。",
      };
      setMessages((prev) => [...prev, errorMessage]);
    }
  };

  return (
    <div className={cn("flex flex-col h-full relative", className)}>
      {/* Messages Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 flex flex-col">
        {messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6">
            <div className="flex flex-col items-center space-y-4 opacity-70">
              <div className="p-4 rounded-full bg-muted/50">
                <Bot size={48} className="text-muted-foreground" />
              </div>
              <div className="space-y-2 max-w-[280px]">
                <Text size="sm" className="text-muted-foreground">
                  カレンダーの最適化をお手伝いします。
                  <br />
                  何かお手伝いできることはありますか？
                </Text>
              </div>
            </div>

            {/* Quick Chips */}
            <div className="flex flex-wrap gap-2 justify-center max-w-[300px]">
              <Button
                variant="outline"
                size="sm"
                className="rounded-full text-xs h-7"
                onClick={() => handleSendMessage("おすすめのオプションは？")}
              >
                おすすめのオプションは？
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="rounded-full text-xs h-7"
                onClick={() => handleSendMessage("GitHub連携について教えて")}
              >
                GitHub連携について教えて
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col">
            {messages.map((msg) => (
              <AgentMessageItem key={msg.id} message={msg} user={user} />
            ))}
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-border bg-background/50 backdrop-blur-sm">
        <div className="relative flex items-center">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="AIエージェントに話しかける..."
            className="pr-10"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.nativeEvent.isComposing) {
                e.preventDefault();
                handleSendMessage(inputValue);
              }
            }}
          />
          <Button
            size="icon"
            variant="ghost"
            className="absolute right-1 w-8 h-8 text-muted-foreground hover:text-foreground"
            onClick={() => handleSendMessage(inputValue)}
          >
            <Send size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
}
