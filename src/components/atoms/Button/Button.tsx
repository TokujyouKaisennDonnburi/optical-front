import * as React from "react";
import {
  Button as UIButton,
  type ButtonProps as UIButtonProps,
} from "@/components/ui/Button";

export type ButtonProps = UIButtonProps;

// Project-facing Button atom with safer defaults
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ type = "button", ...props }, ref) => {
    return <UIButton ref={ref} type={type} {...props} />;
  },
);
Button.displayName = "AtomsButton";
