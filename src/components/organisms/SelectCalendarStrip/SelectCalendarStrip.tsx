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
    onSelectCalendar?.(calendar);
  };

  const handleAdd = () => {
    onAddCalendar?.();
  };

  return (
    <div
      className={cn(
        "mx-auto w-full max-w-7xl shrink-0 px-3 py-1.5 lg:px-6 min-w-0 overflow-hidden",
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
