"use client";

import { Check, ChevronsUpDown } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/atoms/Button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/atoms/Command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/atoms/Popover";
import { cn } from "@/utils_constants_styles/utils";

export type CalendarOption = {
  id: string;
  name: string;
  color: string;
};

type CalendarSwitcherProps = {
  /** 現在選択中のカレンダーID */
  currentCalendarId: string;
  /** 現在選択中のカレンダー名 */
  currentCalendarName?: string;
  /** 現在選択中のカレンダー色 */
  currentCalendarColor?: string;
  /** 選択可能なカレンダー一覧 */
  calendars: CalendarOption[];
  /** @deprecated Use next/link's automatic navigation instead */
  onSelect?: (calendarId: string) => void;
  /** ローディング状態 */
  isLoading?: boolean;
  /** カスタムクラス名 */
  className?: string;
};

/**
 * カレンダー切り替えドロップダウン
 * next/linkを使用してプリフェッチを有効化
 */
export function CalendarSwitcher({
  currentCalendarId,
  currentCalendarName = "読み込み中...",
  currentCalendarColor,
  calendars,
  isLoading = false,
  className,
}: CalendarSwitcherProps) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          role="combobox"
          aria-expanded={open}
          aria-label="カレンダーを切り替え"
          className={cn("gap-2 px-2 hover:bg-muted/50", className)}
          disabled={isLoading}
        >
          {/* カレンダー色インジケーター */}
          {currentCalendarColor && (
            <div
              className="h-4 w-4 shrink-0 rounded-full"
              style={{ backgroundColor: currentCalendarColor }}
            />
          )}
          {/* カレンダー名 */}
          <span className="text-lg font-semibold truncate max-w-[200px]">
            {currentCalendarName}
          </span>
          {/* 展開アイコン */}
          <ChevronsUpDown className="ml-1 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[240px] p-0" align="start">
        <Command>
          <CommandInput placeholder="カレンダーを検索..." />
          <CommandList>
            <CommandEmpty>カレンダーが見つかりません</CommandEmpty>
            <CommandGroup>
              {calendars.map((calendar) => (
                <CommandItem
                  key={calendar.id}
                  value={calendar.name}
                  asChild
                  className="cursor-pointer p-0"
                >
                  <Link
                    href={`/calendars/${calendar.id}`}
                    prefetch={true}
                    className="flex items-center w-full px-2 py-1.5"
                    onClick={() => setOpen(false)}
                  >
                    {/* カレンダー色 */}
                    <div
                      className="h-3 w-3 shrink-0 rounded-full mr-2"
                      style={{ backgroundColor: calendar.color }}
                    />
                    {/* カレンダー名 */}
                    <span className="flex-1 truncate">{calendar.name}</span>
                    {/* 選択中マーク */}
                    {calendar.id === currentCalendarId && (
                      <Check className="ml-auto h-4 w-4 text-primary" />
                    )}
                  </Link>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
