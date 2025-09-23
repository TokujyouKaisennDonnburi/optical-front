import * as React from "react";
import {
  ScrollArea as UIScrollArea,
  ScrollBar as UIScrollBar,
} from "@/components/ui/ScrollArea";

export const ScrollArea = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof UIScrollArea>
>((props, ref) => <UIScrollArea ref={ref} {...props} />);
ScrollArea.displayName = "AtomsScrollArea";

export const ScrollBar = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof UIScrollBar>
>((props, ref) => <UIScrollBar ref={ref} {...props} />);
ScrollBar.displayName = "AtomsScrollBar";
