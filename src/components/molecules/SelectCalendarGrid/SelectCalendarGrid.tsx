"use client";

import { cn } from "@/utils_constants_styles/utils";
import { useEffect, useMemo, useRef, useState, type PropsWithChildren } from "react";

export type SelectCalendarGridProps = PropsWithChildren<{
  className?: string;
}>;

export function SelectCalendarGrid({
  children,
  className,
}: SelectCalendarGridProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  // Update edge state based on current scroll metrics
  const updateEdges = () => {
    const el = containerRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    const maxScrollLeft = Math.max(0, scrollWidth - clientWidth);
    // Use a small epsilon to avoid off-by-one flicker
    const EPS = 1;
    setAtStart(scrollLeft <= EPS);
    setAtEnd(scrollLeft >= maxScrollLeft - EPS);
  };

  useEffect(() => {
    updateEdges();
    const el = containerRef.current;
    if (!el) return;

    const onScroll = () => updateEdges();
    el.addEventListener("scroll", onScroll, { passive: true });

    // Re-evaluate on resize since widths can change
    const onResize = () => updateEdges();
    window.addEventListener("resize", onResize);

    return () => {
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  const maskImage = useMemo(() => {
    const fade = 16; // px
    if (atStart && atEnd) {
      // No overflow: no fades
      return "linear-gradient(to right, black, black)";
    }
    if (atStart) {
      // Hide left fade when clamped at start
      return `linear-gradient(to right, black, black calc(100% - ${fade}px), transparent)`;
    }
    if (atEnd) {
      // Hide right fade when clamped at end
      return `linear-gradient(to right, transparent, black ${fade}px, black)`;
    }
    // Default: fades on both sides
    return `linear-gradient(to right, transparent, black ${fade}px, black calc(100% - ${fade}px), transparent)`;
  }, [atStart, atEnd]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "min-w-0 flex flex-nowrap gap-2.5 overflow-x-auto pb-1",
        className
      )}
      style={{ maskImage, WebkitMaskImage: maskImage }}
    >
      {children}
    </div>
  );
}
