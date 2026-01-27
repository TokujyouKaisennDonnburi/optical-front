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
  DropdownMenuTrigger,
} from "@/components/atoms/DropdownMenu";
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
  onDelete?: () => void;
};

export type LinkableSelectCalendarCardProps = {
  calendar: SelectCalendarCardData;
  href: string;
  className?: string;
};

export type SelectCalendarAddCardProps = {
  className?: string;
  onClick?: () => void;
};

const toRgba = (hex: string | undefined, alpha: number) => {
  if (!hex || typeof hex !== "string") return null;

  let sanitized = hex.trim();
  if (sanitized.startsWith("#")) sanitized = sanitized.slice(1);

  if (sanitized.length === 3 || sanitized.length === 4) {
    sanitized = sanitized
      .split("")
      .map((c) => c + c)
      .join("");
  }

  if (sanitized.length === 8) sanitized = sanitized.slice(0, 6);
  if (sanitized.length !== 6) return null;

  const intVal = Number.parseInt(sanitized, 16);
  if (Number.isNaN(intVal)) return null;

  const r = (intVal >> 16) & 255;
  const g = (intVal >> 8) & 255;
  const b = intVal & 255;

  const clampedAlpha = Math.min(Math.max(alpha, 0), 1);
  return `rgba(${r}, ${g}, ${b}, ${clampedAlpha})`;
};

const _stopPropagation = (e: React.MouseEvent | React.KeyboardEvent) => {
  e.stopPropagation();
};

export function SelectCalendarCard({
  calendar,
  className,
  onClick,
}: SelectCalendarCardProps) {
  const accentColor = calendar.color ?? "#38bdf8";

  const accentSolid = toRgba(accentColor, 1) ?? "rgba(56, 189, 248, 1)";
  const accentStrong = toRgba(accentColor, 0.85) ?? "rgba(56, 189, 248, 0.85)";
  const accentSoft = toRgba(accentColor, 0.45) ?? "rgba(56, 189, 248, 0.45)";
  const accentBorder = toRgba(accentColor, 0.35) ?? "rgba(56, 189, 248, 0.35)";

  const overlayGradient = `linear-gradient(
    135deg,
    ${accentStrong} 0%,
    ${accentSoft} 60%,
    rgba(15, 23, 42, 0.7) 100%
  )`;

  const fallbackBackground = `linear-gradient(
    135deg,
    ${accentSoft} 0%,
    ${accentStrong} 100%
  )`;

  const initial = calendar.name?.trim().charAt(0)?.toUpperCase() ?? "?";

  const imageUrl = calendar.imageUrl;
  const isInlineImage =
    typeof imageUrl === "string" &&
    (imageUrl.startsWith("data:") || imageUrl.startsWith("blob:"));

  const isValidImageUrl = (() => {
    if (!imageUrl) return false;
    if (isInlineImage) return true;
    try {
      new URL(imageUrl);
      return true;
    } catch {
      return false;
    }
  })();

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className={cn(
        "group relative min-w-[10rem] flex-shrink-0 overflow-hidden rounded-lg border bg-background/90 p-0 text-left shadow-sm transition",
        "hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
        !onClick && "cursor-default",
        className,
      )}
      style={{ borderColor: accentBorder }}
      aria-label={`${calendar.name} を開く`}
    >
      <div className="relative grid aspect-[16/8] w-full">
        <div className="relative h-full w-full overflow-hidden">
          {isValidImageUrl && imageUrl ? (
            <Image
              src={imageUrl}
              alt={calendar.name}
              fill
              sizes="200px"
              className="object-cover"
              draggable={false}
              unoptimized={isInlineImage}
            />
          ) : (
            <>
              <div
                className="absolute inset-0"
                style={{ backgroundImage: fallbackBackground }}
              />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="text-3xl font-semibold text-white drop-shadow-lg">
                  {initial}
                </span>
              </div>
            </>
          )}

          <div
            className="absolute inset-0 pointer-events-none"
            style={{ backgroundImage: overlayGradient }}
          />

          <div className="absolute inset-x-0 top-0 bg-gradient-to-b from-black/75 via-black/25 to-transparent px-2.5 pt-2.5 pb-7 pointer-events-none">
            <div className="flex items-center gap-2">
              <span
                className="h-2 w-2 rounded-full shadow-inner"
                style={{ background: accentSolid }}
              />
              <span className="line-clamp-1 text-sm font-semibold text-white drop-shadow">
                {calendar.name}
              </span>
            </div>
          </div>
        </div>
      </div>
    </button>
  );
}

export function LinkableSelectCalendarCard({
  calendar,
  href,
  className,
}: LinkableSelectCalendarCardProps) {
  const accentBorder = toRgba(calendar.color, 0.35) ?? "rgba(56, 189, 248, 0.35)";

  return (
    <div className="relative min-w-[10rem] flex-shrink-0">
      <Link
        href={href}
        prefetch
        className={cn(
          "group block overflow-hidden rounded-lg border bg-background/90 shadow-sm transition hover:border-primary/40",
          className,
        )}
        style={{ borderColor: accentBorder }}
        aria-label={`${calendar.name} を開く`}
      >
        <SelectCalendarCard calendar={calendar} />
      </Link>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            size="icon"
            variant="outline"
            className="absolute bottom-1.5 right-1.5 h-7 w-7 rounded-full bg-black/20 backdrop-blur-sm text-destructive hover:bg-black/80"
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
            <DropdownMenuItem className="text-destructive">
              カレンダーを削除
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenuPortal>
      </DropdownMenu>
    </div>
  );
}

export function SelectCalendarAddCard({
  className,
  onClick,
}: SelectCalendarAddCardProps) {
  return (
    <Card
      className={cn(
        "relative min-w-[10rem] flex-shrink-0 overflow-hidden rounded-lg border bg-muted/50 p-0 transition-colors hover:border-primary/50",
        className,
      )}
    >
      <button
        type="button"
        onClick={onClick}
        className="grid aspect-[16/8] w-full place-items-center text-muted-foreground focus-visible:ring-2 focus-visible:ring-primary"
        aria-label="単体スケジュールを作成"
      >
        <Plus className="h-6 w-6" strokeWidth={2.25} />
      </button>
    </Card>
  );
}
