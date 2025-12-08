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

// 年月選択コンポーネント（単一版）
export const DateSelector = ({
  label,
  value,
  onChange,
  placeholder = "期間を選択",
}: DateSelectorProps) => {
  const [open, setOpen] = useState(false);

  const now = new Date();
  const currentYear = now.getFullYear();

  // 過去100年〜未来100年
  const yearList = useMemo(
    () => Array.from({ length: 201 }, (_, i) => currentYear - 100 + i),
    [currentYear],
  );

  // 月リスト
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

  // 年スクロール用
  const yearScrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!yearScrollRef.current || !value) return;

    const target = yearScrollRef.current.querySelector(
      `[data-value="${value.getFullYear()}"]`,
    );

    if (target) {
      yearScrollRef.current.scrollTop = (target as HTMLElement).offsetTop - 100;
    }
  }, [value]);

  // Popover 開時に未選択なら現在年月をセット
  const handleOpen = (next: boolean) => {
    setOpen(next);
    if (next && !value) onChange?.(new Date());
  };

  // 年変更
  const handleYearChange = (yearStr: string) => {
    const newDate = new Date(value ?? now);
    newDate.setFullYear(parseInt(yearStr, 10));
    onChange?.(newDate);
  };

  // 月変更
  const handleMonthChange = (monthStr: string) => {
    const newDate = new Date(value ?? now);
    newDate.setMonth(parseInt(monthStr, 10));
    onChange?.(newDate);
  };

  const displayLabel = value
    ? `${value.getFullYear()}年 ${String(value.getMonth() + 1).padStart(2, "0")}月`
    : placeholder;

  return (
    <div className="flex flex-col gap-2 w-full">
      {label && <label className="text-sm font-medium">{label}</label>}

      <Popover open={open} onOpenChange={handleOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full flex items-center justify-between px-3"
          >
            <span className="flex-1 truncate text-left">{displayLabel}</span>
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
                onOpenChange={(o) => o && !value && onChange?.(new Date())}
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
                onOpenChange={(o) => o && !value && onChange?.(new Date())}
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
