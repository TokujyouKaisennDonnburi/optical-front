import * as React from "react";
import {
  HoverCard as UIHoverCard,
  HoverCardContent as UIHoverCardContent,
  HoverCardTrigger as UIHoverCardTrigger,
} from "@/components/ui/HoverCard";

export const HoverCard = UIHoverCard;
export const HoverCardTrigger = UIHoverCardTrigger;

export const HoverCardContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof UIHoverCardContent>
>((props, ref) => <UIHoverCardContent ref={ref} {...props} />);
HoverCardContent.displayName = "AtomsHoverCardContent";
