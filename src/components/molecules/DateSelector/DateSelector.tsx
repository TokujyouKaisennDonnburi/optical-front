import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/atoms/Button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/atoms/Popover";
import { SearchCalendar } from "@/components/atoms/SearchCalendar";

export interface DateSelectorProps {
  label?: string;
  value?: Date;
  onChange?: (date: Date | undefined) => void;
  placeholder?: string;
}

export const DateSelector = ({
  label,
  value,
  onChange,
  placeholder = "年月の指定",
}: DateSelectorProps) => {
  const [open, setOpen] = useState(false);

  // 表示用フォーマット
  const displayLabel = value
    ? `${value.getFullYear()}年 ${(value.getMonth() + 1)
        .toString()
        .padStart(2, "0")}月`
    : placeholder;

  // 日付選択時の処理
  const handleSelect = (date: Date | undefined) => {
    onChange?.(date);
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      {label && <label className="text-sm font-medium">{label}</label>}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full flex items-center justify-between px-3"
          >
            <span className="flex-1 truncate text-left">{displayLabel}</span>

            <ChevronDown
              className={`ml-2 h-4 w-4 transition-transform ${
                open ? "rotate-180" : ""
              }`}
            />
          </Button>
        </PopoverTrigger>

        <PopoverContent className="p-0">
          <SearchCalendar value={value} onChange={handleSelect} />
        </PopoverContent>
      </Popover>
    </div>
  );
};

DateSelector.displayName = "MoleculesDateSelector";
