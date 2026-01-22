"use client";

import { MoreVertical, Plus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
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

export function SelectCalendarCard({
  calendar,
  className,
  onClick,
  onDelete,
}: SelectCalendarCardProps) {
  const toRgba = (hex: string | undefined, alpha: number) => {
    if (!hex || typeof hex !== "string") {
      return null;
    }
    let sanitized = hex.trim();
    if (sanitized.startsWith("#")) {
      sanitized = sanitized.slice(1);
    }

    if (sanitized.length === 3 || sanitized.length === 4) {
      sanitized = sanitized
        .split("")
        .map((char) => char + char)
        .join("");
    }

    if (sanitized.length === 8) {
      sanitized = sanitized.slice(0, 6);
    }

    if (sanitized.length !== 6) {
      return null;
    }

    const intVal = Number.parseInt(sanitized, 16);
    if (Number.isNaN(intVal)) {
      return null;
    }
    const r = (intVal >> 16) & 255;
    const g = (intVal >> 8) & 255;
    const b = intVal & 255;
    const clampedAlpha = Math.min(Math.max(alpha, 0), 1);
    return `rgba(${r}, ${g}, ${b}, ${clampedAlpha})`;
  };

  const accentColor = calendar.color ?? "#38bdf8";
  const accentSolid = toRgba(accentColor, 1) ?? "rgba(56, 189, 248, 1)";
  const accentStrong = toRgba(accentColor, 0.85) ?? "rgba(56, 189, 248, 0.85)";
  const accentSoft = toRgba(accentColor, 0.45) ?? "rgba(56, 189, 248, 0.45)";
  const accentBorder = toRgba(accentColor, 0.35) ?? "rgba(56, 189, 248, 0.35)";

  const overlayGradient = `linear-gradient(135deg, ${accentStrong} 0%, ${accentSoft} 60%, rgba(15, 23, 42, 0.7) 100%)`;
  const fallbackBackground = `linear-gradient(135deg, ${accentSoft} 0%, ${accentStrong} 100%)`;

  const initial =
    calendar.name?.trim().charAt(0)?.toUpperCase() ??
    calendar.name?.charAt(0)?.toUpperCase() ??
    "?";

  const imageUrl = calendar.imageUrl;
  const isInlineImage =
    typeof imageUrl === "string" &&
    (imageUrl.startsWith("data:") || imageUrl.startsWith("blob:"));

  // Check if imageUrl is a valid URL
  const isValidImageUrl = (() => {
    if (!imageUrl || imageUrl.length === 0) return false;
    if (isInlineImage) return true;
    try {
      new URL(imageUrl);
      return true;
    } catch {
      return false;
    }
  })();

  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div
      className={cn(
        "group relative min-w-[10rem] flex-shrink-0 overflow-hidden rounded-lg border bg-background/90 text-left shadow-sm transition-all duration-200",
        "hover:border-primary/40 hover:shadow-md",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        onClick ? "cursor-pointer" : "cursor-default",
        className,
      )}
      style={{ borderColor: accentBorder }}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          onClick?.();
        }
      }}
      role="button"
      tabIndex={onClick ? 0 : -1}
      aria-label={`${calendar.name} を開く`}
    >
      <div className="relative grid aspect-[16/8] w-full place-items-stretch">
        <div className="relative h-full w-full overflow-hidden">
          {isValidImageUrl && imageUrl ? (
            <Image
              src={imageUrl}
              alt={calendar.name}
              fill
              sizes="200px"
              className="absolute inset-0 h-full w-full object-cover"
              draggable={false}
              priority={false}
              unoptimized={isInlineImage}
            />
          ) : (
            <>
              <div
                className="absolute inset-0"
                style={{ backgroundImage: fallbackBackground }}
              />
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <span className="text-3xl font-semibold text-white drop-shadow-lg">
                  {initial}
                </span>
              </div>
            </>
          )}
          <div
            className="pointer-events-none absolute inset-0 mix-blend-normal"
            style={{ backgroundImage: overlayGradient }}
          />

          <div className="pointer-events-none absolute inset-x-0 top-0 flex flex-col gap-1.5 bg-gradient-to-b from-black/75 via-black/25 to-transparent px-2.5 pt-2.5 pb-7">
            <div className="flex items-center gap-2">
              <span
                className="inline-flex h-2 w-2 flex-shrink-0 rounded-full shadow-inner"
                style={{ background: accentSolid }}
                aria-hidden
              />
              <span className="line-clamp-1 text-sm font-semibold text-white drop-shadow">
                {calendar.name}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div
        className="absolute bottom-1.5 right-1.5"
        onClick={handleMenuClick}
        onKeyDown={handleMenuClick}
        role="button"
        tabIndex={0}
      >
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-full text-white/80 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-white/20 hover:text-white focus:opacity-100"
              aria-label="カレンダーオプション"
            >
              <MoreVertical size={16} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                // onEdit?.();
              }}
              disabled
            >
              編集
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onDelete?.();
              }}
              className="text-destructive focus:bg-destructive/10 focus:text-destructive"
            >
              削除
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

/**
 * LinkableSelectCalendarCard - Uses next/link for automatic prefetching
 * This enables instant navigation without loading overlay
 */
export type LinkableSelectCalendarCardProps = {
  calendar: SelectCalendarCardData;
  href: string;
  className?: string;
};

export function LinkableSelectCalendarCard({
  calendar,
  href,
  className,
}: LinkableSelectCalendarCardProps) {
  const toRgba = (hex: string | undefined, alpha: number) => {
    if (!hex || typeof hex !== "string") {
      return null;
    }
    let sanitized = hex.trim();
    if (sanitized.startsWith("#")) {
      sanitized = sanitized.slice(1);
    }

    if (sanitized.length === 3 || sanitized.length === 4) {
      sanitized = sanitized
        .split("")
        .map((char) => char + char)
        .join("");
    }

    if (sanitized.length === 8) {
      sanitized = sanitized.slice(0, 6);
    }

    if (sanitized.length !== 6) {
      return null;
    }

    const intVal = Number.parseInt(sanitized, 16);
    if (Number.isNaN(intVal)) {
      return null;
    }
    const r = (intVal >> 16) & 255;
    const g = (intVal >> 8) & 255;
    const b = intVal & 255;
    const clampedAlpha = Math.min(Math.max(alpha, 0), 1);
    return `rgba(${r}, ${g}, ${b}, ${clampedAlpha})`;
  };

  const accentColor = calendar.color ?? "#38bdf8";
  const accentSolid = toRgba(accentColor, 1) ?? "rgba(56, 189, 248, 1)";
  const accentStrong = toRgba(accentColor, 0.85) ?? "rgba(56, 189, 248, 0.85)";
  const accentSoft = toRgba(accentColor, 0.45) ?? "rgba(56, 189, 248, 0.45)";
  const accentBorder = toRgba(accentColor, 0.35) ?? "rgba(56, 189, 248, 0.35)";

  const overlayGradient = `linear-gradient(135deg, ${accentStrong} 0%, ${accentSoft} 60%, rgba(15, 23, 42, 0.7) 100%)`;
  const fallbackBackground = `linear-gradient(135deg, ${accentSoft} 0%, ${accentStrong} 100%)`;

  const initial =
    calendar.name?.trim().charAt(0)?.toUpperCase() ??
    calendar.name?.charAt(0)?.toUpperCase() ??
    "?";

  const imageUrl = calendar.imageUrl;
  const isInlineImage =
    typeof imageUrl === "string" &&
    (imageUrl.startsWith("data:") || imageUrl.startsWith("blob:"));

  const isValidImageUrl = (() => {
    if (!imageUrl || imageUrl.length === 0) return false;
    if (isInlineImage) return true;
    try {
      new URL(imageUrl);
      return true;
    } catch {
      return false;
    }
  })();

  return (
    <Link
      href={href}
      prefetch={true}
      className={cn(
        "group relative min-w-[10rem] flex-shrink-0 cursor-pointer overflow-hidden rounded-lg border bg-background/90 p-0 text-left shadow-sm transition hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background block",
        className,
      )}
      style={{ borderColor: accentBorder }}
      aria-label={`${calendar.name} を開く`}
    >
      <div className="relative grid aspect-[16/8] w-full place-items-stretch">
        <div className="relative h-full w-full overflow-hidden">
          {isValidImageUrl && imageUrl ? (
            <Image
              src={imageUrl}
              alt={calendar.name}
              fill
              sizes="200px"
              className="absolute inset-0 h-full w-full object-cover"
              draggable={false}
              priority={false}
              unoptimized={isInlineImage}
            />
          ) : (
            <>
              <div
                className="absolute inset-0"
                style={{ backgroundImage: fallbackBackground }}
              />
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <span className="text-3xl font-semibold text-white drop-shadow-lg">
                  {initial}
                </span>
              </div>
            </>
          )}
          <div
            className="pointer-events-none absolute inset-0 mix-blend-normal"
            style={{ backgroundImage: overlayGradient }}
          />

          <div className="pointer-events-none absolute inset-x-0 top-0 flex flex-col gap-1.5 bg-gradient-to-b from-black/75 via-black/25 to-transparent px-2.5 pt-2.5 pb-7">
            <div className="flex items-center gap-2">
              <span
                className="inline-flex h-2 w-2 flex-shrink-0 rounded-full shadow-inner"
                style={{ background: accentSolid }}
                aria-hidden
              />
              <span className="line-clamp-1 text-sm font-semibold text-white drop-shadow">
                {calendar.name}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
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
        "relative min-w-[10rem] flex-shrink-0 overflow-hidden rounded-lg border bg-muted/50 p-0 transition-colors hover:border-primary/50",
        className,
      )}
    >
      <button
        type="button"
        onClick={onClick}
        className="relative grid aspect-[16/8] w-full place-items-center text-muted-foreground outline-none focus-visible:ring-2 focus-visible:ring-primary"
        aria-label="単体スケジュールを作成"
      >
        <Plus className="h-6 w-6" strokeWidth={2.25} />
      </button>
    </Card>
  );
}
