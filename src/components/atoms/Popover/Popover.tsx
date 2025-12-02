import * as React from "react";
import {
  Popover as UIPopover,
  PopoverTrigger as UIPopoverTrigger,
  PopoverContent as UIPopoverContent,
  PopoverClose as UIPopoverClose,
} from "@/components/ui/Popover";

export const Popover = UIPopover;
export const PopoverTrigger = UIPopoverTrigger;

export const PopoverContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof UIPopoverContent>
>((props, ref) => <UIPopoverContent ref={ref} {...props} />);
PopoverContent.displayName = "AtomsPopoverContent";

export const PopoverClose = React.forwardRef<
  HTMLButtonElement,
  React.ComponentPropsWithoutRef<typeof UIPopoverClose>
>((props, ref) => <UIPopoverClose ref={ref} {...props} />);
PopoverClose.displayName = "AtomsPopoverClose";
