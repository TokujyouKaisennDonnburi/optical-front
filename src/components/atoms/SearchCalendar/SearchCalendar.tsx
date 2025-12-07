import { Calendar } from "@/components/ui/Calendar";

export interface DateSelectorProps {
  label?: string;
  value?: Date;
  onChange?: (date: Date | undefined) => void;
}

export const SearchCalendar = ({
  label,
  value,
  onChange,
}: DateSelectorProps) => {
  const currentYear = new Date().getFullYear();

  return (
    <div className="flex flex-col gap-2 w-full">
      {label && <label className="text-sm font-medium">{label}</label>}

      <div className="rounded-lg border shadow-sm p-2 w-fit">
        <Calendar
          mode="single"
          selected={value}
          onSelect={onChange}
          defaultMonth={value}
          captionLayout="dropdown"
          fromYear={currentYear - 100}
          toYear={currentYear + 100}
          onMonthChange={(month) => {
            // DayPicker の onMonthChange は「選択月の Date」を渡します
            onChange?.(month);
          }}
          className="w-fit"
          classNames={{
            nav: "hidden",
            caption: "...",
            table: "hidden",
            weekdays: "hidden",
            month_grid: "hidden",
            day: "hidden",
            dropdowns:
              "flex gap-2 [&>*:first-child]:order-2 [&>*:last-child]:order-1", // 年→月の順にする
          }}
        />
      </div>
    </div>
  );
};

SearchCalendar.displayName = "AtomsSearchCalendar";
