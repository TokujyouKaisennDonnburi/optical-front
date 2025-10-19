"use client";

import {
  SelectCalendarAddCard,
  SelectCalendarCard,
  type SelectCalendarCardData,
} from "@/components/molecules/SelectCalendarCard";
import { SelectCalendarGrid } from "@/components/molecules/SelectCalendarGrid";
import { cn } from "@/utils_constants_styles/utils";

export type SelectCalendarStripItem = SelectCalendarCardData;

export type SelectCalendarStripProps = {
  calendars: SelectCalendarStripItem[];
  className?: string;
  onSelectCalendar?: (calendar: SelectCalendarStripItem) => void;
  onAddCalendar?: () => void;
};

export function SelectCalendarStrip({
  calendars,
  className,
  onSelectCalendar,
  onAddCalendar,
}: SelectCalendarStripProps) {
  const handleSelect = (calendar: SelectCalendarStripItem) => {
    // 仮の遷移動作: クリック時にログを出力
    console.log(
      `[navigate] 単体カレンダーページへ遷移: ${calendar.name} (${calendar.id})`,
    );
    onSelectCalendar?.(calendar);
  };

  const handleAdd = () => {
    // 仮の遷移動作: クリック時にログを出力
    console.log("[navigate] 単体スケジュール作成画面へ遷移");
    onAddCalendar?.();
  };

  return (
    <div
      className={cn(
        "mx-auto w-full max-w-7xl shrink-0 px-3 py-2 lg:px-6",
        className,
      )}
    >
      <SelectCalendarGrid>
        {calendars.map((cal) => (
          <SelectCalendarCard
            key={cal.id}
            calendar={cal}
            onClick={() => handleSelect(cal)}
          />
        ))}
        <SelectCalendarAddCard onClick={handleAdd} />
      </SelectCalendarGrid>
    </div>
  );
}
