import type { HTMLAttributes, JSX, ReactNode } from "react";
import { cn } from "@/utils_constants_styles/utils";

type TextElement = keyof Pick<
  JSX.IntrinsicElements,
  "span" | "p" | "div" | "label" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6"
>;

export type TextProps = {
  as?: TextElement;
  size?: "sm" | "md" | "lg";
  weight?: "normal" | "medium" | "semibold" | "bold";
  className?: string;
  children?: ReactNode;
} & Omit<HTMLAttributes<HTMLElement>, "children"> & {
    htmlFor?: string;
  };

export function Text({
  as = "span",
  size = "md",
  weight = "normal",
  className,
  children,
  ...props
}: TextProps) {
  const Component = as;
  const sizeCls =
    size === "sm" ? "text-sm" : size === "lg" ? "text-lg" : "text-base";
  const weightCls =
    weight === "medium"
      ? "font-medium"
      : weight === "semibold"
        ? "font-semibold"
        : weight === "bold"
          ? "font-bold"
          : "font-normal";

  return (
    <Component className={cn(sizeCls, weightCls, className)} {...props}>
      {children}
    </Component>
  );
}
