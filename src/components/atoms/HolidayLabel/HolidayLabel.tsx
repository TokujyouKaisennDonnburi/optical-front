import { cn } from "@/utils_constants_styles/utils";

type HolidayLabelProps = {
  name: string;
  className?: string;
};

export function HolidayLabel({ name, className }: HolidayLabelProps) {
  return (
    <span
      className={cn(
        "hidden text-[0.625rem] text-green-400 sm:inline-block",
        className,
      )}
    >
      {name}
    </span>
  );
}
