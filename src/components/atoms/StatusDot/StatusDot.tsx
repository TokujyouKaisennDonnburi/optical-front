import type { CSSProperties } from "react";

import { cn } from "@/utils_constants_styles/utils";

const variantStyles = {
  default: "bg-muted-foreground/60",
  success: "bg-emerald-500",
  warning: "bg-amber-500",
  danger: "bg-destructive",
  info: "bg-sky-500",
} satisfies Record<string, string>;

export type StatusDotVariant = keyof typeof variantStyles;

export type StatusDotProps = {
  variant?: StatusDotVariant;
  label?: string;
  className?: string;
  style?: CSSProperties;
};

export function StatusDot({
  variant = "default",
  label,
  className,
  style,
}: StatusDotProps) {
  return (
    <span
      className={cn(
        "inline-flex h-2.5 w-2.5 items-center justify-center rounded-full",
        variantStyles[variant],
        className,
      )}
      style={style}
      aria-hidden={label ? undefined : true}
      role={label ? "status" : undefined}
    >
      {label ? <span className="sr-only">{label}</span> : null}
    </span>
  );
}
