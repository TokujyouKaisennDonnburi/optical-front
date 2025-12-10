import { Calendar as CalendarIcon } from "lucide-react";
import * as React from "react";
import { Calendar } from "@/components/ui/Calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/Popover";
import { cn } from "@/utils_constants_styles/utils";

export interface DatePickerProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  value?: Date | undefined;
  onChange?: (date: Date | undefined) => void;
  placeholder?: string;
}

const DatePicker = React.forwardRef<HTMLDivElement, DatePickerProps>(
  (
    { className, value, onChange, placeholder = "Pick a date", ...props },
    ref,
  ) => {
    const [selected, setSelected] = React.useState<Date | undefined>(value);

    React.useEffect(() => {
      setSelected(value);
    }, [value]);

    const handleSelect = (date: Date | undefined) => {
      setSelected(date);
      onChange?.(date);
    };

    // 日付のフォーマット処理
    const formatDate = (date: Date) => {
      const formatter = new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      return formatter.format(date);
    };

    return (
      <div ref={ref} className={cn("grid gap-2", className)} {...props}>
        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              className={cn(
                "flex h-10 w-full items-center justify-between rounded-md border px-3 py-2 text-left text-sm shadow-sm",
                !selected && "text-muted-foreground",
              )}
            >
              {selected ? formatDate(selected) : <span>{placeholder}</span>}
              <CalendarIcon className="h-4 w-4 opacity-50" />
            </button>
          </PopoverTrigger>

          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={selected}
              onSelect={handleSelect}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>
    );
  },
);

DatePicker.displayName = "DatePicker";

export { DatePicker };
