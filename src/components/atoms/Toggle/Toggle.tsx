import type { VariantProps } from "class-variance-authority";
import * as React from "react";
import {
  type toggleVariants,
  Toggle as UIToggle,
} from "@/components/ui/Toggle";

export type ToggleProps = React.ComponentPropsWithoutRef<typeof UIToggle> &
  VariantProps<typeof toggleVariants>;

export const Toggle = React.forwardRef<HTMLButtonElement, ToggleProps>(
  (props, ref) => <UIToggle ref={ref} {...props} />,
);
Toggle.displayName = "AtomsToggle";
