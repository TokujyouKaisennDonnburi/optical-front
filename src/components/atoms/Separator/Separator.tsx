import * as React from "react";
import { Separator as UISeparator } from "@/components/ui/Separator";

export type SeparatorProps = React.ComponentPropsWithoutRef<typeof UISeparator>;

export const Separator = React.forwardRef<
  React.ElementRef<typeof UISeparator>,
  SeparatorProps
>((props, ref) => <UISeparator ref={ref} {...props} />);
Separator.displayName = "AtomsSeparator";
