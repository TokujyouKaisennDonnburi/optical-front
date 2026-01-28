"use client";

import { Plus, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type React from "react";

import { Button } from "@/components/atoms/Button";
import { Card } from "@/components/atoms/Card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuTrigger,
} from "@/components/atoms/DropdownMenu";
import { cn } from "@/utils_constants_styles/utils";

/* ==============================
 * types
 * ============================== */

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
  onDelete?: () => void;
};

/* ==============================
 * utils
 * ============================== */

const toRgba = (hex: string | undefined, alpha: number) => {
  if (!hex) return null;

  let sanitized = hex.replace("#", "");
  if (sanitized.length === 3) {
    sanitized = sanitized
      .split("")
      .map((c) => c + c)
      .join("");
  }
  if (sanitized.length !== 6) return null;

  const intVal = parseInt(sanitized, 16);
  if (Number.isNaN(intVal)) return null;

  const r = (intVal >> 16) & 255;
  const g = (intVal >> 8) & 255;
  const b = intVal & 255;

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

/* ==============================
 * Card (button版)
 * ============================== */

export function SelectCalendarCard({
  calendar,
  className,
  onClick,
}: SelectCalendarCardProps) {
  const accent = calendar.color ?? "#38bdf8";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className={cn(
        "group relative min-w-[10rem] overflow-hidden rounded-lg border bg-background/90 p-0 text-left shadow-sm transition",
        "hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
        className,
      )}
      style={{ borderColor: toRgba(accent, 0.35) ?? undefined }}
    >
      <CardContent calendar={calendar} />
    </button>
  );
}

/* ==============================
 * Card (Link版 + 削除ボタン)
 * ============================== */

export type LinkableSelectCalendarCardProps = {
  calendar: SelectCalendarCardData;
  href: string;
  className?: string;
  onDelete?: () => void;
};

export function LinkableSelectCalendarCard({
  calendar,
  href,
  className,
  onDelete,
}: LinkableSelectCalendarCardProps) {
  const accent = calendar.color ?? "#38bdf8";

  const _handleInteraction = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation();
    e.preventDefault();
  };

  return (
    <Link
      href={href}
      prefetch
      className={cn(
        "group relative min-w-[10rem] overflow-hidden rounded-lg border bg-background/90 p-0 text-left shadow-sm transition",
        "hover:border-primary/40 hover:shadow-md",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
        className,
      )}
      style={{ borderColor: toRgba(accent, 0.35) ?? undefined }}
      aria-label={`${calendar.name} を開く`}
    >
      <CardContent calendar={calendar} />

      {/* --- delete button --- */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="
              absolute bottom-1.5 right-1.5
              h-7 w-7 rounded-full
              bg-white/20 backdrop-blur-sm
              
              text-white
              hover:text-white
              hover:bg-destructive/80

              opacity-0 pointer-events-none
              group-hover:opacity-100 group-hover:pointer-events-auto
              group-focus-within:opacity-100 group-focus-within:pointer-events-auto

              transition-all
            "
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
            }}
            aria-label="カレンダーオプション"
          >
            <Trash2 size={16} />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuPortal>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                onDelete?.();
              }}
              className="text-destructive focus:bg-destructive/10 focus:text-destructive"
            >
              カレンダーを削除
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenuPortal>
      </DropdownMenu>
    </Link>
  );
}

/* ==============================
 * shared card content
 * ============================== */

function CardContent({ calendar }: { calendar: SelectCalendarCardData }) {
  const accent = calendar.color ?? "#38bdf8";

  const overlayGradient = `linear-gradient(
    135deg,
    ${toRgba(accent, 0.85)} 0%,
    ${toRgba(accent, 0.45)} 60%,
    rgba(15,23,42,0.7) 100%
  )`;

  const initial = calendar.name?.trim().charAt(0).toUpperCase() ?? "?";

  const imageUrl = calendar.imageUrl;
  const isValidImageUrl = (() => {
    if (!imageUrl) return false;
    try {
      new URL(imageUrl);
      return true;
    } catch {
      return false;
    }
  })();

  return (
    <div className="relative grid aspect-[16/8] w-full">
      <div className="relative h-full w-full overflow-hidden">
        {isValidImageUrl && imageUrl ? (
          <Image
            src={imageUrl}
            alt={calendar.name}
            fill
            sizes="200px"
            className="object-cover"
          />
        ) : (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{
              background: `linear-gradient(135deg, ${toRgba(
                accent,
                0.45,
              )}, ${toRgba(accent, 0.85)})`,
            }}
          >
            <span className="text-3xl font-semibold text-white">{initial}</span>
          </div>
        )}

        <div
          className="absolute inset-0"
          style={{ backgroundImage: overlayGradient }}
        />

        <div className="absolute inset-x-0 top-0 bg-gradient-to-b from-black/70 to-transparent px-2.5 pt-2.5 pb-6">
          <span className="text-sm font-semibold text-white">
            {calendar.name}
          </span>
        </div>
      </div>
    </div>
  );
}

/* ==============================
 * Add card
 * ============================== */

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
        "relative min-w-[10rem] overflow-hidden rounded-lg border bg-muted/50 p-0 transition",
        "hover:border-primary/50",
        className,
      )}
    >
      <button
        type="button"
        onClick={onClick}
        className="grid aspect-[16/8] w-full place-items-center text-muted-foreground"
        aria-label="カレンダーを追加"
      >
        <Plus className="h-6 w-6" />
      </button>
    </Card>
  );
}

/* ==============================
 * Strip (container)
 * ============================== */

export type SelectCalendarStripProps = {
  calendars: SelectCalendarCardData[];
  className?: string;
  onAddCalendar?: () => void;
  onDeleteCalendar?: (calendarId: string) => void;
};

export function SelectCalendarStrip({
  calendars,
  className,
  onAddCalendar,
  onDeleteCalendar,
}: SelectCalendarStripProps) {
  return (
    <div
      className={cn(
        "mx-auto w-full max-w-7xl shrink-0 px-3 py-1.5 lg:px-6 min-w-0 overflow-x-auto",
        className,
      )}
    >
      <div className="flex gap-2">
        {calendars.map((calendar) => (
          <LinkableSelectCalendarCard
            key={calendar.id}
            calendar={calendar}
            href={`/calendars/${calendar.id}`}
            onDelete={() => onDeleteCalendar?.(calendar.id)}
          />
        ))}
        <SelectCalendarAddCard onClick={onAddCalendar} />
      </div>
    </div>
  );
}
