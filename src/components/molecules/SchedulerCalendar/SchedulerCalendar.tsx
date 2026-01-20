"use client";

import { useCallback } from "react";
import { Calendar } from "@/components/atoms/Calendar";

type Props = {
  selectedDates: string[];
  onChange: (dates: string[]) => void;
};

export function SchedulerCalendar({ selectedDates, onChange }: Props) {
  const toggleDate = useCallback(
    (date: Date) => {
      const iso = date.toISOString().slice(0, 10); // yyyy-mm-dd

      const exists = selectedDates.includes(iso);

      if (exists) {
        onChange(selectedDates.filter((d) => d !== iso));
      } else {
        onChange([...selectedDates, iso]);
      }
    },
    [selectedDates, onChange],
  );

  return (
    <Calendar
      mode="multiple"
      selected={selectedDates.map((d) => new Date(d))}
      onDayClick={toggleDate}
      classNames={{
        day_selected:
          "bg-green-500 dark:bg-green-400 text-white dark:text-slate-900 font-bold hover:bg-green-600 dark:hover:bg-green-300",
      }}
    />
  );
}
