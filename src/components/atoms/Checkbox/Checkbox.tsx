import * as React from "react";
import { Checkbox as UICheckbox } from "@/components/ui/Checkbox";

export type CheckboxProps = React.ComponentPropsWithoutRef<typeof UICheckbox>;

export const Checkbox = React.forwardRef<HTMLButtonElement, CheckboxProps>(
  (props, ref) => <UICheckbox ref={ref} {...props} />,
);
Checkbox.displayName = "AtomsCheckbox";
