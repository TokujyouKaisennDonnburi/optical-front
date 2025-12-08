import { ChevronDown } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/atoms/Button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/atoms/Popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/atoms/Select";

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

  const now = new Date();
  const currentYear = now.getFullYear();

  const yearList = useMemo(
    () => Array.from({ length: 201 }, (_, i) => currentYear - 100 + i),
    [currentYear],
  );

  const monthList = [
    { label: "1月", value: 0 },
    { label: "2月", value: 1 },
    { label: "3月", value: 2 },
    { label: "4月", value: 3 },
    { label: "5月", value: 4 },
    { label: "6月", value: 5 },
    { label: "7月", value: 6 },
    { label: "8月", value: 7 },
    { label: "9月", value: 8 },
    { label: "10月", value: 9 },
    { label: "11月", value: 10 },
    { label: "12月", value: 11 },
  ];

  const yearScrollRef = useRef<HTMLDivElement | null>(null);

  // 年スクロール位置の調整
  useEffect(() => {
    if (!yearScrollRef.current || !value) return;
    const target = yearScrollRef.current.querySelector(
      `[data-value="${value.getFullYear()}"]`,
    );
    if (target) {
      yearScrollRef.current.scrollTop = (target as HTMLElement).offsetTop - 100;
    }
  }, [value]);

  const handleOpen = (next: boolean) => {
    setOpen(next);
    if (next && !value) {
      onChange?.(new Date());
    }
  };

  const handleYearChange = (yearStr: string) => {
    const newDate = value ? new Date(value) : new Date();
    newDate.setFullYear(parseInt(yearStr, 10));
    onChange?.(newDate);
  };

  const handleMonthChange = (monthStr: string) => {
    const newDate = value ? new Date(value) : new Date();
    newDate.setMonth(parseInt(monthStr, 10));
    onChange?.(newDate);
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      {label && <label className="text-sm font-medium">{label}</label>}

      <Popover open={open} onOpenChange={handleOpen}>
        <PopoverTrigger asChild>
          {/* 常に placeholder を表示 */}
          <Button
            variant="outline"
            className="w-full flex items-center justify-between px-3"
          >
            <span className="flex-1 truncate text-left">{placeholder}</span>
            <ChevronDown
              className={`ml-2 h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`}
            />
          </Button>
        </PopoverTrigger>

        <PopoverContent className="p-4">
          <div className="flex gap-4">
            {/* 年選択 */}
            <div className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground">年</span>
              <Select
                onValueChange={handleYearChange}
                value={value ? String(value.getFullYear()) : undefined}
              >
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="年を選択" />
                </SelectTrigger>
                <SelectContent
                  ref={yearScrollRef}
                  className="max-h-60 overflow-y-auto"
                >
                  {yearList.map((year) => (
                    <SelectItem
                      key={year}
                      value={String(year)}
                      data-value={String(year)}
                    >
                      {year}年
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 月選択 */}
            <div className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground">月</span>
              <Select
                onValueChange={handleMonthChange}
                value={value ? String(value.getMonth()) : undefined}
              >
                <SelectTrigger className="w-24">
                  <SelectValue placeholder="月を選択" />
                </SelectTrigger>
                <SelectContent>
                  {monthList.map((m) => (
                    <SelectItem key={m.value} value={String(m.value)}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

DateSelector.displayName = "DateSelector";
export default DateSelector;
