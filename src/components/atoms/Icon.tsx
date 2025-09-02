import * as React from "react"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

export type IconSize = "sm" | "md" | "lg" | number

export type IconProps = {
  icon: LucideIcon
  size?: IconSize
  className?: string
} & React.SVGProps<SVGSVGElement>

export function Icon({ icon: IconComp, size = "md", className, ...props }: IconProps) {
  const px = typeof size === "number" ? size : size === "sm" ? 16 : size === "lg" ? 28 : 20
  return <IconComp className={cn("shrink-0", className)} width={px} height={px} {...props} />
}

