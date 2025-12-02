import * as React from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { cn } from "@/utils_constants_styles/utils";

const Popover = PopoverPrimitive.Root;

const PopoverTrigger = React.forwardRef<any, any>(
  ({ className, ...props }, ref) => (
    <PopoverPrimitive.Trigger
      ref={ref}
      className={cn("", className)}
      {...props}
    />
  ),
);
PopoverTrigger.displayName =
  PopoverPrimitive.Trigger.displayName || "PopoverTrigger";

const PopoverContent = React.forwardRef<any, any>(
  ({ className, sideOffset = 6, align = "center", ...props }, ref) => (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        ref={ref}
        sideOffset={sideOffset}
        align={align}
        className={cn(
          "z-50 w-auto rounded-md border bg-popover p-2 text-popover-foreground shadow-md",
          className,
        )}
        {...props}
      />
    </PopoverPrimitive.Portal>
  ),
);
PopoverContent.displayName =
  PopoverPrimitive.Content.displayName || "PopoverContent";

const PopoverClose = React.forwardRef<any, any>(
  ({ className, ...props }, ref) => (
    <PopoverPrimitive.Close
      ref={ref}
      className={cn("", className)}
      {...props}
    />
  ),
);
PopoverClose.displayName = PopoverPrimitive.Close.displayName || "PopoverClose";

export { Popover, PopoverTrigger, PopoverContent, PopoverClose };
