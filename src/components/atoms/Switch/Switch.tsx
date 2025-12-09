import * as React from "react";
import { Switch as UISwitch } from "@/components/ui/Switch";

export type SwitchProps = React.ComponentPropsWithoutRef<typeof UISwitch>;

export const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
  (props, ref) => <UISwitch ref={ref} {...props} />,
);
Switch.displayName = "AtomsSwitch";
