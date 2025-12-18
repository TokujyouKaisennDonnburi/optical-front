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

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={onClick == null}
      className={cn(
        "group relative min-w-[10rem] flex-shrink-0 cursor-pointer overflow-hidden rounded-lg border bg-background/90 p-0 text-left shadow-sm transition hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-default",
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
    </button>
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
        <div className="pointer-events-none absolute bottom-1 right-1 rounded-md bg-black/10 p-0.5">
          <ChevronDown className="h-3.5 w-3.5" />
        </div>
      </button>
    </Card>
  );
}
