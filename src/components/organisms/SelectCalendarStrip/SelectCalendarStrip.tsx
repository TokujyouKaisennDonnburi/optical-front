"use client";

import {
  LinkableSelectCalendarCard,
  SelectCalendarAddCard,
  type SelectCalendarCardData,
} from "@/components/molecules/SelectCalendarCard";
import { SelectCalendarGrid } from "@/components/molecules/SelectCalendarGrid";
import { cn } from "@/utils_constants_styles/utils";

export type SelectCalendarStripItem = SelectCalendarCardData;

export type SelectCalendarStripProps = {
  calendars: SelectCalendarStripItem[];
  className?: string;
  /** @deprecated Use next/link's automatic navigation instead */
  onSelectCalendar?: (calendar: SelectCalendarStripItem) => void;
  onAddCalendar?: () => void;
};

export function SelectCalendarStrip({
  calendars,
  className,
  onAddCalendar,
}: SelectCalendarStripProps) {
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
          <LinkableSelectCalendarCard
            key={cal.id}
            calendar={cal}
            href={`/calendars/${cal.id}`}
          />
        ))}
        <SelectCalendarAddCard onClick={handleAdd} />
      </SelectCalendarGrid>
    </div>
  );
}
