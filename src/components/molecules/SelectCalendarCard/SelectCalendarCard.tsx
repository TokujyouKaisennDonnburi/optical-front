"use client";

import { ChevronDown, Plus } from "lucide-react";
import Image from "next/image";
import { Card } from "@/components/atoms/Card";
import { cn } from "@/utils_constants_styles/utils";

export type SelectCalendarCardData = {
  id: string;
  name: string;
  color?: string;
  description?: string;
  imageUrl?: string;
};

export type SelectCalendarCardProps = {
  calendar: SelectCalendarCardData;
  className?: string;
  onClick?: () => void;
};

export function SelectCalendarCard({
  calendar,
  className,
  onClick,
}: SelectCalendarCardProps) {
  const backgroundColor = calendar.color ?? "#334155";

  return (
    <Card
      className={cn(
        "relative min-w-[180px] flex-shrink-0 overflow-hidden rounded-xl border bg-slate-800/80 p-0 transition-colors hover:border-primary/50",
        className,
      )}
    >
      <button
        type="button"
        onClick={onClick}
        className="group relative grid aspect-[16/10] w-full place-items-stretch text-left outline-none focus-visible:ring-2 focus-visible:ring-primary"
        aria-label={`${calendar.name} を開く`}
      >
        {calendar.imageUrl ? (
          <Image
            src={calendar.imageUrl}
            alt={calendar.name}
            fill
            sizes="200px"
            className="absolute inset-0 h-full w-full object-cover"
            draggable={false}
            priority={false}
          />
        ) : (
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(135deg, ${backgroundColor} 0%, rgba(15,23,42,0.9) 100%)`,
            }}
          />
        )}
        <div className="pointer-events-none absolute inset-0 bg-black/10" />

        <div className="absolute left-2 top-2 rounded-md border border-white/15 bg-black/30 px-1.5 py-0.5 text-[11px] text-white/90 backdrop-blur">
          {calendar.name.at(0)}
        </div>

        <div className="absolute inset-x-0 bottom-0 flex items-center gap-2 bg-gradient-to-t from-black/60 to-transparent p-2">
          <div
            className="h-2 w-2 flex-shrink-0 rounded-full"
            style={{ backgroundColor: calendar.color ?? "#38bdf8" }}
          />
          <span className="line-clamp-1 text-sm font-medium text-white drop-shadow">
            {calendar.name}
          </span>
        </div>
      </button>
    </Card>
  );
}

export type SelectCalendarAddCardProps = {
  className?: string;
  onClick?: () => void;
};

export function SelectCalendarAddCard({
  className,
  onClick,
}: SelectCalendarAddCardProps) {
  return (
    <Card
      className={cn(
        "relative min-w-[180px] flex-shrink-0 overflow-hidden rounded-xl border bg-muted/50 p-0 transition-colors hover:border-primary/50",
        className,
      )}
    >
      <button
        type="button"
        onClick={onClick}
        className="relative grid aspect-[16/10] w-full place-items-center text-muted-foreground outline-none focus-visible:ring-2 focus-visible:ring-primary"
        aria-label="単体スケジュールを作成"
      >
        <Plus className="h-7 w-7" strokeWidth={2.25} />
        <div className="pointer-events-none absolute bottom-1 right-1 rounded-md bg-black/10 p-1">
          <ChevronDown className="h-4 w-4" />
        </div>
      </button>
    </Card>
  );
}
