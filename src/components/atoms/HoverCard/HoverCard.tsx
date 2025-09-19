import * as React from "react"
import {
  HoverCard as UIHoverCard,
  HoverCardTrigger as UIHoverCardTrigger,
  HoverCardContent as UIHoverCardContent,
} from "@/components/ui/HoverCard"

export const HoverCard = UIHoverCard
export const HoverCardTrigger = UIHoverCardTrigger

export const HoverCardContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof UIHoverCardContent>
>((props, ref) => <UIHoverCardContent ref={ref} {...props} />)
HoverCardContent.displayName = "AtomsHoverCardContent"

