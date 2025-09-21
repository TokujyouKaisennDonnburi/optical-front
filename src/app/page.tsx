"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/atoms/Avatar";
import { Badge } from "@/components/atoms/Badge";
import { Button } from "@/components/atoms/Button";
import { Card, CardContent } from "@/components/atoms/Card";
import { Icon } from "@/components/atoms/Icon";
import { Input } from "@/components/atoms/Input";
import { ScrollArea } from "@/components/atoms/ScrollArea";
import { Text } from "@/components/atoms/Text";
import { TodaySchedulePanel } from "@/components/organisms/TodaySchedulePanel";
import { useTodaySchedule } from "@/hooks/useTodaySchedule";
import { cn } from "@/utils_constants_styles/utils";
import { CalendarDays, ChevronDown, Plus } from "lucide-react";

export default function Home() {
  const { items, dateLabel, isLoading, error } = useTodaySchedule();

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-muted/10">
      <HeaderBar />
      <main className="mx-auto flex w-full max-w-6xl flex-1 gap-6 overflow-hidden px-4 py-6 lg:px-8">
        <BoardArea className="flex-1 min-h-0" />
        <div className="flex h-full w-full max-w-sm min-h-0">
          <TodaySchedulePanel
            header={{
              title: "今日の予定",
              dateLabel: dateLabel || "取得中...",
            }}
            items={items}
            isLoading={isLoading}
            emptyMessage={
              error ? "予定を取得できませんでした" : "今日の予定はありません。"
            }
          />
        </div>
      </main>
      <AvatarStrip />
    </div>
  );
}

function HeaderBar() {
  return (
    <header className="border-b border-border bg-card/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center gap-3 px-4 py-4 lg:px-8">
        <Input
          placeholder="スケジュール、参加者、場所を検索..."
          className="h-11 flex-1 min-w-[220px]"
        />
        <HeaderDropdown label="全てのカレンダー" />
        <HeaderDropdown label="全期間" />
        <Button variant="outline">クリア</Button>
        <Button className="gap-2">
          <Icon icon={Plus} size="sm" /> 予定を追加
        </Button>
        <Avatar className="h-10 w-10 border">
          <AvatarImage src="https://i.pravatar.cc/100?img=40" alt="User" />
          <AvatarFallback>YO</AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}

function HeaderDropdown({ label }: { label: string }) {
  return (
    <Button variant="secondary" className="gap-2">
      {label}
      <Icon icon={ChevronDown} size="sm" />
    </Button>
  );
}

function BoardArea({ className }: { className?: string }) {
  return (
    <Card
      className={cn(
        "flex min-h-0 flex-1 flex-col gap-4 border border-primary/30 bg-slate-800/90 p-4",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <Badge variant="secondary" className="gap-1 px-3 py-1">
          <Icon icon={CalendarDays} size="sm" />
          総合
        </Badge>
        <Avatar className="h-10 w-10 border">
          <AvatarImage src="https://i.pravatar.cc/100?img=54" alt="Manager" />
          <AvatarFallback>MG</AvatarFallback>
        </Avatar>
      </div>
      <ScrollArea className="flex-1 min-h-0 rounded-md border border-primary/40 bg-slate-900/80">
        <CardContent className="flex h-full min-h-[260px] items-center justify-center text-white/70">
          総合ボード (仮配置)
        </CardContent>
      </ScrollArea>
    </Card>
  );
}

function AvatarStrip() {
  return (
    <div className="mx-auto w-full max-w-6xl shrink-0 px-4 py-4 lg:px-8">
      <div className="flex gap-4 overflow-x-auto pb-2 lg:grid lg:grid-cols-5 lg:gap-4 lg:overflow-visible lg:pb-0">
        {Array.from({ length: 5 }).map((_, index) => (
          <Card
            key={`avatar-${index}`}
            className="flex min-w-[140px] items-center justify-center bg-slate-800/80 py-6 lg:min-w-0"
          >
            <Avatar className="h-16 w-16 border-4 border-primary">
              <AvatarImage
                src={`https://i.pravatar.cc/100?img=${30 + index}`}
                alt={`Member ${index + 1}`}
              />
              <AvatarFallback>{`M${index + 1}`}</AvatarFallback>
            </Avatar>
          </Card>
        ))}
      </div>
    </div>
  );
}
