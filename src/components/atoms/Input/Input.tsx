import * as React from "react";
import {
  Input as UIInput,
  type InputProps as UIInputProps,
} from "@/components/ui/Input";

export type InputProps = UIInputProps;

// Project-facing Input atom with explicit defaults
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ type = "text", ...props }, ref) => {
    return <UIInput ref={ref} type={type} {...props} />;
  },
);
Input.displayName = "AtomsInput";
