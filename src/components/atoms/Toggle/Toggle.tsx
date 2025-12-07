import * as React from "react";
import {
  Toggle as UIToggle,
  type toggleVariants,
} from "@/components/ui/Toggle";
import type { VariantProps } from "class-variance-authority";

export type ToggleProps = React.ComponentPropsWithoutRef<typeof UIToggle> &
  VariantProps<typeof toggleVariants>;

export const Toggle = React.forwardRef<HTMLButtonElement, ToggleProps>(
  (props, ref) => <UIToggle ref={ref} {...props} />,
);
Toggle.displayName = "AtomsToggle";
