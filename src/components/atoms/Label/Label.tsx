import type { ComponentProps } from "react";
import { Label as UILabel } from "@/components/ui/Label";

export type LabelProps = ComponentProps<typeof UILabel>;

export function Label(props: LabelProps) {
  return <UILabel {...props} />;
}
Label.displayName = "AtomsLabel";
