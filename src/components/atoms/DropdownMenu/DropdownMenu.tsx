import * as React from "react";
import {
  DropdownMenu as UIDropdownMenu,
  DropdownMenuTrigger as UIDropdownMenuTrigger,
  DropdownMenuContent as UIDropdownMenuContent,
  DropdownMenuItem as UIDropdownMenuItem,
  DropdownMenuCheckboxItem as UIDropdownMenuCheckboxItem,
  DropdownMenuRadioItem as UIDropdownMenuRadioItem,
  DropdownMenuLabel as UIDropdownMenuLabel,
  DropdownMenuSeparator as UIDropdownMenuSeparator,
  DropdownMenuShortcut as UIDropdownMenuShortcut,
  DropdownMenuGroup as UIDropdownMenuGroup,
  DropdownMenuPortal as UIDropdownMenuPortal,
  DropdownMenuSub as UIDropdownMenuSub,
  DropdownMenuSubContent as UIDropdownMenuSubContent,
  DropdownMenuSubTrigger as UIDropdownMenuSubTrigger,
  DropdownMenuRadioGroup as UIDropdownMenuRadioGroup,
  DropdownMenuArrow as UIDropdownMenuArrow,
} from "@/components/ui/DropdownMenu";

export const DropdownMenu = UIDropdownMenu;
export const DropdownMenuTrigger = UIDropdownMenuTrigger;
export const DropdownMenuGroup = UIDropdownMenuGroup;
export const DropdownMenuPortal = UIDropdownMenuPortal;
export const DropdownMenuSub = UIDropdownMenuSub;
export const DropdownMenuRadioGroup = UIDropdownMenuRadioGroup;
export const DropdownMenuShortcut = UIDropdownMenuShortcut;
export const DropdownMenuArrow = UIDropdownMenuArrow;

export const DropdownMenuContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof UIDropdownMenuContent>
>((props, ref) => <UIDropdownMenuContent ref={ref} {...props} />);
DropdownMenuContent.displayName = "AtomsDropdownMenuContent";

export const DropdownMenuSubContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof UIDropdownMenuSubContent>
>((props, ref) => <UIDropdownMenuSubContent ref={ref} {...props} />);
DropdownMenuSubContent.displayName = "AtomsDropdownMenuSubContent";

export const DropdownMenuSubTrigger = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof UIDropdownMenuSubTrigger>
>((props, ref) => <UIDropdownMenuSubTrigger ref={ref} {...props} />);
DropdownMenuSubTrigger.displayName = "AtomsDropdownMenuSubTrigger";

export const DropdownMenuItem = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof UIDropdownMenuItem>
>((props, ref) => <UIDropdownMenuItem ref={ref} {...props} />);
DropdownMenuItem.displayName = "AtomsDropdownMenuItem";

export const DropdownMenuCheckboxItem = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof UIDropdownMenuCheckboxItem>
>((props, ref) => <UIDropdownMenuCheckboxItem ref={ref} {...props} />);
DropdownMenuCheckboxItem.displayName = "AtomsDropdownMenuCheckboxItem";

export const DropdownMenuRadioItem = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof UIDropdownMenuRadioItem>
>((props, ref) => <UIDropdownMenuRadioItem ref={ref} {...props} />);
DropdownMenuRadioItem.displayName = "AtomsDropdownMenuRadioItem";

export const DropdownMenuLabel = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof UIDropdownMenuLabel>
>((props, ref) => <UIDropdownMenuLabel ref={ref} {...props} />);
DropdownMenuLabel.displayName = "AtomsDropdownMenuLabel";

export const DropdownMenuSeparator = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof UIDropdownMenuSeparator>
>((props, ref) => <UIDropdownMenuSeparator ref={ref} {...props} />);
DropdownMenuSeparator.displayName = "AtomsDropdownMenuSeparator";
