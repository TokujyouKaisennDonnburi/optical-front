import {
  Bot,
  Calendar,
  CalendarPlus,
  ChevronDown,
  Send,
  Sparkles,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/atoms/Button";
import { Text } from "@/components/atoms/Text";
import { Textarea } from "@/components/atoms/Textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/atoms/Tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu";
import { useAuth } from "@/hooks/useAuth";
import { sendChatMessage } from "@/lib/api-agent";
import { cn } from "@/utils_constants_styles/utils";
import { type AgentMessage, AgentMessageItem } from "./AgentMessageItem";

/**
 * カレンダー情報の型（AgentChatViewで使用）
 */
export type CalendarInfo = {
  id: string;
  name: string;
  color: string;
};

/**
 * UIメッセージ定数
 * TODO: 将来的にはi18nライブラリ（react-intl, next-intl等）に置き換え
 */
const MESSAGES = {
  error: {
    generic: "すみません、エラーが発生しました。もう一度お試しください。",
  },
  placeholder: {
    input: "OptiCalエージェントに話しかける...",
  },
  emptyState: {
    greeting: "カレンダーの最適化をお手伝いします。",
    question: "何かお手伝いできることはありますか？",
  },
  quickChips: {
    recommendOptions: "おすすめのオプションは？",
    githubIntegration: "GitHub連携について教えて",
  },
  calendarSelector: {
    label: "対象カレンダー",
    placeholder: "カレンダーを選択",
    allCalendars: "すべてのカレンダー",
  },
} as const;

/**
 * テンプレートボタンの定義
 * template: 虫食い形式のテンプレート文字列（[]内を編集）
 */
const TEMPLATE_BUTTONS = [
  {
    id: "create-schedule",
    label: "予定を作る",
    icon: CalendarPlus,
    tooltip: "予定作成テンプレートを入力",
    template: `予定を作成してください。

予定名: [予定名を入力]
時間帯: [開始時刻] 〜 [終了時刻] または 終日
メモ: [メモを入力（任意）]
場所: [場所を入力（任意）]`,
  },
  {
    id: "suggest-options",
    label: "オプション提案",
    icon: Sparkles,
    tooltip: "オプション提案をリクエスト",
    template: `このカレンダーにおすすめのオプションを提案してください。

用途: [カレンダーの用途を入力]
優先したいこと: [効率化 / 可視化 / 通知 など]`,
  },
] as const;

export type AgentChatViewProps = {
  className?: string;
  /** 選択可能なカレンダーのリスト */
  calendars?: CalendarInfo[];
};

export function AgentChatView({
  className,
  calendars = [],
}: AgentChatViewProps) {
  const { user } = useAuth();
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  // undefined = すべてのカレンダーを対象
  const [selectedCalendarId, setSelectedCalendarId] = useState<
    string | undefined
  >(undefined);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // カレンダーリストが変わったら、選択中のカレンダーが存在しなければリセット（undefinedは常に有効）
  useEffect(() => {
    if (
      selectedCalendarId !== undefined &&
      calendars.length > 0 &&
      !calendars.find((c) => c.id === selectedCalendarId)
    ) {
      setSelectedCalendarId(undefined);
    }
  }, [calendars, selectedCalendarId]);

  const selectedCalendar = calendars.find((c) => c.id === selectedCalendarId);

  // biome-ignore lint/correctness/useExhaustiveDependencies: scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (text: string): Promise<void> => {
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
      const data = await sendChatMessage(text, selectedCalendarId);

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
        content: MESSAGES.error.generic,
      };
      setMessages((prev) => [...prev, errorMessage]);
    }
  };

  /**
   * テンプレートをテキストフィールドに挿入
   */
  const handleTemplateClick = (template: string) => {
    setInputValue(template);
    // フォーカスをテキストエリアに移動
    textareaRef.current?.focus();
  };

  return (
    <div className={cn("flex flex-col h-full relative", className)}>
      {/* Calendar Selector */}
      {calendars.length > 0 && (
        <div className="px-4 py-2 border-b border-border bg-muted/30">
          <div className="flex items-center gap-2">
            <Calendar size={14} className="text-muted-foreground" />
            <Text size="sm" className="text-muted-foreground text-xs">
              {MESSAGES.calendarSelector.label}:
            </Text>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 gap-1.5 px-2 text-xs font-medium hover:bg-background/80"
                >
                  {selectedCalendar ? (
                    <span
                      className="inline-block h-2.5 w-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: selectedCalendar.color }}
                      aria-hidden
                    />
                  ) : (
                    <span
                      className="inline-block h-2.5 w-2.5 rounded-full shrink-0 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500"
                      aria-hidden
                    />
                  )}
                  <span className="truncate max-w-[150px]">
                    {selectedCalendar?.name ??
                      MESSAGES.calendarSelector.allCalendars}
                  </span>
                  <ChevronDown
                    size={12}
                    className="text-muted-foreground shrink-0"
                  />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-[200px]">
                {/* All Calendars Option */}
                <DropdownMenuItem
                  className={cn(
                    "flex items-center gap-2 cursor-pointer",
                    selectedCalendarId === undefined && "bg-accent",
                  )}
                  onClick={() => setSelectedCalendarId(undefined)}
                >
                  <span
                    className="inline-block h-2.5 w-2.5 rounded-full shrink-0 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500"
                    aria-hidden
                  />
                  <span className="truncate">
                    {MESSAGES.calendarSelector.allCalendars}
                  </span>
                </DropdownMenuItem>
                {/* Separator */}
                <div className="my-1 h-px bg-border" />
                {/* Individual Calendars */}
                {calendars.map((cal) => (
                  <DropdownMenuItem
                    key={cal.id}
                    className={cn(
                      "flex items-center gap-2 cursor-pointer",
                      selectedCalendarId === cal.id && "bg-accent",
                    )}
                    onClick={() => setSelectedCalendarId(cal.id)}
                  >
                    <span
                      className="inline-block h-2.5 w-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: cal.color }}
                      aria-hidden
                    />
                    <span className="truncate">{cal.name}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      )}

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
                  {MESSAGES.emptyState.greeting}
                  <br />
                  {MESSAGES.emptyState.question}
                </Text>
              </div>
            </div>

            {/* Quick Chips */}
            <div className="flex flex-wrap gap-2 justify-center max-w-[300px]">
              <Button
                variant="outline"
                size="sm"
                className="rounded-full text-xs h-7"
                onClick={() =>
                  handleSendMessage(MESSAGES.quickChips.recommendOptions)
                }
              >
                {MESSAGES.quickChips.recommendOptions}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="rounded-full text-xs h-7"
                onClick={() =>
                  handleSendMessage(MESSAGES.quickChips.githubIntegration)
                }
              >
                {MESSAGES.quickChips.githubIntegration}
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
      <div className="p-4 border-t border-border bg-background/50 backdrop-blur-sm space-y-3">
        {/* Template Buttons */}
        <div className="flex gap-2">
          {TEMPLATE_BUTTONS.map((btn) => (
            <Tooltip key={btn.id}>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 gap-1.5 text-xs font-medium hover:bg-primary/10 hover:border-primary/50 transition-colors"
                  onClick={() => handleTemplateClick(btn.template)}
                >
                  <btn.icon size={14} />
                  {btn.label}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top" sideOffset={8}>
                {btn.tooltip}
              </TooltipContent>
            </Tooltip>
          ))}
        </div>

        {/* Text Input */}
        <div className="relative">
          <Textarea
            ref={textareaRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={MESSAGES.placeholder.input}
            rows={4}
            className="pr-12 resize-none min-h-[100px]"
            onKeyDown={(e) => {
              // Cmd/Ctrl + Enter で送信
              if (
                e.key === "Enter" &&
                (e.metaKey || e.ctrlKey) &&
                !e.nativeEvent.isComposing
              ) {
                e.preventDefault();
                handleSendMessage(inputValue);
              }
            }}
          />
          <div className="absolute right-2 bottom-2 flex items-center gap-1">
            <span className="text-[10px] text-muted-foreground hidden sm:inline">
              ⌘+Enter で送信
            </span>
            <Button
              size="icon"
              variant="ghost"
              className="w-8 h-8 text-muted-foreground hover:text-foreground hover:bg-primary/10"
              onClick={() => handleSendMessage(inputValue)}
            >
              <Send size={16} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
