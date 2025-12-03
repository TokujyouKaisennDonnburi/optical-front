import type { DatePickerProps as UIDatePickerProps } from "@/components/ui/DatePicker";
import { DatePicker as UIDatePicker } from "@/components/ui/DatePicker";

export interface DatePickerProps extends UIDatePickerProps {}

export const DatePicker = (props: DatePickerProps) => {
  return <UIDatePicker {...props} />;
};
DatePicker.displayName = "AtomsDatePicker";
