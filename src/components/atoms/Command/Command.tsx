import * as React from "react";
import {
  Command as UICommand,
  CommandEmpty as UICommandEmpty,
  CommandGroup as UICommandGroup,
  CommandInput as UICommandInput,
  CommandItem as UICommandItem,
  CommandList as UICommandList,
} from "@/components/ui/command";

export const Command = UICommand;

export const CommandInput = React.forwardRef<
  HTMLInputElement,
  React.ComponentPropsWithoutRef<typeof UICommandInput>
>((props, ref) => <UICommandInput ref={ref} {...props} />);
CommandInput.displayName = "AtomsCommandInput";

export const CommandList = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof UICommandList>
>((props, ref) => <UICommandList ref={ref} {...props} />);
CommandList.displayName = "AtomsCommandList";

export const CommandEmpty = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof UICommandEmpty>
>((props, ref) => <UICommandEmpty ref={ref} {...props} />);
CommandEmpty.displayName = "AtomsCommandEmpty";

export const CommandGroup = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof UICommandGroup>
>((props, ref) => <UICommandGroup ref={ref} {...props} />);
CommandGroup.displayName = "AtomsCommandGroup";

export const CommandItem = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof UICommandItem>
>((props, ref) => <UICommandItem ref={ref} {...props} />);
CommandItem.displayName = "AtomsCommandItem";
